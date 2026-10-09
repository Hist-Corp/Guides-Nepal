import React, { useCallback, useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Calendar, MapPin, Megaphone, Plus, Users, Compass } from 'lucide-react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { useAuthStore } from '../../store/authStore';
import { getApiUrl } from '../../config/api';
import {
  guideDashboardApi,
  type GuideDashboardPayload,
  type GuideStatusItem,
} from '../../services/guideDashboardApi';

interface GuideBooking {
  id: number;
  experience_title: string;
  city: string;
  date: string;
  guests: number;
  price: number;
  status: string;
  traveler_name: string;
  traveler_email: string;
}

const UPDATE_TYPES = ['availability', 'capacity', 'booking', 'schedule', 'announcement'] as const;


/** Post-login home for guides: stats, live bookings, capacity + status feed. */
const GuideDashboardPage: React.FC = () => {
  const { accessToken, isAuthenticated, user } = useAuthStore();
  const [data, setData] = useState<GuideDashboardPayload | null>(null);
  const [bookings, setBookings] = useState<GuideBooking[]>([]);
  const [statusText, setStatusText] = useState('');
  const [statusType, setStatusType] = useState<string>('availability');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError('');
    try {
      const [dash, rows] = await Promise.all([
        guideDashboardApi.getDashboard(accessToken),
        fetch(getApiUrl('/guide/bookings'), { headers: { Authorization: `Bearer ${accessToken}` } }).then(
          async (r) => {
            if (!r.ok) throw new Error('Unable to load bookings.');
            return (await r.json()) as GuideBooking[];
          },
        ),
      ]);
      setData(dash);
      setBookings(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load dashboard.');
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (accessToken && user?.role === 'guide') load();
  }, [accessToken, user?.role, load]);

  useEffect(() => {
    if (!accessToken || user?.role !== 'guide') return;
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [accessToken, user?.role, load]);

  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (user?.role !== 'guide') return <Navigate to="/bookings" replace />;

  const postUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !statusText.trim()) return;
    setPosting(true);
    try {
      await guideDashboardApi.postStatus(accessToken, { update_type: statusType, message: statusText.trim() });
      setStatusText('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to post update.');
    } finally {
      setPosting(false);
    }
  };

  const decide = async (id: number, status: string) => {
    if (!accessToken) return;
    try {
      await guideDashboardApi.decideBooking(accessToken, id, status);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update booking.');
    }
  };

  const stats = data?.stats;
  const cards = [
    { label: 'Live listings', value: stats?.listings ?? 0 },
    { label: 'Upcoming bookings', value: stats?.upcoming_bookings ?? 0 },
    { label: 'Guests booked', value: stats?.total_guests ?? 0 },
    { label: 'Spots left', value: stats?.available_spots ?? 0 },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 font-sans">
      <Header />
      <main className="container mx-auto max-w-6xl flex-grow px-4 py-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Namaste, {user?.firstName ?? 'Guide'}</h1>
            <p className="mt-2 text-gray-600">Post live updates, manage capacity and handle bookings.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/guide/proposals" className="rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-bold text-gray-800 hover:bg-gray-100">Proposals</Link>
            <Link to="/guide/onboarding" className="rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-bold text-gray-800 hover:bg-gray-100">Edit onboarding</Link>
            <Link to="/guide/listings/new" className="flex items-center gap-2 rounded-full bg-[#213448] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#1a2a3a]">
              <Plus className="h-4 w-4" /> New listing
            </Link>
          </div>
        </div>
        {loading ? (
          <p className="mt-8 text-gray-500">Loading dashboard...</p>
        ) : error ? (
          <p className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">{error}</p>
        ) : (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {cards.map((c) => (
                <div key={c.label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <p className="text-3xl font-bold text-gray-900">{c.value}</p>
                  <p className="mt-1 text-sm text-gray-500">{c.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
                <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900"><Calendar className="h-5 w-5" /> Live booking requests</h2>
                {bookings.length === 0 ? (
                  <p className="mt-4 text-gray-500">No booking requests yet.</p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {bookings.slice(0, 6).map((b) => (
                      <article key={b.id} className="rounded-xl border border-gray-100 p-4">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <h3 className="font-bold text-gray-900">{b.experience_title}</h3>
                            <p className="mt-1 text-sm text-gray-600">{b.traveler_name} - {b.traveler_email}</p>
                            <p className="mt-2 flex flex-wrap gap-3 text-sm text-gray-500">
                              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{b.city}</span>
                              <span>{new Date(b.date).toLocaleDateString()}</span>
                              <span className="flex items-center gap-1"><Users className="h-4 w-4" />{b.guests}</span>
                            </p>
                          </div>
                          <span className="rounded-full bg-brand-yellow/20 px-3 py-1 text-xs font-bold capitalize text-gray-700">{b.status}</span>
                        </div>
                        {b.status === 'upcoming' && (
                          <div className="mt-3 flex gap-2">
                            <button onClick={() => decide(b.id, 'accepted')} className="rounded-full bg-green-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-green-700">Accept</button>
                            <button onClick={() => decide(b.id, 'rejected')} className="rounded-full bg-red-100 px-4 py-1.5 text-xs font-bold text-red-700 hover:bg-red-200">Decline</button>
                          </div>
                        )}
                        {b.status === 'accepted' && (
                          <button onClick={() => decide(b.id, 'completed')} className="mt-3 rounded-full bg-gray-900 px-4 py-1.5 text-xs font-bold text-white hover:bg-black">Mark completed</button>
                        )}
                      </article>
                    ))}
                  </div>
                )}
                <Link to="/guide/bookings" className="mt-4 inline-block text-sm font-bold text-primary hover:underline">View all bookings</Link>
              </section>
              <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900"><Megaphone className="h-5 w-5" /> Post a live update</h2>
                <form onSubmit={postUpdate} className="mt-4 space-y-3">
                  <select value={statusType} onChange={(e) => setStatusType(e.target.value)} className="w-full rounded-xl border border-gray-300 p-3 text-sm">
                    {UPDATE_TYPES.map((t) => (<option key={t} value={t}>{t}</option>))}
                  </select>
                  <textarea value={statusText} onChange={(e) => setStatusText(e.target.value)} placeholder="e.g. 4 spots left for Oct 20!" className="min-h-24 w-full rounded-xl border border-gray-300 p-3 text-sm" />
                  <button type="submit" disabled={posting || !statusText.trim()} className="w-full rounded-full bg-brand-yellow py-3 text-sm font-bold text-[#213448] hover:bg-[#E5A800] disabled:opacity-60">
                    {posting ? 'Posting...' : 'Post update'}
                  </button>
                </form>
                <div className="mt-5 space-y-2">
                  {(data?.recent_status ?? []).map((s: GuideStatusItem) => (
                    <div key={s.id} className="rounded-xl bg-gray-50 p-3 text-sm">
                      <p className="text-xs font-bold uppercase text-gray-500">{s.update_type}</p>
                      <p className="mt-1 text-gray-800">{s.message}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <section className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900"><Compass className="h-5 w-5" /> Your listings and capacity</h2>
                <Link to="/guide/listings" className="text-sm font-bold text-primary hover:underline">Manage all</Link>
              </div>
              {(data?.listings ?? []).length === 0 ? (
                <p className="mt-4 text-gray-500">No listings yet. <Link to="/guide/listings/new" className="font-bold text-primary hover:underline">List your first experience</Link>.</p>
              ) : (
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {(data?.listings ?? []).slice(0, 4).map((l) => (
                    <div key={l.id} className="rounded-xl border border-gray-100 p-4">
                      <p className="text-xs font-bold uppercase text-gray-500">{l.category} - {l.city}</p>
                      <h3 className="mt-1 font-bold text-gray-900">{l.title}</h3>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
                        <div className="h-full rounded-full bg-brand-yellow" style={{ width: `${Math.min(l.occupancy_pct, 100)}%` }} />
                      </div>
                      <p className="mt-2 text-sm text-gray-600">{l.booked_guests}/{l.max_guests} guests - {l.available_spots} left</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default GuideDashboardPage;

