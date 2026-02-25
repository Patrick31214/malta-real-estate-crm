@echo off
REM Malta Real Estate CRM - Windows Startup Script
REM Double-click this file from the malta-real-estate-crm folder.

cd /d "%~dp0"

echo.
echo ============================================================
echo   Malta Real Estate CRM - Windows Startup
echo ============================================================
echo.

if not exist "package.json" (
    echo [ERROR] package.json not found in %CD%
    echo.
    echo Run this script from inside the malta-real-estate-crm folder.
    echo.
    pause
    exit /b 1
)

REM To get the latest code, open a separate Command Prompt and run: git pull

echo [1/3] Installing backend dependencies...
call npm install
echo.

echo [2/3] Installing frontend dependencies...
if exist "client\package.json" (
    cd client
    call npm install
    cd ..
    echo [OK] Frontend dependencies installed.
) else (
    echo [SKIP] No client\package.json found - skipping frontend install.
)
echo.

echo [3/3] Checking configuration file...
if not exist ".env" (
    if exist ".env.example" (
        copy .env.example .env
        echo [OK] Created .env from .env.example.
        echo.
        echo  IMPORTANT: Open .env in Notepad and fill in your DB_PASSWORD
        echo      notepad .env
        echo.
        pause
    ) else (
        echo [WARN] No .env file found. Create one based on .env.example.
    )
) else (
    echo [OK] .env file exists.
)
echo.

echo Opening frontend in a new window (http://localhost:3000)...
start "Malta CRM - Frontend" /D "%~dp0" cmd /k npm run client:dev
echo.
echo Starting backend - press Ctrl+C in this window to stop...
echo.
call npm run dev

