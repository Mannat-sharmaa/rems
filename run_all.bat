@echo off
title REMS - Real Estate Management System
echo ========================================================
echo   Launching Real Estate Management System (REMS)
echo   MySQL 8.0 Server + Express Backend + Browser UI
echo ========================================================

:: 1. Start MySQL 8.0 in the background
echo [1/3] Starting MySQL 8.0 Community Server...
start "" ".\mysql-8.0.46-winx64\bin\mysqld.exe" --defaults-file=".\mysql-data\my.ini" --port=3306

:: 2. Wait 2 seconds for MySQL socket to bind
timeout /t 2 /nobreak >nul

:: 3. Launch default browser to public dashboard
echo [2/3] Opening Browser at http://localhost:5000...
start "" "http://localhost:5000"

:: 4. Start Node.js Express server
echo [3/3] Starting Node.js Backend Server...
node backend/server.js
pause
