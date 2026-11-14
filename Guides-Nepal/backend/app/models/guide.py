from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, JSON
from sqlalchemy.sql import func
from app.core.database import Base


class Guide(Base):
    __tablename__ = "guides"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    image = Column(String, nullable=False)
    role = Column(String, nullable=False)
    rating = Column(Float, nullable=False, default=0.0)
    reviews = Column(Integer, nullable=False, default=0)
    bio = Column(Text, nullable=False)
    languages = Column(JSON, nullable=False, default=list)
    verified = Column(Boolean, default=False)
    lives_in = Column(String, nullable=True)
    cities = Column(JSON, nullable=False, default=list)
    gallery = Column(JSON, nullable=False, default=list)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
