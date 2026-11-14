import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuthStore } from './authStore';
import { bookingApi, GuideAvailability } from '../services/bookingApi';

export interface GuideFilter {
  date: string | null;
  guestCount: number;
  category: string | null;
  city: string | null;
}

export interface GuideWithAvailability extends GuideAvailability {
  source?: 'owned';
  assignedSource?: 'assigned';
  recentlyRemoved?: boolean;
}

export interface GuideBookingState {
  // Filtered state
  filters: GuideFilter;
  setFilters: (filters: Partial<GuideFilter>) => void;

  // Available guides data
  availableGuides: GuideWithAvailability[];
  isLoadingGuides: boolean;
  errorGuides: string | null;

  // Race condition tracking
  pendingGuideIds: Set<number>;
  lockedGuideIds: Set<number>;

  // Current booking in progress
  currentBookingGuideId: number | null;
  currentBookingGuideName: string | null;

  // Actions - filtering
  setFilters: (filters: Partial<GuideFilter>) => void;
  resetFilters: () => void;

  // Actions - data loading
  setAvailableGuides: (guides: GuideWithAvailability[]) => void;
  setLoadingGuides: (loading: boolean) => void;
  setErrorGuides: (error: string | null) => void;

  // Actions - race condition mitigation
  lockGuide: (guideId: number) => void;
  unlockGuide: (guideId: number) => void;
  setPendingGuide: (guideId: number, inProgress: boolean) => void;

  // Actions - current booking
  setCurrentBookingGuide: (guideId: number, guideName: string) => void;
  clearCurrentBookingGuide: () => void;

  // Actions - guide selection -> triggers detail panel render
  selectGuide: (guide: GuideWithAvailability) => void;
  clearSelection: () => void;

  // Fetch available guides with filtering
  loadAvailableGuides: async (experienceId: number | string, filters?: GuideFilter) => void;
}

export const useGuideStore = create<GuideBookingState>()(
  persist(
    (set, get) => ({
      // Initial state
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

      // Available guides data
      availableGuides: [],
      isLoadingGuides: false,
      errorGuides: null,

      // Race condition tracking sets
      pendingGuideIds: new Set(),
      lockedGuideIds: new Set(),

      // Current booking tracking
      currentBookingGuideId: null,
      currentBookingGuideName: null,

      // Data loading actions
      setAvailableGuides: (guides) =>
        set({ availableGuides: guides, isLoadingGuides: false, errorGuides: null }),

      setLoadingGuides: (loading) => set({ isLoadingGuides: loading }),

      setErrorGuides: (error) => set({ errorGuides: error }),

      // Race condition mitigation actions
      lockGuide: (guideId) =>
        set((state) => ({
          pendingGuideIds: new Set([...state.pendingGuideIds, guideId]),
          lockedGuideIds: new Set([...state.lockedGuideIds, guideId]),
        })),

      unlockGuide: (guideId) =>
        set((state) => ({
          pendingGuideIds: new Set([...state.pendingGuideIds].filter((id) => id !== guideId)),
          lockedGuideIds: new Set([...state.lockedGuideIds].filter((id) => id !== guideId)),
        })),

      setPendingGuide: (guideId, inProgress) => {
        if (inProgress) {
          set({ pendingGuideIds: new Set([...get().pendingGuideIds, guideId]) });
        } else {
          set({
            pendingGuideIds: new Set([...get().pendingGuideIds].filter((id) => id !== guideId)),
          });
        }
      },

      // Current booking tracking
      setCurrentBookingGuide: (guideId, guideName) =>
        set({ currentBookingGuideId: guideId, currentBookingGuideName: guideName }),

      clearCurrentBookingGuide: () =>
        set({ currentBookingGuideId: null, currentBookingGuideName: null }),

      // Guide selection -> triggers detail panel render
      selectGuide: (guide) =>
        set({
          currentBookingGuideId: guide.guideId,
          currentBookingGuideName: guide.guideName,
        }),

      clearSelection: () =>
        set({ currentBookingGuideId: null, currentBookingGuideName: null }),

      // Fetch available guides with filtering
      loadAvailableGuides: async (experienceId, filters) => {
        const { accessToken } = useAuthStore.getState();
        if (!accessToken) return;

        set({ isLoadingGuides: true, errorGuides: null, availableGuides: [] });

        try {
          const result = await bookingApi.getAvailableGuides(experienceId, filters);
          set({ availableGuides: result, isLoadingGuides: false });

          // Auto-unlock guides that became unavailable after load
          const nowLocked = new Set(get().lockedGuideIds);
          set({
            lockedGuideIds: nowLocked,
            pendingGuideIds: new Set(
              get().pendingGuideIds.filter((id) => {
                const guide = result.find((g) => g.guideId === id);
                return guide ? guide.isAvailable : false;
              }),
            ),
          });
        } catch (error) {
          set({
            errorGuides:
              error instanceof Error
                ? error.message
                : 'Unable to load available guides.',
            isLoadingGuides: false,
            availableGuides: [],
          });
        }
      },
    }),

    {
      name: 'guide-storage',
      partialize: (state) => ({
        filters: state.filters,
        currentBookingGuideId: state.currentBookingGuideId,
      }),
    },
  ),
);