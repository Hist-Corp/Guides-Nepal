"""Central SQLAlchemy model registry for Guides Nepal.

Importing this module ensures every model class is loaded so that
``Base.metadata`` contains the full table catalog used by the app
(startup schema creation, migrations, etc.).
"""
from app.models.user import User as User
from app.models.booking import Booking as Booking
from app.models.bookmark import Bookmark as Bookmark
from app.models.guide import Guide as Guide
from app.models.guide_listing import GuideListing as GuideListing
from app.models.guide_listing import GuideProfile as GuideProfile
from app.models.guide_listing import GuideStatusUpdate as GuideStatusUpdate
from app.models.guide_application import GuideApplication as GuideApplication
from app.models.host_application import HostApplication as HostApplication
from app.models.support_ticket import SupportTicket as SupportTicket
from app.models.experience_workflow import ExperienceProposal as ExperienceProposal
from app.models.experience_workflow import ExperienceChangeRequest as ExperienceChangeRequest

__all__ = [
    "User",
    "Booking",
    "Bookmark",
    "Guide",
    "GuideListing",
    "GuideProfile",
    "GuideStatusUpdate",
    "GuideApplication",
    "HostApplication",
    "SupportTicket",
    "ExperienceProposal",
    "ExperienceChangeRequest",
]