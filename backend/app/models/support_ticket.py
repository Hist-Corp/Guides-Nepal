from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.core.database import Base


class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id = Column(Integer, primary_key=True, index=True)
    subject = Column(String, nullable=True)
    description = Column(String, nullable=True)
    customer_name = Column(String, nullable=True)
    customer_email = Column(String, index=True, nullable=True)
    # open / in_progress / resolved / closed
    status = Column(String, default="open")
    # low / medium / high / urgent
    priority = Column(String, default="medium")
    assigned_to = Column(String, nullable=True)
    # free-text resolution note entered by support staff
    resolution = Column(String, nullable=True)
    # timestamp set when a resolution note is provided
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())