#!/usr/bin/env python3
"""Synchronise the README guide-account table from guide_accounts.json.

The manifest is generated from the frontend catalog, so the README cannot drift
from the accounts seeded into the backend.  Run after
``node scripts/export-frontend-guides.mjs`` or after changing an email/region::

    python sync_guide_credentials_readme.py
    python sync_guide_credentials_readme.py --check

``--check`` exits non-zero when the README block is stale, which makes it usable
in CI without rewriting files.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ACCOUNTS_PATH = ROOT / "backend" / "data" / "guide_accounts.json"
README_PATH = ROOT / "README.md"

START = "<!-- GUIDE-ACCOUNT-CREDENTIALS:START -->"
END = "<!-- GUIDE-ACCOUNT-CREDENTIALS:END -->"


def _cell(value: object) -> str:
    return str(value or "—").replace("|", "\\|").replace("\n", " ")


def render_block(accounts: list[dict]) -> str:
    lines = [
        START,
        "### Seed Guide Accounts (all public guides)",
        "",
        "These seed accounts cover every guide currently visible in the frontend",
        "catalog. The seed marks the already-published guides as approved by the",
        "Regional Head for their province; use `--pending` to seed them into the",
        "review queue instead.",
        "",
        "```bash",
        "cd backend",
        "python seed_frontend_guide_accounts.py",
        "# or, to test the Regional Head approval queue:",
        "python seed_frontend_guide_accounts.py --pending",
        "```",
        "",
        "| Catalog ID | Guide | Region | Email (username) | Password | Approved by |",
        "|-----------:|-------|--------|------------------|----------|-------------|",
    ]
    for account in sorted(accounts, key=lambda item: int(item["catalog_guide_id"])):
        lines.append(
            "| {catalog_id} | {name} | {region} | `{email}` | `{password}` | {reviewed_by} |".format(
                catalog_id=_cell(account.get("catalog_guide_id")),
                name=_cell(account.get("name")),
                region=_cell(account.get("region")),
                email=_cell(account.get("email")),
                password=_cell(account.get("password")),
                reviewed_by=_cell(account.get("reviewed_by")),
            )
        )
    lines.extend(
        [
            "",
            "Sign in at `http://localhost:5175` → **Log in** → **Guide** tab, or call",
            "`POST /api/v1/auth/login`. A guide can only sign in while their linked",
            "`guide_applications` row is `approved`.",
            END,
        ]
    )
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--check",
        action="store_true",
        help="Fail if the README block differs from the generated block.",
    )
    args = parser.parse_args()

    accounts = json.loads(ACCOUNTS_PATH.read_text(encoding="utf-8"))
    emails = [str(account["email"]).lower() for account in accounts]
    if len(emails) != len(set(emails)):
        raise SystemExit("guide_accounts.json contains duplicate emails")

    readme = README_PATH.read_text(encoding="utf-8")
    start = readme.index(START)
    end = readme.index(END, start) + len(END)
    generated = render_block(accounts)
    updated = f"{readme[:start]}{generated}{readme[end:]}"

    if args.check:
        if updated != readme:
            raise SystemExit(
                "README guide credential block is stale. "
                "Run: python backend/sync_guide_credentials_readme.py"
            )
        print(f"README guide credential block is current ({len(accounts)} accounts).")
        return

    README_PATH.write_text(updated, encoding="utf-8")
    print(f"Updated README with {len(accounts)} guide accounts.")


if __name__ == "__main__":
    main()
