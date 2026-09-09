from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File
from app.core.dependencies import require_role
from app.models.user import User
import copy
import json
import os
import re
import io
import hashlib
from uuid import uuid4

# Optional server-side image compression (Pillow). If Pillow is not
# installed the upload still works — images are just stored as-is.
try:
    from PIL import Image, ImageFile, ImageOps
    ImageFile.LOAD_TRUNCATED_IMAGES = True
    _HAS_PILLOW = True
except ImportError:
    _HAS_PILLOW = False
from urllib.parse import urlparse

router = APIRouter()

CMS_WRITER_OR_ADMIN = require_role("admin", "content-writer")

DB: dict[str, list] = {
    "pages": [
        {"id": 1, "title": "Home", "slug": "home", "status": "published", "path": "/", "description": "The landing page — hero, category grid, promo banner and footer are all editable blocks."},
        {"id": 2, "title": "About", "slug": "about", "status": "published", "path": "/about", "description": "Brand story — hero, mission, values and team sections."},
        {"id": 3, "title": "Contact", "slug": "contact", "status": "published", "path": "/contact", "description": "Contact page — hero and contact info band with email, phone and address."},
        {"id": 4, "title": "Blog", "slug": "blog", "status": "published", "path": "/blog", "description": "Journal / Learn — article listing page, editable hero and intro copy."},
        {"id": 5, "title": "FAQ", "slug": "faq", "status": "published", "path": "/faq", "description": "Frequently asked questions — hero and body copy editable."},
        {"id": 6, "title": "Destinations", "slug": "destinations", "status": "published", "path": "/destinations", "description": "Destination overview — hero and intro copy for Nepal's cities."},
        {"id": 7, "title": "How It Works", "slug": "how-it-works", "status": "published", "path": "/how-it-works", "description": "The booking process explained — hero and step-by-step copy."},
        {"id": 8, "title": "Sustainability", "slug": "sustainability", "status": "published", "path": "/sustainability", "description": "Responsible travel commitments — hero and body copy."},
        {"id": 9, "title": "Press", "slug": "press", "status": "published", "path": "/press", "description": "Press and media coverage — hero and body copy."},
        {"id": 10, "title": "Jobs", "slug": "jobs", "status": "published", "path": "/jobs", "description": "Careers page — hero and body copy for open roles."},
        {"id": 11, "title": "Gift Cards", "slug": "gift-cards", "status": "published", "path": "/gift-cards", "description": "Gift cards — hero and body copy."},
        {"id": 12, "title": "Host Center", "slug": "host-center", "status": "published", "path": "/host-center", "description": "B2B onboarding for hosts — hero, benefits and signup band."},
        {"id": 13, "title": "Hosting", "slug": "hosting", "status": "published", "path": "/hosting", "description": "Hosting with Guides Nepal — hero and body copy."},
        {"id": 14, "title": "Community", "slug": "community", "status": "published", "path": "/community", "description": "Community page — hero and body copy."},
        {"id": 15, "title": "Terms", "slug": "terms", "status": "published", "path": "/terms", "description": "Terms of service — hero and body copy."},
        {"id": 16, "title": "Help", "slug": "help", "status": "published", "path": "/help", "description": "Help center — hero and body copy."},
    ],
    "blog": [
        {"id": 1, "title": "Top 10 Treks in Nepal", "slug": "top-10-treks-in-nepal", "author": "Priya Sharma", "date": "2026-08-12", "status": "published", "content": "Nepal is home to some of the world's best trekking routes. From the Everest Base Camp trail to the Annapurna Circuit, here are our top picks."},
        {"id": 2, "title": "A Foodie's Guide to Kathmandu", "slug": "foodies-guide-kathmandu", "author": "Rohan Thapa", "date": "2026-08-20", "status": "published", "content": "From steaming momos to Newari samay baji, Kathmandu's street food scene is a journey in itself."},
        {"id": 3, "title": "Pokhara Beyond the Lake", "slug": "pokhara-beyond-the-lake", "author": "Sujal Karki", "date": "2026-09-01", "status": "draft", "content": "While Phewa Lake gets the fame, Pokhara offers caves, waterfalls and mountain viewpoints worth exploring."},
    ],
    "guides": [
        {"id": 1, "title": "Kathmandu Heritage Walk", "type": "description", "status": "published", "body": "Walk through the ancient streets of Kathmandu Durbar Square with a local historian."},
        {"id": 2, "title": "Pokhara Lakeside Tour", "type": "itinerary", "status": "published", "body": "Day 1: Lakeside stroll and sunset boat ride. Day 2: Sarangkot sunrise and hike."},
        {"id": 3, "title": "Bhaktapur Pottery Workshop", "type": "faq", "status": "draft", "body": "What should I wear? Can kids join? How long does the workshop take?"},
    ],
    "media": [
        {"id": 1, "name": "kathmandu-hero.jpg", "type": "image", "size": "2.4 MB", "uploaded": "2026-08-10"},
        {"id": 2, "name": "pokhara-lake.jpg", "type": "image", "size": "1.8 MB", "uploaded": "2026-08-15"},
        {"id": 3, "name": "guide-portrait.jpg", "type": "image", "size": "0.9 MB", "uploaded": "2026-08-22"},
    ],
    "seo": [
        {"id": 1, "page": "Homepage", "title": "Guides Nepal - Go Local in Charming Cities", "description": "Find unforgettable experiences with locals across Nepal.", "keywords": "nepal, local guides, experiences"},
        {"id": 2, "page": "About", "title": "About Us | Guides Nepal", "description": "Connecting travelers with authentic local experiences across Nepal.", "keywords": "about, guides nepal"},
        {"id": 3, "page": "Contact", "title": "Contact Us | Guides Nepal", "description": "Get in touch with the Guides Nepal team.", "keywords": "contact, support"},
    ],
}
NEXT_ID = 1000


def _clone(obj):
    return copy.deepcopy(obj)


def _find(key: str, item_id: int):
    for item in DB[key]:
        if item.get("id") == item_id:
            return item
    raise HTTPException(status_code=404, detail=f"{key[:-1]} not found")


def _crud_routes(key: str, tag: str, auth_dep=None):
    if auth_dep:
        @router.get(f"/{key}")
        def list_items(current_user: User = Depends(auth_dep)):
            items = _clone(DB[key])
            if key == "pages":
                for it in items:
                    it["sectionCount"] = len(_get_sections(it.get("slug", "")))
            return items

        @router.post(f"/{key}")
        def create_item(payload: dict, current_user: User = Depends(auth_dep)):
            global NEXT_ID
            item = {**payload, "id": NEXT_ID}
            NEXT_ID += 1
            DB[key].append(item)
            return _clone(item)

        @router.patch(f"/{key}/{{item_id}}")
        def update_item(item_id: int, payload: dict, current_user: User = Depends(auth_dep)):
            item = _find(key, item_id)
            item.update(payload)
            return _clone(item)

        @router.delete(f"/{key}/{{item_id}}")
        def delete_item(item_id: int, current_user: User = Depends(auth_dep)):
            item = _find(key, item_id)
            DB[key].remove(item)
            return {"status": "ok", "message": "Deleted"}
    else:
        @router.get(f"/{key}")
        def list_items():
            items = _clone(DB[key])
            if key == "pages":
                for it in items:
                    it["sectionCount"] = len(_get_sections(it.get("slug", "")))
            return items

        @router.post(f"/{key}")
        def create_item(payload: dict):
            global NEXT_ID
            item = {**payload, "id": NEXT_ID}
            NEXT_ID += 1
            DB[key].append(item)
            return _clone(item)

        @router.patch(f"/{key}/{{item_id}}")
        def update_item(item_id: int, payload: dict):
            item = _find(key, item_id)
            item.update(payload)
            return _clone(item)

        @router.delete(f"/{key}/{{item_id}}")
        def delete_item(item_id: int):
            item = _find(key, item_id)
            DB[key].remove(item)
            return {"status": "ok", "message": "Deleted"}


# --- Media Library (uploaded files) & Image Placements ---

# Uploaded media lives in backend/uploads/media with a JSON registry so the
# dashboard can manage (upload / replace / delete) images directly.
MEDIA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../uploads/media"))
os.makedirs(MEDIA_DIR, exist_ok=True)
MEDIA_REGISTRY_PATH = os.path.join(MEDIA_DIR, "registry.json")

# Frontend spots an uploaded image can be placed into from the dashboard.
PLACEMENT_SLOTS = [
    {"key": "home-promo", "label": "Home — Promo Banner"},
    {"key": "destinations-kathmandu", "label": "Destinations — Kathmandu Card"},
    {"key": "destinations-pokhara", "label": "Destinations — Pokhara Card"},
    {"key": "destinations-lalitpur", "label": "Destinations — Lalitpur Card"},
    {"key": "destinations-bhaktapur", "label": "Destinations — Bhaktapur Card"},
    {"key": "destinations-bharatpur", "label": "Destinations — Bharatpur Card"},
    {"key": "blog-post-1", "label": "Blog — Post Image 1"},
    {"key": "blog-post-2", "label": "Blog — Post Image 2"},
    {"key": "blog-post-3", "label": "Blog — Post Image 3"},
    {"key": "blog-post-4", "label": "Blog — Post Image 4"},
    {"key": "blog-post-5", "label": "Blog — Post Image 5"},
    {"key": "blog-post-6", "label": "Blog — Post Image 6"},
    {"key": "about-hero", "label": "About — Hero Image"},
    {"key": "contact-hero", "label": "Contact — Hero Image"},
]
_PLACEMENT_KEYS = {s["key"] for s in PLACEMENT_SLOTS}


def _load_registry() -> dict:
    try:
        with open(MEDIA_REGISTRY_PATH, "r", encoding="utf-8") as f:
            reg = json.load(f)
            if isinstance(reg, dict) and "items" in reg and "placements" in reg:
                return reg
    except Exception:
        pass
    return {"items": [], "placements": {}}


def _save_registry(reg: dict) -> None:
    with open(MEDIA_REGISTRY_PATH, "w", encoding="utf-8") as f:
        json.dump(reg, f, indent=2)


def _media_url(request: Request, filename: str) -> str:
    return f"{str(request.base_url).rstrip('/')}/uploads/media/{filename}"


# --- Image Compression (reduces storage + bandwidth without quality loss) ---

# Target max dimension for stored images. Larger images are downscaled to this
# width/height (aspect ratio preserved). Well below 4K but sharp on all screens.
_MAX_DIMENSION = 1920
# JPEG quality for compression. 85 is visually indistinguishable from original
# for most photos while reducing file size by 60-80%.
_JPEG_QUALITY = 85
# Only compress images larger than this size (bytes) to avoid re-compressing
# already-small files.
_COMPRESS_THRESHOLD = 100 * 1024  # 100 KB


def _compress_image(content: bytes, content_type: str) -> tuple[bytes, str]:
    """Compress an image for storage. Returns (compressed_bytes, ext).

    - Downscales to `_MAX_DIMENSION` on the longest side (aspect preserved).
    - Re-encodes as JPEG with `_JPEG_QUALITY` for 60-80% size reduction.
    - Non-JPEG/PNG inputs (GIF, BMP, WebP) are normalized.
    - Small images (< _COMPRESS_THRESHOLD) are returned unchanged.
    - Non-image data is returned unchanged.
    """
    if not _HAS_PILLOW or len(content) < _COMPRESS_THRESHOLD:
        return content, ""

    try:
        img = Image.open(io.BytesIO(content))
        img = ImageOps.exif_transpose(img)  # Respect EXIF orientation
        original_format = img.format
    except Exception:
        return content, ""

    # Only handle image types we can safely re-encode
    if original_format not in ("JPEG", "JPG", "PNG", "WEBP", "BMP", "GIF", "TIFF"):
        return content, ""

    # Downscale if large
    w, h = img.size
    longest = max(w, h)
    if longest > _MAX_DIMENSION:
        scale = _MAX_DIMENSION / longest
        new_w, new_h = int(w * scale), int(h * scale)
        img = img.resize((new_w, new_h), Image.LANCZOS)

    # Convert to RGB if necessary (JPEG doesn't support alpha)
    if img.mode in ("RGBA", "LA", "P"):
        # Preserve transparency for PNG; JPEG gets white background
        if original_format == "PNG":
            output = io.BytesIO()
            img.save(output, format="PNG", optimize=True)
            return output.getvalue(), ""
        bg = Image.new("RGB", img.size, (255, 255, 255))
        if img.mode == "P":
            img = img.convert("RGBA")
        if img.mode in ("RGBA", "LA"):
            bg.paste(img, mask=img.split()[-1])
            img = bg
        else:
            img = img.convert("RGB")
    elif img.mode != "RGB":
        img = img.convert("RGB")

    output = io.BytesIO()
    img.save(output, format="JPEG", quality=_JPEG_QUALITY, optimize=True)
    compressed = output.getvalue()

    # Only use compressed version if it's actually smaller
    if len(compressed) < len(content):
        return compressed, ".jpg"
    return content, ""


@router.get("/media")
def list_media(request: Request, current_user: User = Depends(CMS_WRITER_OR_ADMIN)):
    reg = _load_registry()
    items = []
    for it in reg["items"]:
        items.append({
            **it,
            "url": _media_url(request, it["filename"]),
            "placements": sorted(
                k for k, v in reg["placements"].items() if v.get("media_id") == it["id"]
            ),
        })
    return items


@router.post("/media/upload")
async def upload_media(
    request: Request,
    file: UploadFile = File(...),
    replace_id: int | None = None,
    current_user: User = Depends(CMS_WRITER_OR_ADMIN),
):
    """Upload an image to the media library. Images are automatically
    compressed (downscaled to 1920px, JPEG q85) to reduce storage and
    bandwidth without visible quality loss. With ``replace_id`` the given
    existing media item's file is swapped in place (same library entry)."""
    reg = _load_registry()
    safe_name = re.sub(r"[^A-Za-z0-9._-]", "_", file.filename or "image")
    filename = f"{uuid4().hex[:8]}-{safe_name}"
    content = await file.read()
    if not content:
        raise HTTPException(status_code=422, detail="Empty file")

    # Compress image before storing (reduces size 60-80% without quality loss)
    compressed, new_ext = _compress_image(content, file.content_type or "")
    if new_ext:
        filename = filename.rsplit(".", 1)[0] + new_ext
    content = compressed

    with open(os.path.join(MEDIA_DIR, filename), "wb") as f:
        f.write(content)

    if replace_id is not None:
        for it in reg["items"]:
            if it["id"] == replace_id:
                old = os.path.join(MEDIA_DIR, it["filename"])
                if os.path.exists(old):
                    try:
                        os.remove(old)
                    except OSError:
                        pass
                it["filename"] = filename
                it["type"] = file.content_type or "image/jpeg"
                it["size"] = len(content)
                _save_registry(reg)
                return {**it, "url": _media_url(request, filename)}
        raise HTTPException(status_code=404, detail="Media item not found")

    item = {
        "id": max((i["id"] for i in reg["items"]), default=1000) + 1,
        "filename": filename,
        "original_name": safe_name,
        "type": file.content_type or "image/jpeg",
        "size": len(content),
    }
    reg["items"].insert(0, item)
    _save_registry(reg)
    return {**item, "url": _media_url(request, filename), "placements": []}


@router.post("/media/upload-url")
async def upload_media_from_url(
    request: Request,
    payload: dict,
    current_user: User = Depends(CMS_WRITER_OR_ADMIN),
):
    """Download an image from a URL and add it to the media library.
    The image is fetched, compressed, and stored like a regular upload."""
    url = (payload.get("url") or "").strip()
    if not url:
        raise HTTPException(status_code=422, detail="Missing image URL")

    # Validate URL
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https") or not parsed.netloc:
        raise HTTPException(status_code=422, detail="Invalid URL")

    # Download the image (with timeout and size limit)
    try:
        import urllib.request
        req = urllib.request.Request(url, headers={"User-Agent": "GuidesNepal-MediaBot/1.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            content_type = resp.headers.get("Content-Type", "")
            content = resp.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not download image: {e}")

    if not content:
        raise HTTPException(status_code=422, detail="Downloaded file is empty")

    # Limit to 25 MB raw download
    if len(content) > 25 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Image too large (max 25 MB)")

    # Derive a safe filename from the URL
    url_path = parsed.path
    original_name = os.path.basename(url_path) or "image"
    original_name = re.sub(r"[^A-Za-z0-9._-]", "_", original_name)
    if not original_name or original_name == "_":
        original_name = "image"

    # Compress
    compressed, new_ext = _compress_image(content, content_type)
    if new_ext:
        filename = f"{uuid4().hex[:8]}-{original_name.rsplit('.', 1)[0]}{new_ext}"
    else:
        filename = f"{uuid4().hex[:8]}-{original_name}"
    content = compressed

    reg = _load_registry()
    item = {
        "id": max((i["id"] for i in reg["items"]), default=1000) + 1,
        "filename": filename,
        "original_name": original_name,
        "type": content_type if content_type.startswith("image/") else "image/jpeg",
        "size": len(content),
        "source_url": url,
    }
    reg["items"].insert(0, item)
    _save_registry(reg)

    with open(os.path.join(MEDIA_DIR, filename), "wb") as f:
        f.write(content)

    return {**item, "url": _media_url(request, filename), "placements": []}


@router.patch("/media/{item_id}")
def update_media(item_id: int, payload: dict, current_user: User = Depends(CMS_WRITER_OR_ADMIN)):
    reg = _load_registry()
    for it in reg["items"]:
        if it["id"] == item_id:
            it.update({k: v for k, v in payload.items() if k in ("original_name",)})
            _save_registry(reg)
            return it
    raise HTTPException(status_code=404, detail="Media item not found")


@router.delete("/media/{item_id}")
def delete_media(item_id: int, current_user: User = Depends(CMS_WRITER_OR_ADMIN)):
    reg = _load_registry()
    item = next((i for i in reg["items"] if i["id"] == item_id), None)
    if item is None:
        raise HTTPException(status_code=404, detail="Media item not found")
    path = os.path.join(MEDIA_DIR, item["filename"])
    if os.path.exists(path):
        try:
            os.remove(path)
        except OSError:
            pass
    reg["items"].remove(item)
    reg["placements"] = {
        k: v for k, v in reg["placements"].items() if v.get("media_id") != item_id
    }
    _save_registry(reg)
    return {"status": "ok", "message": "Deleted"}


@router.get("/placements")
def get_placements(request: Request):
    """Public: which uploaded image is placed where on the frontend."""
    reg = _load_registry()
    placements = {}
    for key, val in reg["placements"].items():
        item = next((i for i in reg["items"] if i["id"] == val.get("media_id")), None)
        if item is not None:
            placements[key] = _media_url(request, item["filename"])
    return {"placements": placements, "slots": PLACEMENT_SLOTS}


@router.put("/placements/{key}")
def set_placement(key: str, payload: dict, current_user: User = Depends(CMS_WRITER_OR_ADMIN)):
    if key not in _PLACEMENT_KEYS:
        raise HTTPException(status_code=404, detail="Unknown placement slot")
    media_id = payload.get("media_id")
    reg = _load_registry()
    if not any(i["id"] == media_id for i in reg["items"]):
        raise HTTPException(status_code=404, detail="Media item not found")
    reg["placements"][key] = {"media_id": media_id, "set_at": "now"}
    _save_registry(reg)
    return {"status": "ok", "key": key, "media_id": media_id}


@router.delete("/placements/{key}")
def clear_placement(key: str, current_user: User = Depends(CMS_WRITER_OR_ADMIN)):
    reg = _load_registry()
    reg["placements"].pop(key, None)
    _save_registry(reg)
    return {"status": "ok"}


_crud_routes("pages", "pages", CMS_WRITER_OR_ADMIN)
_crud_routes("blog", "blog", CMS_WRITER_OR_ADMIN)
_crud_routes("guides", "guides-content", CMS_WRITER_OR_ADMIN)
_crud_routes("media", "media", CMS_WRITER_OR_ADMIN)
_crud_routes("seo", "seo", CMS_WRITER_OR_ADMIN)
# --- Page Sections (Live Editor) ---
SECTION_OVERRIDES: dict[str, list] = {}
NEXT_SECTION_ID = 100

DEFAULT_SECTIONS = {
    "home": [
        {"id": "home-hero", "title": "Hero Section", "type": "hero",
         "content": {"heading": "Go local in Charming Cities", "subtitle": "Find unforgettable experiences with locals across Nepal", "buttonText": "Explore", "primaryText": "Guides Nepal", "tagline": "Discover Nepal like a local"},
         "style": {"backgroundColor": "#213448", "textColor": "#ffffff", "accentColor": "#F4B400", "alignment": "center", "headingSize": "3rem", "padding": "4rem"}},
        {"id": "home-promo", "title": "Promo Banner", "type": "promo",
         "content": {"heading": "Enjoy the Best of the City Like a Local", "subtitle": "Skip the tourist traps and explore the city with people who know it best.", "buttonText": "Find a Local"},
         "style": {"backgroundColor": "#9A2143", "textColor": "#ffffff", "alignment": "center", "headingSize": "2.5rem", "padding": "5rem"}},
        {"id": "home-categories", "title": "Category Grid", "type": "categories",
         "content": {"heading": "Browse by category", "subtitle": "Find the perfect experience type for you", "items": ["Foodies", "Families", "Night owls", "Newbies", "Outdoor", "Culture"]},
         "style": {"backgroundColor": "#ffffff", "textColor": "#213448", "headingSize": "1.5rem"}},
        {"id": "home-featured", "title": "Featured Experiences", "type": "featured",
         "content": {"heading": "Go local in Charming Cities", "subtitle": "Find unforgettable experiences with locals"},
         "style": {"backgroundColor": "#ffffff", "textColor": "#213448", "alignment": "left"}},
        {"id": "home-testimonials", "title": "Testimonials", "type": "testimonials",
         "content": {"heading": "Travelers love our locals", "subtitle": "Real reviews from real travelers in Nepal"},
         "style": {"backgroundColor": "#E0F2FE", "textColor": "#213448", "alignment": "center"}},
        {"id": "home-values", "title": "Why Guides Nepal", "type": "values",
         "content": {"heading": "Why guides-nepal?", "items": ["People first", "Tailor it to your wishes", "More you, less checklist"]},
         "style": {"backgroundColor": "#ffffff", "textColor": "#213448", "alignment": "center"}},
        {"id": "home-footer", "title": "Footer", "type": "footer",
         "content": {"topLinks": ["About", "Help", "Hosting", "Community"], "supportEmail": "support@guides-nepal.com", "copyright": "guides-nepal. All rights reserved."},
         "style": {"backgroundColor": "#9A2143", "textColor": "#ffffff"}},
    ],
    "about": [
        {"id": "about-hero", "title": "About Hero", "type": "hero",
         "content": {"heading": "About Guides Nepal", "subtitle": "Connecting travelers with authentic local experiences across Nepal.", "buttonText": "Contact Us"},
         "style": {"backgroundColor": "#213448", "textColor": "#ffffff", "alignment": "center", "headingSize": "3rem"}},
        {"id": "about-mission", "title": "Our Mission", "type": "text",
         "content": {"heading": "Our Mission", "body": "We believe that the best travel experiences come from connecting with locals who share their passion, knowledge, and culture."},
         "style": {"backgroundColor": "#ffffff", "textColor": "#213448", "alignment": "center"}},
        {"id": "about-values", "title": "Our Values", "type": "values",
         "content": {"items": ["Authenticity", "Sustainability", "Community"]},
         "style": {"backgroundColor": "#f8f8f8", "textColor": "#213448"}},
    ],
    "contact": [
        {"id": "contact-hero", "title": "Contact Hero", "type": "hero",
         "content": {"heading": "Contact Us", "subtitle": "Have a question or need help? We're here for you."},
         "style": {"backgroundColor": "#213448", "textColor": "#ffffff", "alignment": "center", "headingSize": "3rem"}},
        {"id": "contact-info", "title": "Contact Info", "type": "contact",
         "content": {"heading": "Get in Touch", "email": "support@guides-nepal.com", "phone": "+977-1-1234567", "address": "Thamel, Kathmandu, Nepal"},
         "style": {"backgroundColor": "#ffffff", "textColor": "#213448"}},
    ],
}

# Auto-generate a default section template for every frontend page that
# does not have an explicit template above, so each page in the Pages
# list is editable in the live editor and stays synced with the real page.
_FRONTEND_PAGE_TITLES = {
    "blog": "Blog", "faq": "FAQ", "destinations": "Destinations",
    "how-it-works": "How It Works", "sustainability": "Sustainability",
    "press": "Press", "jobs": "Jobs", "gift-cards": "Gift Cards",
    "host-center": "Host Center", "hosting": "Hosting",
    "community": "Community", "terms": "Terms", "help": "Help",
}


def _default_template(slug: str) -> list:
    label = _FRONTEND_PAGE_TITLES.get(slug, slug.replace("-", " ").title())
    return [
        {"id": f"{slug}-hero", "title": f"{label} Hero", "type": "hero",
         "content": {"heading": label, "subtitle": f"{label} page on Guides Nepal.", "buttonText": ""},
         "style": {"backgroundColor": "#213448", "textColor": "#ffffff", "accentColor": "#F4B400", "alignment": "center", "headingSize": "3rem", "padding": "4rem"}},
        {"id": f"{slug}-body", "title": f"{label} Body", "type": "text",
         "content": {"heading": "", "body": f"Content for the {label} page. Click this section in the live preview to edit it."},
         "style": {"backgroundColor": "#ffffff", "textColor": "#213448", "alignment": "left", "padding": "2.5rem"}},
    ]


for _slug in _FRONTEND_PAGE_TITLES:
    if _slug not in DEFAULT_SECTIONS:
        DEFAULT_SECTIONS[_slug] = _default_template(_slug)


def _get_sections(slug: str):
    return _clone(SECTION_OVERRIDES.get(slug, DEFAULT_SECTIONS.get(slug, [])))


def _upsert_section(slug: str, section: dict):
    global NEXT_SECTION_ID
    if slug not in SECTION_OVERRIDES:
        SECTION_OVERRIDES[slug] = _clone(DEFAULT_SECTIONS.get(slug, []))
    for i, s in enumerate(SECTION_OVERRIDES[slug]):
        if s.get("id") == section.get("id"):
            SECTION_OVERRIDES[slug][i] = {**s, **section}
            return _clone(SECTION_OVERRIDES[slug][i])
    if "id" not in section:
        section["id"] = f"sec-{NEXT_SECTION_ID}"
        NEXT_SECTION_ID += 1
    SECTION_OVERRIDES[slug].append(section)
    return _clone(section)


@router.get("/pages/{slug}/sections")
def get_page_sections(slug: str, current_user: User = Depends(CMS_WRITER_OR_ADMIN)) -> dict:
    return {"slug": slug, "sections": _get_sections(slug)}


@router.post("/pages/{slug}/sections")
def create_page_section(slug: str, payload: dict, current_user: User = Depends(CMS_WRITER_OR_ADMIN)) -> dict:
    section = _upsert_section(slug, payload)
    return {"status": "ok", "section": section}


@router.put("/pages/{slug}/sections/{section_id}")
def update_page_section(slug: str, section_id: str, payload: dict, current_user: User = Depends(CMS_WRITER_OR_ADMIN)) -> dict:
    saved = _upsert_section(slug, {**payload, "id": section_id})
    return {"status": "ok", "section": saved}


@router.put("/pages/{slug}/sections")
def update_all_sections(slug: str, payload: dict, current_user: User = Depends(CMS_WRITER_OR_ADMIN)) -> dict:
    sections = payload.get("sections", [])
    SECTION_OVERRIDES[slug] = _clone(sections)
    return {"status": "ok", "count": len(sections)}


@router.delete("/pages/{slug}/sections/{section_id}")
def delete_page_section(slug: str, section_id: str, current_user: User = Depends(CMS_WRITER_OR_ADMIN)) -> dict:
    if slug not in SECTION_OVERRIDES:
        SECTION_OVERRIDES[slug] = _clone(DEFAULT_SECTIONS.get(slug, []))
    before = len(SECTION_OVERRIDES[slug])
    SECTION_OVERRIDES[slug] = [s for s in SECTION_OVERRIDES[slug] if s.get("id") != section_id]
    if len(SECTION_OVERRIDES[slug]) == before:
        raise HTTPException(status_code=404, detail="Section not found")
    return {"status": "ok", "message": "Section deleted"}
