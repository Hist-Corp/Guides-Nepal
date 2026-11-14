$root = "C:\Users\poude\Desktop\Guides Nepal\Guides-Nepal"

# Remove existing tasks if any
Get-ScheduledTask -TaskName "GNBBackend" -ErrorAction SilentlyContinue | Unregister-ScheduledTask -Confirm:$false
Get-ScheduledTask -TaskName "GNFrontend" -ErrorAction SilentlyContinue | Unregister-ScheduledTask -Confirm:$false
Get-ScheduledTask -TaskName "GNDashboard" -ErrorAction SilentlyContinue | Unregister-ScheduledTask -Confirm:$false

# Create and start Backend task
$action = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c _start-backend.bat" -WorkingDirectory "$root\backend"
$trigger = New-ScheduledTaskTrigger -Once -At 00:00
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RunOnlyIfNetworkAvailable:$false
Register-ScheduledTask -TaskName "GNBBackend" -Action $action -Trigger $trigger -Settings $settings
Start-ScheduledTask -TaskName "GNBBackend"

# Create and start Frontend task
$action = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c _start-frontend.bat" -WorkingDirectory "$root\frontend"
$trigger = New-ScheduledTaskTrigger -Once -At 00:00
Register-ScheduledTask -TaskName "GNFrontend" -Action $action -Trigger $trigger -Settings $settings
Start-ScheduledTask -TaskName "GNFrontend"

# Create and start Dashboard task
$action = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c _start-dashboard.bat" -WorkingDirectory "$root\dashboard"
$trigger = New-ScheduledTaskTrigger -Once -At 00:00
Register-ScheduledTask -TaskName "GNDashboard" -Action $action -Trigger $trigger -Settings $settings
Start-ScheduledTask -TaskName "GNDashboard"

Write-Host "Tasks created and started. Waiting for services to boot..."
Start-Sleep -Seconds 15

Write-Host "`nEndpoint Check:"
try { $r=Invoke-WebRequest -Uri 'http://localhost:8000/health' -TimeoutSec 5; Write-Host "BACKEND:   UP $($r.StatusCode)" } catch { Write-Host "BACKEND:   DOWN" }
try { $r=Invoke-WebRequest -Uri 'http://localhost:5175/' -TimeoutSec 8; Write-Host "FRONTEND:  UP $($r.StatusCode)" } catch { Write-Host "FRONTEND:  DOWN" }
try { $r=Invoke-WebRequest -Uri 'http://localhost:5176/' -TimeoutSec 8; Write-Host "DASHBOARD: UP $($r.StatusCode)" } catch { Write-Host "DASHBOARD: DOWN" }

Write-Host "`nAccess URLs:"
Write-Host "  Frontend:  http://localhost:5175"
Write-Host "  Backend:   http://localhost:8000"
Write-Host "  Dashboard: http://localhost:5176"
Write-Host "  API Docs:  http://localhost:8000/api/v1/docs"