import React, { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil } from 'lucide-react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { useAuthStore } from '../../store/authStore';
import { experienceWorkflowApi, type ExperienceProposal } from '../../services/experienceWorkflowApi';
import { StatusBadge } from './workflowUi';

/** Proposal detail: SOP-GN-EXP-001 status timeline + gate actions. */
const GuideProposalDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const proposalId = Number(id);
  const { accessToken, isAuthenticated, user } = useAuthStore();
  const [proposal, setProposal] = useState<ExperienceProposal | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!accessToken) return;
    try {
      setProposal(await experienceWorkflowApi.getProposal(accessToken, proposalId));
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load proposal.');
    }
  };

  useEffect(() => {
    if (accessToken && user?.role === 'guide') load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, user?.role, proposalId]);

  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (user?.role !== 'guide') return <Navigate to="/bookings" replace />;

  const act = async (
    fn: (token: string, id: number) => Promise<unknown>,
    after?: (p: ExperienceProposal) => void,
  ) => {
    if (!accessToken) return;
    setBusy(true);
    setError('');
    try {
      const updated = (await fn(accessToken, proposalId)) as ExperienceProposal;
      setProposal(updated);
      after?.(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action failed.');
    } finally {
      setBusy(false);
    }
  };

  const editable = proposal && ['draft', 'changes_requested'].includes(proposal.status);


  return (
    <div className="flex min-h-screen flex-col bg-gray-50 font-sans">
      <Header />
      <main className="container mx-auto max-w-4xl flex-grow px-4 py-10">
        <Link to="/guide/proposals" className="flex items-center gap-1 text-sm font-bold text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to proposals
        </Link>
        {!proposal ? (
          <p className="mt-8 text-gray-500">{error || 'Loading...'}</p>
        ) : (
          <>
            <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase text-gray-500">
                  Proposal #{proposal.id} · {proposal.category} · {proposal.city}
                </p>
                <h1 className="mt-1 text-3xl font-bold text-gray-900">{proposal.title}</h1>
                <p className="mt-1 text-gray-600">
                  ${proposal.price} · {proposal.duration} · {proposal.difficulty} · max{' '}
                  {proposal.max_guests} guests
                </p>
              </div>
              <StatusBadge status={proposal.status} />
            </div>

            {error && (
              <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</p>
            )}

            <section className="mt-6 space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div>
                <h2 className="font-bold text-gray-900">Description</h2>
                <p className="mt-1 text-sm whitespace-pre-line text-gray-700">{proposal.description}</p>
              </div>
              {proposal.itinerary && (
                <div>
                  <h2 className="font-bold text-gray-900">Itinerary</h2>
                  <p className="mt-1 text-sm whitespace-pre-line text-gray-700">{proposal.itinerary}</p>
                </div>
              )}
              {proposal.meeting_point && (
                <p className="text-sm text-gray-700">
                  <span className="font-bold text-gray-900">Meeting point:</span> {proposal.meeting_point}
                </p>
              )}
              {proposal.documents.length > 0 && (
                <div>
                  <h2 className="font-bold text-gray-900">Attached documents</h2>
                  <ul className="mt-1 list-inside list-disc text-sm text-gray-700">
                    {proposal.documents.map((d, i) => (
                      <li key={`${d.url}-${i}`}>
                        <a href={d.url} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                          {d.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            <section className="mt-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="font-bold text-gray-900">Approval timeline</h2>
              <ul className="mt-2 space-y-1 text-sm text-gray-700">
                <li>Created: {proposal.created_at ? new Date(proposal.created_at).toLocaleString() : '—'}</li>
                <li>Submitted: {proposal.submitted_at ? new Date(proposal.submitted_at).toLocaleString() : 'not yet'}</li>
                <li>
                  Decision: {proposal.decided_at ? new Date(proposal.decided_at).toLocaleString() : 'pending'}
                  {proposal.decided_by_role ? ` (by ${proposal.decided_by_role})` : ''}
                </li>
                {proposal.listing_id && (
                  <li>
                    Listing:{' '}
                    <Link to={`/guide/listings/${proposal.listing_id}/edit`} className="font-bold text-primary hover:underline">
                      #{proposal.listing_id}
                    </Link>
                  </li>
                )}
              </ul>
              {proposal.decision_notes && (
                <p className="mt-3 rounded-xl bg-gray-50 p-3 text-sm text-gray-700">
                  <span className="font-bold">Approver notes:</span> {proposal.decision_notes}
                </p>
              )}
            </section>

            <div className="mt-6 flex flex-wrap gap-3">
              {editable && (
                <>
                  <Link
                    to={`/guide/proposals/${proposal.id}/edit`}
                    className="flex items-center gap-1 rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-bold text-gray-800 hover:bg-gray-100"
                  >
                    <Pencil className="h-4 w-4" /> Edit
                  </Link>
                  <button
                    disabled={busy}
                    onClick={() => act(experienceWorkflowApi.submitProposal)}
                    className="rounded-full bg-[#213448] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#1a2a3a] disabled:opacity-60"
                  >
                    {proposal.status === 'changes_requested' ? 'Resubmit for approval' : 'Submit for approval'}
                  </button>
                </>
              )}
              {proposal.status === 'submitted' && (
                <button
                  disabled={busy}
                  onClick={() => act(experienceWorkflowApi.withdrawProposal)}
                  className="rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-bold text-gray-800 hover:bg-gray-100 disabled:opacity-60"
                >
                  Withdraw
                </button>
              )}
              {proposal.status === 'approved' && (
                <button
                  disabled={busy}
                  onClick={() => act(experienceWorkflowApi.publishProposal, (p) => setProposal(p))}
                  className="rounded-full bg-green-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-60"
                >
                  Publish experience
                </button>
              )}
              {proposal.status === 'published' && proposal.listing_id && (
                <Link
                  to={`/guide/listings/${proposal.listing_id}/edit`}
                  className="rounded-full bg-brand-yellow px-5 py-2.5 text-sm font-bold text-[#213448] hover:bg-[#E5A800]"
                >
                  Manage live listing
                </Link>
              )}
              {(proposal.status === 'draft' || proposal.status === 'changes_requested') && (
                <Link
                  to="/guide/proposals/new"
                  className="rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-bold text-gray-800 hover:bg-gray-100"
                >
                  New proposal
                </Link>
              )}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default GuideProposalDetailPage;
