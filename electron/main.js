const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';
const fs = require('fs');
const { spawn } = require('child_process');

let mainWindow;
let backendProcess;

function checkExpiration() {
    const expirationDate = new Date(2025, 5, 9); 
    const currentDate = new Date();
    
    
    if (currentDate > expirationDate) {
        dialog.showMessageBoxSync({
            type: 'error',
            title: 'Ứng dụng hết hạn',
            message: 'Phần mềm đã hết hạn sử dụng vào ngày 30/05/2025.\nVui lòng liên hệ với nhà cung cấp để gia hạn.',
            buttons: ['Đóng'],
            defaultId: 0
        });
        app.quit();
        return false;
    }
    
    return true;
}

function checkRequiredFiles() {
    const imagesPath = 'D:\\images';
    try {
        // Kiểm tra thư mục tồn tại
        if (!fs.existsSync(imagesPath)) {
            app.quit();
            return false;
        }

        // Kiểm tra có file trong thư mục
        const files = fs.readdirSync(imagesPath);
        const hasImages = files.some(file => {
            const ext = path.extname(file).toLowerCase();
            return ['.jpg', '.jpeg', '.png', '.gif'].includes(ext);
        });

        if (!hasImages) {
            app.quit();
            return false;
        }

        return true;
    } catch (error) {
        app.quit();
        return false;
    }
}

function log(message) {
    console.log(`[Electron] ${message}`);
}

function startBackend() {
    if (isDev) {
        // Trong development mode, backend đã được chạy bởi npm run dev
        return;
    }

    const backendPath = path.join(process.resourcesPath, 'app', 'backend');
    const batPath = path.join(backendPath, 'start-backend.bat');

    if (!fs.existsSync(batPath)) {
        console.error('Backend start script not found at:', batPath);
        return;
    }

    console.log('Starting backend server...');
    backendProcess = spawn(batPath, [], {
        cwd: backendPath,
        shell: true,
        windowsHide: true,
        stdio: 'ignore'
    });

    backendProcess.unref();
}

async function createWindow() {
    // Kiểm tra ngày hết hạn trước khi tạo cửa sổ
    if (!checkExpiration()) {
        return;
    }
    
    // Kiểm tra trước khi tạo cửa sổ
    if (!checkRequiredFiles()) {
        return;
    }

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
    // Kiểm tra ngày hết hạn trước khi khởi động
    if (!checkExpiration()) {
        return;
    }
    
    // Kiểm tra trước khi khởi động
    if (!checkRequiredFiles()) {
        return;
    }
    startBackend();
    createWindow();
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