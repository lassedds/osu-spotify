@echo off
echo 🎵 osu! to Spotify Converter - Setup Script
echo ===========================================
echo.

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed!
    echo    Download from: https://nodejs.org/
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js %NODE_VERSION% found

REM Check npm
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm is not installed!
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✅ npm %NPM_VERSION% found
echo.

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Setup complete!
    echo.
    echo Next steps:
    echo   1. Run 'npm run dev' to start development mode
    echo   2. Run 'npm run build' to build for production
    echo   3. Run 'npm run package' to create distributable
) else (
    echo.
    echo ❌ Installation failed!
    echo    Try deleting node_modules and package-lock.json, then run again
    exit /b 1
)
