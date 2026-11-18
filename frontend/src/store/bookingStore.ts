import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getApiUrl } from '../config/api';
import { useAuthStore } from './authStore';

export interface Booking {
  id: string;
  experienceId: number | string;
  experienceTitle: string;
  city: string;
  date: string;
  guests: number;
  price: number;
  image: string;
  status: 'upcoming' | 'archived' | 'cancelled';
  /** Guide reserved by this booking (hidden from "Who you'll meet" while active) */
  guideId?: number | string;
  guideName?: string;
}

interface BookingStore {
  bookings: Booking[];
  /** Persists the booking and returns it as stored, with the server's id;
   * null when the guide/date was rejected or the user is signed out. */
  addBooking: (booking: Booking) => Promise<Booking | null>;
  /** Cancels the booking on the server (releasing the date's capacity) and
   * marks it cancelled locally; false when the server refused. */
  cancelBooking: (id: string) => Promise<boolean>;
  /** Fully removes the booking record — the cancel step keeps its own status
   * transition, so cancelling and deleting a booking are separate intents. */
  deleteBooking: (id: string) => void;
  archiveBooking: (id: string) => void;
}

export const useBookingStore = create<BookingStore>()(
  persist(
    (set) => ({
      bookings: [],
      addBooking: async (booking) => {
        const { accessToken, refreshTokens } = useAuthStore.getState();
        if (!accessToken) return null;

        const attempt = async (token: string) => {
          const response = await fetch(getApiUrl('/bookings/'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              experience_id: Number(booking.experienceId) || 0,
              experience_title: booking.experienceTitle,
              city: booking.city,
              date: booking.date,
              guests: booking.guests,
              price: booking.price,
              image: booking.image,
              ...(booking.guideId !== undefined && booking.guideId !== null
                ? { guide_id: Number(booking.guideId) }
                : {}),
            }),
          });
          if (response.status === 401) {
            // Access token likely expired (30-minute expiry). Rotate it using
            // the refresh token and retry the booking once before giving up.
            const refreshed = await refreshTokens();
            if (refreshed) {
              const nextToken = useAuthStore.getState().accessToken;
              if (nextToken) return attempt(nextToken);
            }
          }
          return response;
        };

        // Keep the traveler view responsive, then persist the same booking so
        // the assigned guide can see it from their own account.
        try {
          const response = await attempt(accessToken);
          if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            alert(error.detail || 'This guide is unavailable. Please choose another guide or another date.');
            return null;
          }
          // The server assigns the booking id; keep it so the confirmation can
          // show the real reference instead of the local placeholder.
          const saved: { id?: number | string } | null = await response.json().catch(() => null);
          const savedBooking: Booking =
            saved?.id !== undefined && saved?.id !== null
              ? { ...booking, id: String(saved.id) }
              : booking;
          set((state) => ({ bookings: [...state.bookings, savedBooking] }));
          return savedBooking;
        } catch (error) {
          console.error('Failed to save booking:', error);
          alert('Unable to save your booking. Please choose another guide or another date.');
          return null;
        }
      },
      cancelBooking: async (id) => {
        const { accessToken, refreshTokens } = useAuthStore.getState();
        if (!accessToken) return false;

        const attempt = async (token: string): Promise<Response> => {
          const response = await fetch(getApiUrl(`/bookings/${id}/cancel`), {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.status === 401) {
            const refreshed = await refreshTokens();
            if (refreshed) {
              const nextToken = useAuthStore.getState().accessToken;
              if (nextToken) return attempt(nextToken);
            }
          }
          return response;
        };

        try {
          const response = await attempt(accessToken);
          if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            alert(error.detail || 'Unable to cancel this booking. Please try again.');
            return false;
          }
          set((state) => ({
            bookings: state.bookings.map((b) =>
              b.id === id ? { ...b, status: 'cancelled' } : b
            ),
          }));
          return true;
        } catch (error) {
          console.error('Failed to cancel booking:', error);
          alert('Unable to cancel this booking. Please try again.');
          return false;
        }
      },
      deleteBooking: (id) =>
        set((state) => ({
          bookings: state.bookings.filter((b) => b.id !== id)
        })),
      archiveBooking: (id) =>
        set((state) => ({
          bookings: state.bookings.map((b) =>
            b.id === id ? { ...b, status: 'archived' } : b
          )
        }))
    }),
    {
      name: 'booking-storage',
    }
  )
);
