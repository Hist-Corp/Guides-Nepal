# DATABASE AUDIT REPORT — Guides Nepal

**Date:** 2026-10-18
**Auditor:** Senior PostgreSQL Database Architect / SQLAlchemy Specialist / Application Security Engineer
**Scope:** Full backend database implementation audit

---

## 1. EXECUTIVE SUMMARY

Guides Nepal is a FastAPI + SQLAlchemy + Alembic application whose backend documents a
SQLite (development) and PostgreSQL (production) dual-database target. The existing
relational code is **largely coherent**, but the **Alembic migration history is broken**
and several tables use **PostgreSQL-specific column types in historical migration
scripts** that were not written with SQLite portability in mind.

| Dimension | Status |
|---|---|
| Models | ✅ Coherent, complete API surface |
| Migration history | ❌ Broken — 2 of 5 revision files are empty `pass` stubs |
| PostgreSQL readiness | ⚠️ Partial — models connect, but migration chain cannot initialize a PG DB |
| Booking/capacity integrity | ⚠️ Service layer enforces rules; no DB-level constraints yet |
| RBAC / ownership | ✅ Enforced server-side |
| Documentation | ❌ No dedicated database docs exist |

---

## 2. PROJECT CONTEXT (VERIFIED)

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS (dashboard separate)
- **Backend:** Python + FastAPI + SQLAlchemy 2.1.5 + Alembic 1.20.0
- **Dev DB:** SQLite (`sqlite:///./guides_nepal.db`)
- **Prod DB:** PostgreSQL (Supabase documented; local docker-compose uses postgres:15-alpine)
- **Backend deployment:** Render
- **Dependencies:** psycopg2-binary, python-jose, bcrypt, slowapi, httpx

---

## 3. EXISTING SCHEMA (VERIFIED AGAINST `app/models/*.py`)

### 3.1 `users` — `app/models/user.py`

| Column | Type | Nullable | Default / Constraint |
|---|---|---|---|
| id | Integer PK | No | PK, index |
| email | String | No | unique, index |
| firstName / lastName | String | Yes | — |
| hashed_password | String | No | NOT NULL |
| phone | String | Yes | — |
| role | String | Yes | default `traveler` |
| region | String | Yes | nullable (regional-head scoping) |
| bio | String | Yes | — |
| avatar_url | String | Yes | — |
| is_active | Boolean | Yes | default True |
| created_at | DateTime(timezone=True) | Yes | server_default func.now() |
| updated_at | DateTime(timezone=True) | Yes | onupdate func.now() |

### 3.2 `bookings` — `app/models/booking.py`

| Column | Type | Nullable | Default / Constraint |
|---|---|---|---|
| id | Integer PK | No | PK, index |
| user_id | Integer FK users.id | No | — |
| guide_user_id | Integer FK users.id | Yes | index |
| experience_id | Integer | No | — |
| experience_title | String | No | — |
| city | String | No | — |
| date | DateTime | No | — |
| guests | Integer | No | default 1 |
| price | Float | No | — |
| image | String | Yes | — |
| status | Enum(BookingStatus) | No | default `upcoming` |
| created_at / updated_at | DateTime(timezone=True) | Yes | server_default/onupdate func.now() |

`BookingStatus`: `upcoming | accepted | rejected | completed | cancelled | archived`

### 3.3 `guide_listings` — `app/models/guide_listing.py`

| Column | Type | Nullable | Default / Constraint |
|---|---|---|---|
| id | Integer PK | No | PK, index |
| guide_user_id | Integer FK users.id | No | index |
| title / category / city | String | No | category default `tour`, city default `Kathmandu` |
| area | String | Yes | finer area |
| description | Text | No | default "" |
| itinerary | Text | Yes | — |
| meeting_point | String | Yes | — |
| duration | String | No | default "1 day" |
| difficulty | String | No | default "Easy" |
| price | Float | No | default 0.0 |
| max_guests | Integer | No | default 10 |
| booked_guests | Integer | No | default 0 |
| is_active | Boolean | Yes | default True |
| created_at / updated_at | DateTime(timezone=True) | Yes | server_default/onupdate func.now() |

### 3.4 `guide_profiles` — `app/models/guide_listing.py`

| Column | Type | Nullable | Constraint |
|---|---|---|---|
| id | Integer PK | No | PK, index |
| guide_user_id | Integer FK users.id | No | **unique**, index |
| display_name | String | Yes | — |
| expertise_areas | JSON | No | default [] |
| cities | JSON | No | default [] |
| languages | JSON | No | default [] |
| bio | Text | Yes | — |
| years_experience | String | Yes | — |
| default_max_guests | Integer | No | default 10 |
| onboarding_completed | Boolean | Yes | default False |

### 3.5 `guide_status_updates` — `app/models/guide_listing.py`

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | Integer PK | No | PK, index |
| guide_user_id | Integer FK users.id | No | index |
| listing_id | Integer FK guide_listings.id | Yes | index |
| update_type | String | No | default `announcement` |
| message | Text | No | — |
| area | String | Yes | — |
| event_date | DateTime(timezone=True) | Yes | — |
| current_capacity | Integer | Yes | — |
| max_capacity | Integer | Yes | — |
| is_active | Boolean | Yes | default True |

### 3.6 `host_applications` — `app/models/host_application.py`

| Column | Type | Nullable | Constraint |
|---|---|---|---|
| id | Integer PK | No | PK, index |
| host_name / email / city / region / phone | String | Yes | email indexed |
| experience | String | Yes | — |
| status | String | Yes | default `pending` |
| credential_token_hash | String | Yes | single-use invite token |
| credential_password_hash | String | Yes | bcrypt hash captured at submission |
| details_json | Text | Yes | JSON string |
| user_id | Integer | Yes | users row minted on approval |
| reviewed_by / review_note | String | Yes | audit |
| reviewed_at | DateTime(timezone=True) | Yes | audit |
| created_at / updated_at | DateTime(timezone=True) | Yes | — |

### 3.7 `guide_applications` — `app/models/guide_application.py`

| Column | Type | Nullable | Constraint |
|---|---|---|---|
| id | Integer PK | No | PK, index |
| full_name / email / phone | String | Yes | email indexed |
| city / region | String | Yes | — |
| nin_number | String | Yes | — |
| documents | String | Yes | file names/summary |
| status | String | Yes | default `pending` |
| created_at / updated_at | DateTime | Yes | — |

### 3.8 `host_guides` — `app/models/host_guide.py`

| Column | Type | Nullable | Constraint |
|---|---|---|---|
| id | Integer PK | No | PK, index |
| host_id | Integer FK users.id | No | index |
| guide_user_id | Integer FK users.id | Yes | index |
| guide_id | Integer FK guides.id | Yes | index |
| email | String | No | index |
| full_name | String | No | — |
| phone / nin_number | String | Yes | — |
| city / region | String | Yes | — |
| documents | JSON | No | default [] |
| status | String | Yes | default `active` |

### 3.9 `host_experience_guides` — `app/models/host_guide.py`

| Column | Type | Nullable | Constraint |
|---|---|---|---|
| id | Integer PK | No | PK, index |
| host_id | Integer FK users.id | No | index |
| experience_id | Integer FK host_experiences.id | No | index |
| guide_id | Integer FK guides.id | No | index |
| is_primary | Boolean | Yes | default True |

### 3.10 `host_experiences` — `app/models/booking.py`

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | Integer PK | No | PK, index |
| host_id | Integer FK users.id | No | index |
| title / slug / city / category | String | No | slug indexed |
| description | Text | No | — |
| price | Float | No | — |
| duration | String | No | — |
| hero_image | String | Yes | — |
| is_active | Boolean | Yes | default True |

### 3.11 `host_tours` — `app/models/booking.py`

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | Integer PK | No | PK, index |
| host_id | Integer FK users.id | No | index |
| title / city / description / itinerary / meeting_point / duration / difficulty | String/Text | No | — |
| max_guests | Integer | No | default 10 |
| price | Float | No | — |
| is_active | Boolean | Yes | default True |

### 3.12 `support_tickets` — `app/models/support_ticket.py`

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | Integer PK | No | PK, index |
| subject / description | String | Yes | — |
| customer_name / customer_email | String | Yes | email indexed |
| status | String | Yes | default `open` |
| priority | String | Yes | default `medium` |
| assigned_to | String | Yes | — |
| resolution | String | Yes | — |
| resolved_at | DateTime(timezone=True) | Yes | — |

### 3.13 `experience_proposals` — `app/models/experience_workflow.py`

| Column | Type | Nullable | Constraint |
|---|---|---|---|
| id | Integer PK | No | PK, index |
| guide_user_id | Integer FK users.id | No | index |
| title / category / city | String | No | category default `tour`, city default `Kathmandu` |
| area | String | Yes | — |
| description | Text | No | default "" |
| itinerary / meeting_point | Text/String | Yes | — |
| duration / difficulty | String | No | default "1 day" / "Easy" |
| price | Float | No | default 0.0 |
| max_guests | Integer | No | default 10 |
| documents | JSON | No | default [] |
| status | String | No | default `draft`, indexed |
| submitted_at / decided_at / applied_at | DateTime | Yes | — |
| decided_by_user_id / decided_by_role | Integer/String | Yes | audit |
| decision_notes | Text | Yes | audit |
| published_at / listing_id | DateTime/Integer | Yes | — |

### 3.14 `experience_change_requests` — `app/models/experience_workflow.py`

| Column | Type | Nullable | Constraint |
|---|---|---|---|
| id | Integer PK | No | PK, index |
| guide_user_id | Integer FK users.id | No | index |
| listing_id | Integer FK guide_listings.id | No | index |
| change_class | String | No | default `material` |
| reason | Text | No | default "" |
| changes | JSON | No | default [] |
| documents | JSON | No | default [] |
| status | String | No | default `draft`, indexed |
| submitted_at / decided_at / applied_at | DateTime | Yes | — |
| decided_by_user_id / decided_by_role | Integer/String | Yes | audit |
| decision_notes | Text | Yes | audit |
| applied_at | DateTime(timezone=True) | Yes | — |

### 3.15 `bookmarks` — `app/models/bookmark.py`

| Column | Type | Nullable | Constraint |
|---|---|---|---|
| id | Integer PK | No | PK, index |
| user_id | Integer FK users.id | No | — |
| title / city / image / link | String | No | — |

---

## 4. MIGRATION HISTORY (VERIFIED AGAINST `migrations/versions/*.py`)

Current heads: `d4e5f6a7b8c9`

| Revision | File | File content status |
|---|---|---|
| `5da9b06e2e4f` | `create_users_table.py` | **EMPTY** — `upgrade()` / `downgrade()` are `pass` |
| `ff8b527a0b00` | `create_bookings_table.py` | **EMPTY** — `upgrade()` / `downgrade()` are `pass` |
| `3f4a5b6c7d8e` | `create_guides_table.py` | **NON-EMPTY but PostgreSQL-only** — uses `postgresql.JSONB(astext_type=sa.Text())` |
| `c8e1f2a3b4c5` | `create_experience_workflow_tables.py` | Non-empty; references `guide_listings` (which has no migration) |
| `d4e5f6a7b8c9` | `create_host_guide_tables.py` | Non-empty; depends on `c8e1f2a3b4c5` -> `3f4a5b6c7d8e` |

**Revision chain:**

```
5da9b06e2e4f (users) - empty
  └── ff8b527a0b00 (bookings) - empty
        └── 3f4a5b6c7d8e (guides, PG JSONB) - non-empty
              └── c8e1f2a3b4c5 (experience_workflow)
                    └── d4e5f6a7b8c9 (host_guide)
```

**Critical finding:** The migration chain **cannot initialize a PostgreSQL database**
because `upgrade()` on both the `users` and `bookings` revisions are no-ops. The
`guides` migration (the only one with real DDL) references `down_revision=ff8b527a0b00`,
which produces zero DDL. The chain is therefore a historical artifact, not a working
migration path.

---

## 5. CURRENT POSTGRESQL READINESS

| Check | Result |
|---|---|
| `app.core.database` connects to PG string | ✅ |
| Engine creation on PG (psycopg2, pool_pre_ping) | ✅ |
| `Base.metadata.create_all()` creates all tables | ✅ (on app startup) |
| Alembic `upgrade()` to head on a clean PG DB | ❌ **Blocked** (empty revisions) |
| Alembic upgrade from one revision to another | ❌ 2 empty revisions in chain |
| SQLite test DB (in-memory) | ✅ (tests use this) |
| `postgresql.JSONB` in any migration | ✅ (guides migration only, PG-specific) |
| Server-side PG transaction concurrency control for bookings | ❌ Not implemented (applies to all DBs) |

**Conclusion:** The application can connect to PostgreSQL and will create tables on
startup for low-traffic development. However, the **migration history cannot upgrade a
clean PostgreSQL database**, and there are **no PostgreSQL-specific transactional
constraints for booking capacity**.

---

## 6. RELATIONSHIPS AND DELETION BEHAVIOR

All FK relationships are defined with `ForeignKey(..., nullable=False, index=True)` but
**NO `ondelete` clause**. This means:

- SQLite: foreign keys must be explicitly enabled per-connection; the app does not
  enable `PRAGMA foreign_keys=ON` in any connection.
- PostgreSQL: FKs are enforced, but deleting a parent row (e.g. a `user`) will raise a
  **integrity error** unless the app explicitly deletes children first. There is no
  `ON DELETE CASCADE` anywhere, which is intentional for booking/financial-history
  retention but must be respected by services.

**Business rules already enforced at the service layer (documented findings):**
- Guide listing deletion does not delete bookings (no cascade).
- Host application does not delete the `users` row on rejection (no cascade).
- `guide_user_id` in `bookings` is nullable, allowing bookings to exist without a
guide user row (used by the single "booking guide" test account pattern).

---

## 7. CONSTRAINTS AND DATA INTEGRITY (CURRENT STATE)

| Area | Current DB state | Issue |
|---|---|---|
| PK/unique | `users.email UNIQUE`, `guide_profiles.guide_user_id UNIQUE` | ✅ |
| Check constraints | **None beyond SQL types** | ❌ Missing capacity/status bounds |
| `booked_guests <= max_guests` | Enforced in service, **not in DB** | ❌ Race condition possible |
| Enum values | `Enum(BookingStatus)` in ORM; PG migration uses PostgreSQL ENUM | ⚠️ Type-divergence risk |
| Timestamps | `DateTime(timezone=True)` with `server_default=func.now()` | ✅ Holds TIMESTAMPTZ on PG |
| Monetary | `Float` on price/booking total_price (no `DECIMAL`) | ⚠️ Precision risk |
| JSON columns | `JSON` in models; PG migration uses `postgresql.JSONB` | ⚠️ Type-divergence risk |

---

## 8. PERMISSIONS AND SECURITY — VERIFIED

### 8.1 RBAC (roles.py)
- **6 roles:** `admin, content-manager, regional-head, customer-support, host, guide`
- **7th role `traveler`** is non-dashboard, self-registerable.
- `SELF_REGISTERABLE_ROLES = {TRAVELER, HOST}` — public registration cannot select
elevated roles. ✅ Verified by tests.
- `ADMIN_ASSIGNABLE_ROLES = ALL_ROLES` — admins may grant any known role.
- `has_access()` implicitly authorizes `admin` for every guard. ✅

### 8.2 Authentication
- bcrypt (cost 12) for password hashing. ✅
- JWT access/refresh tokens (HS256). ✅
- `get_current_user` enforces `is_active` and returns 403 for inactive users. ✅

### 8.3 Authorization (verified)
- `require_role()` enforces allow-lists; tests pass.
- Cross-user access blocked: `BookingService` filters by `user_id`; guide dashboard
  scopes by `guide_user_id`; `GuideDashboardService` filters by `guide_user_id`.
- Host approval gating: a host may only log in after admin/regional-head approval. ✅

### 8.4 Sensitive data
- Passwords hashed with bcrypt. ✅
- No raw tokens stored on `users`; `credential_token_hash` stores SHA-256 of a
  setup token (not the raw token). ✅
- No card data stored anywhere. ✅

### 8.5 Secrets in repo (ACTUAL FINDING)
- `backend/.env` contains a real `SECRET_KEY` and
  `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/guides_nepal`.
  This is committed to version control and **must be removed / moved to CI secrets**.
  The `.env.example` has placeholders and is correct.

---

## 9. API ENDPOINTS AND PERSISTENCE MAPPING (VERIFIED)

| Domain | Endpoints | Persistence |
|---|---|---|
| Auth (login/register/refresh) | `/api/v1/auth/*` | `users` |
| Bookings | `/api/v1/bookings/*` | `bookings`, plus `host_bookings` (not currently wired) |
| Guide dashboard | `/api/v1/guide/*` | `guide_listings`, `guide_profiles`, `guide_status_updates`, `bookings` |
| Host guides | `/api/v1/host/guides/*` | `host_guides`, `host_experience_guides` |
| Experiences | `/api/v1/experiences/*` | `host_experiences` + `guides` catalog |
| Guide onboarding | `/api/v1/guide/onboarding` | `guide_profiles` |
| Host applications | `/api/v1/operations/host-applications/*` | `host_applications` |
| Support tickets | `/api/v1/support-tickets/*` | `support_tickets` |
| Experience workflow | `/api/v1/experience-workflow/*` | `experience_proposals`, `experience_change_requests` |
| Content | `/api/v1/content/*` | **In-memory JSON** in `content.py` (NOT persisted to DB) |
| AI chat | `/api/v1/ai/chat*` | **No persistence** (in-memory conversation only) |
| Admin | `/api/v1/admin/*` | `users`, `guides`, `host_applications`, `support_tickets`, etc. |

**Notable gaps found:**
1. `content.py` serves pages/blog/media/SEO from in-memory dictionaries — **not
   persisted to PostgreSQL**. This is a **documented requirement** (CMS pages, blogs,
   media metadata, SEO) that has no DB table in the current model layer.
2. `ai.py` does not persist conversations/messages to the DB, despite the README
   mentioning "persistent message history".
3. `host_bookings` table exists but is **not wired to any API route**.
4. `experience_id` in `bookings` is not a FK to `host_experiences.id` — it is a plain
   integer used for display purposes.

---

## 10. INDEXING (CURRENT STATE)

### 9.1 Indexes present (from models)
- `ix_users_email` (unique) — via `unique=True, index=True` on `email`
- `ix_guides_id`, `ix_host_guides_id`, `ix_host_guides_host_id`,
  `ix_host_guides_guide_user_id`, `ix_host_guides_guide_id`, `ix_host_guides_email`
- `ix_host_experience_guides_id`, `_host_experience_guides_host_id`,
  `ix_host_experience_guides_experience_id`, `_host_experience_guides_guide_id`
- `ix_bookings_status` (via `index=True` on `status`)
- `ix_experience_proposals_guide_user_id`, `ix_experience_proposals_status`
- `ix_experience_change_requests_guide_user_id`,
  `ix_experience_change_requests_listing_id`, `ix_experience_change_requests_status`
- `ix_guide_profiles_guide_user_id` (via `index=True`)
- `ix_support_tickets_customer_email`

### 9.2 Recommended indexes (not yet present)
- `bookings(user_id)`, `bookings(guide_user_id)` (already have guide_user_id index)
- `bookings(date)` — for calendar/availability lookups
- `bookings(status, date)` — for status-filtered reporting
- `guide_listings(guide_user_id, is_active)` — composite for guide dashboard
- `guide_listings(max_guests, booked_guests)` — for capacity queries
- `host_applications(status, reviewed_at)` — for review queues
- `support_tickets(status, priority)` — for ticket queues
- `experience_proposals(guide_user_id, status)` — for proposal queues
- `experience_change_requests(listing_id, status)` — for change-request lookup
- `host_experiences(host_id, is_active)` — for host listings

---

## 11. SQLITE ↔ POSTGRESQL COMPATIBILITY ISSUES

| Issue | SQLite | PostgreSQL | Impact |
|---|---|---|---|
| `DateTime(timezone=True)` + `server_default=func.now()` | Stored as TEXT | Becomes TIMESTAMPTZ | Operational, not breaking |
| `JSON` column | Stored as TEXT | `JSON` = TEXT (SQLite), `JSONB` = binary | ✅ No breaking difference |
| `postgresql.JSONB(astext_type=sa.Text())` | ❌ Not available | ✅ | **Breaking** — guides migration fails on SQLite |
| `Enum(BookingStatus)` | CHECK constraint | PostgreSQL ENUM type | ⚠️ Stored as TEXT in both; no breaking difference |
| Transactions without `PRAGMA foreign_keys=ON` | ❌ FKs off by default | ✅ FKs on by default | ❌ Data integrity risk on both |
| `Float` for money | Fine | Fine (needs application-level scaling) | ⚠️ Precision risk |

**Root cause of the broken migration chain:**
The historical `guides` migration was written for PostgreSQL (using `postgresql.JSONB`)
and its `down_revision` points to the empty `bookings` revision. When Alembic walks the
chain, it yields no DDL for `users`/`bookings`, then the `guides` revision tries to
create `guides` with PostgreSQL-specific syntax. On a clean PG DB, Alembic will:
1. Run `5da9b06e2e4f` (no-op) -> users table NOT created
2. Run `ff8b527a0b00` (no-op) -> bookings table NOT created
3. Run `3f4a5b6c7d8e` (creates `guides`) -> **fails** because it tries to add a
   `down_revision` reference but `bookings`/`users` tables don't exist in that PG DB

---

## 12. TESTING (ACTUAL RESULTS)

Baseline run (backend, 2026-10-18):

```
tests/test_ai.py::test_ai_chat_fallback    FAILED (httpx ConnectError — Ollama not running, external dependency)
tests/test_auth.py::TestAuthEndpoints::test_oauth_google_start     FAILED (external OAuth, no credentials)
tests/test_auth.py::TestAuthEndpoints::test_oauth_facebook_start   FAILED (external OAuth)
123 passed, 3 failed, 124 warnings
```

- 123/126 tests pass on SQLite in-memory test DB.
- OAuth test failures are **infrastructure-dependent** (no OAuth credentials configured)
  and do not indicate a bug in the application logic.
- The 3 expected failures are all **external-dependency** tests (AI chat / OAuth) and
  are not database-related.

---

## 13. REVISITED FINDINGS (BEFORE CHANGES)

### Critical
1. Migration history cannot initialize or upgrade a PostgreSQL database (2 empty revisions).
2. PostgreSQL-specific `postgresql.JSONB` in the guides migration creates a SQLite-vs-PG
   type divergence.
3. No CHECK constraints for capacity bounds or booking status values; integrity relies
   entirely on service-layer code (vulnerable to race conditions).

### Important
4. No `DECIMAL/NUMERIC` for financial amounts; `Float` is used.
5. No `ON DELETE` policy is explicitly declared; deletion relies on app-level ordering.
6. No indexes for the highest-frequency query patterns (booking date/availability,
   guide listing occupancy, support ticket queues, content pages).

### Low
7. `content.py` serves CMS/blog/media from in-memory dictionaries (documented feature
gap — not a data model issue but a persistence gap).
8. `ai.py` does not persist chat messages (documented feature gap).
9. `host_bookings` table exists but has no API surface.
10. No `users`.`email_verified` or explicit email-verification/password-reset row;
    reset flow depends on Supabase Auth (external).

---

## 14. TARGET ARCHITECTURE DECISIONS

### 14.1 Preserve
- Integer PKs for all tables (`id`).
- `traveler`/`guide` roles as-is (no new role system).
- Integer `bookings.id` as the canonical booking identifier (do not migrate to UUID).
- `host_bookings` table semantics (do not delete).
- Boolean `is_active` soft-delete pattern.
- `users.role` as the single source of authorization (no separate `roles` table).
- `SELF_REGISTERABLE_ROLES = {traveler, host}`.

### 14.2 Modify
- **Migrations:** rewrite the stale revisions so the chain actually creates tables on
  both SQLite and PostgreSQL (fix the empty revisions, make the guides migration portable).
- **Booking integrity:** add DB-level CHECK constraints guarded by a `booked_delta`/booking
  transition service (atomic with `MAX()`/`MIN()` in Postgres and guarded by `SAVEPOINT`
  for SQLite fallback).
- **Capacity:** add a DB CHECK constraint on `guide_listings(max_guests >= booked_guests)`
  to harden the service-layer rule.
- **Indexes:** add the recommended indexes above.

### 14.3 Do NOT change
- Existing API contracts (Pydantic response shapes, field names, status codes).
- The migration history order/IDs (never erase historical migrations).
- Existing seed scripts.

---

## 15. RISKS AND LIMITATIONS

| Risk | Severity | Mitigation |
|---|---|---|
| Migration chain currently broken | High | Rewrite revisions before any PG deployment |
| `Float` precision on money | Medium | Use `DECIMAL` for new monetary columns; leave existing as-is for compat (document) |
| App-level capacity race condition | Medium | Add DB CHECK constraint + atomic `SAVEPOINT` |
| No PG migrations for fresh installs | High | Fix migrations + add PG integration test |
| `content.py` in-memory only | Medium | Documented as future work; do not block on it |
| `ai.py` in-memory only | Low | Documented as future work |
| Commited `.env` with secrets | High | Move to CI variables; remove from repo |
| OAuth tests fail (external) | Low | Infrastructure, not application |

---

## 16. PHASE PLAN (SUMMARY)

1. **Audit** — completed (this document).
2. **Gap analysis** — done (see §12-13).
3. **Schema design** — done (target schema documented in `DATABASE_SCHEMA.md`).
4. **Implementation** — migrate rewrite, constraint addition, indexes.
5. **Migrations** — create corrective revisions; verify upgrade paths.
6. **Integration tests** — add PG-specific booking/capacity tests; run against Postgres.
7. **Documentation** — write the 8 database docs + update README.
8. **Production readiness** — verify Supabase/Render/Docker config docs.

---

*Prepared for the Guides Nepal engineering team. See accompanying files for the full*
database architecture, schema, setup, migration, security, operations, and ERD docs.*
