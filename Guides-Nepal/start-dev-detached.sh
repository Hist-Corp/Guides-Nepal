#!/bin/sh
# Detached launcher for Guides Nepal dev stack (frontend:5175, backend:8000, dashboard:5176)
cd "$(dirname "$0")"
nohup npm run dev > run-dev.log 2>&1 &
echo $! > run-dev.pid
echo "Guides Nepal dev stack started (PID $(cat run-dev.pid)). Logs: run-dev.log"
echo "  Frontend:  http://localhost:5175"
echo "  Backend:   http://localhost:8000"
echo "  Dashboard: http://localhost:5176"
