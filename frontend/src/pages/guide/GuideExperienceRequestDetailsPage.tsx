import React, { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useGoBack } from "../../utils/backNavigation";
import { ArrowLeft, Loader2, MapPin } from "lucide-react";
import { Header } from "../../components/common/Header";
import { Footer } from "../../components/common/Footer";
import { Button } from "../../components/common/Button";
import { useAuthStore } from "../../store/authStore";
import {
  guideDashboardApi,
  type GuideExperienceOption,
  type GuideExperienceRequestCreate,
} from "../../services/guideDashboardApi";

const ACTIVITY_LABELS: Record<string, string> = {
  trekking: "Hike / Trek",
  tour: "Experience / Tour",
  specialized: "Cooking / Workshop",
};

/**
 * Step 2 of the new-listing form: the terms the Regional Head reviews — price
 * per person, slots and the meeting point where the guide meets travellers.
 * The chosen experience arrives in the URL so the page survives a refresh.
 */
const GuideExperienceRequestDetailsPage: React.FC = () => {
  const goBack = useGoBack();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const experienceId = Number(searchParams.get("experience")) || null;
  const { accessToken, isAuthenticated, user } = useAuthStore();
  const [target, setTarget] = useState<GuideExperienceOption | null>(null);
  const [loading, setLoading] = useState(true);
  const [pricePerPerson, setPricePerPerson] = useState("");
  const [slots, setSlots] = useState("1");
  const [meetingPoint, setMeetingPoint] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!accessToken || !experienceId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const options = await guideDashboardApi.listExperienceOptions(accessToken);
        const picked = options.find((option) => option.id === experienceId) || null;
        setTarget(picked);
        if (picked) setPricePerPerson(String(picked.price));
      } catch {
        setError("Unable to load the selected experience.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [accessToken, experienceId]);

  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (user?.role !== "guide") return <Navigate to="/bookings" replace />;

  const priceValue = Number(pricePerPerson);
  const slotsValue = Number(slots);
  const meetingValue = meetingPoint.trim();
  const termsValid =
    pricePerPerson.trim() !== "" &&
    Number.isFinite(priceValue) &&
    priceValue > 0 &&
    Number.isInteger(slotsValue) &&
    slotsValue >= 1 &&
    slotsValue <= 100 &&
    meetingValue.length >= 3;

  const submit = async () => {
    if (!target || !accessToken) return;
    if (!termsValid) {
      setError(
        "Enter a price per person above 0, a whole number of slots between 1 and 100, and a meeting point.",
      );
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload: GuideExperienceRequestCreate = {
        request_type: "experience",
        experience_id: target.id,
        price_per_person: priceValue,
        slots: slotsValue,
        meeting_point: meetingValue,
      };
      await guideDashboardApi.createExperienceRequest(accessToken, payload);
      navigate("/guide/listings/new", { replace: true, state: { submitted: true } });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to submit request.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 font-sans">
      <Header />
      <main className="container mx-auto max-w-3xl flex-grow px-4 py-10">
        <button onClick={goBack} className="flex items-center gap-2 font-bold text-gray-600 transition-colors hover:text-[#213448] hover:bg-white/20 px-4 py-2 rounded-full text-sm mb-6">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Step 2 of 2</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Price, Slots &amp; Meeting Point</h1>
        <p className="mb-8 text-gray-600">
          These are the terms the Regional Head reviews before you are added to the experience page.
        </p>

        {loading ? (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading the selected experience…
          </div>
        ) : !target ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
            <p className="font-bold">That experience is no longer available.</p>
            <p className="mt-1">
              It may have been deactivated or removed since you picked it.{" "}
              <Link to="/guide/listings/new" className="font-bold underline">
                Choose another experience
              </Link>
              .
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold">{target.title}</h2>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {target.city}
                </span>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-600">
                  {ACTIVITY_LABELS[target.category] || target.category}
                </span>
                <span>Listed at ${target.price.toFixed(2)} per person</span>
              </p>
              <Link
                to={`/guide/listings/new?activity=${target.category}`}
                className="mt-3 inline-block text-sm font-bold text-[#213448] hover:underline"
              >
                Change experience
              </Link>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-gray-700">
                  Price per person (USD)
                  <input
                    type="number"
                    min={0.01}
                    step="0.01"
                    className="mt-2 w-full rounded-xl border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#213448]"
                    value={pricePerPerson}
                    onChange={(e) => setPricePerPerson(e.target.value)}
                    placeholder="e.g. 45"
                  />
                </label>
                <label className="block text-sm font-medium text-gray-700">
                  Number of slots (1-100)
                  <input
                    type="number"
                    min={1}
                    max={100}
                    step="1"
                    className="mt-2 w-full rounded-xl border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#213448]"
                    value={slots}
                    onChange={(e) => setSlots(e.target.value)}
                    placeholder="e.g. 8"
                  />
                </label>
              </div>
              <label className="mt-4 block text-sm font-medium text-gray-700">
                Meeting point
                <input
                  type="text"
                  maxLength={300}
                  className="mt-2 w-full rounded-xl border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#213448]"
                  value={meetingPoint}
                  onChange={(e) => setMeetingPoint(e.target.value)}
                  placeholder="e.g. Thamel, in front of Kathmandu Guest House"
                />
              </label>
              <p className="mt-2 text-xs text-gray-500">
                Where travellers should meet you on the day. Minimum 3 characters.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button onClick={submit} disabled={saving || !termsValid}>
                  {saving ? "Submitting…" : "Submit Request"}
                </Button>
                <Link
                  to={`/guide/listings/new?activity=${target.category}`}
                  className="inline-flex items-center rounded-full border border-gray-300 px-5 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50"
                >
                  Back to step 1
                </Link>
              </div>
            </div>
          </>
        )}

        {error && (
          <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default GuideExperienceRequestDetailsPage;
