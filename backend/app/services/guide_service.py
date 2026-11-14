from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.guide import Guide
from app.schemas.public import GuideCreate, GuideUpdate


class GuideService:
    def __init__(self, db: Session):
        self.db = db

    def create_guide(self, guide_data: GuideCreate) -> Guide:
        guide = Guide(**guide_data.model_dump())
        self.db.add(guide)
        self.db.commit()
        self.db.refresh(guide)
        return guide

    def get_guide(self, guide_id: int) -> Optional[Guide]:
        return (
            self.db.query(Guide).filter(Guide.id == guide_id, Guide.is_active).first()
        )

    def get_all_guides(self, city: Optional[str] = None) -> List[Guide]:
        query = self.db.query(Guide).filter(Guide.is_active)
        if city:
            query = query.filter(Guide.cities.contains([city]))
        return query.all()

    def update_guide(self, guide_id: int, guide_data: GuideUpdate) -> Optional[Guide]:
        guide = self.get_guide(guide_id)
        if not guide:
            return None

        for key, value in guide_data.model_dump(exclude_unset=True).items():
            setattr(guide, key, value)

        self.db.commit()
        self.db.refresh(guide)
        return guide

    def delete_guide(self, guide_id: int) -> bool:
        guide = self.get_guide(guide_id)
        if not guide:
            return False

        setattr(guide, "is_active", False)
        self.db.commit()
        return True
