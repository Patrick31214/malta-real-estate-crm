@echo off
REM ============================================================================
REM  Malta Real Estate CRM - Windows Setup & Launcher
REM  Double-click this file to install, build, and start the CRM.
REM ============================================================================

REM ── Outer wrapper: guarantees this window NEVER closes without a pause ───────
call :main
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ============================================================
    echo   [!]  Something went wrong.
    echo   Read the MESSAGES ABOVE to see what needs to be fixed.
    echo   Then double-click this file again.
    echo ============================================================
)
echo.
echo Press any key to close this window...
pause >nul
exit /b

REM ============================================================================
REM  :main  -  All setup and launch logic.
REM ============================================================================
:main

cd /d "%~dp0"

echo.
echo ============================================================
echo   Malta Real Estate CRM - Windows Setup ^& Launcher
echo ============================================================
echo.

REM ── Safety: make sure we are in the correct folder ──────────────────────────
if not exist "package.json" (
    echo   [X] ERROR: package.json not found in:
    echo       %CD%
    echo.
    echo   This usually means you are running the script from inside
    echo   a ZIP archive without extracting it first.
    echo.
    echo   HOW TO FIX:
    echo     1. Right-click the ZIP file and choose "Extract All"
    echo     2. Open the EXTRACTED malta-real-estate-crm folder
    echo     3. Double-click start-windows.bat again
    echo.
    exit /b 1
)

REM ── STEP 1: Install backend packages ────────────────────────────────────────
echo [1/4] Installing backend packages...
echo   (first run may take a minute - please wait)
echo.
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo   [X] npm install failed.
    echo.
    echo   Common causes:
    echo     - No internet connection.
    echo     - Node.js not installed.  Download from: https://nodejs.org/
    echo     - Antivirus blocking npm. Try disabling it temporarily.
    echo.
    exit /b 1
)
echo   [OK] Backend packages installed.
echo.

REM ── STEP 2: Configuration file (.env) ───────────────────────────────────────
echo [2/4] Checking configuration file...
if not exist ".env" (
    if exist ".env.example" (
        copy .env.example .env >nul
        echo   [OK] Created .env from template.
        echo.
        echo ============================================================
        echo   ACTION NEEDED:
        echo.
        echo   Open the file ".env" in Notepad and fill in:
        echo.
        echo     DB_PASSWORD=        ^<-- your PostgreSQL password
        echo     JWT_SECRET=         ^<-- replace with any long random text
        echo     JWT_REFRESH_SECRET= ^<-- replace with any long random text
        echo.
        echo   Save the file, then double-click start-windows.bat again.
        echo ============================================================
        echo.
        exit /b 1
    ) else (
        echo   [X] No .env file found and no .env.example template either.
        echo       Make sure you are running this from inside the
        echo       malta-real-estate-crm folder.
        exit /b 1
    )
) else (
    echo   [OK] .env file exists.
)
echo.

REM ── STEP 3: Build the React CRM interface ───────────────────────────────────
echo [3/4] Building the CRM interface...
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
        echo     - Not enough disk space (need ~500 MB free).
        echo     - Try: delete client\node_modules and run again.
        echo.
        exit /b 1
    )
    echo   [OK] CRM interface built.
) else (
    echo   [SKIP] client\package.json not found.
    echo          Re-download the full project ZIP if this is unexpected.
)
echo.

REM ── STEP 4: Start the CRM server in a dedicated window ──────────────────────
echo [4/4] Launching CRM server...
echo.

REM  /k keeps the server window open so you can read errors if the server stops.
REM  NODE_ENV=production tells the server to serve the React pages we just built.
start "Malta CRM Server - DO NOT CLOSE" /D "%CD%" cmd /k "set NODE_ENV=production && npm start"

REM  Open the browser after 8 seconds - enough time for Node.js to connect to
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
echo          Closing it will STOP the CRM.
echo.
echo   2. Your browser will open in about 8 seconds at:
echo        http://localhost:3001
echo.
echo      You will see a LOGIN PAGE.
echo.
echo   3. Default login (if you loaded the sample data):
echo        Email:    admin@maltarealestate.com
echo        Password: Password123!
echo.
echo   4. To STOP the CRM: close the Malta CRM Server window.
echo.
echo   5. Browser did not open? Type this in your browser:
echo        http://localhost:3001
echo.
echo ============================================================
echo.
echo   This SETUP window is no longer needed.
echo   The CRM keeps running in the other window.
echo.

exit /b 0
