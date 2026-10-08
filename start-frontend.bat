@echo off
REM Portable: resolves frontend dir from this file's location
set "ROOT=%~dp0"
cd /d "%ROOT%frontend"
call npm run dev -- --port 5175 --host
