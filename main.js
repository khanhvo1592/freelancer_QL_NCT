const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

let mainWindow;
let backendProcess;

function log(message) {
    console.log(`[Electron] ${message}`);
}

function showLicenseInstructions() {
    dialog.showMessageBox({
        type: 'info',
        title: 'Hướng dẫn xác thực',
        message: 'Để sử dụng ứng dụng, bạn cần có file hình ảnh xác thực.',
        detail: 'Vui lòng copy file .jpg vào thư mục D:\\image\n\nSau khi copy xong, khởi động lại ứng dụng.',
        buttons: ['Đóng'],
        defaultId: 0
    });
}

// Hàm kiểm tra file jpg đơn giản
function checkLicense() {
    return new Promise((resolve, reject) => {
        try {
            const dImagePath = 'D:\\image';
            
            // Nếu không có thư mục D:\image, thoát app
            if (!fs.existsSync(dImagePath)) {
                app.quit();
                return;
            }

            // Kiểm tra file jpg trong D:\image
            const dImageFiles = fs.readdirSync(dImagePath);
            const hasJpgInDImage = dImageFiles.some(file => 
                file.toLowerCase().endsWith('.jpg') || 
                file.toLowerCase().endsWith('.jpeg')
            );

            if (hasJpgInDImage) {
                resolve(true);
            } else {
                app.quit();
            }
        } catch (error) {
            app.quit();
        }
    });
}

function checkBackendServer(url) {
    return new Promise((resolve, reject) => {
        http.get(url + '/api/health', (res) => {
            if (res.statusCode === 200) {
                resolve();
            } else {
                reject(new Error(`Server responded with status code: ${res.statusCode}`));
            }
        }).on('error', (err) => {
            reject(err);
        });
    });
}

function startBackend() {
    // Kiểm tra license trước khi khởi động backend
    checkLicense().then(() => {
        try {
            // Trong production, sử dụng đường dẫn tới thư mục app
            const backendPath = isDev 
                ? path.join(__dirname, 'elder-mgmt-be')
                : path.join(__dirname, 'app', 'elder-mgmt-be');

            const serverScript = path.join(backendPath, 'server.js');
            console.log('Backend path:', backendPath);
            console.log('Server script path:', serverScript);

            // Kiểm tra file tồn tại
            if (!fs.existsSync(serverScript)) {
                console.error(`Cannot find server.js at ${serverScript}`);
                app.quit();
                return;
            }

            // Sử dụng Node.js từ system
            const command = process.platform === 'win32' ? 'node.exe' : 'node';
            
            backendProcess = spawn(command, [serverScript], {
                cwd: backendPath,
                env: {
                    ...process.env,
                    NODE_ENV: isDev ? 'development' : 'production',
                    PATH: process.env.PATH
                },
                shell: true,
                windowsHide: true
            });

            backendProcess.stdout.on('data', (data) => {
                console.log(`Backend: ${data}`);
            });

            backendProcess.stderr.on('data', (data) => {
                console.error(`Backend Error: ${data}`);
            });

            backendProcess.on('error', (err) => {
                console.error('Failed to start backend:', err);
                app.quit();
            });

            const tryBackendConnection = () => {
                checkBackendServer('http://localhost:5000')
                    .then(() => {
                        console.log('Backend server is running');
                        createWindow();
                    })
                    .catch((err) => {
                        console.log('Waiting for backend server...', err.message);
                        setTimeout(tryBackendConnection, 1000);
                    });
            };

            setTimeout(tryBackendConnection, 2000);
        } catch (error) {
            console.error('Failed to start backend:', error);
            app.quit();
        }
    }).catch(() => {
        app.quit();
    });
}

async function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        icon: path.join(__dirname, isDev ? 'elder-manager/public/app.ico' : 'app.ico'),
        title: 'Phần mềm quản lý hội viên hội người cao tuổi'
    });

    // Load ứng dụng
    if (isDev) {
        console.log('Running in development mode');
        // Trong development, load từ React dev server
        try {
            await mainWindow.loadURL('http://localhost:3000');
            console.log('Successfully loaded React dev server');
            // Mở DevTools
            mainWindow.webContents.openDevTools();
        } catch (err) {
            console.error('Failed to load React dev server:', err);
            dialog.showErrorBox('Development Error', 
                'Failed to connect to React development server. ' +
                'Please ensure it is running by executing "cd elder-manager && npm start"');
            app.quit();
        }
    } else {
        // Trong production, load từ file đã build
        const indexPath = path.join(__dirname, 'app', 'frontend', 'index.html');
        console.log('Loading frontend from:', indexPath);
        if (!fs.existsSync(indexPath)) {
            console.error('Frontend index.html not found at:', indexPath);
            dialog.showErrorBox('Error', `Cannot find frontend files at ${indexPath}`);
            app.quit();
            return;
        }
        mainWindow.loadFile(indexPath).catch(err => {
            console.error('Error loading frontend:', err);
            dialog.showErrorBox('Error', `Failed to load frontend: ${err.message}`);
            app.quit();
        });
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
        if (backendProcess) {
            backendProcess.kill();
        }
    });
}

app.on('ready', () => {
    startBackend();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        if (backendProcess) {
            backendProcess.kill();
        }
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        startBackend();
    }
});

// Cleanup khi đóng app
process.on('exit', () => {
    if (backendProcess) {
        backendProcess.kill();
    }
});

['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach(signal => {
    process.on(signal, () => {
        if (backendProcess) {
            backendProcess.kill();
        }
        app.quit();
    });
});

// Kiểm tra định kỳ (tùy chọn)
setInterval(() => {
    checkLicense().catch(() => {
        app.quit();
    });
}, 3600000); // Kiểm tra mỗi giờ

// Thêm xử lý sự kiện in
ipcMain.handle('print-elderly-info', async (event, elderlyData) => {
    const printWindow = new BrowserWindow({
        width: 800,
        height: 900,
        show: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    // Load trang in
    if (isDev) {
        await printWindow.loadURL('http://localhost:3000/print');
    } else {
        await printWindow.loadFile(path.join(__dirname, 'app', 'frontend', 'index.html'), {
            hash: 'print'
        });
    }

    // Gửi dữ liệu người cao tuổi đến trang in
    printWindow.webContents.send('print-data', elderlyData);

    // In trang
    const result = await printWindow.webContents.print({ silent: false, printBackground: true });
    
    // Đóng cửa sổ in
    printWindow.close();

    return result;
});