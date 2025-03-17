const { app, BrowserWindow } = require('electron');
const path = require('path');
// Thay thế electron-is-dev bằng kiểm tra process.env.NODE_ENV
const isDev = process.env.NODE_ENV === 'development';
const { spawn } = require('child_process');
const http = require('http');

let mainWindow;
let backendProcess;
let frontendProcess;

function log(message) {
    console.log(`[Electron] ${message}`);
}

function startBackend() {
    console.log('Starting backend...');
    const backendPath = path.join(__dirname, 'elder-mgmt-be');
    backendProcess = spawn('npm', ['start'], {
        cwd: backendPath,
        shell: true
    });

    backendProcess.stdout.on('data', (data) => {
        console.log(`Backend: ${data}`);
    });

    backendProcess.stderr.on('data', (data) => {
        console.error(`Backend error: ${data}`);
    });
}

function startFrontend() {
    log('Starting frontend...');
    frontendProcess = spawn('npm', ['start'], {
        cwd: path.join(__dirname, 'elder-manager'),
        shell: true,
        env: { 
            ...process.env, 
            BROWSER: 'none',
            PORT: '3000'
        }
    });

    frontendProcess.stdout.on('data', (data) => {
        log(`Frontend: ${data}`);
    });

    frontendProcess.stderr.on('data', (data) => {
        log(`Frontend Error: ${data}`);
    });
}

function checkReactServer(callback) {
    http.get('http://localhost:3000', (res) => {
        if (res.statusCode === 200) {
            callback(true);
        } else {
            callback(false);
        }
    }).on('error', () => {
        callback(false);
    });
}

function createWindow() {
    log('Creating window...');
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: false
        }
    });

    // Thêm xử lý retry khi load URL
    const loadURL = () => {
        log('Attempting to load URL...');
        mainWindow.loadURL('http://localhost:3000').catch((err) => {
            log(`Failed to load URL: ${err}`);
            setTimeout(loadURL, 1000);
        });
    };

    mainWindow.webContents.on('did-fail-load', () => {
        log('Failed to load page, retrying...');
        setTimeout(loadURL, 1000);
    });

    mainWindow.webContents.on('did-finish-load', () => {
        log('Page loaded successfully');
    });

    // Mở DevTools để debug
    mainWindow.webContents.openDevTools();

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    loadURL();
}

app.whenReady().then(() => {
    log('App is ready');
    // Khởi động frontend trước
    startFrontend();
    
    // Đợi frontend khởi động (khoảng 5 giây)
    setTimeout(() => {
        createWindow();
    }, 5000);
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        if (backendProcess) {
            backendProcess.kill();
        }
        if (frontendProcess) {
            frontendProcess.kill();
        }
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

// Cleanup khi đóng ứng dụng
process.on('exit', () => {
    if (backendProcess) {
        backendProcess.kill();
    }
    if (frontendProcess) {
        frontendProcess.kill();
    }
});

['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach(signal => {
    process.on(signal, () => {
        if (frontendProcess) {
            frontendProcess.kill();
        }
        app.quit();
    });
});