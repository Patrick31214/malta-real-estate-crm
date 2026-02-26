@echo off
cd /d "%~dp0"

echo.
echo ============================================================
echo   Malta Real Estate CRM - Starting Up
echo ============================================================
echo.
echo If this is your first time, read STEP-BY-STEP.txt first.
echo.

if not exist "package.json" (
    echo [ERROR] Wrong folder! package.json not found in %CD%
    echo.
    echo This script must be run from inside the malta-real-estate-crm folder.
    echo The correct path should contain: package.json
    echo.
    pause
    exit /b 1
)

echo [1/3] Installing backend dependencies (please wait)...
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
        copy .env.example .env >nul
        if %ERRORLEVEL% NEQ 0 (
            echo [ERROR] Could not create .env - check folder permissions.
            pause
            exit /b 1
        )
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
echo ============================================================
echo   Backend is starting. Your browser will open at:
echo   http://localhost:3000
echo.
echo   To STOP: press Ctrl+C in this window, then close the other window.
echo ============================================================
echo.
call npm run dev
