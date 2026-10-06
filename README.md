# Guides Nepal

A modern, open-source platform for independent travelers and local guides in Nepal. Guides Nepal combines curated city experiences (Kathmandu, Pokhara, Lalitpur, Bhaktapur, Bharatpur) with a simple booking flow, user profiles, and an AI chat assistant to help visitors plan trips.

This repository contains a Vite + React frontend, an optional dashboard app, and a FastAPI backend.

---

## Quick links

- Live frontend (dev): http://localhost:5175
- Backend (dev): http://localhost:8000
- Dashboard (dev): http://localhost:5176

---

## User Roles & Permissions

Guides Nepal has a comprehensive role-based access control (RBAC) system with **5 dashboard
consoles** (admin, content-manager, regional-head, customer-support, host), plus two
non-dashboard roles: `traveler` for the public site and `guide` for the public frontend.
Travelers and guides do not sign in to the dashboard.

The single source of truth for roles is `backend/app/core/roles.py`. Every API guard
resolves through `has_access()`, which implicitly authorizes `admin` for all guards and
requires every other role to be named explicitly.

`dashboard/src/utils/roles.ts` mirrors only the five console roles. `normalizeRole()`
deliberately returns `null` for `guide` and `traveler`, so those accounts are refused at
the dashboard sign-in screen instead of reaching an empty console.

### Role Hierarchy

```
Admin
    ├── Content Manager
    ├── Regional Head (by region)
    ├── Customer Support
    └── Host

Non-dashboard
    ├── Guide   (public frontend only)
    └── Traveler (public site only)
```

### Complete User Roles Table

| Role | Dashboard Access | Key Permissions |
|------|-----------------|-----------------|
| **Admin** | `/dashboard/admin/*` | Full system access, manage users, hosts, guides, content, host applications, support tickets, analytics, revenue reports, role hierarchy |
| **Content Manager** | `/dashboard/content-manager/*` | Create/edit pages, blog posts, guides content, media uploads, SEO settings |
| **Regional Head** | `/dashboard/regional-head/*` | Manage host applications for assigned region, view regional information |
| **Customer Support** | `/dashboard/customer-support/*` | View and manage support tickets, respond to customer inquiries |
| **Host** | `/dashboard/host/*` | Manage own tours, view bookings, track earnings, view performance metrics |
| **Guide** | *none — no dashboard console* | Public frontend only. Scoped API at `GET /api/v1/guide/me` (`require_role("guide")`) returns its own record and granted capabilities |
| **Traveler** | *none — no dashboard console* | Browse experiences, book tours, chat with guides, view profiles (default role) |

> **Note:** The former Super Admin role was removed. `guide` is a backend/API role with no
> dashboard console; admins still see guide accounts in **Administration** with their real
> role, and can assign or revoke the role. Admin is the top of the hierarchy and holds full
> system access.

### Pre-configured Seed Users

The system comes with the following pre-configured users for development and testing:

| Email | Role | Password | Region/Scope |
|-------|------|----------|--------------|
| `admin@guides-nepal.com` | Admin | `Admin@12345` | Full system |
| `content@guides-nepal.com` | Content Manager | `Content@2024` | Pages · Blog · Media · SEO |
| `regional@guides-nepal.com` | Regional Head | `Regional@2024` | Kathmandu Valley |
| `support@guides-nepal.com` | Customer Support | `Support@2024` | Tickets · FAQ |
| `host@guides-nepal.com` | Host | `Host@2024` | Tours · Bookings · Earnings |
| `guide@guides-nepal.com` | Guide | `Guide@2024` | Public frontend · **cannot sign in to the dashboard** |
| `traveler@guides-nepal.com` | Traveler | `Traveler@2024` | Public site only · **cannot sign in to the dashboard** |

The first five appear in the dashboard role dropdown and land on their console. The guide
and traveler accounts are seeded for public-frontend/API testing only.

Run `python seed_credentials.py` from `backend/` to create or reset the staff/console
accounts, or `python seed_traveler_guide.py` to create or reset just the traveler +
guide test accounts. Both scripts are idempotent — they upsert by email, so they are
safe to re-run.

> **⚠️ Security Notice:** These are development-only credentials. Always change default passwords before deploying to production. For security, these credentials are stored in `backend/.env` and should never be committed to version control.

### Traveller & Guide Test Credentials (public frontend)

> **Spelling note:** "Traveller" (British English) maps to the codebase role
> `traveler` (American English, see `backend/app/core/roles.py`).

| Role | Email (username) | Password | Where to sign in |
|------|------------------|----------|------------------|
| Traveller (`traveler`) | `traveler@guides-nepal.com` | `Traveler@2024` | Public frontend login (`http://localhost:5175`, Login modal → Traveller tab) or `POST /api/v1/auth/login` |
| Guide (`guide`) | `guide@guides-nepal.com` | `Guide@2024` | Public frontend login (`http://localhost:5175`, Login modal → Guide tab) or `POST /api/v1/auth/login` |

**Create / reset them:**

```bash
cd backend
python seed_traveler_guide.py
```

**How to use them:**

1. Start the backend and frontend (`.\start-all.bat`, or `cd backend` +
   `uvicorn app.main:app --reload --port 8000` and `cd frontend` +
   `npm run dev -- --port 5175 --host`).
2. Open `http://localhost:5175`, click **Log in**, pick the **Traveller** or
   **Guide** tab, and sign in with the email + password above.
3. Or call the API directly:
   ```bash
   curl -X POST http://localhost:8000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"traveler@guides-nepal.com","password":"Traveler@2024"}'
   ```
4. Neither account can sign in to the dashboard (`http://localhost:5176`) —
   they have no console and are refused at sign-in by design; admins can still
   see them under **Administration**.

### Dashboard Routes by Role

All dashboard routes are served under `/dashboard` (for example the admin overview is at
`/dashboard/admin`). The paths below omit that prefix for readability. Every console is
wrapped in `<RequireAuth>` + `<RequireRole>`, so a role mismatch redirects to
`/dashboard/login` — and the API independently returns `403`.

There are exactly five consoles: admin, content-manager, regional-head, customer-support
and host. `guide` and `traveler` accounts have no console and are refused at sign-in.

#### Public (All Users)
- `/` - Home page
- `/explore` - Explore experiences
- `/search` - Search
- `/city/:cityId` - City pages (Kathmandu, Pokhara, Lalitpur, Bhaktapur, Bharatpur)
- `/local/:id` - Local guide profiles
- `/contact` - Contact page
- `/faq` - FAQ

#### Admin (`admin` role)
- `/admin` - Admin overview
- `/admin/platform` - Platform-wide overview
- `/admin/hosts` - Manage hosts
- `/admin/guides` - Manage guides
- `/admin/host-applications` - Review all host applications
- `/admin/support-tickets` - View all support tickets
- `/admin/hierarchy` - Role hierarchy
- `/admin/intelligence` - Platform intelligence
- `/admin/analytics` - Analytics dashboard
- `/admin/revenue` - Revenue reports
- `/admin/settings` - System settings
- `/admin/content` - Content management

#### Regional Head (`regional-head` role)
- `/regional-head` - Regional overview
- `/regional-head/applications` - Host applications for their region
- `/regional-head/region` - Regional information

#### Customer Support (`customer-support` role)
- `/customer-support` - Support overview
- `/customer-support/tickets` - Support tickets
- `/customer-support/faq` - FAQ management

#### Content Manager (`content-manager` role)
- `/content-manager` - Content overview
- `/content-manager/pages` - Manage pages
- `/content-manager/blog` - Blog management
- `/content-manager/guides-content` - Guides content
- `/content-manager/media` - Media library
- `/content-manager/seo` - SEO settings

#### Host (`host` role)
- `/host` - Host overview
- `/host/guides` - Manage guide profiles
- `/host/tours` - Manage tours
- `/host/bookings` - View bookings
- `/host/earnings` - Earnings dashboard
- `/host/performance` - Performance metrics

### Role Assignment During Registration

Self-registration is allow-listed to `SELF_REGISTERABLE_ROLES` in `backend/app/core/roles.py`,
which is enforced server-side by a validator on the `UserCreate` schema:

- `traveler` - Public-site account (default)
- `host` - Tour host

Any other role — including `guide`, `admin`, `content-manager`, `regional-head` and
`customer-support` — is rejected with `422` by `POST /api/v1/auth/register`, because the
request body is client-controlled. Elevated roles are granted by an admin via
`PATCH /api/v1/admin/users/{id}` (which validates against `ADMIN_ASSIGNABLE_ROLES` and
refuses to mass-assign `hashed_password`), or by `backend/seed_credentials.py`.

After registration, hosts must be approved by an admin or regional head before they can access their full dashboard features.

## Key features

- Experience browsing with consistent booking UI
- JWT + OAuth authentication (Google, Facebook)
- Booking management and host workflows
- User profiles with avatar/photo uploads and bookmarks
- AI chat assistant (Ollama local model or OpenAI) with streaming support
- Role-based admin dashboard with 5 consoles (Admin, Content Manager, Regional Head, Customer Support, Host)
- Mobile-first responsive UI using Tailwind CSS

---

## Tech stack

- Frontend: React 18, TypeScript, Vite, Tailwind CSS
- Backend: Python, FastAPI, SQLAlchemy, Alembic
- Database: SQLite (development) / PostgreSQL (production)
- AI: Ollama (local) or OpenAI
- Deployment: Vercel (frontend), Render (backend)

---

## Quick start (local development)

Prerequisites:
- Node.js 18+ and npm 8+
- Python 3.9+
- SQLite 3+ (for development) or PostgreSQL 12+

### Starting All Services

The project includes batch files for easy startup on Windows:

```bash
# Start all services (frontend, backend, dashboard)
.\start-all.bat

# Or start individual services:
.\start-frontend.bat    # Frontend on port 5175
.\start-backend.bat     # Backend on port 8000
.\start-dashboard.bat   # Dashboard on port 5176
```

### Manual Startup

**Frontend:**
```bash
cd frontend
npm run dev -- --port 5175 --host
```

**Backend:**
```bash
cd backend
.venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```

**Dashboard:**
```bash
cd dashboard
npm run dev -- --port 5176 --host
```

### Access Points
- Frontend: http://localhost:5175
- Dashboard: http://localhost:5176
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/api/v1/docs

### Default Credentials

After running `seed_credentials.py` you can sign in to any console with these
pre-seeded accounts:

**Admin Login:**
- Email: `admin@guides-nepal.com`
- Password: `Admin@12345`

**Content Manager Login:**
- Email: `content@guides-nepal.com`
- Password: `Content@2024`

**Regional Head Login:**
- Email: `regional@guides-nepal.com`
- Password: `Regional@2024`
- Region: Kathmandu Valley

**Customer Support Login:**
- Email: `support@guides-nepal.com`
- Password: `Support@2024`

**Host Login:**
- Email: `host@guides-nepal.com`
- Password: `Host@2024`

**Traveller Login (public frontend only — no dashboard console):**
- Email: `traveler@guides-nepal.com`
- Password: `Traveler@2024`

**Guide Login (public frontend only — no dashboard console):**
- Email: `guide@guides-nepal.com`
- Password: `Guide@2024`

Create/reset just these two with `cd backend` + `python seed_traveler_guide.py`.
Sign in at `http://localhost:5175` (Login modal → Traveller/Guide tab) or via
`POST /api/v1/auth/login` — see [Traveller & Guide Test Credentials](#traveller--guide-test-credentials-public-frontend).

See [Pre-configured Seed Users](#pre-configured-seed-users) for the full table. The
dashboard login screen has a role dropdown that pre-fills the five console accounts; the
seeded `guide@guides-nepal.com` account is intentionally absent from that dropdown because
guides have no dashboard console.

---

## Environment variables

### Frontend (.env.local)

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
VITE_API_URL=http://localhost:8000/api/v1
```

### Backend (backend/.env)

```bash
# Environment
ENV=development
LOG_LEVEL=INFO

# Database
DATABASE_URL=sqlite:///./guides_nepal.db
# For production: DATABASE_URL=postgresql://user:password@localhost:5432/guides_nepal

# Server / CORS
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
BACKEND_CORS_ORIGINS=http://localhost:5175,http://localhost:5176

# Security
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
UPLOADS_DIR=./uploads

# Dev seeding (ignored unless ENV=development)
DEV_ALLOW_SEED=true
DEV_SEED_ADMIN_EMAIL=admin@guides-nepal.com
DEV_SEED_ADMIN_PASSWORD=Admin@12345

# OAuth (optional — endpoints return 500 until set)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:8000/api/v1/auth/oauth/google/callback
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
FACEBOOK_REDIRECT_URI=http://localhost:8000/api/v1/auth/oauth/facebook/callback
FRONTEND_OAUTH_REDIRECT=http://localhost:5175

# AI (optional)
AI_PROVIDER=auto
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:latest
OPENAI_API_KEY=

# Supabase (for password reset)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESET_PASSWORD_REDIRECT_URL=http://localhost:5175/reset-password
```

> The OAuth and Supabase blocks are optional in development. Without OAuth credentials
> `GET /api/v1/auth/oauth/{google,facebook}/start` deliberately returns `500`; without
> Supabase, password reset by email is unavailable (local passwords still work).

Never commit secrets or .env files to the repository.

---

## Project layout

```
Guides Nepal/
├── frontend/              # React + Vite + TypeScript frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts (Currency, Cart)
│   │   ├── services/      # API services
│   │   ├── hooks/         # Custom hooks
│   │   ├── data/          # Static data files
│   │   └── styles/        # CSS styles
│   └── ...
├── dashboard/             # Admin dashboard (React + Vite)
│   ├── src/
│   │   ├── admin/         # Admin pages
│   │   ├── regionalhead/  # Regional head pages
│   │   ├── support/       # Support pages
│   │   ├── host/          # Host pages
│   │   ├── writer/        # Content writer pages
│   │   ├── auth/          # Authentication
│   │   ├── layouts/       # Layout components
│   │   ├── guards/        # Auth guards
│   │   └── ...
│   └── ...
├── backend/               # FastAPI backend
│   ├── app/
│   │   ├── api/v1/        # API endpoints (auth, admin, content, host, guide, ...)
│   │   ├── models/        # SQLAlchemy models
│   │   ├── core/          # Config, database, security, roles (RBAC), dependencies
│   │   ├── schemas/       # Pydantic request/response models
│   │   ├── services/      # Business logic
│   │   └── ...
│   ├── tests/             # pytest suite (test_roles.py, test_rbac.py, ...)
│   ├── migrations/        # Alembic migrations
│   ├── seed_credentials.py  # Idempotent dev seed: one account per dashboard role
│   └── ...
├── scripts/               # Utility scripts
├── docs/                  # Documentation
├── start-all.bat          # Start all services (Windows)
├── start-frontend.bat     # Start frontend only
├── start-backend.bat      # Start backend only
├── start-dashboard.bat    # Start dashboard only
└── README.md              # This file
```

---

## Development notes

- Frontend: TypeScript strict mode, ESLint and Prettier configured
- Backend: Use Black, Ruff, and Mypy for formatting and type checks
- Run `npm test` for the full suite (frontend + backend + dashboard)
- Type checks: `npm run typecheck` · Lint: `npm run lint` · Format: `npm run format`

### Tests

| Command | Scope |
|---------|-------|
| `npm test` | Everything: frontend, backend, dashboard |
| `npm run test:frontend` | Public site (Vitest) |
| `npm run test:backend` | Backend (pytest, with coverage) |
| `npm run test:dashboard` | Dashboard (Vitest) |
| `npm run test:e2e` | Playwright end-to-end specs |

RBAC coverage lives in two backend suites worth knowing about:

- `backend/tests/test_roles.py` — the role hierarchy, `has_access()` guards, and the
  self-registerable / admin-assignable allow-lists.
- `backend/tests/test_rbac.py` — end-to-end checks that a public signup cannot mint a
  privileged role, and that `GET /api/v1/guide/me` is reachable by `guide` and `admin`
  only (the dashboard does not consume this endpoint).

### AI Chat Providers
- **Ollama** (recommended for local, privacy-friendly usage)
  - Install and run: `brew install ollama && ollama serve && ollama pull llama3.2`
- **OpenAI**: set `OPENAI_API_KEY` to enable

### API Endpoints
- Base: `/api/v1`
- Auth: `/api/v1/auth/*`
- Bookings: `/api/v1/bookings/*`
- Profile: `/api/v1/profile/*`
- AI: `/api/v1/ai/chat` and `/api/v1/ai/chat/stream`
- Admin: `/api/v1/admin/*`
- Content: `/api/v1/content/*`
- Operations: `/api/v1/operations/*`
- Host: `/api/v1/host/*`
- Guide: `/api/v1/guide/*`

---

## Database Schema (Users Table)

The users table includes the following fields:

| Field | Type | Description |
|-------|------|-------------|
| id | Integer | Primary key |
| email | String | Unique, indexed, required |
| firstName | String | Optional |
| lastName | String | Optional |
| hashed_password | String | Required, stored as hash |
| phone | String | Optional |
| role | String | Default: "traveler" - see [User Roles](#user-roles--permissions). Validated server-side against an allow-list; unknown values are rejected. |
| region | String | For regional heads (e.g., "Kathmandu Valley") |
| bio | String | User biography |
| avatar_url | String | Profile image URL |
| is_active | Boolean | Default: true |
| created_at | DateTime | Auto-generated |
| updated_at | DateTime | Auto-updated |

---

## Deployment

Full instructions live in [DEPLOYMENT.md](./DEPLOYMENT.md).

- **Frontend**: Vercel — root directory `frontend`, build command `npm run build`, output `dist`.
- **Dashboard**: Vercel (separate project) — root directory `dashboard`.
- **Backend**: Render blueprint (`render.yaml`, Dockerfile at `backend/Dockerfile`), health check `/health`.
- **Database**: Supabase PostgreSQL via `DATABASE_URL`.
- **Docker**: `docker-compose up -d` starts db + backend + frontend + dashboard locally.

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes with conventional commits
4. Push and open a Pull Request

Code quality: run `npm run typecheck` and `npm run lint`. Backend checks: `cd backend && ./scripts/run_checks.sh`.

---

## Security

The complete security guide and pre-deployment checklist live in [SECURITY.md](./SECURITY.md).

- Do not commit secrets or .env files
- Password hashing (bcrypt) for all user passwords
- JWT tokens with configurable expiration (default: 30 min access, 7 days refresh)
- Role allow-lists enforced server-side: self-registration is clamped to
  `traveler`/`host`, and admin role changes are validated (no mass assignment of
  `hashed_password`)
- Role checks live in the API layer (`require_role`), not just the dashboard UI
- Production hard-fails: default `SECRET_KEY`, non-HTTPS CORS origins, dev seeding
- Default credentials are for development only — change them in production!

## Documentation Map

- [DEPLOYMENT.md](./DEPLOYMENT.md) — Vercel/Render/Supabase/Docker deployment
- [SECURITY.md](./SECURITY.md) — security implementation and checklist
- [docs/](./docs/) — architecture, folder structure, development setup, API docs
- [dashboard/docs/](./dashboard/docs/) — dashboard roles, routing, permissions, UX
- [backend/docs/](./backend/docs/) — backend guides and API contract
- [documents/](./documents/) — PRD and technical architecture

---

## License

This project is licensed under MIT. See the LICENSE file for details.

---

**Last updated:** 2026-10-05  
**Version:** 1.1.0
