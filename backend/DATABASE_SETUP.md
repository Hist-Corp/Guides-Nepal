# DATABASE SETUP — Guides Nepal

**Version:** 1.0 · **Date:** 2026-10-18

---

## 1. LOCAL DEVELOPMENT

### 1.1 SQLite (default, zero setup)

```bash
cd backend
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The app auto-creates tables via `Base.metadata.create_all()` on startup.

### 1.2 PostgreSQL (Local)

1. Install PostgreSQL 12+:
   ```bash
   # macOS
   brew install postgresql@15
   brew services start postgresql@15
   ```
2. Create the database:
   ```bash
   psql -U postgres -c "CREATE DATABASE guides_nepal;"
   ```
3. Set the environment variable:
   ```bash
   export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/guides_nepal
   ```
4. Start the backend:
   ```bash
   cd backend
   source .venv/bin/activate
   uvicorn app.main:app --reload --port 8000
   ```

**Important:** The `DATABASE_URL` must not contain a password in production. Use
environment variables in the deployment platform (Render/Supabase).

---

## 2. ENVIRONMENT VARIABLES

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | Yes (prod) | `sqlite:///./guides_nepal.db` | PostgreSQL URL or SQLite path |
| `ENV` | No | `development` | `development` or `production` |
| `SECRET_KEY` | Yes (prod) | (dev placeholder) | JWT signing secret |
| `BACKEND_CORS_ORIGINS` | No | (see config) | Comma-separated CORS origins |
| `DEV_ALLOW_SEED` | No | `False` | Allow seed scripts in production |
| `AI_PROVIDER` | No | `auto` | `auto`, `ollama`, or `openai` |
| `OPENAI_API_KEY` | No | - | For OpenAI AI provider |
| `OLLAMA_URL` | No | - | For local Ollama provider |
| `SUPABASE_URL` | No | - | Supabase project URL (for password reset) |
| `SUPABASE_SERVICE_ROLE_KEY` | No | - | Supabase service role key |
| `RESET_PASSWORD_REDIRECT_URL` | No | - | URL for password reset email |

**Security:** Never commit `.env`. Use `.env.example` as a template. Move all secrets
to deployment platform environment variables.

---

## 3. MIGRATION COMMANDS

| Command | Description |
|---|---|
| `alembic revision --autogenerate -m "message"` | Generate a revision from model changes |
| `alembic upgrade head` | Upgrade to the latest revision |
| `alembic upgrade +2` | Upgrade 2 revisions |
| `alembic downgrade -1` | Downgrade 1 revision |
| `alembic current` | Show the current revision |
| `alembic history` | Show the revision history |
| `alembic revision -m "message"` | Create an empty revision |

**Workflows:**
1. **Fresh database:** `alembic upgrade head` on a new PostgreSQL database.
2. **Existing SQLite -> PostgreSQL:** Migrate data via export/import scripts before
   running `alembic upgrade head`.
3. **Development:** Run `alembic upgrade head` after every model change; verify with
   `alembic current`.

---

## 4. RUNNING THE TESTS

| Command | Scope |
|---|---|
| `cd backend && source .venv/bin/activate && pytest` | Full backend suite |
| `cd backend && source .venv/bin/activate && pytest -k booking` | Booking-related tests |
| `cd backend && source .venv/bin/activate && pytest --cov=app --cov-report=term-missing` | With coverage |

**PG integration test setup:**
```bash
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/guides_nepal_test
pytest --integration  # (if --integration marker is used)
```

---

## 5. DOCKER LOCAL STACK

```bash
cd backend
docker compose up -d db api
```

This starts:
- `db`: PostgreSQL 15-alpine (volume `postgres_data`)
- `api`: Backend connected to the `db` service

Health check: `curl http://localhost:8000/health`.

---

## 6. TROUBLESHOOTING

| Symptom | Resolution |
|---|---|
| `connection refused` on PG | Check `pg_isready`, ensure PostgreSQL is running |
| `sslmode=require` on local PG | Use `sslmode=disable` (enforced in `database.py` for localhost) |
| `permission denied` on DB | Grant `postgres` user privileges or create a role with `CREATEDB` |
| `alembic upgrade` fails with duplicate table | The DB already has the tables; use `alembic stamp head` or drop the DB first |
| SQLite vs PG type mismatch | Use portable types; avoid `postgresql.JSONB` in shared migrations |
| `pool exhausted` | Reduce `pool_size` or increase `max_connections` on the DB |
