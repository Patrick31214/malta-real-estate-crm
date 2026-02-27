@echo off
REM ============================================================================
REM  DOWNLOAD-LATEST.bat  —  Download the latest CRM code directly from GitHub
REM
REM  Use this file when you DO NOT have Git installed, or when GET-LATEST.bat
REM  does not work because this folder was extracted from a ZIP archive.
REM
REM  It downloads the latest ZIP from GitHub using PowerShell (built-in on
REM  Windows 7 and later), extracts it into a temporary folder, copies the
REM  updated files over this folder, then runs npm install.
REM
REM  Your .env file is NEVER overwritten — your database password stays safe.
REM ============================================================================

cd /d "%~dp0"

echo.
echo ============================================================
echo   Malta CRM — Download Latest Code from GitHub
echo ============================================================
echo.

REM ── Safety check: must be inside the project folder ──────────────────────────
if not exist "package.json" (
    echo   [X] Wrong folder!  package.json not found here.
    echo       Run this file from inside the malta-real-estate-crm folder.
    echo.
    pause
    exit /b 1
)

REM ── Check PowerShell (needed to download and extract the ZIP) ─────────────────
where powershell >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo   [X] PowerShell is not found on this computer.
    echo.
    echo   PowerShell is built into Windows 7 and later.
    echo   If you are on an older Windows version, install Git instead:
    echo     https://git-scm.com/download/win
    echo   Then use GET-LATEST.bat instead of this file.
    echo.
    pause
    exit /b 1
)

REM ── Check internet (quick test to github.com) ─────────────────────────────────
echo [1/5] Checking internet connection...
powershell -NoProfile -Command ^
  "try { $r=(Invoke-WebRequest 'https://github.com' -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop).StatusCode; if($r -eq 200){exit 0} else {exit 1} } catch { exit 1 }" ^
  >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo   [X] Cannot reach github.com.
    echo       Check your internet connection and try again.
    echo.
    pause
    exit /b 1
)
echo   [OK] Connected to internet.
echo.

REM ── Create a temporary download folder ───────────────────────────────────────
set TMPDIR=%TEMP%\malta-crm-download-%RANDOM%
echo [2/5] Downloading latest code from GitHub...
echo   URL: https://github.com/Patrick31214/malta-real-estate-crm/archive/refs/heads/main.zip
echo   Please wait...

powershell -NoProfile -Command ^
  "try { Invoke-WebRequest 'https://github.com/Patrick31214/malta-real-estate-crm/archive/refs/heads/main.zip' -OutFile '%TMPDIR%.zip' -UseBasicParsing -ErrorAction Stop; exit 0 } catch { Write-Host $_.Exception.Message; exit 1 }"
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo   [X] Download failed.
    echo.
    echo   Common causes:
    echo     - The repository may be private. Make sure it is public on GitHub.
    echo     - Firewall or antivirus may be blocking the download.
    echo       Try disabling antivirus temporarily and run this again.
    echo     - No internet connection.
    echo.
    pause
    exit /b 1
)
echo   [OK] Downloaded successfully.
echo.

REM ── Extract the ZIP ───────────────────────────────────────────────────────────
echo [3/5] Extracting files...
powershell -NoProfile -Command ^
  "try { Expand-Archive -Path '%TMPDIR%.zip' -DestinationPath '%TMPDIR%' -Force -ErrorAction Stop; exit 0 } catch { Write-Host $_.Exception.Message; exit 1 }"
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo   [X] Could not extract the downloaded ZIP.
    echo       Try running this file again.
    echo.
    del /f /q "%TMPDIR%.zip" >nul 2>nul
    pause
    exit /b 1
)
echo   [OK] Extracted successfully.
echo.

REM ── Copy new files into the CRM folder ───────────────────────────────────────
REM    The ZIP extracts as  malta-real-estate-crm-main\  inside %TMPDIR%
REM    We copy everything EXCEPT .env (which holds the user's database password)
echo [4/5] Updating CRM files...
echo   (Your .env file is NOT changed - your database password is safe.)

REM  Robocopy: /E = all subdirs including empty, /XF .env = skip .env,
REM            /XD .git = skip .git if present, /NFL /NDL = quiet output
robocopy "%TMPDIR%\malta-real-estate-crm-main" "%CD%" /E /XF .env /XD .git /NFL /NDL /NJH /NJS >nul 2>nul

REM  Robocopy exit codes: 0 = no change, 1 = files copied, 2+ = errors
if %ERRORLEVEL% GEQ 8 (
    echo.
    echo   [X] Could not copy the new files.
    echo.
    echo   Try closing any open files in this folder and run again.
    echo.
    del /f /q "%TMPDIR%.zip" >nul 2>nul
    rd /s /q "%TMPDIR%" >nul 2>nul
    pause
    exit /b 1
)
echo   [OK] Files updated.
echo.

REM ── Clean up temp files ───────────────────────────────────────────────────────
del /f /q "%TMPDIR%.zip" >nul 2>nul
rd /s /q "%TMPDIR%" >nul 2>nul

REM ── Install any new npm packages ─────────────────────────────────────────────
echo [5/5] Installing any new packages...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo   [X] npm install failed.
    echo       Check your internet connection and try again.
    echo.
    pause
    exit /b 1
)
echo.

echo ============================================================
echo   SUCCESS!  Your CRM code is now up to date.
echo ============================================================
echo.
echo   What to do next:
echo.
echo   If you were told to run  db:fresh  (database reset):
echo     1. Open a Command Prompt in this folder.
echo     2. Type:  npm run db:fresh
echo     3. Then double-click  start-windows.bat  to start the CRM.
echo.
echo   If you just wanted the latest code without a database reset:
echo     Double-click  start-windows.bat  to start the CRM.
echo.
echo ============================================================
echo.
pause
