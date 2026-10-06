import { API_BASE_URL } from '../config/api';

export type GuideCategory = 'trekking' | 'tour' | 'specialized';
export type GuideUpdateType = 'availability' | 'capacity' | 'booking' | 'schedule' | 'announcement';

export interface GuideListing {
  id: number;
  title: string;
  category: GuideCategory;
  city: string;
  area?: string | null;
  description: string;
  itinerary?: string | null;
  meeting_point?: string | null;
  duration: string;
  difficulty: string;
  price: number;
  max_guests: number;
  is_active: boolean;
  booked_guests: number;
  available_spots: number;
  occupancy_pct: number;
}

export interface GuideStatusItem {
  id: number;
  update_type: GuideUpdateType;
  message: string;
  listing_id?: number | null;
  area?: string | null;
  event_date?: string | null;
  current_capacity?: number | null;
  max_capacity?: number | null;
  is_active: boolean;
  created_at?: string | null;
}

export interface GuideOnboarding {
  guide_user_id?: number;
  display_name?: string | null;
  expertise_areas: string[];
  cities: string[];
  languages: string[];
  bio?: string | null;
  years_experience?: string | null;
  default_max_guests: number;
  onboarding_completed: boolean;
}

export interface GuideDashboardPayload {
  guide: { id: number; email: string; firstName?: string; lastName?: string; role: string };
  stats: {
    listings: number;
    upcoming_bookings: number;
    total_guests: number;
    total_capacity: number;
    booked_capacity: number;
    available_spots: number;
  };
  listings: GuideListing[];
  recent_status: GuideStatusItem[];
}

function authHeaders(token: string) {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

export const guideDashboardApi = {
  getDashboard: async (token: string): Promise<GuideDashboardPayload> => {
    const res = await fetch(`${API_BASE_URL}/guide/dashboard`, { headers: authHeaders(token) });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || 'Unable to load dashboard.');
    return res.json();
  },
  getOnboarding: async (token: string) => {
    const res = await fetch(`${API_BASE_URL}/guide/onboarding`, { headers: authHeaders(token) });
    if (!res.ok) throw new Error('Unable to load onboarding.');
    return res.json() as Promise<{ onboarding: GuideOnboarding | null; completed: boolean }>;
  },
  saveOnboarding: async (token: string, payload: Partial<GuideOnboarding>) => {
    const res = await fetch(`${API_BASE_URL}/guide/onboarding`, {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || 'Unable to save onboarding.');
    return res.json();
  },
  listListings: async (token: string): Promise<GuideListing[]> => {
    const res = await fetch(`${API_BASE_URL}/guide/listings`, { headers: authHeaders(token) });
    if (!res.ok) throw new Error('Unable to load listings.');
    return res.json();
  },
  createListing: async (token: string, payload: Record<string, unknown>): Promise<GuideListing> => {
    const res = await fetch(`${API_BASE_URL}/guide/listings`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || 'Unable to create listing.');
    return res.json();
  },
  updateListing: async (token: string, id: number, payload: Record<string, unknown>): Promise<GuideListing> => {
    const res = await fetch(`${API_BASE_URL}/guide/listings/${id}`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || 'Unable to update listing.');
    return res.json();
  },
  deleteListing: async (token: string, id: number) => {
    const res = await fetch(`${API_BASE_URL}/guide/listings/${id}`, {
      method: 'DELETE',
      headers: authHeaders(token),
    });
    if (!res.ok) throw new Error('Unable to delete listing.');
  },
  updateCapacity: async (
    token: string,
    id: number,
    payload: { max_guests?: number; booked_delta?: number },
  ): Promise<GuideListing> => {
    const res = await fetch(`${API_BASE_URL}/guide/listings/${id}/capacity`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || 'Unable to update capacity.');
    return res.json();
  },
  listStatus: async (token: string): Promise<GuideStatusItem[]> => {
    const res = await fetch(`${API_BASE_URL}/guide/status`, { headers: authHeaders(token) });
    if (!res.ok) throw new Error('Unable to load updates.');
    return res.json();
  },
  postStatus: async (token: string, payload: Record<string, unknown>): Promise<GuideStatusItem> => {
    const res = await fetch(`${API_BASE_URL}/guide/status`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || 'Unable to post update.');
    return res.json();
  },
  deleteStatus: async (token: string, id: number) => {
    const res = await fetch(`${API_BASE_URL}/guide/status/${id}`, {
      method: 'DELETE',
      headers: authHeaders(token),
    });
    if (!res.ok) throw new Error('Unable to delete update.');
  },
  decideBooking: async (token: string, id: number, status: string) => {
    const res = await fetch(`${API_BASE_URL}/guide/bookings/${id}`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || 'Unable to update booking.');
    return res.json();
  },
};
