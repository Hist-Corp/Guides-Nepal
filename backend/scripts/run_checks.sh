#!/bin/bash
# Backend quality + security checks (macOS / Linux).
# Windows: run `npm run checks:backend` from the repo root instead
# (plain .sh files need Git Bash on Windows).
set -e

cd "$(dirname "$0")/.."

# Prefer the backend venv Python when present so the script works WITHOUT
# manual `source .venv/bin/activate`. Falls back to PATH otherwise.
if [ -x ".venv/bin/python" ]; then
  PY=".venv/bin/python"
elif command -v python3 >/dev/null 2>&1; then
  PY="python3"
else
  PY="python"
fi

echo "Running Code Quality Checks (python: $PY)..."

echo "1. Black (Formatting)..."
"$PY" -m black --check .

echo "2. Ruff (Linting)..."
"$PY" -m ruff check .

echo "3. Mypy (Type Checking)..."
"$PY" -m mypy .

echo "Quality Checks Passed!"

echo "Running Tests..."
PYTHONPATH=$PYTHONPATH:. "$PY" -m pytest
echo "Tests Passed!"

echo "Running Security Checks..."
"$PY" -m bandit -r app
# safety check # Commented out as it might require an API key in some versions, but keeping intention clear

echo "All checks passed!"
