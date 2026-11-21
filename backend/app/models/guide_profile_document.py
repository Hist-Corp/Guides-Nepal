from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.core.database import Base


class GuideProfileDocument(Base):
    """Documents a signed-in guide uploaded for their public profile
    (certificates, ID photos, etc.). Separate from the catalog ``gallery``
    so a guide can revoke a certificate without disturbing the cover-image
    gallery that travels with the public guide card.
    """

    __tablename__ = "guide_profile_documents"

    id = Column(Integer, primary_key=True, index=True)
    guide_id = Column(
        Integer, ForeignKey("guides.id", ondelete="CASCADE"), nullable=False, index=True
    )
    label = Column(String, nullable=False, default="Document")
    doc_type = Column(String, nullable=False, default="certificate")  # certificate | id_photo | other
    stored_name = Column(String, nullable=False)
    content_type = Column(String, nullable=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
