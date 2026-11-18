import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  MapPin,
  Minus,
  Plus,
  Search,
  Star,
  Users,
} from 'lucide-react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { Price } from '../../components/common/Price';
import { getApiUrl } from '../../config/api';
import { useAuthStore } from '../../store/authStore';
import { useBookingStore } from '../../store/bookingStore';

/** One bookable experience listed by a guide, as the search returns it. */
interface GuideListingOption {
  /** Public experience id (200000 + listing id) used by the booking form. */
  id: number;
  title: string;
  city: string;
  category: string;
  price: number;
  duration: string;
  max_guests: number;
}

interface AvailableGuide {
  /** Catalog guide id; what POST /bookings/ expects as ``guide_id``. */
  guide_id: number;
  name: string;
  image: string;
  role: string;
  rating: number;
  reviews: number;
  verified: boolean;
  cities: string[];
  languages: string[];
  /** Null when the day has no capacity row yet (room, no number). */
  spots_left: number | null;
  listings: GuideListingOption[];
}

const todayISO = () => new Date().toISOString().slice(0, 10);

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

const FindGuidePage: React.FC = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const accessToken = useAuthStore((s) => s.accessToken);
  const addBooking = useBookingStore((s) => s.addBooking);

  // 1 date → 2 guide → 3 confirm → 4 confirmation
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [date, setDate] = useState('');
  const [guides, setGuides] = useState<AvailableGuide[]>([]);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<{ guide: AvailableGuide; listing: GuideListingOption } | null>(
    null
  );
  const [guests, setGuests] = useState(1);
  const [confirmedRef, setConfirmedRef] = useState('');

  const search = async () => {
    if (!date) {
      setError('Pick a date to check availability.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(getApiUrl(`/bookings/available-guides?date=${date}`), {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          typeof body?.detail === 'string' ? body.detail : 'Could not load guides for that date.'
        );
      }
      const payload: AvailableGuide[] = await res.json();
      setGuides(payload);
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load guides for that date.');
    } finally {
      setLoading(false);
    }
  };

  const choose = async (guide: AvailableGuide, listing: GuideListingOption) => {
    setSelected({ guide, listing });
    setGuests(1);
    setError('');
    setChecking(true);
    try {
      // Re-check the exact day the booking will be written to, so a guide who
      // was just filled drops out before the traveller reaches the confirm step.
      const res = await fetch(
        getApiUrl(`/bookings/availability/daily?date=${date}&guide_id=${guide.guide_id}`),
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const body = await res.json().catch(() => ({}));
      if (res.ok && body.available === false) {
        setSelected(null);
        setError(`${guide.name} can no longer take bookings on this date. Please pick another guide.`);
        return;
      }
    } catch {
      // Keep going: the booking call validates availability again.
    } finally {
      setChecking(false);
    }
    setStep(3);
  };

  const confirm = async () => {
    if (!selected) return;
    setSaving(true);
    const bookingId = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
    const saved = await addBooking({
      id: bookingId,
      experienceId: selected.listing.id,
      experienceTitle: selected.listing.title,
      city: selected.listing.city || selected.guide.cities[0] || '',
      date,
      guests,
      price: selected.listing.price,
      image: selected.guide.image,
      status: 'upcoming',
      guideId: selected.guide.guide_id,
      guideName: selected.guide.name,
    });
    setSaving(false);
    if (saved) {
      // The stored booking carries the id the server assigned.
      setConfirmedRef(saved.id);
      setStep(4);
    }
  };

  const reset = () => {
    setStep(1);
    setGuides([]);
    setSelected(null);
    setError('');
    setGuests(1);
    setConfirmedRef('');
  };

  const maxGuests = selected
    ? Math.max(
        1,
        Math.min(
          selected.listing.max_guests,
          selected.guide.spots_left ?? selected.listing.max_guests
        )
      )
    : 1;

  const steps = [
    { number: 1, label: 'Date' },
    { number: 2, label: 'Guide' },
    { number: 3, label: 'Confirm' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col font-sans">
      <Header />

      <main id="main-content" className="flex-grow">
        <div className="bg-gradient-to-r from-primary to-primary/80 text-white py-10">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur ring-2 ring-white/30 shadow-lg">
                <CalendarDays className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Book by date</h1>
                <p className="text-white/80 text-sm mt-1">
                  Pick the day you want to travel, then choose from the guides who are free.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-5xl">
          {!isAuthenticated ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Sign in to book by date</h2>
              <p className="text-gray-500 text-sm mb-6">
                Bookings are tied to your account. Use Sign in in the header, then come back to
                this page.
              </p>
              <Link
                to="/explore"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary/90"
              >
                Explore experiences <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <>
              {/* Step indicator */}
              <ol className="mb-8 flex items-center gap-2 text-sm">
                {steps.map((item, index) => {
                  const current = step === item.number;
                  const done = step > item.number || step === 4;
                  return (
                    <li key={item.number} className="flex items-center gap-2">
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                          done
                            ? 'bg-primary text-white'
                            : current
                              ? 'bg-primary/10 text-primary ring-2 ring-primary'
                              : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {done ? <CheckCircle2 className="h-4 w-4" /> : item.number}
                      </span>
                      <span className={current || done ? 'font-semibold text-gray-900' : 'text-gray-400'}>
                        {item.label}
                      </span>
                      {index < steps.length - 1 && <span className="mx-1 h-px w-6 bg-slate-200" />}
                    </li>
                  );
                })}
              </ol>

              {error && (
                <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* 1 — Date selection */}
              {step === 1 && (
                <section className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8">
                  <h2 className="text-lg font-bold text-gray-900">When would you like to travel?</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Guides open their own calendars, so only days someone has opened will return
                    guides.
                  </p>
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end">
                    <label className="flex-1">
                      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Travel date
                      </span>
                      <input
                        type="date"
                        value={date}
                        min={todayISO()}
                        onChange={(event) => setDate(event.target.value)}
                        className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={search}
                      disabled={loading}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-60"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                      Check availability
                    </button>
                  </div>
                </section>
              )}

              {/* 2 — Availability check + guide selection */}
              {step === 2 && (
                <section>
                  <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        {guides.length} guide{guides.length === 1 ? '' : 's'} available
                      </h2>
                      <p className="text-sm text-gray-500">{formatDate(date)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                    >
                      <ArrowLeft className="h-4 w-4" /> Change date
                    </button>
                  </div>

                  {guides.length === 0 ? (
                    <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
                      <CalendarDays className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                      <h3 className="font-bold text-gray-900">No guides open on that date</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Try another day — guides publish availability from their dashboard.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {guides.map((guide) => (
                        <article
                          key={guide.guide_id}
                          className="rounded-2xl border border-gray-200 bg-white p-5"
                        >
                          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div className="flex gap-4">
                              <img
                                src={guide.image}
                                alt={guide.name}
                                className="h-16 w-16 rounded-2xl object-cover"
                                onError={(event) =>
                                  (event.currentTarget.src = '/images/placeholder.svg')
                                }
                              />
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <h3 className="font-bold text-gray-900">{guide.name}</h3>
                                  {guide.verified && (
                                    <BadgeCheck className="h-4 w-4 text-primary" aria-label="Verified guide" />
                                  )}
                                </div>
                                <p className="text-xs text-gray-500">{guide.role}</p>
                                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-600">
                                  <span className="inline-flex items-center gap-1 font-semibold">
                                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                    {guide.rating.toFixed(1)}
                                    <span className="font-normal text-gray-400">({guide.reviews})</span>
                                  </span>
                                  {guide.cities.length > 0 && (
                                    <span className="inline-flex items-center gap-1">
                                      <MapPin className="h-3.5 w-3.5" /> {guide.cities.join(', ')}
                                    </span>
                                  )}
                                  {guide.languages.length > 0 && (
                                    <span>{guide.languages.join(' · ')}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-gray-700">
                              {guide.spots_left === null
                                ? 'Spots available'
                                : `${guide.spots_left} spot${guide.spots_left === 1 ? '' : 's'} left`}
                            </div>
                          </div>

                          <div className="mt-4 space-y-2">
                            {guide.listings.map((listing) => (
                              <div
                                key={listing.id}
                                className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-slate-50/60 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                              >
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">{listing.title}</p>
                                  <p className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                    <span className="inline-flex items-center gap-1">
                                      <Clock3 className="h-3.5 w-3.5" /> {listing.duration}
                                    </span>
                                    <span className="inline-flex items-center gap-1">
                                      <MapPin className="h-3.5 w-3.5" /> {listing.city}
                                    </span>
                                    <span className="capitalize">{listing.category}</span>
                                  </p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-sm font-bold text-primary">
                                    <Price amount={listing.price} />
                                    <span className="ml-1 text-xs font-normal text-gray-400">/ person</span>
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => choose(guide, listing)}
                                    disabled={checking}
                                    className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary/90 disabled:opacity-60"
                                  >
                                    {checking && selected?.listing.id === listing.id ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <ArrowRight className="h-3.5 w-3.5" />
                                    )}
                                    Select
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* 3 — Finalise the booking */}
              {step === 3 && selected && (
                <section className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8">
                  <h2 className="text-lg font-bold text-gray-900">Confirm your booking</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Check the details below. The guide receives the request as soon as you confirm.
                  </p>

                  <dl className="mt-6 grid gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-gray-500">Date</dt>
                      <dd className="mt-0.5 text-sm font-semibold text-gray-900">{formatDate(date)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-gray-500">Guide</dt>
                      <dd className="mt-0.5 text-sm font-semibold text-gray-900">{selected.guide.name}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-gray-500">Experience</dt>
                      <dd className="mt-0.5 text-sm font-semibold text-gray-900">{selected.listing.title}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-gray-500">Where</dt>
                      <dd className="mt-0.5 text-sm font-semibold text-gray-900">
                        {selected.listing.city} · {selected.listing.duration}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-gray-500">Price</dt>
                      <dd className="mt-0.5 text-sm font-semibold text-gray-900">
                        <Price amount={selected.listing.price} /> / person
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-gray-500">Total</dt>
                      <dd className="mt-0.5 text-sm font-bold text-primary">
                        <Price amount={selected.listing.price * guests} />
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Guests
                      </span>
                      <div className="inline-flex items-center gap-3 rounded-xl border border-gray-300 px-2 py-1.5">
                        <button
                          type="button"
                          aria-label="Fewer guests"
                          onClick={() => setGuests((value) => Math.max(1, value - 1))}
                          disabled={guests <= 1}
                          className="rounded-lg p-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="flex min-w-16 items-center justify-center gap-1.5 text-sm font-semibold">
                          <Users className="h-4 w-4 text-gray-400" /> {guests}
                        </span>
                        <button
                          type="button"
                          aria-label="More guests"
                          onClick={() => setGuests((value) => Math.min(maxGuests, value + 1))}
                          disabled={guests >= maxGuests}
                          className="rounded-lg p-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="mt-1.5 text-xs text-gray-500">
                        {selected.guide.spots_left === null
                          ? `Up to ${maxGuests} guests on this experience`
                          : `${selected.guide.spots_left} spot${selected.guide.spots_left === 1 ? '' : 's'} left for this date`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                      >
                        <ArrowLeft className="h-4 w-4" /> Back
                      </button>
                      <button
                        type="button"
                        onClick={confirm}
                        disabled={saving}
                        className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-60"
                      >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                        Confirm booking
                      </button>
                    </div>
                  </div>
                </section>
              )}

              {/* 4 — Confirmation */}
              {step === 4 && selected && (
                <section className="rounded-2xl border border-green-200 bg-white p-8 text-center">
                  <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-green-500" />
                  <h2 className="text-xl font-bold text-gray-900">Booking requested</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Booking <span className="font-mono font-semibold text-gray-700">#{confirmedRef}</span> ·{' '}
                    {formatDate(date)}
                  </p>
                  <div className="mx-auto mt-6 max-w-md rounded-xl bg-slate-50 p-4 text-left text-sm">
                    <p className="font-semibold text-gray-900">{selected.listing.title}</p>
                    <p className="mt-0.5 text-gray-500">
                      with {selected.guide.name} in {selected.listing.city}
                    </p>
                    <p className="mt-2 text-gray-600">
                      {guests} guest{guests === 1 ? '' : 's'} · <Price amount={selected.listing.price * guests} />
                    </p>
                  </div>
                  <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    <Link
                      to="/bookings"
                      className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary/90"
                    >
                      View my bookings <ArrowRight className="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={reset}
                      className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                    >
                      Book another date
                    </button>
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FindGuidePage;
