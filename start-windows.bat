@echo off
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

echo [1/3] Installing dependencies...
call npm install
echo.

echo [2/3] Checking configuration file...
if not exist ".env" (
    if exist ".env.example" (
        copy .env.example .env >nul
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

echo [3/3] Starting CRM server...
echo.
echo ============================================================
echo.
echo   SERVER IS STARTING - please wait about 20 seconds...
echo.
echo   Your browser will open automatically at http://localhost:3001
echo   If it does not open, type http://localhost:3001 in your browser.
echo.
echo   IMPORTANT: Keep this black window OPEN while using the CRM.
echo              Closing this window will STOP the CRM.
echo.
echo   To stop the CRM: press Ctrl+C in this window.
echo.
echo ============================================================
echo.

REM Open browser after 20 seconds (gives server time to connect to database)
start "" /b powershell -WindowStyle Hidden -NoProfile -Command "Start-Sleep 20; Start-Process 'http://localhost:3001'"

REM Start the server - this keeps running until you press Ctrl+C
call npm start

echo.
echo ============================================================
echo   CRM server has stopped.
echo   You can close this window now.
echo ============================================================
echo.
pause
