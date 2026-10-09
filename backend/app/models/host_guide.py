"""Host-managed guides and experience assignments.

A Host can create a full guide account (login-capable ``users`` row with
``role='guide'``) together with its public ``guides`` catalog profile and a
``guide_applications`` verification record — mirroring the exact data the
frontend ``BecomeGuidePage`` collects.  Ownership is tracked in
``host_guides`` so each Host only sees and manages their own guides, and
``host_experience_guides`` links one guide profile to one host experience
so travelers see the assigned guide on the frontend.
"""

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text, JSON
from sqlalchemy.sql import func

from app.core.database import Base


class HostGuide(Base):
    """Ownership link between a Host, the guide login account, and catalog profile."""

    __tablename__ = "host_guides"

    id = Column(Integer, primary_key=True, index=True)
    host_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    guide_user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    guide_id = Column(Integer, ForeignKey("guides.id"), nullable=True, index=True)
    # Snapshot of the registration fields (mirrors BecomeGuidePage + GuideApplication)
    full_name = Column(String, nullable=False)
    email = Column(String, nullable=False, index=True)
    phone = Column(String, nullable=True)
    nin_number = Column(String, nullable=True)
    city = Column(String, nullable=True)
    region = Column(String, nullable=True)
    documents = Column(JSON, nullable=False, default=list)
    status = Column(String, nullable=False, default="active")  # active | suspended
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class HostExperienceGuide(Base):
    """Assigns one guide catalog profile to one host experience."""

    __tablename__ = "host_experience_guides"

    id = Column(Integer, primary_key=True, index=True)
    host_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    experience_id = Column(Integer, ForeignKey("host_experiences.id"), nullable=False, index=True)
    guide_id = Column(Integer, ForeignKey("guides.id"), nullable=False, index=True)
    is_primary = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
