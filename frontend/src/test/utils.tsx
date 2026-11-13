import React, { ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CurrencyProvider } from '../contexts/CurrencyContext';
import { CartProvider } from '../contexts/CartContext';
import { vi } from 'vitest';

// Mock stores
vi.mock('../store/bookingStore', () => ({
  useBookingStore: {
    getState: vi.fn(() => ({
      bookings: [],
      addBooking: vi.fn(),
      cancelBooking: vi.fn(),
      deleteBooking: vi.fn(),
      archiveBooking: vi.fn(),
    })),
    setState: vi.fn(),
    subscribe: vi.fn(),
    destroy: vi.fn(),
  },
}));

vi.mock('../store/authStore', () => ({
  useAuthStore: {
    getState: vi.fn(() => ({
      user: { role: 'traveler', firstName: 'Test', lastName: 'User', email: 'test@test.com' },
      isAuthenticated: true,
      accessToken: 'mock-token',
      refreshToken: 'mock-refresh',
      rememberMe: false,
      setRememberMe: vi.fn(),
      login: vi.fn(),
      setTokens: vi.fn(),
      refreshTokens: vi.fn().mockResolvedValue(true),
      logout: vi.fn(),
    })),
    setState: vi.fn(),
    subscribe: vi.fn(),
    destroy: vi.fn(),
  },
}));

vi.mock('../store/uiStore', () => ({
  useUIStore: {
    getState: vi.fn(() => ({
      isCartOpen: false,
      openCart: vi.fn(),
      closeCart: vi.fn(),
      isBookingSheetOpen: false,
      openBookingSheet: vi.fn(),
      closeBookingSheet: vi.fn(),
      isMobileMenuOpen: false,
      toggleMobileMenu: vi.fn(),
      isSearchOpen: false,
      openSearch: vi.fn(),
      closeSearch: vi.fn(),
    })),
    setState: vi.fn(),
    subscribe: vi.fn(),
    destroy: vi.fn(),
  },
}));

vi.mock('../store/profileStore', () => ({
  useProfileStore: {
    getState: vi.fn(() => ({
      profile: null,
      avatarSrc: null,
      heroSrc: null,
      setProfile: vi.fn(),
      setAvatarSrc: vi.fn(),
      setHeroSrc: vi.fn(),
      addBookmark: vi.fn(),
      removeBookmark: vi.fn(),
      isBookmarked: vi.fn(() => false),
    })),
    setState: vi.fn(),
    subscribe: vi.fn(),
    destroy: vi.fn(),
  },
}));

vi.mock('../contexts/CurrencyContext', () => ({
  useCurrency: () => ({
    currency: 'USD',
    formatPrice: (amount: number) => `$${amount.toLocaleString()}`,
    setCurrency: vi.fn(),
  }),
  CurrencyProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock('../services/publicApi', () => ({
  flushPendingSubmissions: vi.fn(),
  submitSupportTicket: vi.fn(),
}));

// Test wrapper with all providers
// eslint-disable-next-line react-refresh/only-export-components
const AllProviders: React.FC<{ children: ReactNode }> = ({ children }) => (
  <CurrencyProvider>
    <CartProvider>
      <BrowserRouter>{children}</BrowserRouter>
    </CartProvider>
  </CurrencyProvider>
);

// Custom render function that includes all providers
export const renderWithProviders = (ui: ReactNode, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllProviders, ...options });

// Re-export everything from testing-library/react
// eslint-disable-next-line react-refresh/only-export-components
export * from '@testing-library/react';
