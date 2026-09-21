"""Tests for the canonical role hierarchy and the ``has_access`` role guards."""
import pytest

from app.core import roles
from app.core.roles import (
    ADMIN,
    CONTENT_MANAGER,
    CUSTOMER_SUPPORT,
    DASHBOARD_ROLES,
    HOST,
    REGIONAL_HEAD,
    has_access,
    normalize_role,
    role_rank,
)

# Dashboard hierarchy, highest privilege first.
HIERARCHY = [ADMIN, CONTENT_MANAGER, REGIONAL_HEAD, CUSTOMER_SUPPORT, HOST]

# Roles that used to exist but are no longer part of the dashboard.
REMOVED_ROLES = ["super-admin", "superadmin", "super_admin", "guide"]


class TestRoleHierarchy:
    """The five dashboard roles and their exact order."""

    def test_role_order_is_lowest_to_highest(self):
        assert roles.ROLE_ORDER == [
            HOST,
            CUSTOMER_SUPPORT,
            REGIONAL_HEAD,
            CONTENT_MANAGER,
            ADMIN,
        ]

    def test_dashboard_roles_are_the_five_console_roles(self):
        assert DASHBOARD_ROLES == frozenset(HIERARCHY)

    def test_rank_increases_with_privilege(self):
        ranks = [role_rank(role) for role in reversed(HIERARCHY)]
        assert ranks == sorted(ranks)
        assert role_rank(ADMIN) > role_rank(HOST)

    def test_unknown_roles_have_no_rank(self):
        assert role_rank("super-admin") == -1
        assert role_rank("guide") == -1
        assert role_rank("traveler") == -1


class TestRemovedRoles:
    """Super Admin and Guide no longer pass any dashboard guard."""

    @pytest.mark.parametrize("removed", REMOVED_ROLES)
    def test_removed_roles_are_not_dashboard_roles(self, removed: str):
        assert removed not in DASHBOARD_ROLES

    @pytest.mark.parametrize("removed", REMOVED_ROLES)
    def test_removed_roles_are_denied_every_guard(self, removed: str):
        assert has_access(removed, *HIERARCHY) is False

    @pytest.mark.parametrize("removed", REMOVED_ROLES)
    def test_removed_roles_are_not_normalized_to_a_dashboard_role(self, removed: str):
        assert normalize_role(removed) == removed
        assert normalize_role(removed) not in DASHBOARD_ROLES


class TestHasAccess:
    """Admin is authorized everywhere; each other role only where listed."""

    def test_admin_passes_every_guard(self):
        for role in HIERARCHY:
            assert has_access(ADMIN, role) is True

    def test_admin_guard_is_not_inherited_by_lower_roles(self):
        for role in [CONTENT_MANAGER, REGIONAL_HEAD, CUSTOMER_SUPPORT, HOST]:
            assert has_access(role, ADMIN) is False

    def test_guard_groups_include_admin(self):
        groups = [
            roles.ADMIN_LEVEL,
            roles.REGIONAL_OR_ABOVE,
            roles.SUPPORT_OR_ABOVE,
            roles.CMS_OR_ABOVE,
            roles.STAFF_OR_ABOVE,
        ]
        for group in groups:
            assert ADMIN in group
            assert group <= DASHBOARD_ROLES

    def test_operations_guards(self):
        # Host applications: admin + regional-head
        assert has_access(ADMIN, ADMIN, REGIONAL_HEAD) is True
        assert has_access(REGIONAL_HEAD, ADMIN, REGIONAL_HEAD) is True
        assert has_access(CONTENT_MANAGER, ADMIN, REGIONAL_HEAD) is False
        assert has_access(HOST, ADMIN, REGIONAL_HEAD) is False
        # Support tickets: admin + customer-support
        assert has_access(ADMIN, ADMIN, CUSTOMER_SUPPORT) is True
        assert has_access(CUSTOMER_SUPPORT, ADMIN, CUSTOMER_SUPPORT) is True
        assert has_access(REGIONAL_HEAD, ADMIN, CUSTOMER_SUPPORT) is False

    def test_cms_guard_allows_admin_and_content_manager_only(self):
        assert has_access(ADMIN, ADMIN, CONTENT_MANAGER) is True
        assert has_access(CONTENT_MANAGER, ADMIN, CONTENT_MANAGER) is True
        assert has_access(REGIONAL_HEAD, ADMIN, CONTENT_MANAGER) is False
        assert has_access(HOST, ADMIN, CONTENT_MANAGER) is False

    def test_legacy_content_writer_keeps_content_manager_permissions(self):
        assert normalize_role("content-writer") == CONTENT_MANAGER
        assert has_access("content-writer", ADMIN, CONTENT_MANAGER) is True
        assert has_access("writer", ADMIN, CONTENT_MANAGER) is True
        assert has_access("content-writer", ADMIN) is False
