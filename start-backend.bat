@echo off
echo Starting Backend Server...
cd /d %~dp0
start /min cmd /c "node server.js"