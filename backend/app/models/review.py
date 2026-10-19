from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Review(Base):
    """A traveller's review of an experience they have actually taken.

    A review is tied to one experience and one traveller.  A traveller may only
    leave a review for an experience they have a completed booking for, and they
    may leave at most one review per experience (enforced both by the unique
    constraint below and in the API layer).
    """

    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    experience_id = Column(Integer, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    rating = Column(Integer, nullable=False)  # 1..5
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    __table_args__ = (
        UniqueConstraint("user_id", "experience_id", name="uq_review_user_experience"),
    )

    user = relationship("User", foreign_keys=[user_id], backref="reviews")