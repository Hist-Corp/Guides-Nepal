import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useGoBack } from "../../utils/backNavigation";
import { ArrowLeft, Plus, User, Calendar, Loader2 } from "lucide-react";
import { Header } from "../../components/common/Header";
import { Footer } from "../../components/common/Footer";
import { Button } from "../../components/common/Button";
import { useAuthStore } from "../../store/authStore";
import {
  guideDashboardApi,
  type GuideExperienceRequestCreate,
} from "../../services/guideDashboardApi";

type RequestMode = "experience" | "booking";

const GuideExperienceRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const goBack = useGoBack();
  const { accessToken, isAuthenticated, user } = useAuthStore();
  const [mode, setMode] = useState<RequestMode>("experience");
  const [experiences, setExperiences] = useState<Awaited<ReturnType<typeof guideDashboardApi.listExperienceOptions>>>([]);
  const [bookings, setBookings] = useState<Awaited<ReturnType<typeof guideDashboardApi.listBookings>>>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const loadOptions = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const experienceOptions = await guideDashboardApi.listExperienceOptions(accessToken);
      setExperiences(experienceOptions);

      // Fetch the guide's own upcoming bookings.
      const bookingOptions = await guideDashboardApi.listBookings(accessToken);
      setBookings(bookingOptions);
    } catch {
      setError("Unable to load experiences or bookings.");
    } finally {
      setLoading(false);
    }
  };

  const loadRequests = async () => {
    if (!accessToken) return;
    try {
      const data = await guideDashboardApi.listExperienceRequests(accessToken);
      setRequests(data);
    } catch {
      setError("Unable to load your requests.");
    }
  };

  useEffect(() => {
    loadOptions();
    loadRequests();
  }, [accessToken]);

  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (user?.role !== "guide") return <Navigate to="/bookings" replace />;

  const targetId = mode === "experience" ? experiences.find((e) => e.id === selectedId) : bookings.find((b) => b.id === selectedId);

  const submit = async () => {
    if (!selectedId) {
      setError("Please select an experience or booking.");
      return;
    }
    setSaving(true);
    setError("");
    setMsg("");
    try {
      const payload: GuideExperienceRequestCreate = {
        request_type: mode,
        ...(mode === "experience" ? { experience_id: selectedId } : { booking_id: selectedId }),
      };
      await guideDashboardApi.createExperienceRequest(accessToken, payload);
      setMsg("Request submitted — awaiting Regional Head review.");
      setSelectedId(null);
      await loadRequests();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to submit request.");
    } finally {
      setSaving(false);
    }
  };

  const pendingRequest = requests.find((r) => r.status === "pending");
  const approvedRequest = requests.find((r) => r.status === "approved");
  const rejectedRequest = requests.find((r) => r.status === "rejected");

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 font-sans">
      <Header />
      <main className="container mx-auto max-w-4xl flex-grow px-4 py-10">
        <button onClick={goBack} className="flex items-center gap-2 font-bold text-gray-600 transition-colors hover:text-[#213448] hover:bg-white/20 px-4 py-2 rounded-full text-sm mb-6">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Request Experience Assignment
        </h1>

        {/* Mode toggle */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
          <div className="flex">
            <button
              onClick={() => setMode("experience")}
              className={
                mode === "experience"
                  ? "flex-1 py-3 text-sm font-bold transition-colors bg-[#213448] text-white"
                  : "flex-1 py-3 text-sm font-bold transition-colors text-gray-600 hover:bg-gray-50"
              }
            >
              <User className="h-4 w-4 mr-2" /> Request Experience
            </button>
            <button
              onClick={() => setMode("booking")}
              className={
                mode === "booking"
                  ? "flex-1 py-3 text-sm font-bold transition-colors bg-[#213448] text-white"
                  : "flex-1 py-3 text-sm font-bold transition-colors text-gray-600 hover:bg-gray-50"
              }
            >
              <Calendar className="h-4 w-4 mr-2" /> Request Booking
            </button>
          </div>
        </div>

        {/* Dropdown selection */}
        <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-4">
            Select {mode === "experience" ? "Experience" : "Booking"}
          </h2>
          {loading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading options…
            </div>
          ) : mode === "experience" ? (
            <select
              className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#213448]"
              value={selectedId ?? ""}
              onChange={(e) => setSelectedId(Number(e.target.value))}
            >
              <option value="">Choose an experience</option>
              {experiences.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title} — {e.city} ($${e.price.toFixed(0)}/guest)
                </option>
              ))}
            </select>
          ) : (
            <select
              className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#213448]"
              value={selectedId ?? ""}
              onChange={(e) => setSelectedId(Number(e.target.value))}
            >
              <option value="">Choose a booking</option>
              {bookings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.experience_title} — {b.city} ({new Date(b.date).toLocaleDateString()})
                  [{b.status}]
                </option>
              ))}
            </select>
          )}
          {targetId && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {"title" in targetId ? targetId.title : targetId.experience_title}
            </p>
          )}
          <div className="mt-4 flex gap-3">
            <Button onClick={submit} disabled={saving || !selectedId || !accessToken}>
              {saving ? "Submitting…" : "Submit Request"}
            </Button>
            <Button variant="secondary" onClick={() => setSelectedId(null)}>
              Clear
            </Button>
          </div>
        </div>

        {/* Status of existing requests */}
        {requests.length > 0 && (
          <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4">Your Requests</h2>
            <div className="space-y-3">
              {requests.map((r) => {
                const statusColor =
                  r.status === "approved"
                    ? "bg-green-100 text-green-700"
                    : r.status === "rejected"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700";
                const badgeClass = `px-3 py-1 rounded-full text-xs font-bold ${statusColor}`;
                return (
                  <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-900">
                        {r.experience_title || r.booking_title || "Request"} ({r.request_type})
                      </p>
                      <p className="text-xs text-gray-500">
                        Submitted {new Date(r.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={badgeClass}>
                      {r.status}
                    </span>
                    {r.review_notes && (
                      <p className="text-sm text-gray-600 mt-1">{r.review_notes}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {msg && (
          <p className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {msg}
          </p>
        )}
        {error && (
          <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <p className="mt-8 text-sm text-gray-500">
          Once a Regional Head approves your request, you will appear in the
          “Who you’ll meet” section of the corresponding experience or tour
          page for travellers.
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default GuideExperienceRequestPage;
