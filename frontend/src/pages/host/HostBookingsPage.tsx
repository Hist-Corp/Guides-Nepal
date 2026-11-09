import React, { useCallback, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Calendar, Users, MessageSquare } from 'lucide-react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { PageBackButton } from '../../components/common/PageBackButton';
import { useAuthStore } from '../../store/authStore';
import hostApi, { type HostBooking } from '../../services/hostApi';

type TabKey = 'all' | 'upcoming' | 'accepted' | 'rejected' | 'completed';

const TABS: TabKey[] = ['all', 'upcoming', 'accepted', 'rejected', 'completed'];

const HostBookingsPage: React.FC = () => {
  const { isAuthenticated, user, accessToken } = useAuthStore();
  const [bookings, setBookings] = useState<HostBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [viewingBooking, setViewingBooking] = useState<HostBooking | null>(null);
  const [bookingDetailLoading, setBookingDetailLoading] = useState(false);
  const [messageText, setMessageText] = useState('');

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

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (accessToken && user?.role === 'host') load();
  }, [accessToken, user?.role, load]);

  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (user?.role !== 'host') return <Navigate to="/" replace />;

  const filtered = bookings.filter((b) => activeTab === 'all' || b.status === activeTab);

  const decide = async (id: number, status: 'accepted' | 'rejected' | 'completed') => {
    try {
      await hostApi.decideBooking(accessToken!, id, status);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to update booking.');
    }
  };

  const viewDetail = async (booking: HostBooking) => {
    setViewingBooking(booking);
    if (!booking.timeline?.length) {
      setBookingDetailLoading(true);
      try {
        const detail = await hostApi.getBookingDetail(accessToken!, booking.id);
        setViewingBooking(detail);
      } catch (e) {
        console.error('Failed to load booking detail', e);
      } finally {
        setBookingDetailLoading(false);
      }
    }
  };

  const handleSendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!messageText.trim() || !viewingBooking) return;
    try {
      await hostApi.messageGuest(accessToken!, viewingBooking.id, messageText);
      const detail = await hostApi.getBookingDetail(accessToken!, viewingBooking.id);
      setViewingBooking(detail);
      setMessageText('');
    } catch {
      alert('Failed to send message');
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
      case 'cancelled':
        return 'bg-red-600/20 text-red-700';
      case 'pending':
        return 'bg-amber-100 text-amber-700';
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
      <button key={tab} onClick={() => setActiveTab(tab)} className={cls}>
        {label}
      </button>
    );
  };

  const formatDateOnly = (dateStr: string) => new Date(dateStr).toLocaleDateString();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />
      <main className="flex-grow container mx-auto max-w-6xl px-4 py-8">
        <PageBackButton fallback="/host/dashboard" />
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
          <p className="mt-1 text-gray-600 text-sm">
            Review, accept, and track upcoming and past bookings.
          </p>
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
            <p className="text-2xl font-bold text-gray-900">${stats.revenue.toLocaleString()}</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">{TABS.map(renderTabButton)}</div>

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
                  <th className="px-6 py-3 text-xs font-bold uppercase text-gray-500">
                    Experience
                  </th>
                  <th className="px-6 py-3 text-xs font-bold uppercase text-gray-500">Guest</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase text-gray-500">Date</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase text-gray-500">Guests</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase text-gray-500">Price</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase text-gray-500">Status</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase text-gray-500 text-right">
                    Action
                  </th>
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
                          <p className="text-xs text-gray-500">{b.experience_city}</p>
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
                      {formatDateOnly(b.date)}
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      <Users className="w-4 h-4 inline mr-1" /> {b.guests}
                    </td>
                    <td className="px-6 py-4 text-gray-900 text-sm font-medium">
                      ${b.total_price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${statusColor(b.status)}`}
                      >
                        {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => viewDetail(b)}
                          className="px-3 py-1.5 rounded-full border border-gray-200 bg-white text-xs font-bold text-gray-700 hover:bg-gray-50"
                        >
                          <MessageSquare className="w-3 h-3 mr-1" /> Details
                        </button>
                        {b.status === 'pending' && (
                          <>
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
                          </>
                        )}
                        {b.status === 'accepted' && (
                          <button
                            onClick={() => decide(b.id, 'completed')}
                            className="px-3 py-1.5 rounded-full bg-gray-900 text-xs font-bold text-white hover:bg-black"
                          >
                            Mark completed
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <Footer />

      {viewingBooking && (
        <BookingDetailModal
          booking={viewingBooking}
          onClose={() => setViewingBooking(null)}
          onMessage={handleSendMessage}
          loading={bookingDetailLoading}
          messageText={messageText}
          setMessageText={setMessageText}
        />
      )}
    </div>
  );
};

function BookingDetailModal({
  booking,
  onClose,
  onMessage,
  loading,
  messageText,
  setMessageText,
}: {
  booking: HostBooking;
  onClose: () => void;
  onMessage: (e: React.FormEvent) => void;
  loading: boolean;
  messageText: string;
  setMessageText: (value: string) => void;
}) {
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
      case 'cancelled':
        return 'bg-red-600/20 text-red-700';
      case 'pending':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString();

  const actorIcons: Record<string, string> = { guest: '👤', host: '🏠', system: '⚙️' };
  const actorLabels: Record<string, string> = { guest: 'Guest', host: 'You', system: 'System' };
  const typeColors: Record<string, string> = {
    created: 'text-blue-600',
    accepted: 'text-green-600',
    rejected: 'text-red-600',
    cancelled: 'text-red-600',
    completed: 'text-gray-600',
    message: 'text-purple-600',
    reminder: 'text-amber-600',
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-6 border border-gray-100 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {loading && (
          <div className="flex justify-center py-8">
            <p className="text-gray-500">Loading details…</p>
          </div>
        )}
        {!loading && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{booking.experience_title}</h2>
                <p className="text-sm text-gray-500">{booking.experience_city}</p>
              </div>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${statusColor(booking.status)}`}
              >
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <DetailField label="Guest" value={booking.guest_name} />
              <DetailField label="Email" value={booking.guest_email} />
              <DetailField label="Phone" value={booking.guest_phone || '—'} />
              <DetailField label="Booking date" value={formatDate(booking.date)} />
              <DetailField label="Guests" value={String(booking.guests)} />
              <DetailField label="Total price" value={`$${booking.total_price.toLocaleString()}`} />
              <DetailField label="Booking ID" value={String(booking.id)} />
              <DetailField label="Created" value={formatDate(booking.created_at)} />
            </div>

            {booking.notes && (
              <div className="rounded-lg bg-gray-50 p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Guest notes</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{booking.notes}</p>
              </div>
            )}

            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Timeline</h3>
                <form onSubmit={onMessage} className="flex gap-2 w-full max-w-md">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Message guest…"
                    className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 rounded-xl bg-brand-yellow text-[#213448] font-bold hover:bg-[#ffba0a] text-sm"
                  >
                    Send
                  </button>
                </form>
              </div>
              <div className="space-y-3">
                {booking.timeline?.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No timeline events yet.</p>
                ) : (
                  booking.timeline.map((event) => (
                    <div key={event.id} className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm">
                        {actorIcons[event.actor] || '⚙️'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">
                            {actorLabels[event.actor] || event.actor}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(event.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className={`text-sm ${typeColors[event.event_type] || ''}`}>
                          {event.description}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs text-gray-400 block mb-1">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}

export default HostBookingsPage;
