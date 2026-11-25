import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Info,
  Loader2,
  Lock,
  Unlock,
} from 'lucide-react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { useAuthStore } from '../../store/authStore';
import {
  guideDashboardApi,
  type GuideAvailabilityDay,
  type GuideListing,
} from '../../services/guideDashboardApi';
import { getGuideListedExperiences } from '../../data/guideListedExperiences';
import { formatMonthYear, toDayKey } from '../../utils/date';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
const endOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);

const emptyDay = (date: string): GuideAvailabilityDay => ({
  date,
  status: 'unavailable',
  bookings: 0,
  remaining: null,
});

/**
 * Guide availability calendar.
 *
 * Availability is opt-in: every date starts closed, and only dates the guide
 * opens here become bookable on the public experience pages. Clicking a date
 * toggles it (shift-click fills the range from the last click), and closing a
 * date that still holds a booking is refused by the API with the reason, which
 * is surfaced inline.
 *
 * The calendar is scoped to one listing experience at a time (its id lives in
 * the URL); the dates opened here are only bookable for that experience.
 */
const GuideAvailabilityPage: React.FC = () => {
  const { accessToken, isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const { experienceId: routeExperienceId } = useParams<{ experienceId: string }>();
  const selectedExperienceId = Number(routeExperienceId) || 0;
  const [listings, setListings] = useState<GuideListing[]>([]);
  const [anchor, setAnchor] = useState(() => startOfMonth(new Date()));
  const [days, setDays] = useState<Record<string, GuideAvailabilityDay>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [lastClicked, setLastClicked] = useState<string | null>(null);
  // Slots and price are the guide's offer, set before opening dates.
  const [slots, setSlots] = useState(10);
  const [price, setPrice] = useState('');

  // Owned listings are addressed publicly as 200000 + row id; assignments
  // already carry the experience id they point at.
  const listingSlugs = new Set(
    listings.map((listing) => listing.public_slug).filter((slug): slug is string => Boolean(slug)),
  );
  // City catalogue pages list their guides in static data, so those
  // experiences are not in the API response and are read here instead.
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ');
  const catalogueExperiences = getGuideListedExperiences([user?.firstName, fullName])
    .filter((experience) => !listingSlugs.has(experience.slug))
    .map((experience) => ({
      id: experience.id,
      label: `${experience.title} · ${experience.city}`,
    }));
  const experiences = [
    ...listings.map((listing) => ({
      id: listing.experience_id ?? 200_000 + listing.id,
      label: `${listing.title} · ${listing.city}`,
    })),
    ...catalogueExperiences,
  ].filter((experience, index, all) => all.findIndex((item) => item.id === experience.id) === index);
  const selectedExperience = experiences.find((item) => item.id === selectedExperienceId);
  // The guide's own offer for the selected experience pre-fills the form; any
  // experience can still be opened at whatever slots and price they choose.
  const selectedListing = listings.find(
    (listing) => (listing.experience_id ?? 200_000 + listing.id) === selectedExperienceId,
  );
  const priceValue = Number(price);

  const monthStart = toDayKey(startOfMonth(anchor));
  const monthEnd = toDayKey(endOfMonth(anchor));
  const today = toDayKey(new Date());

  const load = useCallback(
    async (start: string, end: string, quiet = false) => {
      if (!accessToken) return;
      if (!quiet) setLoading(true);
      setError('');
      try {
        const data = await guideDashboardApi.getAvailability(
          accessToken,
          start,
          end,
          selectedExperienceId || undefined,
        );
        const map: Record<string, GuideAvailabilityDay> = {};
        data.days.forEach((day) => {
          map[day.date] = day;
        });
        setDays(map);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load your calendar.');
      } finally {
        setLoading(false);
      }
    },
    [accessToken, selectedExperienceId],
  );

  useEffect(() => {
    if (accessToken && user?.role === 'guide') void load(monthStart, monthEnd);
  }, [accessToken, user?.role, monthStart, monthEnd, load]);

  // Each experience has its own natural defaults: its guest limit and price.
  useEffect(() => {
    setSlots(selectedListing?.max_guests ?? 10);
    setPrice(selectedListing ? String(selectedListing.price) : '');
  }, [selectedExperienceId, selectedListing?.id, selectedListing?.max_guests, selectedListing?.price]);

  useEffect(() => {
    if (!accessToken || user?.role !== 'guide') return;
    guideDashboardApi
      .listListings(accessToken)
      .then(setListings)
      .catch(() => setListings([]));
  }, [accessToken, user?.role]);

  const apply = useCallback(
    async (dates: string[], status: 'available' | 'unavailable') => {
      if (!accessToken || dates.length === 0) return;
      if (status === 'available' && (!Number.isFinite(priceValue) || priceValue <= 0)) {
        setError('Set a price per person greater than 0 before opening dates.');
        return;
      }
      setSaving(true);
      setError('');
      setNotice('');
      try {
        const result = await guideDashboardApi.setAvailability(
          accessToken,
          dates,
          status,
          selectedExperienceId || undefined,
          status === 'available' ? slots : undefined,
          status === 'available' ? priceValue : undefined,
        );
        setNotice(
          status === 'available'
            ? `${result.dates.length} date${result.dates.length === 1 ? '' : 's'} opened with ${slots} slot${slots === 1 ? '' : 's'} at ${priceValue.toFixed(2)} per person.`
            : `${result.dates.length} date${result.dates.length === 1 ? '' : 's'} marked ${status}.`,
        );
        await load(monthStart, monthEnd, true);
      } catch (saveError) {
        setError(saveError instanceof Error ? saveError.message : 'Unable to save availability.');
      } finally {
        setSaving(false);
      }
    },
    [accessToken, load, monthStart, monthEnd, selectedExperienceId, slots, priceValue],
  );

  const toggle = (day: GuideAvailabilityDay, shiftKey: boolean) => {
    if (saving) return;
    if (day.date < today) {
      setError('Past dates cannot be changed.');
      return;
    }
    const target: 'available' | 'unavailable' = day.status === 'available' ? 'unavailable' : 'available';
    let dates = [day.date];
    if (shiftKey && lastClicked && lastClicked !== day.date) {
      const [from, to] = [lastClicked, day.date].sort();
      const inRange = Object.values(days).filter(
        (entry) => entry.date >= from && entry.date <= to && entry.date >= today,
      );
      // Closing a date with bookings is refused by the API; leaving those out
      // keeps the rest of the range from failing with them.
      dates = inRange
        .filter((entry) => target === 'available' || entry.bookings === 0)
        .map((entry) => entry.date);
      if (dates.length === 0) {
        setError('Those dates still have active bookings. Cancel them before closing the dates.');
        return;
      }
    }
    setLastClicked(day.date);
    void apply(dates, target);
  };

  const openRemaining = () => {
    const dates = Object.values(days)
      .filter((day) => day.date >= today && day.status === 'unavailable')
      .map((day) => day.date);
    void apply(dates, 'available');
  };

  const closeOpenDays = () => {
    const dates = Object.values(days)
      .filter((day) => day.date >= today && day.status === 'available' && day.bookings === 0)
      .map((day) => day.date);
    void apply(dates, 'unavailable');
  };

  const cells = useMemo(() => {
    const offset = startOfMonth(anchor).getDay();
    const total = endOfMonth(anchor).getDate();
    const out: (GuideAvailabilityDay | null)[] = Array.from({ length: offset }, () => null);
    for (let day = 1; day <= total; day += 1) {
      const key = toDayKey(new Date(anchor.getFullYear(), anchor.getMonth(), day));
      out.push(days[key] ?? emptyDay(key));
    }
    while (out.length % 7 !== 0) out.push(null);
    return out;
  }, [anchor, days]);

  const stats = useMemo(() => {
    const counts = { available: 0, unavailable: 0, booked: 0 };
    Object.values(days).forEach((day) => {
      if (day.date < today) return;
      counts[day.status] += 1;
    });
    return counts;
  }, [days, today]);

  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (user?.role !== 'guide') return <Navigate to="/bookings" replace />;

  const isCurrentMonth =
    anchor.getFullYear() === new Date().getFullYear() &&
    anchor.getMonth() === new Date().getMonth();

  const shiftMonth = (delta: number) =>
    setAnchor((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));

  const cellClass = (day: GuideAvailabilityDay) => {
    if (day.date < today) return 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed';
    if (day.status === 'available') return 'border-emerald-300 bg-emerald-50 text-emerald-900 hover:border-emerald-400';
    if (day.status === 'booked') return 'border-amber-300 bg-amber-50 text-amber-900 cursor-not-allowed';
    return 'border-gray-200 bg-white text-gray-500 hover:border-[#213448] hover:text-[#213448]';
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 font-sans">
      <Header />
      <div className="mx-auto flex w-full max-w-5xl items-center gap-4 px-4 pt-6">
        <Link
          to="/guide/dashboard"
          className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:border-[#213448] hover:text-[#213448]"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
      </div>
      <main id="main-content" className="mx-auto w-full max-w-5xl flex-grow px-4 py-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-900">
              <CalendarDays className="h-7 w-7" /> Availability calendar
            </h1>
            <p className="mt-2 max-w-2xl text-gray-600">
              Travellers can only book dates you open here. Every new date stays closed until you mark it
              available, and a date is locked once its bookings fill your capacity.
            </p>
          </div>
          <Link
            to="/guide/bookings"
            className="rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-bold text-gray-800 hover:bg-gray-100"
          >
            Booking requests
          </Link>
        </div>

        <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <label htmlFor="availability-experience" className="text-sm font-bold text-gray-900">
            Listing experience
          </label>
          <p className="mt-1 text-xs text-gray-500">
            Pick the experience first — the dates you open below are bookable for that experience
            only.
          </p>
          <select
            id="availability-experience"
            value={routeExperienceId ?? ''}
            onChange={(event) =>
              navigate(
                event.target.value
                  ? `/guide/availability/${event.target.value}`
                  : '/guide/availability',
              )
            }
            className="mt-3 w-full max-w-xl rounded-xl border border-gray-300 bg-white p-2.5 text-sm font-semibold text-gray-800"
          >
            <option value="">All experiences (shared dates)</option>
            {experiences.map((experience) => (
              <option key={experience.id} value={experience.id}>
                {experience.label}
              </option>
            ))}
          </select>
          {experiences.length === 0 && (
            <p className="mt-2 text-xs text-gray-500">You have no listing experiences yet.</p>
          )}
        </div>

        <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-bold text-gray-900">What travellers get</h2>
          <p className="mt-1 text-xs text-gray-500">
            Set these before opening dates: every date you open takes this many guests and is
            sold at this price per person. Bookings on the date use both.
          </p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <label htmlFor="availability-slots" className="block text-sm font-semibold text-gray-800">
              Slots per date
              <input
                id="availability-slots"
                type="number"
                min={1}
                max={100}
                value={slots}
                onChange={(event) => setSlots(Math.max(1, Number(event.target.value) || 1))}
                className="mt-2 w-full rounded-xl border border-gray-300 p-2.5 text-sm font-semibold text-gray-800 focus:border-[#213448] focus:outline-none"
              />
              <span className="mt-1 block text-xs font-normal text-gray-500">
                Guests you can take on each opened date. Bookings beyond this are refused.
              </span>
            </label>
            <label htmlFor="availability-price" className="block text-sm font-semibold text-gray-800">
              Price per person (USD)
              <input
                id="availability-price"
                type="number"
                min={0}
                step="0.01"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-300 p-2.5 text-sm font-semibold text-gray-800 focus:border-[#213448] focus:outline-none"
              />
              <span className="mt-1 block text-xs font-normal text-gray-500">
                {selectedListing
                  ? 'Pre-filled from this experience’s price. Change it to sell these dates for more or less.'
                  : 'The price travellers pay per person on the dates you open.'}
              </span>
            </label>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              disabled={isCurrentMonth}
              aria-label="Previous month"
              className="rounded-xl border border-gray-200 p-2 text-gray-600 hover:border-[#213448] hover:text-[#213448] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="min-w-44 text-center text-lg font-bold text-gray-900">
              {formatMonthYear(anchor)}
            </p>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              aria-label="Next month"
              className="rounded-xl border border-gray-200 p-2 text-gray-600 hover:border-[#213448] hover:text-[#213448]"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <button
              type="button"
              onClick={openRemaining}
              disabled={saving || stats.unavailable === 0}
              className="inline-flex items-center gap-2 rounded-full bg-[#213448] px-4 py-2 font-bold text-white hover:bg-[#1a2a3a] disabled:opacity-50"
            >
              <Unlock className="h-4 w-4" /> Open all remaining dates
            </button>
            <button
              type="button"
              onClick={closeOpenDays}
              disabled={saving || stats.available === 0}
              className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
              <Lock className="h-4 w-4" /> Close open dates
            </button>
            {saving && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
          </div>
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}
        {notice && !error && (
          <p role="status" className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            {notice}
          </p>
        )}

        <section className="mt-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="mb-3 text-sm font-bold text-gray-800">
            {selectedExperience ? selectedExperience.label : 'Shared dates (all experiences)'}
          </p>
          {loading ? (
            <p className="flex items-center gap-2 py-16 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading your calendar…
            </p>
          ) : (
            <>
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold uppercase tracking-wide text-gray-400">
                {WEEKDAYS.map((label) => (
                  <div key={label} className="py-2">
                    {label}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {cells.map((day, index) => {
                  if (!day) return <div key={`pad-${index}`} className="min-h-24 rounded-xl" />;
                  const isPast = day.date < today;
                  return (
                    <button
                      key={day.date}
                      type="button"
                      onClick={(event) => toggle(day, event.shiftKey)}
                      disabled={isPast}
                      aria-pressed={day.status === 'available'}
                      aria-label={`${day.date}: ${day.status}${day.bookings ? `, ${day.bookings} booking(s)` : ''}`}
                      className={`flex min-h-24 flex-col items-start gap-1 rounded-xl border p-2 text-left transition-colors ${cellClass(day)}`}
                    >
                      <span className="text-sm font-bold">{Number(day.date.slice(-2))}</span>
                      {day.status === 'available' && (
                        <span className="text-[11px] font-semibold">
                          {day.bookings > 0 && day.remaining !== null && day.remaining > 0
                            ? `Open · ${day.remaining} left`
                            : day.max_slots != null
                              ? `Open · ${day.max_slots} slot${day.max_slots === 1 ? '' : 's'}`
                              : 'Open'}
                        </span>
                      )}
                      {day.status === 'booked' && (
                        <span className="flex items-center gap-1 text-[11px] font-semibold">
                          <Lock className="h-3 w-3" /> Booked
                        </span>
                      )}
                      {day.status === 'unavailable' && !isPast && (
                        <span className="text-[11px] text-gray-400">Closed</span>
                      )}
                      {day.bookings > 0 && (
                        <span className="mt-auto text-[11px] text-gray-500">
                          {day.bookings} booking{day.bookings === 1 ? '' : 's'}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </section>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-sm text-gray-600">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full border border-emerald-300 bg-emerald-50" /> Available (
              {stats.available})
            </span>
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full border border-amber-300 bg-amber-50" /> Booked ({stats.booked})
            </span>
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full border border-gray-300 bg-white" /> Unavailable (
              {stats.unavailable})
            </span>
          </div>
          <span className="inline-flex items-center gap-2 text-xs text-gray-500">
            <Info className="h-4 w-4" /> Tip: click a date to toggle it, shift-click a second date to fill the range.
          </span>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GuideAvailabilityPage;
