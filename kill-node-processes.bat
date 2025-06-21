@echo off
echo Killing all Node.js processes...

REM Kill tất cả process node.exe
taskkill /f /im node.exe 2>nul
if %errorlevel% equ 0 (
    echo Successfully killed Node.js processes
) else (
    echo No Node.js processes found or already killed
)

REM Kill tất cả process npm.cmd
taskkill /f /im npm.cmd 2>nul
if %errorlevel% equ 0 (
    echo Successfully killed npm processes
) else (
    echo No npm processes found or already killed
)

REM Kill tất cả process electron.exe
taskkill /f /im electron.exe 2>nul
if %errorlevel% equ 0 (
    echo Successfully killed Electron processes
) else (
    echo No Electron processes found or already killed
)

echo Cleanup completed!
pause 