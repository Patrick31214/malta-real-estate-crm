@echo off
REM ============================================================================
REM  FIX-SCRIPTS.bat  —  Fix "Missing script: db:fresh" on old local code
REM
REM  PURPOSE:
REM    This file fixes the situation where your local copy of the CRM code
REM    is too old and commands like  npm run db:fresh  do not work.
REM
REM  HOW TO GET THIS FILE:
REM    1. Open your browser and go to:
REM       https://raw.githubusercontent.com/Patrick31214/malta-real-estate-crm/main/FIX-SCRIPTS.bat
REM    2. Press Ctrl+S (Save) and save the file into your CRM folder:
REM          C:\Users\USER\malta-crm\malta-real-estate-crm
REM       (Replace USER with your Windows username.)
REM    3. Double-click FIX-SCRIPTS.bat from inside that folder.
REM
REM  WHAT IT DOES:
REM    - Downloads the latest package.json from GitHub
REM    - Downloads DOWNLOAD-LATEST.bat (for future full updates)
REM    - Runs npm install
REM    - Your .env file is NEVER touched
REM ============================================================================

cd /d "%~dp0"

echo.
echo ============================================================
echo   Malta CRM — Fix Missing Scripts
echo ============================================================
echo.

REM ── Safety check ─────────────────────────────────────────────────────────────
if not exist "package.json" (
    echo   [X] package.json not found here.
    echo.
    echo   You must save this file INSIDE the malta-real-estate-crm folder
    echo   (the same folder that contains package.json, start-windows.bat, etc.)
    echo.
    echo   Example correct path:
    echo       C:\Users\USER\malta-crm\malta-real-estate-crm\FIX-SCRIPTS.bat
    echo   (Replace USER with your Windows username.)
    echo.
    pause
    exit /b 1
)

REM ── Check internet connection ─────────────────────────────────────────────────
echo [1/3] Checking internet connection...
powershell -NoProfile -Command ^
  "try { $null=(Invoke-WebRequest 'https://raw.githubusercontent.com' -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop); exit 0 } catch { exit 1 }" ^
  >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo   [X] Cannot reach github.com.
    echo       Check your internet connection and try again.
    echo.
    pause
    exit /b 1
)
echo   [OK] Connected.
echo.

REM ── Download latest package.json ─────────────────────────────────────────────
echo [2/3] Downloading latest package.json from GitHub...

REM  Back up the existing package.json first in case the download fails.
copy /y package.json package.json.bak >nul 2>nul

powershell -NoProfile -Command ^
  "try { Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/Patrick31214/malta-real-estate-crm/main/package.json' -OutFile 'package.json.new' -UseBasicParsing -ErrorAction Stop; exit 0 } catch { Write-Host ('  Error: ' + $_.Exception.Message); exit 1 }"
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo   [X] Could not download package.json.
    echo.
    echo   Check your internet connection and try again.
    echo   If this keeps failing, visit:
    echo     https://github.com/Patrick31214/malta-real-estate-crm
    echo   Click the green "Code" button and download the ZIP file.
    echo.
    del /f /q package.json.new >nul 2>nul
    pause
    exit /b 1
)

REM  Validate the download is non-empty JSON (starts with '{') before replacing.
for %%F in (package.json.new) do set FILESIZE=%%~zF
if "%FILESIZE%"=="0" (
    echo.
    echo   [X] Downloaded file is empty.  Not updating package.json.
    del /f /q package.json.new >nul 2>nul
    pause
    exit /b 1
)
powershell -NoProfile -Command ^
  "try { $null=Get-Content 'package.json.new' -Raw | ConvertFrom-Json -ErrorAction Stop; exit 0 } catch { exit 1 }" ^
  >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo   [X] Downloaded file is not valid JSON.  Not updating package.json.
    echo       Your original package.json has been kept.
    del /f /q package.json.new >nul 2>nul
    pause
    exit /b 1
)

move /y package.json.new package.json >nul
echo   [OK] package.json updated.  (Backup saved as package.json.bak)
echo.

REM ── Download DOWNLOAD-LATEST.bat for future updates ───────────────────────────
echo   Also downloading DOWNLOAD-LATEST.bat for future full updates...
powershell -NoProfile -Command ^
  "try { Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/Patrick31214/malta-real-estate-crm/main/DOWNLOAD-LATEST.bat' -OutFile 'DOWNLOAD-LATEST.bat' -UseBasicParsing -ErrorAction Stop } catch {}"
echo   [OK] Done.
echo.

REM ── Run npm install ───────────────────────────────────────────────────────────
echo [3/3] Installing packages (npm install)...
echo   Please wait...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo   [X] npm install failed.
    echo.
    echo   Common causes:
    echo     - No internet connection.
    echo     - Node.js not installed.  Download from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)
echo.

echo ============================================================
echo   SUCCESS!  Your CRM scripts are now up to date.
echo ============================================================
echo.
echo   NOW you can run the database setup.
echo   Here is what to do next:
echo.
echo   1. Open a Command Prompt in this folder.
echo      (Press Win+R, type cmd, click OK.
echo       Then type:  cd C:\Users\USER\malta-crm\malta-real-estate-crm
echo       Replace USER with your Windows username, then press ENTER.)
echo.
echo   2. Type this command and press ENTER:
echo         npm run db:fresh
echo.
echo   3. When it finishes, double-click  start-windows.bat  to start the CRM.
echo.
echo   Log in with:
echo      Email:    admin@maltarealestate.com
echo      Password: Password123!
echo.
echo ============================================================
echo.
pause
