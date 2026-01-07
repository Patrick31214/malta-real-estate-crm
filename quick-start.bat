@echo off
REM Malta Real Estate CRM - Quick Start Script for Windows
REM This script helps you verify your backend setup

echo.
echo Malta Real Estate CRM - Backend Quick Start
echo ==============================================
echo.

REM Check Node.js
echo Checking Node.js installation...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [X] Node.js is NOT installed. Please install from https://nodejs.org/
    exit /b 1
) else (
    node --version
    echo [OK] Node.js is installed
)

REM Check npm
echo.
echo Checking npm installation...
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [X] npm is NOT installed. Please install Node.js from https://nodejs.org/
    exit /b 1
) else (
    npm --version
    echo [OK] npm is installed
)

REM Check PostgreSQL
echo.
echo Checking PostgreSQL installation...
where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [X] PostgreSQL is NOT installed. Please install from https://www.postgresql.org/
    exit /b 1
) else (
    psql --version
    echo [OK] PostgreSQL is installed
)

REM Check if .env exists
echo.
echo Checking environment configuration...
if exist ".env" (
    echo [OK] .env file exists
    findstr /C:"JWT_SECRET=your_super_secret" .env >nul
    if %ERRORLEVEL% EQU 0 (
        echo [!] WARNING: You're still using placeholder JWT secrets!
        echo     Please edit .env and set secure random strings
    ) else (
        echo [OK] JWT secrets appear to be configured
    )
) else (
    echo [X] .env file NOT found
    echo     Creating .env from .env.example...
    copy .env.example .env
    echo [OK] .env file created
    echo [!] IMPORTANT: Edit .env and set your database credentials and JWT secrets!
    exit /b 1
)

REM Check if node_modules exists
echo.
echo Checking dependencies...
if exist "node_modules" (
    echo [OK] Dependencies are installed
) else (
    echo [!] Dependencies not installed
    echo     Run: npm install
    exit /b 1
)

echo.
echo ==============================================
echo [OK] Pre-flight checks complete!
echo.
echo To start the backend server, run:
echo   npm start
echo.
echo Or for development mode with auto-restart:
echo   npm run dev
echo.
echo For detailed setup instructions, see: DEPLOYMENT_GUIDE.md
echo ==============================================
echo.
pause
