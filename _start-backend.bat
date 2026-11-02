@echo off
cd /d "C:\Users\poude\Desktop\Guides Nepal\Guides-Nepal\backend"
call .venv\Scripts\activate.bat
uvicorn app.main:app --port 8000