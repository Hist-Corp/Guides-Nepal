from sqlalchemy.orm import Session
from typing import List
from app.models.bookmark import Bookmark
from app.schemas.profile import BookmarkCreate


class BookmarkService:
    def __init__(self, db: Session):
        self.db = db

    def list(self, user_id: int) -> List[Bookmark]:
        return (
            self.db.query(Bookmark)
            .filter(Bookmark.user_id == user_id)
            .order_by(Bookmark.id.desc())
            .all()
        )

    def create(self, user_id: int, data: BookmarkCreate) -> Bookmark:
        bm = Bookmark(user_id=user_id, **data.model_dump())
        self.db.add(bm)
        self.db.commit()
        self.db.refresh(bm)
        return bm

    def delete(self, user_id: int, bookmark_id: int) -> bool:
        bm = (
            self.db.query(Bookmark)
            .filter(Bookmark.id == bookmark_id, Bookmark.user_id == user_id)
            .first()
        )
        if not bm:
            return False
        self.db.delete(bm)
        self.db.commit()
        return True
