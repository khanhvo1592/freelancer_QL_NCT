@echo off
echo Khoi dong Phan mem quan ly hoi vien NCT...
echo.

REM Kiem tra xem file exe co ton tai khong
if not exist "dist\PhanMemQuanLyHoiVienNCT.exe" (
    echo Loi: Khong tim thay file PhanMemQuanLyHoiVienNCT.exe
    echo Vui long chay lenh: npm run build
    pause
    exit /b 1
)

REM Kiem tra Visual C++ Redistributable
echo Kiem tra Visual C++ Redistributable...
reg query "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\VisualStudio\14.0\VC\Runtimes\x64" >nul 2>&1
if %errorlevel% neq 0 (
    echo Canh bao: Visual C++ Redistributable chua duoc cai dat
    echo Vui long tai va cai dat tu: https://aka.ms/vs/17/release/vc_redist.x64.exe
    echo.
)

REM Chay ung dung
echo Dang khoi dong ung dung...
start "" "dist\PhanMemQuanLyHoiVienNCT.exe"

REM Doi mot chut de ung dung khoi dong
timeout /t 3 /nobreak >nul

echo Ung dung da duoc khoi dong!
pause
