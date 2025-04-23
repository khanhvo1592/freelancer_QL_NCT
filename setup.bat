@echo off
echo Checking Node.js installation...

:: Kiểm tra Node.js đã được cài đặt chưa
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Node.js is not installed. Installing Node.js...
    
    :: Tạo thư mục tạm để tải Node.js
    mkdir "%temp%\nodejs-setup" 2>nul
    cd /d "%temp%\nodejs-setup"
    
    :: Tải Node.js installer
    powershell -Command "(New-Object Net.WebClient).DownloadFile('https://nodejs.org/dist/v20.11.1/node-v20.11.1-x64.msi', 'nodejs.msi')"
    
    :: Cài đặt Node.js
    msiexec /i nodejs.msi /qn
    
    :: Xóa file tạm
    cd /d "%~dp0"
    rmdir /s /q "%temp%\nodejs-setup"
    
    echo Node.js has been installed successfully.
) else (
    echo Node.js is already installed.
)

:: Tạo shortcut trên Desktop
echo Creating desktop shortcut...
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut([System.Environment]::GetFolderPath('Desktop') + '\Phần mềm quản lý hội viên NCT.lnk'); $Shortcut.TargetPath = '%~dp0Phần mềm quản lý hội viên NCT.exe'; $Shortcut.WorkingDirectory = '%~dp0'; $Shortcut.IconLocation = '%~dp0resources\app\frontend\app.ico'; $Shortcut.Save()"

:: Tạo thư mục images trong ổ D nếu chưa có
if not exist "D:\images" (
    mkdir "D:\images"
    echo Created D:\images directory
)

echo Setup completed successfully!
echo You can now start the application from your desktop.
pause 