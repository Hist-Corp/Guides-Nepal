# DATABASE OPERATIONS — Guides Nepal

**Version:** 1.0 · **Date:** 2026-10-18

---

## 1. CONNECTION MANAGEMENT

| Environment | URL template | SSL | Pool |
|---|---|---|---|
| Local dev (SQLite) | sqlite:///./guides_nepal.db | n/a | SQLAlchemy default |
| Docker Compose | postgresql://postgres:postgres@db:5432/guides_nepal | disable (localhost) | pool_pre_ping=True |
| Supabase | postgresql+psycopg2://... | require | pool_pre_ping=True |
| Render | postgresql+psycopg2://... | require | pool_pre_ping=True |

**Connection normalization:**
app.core.database._normalize_db_url() automatically:
- Mapspostgresql:// to postgresql+psycopg2:// (required by SQLAlchemy 2.x).
- Sets sslmode=disable for localhost/Docker service names, sslmode=require for
  remote hosts (Supabase/Render).
- Sets connect_timeout=10 to fail fast on misconfigured databases.


---

## 2. POOLING CONFIGURATION

| Setting | Value | Reason |
|---|---|---|
| pool_pre_ping | True | Detects stale connections before use |
| pool_size | Not set (SQLAlchemy default) | Let the platform tune; too many connections hurt PG |
| max_overflow | Not set | Transaction pooling (Supabase/Render) cannot benefit from overflow |

**PostgreSQL limits:**
- Supabase: typically max_connections = 125 for a small Hobby tier, fewer for
  larger tiers. Follow the platform limit + 10% headroom.
- Render: varies by plan, typically 10-50 for the free tier.

Do not set pool_size far exceeding the database max_connections limit.

---

## 3. HEALTH CHECKS

| Endpoint | Purpose | Expected response |
|---|---|---|
| GET /health | App-level health | {status: ok, environment: development} |
| GET /api/v1/health | API-level health | {status: ok, version: 1.0} |

**Startup behavior:**
- app.main.ensure_database_schema() calls Base.metadata.create_all() to guarantee
  tables exist. Failures are logged (not fatal) so the app still boots.

---

## 4. BACKUPS AND RESTORATION

### 4.1 Supabase (production)

| Capability | Status |
|---|---|
| Automated daily backups | Supabase provides automated backups (7-14 days retention) |
| Point-in-time recovery | Available via Supabase | deactivate if needed |
| Logical export | pg_dump -Fc guides_nepal -f backup.dump |
| Restore | pg_restore -d guides_nepal backup.dump |

**Procedure:**
1. Schedule a pg_dump before any risk-taking migration.
2. Use pg_dump -Fc for compressed, selective restore.
3. Verify restore on a staging database first.

### 4.2 Render (backend)

- Render provides automatic database backups (plan-dependent).
- Document the backup schedule with your Cloud provider.


---

## 5. MIGRATION DEPLOYMENT

| Environment | Migration command | Notes |
|---|---|---|
| Local dev | alembic upgrade head | Run after model changes |
| Docker Compose | docker compose exec api alembic upgrade head | For production-like local PG |
| Supabase | Run via Supabase dashboard SQL editor or CI |
| Render | Render runs migrations on deploy (if configured) |

**Detect the head revision:**
alembic current
alembic history

**Never:**
- Reset migration history to make an upgrade succeed.
- Apply migrations directly to production without a staging/rollback plan.

---

## 6. MONITORING

| Metric | Source |
|---|---|
| DB connection count | SELECT count(*) FROM pg_stat_activity; |
| Long-running queries | pg_stat_activity filtered by state='active' and now()-query_start>'5min' |
| Replication lag | pg_last_xlog_replay_timestamp() (if streaming replication) |
| Error rate | Application logs (structured JSON, log level INFO) |
| Booking status distribution | SELECT status, count(*) FROM bookings GROUP BY status; |

---

## 7. QUERY PERFORMANCE NOTES

### 7.1 CRITICAL QUERY PATTERNS

| Pattern | Table | Recommended index |
|---|---|---|
| User email lookup | users | ix_users_email (already) |
| Booking by user | bookings | ix_bookings_user_id (already) |
| Booking by guide | bookings | ix_bookings_guide_user_id (already) |
| Guide listing occupancy | guide_listings | ix_guide_listings_capacity (new) |
| Support ticket queue | support_tickets | ix_support_tickets_status_priority (new) |
| Host application queue | host_applications | ix_host_applications_status_reviewed_at (new) |

### 7.2 JSONB queries

For JSONB columns (documents, changes):
- Use @> operator for containment queries.
- Create GIN indexes: CREATE INDEX ... ON table USING GIN (jsonb_column).

---

## 8. CONNECTION FAILURE HANDLING

- The app does not crash if the database is unavailable at startup.
- ensure_database_schema() logs failures (not fatal).
- Failed DB calls raise 503 or 500 with generic messages.
- Queries that depend on the DB return 401, 403, 404, or 422 as appropriate.
