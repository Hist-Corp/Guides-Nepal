import React, { useCallback, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Wallet, TrendingUp, DollarSign, Clock, Calendar } from 'lucide-react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { useAuthStore } from '../../store/authStore';
import hostApi from '../../services/hostApi';
import type { HostEarnings } from '../../services/hostApi';

const HostEarningsPage: React.FC = () => {
  const { isAuthenticated, user, accessToken } = useAuthStore();
  const [earnings, setEarnings] = useState<HostEarnings>({
    total_earnings: 0,
    pending_earnings: 0,
    completed_bookings: 0,
    upcoming_bookings: 0,
    revenue_this_month: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError('');
    try {
      const data = await hostApi.getEarnings(accessToken);
      setEarnings(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load earnings.');
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (accessToken && user?.role === 'host') load();
  }, [accessToken, user?.role, load]);

  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (user?.role !== 'host') return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />
      <main className="flex-grow container mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Earnings</h1>
          <p className="mt-1 text-gray-600 text-sm">See your payout history and pending settlements.</p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4 mb-8">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase text-gray-500">Total earnings</p>
                <p className="text-3xl font-bold text-gray-900">{earnings.total_earnings}</p>
              </div>
              <div className="rounded-full bg-green-100 p-2">
                <Wallet className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500">Lifetime completed bookings</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase text-gray-500">Pending payouts</p>
                <p className="text-3xl font-bold text-gray-900">{earnings.pending_earnings}</p>
              </div>
              <div className="rounded-full bg-brand-yellow/20 p-2">
                <Clock className="w-5 h-5 text-[#213448]" />
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500">Accepted bookings awaiting completion</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase text-gray-500">This month</p>
                <p className="text-3xl font-bold text-gray-900">{earnings.revenue_this_month}</p>
              </div>
              <div className="rounded-full bg-blue-100 p-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500">Revenue from completed bookings</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase text-gray-500">Completed bookings</p>
                <p className="text-3xl font-bold text-gray-900">{earnings.completed_bookings}</p>
              </div>
              <div className="rounded-full bg-gray-100 p-2">
                <TrendingUp className="w-5 h-5 text-gray-500" />
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500">Total successful experiences</p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
              <Calendar className="w-5 h-5 text-[#213448]" />
              Upcoming bookings
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {earnings.upcoming_bookings} booking(s) awaiting your confirmation
            </p>
          </div>
          <div className="p-6 text-center text-gray-500">
            Upcoming bookings will appear here once travelers book your experiences.
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HostEarningsPage;
