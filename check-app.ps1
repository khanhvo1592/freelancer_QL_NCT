Write-Host "=== Kiem tra ung dung ===" -ForegroundColor Green

# Kiem tra file exe
if (Test-Path "dist\PhanMemQuanLyHoiVienNCT.exe") {
    Write-Host "✓ File exe da duoc tao" -ForegroundColor Green
    $exeFile = Get-Item "dist\PhanMemQuanLyHoiVienNCT.exe"
    Write-Host "  Kich thuoc: $([math]::Round($exeFile.Length / 1MB, 2)) MB" -ForegroundColor Cyan
} else {
    Write-Host "✗ File exe chua duoc tao" -ForegroundColor Red
}

# Kiem tra cac file can thiet
Write-Host "`nKiem tra cac file can thiet:" -ForegroundColor Cyan
$files = @(
    "dist\win-unpacked\resources\app\backend\server.js",
    "dist\win-unpacked\resources\app\frontend\index.html"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file" -ForegroundColor Red
    }
}

Write-Host "`nHoan thanh!" -ForegroundColor Green
