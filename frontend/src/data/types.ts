export interface Guide {
  id: number;
  name: string;
  image: string;
  role: string;
  rating: number;
  reviews: number;
  bio: string;
  languages: string[];
  verified?: boolean;
  responseTime?: string;
  gallery?: string[];
  livesIn?: string;
  cities: string[];
}

export interface RichExperienceData {
  id: number;
  slug: string;
  title: string;
  heroImage: string;
  host: {
    name: string;
    image: string;
    type: string;
  };
  guides: Guide[];
  description: string;
  tourStructure: {
    steps: { name: string; label: string }[];
  };
  exploration: {
    title: string;
    description: string;
    points: string[];
  };
  atmosphere: string;
  hiddenGems: string;
  city?: string; // Added to identify city
  price?: number; // Added for listing
  duration?: string; // Added for listing
  type?: string; // Added for listing
  rating?: number; // Overall rating for the experience
  reviews?: number; // Total number of reviews for the experience
}
