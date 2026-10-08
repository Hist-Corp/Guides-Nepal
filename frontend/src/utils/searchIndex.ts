import { kathmanduRichData } from '../data/kathmanduRichData';
import { pokharaRichData } from '../data/pokharaRichData';
import { bhaktapurRichData } from '../data/bhaktapurRichData';
import { lalitpurRichData } from '../data/lalitpurRichData';
import { bharatpurRichData } from '../data/bharatpurRichData';
import { allGuides } from '../data/guidesData';
import { RichExperienceData } from '../data/types';

export interface SearchIndexEntry {
  id: string;
  type: 'experience' | 'guide' | 'city' | 'category';
  title: string;
  subtitle: string;
  description?: string;
  image?: string;
  link: string;
  tags: string[];
  city?: string;
  category?: string;
  price?: number;
  rating?: number;
  reviewCount?: number;
  hostName?: string;
  hostImage?: string;
}

export interface SearchResult {
  entry: SearchIndexEntry;
  score: number;
  matchedWords: string[];
}

const allExperiences: RichExperienceData[] = [
  ...kathmanduRichData,
  ...pokharaRichData,
  ...bhaktapurRichData,
  ...lalitpurRichData,
  ...bharatpurRichData,
];

const normalize = (text: string): string =>
  text
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const tokenize = (text: string): string[] =>
  normalize(text)
    .split(/[\s\-_.,;:()[\]{}/\\]+/)
    .filter((token) => token.length > 0);

const buildSearchableText = (entry: SearchIndexEntry): string => {
  const parts = [
    entry.title,
    entry.subtitle,
    entry.description || '',
    ...entry.tags,
    entry.city || '',
    entry.category || '',
    entry.hostName || '',
  ];
  return parts.join(' ');
};

const createIndexEntries = (): SearchIndexEntry[] => {
  const entries: SearchIndexEntry[] = [];

  for (const exp of allExperiences) {
    const cityKey = exp.city?.toLowerCase() || '';
    const experiencePath = `/city/${cityKey}/experience/${exp.slug}`;

    entries.push({
      id: `exp-${exp.id}`,
      type: 'experience',
      title: exp.title,
      subtitle: `${exp.type || 'Experience'}, ${exp.city}`,
      description: exp.description,
      image: exp.heroImage,
      link: experiencePath,
      tags: [
        exp.type || '',
        exp.city || '',
        ...(exp.exploration?.points || []),
        ...(exp.tourStructure?.steps.map((s) => s.name) || []),
      ].filter(Boolean),
      city: exp.city,
      category: exp.type,
      price: exp.price,
      rating: exp.rating,
      reviewCount: exp.reviews,
      hostName: exp.host?.name,
      hostImage: exp.host?.image,
    });
  }

  for (const guide of allGuides) {
    entries.push({
      id: `guide-${guide.id}`,
      type: 'guide',
      title: guide.name,
      subtitle: `${guide.role} • ${guide.livesIn}`,
      description: guide.bio,
      image: guide.image,
      link: `/guide/${guide.id}`,
      tags: [
        guide.role,
        guide.livesIn,
        ...guide.languages,
        ...guide.cities,
      ].filter(Boolean),
      city: guide.livesIn,
      category: guide.role,
      rating: guide.rating,
      reviewCount: guide.reviews,
    });
  }

  const cities = [
    { name: 'Kathmandu', key: 'kathmandu', description: 'Capital city with UNESCO heritage sites' },
    { name: 'Pokhara', key: 'pokhara', description: 'Lake city with mountain views' },
    { name: 'Lalitpur', key: 'lalitpur', description: 'City of fine arts and Patan Durbar Square' },
    { name: 'Bhaktapur', key: 'bhaktapur', description: 'Ancient city of devotees and pottery' },
    { name: 'Bharatpur', key: 'bharatpur', description: 'Gateway to Chitwan National Park' },
  ];

  for (const city of cities) {
    const cityExperiences = allExperiences.filter((e) => e.city?.toLowerCase() === city.key);
    const firstExp = cityExperiences[0];

    entries.push({
      id: `city-${city.key}`,
      type: 'city',
      title: city.name,
      subtitle: city.description,
      description: `${cityExperiences.length} experiences available`,
      image: firstExp?.heroImage,
      link: `/city/${city.key}`,
      tags: [city.name, city.description, ...cityExperiences.map((e) => e.type || '').filter(Boolean)],
      city: city.name,
    });
  }

  const categories = [
    'Food Tour',
    'Nature & Hiking',
    'Cultural',
    'Adventure',
    'Workshop',
    'Wildlife',
    'Art & Culture',
    'City Highlight',
    'Trekking',
  ];

  for (const category of categories) {
    const categoryExperiences = allExperiences.filter((e) => e.type === category);
    const firstExp = categoryExperiences[0];

    entries.push({
      id: `category-${category.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      type: 'category',
      title: category,
      subtitle: `${categoryExperiences.length} experiences`,
      description: `Explore ${category.toLowerCase()} experiences across Nepal`,
      image: firstExp?.heroImage,
      link: `/search?category=${encodeURIComponent(category)}`,
      tags: [category, ...categoryExperiences.map((e) => e.city || '').filter(Boolean)],
      category,
    });
  }

  return entries;
};

let searchIndex: SearchIndexEntry[] | null = null;

export const getSearchIndex = (): SearchIndexEntry[] => {
  if (!searchIndex) {
    searchIndex = createIndexEntries();
  }
  return searchIndex;
};

export const searchIndexEntries = (query: string, limit = 10): SearchResult[] => {
  if (!query.trim()) return [];

  const searchTokens = tokenize(query);
  const index = getSearchIndex();

  const results: SearchResult[] = [];

  for (const entry of index) {
    const searchableText = buildSearchableText(entry);
    const searchableTokens = tokenize(searchableText);

    let matchedWords = 0;
    const matchedWordList: string[] = [];

    for (const searchToken of searchTokens) {
      const isMatch = searchableTokens.some(
        (token) => token === searchToken || token.startsWith(searchToken) || token.includes(searchToken)
      );
      if (isMatch) {
        matchedWords++;
        matchedWordList.push(searchToken);
      }
    }

    if (matchedWords > 0) {
      const totalTokens = searchTokens.length;
      const matchRatio = matchedWords / totalTokens;
      const exactMatches = searchTokens.filter((st) => searchableTokens.includes(st)).length;
      const exactMatchRatio = exactMatches / totalTokens;

      let score = matchRatio * 100 + exactMatchRatio * 50;

      if (entry.type === 'experience' && searchableTokens.includes(searchTokens[0])) {
        score += 20;
      }
      if (entry.type === 'city' && searchTokens.some((t) => tokenize(entry.title || '').includes(t))) {
        score += 30;
      }
      if (entry.type === 'guide' && searchTokens.some((t) => tokenize(entry.title || '').includes(t))) {
        score += 25;
      }

      results.push({
        entry,
        score,
        matchedWords: matchedWordList,
      });
    }
  }

  results.sort((a, b) => b.score - a.score);

  return results.slice(0, limit);
};

export const getSuggestionsByType = (
  query: string,
  type: SearchIndexEntry['type'],
  limit = 5
): SearchIndexEntry[] => {
  const results = searchIndexEntries(query, 50);
  return results
    .filter((r) => r.entry.type === type)
    .slice(0, limit)
    .map((r) => r.entry);
};

export const getAllSuggestions = (query: string, limit = 8): SearchIndexEntry[] => {
  const results = searchIndexEntries(query, limit * 2);

  const byType: Record<string, SearchIndexEntry[]> = {
    experience: [],
    city: [],
    guide: [],
    category: [],
  };

  for (const result of results) {
    if (byType[result.entry.type].length < (result.entry.type === 'experience' ? 4 : 2)) {
      byType[result.entry.type].push(result.entry);
    }
  }

  const ordered: SearchIndexEntry[] = [];
  const priority: SearchIndexEntry['type'][] = ['experience', 'city', 'guide', 'category'];

  for (const t of priority) {
    ordered.push(...byType[t]);
  }

  return ordered.slice(0, limit);
};