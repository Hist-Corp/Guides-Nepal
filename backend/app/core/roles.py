"""Canonical role definitions and hierarchy for Guides Nepal.

Role hierarchy (highest privilege -> lowest privilege):

    super-admin
    admin
    content-writer
    regional-head
    customer-support
    host
    guide
    traveler

A super-admin implicitly has access to every role's permissions, so the
backend role guards treat it as universally authorized.  All role-guard
logic should go through :func:`has_access` so this invariant holds in one
place.
"""

SUPER_ADMIN = "super-admin"
ADMIN = "admin"
CONTENT_WRITER = "content-writer"
REGIONAL_HEAD = "regional-head"
CUSTOMER_SUPPORT = "customer-support"
HOST = "host"
GUIDE = "guide"
TRAVELER = "traveler"

# Roles that can sign into the dashboard.
DASHBOARD_ROLES = frozenset(
    {SUPER_ADMIN, ADMIN, CONTENT_WRITER, REGIONAL_HEAD, CUSTOMER_SUPPORT, HOST, GUIDE}
)

# Convenience groups used by the API guards.
ADMIN_LEVEL = frozenset({SUPER_ADMIN, ADMIN})
REGIONAL_OR_ABOVE = frozenset({SUPER_ADMIN, ADMIN, REGIONAL_HEAD})
SUPPORT_OR_ABOVE = frozenset({SUPER_ADMIN, ADMIN, CUSTOMER_SUPPORT})
CMS_OR_ABOVE = frozenset({SUPER_ADMIN, ADMIN, CONTENT_WRITER})
STAFF_OR_ABOVE = frozenset(
    {SUPER_ADMIN, ADMIN, CONTENT_WRITER, REGIONAL_HEAD, CUSTOMER_SUPPORT}
)

# Ascending order, lowest privilege first.  Matches the dashboard hierarchy.
ROLE_ORDER = [
    TRAVELER,
    GUIDE,
    HOST,
    CUSTOMER_SUPPORT,
    REGIONAL_HEAD,
    CONTENT_WRITER,
    ADMIN,
    SUPER_ADMIN,
]


def role_rank(role: str) -> int:
    """Position of a role in the hierarchy (higher == more privileges)."""
    return ROLE_ORDER.index(role) if role in ROLE_ORDER else -1


def has_access(user_role: str, *allowed_roles: str) -> bool:
    """True if ``user_role`` is authorized for a guard allowing ``allowed_roles``.

    Super admins are always authorized for every guard, which is what gives the
    Super Admin role full access to all other roles' functionality.
    """
    if user_role == SUPER_ADMIN:
        return True
    return user_role in allowed_roles