export type PublicExperience = {
  id: number
  slug: string
  title: string
  city: string
  category: string
  price: number
  duration: string
  rating: number
  reviews: number
  description: string
  highlights: string[]
  image: string
}

export type PublicGuide = {
  id: number
  name: string
  city: string
  bio: string
  languages: string[]
  rating: number
  reviews: number
  yearsExperience: number
}

export const CITIES = ["Kathmandu", "Pokhara", "Lalitpur", "Bhaktapur", "Bharatpur"]

export const CATEGORIES = ["Food Tours", "Cultural Tours", "Outdoor Activities", "Cooking Classes"]

// Seed catalog used when the backend API is unreachable, so every
// public page always renders with meaningful content.
export const seedExperiences: PublicExperience[] = [
  { id: 1, slug: "bhaktapur-heritage-walk", title: "Bhaktapur Heritage Walk", city: "Bhaktapur", category: "Cultural Tours", price: 50, duration: "4h", rating: 4.8, reviews: 124, image: "🛕", description: "Wander the medieval alleys of Bhaktapur Durbar Square with a licensed local guide, visiting potteries, hidden courtyards and Nyatapola Temple.", highlights: ["Durbar Square & Nyatapola", "Pottery Square", "Local juju dhau tasting"] },
  { id: 2, slug: "patan-cultural-circuit", title: "Patan Cultural Circuit", city: "Lalitpur", category: "Cultural Tours", price: 45, duration: "3h", rating: 4.6, reviews: 98, image: "🏯", description: "Explore Patan Durbar Square, the Golden Temple and the metalworking quarter of Patan's Newar artisans.", highlights: ["Patan Durbar Square", "Golden Temple", "Artisan workshops"] },
  { id: 3, slug: "pokhara-lakeside-evening", title: "Pokhara Lakeside Evening", city: "Pokhara", category: "Outdoor Activities", price: 35, duration: "2h", rating: 4.5, reviews: 76, image: "🚤", description: "A golden-hour boat ride on Phewa Lake followed by a sunset stroll along Lakeside with mountain views of the Annapurnas.", highlights: ["Phewa boat ride", "Sunset viewpoint", "Lakeside cafe stop"] },
  { id: 4, slug: "momo-masterclass", title: "Momo Masterclass", city: "Kathmandu", category: "Cooking Classes", price: 40, duration: "3h", rating: 4.9, reviews: 210, image: "🥟", description: "Learn to fold juicy buffalo and vegetable momos with a Kathmandu home cook, from dough to dipping sauce.", highlights: ["Hands-on folding", "Jhol achar sauce", "Eat what you make"] },
  { id: 5, slug: "kathmandu-street-food-crawl", title: "Kathmandu Street Food Crawl", city: "Kathmandu", category: "Food Tours", price: 30, duration: "3h", rating: 4.7, reviews: 187, image: "🍜", description: "Six tastings across Asan and Indra Chowk: chatpat, sel roti, yomari, samosas and more, straight from family stalls.", highlights: ["Asan Market", "6+ tastings", "Hidden courtyard eateries"] },
  { id: 6, slug: "newari-cooking-class-bhaktapur", title: "Newari Cooking Class", city: "Bhaktapur", category: "Cooking Classes", price: 55, duration: "4h", rating: 4.8, reviews: 92, image: "🍲", description: "Cook a full Newari feast - bara, chatamari, aila - in a traditional Bhaktapur home kitchen.", highlights: ["Chatamari & bara", "Local market shopping", "Family recipe booklet"] },
  { id: 7, slug: "annapurna-sunrise-trek", title: "Annapurna Sunrise Trek", city: "Pokhara", category: "Outdoor Activities", price: 90, duration: "8h", rating: 4.9, reviews: 301, image: "🥾", description: "Pre-dawn hike to a panoramic viewpoint for sunrise over Annapurna South and Machapuchare, with breakfast on the ridge.", highlights: ["Sunrise over Annapurna", "Guided trail", "Ridge breakfast"] },
  { id: 8, slug: "tharu-village-experience", title: "Tharu Village Experience", city: "Bharatpur", category: "Cultural Tours", price: 38, duration: "4h", rating: 4.5, reviews: 64, image: "🐘", description: "Meet the Tharu community, watch a stick dance performance and learn about riverside life near Chitwan.", highlights: ["Tharu stick dance", "Village walk", "Local dinner option"] },
]

export const seedGuides: PublicGuide[] = [
  { id: 201, name: "Ram Bahadur", city: "Kathmandu", bio: "Born and raised in Asan, Ram has been guiding heritage walks for 12 years and knows every hidden courtyard of the old city.", languages: ["English", "Nepali", "Newari"], rating: 4.9, reviews: 120, yearsExperience: 12 },
  { id: 202, name: "Sita Sharma", city: "Pokhara", bio: "Mountain lover and certified trekking guide, Sita leads sunrise hikes and lakeside tours around the Annapurna region.", languages: ["English", "Nepali", "Hindi"], rating: 4.7, reviews: 85, yearsExperience: 8 },
  { id: 203, name: "Kiran Adhikari", city: "Bhaktapur", bio: "Kiran grew up in Bhaktapur's Pottery Square and specializes in Newari culture, food and festivals.", languages: ["English", "Nepali"], rating: 4.4, reviews: 33, yearsExperience: 5 },
  { id: 204, name: "Maya Tamang", city: "Lalitpur", bio: "Art historian turned guide, Maya runs the Patan cultural circuit and cooking workshops with local families.", languages: ["English", "Nepali", "Tamang"], rating: 4.8, reviews: 96, yearsExperience: 10 },
  { id: 205, name: "Bikash Gurung", city: "Bharatpur", bio: "Wildlife and culture guide near Chitwan, Bikash connects travelers with Tharu village life and jungle trails.", languages: ["English", "Nepali", "Gurung"], rating: 4.6, reviews: 54, yearsExperience: 7 },
]

// Normalizes API experiences (snake_case or camelCase) into PublicExperience.
export function normalizeExperience(raw: any, index: number): PublicExperience {
  return {
    id: raw.id ?? index + 1,
    slug: raw.slug ?? String(raw.title ?? "experience").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    title: raw.title ?? raw.name ?? "Untitled experience",
    city: raw.city ?? raw.location ?? "Kathmandu",
    category: raw.category ?? "Cultural Tours",
    price: Number(raw.price ?? raw.price_from ?? 35),
    duration: raw.duration ?? "3h",
    rating: Number(raw.rating ?? 4.5),
    reviews: Number(raw.reviews ?? raw.review_count ?? 0),
    description: raw.description ?? "Discover this experience with a local guide in Nepal.",
    highlights: Array.isArray(raw.highlights) ? raw.highlights : ["Guided by a local", "Small group", "Flexible cancellation"],
    image: raw.image ?? "🗺️",
  }
}

// Normalizes API guides into PublicGuide.
export function normalizeGuide(raw: any, index: number): PublicGuide {
  return {
    id: raw.id ?? index + 1,
    name: raw.name ?? ([raw.firstName, raw.lastName].filter(Boolean).join(" ") || "Local guide"),
    city: raw.city ?? "Kathmandu",
    bio: raw.bio ?? "A passionate local guide ready to show you the best of Nepal.",
    languages: Array.isArray(raw.languages) ? raw.languages : ["English", "Nepali"],
    rating: Number(raw.rating ?? 4.5),
    reviews: Number(raw.reviews ?? raw.review_count ?? 0),
    yearsExperience: Number(raw.yearsExperience ?? raw.experience_years ?? 5),
  }
}
