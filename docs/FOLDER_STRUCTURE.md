# Project Folder Structure

Organization of the Guides Nepal monorepo.

```
guides-nepal/
├── frontend/                # Customer-facing web app (Vite + React 18 + TS)
│   ├── public/images/       # Static assets (incl. nepal/ city imagery)
│   └── src/
│       ├── components/      # auth/, common/, home/ — reusable UI
│       ├── config/          # Frontend config (API URLs, security)
│       ├── contexts/        # CurrencyContext, CartContext
│       ├── data/            # Static catalog data + shared TS types
│       ├── hooks/           # Custom React hooks
│       ├── pages/           # Route targets
│       │   ├── kathmandu/ pokhara/ lalitpur/ bhaktapur/ bharatpur/   # per-city pages
│       │   ├── host/ user/ auth/ food/ cooking/                       # feature pages
│       │   └── HomePage, SearchPage, ExperiencePage, LocalProfilePage, ...
│       ├── services/        # guidesApi.ts, publicApi.ts, cms.ts — API clients
│       ├── store/           # Zustand stores (auth, profile, booking, ui)
│       ├── styles/          # Tailwind + global CSS
│       ├── test/            # Vitest component/page tests
│       └── utils/           # cn.ts (classname merge), currencyConverter.ts
├── dashboard/               # RBAC dashboard (Vite + React 18 + TS, port 5176)
│   ├── docs/                # IA.md, ROLES.md, ROUTING.md, PERMISSIONS.md, UX.md, SCALABILITY.md
│   └── src/
│       ├── admin/           # Admin area (top role) + governance pages
│       ├── regionalhead/    # Regional Head area
│       ├── support/         # Customer Support area
│       ├── writer/          # Content Manager area
│       ├── host/            # Host area
│       ├── auth/ guards/    # Auth flows and role guards
│       ├── components/forms/# Shared dashboard components (KPICard, Table, charts, Modal, forms)
│       ├── layouts/ services/ state/ mock/  # Layout, API services, stores, fixtures
│       └── test/            # Vitest tests
├── backend/                 # FastAPI + SQLAlchemy backend
│   ├── app/
│   │   ├── api/v1/          # Routers: auth, bookings, public, ai, profile, admin, content, operations
│   │   ├── core/            # config.py, database.py, security.py, roles.py, middleware.py, dependencies.py
│   │   ├── models/          # User, Guide, Booking, Bookmark, HostApplication, SupportTicket, ...
│   │   ├── schemas/         # Pydantic request/response models
│   │   ├── services/        # AuthService, GuideService, BookingService, BookmarkService
│   │   ├── utils/           # mailer.py etc.
│   │   └── uploads/         # Mounted at /uploads for static files
│   ├── migrations/          # Alembic migrations
│   ├── scripts/             # Health checks, seeders
│   └── tests/               # Pytest suite (test_auth, test_bookings, test_ai, test_health, ...)
├── tests/e2e/               # Playwright E2E specs (auth, dashboard, home-buttons, navigation)
├── scripts/                 # Root automation (setup.js, run-eslint.js) — see scripts/README.md
├── docs/                    # High-level docs (this folder)
├── documents/               # PRD and technical architecture documents
├── .github/workflows/       # frontend-ci.yml, dashboard-ci.yml, backend-ci.yml
├── docker-compose.yml       # db + backend + frontend + dashboard
├── render.yaml              # Render blueprint for the backend
└── start-all.bat etc.       # Windows convenience launchers (+ run-project.ps1, Makefile)
```

## Key directories

### frontend/src/pages/
Route targets mapped in `frontend/src/App.tsx`. City sub-folders (`kathmandu/`, `pokhara/`,
`lalitpur/`, `bhaktapur/`, `bharatpur/`) each contain a landing page, an experiences listing,
and a per-experience detail page (`/city/<city>/experience/:slug`).

### frontend/src/services/
Typed API clients: `guidesApi.ts` (guides directory), `publicApi.ts` (public content, with
offline queue for form submissions), `cms.ts` (CMS-managed content).

### backend/app/core/roles.py
Canonical 5-role dashboard hierarchy (`admin > content-manager > regional-head >
customer-support > host`) with `has_access()` role guards. Admin implicitly passes
every guard; travelers use the public site and are not part of the hierarchy.

> The former `super-admin` and `guide` roles were removed; existing records using the
> previous `content-writer` name still resolve to `content-manager`.

### dashboard/src/<area>/
One folder per role area (`admin/`, `regionalhead/`, `support/`, `writer/`, `host/`)
plus `guards/` for route protection. See `dashboard/docs/ROLES.md` and
`dashboard/docs/ROUTING.md`.
