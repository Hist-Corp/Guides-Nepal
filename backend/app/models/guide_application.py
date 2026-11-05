from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text
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
    # SHA-256 hex of a server-issued setup token. Set when a credential invite
    # is issued for a pending application, cleared once the password is set,
    # so the invite link is single-use.
    credential_token_hash = Column(String, nullable=True)
    # bcrypt hash of the guide's chosen password, captured at application time.
    # The login account is only *created* (role=guide, is_active=True) when a
    # regional-head/admin approves — never before.
    credential_password_hash = Column(String, nullable=True)
    # Extra application detail captured by the multi-step form (JSON string).
    details_json = Column(Text, nullable=True)
    # id of the users row minted on approval (None until approved).
    user_id = Column(Integer, nullable=True)
    # who approved + optional note, for the audit trail.
    reviewed_by = Column(String, nullable=True)
    review_note = Column(String, nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
