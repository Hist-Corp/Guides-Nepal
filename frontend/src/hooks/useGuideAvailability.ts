import { useCallback, useEffect, useRef, useState } from 'react';
import { getApiUrl } from '../config/api';

export interface DateAvailability {
  remaining: number;
  maxCapacity: number;
}

export type AvailabilityCounts = Record<string, DateAvailability>;

interface UseGuideAvailabilityOptions {
  accessToken: string | null;
  /** Catalog guide id, or null for the backend's default bookable guide. */
  guideId?: number | string | null;
}

/**
 * Closed/full dates and remaining spots for one guide's calendar.
 *
 * Results are cached and stored per month *and* per guide, so switching guides
 * never shows another guide's numbers. `refresh` re-reads a single month after
 * a booking, because only the booked date's capacity can have changed.
 */
export function useGuideAvailability({ accessToken, guideId }: UseGuideAvailabilityOptions) {
  const guideKey = guideId === null || guideId === undefined ? 'default' : String(guideId);
  const [disabledByGuide, setDisabledByGuide] = useState<Record<string, string[]>>({});
  const [countsByGuide, setCountsByGuide] = useState<Record<string, AvailabilityCounts>>({});
  // In-flight requests, so identical calls share one round trip. The `dates:` /
  // `counts:` prefixes keep the two calls for the same month apart.
  const inflight = useRef<Map<string, Promise<void>>>(new Map());
  const dateLists = useRef<Map<string, string[]>>(new Map());
  const loadedMonths = useRef<Set<string>>(new Set());

  /** Run `task` once per key; a concurrent caller awaits the pending request. */
  const loadOnce = useCallback(async (key: string, task: () => Promise<void>) => {
    const pending = inflight.current.get(key);
    if (pending) return pending;
    const promise = task().finally(() => inflight.current.delete(key));
    inflight.current.set(key, promise);
    return promise;
  }, []);

  const fetchUnavailableDates = useCallback(
    async (year: number, month: number) => {
      if (!accessToken) return;
      const cacheKey = `${year}-${month}-${guideKey}`;
      const cached = dateLists.current.get(cacheKey);
      if (cached) {
        setDisabledByGuide((prev) => ({ ...prev, [guideKey]: cached }));
        return;
      }
      const guideParam = guideKey === 'default' ? '' : `&guide_id=${guideKey}`;
      await loadOnce(`dates:${cacheKey}`, async () => {
        try {
          const url = getApiUrl(
            `/bookings/availability/month?year=${year}&month=${month}${guideParam}`
          );
          const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
          if (!res.ok) return;
          const data = await res.json();
          const unavailable: string[] = Array.isArray(data.unavailable) ? data.unavailable : [];
          dateLists.current.set(cacheKey, unavailable);
          setDisabledByGuide((prev) => ({ ...prev, [guideKey]: unavailable }));
        } catch {
          // Silently fail - dates won't be disabled
        }
      });
    },
    [accessToken, guideKey, loadOnce]
  );

  const fetchMonthCounts = useCallback(
    async (year: number, month: number) => {
      if (!accessToken) return;
      const cacheKey = `${year}-${month}-${guideKey}`;
      if (loadedMonths.current.has(cacheKey)) return;
      const guideParam = guideKey === 'default' ? '' : `&guide_id=${guideKey}`;
      await loadOnce(`counts:${cacheKey}`, async () => {
        try {
          const url = getApiUrl(
            `/bookings/availability/month-detail?year=${year}&month=${month}${guideParam}`
          );
          const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
          if (!res.ok) return;
          const data = await res.json();
          const days = (data.availability ?? {}) as Record<
            string,
            { remaining?: number; max_capacity?: number }
          >;
          const counts: AvailabilityCounts = {};
          for (const [date, value] of Object.entries(days)) {
            counts[date] = {
              remaining: value.remaining ?? 0,
              maxCapacity: value.max_capacity ?? 0,
            };
          }
          loadedMonths.current.add(cacheKey);
          setCountsByGuide((prev) => ({
            ...prev,
            [guideKey]: { ...(prev[guideKey] ?? {}), ...counts },
          }));
        } catch {
          // Silently fail - spots won't be shown
        }
      });
    },
    [accessToken, guideKey, loadOnce]
  );

  const loadMonth = useCallback(
    async (year: number, month: number) => {
      await Promise.all([fetchUnavailableDates(year, month), fetchMonthCounts(year, month)]);
    },
    [fetchUnavailableDates, fetchMonthCounts]
  );

  // Load the current month on mount and again when the guide changes.
  useEffect(() => {
    if (!accessToken) return;
    const now = new Date();
    void loadMonth(now.getFullYear(), now.getMonth() + 1);
  }, [accessToken, loadMonth]);

  /** Re-read the booked date's month; every other month is still accurate. */
  const refresh = useCallback(
    async (bookedDate: string) => {
      const booked = new Date(`${bookedDate}T00:00:00`);
      if (Number.isNaN(booked.getTime())) return;
      const year = booked.getFullYear();
      const month = booked.getMonth() + 1;
      const cacheKey = `${year}-${month}-${guideKey}`;
      // A request that started before the booking would write pre-booking
      // counts, so let it settle before dropping the cached month.
      await Promise.all([
        inflight.current.get(`dates:${cacheKey}`),
        inflight.current.get(`counts:${cacheKey}`),
      ]);
      dateLists.current.delete(cacheKey);
      loadedMonths.current.delete(cacheKey);
      // Spot counts are keyed by YYYY-MM-DD, so drop just this month's days.
      const monthPrefix = `${year}-${String(month).padStart(2, '0')}-`;
      setCountsByGuide((prev) => {
        const counts = prev[guideKey];
        if (!counts) return prev;
        const kept = Object.entries(counts).filter(([date]) => !date.startsWith(monthPrefix));
        return { ...prev, [guideKey]: Object.fromEntries(kept) };
      });
      await loadMonth(year, month);
    },
    [guideKey, loadMonth]
  );

  return {
    disabledDates: disabledByGuide[guideKey] ?? [],
    availability: countsByGuide[guideKey] ?? {},
    handleMonthChange: loadMonth,
    refresh,
  };
}
