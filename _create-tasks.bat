@echo off
setlocal
set ROOT=C:\Users\poude\Desktop\Guides Nepal\Guides-Nepal

REM Delete existing tasks if any
schtasks /delete /tn "GNBBackend" /f 2>nul
schtasks /delete /tn "GNFrontend" /f 2>nul
schtasks /delete /tn "GNDashboard" /f 2>nul

REM Create tasks
schtasks /create /tn "GNBBackend" /tr """%ROOT%\_start-backend.bat""" /sc once /st 00:00 /f
schtasks /create /tn "GNFrontend" /tr """%ROOT%\_start-frontend.bat""" /sc once /st 00:00 /f
schtasks /create /tn "GNDashboard" /tr """%ROOT%\_start-dashboard.bat""" /sc once /st 00:00 /f

echo Tasks created. Running them...
schtasks /run /tn "GNBBackend"
schtasks /run /tn "GNFrontend"
schtasks /run /tn "GNDashboard"

echo.
echo Waiting for services to boot...
timeout /t 15 /nobreak >nul

echo Checking endpoints:
powershell -Command "try { $r=Invoke-WebRequest -Uri 'http://localhost:8000/health' -TimeoutSec 5; Write-Host 'BACKEND:   UP ' $r.StatusCode } catch { Write-Host 'BACKEND:   DOWN' }; try { $r=Invoke-WebRequest -Uri 'http://localhost:5175/' -TimeoutSec 8; Write-Host 'FRONTEND:  UP ' $r.StatusCode } catch { Write-Host 'FRONTEND:  DOWN' }; try { $r=Invoke-WebRequest -Uri 'http://localhost:5176/' -TimeoutSec 8; Write-Host 'DASHBOARD: UP ' $r.StatusCode } catch { Write-Host 'DASHBOARD: DOWN' }"

pause