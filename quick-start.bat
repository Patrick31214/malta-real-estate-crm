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

REM Block if DB_PASSWORD is still the placeholder (server will crash without this).
findstr /C:"DB_PASSWORD=your_password_here" .env >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo.
    echo   [X] DB_PASSWORD in .env is still the placeholder value.
    echo.
    echo   The CRM server needs this to connect to its database.
    echo   Without a correct password the server will crash immediately.
    echo.
    echo   HOW TO FIX:
    echo     1. Open the file ".env" in Notepad.
    echo     2. Find this line:   DB_PASSWORD=your_password_here
    echo     3. Replace  your_password_here  with your PostgreSQL password.
    echo        Example:  DB_PASSWORD=MyPostgresPass123
    echo     4. If you do not know your PostgreSQL password or have not
    echo        installed PostgreSQL yet, see STEP-BY-STEP.txt.
    echo     5. Save .env and double-click this file again.
    echo.
    exit /b 1
)

REM Warn about placeholder JWT secrets (non-fatal - user may have configured already)
findstr /C:"JWT_SECRET=your_super_secret" .env >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo.
    echo   [!] WARNING: Your .env still has placeholder JWT secrets.
    echo       The CRM will start, but you should replace them:
    echo         1. Open ".env" in Notepad
    echo         2. Replace JWT_SECRET= and JWT_REFRESH_SECRET= values
    echo            with any long random text.
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

REM ── STEP 3: Check PostgreSQL, then start the CRM server ─────────────────────
echo [STEP 3/3] Checking PostgreSQL and starting the CRM server...
echo.

REM  Read DB_PORT from .env so the check uses the same port as the application.
REM  Uses PowerShell to parse the value robustly (handles whitespace, no comments).
REM  Falls back to 5432 (the PostgreSQL default) if DB_PORT is not set.
for /f "usebackq tokens=*" %%V in (`powershell -NoProfile -Command ^
  "$l=(Get-Content '.env' -ErrorAction SilentlyContinue) -match '^DB_PORT\s*='; if ($l) { (($l -split '\s*=\s*',2)[1]).Trim() } else { '5432' }"`) do set DB_PORT=%%V
if not defined DB_PORT set DB_PORT=5432

REM  Test whether PostgreSQL is listening on the configured port.
powershell -NoProfile -Command ^
  "try { $c=New-Object Net.Sockets.TcpClient; $c.Connect('127.0.0.1',%DB_PORT%); $c.Close(); exit 0 } catch { exit 1 }" ^
  >nul 2>nul

if %ERRORLEVEL% NEQ 0 (
    echo   [X] PostgreSQL is NOT listening on port %DB_PORT%.
    echo.
    echo   The CRM needs a running PostgreSQL database to work.
    echo   Without it the server window will crash immediately.
    echo.
    echo   HOW TO FIX:
    echo.
    echo   If PostgreSQL is NOT installed:
    echo     1. Download from: https://www.postgresql.org/download/windows/
    echo     2. Run the installer.  Write down the password you choose.
    echo     3. Let the installer start the service automatically.
    echo     4. Open .env in Notepad and set:
    echo          DB_PASSWORD=^<the password you just set^>
    echo     5. RESTART your computer, then run this script again.
    echo.
    echo   If PostgreSQL IS installed but the service is stopped:
    echo     1. Press Win+R, type  services.msc  and click OK.
    echo     2. Find "PostgreSQL" in the list.
    echo     3. Right-click it and choose "Start".
    echo     4. Then run this script again.
    echo.
    echo   If DB_PORT in .env does not match the PostgreSQL service port:
    echo     1. Open .env in Notepad.
    echo     2. Check the line  DB_PORT=  — it must match the port PostgreSQL
    echo        was configured to use during installation (default: 5432).
    echo     3. Save .env and run this script again.
    echo.
    exit /b 1
)
echo   [OK] PostgreSQL is running on port %DB_PORT%.
echo.

REM  Create the CRM database if it does not exist yet.
REM  This is safe to run on every start — it is a no-op when the DB already exists.
echo   Verifying CRM database...
node scripts/create-database.js
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo   [X] Could not create or verify the CRM database.
    echo.
    echo   This almost always means the DB_PASSWORD in .env is wrong.
    echo.
    echo   HOW TO FIX:
    echo     1. Open ".env" in Notepad.
    echo     2. Find this line:  DB_PASSWORD=
    echo        Make sure the value after the = sign is EXACTLY the password
    echo        you chose when you installed PostgreSQL.
    echo     3. Also check:  DB_USER=postgres  (keep this unchanged).
    echo     4. Save ".env" and double-click this file again.
    echo.
    echo   If you have forgotten your PostgreSQL password:
    echo     See STEP-BY-STEP.txt under "COMMON PROBLEMS" for reset instructions.
    echo.
    exit /b 1
)
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
echo   TWO WINDOWS ARE NOW OPEN:
echo.
echo   THIS window (Setup) - no longer needed once the CRM starts.
echo     Pressing any key below ONLY closes THIS window.
echo     The CRM will keep running in the other window.
echo.
echo   THE OTHER window titled "Malta CRM Server - DO NOT CLOSE"
echo     --> KEEP THAT WINDOW OPEN the whole time you use the CRM.
echo     --> Closing it STOPS the CRM.
echo     --> If you see an error there, read it - it will say
echo         what is wrong (usually the database connection).
echo.
echo   YOUR BROWSER will open in about 8 seconds at:
echo        http://localhost:3001
echo   You will see a LOGIN PAGE.
echo.
echo   Default login (if you loaded the sample data):
echo        Email:    admin@maltarealestate.com
echo        Password: Password123!
echo.
echo   Browser did not open? Enter this in your browser:
echo        http://localhost:3001
echo.
echo ============================================================
echo.
echo   This SETUP window is no longer needed.
echo   The CRM keeps running in the other window.
echo.

exit /b 0
