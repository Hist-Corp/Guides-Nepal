# Guides Nepal - Start Services Script
# Uses PowerShell jobs to run services in background
# Portable: resolves repo root from this script's location (no hardcoded user path)
#
# Windows launcher (Windows PowerShell 5.1+ / PowerShell 7+).
# On macOS/Linux use `./start-all.sh` or `npm run dev` (works on every OS).

$ErrorActionPreference = "SilentlyContinue"
$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Guides Nepal - Starting Services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Clean up existing processes
Write-Host "Cleaning up..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -like "*node*" -or $_.ProcessName -like "*uvicorn*"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Start Backend as background job
Write-Host "Starting Backend (port 8000)..." -ForegroundColor Magenta
$backendJob = Start-Job -ScriptBlock {
    param($rootDir)
    Set-Location $rootDir
    # run-py.js finds backend/.venv (or a system Python) on every OS,
    # so the backend starts even when the venv was never activated.
    & node scripts/run-py.js -m uvicorn app.main:app --reload --port 8000
} -ArgumentList $rootDir

# Start Frontend as background job  
Write-Host "Starting Frontend (port 5175)..." -ForegroundColor Green
$frontendJob = Start-Job -ScriptBlock {
    param($rootDir)
    Set-Location (Join-Path $rootDir "frontend")
    & npm run dev -- --port 5175 --host
} -ArgumentList $rootDir

# Start Dashboard as background job
Write-Host "Starting Dashboard (port 5176)..." -ForegroundColor Cyan
$dashboardJob = Start-Job -ScriptBlock {
    param($rootDir)
    Set-Location (Join-Path $rootDir "dashboard")
    & npm run dev -- --port 5176 --host
} -ArgumentList $rootDir

Write-Host ""
Write-Host "Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check status
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Service Status" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$backendRunning = $backendJob.State -eq "Running"
$frontendRunning = $frontendJob.State -eq "Running"
$dashboardRunning = $dashboardJob.State -eq "Running"

Write-Host "  Backend:   $(if ($backendRunning) {"RUNNING"} else {"FAILED"})" -ForegroundColor $(if ($backendRunning) {"Green"} else {"Red"})
Write-Host "  Frontend:  $(if ($frontendRunning) {"RUNNING"} else {"FAILED"})" -ForegroundColor $(if ($frontendRunning) {"Green"} else {"Red"})
Write-Host "  Dashboard: $(if ($dashboardRunning) {"RUNNING"} else {"FAILED"})" -ForegroundColor $(if ($dashboardRunning) {"Green"} else {"Red"})
Write-Host ""

# Show URLs
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Access Points" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Frontend:  http://localhost:5175" -ForegroundColor Green
Write-Host "  Dashboard: http://localhost:5176" -ForegroundColor Cyan
Write-Host "  Backend:   http://localhost:8000" -ForegroundColor Magenta
Write-Host "  API Docs:  http://localhost:8000/api/v1/docs" -ForegroundColor Magenta
Write-Host ""

# Check if ports are actually listening
Write-Host "Port Status:" -ForegroundColor Yellow
$ports = @{
    "Frontend (5175)" = 5175
    "Dashboard (5176)" = 5176  
    "Backend (8000)" = 8000
}

foreach ($port in $ports.GetEnumerator()) {
    $listening = netstat -ano | Where-Object { $_ -match $port.Value.ToString() -and $_ -match "LISTENING" }
    if ($listening) {
        Write-Host "  $($port.Key): LISTENING" -ForegroundColor Green
    } else {
        Write-Host "  $($port.Key): NOT LISTENING" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Job IDs - Backend: $($backendJob.Id), Frontend: $($frontendJob.Id), Dashboard: $($dashboardJob.Id)" -ForegroundColor Gray
Write-Host "Use 'Get-Job | Remove-Job' to clean up background jobs" -ForegroundColor Gray
Write-Host ""

# Don't wait - let jobs run in background
Write-Host "Services starting in background. Check with 'Get-Job'" -ForegroundColor Yellow
