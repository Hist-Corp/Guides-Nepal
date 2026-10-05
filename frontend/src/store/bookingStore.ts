import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  addBooking: (booking: Booking) => void;
  cancelBooking: (id: string) => void;
  archiveBooking: (id: string) => void;
}

export const useBookingStore = create<BookingStore>()(
  persist(
    (set) => ({
      bookings: [],
      addBooking: (booking) => 
        set((state) => ({ bookings: [...state.bookings, booking] })),
      cancelBooking: (id) => 
        set((state) => ({
          bookings: state.bookings.map((b) => 
            b.id === id ? { ...b, status: 'cancelled' } : b
          )
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
