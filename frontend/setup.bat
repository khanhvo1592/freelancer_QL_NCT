@echo off
chcp 65001 > nul
setlocal enabledelayedexpansion

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
set "EXE_PATH=%~dp0PhanMemQuanLyHoiVienNCT.exe"
set "ICON_PATH=%~dp0app.ico"
set "SHORTCUT_NAME=Phan mem quan ly hoi vien NCT.lnk"
set "DESKTOP_PATH=%USERPROFILE%\Desktop"

if not exist "%EXE_PATH%" (
    echo Error: Application executable not found at:
    echo %EXE_PATH%
    echo Please make sure the application is built before running setup.
    pause
    exit /b 1
)

if not exist "%ICON_PATH%" (
    echo Warning: Icon file not found at:
    echo %ICON_PATH%
    echo Using default icon...
    set "ICON_PARAM="
) else (
    set "ICON_PARAM=!ICON_PATH!"
)

:: Tạo shortcut trên Desktop
echo Creating desktop shortcut...
echo Target: %EXE_PATH%
echo Desktop: %DESKTOP_PATH%
echo Shortcut: %DESKTOP_PATH%\%SHORTCUT_NAME%

powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%DESKTOP_PATH%\%SHORTCUT_NAME%'); $Shortcut.TargetPath = '%EXE_PATH%'; $Shortcut.WorkingDirectory = '%~dp0'; if ('%ICON_PARAM%') { $Shortcut.IconLocation = '%ICON_PARAM%' }; $Shortcut.Save(); Write-Host 'Shortcut created successfully'"

if %errorlevel% neq 0 (
    echo Error creating shortcut!
    echo Please try running this script as Administrator.
    pause
    exit /b 1
)

:: Tạo thư mục images trong ổ D nếu chưa có
if not exist "D:\images" (
    mkdir "D:\images"
    echo Created D:\images directory
)

echo Setup completed successfully!
echo You can now start the application from your desktop.
pause