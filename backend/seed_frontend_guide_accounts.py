#!/usr/bin/env python3
"""Create a login account and Regional-Manager approval record for every guide
currently visible in the frontend catalog.

The catalog is exported to ``backend/data/guide_accounts.json`` by
``scripts/export-frontend-guides.mjs``.  This script is idempotent: accounts,
applications, catalog links and onboarding profiles are matched by catalog id /
email and updated in place.

Default behaviour treats the 46 guides already published on the frontend as
approved by their province's Regional Head, so the documented credentials work
immediately.  Use ``--pending`` to seed the same accounts as awaiting Regional
Head review (the approval queue at /dashboard/regional-head/applications).

Usage (from ``backend/``)::

    python seed_frontend_guide_accounts.py
    python seed_frontend_guide_accounts.py --pending
    python seed_frontend_guide_accounts.py --email priya@guides-nepal.com
"""
from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

from app import models  # noqa: F401  (register all models for create_all)
from app.api.v1.operations import _activate_guide_account
from app.core.database import Base, SessionLocal, engine
from app.core.roles import GUIDE
from app.core.security import get_password_hash
from app.models.guide_application import GuideApplication
from app.models.user import User

ACCOUNTS_PATH = Path(__file__).resolve().parent / "data" / "guide_accounts.json"


def _split_name(full_name: str) -> tuple[str, str]:
    parts = (full_name or "").strip().split(" ", 1)
    return (parts[0] if parts else "Guide", parts[1] if len(parts) > 1 else "")


def _details_for(account: dict) -> dict:
    return {
        "source": "frontend_catalog",
        "catalog_guide_id": account["catalog_guide_id"],
        "catalog_guide_name": account["name"],
        "catalog_name_is_unique": bool(account.get("catalog_name_is_unique", True)),
        "region": account.get("region"),
        "city": account.get("city"),
        "cities": account.get("cities") or [],
        "languages": account.get("languages") or [],
        "role": account.get("role"),
        "bio": account.get("bio"),
        "image": account.get("image"),
        "rating": account.get("rating"),
        "reviews": account.get("reviews"),
        "expertise_areas": ["tour"],
        "default_max_guests": 10,
        "onboarding_completed": True,
    }


def _load_accounts() -> list[dict]:
    if not ACCOUNTS_PATH.is_file():
        raise SystemExit(
            f"Missing {ACCOUNTS_PATH}. Run `node scripts/export-frontend-guides.mjs` first."
        )
    accounts = json.loads(ACCOUNTS_PATH.read_text(encoding="utf-8"))
    if not isinstance(accounts, list) or not accounts:
        raise SystemExit("Guide account manifest is empty or invalid.")
    return accounts


def _upsert_application(db, account: dict, user: User, approved: bool) -> GuideApplication:
    application = (
        db.query(GuideApplication)
        .filter(GuideApplication.email == user.email)
        .order_by(GuideApplication.id.desc())
        .first()
    )
    details = _details_for(account)
    if application is not None:
        try:
            existing = json.loads(application.details_json or "{}")
        except (TypeError, json.JSONDecodeError):
            existing = {}
        if isinstance(existing, dict):
            details = {**existing, **details}
        application.region = account.get("region")
        application.city = account.get("city")
        application.full_name = account["name"]
        application.status = "approved" if approved else "pending"
        application.user_id = user.id
        application.details_json = json.dumps(details)
    else:
        application = GuideApplication(
            full_name=account["name"],
            email=user.email,
            city=account.get("city"),
            region=account.get("region"),
            status="approved" if approved else "pending",
            details_json=json.dumps(details),
            credential_password_hash=get_password_hash(account["password"]),
            user_id=user.id,
        )
        db.add(application)

    if approved:
        application.reviewed_by = account.get("reviewed_by") or "seed:regional-manager"
        application.reviewed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(application)
    return application


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--pending",
        action="store_true",
        help="Create the accounts inactive and leave them in the Regional Head approval queue.",
    )
    parser.add_argument("--email", help="Only sync one guide account email.")
    args = parser.parse_args()

    accounts = _load_accounts()
    if args.email:
        wanted = args.email.strip().lower()
        accounts = [a for a in accounts if a["email"].lower() == wanted]
        if not accounts:
            raise SystemExit(f"No guide account in the manifest matches {args.email}")

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    created = updated = approved_count = pending_count = 0
    try:
        for account in accounts:
            approved = not args.pending
            email = account["email"].strip().lower()
            first, last = _split_name(account["name"])
            hashed = get_password_hash(account["password"])
            user = db.query(User).filter(User.email == email).first()
            if user is None:
                user = User(
                    email=email,
                    firstName=first,
                    lastName=last,
                    hashed_password=hashed,
                    role=GUIDE,
                    region=account.get("region"),
                    bio=account.get("bio"),
                    avatar_url=account.get("image"),
                    is_active=approved,
                )
                db.add(user)
                db.commit()
                db.refresh(user)
                created += 1
            else:
                user.role = GUIDE
                user.hashed_password = hashed
                user.is_active = approved
                user.region = account.get("region") or user.region
                user.bio = user.bio or account.get("bio")
                user.avatar_url = user.avatar_url or account.get("image")
                # These are catalog-owned seed accounts: keep the login name in
                # sync with the public guide profile instead of preserving the
                # legacy sample name from an earlier seed.
                user.firstName = first
                user.lastName = last
                db.commit()
                updated += 1

            application = _upsert_application(db, account, user, approved)
            if approved:
                reviewer = None
                if account.get("reviewed_by"):
                    reviewer = (
                        db.query(User)
                        .filter(User.email == account["reviewed_by"])
                        .first()
                    )
                _activate_guide_account(db, application, user, reviewer)
                approved_count += 1
                state = f"approved by {application.reviewed_by}"
            else:
                pending_count += 1
                state = "pending Regional Head review"

            print(
                f"  {account['catalog_guide_id']:>4}  {account['name']:<12} "
                f"{email:<34} {account.get('region') or '-':<22} {state}"
            )

        print(
            f"\nDone: {created} created, {updated} updated, "
            f"{approved_count} approved, {pending_count} pending."
        )
    finally:
        db.close()


if __name__ == "__main__":
    main()
