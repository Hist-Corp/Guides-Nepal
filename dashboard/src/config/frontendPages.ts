export type FrontendPage = {
  title: string;
  path: string;
  slug: string;
  category: string;
  description: string;
  icon: string;
};

export const FRONTEND_PAGES: FrontendPage[] = [
  { title: "Home", path: "/", slug: "home", category: "Main", description: "Landing page with hero search and featured experiences.", icon: "🏠" },
  { title: "Explore", path: "/explore", slug: "explore", category: "Experiences", description: "Browse all experiences and tours.", icon: "🔍" },
  { title: "Search", path: "/search", slug: "search", category: "Main", description: "Search experiences by keyword, city or activity.", icon: "🔎" },
  { title: "Most Popular", path: "/most-popular", slug: "most-popular", category: "Experiences", description: "Our most popular tours.", icon: "⭐" },
  { title: "Most Delicious", path: "/most-delicious", slug: "most-delicious", category: "Experiences", description: "Food and culinary experiences.", icon: "🍜" },
  { title: "Real Good Travel", path: "/real-good-travel", slug: "real-good-travel", category: "Experiences", description: "Curated travel stories and tips.", icon: "✈️" },
  { title: "Food Tours", path: "/food-tours", slug: "food-tours", category: "Experiences", description: "Cooking classes and food tours.", icon: "🍲" },
  { title: "Food Tour Culture", path: "/food-tours/culture/:slug", slug: "food-tour-culture", category: "Experiences", description: "Cultural food tour detail.", icon: "🍛" },
  { title: "Cultural Tours", path: "/cultural-tours", slug: "cultural-tours", category: "Experiences", description: "Cultural heritage tours.", icon: "🏛️" },
  { title: "Outdoor Activities", path: "/outdoor-activities", slug: "outdoor-activities", category: "Experiences", description: "Adventure and outdoor activities.", icon: "🥾" },
  { title: "Cooking Classes", path: "/cooking-classes", slug: "cooking-classes", category: "Experiences", description: "Hands-on cooking classes.", icon: "👨‍🍳" },
  { title: "Experience", path: "/experience/:id", slug: "experience", category: "Experiences", description: "Experience detail page.", icon: "🗺️" },
  { title: "SEO Experience", path: "/experience/seo/:slug", slug: "seo-experience", category: "Experiences", description: "SEO-friendly experience page.", icon: "🔗" },
  { title: "Kathmandu", path: "/city/kathmandu", slug: "kathmandu", category: "Cities", description: "Discover Kathmandu.", icon: "🏛️" },
  { title: "Kathmandu Experiences", path: "/city/kathmandu/experiences", slug: "kathmandu-experiences", category: "Cities", description: "Experiences in Kathmandu.", icon: "📋" },
  { title: "Kathmandu Experience", path: "/city/kathmandu/experience/:slug", slug: "kathmandu-experience", category: "Cities", description: "Kathmandu experience detail.", icon: "📍" },
  { title: "Pokhara", path: "/city/pokhara", slug: "pokhara", category: "Cities", description: "Discover Pokhara.", icon: "🚤" },
  { title: "Pokhara Experiences", path: "/city/pokhara/experiences", slug: "pokhara-experiences", category: "Cities", description: "Experiences in Pokhara.", icon: "📋" },
  { title: "Pokhara Experience", path: "/city/pokhara/experience/:slug", slug: "pokhara-experience", category: "Cities", description: "Pokhara experience detail.", icon: "📍" },
  { title: "Lalitpur", path: "/city/lalitpur", slug: "lalitpur", category: "Cities", description: "Discover Lalitpur.", icon: "🏯" },
  { title: "Lalitpur Experiences", path: "/city/lalitpur/experiences", slug: "lalitpur-experiences", category: "Cities", description: "Experiences in Lalitpur.", icon: "📋" },
  { title: "Lalitpur Experience", path: "/city/lalitpur/experience/:slug", slug: "lalitpur-experience", category: "Cities", description: "Lalitpur experience detail.", icon: "📍" },
  { title: "Bhaktapur", path: "/city/bhaktapur", slug: "bhaktapur", category: "Cities", description: "Discover Bhaktapur.", icon: "🛕" },
  { title: "Bhaktapur Experiences", path: "/city/bhaktapur/experiences", slug: "bhaktapur-experiences", category: "Cities", description: "Experiences in Bhaktapur.", icon: "📋" },
  { title: "Bhaktapur Experience", path: "/city/bhaktapur/experience/:slug", slug: "bhaktapur-experience", category: "Cities", description: "Bhaktapur experience detail.", icon: "📍" },
  { title: "Bharatpur", path: "/city/bharatpur", slug: "bharatpur", category: "Cities", description: "Discover Bharatpur.", icon: "🐘" },
  { title: "Bharatpur Experiences", path: "/city/bharatpur/experiences", slug: "bharatpur-experiences", category: "Cities", description: "Experiences in Bharatpur.", icon: "📋" },
  { title: "Bharatpur Experience", path: "/city/bharatpur/experience/:slug", slug: "bharatpur-experience", category: "Cities", description: "Bharatpur experience detail.", icon: "📍" },
  { title: "City", path: "/city/:cityId", slug: "city", category: "Cities", description: "Generic city index page.", icon: "🗺️" },
  { title: "Local Profile", path: "/local/:id", slug: "local-profile", category: "Guides", description: "Profile of a local guide.", icon: "👤" },
];