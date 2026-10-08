#!/bin/sh
# Guides Nepal — start all services on macOS & Linux (run from repo root)
# Usage: ./start-all.sh
# Windows: use start-all.bat, run-project.ps1, or `npm run dev` (works on every OS).
# Requires: node/npm. Python + PostgreSQL are optional
# (the backend auto-creates tables and still starts without them).
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"

# Pick a Python interpreter (python3 preferred, python fallback for some distros).
if command -v python3 >/dev/null 2>&1; then PY=python3; else PY=python; fi

echo "=== Guides Nepal: starting backend (port 8000) ==="
cd "$ROOT/backend"
if [ ! -d ".venv" ]; then
  echo "Creating Python venv..."
  "$PY" -m venv .venv
fi
. .venv/bin/activate
pip install -q -r requirements.txt
# Ensure DB exists when psql is available; otherwise warn and continue.
if command -v psql >/dev/null 2>&1; then
  psql -U postgres -h localhost -tc "SELECT 1 FROM pg_database WHERE datname='guides_nepal'" | grep -q 1 \
    || psql -U postgres -h localhost -c "CREATE DATABASE guides_nepal" \
    || echo "WARNING: could not ensure guides_nepal DB exists - continuing anyway."
else
  echo "WARNING: psql not found - skipping DB check (backend will still start)."
fi
nohup uvicorn app.main:app --reload --port 8000 > "$ROOT/backend-dev.log" 2>&1 &
echo "Backend starting... log: $ROOT/backend-dev.log"

echo "=== Starting frontend (port 5175) ==="
cd "$ROOT/frontend"
if [ ! -d "node_modules" ]; then npm install; fi
nohup npm run dev > "$ROOT/frontend-dev.log" 2>&1 &
echo "Frontend starting... log: $ROOT/frontend-dev.log"

echo "=== Starting dashboard (port 5176) ==="
cd "$ROOT/dashboard"
if [ ! -d "node_modules" ]; then npm install; fi
nohup npm run dev > "$ROOT/dashboard-dev.log" 2>&1 &
echo "Dashboard starting... log: $ROOT/dashboard-dev.log"

sleep 3
echo ""
echo "Check status:"
echo "  curl http://localhost:8000/health"
echo "  Frontend:  http://localhost:5175"
echo "  Dashboard: http://localhost:5176"
echo "  API docs:  http://localhost:8000/api/v1/docs"
echo ""
echo "Stop all: pkill -f 'uvicorn app.main:app'; pkill -f 'vite'"
