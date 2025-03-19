const { app, BrowserWindow, dialog, ipcMain } = require('electron');
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
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'elder-manager/public/preload.js')
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

// Thêm xử lý sự kiện in
ipcMain.handle('print-elderly-info', async (event, elderlyData) => {
  const printWindow = new BrowserWindow({
    width: 800,
    height: 900,
    title: 'Phiếu thông tin người cao tuổi',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Phiếu thông tin người cao tuổi</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            font-size: 14px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .title {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .info-group {
            margin-bottom: 20px;
          }
          .info-row {
            display: flex;
            margin: 10px 0;
            border-bottom: 1px dotted #ccc;
            padding: 5px 0;
          }
          .label {
            width: 200px;
            font-weight: bold;
          }
          .value {
            flex: 1;
          }
          .footer {
            margin-top: 50px;
            text-align: right;
          }
          .signature-section {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
          }
          .signature-box {
            text-align: center;
            width: 200px;
          }
          .signature-line {
            margin-top: 70px;
            border-top: 1px dotted #000;
          }
          @media print {
            .no-print {
              display: none;
            }
            body {
              padding: 0;
              margin: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">PHIẾU THÔNG TIN NGƯỜI CAO TUỔI</div>
          <div>Ngày lập phiếu: ${new Date().toLocaleDateString('vi-VN')}</div>
        </div>

        <div class="info-group">
          <div class="info-row">
            <div class="label">Họ và tên:</div>
            <div class="value">${elderlyData.name}</div>
          </div>
          <div class="info-row">
            <div class="label">Ngày sinh:</div>
            <div class="value">${new Date(elderlyData.dateOfBirth).toLocaleDateString('vi-VN')}</div>
          </div>
          <div class="info-row">
            <div class="label">Giới tính:</div>
            <div class="value">${elderlyData.gender === 'male' ? 'Nam' : 'Nữ'}</div>
          </div>
          <div class="info-row">
            <div class="label">Địa chỉ:</div>
            <div class="value">${elderlyData.address}</div>
          </div>
          <div class="info-row">
            <div class="label">Số điện thoại:</div>
            <div class="value">${elderlyData.phone || 'Không có'}</div>
          </div>
          <div class="info-row">
            <div class="label">Trạng thái:</div>
            <div class="value">${elderlyData.deceased ? 'Đã mất' : 'Còn sống'}</div>
          </div>
          <div class="info-row">
            <div class="label">Ghi chú:</div>
            <div class="value">${elderlyData.notes || ''}</div>
          </div>
        </div>

        <div class="signature-section">
          <div class="signature-box">
            <div>Người lập phiếu</div>
            <div class="signature-line"></div>
          </div>
          <div class="signature-box">
            <div>Xác nhận của hội</div>
            <div class="signature-line"></div>
          </div>
        </div>

        <button class="no-print" onclick="window.print()" 
          style="position: fixed; bottom: 20px; right: 20px; padding: 10px 20px;">
          In phiếu
        </button>
      </body>
    </html>
  `;

  await printWindow.loadURL(`data:text/html;charset=UTF-8,${encodeURIComponent(htmlContent)}`);
});