import axios from 'axios';
import { API_BASE_URL } from '../config/api';

export interface Guide {
  id: number;
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