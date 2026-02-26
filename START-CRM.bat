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

echo [1/3] Installing backend dependencies (please wait)...
call npm install
echo.

echo [2/3] Installing frontend dependencies...
if exist "client\package.json" (
    cd client
    call npm install
    cd ..
    echo [OK] Frontend dependencies installed.
) else (
    echo [SKIP] No client\package.json found - skipping frontend install.
)
echo.

echo [3/3] Checking configuration file...
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

echo Opening frontend in a new window (http://localhost:3000)...
start "Malta CRM - Frontend" /D "%~dp0" cmd /k npm run client:dev
echo.
echo ============================================================
echo   Backend is starting. Your browser will open at:
echo   http://localhost:3000
echo.
echo   To STOP: press Ctrl+C in this window, then close the other window.
echo ============================================================
echo.
call npm run dev
