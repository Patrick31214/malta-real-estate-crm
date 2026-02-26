@echo off
REM ============================================================================
REM  Malta Real Estate CRM — Create First Admin Account
REM  Double-click this file to create your admin login.
REM  You only need to do this ONCE.
REM ============================================================================
cd /d "%~dp0"

echo.
echo ============================================================
echo   Malta Real Estate CRM — Admin Account Setup
echo ============================================================
echo.
echo   This will create your first admin login for the CRM.
echo   You only need to run this once.
echo.

if not exist "package.json" (
    echo [ERROR] Wrong folder. Please run this from inside the
    echo         malta-real-estate-crm folder.
    echo.
    pause
    exit /b 1
)

if not exist ".env" (
    echo [ERROR] No .env file found.
    echo         Run START-CRM.bat first to create it, then run this again.
    echo.
    pause
    exit /b 1
)

REM Make sure backend packages are installed
if not exist "node_modules" (
    echo [INFO] Installing packages (one-time setup)...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] npm install failed. Check your internet connection.
        pause
        exit /b 1
    )
)

echo.
echo   -------------------------------------------------------
echo   Answer the questions below to create your admin account.
echo   When asked for a password, type it and press ENTER.
echo   (The password is visible while you type - this is normal.)
echo   -------------------------------------------------------
echo.

node scripts/create-admin.js

echo.
if %ERRORLEVEL% EQU 0 (
    echo ============================================================
    echo   DONE!  Your admin account has been created.
    echo.
    echo   Now open your browser and go to:
    echo.
    echo        http://localhost:3000      (if using START-CRM.bat)
    echo        http://localhost:3001      (if using start-windows.bat)
    echo.
    echo   Log in with the email and password you just entered.
    echo ============================================================
) else (
    echo ============================================================
    echo   [!] Something went wrong. Read the message above.
    echo.
    echo   Common causes:
    echo     - The CRM database is not running.
    echo       Start it: double-click START-CRM.bat first.
    echo     - Wrong DB_PASSWORD in .env.
    echo       Open .env in Notepad and check DB_PASSWORD=
    echo ============================================================
)

echo.
echo Press any key to close this window...
pause >nul
