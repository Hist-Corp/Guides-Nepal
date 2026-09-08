# Guides Nepal

A modern, open-source platform for independent travelers and local guides in Nepal. Guides Nepal combines curated city experiences (Kathmandu, Pokhara, Lalitpur, Bhaktapur, Bharatpur) with a simple booking flow, user profiles, and an AI chat assistant to help visitors plan trips.

This repository contains a Vite + React frontend, an optional dashboard app, and a FastAPI backend.

---

## Quick links

- Live frontend (dev): http://localhost:5175
- Backend (dev): http://localhost:8000
- Dashboard (dev): http://localhost:5174/dashboard

---

## Key features

- Experience browsing with consistent booking UI
- JWT + OAuth authentication (Google, Facebook)
- Booking management and host/guide workflows
- User profiles with avatar/photo uploads and bookmarks
- AI chat assistant (Ollama local model or OpenAI) with streaming support
- Role-based admin dashboard (Admin, Host, Guide, Content Writer)
- Mobile-first responsive UI using Tailwind CSS

---

## Tech stack

- Frontend: React 18, TypeScript, Vite, Tailwind CSS
- Backend: Python, FastAPI, SQLAlchemy, Alembic
- Database: PostgreSQL
- AI: Ollama (local) or OpenAI
- Deployment: Vercel (frontend), Render (backend)

---

## Quick start (local development)

Prerequisites:
- Node.js 18+ and npm 8+
- Python 3.9+
- PostgreSQL 12+

Frontend

```bash
# from repo root
npm install
npm run dev
```

Backend

```bash
# create and activate virtual env
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# install backend deps
pip install -r backend/requirements.txt

# set env vars (examples)
export DATABASE_URL="postgresql://user:pass@localhost:5432/guides_nepal"
export SECRET_KEY="your-secret-key"
export ENV="development"

# run server
cd backend
uvicorn app.main:app --reload
```

The frontend development server typically runs on http://localhost:5175 and the backend on http://localhost:8000.

---

## Environment variables

Frontend (.env)

```
VITE_API_URL=http://localhost:8000
FRONTEND_OAUTH_REDIRECT=https://<your-domain>/auth/callback
```

Backend (backend/.env)

```
DATABASE_URL=postgresql://user:password@localhost:5432/guides_nepal
SECRET_KEY=your-secret-key
ENV=development
BACKEND_CORS_ORIGINS=http://localhost:5175,http://localhost:4173
AI_PROVIDER=auto  # auto or ollama
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:latest
OPENAI_API_KEY=your-api-key
```

Never commit secrets or .env files to the repository.

---

## Project layout (high level)

- src/ — Frontend application (pages, components, store, data)
- dashboard/ — Admin dashboard app
- backend/ — FastAPI backend (models, routes, services, migrations)
- public/ — Static assets
- scripts/ — Convenience scripts (setup, seeds)

See the repository tree in this README for detailed file locations.

---

## Development notes

- Frontend: TypeScript strict mode, ESLint and Prettier configured
- Backend: Use Black, Ruff, and Mypy for formatting and type checks
- Run tests with pytest and frontend checks with `npm run check`

AI chat providers
- Ollama (recommended for local, privacy-friendly usage)
  - Install and run: `brew install ollama && ollama serve && ollama pull llama3.2`
- OpenAI: set OPENAI_API_KEY to enable

API endpoints
- Base: /api/v1
- Auth: /api/v1/auth/*
- Bookings: /api/v1/bookings/*
- Profile: /api/v1/profile/*
- AI: /api/v1/ai/chat and /api/v1/ai/chat/stream

---

## Deployment

Frontend: configure Vercel with build `npm run build` and output `dist`.
Backend: Render blueprint provided (render.yaml) — set environment variables and database.
Containerized deployment supported for other providers (Cloud Run, ECS, Fly.io, etc.).

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes with conventional commits
4. Push and open a Pull Request

Code quality: run `npm run check` and `npm run lint` (frontend). Backend checks: `cd backend && ./scripts/run_checks.sh`.

---

## Security

- Do not commit secrets or .env files
- Prefer HTTP-only secure cookies for JWT storage
- Run security scans (Bandit) before production deploy

---

## License

This project is licensed under MIT. See the LICENSE file for details.

---

Last updated: 2026-09-08
Version: 1.0.0
