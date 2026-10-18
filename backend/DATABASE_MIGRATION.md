# DATABASE MIGRATION — Guides Nepal

**Version:** 1.0 · **Date:** 2026-10-18

---

## 1. MIGRATION STRATEGY

### 1.1 Fresh PostgreSQL database

alembic upgrade head

This creates all tables, indexes, constraints, and defaults from the revision chain.

### 1.2 Existing SQLite database to PostgreSQL

Data migration is not required for the core application because:
- The current seed data lives in seed scripts, not in a persistent SQLite database.
- The bookings table and other core tables are created on first app run.
- Historical data (if any) should be exported from SQLite and imported via SQL.

Procedure:
1. Back up the SQLite database.
2. Export tables to SQL (using sqlite3 .dump or pgloader).
3. Restore the SQL dump into the PostgreSQL database.
4. Verify row counts.
5. Disable seed scripts and run alembic upgrade head.

### 1.3 Migration verification

- Verify with alembic current (should show the head revision).
- Verify with alembic history (should show the full chain).
- Run pytest for integration tests.
- Inspect pg_dump output to confirm constraints and indexes were created.

---

## 2. REVISION HISTORY

| Revision | File | Description |
|---|---|---|
| 5da9b06e2e4f | create_users_table.py | Rewritten: creates users table (portable) |
| ff8b527a0b00 | create_bookings_table.py | Rewritten: creates bookings table (portable) |
| 3f4a5b6c7d8e | create_guides_table.py | Rewritten: creates guides table (portable) |
| c8e1f2a3b4c5 | create_experience_workflow_tables.py | Creates experience_proposals + experience_change_requests |
| d4e5f6a7b8c9 | create_host_guide_tables.py | Creates host_guides + host_experience_guides |

---

## 3. CORRECTIVE REVISION NAMING

The historical revisions are kept with their original IDs (never reused). New
corrective revisions are named with a clear fix_<issue> slug:

- fix_users_bookings_migrations — rewrites empty revisions into real DDL.
- fix_guides_portable_json — removes PostgreSQL-only postgresql.JSONB from the
guides migration.
- fix_booking_constraints — adds CHECK constraints to bookings and guide_listings.
- fix_add_indexes — adds recommended indexes.

---

## 4. DATA MIGRATION (COPY RECOVERY)

If data must be retained from SQLite to PostgreSQL:

sqlite3 guides_nepal.db .dump > sqlite_dump.sql
psql -h localhost -U postgres -d guides_nepal < sqlite_dump.sql

Then verify counts and constraints.

**Rollback:** Drop the PostgreSQL database and restore from backup. Never attempt
to roll back a data migration via alembic downgrade.

---

## 5. MIGRATION RISK REGISTER

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Migration history currently broken | High | High | Rewrite empty revisions first |
| PostgreSQL JSONB divergence | Medium | High | Use portable JSONB / portable types in shared migrations |
| Data loss during SQLite->PG migration | Medium | High | Back up SQLite first; verify row counts |
| Constraint violation on capacity | Low | High | Add CHECK constraints; test with generated data |
| Float rounding drift on money | Medium | Low | Use NUMERIC(12,2) for new monetary columns |
