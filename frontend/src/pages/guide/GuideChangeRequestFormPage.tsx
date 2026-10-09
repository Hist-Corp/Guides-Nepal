import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { useAuthStore } from '../../store/authStore';
import { guideDashboardApi, type GuideListing } from '../../services/guideDashboardApi';
import { experienceWorkflowApi } from '../../services/experienceWorkflowApi';

const input =
  'w-full rounded-xl border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow';

interface FieldDef {
  key: string;
  label: string;
  kind: 'text' | 'textarea' | 'number' | 'select';
  options?: string[];
}

/** SOP-GN-EXP-002 §7 — fields a change request may touch. */
const FIELDS: FieldDef[] = [
  { key: 'title', label: 'Title', kind: 'text' },
  { key: 'price', label: 'Price per guest (USD)', kind: 'number' },
  { key: 'max_guests', label: 'Max guests', kind: 'number' },
  { key: 'duration', label: 'Duration', kind: 'text' },
  { key: 'difficulty', label: 'Difficulty', kind: 'select', options: ['Easy', 'Moderate', 'Challenging', 'Strenuous'] },
  { key: 'meeting_point', label: 'Meeting point', kind: 'text' },
  { key: 'city', label: 'City', kind: 'text' },
  { key: 'area', label: 'Finer area', kind: 'text' },
  { key: 'category', label: 'Category', kind: 'select', options: ['tour', 'trekking', 'specialized'] },
  { key: 'description', label: 'Description', kind: 'textarea' },
  { key: 'itinerary', label: 'Itinerary', kind: 'textarea' },
];

/**
 * Create a change request for one listing (SOP-GN-EXP-002, form EXP-F-002).
 * The guide picks fields, sees current values, and proposes new ones; the
 * Regional Manager reviews the current → proposed diff before anything is
 * applied to the live listing.
 */
const GuideChangeRequestFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const listingId = Number(id);
  const navigate = useNavigate();
  const { accessToken, isAuthenticated, user } = useAuthStore();
  const [listing, setListing] = useState<GuideListing | null>(null);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!accessToken || user?.role !== 'guide') return;
    guideDashboardApi
      .listListings(accessToken)
      .then((rows) => setListing(rows.find((r) => r.id === listingId) ?? null))
      .catch(() => setError('Unable to load listing.'));
     
  }, [accessToken, user?.role, listingId]);

  const currentValue = (key: string): string => {
    if (!listing) return '';
    const raw = (listing as unknown as Record<string, unknown>)[key];
    return raw === null || raw === undefined ? '' : String(raw);
  };

  const toggle = (key: string) => {
    setSelected((s) => {
      const next = { ...s };
      if (key in next) delete next[key];
      else next[key] = currentValue(key);
      return next;
    });
  };

  const isMaterial = useMemo(
    () => Object.keys(selected).some((k) => k !== 'description'),
    [selected],
  );

  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (user?.role !== 'guide') return <Navigate to="/bookings" replace />;

  const submit = async () => {
    if (!accessToken) return;
    const changes = Object.entries(selected).map(([field, proposed]) => ({
      field,
      proposed: field === 'price' || field === 'max_guests' ? Number(proposed) : proposed,
    }));
    if (changes.length === 0) {
      setError('Pick at least one field to change.');
      return;
    }
    if (reason.trim().length < 5) {
      setError('A short reason is required (5+ characters).');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const cr = await experienceWorkflowApi.createChangeRequest(accessToken, {
        listing_id: listingId,
        reason: reason.trim(),
        changes,
      });
      const submitted = await experienceWorkflowApi.submitChangeRequest(accessToken, cr.id);
      navigate(`/guide/change-requests/${submitted.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to submit change request.');
    } finally {
      setSaving(false);
    }
  };


  return (
    <div className="flex min-h-screen flex-col bg-gray-50 font-sans">
      <Header />
      <main className="container mx-auto max-w-3xl flex-grow px-4 py-10">
        <Link to="/guide/listings" className="flex items-center gap-1 text-sm font-bold text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to your experiences
        </Link>
        {!listing ? (
          <p className="mt-8 text-gray-500">{error || 'Loading listing...'}</p>
        ) : (
          <>
            <h1 className="mt-4 text-3xl font-bold text-gray-900">Propose a change</h1>
            <p className="mt-2 text-gray-600">
              For <span className="font-bold">{listing.title}</span> — form EXP-F-002 (SOP-GN-EXP-002).
              The listing stays unchanged until your Regional Manager approves.
            </p>

            <div className="mt-6 space-y-3 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              {FIELDS.map((f) => {
                const isOn = f.key in selected;
                return (
                  <div key={f.key} className={`rounded-xl border p-4 ${isOn ? 'border-brand-yellow bg-yellow-50/40' : 'border-gray-100'}`}>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" checked={isOn} onChange={() => toggle(f.key)} className="h-4 w-4" />
                      <span className="text-sm font-bold text-gray-800">{f.label}</span>
                      {!isOn && <span className="text-xs text-gray-500">current: {currentValue(f.key) || '—'}</span>}
                    </label>
                    {isOn && (
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="text-xs font-semibold uppercase text-gray-500">Current</p>
                          <p className="mt-1 rounded-lg bg-gray-100 p-2 text-sm break-words text-gray-600">
                            {currentValue(f.key) || '—'}
                          </p>
                        </div>
                        <label className="text-xs font-semibold uppercase text-gray-500">
                          Proposed
                          {f.kind === 'textarea' ? (
                            <textarea className={`${input} mt-1 min-h-24`} value={selected[f.key]} onChange={(e) => setSelected((s) => ({ ...s, [f.key]: e.target.value }))} />
                          ) : f.kind === 'select' ? (
                            <select className={`${input} mt-1`} value={selected[f.key]} onChange={(e) => setSelected((s) => ({ ...s, [f.key]: e.target.value }))}>
                              {f.options?.map((o) => (
                                <option key={o}>{o}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              className={`${input} mt-1`}
                              type={f.kind === 'number' ? 'number' : 'text'}
                              value={selected[f.key]}
                              onChange={(e) => setSelected((s) => ({ ...s, [f.key]: e.target.value }))}
                            />
                          )}
                        </label>
                      </div>
                    )}
                  </div>
                );
              })}

              <label className="block text-sm font-semibold text-gray-700">
                Reason for the change *
                <textarea
                  className={`${input} min-h-20`}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Seasonal price update after fuel costs rose."
                />
              </label>

              <p className="rounded-xl bg-blue-50 p-3 text-xs text-blue-700">
                Classification:{' '}
                <span className="font-bold">{isMaterial ? 'Material' : 'Minor (editorial)'}</span> —
                material changes get a full 3-business-day review; minor edits are fast-tracked within
                1 business day by the Regional Manager.
              </p>

              {error && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</p>}

              <button
                onClick={submit}
                disabled={saving}
                className="w-full rounded-full bg-[#213448] py-3 text-sm font-bold text-white hover:bg-[#1a2a3a] disabled:opacity-60"
              >
                {saving ? 'Submitting…' : 'Submit change request for approval'}
              </button>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default GuideChangeRequestFormPage;
