import { API_BASE_URL } from '../config/api';
import { useAuthStore } from '../store/authStore';

export interface GuideAvailability {
  guideId: number;
  guideName: string;
  guideImage: string;
  rating: number;
  reviews: number;
  city: string;
  category: string;
  price: number;
  date: string;
  isAvailable: boolean;
  spotsRemaining: number;
  maxGuests: number;
  timeSlots: string[];
  lockedBy?: string;
  isBooking: boolean;
}

export interface BookingRequest {
  experienceId: number | string;
  experienceTitle: string;
  city: string;
  date: string;
  timeSlot: string;
  guideId: number;
  guests: number;
  price: number;
}

export interface BookingResponse {
  id: string;
  status: 'confirmed' | 'pending' | 'rejected';
  guideId: number;
  remainingSpots: number;
  message?: string;
}

export interface AvailabilityFilter {
  date: string | null;
  guestCount: number;
  category: string | null;
  city: string | null;
}

const IDEMPOTENCY_HEADER = 'Idempotency-Key';

const generateIdempotencyKey = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
};

const authHeaders = (token: string): HeadersInit => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
  [IDEMPOTENCY_HEADER]: generateIdempotencyKey(),
});

export const bookingApi = {
  getAvailableGuides: async (
    experienceId: number | string,
    filters?: AvailabilityFilter,
  ): Promise<GuideAvailability[]> => {
    const params = new URLSearchParams();
    if (filters?.date) params.set('date', filters.date);
    if (filters?.guestCount) params.set('guest_count', String(filters.guestCount));
    if (filters?.category) params.set('category', filters.category);
    if (filters?.city) params.set('city', filters.city);

    const url = `${API_BASE_URL}/experiences/${experienceId}/guides?${params.toString()}`;
    const { accessToken } = useAuthStore.getState();
    if (!accessToken) throw new Error('Not authenticated');

    const res = await fetch(url, { headers: authHeaders(accessToken) });
    if (!res.ok) {
      const detail = (await res.json().catch(() => ({}))).detail;
      throw new Error(detail || 'Unable to load available guides.');
    }
    return res.json();
  },

  createBooking: async (payload: BookingRequest): Promise<BookingResponse> => {
    const { accessToken, refreshTokens } = useAuthStore.getState();
    if (!accessToken) throw new Error('Not authenticated');

    const idempotencyKey = generateIdempotencyKey();

    const attempt = async (token: string): Promise<Response> => {
      return fetch(`${API_BASE_URL}/bookings/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          [IDEMPOTENCY_HEADER]: idempotencyKey,
        },
        body: JSON.stringify({
          experience_id: Number(payload.experienceId) || 0,
          experience_title: payload.experienceTitle,
          city: payload.city,
          date: payload.date,
          time_slot: payload.timeSlot,
          guide_id: payload.guideId,
          guests: payload.guests,
          price: payload.price,
        }),
      });
    };

    const response = await attempt(accessToken);

    if (response.status === 401) {
      const refreshed = await refreshTokens();
      if (refreshed) {
        const nextToken = useAuthStore.getState().accessToken;
        if (nextToken) return attempt(nextToken);
      }
      throw new Error('Session expired. Please log in again.');
    }

    if (!response.ok) {
      const detail = (await response.json().catch(() => ({}))).detail;
      if (response.status === 409) {
        throw new Error(
          detail || 'This guide was just booked by another traveler. Please choose another guide or date.',
        );
      }
      throw new Error(detail || 'Unable to create booking.');
    }

    return response.json();
  },

  checkAvailability: async (
    guideId: number,
    date: string,
    timeSlot?: string,
  ): Promise<{ isAvailable: boolean; spotsRemaining: number; message?: string }> => {
    const { accessToken } = useAuthStore.getState();
    if (!accessToken) throw new Error('Not authenticated');

    const params = new URLSearchParams({ date });
    if (timeSlot) params.set('time_slot', timeSlot);

    const res = await fetch(
      `${API_BASE_URL}/guides/${guideId}/availability?${params.toString()}`,
      { headers: authHeaders(accessToken) },
    );
    if (!res.ok) {
      const detail = (await res.json().catch(() => ({}))).detail;
      throw new Error(detail || 'Unable to check availability.');
    }
    return res.json();
  },

  cancelBooking: async (bookingId: string): Promise<void> => {
    const { accessToken } = useAuthStore.getState();
    if (!accessToken) throw new Error('Not authenticated');

    const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
      method: 'DELETE',
      headers: authHeaders(accessToken),
    });
    if (!res.ok) {
      const detail = (await res.json().catch(() => ({}))).detail;
      throw new Error(detail || 'Unable to cancel booking.');
    }
  },
