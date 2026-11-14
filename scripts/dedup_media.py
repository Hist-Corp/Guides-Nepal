"""Deduplicate media library: keep one canonical file per content hash.

- Removes duplicate files from backend/uploads/media/
- Removes duplicate registry entries (keeps the lowest-id entry per content hash)
- Removes registry entries whose file is missing on disk
- Leaves registry sorted by id
"""

import hashlib
import json
import os
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MEDIA_DIR = ROOT / "backend" / "uploads" / "media"
REGISTRY_PATH = MEDIA_DIR / "registry.json"


def sha16(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()[:16]


def load_registry():
    with open(REGISTRY_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def save_registry(reg):
    with open(REGISTRY_PATH, "w", encoding="utf-8") as f:
        json.dump(reg, f, indent=2)


def main():
    reg = load_registry()
    items = reg.get("items", [])
    if not items:
        print("No items in registry.")
        return 0

    # Group by content hash (only for files that exist on disk)
    by_hash = defaultdict(list)
    missing = []
    for it in items:
        p = MEDIA_DIR / it["filename"]
        if not p.exists():
            missing.append(it)
            continue
        by_hash[sha16(p)].append(it)

    removed_files = []
    removed_entries = []
    keep_ids = set()

    # Keep the lowest-id entry per content-hash group
    for hsh, group in by_hash.items():
        group.sort(key=lambda i: i["id"])
        keeper = group[0]
        keep_ids.add(keeper["id"])
        for dup in group[1:]:
            removed_entries.append(dup)
            p = MEDIA_DIR / dup["filename"]
            if p.exists():
                p.unlink()
                removed_files.append(dup["filename"])

    # Remove entries whose file is missing on disk
    for it in missing:
        if it["id"] not in keep_ids:
            removed_entries.append(it)

    # Rebuild items: keepers + non-duplicate singletons
    kept = [it for it in items if it["id"] in keep_ids or (it["id"] not in {e["id"] for e in removed_entries} and it not in removed_entries)]
    # Simpler: keep anything whose id is in keep_ids, plus singletons not flagged
    flagged_ids = {e["id"] for e in removed_entries}
    new_items = [it for it in items if it["id"] not in flagged_ids]
    new_items.sort(key=lambda i: i["id"])

    reg["items"] = new_items
    save_registry(reg)

    print(f"Removed {len(removed_files)} duplicate file(s) from disk.")
    print(f"Removed {len(removed_entries)} duplicate/missing registry entry(ies).")
    print(f"Remaining items: {len(new_items)}")
    if removed_files:
        print("Files deleted:", ", ".join(removed_files[:20]), ("..." if len(removed_files) > 20 else ""))
    return 0


if __name__ == "__main__":
    sys.exit(main())
