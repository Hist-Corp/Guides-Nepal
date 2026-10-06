import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import HomePage from '../../pages/HomePage';

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

describe('HomePage', () => {
  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <HomePage onCartOpen={() => {}} />
      </BrowserRouter>
    );
    expect(screen.getAllByText(/Guides Nepal/i).length).toBeGreaterThan(0);
  });

  it('displays featured experiences section', () => {
    render(
      <BrowserRouter>
        <HomePage onCartOpen={() => {}} />
      </BrowserRouter>
    );
    // The featured experiences section renders this heading by default
    // (see FeaturedExperiences.tsx) and has id="featured-experiences".
    expect(screen.getByText(/Go local in Charming Cities/i)).toBeInTheDocument();
    expect(document.getElementById('featured-experiences')).not.toBeNull();
  });
});
