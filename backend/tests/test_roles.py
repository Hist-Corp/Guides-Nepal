"""Tests for the canonical role hierarchy and the ``has_access`` role guards."""
import pytest

from app.core import roles
from app.core.roles import (
    ADMIN,
    CONTENT_MANAGER,
    CUSTOMER_SUPPORT,
    DASHBOARD_ROLES,
    GUIDE,
    GUIDE_CAPABILITIES,
    HOST,
    REGIONAL_HEAD,
    SELF_REGISTERABLE_ROLES,
    TRAVELER,
    can_self_register,
    has_access,
    is_assignable_role,
    is_dashboard_role,
    is_known_role,
    normalize_role,
    role_rank,
)

# Dashboard hierarchy, highest privilege first.
HIERARCHY = [
    ADMIN,
    CONTENT_MANAGER,
    REGIONAL_HEAD,
    CUSTOMER_SUPPORT,
    HOST,
    GUIDE,
]

# Roles that used to exist but are no longer part of the dashboard.
REMOVED_ROLES = ["super-admin", "superadmin", "super_admin"]


class TestRoleHierarchy:
    """The six dashboard roles and their exact order."""

    def test_role_order_is_lowest_to_highest(self):
        assert roles.ROLE_ORDER == [
            GUIDE,
            HOST,
            CUSTOMER_SUPPORT,
            REGIONAL_HEAD,
            CONTENT_MANAGER,
            ADMIN,
        ]

    def test_dashboard_roles_are_the_six_console_roles(self):
        assert DASHBOARD_ROLES == frozenset(HIERARCHY)

    def test_rank_increases_with_privilege(self):
        ranks = [role_rank(role) for role in reversed(HIERARCHY)]
        assert ranks == sorted(ranks)
        assert role_rank(ADMIN) > role_rank(GUIDE)

    def test_guide_is_the_lowest_privilege_dashboard_role(self):
        assert role_rank(GUIDE) == 0
        assert role_rank(ADMIN) == len(HIERARCHY) - 1

    def test_unknown_roles_have_no_rank(self):
        assert role_rank("super-admin") == -1
        assert role_rank("traveler") == -1
        assert role_rank("") == -1


class TestRemovedRoles:
    """Super Admin no longer passes any dashboard guard."""

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
        for role in [CONTENT_MANAGER, REGIONAL_HEAD, CUSTOMER_SUPPORT, HOST, GUIDE]:
            assert has_access(role, ADMIN) is False

    def test_guide_passes_only_the_guide_guard(self):
        assert has_access(GUIDE, GUIDE) is True
        for role in [ADMIN, CONTENT_MANAGER, REGIONAL_HEAD, CUSTOMER_SUPPORT, HOST]:
            # Admin is implicitly allowed everywhere; no other role is.
            if role == ADMIN:
                continue
            assert has_access(GUIDE, role) is False

    def test_host_does_not_inherit_the_guide_guard(self):
        assert has_access(HOST, GUIDE) is False
        assert has_access(HOST, HOST) is True

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

    def test_staff_group_excludes_provider_roles(self):
        assert GUIDE not in roles.STAFF_OR_ABOVE
        assert HOST not in roles.STAFF_OR_ABOVE
        assert roles.PROVIDER_LEVEL == frozenset({ADMIN, HOST, GUIDE})

    def test_operations_guards(self):
        # Host applications: admin + regional-head
        assert has_access(ADMIN, ADMIN, REGIONAL_HEAD) is True
        assert has_access(REGIONAL_HEAD, ADMIN, REGIONAL_HEAD) is True
        assert has_access(CONTENT_MANAGER, ADMIN, REGIONAL_HEAD) is False
        assert has_access(HOST, ADMIN, REGIONAL_HEAD) is False
        assert has_access(GUIDE, ADMIN, REGIONAL_HEAD) is False
        # Support tickets: admin + customer-support
        assert has_access(ADMIN, ADMIN, CUSTOMER_SUPPORT) is True
        assert has_access(CUSTOMER_SUPPORT, ADMIN, CUSTOMER_SUPPORT) is True
        assert has_access(REGIONAL_HEAD, ADMIN, CUSTOMER_SUPPORT) is False
        assert has_access(GUIDE, ADMIN, CUSTOMER_SUPPORT) is False

    def test_cms_guard_allows_admin_and_content_manager_only(self):
        assert has_access(ADMIN, ADMIN, CONTENT_MANAGER) is True
        assert has_access(CONTENT_MANAGER, ADMIN, CONTENT_MANAGER) is True
        assert has_access(REGIONAL_HEAD, ADMIN, CONTENT_MANAGER) is False
        assert has_access(HOST, ADMIN, CONTENT_MANAGER) is False
        assert has_access(GUIDE, ADMIN, CONTENT_MANAGER) is False

    def test_legacy_content_writer_keeps_content_manager_permissions(self):
        assert normalize_role("content-writer") == CONTENT_MANAGER
        assert has_access("content-writer", ADMIN, CONTENT_MANAGER) is True
        assert has_access("writer", ADMIN, CONTENT_MANAGER) is True
        assert has_access("content-writer", ADMIN) is False


class TestRoleAssignmentAllowLists:
    """Role *assignment* is allow-listed separately from role *authorization*."""

    def test_only_traveler_and_host_can_be_self_registered(self):
        assert SELF_REGISTERABLE_ROLES == frozenset({TRAVELER, HOST})

    @pytest.mark.parametrize("role", [TRAVELER, HOST])
    def test_public_roles_are_self_registerable(self, role: str):
        assert can_self_register(role) is True

    @pytest.mark.parametrize("role", [ADMIN, CONTENT_MANAGER, REGIONAL_HEAD, CUSTOMER_SUPPORT, GUIDE])
    def test_elevated_roles_cannot_be_self_registered(self, role: str):
        assert can_self_register(role) is False

    @pytest.mark.parametrize("role", ["super-admin", "", "Guide", "wizard", "admin "])
    def test_unknown_roles_cannot_be_self_registered(self, role: str):
        assert can_self_register(role) is False

    def test_admin_may_assign_any_known_role(self):
        for role in HIERARCHY + [TRAVELER]:
            assert is_assignable_role(role) is True

    @pytest.mark.parametrize("role", ["super-admin", "wizard", ""])
    def test_admin_cannot_assign_an_unknown_role(self, role: str):
        assert is_assignable_role(role) is False

    def test_known_and_dashboard_predicates(self):
        assert is_known_role(GUIDE) is True
        assert is_known_role(TRAVELER) is True
        assert is_known_role("super-admin") is False
        assert is_dashboard_role(GUIDE) is True
        assert is_dashboard_role(TRAVELER) is False

    def test_guide_capabilities_are_scoped_to_own_records(self):
        assert GUIDE_CAPABILITIES
        assert all(cap.startswith("own_") or cap.endswith(":read") for cap in GUIDE_CAPABILITIES)
        assert "users:write" not in GUIDE_CAPABILITIES