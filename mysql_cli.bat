@echo off
echo ========================================================
echo   Connecting to Oracle MySQL Community Server 8.0 CLI...
echo ========================================================
".\mysql-8.0.46-winx64\bin\mysql.exe" -u root -P 3306 --database=real_estate_db
pause
