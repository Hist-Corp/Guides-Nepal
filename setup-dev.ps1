# Guides Nepal - Development Setup (background jobs)
# Launches dependency installs in background PowerShell jobs
$ErrorActionPreference = "SilentlyContinue"
$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Guides Nepal - Dependency Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Backend pip install
Write-Host "Starting backend pip install (background)..." -ForegroundColor Magenta
$pipJob = Start-Job -ScriptBlock {
    param($rootDir)
    Set-Location $rootDir
    & backend\.venv\Scripts\pip install -r backend\requirements.txt
} -ArgumentList $rootDir

# Frontend npm install
Write-Host "Starting frontend npm install (background)..." -ForegroundColor Green
$npmFrontendJob = Start-Job -ScriptBlock {
    param($rootDir)
    Set-Location (Join-Path $rootDir "frontend")
    & npm install --no-audit --no-fund
} -ArgumentList $rootDir

# Dashboard npm install
Write-Host "Starting dashboard npm install (background)..." -ForegroundColor Cyan
$npmDashboardJob = Start-Job -ScriptBlock {
    param($rootDir)
    Set-Location (Join-Path $rootDir "dashboard")
    & npm install --no-audit --no-fund
} -ArgumentList $rootDir

Write-Host ""
Write-Host "All installs launched in background." -ForegroundColor Yellow
Write-Host "Job IDs - Pip: $($pipJob.Id), Frontend NPM: $($npmFrontendJob.Id), Dashboard NPM: $($npmDashboardJob.Id)" -ForegroundColor Gray
Write-Host "Check status with: Get-Job" -ForegroundColor Gray
Write-Host "View output with: Receive-Job <Id>" -ForegroundColor Gray