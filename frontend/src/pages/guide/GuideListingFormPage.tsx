import React, { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { Button } from '../../components/common/Button';
import { useAuthStore } from '../../store/authStore';
import { guideDashboardApi } from '../../services/guideDashboardApi';

type Form = {
  title: string; category: string; city: string; area: string;
  description: string; itinerary: string; meeting_point: string;
  duration: string; difficulty: string; price: string; max_guests: string;
  is_active: boolean;
};

const initial: Form = {
  title: '', category: 'tour', city: 'Kathmandu', area: '',
  description: '', itinerary: '', meeting_point: '',
  duration: '1 day', difficulty: 'Easy', price: '', max_guests: '10',
  is_active: true,
};

const PROCEDURE = [
  'Step 1 - Pick the experience type: trekking route, travel tour, or specialized activity.',
  'Step 2 - Name it and say where it runs (city + finer area, e.g. Annapurna Circuit).',
  'Step 3 - Describe it (what guests do, itinerary, meeting point, duration, difficulty, price).',
  'Step 4 - Set maximum guest capacity (1-100). Booked guests can never exceed it.',
  'Step 5 - Publish. Lowering capacity below booked guests is blocked.',
];


/** Step-by-step listing form: type -> place -> details+capacity -> review -> rules. */
const GuideListingFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const editingId = id ? Number(id) : null;
  const navigate = useNavigate();
  const { accessToken, isAuthenticated, user } = useAuthStore();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>(initial);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!accessToken || user?.role !== 'guide' || !editingId) return;
    guideDashboardApi.listListings(accessToken).then((rows) => {
      const found = rows.find((r) => r.id === editingId);
      if (!found) return;
      setForm({
        title: found.title, category: found.category, city: found.city, area: found.area ?? '',
        description: found.description, itinerary: found.itinerary ?? '', meeting_point: found.meeting_point ?? '',
        duration: found.duration, difficulty: found.difficulty, price: String(found.price),
        max_guests: String(found.max_guests), is_active: found.is_active,
      });
    }).catch(() => undefined);
  }, [accessToken, user?.role, editingId]);

  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (user?.role !== 'guide') return <Navigate to="/bookings" replace />;

  const set = (key: keyof Form, value: string | boolean) => setForm((f) => ({ ...f, [key]: value }));

  const validStep = () => {
    if (step === 1) return form.title.trim().length >= 3 && form.city.trim().length >= 2;
    if (step === 2) return form.description.trim().length >= 10 && form.duration.trim().length >= 1
      && Number(form.price) >= 0 && Number.isInteger(Number(form.max_guests))
      && Number(form.max_guests) >= 1 && Number(form.max_guests) <= 100;
    return true;
  };

  const next = () => {
    if (!validStep()) { setError('Complete this step first.'); return; }
    setError('');
    setStep((s) => Math.min(4, s + 1));
  };

  const submit = async () => {
    if (!accessToken || !validStep()) { setError('Complete all steps before publishing.'); return; }
    setSaving(true);
    setError('');
    try {
      const payload = {
        title: form.title.trim(), category: form.category, city: form.city.trim(),
        area: form.area.trim() || undefined, description: form.description.trim(),
        itinerary: form.itinerary.trim() || undefined, meeting_point: form.meeting_point.trim() || undefined,
        duration: form.duration.trim(), difficulty: form.difficulty.trim(),
        price: Number(form.price), max_guests: Number(form.max_guests), is_active: form.is_active,
      };
      if (editingId) await guideDashboardApi.updateListing(accessToken, editingId, payload);
      else await guideDashboardApi.createListing(accessToken, payload);
      navigate('/guide/listings');
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to save listing.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 font-sans">
      <Header />
      <main className="container mx-auto max-w-4xl flex-grow px-4 py-10">
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <h1 className="text-3xl font-bold text-gray-900">{editingId ? 'Edit listing' : 'List a new experience'}</h1>
        <ol className="mt-6 space-y-1 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
          {PROCEDURE.map((p) => (<li key={p}>{p}</li>))}
        </ol>
        <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          {step === 0 && (
            <div>
              <h2 className="text-xl font-bold">Step 1 - Experience type</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[['trekking', 'Trekking route'], ['tour', 'Travel tour'], ['specialized', 'Specialized activity']].map(([v, label]) => (
                  <button key={v} type="button" onClick={() => set('category', v)}
                    className={`rounded-2xl border-2 p-4 text-left ${form.category === v ? 'border-[#213448] bg-[#213448]/5' : 'border-gray-200'}`}>
                    <p className="font-bold">{label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold">Step 2 - Name and place</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-gray-700">Title
                  <input className="mt-2 w-full rounded-xl border border-gray-300 p-3" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Annapurna sunrise trek" />
                </label>
                <label className="text-sm font-medium text-gray-700">City
                  <input className="mt-2 w-full rounded-xl border border-gray-300 p-3" value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="e.g. Pokhara" />
                </label>
                <label className="text-sm font-medium text-gray-700 sm:col-span-2">Finer area (optional)
                  <input className="mt-2 w-full rounded-xl border border-gray-300 p-3" value={form.area} onChange={(e) => set('area', e.target.value)} placeholder="e.g. Annapurna Circuit" />
                </label>
              </div>
            </div>
          )}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold">Steps 3 and 4 - Details and capacity</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-gray-700">Price per guest (USD)
                  <input type="number" min={0} step="0.01" className="mt-2 w-full rounded-xl border border-gray-300 p-3" value={form.price} onChange={(e) => set('price', e.target.value)} />
                </label>
                <label className="text-sm font-medium text-gray-700">Maximum guests (1-100)
                  <input type="number" min={1} max={100} className="mt-2 w-full rounded-xl border border-gray-300 p-3" value={form.max_guests} onChange={(e) => set('max_guests', e.target.value)} />
                </label>
                <label className="text-sm font-medium text-gray-700">Duration
                  <input className="mt-2 w-full rounded-xl border border-gray-300 p-3" value={form.duration} onChange={(e) => set('duration', e.target.value)} />
                </label>
                <label className="text-sm font-medium text-gray-700">Difficulty
                  <input className="mt-2 w-full rounded-xl border border-gray-300 p-3" value={form.difficulty} onChange={(e) => set('difficulty', e.target.value)} />
                </label>
                <label className="text-sm font-medium text-gray-700 sm:col-span-2">Description (min 10 chars)
                  <textarea className="mt-2 min-h-28 w-full rounded-xl border border-gray-300 p-3" value={form.description} onChange={(e) => set('description', e.target.value)} />
                </label>
                <label className="text-sm font-medium text-gray-700 sm:col-span-2">Itinerary (optional)
                  <textarea className="mt-2 min-h-20 w-full rounded-xl border border-gray-300 p-3" value={form.itinerary} onChange={(e) => set('itinerary', e.target.value)} />
                </label>
                <label className="text-sm font-medium text-gray-700 sm:col-span-2">Meeting point (optional)
                  <input className="mt-2 w-full rounded-xl border border-gray-300 p-3" value={form.meeting_point} onChange={(e) => set('meeting_point', e.target.value)} />
                </label>
              </div>
            </div>
          )}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold">Step 5 - Review and publish</h2>
              <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-xl bg-gray-50 p-4"><b>Type</b><p>{form.category}</p></div>
                <div className="rounded-xl bg-gray-50 p-4"><b>Title</b><p>{form.title || '-'}</p></div>
                <div className="rounded-xl bg-gray-50 p-4"><b>Capacity</b><p>Max {form.max_guests} guests</p></div>
                <div className="rounded-xl bg-gray-50 p-4"><b>Place</b><p>{form.city}</p></div>
              </div>
              <p className="mt-3 rounded-xl bg-gray-50 p-4 text-sm text-gray-600">{form.description || 'No description.'}</p>
            </div>
          )}
          {step === 4 && (
            <div>
              <h2 className="text-xl font-bold">Capacity rules</h2>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-700">
                <li>Capacity is per listing: 1 to 100 guests.</li>
                <li>Lowering below booked guests is blocked (422).</li>
              </ul>
            </div>
          )}
          {error && <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
          <div className="mt-8 flex flex-col-reverse justify-between gap-3 border-t border-gray-200 pt-6 sm:flex-row">
            <Button variant="secondary" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>Back</Button>
            {step < 4 ? (<Button onClick={next}>Continue</Button>) : (
              <Button onClick={submit} disabled={saving}>{saving ? 'Saving...' : editingId ? 'Update listing' : 'Publish listing'}</Button>
            )}
          </div>
        </div>
        <Link to="/guide/listings" className="mt-6 inline-block text-sm font-bold text-primary hover:underline">Back to listings</Link>
      </main>
      <Footer />
    </div>
  );
};

export default GuideListingFormPage;

