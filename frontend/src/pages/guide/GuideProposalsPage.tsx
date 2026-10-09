import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { FileText, GitCompareArrows, Plus } from 'lucide-react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { useAuthStore } from '../../store/authStore';
import {
  experienceWorkflowApi,
  type ExperienceChangeRequest,
  type ExperienceProposal,
} from '../../services/experienceWorkflowApi';
import { StatusBadge } from './workflowUi';

/**
 * SOP hub for guides: track new-experience proposals (SOP-GN-EXP-001) and
 * change requests on existing listings (SOP-GN-EXP-002).
 */
const GuideProposalsPage: React.FC = () => {
  const { accessToken, isAuthenticated, user } = useAuthStore();
  const [tab, setTab] = useState<'proposals' | 'changes'>('proposals');
  const [proposals, setProposals] = useState<ExperienceProposal[]>([]);
  const [changes, setChanges] = useState<ExperienceChangeRequest[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken || user?.role !== 'guide') return;
    setLoading(true);
    Promise.all([
      experienceWorkflowApi.listProposals(accessToken),
      experienceWorkflowApi.listChangeRequests(accessToken),
    ])
      .then(([p, c]) => {
        setProposals(p);
        setChanges(c);
        setError('');
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Unable to load workflow items.'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, user?.role]);

  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (user?.role !== 'guide') return <Navigate to="/bookings" replace />;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 font-sans">
      <Header />
      <main className="container mx-auto max-w-6xl flex-grow px-4 py-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Experience proposals</h1>
            <p className="mt-2 text-gray-600">
              Propose brand-new experiences (SOP-GN-EXP-001) or request changes to existing listings
              (SOP-GN-EXP-002). Nothing goes live without an approval from your Regional Manager or
              Content Writer.
            </p>
          </div>
          <Link
            to="/guide/proposals/new"
            className="flex items-center gap-2 rounded-full bg-[#213448] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#1a2a3a]"
          >
            <Plus className="h-4 w-4" /> New proposal
          </Link>
        </div>

        <div className="mt-6 flex w-fit rounded-full border border-gray-200 bg-white p-1 text-sm font-semibold">
          <button
            onClick={() => setTab('proposals')}
            className={`flex items-center gap-2 rounded-full px-4 py-2 ${tab === 'proposals' ? 'bg-[#213448] text-white' : 'text-gray-600'}`}
          >
            <FileText className="h-4 w-4" /> New experiences ({proposals.length})
          </button>
          <button
            onClick={() => setTab('changes')}
            className={`flex items-center gap-2 rounded-full px-4 py-2 ${tab === 'changes' ? 'bg-[#213448] text-white' : 'text-gray-600'}`}
          >
            <GitCompareArrows className="h-4 w-4" /> Change requests ({changes.length})
          </button>
        </div>
        {loading ? (
          <p className="mt-8 text-gray-500">Loading...</p>
        ) : error ? (
          <p className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">{error}</p>
        ) : tab === 'proposals' ? (
          proposals.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-10 text-center text-gray-500">
              No proposals yet.{' '}
              <Link to="/guide/proposals/new" className="font-bold text-primary hover:underline">
                Propose a new experience
              </Link>
              .
            </div>
          ) : (
            <div className="mt-8 space-y-4">
              {proposals.map((p) => (
                <Link
                  key={p.id}
                  to={`/guide/proposals/${p.id}`}
                  className="block rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:border-gray-300"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase text-gray-500">
                        {p.category} - {p.city}
                        {p.area ? ` - ${p.area}` : ''}
                      </p>
                      <h2 className="mt-1 text-lg font-bold text-gray-900">{p.title}</h2>
                      <p className="mt-1 text-sm text-gray-600">
                        ${p.price} · {p.duration} · max {p.max_guests} guests
                      </p>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>
                </Link>
              ))}
            </div>
          )
        ) : changes.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-10 text-center text-gray-500">
            No change requests yet. Open a listing from{' '}
            <Link to="/guide/listings" className="font-bold text-primary hover:underline">
              Your experiences
            </Link>{' '}
            and press "Propose change".
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {changes.map((c) => (
              <Link
                key={c.id}
                to={`/guide/change-requests/${c.id}`}
                className="block rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:border-gray-300"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase text-gray-500">
                      {c.change_class} · {c.changes.length} field{c.changes.length === 1 ? '' : 's'}
                    </p>
                    <h2 className="mt-1 text-lg font-bold text-gray-900">
                      {c.listing_title ?? `Listing #${c.listing_id}`}
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">{c.reason}</p>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
              </Link>
            ))}
          </div>
        )}

        <Link to="/guide/dashboard" className="mt-8 inline-block text-sm font-bold text-primary hover:underline">
          Back to dashboard
        </Link>
      </main>
      <Footer />
    </div>
  );
};

export default GuideProposalsPage;

