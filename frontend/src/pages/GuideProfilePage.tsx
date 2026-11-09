import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { ImageLightbox } from '../components/common/ImageLightbox';
import guidesApi, { type GuideProfile } from '../services/guidesApi';
import { useCurrency } from '../contexts/CurrencyContext';
import { experienceSlugPath } from '../utils/canonicalExperience';
import { useGoBack } from '../utils/backNavigation';
import { getLocalGuideProfile } from '../utils/guideProfile';
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Compass,
  Languages,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Star,
  Users,
} from 'lucide-react';

const PLACEHOLDER_IMAGE = '/images/placeholder.svg';

const safeImage = (url?: string | null): string =>
  typeof url === 'string' && url.trim() !== '' ? url : PLACEHOLDER_IMAGE;

const monthYear = (value?: string | null): string | null => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
};

/**
 * Public profile of one guide: everything a traveller needs before booking —
 * who they are, what they speak, where they work and every experience they lead.
 */
const GuideProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const goBack = useGoBack();
  const { formatPrice } = useCurrency();

  const [profile, setProfile] = useState<GuideProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  useEffect(() => {
    const guideId = Number(id);
    if (!Number.isFinite(guideId)) {
      setTimeout(() => {
        setLoading(false);
        setProfile(null);
        setError('Guide not found.');
      }, 0);
      return;
    }

    let cancelled = false;
    setTimeout(() => {
      setLoading(true);
      setError(null);
    }, 0);
    guidesApi
      .getGuideProfile(guideId)
      .then((data) => {
        if (!cancelled) setTimeout(() => setProfile(data), 0);
      })
      .catch(() => {
        // City-catalog guides are not all seeded in the backend. Fall back to
        // the standardized local profile so a valid id still opens its own page
        // instead of an error or another guide's data.
        const localProfile = getLocalGuideProfile(guideId);
        if (cancelled) return;
        if (localProfile) setTimeout(() => setProfile(localProfile), 0);
        else setTimeout(() => setError('We could not load this guide profile.'), 0);
      })
      .finally(() => {
        if (!cancelled) setTimeout(() => setLoading(false), 0);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Cover first, then the rest of the gallery, without duplicates.
  const photos = useMemo(() => {
    if (!profile) return [];
    const all = [profile.image, ...(profile.gallery ?? [])].filter(
      (url): url is string => typeof url === 'string' && url.trim() !== ''
    );
    return Array.from(new Set(all));
  }, [profile]);

  const pageShell = (children: React.ReactNode) => (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );

  if (loading) {
    return pageShell(
      <div className="container mx-auto max-w-6xl px-4 py-16">
        <div className="animate-pulse space-y-6">
          <div className="h-56 rounded-3xl bg-slate-200" />
          <div className="h-8 w-1/3 rounded bg-slate-200" />
          <div className="h-4 w-2/3 rounded bg-slate-200" />
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="h-44 rounded-2xl bg-slate-200" />
            <div className="h-44 rounded-2xl bg-slate-200" />
            <div className="h-44 rounded-2xl bg-slate-200" />
          </div>
        </div>
        <p className="mt-8 text-center text-sm text-slate-500">Loading guide profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return pageShell(
      <div className="container mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Guide profile unavailable</h1>
        <p className="mt-3 text-slate-600">{error ?? 'Guide not found.'}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={goBack}
            className="rounded-full border border-slate-200 px-5 py-2 text-sm font-bold text-slate-700 hover:bg-white"
          >
            Go back
          </button>
          <Link
            to="/listings"
            className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-white hover:bg-primary-hover"
          >
            Browse experiences
          </Link>
        </div>
      </div>
    );
  }

  const coverImage = safeImage(photos[0] ?? profile.gallery?.[0] ?? profile.image);
  const avatar = safeImage(profile.image);
  const joined = monthYear(profile.memberSince);
  const location = profile.livesIn || profile.cities?.[0] || profile.region;
  const languages = profile.languages ?? [];
  const cities = profile.cities ?? [];
  const experiences = profile.experiences ?? [];
  const experienceLabel = experiences.length === 1 ? 'experience' : 'experiences';

  return pageShell(
    <>
      {/* Cover photo and identity block */}
      <div className="relative">
        <div className="relative h-56 w-full overflow-hidden bg-slate-200 sm:h-72">
          <img
            src={coverImage}
            alt={`${profile.name} cover`}
            className="h-full w-full object-cover"
            onError={(e) => (e.currentTarget.src = PLACEHOLDER_IMAGE)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent" />
          <button
            type="button"
            onClick={goBack}
            className="absolute left-4 top-4 z-10 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-white"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        </div>
        <div className="container mx-auto max-w-6xl px-4">
          <div className="-mt-16 flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
            <img
              src={avatar}
              alt={profile.name}
              className="h-32 w-32 rounded-full border-4 border-white object-cover shadow-lg"
              onError={(e) => (e.currentTarget.src = PLACEHOLDER_IMAGE)}
            />
            <div className="pb-2 sm:pb-3">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">{profile.name}</h1>
                {profile.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700 ring-1 ring-green-100">
                    <ShieldCheck className="h-3.5 w-3.5" /> Verified guide
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-slate-500">
                {profile.role || 'Experience Guide'}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
                <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                  <Star className="h-4 w-4 fill-brand-yellow text-brand-yellow" />
                  {profile.rating.toFixed(2)}
                  <span className="font-normal text-slate-500">({profile.reviews} reviews)</span>
                </span>
                {location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> {location}
                  </span>
                )}
                {joined && (
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="h-4 w-4" /> Guiding since {joined}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 pb-16 pt-8">
        {/* Quick facts */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            {
              icon: <Compass className="h-4 w-4" />,
              label: 'Experiences',
              value: profile.stats.experiences,
            },
            { icon: <MapPin className="h-4 w-4" />, label: 'Cities', value: profile.stats.cities },
            {
              icon: <Languages className="h-4 w-4" />,
              label: 'Languages',
              value: profile.stats.languages,
            },
            {
              icon: <Star className="h-4 w-4" />,
              label: 'Reviews',
              value: profile.stats.reviews,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
            >
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
                {item.icon} {item.label}
              </span>
              <p className="mt-1 text-2xl font-bold text-slate-900">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            {/* About */}
            <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">About {profile.name}</h2>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-slate-600">
                {profile.bio?.trim()
                  ? profile.bio
                  : `${profile.name} has not written a bio yet. Browse their experiences below to see what they lead around ${
                      location ?? 'Nepal'
                    }.`}
              </p>

              {languages.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Speaks
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {languages.map((language) => (
                      <span
                        key={language}
                        className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700"
                      >
                        {language}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {cities.length > 0 && (
                <div className="mt-5">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Guides in
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {cities.map((city) => (
                      <span
                        key={city}
                        className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-700"
                      >
                        <MapPin className="h-3.5 w-3.5" /> {city}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Photos */}
            {photos.length > 1 && (
              <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900">Photos</h2>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {photos.map((photo, index) => (
                    <button
                      key={`${photo}-${index}`}
                      type="button"
                      onClick={() =>
                        setLightbox({ src: photo, alt: `${profile.name} photo ${index + 1}` })
                      }
                      className="group overflow-hidden rounded-xl"
                    >
                      <img
                        src={photo}
                        alt={`${profile.name} photo ${index + 1}`}
                        className="h-32 w-full cursor-zoom-in object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => (e.currentTarget.src = PLACEHOLDER_IMAGE)}
                      />
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Experiences led by this guide */}
            <section
              id="guide-experiences"
              className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {experiences.length > 0 ? `Experiences with ${profile.name}` : 'Experiences'}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {experiences.length > 0
                      ? `${experiences.length} ${experienceLabel} this guide leads, bookable right here.`
                      : 'No experiences published yet.'}
                  </p>
                </div>
                <Link to="/listings" className="text-sm font-bold text-primary hover:underline">
                  See all experiences
                </Link>
              </div>

              {experiences.length === 0 ? (
                <div className="mt-6 rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                  This guide has no published experiences at the moment.
                </div>
              ) : (
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  {experiences.map((experience) => {
                    const soldOut = experience.availableSlots === 0;
                    return (
                      <Link
                        key={experience.slug}
                        to={experienceSlugPath(experience.slug)}
                        className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 shadow-sm transition-shadow hover:shadow-md"
                      >
                        <div className="relative h-40 overflow-hidden bg-slate-100">
                          <img
                            src={safeImage(experience.heroImage)}
                            alt={experience.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => (e.currentTarget.src = PLACEHOLDER_IMAGE)}
                          />
                          {soldOut && (
                            <span className="absolute left-3 top-3 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">
                              Sold out
                            </span>
                          )}
                        </div>
                        <div className="flex flex-1 flex-col p-4">
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                            {[experience.category, experience.city].filter(Boolean).join(' · ')}
                          </p>
                          <h3 className="mt-1 font-bold text-slate-900 group-hover:text-primary">
                            {experience.title}
                          </h3>
                          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                            {experience.duration && (
                              <span className="inline-flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" /> {experience.duration}
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1">
                              <Star className="h-3.5 w-3.5 fill-brand-yellow text-brand-yellow" />
                              {experience.rating.toFixed(2)} ({experience.reviews})
                            </span>
                            {typeof experience.availableSlots === 'number' && (
                              <span className="inline-flex items-center gap-1">
                                <Users className="h-3.5 w-3.5" /> {experience.availableSlots} slots
                                left
                              </span>
                            )}
                          </div>
                          <div className="mt-3 flex items-baseline gap-1 border-t border-slate-100 pt-3">
                            <span className="text-lg font-bold text-secondary">
                              {formatPrice(experience.price, 'USD')}
                            </span>
                            <span className="text-xs text-slate-500">/ person</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-lg">
                <h3 className="text-lg font-bold text-slate-900">Plan with {profile.name}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {experiences.length > 0
                    ? `Pick one of ${profile.name}'s ${experiences.length} ${experienceLabel}, or ask for a custom plan.`
                    : 'Ask this guide to plan something just for you.'}
                </p>

                <dl className="mt-5 space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <dt className="inline-flex items-center gap-1.5 text-slate-500">
                      <Star className="h-4 w-4 text-brand-yellow" /> Rating
                    </dt>
                    <dd className="font-bold text-slate-900">{profile.rating.toFixed(2)} / 5</dd>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-slate-500">Reviews</dt>
                    <dd className="font-bold text-slate-900">{profile.reviews}</dd>
                  </div>
                  {joined && (
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-slate-500">Guiding since</dt>
                      <dd className="font-bold text-slate-900">{joined}</dd>
                    </div>
                  )}
                  {profile.region && (
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-slate-500">Region</dt>
                      <dd className="font-bold text-slate-900">{profile.region}</dd>
                    </div>
                  )}
                  {location && (
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-slate-500">Based in</dt>
                      <dd className="font-bold text-slate-900">{location}</dd>
                    </div>
                  )}
                  {languages.length > 0 && (
                    <div className="flex items-start justify-between gap-2">
                      <dt className="text-slate-500">Speaks</dt>
                      <dd className="text-right font-bold text-slate-900">
                        {languages.join(', ')}
                      </dd>
                    </div>
                  )}
                </dl>

                <Link
                  to={`/local/${profile.id}/contact`}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-bold text-white transition-colors hover:bg-primary-hover"
                >
                  <MessageCircle className="h-4 w-4" /> Message {profile.name}
                </Link>
                {experiences.length > 0 && (
                  <a
                    href="#guide-experiences"
                    className="mt-3 flex w-full items-center justify-center rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    See their experiences
                  </a>
                )}
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-5 text-sm text-slate-600 shadow-sm">
                <p className="inline-flex items-center gap-1.5 font-bold text-slate-900">
                  <ShieldCheck className="h-4 w-4 text-green-600" /> Travel with confidence
                </p>
                <p className="mt-2">
                  Every Guides-Nepal guide is reviewed by our regional team, and each booking shown
                  here is confirmed before you pay.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {lightbox && (
        <ImageLightbox src={lightbox.src} alt={lightbox.alt} onClose={() => setLightbox(null)} />
      )}
    </>
  );
};

export default GuideProfilePage;
