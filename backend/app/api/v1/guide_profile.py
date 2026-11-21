"""Profile settings for the signed-in guide: certificate/document uploads
that later render on the public guide profile page.

A guide uploads certificates/images from their profile settings page; the
public guide profile page shows them under a "Certificates & documents"
section.  Uploaded files are stored under ``uploads/guide-profiles/`` and are
served by the existing ``/uploads`` static mount.

Documents are keyed on the catalog ``guides.id`` (the row the public profile
page is addressed by), so the profile page can surface them.  The signed-in
account is mapped to that catalog row through ``host_guides``.
"""
from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_role
from app.core.roles import GUIDE
from app.models.guide import Guide
from app.models.guide_profile_document import GuideProfileDocument
from app.models.host_guide import HostGuide
from app.models.user import User
from app.schemas.guide_profile import (
    GuideProfileDocDeleteResponse,
    GuideProfileDocsResponse,
)
from app.services.guide_profile_service import (
    GUIDE_PROFILE_UPLOAD_ROOT,
    add_profile_document,
    delete_profile_document,
    save_profile_file,
)

router = APIRouter(prefix="/guide/profile", tags=["guide-profile"])
GUIDE_ONLY = require_role(GUIDE)


def _catalog_guide_for_user(db: Session, user: User) -> Optional[Guide]:
    """Return the public ``guides`` row linked to this login account.

    ``host_guides`` is the only link used: it is created when a Host sets up
    the guide account and its catalog profile, so ownership stays explicit
    rather than guessed from names.
    """
    row = (
        db.query(HostGuide.guide_id)
        .filter(HostGuide.guide_user_id == user.id, HostGuide.guide_id.isnot(None))
        .order_by(HostGuide.id.asc())
        .first()
    )
    if row is None:
        return None
    return db.get(Guide, int(row[0]))


def _documents(db: Session, guide_id: int) -> list[dict]:
    rows = (
        db.query(GuideProfileDocument)
        .filter(GuideProfileDocument.guide_id == guide_id)
        .order_by(GuideProfileDocument.uploaded_at.desc(), GuideProfileDocument.id.desc())
        .all()
    )
    return [
        {
            "id": row.id,
            "label": row.label,
            "doc_type": row.doc_type,
            "stored_name": row.stored_name,
            "content_type": row.content_type,
            "uploaded_at": row.uploaded_at.isoformat() if row.uploaded_at else None,
        }
        for row in rows
    ]


@router.get("/", response_model=GuideProfileDocsResponse)
def get_my_profile(
    user: User = Depends(GUIDE_ONLY), db: Session = Depends(get_db)
) -> dict:
    """The signed-in guide's uploaded profile documents.

    A guide whose account is not linked to a public catalog profile yet simply
    has no documents; that is an empty list, not an error.
    """
    guide = _catalog_guide_for_user(db, user)
    if guide is None:
        return {"profile_documents": []}
    return {"profile_documents": _documents(db, guide.id)}


@router.put("/")
def upload_certificate(
    user: User = Depends(GUIDE_ONLY),
    db: Session = Depends(get_db),
    certificate: Optional[UploadFile] = File(
        None, description="Certificate / document image (JPG, PNG, WebP, PDF)"
    ),
    certificate_label: Optional[str] = None,
) -> dict:
    """Upload a certificate/document for the guide's public profile.

    The file is stored as a profile document and appended to the catalog
    guide's gallery so it also shows among the profile photos.
    """
    guide = _catalog_guide_for_user(db, user)
    if guide is None:
        raise HTTPException(
            status_code=409,
            detail=(
                "No public guide profile is linked to this account yet. "
                "Ask your host to finish setting up your guide profile."
            ),
        )

    if certificate is None:
        raise HTTPException(status_code=422, detail="Send a certificate file.")

    label = (certificate_label or certificate.filename or "Certificate").strip() or "Certificate"
    stored_name, content_type = save_profile_file(certificate, prefix="cert")
    add_profile_document(
        db,
        guide.id,
        label=label,
        doc_type="certificate",
        stored_name=stored_name,
        content_type=content_type,
    )

    entry = f"/uploads/guide-profiles/{stored_name}"
    gallery = list(guide.gallery or [])
    if entry not in gallery:
        gallery.append(entry)
        guide.gallery = gallery
        db.commit()

    return {"profile_documents": _documents(db, guide.id)}


@router.delete(
    "/documents/{document_id}",
    response_model=GuideProfileDocDeleteResponse,
)
def delete_my_document(
    document_id: int,
    user: User = Depends(GUIDE_ONLY),
    db: Session = Depends(get_db),
) -> dict:
    """Remove one of the signed-in guide's uploaded documents."""
    guide = _catalog_guide_for_user(db, user)
    if guide is None:
        raise HTTPException(status_code=404, detail="Document not found")

    row = (
        db.query(GuideProfileDocument)
        .filter(
            GuideProfileDocument.id == document_id,
            GuideProfileDocument.guide_id == guide.id,
        )
        .first()
    )
    if row is None:
        raise HTTPException(status_code=404, detail="Document not found")

    stored_name = row.stored_name
    delete_profile_document(db, guide.id, document_id)

    entry = f"/uploads/guide-profiles/{stored_name}"
    if entry in (guide.gallery or []):
        guide.gallery = [item for item in guide.gallery if item != entry]
        db.commit()

    try:
        (GUIDE_PROFILE_UPLOAD_ROOT / stored_name).unlink(missing_ok=True)
    except OSError:
        pass

    return {"status": "ok"}
