# Script de kiem tra va sua loi tren Windows 11
Write-Host "=== Kiem tra va sua loi cho Phan mem quan ly hoi vien NCT ===" -ForegroundColor Green
Write-Host ""

# Kiem tra quyen admin
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
if (-not $isAdmin) {
    Write-Host "Canh bao: Script can chay voi quyen Administrator de sua mot so loi" -ForegroundColor Yellow
    Write-Host "Nhan phim bat ky de tiep tuc..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

# 1. Kiem tra Visual C++ Redistributable
Write-Host "1. Kiem tra Visual C++ Redistributable..." -ForegroundColor Cyan
$vcRedist = Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\VisualStudio\14.0\VC\Runtimes\x64" -ErrorAction SilentlyContinue
if ($vcRedist) {
    Write-Host "   ✓ Visual C++ Redistributable da duoc cai dat" -ForegroundColor Green
} else {
    Write-Host "   ✗ Visual C++ Redistributable chua duoc cai dat" -ForegroundColor Red
    Write-Host "   Vui long tai va cai dat tu: https://aka.ms/vs/17/release/vc_redist.x64.exe" -ForegroundColor Yellow
}

# 2. Kiem tra Windows Defender
Write-Host "`n2. Kiem tra Windows Defender..." -ForegroundColor Cyan
$defenderStatus = Get-MpComputerStatus -ErrorAction SilentlyContinue
if ($defenderStatus) {
    Write-Host "   ✓ Windows Defender dang hoat dong" -ForegroundColor Green
    Write-Host "   Neu ung dung bi chan, vui long them vao danh sach ngoai le" -ForegroundColor Yellow
}

# 3. Kiem tra .NET Framework
Write-Host "`n3. Kiem tra .NET Framework..." -ForegroundColor Cyan
$dotnetVersion = Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\NET Framework Setup\NDP\v4\Full\" -Name Release -ErrorAction SilentlyContinue
if ($dotnetVersion -and $dotnetVersion.Release -ge 528040) {
    Write-Host "   ✓ .NET Framework 4.8 hoac moi hon da duoc cai dat" -ForegroundColor Green
} else {
    Write-Host "   ✗ .NET Framework can duoc cap nhat" -ForegroundColor Red
}

# 4. Kiem tra Node.js
Write-Host "`n4. Kiem tra Node.js..." -ForegroundColor Cyan
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "   ✓ Node.js $nodeVersion da duoc cai dat" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Node.js chua duoc cai dat" -ForegroundColor Red
    }
} catch {
    Write-Host "   ✗ Node.js chua duoc cai dat" -ForegroundColor Red
}

# 5. Kiem tra file exe
Write-Host "`n5. Kiem tra file exe..." -ForegroundColor Cyan
if (Test-Path "dist\PhanMemQuanLyHoiVienNCT.exe") {
    Write-Host "   ✓ File exe da duoc tao" -ForegroundColor Green
    
    # Kiem tra quyen thuc thi
    $exeFile = Get-Item "dist\PhanMemQuanLyHoiVienNCT.exe"
    if ($exeFile.Attributes -band [System.IO.FileAttributes]::ReadOnly) {
        Write-Host "   ⚠ File exe co thuoc tinh ReadOnly" -ForegroundColor Yellow
        Write-Host "   Dang bo thuoc tinh ReadOnly..." -ForegroundColor Yellow
        $exeFile.Attributes = $exeFile.Attributes -band (-bnot [System.IO.FileAttributes]::ReadOnly)
    }
} else {
    Write-Host "   ✗ File exe chua duoc tao" -ForegroundColor Red
    Write-Host "   Vui long chay: npm run build" -ForegroundColor Yellow
}

# 6. Kiem tra cac file can thiet
Write-Host "`n6. Kiem tra cac file can thiet..." -ForegroundColor Cyan
$requiredFiles = @(
    "dist\win-unpacked\resources\app\backend\server.js",
    "dist\win-unpacked\resources\app\frontend\index.html",
    "dist\win-unpacked\resources\app\backend\db\elderly.db"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "   ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "   ✗ $file" -ForegroundColor Red
    }
}

# 7. Kiem tra port 5000
Write-Host "`n7. Kiem tra port 5000..." -ForegroundColor Cyan
$port5000 = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($port5000) {
    Write-Host "   ⚠ Port 5000 dang duoc su dung boi process khac" -ForegroundColor Yellow
    Write-Host "   Process ID: $($port5000.OwningProcess)" -ForegroundColor Yellow
} else {
    Write-Host "   ✓ Port 5000 san sang" -ForegroundColor Green
}

Write-Host "`n=== Hoan thanh kiem tra ===" -ForegroundColor Green
Write-Host "Neu van con loi, vui long:" -ForegroundColor Yellow
Write-Host "1. Cai dat Visual C++ Redistributable" -ForegroundColor Yellow
Write-Host "2. Them ung dung vao danh sach ngoai le cua Windows Defender" -ForegroundColor Yellow
Write-Host "3. Chay ung dung voi quyen Administrator" -ForegroundColor Yellow
Write-Host "4. Kiem tra log trong DevTools (F12)" -ForegroundColor Yellow

Write-Host "`nNhan phim bat ky de thoat..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")