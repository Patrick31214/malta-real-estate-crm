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

echo [1/4] Installing backend dependencies...
call npm install
echo.

echo [2/4] Checking configuration file...
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

echo [3/4] Building the CRM interface (this runs once and may take 2-3 minutes)...
if not exist "client\node_modules" (
    echo     Installing interface packages for the first time...
    echo     Please wait — this can take 2-3 minutes. Do NOT close this window.
    echo.
    cd client
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo [ERROR] Failed to install interface packages.
        echo         Make sure you have an internet connection and try again.
        cd ..
        pause
        exit /b 1
    )
    cd ..
    echo     [OK] Interface packages installed.
    echo.
)
echo     Building CRM interface pages...
call npm run client:build
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Failed to build the CRM interface.
    echo.
    echo         Common causes:
    echo           - Node.js version is too old (need v16 or newer).
    echo             Check your version: node --version
    echo           - A required package failed to install.
    echo             Try deleting the client\node_modules folder and running again.
    echo           - Not enough disk space (need at least 500 MB free).
    echo.
    echo         Look at the red error text above for more details.
    echo         If unsure, copy the error text and ask for help.
    pause
    exit /b 1
)
echo [OK] CRM interface built successfully.
echo.

echo [4/4] Starting CRM server...
echo.
echo ============================================================
echo.
echo   SERVER IS STARTING - please wait about 20 seconds...
echo.
echo   Your browser will open at: http://localhost:3001
echo   You will see a LOGIN PAGE with an email and password form.
echo.
echo   Default login (if you ran the demo data setup):
echo     Email:    admin@maltarealestate.com
echo     Password: Password123!
echo.
echo   IMPORTANT: Keep this black window OPEN while using the CRM.
echo              Closing this window will STOP the CRM.
echo.
echo   To stop the CRM: press Ctrl+C in this window.
echo.
echo ============================================================
echo.

REM Start in production mode so the React CRM interface is served at localhost:3001
set NODE_ENV=production

REM Open browser after 20 seconds (gives server time to start and connect to database)
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
