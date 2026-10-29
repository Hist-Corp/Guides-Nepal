from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Request
from sqlalchemy.orm import Session
import os
from typing import List, Dict, Any
from app.core.database import get_db
from app.models.user import User
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
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return {"status": "ok"}


@router.post("/photos/upload")
async def upload_photo(
    file: UploadFile = File(...),
    user_id: int = Depends(get_current_user_id),
) -> Dict[str, str]:
    uploads_dir = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "../../../uploads")
    )
    user_dir = os.path.join(uploads_dir, os.path.basename(str(int(user_id))))
    os.makedirs(user_dir, exist_ok=True)
    filename = file.filename or "photo.jpg"
    safe_name = "".join(c for c in filename if c.isalnum() or c in ("-", "_", "."))
    path = os.path.join(user_dir, os.path.basename(safe_name))
    with open(path, "wb") as f:
        f.write(await file.read())
    url = f"/uploads/{user_id}/{safe_name}"
    return {"url": url}


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
