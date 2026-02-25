@echo off
REM Malta Real Estate CRM - Windows Startup Script
REM Double-click this file from the malta-real-estate-crm folder to set up and run the CRM.

REM ── Change to the folder this script lives in ──────────────────────────────
cd /d "%~dp0"

echo.
echo ============================================================
echo   Malta Real Estate CRM - Windows Setup ^& Startup
echo ============================================================
echo   Project folder: %CD%
echo ============================================================
echo.

REM ── Sanity-check: make sure we're in the right directory ──────────────────
if not exist "package.json" (
    echo [ERROR] package.json not found in %CD%
    echo.
    echo This script must be run from inside the malta-real-estate-crm folder.
    echo Right-click start-windows.bat and choose "Run as administrator", or
    echo open a Command Prompt, cd into the project folder, then run:
    echo   start-windows.bat
    echo.
    pause
    exit /b 1
)

REM ── Step 1: Pull latest code ───────────────────────────────────────────────
echo [1/4] Pulling latest code from GitHub...
git checkout -- package-lock.json 2>nul
git pull
echo.

REM ── Step 2: Install backend dependencies ──────────────────────────────────
echo [2/4] Installing backend dependencies (npm install)...
call npm install
echo.

REM ── Step 3: Install frontend dependencies ─────────────────────────────────
echo [3/4] Installing frontend dependencies...
if exist "client\package.json" (
    cd client
    call npm install
    cd ..
    echo [OK] Frontend dependencies installed.
) else (
    echo [SKIP] No client\package.json found - skipping frontend install.
)
echo.

REM ── Step 4: Check .env ────────────────────────────────────────────────────
echo [4/4] Checking configuration file...
if not exist ".env" (
    if exist ".env.example" (
        copy .env.example .env
        echo [OK] Created .env from .env.example.
        echo.
        echo  *** IMPORTANT: Open .env in Notepad and set your DB_PASSWORD ***
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

REM ── Ready - show frontend instructions BEFORE starting the backend ─────────
echo ============================================================
echo   ACTION REQUIRED - Open a SECOND Command Prompt window NOW:
echo ============================================================
echo.
echo   1. Press Win+R, type cmd, press Enter
echo   2. In the new window, paste these two commands:
echo.
echo        cd /d "%CD%"
echo        npm run client:dev
echo.
echo   3. Wait for: "VITE ready  -  Local: http://localhost:3000/"
echo   4. Open your browser at:   http://localhost:3000
echo ============================================================
echo.
echo   This window will now start the BACKEND server.
echo   Press Ctrl+C here at any time to stop the backend.
echo.
echo   Starting backend...
echo.

REM ── Start the backend server (keeps this window running) ──────────────────
call npm run dev
