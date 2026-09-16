export type PublicExperience = {
  id: number;
  slug: string;
  title: string;
  city: string;
  category: string;
  price: number;
  duration: string;
  rating: number;
  reviews: number;
  description: string;
  highlights: string[];
  image: string;
};

export type PublicGuide = {
  id: number;
  name: string;
  city: string;
  bio: string;
  languages: string[];
  rating: number;
  reviews: number;
  yearsExperience: number;
  image: string;
};

export const CITIES = ['Kathmandu', 'Pokhara', 'Lalitpur', 'Bhaktapur', 'Bharatpur'];

export const CATEGORIES = ['Food Tours', 'Cultural Tours', 'Outdoor Activities', 'Cooking Classes'];

// Real, verified photo URLs (Unsplash + Wikimedia Commons — the same
// verified sources used by the frontend app for visual consistency).
const U = (id: string, w = 800) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

const W = 'https://upload.wikimedia.org/wikipedia/commons';
const T = (p: string, f: string) => `${W}/thumb/${p}/${f}/960px-${f}`;

/** Real photos of the actual landmarks (Wikimedia Commons, free licenses). */
const WIKI = {
  kathmanduDurbar: T('c/ce', 'Three_saddhus_at_Kathmandu_Durbar_Square.jpg'),
  pagodaArchitecture: T(
    '6/69',
    'Historic_Pagoda_Style_Architecture_in_Kathmandu_Durbar_Square-IMG_4069.jpg'
  ),
  patanDurbarSquare: T('1/1f', 'Nepal_Patan_Durbar_Square_10_%28full_res%29.jpg'),
  boudhanath: T('4/44', 'Boudha_Stupa_2018_04.jpg'),
  thamel: T('2/2c', 'Thamel_Kathmandu_Nepal.jpg'),
};

/** Maps city names to representative real photos. */
export const CITY_IMAGES: Record<string, string> = {
  Kathmandu: WIKI.kathmanduDurbar,
  Pokhara: U('1476514525535-07fb3b4ae5f1'),
  Lalitpur: WIKI.patanDurbarSquare,
  Bhaktapur: WIKI.pagodaArchitecture,
  Bharatpur: U('1470071459604-3b5ec3a7fe05'),
};

/** Maps category names to representative real photos. */
export const CATEGORY_IMAGES: Record<string, string> = {
  'Food Tours': U('1534422298391-e4f8c172dddb'),
  'Cultural Tours': U('1533105079780-92b9be482077'),
  'Outdoor Activities': U('1551632811-561732d1e306'),
  'Cooking Classes': U('1556910103-1c02745aae4d'),
};

/** Maps experience slugs to representative real photos. */
export const EXPERIENCE_IMAGES: Record<string, string> = {
  'bhaktapur-heritage-walk': WIKI.pagodaArchitecture,
  'patan-cultural-circuit': WIKI.patanDurbarSquare,
  'pokhara-lakeside-evening': U('1476514525535-07fb3b4ae5f1'),
  'momo-masterclass': U('1534422298391-e4f8c172dddb'),
  'kathmandu-street-food-crawl': U('1555939594-58d7cb561ad1'),
  'newari-cooking-class-bhaktapur': U('1556910103-1c02745aae4d'),
  'annapurna-sunrise-trek': U('1506905925346-21bda4d32df4'),
  'tharu-village-experience': U('1470071459604-3b5ec3a7fe05'),
};

/** Maps guide ids to representative real portrait photos. */
export const GUIDE_IMAGES: Record<number, string> = {
  201: U('1507003211169-0a1dd7228f2d', 400),
  202: U('1494790108377-be9c29b29330', 400),
  203: U('1500648767791-00dcc994a43e', 400),
  204: U('1544005313-94ddf0286df2', 400),
  205: U('1472099645785-5658abf4ff4e', 400),
};

/** Default experience photo (real Nepal heritage shot). */
export const DEFAULT_EXPERIENCE_IMAGE = U('1533105079780-92b9be482077');

/** Default guide portrait (real photo). */
export const DEFAULT_GUIDE_IMAGE = U('1507003211169-0a1dd7228f2d', 400);

/** Returns true if a value looks like a real image URL/path rather than an emoji. */
export function isImageUrl(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    (value.startsWith('/') ||
      value.startsWith('http://') ||
      value.startsWith('https://') ||
      value.startsWith('./') ||
      value.startsWith('../'))
  );
}

// Seed catalog used when the backend API is unreachable, so every
// public page always renders with meaningful content.
export const seedExperiences: PublicExperience[] = [
  {
    id: 1,
    slug: 'bhaktapur-heritage-walk',
    title: 'Bhaktapur Heritage Walk',
    city: 'Bhaktapur',
    category: 'Cultural Tours',
    price: 50,
    duration: '4h',
    rating: 4.8,
    reviews: 124,
    image: EXPERIENCE_IMAGES['bhaktapur-heritage-walk'],
    description:
      'Wander the medieval alleys of Bhaktapur Durbar Square with a licensed local guide, visiting potteries, hidden courtyards and Nyatapola Temple.',
    highlights: ['Durbar Square & Nyatapola', 'Pottery Square', 'Local juju dhau tasting'],
  },
  {
    id: 2,
    slug: 'patan-cultural-circuit',
    title: 'Patan Cultural Circuit',
    city: 'Lalitpur',
    category: 'Cultural Tours',
    price: 45,
    duration: '3h',
    rating: 4.6,
    reviews: 98,
    image: EXPERIENCE_IMAGES['patan-cultural-circuit'],
    description:
      "Explore Patan Durbar Square, the Golden Temple and the metalworking quarter of Patan's Newar artisans.",
    highlights: ['Patan Durbar Square', 'Golden Temple', 'Artisan workshops'],
  },
  {
    id: 3,
    slug: 'pokhara-lakeside-evening',
    title: 'Pokhara Lakeside Evening',
    city: 'Pokhara',
    category: 'Outdoor Activities',
    price: 35,
    duration: '2h',
    rating: 4.5,
    reviews: 76,
    image: EXPERIENCE_IMAGES['pokhara-lakeside-evening'],
    description:
      'A golden-hour boat ride on Phewa Lake followed by a sunset stroll along Lakeside with mountain views of the Annapurnas.',
    highlights: ['Phewa boat ride', 'Sunset viewpoint', 'Lakeside cafe stop'],
  },
  {
    id: 4,
    slug: 'momo-masterclass',
    title: 'Momo Masterclass',
    city: 'Kathmandu',
    category: 'Cooking Classes',
    price: 40,
    duration: '3h',
    rating: 4.9,
    reviews: 210,
    image: EXPERIENCE_IMAGES['momo-masterclass'],
    description:
      'Learn to fold juicy buffalo and vegetable momos with a Kathmandu home cook, from dough to dipping sauce.',
    highlights: ['Hands-on folding', 'Jhol achar sauce', 'Eat what you make'],
  },
  {
    id: 5,
    slug: 'kathmandu-street-food-crawl',
    title: 'Kathmandu Street Food Crawl',
    city: 'Kathmandu',
    category: 'Food Tours',
    price: 30,
    duration: '3h',
    rating: 4.7,
    reviews: 187,
    image: EXPERIENCE_IMAGES['kathmandu-street-food-crawl'],
    description:
      'Six tastings across Asan and Indra Chowk: chatpat, sel roti, yomari, samosas and more, straight from family stalls.',
    highlights: ['Asan Market', '6+ tastings', 'Hidden courtyard eateries'],
  },
  {
    id: 6,
    slug: 'newari-cooking-class-bhaktapur',
    title: 'Newari Cooking Class',
    city: 'Bhaktapur',
    category: 'Cooking Classes',
    price: 55,
    duration: '4h',
    rating: 4.8,
    reviews: 92,
    image: EXPERIENCE_IMAGES['newari-cooking-class-bhaktapur'],
    description:
      'Cook a full Newari feast - bara, chatamari, aila - in a traditional Bhaktapur home kitchen.',
    highlights: ['Chatamari & bara', 'Local market shopping', 'Family recipe booklet'],
  },
  {
    id: 7,
    slug: 'annapurna-sunrise-trek',
    title: 'Annapurna Sunrise Trek',
    city: 'Pokhara',
    category: 'Outdoor Activities',
    price: 90,
    duration: '8h',
    rating: 4.9,
    reviews: 301,
    image: EXPERIENCE_IMAGES['annapurna-sunrise-trek'],
    description:
      'Pre-dawn hike to a panoramic viewpoint for sunrise over Annapurna South and Machapuchare, with breakfast on the ridge.',
    highlights: ['Sunrise over Annapurna', 'Guided trail', 'Ridge breakfast'],
  },
  {
    id: 8,
    slug: 'tharu-village-experience',
    title: 'Tharu Village Experience',
    city: 'Bharatpur',
    category: 'Cultural Tours',
    price: 38,
    duration: '4h',
    rating: 4.5,
    reviews: 64,
    image: EXPERIENCE_IMAGES['tharu-village-experience'],
    description:
      'Meet the Tharu community, watch a stick dance performance and learn about riverside life near Chitwan.',
    highlights: ['Tharu stick dance', 'Village walk', 'Local dinner option'],
  },
];

export const seedGuides: PublicGuide[] = [
  {
    id: 201,
    name: 'Ram Bahadur',
    city: 'Kathmandu',
    bio: 'Born and raised in Asan, Ram has been guiding heritage walks for 12 years and knows every hidden courtyard of the old city.',
    languages: ['English', 'Nepali', 'Newari'],
    rating: 4.9,
    reviews: 120,
    yearsExperience: 12,
    image: GUIDE_IMAGES[201],
  },
  {
    id: 202,
    name: 'Sita Sharma',
    city: 'Pokhara',
    bio: 'Mountain lover and certified trekking guide, Sita leads sunrise hikes and lakeside tours around the Annapurna region.',
    languages: ['English', 'Nepali', 'Hindi'],
    rating: 4.7,
    reviews: 85,
    yearsExperience: 8,
    image: GUIDE_IMAGES[202],
  },
  {
    id: 203,
    name: 'Kiran Adhikari',
    city: 'Bhaktapur',
    bio: "Kiran grew up in Bhaktapur's Pottery Square and specializes in Newari culture, food and festivals.",
    languages: ['English', 'Nepali'],
    rating: 4.4,
    reviews: 33,
    yearsExperience: 5,
    image: GUIDE_IMAGES[203],
  },
  {
    id: 204,
    name: 'Maya Tamang',
    city: 'Lalitpur',
    bio: 'Art historian turned guide, Maya runs the Patan cultural circuit and cooking workshops with local families.',
    languages: ['English', 'Nepali', 'Tamang'],
    rating: 4.8,
    reviews: 96,
    yearsExperience: 10,
    image: GUIDE_IMAGES[204],
  },
  {
    id: 205,
    name: 'Bikash Gurung',
    city: 'Bharatpur',
    bio: 'Wildlife and culture guide near Chitwan, Bikash connects travelers with Tharu village life and jungle trails.',
    languages: ['English', 'Nepali', 'Gurung'],
    rating: 4.6,
    reviews: 54,
    yearsExperience: 7,
    image: GUIDE_IMAGES[205],
  },
];

// Normalizes API experiences (snake_case or camelCase) into PublicExperience.
export function normalizeExperience(raw: any, index: number): PublicExperience {
  const id = raw.id ?? index + 1;
  const slug = String(
    raw.slug ??
      String(raw.title ?? 'experience')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
  );
  return {
    id,
    slug,
    title: raw.title ?? raw.name ?? 'Untitled experience',
    city: raw.city ?? raw.location ?? 'Kathmandu',
    category: raw.category ?? 'Cultural Tours',
    price: Number(raw.price ?? raw.price_from ?? 35),
    duration: raw.duration ?? '3h',
    rating: Number(raw.rating ?? 4.5),
    reviews: Number(raw.reviews ?? raw.review_count ?? 0),
    description: raw.description ?? 'Discover this experience with a local guide in Nepal.',
    highlights: Array.isArray(raw.highlights)
      ? raw.highlights
      : ['Guided by a local', 'Small group', 'Flexible cancellation'],
    image: isImageUrl(raw.image)
      ? raw.image
      : (EXPERIENCE_IMAGES[slug] ?? DEFAULT_EXPERIENCE_IMAGE),
  };
}

// Normalizes API guides into PublicGuide.
export function normalizeGuide(raw: any, index: number): PublicGuide {
  const id = raw.id ?? index + 1;
  return {
    id,
    name: raw.name ?? ([raw.firstName, raw.lastName].filter(Boolean).join(' ') || 'Local guide'),
    city: raw.city ?? 'Kathmandu',
    bio: raw.bio ?? 'A passionate local guide ready to show you the best of Nepal.',
    languages: Array.isArray(raw.languages) ? raw.languages : ['English', 'Nepali'],
    rating: Number(raw.rating ?? 4.5),
    reviews: Number(raw.reviews ?? raw.review_count ?? 0),
    yearsExperience: Number(raw.yearsExperience ?? raw.experience_years ?? 5),
    image: isImageUrl(raw.image) ? raw.image : (GUIDE_IMAGES[id] ?? DEFAULT_GUIDE_IMAGE),
  };
}
