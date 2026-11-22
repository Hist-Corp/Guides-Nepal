from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Request
from sqlalchemy.orm import Session
import os
import uuid
from typing import List, Dict, Any
from app.core.database import get_db
from app.models.user import User
from app.models.guide import Guide
from app.models.host_guide import HostGuide
from app.models.bookmark import Bookmark
from app.schemas.profile import ProfileUpdate, BookmarkCreate, BookmarkResponse
from app.services.bookmark_service import BookmarkService
from app.core.security import get_user_id_from_token


def get_current_user_id(request: Request) -> int:
    auth = request.headers.get("Authorization")
    if not auth or not auth.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = auth.split(" ", 1)[1]
    uid = get_user_id_from_token(token)
    if uid is None:
        raise HTTPException(status_code=401, detail="Invalid token")
    return uid


router = APIRouter()


@router.get("/me")
def get_me(
    db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)
) -> Dict[str, Any]:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": user.id,
        "email": user.email,
        "firstName": user.firstName,
        "lastName": user.lastName,
        "phone": user.phone,
        "bio": user.bio,
        "avatarUrl": user.avatar_url,
    }


@router.patch("/me")
def update_me(
    payload: ProfileUpdate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
) -> Dict[str, str]:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    changes = payload.model_dump(exclude_unset=True)
    for key, value in changes.items():
        setattr(user, key, value)
    # The public guide profile reads its bio from the catalog guide, so a bio
    # saved here must reach that row too or the preview would not be truthful.
    if "bio" in changes:
        link = (
            db.query(HostGuide)
            .filter(HostGuide.guide_user_id == user.id, HostGuide.guide_id.isnot(None))
            .order_by(HostGuide.id.asc())
            .first()
        )
        if link is not None:
            guide = db.get(Guide, int(link.guide_id))
            if guide is not None:
                guide.bio = changes["bio"] or ""
    db.commit()
    db.refresh(user)
    return {"status": "ok"}


AVATAR_CONTENT_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
}
MAX_AVATAR_BYTES = 5 * 1024 * 1024


@router.post("/photos/upload")
async def upload_photo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
) -> Dict[str, str]:
    """Store a new profile photo and make it the account's avatar.

    The change is saved immediately (no separate "save profile" step) and, for
    a guide, the public catalog photo is updated too so the traveller-facing
    profile and guide cards show the new image.
    """
    extension = AVATAR_CONTENT_TYPES.get((file.content_type or "").lower())
    if extension is None:
        raise HTTPException(
            status_code=422, detail="Upload a JPG, PNG, WebP, or GIF image."
        )
    content = await file.read(MAX_AVATAR_BYTES + 1)
    if not content:
        raise HTTPException(status_code=422, detail="The selected file is empty.")
    if len(content) > MAX_AVATAR_BYTES:
        raise HTTPException(
            status_code=422, detail="Profile photos must be 5 MB or smaller."
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    uploads_dir = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "../../../uploads")
    )
    user_dir = os.path.join(uploads_dir, os.path.basename(str(int(user_id))))
    os.makedirs(user_dir, exist_ok=True)
    # Unique stored name: re-uploading the same file name must not overwrite a
    # photo that other pages or caches still point at.
    stored_name = f"{uuid.uuid4().hex}{extension}"
    with open(os.path.join(user_dir, stored_name), "wb") as f:
        f.write(content)
    url = f"/uploads/{user_id}/{stored_name}"

    user.avatar_url = url
    # Keep the guide's public catalog profile in step with the account avatar.
    for link in db.query(HostGuide).filter(HostGuide.guide_user_id == user_id).all():
        guide = db.get(Guide, link.guide_id) if link.guide_id else None
        if guide is not None:
            guide.image = url
    db.commit()

    return {"url": url, "avatarUrl": url}


@router.get("/bookmarks", response_model=List[BookmarkResponse])
def list_bookmarks(
    db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)
) -> List[Bookmark]:
    service = BookmarkService(db)
    return service.list(user_id)


@router.post("/bookmarks", response_model=BookmarkResponse)
def add_bookmark(
    data: BookmarkCreate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
) -> Bookmark:
    service = BookmarkService(db)
    return service.create(user_id, data)


@router.delete("/bookmarks/{bookmark_id}")
def delete_bookmark(
    bookmark_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
) -> Dict[str, str]:
    service = BookmarkService(db)
    ok = service.delete(user_id, bookmark_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    return {"status": "ok"}
