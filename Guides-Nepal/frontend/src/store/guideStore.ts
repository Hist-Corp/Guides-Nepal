import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface GuideFilter {
  date: string | null;
  guestCount: number;
  category: string | null;
  city: string | null;
}

export interface GuideBookingState {
  filters: GuideFilter;
  setFilters: (filters: Partial<GuideFilter>) => void;
  resetFilters: () => void;
}

export const useGuideStore = create<GuideBookingState>()(
  persist(
    (set) => ({
      filters: {
        date: null,
        guestCount: 2,
        category: null,
        city: null,
      },
      setFilters: (filters) =>
        set((state) => ({
          state.filters: { ...state.filters, ...filters },
        })),
      resetFilters: () =>
        set({
          filters: {
            date: null,
            guestCount: 2,
            category: null,
            city: null,
          },
        }),
    }),

    {
      name: 'guide-storage',
      partialize: (state) => ({
        filters: state.filters,
      }),
    },
  ),
);