# Guides Nepal — Dashboard

Production-ready RBAC dashboard for Admin, Host, Guide, and Content Writer. The dashboard is isolated from the public website and consumes the existing backend APIs.

This README documents local setup, development scripts, routing/roles, and next steps for wiring the UI to backend endpoints.

## Quick start

1. Install dependencies

```bash
npm install
```

2. Run in development mode

```bash
npm run dev
```

3. Open the app

Visit: http://localhost:5174/dashboard

## Environment

- Copy from `.env.example` (if present) to `.env` and provide any API URL or keys required for local development.
- For local seeding of an admin user (development only) the repo contains a seeding script — see Scripts below. Do NOT commit real credentials.

## Roles and routing

- Admin: `/dashboard/admin/*`
- Host: `/dashboard/host/*`
- Guide: `/dashboard/guide/*`
- Content Writer: `/dashboard/content-writer/*`

See docs for details: [ROLES.md](./docs/ROLES.md), [ROUTING.md](./docs/ROUTING.md), [PERMISSIONS.md](./docs/PERMISSIONS.md)

## Visual design & components

Design intent:

- Reference-style dashboard: hero greeting, KPI cards with deltas, charts, tasks, schedule
- Reusable components: KPICard, Table, BarChart, DonutChart, Badge, SchedulePanel, Modal
- Theme colors and tokens are defined in the Tailwind config

See [UX.md](./docs/UX.md) and [IA.md](./docs/IA.md) for layout and information architecture.

## Admin actions (UI-level)

- Hosts: Add, Edit, Suspend, Promote, Remove
- Guides: Add, Edit, Verify, Promote, Suspend, Remove
- Content Writers: Add, Edit, Suspend, Remove

All actions are implemented in the UI with modals and forms; they are currently wired to local UI state and mock data. The next step is to connect them to backend endpoints with proper RBAC.

## Mock data

Realistic datasets populate tables and charts to aid development and design. Mock data location:

- `dashboard/src/mock/data.ts`

If you need to extend the mock dataset, add entries there and update the UI fixtures.

## Scripts

- Typecheck: `npm run typecheck`
- Dev: `npm run dev`
- Seed admin (dev-only): `npm run seed:admin`

Note: `scripts/seed-admin.js` contains a dev password for local seeding. Do not use this in production; keep `.env` secrets safe.

## Testing & type-safety

- The project includes TypeScript types for components and APIs. Run the type checker before opening a PR: `npm run typecheck`.

## Contribution and workflow

- Use feature branches and create pull requests against the repository default branch.
- Keep UI changes confined to the `dashboard` package when possible.
- Add unit tests or component storybook entries for new shared components.

## Security & secrets

- Never commit production credentials or `.env` files.
- Local seed scripts are only for development and must not run against production systems.

## Next steps

- Wire Admin actions to backend endpoints with RBAC enforcement
- Add filters, search, and pagination on data tables
- Add export and bulk actions with confirmation modals
- Add E2E tests for core admin flows

---

If you want any specific content added (installation with Docker, CI steps, or sample screenshots), tell me what to include and I will update this file.