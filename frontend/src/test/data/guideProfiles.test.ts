import { describe, expect, it } from 'vitest';
import { bhaktapurRichData } from '../../data/bhaktapurRichData';
import { bharatpurRichData } from '../../data/bharatpurRichData';
import { allGuides, findGuideById } from '../../data/guidesData';
import { kathmanduRichData } from '../../data/kathmanduRichData';
import { lalitpurRichData } from '../../data/lalitpurRichData';
import { pokharaRichData } from '../../data/pokharaRichData';
import { buildLocalGuideProfile } from '../../utils/guideProfile';

const experienceCatalogs = [
  kathmanduRichData,
  pokharaRichData,
  lalitpurRichData,
  bhaktapurRichData,
  bharatpurRichData,
];

describe('guide catalog', () => {
  it('gives every guide a unique id', () => {
    const ids = allGuides.map((guide) => guide.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('fills the standard profile fields for every guide', () => {
    for (const guide of allGuides) {
      expect(guide.name.trim()).not.toBe('');
      expect(guide.bio.trim()).not.toBe('');
      expect(guide.role.trim()).not.toBe('');
      expect(guide.languages.length).toBeGreaterThan(0);
      expect(guide.cities.length).toBeGreaterThan(0);
      expect(guide.gallery?.length ?? 0).toBeGreaterThan(0);
    }
  });

  it('resolves every guide card to the guide it displays', () => {
    const mismatches = experienceCatalogs.flatMap((catalog) =>
      catalog.flatMap((experience) =>
        (experience.guides ?? [])
          .filter((guide) => findGuideById(guide.id)?.name !== guide.name)
          .map((guide) => ({
            experience: experience.slug,
            card: `${guide.name} (id ${guide.id})`,
            profile: findGuideById(guide.id)?.name ?? 'missing',
          }))
      )
    );

    expect(mismatches).toEqual([]);
  });

  it('builds a portfolio for a catalog guide', () => {
    const krishna = findGuideById(9001);
    expect(krishna?.name).toBe('Krishna');

    const profile = buildLocalGuideProfile(krishna!);
    expect(profile.experiences.map((experience) => experience.slug)).toEqual(
      expect.arrayContaining(['bhaktapur-heritage-walk', 'bhaktapur-night-tour'])
    );
    expect(profile.stats.experiences).toBe(profile.experiences.length);
  });

  it('does not reuse Apicha for renamed experience guides', () => {
    const renamed = ['Krishna', 'Radha', 'Prakash', 'Laxmi', 'Ram', 'Sita', 'Ramesh', 'Nakarin'];

    for (const name of renamed) {
      const card = experienceCatalogs
        .flatMap((catalog) => catalog.flatMap((experience) => experience.guides ?? []))
        .find((guide) => guide.name === name);

      expect(card, `${name} should appear in an experience catalog`).toBeDefined();
      expect(card!.id).not.toBe(1);
      expect(findGuideById(card!.id)?.name).toBe(name);
    }
  });
});
