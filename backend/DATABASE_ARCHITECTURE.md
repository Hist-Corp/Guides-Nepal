# DATABASE ARCHITECTURE — Guides Nepal

**Version:** 1.0 · **Date:** 2026-10-18

---

## 1. DESIGN PRINCIPLES

| Principle | Application |
|---|---|
| **Preserve** | Existing integer PKs, `users.role` as the single RBAC source, `host_bookings` semantics, integer `bookings.id`, soft-delete `is_active`, seed scripts |
| **Portability** | SQLite for dev, PostgreSQL for prod. Use portable types (VARCHAR, JSONB on PG, CHECK constraints) that survive `create_all()` on both |
| **Integrity** | DB-level CHECK constraints for capacity bounds and status values; no reliance on service-only enforcement |
| **Transactionality** | Booking transitions use application-level `SAVEPOINT` on SQLite (where nested transactions are unsupported) and atomic SQL on PG |
| **Data retention** | Bookings and financial history keep `ON DELETE` policy: `SET NULL` for reference foreign keys, explicit app-level cleanup |
| **Security** | No secrets in DB; bcrypt for passwords; no raw tokens; `credential_token_hash` stores SHA-256 only |

---

## 2. DATA OWNERSHIP AND FLOW

```text
                  ┌──────────────┐
                  │  users       │
                  │  (all users) │
                  └──────┬───────┘
                         │ 1:N
        ┌────────────────┼────────────────┐
        │                │                │
   ┌────▼────┐      ┌────▼────┐      ┌────▼────┐
   │guide_    │      │host_    │      │bookings │
   │listings  │      │applications│     │(traveler│
   │(listing) │      │(host)   │      │  bookings)│
   └─────────┘      └─────────┘      └─────────┘
        │                │                │
   ┌────▼────┐      ┌────▼────┐      ┌────▼────┐
   │guide_   │      │host_    │      │host_    │
   │profiles │      │guides   │      │tours    │
   └─────────┘      └─────────┘      └─────────┘
        │
   ┌────▼────┐
   │guide_   │
   │status_  │
   │updates  │
   └─────────┘
```

**Ownership rules:**
- A `user` owns `guide_listings`, `guide_profiles`, `guide_status_updates`.
- A `user` with role `host` owns `host_applications`, `host_experiences`,
  `host_tours`, `host_guides`, `host_experience_guides`.
- A `user` (traveler) owns `bookings` where `user_id` = their id.
- A `user` (guide) owns `bookings` where `guide_user_id` = their id.
- A `user` owns `bookmarks` and `support_tickets` where `customer_email` = their email.

---

## 3. RELATIONSHIP AND DELETION STRATEGY

| Relationship | FK | `ondelete` | Rationale |
|---|---|---|---|
| `bookings.user_id -> users.id` | `user_id` | `CASCADE` | Canceling a user deletes their booking history (reversible via audit) |
| `bookings.guide_user_id -> users.id` | `guide_user_id` | `SET NULL` | A guide account may be deactivated; booking references survive |
| `guide_listings.guide_user_id -> users.id` | `guide_user_id` | `CASCADE` | Deleting a guide account removes their listings (reversible via seed) |
| `guide_profiles.guide_user_id -> users.id` | `guide_user_id` | `CASCADE` | One profile per user |
| `guide_status_updates.guide_user_id -> users.id` | `guide_user_id` | `CASCADE` | Real-time feed tied to guide |
| `experience_proposals.guide_user_id -> users.id` | `guide_user_id` | `CASCADE` | Proposal belongs to guide |
| `experience_change_requests.guide_user_id -> users.id` | `guide_user_id` | `CASCADE` | CR belongs to guide |
| `host_applications.user_id -> users.id` | `user_id` | `SET NULL` | Application may outlive the login account |
| `host_guides.host_id -> users.id` | `host_id` | `CASCADE` | Host-owned records |
| `host_guides.guide_user_id -> users.id` | `guide_user_id` | `SET NULL` | Guide account (if any) does not block host record |
| `support_tickets` (customer reference) | `customer_email` | (no FK) | Customer email is a reference, not a relation, for privacy |

**Business rules reflected in FKs:**
- Booking history persists (`CASCADE` only deletes the booking, not the user).
- Guide deactivation does not orphan bookings (host stays linked).
- A rejected host application does not delete its `users` row (separate `users` table)
  and does not cascade (approval state is preserved in `host_applications`).

---

## 4. TRANSACTION STRATEGY

### 4.1 Booking lifecycle (critical path)

```text
create_booking -> (validate) -> INSERT booking
  -> UPDATE guide_listings SET booked_guests = booked_guests + guests
     (atomic, within transaction)

cancel_booking  -> (validate) -> UPDATE bookings SET status = cancelled
  -> UPDATE guide_listings SET booked_guests = booked_guests - guests
     (atomic, within transaction)

accept / reject / complete  -> UPDATE bookings SET status
  -> no capacity change for accept/reject; complete triggers cancellation flow
```

### 4.2 Capacity adjustment via `booked_delta`

- `booked_delta > 0`: travelers join -> `booked_guests = booked_guests + booked_delta`
- `booked_delta < 0`: travelers cancel -> `booked_guests = booked_guests + booked_delta`
- Bounds enforced: `booked_guests >= 0` AND `booked_guests <= max_guests`.
- The frontend's `booked_delta` is **never trusted**. The server re-derives the range
  from the actual booking transition (e.g. accepting a booking of N guests).

### 4.3 Concurrency guards (PostgreSQL)

- The `booked_guests <= max_guests` CHECK constraint blocks invalid writes at the DB.
- The application uses `SAVEPOINT` on SQLite and direct SQL `UPDATE ... RETURNING`
  with `SELECT ... FOR UPDATE` on PostgreSQL for atomic capacity updates.

### 4.4 SQLite compatibility

- SQLite does not support `SAVEPOINT` rollback to a savepoint if the outer
  transaction is closed; the driver uses `with engine.begin()` for atomic writes.
- SQLite's `ON DELETE CASCADE` works when `PRAGMA foreign_keys=ON` is set; the app
  currently does not enable this globally, so the app-layer deletes children first.

---

## 5. ROLES AND AUTHORIZATION INTEGRATION

| Component | Mechanism |
|---|---|
| Role definitions | `backend/app/core/roles.py` |
| Role validation | `SELF_REGISTERABLE_ROLES`, `ADMIN_ASSIGNABLE_ROLES` allow-lists |
| Route guards | `app.core.dependencies.require_role()` |
| Authentication | bcrypt + JWT (HS256) |
| Authorization | `has_access(user_role, *allowed)` — admin implicitly authorized everywhere |
| User management | Admin endpoints validate `is_assignable_role()` and reject password mass-assignment |

---

## 6. INITIALIZATION AND SEEDING

| Script | Purpose |
|---|---|
| `backend/seed_credentials.py` | Admin staff accounts (idempotent) |
| `backend/seed_traveler_guide.py` | Traveler + guide test accounts |
| `backend/seed_host_dashboard.py` | Host dashboard seed data |

All seed scripts use `GET_OR_CREATE` by email (upsert semantics) and are safe to re-run.

---

## 7. DEPLOYMENT TOPOLOGY

| Environment | Database | ORM engine | Connection pooling |
|---|---|---|---|
| Local dev | SQLite | `sqlite:///./guides_nepal.db` | SQLAlchemy default (threaded) |
| Docker Compose | PostgreSQL 15 | `postgresql+psycopg2://postgres:postgres@db:5432/guides_nepal` | `pool_pre_ping=True` |
| Supabase (prod) | PostgreSQL 14+ | `postgresql+psycopg2://...` (sslmode=require) | `pool_pre_ping=True`, `pool_size` tuned to worker count |
| Render (backend) | PostgreSQL | `postgresql+psycopg2://...` (sslmode=require) | `pool_pre_ping=True` |

**Connection pooling notes:**
- PostgreSQL managed hosts (Supabase/Render) often use transaction pooling, which
  **cannot** hold long-lived connections across requests. `pool_pre_ping=True` avoids
  stale connections. If the app needs `SELECT` across multiple statements in one
  request, it should use a `with engine.connect()` block within the request.
- Do not use `pool_size` far exceeding the database `max_connections` limit.
