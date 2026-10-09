import React, { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { useAuthStore } from '../../store/authStore';
import { experienceWorkflowApi } from '../../services/experienceWorkflowApi';

type Form = {
  title: string;
  category: string;
  city: string;
  area: string;
  description: string;
  itinerary: string;
  meeting_point: string;
  duration: string;
  difficulty: string;
  price: string;
  max_guests: string;
  documents: { name: string; url: string }[];
};

const initial: Form = {
  title: '',
  category: 'tour',
  city: 'Kathmandu',
  area: '',
  description: '',
  itinerary: '',
  meeting_point: '',
  duration: '1 day',
  difficulty: 'Easy',
  price: '',
  max_guests: '10',
  documents: [],
};

const input =
  'w-full rounded-xl border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow';

/**
 * Create / edit a new-experience proposal (SOP-GN-EXP-001, form EXP-F-001).
 * Saving keeps it a draft; submitting starts the Regional Manager / Content
 * Writer approval clock.
 */
const GuideProposalFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const editingId = id ? Number(id) : null;
  const navigate = useNavigate();
  const { accessToken, isAuthenticated, user } = useAuthStore();
  const [form, setForm] = useState<Form>(initial);
  const [docName, setDocName] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!accessToken || user?.role !== 'guide' || !editingId) return;
    experienceWorkflowApi
      .getProposal(accessToken, editingId)
      .then((p) =>
        setForm({
          title: p.title,
          category: p.category,
          city: p.city,
          area: p.area ?? '',
          description: p.description,
          itinerary: p.itinerary ?? '',
          meeting_point: p.meeting_point ?? '',
          duration: p.duration,
          difficulty: p.difficulty,
          price: String(p.price),
          max_guests: String(p.max_guests),
          documents: p.documents ?? [],
        }),
      )
      .catch(() => setError('Unable to load proposal.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, user?.role, editingId]);

  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (user?.role !== 'guide') return <Navigate to="/bookings" replace />;

  const set = (key: keyof Form, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    if (form.title.trim().length < 3) return 'Title must be at least 3 characters.';
    if (form.city.trim().length < 2) return 'City is required.';
    if (form.description.trim().length < 10) return 'Description must be at least 10 characters.';
    if (!form.duration.trim()) return 'Duration is required.';
    if (Number(form.price) < 0 || form.price === '') return 'Price is required.';
    const guests = Number(form.max_guests);
    if (!Number.isInteger(guests) || guests < 1 || guests > 100)
      return 'Max guests must be a whole number between 1 and 100.';
    return null;
  };

  const payload = () => ({
    title: form.title.trim(),
    category: form.category,
    city: form.city.trim(),
    area: form.area.trim() || null,
    description: form.description.trim(),
    itinerary: form.itinerary.trim() || null,
    meeting_point: form.meeting_point.trim() || null,
    duration: form.duration.trim(),
    difficulty: form.difficulty.trim(),
    price: Number(form.price),
    max_guests: Number(form.max_guests),
    documents: form.documents,
  });

  const save = async (thenSubmit: boolean) => {
    if (!accessToken) return;
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setSaving(true);
    setError('');
    try {
      const saved = editingId
        ? await experienceWorkflowApi.updateProposal(accessToken, editingId, payload())
        : await experienceWorkflowApi.createProposal(accessToken, payload());
      if (thenSubmit) {
        const submitted = await experienceWorkflowApi.submitProposal(accessToken, saved.id);
        navigate(`/guide/proposals/${submitted.id}`);
      } else {
        navigate(`/guide/proposals/${saved.id}`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to save proposal.');
    } finally {
      setSaving(false);
    }
  };

  const addDocument = () => {
    if (!docName.trim() || !docUrl.trim()) return;
    setForm((f) => ({ ...f, documents: [...f.documents, { name: docName.trim(), url: docUrl.trim() }] }));
    setDocName('');
    setDocUrl('');
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 font-sans">
      <Header />
      <main className="container mx-auto max-w-3xl flex-grow px-4 py-10">
        <Link to="/guide/proposals" className="flex items-center gap-1 text-sm font-bold text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to proposals
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">
          {editingId ? 'Edit proposal' : 'Propose a new experience'}
        </h1>
        <p className="mt-2 text-gray-600">
          This is form EXP-F-001 (SOP-GN-EXP-001). Save it as a draft, or submit it straight to your
          Regional Manager / Content Writer for approval.
        </p>

        <div className="mt-6 space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold text-gray-700">
              Title *
              <input className={input} value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Sunrise kayak on Phewa Lake" />
            </label>
            <label className="text-sm font-semibold text-gray-700">
              Category *
              <select className={input} value={form.category} onChange={(e) => set('category', e.target.value)}>
                <option value="tour">Tour</option>
                <option value="trekking">Trekking</option>
                <option value="specialized">Specialized</option>
              </select>
            </label>
            <label className="text-sm font-semibold text-gray-700">
              City *
              <input className={input} value={form.city} onChange={(e) => set('city', e.target.value)} />
            </label>
            <label className="text-sm font-semibold text-gray-700">
              Finer area
              <input className={input} value={form.area} onChange={(e) => set('area', e.target.value)} placeholder="Annapurna Circuit" />
            </label>
          </div>

          <label className="block text-sm font-semibold text-gray-700">
            Description * (what guests do)
            <textarea className={`${input} min-h-28`} value={form.description} onChange={(e) => set('description', e.target.value)} />
          </label>
          <label className="block text-sm font-semibold text-gray-700">
            Itinerary / run-sheet
            <textarea className={`${input} min-h-24`} value={form.itinerary} onChange={(e) => set('itinerary', e.target.value)} placeholder="05:00 meet at the boathouse…" />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold text-gray-700">
              Meeting point
              <input className={input} value={form.meeting_point} onChange={(e) => set('meeting_point', e.target.value)} />
            </label>
            <label className="text-sm font-semibold text-gray-700">
              Duration *
              <input className={input} value={form.duration} onChange={(e) => set('duration', e.target.value)} placeholder="3 hours" />
            </label>
            <label className="text-sm font-semibold text-gray-700">
              Difficulty *
              <select className={input} value={form.difficulty} onChange={(e) => set('difficulty', e.target.value)}>
                <option>Easy</option>
                <option>Moderate</option>
                <option>Challenging</option>
                <option>Strenuous</option>
              </select>
            </label>
            <label className="text-sm font-semibold text-gray-700">
              Price per guest (USD) *
              <input className={input} type="number" min={0} value={form.price} onChange={(e) => set('price', e.target.value)} />
            </label>
            <label className="text-sm font-semibold text-gray-700">
              Max guests (1–100) *
              <input className={input} type="number" min={1} max={100} value={form.max_guests} onChange={(e) => set('max_guests', e.target.value)} />
            </label>
          </div>

          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-sm font-semibold text-gray-700">Supporting documents (risk brief, pricing sheet, licences…)</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {form.documents.map((d, i) => (
                <span key={`${d.url}-${i}`} className="flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700 ring-1 ring-gray-200">
                  {d.name}
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, documents: f.documents.filter((_, idx) => idx !== i) }))}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <input className="w-48 rounded-xl border border-gray-300 p-2 text-sm" placeholder="Document name" value={docName} onChange={(e) => setDocName(e.target.value)} />
              <input className="min-w-56 flex-1 rounded-xl border border-gray-300 p-2 text-sm" placeholder="https://…" value={docUrl} onChange={(e) => setDocUrl(e.target.value)} />
              <button type="button" onClick={addDocument} className="rounded-full bg-gray-200 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-300">
                Attach
              </button>
            </div>
          </div>

          {error && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</p>}

          <div className="flex flex-wrap gap-3 pt-2">
            <button onClick={() => save(false)} disabled={saving} className="rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-bold text-gray-800 hover:bg-gray-100 disabled:opacity-60">
              {saving ? 'Saving…' : 'Save draft'}
            </button>
            <button onClick={() => save(true)} disabled={saving} className="rounded-full bg-[#213448] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#1a2a3a] disabled:opacity-60">
              {saving ? 'Submitting…' : 'Submit for approval'}
            </button>
          </div>
          <p className="text-xs text-gray-500">
            Submitting starts the approval clock: acknowledgment within 1 business day, decision within
            5 business days (SOP-GN-EXP-001 §9).
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GuideProposalFormPage;
