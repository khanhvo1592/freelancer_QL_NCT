const { app, BrowserWindow, dialog, ipcMain, Menu } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';
const fs = require('fs');
const { spawn, exec } = require('child_process');
const http = require('http');

let mainWindow;
let backendProcess;
let isBackendReady = false;
let mainMenu = null;





function log(message) {
    console.log(`[Electron] ${message}`);
}

function stopBackend() {
    return new Promise((resolve) => {
        if (!backendProcess || !backendProcess.connected) {
            console.warn('stopBackend: Backend process not running or IPC not connected.');
            if (backendProcess && backendProcess.killed === false) {
                 console.log(`stopBackend: Attempting to force-kill PID ${backendProcess.pid}`);
                 exec(`taskkill /PID ${backendProcess.pid} /T /F`);
            }
            backendProcess = null;
            return resolve();
        }

        console.log('stopBackend: Sending "shutdown" message to backend via IPC...');
        
        backendProcess.once('close', (code, signal) => {
            console.log(`stopBackend: Backend process has closed. Code: ${code}, Signal: ${signal}`);
            clearTimeout(fallbackTimeout);
            backendProcess = null;
            resolve();
        });

        backendProcess.send('shutdown');

        const fallbackTimeout = setTimeout(() => {
            console.error('stopBackend: Backend did not respond to IPC shutdown. Force killing.');
            if (backendProcess) {
                exec(`taskkill /PID ${backendProcess.pid} /T /F`);
            }
        }, 5000);
    });
}

function startBackend() {
    if (backendProcess && !backendProcess.killed) {
        console.log('Backend process is already managed.');
        return;
    }

    let scriptPath;
    let cwd;

    if (isDev) {
        console.log('DEV MODE: Spawning backend process...');
        cwd = path.join(__dirname, '..', 'backend');
        scriptPath = path.join(cwd, 'server.js');
    } else { // Production
        console.log('PROD MODE: Spawning backend process...');
        cwd = path.join(process.resourcesPath, 'app', 'backend');
        scriptPath = path.join(cwd, 'server.js');
    }

    if (!fs.existsSync(scriptPath)) {
        console.error('Backend server script not found at:', scriptPath);
        dialog.showErrorBox('Lỗi nghiêm trọng', `Không tìm thấy file server: ${scriptPath}`);
        return;
    }

    console.log(`Spawning backend: node ${scriptPath}`);
    backendProcess = spawn('node', [scriptPath], {
        cwd: cwd,
        stdio: ['ignore', 'pipe', 'pipe', 'ipc']
    });

    // --- Health Check Polling ---
    let readinessAttempts = 0;
    const maxReadinessAttempts = 30; // 30 attempts * 500ms = 15 seconds
    const readinessInterval = setInterval(() => {
        readinessAttempts++;
        if (readinessAttempts > maxReadinessAttempts) {
            clearInterval(readinessInterval);
            console.error('Backend readiness check timed out.');
            dialog.showErrorBox('Lỗi Backend', 'Không thể kết nối tới backend sau 15 giây. Vui lòng kiểm tra log để xem backend có khởi động thành công không.');
            return;
        }

        console.log(`[Health Check] Attempt #${readinessAttempts}...`);
        const req = http.get('http://localhost:5000/api/health', (res) => {
            if (res.statusCode === 200) {
                clearInterval(readinessInterval);
                console.log('HEALTH CHECK SUCCESS: Backend is ready.');
                setBackendReady(true);
            }
        });
        
        req.on('error', (err) => {
            console.warn(`[Health Check] Poll failed: ${err.message}`);
        });
        req.end();

    }, 500);
}

function pollBackendHealth() {
    let readinessAttempts = 0;
    const maxReadinessAttempts = 30; // 30 attempts * 500ms = 15 seconds
    const readinessInterval = setInterval(() => {
        readinessAttempts++;
        if (readinessAttempts > maxReadinessAttempts) {
            clearInterval(readinessInterval);
            console.error('Backend readiness check timed out.');
            dialog.showErrorBox('Lỗi Backend', 'Không thể kết nối tới backend sau 15 giây. Vui lòng kiểm tra log để xem backend có khởi động thành công không.');
            return;
        }

        console.log(`[Health Check] Attempt #${readinessAttempts}...`);
        const req = http.get('http://localhost:5000/api/health', (res) => {
            if (res.statusCode === 200) {
                clearInterval(readinessInterval);
                console.log('HEALTH CHECK SUCCESS: Backend is ready.');
                setBackendReady(true);
            }
        });
        
        req.on('error', (err) => {
            console.warn(`[Health Check] Poll failed: ${err.message}`);
        });
        req.end();

    }, 500);
}

async function createWindow() {

    console.log('Creating main window...');
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
            webSecurity: false,
            allowRunningInsecureContent: true
        },
        icon: path.join(process.resourcesPath, 'app', 'frontend', 'app.ico'),
        title: 'Phần mềm quản lý hội viên hội người cao tuổi'
    });
    console.log('Main window created successfully');

    // Load ứng dụng
    if (isDev) {
        console.log('Running in development mode, attempting to connect to React dev server...');
        try {
            await mainWindow.loadURL('http://localhost:3000');
            console.log('Successfully loaded React dev server');
            console.log('Opening DevTools...');
            mainWindow.webContents.openDevTools();
        } catch (err) {
            console.error('Failed to load React dev server:', err);
            console.error('Error details:', err.stack);
            dialog.showErrorBox('Development Error', 
                'Failed to connect to React development server. ' +
                'Please ensure it is running by executing "cd frontend && npm start"\n\n' +
                'Error details: ' + err.message);
            app.quit();
        }
    } else {
        // Load from built files
        const indexPath = path.join(process.resourcesPath, 'app', 'frontend', 'index.html');
        console.log('Loading frontend from:', indexPath);
        
        if (!fs.existsSync(indexPath)) {
            console.error('Frontend index.html not found at:', indexPath);
            dialog.showErrorBox('Error', `Cannot find frontend files at ${indexPath}`);
            app.quit();
            return;
        }

        try {
            // Load file with protocol
            await mainWindow.loadURL(`file://${indexPath}`);
            console.log('Successfully loaded index.html');
        } catch (error) {
            console.error('Failed to load index.html:', error);
            dialog.showErrorBox('Error', `Failed to load frontend: ${error.message}`);
            app.quit();
        }
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.on('ready', () => {
    // Tạo menu tùy chỉnh
    createMenu();
    
    startBackend(); // Starts backend only in production
    pollBackendHealth(); // Always polls for backend readiness
    
    createWindow();
});

// Hàm kill tất cả process Node.js
function killAllNodeProcesses() {
    try {
        // Kill backend process nếu có
        if (backendProcess) {
            console.log('Killing backend process...');
            backendProcess.kill('SIGTERM');
            
            // Đợi một chút rồi force kill nếu cần
            setTimeout(() => {
                if (backendProcess && !backendProcess.killed) {
                    console.log('Force killing backend process...');
                    backendProcess.kill('SIGKILL');
                }
            }, 2000);
        }
        
        // Kill tất cả process Node.js liên quan đến ứng dụng
        if (process.platform === 'win32') {
            // Windows: Kill tất cả process node.exe
            exec('taskkill /f /im node.exe', (error, stdout, stderr) => {
                if (error) {
                    console.log('No Node.js processes to kill or error:', error.message);
                } else {
                    console.log('Killed all Node.js processes:', stdout);
                }
            });
            
            // Kill process npm nếu có
            exec('taskkill /f /im npm.cmd', (error, stdout, stderr) => {
                if (error) {
                    console.log('No npm processes to kill or error:', error.message);
                } else {
                    console.log('Killed npm processes:', stdout);
                }
            });
        } else {
            // Linux/Mac: Kill process Node.js
            exec('pkill -f node', (error, stdout, stderr) => {
                if (error) {
                    console.log('No Node.js processes to kill or error:', error.message);
                } else {
                    console.log('Killed Node.js processes:', stdout);
                }
            });
        }
        
        console.log('Cleanup completed');
    } catch (error) {
        console.error('Error during cleanup:', error);
    }
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        console.log('Closing application...');
        killAllNodeProcesses();
        
        // Đợi một chút để đảm bảo cleanup hoàn tất
        setTimeout(() => {
            app.quit();
        }, 1000);
    }
});

// Thêm xử lý khi app quit
app.on('before-quit', (event) => {
    console.log('Application quitting...');
    killAllNodeProcesses();
});

// Thêm xử lý khi process bị terminate
process.on('SIGTERM', () => {
    console.log('Received SIGTERM signal');
    killAllNodeProcesses();
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('Received SIGINT signal');
    killAllNodeProcesses();
    process.exit(0);
});

// Thêm xử lý khi process bị crash
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    killAllNodeProcesses();
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    killAllNodeProcesses();
    process.exit(1);
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

// Thêm xử lý sự kiện in
ipcMain.handle('print-elderly-info', async (event, elderlyData) => {
    console.log('Nhận lệnh in từ frontend');
    
    // Sử dụng cửa sổ hiện tại để in trực tiếp
    try {
        const sender = event.sender;
        const win = BrowserWindow.fromWebContents(sender);
        
        console.log('In trực tiếp không qua cửa sổ mới');
        
        // Mở hộp thoại in trực tiếp từ cửa sổ hiện tại
        win.webContents.print(
            {
                silent: false,
                printBackground: true,
                color: true,
                margin: {
                    marginType: 'printableArea'
                },
                landscape: false,
                pageSize: 'A4',
                collate: false
            },
            (success, reason) => {
                console.log('Print result:', success ? 'success' : `failed: ${reason}`);
            }
        );
        
        return true;
    } catch (error) {
        console.error('Print error:', error);
        dialog.showErrorBox('Lỗi in ấn', `Đã xảy ra lỗi khi in: ${error.message}`);
        return false;
    }
});

// Xử lý sự kiện print-ready
ipcMain.handle('print-ready', async (event) => {
    console.log('Trang in đã sẵn sàng');
    return true;
});

// Hàm backup tất cả dữ liệu
async function backupAllData() {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupDir = path.join(__dirname, '../backups');
        const backupPath = path.join(backupDir, `full-backup-${timestamp}`);
        
        // Tạo thư mục backup
        if (!fs.existsSync(backupPath)) {
            fs.mkdirSync(backupPath, { recursive: true });
        }
        
        // Backup database
        const dbPath = path.join(__dirname, '../backend/db/elderly.db');
        const dbBackupPath = path.join(backupPath, 'database');
        
        if (!fs.existsSync(dbBackupPath)) {
            fs.mkdirSync(dbBackupPath, { recursive: true });
        }
        
        if (fs.existsSync(dbPath)) {
            const dbBackupFile = path.join(dbBackupPath, 'elderly.db');
            fs.copyFileSync(dbPath, dbBackupFile);
            
            // Export data as JSON
            const sqlite3 = require('sqlite3').verbose();
            const db = new sqlite3.Database(dbPath);
            const jsonFile = path.join(dbBackupPath, 'elderly-data.json');
            
            return new Promise((resolve, reject) => {
                db.all("SELECT * FROM elderly", [], (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        const data = {
                            backupDate: new Date().toISOString(),
                            totalRecords: rows.length,
                            data: rows
                        };
                        fs.writeFileSync(jsonFile, JSON.stringify(data, null, 2));
                        db.close();
                        resolve(rows.length);
                    }
                });
            }).then(recordCount => {
                // Backup images
                const uploadsPath = path.join(__dirname, '../backend/uploads');
                const imagesBackupPath = path.join(backupPath, 'images');
                
                if (fs.existsSync(uploadsPath)) {
                    if (!fs.existsSync(imagesBackupPath)) {
                        fs.mkdirSync(imagesBackupPath, { recursive: true });
                    }
                    
                    const files = fs.readdirSync(uploadsPath);
                    let copiedCount = 0;
                    let totalSize = 0;
                    
                    files.forEach(file => {
                        const sourceFile = path.join(uploadsPath, file);
                        const destFile = path.join(imagesBackupPath, file);
                        
                        if (fs.statSync(sourceFile).isFile()) {
                            fs.copyFileSync(sourceFile, destFile);
                            copiedCount++;
                            totalSize += fs.statSync(sourceFile).size;
                        }
                    });
                    
                    // Tạo file manifest
                    const manifest = {
                        backupType: 'full',
                        backupDate: new Date().toISOString(),
                        database: {
                            exists: true,
                            records: recordCount
                        },
                        images: {
                            exists: true,
                            count: copiedCount
                        },
                        backupLocation: backupPath,
                        files: [
                            'database/elderly.db',
                            'database/elderly-data.json',
                            'images/*'
                        ]
                    };
                    
                    const manifestPath = path.join(backupPath, 'backup-manifest.json');
                    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
                    
                    return { recordCount, copiedCount, totalSize, backupPath };
                }
                
                return { recordCount, copiedCount: 0, totalSize: 0, backupPath };
            });
        } else {
            throw new Error('Database file not found');
        }
    } catch (error) {
        throw error;
    }
}

// Hàm restore dữ liệu
async function restoreData(backupPath) {
    try {
        const backupDir = path.join(__dirname, '../backups');
        
        // Nếu không chỉ định backup path, tìm backup mới nhất
        if (!backupPath) {
            if (!fs.existsSync(backupDir)) {
                throw new Error('No backups found');
            }
            
            const backups = fs.readdirSync(backupDir)
                .filter(dir => dir.startsWith('full-backup-'))
                .sort()
                .reverse();
            
            if (backups.length === 0) {
                throw new Error('No full backups found');
            }
            
            backupPath = path.join(backupDir, backups[0]);
        }
        
        if (!fs.existsSync(backupPath)) {
            throw new Error('Backup directory not found');
        }
        
        // Restore database
        const dbPath = path.join(__dirname, '../backend/db/elderly.db');
        const dbBackupFile = path.join(backupPath, 'database/elderly.db');
        
        if (fs.existsSync(dbBackupFile)) {
            // Tạo backup của database hiện tại
            if (fs.existsSync(dbPath)) {
                const currentBackupPath = path.join(__dirname, '../backend/db/elderly-pre-restore.db');
                fs.copyFileSync(dbPath, currentBackupPath);
            }
            
            // Restore database
            fs.copyFileSync(dbBackupFile, dbPath);
            
            // Verify database
            const sqlite3 = require('sqlite3').verbose();
            const db = new sqlite3.Database(dbPath);
            
            return new Promise((resolve, reject) => {
                db.get("SELECT COUNT(*) as count FROM elderly", [], (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        db.close();
                        resolve(row.count);
                    }
                });
            }).then(recordCount => {
                // Restore images
                const uploadsPath = path.join(__dirname, '../backend/uploads');
                const imagesBackupPath = path.join(backupPath, 'images');
                
                if (fs.existsSync(imagesBackupPath)) {
                    // Tạo backup của images hiện tại
                    if (fs.existsSync(uploadsPath) && fs.readdirSync(uploadsPath).length > 0) {
                        const currentBackupPath = path.join(__dirname, '../backend/uploads-pre-restore');
                        if (!fs.existsSync(currentBackupPath)) {
                            fs.mkdirSync(currentBackupPath, { recursive: true });
                        }
                        
                        const currentFiles = fs.readdirSync(uploadsPath);
                        currentFiles.forEach(file => {
                            const sourceFile = path.join(uploadsPath, file);
                            const backupFile = path.join(currentBackupPath, file);
                            fs.copyFileSync(sourceFile, backupFile);
                        });
                    }
                    
                    // Tạo thư mục uploads nếu chưa tồn tại
                    if (!fs.existsSync(uploadsPath)) {
                        fs.mkdirSync(uploadsPath, { recursive: true });
                    }
                    
                    // Restore images
                    const files = fs.readdirSync(imagesBackupPath);
                    let restoredCount = 0;
                    let totalSize = 0;
                    
                    files.forEach(file => {
                        const sourceFile = path.join(imagesBackupPath, file);
                        const destFile = path.join(uploadsPath, file);
                        
                        if (fs.statSync(sourceFile).isFile()) {
                            fs.copyFileSync(sourceFile, destFile);
                            restoredCount++;
                            totalSize += fs.statSync(sourceFile).size;
                        }
                    });
                    
                    return { recordCount, restoredCount, totalSize };
                }
                
                return { recordCount, restoredCount: 0, totalSize: 0 };
            });
        } else {
            throw new Error('Database backup not found');
        }
    } catch (error) {
        throw error;
    }
}

// Tạo menu tùy chỉnh
function createMenu() {
    const template = [
        {
            label: 'Dữ liệu',
            submenu: [
                {
                    label: 'Sao lưu tất cả dữ liệu',
                    accelerator: 'CmdOrCtrl+B',
                    enabled: isBackendReady,
                    click: async () => {
                        try {
                            // Cho phép chọn thư mục lưu backup
                            const backupDirResult = await dialog.showOpenDialog(mainWindow, {
                                title: 'Chọn thư mục lưu backup',
                                properties: ['openDirectory', 'createDirectory'],
                                buttonLabel: 'Chọn thư mục'
                            });
                            
                            if (backupDirResult.canceled) {
                                return; // Người dùng hủy
                            }
                            
                            const selectedBackupDir = backupDirResult.filePaths[0];
                            
                            const result = await dialog.showMessageBox(mainWindow, {
                                type: 'question',
                                title: 'Xác nhận sao lưu',
                                message: 'Bạn có chắc chắn muốn sao lưu tất cả dữ liệu và hình ảnh?',
                                detail: `Quá trình này sẽ tạo một bản sao lưu hoàn chỉnh của database và tất cả hình ảnh.\nVị trí lưu: ${selectedBackupDir}`,
                                buttons: ['Hủy', 'Sao lưu'],
                                defaultId: 1,
                                cancelId: 0
                            });
                            
                            if (result.response === 1) {
                                try {
                                    await stopBackend();
                                    
                                    // Sử dụng script backup với đường dẫn tùy chỉnh
                                    const script = 'node scripts/backup-all.js';
                                    const env = { ...process.env, BACKUP_CUSTOM_PATH: selectedBackupDir };
                                    
                                    await new Promise((resolve, reject) => {
                                        exec(script, { cwd: path.join(__dirname, '../'), env }, (error, stdout, stderr) => {
                                            if (error) {
                                                reject(new Error(`Lỗi khi tạo backup: ${stderr}`));
                                            } else {
                                                resolve(stdout);
                                            }
                                        });
                                    });
                                    
                                    dialog.showMessageBox(mainWindow, {
                                        type: 'info',
                                        title: 'Sao lưu thành công',
                                        message: `Đã sao lưu thành công!`,
                                        detail: `Backup đã được lưu tại: ${selectedBackupDir}`,
                                        buttons: ['OK']
                                    });
                                } finally {
                                    console.log('Restarting backend server after backup.');
                                    startBackend();
                                }
                            }
                        } catch (error) {
                            dialog.showErrorBox('Lỗi sao lưu', `Đã xảy ra lỗi khi sao lưu: ${error.message}`);
                        }
                    }
                },
                {
                    label: 'Khôi phục dữ liệu',
                    accelerator: 'CmdOrCtrl+R',
                    enabled: isBackendReady,
                    click: async () => {
                        try {
                            // Cho phép chọn thư mục backup để restore
                            const backupFolderResult = await dialog.showOpenDialog(mainWindow, {
                                title: 'Chọn thư mục backup để khôi phục',
                                properties: ['openDirectory'],
                                buttonLabel: 'Chọn thư mục'
                            });
                            
                            if (backupFolderResult.canceled) {
                                return; // Người dùng hủy
                            }
                            
                            const selectedBackupPath = backupFolderResult.filePaths[0];
                            
                            // Kiểm tra xem thư mục có phải là backup hợp lệ không
                            const manifestFile = path.join(selectedBackupPath, 'backup-manifest.json');
                            if (!fs.existsSync(manifestFile)) {
                                dialog.showErrorBox('Lỗi', 'Thư mục được chọn không phải là backup hợp lệ');
                                return;
                            }
                            
                            const result = await dialog.showMessageBox(mainWindow, {
                                type: 'warning',
                                title: 'Xác nhận khôi phục',
                                message: 'Bạn có chắc chắn muốn khôi phục dữ liệu?',
                                detail: `Dữ liệu hiện tại sẽ được thay thế bằng backup từ: ${path.basename(selectedBackupPath)}\nQuá trình này không thể hoàn tác!`,
                                buttons: ['Hủy', 'Khôi phục'],
                                defaultId: 1,
                                cancelId: 0
                            });
                            
                            if (result.response === 1) {
                                try {
                                    await stopBackend();
                                    
                                    // Sử dụng script restore với đường dẫn được chọn
                                    const script = `node scripts/restore-all.js "${selectedBackupPath}"`;
                                    
                                    await new Promise((resolve, reject) => {
                                        exec(script, { cwd: path.join(__dirname, '../') }, (error, stdout, stderr) => {
                                            if (error) {
                                                reject(new Error(`Lỗi khi khôi phục backup: ${stderr}`));
                                            } else {
                                                resolve(stdout);
                                            }
                                        });
                                    });
                                    
                                    dialog.showMessageBox(mainWindow, {
                                        type: 'info',
                                        title: 'Khôi phục thành công',
                                        message: `Đã khôi phục thành công!`,
                                        detail: `Dữ liệu đã được khôi phục từ: ${path.basename(selectedBackupPath)}`,
                                        buttons: ['OK']
                                    });
                                } finally {
                                    console.log('Restarting backend server after restore.');
                                    startBackend();
                                }
                            }
                        } catch (error) {
                            dialog.showErrorBox('Lỗi khôi phục', `Đã xảy ra lỗi khi khôi phục: ${error.message}`);
                        }
                    }
                },
                {
                    label: 'Khởi tạo dữ liệu mới',
                    accelerator: 'CmdOrCtrl+N',
                    enabled: isBackendReady,
                    click: async () => {
                        try {
                            const result = await dialog.showMessageBox(mainWindow, {
                                type: 'warning',
                                title: 'Xác nhận khởi tạo',
                                message: 'Bạn có chắc chắn muốn xóa toàn bộ dữ liệu?',
                                detail: 'Tất cả hội viên và hình ảnh sẽ bị xóa vĩnh viễn, nhưng cấu trúc database sẽ được giữ lại. Thao tác này không thể hoàn tác!',
                                buttons: ['Hủy', 'Xóa dữ liệu'],
                                defaultId: 1,
                                cancelId: 0
                            });
                            
                            if (result.response === 1) { // User confirmed
                                await new Promise((resolve, reject) => {
                                    if (!backendProcess || !backendProcess.connected) {
                                        return reject(new Error('Backend chưa sẵn sàng hoặc đã ngắt kết nối.'));
                                    }

                                    const onInitResponse = (msg) => {
                                        if (msg.type === 'init-complete') {
                                            cleanup();
                                            resolve();
                                        } else if (msg.type === 'init-failed') {
                                            cleanup();
                                            reject(new Error(msg.error));
                                        }
                                    };
                                    
                                    const onBackendClose = () => {
                                        cleanup();
                                        reject(new Error('Backend đã đóng đột ngột trong quá trình khởi tạo.'));
                                    };

                                    const cleanup = () => {
                                        backendProcess.removeListener('message', onInitResponse);
                                        backendProcess.removeListener('close', onBackendClose);
                                        clearTimeout(timeout);
                                    };

                                    backendProcess.on('message', onInitResponse);
                                    backendProcess.on('close', onBackendClose);
                                    
                                    backendProcess.send('initialize-data');

                                    const timeout = setTimeout(() => {
                                        cleanup();
                                        reject(new Error('Quá trình khởi tạo quá lâu, backend không phản hồi.'));
                                    }, 15000); // 15 seconds timeout
                                });

                                // If promise resolves, show success
                                dialog.showMessageBox(mainWindow, {
                                    type: 'info',
                                    title: 'Khởi tạo thành công',
                                    message: 'Đã xóa tất cả dữ liệu thành công!',
                                    detail: 'Cấu trúc database được giữ nguyên và thư mục hình ảnh đã được dọn dẹp.',
                                    buttons: ['OK']
                                });
                            }
                        } catch (error) {
                            dialog.showErrorBox('Lỗi khởi tạo', `Đã xảy ra lỗi: ${error.message}`);
                        }
                    }
                }
            ]
        },
        {
            label: 'Trợ giúp',
            submenu: [
                {
                    label: 'Giới thiệu',
                    click: () => {
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: 'Giới thiệu',
                            message: 'Công ty TNHH công nghệ số Đức Minh',
                            detail: 'Điện thoại: 0963.762.379',
                            buttons: ['Đóng'],
                            defaultId: 0
                        });
                    }
                }
            ]
        }
    ];

    mainMenu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(mainMenu);
}

function setBackendReady(isReady) {
    console.log(`--- setBackendReady called with: ${isReady} ---`);
    isBackendReady = isReady;

    if (!mainMenu) {
        console.error('!!! setBackendReady: mainMenu object is null. Cannot update menu state.');
        return;
    }

    const dataMenu = mainMenu.items.find(item => item.label === 'Dữ liệu');
    if (!dataMenu) {
        console.error('!!! setBackendReady: Could not find "Dữ liệu" menu item.');
        return;
    }

    if (dataMenu.submenu && dataMenu.submenu.items) {
        dataMenu.submenu.items.forEach(item => {
            console.log(`Setting "${item.label}" enabled state to: ${isReady}`);
            item.enabled = isReady;
        });
        console.log('--- Menu state update complete ---');
    } else {
        console.error('!!! setBackendReady: "Dữ liệu" menu has no submenu to update.');
    }
}

// Thêm IPC handlers cho backup/restore
ipcMain.handle('select-backup-directory', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        title: 'Chọn thư mục lưu backup',
        properties: ['openDirectory', 'createDirectory'],
        buttonLabel: 'Chọn thư mục'
    });
    
    if (!result.canceled && result.filePaths.length > 0) {
        return result.filePaths[0];
    }
    return null;
});

ipcMain.handle('select-backup-file', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        title: 'Chọn file backup để khôi phục',
        properties: ['openFile'],
        filters: [
            { name: 'Backup Files', extensions: ['db', 'json', '*'] },
            { name: 'All Files', extensions: ['*'] }
        ],
        buttonLabel: 'Chọn file'
    });
    
    if (!result.canceled && result.filePaths.length > 0) {
        return result.filePaths[0];
    }
    return null;
});

ipcMain.handle('select-backup-folder', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        title: 'Chọn thư mục backup để khôi phục',
        properties: ['openDirectory'],
        buttonLabel: 'Chọn thư mục'
    });
    
    if (!result.canceled && result.filePaths.length > 0) {
        return result.filePaths[0];
    }
    return null;
});

ipcMain.handle('get-backup-list', async () => {
    try {
        const backupDir = path.join(__dirname, '../backups');
        if (!fs.existsSync(backupDir)) return [];
        
        const backups = fs.readdirSync(backupDir)
            .filter(dir => dir.startsWith('full-backup-'))
            .map(dir => {
                const backupPath = path.join(backupDir, dir);
                const manifestFile = path.join(backupPath, 'backup-manifest.json');
                let manifest = null;
                if (fs.existsSync(manifestFile)) {
                    try {
                        manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
                    } catch {}
                }
                return {
                    name: dir,
                    path: backupPath,
                    type: manifest?.backupType || 'full',
                    date: manifest?.backupDate || '',
                    manifest
                };
            });
        return backups;
    } catch (error) {
        console.error('Error getting backup list:', error);
        return [];
    }
});

ipcMain.handle('create-backup', async (event, options) => {
    try {
        const { type, customPath } = options;
        let script = 'node scripts/backup-all.js';
        const env = { ...process.env };
        if (customPath) env.BACKUP_CUSTOM_PATH = customPath;
        
        return new Promise((resolve, reject) => {
            exec(script, { cwd: path.join(__dirname, '../'), env }, (error, stdout, stderr) => {
                if (error) {
                    reject(new Error(`Lỗi khi tạo backup: ${stderr}`));
                } else {
                    resolve({ success: true, stdout });
                }
            });
        });
    } catch (error) {
        throw error;
    }
});

ipcMain.handle('restore-backup', async (event, backupPath) => {
    try {
        const script = `node scripts/restore-all.js "${backupPath}"`;
        
        return new Promise((resolve, reject) => {
            exec(script, { cwd: path.join(__dirname, '../') }, (error, stdout, stderr) => {
                if (error) {
                    reject(new Error(`Lỗi khi khôi phục backup: ${stderr}`));
                } else {
                    resolve({ success: true, stdout });
                }
            });
        });
    } catch (error) {
        throw error;
    }
});

ipcMain.handle('delete-backup', async (event, backupPath) => {
    try {
        fs.rmSync(backupPath, { recursive: true, force: true });
        return { success: true };
    } catch (error) {
        throw new Error(`Lỗi khi xóa backup: ${error.message}`);
    }
});

ipcMain.handle('download-backup', async (event, backupPath) => {
    try {
        // Tạo file zip từ backup folder
        const archiver = require('archiver');
        const output = fs.createWriteStream(`${backupPath}.zip`);
        const archive = archiver('zip', { zlib: { level: 9 } });
        
        return new Promise((resolve, reject) => {
            output.on('close', () => {
                // Mở thư mục chứa file zip
                const { shell } = require('electron');
                shell.showItemInFolder(`${backupPath}.zip`);
                resolve({ success: true });
            });
            
            archive.on('error', (err) => {
                reject(err);
            });
            
            archive.pipe(output);
            archive.directory(backupPath, false);
            archive.finalize();
        });
    } catch (error) {
        throw new Error(`Lỗi khi tải backup: ${error.message}`);
    }
});