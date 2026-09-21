"""Canonical role definitions and hierarchy for Guides Nepal.

Role hierarchy (highest privilege -> lowest privilege):

    admin
    content-manager
    regional-head
    customer-support
    host

Only these five roles can sign into the dashboard.  Travelers use the public
website and are not part of the dashboard hierarchy.

The top role (admin) is implicitly authorized for every guard, which is what
gives Admin full access to all other roles' functionality.  All role-guard
logic should go through :func:`has_access` so this invariant holds in one place.
"""

ADMIN = "admin"
CONTENT_MANAGER = "content-manager"
REGIONAL_HEAD = "regional-head"
CUSTOMER_SUPPORT = "customer-support"
HOST = "host"

# Roles that can sign into the dashboard.
DASHBOARD_ROLES = frozenset(
    {ADMIN, CONTENT_MANAGER, REGIONAL_HEAD, CUSTOMER_SUPPORT, HOST}
)

# Convenience groups used by the API guards.
ADMIN_LEVEL = frozenset({ADMIN})
REGIONAL_OR_ABOVE = frozenset({ADMIN, REGIONAL_HEAD})
SUPPORT_OR_ABOVE = frozenset({ADMIN, CUSTOMER_SUPPORT})
CMS_OR_ABOVE = frozenset({ADMIN, CONTENT_MANAGER})
STAFF_OR_ABOVE = frozenset(
    {ADMIN, CONTENT_MANAGER, REGIONAL_HEAD, CUSTOMER_SUPPORT}
)

# Ascending order, lowest privilege first.  Matches the dashboard hierarchy.
ROLE_ORDER = [
    HOST,
    CUSTOMER_SUPPORT,
    REGIONAL_HEAD,
    CONTENT_MANAGER,
    ADMIN,
]

# Legacy role names kept working through :func:`normalize_role` so user records
# stored before the "Content Writer -> Content Manager" rename keep exactly the
# same permissions.  The removed roles (super-admin, guide) are intentionally
# absent, so those accounts no longer pass any dashboard guard.
LEGACY_ROLE_ALIASES = {
    "content-writer": CONTENT_MANAGER,
    "content_writer": CONTENT_MANAGER,
    "content writer": CONTENT_MANAGER,
    "writer": CONTENT_MANAGER,
}


def normalize_role(role: str) -> str:
    """Resolve a stored role value to its canonical name."""
    return LEGACY_ROLE_ALIASES.get(role, role)


def role_rank(role: str) -> int:
    """Position of a role in the hierarchy (higher == more privileges)."""
    role = normalize_role(role)
    return ROLE_ORDER.index(role) if role in ROLE_ORDER else -1


def has_access(user_role: str, *allowed_roles: str) -> bool:
    """True if ``user_role`` is authorized for a guard allowing ``allowed_roles``.

    ``admin`` is the highest role in the hierarchy, so it is implicitly
    authorized for every guard — this is what gives Admin full access to all
    other roles' functionality.  Every other role must be listed explicitly.
    """
    user_role = normalize_role(user_role)
    if user_role == ADMIN:
        return True
    return user_role in allowed_roles