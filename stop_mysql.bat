@echo off
echo ========================================================
echo   Stopping Oracle MySQL Community Server 8.0...
echo ========================================================
".\mysql-8.0.46-winx64\bin\mysqladmin.exe" -u root -P 3306 shutdown
echo MySQL Server stopped.
pause
