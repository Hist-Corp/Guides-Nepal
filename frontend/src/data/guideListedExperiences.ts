import { kathmanduRichData } from './kathmanduRichData';
import { pokharaRichData } from './pokharaRichData';
import { lalitpurRichData } from './lalitpurRichData';
import { bhaktapurRichData } from './bhaktapurRichData';
import { bharatpurRichData } from './bharatpurRichData';

export interface ListedExperience {
  /** Public experience id the booking form sends for this catalogue entry. */
  id: number;
  key: string;
  slug: string;
  title: string;
  category: string;
  city: string;
  duration: string;
  price: number;
  path: string;
}

const allRichData = [
  ...kathmanduRichData,
  ...pokharaRichData,
  ...lalitpurRichData,
  ...bhaktapurRichData,
  ...bharatpurRichData,
];

const norm = (s: string) => s.trim().toLowerCase();

export function getGuideListedExperiences(names: (string | undefined | null)[]): ListedExperience[] {
  const provided = names.map((n) => norm(n ?? '')).filter(Boolean);
  if (provided.length === 0) return [];

  const seen = new Set<string>();
  const result: ListedExperience[] = [];

  for (const exp of allRichData) {
    const guides = exp.guides ?? [];
    const matches = guides.some((g) => {
      const guideName = norm(g.name);
      const guideFirst = guideName.split(/\s+/)[0];
      return provided.some((n) => n === guideName || n === guideFirst);
    });
    if (!matches) continue;

    const key = `${exp.city ?? ''}-${exp.slug}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const city = exp.city ?? '';
    result.push({
      id: exp.id,
      key,
      slug: exp.slug,
      title: exp.title,
      category: exp.type ?? '',
      city,
      duration: exp.duration ?? '',
      price: exp.price ?? 0,
      path: `/city/${city.toLowerCase()}/experience/${exp.slug}`,
    });
  }

  return result;
}
