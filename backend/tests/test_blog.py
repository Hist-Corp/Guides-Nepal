"""Blog visibility tests: the dashboard and the frontend share one source of truth.

- Anonymous visitors (the public frontend BlogPage) may only read
  ``status == "published"`` posts — they must never see drafts.
- Staff (admin / content-manager) see everything, drafts included, so the
  dashboard table shows exactly what writers created.
- Writes stay restricted to staff.
"""
from fastapi.testclient import TestClient

from app.core.security import create_access_token, get_password_hash
from app.models.user import User

BLOG = "/api/v1/content/blog"

STRONG_PASSWORD = "Blog@2024"


def _make_user(db_session, email: str, role: str) -> User:
    user = User(
        email=email,
        hashed_password=get_password_hash(STRONG_PASSWORD),
        firstName=email.split("@")[0].title(),
        lastName="Test",
        role=role,
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


def _bearer(user: User) -> dict:
    return {"Authorization": f"Bearer {create_access_token(user.id)}"}


class TestBlogVisibility:
    def test_anonymous_sees_only_published(self, client: TestClient):
        res = client.get(BLOG)
        assert res.status_code == 200
        posts = res.json()
        # Seed data mirrors the 6 real frontend posts, all published.
        assert len(posts) == 6
        assert {p["slug"] for p in posts} == {
            "hidden-gems-kathmandu",
            "foodie-guide-newari-cuisine",
            "pokhara-beyond-tourist-trail",
            "sustainable-travel-nepal-guide",
            "bhaktapur-walking-living-history",
            "how-to-become-local-guide-nepal",
        }
        assert all((p.get("status") or "").lower() == "published" for p in posts)

    def test_anonymous_cannot_write(self, client: TestClient):
        res = client.post(BLOG, json={"title": "Nope", "slug": "nope"})
        assert res.status_code in (401, 403)

    def test_staff_sees_drafts_and_anonymous_does_not(
        self, client: TestClient, db_session
    ):
        admin = _make_user(db_session, "blog-admin@example.com", "admin")
        created = client.post(
            BLOG,
            json={"title": "Draft Post", "slug": "draft-post", "status": "draft"},
            headers=_bearer(admin),
        )
        assert created.status_code == 200
        draft_id = created.json()["id"]
        assert created.json()["status"] == "draft"

        staff_list = client.get(BLOG, headers=_bearer(admin)).json()
        assert any(p["id"] == draft_id for p in staff_list)

        anon_list = client.get(BLOG).json()
        assert all(p["id"] != draft_id for p in anon_list)

        # Draft detail is 404 for anonymous, readable for staff.
        assert client.get(f"{BLOG}/{draft_id}").status_code == 404
        staff_detail = client.get(f"{BLOG}/{draft_id}", headers=_bearer(admin))
        assert staff_detail.status_code == 200
        assert staff_detail.json()["title"] == "Draft Post"

    def test_new_posts_default_to_draft(self, client: TestClient, db_session):
        manager = _make_user(db_session, "blog-manager@example.com", "content-manager")
        created = client.post(
            BLOG,
            json={"title": "Untitled Thoughts", "slug": "untitled-thoughts"},
            headers=_bearer(manager),
        )
        assert created.status_code == 200
        assert created.json()["status"] == "draft"
        # …so it stays hidden from the frontend until published.
        assert all(
            p["slug"] != "untitled-thoughts" for p in client.get(BLOG).json()
        )
