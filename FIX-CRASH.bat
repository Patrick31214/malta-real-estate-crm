@echo off
REM ============================================================================
REM  FIX-CRASH.bat  —  Fix the "createdAt contains null values" startup crash
REM
REM  USE THIS FILE when START-CRM.bat (or the CRM server window) shows:
REM    "column 'createdAt' of relation 'users' contains null values"
REM
REM  HOW TO GET THIS FILE (if it is not already in your CRM folder):
REM    1. Open your browser and go to:
REM       https://github.com/Patrick31214/malta-real-estate-crm
REM    2. Click on  FIX-CRASH.bat  in the file list
REM    3. Click the download button (or click "Raw" then press Ctrl+S)
REM    4. Save it into the same folder as START-CRM.bat
REM    5. Double-click  FIX-CRASH.bat
REM ============================================================================

cd /d "%~dp0"

echo.
echo ============================================================
echo   Malta CRM — Fix Database Startup Crash
echo ============================================================
echo.
echo   This tool fixes the error:
echo     column 'createdAt' of relation 'users' contains null values
echo.

REM ── Safety: must be in the correct project folder ────────────────────────────
if not exist "src\config\database.js" (
    echo   [X] src\config\database.js not found here.
    echo.
    echo   You must run this file from INSIDE the malta-real-estate-crm folder
    echo   (the same folder as START-CRM.bat, package.json, and the src folder).
    echo.
    pause
    exit /b 1
)

if not exist ".env" (
    echo   [X] .env file not found.
    echo.
    echo   1. Copy .env.example to .env
    echo   2. Open .env in Notepad and set DB_PASSWORD to your PostgreSQL password
    echo   3. Then double-click FIX-CRASH.bat again
    echo.
    pause
    exit /b 1
)

REM ── Block if DB_PASSWORD is still placeholder ─────────────────────────────────
findstr /C:"DB_PASSWORD=your_password_here" .env >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo   [X] DB_PASSWORD in .env is still set to the placeholder value.
    echo.
    echo   HOW TO FIX:
    echo     1. Open .env in Notepad
    echo     2. Find the line:  DB_PASSWORD=your_password_here
    echo     3. Replace  your_password_here  with your actual PostgreSQL password
    echo     4. Save .env, then double-click FIX-CRASH.bat again
    echo.
    pause
    exit /b 1
)

REM ── Step 1: Patch database.js — remove the sequelize.sync() call ─────────────
echo [1/2] Patching database.js ...
echo   (Removes the line that causes the startup crash.)
echo.

REM  Write the patch script to a temporary .ps1 file so each step is clear.
REM  (PowerShell variables do not persist across separate -Command calls, so we
REM   must write a script file rather than calling powershell multiple times.)
set "_PS1=%TEMP%\malta-fix-db-%RANDOM%.ps1"
echo $f = [IO.Path]::GetFullPath('src\config\database.js') > "%_PS1%"
echo if (-not (Test-Path $f)) { Write-Error 'database.js not found'; exit 1 } >> "%_PS1%"
echo $c = [IO.File]::ReadAllText($f) >> "%_PS1%"
echo $before = $c.Length >> "%_PS1%"
REM  Remove the 4 lines that trigger the ALTER TABLE crash:
REM    1. comment: // Sync models with database ...
REM    2. comment: // or drop existing ones ...
REM    3. call:    await sequelize.sync();
REM    4. log:     console.log('... Database models synchronized ...')
REM  Note: ^^  in bat becomes ^  in the .ps1 file (^^ is cmd escape for ^)
echo $c = $c -replace '(?m)^^[ \t]*// Sync models with database.*[\r\n]+', '' >> "%_PS1%"
echo $c = $c -replace '(?m)^^[ \t]*// or drop existing ones.*[\r\n]+', '' >> "%_PS1%"
echo $c = $c -replace '(?m)^^[ \t]*await sequelize[.]sync[(][)];.*[\r\n]+', '' >> "%_PS1%"
echo $c = $c -replace '(?m)^^[ \t]*console[.]log.*Database models synchronized.*[\r\n]+', '' >> "%_PS1%"
echo [IO.File]::WriteAllText($f, $c) >> "%_PS1%"
echo if ($c.Length -lt $before) { Write-Host '  [FIXED] Removed sequelize.sync() from database.js.' } else { Write-Host '  [OK] database.js was already clean - no changes needed.' } >> "%_PS1%"

powershell -NoProfile -ExecutionPolicy Bypass -File "%_PS1%"
set _PATCH_ERR=%ERRORLEVEL%
del /f /q "%_PS1%" >nul 2>nul

if %_PATCH_ERR% NEQ 0 (
    echo.
    echo   [X] Could not patch database.js automatically.
    echo.
    echo   MANUAL FIX — open src\config\database.js in Notepad and DELETE
    echo   these four lines (they may not all be present):
    echo.
    echo     // Sync models with database ...
    echo     // or drop existing ones ...
    echo     await sequelize.sync();
    echo     console.log('... Database models synchronized ...');
    echo.
    echo   Save the file, then double-click START-CRM.bat.
    echo.
    pause
    exit /b 1
)
echo.

REM ── Step 2: Check PostgreSQL then run migrations ─────────────────────────────
echo [2/2] Checking PostgreSQL and running database migrations...
echo.

REM  Read DB_PORT from .env; fall back to 5432 if not set or not numeric.
for /f "usebackq tokens=*" %%V in (`powershell -NoProfile -Command ^
  "$l=(Get-Content '.env' -ErrorAction SilentlyContinue) -match '^DB_PORT\s*='; if ($l) { (($l -split '\s*=\s*',2)[1]).Trim() } else { '5432' }"`) do set DB_PORT=%%V
if not defined DB_PORT set DB_PORT=5432
echo %DB_PORT%| findstr /R "^[0-9][0-9]*$" >nul 2>nul
if %ERRORLEVEL% NEQ 0 set DB_PORT=5432

REM  Test that PostgreSQL is listening.
powershell -NoProfile -Command ^
  "try { $c=New-Object Net.Sockets.TcpClient; $c.Connect('127.0.0.1',%DB_PORT%); $c.Close(); exit 0 } catch { exit 1 }" ^
  >nul 2>nul

if %ERRORLEVEL% NEQ 0 (
    echo   [!] PostgreSQL is not running on port %DB_PORT%.
    echo.
    echo   HOW TO FIX:
    echo     1. Press Win+R → type  services.msc  → click OK
    echo     2. Find "PostgreSQL" (e.g. postgresql-x64-16) in the list
    echo     3. Right-click → Start
    echo     4. Wait 5 seconds, then double-click FIX-CRASH.bat again
    echo.
    pause
    exit /b 1
)

call npm run db:migrate
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo   [X] Database migration failed.  Check the error above.
    echo.
    echo   Common causes:
    echo     - A migration SQL error (check the line starting with "ERROR:")
    echo     - Wrong DB_PASSWORD (double-check .env has the correct password)
    echo.
    echo   The database.js patch WAS applied, so the startup crash is fixed.
    echo   But you may need to resolve the migration error before the CRM
    echo   will work correctly.  See STEP-BY-STEP.txt for help.
    echo.
    pause
    exit /b 1
)

echo.
echo ============================================================
echo   FIX APPLIED!
echo ============================================================
echo.
echo   The startup crash has been patched.
echo.
echo   NEXT STEP:
echo     Double-click  START-CRM.bat  to launch the CRM.
echo     Your browser will open at  http://localhost:3000
echo.
echo   Login with:
echo     Email:    admin@maltarealestate.com
echo     Password: Password123!
echo     (Or your own credentials if you set up a different account.)
echo.
echo ============================================================
echo.
pause
