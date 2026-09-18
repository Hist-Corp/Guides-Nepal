import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import HomePage from '../../pages/HomePage';

// Mock the contexts
vi.mock('../../contexts/CurrencyContext', () => ({
  CurrencyProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
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
