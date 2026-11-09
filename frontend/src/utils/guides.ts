import { useAuthStore } from '../store/authStore';
import type { Booking } from '../store/bookingStore';

interface GuideLike {
  id: number | string;
  name?: string;
  rating?: number;
  reviews?: number;
  /** Login account id of the guide, set on backend catalog payloads. */
  userId?: number | null;
}

/** Account id encoded in a session token's `sub` claim. */
const userIdFromToken = (token?: string | null): number | null => {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const claims = JSON.parse(atob(padded));
    const id = Number(claims?.sub);
    return Number.isFinite(id) ? id : null;
  } catch {
    return null;
  }
};

/**
 * Id of the signed-in user's account (null when signed out).
 *
 * Guides must not appear in their own "Who you'll meet" list or book
 * themselves, so the guide lists filter out the card whose `userId` is this.
 */
export function useViewerGuideId(): number | null {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const accessToken = useAuthStore((s) => s.accessToken);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  if (!isAuthenticated) return null;
  return userIdFromToken(accessToken) ?? userIdFromToken(refreshToken);
}

/** True when this guide card belongs to the signed-in account. */
export function isOwnGuide(
  guide: GuideLike,
  viewerGuideId: number | null | undefined
): boolean {
  return (
    viewerGuideId !== null &&
    viewerGuideId !== undefined &&
    guide.userId !== null &&
    guide.userId !== undefined &&
    Number(guide.userId) === Number(viewerGuideId)
  );
}

/**
 * Guides that can be shown in the "Who you'll meet" section.
 *
 * - Hides the signed-in guide: a guide cannot meet or book themselves.
 * - Hides any guide that has an active booking ("upcoming", not cancelled or
 *   archived) for this exact experience (matched by experience id + city) —
 *   i.e. guides that are booked/reserved here.
 * - Always orders the remaining guides by rating (highest first) and, for
 *   equal ratings, by number of reviews (most first) so the best-rated,
 *   most-reviewed guides are prioritised.
 */
export function getAvailableGuides<T extends GuideLike>(
  guides: T[],
  bookings: Booking[],
  experienceId: number | string,
  city = '',
  viewerGuideId: number | null = null
): T[] {
  const reservedGuideIds = new Set(
    bookings
      .filter(
        (b) =>
          b.status === 'upcoming' &&
          b.guideId !== undefined &&
          b.guideId !== null &&
          String(b.experienceId) === String(experienceId) &&
          String(b.city ?? '') === String(city)
      )
      .map((b) => String(b.guideId))
  );

  return guides
    .filter((guide) => !reservedGuideIds.has(String(guide.id)) && !isOwnGuide(guide, viewerGuideId))
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || (b.reviews ?? 0) - (a.reviews ?? 0));
}
