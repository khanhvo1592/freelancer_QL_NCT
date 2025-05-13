@echo off
chcp 65001 > nul
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

:: Kiểm tra file thực thi và icon tồn tại
if not exist "%~dp0Phan mem quan ly hoi vien NCT.exe" (
    echo Error: Application executable not found!
    echo Please make sure the application is built before running setup.
    pause
    exit /b 1
)

if not exist "%~dp0electron\app.ico" (
    echo Warning: Icon file not found at electron\app.ico
    echo Using default icon...
    set ICON_PATH=""
) else (
    set ICON_PATH="%~dp0electron\app.ico"
)

:: Tạo shortcut trên Desktop
echo Creating desktop shortcut...
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut([System.Environment]::GetFolderPath('Desktop') + '\Phan mem quan ly hoi vien NCT.lnk'); $Shortcut.TargetPath = '%~dp0Phan mem quan ly hoi vien NCT.exe'; $Shortcut.WorkingDirectory = '%~dp0'; if (%ICON_PATH%) { $Shortcut.IconLocation = %ICON_PATH% }; $Shortcut.Save()"

:: Tạo thư mục images trong ổ D nếu chưa có
if not exist "D:\images" (
    mkdir "D:\images"
    echo Created D:\images directory
)

echo Setup completed successfully!
echo You can now start the application from your desktop.
pause 