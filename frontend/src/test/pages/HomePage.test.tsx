import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import HomePage from '../../pages/HomePage';
import { useAuthStore } from '../../store/authStore';

// Mock the contexts. Header reads `currencyInfo` through `useCurrency`, so the
// hook has to be mocked alongside the provider.
vi.mock('../../contexts/CurrencyContext', () => ({
  CurrencyProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useCurrency: () => ({
    currentCurrency: 'USD',
    setCurrentCurrency: vi.fn(),
    convertPrice: (amount: number) => amount,
    currencyInfo: { code: 'USD', name: 'US Dollar', label: 'USD - $' },
    exchangeRates: { USD: 1 },
    isLoading: false,
    lastUpdateTime: null,
  }),
}));

vi.mock('../../contexts/CartContext', () => ({
  CartProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useCart: () => ({
    items: [],
    addItem: vi.fn(),
    removeItem: vi.fn(),
    updateQuantity: vi.fn(),
    clearCart: vi.fn(),
    getTotalItems: () => 0,
    getTotalPrice: () => 0,
  }),
}));

vi.mock('../../store/uiStore', () => ({
  useUIStore: () => ({
    isSearchOpen: false,
    searchQuery: '',
    isCartOpen: false,
    isBookingSheetOpen: false,
    openSearch: vi.fn(),
    closeSearch: vi.fn(),
    setSearchQuery: vi.fn(),
    openCart: vi.fn(),
    closeCart: vi.fn(),
    setBookingSheetOpen: vi.fn(),
  }),
}));

describe('HomePage', () => {
  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );
    expect(screen.getAllByText(/Guides Nepal/i).length).toBeGreaterThan(0);
  });

  it('displays featured experiences section', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );
    // The featured experiences section renders this heading by default
    // (see FeaturedExperiences.tsx) and has id="featured-experiences".
    expect(screen.getByText(/Go local in Charming Cities/i)).toBeInTheDocument();
    expect(document.getElementById('featured-experiences')).not.toBeNull();
  });

  it('hides the header cart icon when the user is not logged in', () => {
    useAuthStore.setState({ isAuthenticated: false, user: null });
    const { container } = render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );
    expect(container.querySelector('.lucide-shopping-cart')).toBeNull();
  });

  it('shows the header cart icon when the user is logged in', () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: { firstName: 'Test', lastName: 'User', email: 'test@example.com' },
    });
    const { container } = render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );
    expect(container.querySelector('.lucide-shopping-cart')).not.toBeNull();
    // Reset to logged-out so later tests / other files see default state.
    useAuthStore.setState({ isAuthenticated: false, user: null });
  });
});
