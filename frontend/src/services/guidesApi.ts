import axios from 'axios';
import { API_BASE_URL } from '../config/api';

export interface Guide {
  id: number;
  /** Public profile slug, used by ``/guidesprofile/:slug``. */
  slug?: string | null;
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
export interface GuideProfileDocument {
  id: number;
  label: string;
  doc_type: string;
  stored_name: string;
  content_type: string;
  uploaded_at: string;
}

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
  profile_documents?: GuideProfileDocument[];
  /** Support the guide offers travellers during a trip, written by the guide. */
  trip_support?: string | null;
}

export interface GuideProfileDocsResponse {
  profile_documents: GuideProfileDocument[];
  trip_support?: string;
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

  // Same payload, addressed by the public profile slug.
  getGuideProfileBySlug: async (slug: string): Promise<GuideProfile> => {
    const response = await axios.get(
      `${API_BASE_URL}/guides/by-slug/${encodeURIComponent(slug)}`
    );
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

  // Signed-in guide uploaded profile documents (certificates/images).
  getMyProfileDocs: async (token: string): Promise<GuideProfileDocsResponse> => {
    const { data } = await axios.get(`${API_BASE_URL}/guide/profile/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  },

  uploadCertificate: async (
    token: string,
    form: FormData,
  ): Promise<GuideProfileDocsResponse> => {
    const { data } = await axios.put(`${API_BASE_URL}/guide/profile/`, form, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  },

  // Save the "Trip Support" text shown on the public profile.
  updateTripSupport: async (
    token: string,
    tripSupport: string,
  ): Promise<{ trip_support: string }> => {
    const { data } = await axios.put(
      `${API_BASE_URL}/guide/profile/support`,
      { trip_support: tripSupport },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return data;
  },

  deleteProfileDocument: async (
    token: string,
    documentId: number,
  ): Promise<{ status: string }> => {
    const { data } = await axios.delete(`${API_BASE_URL}/guide/profile/documents/${documentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  },
};

export default guidesApi;