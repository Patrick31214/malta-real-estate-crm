@echo off
git pull 2>nul
call "%~dp0run-crm.bat"
