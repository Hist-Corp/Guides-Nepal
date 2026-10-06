import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Compass, MapPin, Users } from 'lucide-react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { Button } from '../../components/common/Button';
import { useAuthStore } from '../../store/authStore';
import { guideDashboardApi, type GuideOnboarding } from '../../services/guideDashboardApi';

const EXPERTISE = [
  { id: 'trekking', label: 'Trekking routes', hint: 'Multi-day hikes, e.g. Annapurna, Langtang' },
  { id: 'tour', label: 'Travel tours', hint: 'City walks, cultural & food tours' },
  { id: 'specialized', label: 'Specialized activities', hint: 'Photography, birding, cooking, yoga' },
];
const CITIES = ['Kathmandu', 'Pokhara', 'Lalitpur', 'Bhaktapur', 'Bharatpur', 'Chitwan', 'Lumbini'];
const LANGS = ['English', 'Nepali', 'Hindi', 'Newari', 'French', 'German', 'Spanish', 'Chinese', 'Japanese'];
const STEPS = ['Expertise', 'Areas & languages', 'Profile & capacity', 'Review'];

type Draft = {
  expertise_areas: string[];
  cities: string[];
  languages: string[];
  display_name: string;
  bio: string;
  years_experience: string;
  default_max_guests: string;
};

const emptyDraft: Draft = {
  expertise_areas: [],
  cities: [],
  languages: [],
  display_name: '',
  bio: '',
  years_experience: '',
  default_max_guests: '10',
};

const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);


/**
 * Step-by-step onboarding: expertise areas (trekking / tours / specialized),
 * coverage cities + languages, profile + default max-guest capacity, review.
 */
const GuideOnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, accessToken } = useAuthStore();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!accessToken || user?.role !== 'guide') return;
    guideDashboardApi
      .getOnboarding(accessToken)
      .then(({ onboarding }) => {
        if (!onboarding) return;
        setDraft({
          expertise_areas: onboarding.expertise_areas ?? [],
          cities: onboarding.cities ?? [],
          languages: onboarding.languages ?? [],
          display_name: onboarding.display_name ?? '',
          bio: onboarding.bio ?? '',
          years_experience: onboarding.years_experience ?? '',
          default_max_guests: String(onboarding.default_max_guests ?? 10),
        });
        if (onboarding.onboarding_completed) setDone(true);
      })
      .catch(() => undefined);
  }, [accessToken, user?.role]);

  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (user?.role !== 'guide') return <Navigate to="/bookings" replace />;

  const set = (key: keyof Draft, value: string | string[]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const valid = () =>
    step === 0
      ? draft.expertise_areas.length > 0
      : step === 1
        ? draft.cities.length > 0 && draft.languages.length > 0
        : step === 2
          ? draft.display_name.trim().length >= 2 &&
            draft.bio.trim().length >= 30 &&
            Number(draft.default_max_guests) >= 1 &&
            Number(draft.default_max_guests) <= 100
          : true;

  const next = () => {
    if (!valid()) {
      setError(
        step === 0
          ? 'Pick at least one area of expertise to continue.'
          : step === 1
            ? 'Choose at least one city and one language.'
            : 'Add your display name, a 30+ character bio and a capacity of 1-100.',
      );
      return;
    }
    setError('');
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };

  const save = async (completed: boolean) => {
    if (!accessToken) return;
    setBusy(true);
    setError('');
    try {
      const payload: Partial<GuideOnboarding> = {
        display_name: draft.display_name.trim(),
        expertise_areas: draft.expertise_areas,
        cities: draft.cities,
        languages: draft.languages,
        bio: draft.bio.trim(),
        years_experience: draft.years_experience.trim() || undefined,
        default_max_guests: Number(draft.default_max_guests),
        onboarding_completed: completed,
      };
      await guideDashboardApi.saveOnboarding(accessToken, payload);
      if (completed) setDone(true);
      else navigate('/guide/dashboard');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to save onboarding.');
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="flex min-h-screen flex-col bg-white font-sans">
        <Header />
        <main className="flex flex-grow items-center justify-center bg-gray-50 px-4 py-20">
          <div className="w-full max-w-lg rounded-3xl bg-white p-10 text-center shadow-xl">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="mb-4 text-3xl font-bold text-gray-900">You are ready to guide!</h2>
            <p className="mb-8 text-lg text-gray-600">
              Your expertise and capacity are saved. Create your first listing or post a live update.
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Button onClick={() => navigate('/guide/dashboard')}>Open dashboard</Button>
              <Button variant="secondary" onClick={() => navigate('/guide/listings/new')}>
                List an experience
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 font-sans">
      <Header />
      <main className="container mx-auto max-w-4xl flex-grow px-4 py-10">
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Guide onboarding</h1>
        <p className="mt-2 text-gray-600">Tell travelers what you lead and how many guests you can host.</p>
        <ol className="mt-8 flex flex-wrap gap-2">
          {STEPS.map((label, i) => (
            <li
              key={label}
              className={`rounded-full px-4 py-2 text-sm font-bold ${
                i === step ? 'bg-[#213448] text-white' : i < step ? 'bg-green-100 text-green-800' : 'bg-white text-gray-500'
              }`}
            >
              {i + 1}. {label}
            </li>
          ))}
        </ol>
        <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          {step === 0 && (
            <div>
              <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
                <Compass className="h-5 w-5" /> What do you lead?
              </h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {EXPERTISE.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => set('expertise_areas', toggle(draft.expertise_areas, e.id))}
                    className={`rounded-2xl border-2 p-4 text-left ${
                      draft.expertise_areas.includes(e.id) ? 'border-[#213448] bg-[#213448]/5' : 'border-gray-200'
                    }`}
                  >
                    <p className="font-bold text-gray-900">{e.label}</p>
                    <p className="mt-1 text-sm text-gray-500">{e.hint}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
          {step === 1 && (
            <div>
              <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
                <MapPin className="h-5 w-5" /> Where and in which languages?
              </h2>
              <p className="mt-4 text-sm font-bold text-gray-700">Cities / areas</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {CITIES.map((c) => (
                  <button key={c} type="button" onClick={() => set('cities', toggle(draft.cities, c))}
                    className={`rounded-full px-4 py-2 text-sm font-bold ${draft.cities.includes(c) ? 'bg-[#213448] text-white' : 'bg-gray-100 text-gray-700'}`}>
                    {c}
                  </button>
                ))}
              </div>
              <p className="mt-6 text-sm font-bold text-gray-700">Languages</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {LANGS.map((l) => (
                  <button key={l} type="button" onClick={() => set('languages', toggle(draft.languages, l))}
                    className={`rounded-full px-4 py-2 text-sm font-bold ${draft.languages.includes(l) ? 'bg-brand-yellow text-[#213448]' : 'bg-gray-100 text-gray-700'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          )}
          {step === 2 && (
            <div>
              <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
                <Users className="h-5 w-5" /> Profile and guest capacity
              </h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-gray-700">Display name
                  <input className="mt-2 w-full rounded-xl border border-gray-300 p-3" value={draft.display_name} onChange={(e) => set('display_name', e.target.value)} placeholder="e.g. Pasang Sherpa" />
                </label>
                <label className="text-sm font-medium text-gray-700">Years of experience
                  <input className="mt-2 w-full rounded-xl border border-gray-300 p-3" value={draft.years_experience} onChange={(e) => set('years_experience', e.target.value)} placeholder="e.g. 8 years" />
                </label>
                <label className="text-sm font-medium text-gray-700 sm:col-span-2">Bio (min 30 characters)
                  <textarea className="mt-2 min-h-28 w-full rounded-xl border border-gray-300 p-3" value={draft.bio} onChange={(e) => set('bio', e.target.value)} placeholder="What makes your tours special?" />
                </label>
                <label className="text-sm font-medium text-gray-700">Default max guests (1-100)
                  <input type="number" min={1} max={100} className="mt-2 w-full rounded-xl border border-gray-300 p-3" value={draft.default_max_guests} onChange={(e) => set('default_max_guests', e.target.value)} />
                </label>
              </div>
            </div>
          )}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900">Review and finish</h2>
              <div className="mt-5 grid gap-4 text-sm text-gray-700 sm:grid-cols-2">
                <div className="rounded-xl bg-gray-50 p-4"><b>Expertise</b><p className="mt-1">{draft.expertise_areas.join(', ') || '-'}</p></div>
                <div className="rounded-xl bg-gray-50 p-4"><b>Cities</b><p className="mt-1">{draft.cities.join(', ') || '-'}</p></div>
                <div className="rounded-xl bg-gray-50 p-4"><b>Languages</b><p className="mt-1">{draft.languages.join(', ') || '-'}</p></div>
                <div className="rounded-xl bg-gray-50 p-4"><b>Display name</b><p className="mt-1">{draft.display_name || '-'}</p></div>
                <div className="rounded-xl bg-gray-50 p-4"><b>Experience</b><p className="mt-1">{draft.years_experience || '-'}</p></div>
                <div className="rounded-xl bg-gray-50 p-4"><b>Default max guests</b><p className="mt-1">{draft.default_max_guests}</p></div>
              </div>
              <p className="mt-4 rounded-xl bg-gray-50 p-4 text-sm text-gray-600">{draft.bio || 'No bio yet.'}</p>
            </div>
          )}
          {error && <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
          <div className="mt-8 flex flex-col-reverse justify-between gap-3 border-t border-gray-200 pt-6 sm:flex-row">
            <Button variant="secondary" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => save(false)} disabled={busy}>
                {busy ? 'Saving...' : 'Save & exit'}
              </Button>
              {step < STEPS.length - 1 ? (
                <Button onClick={next}>Continue <ArrowRight className="ml-2 h-4 w-4" /></Button>
              ) : (
                <Button onClick={() => save(true)} disabled={busy}>{busy ? 'Finishing...' : 'Complete onboarding'}</Button>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GuideOnboardingPage;


