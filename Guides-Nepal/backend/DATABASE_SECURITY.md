# DATABASE SECURITY — Guides Nepal

**Version:** 1.0 · **Date:** 2026-10-18

---

## 1. ACCESS CONTROL

| Layer | Control |
|---|---|
| Application | JWT tokens (HS256) carry sub (user id) and type |
| Route guards | require_role() enforces allow-lists per route |
| RBAC | has_access() — admin implicitly authorized everywhere; other roles must be named |
| Password hashing | bcrypt (cost 12) |
| Email uniqueness | users.email UNIQUE NOT NULL |

---

## 2. AUTHORIZATION BOUNDARIES

| User role | Can do |
|---|---|
| admin | Full access (implicitly authorized for every guard) |
| content-manager | Create/edit pages, blog, media, SEO |
| regional-head | Host applications for assigned region |
| customer-support | Support tickets, FAQ |
| host | Manage own tours, bookings, earnings, performance |
| guide | Public frontend only; scoped API at GET /api/v1/guide/me |
| traveler | Public site only |

**Server-side enforcement:**
- require_role() is the only authorization mechanism. Client-supplied roles are
  ignored. The Pydantic schema UserCreate also validates SELF_REGISTERABLE_ROLES.
- Admin endpoints validate is_assignable_role() and reject hashed_password mass-assignment.
- Guide endpoints filter by guide_user_id (ownership).
- Guide dashboard scopes by guide_user_id.


---

## 3. CREDENTIAL HANDLING

| Secret | Storage | Notes |
|---|---|---|
| SECRET_KEY | Environment variable | JWT signing; must be set in production |
| DATABASE_URL | Environment variable | Never commit; use CI secrets |
| bcrypt hashes | users.hashed_password | Never store plaintext |
| OAuth tokens | Runtime only | Never stored in DB |
| credential_token_hash | host_applications.credential_token_hash | SHA-256 of setup token (not raw) |
| credential_password_hash | host_applications.credential_password_hash | bcrypt hash at application time |
| Payment data | Not stored | No card data stored anywhere |

**Findings:**
- backend/.env contains a real SECRET_KEY and DATABASE_URL committed to the repo.
  This must be moved to CI secrets and the file removed from version control.

---

## 4. SENSITIVE-DATA PROTECTION

| Data class | Protection |
|---|---|
| Passwords | bcrypt hash only |
| Tokens | Only hashed (SHA-256) |
| Payment cards | Not stored |
| Document uploads | Out-of-band; DB stores references only, not blob contents |
| User emails | Indexed for search, but not mass-exportable |
| Booking history | Retained; no soft-delete of sensitive data |

**Database logs should never contain:**
- Passwords, tokens, or payment payloads.
- Full SQL queries with user input (use parameterized queries / ORM).

---

## 5. DATABASE ACCESS FOR SUPABASE AND RENDER

### 5.1 Supabase
- Supabase provides a managed PostgreSQL 14+ instance.
- Backend uses postgresql+psycopg2:// with sslmode=require.
- Supabase direct connections are sufficient for this app's traffic.
- Supabase pooled connections are NOT used for the backend.

### 5.2 Render
- Render provides the backend service with a managed PostgreSQL database.
- Connection string is set as DATABASE_URL environment variable.
- sslmode=require is enforced by the connection-normalization logic.
- pool_pre_ping=True is set to avoid stale connections.


---

## 6. ROW-LEVEL SECURITY

RLS is NOT implemented for the backend because:
- The backend uses a privileged database connection (with full write access).
- RLS policies cannot restrict a privileged backend connection (it connects as a
  superuser or a role with sufficient privileges).
- Application-level authorization (require_role(), ownership filtering) is the
  enforcement mechanism.

If RLS is ever desired, it must:
1. Use a separate database role with minimal privileges.
2. Connect as that role for read-only queries.
3. Document policies, connection role, and tests.

---

## 7. BACKUP AND RECOVERY (SUPABASE)

| Capability | Status |
|---|---|
| Automated backups | Supabase provides automated daily backups (typically 7-14 days retention) |
| Point-in-time recovery | Available via Supabase (with retention configuration) |
| Logical export | pg_dump (use pg_dump -Fc for custom format) |
| Restore | Restore from backup or point-in-time recovery |

Documented as requirements only. Verify with Supabase dashboard before claiming
any specific setting is active.

---

## 8. SECURITY AUDIT FINDINGS

| Finding | Severity | Status |
|---|---|---|
| Committed .env with real SECRET_KEY and DATABASE_URL | High | Open — must be fixed |
| No DB-level CHECK constraints for capacity | Medium | Fixed (schema migration) |
| Migration history broken | High | Fixed (rewritten revisions) |
| OAuth tests fail (external dependency) | Low | Infrastructure, not application |
| Float precision on money | Medium | Documented (use DECIMAL for new columns) |
| No Pragma foreign_keys=ON on SQLite | Low | Documented (app uses create_all + app-level deletes) |
