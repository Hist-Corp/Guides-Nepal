# Development Setup Guide

Get the Guides Nepal platform running locally in under 10 minutes.

## Prerequisites

- **Node.js** 18+ and npm (frontend, dashboard, tooling)
- **Python** 3.11+ and pip (backend; developed against 3.13)
- **PostgreSQL** 15+ locally, **or** a Supabase project (production database)
- **Git**
- Optional: **Docker**/Docker Compose, **Ollama** (local AI chat), **Playwright** browsers for E2E tests

## Quick Start (automated)

```bash
git clone https://github.com/Hist-Corp/Guides-Nepal.git
cd "Guides Nepal"
npm run setup        # node scripts/setup.js — checks prerequisites, creates .env files, installs all deps
npm run prepare      # installs husky git hooks
```

## Manual Setup

### 1. Frontend (public website — Vite + React)

```bash
cd frontend
npm install
cp .env.example .env   # see Environment section below
npm run dev            # http://localhost:5175
```

### 2. Backend (FastAPI)

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows (bash: source .venv/bin/activate)
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload    # http://localhost:8000
```

The backend auto-creates missing tables on startup (`Base.metadata.create_all`).
For managed migrations use Alembic: `alembic upgrade head` (see `backend/migrations/`).
OpenAPI docs are available at `http://localhost:8000/api/v1/docs` when `ENV=development`.

### 3. Dashboard (RBAC app — separate Vite app)

```bash
cd dashboard
npm install
cp .env.example .env
npm run dev            # http://localhost:5176
```

### 4. Run everything at once

From the repo root:

```bash
npm run dev            # frontend + backend + dashboard via concurrently
```

Also available: `start-all.bat` / `start-frontend.bat` / `start-backend.bat` / `start-dashboard.bat`, `run-project.ps1`, and a `Makefile`.

### 5. Docker Compose (alternative)

```bash
docker compose up --build
```

Starts: frontend http://localhost:5175, dashboard http://localhost:5176, backend http://localhost:8000, PostgreSQL http://localhost:5432 (user `postgres`, db `guides_nepal`).

## Environment Variables

### backend/.env (see backend/.env.example)

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/guides_nepal
SECRET_KEY=your-development-secret-key
ENV=development
BACKEND_CORS_ORIGINS=http://localhost:5175,http://localhost:5176
# AI chat (Maila Dai)
AI_PROVIDER=auto            # auto | ollama | openai
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:latest
OPENAI_API_KEY=
# OAuth (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
# Supabase (password-reset email verification on the backend)
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
RESET_PASSWORD_REDIRECT_URL=http://localhost:5175/reset-password
```

Note: in production the backend refuses to start if `SECRET_KEY` is the dev placeholder, rejects non-HTTPS CORS origins, and disables the API docs. See [SECURITY.md](../SECURITY.md).

### frontend/.env (see frontend/.env.example)

```env
VITE_API_URL=http://localhost:8000
FRONTEND_OAUTH_REDIRECT=http://localhost:5175/auth/callback
VITE_GOOGLE_OAUTH_URL=http://localhost:8000/api/v1/auth/oauth/google/start
VITE_FACEBOOK_OAUTH_URL=http://localhost:8000/api/v1/auth/oauth/facebook/start
VITE_ENABLE_AI=true
```

### dashboard/.env (see dashboard/.env.example)

```env
VITE_SUPABASE_URL=https://your-supabase-url.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
# VITE_API_BASE_URL=http://localhost:8000/api/v1
# VITE_DEV_FAKE_LOGIN=0   # dev-only fake login; never enable in production
```

## Development Workflow (root scripts)

The root `package.json` orchestrates all three packages:

```bash
npm run dev                 # all services
npm run build               # build frontend + dashboard + backend docker image
npm run test                # vitest (frontend, dashboard) + pytest (backend)
npm run test:e2e            # Playwright E2E suite (tests/e2e)
npm run lint                # ESLint (frontend, dashboard) + ruff (backend)
npm run format              # Prettier (frontend, dashboard) + black/ruff (backend)
npm run typecheck           # tsc (frontend, dashboard) + mypy (backend)
npm run clean               # remove dist/node_modules/venv caches
```

Per-package testing:

```bash
cd frontend  && npm run test         # vitest
cd dashboard && npm run test         # vitest
cd backend   && pytest --cov=app     # pytest + coverage
```

E2E specs live in `tests/e2e/specs/` (auth, dashboard, home-buttons, navigation) and run with Playwright.

## Code Quality

- **Frontend/Dashboard**: TypeScript strict, ESLint, Prettier (root `.prettierrc` + lint-staged via husky).
- **Backend**: Black (format), Ruff (lint), Mypy (types), Bandit (security scan), pytest.
- CI workflows in `.github/workflows/`: `frontend-ci.yml`, `dashboard-ci.yml`, `backend-ci.yml`.
- Pre-commit hooks via husky + lint-staged run on staged files.

## Common Issues

| Issue | Fix |
|-------|-----|
| Port already in use | Kill the process, or change the port in the respective `vite.config.ts` |
| DB connection fails | Check `DATABASE_URL`; ensure PostgreSQL is running or use Supabase |
| AI chat unavailable | Install Ollama and pull `llama3.2`, or set `OPENAI_API_KEY` |
| Node modules broken | `rm -rf node_modules package-lock.json && npm install` |
| Python env broken | Delete `backend/.venv` and recreate |

## Documentation Map

- [README.md](../README.md) — project overview, roles, API endpoints
- [DEPLOYMENT.md](../DEPLOYMENT.md) — Vercel/Render/Supabase/Docker deployment
- [SECURITY.md](../SECURITY.md) — security implementation and checklist
- [ARCHITECTURE.md](./ARCHITECTURE.md), [FOLDER_STRUCTURE.md](./FOLDER_STRUCTURE.md) — codebase layout
- `backend/docs/`, `dashboard/docs/`, `documents/` — deeper design docs
