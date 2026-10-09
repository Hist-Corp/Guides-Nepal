import React, { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { useAuthStore } from '../../store/authStore';
import { experienceWorkflowApi, type ExperienceChangeRequest } from '../../services/experienceWorkflowApi';
import { StatusBadge } from './workflowUi';

const fmt = (v: unknown) =>
  v === null || v === undefined || v === '' ? '—' : typeof v === 'boolean' ? (v ? 'active' : 'paused') : String(v);

/** Change-request detail: current → proposed diff + SOP-GN-EXP-002 gate actions. */
const GuideChangeRequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const crId = Number(id);
  const { accessToken, isAuthenticated, user } = useAuthStore();
  const [cr, setCr] = useState<ExperienceChangeRequest | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!accessToken) return;
    try {
      setCr(await experienceWorkflowApi.getChangeRequest(accessToken, crId));
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load change request.');
    }
  };

  useEffect(() => {
    if (accessToken && user?.role === 'guide') load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, user?.role, crId]);

  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (user?.role !== 'guide') return <Navigate to="/bookings" replace />;

  const act = async (fn: (token: string, id: number) => Promise<unknown>) => {
    if (!accessToken) return;
    setBusy(true);
    setError('');
    try {
      setCr((await fn(accessToken, crId)) as ExperienceChangeRequest);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action failed.');
    } finally {
      setBusy(false);
    }
  };

  const editable = cr && ['draft', 'changes_requested'].includes(cr.status);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 font-sans">
      <Header />
      <main className="container mx-auto max-w-4xl flex-grow px-4 py-10">
        <Link to="/guide/proposals" className="flex items-center gap-1 text-sm font-bold text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to proposals
        </Link>
        {!cr ? (
          <p className="mt-8 text-gray-500">{error || 'Loading...'}</p>
        ) : (
          <>
            <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase text-gray-500">
                  Change request #{cr.id} · {cr.change_class} · {cr.changes.length} field
                  {cr.changes.length === 1 ? '' : 's'}
                </p>
                <h1 className="mt-1 text-3xl font-bold text-gray-900">
                  {cr.listing_title ?? `Listing #${cr.listing_id}`}
                </h1>
                <p className="mt-1 text-gray-600">{cr.reason}</p>
              </div>
              <StatusBadge status={cr.status} />
            </div>

            {error && (
              <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</p>
            )}


            <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="font-bold text-gray-900">Proposed changes (current → proposed)</h2>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-gray-500">
                      <th className="p-2">Field</th>
                      <th className="p-2">Current</th>
                      <th className="p-2">Proposed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cr.changes.map((c) => (
                      <tr key={c.field} className="border-b last:border-0">
                        <td className="p-2 font-bold capitalize text-gray-800">{c.field.replace('_', ' ')}</td>
                        <td className="p-2 text-gray-500 break-words">{fmt(c.current)}</td>
                        <td className="p-2 font-semibold text-gray-900 break-words">{fmt(c.proposed)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mt-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="font-bold text-gray-900">Approval timeline</h2>
              <ul className="mt-2 space-y-1 text-sm text-gray-700">
                <li>Submitted: {cr.submitted_at ? new Date(cr.submitted_at).toLocaleString() : 'not yet'}</li>
                <li>
                  Decision: {cr.decided_at ? new Date(cr.decided_at).toLocaleString() : 'pending'}
                  {cr.decided_by_role ? ` (by ${cr.decided_by_role})` : ''}
                </li>
                <li>Applied: {cr.applied_at ? new Date(cr.applied_at).toLocaleString() : 'not yet'}</li>
              </ul>
              {cr.decision_notes && (
                <p className="mt-3 rounded-xl bg-gray-50 p-3 text-sm text-gray-700">
                  <span className="font-bold">Regional Manager notes:</span> {cr.decision_notes}
                </p>
              )}
            </section>

            <div className="mt-6 flex flex-wrap gap-3">
              {editable && (
                <button
                  disabled={busy}
                  onClick={() => act(experienceWorkflowApi.submitChangeRequest)}
                  className="rounded-full bg-[#213448] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#1a2a3a] disabled:opacity-60"
                >
                  {cr.status === 'changes_requested' ? 'Resubmit for approval' : 'Submit for approval'}
                </button>
              )}
              {cr.status === 'submitted' && (
                <button
                  disabled={busy}
                  onClick={() => act(experienceWorkflowApi.withdrawChangeRequest)}
                  className="rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-bold text-gray-800 hover:bg-gray-100 disabled:opacity-60"
                >
                  Withdraw
                </button>
              )}
              {cr.status === 'approved' && (
                <button
                  disabled={busy}
                  onClick={() => act(experienceWorkflowApi.applyChangeRequest)}
                  className="rounded-full bg-green-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-60"
                >
                  Apply approved change
                </button>
              )}
              <Link
                to={`/guide/listings/${cr.listing_id}/edit`}
                className="rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-bold text-gray-800 hover:bg-gray-100"
              >
                Open listing
              </Link>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default GuideChangeRequestDetailPage;
