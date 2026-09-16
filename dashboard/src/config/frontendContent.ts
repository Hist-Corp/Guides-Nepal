/**
 * Frontend content map — pre-populated with the real copy used by the public
 * website components, keyed by the page slug from `FRONTEND_PAGES`.
 *
 * The Live Page Editor uses this as its default content whenever the CMS has no
 * saved sections for a slug yet, so every page opens pre-filled with the exact
 * text, buttons and styling that the live site renders.
 */

export type FrontendSection = {
  id: string;
  label: string;
  type: string;
  content: Record<string, any>;
  style: Record<string, any>;
};

// ─── Brand palette (must match tailwind.config.js exactly) ───
const CREAM = '#F9E6D6'; // tailwind `peach` / hero background
const BACKGROUND_CREAM = '#FDF8F5'; // tailwind `background.cream`
const PRIMARY = '#213448';
const SECONDARY = '#547792';
const YELLOW = '#F4B400';
const WHITE = '#ffffff';
const LIGHT_BLUE = '#E0F2FE';

// ─── Reusable style presets ───
const heroStyle = (alignment: 'left' | 'center' = 'center') => ({
  backgroundColor: CREAM,
  textColor: SECONDARY,
  accentColor: YELLOW,
  alignment,
});

const lightStyle = (alignment: 'left' | 'center' = 'center') => ({
  backgroundColor: WHITE,
  textColor: PRIMARY,
  alignment,
});

const darkStyle = (alignment: 'left' | 'center' = 'center') => ({
  backgroundColor: PRIMARY,
  textColor: WHITE,
  alignment,
});

const blueStyle = (alignment: 'left' | 'center' = 'center') => ({
  backgroundColor: LIGHT_BLUE,
  textColor: PRIMARY,
  alignment,
});

const footerStyle = () => ({
  backgroundColor: PRIMARY,
  textColor: WHITE,
  alignment: 'left' as const,
  padding: '1.5rem',
});

/** Shared footer content so every page gets an editable, accurate footer. */
export function frontendFooter(title: string): FrontendSection {
  return {
    id: 'home-footer',
    label: title ? `Footer (${title})` : 'Footer',
    type: 'footer',
    content: {
      heading: 'Guides Nepal',
      tagline: 'Real People. Real Stories. Really Good Travel.',
      supportEmail: 'support@guides-nepal.com',
      copyright: 'guides-nepal. All rights reserved.',
    },
    style: footerStyle(),
  };
}

// ─────────────────────────── Content map ───────────────────────────
export const FRONTEND_CONTENT: Record<string, FrontendSection[]> = {
  // ── Main ──
  home: [
    {
      id: 'home-hero',
      label: 'Hero Section',
      type: 'hero',
      content: {
        heading: 'Enchanting experiences,\nwith incredible locals',
        subtitle: 'Book unique and memorable travel\nexperiences guided by locals',
        buttonText: 'Search',
        tagline: 'Guides Nepal',
        primaryText: 'Guides Nepal',
        image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200',
      },
      style: { backgroundColor: CREAM, textColor: SECONDARY, accentColor: YELLOW, alignment: 'left' },
    },
    {
      id: 'home-featured',
      label: 'Featured Experiences',
      type: 'featured',
      content: {
        heading: 'Go local in Charming Cities',
        subtitle: 'Find unforgettable experiences with locals',
        buttonText: 'View all',
        image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800',
      },
      style: lightStyle('left'),
    },
    {
      id: 'home-promo',
      label: 'Promo Banner',
      type: 'promo',
      content: {
        heading: 'We have released our 2024\nImpact Report!',
        subtitle:
          'Discover the true power of your travel with our 2024 Impact Report. See how responsible tourism supports local communities, preserves culture, and protects the planet.',
        buttonText: 'Read our report',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      },
      style: { backgroundColor: BACKGROUND_CREAM, textColor: WHITE, alignment: 'left' },
    },
    {
      id: 'home-categories',
      label: 'Categories Grid',
      type: 'categories',
      content: { heading: 'Most Popular. Most Delicious.', subtitle: 'Real-Good Travel.' },
      style: lightStyle('center'),
    },
    {
      id: 'home-find-experience',
      label: 'Find Your Perfect Experience',
      type: 'categories',
      content: {
        heading: 'Find your perfect experience',
        subtitle: 'Discover experiences based on your interest',
      },
      style: lightStyle('center'),
    },
    {
      id: 'home-testimonials',
      label: 'Testimonials',
      type: 'testimonials',
      content: {
        heading: 'Travelers love our locals',
        subtitle: 'Real reviews from real travelers in Nepal',
      },
      style: blueStyle('center'),
    },
    {
      id: 'home-values',
      label: 'Why Us',
      type: 'values',
      content: {
        heading: 'Why is Guides Nepal the best place to book a tour?',
        subtitle: 'Real People. Real Stories. Really Good Travel.',
      },
      style: lightStyle('center'),
    },
    {
      id: 'home-regions',
      label: 'Discovering Regions through Local Eyes',
      type: 'featured',
      content: {
        heading: 'Discovering Regions through Local Eyes',
        subtitle: 'Every corner of Nepal has a story — meet the locals who tell it best.',
        buttonText: 'Explore',
      },
      style: darkStyle('center'),
    },
    {
      id: 'home-plan-book',
      label: 'Plan and Book on the Go',
      type: 'promo',
      content: {
        heading: 'Plan and book on the go',
        subtitle:
          'Your whole trip, one pocket-sized local — book, chat and travel from your phone.',
        buttonText: 'Book in a few taps',
        tagline: 'MOBILE',
      },
      style: blueStyle('left'),
    },
    frontendFooter('Home'),
  ],

  explore: [
    {
      id: 'explore-hero',
      label: 'Hero Section',
      type: 'hero',
      content: {
        heading: 'Explore Nepal',
        subtitle: 'Discover authentic experiences across the Himalayas',
        buttonText: 'Browse all',
        tagline: 'Experiences',
      },
      style: heroStyle('center'),
    },
    {
      id: 'explore-categories',
      label: 'Categories Strip',
      type: 'categories',
      content: {
        heading: 'Browse by category',
        subtitle: 'Food, culture, outdoor adventures and more',
      },
      style: lightStyle('center'),
    },
    frontendFooter('Explore'),
  ],

  search: [
    {
      id: 'search-hero',
      label: 'Hero Section',
      type: 'hero',
      content: {
        heading: 'Search Experiences',
        subtitle: 'Find tours, guides and activities anywhere in Nepal',
        buttonText: 'Search',
        tagline: 'Search',
      },
      style: heroStyle('center'),
    },
    {
      id: 'search-results',
      label: 'Results Section',
      type: 'text',
      content: {
        heading: 'Results',
        body: 'Type a keyword, pick a city or choose an activity to see matching experiences from our local guides.',
      },
      style: lightStyle('left'),
    },
    frontendFooter('Search'),
  ],

// ── Experiences ──
  'most-popular': [
    {
      id: 'most-popular-hero',
      label: 'Hero Section',
      type: 'hero',
      content: {
        heading: 'Most Popular Experiences',
        subtitle: 'Our most-loved tours chosen by travelers from around the world',
        buttonText: 'Explore',
        tagline: 'Popular',
      },
      style: heroStyle('center'),
    },
    {
      id: 'most-popular-categories',
      label: 'Categories Strip',
      type: 'categories',
      content: {
        heading: 'Browse by category',
        subtitle: 'Food, culture, outdoor adventures and more',
      },
      style: lightStyle('center'),
    },
    frontendFooter('Most Popular'),
  ],

  'most-delicious': [
    {
      id: 'most-delicious-hero',
      label: 'Hero Section',
      type: 'hero',
      content: {
        heading: 'Most Delicious',
        subtitle: 'Taste Nepal through its momos, curries and sweet treats',
        buttonText: 'Taste now',
        tagline: 'Food',
      },
      style: heroStyle('center'),
    },
    {
      id: 'most-delicious-categories',
      label: 'Categories Strip',
      type: 'categories',
      content: {
        heading: 'Browse food experiences',
        subtitle: 'From momos to dal bhat, taste it all',
      },
      style: lightStyle('center'),
    },
    frontendFooter('Most Delicious'),
  ],

  'real-good-travel': [
    {
      id: 'real-good-travel-hero',
      label: 'Hero Section',
      type: 'hero',
      content: {
        heading: 'Real-Good Travel',
        subtitle: 'Travel that gives back to the communities you visit',
        buttonText: 'Read more',
        tagline: 'Stories',
      },
      style: heroStyle('center'),
    },
    {
      id: 'real-good-travel-impact',
      label: 'Impact Section',
      type: 'text',
      content: {
        heading: 'Travel that does good',
        body: 'Every booking supports local families, preserves cultural heritage and keeps tourism money inside the communities you visit.',
      },
      style: lightStyle('left'),
    },
    frontendFooter('Real-Good Travel'),
  ],

  'food-tours': [
    {
      id: 'food-tours-hero',
      label: 'Hero Section',
      type: 'hero',
      content: {
        heading: 'Food Tours',
        subtitle: 'Cooking classes and food tours with local experts',
        buttonText: 'Book now',
        tagline: 'Food',
      },
      style: heroStyle('center'),
    },
    {
      id: 'food-tours-categories',
      label: 'Categories Strip',
      type: 'categories',
      content: {
        heading: 'Browse food experiences',
        subtitle: 'From momos to dal bhat, taste it all',
      },
      style: lightStyle('center'),
    },
    frontendFooter('Food Tours'),
  ],

  'food-tour-culture': [
    {
      id: 'food-tour-culture-hero',
      label: 'Hero Section',
      type: 'hero',
      content: {
        heading: 'Food Tour Culture',
        subtitle: 'The stories, rituals and traditions behind every Nepali dish',
        buttonText: 'Read more',
        tagline: 'Culture',
      },
      style: heroStyle('center'),
    },
    {
      id: 'food-tour-culture-body',
      label: 'Article Body',
      type: 'text',
      content: {
        heading: 'Food is culture',
        body: 'In Nepal a meal is never just a meal. Discover how festivals, family kitchens and centuries-old recipes shape what lands on your plate.',
      },
      style: lightStyle('left'),
    },
    frontendFooter('Food Tour Culture'),
  ],
  'cultural-tours': [
    {
      id: 'cultural-tours-hero',
      label: 'Hero Section',
      type: 'hero',
      content: {
        heading: 'Cultural Tours',
        subtitle: 'Cultural heritage tours through ancient cities',
        buttonText: 'Discover',
        tagline: 'Culture',
      },
      style: heroStyle('center'),
    },
    {
      id: 'cultural-tours-categories',
      label: 'Categories Strip',
      type: 'categories',
      content: {
        heading: 'Browse cultural experiences',
        subtitle: 'Temples, heritage, and living traditions',
      },
      style: lightStyle('center'),
    },
    frontendFooter('Cultural Tours'),
  ],

  'outdoor-activities': [
    {
      id: 'outdoor-activities-hero',
      label: 'Hero Section',
      type: 'hero',
      content: {
        heading: 'Adventure Awaits in Nepal',
        subtitle: 'Trekking, rafting, paragliding and everything in between',
        buttonText: 'Adventure',
        tagline: 'Outdoor',
      },
      style: heroStyle('center'),
    },
    {
      id: 'outdoor-activities-categories',
      label: 'Categories Strip',
      type: 'categories',
      content: {
        heading: 'Browse outdoor adventures',
        subtitle: 'Trekking, hiking, and thrilling experiences',
      },
      style: lightStyle('center'),
    },
    frontendFooter('Outdoor Activities'),
  ],

  'cooking-classes': [
    {
      id: 'cooking-classes-hero',
      label: 'Hero Section',
      type: 'hero',
      content: {
        heading: 'Cooking Classes',
        subtitle: 'Hands-on cooking classes with local chefs',
        buttonText: 'Learn to cook',
        tagline: 'Cooking',
      },
      style: heroStyle('center'),
    },
    {
      id: 'cooking-classes-categories',
      label: 'Categories Strip',
      type: 'categories',
      content: {
        heading: 'Browse cooking classes',
        subtitle: 'From momos to traditional Nepali cuisine',
      },
      style: lightStyle('center'),
    },
    frontendFooter('Cooking Classes'),
  ],

  experience: [
    {
      id: 'experience-hero',
      label: 'Experience Hero',
      type: 'hero',
      content: {
        heading: 'Experience Details',
        subtitle: 'Everything you need to know before you book',
        buttonText: 'Book now',
        tagline: 'Experience',
      },
      style: heroStyle('left'),
    },
    {
      id: 'experience-body',
      label: 'Description',
      type: 'text',
      content: {
        heading: 'About this experience',
        body: 'Highlights, what is included, meeting point and what to bring — managed per experience from the Experiences module.',
      },
      style: lightStyle('left'),
    },
    frontendFooter('Experience'),
  ],

  'seo-experience': [
    {
      id: 'seo-experience-hero',
      label: 'SEO Experience Hero',
      type: 'hero',
      content: {
        heading: 'Experience',
        subtitle: 'A local-led experience you will remember for years',
        buttonText: 'Book now',
        tagline: 'Guide',
      },
      style: heroStyle('left'),
    },
    {
      id: 'seo-experience-body',
      label: 'Description',
      type: 'text',
      content: {
        heading: 'What to expect',
        body: 'Share the story of the experience, the guide behind it and the neighbourhood you will explore.',
      },
      style: lightStyle('left'),
    },
    frontendFooter('SEO Experience'),
  ],
  // ── Cities ──
  kathmandu: [
    {
      id: 'kathmandu-hero',
      label: 'Hero Section',
      type: 'hero',
      content: {
        heading: 'Kathmandu',
        subtitle: 'Temples, stupas and street food in the heart of the valley',
        buttonText: 'Explore',
        tagline: 'City',
      },
      style: heroStyle('center'),
    },
    {
      id: 'kathmandu-featured',
      label: 'Featured Experiences',
      type: 'featured',
      content: {
        heading: 'Experiences in Kathmandu',
        subtitle: 'Hand-picked tours and activities',
        buttonText: 'View all',
      },
      style: lightStyle('left'),
    },
    frontendFooter('Kathmandu'),
  ],

  'kathmandu-experiences': [
    {
      id: 'kathmandu-experiences-hero',
      label: 'Hero Section',
      type: 'hero',
      content: {
        heading: 'Experiences in Kathmandu',
        subtitle: 'Every tour and activity hosted by locals in the capital',
        buttonText: 'Browse all',
        tagline: 'Kathmandu',
      },
      style: heroStyle('center'),
    },
    {
      id: 'kathmandu-experiences-categories',
      label: 'Categories Strip',
      type: 'categories',
      content: {
        heading: 'Browse by category',
        subtitle: 'Food, culture, outdoor adventures and more',
      },
      style: lightStyle('center'),
    },
    frontendFooter('Kathmandu Experiences'),
  ],

  'kathmandu-experience': [
    {
      id: 'kathmandu-experience-hero',
      label: 'Experience Hero',
      type: 'hero',
      content: {
        heading: 'Kathmandu Experience',
        subtitle: 'A local-led tour through the capital',
        buttonText: 'Book now',
        tagline: 'Kathmandu',
      },
      style: heroStyle('left'),
    },
    {
      id: 'kathmandu-experience-body',
      label: 'Description',
      type: 'text',
      content: {
        heading: 'About this experience',
        body: 'Describe the stops, the guide and what makes this Kathmandu tour special.',
      },
      style: lightStyle('left'),
    },
    frontendFooter('Kathmandu Experience'),
  ],

  pokhara: [
    {
      id: 'pokhara-hero',
      label: 'Hero Section',
      type: 'hero',
      content: {
        heading: 'Pokhara',
        subtitle: 'Lakes, mountains and adventure in Nepal’s lake city',
        buttonText: 'Explore',
        tagline: 'City',
      },
      style: heroStyle('center'),
    },
    {
      id: 'pokhara-featured',
      label: 'Featured Experiences',
      type: 'featured',
      content: {
        heading: 'Experiences in Pokhara',
        subtitle: 'Hand-picked tours and activities',
        buttonText: 'View all',
      },
      style: lightStyle('left'),
    },
    frontendFooter('Pokhara'),
  ],

  'pokhara-experiences': [
    {
      id: 'pokhara-experiences-hero',
      label: 'Hero Section',
      type: 'hero',
      content: {
        heading: 'Experiences in Pokhara',
        subtitle: 'Boating, sunrise hikes and paragliding over Phewa Lake',
        buttonText: 'Browse all',
        tagline: 'Pokhara',
      },
      style: heroStyle('center'),
    },
    {
      id: 'pokhara-experiences-categories',
      label: 'Categories Strip',
      type: 'categories',
      content: {
        heading: 'Browse by category',
        subtitle: 'Food, culture, outdoor adventures and more',
      },
      style: lightStyle('center'),
    },
    frontendFooter('Pokhara Experiences'),
  ],

  'pokhara-experience': [
    {
      id: 'pokhara-experience-hero',
      label: 'Experience Hero',
      type: 'hero',
      content: {
        heading: 'Pokhara Experience',
        subtitle: 'A local-led tour around the lake city',
        buttonText: 'Book now',
        tagline: 'Pokhara',
      },
      style: heroStyle('left'),
    },
    {
      id: 'pokhara-experience-body',
      label: 'Description',
      type: 'text',
      content: {
        heading: 'About this experience',
        body: 'Describe the stops, the guide and what makes this Pokhara tour special.',
      },
      style: lightStyle('left'),
    },
    frontendFooter('Pokhara Experience'),
  ],
  lalitpur: [
    {
      id: 'lalitpur-hero',
      label: 'Hero Section',
      type: 'hero',
      content: {
        heading: 'Lalitpur',
        subtitle: 'Artisan quarters and Newar culture in the city of beauty',
        buttonText: 'Explore',
        tagline: 'City',
      },
      style: heroStyle('center'),
    },
    {
      id: 'lalitpur-featured',
      label: 'Featured Experiences',
      type: 'featured',
      content: {
        heading: 'Experiences in Lalitpur',
        subtitle: 'Hand-picked tours and activities',
        buttonText: 'View all',
      },
      style: lightStyle('left'),
    },
    frontendFooter('Lalitpur'),
  ],

  'lalitpur-experiences': [
    {
      id: 'lalitpur-experiences-hero',
      label: 'Hero Section',
      type: 'hero',
      content: {
        heading: 'Experiences in Lalitpur',
        subtitle: 'Metalwork, woodcarving and Patan Durbar Square',
        buttonText: 'Browse all',
        tagline: 'Lalitpur',
      },
      style: heroStyle('center'),
    },
    {
      id: 'lalitpur-experiences-categories',
      label: 'Categories Strip',
      type: 'categories',
      content: {
        heading: 'Browse by category',
        subtitle: 'Food, culture, outdoor adventures and more',
      },
      style: lightStyle('center'),
    },
    frontendFooter('Lalitpur Experiences'),
  ],

  'lalitpur-experience': [
    {
      id: 'lalitpur-experience-hero',
      label: 'Experience Hero',
      type: 'hero',
      content: {
        heading: 'Lalitpur Experience',
        subtitle: 'A local-led tour through Patan',
        buttonText: 'Book now',
        tagline: 'Lalitpur',
      },
      style: heroStyle('left'),
    },
    {
      id: 'lalitpur-experience-body',
      label: 'Description',
      type: 'text',
      content: {
        heading: 'About this experience',
        body: 'Describe the stops, the guide and what makes this Patan tour special.',
      },
      style: lightStyle('left'),
    },
    frontendFooter('Lalitpur Experience'),
  ],

  bhaktapur: [
    {
      id: 'bhaktapur-hero',
      label: 'Hero Section',
      type: 'hero',
      content: {
        heading: 'Bhaktapur',
        subtitle: 'Step back in time in the City of Devotees',
        buttonText: 'Explore',
        tagline: 'City',
      },
      style: heroStyle('center'),
    },
    {
      id: 'bhaktapur-featured',
      label: 'Featured Experiences',
      type: 'featured',
      content: {
        heading: 'Experiences in Bhaktapur',
        subtitle: 'Hand-picked tours and activities',
        buttonText: 'View all',
      },
      style: lightStyle('left'),
    },
    frontendFooter('Bhaktapur'),
  ],

  'bhaktapur-experiences': [
    {
      id: 'bhaktapur-experiences-hero',
      label: 'Hero Section',
      type: 'hero',
      content: {
        heading: 'Experiences in Bhaktapur',
        subtitle: 'Pottery squares, juju dhau and medieval streets',
        buttonText: 'Browse all',
        tagline: 'Bhaktapur',
      },
      style: heroStyle('center'),
    },
    {
      id: 'bhaktapur-experiences-categories',
      label: 'Categories Strip',
      type: 'categories',
      content: {
        heading: 'Browse by category',
        subtitle: 'Food, culture, outdoor adventures and more',
      },
      style: lightStyle('center'),
    },
    frontendFooter('Bhaktapur Experiences'),
  ],

  'bhaktapur-experience': [
    {
      id: 'bhaktapur-experience-hero',
      label: 'Experience Hero',
      type: 'hero',
      content: {
        heading: 'Bhaktapur Experience',
        subtitle: 'A local-led tour through the old city',
        buttonText: 'Book now',
        tagline: 'Bhaktapur',
      },
      style: heroStyle('left'),
    },
    {
      id: 'bhaktapur-experience-body',
      label: 'Description',
      type: 'text',
      content: {
        heading: 'About this experience',
        body: 'Describe the stops, the guide and what makes this Bhaktapur tour special.',
      },
      style: lightStyle('left'),
    },
    frontendFooter('Bhaktapur Experience'),
  ],
  bharatpur: [
    {
      id: 'bharatpur-hero',
      label: 'Hero Section',
      type: 'hero',
      content: {
        heading: 'Bharatpur',
        subtitle: 'Gateway to Chitwan National Park and its wildlife',
        buttonText: 'Explore',
        tagline: 'City',
      },
      style: heroStyle('center'),
    },
    {
      id: 'bharatpur-featured',
      label: 'Featured Experiences',
      type: 'featured',
      content: {
        heading: 'Experiences in Bharatpur',
        subtitle: 'Hand-picked tours and activities',
        buttonText: 'View all',
      },
      style: lightStyle('left'),
    },
    frontendFooter('Bharatpur'),
  ],

  'bharatpur-experiences': [
    {
      id: 'bharatpur-experiences-hero',
      label: 'Hero Section',
      type: 'hero',
      content: {
        heading: 'Experiences in Bharatpur',
        subtitle: 'Jungle safaris, canoe trips and Tharu culture',
        buttonText: 'Browse all',
        tagline: 'Bharatpur',
      },
      style: heroStyle('center'),
    },
    {
      id: 'bharatpur-experiences-categories',
      label: 'Categories Strip',
      type: 'categories',
      content: {
        heading: 'Browse by category',
        subtitle: 'Food, culture, outdoor adventures and more',
      },
      style: lightStyle('center'),
    },
    frontendFooter('Bharatpur Experiences'),
  ],

  'bharatpur-experience': [
    {
      id: 'bharatpur-experience-hero',
      label: 'Experience Hero',
      type: 'hero',
      content: {
        heading: 'Bharatpur Experience',
        subtitle: 'A local-led tour at the edge of the jungle',
        buttonText: 'Book now',
        tagline: 'Bharatpur',
      },
      style: heroStyle('left'),
    },
    {
      id: 'bharatpur-experience-body',
      label: 'Description',
      type: 'text',
      content: {
        heading: 'About this experience',
        body: 'Describe the stops, the guide and what makes this Chitwan experience special.',
      },
      style: lightStyle('left'),
    },
    frontendFooter('Bharatpur Experience'),
  ],

  city: [
    {
      id: 'city-hero',
      label: 'Hero Section',
      type: 'hero',
      content: {
        heading: 'Discover a City',
        subtitle: 'Local guides, hidden corners and unforgettable days out',
        buttonText: 'Explore',
        tagline: 'City',
      },
      style: heroStyle('center'),
    },
    {
      id: 'city-featured',
      label: 'Featured Experiences',
      type: 'featured',
      content: {
        heading: 'Experiences in this city',
        subtitle: 'Hand-picked tours and activities',
        buttonText: 'View all',
      },
      style: lightStyle('left'),
    },
    frontendFooter('City'),
  ],

  'local-profile': [
    {
      id: 'local-profile-hero',
      label: 'Guide Hero',
      type: 'hero',
      content: {
        heading: 'Meet your local guide',
        subtitle: 'Verified, reviewed and ready to show you their Nepal',
        buttonText: 'View experiences',
        tagline: 'Local',
      },
      style: heroStyle('left'),
    },
    {
      id: 'local-profile-about',
      label: 'About the Guide',
      type: 'text',
      content: {
        heading: 'About',
        body: 'A short introduction to the guide, their background and the neighbourhoods they know best.',
      },
      style: lightStyle('left'),
    },
    {
      id: 'local-profile-reviews',
      label: 'Reviews',
      type: 'testimonials',
      content: {
        heading: 'What travelers say',
        subtitle: 'Verified reviews from guests who booked with this guide',
      },
      style: blueStyle('center'),
    },
    frontendFooter('Local Profile'),
  ],

  // ─ CMS-backed static pages ──
  about: [
    {
      id: 'about-hero',
      label: 'About Hero',
      type: 'hero',
      content: {
        heading: 'About Guides Nepal',
        subtitle:
          "Connecting travelers with authentic local experiences across Nepal's most beautiful destinations.",
        buttonText: 'Explore experiences',
        tagline: 'About',
      },
      style: darkStyle('center'),
    },
    {
      id: 'about-mission',
      label: 'Our Mission',
      type: 'text',
      content: {
        heading: 'Our Mission',
        body: 'We believe that the best travel experiences come from connecting with locals who share their passion, knowledge, and culture. Our platform makes it easy to find authentic guided experiences across Nepal.',
      },
      style: lightStyle('center'),
    },
    {
      id: 'about-values',
      label: 'Our Values',
      type: 'values',
      content: { heading: 'Our Values', subtitle: 'Authenticity, community and real responsibility.' },
      style: blueStyle('center'),
    },
    frontendFooter('About Us'),
  ],

  contact: [
    {
      id: 'contact-hero',
      label: 'Contact Hero',
      type: 'hero',
      content: {
        heading: 'Contact Us',
        subtitle: "Have a question or need help? We're here for you.",
        buttonText: 'Send a message',
        tagline: 'Contact',
      },
      style: darkStyle('center'),
    },
    {
      id: 'contact-info',
      label: 'Contact Info',
      type: 'contact',
      content: {
        heading: 'Get in Touch',
        body: 'Reach out by email at support@guides-nepal.com or send us a message using the form.',
        email: 'support@guides-nepal.com',
        phone: '+977-1-1234567',
        address: 'Thamel, Kathmandu, Nepal',
      },
      style: lightStyle('left'),
    },
    frontendFooter('Contact Us'),
  ],
};

/** Returns the pre-populated sections for a page slug (empty array when unknown). */
export function getFrontendContent(slug: string): FrontendSection[] {
  return FRONTEND_CONTENT[slug] || [];
}
