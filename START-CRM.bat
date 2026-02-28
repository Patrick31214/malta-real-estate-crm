@echo off
cd /d "%~dp0"

REM ── Placeholder string that must match what .env.example uses ────────────────
REM  If .env.example changes its DB_PASSWORD placeholder, update this line too.
set DB_PASS_PLACEHOLDER=your_password_here

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

echo [1/5] Installing backend dependencies (please wait)...
call npm install
echo.

echo [2/5] Installing frontend dependencies...
if exist "client\package.json" (
    cd client
    call npm install
    cd ..
    echo [OK] Frontend dependencies installed.
) else (
    echo [SKIP] No client\package.json found - skipping frontend install.
)
echo.

echo [3/5] Checking configuration file...
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

    REM Block if DB_PASSWORD is still the placeholder value — the server
    REM will crash immediately with "password authentication failed" if this
    REM is not changed.
    findstr /C:"DB_PASSWORD=%DB_PASS_PLACEHOLDER%" .env >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo ============================================================
        echo   [X] ACTION NEEDED — DB_PASSWORD not set
        echo.
        echo   The file ".env" still has the placeholder password.
        echo   The backend server will crash until you fix this.
        echo.
        echo   HOW TO FIX:
        echo     1. Open ".env" in Notepad (it is in this same folder).
        echo     2. Find this line:   DB_PASSWORD=%DB_PASS_PLACEHOLDER%
        echo     3. Replace  %DB_PASS_PLACEHOLDER%  with the password you
        echo        chose when you installed PostgreSQL.
        echo        Example:  DB_PASSWORD=MyPostgresPass123
        echo     4. Save the file and double-click START-CRM.bat again.
        echo.
        echo   If you do not know your PostgreSQL password, see
        echo   STEP-BY-STEP.txt under COMMON PROBLEMS.
        echo ============================================================
        echo.
        pause
        exit /b 1
    )
)
echo.

REM ── Self-heal: silently remove sequelize.sync() which causes the createdAt crash ─
REM    This patch is idempotent — it is a no-op when the line is already absent.
set "_HPS=%TEMP%\malta-crm-heal.ps1"
echo if (Test-Path 'src\config\database.js') {  > "%_HPS%"
echo   $f = [IO.Path]::GetFullPath('src\config\database.js') >> "%_HPS%"
echo   $c = [IO.File]::ReadAllText($f) >> "%_HPS%"
echo   $c = $c -replace '(?m)^^[ \t]*// Sync models with database.*[\r\n]+', '' >> "%_HPS%"
echo   $c = $c -replace '(?m)^^[ \t]*// or drop existing ones.*[\r\n]+', '' >> "%_HPS%"
echo   $c = $c -replace '(?m)^^[ \t]*await sequelize[.]sync[(][)];.*[\r\n]+', '' >> "%_HPS%"
echo   $c = $c -replace '(?m)^^[ \t]*console[.]log.*Database models synchronized.*[\r\n]+', '' >> "%_HPS%"
echo   [IO.File]::WriteAllText($f, $c) >> "%_HPS%"
echo } >> "%_HPS%"
powershell -NoProfile -ExecutionPolicy Bypass -File "%_HPS%" >nul 2>nul
del /f /q "%_HPS%" >nul 2>nul

echo [4/5] Checking PostgreSQL and setting up the database...

REM  Read DB_PORT from .env so the check uses the same port as the application.
REM  Falls back to 5432 (the PostgreSQL default) if DB_PORT is not set.
for /f "usebackq tokens=*" %%V in (`powershell -NoProfile -Command ^
  "$l=(Get-Content '.env' -ErrorAction SilentlyContinue) -match '^DB_PORT\s*='; if ($l) { (($l -split '\s*=\s*',2)[1]).Trim() } else { '5432' }"`) do set DB_PORT=%%V
if not defined DB_PORT set DB_PORT=5432
REM  Ensure DB_PORT is numeric; fall back to 5432 if not (e.g. malformed .env).
echo %DB_PORT%| findstr /R "^[0-9][0-9]*$" >nul 2>nul
if %ERRORLEVEL% NEQ 0 set DB_PORT=5432

REM  Test whether PostgreSQL is listening on the configured port.
powershell -NoProfile -Command ^
  "try { $c=New-Object Net.Sockets.TcpClient; $c.Connect('127.0.0.1',%DB_PORT%); $c.Close(); exit 0 } catch { exit 1 }" ^
  >nul 2>nul

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ============================================================
    echo   [X] PostgreSQL is NOT running on port %DB_PORT%
    echo.
    echo   The CRM needs PostgreSQL to store its data.
    echo   Without it the server will crash immediately.
    echo.
    echo   HOW TO FIX:
    echo.
    echo   If PostgreSQL IS installed but not running:
    echo     1. Press Win+R, type  services.msc  and click OK.
    echo     2. Find "PostgreSQL" in the list (e.g. postgresql-x64-16).
    echo     3. Right-click it and choose "Start".
    echo     4. Wait 5 seconds, then double-click START-CRM.bat again.
    echo.
    echo   If PostgreSQL is NOT installed yet:
    echo     1. Go to: https://www.postgresql.org/download/windows/
    echo     2. Download and install it.  Write down the password you set.
    echo     3. Open .env in Notepad and set  DB_PASSWORD=^<your password^>
    echo     4. Restart your computer, then double-click START-CRM.bat again.
    echo.
    echo   See STEP-BY-STEP.txt for detailed instructions.
    echo ============================================================
    echo.
    pause
    exit /b 1
)
echo [OK] PostgreSQL is running on port %DB_PORT%.
echo.

call node scripts/create-database.js
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Could not create/verify the CRM database.
    echo.
    echo   This almost always means the DB_PASSWORD in .env is wrong.
    echo   HOW TO FIX:
    echo     1. Open ".env" in Notepad.
    echo     2. Find the line:  DB_PASSWORD=
    echo     3. Make sure the value is EXACTLY your PostgreSQL password.
    echo     4. Save ".env" and double-click START-CRM.bat again.
    echo.
    pause
    exit /b 1
)
call npm run db:migrate
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Database migration failed. Check the message above.
    echo         If this is a fresh install, try:  npm run db:fresh
    echo.
    pause
    exit /b 1
)
echo [OK] Database is up to date.
echo.
echo  TIP: First time running? Seed sample data with:
echo       npm run db:seed
echo  (Run that once in a separate Command Prompt — skip if you already have data.)
echo.

echo [5/5] Opening frontend in a new window (http://localhost:3000)...
start "Malta CRM - Frontend" /D "%~dp0" cmd /k npm run client:dev
echo.
echo ============================================================
echo   Backend is starting. Your browser will open at:
echo   http://localhost:3000
echo.
echo   To STOP: press Ctrl+C in this window, then close the other window.
echo ============================================================
echo.

REM Open the browser after 12 seconds to give Vite time to compile.
REM Uses a hidden PowerShell window so this window stays open for the backend.
start "" /b powershell -WindowStyle Hidden -NoProfile -Command "Start-Sleep 12; Start-Process 'http://localhost:3000'"

call npm run dev
