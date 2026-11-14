# Guides Nepal - Start All Development Services (background)
$ErrorActionPreference = "SilentlyContinue"
$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Clean up existing processes
Get-Process | Where-Object {$_.ProcessName -like "*node*" -or $_.ProcessName -like "*uvicorn*"} | Stop-Process -Force -ErrorAction SilentlyContinue

# Start Backend as background job
Start-Job -ScriptBlock {
    param($rootDir)
    Set-Location $rootDir
    & backend\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
} -ArgumentList $rootDir | Out-Null

# Start Frontend as background job
Start-Job -ScriptBlock {
    param($rootDir)
    Set-Location (Join-Path $rootDir "frontend")
    & npm run dev -- --port 5175 --host
} -ArgumentList $rootDir | Out-Null

# Start Dashboard as background job
Start-Job -ScriptBlock {
    param($rootDir)
    Set-Location (Join-Path $rootDir "dashboard")
    & npm run dev -- --port 5176 --host
} -ArgumentList $rootDir | Out-Null

Write-Host "Guides Nepal services starting in backend jobs."
Write-Host "  Backend:   http://localhost:8000 (port 8000)"
Write-Host "  Frontend:  http://localhost:5175 (port 5175)"
Write-Host "  Dashboard: http://localhost:5176 (port 5176)"
Write-Host "Check status: Get-Job  |  Stop all: Get-Job | Remove-Job"