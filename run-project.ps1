# Guides Nepal - Start Services Script
# Uses PowerShell jobs to run services in background

$ErrorActionPreference = "SilentlyContinue"
$rootDir = "c:\Users\poude\Desktop\Guides Nepal"

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
    Set-Location "c:\Users\poude\Desktop\Guides Nepal\backend"
    & ".\.venv\Scripts\activate.ps1"
    & uvicorn app.main:app --reload --port 8000
}

# Start Frontend as background job  
Write-Host "Starting Frontend (port 5175)..." -ForegroundColor Green
$frontendJob = Start-Job -ScriptBlock {
    Set-Location "c:\Users\poude\Desktop\Guides Nepal\frontend"
    & npm run dev -- --port 5175 --host
}

# Start Dashboard as background job
Write-Host "Starting Dashboard (port 5176)..." -ForegroundColor Cyan
$dashboardJob = Start-Job -ScriptBlock {
    Set-Location "c:\Users\poude\Desktop\Guides Nepal\dashboard"
    & npm run dev -- --port 5176 --host
}

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
