@echo off
REM Move to the folder where this script lives so all relative paths work correctly.
cd /d "%~dp0"

echo.
echo ============================================================
echo   Malta Real Estate CRM - Windows Setup ^& Launcher
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

REM ── STEP 1: Install backend packages ─────────────────────────────────────────
echo [1/4] Installing backend packages (if not already installed)...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] npm install failed.
    echo         Make sure you have Node.js installed and an internet connection.
    echo         Download Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)
echo.

REM ── STEP 2: Check .env configuration ─────────────────────────────────────────
echo [2/4] Checking configuration file...
if not exist ".env" (
    if exist ".env.example" (
        copy .env.example .env >nul
        echo [OK] Created .env from .env.example.
        echo.
        echo  IMPORTANT: Open the file ".env" in Notepad and fill in:
        echo    - DB_PASSWORD    (your PostgreSQL password)
        echo    - JWT_SECRET     (any long random text)
        echo.
        pause
    ) else (
        echo [WARN] No .env file found. Create one based on .env.example.
    )
) else (
    echo [OK] .env file exists.
)
echo.

REM ── STEP 3: Build the React CRM interface ────────────────────────────────────
echo [3/4] Building the CRM interface...
if not exist "client\node_modules" (
    echo     Installing interface packages for the first time...
    echo     Please wait -- this can take 2-3 minutes. Do NOT close this window.
    echo.
    cd client
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo [ERROR] Failed to install interface packages.
        echo         Check your internet connection and try again.
        cd ..
        pause
        exit /b 1
    )
    cd ..
    echo.
)
call npm run client:build
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Failed to build the CRM interface.
    echo.
    echo         Common causes:
    echo           - Node.js version is too old (need v16 or newer).
    echo             Check: node --version
    echo           - Not enough disk space (need at least 500 MB free).
    echo           - Try deleting client\node_modules and running again.
    echo.
    echo         Copy the red error text above and ask for help if unsure.
    pause
    exit /b 1
)
echo [OK] CRM interface built.
echo.

REM ── STEP 4: Launch server in a dedicated window ───────────────────────────────
echo [4/4] Launching CRM server...
echo.

REM Set production mode so the server serves the React pages we just built.
set NODE_ENV=production

REM Open a new window titled "Malta CRM Server - DO NOT CLOSE".
REM The /k flag keeps it open even if the server stops, so you can see any errors.
start "Malta CRM Server - DO NOT CLOSE" cmd /k "set NODE_ENV=production && npm start"

REM Open the browser after 8 seconds (gives the server time to connect to PostgreSQL).
start "" /b powershell -WindowStyle Hidden -NoProfile -Command "Start-Sleep 8; Start-Process 'http://localhost:3001'"

echo.
echo ============================================================
echo.
echo   YOUR CRM IS NOW STARTING UP!
echo.
echo   1. A second black window just opened titled:
echo        "Malta CRM Server - DO NOT CLOSE"
echo      ^> KEEP THAT WINDOW OPEN.  It is the engine running your CRM.
echo      ^> Closing it will STOP the CRM.
echo.
echo   2. Your browser will open in about 8 seconds at:
echo        http://localhost:3001
echo      You will see a LOGIN PAGE with Email and Password boxes.
echo.
echo   3. Default login credentials (if you loaded the sample data):
echo        Email:    admin@maltarealestate.com
echo        Password: Password123!
echo.
echo   4. To STOP the CRM: close the "Malta CRM Server" window.
echo.
echo   5. If the browser does not open automatically, open it yourself
echo      and type:  http://localhost:3001
echo.
echo ============================================================
echo.
echo   This SETUP window is no longer needed and will close
echo   when you press any key.  The CRM will keep running.
echo.
pause
