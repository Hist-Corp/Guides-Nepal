@echo off
cd /d "c:\Users\poude\Desktop\Guides Nepal\backend"
"c:\Users\poude\Desktop\Guides Nepal\backend\.venv\Scripts\uvicorn.exe" app.main:app --host 127.0.0.1 --port 8000 --reload > "dev.log" 2>&1
