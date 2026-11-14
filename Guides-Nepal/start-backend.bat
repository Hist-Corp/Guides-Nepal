@echo off
REM Guides Nepal - Start Backend
REM Starts FastAPI backend on port 8000
REM Portable: resolves backend dir from this file's location

set "ROOT=%~dp0"
cd /d "%ROOT%backend"
if exist .venv\Scripts\activate.bat (
  call .venv\Scripts\activate.bat
  uvicorn app.main:app --reload --port 8000
) else (
  echo No backend venv found - using run-py.js resolver...
  cd /d "%ROOT%"
  node scripts\run-py.js -m uvicorn app.main:app --reload --port 8000
)
