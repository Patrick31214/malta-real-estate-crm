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

    REM Check for the unchanged DB_PASSWORD placeholder.
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

    REM Warn about unchanged JWT secrets (non-fatal - CRM works but is less secure).
    findstr /C:"JWT_SECRET=your_super_secret" .env >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo   [!] WARNING: JWT_SECRET in .env is still the placeholder value.
        echo       The CRM will start but anyone who reads this file could
        echo       forge login tokens.  Please change it before real use:
        echo         Open .env in Notepad and replace the JWT_SECRET= value
        echo         with any long random text (e.g. 32+ random characters).
        echo       Also replace JWT_REFRESH_SECRET= with different random text.
        echo.
    )
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

REM ── STEP 4: Check PostgreSQL, then start the CRM server ─────────────────────
echo [4/4] Checking PostgreSQL and launching CRM server...
echo.

REM  Read DB_PORT from .env so the check uses the same port as the application.
REM  Uses PowerShell to parse the value robustly (handles whitespace, no comments).
REM  Falls back to 5432 (the PostgreSQL default) if DB_PORT is not set.
for /f "usebackq tokens=*" %%V in (`powershell -NoProfile -Command ^
  "$l=(Get-Content '.env' -ErrorAction SilentlyContinue) -match '^DB_PORT\s*='; if ($l) { (($l -split '\s*=\s*',2)[1]).Trim() } else { '5432' }"`) do set DB_PORT=%%V
if not defined DB_PORT set DB_PORT=5432

REM  Test whether PostgreSQL is listening on the configured port.
REM  We use PowerShell TcpClient because it is available on all modern Windows.
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
echo   Browser did not open? Type this in your browser:
echo        http://localhost:3001
echo.
echo ============================================================
echo.
echo   Press any key to close THIS setup window.
echo   (The CRM keeps running in the "Malta CRM Server" window.)
echo.

exit /b 0
