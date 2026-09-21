# Routing Structure

Base: `/dashboard`

- `/dashboard/login` — Unified login
- `/dashboard/admin/*` — Admin-only routes (top role, includes governance pages)
  - index — Overview
  - `platform`, `hosts`, `guides`, `host-applications`, `support-tickets`, `hierarchy`,
    `intelligence`, `customers`, `content`, `pages`, `blog`, `guides-content`, `media`,
    `seo`, `administration`, `website-content`, `analytics`, `revenue`, `settings`
- `/dashboard/host/*` — Host-only routes
  - index — Overview
  - `guides`, `tours`, `bookings`, `earnings`, `performance`
- `/dashboard/regional-head/*` — Regional Head routes
  - index — Overview
  - `applications`, `region`, `customers`
- `/dashboard/customer-support/*` — Customer Support routes
  - index — Overview
  - `tickets`, `faq`, `customers`
- `/dashboard/content-manager/*` — Content Manager routes
  - index — Overview
  - `pages`, `blog`, `guides-content`, `website-content`, `media`, `seo`

Guards:
- `RequireAuth` fetches role via `/auth/me`
- `RequireRole` ensures only the correct role layout/page renders

> The former `/dashboard/super-admin/*` and `/dashboard/guide/*` route trees were
> removed; the governance pages they hosted now live under `/dashboard/admin/*`.
