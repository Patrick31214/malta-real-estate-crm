@echo off
setlocal enabledelayedexpansion
REM ============================================================================
REM  REINSTALL-CRM.bat  —  Fresh Install or Re-Install of Malta Real Estate CRM
REM
REM  RUN THIS FILE from ANYWHERE on your computer (Downloads, Desktop, etc.)
REM  Does NOT require Administrator — installs to your user folder.
REM
REM  What it does:
REM    1. Downloads the latest CRM code from GitHub
REM    2. Installs all packages (npm install)
REM    3. Patches database.js (removes the createdAt crash)
REM    4. Creates the database and runs migrations
REM    5. Offers to start the CRM immediately
REM
REM  Your existing data is safe:
REM    - If you already have a CRM installed at %USERPROFILE%\MaltaCRM, your
REM      .env file (database password and settings) is NEVER overwritten.
REM
REM  HOW TO DOWNLOAD THIS FILE:
REM    1. Go to: https://github.com/Patrick31214/malta-real-estate-crm
REM    2. Click REINSTALL-CRM.bat in the file list
REM    3. Click the download icon (down-arrow button near top-right)
REM    4. If it saves as REINSTALL-CRM.bat.txt, rename it:
REM         Right-click the file → Rename → delete the .txt at the end → Enter
REM    5. Double-click REINSTALL-CRM.bat
REM ============================================================================

cd /d "%~dp0"

echo.
echo ================================================================
echo   Malta Real Estate CRM -- Fresh Install / Re-Install
echo ================================================================
echo.
echo   This will download the latest CRM code and set it up for you.
echo.

REM ── Install location ─────────────────────────────────────────────────────────
REM    Use %USERPROFILE%\MaltaCRM (e.g. C:\Users\Patrick\MaltaCRM).
REM    This folder is always writable without Administrator access.
REM    (Installing to C:\ root requires admin — this avoids that problem.)
set "INSTALL=%USERPROFILE%\MaltaCRM"
echo   Install location: %INSTALL%
echo.

REM ── Check PowerShell ─────────────────────────────────────────────────────────
where powershell >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo   [X] PowerShell is not available on this computer.
    echo.
    echo   PowerShell is included with Windows 7 and later.
    echo   Please update Windows and try again.
    echo.
    pause
    exit /b 1
)

REM ── Check Node.js / npm ───────────────────────────────────────────────────────
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo   [X] Node.js / npm not found.
    echo.
    echo   You must install Node.js first:
    echo     1. Go to: https://nodejs.org/en/download/
    echo     2. Download and run the LTS installer (the big green button).
    echo     3. Tick "Automatically install the necessary tools" when asked.
    echo     4. Restart your computer.
    echo     5. Double-click REINSTALL-CRM.bat again.
    echo.
    pause
    exit /b 1
)

REM ── Check internet connection ─────────────────────────────────────────────────
echo [1/7] Checking internet connection...
powershell -NoProfile -Command "try { (Invoke-WebRequest 'https://github.com' -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop) | Out-Null; exit 0 } catch { exit 1 }" >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo   [X] Cannot reach github.com.
    echo.
    echo   Check your internet connection and try again.
    echo.
    pause
    exit /b 1
)
echo   [OK] Connected.
echo.

REM ── Preserve existing .env ────────────────────────────────────────────────────
set "_ENV_BACKUP="
if exist "%INSTALL%\.env" (
    echo   Found existing installation -- saving your .env settings...
    copy /y "%INSTALL%\.env" "%TEMP%\malta-crm-env-backup.txt" >nul 2>nul
    set "_ENV_BACKUP=1"
    echo   [OK] .env backed up.
    echo.
)

REM ── Download ──────────────────────────────────────────────────────────────────
set "_ZIP=%TEMP%\malta-crm-reinstall-%RANDOM%.zip"
set "_EXTRACTED=%TEMP%\malta-crm-reinstall-%RANDOM%"

echo [2/7] Downloading latest CRM from GitHub...
echo   URL: https://github.com/Patrick31214/malta-real-estate-crm/archive/refs/heads/main.zip
echo   Please wait (this may take 30-60 seconds)...
echo.
powershell -NoProfile -Command "try { Invoke-WebRequest 'https://github.com/Patrick31214/malta-real-estate-crm/archive/refs/heads/main.zip' -OutFile '!_ZIP!' -UseBasicParsing -ErrorAction Stop; exit 0 } catch { Write-Host $_.Exception.Message; exit 1 }"
if !ERRORLEVEL! NEQ 0 (
    echo.
    echo ================================================================
    echo   ERROR -- Download failed (step 2 of 7)
    echo ================================================================
    echo.
    echo   This can happen if:
    echo     - Your antivirus blocked the download -- disable it and retry.
    echo     - No internet connection.
    echo.
    echo   Press any key to CLOSE this window, then fix the issue and
    echo   double-click REINSTALL-CRM.bat again.
    echo.
    pause
    exit /b 1
)
echo   [OK] Downloaded.
echo.

REM ── Extract ───────────────────────────────────────────────────────────────────
echo [3/7] Extracting files...
powershell -NoProfile -Command "try { Expand-Archive -Path '!_ZIP!' -DestinationPath '!_EXTRACTED!' -Force -ErrorAction Stop; exit 0 } catch { Write-Host $_.Exception.Message; exit 1 }"
if !ERRORLEVEL! NEQ 0 (
    echo.
    echo ================================================================
    echo   ERROR -- Could not extract the ZIP (step 3 of 7)
    echo ================================================================
    echo.
    echo   Try running REINSTALL-CRM.bat again.
    echo.
    echo   Press any key to CLOSE this window.
    echo.
    del /f /q "!_ZIP!" >nul 2>nul
echo.

REM ── Copy files to install folder ──────────────────────────────────────────────
REM    The ZIP extracts as  malta-real-estate-crm-main\  inside _EXTRACTED.
echo [4/7] Installing files to %INSTALL% ...
echo   (Your .env is NOT changed if it already exists there.)

REM  Create the destination folder first so robocopy never has to create C:\...
if not exist "%INSTALL%" mkdir "%INSTALL%"

robocopy "!_EXTRACTED!\malta-real-estate-crm-main" "%INSTALL%" /E /XF .env /XD .git /NFL /NDL /NJH /NJS
REM  Robocopy exit codes: 0=no change, 1=files copied, >=8=some files failed
if !ERRORLEVEL! GEQ 8 (
    echo.
    echo ================================================================
    echo   ERROR -- Could not copy files to %INSTALL% (step 4 of 7)
    echo ================================================================
    echo.
    echo   Exit code was: !ERRORLEVEL!
    echo.
    echo   HOW TO FIX:
    echo     - Make sure no files in %INSTALL% are open in another program.
    echo     - Try right-clicking REINSTALL-CRM.bat and choosing
    echo       "Run as administrator", then run it again.
    echo.
    echo   Press any key to CLOSE this window, fix the issue, then retry.
    echo.
    del /f /q "!_ZIP!" >nul 2>nul
    rd /s /q "!_EXTRACTED!" >nul 2>nul
    pause
    exit /b 1
)
echo   [OK] Files installed.
echo.

REM ── Restore .env ─────────────────────────────────────────────────────────────
if defined _ENV_BACKUP (
    copy /y "%TEMP%\malta-crm-env-backup.txt" "%INSTALL%\.env" >nul 2>nul
    del /f /q "%TEMP%\malta-crm-env-backup.txt" >nul 2>nul
    echo   [OK] Your .env settings restored.
    echo.
)

REM ── Patch database.js ────────────────────────────────────────────────────────
echo   Patching database.js to remove the createdAt startup crash...
set "_PPS=%TEMP%\malta-reinstall-patch-%RANDOM%.ps1"
echo $f = [IO.Path]::GetFullPath('%INSTALL%\src\config\database.js') > "%_PPS%"
echo if (Test-Path $f) { >> "%_PPS%"
echo   $c = [IO.File]::ReadAllText($f) >> "%_PPS%"
echo   $c = $c -replace '(?m)^^[ \t]*// Sync models with database.*[\r\n]+', '' >> "%_PPS%"
echo   $c = $c -replace '(?m)^^[ \t]*// or drop existing ones.*[\r\n]+', '' >> "%_PPS%"
echo   $c = $c -replace '(?m)^^[ \t]*await sequelize[.]sync[(][)];.*[\r\n]+', '' >> "%_PPS%"
echo   $c = $c -replace '(?m)^^[ \t]*console[.]log.*Database models synchronized.*[\r\n]+', '' >> "%_PPS%"
echo   [IO.File]::WriteAllText($f, $c) >> "%_PPS%"
echo } >> "%_PPS%"
powershell -NoProfile -ExecutionPolicy Bypass -File "%_PPS%" >nul 2>nul
del /f /q "%_PPS%" >nul 2>nul
echo   [OK] database.js patched.
echo.

REM ── Clean up temp download files ──────────────────────────────────────────────
del /f /q "!_ZIP!" >nul 2>nul
rd /s /q "!_EXTRACTED!" >nul 2>nul

REM ── Switch to install folder for remaining steps ─────────────────────────────
cd /d "%INSTALL%"

REM ── Set up .env if this is a first install ────────────────────────────────────
if not exist ".env" (
    if exist ".env.example" (
        copy .env.example .env >nul
        echo.
        echo ================================================================
        echo   ACTION NEEDED -- Set your database password
        echo ================================================================
        echo.
        echo   Notepad will open with the .env settings file.
        echo.
        echo   1. Find the line:   DB_PASSWORD=your_password_here
        echo   2. Replace  your_password_here  with the password you
        echo      chose when you installed PostgreSQL.
        echo      Example:  DB_PASSWORD=MyPostgresPass123
        echo   3. Press Ctrl+S to save, then close Notepad.
        echo   4. Come back here and press any key to continue.
        echo.
        echo   (If PostgreSQL is not installed yet:)
        echo   https://www.postgresql.org/download/windows/
        echo.
        start "" notepad "%INSTALL%\.env"
        pause
    )
)

REM ── Check DB_PASSWORD placeholder ────────────────────────────────────────────
findstr /C:"DB_PASSWORD=your_password_here" .env >nul 2>nul
if !ERRORLEVEL! EQU 0 (
    echo.
    echo ================================================================
    echo   ERROR -- DB_PASSWORD not set in .env
    echo ================================================================
    echo.
    echo   HOW TO FIX:
    echo     1. Open Notepad
    echo     2. Open the file:  %INSTALL%\.env
    echo     3. Change the line:  DB_PASSWORD=your_password_here
    echo        To:               DB_PASSWORD=YourActualPassword
    echo     4. Save the file (Ctrl+S), close Notepad.
    echo     5. Double-click REINSTALL-CRM.bat again.
    echo.
    echo   Press any key to CLOSE this window.
    echo.
    pause
    exit /b 1
)

REM ── Check PostgreSQL is running ───────────────────────────────────────────────
echo [5/7] Checking PostgreSQL...
for /f "usebackq tokens=*" %%V in (`powershell -NoProfile -Command "$l=(Get-Content '.env' -ErrorAction SilentlyContinue) -match '^DB_PORT\s*='; if ($l) { (($l -split '\s*=\s*',2)[1]).Trim() } else { '5432' }"`) do set DB_PORT=%%V
if not defined DB_PORT set DB_PORT=5432

powershell -NoProfile -Command "try { $c=New-Object Net.Sockets.TcpClient; $c.Connect('127.0.0.1',%DB_PORT%); $c.Close(); exit 0 } catch { exit 1 }" >nul 2>nul
if !ERRORLEVEL! NEQ 0 (
    echo.
    echo ================================================================
    echo   ERROR -- PostgreSQL is not running on port %DB_PORT%
    echo ================================================================
    echo.
    echo   HOW TO FIX:
    echo     1. Press Win+R, type  services.msc  and press Enter.
    echo     2. Find "PostgreSQL" (e.g. postgresql-x64-16) in the list.
    echo     3. Right-click it and choose "Start".
    echo     4. Wait 5 seconds.
    echo     5. Double-click REINSTALL-CRM.bat again.
    echo.
    echo   Not installed?  https://www.postgresql.org/download/windows/
    echo.
    echo   Press any key to CLOSE this window.
    echo.
    pause
    exit /b 1
)
echo   [OK] PostgreSQL is running.
echo.

REM ── Install packages ─────────────────────────────────────────────────────────
echo [6/7] Installing packages (npm install)...
echo   This may take a few minutes on first install.  Please wait...
echo.
call npm install
if !ERRORLEVEL! NEQ 0 (
    echo.
    echo ================================================================
    echo   ERROR -- npm install failed (step 6 of 7)
    echo ================================================================
    echo.
    echo   Check your internet connection and double-click
    echo   REINSTALL-CRM.bat again.
    echo.
    echo   Press any key to CLOSE this window.
    echo.
    pause
    exit /b 1
)
echo.
if exist "client\package.json" (
    echo   Installing frontend packages...
    cd client
    call npm install
    if !ERRORLEVEL! NEQ 0 (
        echo   [!] Frontend npm install had errors -- see above.
        cd ..
    ) else (
        cd ..
        echo   [OK] Frontend packages installed.
    )
)
echo.

REM ── Set up database ───────────────────────────────────────────────────────────
echo [7/7] Setting up the database...
call node scripts/create-database.js
if !ERRORLEVEL! NEQ 0 (
    echo.
    echo ================================================================
    echo   ERROR -- Could not create the database (step 7 of 7)
    echo ================================================================
    echo.
    echo   This almost always means DB_PASSWORD in .env is wrong.
    echo.
    echo   HOW TO FIX:
    echo     1. Open %INSTALL%\.env in Notepad.
    echo     2. Check that DB_PASSWORD= is set to your PostgreSQL password.
    echo     3. Save the file, then double-click REINSTALL-CRM.bat again.
    echo.
    echo   Press any key to CLOSE this window.
    echo.
    pause
    exit /b 1
)
call npm run db:migrate
if !ERRORLEVEL! NEQ 0 (
    echo.
    echo ================================================================
    echo   ERROR -- Database migration failed (step 7 of 7)
    echo ================================================================
    echo.
    echo   Check the error message shown above for details.
    echo.
    echo   Press any key to CLOSE this window.
    echo.
    pause
    exit /b 1
)
echo   [OK] Database is ready.
echo.

echo ================================================================
echo   INSTALL COMPLETE!
echo ================================================================
echo.
echo   CRM installed at:  %INSTALL%
echo.
echo   To start the CRM in future:
echo     Double-click  %INSTALL%\START-CRM.bat
echo.

REM ── Offer to start now ───────────────────────────────────────────────────────
choice /C YN /M "Start the CRM right now?"
if !ERRORLEVEL! EQU 1 (
    echo.
    echo   Starting CRM...  Your browser will open at http://localhost:3000
    echo.
    start "Malta CRM - Frontend" /D "%INSTALL%" cmd /k npm run client:dev
    start "" /b powershell -WindowStyle Hidden -NoProfile -Command "Start-Sleep 12; Start-Process 'http://localhost:3000'"
    call npm run dev
) else (
    echo.
    echo   OK.  To start the CRM:
    echo     Double-click  %INSTALL%\START-CRM.bat
    echo.
    echo ================================================================
    echo.
    pause
)

