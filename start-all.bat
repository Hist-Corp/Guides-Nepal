@echo off
REM Guides Nepal - Start All Development Services
REM Starts frontend (5175), backend (8000), and dashboard (5176)
REM Portable: resolves repo root from this file's location (no hardcoded user path)

echo ========================================
echo   Guides Nepal - Starting Services
echo ========================================
echo.

REM Resolve repo root (parent dir of this script)
set "ROOT=%~dp0"
cd /d "%ROOT%"

REM Kill existing processes on our ports
echo Cleaning up existing processes...
taskkill /F /IM node.exe 2>nul
taskkill /F /IM uvicorn.exe 2>nul
timeout /t 2 /nobreak >nul
echo Done.
echo.

REM Start Backend (port 8000) in new window
echo Starting Backend (port 8000)...
REM /d sets the working directory for the new window, avoiding fragile
REM nested quoting when the repo path contains spaces.
if exist "%ROOT%backend\.venv\Scripts\activate.bat" (
  start "Backend" /d "%ROOT%backend" cmd /k "call .venv\Scripts\activate.bat && uvicorn app.main:app --reload --port 8000"
) else (
  echo No backend venv found - using run-py.js resolver...
  start "Backend" /d "%ROOT%" cmd /k "node scripts\run-py.js -m uvicorn app.main:app --reload --port 8000"
)
cd /d "%ROOT%"
timeout /t 3 /nobreak >nul

REM Start Frontend (port 5175) in new window
echo Starting Frontend (port 5175)...
start "Frontend" /d "%ROOT%frontend" cmd /k "npm run dev -- --port 5175 --host"
timeout /t 5 /nobreak >nul

REM Start Dashboard (port 5176) in new window
echo Starting Dashboard (port 5176)...
start "Dashboard" /d "%ROOT%dashboard" cmd /k "npm run dev -- --port 5176 --host"
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo   Services Running
echo ========================================
echo.
echo   Frontend:  http://localhost:5175
echo   Dashboard: http://localhost:5176
echo   Backend:   http://localhost:8000
echo.
echo   API Docs:  http://localhost:8000/api/v1/docs
echo.
echo Close the command windows to stop individual services.
echo.

pause
