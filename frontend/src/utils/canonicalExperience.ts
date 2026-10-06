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
      path: `/city/${city}/experience/${experience.slug}`,
    })),
  );

/** Returns the city detail route and image for a catalogued experience. */
export const getCanonicalExperience = (
  city: string | undefined,
  identifiers: Array<string | number | undefined>,
): CanonicalExperience | undefined => {
  const cityCatalog = cityExperiences.find((entry) => entry.city === normalize(city ?? ''));
  if (!cityCatalog) return undefined;

  const identifierSet = new Set(
    identifiers.filter((value): value is string | number => value !== undefined).map(String),
  );
  const experience = cityCatalog.experiences.find(
    (item) => identifierSet.has(item.slug) || identifierSet.has(item.title) || identifierSet.has(String(item.id)),
  );

  return experience
    ? {
        path: `/city/${cityCatalog.city}/experience/${experience.slug}`,
        heroImage: experience.heroImage,
      }
    : undefined;
};

/** Finds a city experience from a globally-scoped legacy slug. */
export const getCanonicalExperienceBySlug = (identifier: string): CanonicalExperience | undefined => {
  for (const catalog of cityExperiences) {
    const experience = catalog.experiences.find((item) => item.slug === identifier);
    if (experience) {
      return {
        path: `/city/${catalog.city}/experience/${experience.slug}`,
        heroImage: experience.heroImage,
      };
    }
  }

  return undefined;
};
