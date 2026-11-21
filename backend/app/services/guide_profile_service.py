"""Certificate/document storage for the signed-in guide's public profile."""
from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.models.guide_profile_document import GuideProfileDocument

GUIDE_PROFILE_UPLOAD_ROOT = Path(__file__).resolve().parents[2] / "uploads" / "guide-profiles"
ALLOWED_PROFILE_FILE_TYPES = {"image/jpeg", "image/png", "image/webp", "application/pdf"}
MAX_PROFILE_FILE_BYTES = 10 * 1024 * 1024


def _ensure_upload_root() -> Path:
    GUIDE_PROFILE_UPLOAD_ROOT.mkdir(parents=True, exist_ok=True)
    return GUIDE_PROFILE_UPLOAD_ROOT


def save_profile_file(upload: UploadFile, prefix: str = "pf") -> tuple[str, str]:
    content_type = (upload.content_type or "").lower()
    if content_type not in ALLOWED_PROFILE_FILE_TYPES:
        raise HTTPException(
            status_code=422,
            detail=f"Unsupported file type {content_type or 'unknown'}. Use JPG, PNG, WebP, or PDF.",
        )
    content = upload.file.read(MAX_PROFILE_FILE_BYTES + 1)
    if not content:
        raise HTTPException(status_code=422, detail="Uploaded file is empty.")
    if len(content) > MAX_PROFILE_FILE_BYTES:
        raise HTTPException(
            status_code=422,
            detail="File must be no larger than 10 MB.",
        )
    ext = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
        "application/pdf": ".pdf",
    }.get(content_type, ".bin")
    stored_name = f"{prefix}-{uuid4().hex}{ext}"
    dest = _ensure_upload_root() / stored_name
    dest.write_bytes(content)
    return stored_name, content_type


def add_profile_document(
    db: Session,
    guide_id: int,
    label: str,
    doc_type: str,
    stored_name: str,
    content_type: str,
) -> GuideProfileDocument:
    row = GuideProfileDocument(
        guide_id=guide_id,
        label=label.strip() or "Document",
        doc_type=doc_type,
        stored_name=stored_name,
        content_type=content_type,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def delete_profile_document(db: Session, guide_id: int, document_id: int) -> None:
    row = (
        db.query(GuideProfileDocument)
        .filter(GuideProfileDocument.id == document_id, GuideProfileDocument.guide_id == guide_id)
        .first()
    )
    if row is None:
        raise HTTPException(status_code=404, detail="Document not found")
    db.delete(row)
    db.commit()

