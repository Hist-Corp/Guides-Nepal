# Guides Nepal - Start Frontend and Dashboard
# This script starts both frontend and dashboard services

$ErrorActionPreference = "SilentlyContinue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting Frontend & Dashboard" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Kill any existing node processes
Write-Host "Cleaning up..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Clear Vite cache
Write-Host "Clearing Vite cache..." -ForegroundColor Yellow
$frontendViteCache = "c:\Users\poude\Desktop\Guides Nepal\frontend\node_modules\.vite"
$dashboardViteCache = "c:\Users\poude\Desktop\Guides Nepal\dashboard\node_modules\.vite"
Remove-Item -Path $frontendViteCache -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path $dashboardViteCache -Recurse -Force -ErrorAction SilentlyContinue

# Start Frontend as a background job
Write-Host "Starting Frontend on port 5175..." -ForegroundColor Green
$frontendScript = @"
cd 'c:\Users\poude\Desktop\Guides Nepal\frontend'
npm run dev -- --port 5175 --host
"@
$frontendJob = Start-Process powershell -ArgumentList "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", $frontendScript -PassThru -WindowStyle Hidden
Start-Sleep -Seconds 5

# Check if frontend started
$frontendRunning = $frontendJob.HasExited -eq $false
if ($frontendRunning) {
    Write-Host "  Frontend process started (PID: $($frontendJob.Id))" -ForegroundColor Green
} else {
    Write-Host "  Frontend failed to start" -ForegroundColor Red
}

# Start Dashboard as a background job
Write-Host "Starting Dashboard on port 5176..." -ForegroundColor Cyan
$dashboardScript = @"
cd 'c:\Users\poude\Desktop\Guides Nepal\dashboard'
npm run dev -- --port 5176 --host
"@
$dashboardJob = Start-Process powershell -ArgumentList "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", $dashboardScript -PassThru -WindowStyle Hidden
Start-Sleep -Seconds 5

# Check if dashboard started
$dashboardRunning = $dashboardJob.HasExited -eq $false
if ($dashboardRunning) {
    Write-Host "  Dashboard process started (PID: $($dashboardJob.Id))" -ForegroundColor Cyan
} else {
    Write-Host "  Dashboard failed to start" -ForegroundColor Red
}

Write-Host ""
Write-Host "Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check ports
Write-Host ""
Write-Host "=== Port Status ===" -ForegroundColor Cyan

$frontendPort = netstat -ano | Where-Object { $_ -match "5175" -and $_ -match "LISTENING" }
$dashboardPort = netstat -ano | Where-Object { $_ -match "5176" -and $_ -match "LISTENING" }

if ($frontendPort) {
    Write-Host "  Frontend (5175): LISTENING" -ForegroundColor Green
} else {
    Write-Host "  Frontend (5175): NOT LISTENING" -ForegroundColor Red
}

if ($dashboardPort) {
    Write-Host "  Dashboard (5176): LISTENING" -ForegroundColor Cyan
} else {
    Write-Host "  Dashboard (5176): NOT LISTENING" -ForegroundColor Red
}

Write-Host ""
Write-Host "Frontend PID: $($frontendJob.Id)" -ForegroundColor Gray
Write-Host "Dashboard PID: $($dashboardJob.Id)" -ForegroundColor Gray

# Test endpoints
Write-Host ""
Write-Host "=== Testing Endpoints ===" -ForegroundColor Cyan

try {
    $resp = Invoke-WebRequest -Uri "http://localhost:5175" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    Write-Host "  Frontend: HTTP $($resp.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "  Frontend: Not responding" -ForegroundColor Red
}

try {
    $resp = Invoke-WebRequest -Uri "http://localhost:5176" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    Write-Host "  Dashboard: HTTP $($resp.StatusCode)" -ForegroundColor Cyan
} catch {
    Write-Host "  Dashboard: Not responding" -ForegroundColor Red
}

Write-Host ""
Write-Host "Done! Check the hidden windows for logs." -ForegroundColor Yellow
