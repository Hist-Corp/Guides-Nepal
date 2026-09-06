from fastapi import APIRouter, HTTPException
import copy

router = APIRouter()

DB: dict[str, list] = {
    "pages": [
        {"id": 1, "title": "Homepage", "slug": "home", "status": "published", "path": "/"},
        {"id": 2, "title": "About", "slug": "about", "status": "published", "path": "/about"},
        {"id": 3, "title": "Contact", "slug": "contact", "status": "published", "path": "/contact"},
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


def _crud_routes(key: str, tag: str):
    @router.get(f"/{key}")
    def list_items():
        return _clone(DB[key])

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


_crud_routes("pages", "pages")
_crud_routes("blog", "blog")
_crud_routes("guides", "guides-content")
_crud_routes("media", "media")
_crud_routes("seo", "seo")
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
def get_page_sections(slug: str) -> dict:
    return {"slug": slug, "sections": _get_sections(slug)}


@router.post("/pages/{slug}/sections")
def create_page_section(slug: str, payload: dict) -> dict:
    section = _upsert_section(slug, payload)
    return {"status": "ok", "section": section}


@router.put("/pages/{slug}/sections/{section_id}")
def update_page_section(slug: str, section_id: str, payload: dict) -> dict:
    saved = _upsert_section(slug, {**payload, "id": section_id})
    return {"status": "ok", "section": saved}


@router.put("/pages/{slug}/sections")
def update_all_sections(slug: str, payload: dict) -> dict:
    sections = payload.get("sections", [])
    SECTION_OVERRIDES[slug] = _clone(sections)
    return {"status": "ok", "count": len(sections)}


@router.delete("/pages/{slug}/sections/{section_id}")
def delete_page_section(slug: str, section_id: str) -> dict:
    if slug not in SECTION_OVERRIDES:
        SECTION_OVERRIDES[slug] = _clone(DEFAULT_SECTIONS.get(slug, []))
    before = len(SECTION_OVERRIDES[slug])
    SECTION_OVERRIDES[slug] = [s for s in SECTION_OVERRIDES[slug] if s.get("id") != section_id]
    if len(SECTION_OVERRIDES[slug]) == before:
        raise HTTPException(status_code=404, detail="Section not found")
    return {"status": "ok", "message": "Section deleted"}
