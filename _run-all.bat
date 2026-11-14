@echo off
setlocal enabledelayedexpansion
set ROOT=C:\Users\poude\Desktop\Guides Nepal\Guides-Nepal

REM Kill any existing processes on our ports
taskkill /F /IM node.exe 2>nul
taskkill /F /IM uvicorn.exe 2>nul
taskkill /F /IM python.exe 2>nul
timeout /t 2 /nobreak >nul

echo ========================================
echo   Guides Nepal - Starting Services
echo ========================================
echo.

echo Launching Backend (port 8000)...
start "Backend" /d "%ROOT%" cmd /c "_start-backend.bat"

echo Launching Frontend (port 5175)...
start "Frontend" /d "%ROOT%" cmd /c "_start-frontend.bat"

echo Launching Dashboard (port 5176)...
start "Dashboard" /d "%ROOT%" cmd /c "_start-dashboard.bat"

echo.
echo Waiting 15 seconds for services to boot...
timeout /t 15 /nobreak >nul

echo.
echo ========================================
echo   Process Check
echo ========================================
tasklist | findstr /c:"uvicorn.exe" /c:"node.exe" /c:"python.exe"

echo.
echo ========================================
echo   Endpoint Check
echo ========================================
powershell -Command "try { $r=Invoke-WebRequest -Uri 'http://localhost:8000/health' -TimeoutSec 5; Write-Host 'BACKEND:   UP (' $r.StatusCode ')' } catch { Write-Host 'BACKEND:   DOWN' }; try { $r=Invoke-WebRequest -Uri 'http://localhost:5175/' -TimeoutSec 8; Write-Host 'FRONTEND:  UP (' $r.StatusCode ')' } catch { Write-Host 'FRONTEND:  DOWN' }; try { $r=Invoke-WebRequest -Uri 'http://localhost:5176/' -TimeoutSec 8; Write-Host 'DASHBOARD: UP (' $r.StatusCode ')' } catch { Write-Host 'DASHBOARD: DOWN' }"

echo.
echo ========================================
echo   Access URLs
echo ========================================
echo   Frontend:  http://localhost:5175
echo   Backend:   http://localhost:8000
echo   Dashboard: http://localhost:5176
echo   API Docs:  http://localhost:8000/api/v1/docs
echo.
echo Keep these command windows open to keep services running.
pause