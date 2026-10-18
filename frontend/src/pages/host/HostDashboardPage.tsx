import React, { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import {
  Home,
  CalendarDays,
  Wallet,
  Star,
  ExternalLink,
  Settings,
  LogOut,
  Info,
} from 'lucide-react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { useAuthStore } from '../../store/authStore';

/**
 * Host Frontend home after a unified login.
 *
 * Host accounts only exist once a regional head or admin approves the
 * registration, so reaching this page means the applicant is already
 * approved. The same credentials also unlock the Host Dashboard on the
 * dashboard origin.
 */
const HostDashboardPage: React.FC = () => {
  const { isAuthenticated, user, logout, accessToken } = useAuthStore();
  const [approval, setApproval] = useState<{
    status: string;
    reviewed_by?: string | null;
    reviewed_at?: string | null;
  } | null>(null);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'host' || !accessToken) return;
    fetch('/api/v1/operations/host/me/application', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setApproval(data);
      })
      .catch(() => {
        /* offline / not provisioned — show generic welcome */
      });
  }, [isAuthenticated, user?.role, accessToken]);

  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (user?.role !== 'host') return <Navigate to="/" replace />;

  const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Host';

  const cards = [
    {
      icon: Home,
      title: 'My Experiences',
      description: 'Create and manage the experiences you offer to travelers.',
      to: '/host/experiences',
    },
    {
      icon: CalendarDays,
      title: 'Bookings',
      description: 'Review, accept, and track upcoming and past bookings.',
      to: '/host/bookings',
    },
    {
      icon: Wallet,
      title: 'Earnings',
      description: 'See your payout history and pending settlements.',
      to: '/host/earnings',
    },
    {
      icon: Settings,
      title: 'Host Settings',
      description: 'Update your profile, regions, and account preferences.',
      to: '/host/settings',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50">
        <section className="bg-primary py-14 text-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-wide text-white/70">Host account</p>
                <h1 className="text-3xl md:text-4xl font-bold mt-1">Welcome, {name}</h1>
                <p className="mt-2 text-white/80 max-w-2xl">
                  Manage your experiences, bookings, and payouts. You can also open the full Host
                  Dashboard for advanced tools.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/host-center"
                  className="inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/25 transition-colors"
                >
                  <Info className="w-4 h-4" /> Host Center
                </Link>
                <a
                  href="http://localhost:5176/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-brand-yellow px-5 py-2.5 text-sm font-bold text-[#213448] hover:bg-[#E5A800] transition-colors"
                >
                  <ExternalLink className="w-4 h-4" /> Open Dashboard
                </a>
                <button
                  onClick={logout}
                  className="inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/25 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Log out
                </button>
              </div>
            </div>
          </div>
        </section>
        <section className="container mx-auto px-4 py-12">
          {approval && approval.status === 'approved' && (
            <div className="mb-8 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-800">
              <p className="font-bold flex items-center gap-2">
                <Star className="w-4 h-4" /> Approved
                {approval.reviewed_by ? ` by ${approval.reviewed_by}` : ''}
              </p>
              {approval.reviewed_at && (
                <p className="mt-1 text-sm">
                  Approved on {new Date(approval.reviewed_at).toLocaleDateString()}
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card) => (
              <Link
                key={card.to}
                to={card.to}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-primary hover:shadow-md transition-all"
              >
                <card.icon className="w-8 h-8 text-primary mb-3" />
                <h2 className="font-bold text-lg text-slate-900 mb-1">{card.title}</h2>
                <p className="text-slate-600 text-sm">{card.description}</p>
              </Link>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
              <Info className="w-5 h-5 text-primary" /> Unified sign-in
            </h2>
            <p className="mt-2 text-slate-600 text-sm">
              This is the Host Frontend. The same email and password you use here also signs you
              into the Host Dashboard at{' '}
              <a
                href="http://localhost:5176/dashboard"
                target="_blank"
                rel="noreferrer"
                className="font-bold text-primary hover:underline"
              >
                the dashboard
              </a>
              . Both are unlocked the moment a regional manager approves your registration.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HostDashboardPage;
