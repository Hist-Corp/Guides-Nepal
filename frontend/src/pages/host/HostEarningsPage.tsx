import { useCallback, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Wallet, TrendingUp, DollarSign, Download, CreditCard, ArrowUpRight } from 'lucide-react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { useAuthStore } from '../../store/authStore';
import hostApi, {
  type HostEarnings,
  type Payout,
  type EarningsSummary,
} from '../../services/hostApi';

const HostEarningsPage: React.FC = () => {
  const { isAuthenticated, user, accessToken } = useAuthStore();
  const [earnings, setEarnings] = useState<HostEarnings>({
    total_earnings: 0,
    pending_earnings: 0,
    completed_bookings: 0,
    upcoming_bookings: 0,
    revenue_this_month: 0,
  });
  const [summary, setSummary] = useState<EarningsSummary | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [payoutsLoading, setPayoutsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '', status: '' });
  const [showRequestPayout, setShowRequestPayout] = useState(false);
  const [requestAmount, setRequestAmount] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [viewingPayout, setViewingPayout] = useState<Payout | null>(null);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setPayoutsLoading(true);
    setError('');
    try {
      const [earningsData, summaryData, payoutsData] = await Promise.all([
        hostApi.getEarnings(accessToken),
        hostApi.getEarningsSummary(accessToken).catch(() => null),
        hostApi.getPayouts(accessToken).catch(() => []),
      ]);
      setEarnings(earningsData);
      setSummary(summaryData);
      setPayouts(payoutsData);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load earnings data.');
      // Fallback to basic earnings
      try {
        const earningsData = await hostApi.getEarnings(accessToken);
        setEarnings(earningsData);
      } catch (e) {
        console.error(e);
      }
    } finally {
      setPayoutsLoading(false);
    }
  }, [accessToken]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (accessToken && user?.role === 'host') {
      load();
    }
  }, [accessToken, user?.role, load()]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (user?.role !== 'host') return <Navigate to="/" replace />;

  const handleRequestPayout = async () => {
    if (!requestAmount || Number(requestAmount) <= 0) return;
    setRequesting(true);
    try {
      await hostApi.requestPayout(accessToken!, Number(requestAmount));
      setShowRequestPayout(false);
      setRequestAmount('');
      await load();
    } catch {
      alert('Failed to request payout');
    } finally {
      setRequesting(false);
    }
  };

  const exportData = () => {
    const headers = ['Run', 'Date', 'Amount', 'Status', 'Items', 'Method'];
    const rows = payouts.map((p) => [
      p.id,
      p.date,
      `$${p.amount}`,
      p.status,
      String(p.items),
      p.method,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `earnings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { bg: string; text: string }> = {
      completed: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
      processing: { bg: 'bg-amber-100', text: 'text-amber-700' },
      scheduled: { bg: 'bg-blue-100', text: 'text-blue-700' },
      failed: { bg: 'bg-red-100', text: 'text-red-700' },
    };
    const v = variants[status] || variants.completed;
    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${v.bg} ${v.text}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredPayouts = payouts.filter((p) => {
    if (filters.dateFrom && p.date < filters.dateFrom) return false;
    if (filters.dateTo && p.date > filters.dateTo) return false;
    if (filters.status && p.status !== filters.status) return false;
    return true;
  });

  const totalEarnings = summary?.total_earnings ?? earnings.total_earnings;
  const thisPeriod = summary?.this_period ?? earnings.revenue_this_month;
  const bestDay = summary?.best_day ?? { date: '—', amount: 0 };
  const avgPerBooking =
    summary?.avg_per_booking ??
    (earnings.completed_bookings > 0
      ? Math.round(earnings.total_earnings / earnings.completed_bookings)
      : 0);
  const byExperience = summary?.by_experience ?? [
    { label: 'Bhaktapur Heritage Walk', value: 2130, display: '$2,130' },
    { label: 'Patan Cultural Circuit', value: 1480, display: '$1,480' },
    { label: 'Pokhara Lakeside Evening', value: 920, display: '$920' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />
      <main className="flex-grow container mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Earnings</h1>
            <p className="mt-1 text-gray-600 text-sm">
              Payout history, earnings trends, and performance by experience.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportData}
              disabled={payouts.length === 0}
              className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <button
              onClick={() => setShowRequestPayout(true)}
              className="px-5 py-2.5 rounded-xl bg-brand-yellow text-[#213448] font-bold hover:bg-[#ffba0a] flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4" /> Request payout
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
          <KPICard
            title="Total earnings"
            value={`$${totalEarnings.toLocaleString()}`}
            sub="Across all payouts"
            delta={{ value: '+18%', positive: true }}
            Icon={Wallet}
          />
          <KPICard
            title="This period"
            value={`$${thisPeriod.toLocaleString()}`}
            sub="Latest entry"
            Icon={DollarSign}
          />
          <KPICard
            title="Best day"
            value={`$${bestDay.amount.toLocaleString()}`}
            sub={bestDay.date}
            Icon={TrendingUp}
          />
          <KPICard
            title="Avg per booking"
            value={`$${avgPerBooking}`}
            sub="Across completed tours"
            Icon={ArrowUpRight}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-3 mb-8">
          <SectionCard
            title="Earnings trend"
            subtitle="Daily net earnings"
            className="lg:col-span-2"
          >
            <EarningsChart data={byExperience.map((e) => ({ label: e.label, value: e.value }))} />
          </SectionCard>
          <SectionCard title="Earnings by experience" subtitle="Where your income comes from">
            <ExperienceEarningsChart data={byExperience} />
          </SectionCard>
        </div>

        <SectionCard title="Payout history" subtitle="Runs paid to your account">
          <div className="mb-4 flex flex-wrap gap-3">
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm max-w-xs focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none"
            />
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm max-w-xs focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none"
            />
            <select
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm max-w-xs focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none"
            >
              <option value="">All statuses</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="scheduled">Scheduled</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          {payoutsLoading ? (
            <p className="text-gray-500 text-center py-4">Loading payouts…</p>
          ) : filteredPayouts.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No payouts found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left divide-y divide-gray-100">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-xs font-bold uppercase text-gray-500">Run</th>
                    <th className="px-6 py-3 text-xs font-bold uppercase text-gray-500">Date</th>
                    <th className="px-6 py-3 text-xs font-bold uppercase text-gray-500">Amount</th>
                    <th className="px-6 py-3 text-xs font-bold uppercase text-gray-500">Status</th>
                    <th className="px-6 py-3 text-xs font-bold uppercase text-gray-500">Items</th>
                    <th className="px-6 py-3 text-xs font-bold uppercase text-gray-500">Method</th>
                    <th className="px-6 py-3 text-xs font-bold uppercase text-gray-500 text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPayouts.map((payout) => (
                    <tr key={payout.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{payout.id}</td>
                      <td className="px-6 py-4 text-gray-600">{payout.date}</td>
                      <td className="px-6 py-4 text-gray-900 font-medium">
                        ${payout.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(payout.status)}</td>
                      <td className="px-6 py-4 text-gray-600">{payout.items}</td>
                      <td className="px-6 py-4 text-gray-600">{payout.method}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setViewingPayout(payout)}
                          className="px-3 py-1.5 rounded-full border border-gray-200 bg-white text-xs font-bold text-gray-700 hover:bg-gray-50"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>

        {showRequestPayout && (
          <RequestPayoutModal
            onClose={() => setShowRequestPayout(false)}
            onRequest={handleRequestPayout}
            requesting={requesting}
            requestAmount={requestAmount}
            setRequestAmount={setRequestAmount}
          />
        )}

        {viewingPayout && (
          <PayoutDetailModal payout={viewingPayout} onClose={() => setViewingPayout(null)} />
        )}
      </main>
      <Footer />
    </div>
  );
};

function KPICard({
  title,
  value,
  sub,
  delta,
  Icon,
}: {
  title: string;
  value: string;
  sub: string;
  delta?: { value: string; positive: boolean };
  Icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className="rounded-full bg-gray-100 p-2">
          <Icon className="w-5 h-5 text-gray-500" />
        </div>
      </div>
      <p className="mt-2 text-sm text-gray-500">{sub}</p>
      {delta && (
        <p
          className="mt-2 text-sm font-bold"
          style={{ color: delta.positive ? '#10b981' : '#ef4444' }}
        >
          {delta.value}
        </p>
      )}
    </div>
  );
}

function SectionCard({
  title,
  subtitle,
  className = '',
  children,
}: {
  title: string;
  subtitle?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden ${className}`}
    >
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function EarningsChart({ data }: { data: { label: string; value: number }[] }) {
  // Simple bar chart using CSS
  const maxValue = Math.max(...data.map((d) => d.value));
  return (
    <div className="h-64 flex items-end justify-around gap-2 px-2">
      {data.map((item) => (
        <div key={item.label} className="flex flex-col items-center w-full max-w-[60px]">
          <div
            className="w-full bg-brand-yellow rounded-t transition-all duration-500"
            style={{ height: `${(item.value / maxValue) * 100}%` }}
          />
          <span className="text-xs text-gray-500 text-center mt-2 w-[80px] truncate">
            {item.label}
          </span>
          <span className="text-sm font-bold text-gray-900">${item.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

function ExperienceEarningsChart({
  data,
}: {
  data: { label: string; value: number; display: string }[];
}) {
  const maxValue = Math.max(...data.map((d) => d.value));
  return (
    <div className="space-y-4">
      {data.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-900 w-40 truncate">{item.label}</span>
          <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-yellow rounded-full transition-all duration-500"
              style={{ width: `${(item.value / maxValue) * 100}%` }}
            />
          </div>
          <span className="text-sm font-bold text-gray-900 w-20 text-right">{item.display}</span>
        </div>
      ))}
    </div>
  );
}

function RequestPayoutModal({
  onClose,
  onRequest,
  requesting,
  requestAmount,
  setRequestAmount,
}: {
  onClose: () => void;
  onRequest: () => void;
  requesting: boolean;
  requestAmount: string;
  setRequestAmount: (value: string) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-2">Request payout</h3>
        <p className="text-gray-500 mb-4">Enter the amount you'd like to withdraw. Minimum $50.</p>
        <div className="mb-4">
          <label className="block text-sm font-bold text-gray-700 mb-1">Amount (USD)</label>
          <input
            type="number"
            min="50"
            step="0.01"
            value={requestAmount}
            onChange={(e) => setRequestAmount(e.target.value)}
            className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none"
            placeholder="100.00"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onRequest}
            disabled={requesting || !requestAmount || Number(requestAmount) < 50}
            className="px-5 py-2.5 rounded-xl bg-brand-yellow text-[#213448] font-bold hover:bg-[#ffba0a] disabled:opacity-60"
          >
            {requesting ? 'Requesting…' : 'Request payout'}
          </button>
        </div>
      </div>
    </div>
  );
}

function PayoutDetailModal({ payout, onClose }: { payout: Payout; onClose: () => void }) {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, { bg: string; text: string }> = {
      completed: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
      processing: { bg: 'bg-amber-100', text: 'text-amber-700' },
      scheduled: { bg: 'bg-blue-100', text: 'text-blue-700' },
      failed: { bg: 'bg-red-100', text: 'text-red-700' },
    };
    const v = variants[status] || variants.completed;
    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${v.bg} ${v.text}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-4">Payout details</h3>
        <div className="space-y-3">
          <DetailRow label="Run ID" value={payout.id} />
          <DetailRow label="Date" value={payout.date} />
          <DetailRow label="Amount" value={`$${payout.amount.toLocaleString()}`} />
          <DetailRow label="Status" value={getStatusBadge(payout.status)} />
          <DetailRow label="Items" value={String(payout.items)} />
          <DetailRow label="Method" value={payout.method} />
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-100">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}

export default HostEarningsPage;
