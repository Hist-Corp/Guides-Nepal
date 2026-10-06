from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.core.database import Base


class GuideApplication(Base):
    """Public application from someone signing up as a Guide.

    Kept as a table apart from ``host_applications`` so the two provider
    funnels stay queryable (and reviewable) independently.  Hosts list and
    manage experiences; guides lead tours — they share no columns beyond
    contact info, which is why this is not a single table with a type flag.
    """

    __tablename__ = "guide_applications"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=True)
    email = Column(String, index=True, nullable=True)
    phone = Column(String, nullable=True)
    city = Column(String, nullable=True)
    region = Column(String, nullable=True)
    nin_number = Column(String, nullable=True)
    documents = Column(String, nullable=True)  # file names / summary
    # pending / approved / rejected
    status = Column(String, default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
