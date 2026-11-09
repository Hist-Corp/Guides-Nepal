import React, { useCallback, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  User,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { Button } from '../../components/common/Button';
import { useAuthStore } from '../../store/authStore';
import { guideDashboardApi, GuideExperienceRequest, GuideExperienceRequestReview } from '../../services/guideDashboardApi';

const REGIONAL_OR_ADMIN = ['regional-head', 'admin'];

const RegionalExperienceRequestReview: React.FC = () => {
  const { isAuthenticated, user, accessToken } = useAuthStore();
  const navigate = useNavigate();
  const userRegion = (user as { region?: string }).region;
  const [requests, setRequests] = useState<GuideExperienceRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [reviewingId, setReviewingId] = useState<number | null>(null);
  const [reviewNote, setReviewNote] = useState('');

  const loadRequests = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const data = await guideDashboardApi.listExperienceRequestsForReview(
        accessToken,
        statusFilter || undefined,
      );
      setRequests(data);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [accessToken, statusFilter]);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;
    const role = (user?.role || '').toLowerCase();
    if (!REGIONAL_OR_ADMIN.includes(role)) {
      navigate('/', { replace: true });
      return;
    }
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = await guideDashboardApi.listExperienceRequestsForReview(
          accessToken,
          statusFilter || undefined,
        );
        if (!cancelled) setRequests(data);
      } catch {
        if (!cancelled) setRequests([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user?.role, accessToken, navigate, userRegion, statusFilter]);

  const handleReview = async (id: number, decision: 'approved' | 'rejected') => {
    if (!accessToken) return;
    setReviewingId(id);
    try {
      const payload: GuideExperienceRequestReview = {
        status: decision,
        review_notes: reviewNote || undefined,
      };
      await guideDashboardApi.reviewExperienceRequest(accessToken, id, payload);
      setReviewNote('');
      setReviewingId(null);
      await loadRequests();
    } catch {
      setReviewingId(null);
    }
  };

  if (!isAuthenticated) return <Navigate to="/" replace />;
  const role = (user?.role || '').toLowerCase();
  if (!REGIONAL_OR_ADMIN.includes(role)) return <Navigate to="/" replace />;

  const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Regional Head';
  const regionLabel = userRegion ? ` (${userRegion} region)` : '';

  const statusColor = (s: string) => {
    switch ((s || '').toLowerCase()) {
      case 'approved': return 'text-green-600 bg-green-50 border-green-100';
      case 'rejected': return 'text-red-600 bg-red-50 border-red-100';
      default: return 'text-amber-600 bg-amber-50 border-amber-100';
    }
  };

  return (
    <div className="min-h-screen font-sans bg-white text-gray-900">
      <Header />
      <main className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Experience Requests</h1>
              <p className="text-gray-600">
                Review and approve guide experience assignment requests{regionLabel ? ` for the ${userRegion} region` : ''}.{name ? ` Welcome, ${name}.` : ''}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-[#213448] outline-none"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="">All</option>
              </select>
              <Button
                onClick={loadRequests}
                disabled={loading}
                className="bg-[#213448] hover:bg-[#1a2a3a] text-white"
              >
                {loading ? 'Loading…' : 'Refresh'}
              </Button>
            </div>
          </div>

          {requests.length === 0 && (
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No experience requests found</h3>
              <p className="text-gray-500">
                {statusFilter === 'pending'
                  ? 'No pending experience requests to review.'
                  : `No ${statusFilter} experience requests.`}
              </p>
            </div>
          )}

          <div className="space-y-4">
            {requests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-shadow"
              >
                <div className="p-6 border-b border-gray-50">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{req.guide_name}</h3>
                        <p className="text-sm text-gray-500">{req.guide_email}</p>
                        {req.guide_region && (
                          <p className="text-xs text-gray-400">
                            <MapPin className="w-3 h-3 mr-1 inline" /> {req.guide_region}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColor(req.status)}`}
                      >
                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                      </span>
                      <span className="text-xs text-gray-400">
                        {req.created_at ? new Date(req.created_at).toLocaleDateString() : ''}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-500">Request type</span>
                      <span className="text-sm text-gray-600">{req.request_type}</span>
                    </div>
                    {req.experience_title && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500">Experience</span>
                        <span className="text-sm text-gray-600 truncate">{req.experience_title}</span>
                      </div>
                    )}
                    {req.booking_title && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500">Booking</span>
                        <span className="text-sm text-gray-600 truncate">{req.booking_title}</span>
                      </div>
                    )}
                    {typeof req.price_per_person === 'number' && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500">Price / person</span>
                        <span className="text-sm text-gray-600">${req.price_per_person.toFixed(2)}</span>
                      </div>
                    )}
                    {typeof req.slots === 'number' && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500">Slots</span>
                        <span className="text-sm text-gray-600">{req.slots}</span>
                      </div>
                    )}
                    {req.meeting_point && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500">Meeting point</span>
                        <span className="text-sm text-gray-600 truncate">{req.meeting_point}</span>
                      </div>
                    )}
                    {req.booking_date && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500">Date</span>
                        <span className="text-sm text-gray-600">{new Date(req.booking_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {req.status === 'pending' && (
                  <div className="p-6 border-t border-gray-50 bg-gray-50/50">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <label className="text-sm font-medium text-gray-700 w-20 shrink-0 pt-1">
                          Review Note
                        </label>
                        <textarea
                          value={reviewingId === req.id ? reviewNote : ''}
                          onChange={(e) => {
                            if (reviewingId === req.id) setReviewNote(e.target.value);
                          }}
                          placeholder="Optional note for the guide…"
                          className="flex-1 p-2 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-[#213448] outline-none resize-y"
                          rows={2}
                          disabled={reviewingId !== null && reviewingId !== req.id}
                        />
                      </div>
                      <div className="flex items-center justify-end gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setReviewingId(null);
                            setReviewNote('');
                          }}
                          disabled={reviewingId !== null && reviewingId !== req.id}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleReview(req.id, 'approved')}
                          disabled={reviewingId !== null && reviewingId !== req.id}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {reviewingId === req.id ? 'Approving…' : 'Approve'}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleReview(req.id, 'rejected')}
                          disabled={reviewingId !== null && reviewingId !== req.id}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          {reviewingId === req.id ? 'Rejecting…' : 'Reject'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                {req.status === 'approved' && (
                  <div className="p-6 border-t border-gray-50 bg-green-50/50">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">
                        Approved{req.reviewed_by ? ' — guide added to "Who you\'ll meet" section' : ''}
                      </span>
                    </div>
                    {req.review_notes && (
                      <p className="text-sm text-gray-600 mt-1">{req.review_notes}</p>
                    )}
                  </div>
                )}
                {req.status === 'rejected' && (
                  <div className="p-6 border-t border-gray-50 bg-red-50/50">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-medium text-red-700">Rejected</span>
                    </div>
                    {req.review_notes && (
                      <p className="text-sm text-gray-600 mt-1">{req.review_notes}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RegionalExperienceRequestReview;
