import { useEffect, useState } from 'react';
import guidesApi, { type Guide as ApiGuide, type Experience as ApiExperience } from '../services/guidesApi';

/**
 * Guides a Regional Head approved for an experience live in the backend
 * catalog (`GET /experiences` -> `guides`).  The traveller-facing experience
 * pages render their own city catalog data, so the approved guides are fetched
 * here and merged into the "Who you'll meet" section.
 */
export type AssignedGuide = ApiGuide;

const normalize = (value?: string | null) => (value ?? '').trim().toLowerCase();

// Every experience page asks for the same catalog, so share one request.
let catalogPromise: Promise<ApiExperience[]> | null = null;

const loadCatalog = () => {
  if (!catalogPromise) {
    catalogPromise = guidesApi.getExperiences().catch(() => [] as ApiExperience[]);
  }
  return catalogPromise;
};

/**
 * Approved guides for one experience.  Matched by slug first and title second,
 * because the city catalogs and the backend catalog use different slugs for
 * the same experience (e.g. `bhaktapur-heritage-walk` vs `pottery-making-class`).
 */
export async function fetchAssignedGuides(slug?: string, title?: string): Promise<AssignedGuide[]> {
  const wantedSlug = normalize(slug);
  const wantedTitle = normalize(title);
  if (!wantedSlug && !wantedTitle) return [];

  const catalog = await loadCatalog();
  const match = catalog.find(
    (experience) =>
      (wantedSlug && normalize(experience.slug) === wantedSlug) ||
      (wantedTitle && normalize(experience.title) === wantedTitle)
  );
  return match && Array.isArray(match.guides) ? match.guides : [];
}

/** Approved guides for an experience, loaded once per page. */
export function useAssignedGuides(slug?: string, title?: string): AssignedGuide[] {
  const [guides, setGuides] = useState<AssignedGuide[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchAssignedGuides(slug, title).then((assigned) => {
      if (!cancelled) setGuides(assigned);
    });
    return () => {
      cancelled = true;
    };
  }, [slug, title]);

  return guides;
}

/**
 * Appends approved guides to the catalog guides, skipping anyone the catalog
 * already lists (same person, two data sources).  Returns `T[]` because an
 * approved guide carries the same fields the catalog guide type expects.
 */
export function mergeGuides<T extends { id: number | string; name: string }>(
  catalogGuides: T[],
  assigned: AssignedGuide[]
): T[] {
  const seen = new Set(catalogGuides.map((guide) => normalize(guide.name)));
  const extra = assigned.filter((guide) => !seen.has(normalize(guide.name)));
  return [...catalogGuides, ...(extra as unknown as T[])];
}
