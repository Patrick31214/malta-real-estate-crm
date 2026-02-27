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

echo [1/5] Saving any local changes (stash)...
git stash -u
echo   [OK] Done (any local changes have been saved safely).
echo.

echo [2/5] Switching to the main branch...
git checkout main
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo   [X] Could not switch to the main branch.
    echo.
    echo   This can happen if there are conflicts that need manual resolution.
    echo   Try running  DOWNLOAD-LATEST.bat  in this folder instead,
    echo   or run these commands in a Command Prompt inside the CRM folder:
    echo       git stash -u
    echo       git checkout main
    echo.
    pause
    exit /b 1
)
echo.

echo [3/5] Downloading latest code from GitHub...
git pull origin main
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo   [X] Could not pull from GitHub.
    echo.
    echo   Common causes:
    echo     - No internet connection.  Check your connection and try again.
    echo     - GitHub login required.  Make sure you have cloned the repo
    echo       using HTTPS (not SSH) and that your credentials are saved.
    echo     - Untracked files in your folder would be overwritten by the
    echo       pull.  Run DOWNLOAD-LATEST.bat instead — it downloads a
    echo       fresh copy and does not depend on your local git state.
    echo.
    pause
    exit /b 1
)
echo.

echo [4/5] Installing any new packages...
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

echo [5/5] Rebuilding the CRM interface pages...
if exist "client\package.json" (
    if not exist "client\node_modules" (
        echo   First-time: installing interface packages (2-3 minutes)...
        cd client
        call npm install
        if %ERRORLEVEL% NEQ 0 (
            echo.
            echo   [X] Failed to install interface packages.
            echo       Check your internet connection and try again.
            cd ..
            pause
            exit /b 1
        )
        cd ..
    )
    call npm run client:build
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo   [X] Failed to rebuild the CRM interface.
        echo.
        echo   Common causes:
        echo     - Node.js too old (v16+ required).  Check: node --version
        echo     - Try: delete the client\node_modules folder and run again.
        echo.
        pause
        exit /b 1
    )
    echo   [OK] CRM interface rebuilt.
) else (
    echo   [SKIP] client\package.json not found - skipping interface rebuild.
)
echo.

echo ============================================================
echo   SUCCESS!  Your CRM code is now up to date.
echo ============================================================
echo.
echo   NEXT STEP — Restart the CRM to load the new pages:
echo.
echo     1. Close the CRM server window (the black window that
echo        says "Server is running on port 3001") if it is open.
echo.
echo     2. Double-click  quick-start.bat  in this folder.
echo        Your browser will open at  http://localhost:3001
echo.
echo     3. Log in with your usual email and password.
echo        (If you reset the database: admin@maltarealestate.com / Password123!)
echo.
echo   NEW IN THIS UPDATE:
echo     - Agents page  (sidebar → Agents 👔)
echo       Add/edit/remove agents and create their CRM login.
echo     - Public listings website  (sidebar → Website → Public Listings 🌐)
echo       A no-login page your clients can browse at /listings
echo.
echo ============================================================
echo.
pause
