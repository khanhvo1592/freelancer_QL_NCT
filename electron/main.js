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

function checkBackendServer(url) {
    console.log(`Checking server at ${url}...`);
    return new Promise((resolve, reject) => {
        http.get(url + '/api/health', (res) => {
            console.log(`Server ${url} responded with status: ${res.statusCode}`);
            if (res.statusCode === 200) {
                resolve();
            } else {
                reject(new Error(`Server responded with status code: ${res.statusCode}`));
            }
        }).on('error', (err) => {
            console.log(`Error checking ${url}:`, err.message);
            reject(err);
        });
    });
}

function startBackend() {
    console.log('Starting application...');
    // Kiểm tra xem backend đã chạy chưa
    Promise.all([
        checkBackendServer('http://localhost:5000'),
        checkBackendServer('http://localhost:3000')
    ])
    .then(() => {
        console.log('Both frontend and backend are running');
        createWindow();
    })
    .catch((error) => {
        console.log('Retrying in 1 second...', error.message);
        setTimeout(startBackend, 1000);
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
        icon: path.join(__dirname, isDev ? '../frontend/public/app.ico' : 'app.ico'),
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
                'Please ensure it is running by executing "cd frontend && npm start"');
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