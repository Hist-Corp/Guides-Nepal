import axios from 'axios';
import { API_BASE_URL } from '../config/api';

export interface Guide {
  id: number;
  /** Login account id of the guide, when the backend knows it. */
  userId?: number | null;
  name: string;
  image: string;
  role: string;
  rating: number;
  reviews: number;
  bio: string;
  languages: string[];
  verified: boolean;
  livesIn?: string;
  cities: string[];
  gallery: string[];
  is_active: boolean;
  responseTime?: string;
  // Approved assignment terms for an experience, when the backend knows them.
  price?: number | null;
  slots?: number | null;
}

export interface GuideProfileExperience {
  slug: string;
  title: string;
  city?: string | null;
  category?: string | null;
  heroImage: string;
  price: number;
  duration?: string | null;
  rating: number;
  reviews: number;
  availableSlots?: number | null;
}

/** Everything the public guide profile page renders. */
export interface GuideProfile extends Guide {
  memberSince?: string | null;
  region?: string | null;
  stats: {
    experiences: number;
    cities: number;
    languages: number;
    rating: number;
    reviews: number;
  };
  experiences: GuideProfileExperience[];
}

export interface Experience {
  id: number;
  slug: string;
  title: string;
  city: string;
  category?: string;
  heroImage: string;
  description: string;
  price?: number;
  duration?: string;
  rating?: number;
  reviews?: number;
  host: Guide;
  // Guides a Regional Head approved for this experience ("Who you'll meet").
  guides?: Guide[];
  // Live capacity of a published guide listing, used by the booking card.
  maxGuests?: number | null;
  bookedGuests?: number | null;
  availableSlots?: number | null;
}

export const guidesApi = {
  // Get all guides
  getGuides: async (city?: string): Promise<Guide[]> => {
    const params = city ? { city } : {};
    const response = await axios.get(`${API_BASE_URL}/guides`, { params });
    return response.data;
  },

  // Get single guide by ID
  getGuide: async (id: number): Promise<Guide> => {
    const response = await axios.get(`${API_BASE_URL}/guides/${id}`);
    return response.data;
  },

  // Full public guide profile: bio, languages, cities, gallery and the
  // experiences the guide leads.
  getGuideProfile: async (id: number): Promise<GuideProfile> => {
    const response = await axios.get(`${API_BASE_URL}/guides/${id}/profile`);
    return response.data;
  },

  // Get all experiences
  getExperiences: async (city?: string, type?: string, search?: string): Promise<Experience[]> => {
    const params: Record<string, string> = {};
    if (city) params.city = city;
    if (type) params.type = type;
    if (search) params.search = search;
    
    const response = await axios.get(`${API_BASE_URL}/experiences`, { params });
    return response.data;
  },

  // Get single experience by slug
  getExperience: async (slug: string): Promise<Experience> => {
    const response = await axios.get(`${API_BASE_URL}/experiences/${slug}`);
    return response.data;
  },
};

export default guidesApi;