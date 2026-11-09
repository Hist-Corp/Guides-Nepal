import { API_BASE_URL } from '../config/api';
import { useAuthStore } from '../store/authStore';

export type GuideCategory = 'trekking' | 'tour' | 'specialized';
export type GuideUpdateType = 'availability' | 'capacity' | 'booking' | 'schedule' | 'announcement';
export type GuideExperienceRequestType = 'experience' | 'booking';
export type GuideExperienceRequestStatus = 'pending' | 'approved' | 'rejected';

export interface GuideExperienceRequest {
  id: number;
  guide_user_id: number;
  experience_id: number | null;
  booking_id: number | null;
  request_type: GuideExperienceRequestType;
  price_per_person?: number | null;
  slots?: number | null;
  meeting_point?: string | null;
  status: GuideExperienceRequestStatus;
  reviewed_by: number | null;
  reviewed_at: string | null;
  review_notes: string | null;
  created_at: string | null;
  updated_at: string | null;
  guide_name?: string;
  guide_email?: string;
  guide_region?: string;
  /** Name resolved from the experience the request targets. */
  experience_title?: string | null;
  booking_title?: string;
  booking_date?: string;
}

export interface GuideExperienceRequestCreate {
  request_type: GuideExperienceRequestType;
  experience_id?: number;
  booking_id?: number;
  price_per_person?: number;
  slots?: number;
  meeting_point?: string;
}

export interface GuideExperienceRequestReview {
  status: GuideExperienceRequestStatus;
  review_notes?: string;
}

export interface GuideExperienceOption {
  id: number;
  title: string;
  city: string;
  price: number;
  /** Activity type the new-listing form's first page filters on. */
  category: GuideCategory;
}

export interface GuideBookingOption {
  id: number;
  experience_title: string;
  city: string;
  date: string;
  status: string;
}

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
  max_guests: number | null;
  is_active: boolean;
  booked_guests: number;
  available_spots: number | null;
  occupancy_pct: number;
  /** "owned" rows are editable here; "assigned" rows come from a Regional Manager. */
  source?: 'owned' | 'assigned';
  can_edit?: boolean;
  can_delete?: boolean;
  assignment_id?: number;
  experience_id?: number;
  public_slug?: string;
  is_primary?: boolean;
  assigned_at?: string | null;
  managed_by?: string;
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
    owned_listings?: number;
    assigned_listings?: number;
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

async function authenticatedFetch(token: string, input: RequestInfo | URL, init?: RequestInit) {
  const fetchWithToken = (accessToken: string) =>
    fetch(input, { ...init, headers: authHeaders(accessToken) });
  const response = await fetchWithToken(token);
  if (response.status !== 401) return response;

  const refreshed = await useAuthStore.getState().refreshTokens();
  const nextToken = useAuthStore.getState().accessToken;
  if (!refreshed || !nextToken) return response;

  return fetchWithToken(nextToken);
}

export const guideDashboardApi = {
  getDashboard: async (token: string): Promise<GuideDashboardPayload> => {
    const res = await fetch(`${API_BASE_URL}/guide/dashboard`, { headers: authHeaders(token) });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || 'Unable to load dashboard.');
    return res.json();
  },
  getOnboarding: async (token: string) => {
    const res = await authenticatedFetch(token, `${API_BASE_URL}/guide/onboarding`);
    if (!res.ok) throw new Error('Unable to load onboarding.');
    return res.json() as Promise<{ onboarding: GuideOnboarding | null; completed: boolean }>;
  },
  listExperienceOptions: async (token: string): Promise<GuideExperienceOption[]> => {
    const res = await authenticatedFetch(token, `${API_BASE_URL}/guide/experience-options`);
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || 'Unable to load experiences.');
    return res.json();
  },
  listBookings: async (token: string): Promise<GuideBookingOption[]> => {
    const res = await authenticatedFetch(token, `${API_BASE_URL}/guide/bookings`);
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || 'Unable to load bookings.');
    return res.json();
  },
  saveOnboarding: async (token: string, payload: Partial<GuideOnboarding>) => {
    const res = await authenticatedFetch(token, `${API_BASE_URL}/guide/onboarding`, {
      method: 'PUT',
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
  listPublicListings: async (): Promise<GuideListing[]> => {
    const res = await fetch(`${API_BASE_URL}/guide/listings/public`);
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

  createExperienceRequest: async (
    token: string,
    payload: GuideExperienceRequestCreate,
  ): Promise<GuideExperienceRequest> => {
    const res = await authenticatedFetch(token, `${API_BASE_URL}/guide/experience-requests`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || 'Unable to create request.');
    return res.json();
  },

  listExperienceRequests: async (token: string): Promise<GuideExperienceRequest[]> => {
    const res = await authenticatedFetch(token, `${API_BASE_URL}/guide/experience-requests`);
    if (!res.ok) throw new Error('Unable to load requests.');
    return res.json();
  },

  listExperienceRequestsForReview: async (
    token: string,
    statusFilter?: string,
  ): Promise<GuideExperienceRequest[]> => {
    const url = statusFilter
      ? `${API_BASE_URL}/operations/guide-experience-requests?status_filter=${encodeURIComponent(statusFilter)}`
      : `${API_BASE_URL}/operations/guide-experience-requests`;
    const res = await fetch(url, { headers: authHeaders(token) });
    if (!res.ok) throw new Error('Unable to load review queue.');
    return res.json();
  },

  reviewExperienceRequest: async (
    token: string,
    requestId: number,
    payload: GuideExperienceRequestReview,
  ): Promise<GuideExperienceRequest> => {
    const res = await fetch(`${API_BASE_URL}/operations/guide-experience-requests/${requestId}/review`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || 'Unable to review request.');
    return res.json();
  },
};
