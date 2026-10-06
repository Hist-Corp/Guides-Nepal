import type { Booking } from '../store/bookingStore';

interface GuideLike {
  id: number | string;
  rating?: number;
  reviews?: number;
}

/**
 * Guides that can be shown in the "Who you'll meet" section.
 *
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
  city = ''
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
    .filter((guide) => !reservedGuideIds.has(String(guide.id)))
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || (b.reviews ?? 0) - (a.reviews ?? 0));
}
