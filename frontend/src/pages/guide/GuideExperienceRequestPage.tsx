import React, { useEffect, useMemo, useState } from "react";
import { Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useGoBack } from "../../utils/backNavigation";
import { ArrowLeft, ArrowRight, CheckCircle2, ChefHat, Loader2, MapPin, Mountain } from "lucide-react";
import { Header } from "../../components/common/Header";
import { Footer } from "../../components/common/Footer";
import { Button } from "../../components/common/Button";
import { useAuthStore } from "../../store/authStore";
import {
  guideDashboardApi,
  type GuideCategory,
  type GuideExperienceOption,
  type GuideExperienceRequest,
} from "../../services/guideDashboardApi";

/**
 * Activity types offered on the first page of the new-listing form.  The ids are
 * the categories stored on listings, so the dropdown can filter the database
 * options by the type the guide picked (Hike / Trek shows every trek and hike).
 */
const ACTIVITY_TYPES: { id: GuideCategory; label: string; hint: string; Icon: typeof Mountain }[] = [
  {
    id: "trekking",
    label: "Hike / Trek",
    hint: "Day hikes, summit routes and multi-day treks",
    Icon: Mountain,
  },
  {
    id: "tour",
    label: "Experience / Tour",
    hint: "City walks, heritage and sightseeing tours",
    Icon: MapPin,
  },
  {
    id: "specialized",
    label: "Cooking / Workshop",
    hint: "Cooking classes, craft and skill workshops",
    Icon: ChefHat,
  },
];

const isActivity = (value: string | null): value is GuideCategory =>
  ACTIVITY_TYPES.some((type) => type.id === value);

const GuideExperienceRequestPage: React.FC = () => {
  const goBack = useGoBack();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { accessToken, isAuthenticated, user } = useAuthStore();
  const [experiences, setExperiences] = useState<GuideExperienceOption[]>([]);
  const [activity, setActivity] = useState<GuideCategory | null>(() =>
    isActivity(searchParams.get("activity")) ? (searchParams.get("activity") as GuideCategory) : null,
  );
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [requests, setRequests] = useState<GuideExperienceRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(
    Boolean((location.state as { submitted?: boolean } | null)?.submitted),
  );

  const loadOptions = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      setExperiences(await guideDashboardApi.listExperienceOptions(accessToken));
    } catch {
      setError("Unable to load experiences.");
    } finally {
      setLoading(false);
    }
  };

  const loadRequests = async () => {
    if (!accessToken) return;
    try {
      setRequests(await guideDashboardApi.listExperienceRequests(accessToken));
    } catch {
      setError("Unable to load your requests.");
    }
  };

  useEffect(() => {
    loadOptions();
    loadRequests();
  }, [accessToken]);

  // The success notice is handed over by step 2; drop it from history so a
  // refresh does not show a stale confirmation.
  useEffect(() => {
    if ((location.state as { submitted?: boolean } | null)?.submitted) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (user?.role !== "guide") return <Navigate to="/bookings" replace />;

  const counts = useMemo(() => {
    const tally: Record<string, number> = {};
    for (const option of experiences) tally[option.category] = (tally[option.category] || 0) + 1;
    return tally;
  }, [experiences]);

  const matching = useMemo(
    () => (activity ? experiences.filter((option) => option.category === activity) : []),
    [activity, experiences],
  );

  const activeType = ACTIVITY_TYPES.find((type) => type.id === activity);
  const target = matching.find((option) => option.id === selectedId);

  const chooseActivity = (value: GuideCategory) => {
    setActivity(value);
    setSelectedId(null);
    setError("");
    setSearchParams({ activity: value }, { replace: true });
  };

  const continueToDetails = () => {
    if (!selectedId) {
      setError("Please choose an experience to continue.");
      return;
    }
    navigate(`/guide/listings/new/details?experience=${selectedId}`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 font-sans">
      <Header />
      <main id="main-content" className="container mx-auto max-w-4xl flex-grow px-4 py-10">
        <button onClick={goBack} className="flex items-center gap-2 font-bold text-gray-600 transition-colors hover:text-[#213448] hover:bg-white/20 px-4 py-2 rounded-full text-sm mb-6">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Step 1 of 2</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">New Listing</h1>
        <p className="mb-8 text-gray-600">
          Pick the kind of experience you guide, then choose the one you want to be listed on.
        </p>

        <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-4">What do you guide?</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {ACTIVITY_TYPES.map(({ id, label, hint, Icon }) => {
              const selected = activity === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => chooseActivity(id)}
                  className={`rounded-2xl border p-4 text-left transition-colors ${
                    selected
                      ? "border-[#213448] bg-[#213448]/5 ring-2 ring-[#213448]"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${selected ? "text-[#213448]" : "text-gray-500"}`} />
                  <p className="mt-2 font-bold text-gray-900">{label}</p>
                  <p className="mt-1 text-xs text-gray-500">{hint}</p>
                  {!loading && <p className="mt-2 text-xs font-medium text-gray-400">{counts[id] || 0} available</p>}
                </button>
              );
            })}
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700">
              {activeType ? `${activeType.label} experiences` : "Choose a type first"}
              <select
                className="mt-2 w-full rounded-xl border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#213448] disabled:bg-gray-100 disabled:text-gray-400"
                value={selectedId ?? ""}
                onChange={(e) => {
                  setSelectedId(e.target.value ? Number(e.target.value) : null);
                  setError("");
                }}
                disabled={!activity || loading}
              >
                <option value="">
                  {!activity
                    ? "Select an activity type above"
                    : matching.length === 0
                    ? "No experiences of this type yet"
                    : "Choose an experience"}
                </option>
                {matching.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.title} — {option.city}
                  </option>
                ))}
              </select>
            </label>
            {loading && (
              <div className="mt-3 flex items-center gap-2 text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading experiences…
              </div>
            )}
            {target && (
              <p className="mt-3 text-sm text-gray-600">
                Selected: {target.title} — {target.city}. Next: set your price, slots and meeting point.
              </p>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={continueToDetails} disabled={!selectedId}>
              Continue <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>

        {submitted && (
          <p className="mb-6 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <CheckCircle2 className="h-4 w-4" /> Request submitted — awaiting Regional Head review.
          </p>
        )}

        {/* Status of existing requests */}
        {requests.length > 0 && (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
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
                  <div key={r.id} className="p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-gray-900">
                        {r.experience_title || r.booking_title || "Request"} ({r.request_type})
                      </p>
                      <span className={badgeClass}>{r.status}</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {typeof r.price_per_person === "number" && `$${r.price_per_person.toFixed(2)} per person · `}
                      {r.slots ? `${r.slots} slot${r.slots === 1 ? "" : "s"} · ` : ""}
                      Submitted {new Date(r.created_at).toLocaleDateString()}
                    </p>
                    {r.meeting_point && (
                      <p className="mt-1 text-xs text-gray-500">
                        <MapPin className="mr-1 inline h-3 w-3" /> Meets at {r.meeting_point}
                      </p>
                    )}
                    {r.review_notes && <p className="mt-1 text-sm text-gray-600">{r.review_notes}</p>}
                  </div>
                );
              })}
            </div>
          </div>
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
