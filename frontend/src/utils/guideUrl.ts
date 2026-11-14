import type { Guide } from '../data/types';
import { allGuides } from '../data/guidesData';

/** Minimal guide shape needed to build a public profile URL. */
type GuideLike = { id: number | string; name: string; slug?: string | null };

/** Lowercase, ASCII-only, hyphenated form of a guide's display name. */
export const slugifyGuideName = (name: string): string =>
  name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'guide';

// Names are not globally unique in the catalog (there are two Apichas and two
// Sitas), so later duplicates get their id appended instead of silently
// resolving to the first person with that name.
const slugById = new Map<number, string>();
const guideBySlug = new Map<string, Guide>();

for (const guide of allGuides) {
  const base = slugifyGuideName(guide.name);
  let slug = base;

  if (guideBySlug.has(slug)) {
    slug = `${base}-${guide.id}`;
    let suffix = 2;
    while (guideBySlug.has(slug)) {
      slug = `${base}-${guide.id}-${suffix}`;
      suffix += 1;
    }
  }

  slugById.set(guide.id, slug);
  guideBySlug.set(slug, guide);
}

/** Canonical, URL-safe slug for a guide. */
export const guideSlug = (guide: GuideLike): string => {
  // 1. Use the guide's own slug if provided (e.g. from API responses).
  if (guide.slug && typeof guide.slug === 'string' && guide.slug.trim() !== '') {
    return guide.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  // 2. Use a slug derived from the guide's own display name.
  const nameSlug = slugifyGuideName(guide.name);
  const catalogId = typeof guide.id === 'number' ? guide.id : Number(guide.id);

  // 3. Only fall back to catalog ID lookup when the name-based slug would
  //    collide with an existing catalog entry (duplicate names like two Apichas).
  if (Number.isInteger(catalogId)) {
    const catalogSlug = slugById.get(catalogId);
    if (catalogSlug && catalogSlug !== nameSlug) {
      return catalogSlug;
    }
  }

  return nameSlug;
};

/** Resolve a profile URL slug back to the exact guide it represents. */
export const findGuideBySlug = (slug: string | undefined): Guide | undefined => {
  if (!slug) return undefined;
  return guideBySlug.get(slug.toLowerCase());
};

export const guideProfilePath = (guide: GuideLike): string => `/guidesprofile/${guideSlug(guide)}`;

export const guideGalleryPath = (guide: GuideLike): string =>
  `${guideProfilePath(guide)}/gallery`;

export const guideContactPath = (guide: GuideLike): string =>
  `${guideProfilePath(guide)}/contact`;
