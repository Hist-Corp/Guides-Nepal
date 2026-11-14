import { describe, it, expect } from 'vitest';
import { canAccess, normalizeRole, type Role } from '../../utils/roles';

// Dashboard hierarchy, highest privilege first:
// admin > content-manager > regional-head > customer-support > host
const HIERARCHY: Role[] = ['admin', 'content-manager', 'regional-head', 'customer-support', 'host'];

describe('normalizeRole', () => {
  it('resolves every dashboard role', () => {
    HIERARCHY.forEach((role) => expect(normalizeRole(role)).toBe(role));
  });

  it('maps the retired super-admin and guide roles to null (no console)', () => {
    expect(normalizeRole('super-admin')).toBeNull();
    expect(normalizeRole('superadmin')).toBeNull();
    expect(normalizeRole('super_admin')).toBeNull();
    expect(normalizeRole('guide')).toBeNull();
    expect(normalizeRole('Guide')).toBeNull();
  });

  it('maps the legacy content-writer name onto content-manager', () => {
    expect(normalizeRole('content-writer')).toBe('content-manager');
    expect(normalizeRole('content_writer')).toBe('content-manager');
    expect(normalizeRole('content writer')).toBe('content-manager');
    expect(normalizeRole('writer')).toBe('content-manager');
  });

  it('keeps traveler off the dashboard', () => {
    expect(normalizeRole('traveler')).toBeNull();
  });

  it('returns null for empty input', () => {
    expect(normalizeRole(null)).toBeNull();
    expect(normalizeRole(undefined)).toBeNull();
    expect(normalizeRole('')).toBeNull();
  });
});

describe('canAccess', () => {
  it('lets admin reach every console', () => {
    HIERARCHY.forEach((required) => expect(canAccess(required, 'admin')).toBe(true));
  });

  it('lets each role reach its own console and the ones below it', () => {
    HIERARCHY.forEach((actual, index) => {
      HIERARCHY.forEach((required, requiredIndex) => {
        expect(canAccess(required, actual)).toBe(requiredIndex >= index);
      });
    });
  });

  it('denies access when there is no dashboard role', () => {
    HIERARCHY.forEach((required) => expect(canAccess(required, null)).toBe(false));
  });

  it('denies lower roles access to higher consoles', () => {
    expect(canAccess('content-manager', 'regional-head')).toBe(false);
    expect(canAccess('content-manager', 'customer-support')).toBe(false);
    expect(canAccess('content-manager', 'host')).toBe(false);
    expect(canAccess('admin', 'content-manager')).toBe(false);
    expect(canAccess('admin', 'host')).toBe(false);
    expect(canAccess('regional-head', 'customer-support')).toBe(false);
  });
});