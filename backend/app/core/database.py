from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from typing import Generator
from urllib.parse import urlparse, urlunparse, parse_qs, urlencode


def _normalize_db_url(url: str) -> str:
    """For managed Postgres (Supabase/Render), force SSL and a bounded
    connect timeout so a bad/misconfigured DATABASE_URL fails fast with a
    clear error instead of hanging the request thread indefinitely.

    Local Postgres servers (localhost/127.0.0.1) typically run without SSL,
    so we must NOT force sslmode=require there — otherwise every connection
    fails with "server does not support SSL, but SSL was required".
    """
    if url.startswith(("postgresql", "postgres")):
        parsed = urlparse(url)
        qs = parse_qs(parsed.query)
        is_local = parsed.hostname in ("localhost", "127.0.0.1", "::1")
        if is_local:
            qs.setdefault("sslmode", ["disable"])
        else:
            qs.setdefault("sslmode", ["require"])
        qs.setdefault("connect_timeout", ["10"])
        new_query = urlencode(qs, doseq=True)
        return urlunparse(parsed._replace(query=new_query))
    return url


DATABASE_URL = _normalize_db_url(settings.DATABASE_URL)

# SQLite (useful for local development without Postgres) needs a special flag
# so connections can be shared across FastAPI's threadpool. For Postgres we
# enable pool_pre_ping to avoid stale/broken connections.
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
    )
else:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
