@echo off
REM Portable: resolves dashboard dir from this file's location
set "ROOT=%~dp0"
cd /d "%ROOT%dashboard"
call npm run dev -- --port 5176 --host
