import React, { useCallback, useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Calendar, MapPin, Users, CreditCard, Clock } from 'lucide-react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { useAuthStore } from '../../store/authStore';
import hostApi from '../../services/hostApi';
import type { HostBooking } from '../../services/hostApi';

type TabKey = 'all' | 'upcoming' | 'accepted' | 'rejected' | 'completed';

const TABS: TabKey[] = ['all', 'upcoming', 'accepted', 'rejected', 'completed'];

const HostBookingsPage: React.FC = () => {
  const { isAuthenticated, user, accessToken, logout } = useAuthStore();
  const [bookings, setBookings] = useState<HostBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabKey>('all');

  const load = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError('');
    try {
      const data = await hostApi.getBookings(accessToken);
      setBookings(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load bookings.');
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (accessToken && user?.role === 'host') load();
  }, [accessToken, user?.role, load]);

  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (user?.role !== 'host') return <Navigate to="/" replace />;

  const filtered = bookings.filter(
    (b) => activeTab === 'all' || b.status === activeTab
  );

  const decide = async (id: number, status: 'accepted' | 'rejected' | 'completed') => {
    try {
      await hostApi.decideBooking(accessToken!, id, status);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to update booking.');
    }
  };

  const statusColor = (status: string): string => {
    switch (status) {
      case 'upcoming':
        return 'bg-brand-yellow/20 text-[#213448]';
      case 'accepted':
        return 'bg-green-600/20 text-green-700';
      case 'rejected':
        return 'bg-red-600/20 text-red-700';
      case 'completed':
        return 'bg-gray-600/20 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const stats = {
    total: bookings.length,
    upcoming: bookings.filter((b) => b.status === 'upcoming').length,
    accepted: bookings.filter((b) => b.status === 'accepted').length,
    completed: bookings.filter((b) => b.status === 'completed').length,
    revenue: bookings
      .filter((b) => b.status === 'completed')
      .reduce((sum, b) => sum + b.total_price, 0),
  };

  const renderTabButton = (tab: TabKey) => {
    const isActive = activeTab === tab;
    const base = 'px-4 py-2 rounded-xl text-sm font-medium transition-all';
    const activeCls = 'bg-brand-yellow text-[#213448] shadow-sm';
    const inactiveCls = 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50';
    const cls = isActive ? base + ' ' + activeCls : base + ' ' + inactiveCls;
    const label = tab.charAt(0).toUpperCase() + tab.slice(1);
    return (
      <button
        key={tab}
        onClick={() => setActiveTab(tab)}
        className={cls}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />
      <main className="flex-grow container mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
          <p className="mt-1 text-gray-600 text-sm">Review, accept, and track upcoming and past bookings.</p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4 mb-8">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase text-gray-500">Total</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase text-gray-500">Upcoming</p>
            <p className="text-2xl font-bold text-gray-900">{stats.upcoming}</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase text-gray-500">Accepted</p>
            <p className="text-2xl font-bold text-gray-900">{stats.accepted}</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase text-gray-500">Earnings</p>
            <p className="text-2xl font-bold text-gray-900">{stats.revenue}</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          {TABS.map(renderTabButton)}
        </div>

        {loading ? (
          <div className="py-20 text-center text-gray-500 text-sm">Loading bookings...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
            <Calendar className="w-12 h-12 text-gray-300 mb-3" />
            <h3 className="text-lg font-bold text-gray-900 mb-1">No bookings</h3>
            <p className="text-gray-500 text-sm">Travelers will book your experiences here.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <table className="w-full text-left divide-y divide-gray-100">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-xs font-bold uppercase text-gray-500">Experience</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase text-gray-500">Guest</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase text-gray-500">Date</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase text-gray-500">Guests</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase text-gray-500">Price</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase text-gray-500">Status</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase text-gray-500 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-gray-500" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-sm">{b.experience_title}</h3>
                          <p className="text-xs text-gray-500">{b.status}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">{b.guest_name}</h4>
                        <p className="text-xs text-gray-500">{b.guest_email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900 text-sm font-medium">
                      {new Date(b.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      <Users className="w-4 h-4 inline mr-1" /> {b.guests}
                    </td>
                    <td className="px-6 py-4 text-gray-900 text-sm font-medium">
                      {b.total_price}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ' + statusColor(b.status)}
                      >
                        {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {b.status === 'upcoming' && (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => decide(b.id, 'accepted')}
                            className="px-3 py-1.5 rounded-full bg-green-600 text-xs font-bold text-white hover:bg-green-700"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => decide(b.id, 'rejected')}
                            className="px-3 py-1.5 rounded-full bg-red-600 text-xs font-bold text-white hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {b.status === 'accepted' && (
                        <button
                          onClick={() => decide(b.id, 'completed')}
                          className="px-3 py-1.5 rounded-full bg-gray-900 text-xs font-bold text-white hover:bg-black"
                        >
                          Mark completed
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default HostBookingsPage;
