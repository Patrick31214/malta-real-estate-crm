@echo off
cd /d "%~dp0"
git pull 2>nul
call run-crm.bat
