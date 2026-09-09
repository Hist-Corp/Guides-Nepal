# Guides Nepal — Dashboard

RBAC dashboard for the staff roles of Guides Nepal: **Super Admin, Admin, Regional Head,
Customer Support, Content Writer, Host, and Guide**. It is a separate Vite + React 18 + TypeScript
app, isolated from the public website, and consumes the FastAPI backend (`/api/v1`).

## Quick start

```bash
npm install
cp .env.example .env     # set VITE_API_BASE_URL / Supabase values as needed
npm run dev              # http://localhost:5176
```

From the repo root you can also run 
pm run dev:dashboard` (or 
pm run dev` for all services).

## Environment (see .env.example)

- `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_API_BASE_URL` — backend API base (defaults to `http://localhost:8000/api/v1` in dev)
- `VITE_DEV_FAKE_LOGIN` — dev-only fake login toggle; never enable in production

## Roles & routing

Each role has a dedicated area under `src/` with its own routes and guards:

| Role | Area folder | Route prefix |
|------|-------------|--------------|
| Super Admin | `src/superadmin/` | `/super-admin/*` |
| Admin | `src/admin/` | `/admin/*` |
| Regional Head | `src/regionalhead/` | `/regional-head/*` |
| Customer Support | `src/support/` | `/customer-support/*` |
| Content Writer | `src/writer/` | `/content-writer/*` |
| Host | `src/host/` | `/host/*` |
| Guide | `src/guide/` | `/guide/*` |

Role definitions mirror the backend (`backend/app/core/roles.py`); route protection lives in
`src/guards/`. Details: [docs/ROLES.md](./docs/ROLES.md), [docs/ROUTING.md](./docs/ROUTING.md),
[docs/PERMISSIONS.md](./docs/PERMISSIONS.md), [docs/IA.md](./docs/IA.md),
[docs/UX.md](./docs/UX.md), [docs/SCALABILITY.md](./docs/SCALABILITY.md).

## Architecture

- `src/auth/`, `src/guards/` — authentication flows and per-role route protection
- `src/components/`, `src/components/forms/` — reusable UI (KPICard, Table, BarChart, DonutChart, Badge, SchedulePanel, Modal) and form primitives
- `src/layouts/` — dashboard shells
- `src/services/` — typed API clients for the backend
- `src/state/` — auth/role stores (Zustand)
- `src/mock/` — development fixtures for tables and charts (`src/mock/data.ts`)

## Scripts

```bash
npm run dev          # dev server on port 5176
npm run build        # type-check + production build
npm run typecheck    # tsc --noEmit
npm run lint         # ESLint
npm run test         # Vitest
npm run test:coverage
npm run seed:admin   # dev-only admin seeding (scripts/seed-admin.js) — never run against production
```

## Security & secrets

- Never commit production credentials or `.env` files.
- The seed script contains a dev password for local seeding only.
- The backend enforces the same role model server-side; dashboard guards are UX, not the security boundary.

## Contribution

- Feature branches + PRs against the default branch; keep UI changes in the `dashboard` package.
- Run 
pm run typecheck && npm run lint && npm run test` before opening a PR.
- Add/extend Vitest tests in `src/test/` for new shared components.
