from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.core.database import Base


class HostApplication(Base):
    __tablename__ = "host_applications"

    id = Column(Integer, primary_key=True, index=True)
    host_name = Column(String, nullable=True)
    email = Column(String, index=True, nullable=True)
    city = Column(String, nullable=True)
    region = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    experience = Column(String, nullable=True)
    # pending / approved / rejected
    status = Column(String, default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())