@echo off
cd /d "c:\Users\poude\Desktop\Guides Nepal\backend"
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 > "c:\Users\poude\Desktop\Guides Nepal\backend.log" 2>&1
pause