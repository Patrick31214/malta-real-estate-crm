@echo off
REM ============================================================================
REM  Malta Real Estate CRM - Windows Launcher
REM  Double-click this file to set up and start the CRM.
REM ============================================================================

REM ── Outer wrapper: guarantees this window NEVER closes without a pause ───────
REM    call :main runs all setup inside a subroutine.
REM    If :main exits with an error code, the message below is shown.
REM    If :main exits normally, the CRM is running and we just pause here.

call :main
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ============================================================
    echo   [!]  Something went wrong.
    echo   Read the MESSAGES ABOVE to see what needs to be fixed.
    echo ============================================================
)
echo.
echo Press any key to close this window...
pause >nul
exit /b

REM ============================================================================
REM  :main  -  All setup and launch logic lives here.
REM            "exit /b 1" returns to the outer wrapper (never closes the window)
REM            "exit /b 0" returns to the outer wrapper (success)
REM ============================================================================
:main

REM Move to the folder where this script lives so relative paths work correctly.
cd /d "%~dp0"

echo.
echo ============================================================
echo   Malta Real Estate CRM - Windows Launcher
echo ============================================================
echo.
echo   This script will:
echo     1. Check that Node.js and npm are installed
echo     2. Create your config file (.env) on first run
echo     3. Install all required packages
echo     4. Build the CRM pages (first time: takes 2-3 min)
echo     5. Start the CRM server in a dedicated window
echo.
echo   IMPORTANT: If a check fails, READ THIS WINDOW - it will
echo   tell you exactly what to install and how to fix it.
echo.
echo ============================================================
echo.

REM ── Safety check: make sure we are in the right folder ───────────────────────
if not exist "package.json" (
    echo   [X] ERROR: package.json not found in:
    echo       %CD%
    echo.
    echo   This usually means one of two things:
    echo.
    echo   1. You are running the script from INSIDE a ZIP archive.
    echo      ZIP archives look like folders but they are NOT extracted.
    echo      HOW TO FIX:
    echo        a. Right-click the ZIP file and choose "Extract All"
    echo        b. Open the EXTRACTED folder
    echo        c. Double-click quick-start.bat again
    echo.
    echo   2. You moved quick-start.bat out of the project folder.
    echo      HOW TO FIX:
    echo        a. Find the malta-real-estate-crm folder
    echo        b. Double-click quick-start.bat from INSIDE that folder
    echo.
    exit /b 1
)

REM ── CHECK 1: Node.js ──────────────────────────────────────────────────────────
echo [CHECK 1/3] Node.js...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo   [X] Node.js is NOT installed on this computer.
    echo.
    echo   Node.js is the program that runs the CRM server.
    echo   Without it, nothing will work.
    echo.
    echo   HOW TO FIX:
    echo     1. Open your browser and go to:  https://nodejs.org/
    echo     2. Click the big green "LTS" button and download it.
    echo     3. Run the installer - click Next on everything.
    echo     4. When it finishes, RESTART your computer.
    echo     5. Then double-click this file again.
    echo.
    exit /b 1
)
for /f "tokens=*" %%V in ('node --version 2^>nul') do echo   [OK] Node.js %%V

REM ── CHECK 2: npm ──────────────────────────────────────────────────────────────
echo [CHECK 2/3] npm...
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo   [X] npm is NOT found.
    echo.
    echo   npm is installed together with Node.js.
    echo   If npm is missing, Node.js was not installed correctly.
    echo.
    echo   HOW TO FIX:
    echo     1. Go to https://nodejs.org/ and reinstall Node.js (LTS version).
    echo     2. RESTART your computer.
    echo     3. Double-click this file again.
    echo.
    exit /b 1
)
for /f "tokens=*" %%V in ('npm --version 2^>nul') do echo   [OK] npm %%V

REM ── CHECK 3: Configuration file (.env) ───────────────────────────────────────
echo [CHECK 3/3] Configuration file (.env)...
if not exist ".env" (
    if exist ".env.example" (
        copy .env.example .env >nul
        echo   [OK] Created .env from template.
        echo.
        echo ============================================================
        echo   ACTION NEEDED before you can use the CRM:
        echo.
        echo   Open the file ".env" in Notepad and fill in:
        echo.
        echo     DB_PASSWORD=        ^<-- your PostgreSQL password
        echo     JWT_SECRET=         ^<-- replace placeholder with any
        echo     JWT_REFRESH_SECRET= ^<-- long random text (both lines)
        echo.
        echo   After saving .env, double-click this file again.
        echo ============================================================
        echo.
        exit /b 1
    ) else (
        echo   [X] No .env or .env.example file found.
        echo       Make sure you are running this from inside the
        echo       malta-real-estate-crm folder.
        exit /b 1
    )
)
echo   [OK] .env file exists.

REM Warn about placeholder secrets (non-fatal - user may have configured already)
findstr /C:"JWT_SECRET=your_super_secret" .env >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo.
    echo   [!] WARNING: Your .env still has placeholder JWT secrets.
    echo       The CRM will start but you should fix this:
    echo         1. Open ".env" in Notepad
    echo         2. Replace JWT_SECRET= and JWT_REFRESH_SECRET= values
    echo            with any long random text.
    echo         3. Also set DB_PASSWORD= to your PostgreSQL password.
    echo.
)
echo.

REM ── STEP 1: Install backend packages ─────────────────────────────────────────
echo ============================================================
echo   Checks passed - installing and launching the CRM...
echo ============================================================
echo.
echo [STEP 1/3] Installing backend packages...
echo   (This may take a minute on first run - please wait)
echo.
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo   [X] npm install failed.
    echo.
    echo   Common causes:
    echo     - No internet connection.  Connect and try again.
    echo     - Antivirus blocking npm.  Try disabling it temporarily.
    echo     - Node.js needs updating.  Get latest LTS from nodejs.org
    echo.
    exit /b 1
)
echo   [OK] Backend packages installed.
echo.

REM ── STEP 2: Build the React CRM interface ────────────────────────────────────
echo [STEP 2/3] Building the CRM interface...
if exist "client\package.json" (
    if not exist "client\node_modules" (
        echo   First-time setup: installing interface packages...
        echo   Please wait - this takes 2-3 minutes.  Do NOT close this window.
        echo.
        cd client
        call npm install
        if %ERRORLEVEL% NEQ 0 (
            echo.
            echo   [X] Failed to install interface packages.
            echo       Check your internet connection and try again.
            cd ..
            exit /b 1
        )
        cd ..
        echo.
    )
    echo   Building interface pages...
    call npm run client:build
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo   [X] Failed to build the CRM interface.
        echo.
        echo   Common causes:
        echo     - Node.js too old (v16+ required).  Check: node --version
        echo     - Disk space low (need ~500 MB free).
        echo     - Try: delete the client\node_modules folder and run again.
        echo.
        exit /b 1
    )
    echo   [OK] CRM interface built.
) else (
    echo   [SKIP] client\package.json not found.
    echo          The CRM server will start but the browser pages may not load.
    echo          Re-download the full project ZIP if this is unexpected.
)
echo.

REM ── STEP 3: Start the CRM server in a dedicated window ───────────────────────
echo [STEP 3/3] Starting the CRM server...
echo.

REM  /k keeps the server window open even if the server crashes,
REM  so you can read any error messages.
REM  NODE_ENV=production tells the server to serve the React pages we just built.
start "Malta CRM Server - DO NOT CLOSE" /D "%CD%" cmd /k "set NODE_ENV=production && npm start"

REM  Open the browser after 8 seconds - gives the server time to connect to
REM  PostgreSQL and start listening on port 3001.
start "" /b powershell -WindowStyle Hidden -NoProfile -Command "Start-Sleep 8; Start-Process 'http://localhost:3001'"

echo.
echo ============================================================
echo.
echo   YOUR CRM IS NOW STARTING UP!
echo.
echo   1. A new black window opened titled:
echo        "Malta CRM Server - DO NOT CLOSE"
echo.
echo      --> KEEP THAT WINDOW OPEN.
echo          It is the engine running your CRM.
echo          Closing it will stop the CRM.
echo.
echo   2. Your browser will open automatically in ~8 seconds at:
echo        http://localhost:3001
echo.
echo      You will see a LOGIN PAGE.
echo.
echo   3. Default login (if you loaded the sample data):
echo        Email:    admin@maltarealestate.com
echo        Password: Password123!
echo.
echo   4. To stop the CRM: close the Malta CRM Server window.
echo.
echo   5. Browser did not open? Enter this in your browser:
echo        http://localhost:3001
echo.
echo ============================================================
echo.
echo   This SETUP window is no longer needed.
echo   The CRM keeps running in the other window.
echo.

exit /b 0
