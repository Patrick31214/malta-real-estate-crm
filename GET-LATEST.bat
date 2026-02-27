@echo off
REM ============================================================================
REM  GET-LATEST.bat  —  Pull the latest CRM code from GitHub and switch to main
REM
REM  Run this whenever you are told to "get the latest code" or when commands
REM  like  db:fresh  are missing.  It handles the common git errors for you.
REM ============================================================================

cd /d "%~dp0"

echo.
echo ============================================================
echo   Malta CRM — Get Latest Code from GitHub
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

REM ── Check that git is installed ───────────────────────────────────────────────
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo   [!] Git is not installed.
    echo.
    echo   No problem — you can use DOWNLOAD-LATEST.bat instead.
    echo   It downloads the latest code directly from GitHub without Git.
    echo.
    echo   HOW TO FIX:
    echo     Double-click  DOWNLOAD-LATEST.bat  in this folder.
    echo     It will download and update the code for you automatically.
    echo.
    echo   (If you want to install Git anyway:  https://git-scm.com/download/win)
    echo.
    pause
    exit /b 1
)

REM ── Check that this is a git repository ──────────────────────────────────────
git rev-parse --is-inside-work-tree >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo   [!] This folder is not a Git repository.
    echo.
    echo   This happens when you extracted the code from a ZIP archive
    echo   instead of using  git clone.
    echo.
    echo   No problem — use DOWNLOAD-LATEST.bat instead.
    echo   It downloads the latest code directly from GitHub without Git.
    echo.
    echo   HOW TO FIX:
    echo     Double-click  DOWNLOAD-LATEST.bat  in this folder.
    echo     It will download and update the code for you automatically.
    echo.
    pause
    exit /b 1
)

REM ── Set a local git identity so git never blocks with "who are you?" ────────
REM    We always set this at repo level so it is always defined.
REM    It is only used for automatic merge commits — it has no effect on GitHub.
git config user.email "crm-local@localhost" >nul 2>nul
git config user.name "CRM Local User" >nul 2>nul

echo [1/4] Saving any local changes (stash)...
git stash
echo   [OK] Done (any local changes have been saved safely).
echo.

echo [2/4] Switching to the main branch...
git checkout main
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo   [X] Could not switch to the main branch.
    echo.
    echo   This can happen if there are conflicts that need manual resolution.
    echo   Try this in a Command Prompt inside the CRM folder:
    echo       git checkout -- package.json package-lock.json
    echo       git checkout main
    echo.
    pause
    exit /b 1
)
echo.

echo [3/4] Downloading latest code from GitHub...
git pull origin main
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo   [X] Could not pull from GitHub.
    echo.
    echo   Common causes:
    echo     - No internet connection.  Check your connection and try again.
    echo     - GitHub login required.  Make sure you have cloned the repo
    echo       using HTTPS (not SSH) and that your credentials are saved.
    echo.
    pause
    exit /b 1
)
echo.

echo [4/4] Installing any new packages...
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
