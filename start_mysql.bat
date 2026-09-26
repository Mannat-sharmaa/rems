@echo off
echo ========================================================
echo   Starting Oracle MySQL Community Server 8.0 on Port 3306...
echo ========================================================
".\mysql-8.0.46-winx64\bin\mysqld.exe" --defaults-file=".\mysql-data\my.ini" --port=3306 --console
pause
