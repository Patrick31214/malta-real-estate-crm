@echo off
REM Malta Real Estate CRM - Setup Checker AND Launcher for Windows
REM PURPOSE: Verify all required software is installed, then start the CRM.
REM NOTE:    If this is your first time, read STEP-BY-STEP.txt first.

REM Move to the folder where this script lives so relative paths work correctly.
cd /d "%~dp0"

echo.
echo ============================================================
echo   Malta Real Estate CRM - Setup Checker ^& Launcher
echo ============================================================
echo.
echo   This script will:
echo     1. Check that all required software is installed
echo     2. Build the CRM pages (first time only, takes 2-3 min)
echo     3. Start the CRM in a second window
echo.
echo   If a check FAILS the window will STAY OPEN and tell you
echo   exactly what to install and how.
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
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('npm --version') do echo   [OK] npm %%i is installed.
)
echo.

REM ── CHECK 3: PostgreSQL (warning only - service may run without psql in PATH) ──
echo [CHECK 3/4] PostgreSQL (database)...
where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo   [!] NOTE: PostgreSQL command-line tool (psql) is not in PATH.
    echo.
    echo   This is OK if the PostgreSQL SERVICE is running.
    echo   The CRM will tell you if it cannot connect when it starts.
    echo.
    echo   If the CRM fails to connect to the database, install PostgreSQL:
    echo     1. Open: https://www.postgresql.org/download/windows/
    echo     2. Click "Download the installer" (from EDB).
    echo     3. Download latest version for Windows x86-64.
    echo     4. Run installer. Write down your password - you need it for .env
    echo     5. Restart your computer. Then run this script again.
    echo.
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
        echo.
        echo   HOW TO FIX:
        echo     1. Open the file ".env" with Notepad.
        echo     2. Find: JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
        echo        Replace everything after = with any long random text.
        echo        Example: JWT_SECRET=someRandomLettersAndNumbers123!abc
        echo     3. Do the same for JWT_REFRESH_SECRET.
        echo     4. Make sure DB_PASSWORD= has your PostgreSQL password.
        echo     5. Save the file, then run this script again.
        echo.
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
        echo     5. Save the file, then run this script again.
        echo.
        pause
        exit /b 1
    ) else (
        echo   [X] Neither .env nor .env.example found.
        echo       Make sure you are running this from inside the
        echo       malta-real-estate-crm folder (it must contain package.json).
        pause
        exit /b 1
    )
)
echo.

REM ── ALL CHECKS DONE - now build and start the CRM ────────────────────────────
echo ============================================================
echo   [OK] All checks complete!  Now starting the CRM...
echo ============================================================
echo.

REM Install backend packages if needed.
echo [LAUNCH 1/3] Installing backend packages (if not already installed)...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] npm install failed.
    echo         Check your internet connection and try again.
    pause
    exit /b 1
)
echo.

REM Build the React CRM interface.
echo [LAUNCH 2/3] Building the CRM interface...
if exist "client\package.json" (
    if not exist "client\node_modules" (
        echo   Installing interface packages for the first time...
        echo   Please wait -- this can take 2-3 minutes. Do NOT close this window.
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
    )
    call npm run client:build
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo [ERROR] Failed to build the CRM interface.
        echo         Common causes:
        echo           - Node.js version too old (need v16+). Check: node --version
        echo           - Not enough disk space (need 500 MB free).
        echo           - Try deleting client\node_modules and running again.
        echo.
        pause
        exit /b 1
    )
    echo [OK] CRM interface built.
) else (
    echo [SKIP] No client\package.json found. Starting server without frontend build.
    echo        To see the full CRM Login Page, you may need to re-download the
    echo        full project ZIP from the GitHub repository.
)
echo.

REM Start server in a dedicated named window.
echo [LAUNCH 3/3] Launching CRM server...
echo.

REM Open a new window titled "Malta CRM Server - DO NOT CLOSE".
REM /k keeps the window open so error output is visible if the server crashes.
REM NODE_ENV=production is set inside the new window so the server serves
REM the React pages we just built instead of the raw API JSON.
start "Malta CRM Server - DO NOT CLOSE" cmd /k "set NODE_ENV=production && npm start"

REM Open the browser after 8 seconds - enough time for Node to connect to
REM PostgreSQL and begin listening on port 3001 on a typical machine.
start "" /b powershell -WindowStyle Hidden -NoProfile -Command "Start-Sleep 8; Start-Process 'http://localhost:3001'"

echo.
echo ============================================================
echo.
echo   YOUR CRM IS NOW STARTING UP!
echo.
echo   1. A second black window opened titled:
echo        "Malta CRM Server - DO NOT CLOSE"
echo      ^> KEEP THAT WINDOW OPEN.  It runs the CRM.
echo      ^> Closing it will STOP the CRM.
echo.
echo   2. Your browser will open in about 8 seconds at:
echo        http://localhost:3001
echo      You will see a LOGIN PAGE with Email and Password.
echo.
echo   3. Default login (if you loaded sample data):
echo        Email:    admin@maltarealestate.com
echo        Password: Password123!
echo.
echo   4. To STOP the CRM: close the "Malta CRM Server" window.
echo.
echo   5. Browser did not open? Type this in your browser:
echo        http://localhost:3001
echo.
echo ============================================================
echo.
echo   This window is no longer needed.
echo   Press any key to close it. The CRM will keep running.
echo.
pause
