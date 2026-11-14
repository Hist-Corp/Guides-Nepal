import { create } from 'zustand';

interface UIStore {
  isSearchOpen: boolean;
  searchQuery: string;
  isCartOpen: boolean;
  /** True while the mobile "Configure booking" sheet is open (hides the support widget). */
  isBookingSheetOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  setSearchQuery: (query: string) => void;
  openCart: () => void;
  closeCart: () => void;
  setBookingSheetOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isSearchOpen: false,
  searchQuery: '',
  isCartOpen: false,
  isBookingSheetOpen: false,
  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),
  setBookingSheetOpen: (open) => set({ isBookingSheetOpen: open }),
}));
