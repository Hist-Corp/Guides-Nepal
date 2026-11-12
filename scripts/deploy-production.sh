#!/usr/bin/env bash
# =============================================================================
# Guides Nepal — Production Deployment Orchestration Script
# Deploys Backend (Render), Frontend (Vercel), Dashboard (Vercel).
#
# Prerequisites:
#   - GitHub repo pushed to `main`
#   - Render CLI:  https://render.com/docs/cli
#   - Vercel CLI:  npm i -g vercel
#   - Supabase project created with DATABASE_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
# =============================================================================
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="${ROOT_DIR}/backend"
FRONTEND_DIR="${ROOT_DIR}/frontend"
DASHBOARD_DIR="${ROOT_DIR}/dashboard"

echo "============================================================"
echo " Guides Nepal — Production Deployment"
echo "============================================================"

# -----------------------------------------------------------------------------
# 0. Pre-flight checks
# -----------------------------------------------------------------------------
echo "[0/6] Pre-flight checks..."

command -v git >/dev/null 2>&1 || { echo "ERROR: git not found"; exit 1; }
command -v vercel >/dev/null 2>&1 || { echo "ERROR: vercel CLI not found (npm i -g vercel)"; exit 1; }

# Ensure we are on main and the working tree is clean.
CURRENT_BRANCH="$(git -C "${ROOT_DIR}" rev-parse --abbrev-ref HEAD)"
if [ "${CURRENT_BRANCH}" != "main" ]; then
  echo "ERROR: Must be on branch main (currently on ${CURRENT_BRANCH})"
  exit 1
fi

if [ -n "$(git -C "${ROOT_DIR}" status --porcelain)" ]; then
  echo "ERROR: Working tree is not clean. Commit or stash changes before deploying."
  git -C "${ROOT_DIR}" status --short
  exit 1
fi

echo "  Branch: main | Working tree: clean | OK"

# -----------------------------------------------------------------------------
# 1. Push to GitHub (origin) — triggers Render auto-deploy if connected
# -----------------------------------------------------------------------------
echo "[1/6] Pushing to GitHub origin/main..."
git -C "${ROOT_DIR}" push origin main
echo "  Pushed to origin/main"

# -----------------------------------------------------------------------------
# 2. Backend — Render (Docker)
# -----------------------------------------------------------------------------
echo "[2/6] Backend on Render..."
echo "  Ensure the following Render dashboard settings are configured:"
echo "    Service: guides-nepal-backend"
echo "    Dockerfile: backend/Dockerfile.production"
echo "    Health check: /health"
echo ""
echo "  Required Render environment variables (set in Render dashboard):"
echo "    DATABASE_URL, SECRET_KEY, ENV=production,"
echo "    BACKEND_CORS_ORIGINS, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,"
echo "    RESET_PASSWORD_REDIRECT_URL"
echo ""
echo "  After Render deploys, verify:"
echo "    curl -i https://guides-nepal-backend.onrender.com/health"
echo "    # Expect: {\"status\":\"ok\",\"environment\":\"production\"}"
echo ""
echo "  NOTE: Render auto-deploys on push to main when connected via Blueprint."
echo "  If not using Blueprint, create the web service manually in Render and"
echo "  connect this repository."

# -----------------------------------------------------------------------------
# 3. Frontend — Vercel
# -----------------------------------------------------------------------------
echo "[3/6] Frontend on Vercel..."
echo "  Deploying frontend from ${FRONTEND_DIR}..."
(
  cd "${FRONTEND_DIR}"
  vercel --prod --confirm
)
echo "  Frontend deployed. Note the production URL (e.g. https://guides-nepal.vercel.app)."

# -----------------------------------------------------------------------------
# 4. Dashboard — Vercel
# -----------------------------------------------------------------------------
echo "[4/6] Dashboard on Vercel..."
echo "  Deploying dashboard from ${DASHBOARD_DIR}..."
(
  cd "${DASHBOARD_DIR}"
  vercel --prod --confirm
)
echo "  Dashboard deployed. Note the production URL."

# -----------------------------------------------------------------------------
# 5. Update CORS on the backend
# -----------------------------------------------------------------------------
echo "[5/6] Update CORS on Render backend..."
echo "  After frontend/dashboard URLs are known, set BACKEND_CORS_ORIGINS in Render:"
echo "    BACKEND_CORS_ORIGINS=https://<FRONTEND_URL>,https://<DASHBOARD_URL>"
echo "  Saving this triggers an automatic redeploy of the backend."
echo ""
echo "  Also set RESET_PASSWORD_REDIRECT_URL=https://<FRONTEND_URL>/reset-password"

# -----------------------------------------------------------------------------
# 6. Post-deployment verification
# -----------------------------------------------------------------------------
echo "[6/6] Post-deployment verification checklist..."
echo ""
echo "  [ ] GET https://<BACKEND_URL>/health  -> {\"status\":\"ok\",\"environment\":\"production\"}"
echo "  [ ] GET https://<BACKEND_URL>/api/v1/docs -> 404 (docs disabled in production)"
echo "  [ ] Frontend loads at https://<FRONTEND_URL>"
echo "  [ ] Dashboard loads at https://<DASHBOARD_URL>"
echo "  [ ] Register/login works from the deployed frontend"
echo "  [ ] Password-reset emails arrive and redirect correctly"
echo "  [ ] CORS preflight (OPTIONS) succeeds from frontend origin"
echo "  [ ] Security headers present (X-Frame-Options: DENY, HSTS, etc.)"
echo ""
echo "============================================================"
echo " Deployment orchestration complete."
echo "============================================================"