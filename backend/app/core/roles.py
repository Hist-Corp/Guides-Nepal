"""Canonical role definitions and hierarchy for Guides Nepal.

Role hierarchy (highest privilege -> lowest privilege):

    admin
    content-manager
    regional-head
    customer-support
    host
    guide

Only these six roles can sign into the dashboard.  Travelers use the public
website and are not part of the dashboard hierarchy.

The top role (admin) is implicitly authorized for every guard, which is what
gives Admin full access to all other roles' functionality.  All role-guard
logic should go through :func:`has_access` so this invariant holds in one place.

Role *assignment* is deliberately separate from role *authorization*:

- :data:`SELF_REGISTERABLE_ROLES` is the only set a public signup may request.
- :data:`ADMIN_ASSIGNABLE_ROLES` is what an admin (or a seed script) may grant.

Keeping both as explicit allow-lists is what stops a client from simply posting
``{"role": "admin"}`` to ``/auth/register`` to mint itself an admin account.
"""

ADMIN = "admin"
CONTENT_MANAGER = "content-manager"
REGIONAL_HEAD = "regional-head"
CUSTOMER_SUPPORT = "customer-support"
HOST = "host"
GUIDE = "guide"

# Non-dashboard role: books on the public site, never signs into the dashboard.
TRAVELER = "traveler"

# Roles that can sign into the dashboard.
DASHBOARD_ROLES = frozenset(
    {ADMIN, CONTENT_MANAGER, REGIONAL_HEAD, CUSTOMER_SUPPORT, HOST, GUIDE}
)

# Every role name the backend recognises.  Anything outside this set is unknown
# and must never be stored on a user record.
ALL_ROLES = frozenset(DASHBOARD_ROLES | {TRAVELER})

# The only roles a public signup may request for itself.  Everything else --
# including ``guide`` -- has to be granted by an admin or a seed script, so a
# client cannot escalate itself by putting a staff role in the request body.
SELF_REGISTERABLE_ROLES = frozenset({TRAVELER, HOST})

# Roles an admin may assign to another account (any known role, including
# demoting a staff account back to traveler).
ADMIN_ASSIGNABLE_ROLES = ALL_ROLES

# Roles a guide account is allowed to reach.  Used by the guide console so the
# UI can show a guide exactly what it is and is not permitted to do.
GUIDE_CAPABILITIES = frozenset(
    {
        "own_profile:read",
        "own_profile:write",
        "guide_console:read",
    }
)

# Convenience groups used by the API guards.
ADMIN_LEVEL = frozenset({ADMIN})
REGIONAL_OR_ABOVE = frozenset({ADMIN, REGIONAL_HEAD})
SUPPORT_OR_ABOVE = frozenset({ADMIN, CUSTOMER_SUPPORT})
CMS_OR_ABOVE = frozenset({ADMIN, CONTENT_MANAGER})
STAFF_OR_ABOVE = frozenset(
    {ADMIN, CONTENT_MANAGER, REGIONAL_HEAD, CUSTOMER_SUPPORT}
)
PROVIDER_LEVEL = frozenset({ADMIN, HOST, GUIDE})

# Ascending order, lowest privilege first.  Matches the dashboard hierarchy.
ROLE_ORDER = [
    GUIDE,
    HOST,
    CUSTOMER_SUPPORT,
    REGIONAL_HEAD,
    CONTENT_MANAGER,
    ADMIN,
]

# Legacy role names kept working through :func:`normalize_role` so user records
# stored before the "Content Writer -> Content Manager" rename keep exactly the
# same permissions.  The removed role (super-admin) is intentionally absent, so
# those accounts no longer pass any dashboard guard.
LEGACY_ROLE_ALIASES = {
    "content-writer": CONTENT_MANAGER,
    "content_writer": CONTENT_MANAGER,
    "content writer": CONTENT_MANAGER,
    "writer": CONTENT_MANAGER,
}


def normalize_role(role: str) -> str:
    """Resolve a stored role value to its canonical name."""
    return LEGACY_ROLE_ALIASES.get(role, role)


def is_known_role(role: str) -> bool:
    """True if ``role`` is a role this application recognises."""
    return normalize_role(role) in ALL_ROLES


def is_dashboard_role(role: str) -> bool:
    """True if ``role`` may sign into the dashboard."""
    return normalize_role(role) in DASHBOARD_ROLES


def can_self_register(role: str) -> bool:
    """True if a public signup is allowed to request ``role`` for itself.

    This is the server-side half of the RBAC model: it must be enforced on the
    registration path, not trusted from the request body.
    """
    return normalize_role(role) in SELF_REGISTERABLE_ROLES


def is_assignable_role(role: str) -> bool:
    """True if an admin may set ``role`` on a user record."""
    return normalize_role(role) in ADMIN_ASSIGNABLE_ROLES


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