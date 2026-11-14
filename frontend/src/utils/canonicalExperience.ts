import { bhaktapurRichData } from '../data/bhaktapurRichData';
import { bharatpurRichData } from '../data/bharatpurRichData';
import { kathmanduRichData } from '../data/kathmanduRichData';
import { lalitpurRichData } from '../data/lalitpurRichData';
import { pokharaRichData } from '../data/pokharaRichData';

const cityExperiences = [
  { city: 'kathmandu', experiences: kathmanduRichData },
  { city: 'pokhara', experiences: pokharaRichData },
  { city: 'lalitpur', experiences: lalitpurRichData },
  { city: 'bhaktapur', experiences: bhaktapurRichData },
  { city: 'bharatpur', experiences: bharatpurRichData },
];

const normalize = (value: string) => value.trim().toLowerCase();

// Detail URL kinds: treks live at /trek/<slug> and hikes at /hike/<slug>;
// everything else keeps the city-owned /city/<city>/experience/<slug> route.
export type ExperienceKind = 'trek' | 'hike';

export const getExperienceKind = (slug: string): ExperienceKind | undefined =>
  slug.endsWith('-trek') ? 'trek' : slug.endsWith('-hike') ? 'hike' : undefined;

/** Canonical detail path for an experience owned by a city catalog. */
export const experienceDetailPath = (city: string, slug: string): string => {
  const kind = getExperienceKind(slug);
  return kind ? `/${kind}/${slug}` : `/city/${city}/experience/${slug}`;
};

/** City that owns a slug's detail page, when it is part of a catalog. */
export const getExperienceCity = (slug: string): string | undefined =>
  cityExperiences.find((catalog) => catalog.experiences.some((item) => item.slug === slug))?.city;

// Legacy global experience slugs that never existed in a city catalog but
// belong to a city-owned experience. Keyed by legacy slug, valued by the
// canonical city slug.
// (annapurna-circuit-trek now has its own dedicated pokharaRichData entry.)
const legacySlugAliases: Record<string, string> = {};

export interface CanonicalExperience {
  path: string;
  heroImage: string;
}

export interface CatalogSearchExperience {
  id: number;
  slug: string;
  title: string;
  city: string;
  category: string;
  heroImage: string;
  description: string;
  price: number;
  duration: string;
  rating: number;
  reviews: number;
  host: {
    name: string;
    image: string;
  };
  path: string;
}

/** Complete city catalog used by discovery surfaces such as search. */
export const getCatalogSearchExperiences = (): CatalogSearchExperience[] =>
  cityExperiences.flatMap(({ city, experiences }) =>
    experiences.map((experience) => ({
      id: experience.id,
      slug: experience.slug,
      title: experience.title,
      city: experience.city ?? city,
      category: experience.type ?? 'Experience',
      heroImage: experience.heroImage,
      description: experience.description,
      price: experience.price ?? 0,
      duration: experience.duration ?? '',
      rating: experience.rating ?? 0,
      reviews: experience.reviews ?? 0,
      host: {
        name: experience.host.name,
        image: experience.host.image,
      },
      path: experienceDetailPath(city, experience.slug),
    }))
  );

/** Returns the city detail route and image for a catalogued experience. */
export const getCanonicalExperience = (
  city: string | undefined,
  identifiers: Array<string | number | undefined>
): CanonicalExperience | undefined => {
  const cityCatalog = cityExperiences.find((entry) => entry.city === normalize(city ?? ''));
  if (!cityCatalog) return undefined;

  const identifierSet = new Set(
    identifiers.filter((value): value is string | number => value !== undefined).map(String)
  );
  const experience = cityCatalog.experiences.find(
    (item) =>
      identifierSet.has(item.slug) ||
      identifierSet.has(item.title) ||
      identifierSet.has(String(item.id))
  );

  return experience
    ? {
        path: experienceDetailPath(cityCatalog.city, experience.slug),
        heroImage: experience.heroImage,
      }
    : undefined;
};

/** Finds a city experience from a globally-scoped legacy slug. */
export const getCanonicalExperienceBySlug = (
  identifier: string
): CanonicalExperience | undefined => {
  const slug = legacySlugAliases[identifier] ?? identifier;
  for (const catalog of cityExperiences) {
    const experience = catalog.experiences.find((item) => item.slug === slug);
    if (experience) {
      return {
        path: experienceDetailPath(catalog.city, experience.slug),
        heroImage: experience.heroImage,
      };
    }
  }

  return undefined;
};

/**
 * Detail path from a bare slug (no city context): kind-first so every
 * trek/hike slug gets its /trek/... or /hike/... URL, then the canonical
 * city path, then the legacy global experience route.
 */
export const experienceSlugPath = (slug: string): string => {
  const kind = getExperienceKind(slug);
  if (kind) return `/${kind}/${slug}`;
  return getCanonicalExperienceBySlug(slug)?.path ?? `/experience/${slug}`;
};
