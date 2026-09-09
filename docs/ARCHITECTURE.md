# Technical Architecture

## 1. System Overview

```mermaid
graph TD
  U[Traveler Browser] --> F[Frontend (Vite + React 18, port 5175)]
  S[Staff Browser] --> D[Dashboard (Vite + React 18, port 5176)]

  F -->|HTTP /api/v1| B[FastAPI Backend (port 8000)]
  D -->|HTTP /api/v1| B

  B --> DB[(PostgreSQL / Supabase)]
  B --> AI[Ollama (local) or OpenAI]
  B --> SB[Supabase Auth Emails]
```

## 2. Technology

| Layer | Stack |
|-------|-------|
| Frontend | React 18, TypeScript, Vite 6, React Router DOM 7, Tailwind CSS 3, Zustand 5, axios, @supabase/supabase-js, lucide-react |
| Dashboard | React 18, TypeScript, Vite 5, React Router DOM 6, Tailwind CSS 3, Zustand 4, axios |
| Backend | FastAPI, SQLAlchemy, Alembic, PostgreSQL (Supabase in production), Pydantic v2 settings, JWT (HS256) + bcrypt |
| AI | "Maila Dai" assistant — `AI_PROVIDER=auto` uses Ollama locally (`llama3.2`) and OpenAI (`gpt-4o-mini`) when `OPENAI_API_KEY` is set |
| Tooling | Vitest, Playwright (E2E), pytest, Ruff, Black, Mypy, Bandit, ESLint, Prettier, Husky + lint-staged, GitHub Actions CI |

## 3. API Surface (all under /api/v1)

| Router | Prefix | Purpose |
|--------|--------|---------|
| auth | `/auth` | Register/login, JWT refresh, OAuth (Google/Facebook), password reset via Supabase |
| bookings | `/bookings` | Booking creation and management |
| public | `/` | Guides, experiences, CMS-managed public content |
| ai | `/ai` | Maila Dai chat (`/ai/chat`, `/ai/chat/stream`) |
| profile | `/profile` | User profile management |
| admin | `/admin` | Admin operations (users, hosts, guides, applications) |
| content | `/content` | CMS pages, blog posts, media, SEO settings |
| operations | `/operations` | Support tickets and operational data |

Health: `GET /health`, `GET /api/v1/health`. OpenAPI docs at `/api/v1/docs` only when `ENV=development`.

## 4. RBAC

Roles defined in `backend/app/core/roles.py`:

```
super-admin > admin > content-writer > regional-head > customer-support > host > guide > traveler
```

All role guards go through `has_access()`; super-admin implicitly passes every guard. The
dashboard exposes one area per role (`superadmin/`, `admin/`, `regionalhead/`, `support/`,
`writer/`, `host/`, `guide/`) behind auth guards; travelers use the public site.

## 5. Frontend Data Flow

- **Guides/experiences**: served by the backend (`/api/v1/public/*`) and consumed via typed
  clients in `frontend/src/services/` (`guidesApi.ts`, `publicApi.ts`, `cms.ts`).
- **CMS content**: pages/blog/media managed through `/api/v1/content` and rendered on the
  public site; `publicApi.ts` queues form submissions offline and re-delivers them on load.
- **State**: Zustand stores (`authStore`, `profileStore`, `bookingStore`, `uiStore`) plus
  React contexts for currency and cart (`frontend/src/contexts/`).
- **Auth**: JWT-based; OAuth callbacks land on `/auth/callback`; password reset on
  `/reset-password` (link emailed via Supabase).
- **Validation**: Pydantic schemas on the backend; light client-side validation for UX.

## 6. Backend Design

- Layered: routers (`api/v1/`) -> services (`services/`) -> SQLAlchemy models (`models/`),
  with Pydantic schemas between layers.
- Middleware stack in `app/main.py`: SecurityHeaders, RequestLogging, InputValidation,
  HTTPSEnforcement, then CORS (strict origin allow-list).
- Tables are created on startup (`Base.metadata.create_all`); Alembic manages migrations.
- Security utilities (`core/security.py`): bcrypt hashing, JWT creation/verification, input
  sanitization, password-policy enforcement. Settings in `core/config.py` fail fast on
  insecure production configs.

## 7. Testing & CI

- Backend: pytest with coverage (`backend/tests/`).
- Frontend/dashboard: Vitest + Testing Library (`src/test/`).
- E2E: Playwright (`tests/e2e/specs/`: auth, dashboard, home-buttons, navigation).
- CI: `.github/workflows/` runs lint, typecheck, tests, and builds for all three packages on push.

## 8. Build & Deployment

- Frontend and dashboard: Vercel (root dirs `frontend/` and `dashboard/`, output `dist`).
- Backend: Render Docker service via `render.yaml` + `backend/Dockerfile`; health check `/health`.
- Database: Supabase PostgreSQL via `DATABASE_URL`.
- Local/self-hosted: `docker-compose.yml` (db, backend, frontend, dashboard).

See [DEPLOYMENT.md](../DEPLOYMENT.md) and [SECURITY.md](../SECURITY.md).
