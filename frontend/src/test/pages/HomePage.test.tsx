import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import HomePage from '../../pages/HomePage';

// Mock the contexts
vi.mock('../../contexts/CurrencyContext', () => ({
  CurrencyProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../../contexts/CartContext', () => ({
  CartProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('HomePage', () => {
  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <HomePage onCartOpen={() => {}} />
      </BrowserRouter>
    );
    expect(screen.getByText(/Guides Nepal/i)).toBeInTheDocument();
  });

  it('displays featured experiences section', () => {
    render(
      <BrowserRouter>
        <HomePage onCartOpen={() => {}} />
      </BrowserRouter>
    );
    expect(screen.getByText(/Featured Experiences/i)).toBeInTheDocument();
  });
});