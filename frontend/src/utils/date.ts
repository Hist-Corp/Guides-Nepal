/**
 * The one place the app handles calendar dates.
 *
 * Every date that crosses a page, a calendar or the API is a calendar day in
 * `YYYY-MM-DD` form: booking state, availability queries, booking payloads and
 * the backend all key on that string. Only user-facing text is formatted, and
 * only through the helpers here, so no two screens can disagree about what
 * "05/10/2026" means. Times/timestamps (messages, uploads) are separate and
 * keep their ISO datetime strings.
 */

const ISO_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/** True when `value` is a real calendar day in `YYYY-MM-DD` form. */
export function isIsoDate(value?: string | null): boolean {
  const match = value?.match(ISO_PATTERN);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

/** `YYYY-MM-DD` for a Date, using its local calendar day (never UTC). */
export function toDayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Today's calendar day as `YYYY-MM-DD`. */
export function todayIso(): string {
  return toDayKey(new Date());
}

/**
 * Normalizes any date value the app may hold into `YYYY-MM-DD`.
 *
 * Accepts ISO dates, `DD/MM/YYYY` (the calendar's displayed order),
 * `YYYYMMDD` and Date objects. Anything else, including impossible days such
 * as 2026-02-30, returns null so a half-parsed date never reaches the API.
 */
export function toIsoDate(value?: string | Date | null): string | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : toDayKey(value);
  }
  if (!value) return null;
  const text = value.trim();

  const iso = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) {
    const key = `${iso[1]}-${iso[2].padStart(2, '0')}-${iso[3].padStart(2, '0')}`;
    return isIsoDate(key) ? key : null;
  }

  const dayFirst = text.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  if (dayFirst) {
    const key = `${dayFirst[3]}-${dayFirst[2].padStart(2, '0')}-${dayFirst[1].padStart(2, '0')}`;
    return isIsoDate(key) ? key : null;
  }

  const compact = text.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (compact) {
    const key = `${compact[1]}-${compact[2]}-${compact[3]}`;
    return isIsoDate(key) ? key : null;
  }

  return null;
}

/** Midnight local Date for an ISO day, or null when the value is not one. */
export function fromIsoDate(iso?: string | null): Date | null {
  if (!isIsoDate(iso)) return null;
  const [year, month, day] = (iso as string).split('-').map(Number);
  return new Date(year, month - 1, day);
}

/** The default date label: "26 Nov 2026". */
export const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
};

/**
 * Display text for a stored date (ISO, DD/MM/YYYY, Date), '' when invalid.
 * Uses the local calendar day, so a server-sent `2026-11-26` never shifts to
 * the 25th for a viewer west of UTC.
 */
export function formatDate(
  value?: string | Date | null,
  locale = 'en-GB',
  options: Intl.DateTimeFormatOptions = DATE_FORMAT
): string {
  const date =
    value instanceof Date ? value : fromIsoDate(toIsoDate(value as string));
  if (!date || Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(locale, options);
}

/** "26 Nov" — compact day label used inside date ranges. */
export function formatDayMonth(iso?: string | null): string {
  return formatDate(iso, 'en-GB', { day: 'numeric', month: 'short' });
}

/** "November 2026" — the calendar's month caption. */
export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

/** Nights between check-in and check-out; 0 when the range is not usable. */
export function nightsBetween(
  checkIn?: string | null,
  checkout?: string | null
): number {
  const start = fromIsoDate(toIsoDate(checkIn));
  const end = fromIsoDate(toIsoDate(checkout));
  if (!start || !end) return 0;
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 86_400_000));
}
