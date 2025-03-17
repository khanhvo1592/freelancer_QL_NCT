const { app, BrowserWindow } = require('electron');
const path = require('path');
// Thay thế electron-is-dev bằng kiểm tra process.env.NODE_ENV
const isDev = process.env.NODE_ENV === 'development';
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

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

function startReactApp() {
    console.log('Starting React app...');
    // Khởi động React app từ thư mục elder-manager
    frontendProcess = spawn('npm', ['start'], {
        cwd: path.join(__dirname, 'elder-manager'),
        shell: true,
        env: { ...process.env, BROWSER: 'none' }
    });

    frontendProcess.stdout.on('data', (data) => {
        console.log(`React: ${data}`);
    });

    frontendProcess.stderr.on('data', (data) => {
        console.error(`React error: ${data}`);
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

function checkLicense() {
    const imageDir = 'D:\\image'; // Đường dẫn đến thư mục chứa ảnh

    // Kiểm tra xem thư mục có tồn tại không
    if (fs.existsSync(imageDir)) {
        // Đọc danh sách file trong thư mục
        const files = fs.readdirSync(imageDir);

        // Kiểm tra xem có file .jpg nào không
        const hasJpgFile = files.some(file => path.extname(file).toLowerCase() === '.jpg');

        if (hasJpgFile) {
            // console.log('Thư mục chứa file ảnh .jpg. Ứng dụng sẽ khởi động.');
            return true; // Có file .jpg
        } else {
            // console.error('Không tìm thấy file ảnh .jpg trong thư mục. Ứng dụng sẽ ngừng hoạt động.');
            return false; // Không có file .jpg
        }
    } else {
        // console.error('Thư mục không tồn tại. Ứng dụng sẽ ngừng hoạt động.');
        return false; // Thư mục không tồn tại
    }
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        icon: path.join(__dirname, 'elder-manager/public/app.ico'),
        title: 'Elder Manager'
    });

    // Thử kết nối đến React server
    const tryConnection = () => {
        mainWindow.loadURL('http://localhost:3000')
            .then(() => {
                console.log('Connected to React app');
            })
            .catch(() => {
                console.log('Retrying connection...');
                setTimeout(tryConnection, 1000);
            });
    };

    // Đợi React server khởi động
    setTimeout(() => {
        tryConnection();
    }, 3000);

    mainWindow.on('closed', () => {
        mainWindow = null;
        if (frontendProcess) {
            frontendProcess.kill();
        }
    });
}

app.whenReady().then(() => {
    if (checkLicense()) {
        log('App is ready');
        startReactApp();
        setTimeout(createWindow, 2000);
    } else {
        app.quit(); // Ngừng ứng dụng nếu không có file .jpg
    }
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

// Cleanup khi đóng app
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