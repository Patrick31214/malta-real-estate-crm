@echo off
echo ================================
echo Malta Real Estate CRM - Startup
echo ================================
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo ERROR: package.json not found!
    echo Please run this script from the malta-real-estate-crm directory
    echo.
    echo Your current directory is: %CD%
    echo.
    pause
    exit /b 1
)

echo Step 1: Starting PostgreSQL Service...
echo.

REM Try to start PostgreSQL (common service names)
net start postgresql-x64-16 2>nul
if %errorlevel% equ 0 (
    echo PostgreSQL started successfully!
    goto :continue
)

net start postgresql-x64-15 2>nul
if %errorlevel% equ 0 (
    echo PostgreSQL started successfully!
    goto :continue
)

net start postgresql-x64-14 2>nul
if %errorlevel% equ 0 (
    echo PostgreSQL started successfully!
    goto :continue
)

echo.
echo NOTE: PostgreSQL service might already be running, or the service name is different.
echo If you see connection errors below, please start PostgreSQL manually.
echo.

:continue
echo.
echo Step 2: Checking for updates...
echo.

git pull origin copilot/implement-crud-endpoints-properties-owners-agents

echo.
echo Step 3: Installing/updating dependencies...
echo.

call npm install

echo.
echo Step 4: Checking .env file...
echo.

if not exist ".env" (
    echo WARNING: .env file not found!
    echo Please create .env file with your database credentials.
    echo See .env.example for reference.
    echo.
    pause
    exit /b 1
)

echo .env file found!
echo.
echo Step 5: Starting the server...
echo.
echo ================================
echo Server starting...
echo Press Ctrl+C to stop
echo ================================
echo.

call npm start

pause
