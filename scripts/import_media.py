"""Download remote image URLs referenced in frontend source files and register them.

Extends the media library import to also fetch Unsplash / Wikimedia images that
frontend components render, so they appear in the dashboard media library.
"""

import hashlib
import json
import os
import re
import shutil
import sys
import tempfile
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MEDIA_DIR = ROOT / "backend" / "uploads" / "media"
REGISTRY_PATH = MEDIA_DIR / "registry.json"

IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".ico", ".avif"}

SKIP_DIRS = {
    ".git", "node_modules", "dist", "build", "__pycache__", ".venv",
    ".next", ".vercel", ".pytest_cache", ".ruff_cache",
}

UA = "GuidesNepal-MediaBot/1.0"


def safe_name(original: str) -> str:
    base = os.path.basename(original) or "image"
    base = re.sub(r"[^A-Za-z0-9._-]", "_", base)
    if not base or base in {".", "_"}:
        base = "image"
    return base


def file_hash(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()[:12]


def sha16(path: Path) -> str:
    return file_hash(path)


def load_registry():
    try:
        with open(REGISTRY_PATH, "r", encoding="utf-8") as f:
            reg = json.load(f)
        if isinstance(reg, dict) and "items" in reg and "placements" in reg:
            return reg
    except Exception:
        pass
    return {"items": [], "placements": {}}


def save_registry(reg):
    with open(REGISTRY_PATH, "w", encoding="utf-8") as f:
        json.dump(reg, f, indent=2)


def mime_for(path: Path) -> str:
    ext = path.suffix.lower()
    return {
        ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
        ".webp": "image/webp", ".gif": "image/gif", ".svg": "image/svg+xml",
        ".ico": "image/x-icon", ".avif": "image/avif",
    }.get(ext, "application/octet-stream")


def find_local_images(root: Path):
    seen_hashes = {}
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS and not d.startswith(".")]
        for name in filenames:
            p = Path(dirpath) / name
            if p.suffix.lower() not in IMAGE_EXTS:
                continue
            if MEDIA_DIR in p.parents or p == MEDIA_DIR:
                continue
            h = file_hash(p)
            if h in seen_hashes:
                continue
            seen_hashes[h] = p
            yield p


def find_remote_urls(root: Path):
    urls = []
    seen = set()
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS and not d.startswith(".")]
        for name in filenames:
            if not (name.endswith(".tsx") or name.endswith(".ts")):
                continue
            p = Path(dirpath) / name
            try:
                txt = p.read_text(encoding="utf-8", errors="ignore")
            except Exception:
                continue
            for m in re.findall(r'https?://[^"\'\)\s]+', txt):
                u = m.rstrip("'\");,.")
                # Normalize: strip trailing query for image-serving CDNs? Keep full so download works.
                if u in seen:
                    continue
                seen.add(u)
                low = u.lower()
                if any(k in low for k in ["unsplash", "wikimedia", "googleapis", "gstatic"]):
                    if any(e in low for e in [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".avif"]) or "w=1" in low or "w=400" in low or "w=800" in low or "w=1200" in low or "w=1740" in low or "w=200" in low or "w=100" in low or "w=128" in low:
                        urls.append(u)
    return urls


def download_url(url: str, dest: Path) -> bool:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=20) as resp:
            data = resp.read()
    except Exception as e:
        print(f"  SKIP (download failed) {url}: {e}")
        return False
    if not data:
        print(f"  SKIP (empty) {url}")
        return False
    dest.write_bytes(data)
    return True


def main():
    MEDIA_DIR.mkdir(parents=True, exist_ok=True)
    reg = load_registry()
    existing_filenames = {it["filename"] for it in reg["items"]}
    max_id = max((it["id"] for it in reg["items"]), default=1000)

    # Content hashes of files already on disk, so re-runs don't duplicate.
    existing_hashes = set()
    for f in MEDIA_DIR.iterdir():
        if f.is_file() and f.name != "registry.json":
            existing_hashes.add(sha16(f))

    imported = 0

    # 1) Local image files
    for src in find_local_images(ROOT):
        src_hash = sha16(src)
        if src_hash in existing_hashes:
            continue
        name = safe_name(src.name)
        dest_name = name
        counter = 1
        while dest_name in existing_filenames or (MEDIA_DIR / dest_name).exists():
            stem, ext = os.path.splitext(name)
            dest_name = f"{stem}-{counter}{ext}"
            counter += 1
        dest = MEDIA_DIR / dest_name
        shutil.copy2(src, dest)
        existing_hashes.add(src_hash)
        reg["items"].append({
            "id": max_id + 1 + imported,
            "filename": dest_name,
            "original_name": src.name,
            "type": mime_for(dest),
            "size": dest.stat().st_size,
            "source_path": str(src.relative_to(ROOT)),
        })
        existing_filenames.add(dest_name)
        imported += 1
        print(f"  local  {src.name} -> {dest_name}")

    # 2) Remote URLs referenced in frontend source
    for url in find_remote_urls(ROOT):
        # derive filename from URL path
        from urllib.parse import urlparse, unquote
        parsed = urlparse(url)
        path = unquote(parsed.path)
        base = os.path.basename(path) or "image"
        base = safe_name(base)
        # ensure an image extension
        if not os.path.splitext(base)[1].lower() in IMAGE_EXTS:
            base = base + ".jpg"
        dest_name = base
        counter = 1
        while dest_name in existing_filenames or (MEDIA_DIR / dest_name).exists():
            stem, ext = os.path.splitext(base)
            dest_name = f"{stem}-{counter}{ext}"
            counter += 1
        dest = MEDIA_DIR / dest_name
        tmp = Path(tempfile.gettempdir()) / f"gn-media-import-{os.getpid()}-{imported}.tmp"
        ok = download_url(url, tmp)
        if not ok:
            if tmp.exists():
                tmp.unlink()
            continue
        tmp_hash = sha16(tmp)
        if tmp_hash in existing_hashes:
            tmp.unlink()
            continue
        shutil.move(str(tmp), str(dest))
        existing_hashes.add(tmp_hash)
        reg["items"].append({
            "id": max_id + 1 + imported,
            "filename": dest_name,
            "original_name": base,
            "type": mime_for(dest),
            "size": dest.stat().st_size,
            "source_url": url,
        })
        existing_filenames.add(dest_name)
        imported += 1
        print(f"  remote {url} -> {dest_name}")

    save_registry(reg)
    print(f"\nImported {imported} image(s) into media library.")
    print(f"Registry: {REGISTRY_PATH}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
