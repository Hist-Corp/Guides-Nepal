import { bhaktapurRichData } from '../data/bhaktapurRichData';
import { bharatpurRichData } from '../data/bharatpurRichData';
import { findGuideById } from '../data/guidesData';
import { kathmanduRichData } from '../data/kathmanduRichData';
import { lalitpurRichData } from '../data/lalitpurRichData';
import { pokharaRichData } from '../data/pokharaRichData';
import type { Guide } from '../data/types';
import type { GuideProfile, GuideProfileExperience } from '../services/guidesApi';

/** Every city catalog, so a guide's portfolio is complete on any profile. */
const cityCatalogs = [
  kathmanduRichData,
  pokharaRichData,
  lalitpurRichData,
  bhaktapurRichData,
  bharatpurRichData,
];

export const findLocalGuide = (id: number): Guide | undefined => findGuideById(id);

/** Published experiences led by one guide, de-duplicated by slug. */
export function getGuidePortfolio(guideId: number): GuideProfileExperience[] {
  const seen = new Set<string>();
  const experiences: GuideProfileExperience[] = [];

  for (const experience of cityCatalogs.flat()) {
    if (seen.has(experience.slug)) continue;
    if (!experience.guides?.some((guide) => guide.id === guideId)) continue;

    seen.add(experience.slug);
    experiences.push({
      slug: experience.slug,
      title: experience.title,
      city: experience.city ?? null,
      category: experience.type ?? null,
      heroImage: experience.heroImage,
      price: experience.price ?? 0,
      duration: experience.duration ?? null,
      rating: experience.rating ?? 0,
      reviews: experience.reviews ?? 0,
      availableSlots: null,
    });
  }

  return experiences;
}

/**
 * Standardized profile for a guide that only lives in the frontend catalog.
 * The public `/guides/:id` page uses this when the backend has no row for the
 * id (city-catalog guides are not all seeded in the API), so every guide gets
 * the same shape of profile and portfolio.
 */
export function buildLocalGuideProfile(guide: Guide): GuideProfile {
  const experiences = getGuidePortfolio(guide.id);
  const cities = new Set(
    [...(guide.cities ?? []), ...experiences.map((experience) => experience.city)].filter(
      (city): city is string => typeof city === 'string' && city.trim() !== ''
    )
  );

  return {
    ...guide,
    gallery: guide.gallery && guide.gallery.length > 0 ? guide.gallery : [guide.image],
    verified: guide.verified ?? false,
    is_active: true,
    memberSince: null,
    region: guide.livesIn ?? guide.cities?.[0] ?? null,
    experiences,
    stats: {
      experiences: experiences.length,
      cities: cities.size || guide.cities?.length || 0,
      languages: guide.languages?.length ?? 0,
      rating: guide.rating,
      reviews: guide.reviews,
    },
  };
}

/** Resolve a guide from the local catalog, for deep links and API fallbacks. */
export function getLocalGuideProfile(guideId: number): GuideProfile | null {
  const guide = findLocalGuide(guideId);
  return guide ? buildLocalGuideProfile(guide) : null;
}
