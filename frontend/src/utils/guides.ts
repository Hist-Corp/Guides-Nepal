import { useCallback, useEffect, useState } from 'react';
import { getApiUrl } from '../config/api';
import { toIsoDate } from './date';
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

export interface GuideAvailabilityQuery {
  accessToken?: string | null;
  experienceId?: number | string | null;
  date?: string | null;
  checkout?: string | null;
  /** Catalog guide ids to check; the response only names the available ones. */
  guideIds: (number | string)[];
}

/**
 * Catalog guide ids with every night of the stay open for this experience.
 *
 * `null` when there is nothing to check (no token, date or guides) or the
 * request could not be answered, so callers fall through to the server's own
 * validation. A returned set is the server's answer, and may be empty.
 */
export async function fetchAvailableGuideIds({
  accessToken,
  experienceId,
  date,
  checkout,
  guideIds,
}: GuideAvailabilityQuery): Promise<Set<string> | null> {
  const first = toIsoDate(date);
  if (
    !accessToken ||
    !first ||
    experienceId === null ||
    experienceId === undefined ||
    !guideIds.length
  ) {
    return null;
  }
  const params = new URLSearchParams({
    date: first,
    experience_id: String(experienceId),
    guide_ids: guideIds.map(String).join(','),
  });
  const last = toIsoDate(checkout);
  if (last) params.set('checkout', last);

  try {
    const response = await fetch(
      getApiUrl(`/bookings/availability/guides?${params.toString()}`),
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!response.ok) return null;
    const data = await response.json();
    const ids = Array.isArray(data?.guide_ids) ? data.guide_ids : [];
    return new Set(ids.map(String));
  } catch {
    return null;
  }
}

export type GuideAvailabilityStatus = 'unfiltered' | 'checking' | 'verified' | 'failed';

/** What the "Who you'll meet" list knows about the selected dates. */
export interface GuideAvailabilityState {
  /**
   * The last answer: the verified ids, or the ids that were verified before a
   * new date started checking (empty when the check failed). `null` when there
   * is nothing to filter.
   */
  ids: Set<string> | null;
  status: GuideAvailabilityStatus;
  /** Re-runs the check after `status: 'failed'`. */
  retry: () => void;
}

/**
 * The guides (from `guideIds`) still bookable for the selected date or stay,
 * re-read whenever the date, the stay or the guide list changes.
 *
 * A date with no open guides (`verified`, empty) is a different answer from a
 * check that could not be completed (`failed`): the first hides the list, the
 * second offers a retry. Both show no guides, so availability is never assumed.
 */
export function useGuidesAvailableOnDate(
  query: GuideAvailabilityQuery
): GuideAvailabilityState {
  const { accessToken, experienceId, date, checkout } = query;
  const idsKey = query.guideIds.map(String).join(',');
  const [state, setState] = useState<{
    status: GuideAvailabilityStatus;
    ids: Set<string> | null;
  }>({ status: 'unfiltered', ids: null });
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => setAttempt((count) => count + 1), []);

  useEffect(() => {
    let cancelled = false;
    if (!date || !accessToken || !idsKey) {
      setState({ status: 'unfiltered', ids: null });
      return;
    }
    // Keep the answer already on screen while the new date is checked: a
    // pending check is not an answer, so it must not blank the picker or drop
    // the traveller's choice.
    setState((previous) => ({ status: 'checking', ids: previous.ids ?? new Set() }));
    void fetchAvailableGuideIds({
      accessToken,
      experienceId,
      date,
      checkout,
      guideIds: idsKey.split(','),
    }).then((ids) => {
      if (cancelled) return;
      setState(
        ids === null
          ? { status: 'failed', ids: new Set() }
          : { status: 'verified', ids }
      );
    });
    return () => {
      cancelled = true;
    };
  }, [accessToken, experienceId, date, checkout, idsKey, attempt]);

  return { ...state, retry };
}

/**
 * The guide the picker keeps selected after an availability answer.
 *
 * A check that is still running or could not be completed is not an answer:
 * the traveller keeps the guide they picked. Once the server answers, a guide
 * who is still listed stays selected and one who dropped out falls back to the
 * first available guide (or to nothing when nobody is open). `keepId` pins a
 * guide that must survive the fallback, such as the one just booked.
 */
export function keepSelectedGuide<T extends { id: number | string }>(
  available: T[],
  current: T | null,
  status: GuideAvailabilityStatus,
  keepId?: number | string | null
): T | null {
  if (status === 'checking' || status === 'failed') return current;
  const pinned = keepId !== null && keepId !== undefined ? String(keepId) : null;
  const stays =
    current !== null &&
    (available.some((g) => g.id === current.id) ||
      (pinned !== null && String(current.id) === pinned));
  return stays ? current : (available[0] ?? null);
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
    .filter((guide) => {
      const slots = (guide as any).availableSlots;
      return (
        !reservedGuideIds.has(String(guide.id)) &&
        !isOwnGuide(guide, viewerGuideId) &&
        (typeof slots === 'number' ? slots > 0 : true)
      );
    })
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || (b.reviews ?? 0) - (a.reviews ?? 0));
}

/**
 * Profile link for a guide card, or `null` when there is no profile to open.
 *
 * Only a catalog profile gets a slug; a guide who lists from an account alone
 * has none, and linking her account id would land on a 404.
 */
export function guideProfileHref(guide: { slug?: string | null }): string | null {
  const slug = guide.slug?.trim();
  return slug ? `/guidesprofile/${slug}` : null;
}
