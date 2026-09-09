@echo off
REM Guides Nepal - Start All Development Services
REM Starts frontend (5175), backend (8000), and dashboard (5176)

echo ========================================
echo   Guides Nepal - Starting Services
echo ========================================
echo.

REM Kill existing processes on our ports
echo Cleaning up existing processes...
taskkill /F /IM node.exe 2>nul
taskkill /F /IM uvicorn.exe 2>nul
timeout /t 2 /nobreak >nul
echo Done.
echo.

REM Start Backend (port 8000) in new window
echo Starting Backend (port 8000)...
cd /d "c:\Users\poude\Desktop\Guides Nepal\backend"
call .venv\Scripts\activate.bat
start "Backend" cmd /k "uvicorn app.main:app --reload --port 8000"
cd /d "c:\Users\poude\Desktop\Guides Nepal"
timeout /t 3 /nobreak >nul

REM Start Frontend (port 5175) in new window
echo Starting Frontend (port 5175)...
cd /d "c:\Users\poude\Desktop\Guides Nepal\frontend"
start "Frontend" cmd /k "npm run dev -- --port 5175 --host"
cd /d "c:\Users\poude\Desktop\Guides Nepal"
timeout /t 5 /nobreak >nul

REM Start Dashboard (port 5176) in new window
echo Starting Dashboard (port 5176)...
cd /d "c:\Users\poude\Desktop\Guides Nepal\dashboard"
start "Dashboard" cmd /k "npm run dev -- --port 5176 --host"
cd /d "c:\Users\poude\Desktop\Guides Nepal"
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
