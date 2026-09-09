@echo off
REM Guides Nepal - Start Backend
REM Starts FastAPI backend on port 8000

cd /d "c:\Users\poude\Desktop\Guides Nepal\backend"
call .venv\Scripts\activate.bat
uvicorn app.main:app --reload --port 8000
