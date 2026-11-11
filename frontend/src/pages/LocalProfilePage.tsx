import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useGoBack } from '../utils/backNavigation';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import {
  Star,
  ShieldCheck,
  MapPin,
  MessageCircle,
  Clock,
  Check,
  Share,
  Play,
  Package,
  Award,
  X,
  ArrowLeft,
  CalendarDays,
  Users,
} from 'lucide-react';
import { kathmanduRichData } from '../data/kathmanduRichData';
import { pokharaRichData } from '../data/pokharaRichData';
import { lalitpurRichData } from '../data/lalitpurRichData';
import { bhaktapurRichData } from '../data/bhaktapurRichData';
import { bharatpurRichData } from '../data/bharatpurRichData';
import { findGuideBySlug } from '../utils/guideUrl';
import { findGuideById } from '../data/guidesData';
import { useCurrency } from '../contexts/CurrencyContext';
import { experienceDetailPath, experienceSlugPath } from '../utils/canonicalExperience';
import { ImageLightbox } from '../components/common/ImageLightbox';
import guidesApi, { type GuideProfile } from '../services/guidesApi';
import type { Guide } from '../data/types';

const PLACEHOLDER_IMAGE = '/images/placeholder.svg';

// City catalogs reuse numeric guide ids, so every tour is collected once and
// de-duplicated by slug when a guide's portfolio is assembled.
const allExperiences = [
  ...kathmanduRichData,
  ...pokharaRichData,
  ...lalitpurRichData,
  ...bhaktapurRichData,
  ...bharatpurRichData,
];

const sanitizeImageUrl = (url: unknown): string => {
  if (typeof url !== 'string') return PLACEHOLDER_IMAGE;
  if (/[\s"'<>\\]/.test(url)) return PLACEHOLDER_IMAGE;
  if (url.startsWith('/') && !url.startsWith('//')) return encodeURI(url);
  try {
    const parsed = new URL(url, 'https://invalid.local');
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return PLACEHOLDER_IMAGE;
    if (parsed.hostname === 'invalid.local') return PLACEHOLDER_IMAGE;
    return parsed.protocol + '//' + parsed.host + parsed.pathname + parsed.search;
  } catch {
    return PLACEHOLDER_IMAGE;
  }
};

const formatMonthYear = (value?: string | null): string | null => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
};

/** One experience card in the "Book one of my offers" list. */
interface OfferCard {
  key: string;
  title: string;
  city?: string | null;
  description?: string | null;
  duration?: string | null;
  category?: string | null;
  price: number;
  rating?: number | null;
  reviews?: number | null;
  availableSlots?: number | null;
  heroImage: string;
  /** Shown when the experience image itself fails to load. */
  fallbackImage: string;
  href: string;
}

/** Everything the profile renders, merged from the API and the local catalog. */
interface ProfileView {
  id: number;
  slug?: string | null;
  name: string;
  role: string;
  image: string;
  rating: number;
  reviews: number;
  bio: string;
  languages: string[];
  cities: string[];
  gallery: string[];
  verified: boolean;
  livesIn?: string | null;
  memberSince?: string | null;
  region?: string | null;
  responseTime?: string;
  experiences: OfferCard[];
}

const localGuideForProfile = (staticGuide: Guide | undefined, profile: GuideProfile | null) => {
  // A numeric id can belong to a different person in the local catalog, so only
  // reuse local content when the names agree.
  if (!staticGuide) return undefined;
  if (profile && staticGuide.name.toLowerCase() !== profile.name.toLowerCase()) return undefined;
  return staticGuide;
};

const buildView = (
  profile: GuideProfile | null,
  staticGuide: Guide | undefined
): ProfileView => {
  const local = localGuideForProfile(staticGuide, profile);
  const galleryFromApi = (profile?.gallery ?? []).filter(
    (url) => typeof url === 'string' && url.trim() !== ''
  );
  const galleryFromLocal = (local?.gallery ?? []).filter(
    (url) => typeof url === 'string' && url.trim() !== ''
  );

  const coverFallback = galleryFromApi[0] ?? galleryFromLocal[0] ?? PLACEHOLDER_IMAGE;

  const apiExperiences = (profile?.experiences ?? []).map<OfferCard>((experience) => {
    const localMatch = allExperiences.find(
      (tour) => tour.title.toLowerCase() === experience.title.toLowerCase()
    );
    return {
      key: `api-${experience.slug}`,
      title: experience.title,
      city: experience.city,
      duration: experience.duration,
      category: experience.category,
      price: Number(experience.price) || 0,
      rating: experience.rating,
      reviews: experience.reviews,
      availableSlots: experience.availableSlots,
      heroImage: experience.heroImage,
      fallbackImage: localMatch?.heroImage || coverFallback,
      href: experienceSlugPath(experience.slug),
    };
  });

  const localExperiences: OfferCard[] = local
    ? Array.from(
        new Map(
          allExperiences
            .filter((tour) => tour.guides?.some((g) => g.id === local.id))
            .map((tour) => [tour.slug, tour])
        ).values()
      ).map((tour) => ({
        key: `local-${tour.slug}`,
        title: tour.title,
        city: tour.city,
        description: tour.description,
        duration: tour.duration,
        category: tour.type,
        price: Number(tour.price) || 0,
        rating: tour.rating,
        reviews: tour.reviews,
        availableSlots: null,
        heroImage: tour.heroImage,
        fallbackImage: coverFallback,
        href: experienceDetailPath((tour.city || 'kathmandu').toLowerCase(), tour.slug),
      }))
    : [];

  // Database experiences are authoritative and come first; local catalog tours
  // fill in the guide's remaining portfolio.
  const experiences = [
    ...apiExperiences,
    ...localExperiences.filter(
      (offer) => !apiExperiences.some((apiOffer) => apiOffer.title === offer.title)
    ),
  ];

  const cities = profile?.cities?.length ? profile.cities : (local?.cities ?? []);
  const languages = profile?.languages?.length ? profile.languages : (local?.languages ?? []);

  return {
    id: profile?.id ?? local?.id ?? 0,
    slug: profile?.slug ?? null,
    name: profile?.name ?? local?.name ?? 'Guide',
    role: profile?.role || local?.role || 'Experience Guide',
    image: sanitizeImageUrl(profile?.image || local?.image),
    rating: Number(profile?.rating ?? local?.rating ?? 0),
    reviews: Number(profile?.reviews ?? local?.reviews ?? 0),
    bio: (profile?.bio || '').trim() || (local?.bio || '').trim(),
    languages,
    cities,
    // A guide whose only photo is their avatar gains nothing from a one-image
    // grid, so the catalog gallery is preferred until the API has a real set.
    gallery: galleryFromApi.length > 1 ? galleryFromApi : galleryFromLocal,
    verified: Boolean(profile?.verified ?? local?.verified),
    livesIn: profile?.livesIn || local?.livesIn,
    memberSince: profile?.memberSince ?? null,
    region: profile?.region ?? null,
    responseTime: local?.responseTime,
    experiences,
  };
};

/**
 * Public profile of one guide, addressed either by slug
 * (``/guidesprofile/sujal``) or by catalog id (``/guides/2``).
 *
 * The page is the single shared template for every guide: it fetches the guide
 * profile payload and shows their identity, languages, cities, rating, joined
 * date, photos and every experience they lead.
 */
const GuideProfilePage: React.FC = () => {
  const { slug, id } = useParams<{ slug?: string; id?: string }>();
  const navigate = useNavigate();
  const goBack = useGoBack();
  const { formatPrice } = useCurrency();

  const [profile, setProfile] = useState<GuideProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);
  const [shareLabel, setShareLabel] = useState('Share');
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [heroSrc, setHeroSrc] = useState<string | null>(null);

  const staticGuide = useMemo(() => {
    if (slug) return findGuideBySlug(slug);
    if (id && Number.isInteger(Number(id))) return findGuideById(Number(id));
    return undefined;
  }, [slug, id]);

  useEffect(() => {
    const guideId = id ? Number(id) : NaN;
    if (!slug && !Number.isFinite(guideId)) {
      setProfile(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setIsBioExpanded(false);
    setProfile(null);
    setAvatarSrc(null);
    setHeroSrc(null);

    const request = slug
      ? guidesApi.getGuideProfileBySlug(slug)
      : guidesApi.getGuideProfile(guideId);

    request
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch(() => {
        // A guide that exists only in the local catalog still has a profile.
        if (!cancelled) setProfile(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug, id]);

  const view = useMemo(() => buildView(profile, staticGuide), [profile, staticGuide]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col font-sans bg-white">
        <Header />
        <main id="main-content" className="flex-grow bg-gray-50/50">
          <div className="container mx-auto max-w-6xl px-4 py-16">
            <div className="animate-pulse space-y-6">
              <div className="h-96 rounded-2xl bg-gray-200" />
              <div className="h-8 w-1/3 rounded bg-gray-200" />
              <div className="h-4 w-2/3 rounded bg-gray-200" />
              <div className="h-40 rounded-2xl bg-gray-200" />
            </div>
            <p className="mt-8 text-center text-sm text-gray-500">Loading guide profile...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!profile && !staticGuide) {
    return (
      <div className="min-h-screen flex flex-col font-sans bg-white">
        <Header />
        <main id="main-content" className="flex-grow bg-gray-50/50">
          <div className="container mx-auto px-4 py-20 max-w-2xl text-center">
            <h1 className="text-2xl font-bold text-gray-900">Guide profile not found</h1>
            <p className="mt-3 text-gray-600">
              This guide is no longer available. Browse our experiences to meet another local.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={goBack}
                className="rounded-full bg-[#213448] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#1a2a3a]"
              >
                Go back
              </button>
              <Link
                to="/listings"
                className="rounded-full border border-gray-200 px-6 py-2.5 text-sm font-bold text-gray-700 hover:bg-white"
              >
                Browse experiences
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const safeGuideImage = avatarSrc ?? sanitizeImageUrl(view.image);
  const galleryPhotos = view.gallery
    .map((photo) => sanitizeImageUrl(photo))
    .filter((photo) => photo !== PLACEHOLDER_IMAGE);
  const coverPhoto = heroSrc ?? galleryPhotos[0] ?? safeGuideImage;
  const joined = formatMonthYear(view.memberSince);
  const profileSlug = view.slug ?? slug ?? String(view.id);
  const contactPath = `/guidesprofile/${profileSlug}/contact`;
  const galleryPath = `/guidesprofile/${profileSlug}/gallery`;
  const livesIn = view.livesIn || view.cities[0];
  const responseTime = view.responseTime || 'within a few hours';
  const ratingStars = Math.round(view.rating);
  const hasLongBio = view.bio.length > 360;

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${view.name} | Guides Nepal`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShareLabel('Link copied');
      window.setTimeout(() => setShareLabel('Share'), 1800);
    } catch {
      // Sharing is best-effort; a dismissed sheet is not an error worth showing.
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white">
      <Header />

      <main id="main-content" className="flex-grow bg-gray-50/50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <button
            onClick={goBack}
            className="flex items-center gap-2 font-bold text-gray-600 transition-colors hover:text-[#213448] hover:bg-white/20 px-4 py-2 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <div className="flex flex-col lg:flex-row gap-12">
            {/* Left Sidebar - Sticky Profile Card */}
            <div className="lg:w-1/3">
              <div className="sticky top-24 space-y-6">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-3">
                      <div className="w-28 h-28 rounded-full p-1 border-2 border-[#213448]">
                        <img
                          src={safeGuideImage}
                          alt={view.name}
                          className="w-full h-full rounded-full object-cover"
                          onError={() => {
                            const fallback = sanitizeImageUrl(staticGuide?.image);
                            setAvatarSrc(
                              safeGuideImage !== fallback ? fallback : PLACEHOLDER_IMAGE
                            );
                          }}
                        />
                      </div>
                      {view.verified && (
                        <div
                          className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow-md"
                          title="Verified Host"
                        >
                          <ShieldCheck className="w-4 h-4 text-[#213448] fill-white" />
                        </div>
                      )}
                    </div>

                    <h1 className="text-xl font-bold text-gray-900 mb-0.5">{view.name}</h1>
                    <p className="text-[#213448] font-bold text-xs uppercase tracking-wide mb-3">
                      {view.role}
                    </p>

                    <div className="flex items-center gap-1 mb-4">
                      <div className="flex text-[#ffba0a]">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < ratingStars ? 'fill-current' : 'text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-bold text-gray-900 text-sm">
                        {view.rating.toFixed(2)}
                      </span>
                      <span className="text-gray-500 text-xs">({view.reviews} reviews)</span>
                    </div>

                    <div className="w-full space-y-3 text-left border-t border-gray-100 pt-4">
                      {livesIn && (
                        <div className="flex items-start gap-2.5 text-xs text-gray-600">
                          <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-gray-900 block">Lives in</span>
                            {livesIn}
                          </div>
                        </div>
                      )}

                      {view.cities.length > 0 && (
                        <div className="flex items-start gap-2.5 text-xs text-gray-600">
                          <MapPin className="w-4 h-4 text-[#213448] shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-gray-900 block">Guides in</span>
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {view.cities.map((city) => (
                                <span
                                  key={city}
                                  className="bg-[#213448]/10 text-[#213448] text-[10px] px-1.5 py-0.5 rounded font-bold"
                                >
                                  {city}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {view.languages.length > 0 && (
                        <div className="flex items-start gap-2.5 text-xs text-gray-600">
                          <MessageCircle className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-gray-900 block">Speaks</span>
                            {view.languages.join(', ')}
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-2.5 text-xs text-gray-600">
                        <Clock className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-gray-900 block">Response time</span>
                          {responseTime}
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 text-xs text-gray-600">
                        <Package className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-gray-900 block">Experience</span>
                          {view.experiences.length > 0
                            ? `${view.experiences.length} ${
                                view.experiences.length === 1 ? 'offer' : 'offers'
                              }`
                            : 'Custom tours'}
                        </div>
                      </div>

                      {joined && (
                        <div className="flex items-start gap-2.5 text-xs text-gray-600">
                          <CalendarDays className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-gray-900 block">Guiding since</span>
                            {joined}
                          </div>
                        </div>
                      )}

                      {view.region && (
                        <div className="flex items-start gap-2.5 text-xs text-gray-600">
                          <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-gray-900 block">Region</span>
                            {view.region}
                          </div>
                        </div>
                      )}

                      {view.verified && (
                        <div className="flex items-start gap-2.5 text-xs text-gray-600">
                          <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-gray-900 block">Verified Host</span>
                            <span className="text-[10px]">Identity & contact info verified</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        navigate(contactPath);
                        window.scrollTo({ top: 0, behavior: 'instant' });
                      }}
                      className="w-full mt-6 bg-[#213448] hover:bg-[#1a2a3a] text-white font-bold py-2.5 rounded-full transition-colors shadow-lg shadow-primary/20 text-sm"
                    >
                      Contact me
                    </button>

                    <div className="mt-3 flex gap-2 w-full">
                      <button
                        onClick={handleShare}
                        className="flex-1 text-gray-500 text-xs font-medium hover:text-gray-900 flex items-center justify-center gap-1.5 py-1.5 rounded-full hover:bg-gray-50 transition-colors"
                      >
                        <Share className="w-3.5 h-3.5" /> {shareLabel}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Main Info */}
            <div className="lg:w-2/3 space-y-12">
              {/* Hero and bio */}
              <section>
                <div
                  className="relative rounded-2xl overflow-hidden mb-8 h-[400px] group shadow-sm cursor-zoom-in bg-gray-100"
                  onClick={() =>
                    setLightbox({
                      src: coverPhoto,
                      alt: `${view.name} cover photo`,
                    })
                  }
                >
                  <img
                    src={coverPhoto}
                    alt={view.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={() => {
                      const fallback = sanitizeImageUrl(staticGuide?.gallery?.[0]);
                      const next = fallback !== PLACEHOLDER_IMAGE ? fallback : PLACEHOLDER_IMAGE;
                      if (coverPhoto !== next) setHeroSrc(next);
                    }}
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm">
                    <Award className="w-5 h-5 text-gray-700" />
                  </div>
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Hi there! Nice to meet you
                </h2>

                <div className="prose prose-lg text-gray-600 max-w-none">
                  <p className="whitespace-pre-line">
                    {view.bio
                      ? view.bio
                      : `${view.name} hasn't written a bio yet. Browse their offers below to see what they lead around ${
                          livesIn || 'Nepal'
                        }.`}
                  </p>

                  <div className="flex flex-wrap gap-3 my-6 not-prose">
                    {view.verified && (
                      <div className="flex items-center gap-1 text-xs font-bold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
                        <Check className="w-3.5 h-3.5 text-green-500" /> Verified guide
                      </div>
                    )}
                    {view.languages.length > 0 && (
                      <div className="flex items-center gap-1 text-xs font-bold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
                        <MessageCircle className="w-3.5 h-3.5 text-[#213448]" />{' '}
                        {view.languages.join(' / ')}
                      </div>
                    )}
                    {view.cities.length > 0 && (
                      <div className="flex items-center gap-1 text-xs font-bold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
                        <MapPin className="w-3.5 h-3.5 text-[#213448]" /> {view.cities.join(' · ')}
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-xs font-bold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
                      <Clock className="w-3.5 h-3.5 text-[#213448]" /> Replies {responseTime}
                    </div>
                  </div>

                  {isBioExpanded && view.bio && (
                    <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      <p>
                        Every trip is planned around your pace and interests — tell {view.name}{' '}
                        what you would like to see and the day is adjusted around it.
                      </p>
                      {joined && (
                        <p>
                          {view.name} has been guiding travellers with Guides-Nepal since {joined}
                          {view.region ? `, covering ${view.region}` : ''}.
                        </p>
                      )}
                    </div>
                  )}

                  {hasLongBio && (
                    <button
                      onClick={() => setIsBioExpanded(!isBioExpanded)}
                      className="text-[#213448] font-bold text-sm uppercase tracking-wide mt-4 hover:underline"
                    >
                      {isBioExpanded ? 'Read less' : 'Read more'}
                    </button>
                  )}
                </div>
              </section>

              {/* Gallery Section */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">My thoughts in pictures</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {galleryPhotos.slice(0, 6).map((img, i) => (
                    <div
                      key={`${img}-${i}`}
                      onClick={() => setLightbox({ src: img, alt: `${view.name} photo ${i + 1}` })}
                      className="aspect-[4/3] rounded-xl overflow-hidden cursor-zoom-in hover:opacity-90 transition-opacity shadow-sm"
                    >
                      <img
                        src={img}
                        alt={`${view.name} photo ${i + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => (e.currentTarget.src = PLACEHOLDER_IMAGE)}
                      />
                    </div>
                  ))}
                  {galleryPhotos.length < 2 && (
                    <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                      More moments coming soon
                    </div>
                  )}
                </div>
                {galleryPhotos.length > 2 && (
                  <button
                    onClick={() => {
                      navigate(galleryPath);
                      window.scrollTo({ top: 0, behavior: 'instant' });
                    }}
                    className="text-[#213448] font-bold text-sm uppercase tracking-wide mt-4 hover:underline"
                  >
                    View all photos
                  </button>
                )}
              </section>

              {/* Offers Section */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Book one of my offers</h2>
                <p className="text-gray-500 mb-8">
                  Check out the personalized tours I can offer you across Nepal. Each experience can
                  be 100% tailored to your wishes!
                </p>

                <div className="space-y-6">
                  {view.experiences.length > 0 ? (
                    view.experiences.map((offer) => (
                      <Link
                        key={offer.key}
                        to={offer.href}
                        onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
                        className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md border border-gray-100 transition-all flex flex-col md:flex-row gap-6 group"
                      >
                        <div className="w-full md:w-48 h-48 md:h-auto rounded-xl overflow-hidden shrink-0 relative bg-gray-100">
                          <img
                            src={sanitizeImageUrl(offer.heroImage)}
                            alt={offer.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              const fallback = sanitizeImageUrl(offer.fallbackImage);
                              const target = e.currentTarget;
                              if (target.src !== fallback) target.src = fallback;
                              else target.src = PLACEHOLDER_IMAGE;
                            }}
                          />
                          <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide text-gray-800">
                            {offer.city || 'Nepal'}
                          </div>
                        </div>

                        <div className="flex flex-col justify-between py-2 flex-grow">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#213448] transition-colors">
                              {offer.title}
                            </h3>
                            {offer.description && (
                              <p className="text-gray-500 line-clamp-2 text-sm mb-4">
                                {offer.description}
                              </p>
                            )}
                            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-600 uppercase tracking-wide">
                              {offer.duration && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" /> {offer.duration}
                                </span>
                              )}
                              {offer.duration && offer.category && (
                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                              )}
                              {offer.category && <span>{offer.category}</span>}
                              {typeof offer.availableSlots === 'number' && (
                                <span className="flex items-center gap-1 text-gray-500">
                                  <Users className="w-4 h-4" /> {offer.availableSlots} slots left
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-50">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-[#ffba0a] text-[#ffba0a]" />
                              <span className="font-bold text-gray-900">
                                {(Number(offer.rating) || view.rating).toFixed(1)}
                              </span>
                              <span className="text-gray-400 text-sm">
                                ({offer.reviews ?? view.reviews})
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs text-gray-400 uppercase mr-2">From</span>
                              <span className="text-xl font-bold text-gray-900">
                                {formatPrice(offer.price, 'USD')}
                              </span>
                              <span className="text-xs text-gray-400"> pp</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                      <p className="text-gray-500">
                        No specific offers listed yet. Contact me for a custom tour!
                      </p>
                    </div>
                  )}
                </div>
              </section>

              {/* Review CTA */}
              <section className="bg-secondary/10 rounded-2xl p-8 text-center relative overflow-hidden">
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-full bg-white mx-auto mb-4 p-1 shadow-sm">
                    <img
                      src={safeGuideImage}
                      className="w-full h-full rounded-full object-cover"
                      alt={view.name}
                      onError={(e) => (e.currentTarget.src = PLACEHOLDER_IMAGE)}
                    />
                  </div>
                  <h3 className="text-xl font-bold text-[#213448] mb-2">Did you meet me?</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Share your experience with the community! Your review helps others find the best
                    local guides.
                  </p>
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="bg-[#213448] text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl hover:bg-[#1a2a3a] transition-all"
                  >
                    Leave a review
                  </button>
                </div>
                <div className="absolute -top-12 -left-12 w-32 h-32 bg-[#213448]/10 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-[#213448]/10 rounded-full blur-2xl"></div>
              </section>

              {/* Rating summary */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Reviews</h2>
                <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-6">
                  <div className="text-center sm:text-left">
                    <p className="text-4xl font-bold text-gray-900">{view.rating.toFixed(2)}</p>
                    <div className="flex justify-center sm:justify-start text-[#ffba0a] mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < ratingStars ? 'fill-current' : 'text-gray-200'}`}
                        />
                      ))}
                    </div>
                    <p className="text-gray-500 text-sm mt-1">
                      {view.reviews} {view.reviews === 1 ? 'review' : 'reviews'}
                    </p>
                  </div>
                  <p className="text-gray-500 text-sm sm:border-l sm:border-gray-100 sm:pl-6">
                    Written reviews appear here once travellers finish a trip with {view.name}.
                    Booked guests can add theirs with the button above.
                  </p>
                </div>
              </section>

              {/* This is Guides Nepal Section */}
              <section className="space-y-6 pt-8 border-t border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">This is Guides Nepal</h2>
                <div className="rounded-2xl overflow-hidden relative aspect-video group cursor-pointer">
                  <img
                    src="https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1740&q=80"
                    alt="This is Guides Nepal"
                    className="w-full h-full object-cover brightness-75 group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/50 transition-colors">
                      <Play className="w-8 h-8 fill-white text-white ml-1" />
                    </div>
                  </div>
                </div>
              </section>

              {/* App Download Banner */}
              <section className="bg-[#570D46] rounded-2xl p-8 md:p-12 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="relative z-10 max-w-md">
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">
                    Connect with locals wherever and whenever!
                  </h2>
                  <p className="text-white/80 mb-8">
                    Get the app to become part of the fastest growing travel community. Join now &
                    pull up a chair at the table with our hosts, friends and chefs!
                  </p>
                  <div className="flex gap-4">
                    <button className="bg-black/30 hover:bg-black/50 p-2 rounded-lg border border-white/20 flex items-center gap-2 pr-4 transition-colors">
                      <div className="w-6 h-6 bg-white rounded-full"></div>
                      <div className="text-left">
                        <div className="text-[10px] uppercase">Download on the</div>
                        <div className="text-sm font-bold leading-none">App Store</div>
                      </div>
                    </button>
                    <button className="bg-black/30 hover:bg-black/50 p-2 rounded-lg border border-white/20 flex items-center gap-2 pr-4 transition-colors">
                      <div className="w-6 h-6 bg-white rounded-full"></div>
                      <div className="text-left">
                        <div className="text-[10px] uppercase">Get it on</div>
                        <div className="text-sm font-bold leading-none">Google Play</div>
                      </div>
                    </button>
                  </div>
                </div>
                <div className="relative z-10 w-64 md:w-80 shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?auto=format&fit=crop&w=800&q=80"
                    alt="App Preview"
                    className="w-full rounded-2xl shadow-2xl border-4 border-white/10 rotate-6 hover:rotate-0 transition-transform duration-500"
                  />
                </div>
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-[#213448]/20 to-transparent pointer-events-none"></div>
              </section>
            </div>
          </div>
        </div>
      </main>

      {/* Review Modal */}
      {showReviewModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowReviewModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Leave a Review</h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={safeGuideImage}
                  alt={view.name}
                  className="w-16 h-16 rounded-full object-cover"
                  onError={(e) => (e.currentTarget.src = PLACEHOLDER_IMAGE)}
                />
                <div>
                  <p className="text-sm text-gray-500">Reviewing</p>
                  <h4 className="font-bold text-gray-900 text-lg">{view.name}</h4>
                </div>
              </div>

              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (selectedRating === 0) {
                    alert('Please select a rating!');
                    return;
                  }
                  alert(
                    `Thank you for your ${selectedRating}-star review! It will be posted after moderation.`
                  );
                  setShowReviewModal(false);
                  setSelectedRating(0);
                }}
              >
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setSelectedRating(star)}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-8 h-8 transition-colors ${
                            star <= selectedRating
                              ? 'text-[#ffba0a] fill-[#ffba0a]'
                              : 'text-gray-300 hover:text-[#ffba0a] hover:fill-[#ffba0a]'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Your experience
                  </label>
                  <textarea
                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-[#213448] focus:border-transparent outline-none min-h-[120px]"
                    placeholder="Tell us about your tour..."
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#213448] hover:bg-[#1a2a3a] text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-primary/20"
                >
                  Submit Review
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {lightbox && (
        <ImageLightbox src={lightbox.src} alt={lightbox.alt} onClose={() => setLightbox(null)} />
      )}

      <Footer />
    </div>
  );
};

export default GuideProfilePage;
