const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';
const fs = require('fs');
const { spawn } = require('child_process');

let mainWindow;
let backendProcess;

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
        icon: path.join(__dirname, isDev ? '../frontend/public/app.ico' : '../frontend/public/app.ico'),
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
    const printWindow = new BrowserWindow({
        width: 800,
        height: 900,
        show: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: false,
            allowRunningInsecureContent: true
        }
    });

    // Load trang in
    if (isDev) {
        await printWindow.loadURL('http://localhost:3000/print');
    } else {
        const indexPath = path.join(process.resourcesPath, 'app', 'frontend', 'index.html');
        await printWindow.loadURL(`file://${indexPath}#print`);
    }

    // Gửi dữ liệu người cao tuổi đến trang in
    printWindow.webContents.send('print-data', elderlyData);

    // In trang
    const result = await printWindow.webContents.print({ silent: false, printBackground: true });
    
    // Đóng cửa sổ in
    printWindow.close();

    return result;
});