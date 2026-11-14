"""Guide account lifecycle: approval, profile activation and assigned listings."""

import json

from app.core.roles import GUIDE, REGIONAL_HEAD
from app.core.security import create_access_token, get_password_hash
from app.models.booking import HostExperience
from app.models.guide import Guide
from app.models.guide_application import GuideApplication
from app.models.guide_listing import GuideListing, GuideProfile
from app.models.host_guide import HostExperienceGuide, HostGuide
from app.models.user import User

PASSWORD = "GuidePass123!"
REVIEW_URL = "/api/v1/operations/guide-applications/{application_id}"


def _regional_head(db_session, region="Bagmati Province") -> User:
    user = User(
        email=f"regional-{region.lower().replace(' ', '-')}@example.com",
        hashed_password=get_password_hash(PASSWORD),
        firstName="Regional",
        lastName="Manager",
        role=REGIONAL_HEAD,
        region=region,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


def _pending_guide(db_session, *, email, name, catalog_id, unique_name=False):
    user = User(
        email=email,
        firstName=name.split(" ")[0],
        lastName=" ".join(name.split(" ")[1:]),
        hashed_password=get_password_hash(PASSWORD),
        role=GUIDE,
        region="Bagmati Province",
        is_active=False,
    )
    db_session.add(user)
    db_session.flush()
    application = GuideApplication(
        full_name=name,
        email=email,
        city="Kathmandu",
        region="Bagmati Province",
        status="pending",
        user_id=user.id,
        details_json=json.dumps(
            {
                "catalog_guide_id": catalog_id,
                "catalog_guide_name": name,
                "catalog_name_is_unique": unique_name,
                "cities": ["Kathmandu"],
                "languages": ["English", "Nepali"],
                "role": "Heritage Guide",
                "onboarding_completed": True,
            }
        ),
    )
    db_session.add(application)
    db_session.commit()
    db_session.refresh(application)
    return user, application


def test_pending_guide_is_blocked_until_regional_head_approves(client, db_session):
    reviewer = _regional_head(db_session)
    user, application = _pending_guide(
        db_session,
        email="pending@example.com",
        name="Pending Guide",
        catalog_id=9001,
        unique_name=True,
    )

    response = client.post(
        "/api/v1/auth/login",
        json={"email": user.email, "password": PASSWORD},
    )
    assert response.status_code == 403
    assert "regional head approves" in response.json()["detail"]

    response = client.patch(
        REVIEW_URL.format(application_id=application.id),
        json={"status": "approved"},
        headers={"Authorization": f"Bearer {create_access_token(reviewer.id)}"},
    )
    assert response.status_code == 200, response.text
    assert response.json()["catalog_guide_id"] == 9001

    db_session.expire_all()
    user = db_session.query(User).filter_by(email="pending@example.com").one()
    assert user.is_active is True
    link = db_session.query(HostGuide).filter_by(guide_user_id=user.id).one()
    profile = db_session.get(Guide, link.guide_id)
    assert profile is not None and profile.name == "Pending Guide"
    assert db_session.query(GuideProfile).filter_by(guide_user_id=user.id).one()

    response = client.post(
        "/api/v1/auth/login",
        json={"email": user.email, "password": PASSWORD},
    )
    assert response.status_code == 200, response.text


def test_duplicate_name_approval_uses_its_own_catalog_profile(client, db_session):
    reviewer = _regional_head(db_session)
    db_session.add(
        Guide(
            id=1,
            name="Apicha",
            image="/images/apicha.jpg",
            role="Foodie",
            rating=4.9,
            reviews=10,
            bio="First Apicha",
            languages=["English"],
            cities=["Kathmandu"],
            gallery=[],
        )
    )
    db_session.commit()
    _, application = _pending_guide(
        db_session,
        email="apicha-second@example.com",
        name="Apicha",
        catalog_id=54,
        unique_name=False,
    )

    response = client.patch(
        REVIEW_URL.format(application_id=application.id),
        json={"status": "approved"},
        headers={"Authorization": f"Bearer {create_access_token(reviewer.id)}"},
    )
    assert response.status_code == 200, response.text

    db_session.expire_all()
    second = db_session.get(Guide, 54)
    first = db_session.get(Guide, 1)
    assert second is not None and second.name == "Apicha"
    assert first is not None and first.name == "Apicha"
    assert second.id != first.id


def test_guide_listings_include_regional_manager_assignments(client, db_session):
    reviewer = _regional_head(db_session)
    user, application = _pending_guide(
        db_session,
        email="assigned@example.com",
        name="Assigned Guide",
        catalog_id=9010,
        unique_name=True,
    )
    client.patch(
        REVIEW_URL.format(application_id=application.id),
        json={"status": "approved"},
        headers={"Authorization": f"Bearer {create_access_token(reviewer.id)}"},
    )

    db_session.expire_all()
    link = db_session.query(HostGuide).filter_by(guide_user_id=user.id).one()
    experience = HostExperience(
        host_id=reviewer.id,
        title="Assigned Heritage Walk",
        slug="assigned-heritage-walk",
        city="Kathmandu",
        category="Heritage tour",
        description="A Regional Manager assignment.",
        price=60,
        duration="3 hours",
        is_active=True,
    )
    db_session.add(experience)
    db_session.flush()
    db_session.add(
        HostExperienceGuide(
            host_id=reviewer.id,
            experience_id=experience.id,
            guide_id=link.guide_id,
            is_primary=True,
        )
    )
    db_session.add(
        GuideListing(
            guide_user_id=user.id,
            title="Owned Walk",
            category="tour",
            city="Kathmandu",
            description="Owned by the guide.",
            duration="2 hours",
            difficulty="Easy",
            price=30,
            max_guests=6,
        )
    )
    other_user = User(
        email="other-guide@example.com",
        hashed_password=get_password_hash(PASSWORD),
        firstName="Other",
        lastName="Guide",
        role=GUIDE,
        is_active=True,
    )
    db_session.add(other_user)
    db_session.flush()
    other_profile = Guide(
        id=9011,
        name="Other Guide",
        image="/images/placeholder.svg",
        role="Guide",
        rating=4.8,
        reviews=1,
        bio="Another guide in the catalog.",
        languages=["English"],
        cities=["Kathmandu"],
        gallery=[],
    )
    db_session.add(other_profile)
    db_session.flush()
    other_listing = GuideListing(
        guide_user_id=other_user.id,
        title="Assigned Listing Walk",
        category="tour",
        city="Kathmandu",
        description="Owned by another guide and assigned to this one.",
        duration="1 hour",
        difficulty="Easy",
        price=20,
        max_guests=4,
    )
    db_session.add(other_listing)
    db_session.flush()
    db_session.add(
        HostExperienceGuide(
            host_id=reviewer.id,
            experience_id=200_000 + other_listing.id,
            guide_id=link.guide_id,
            is_primary=False,
        )
    )
    db_session.commit()

    login = client.post(
        "/api/v1/auth/login",
        json={"email": user.email, "password": PASSWORD},
    )
    token = login.json()["access_token"]
    response = client.get(
        "/api/v1/guide/listings",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200, response.text
    rows = response.json()
    assert {row["source"] for row in rows} == {"owned", "assigned"}
    assert len([row for row in rows if row["source"] == "assigned"]) == 2

    assigned = next(row for row in rows if row["source"] == "assigned")
    assert assigned["title"] == "Assigned Heritage Walk"
    assert assigned["can_edit"] is False
    assert assigned["public_slug"] == "host-assigned-heritage-walk"
    assert assigned["is_primary"] is True

    assigned_listing = next(
        row for row in rows if row["title"] == "Assigned Listing Walk"
    )
    assert assigned_listing["source"] == "assigned"
    assert assigned_listing["can_edit"] is False
    assert assigned_listing["public_slug"] == f"guide-{other_listing.id}"
    assert assigned_listing["max_guests"] == 4

    dashboard = client.get(
        "/api/v1/guide/dashboard",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert dashboard.status_code == 200
    stats = dashboard.json()["stats"]
    assert stats["listings"] == 3
    assert stats["owned_listings"] == 1
    assert stats["assigned_listings"] == 2
