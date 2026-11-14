# DATABASE SCHEMA — Guides Nepal

**Version:** 1.0 (target) · **Date:** 2026-10-18
**Status:** Target schema for production PostgreSQL, with SQLite-compatible fallbacks.

---

## 1. TABLE CATALOG

| Table | Purpose | PK | Foreign keys |
|---|---|---|---|
| `users` | All user accounts | `id` | — |
| `bookings` | Traveler bookings | `id` | `user_id -> users.id`, `guide_user_id -> users.id` |
| `guide_listings` | Guide experience listings | `id` | `guide_user_id -> users.id` |
| `guide_profiles` | Guide onboarding profiles | `id` | `guide_user_id -> users.id` (unique) |
| `guide_status_updates` | Real-time guide updates | `id` | `guide_user_id -> users.id`, `listing_id -> guide_listings.id` |
| `host_applications` | Host onboarding applications | `id` | (no FK yet — `user_id` added on approval) |
| `guide_applications` | Guide application funnel | `id` | (same as host) |
| `host_guides` | Host-managed guide accounts | `id` | `host_id -> users.id`, `guide_user_id -> users.id`, `guide_id -> guides.id` |
| `host_experience_guides` | Guide-to-experience assignment | `id` | `host_id -> users.id`, `experience_id -> host_experiences.id`, `guide_id -> guides.id` |
| `host_experiences` | Host experience catalog | `id` | `host_id -> users.id` |
| `host_tours` | Host tour catalog | `id` | `host_id -> users.id` |
| `support_tickets` | Support tickets | `id` | (customer_email indexed) |
| `experience_proposals` | New-experience proposals (SOP-001) | `id` | `guide_user_id -> users.id` |
| `experience_change_requests` | Listing change requests (SOP-002) | `id` | `guide_user_id -> users.id`, `listing_id -> guide_listings.id` |
| `bookmarks` | User favorites | `id` | `user_id -> users.id` |

---

## 2. COLUMN DEFINITIONS

### 2.1 `users`

```sql
CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    email           VARCHAR(255) NOT NULL UNIQUE,
    first_name      VARCHAR(100),
    last_name       VARCHAR(100),
    hashed_password VARCHAR(255) NOT NULL,
    phone           VARCHAR(40),
    role            VARCHAR(30) NOT NULL DEFAULT 'traveler',
    region          VARCHAR(120),
    bio             TEXT,
    avatar_url      TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ix_users_email ON users(email);
```

### 2.2 `bookings`

```sql
CREATE TABLE bookings (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    guide_user_id   INTEGER REFERENCES users(id) ON DELETE SET NULL,
    experience_id   INTEGER NOT NULL,
    experience_title VARCHAR(255) NOT NULL,
    city            VARCHAR(120) NOT NULL,
    date            TIMESTAMPTZ NOT NULL,
    guests          INTEGER NOT NULL DEFAULT 1,
    price           NUMERIC(12,2) NOT NULL,
    image           TEXT,
    status          VARCHAR(20) NOT NULL DEFAULT 'upcoming'
        CHECK (status IN ('upcoming','accepted','rejected','completed','cancelled','archived')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ix_bookings_user_id ON bookings(user_id);
CREATE INDEX ix_bookings_guide_user_id ON bookings(guide_user_id);
CREATE INDEX ix_bookings_date ON bookings(date);
CREATE INDEX ix_bookings_status_date ON bookings(status, date);
```

### 2.3 `guide_listings`

```sql
CREATE TABLE guide_listings (
    id            SERIAL PRIMARY KEY,
    guide_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title         VARCHAR(255) NOT NULL,
    category      VARCHAR(30) NOT NULL DEFAULT 'tour';
    city          VARCHAR(120) NOT NULL DEFAULT 'Kathmandu',
    area          VARCHAR(160),
    description   TEXT NOT NULL DEFAULT '',
    itinerary     TEXT,
    meeting_point VARCHAR(300),
    duration      VARCHAR(80) NOT NULL DEFAULT '1 day',
    difficulty    VARCHAR(40) NOT NULL DEFAULT 'Easy',
    price         NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    max_guests    INTEGER NOT NULL DEFAULT 10
        CHECK (max_guests >= 1 AND max_guests <= 100),
    booked_guests INTEGER NOT NULL DEFAULT 0
        CHECK (booked_guests >= 0),
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_guests_within_capacity CHECK (booked_guests <= max_guests)
);
CREATE INDEX ix_guide_listings_guide_user_id ON guide_listings(guide_user_id);
CREATE INDEX ix_guide_listings_guide_active ON guide_listings(guide_user_id, is_active);
CREATE INDEX ix_guide_listings_capacity ON guide_listings(max_guests, booked_guests);
```

### 2.4 `guide_profiles`

```sql
CREATE TABLE guide_profiles (
    id                    SERIAL PRIMARY KEY,
    guide_user_id         INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    display_name          VARCHAR(160),
    expertise_areas       JSONB NOT NULL DEFAULT '[]',
    cities                JSONB NOT NULL DEFAULT '[]',
    languages             JSONB NOT NULL DEFAULT '[]',
    bio                   TEXT,
    years_experience      VARCHAR(40),
    default_max_guests    INTEGER NOT NULL DEFAULT 10
        CHECK (default_max_guests >= 1 AND default_max_guests <= 100),
    onboarding_completed  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 2.5 `guide_status_updates`

```sql
CREATE TABLE guide_status_updates (
    id            SERIAL PRIMARY KEY,
    guide_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    listing_id    INTEGER REFERENCES guide_listings(id) ON DELETE SET NULL,
    update_type   VARCHAR(30) NOT NULL DEFAULT 'announcement'
        CHECK (update_type IN ('availability','capacity','booking','schedule','announcement')),
    message       TEXT NOT NULL,
    area          VARCHAR(160),
    event_date    TIMESTAMPTZ,
    current_capacity INTEGER,
    max_capacity  INTEGER,
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ix_guide_status_updates_guide_user_id ON guide_status_updates(guide_user_id);
CREATE INDEX ix_guide_status_updates_type_date ON guide_status_updates(guide_user_id, created_at DESC);
```

### 2.6 `host_applications`

```sql
CREATE TABLE host_applications (
    id                   SERIAL PRIMARY KEY,
    host_name            VARCHAR(255),
    email                VARCHAR(255),
    city                 VARCHAR(120),
    region               VARCHAR(120),
    phone                VARCHAR(40),
    experience           VARCHAR(255),
    status               VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending','approved','rejected')),
    credential_token_hash VARCHAR(64),
    credential_password_hash VARCHAR(255),
    details_json         TEXT,
    user_id              INTEGER REFERENCES users(id) ON DELETE SET NULL,
    reviewed_by          VARCHAR(255),
    review_note          TEXT,
    reviewed_at          TIMESTAMPTZ,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ix_host_applications_email ON host_applications(email);
CREATE INDEX ix_host_applications_status_reviewed_at ON host_applications(status, reviewed_at);
```

### 2.7 `guide_applications`

```sql
CREATE TABLE guide_applications (
    id            SERIAL PRIMARY KEY,
    full_name     VARCHAR(255),
    email         VARCHAR(255),
    phone         VARCHAR(40),
    city          VARCHAR(120),
    region        VARCHAR(120),
    nin_number    VARCHAR(80),
    documents     TEXT,
    status        VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending','approved','rejected')),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ix_guide_applications_email ON guide_applications(email);
```

### 2.8 `host_guides`

```sql
CREATE TABLE host_guides (
    id            SERIAL PRIMARY KEY,
    host_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    guide_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    guide_id      INTEGER REFERENCES guides(id) ON DELETE SET NULL,
    email         VARCHAR(255) NOT NULL,
    full_name     VARCHAR(255) NOT NULL,
    phone         VARCHAR(40),
    nin_number    VARCHAR(80),
    city          VARCHAR(120),
    region        VARCHAR(120),
    documents     JSONB NOT NULL DEFAULT '[]',
    status        VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active','suspended')),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_host_guides_email UNIQUE(email)
);
CREATE INDEX ix_host_guides_host_id ON host_guides(host_id);
CREATE INDEX ix_host_guides_guide_user_id ON host_guides(guide_user_id);
CREATE INDEX ix_host_guides_guide_id ON host_guides(guide_id);
```

### 2.9 `host_experience_guides`

```sql
CREATE TABLE host_experience_guides (
    id         SERIAL PRIMARY KEY,
    host_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    experience_id INTEGER NOT NULL REFERENCES host_experiences(id) ON DELETE CASCADE,
    guide_id   INTEGER NOT NULL REFERENCES guides(id) ON DELETE CASCADE,
    is_primary  BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ix_host_experience_guides_host_id ON host_experience_guides(host_id);
CREATE INDEX ix_host_experience_guides_experience_id ON host_experience_guides(experience_id);
CREATE INDEX ix_host_experience_guides_guide_id ON host_experience_guides(guide_id);
```

### 2.10 `host_experiences`

```sql
CREATE TABLE host_experiences (
    id          SERIAL PRIMARY KEY,
    host_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(255) NOT NULL,
    slug        VARCHAR(255) NOT NULL,
    city        VARCHAR(120) NOT NULL,
    category    VARCHAR(120) NOT NULL,
    description TEXT NOT NULL,
    price       NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    duration    VARCHAR(80) NOT NULL,
    hero_image  TEXT,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ix_host_experiences_host_id ON host_experiences(host_id);
CREATE INDEX ix_host_experiences_slug ON host_experiences(slug);
CREATE INDEX ix_host_experiences_city ON host_experiences(city);
CREATE INDEX ix_host_experiences_is_active ON host_experiences(host_id, is_active);
```

### 2.11 `host_tours`

```sql
CREATE TABLE host_tours (
    id           SERIAL PRIMARY KEY,
    host_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title        VARCHAR(255) NOT NULL,
    city         VARCHAR(120) NOT NULL,
    description  TEXT NOT NULL,
    itinerary    TEXT NOT NULL,
    meeting_point VARCHAR(300) NOT NULL,
    duration     VARCHAR(80) NOT NULL,
    difficulty   VARCHAR(40) NOT NULL,
    max_guests   INTEGER NOT NULL DEFAULT 10
        CHECK (max_guests >= 1 AND max_guests <= 100),
    price        NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    is_active    BOOLEAN NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 2.12 `support_tickets`

```sql
CREATE TABLE support_tickets (
    id           SERIAL PRIMARY KEY,
    subject      VARCHAR(255),
    description  TEXT,
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    status       VARCHAR(20) NOT NULL DEFAULT 'open'
        CHECK (status IN ('open','in_progress','resolved','closed')),
    priority     VARCHAR(20) NOT NULL DEFAULT 'medium'
        CHECK (priority IN ('low','medium','high','urgent')),
    assigned_to  VARCHAR(255),
    resolution   TEXT,
    resolved_at  TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ix_support_tickets_customer_email ON support_tickets(customer_email);
CREATE INDEX ix_support_tickets_status_priority ON support_tickets(status, priority);
```

### 2.13 `experience_proposals`

```sql
CREATE TABLE experience_proposals (
    id                  SERIAL PRIMARY KEY,
    guide_user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title               VARCHAR(255) NOT NULL,
    category            VARCHAR(30) NOT NULL DEFAULT 'tour',
    city                VARCHAR(120) NOT NULL DEFAULT 'Kathmandu',
    area                VARCHAR(160),
    description         TEXT NOT NULL DEFAULT '',
    itinerary           TEXT,
    meeting_point       VARCHAR(300),
    duration            VARCHAR(80) NOT NULL DEFAULT '1 day',
    difficulty          VARCHAR(40) NOT NULL DEFAULT 'Easy',
    price               NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    max_guests          INTEGER NOT NULL DEFAULT 10
        CHECK (max_guests >= 1 AND max_guests <= 100),
    documents           JSONB NOT NULL DEFAULT '[]',
    status              VARCHAR(30) NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft','submitted','approved','changes_requested','rejected','published','cancelled')),
    submitted_at        TIMESTAMPTZ,
    decided_at          TIMESTAMPTZ,
    decided_by_user_id  INTEGER REFERENCES users(id),
    decided_by_role     VARCHAR(30),
    decision_notes      TEXT,
    published_at        TIMESTAMPTZ,
    listing_id          INTEGER REFERENCES guide_listings(id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ix_experience_proposals_guide_user_id ON experience_proposals(guide_user_id);
CREATE INDEX ix_experience_proposals_guide_status ON experience_proposals(guide_user_id, status);
```

### 2.14 `experience_change_requests`

```sql
CREATE TABLE experience_change_requests (
    id            SERIAL PRIMARY KEY,
    guide_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    listing_id    INTEGER NOT NULL REFERENCES guide_listings(id) ON DELETE CASCADE,
    change_class  VARCHAR(20) NOT NULL DEFAULT 'material'
        CHECK (change_class IN ('material','minor')),
    reason        TEXT NOT NULL DEFAULT '',
    changes       JSONB NOT NULL DEFAULT '[]',
    documents     JSONB NOT NULL DEFAULT '[]',
    status        VARCHAR(30) NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft','submitted','approved','changes_requested','rejected','applied','cancelled')),
    submitted_at  TIMESTAMPTZ,
    decided_at    TIMESTAMPTZ,
    decided_by_user_id INTEGER REFERENCES users(id),
    decided_by_role     VARCHAR(30),
    decision_notes      TEXT,
    applied_at          TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ix_experience_change_requests_guide_user_id ON experience_change_requests(guide_user_id);
CREATE INDEX ix_experience_change_requests_listing_id ON experience_change_requests(listing_id);
CREATE INDEX ix_experience_change_requests_status ON experience_change_requests(status);
```

### 2.15 `bookmarks`

```sql
CREATE TABLE bookmarks (
    id        SERIAL PRIMARY KEY,
    user_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title     VARCHAR(255) NOT NULL,
    city      VARCHAR(120),
    image     TEXT,
    link      TEXT
);
CREATE INDEX ix_bookmarks_user_id ON bookmarks(user_id);
```

---

## 3. KEY CONSTRAINTS SUMMARY

| Constraint | Table | Enforcement |
|---|---|---|
| `users.email` UNIQUE NOT NULL | users | PK + UNIQUE |
| `guide_profiles.guide_user_id` UNIQUE | guide_profiles | UNIQUE |
| `bookings.status` CHECK | bookings | CHECK |
| `bookings.guests >= 1` | bookings | CHECK |
| `guide_listings.max_guests` 1..100 | guide_listings | CHECK |
| `guide_listings.booked_guests >= 0` | guide_listings | CHECK |
| `guide_listings.booked_guests <= max_guests` | guide_listings | CHECK |
| `guide_profiles.default_max_guests` 1..100 | guide_profiles | CHECK |
| `guide_status_updates.update_type` CHECK | guide_status_updates | CHECK |
| `host_applications.status` CHECK | host_applications | CHECK |
| `host_guides.status` CHECK | host_guides | CHECK |
| `host_experiences` unique `slug` | host_experiences | UNIQUE |
| Support ticket states | support_tickets | CHECK |
| Experience workflow states | experience_proposals / change_requests | CHECK |

---

## 4. INDEXES SUMMARY

| Index name | Table | Columns | Type |
|---|---|---|---|
| `ix_users_email` | users | email | UNIQUE |
| `ix_bookings_user_id` | bookings | user_id | B-tree |
| `ix_bookings_guide_user_id` | bookings | guide_user_id | B-tree |
| `ix_bookings_date` | bookings | date | B-tree |
| `ix_bookings_status_date` | bookings | status, date | B-tree |
| `ix_guide_listings_guide_user_id` | guide_listings | guide_user_id | B-tree |
| `ix_guide_listings_guide_active` | guide_listings | guide_user_id, is_active | B-tree (composite) |
| `ix_guide_listings_capacity` | guide_listings | max_guests, booked_guests | B-tree |
| `ix_guide_profiles_guide_user_id` | guide_profiles | guide_user_id | UNIQUE |
| `ix_guide_status_updates_guide_user_id` | guide_status_updates | guide_user_id | B-tree |
| `ix_guide_status_updates_type_date` | guide_status_updates | guide_user_id, created_at DESC | B-tree (composite) |
| `ix_host_applications_email` | host_applications | email | B-tree |
| `ix_host_applications_status_reviewed_at` | host_applications | status, reviewed_at | B-tree (composite) |
| `ix_guide_applications_email` | guide_applications | email | B-tree |
| `ix_host_guides_host_id` | host_guides | host_id | B-tree |
| `ix_host_guides_guide_user_id` | host_guides | guide_user_id | B-tree |
| `ix_host_guides_guide_id` | host_guides | guide_id | B-tree |
| `ix_host_experience_guides_*` | host_experience_guides | host_id, experience_id, guide_id | B-tree |
| `ix_host_experiences_host_id` | host_experiences | host_id | B-tree |
| `ix_host_experiences_slug` | host_experiences | slug | B-tree (unique) |
| `ix_host_experiences_city` | host_experiences | city | B-tree |
| `ix_host_experiences_is_active` | host_experiences | host_id, is_active | B-tree (composite) |
| `ix_support_tickets_customer_email` | support_tickets | customer_email | B-tree |
| `ix_support_tickets_status_priority` | support_tickets | status, priority | B-tree (composite) |
| `ix_experience_proposals_guide_user_id` | experience_proposals | guide_user_id | B-tree |
| `ix_experience_proposals_guide_status` | experience_proposals | guide_user_id, status | B-tree (composite) |
| `ix_experience_change_requests_guide_user_id` | experience_change_requests | guide_user_id | B-tree |
| `ix_experience_change_requests_listing_id` | experience_change_requests | listing_id | B-tree |
| `ix_experience_change_requests_status` | experience_change_requests | status | B-tree |
| `ix_bookmarks_user_id` | bookmarks | user_id | B-tree |

---

## 5. POSTGRESQL-SPECIFIC NOTES

- **Money:** `NUMERIC(12,2)` is used for all monetary amounts (price, total_price,
  max_guests is not money). This prevents floating-point rounding drift.
- **JSON:** `JSONB` is used for flexible structured data (documents, changes, JSON
  fields). Use `?->>` operators and GIN indexes for JSON query performance.
- **Timestamps:** `TIMESTAMPTZ` (equivalent to `TIMESTAMP WITH TIME ZONE`) is used for
  all timestamps. Application code must store UTC and convert to local only at the
  presentation layer.
- **Enum:** Application enum types are stored as `VARCHAR` with `CHECK` constraints,
  not PostgreSQL ENUM types, so they stay portable to SQLite development.
- **FK deletion:** `ON DELETE CASCADE` only for pure child data (bookmarks, listings,
  profiles). `ON DELETE SET NULL` for reference rows (bookings.guide_user_id,
  host_applications.user_id). No `ON DELETE CASCADE` for `bookings` parent data —
  booking history must be retained and manually archived.
