const { app, BrowserWindow, dialog } = require('electron');
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

// Hàm kiểm tra file jpg đơn giản
function checkLicense() {
    return new Promise((resolve, reject) => {
        const imagePath = 'D:\\image';
        
        // Kiểm tra thư mục và file jpg
        if (fs.existsSync(imagePath)) {
            const files = fs.readdirSync(imagePath);
            const hasJpgFiles = files.some(file => 
                file.toLowerCase().endsWith('.jpg') || 
                file.toLowerCase().endsWith('.jpeg')
            );
            
            if (hasJpgFiles) {
                resolve(true);
            } else {
                reject(new Error('No jpg files'));
            }
        } else {
            reject(new Error('Directory not found'));
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

function startFrontend() {
    const frontendPath = path.join(__dirname, 'elder-manager');
    frontendProcess = spawn('npm', ['start'], {
        cwd: frontendPath,
        shell: true
    });

    frontendProcess.stdout.on('data', (data) => {
        console.log(`Frontend: ${data}`);
    });

    frontendProcess.stderr.on('data', (data) => {
        console.error(`Frontend Error: ${data}`);
    });

    // Sau khi khởi động frontend, tạo cửa sổ Electron
    setTimeout(createWindow, 3000);
}

// Sửa lại hàm startBackend
async function startBackend() {
    try {
        // Kiểm tra license trước
        await checkLicense();
        
        const backendPath = path.join(__dirname, 'elder-mgmt-be');
        backendProcess = spawn('npm', ['start'], {
            cwd: backendPath,
            shell: true
        });

        backendProcess.stdout.on('data', (data) => {
            console.log(`Backend: ${data}`);
        });

        backendProcess.stderr.on('data', (data) => {
            console.error(`Backend Error: ${data}`);
        });

        const tryBackendConnection = () => {
            checkBackendServer('http://localhost:5000')
                .then(() => {
                    console.log('Backend server is running');
                    startFrontend();
                })
                .catch((err) => {
                    console.log('Waiting for backend server...', err.message);
                    setTimeout(tryBackendConnection, 1000);
                });
        };

        setTimeout(tryBackendConnection, 2000);
    } catch (error) {
        console.error('License check failed');
        app.quit();
    }
}

function checkServer(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            if (res.statusCode === 200) {
                resolve(true);
            } else {
                reject(new Error(`Server responded with status code: ${res.statusCode}`));
            }
        }).on('error', (err) => {
            reject(err);
        });
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: false
        },
        icon: path.join(__dirname, 'elder-manager/public/app.ico'),
        title: 'Phần mềm quản lý hội viên hội người cao tuổi'
    });

    const maxRetries = 30;
    let retries = 0;

    const tryLoadUrl = () => {
        if (retries >= maxRetries) {
            dialog.showErrorBox('Lỗi kết nối', 'Không thể kết nối đến ứng dụng sau nhiều lần thử');
            app.quit();
            return;
        }

        checkServer('http://localhost:3000')
            .then(() => {
                mainWindow.loadURL('http://localhost:3000');
            })
            .catch((err) => {
                console.log(`Lần thử ${retries + 1}: ${err.message}`);
                retries++;
                setTimeout(tryLoadUrl, 1000);
            });
    };

    tryLoadUrl();

    mainWindow.on('closed', () => {
        mainWindow = null;
        if (frontendProcess) {
            frontendProcess.kill();
        }
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
        if (frontendProcess) {
            frontendProcess.kill();
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

// Kiểm tra định kỳ (tùy chọn)
setInterval(() => {
    checkLicense().catch(() => {
        dialog.showErrorBox(
            'Lỗi xác thực',
            'Không tìm thấy file hình ảnh cần thiết. Ứng dụng sẽ đóng!'
        );
        app.quit();
    });
}, 3600000); // Kiểm tra mỗi giờ