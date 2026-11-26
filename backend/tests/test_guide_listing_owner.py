"""A guide-owned listing puts its own guide in "Who you'll meet"."""

from app.core.roles import GUIDE, HOST
from app.models.guide import Guide
from app.models.guide_listing import GuideListing
from app.models.host_guide import HostGuide
from app.models.user import User


def _make_user(db, email: str, role: str) -> User:
    user = User(
        email=email,
        firstName=role.title(),
        lastName="Test",
        hashed_password="not-a-real-hash",
        role=role,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def test_guide_listing_exposes_its_owner(client, db_session):
    host = _make_user(db_session, "host-owner-listing@example.com", HOST)
    owner = _make_user(db_session, "owner-listing@example.com", GUIDE)
    catalog = Guide(
        name="Owner Guide",
        image="https://example.com/owner.jpg",
        role="Experience Guide",
        rating=4.9,
        reviews=3,
        bio="",
        languages=["English"],
        cities=["Kathmandu"],
        gallery=[],
        is_active=True,
    )
    db_session.add(catalog)
    db_session.commit()
    db_session.refresh(catalog)
    db_session.add(
        HostGuide(
            host_id=host.id,
            guide_user_id=owner.id,
            guide_id=catalog.id,
            full_name="Owner Guide",
            email=owner.email,
            documents=[],
            status="active",
        )
    )
    listing = GuideListing(
        guide_user_id=owner.id,
        title="Owned Walk",
        category="tour",
        city="Kathmandu",
        description="A walk led by the guide who listed it.",
        duration="2 hours",
        price=50.0,
        max_guests=8,
        is_active=True,
    )
    db_session.add(listing)
    db_session.commit()
    db_session.refresh(listing)

    single = client.get(f"/api/v1/experiences/guide-{listing.id}")
    assert single.status_code == 200, single.text
    guides = single.json()["guides"]
    assert [guide["id"] for guide in guides] == [catalog.id]
    assert guides[0]["userId"] == owner.id

    listed = client.get("/api/v1/experiences")
    assert listed.status_code == 200, listed.text
    row = next(e for e in listed.json() if e["id"] == 200000 + listing.id)
    assert [guide["id"] for guide in row["guides"]] == [catalog.id]


def test_unlinked_owner_still_leads_her_listing(client, db_session):
    owner = _make_user(db_session, "unlinked-owner@example.com", GUIDE)
    listing = GuideListing(
        guide_user_id=owner.id,
        title="Unlinked Walk",
        category="tour",
        city="Lumbini",
        description="A walk listed by a guide with no catalog profile.",
        duration="2 hours",
        price=40.0,
        max_guests=6,
        is_active=True,
    )
    db_session.add(listing)
    db_session.commit()
    db_session.refresh(listing)

    response = client.get(f"/api/v1/experiences/guide-{listing.id}")
    assert response.status_code == 200, response.text
    guides = response.json()["guides"]
    # The account id is what the booking path resolves back to this guide.
    assert [guide["id"] for guide in guides] == [owner.id]
    assert guides[0]["userId"] == owner.id


def test_owner_is_hidden_when_her_account_id_belongs_to_another_guide(
    client, db_session
):
    owner = _make_user(db_session, "claimed-id-owner@example.com", GUIDE)
    other = _make_user(db_session, "claims-that-id@example.com", GUIDE)
    # A catalog profile id equal to the owner's account id is linked to a
    # different account, so that id would resolve to the wrong guide.
    db_session.add(
        HostGuide(
            host_id=owner.id,
            guide_user_id=other.id,
            guide_id=owner.id,
            full_name="Other Guide",
            email=other.email,
            documents=[],
            status="active",
        )
    )
    listing = GuideListing(
        guide_user_id=owner.id,
        title="Ambiguous Id Walk",
        category="tour",
        city="Kathmandu",
        description="A walk whose owner has no safe id.",
        duration="2 hours",
        price=45.0,
        max_guests=4,
        is_active=True,
    )
    db_session.add(listing)
    db_session.commit()
    db_session.refresh(listing)

    response = client.get(f"/api/v1/experiences/guide-{listing.id}")
    assert response.status_code == 200, response.text
    assert response.json().get("guides", []) == []


def test_owner_keeps_her_card_when_the_link_points_back_to_her(client, db_session):
    owner = _make_user(db_session, "self-linked-owner@example.com", GUIDE)
    db_session.add(
        HostGuide(
            host_id=owner.id,
            guide_user_id=owner.id,
            guide_id=owner.id,
            full_name="Self Linked",
            email=owner.email,
            documents=[],
            status="active",
        )
    )
    listing = GuideListing(
        guide_user_id=owner.id,
        title="Self Linked Walk",
        category="tour",
        city="Kathmandu",
        description="A walk whose owner id only resolves to her.",
        duration="2 hours",
        price=45.0,
        max_guests=4,
        is_active=True,
    )
    db_session.add(listing)
    db_session.commit()
    db_session.refresh(listing)

    response = client.get(f"/api/v1/experiences/guide-{listing.id}")
    assert response.status_code == 200, response.text
    assert [guide["id"] for guide in response.json()["guides"]] == [owner.id]
