@echo off
REM Smart Maize Insights - Setup Script for Windows

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║  Smart Maize Insights - Setup Script                      ║
echo ║  AI-Powered Maize Disease Detection Platform              ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 16+
    echo    Download from: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if MySQL is installed or accessible
where mysql >nul 2>nul
if %errorlevel% neq 0 (
    echo ⚠️  MySQL is not found in PATH
    echo    Make sure MySQL Server is installed and running
    echo    Windows: Services > MySQL
)

echo ✅ Node.js found
echo.

REM Step 1: Install project dependencies
echo [1/3] Installing project dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install project dependencies
    pause
    exit /b 1
)
echo ✅ Project dependencies installed

echo.

REM Step 2: Create environment files
echo [2/3] Creating environment configuration files...

if not exist ".env.local" (
    (
        echo DB_HOST=localhost
        echo DB_USER=root
        echo DB_PASSWORD=
        echo DB_NAME=maize_detection_systemai
        echo DB_PORT=3306
        echo.
        echo NEXT_PUBLIC_API_URL=http://localhost:3000
        echo JWT_SECRET=maze_detection_secret_key_development
        echo PORT=3000
    ) > .env.local
    echo ✅ Created .env.local
) else (
    echo ✓ .env.local already exists
)

echo.

REM Step 3: Initialize database
echo [3/3] Initializing database...
echo.
echo ⚠️  Make sure MySQL Server is running!
echo    Windows: Services > MySQL (search for "Services" in Start menu)
echo.
pause

REM Try to initialize database using Node.js script
if exist "scripts\init-db.mjs" (
    echo Attempting to initialize database...
    call npm run db:init
) else (
    echo.
    echo 📝 To initialize database manually:
    echo    1. Open Command Prompt as Administrator
    echo    2. Run: mysql -u root -p ^< database/schema.sql
    echo    3. Press Enter, leave password blank if not set
)

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║  Setup Complete! ✅                                        ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 🚀 To start the application:
echo.
echo    $ npm run dev
echo    App runs on http://localhost:3000
echo.
echo 🌐 Access the app: http://localhost:3000
echo.
echo 📚 See SETUP_GUIDE.md for more information
echo.
pause
