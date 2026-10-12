/**
 * Matches day-based durations such as "9 days", "12 days" or "1 day".
 * Hour-based durations ("3 hours") never match, so hourly experiences keep
 * the check-in / check-out range system.
 */
const DAY_DURATION = /\b\d+(?:\.\d+)?\s*days?\b/i;

interface DurationCarrier {
  duration?: string | null;
}

/**
 * True for pre-defined tours/trips — fixed multi-day itineraries (treks,
 * safaris, organised tours) that depart on one chosen date. Guests book a
 * single date for the whole trip, so these use the single-date booking
 * calendar instead of a check-in/check-out range. Everything else keeps the
 * existing range system.
 */
export const isPredefinedTrip = (
  experience: DurationCarrier | null | undefined
): boolean => DAY_DURATION.test(experience?.duration ?? '');
