"""Central SQLAlchemy model registry for Guides Nepal.

Importing this module ensures every model class is loaded so that
``Base.metadata`` contains the full table catalog used by the app
(startup schema creation, migrations, etc.).
"""
from app.models.user import User as User
from app.models.booking import Booking as Booking
from app.models.bookmark import Bookmark as Bookmark
from app.models.guide import Guide as Guide
from app.models.host_application import HostApplication as HostApplication
from app.models.support_ticket import SupportTicket as SupportTicket

__all__ = [
    "User",
    "Booking",
    "Bookmark",
    "Guide",
    "HostApplication",
    "SupportTicket",
]