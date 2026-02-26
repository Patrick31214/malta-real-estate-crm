@echo off
REM Malta Real Estate CRM - Setup Checker for Windows
REM PURPOSE: Check that all required software is installed before starting the CRM.
REM NOTE:    This script only CHECKS your setup. To START the CRM, use start-windows.bat instead.

REM Move to the folder where this script lives so relative paths work correctly.
cd /d "%~dp0"

echo.
echo ============================================================
echo   Malta Real Estate CRM - Setup Checker
echo ============================================================
echo.
echo   This script checks that all required software is installed.
echo   It does NOT start the CRM.
echo   To START the CRM use:  start-windows.bat
echo.
echo   If a check FAILS the window will STAY OPEN so you can
echo   read what needs to be installed.
echo.
echo ============================================================
echo.

REM ── CHECK 1: Node.js ──────────────────────────────────────────────────────────
echo [CHECK 1/4] Node.js...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo   [X] Node.js is NOT installed on this computer.
    echo.
    echo   Node.js is a program the CRM needs to run.
    echo.
    echo   HOW TO FIX:
    echo     1. Open your browser and go to:  https://nodejs.org/
    echo     2. Click the big green "LTS" download button.
    echo     3. Run the installer and click Next on everything.
    echo     4. Restart your computer after it finishes.
    echo     5. Then run this script again.
    echo.
    echo   Press any key to close this window.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do echo   [OK] Node.js %%i is installed.
)
echo.

REM ── CHECK 2: npm ──────────────────────────────────────────────────────────────
echo [CHECK 2/4] npm (package manager)...
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo   [X] npm is NOT found.
    echo.
    echo   npm is installed automatically with Node.js.
    echo   This usually means Node.js was not installed correctly.
    echo.
    echo   HOW TO FIX:
    echo     1. Go to https://nodejs.org/ and reinstall Node.js (LTS version).
    echo     2. Restart your computer after installing.
    echo     3. Run this script again.
    echo.
    echo   Press any key to close this window.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('npm --version') do echo   [OK] npm %%i is installed.
)
echo.

REM ── CHECK 3: PostgreSQL ───────────────────────────────────────────────────────
echo [CHECK 3/4] PostgreSQL (database)...
where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo   [X] PostgreSQL is NOT installed (or not found).
    echo.
    echo   PostgreSQL is the database where the CRM stores all your
    echo   properties, owners and contacts. The CRM needs it to work.
    echo.
    echo   HOW TO FIX:
    echo     1. Open your browser and go to:
    echo           https://www.postgresql.org/download/windows/
    echo     2. Click "Download the installer" (from EDB).
    echo     3. Download the latest version for Windows x86-64.
    echo     4. Run the installer. When asked for a password, write it down -
    echo        you will need it later when editing the .env file.
    echo     5. On the "Select Components" screen, make sure
    echo        "Command Line Tools" is ticked.
    echo     6. Finish the installation, then RESTART your computer.
    echo     7. Run this script again to confirm everything is installed.
    echo.
    echo   If you already installed PostgreSQL but still see this message:
    echo     - Restart your computer and try again.
    echo     - If it still fails, see STEP-BY-STEP.txt for more help.
    echo.
    echo   Press any key to close this window.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('psql --version') do echo   [OK] PostgreSQL - %%i is installed.
)
echo.

REM ── CHECK 4: .env configuration file ─────────────────────────────────────────
echo [CHECK 4/4] Configuration file (.env)...
if exist ".env" (
    echo   [OK] .env file exists.
    findstr /C:"JWT_SECRET=your_super_secret" .env >nul
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo   [!] WARNING: Your .env file still has placeholder secrets.
        echo       Please edit it before starting the CRM.
        echo.
        echo   HOW TO FIX:
        echo     1. Open the file ".env" with Notepad.
        echo     2. Find the line: JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
        echo     3. Replace everything after the = with any long random text.
        echo        Example: JWT_SECRET=someRandomLettersAndNumbers123!abc
        echo     4. Do the same for JWT_REFRESH_SECRET.
        echo     5. Also make sure DB_PASSWORD= has your PostgreSQL password.
        echo     6. Save the file.
    ) else (
        echo   [OK] JWT secrets appear to be configured.
    )
) else (
    if exist ".env.example" (
        copy .env.example .env >nul
        echo   [OK] .env file created from template.
        echo.
        echo   IMPORTANT - edit .env before starting the CRM:
        echo     1. Open the file ".env" with Notepad.
        echo     2. Find DB_PASSWORD= and type your PostgreSQL password after the =
        echo     3. Find JWT_SECRET= and replace the placeholder with random text.
        echo     4. Do the same for JWT_REFRESH_SECRET.
        echo     5. Save the file.
    ) else (
        echo   [X] Neither .env nor .env.example found.
        echo       Make sure you are running this from inside the malta-real-estate-crm folder.
    )
)
echo.

REM ── ALL CHECKS PASSED ─────────────────────────────────────────────────────────
echo ============================================================
echo   [OK] All required software is installed!
echo.
echo   NEXT STEP:
echo     Double-click  start-windows.bat  to start the CRM.
echo     Your browser will open at http://localhost:3001
echo     and show you the CRM Login Page.
echo.
echo   Press any key to close this window.
echo ============================================================
echo.
pause
