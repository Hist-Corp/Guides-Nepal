import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Pencil, Plus, Trash2, Users } from 'lucide-react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { useAuthStore } from '../../store/authStore';
import { guideDashboardApi, type GuideListing } from '../../services/guideDashboardApi';

/** Full CRUD table for a guide's own listings + inline max-guest capacity edits. */
const GuideListingsPage: React.FC = () => {
  const { accessToken, isAuthenticated, user } = useAuthStore();
  const [listings, setListings] = useState<GuideListing[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [capEdits, setCapEdits] = useState<Record<number, string>>({});

  const load = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      setListings(await guideDashboardApi.listListings(accessToken));
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken && user?.role === 'guide') load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, user?.role]);

  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (user?.role !== 'guide') return <Navigate to="/bookings" replace />;

  const remove = async (id: number) => {
    if (!accessToken || !window.confirm('Remove this listing?')) return;
    try {
      await guideDashboardApi.deleteListing(accessToken, id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to delete listing.');
    }
  };

  const saveCapacity = async (id: number) => {
    if (!accessToken) return;
    const raw = capEdits[id];
    const max = Number(raw);
    if (!Number.isInteger(max) || max < 1 || max > 100) {
      setError('Max guests must be a whole number between 1 and 100.');
      return;
    }
    try {
      await guideDashboardApi.updateCapacity(accessToken, id, { max_guests: max });
      setCapEdits((c) => ({ ...c, [id]: '' }));
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to update capacity.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 font-sans">
      <Header />
      <main className="container mx-auto max-w-6xl flex-grow px-4 py-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your experiences</h1>
            <p className="mt-2 text-gray-600">List treks, tours and activities — each with its own max guest capacity.</p>
          </div>
          <Link to="/guide/listings/new" className="flex items-center gap-2 rounded-full bg-[#213448] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#1a2a3a]">
            <Plus className="h-4 w-4" /> New listing
          </Link>
        </div>
        {loading ? (
          <p className="mt-8 text-gray-500">Loading listings...</p>
        ) : error ? (
          <p className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">{error}</p>
        ) : listings.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-10 text-center text-gray-500">
            No listings yet. Create your first trek, tour or specialized activity.
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {listings.map((l) => (
              <article key={l.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase text-gray-500">{l.category} - {l.city}{l.area ? ` - ${l.area}` : ''}</p>
                    <h2 className="mt-1 text-lg font-bold text-gray-900">{l.title}</h2>
                    <p className="mt-1 flex items-center gap-1 text-sm text-gray-600"><Users className="h-4 w-4" />{l.booked_guests}/{l.max_guests} guests - {l.available_spots} spots left - ${l.price}</p>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/guide/listings/${l.id}/edit`} className="flex items-center gap-1 rounded-full border border-gray-300 px-4 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-100">
                      <Pencil className="h-3 w-3" /> Edit
                    </Link>
                    <button onClick={() => remove(l.id)} className="flex items-center gap-1 rounded-full bg-red-50 px-4 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100">
                      <Trash2 className="h-3 w-3" /> Remove
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <input
                    type="number" min={1} max={100} placeholder={`Max guests (now ${l.max_guests})`}
                    value={capEdits[l.id] ?? ''} onChange={(e) => setCapEdits((c) => ({ ...c, [l.id]: e.target.value }))}
                    className="w-48 rounded-xl border border-gray-300 p-2 text-sm"
                  />
                  <button onClick={() => saveCapacity(l.id)} className="rounded-full bg-brand-yellow px-4 py-2 text-xs font-bold text-[#213448] hover:bg-[#E5A800]">Save capacity</button>
                </div>
              </article>
            ))}
          </div>
        )}
        <Link to="/guide/dashboard" className="mt-8 inline-block text-sm font-bold text-primary hover:underline">Back to dashboard</Link>
      </main>
      <Footer />
    </div>
  );
};

export default GuideListingsPage;
