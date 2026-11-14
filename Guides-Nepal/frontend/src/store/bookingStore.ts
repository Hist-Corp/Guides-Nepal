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
  addBooking: (booking: Booking) => Promise<boolean>;
  cancelBooking: (id: string) => void;
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
        if (!accessToken) return false;

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
            return false;
          }
          set((state) => ({ bookings: [...state.bookings, booking] }));
          return true;
        } catch (error) {
          console.error('Failed to save booking:', error);
          alert('Unable to save your booking. Please choose another guide or another date.');
          return false;
        }
      },
      cancelBooking: (id) => 
        set((state) => ({
          bookings: state.bookings.map((b) => 
            b.id === id ? { ...b, status: 'cancelled' } : b
          )
        })),
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
