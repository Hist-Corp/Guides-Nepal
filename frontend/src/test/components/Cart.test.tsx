import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Cart from '../../components/common/Cart';
import { CartProvider, useCart, type CartItem } from '../../contexts/CartContext';
import { useBookingStore, type Booking } from '../../store/bookingStore';

// Currency is only used for price display, so the hook is mocked outright.
vi.mock('../../contexts/CurrencyContext', () => ({
  useCurrency: () => ({ formatPrice: (amount: number) => `$${amount}` }),
}));

const makeBooking = (overrides: Partial<Booking> = {}): Booking => ({
  id: 'b1',
  experienceId: 42,
  experienceTitle: 'Everest Base Camp Trek',
  city: 'Everest Region',
  date: '2026-11-05',
  guests: 3,
  price: 2697,
  image: 'ebc.jpg',
  status: 'upcoming',
  ...overrides,
});

let cartApi: ReturnType<typeof useCart>;

// Shares one CartProvider instance with the rendered <Cart /> so items added
// here are the same lines the panel shows.
const CartApiProbe: React.FC = () => {
  cartApi = useCart();
  return null;
};

const renderCart = () =>
  render(
    <MemoryRouter>
      <CartProvider>
        <CartApiProbe />
        <Cart isOpen onClose={() => undefined} />
      </CartProvider>
    </MemoryRouter>
  );

describe('Cart remove button', () => {
  beforeEach(() => {
    cartApi = undefined as unknown as ReturnType<typeof useCart>;
    useBookingStore.setState({ bookings: [] });
  });

  it('cancels and deletes the booking when the remove button is clicked', () => {
    useBookingStore.setState({ bookings: [makeBooking()] });

    renderCart();
    expect(screen.getByText('Everest Base Camp Trek')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /cancel and delete this booking/i }));

    // The booking record is gone from the store — not just hidden from the cart.
    expect(useBookingStore.getState().bookings).toHaveLength(0);
    expect(screen.queryByText('Everest Base Camp Trek')).not.toBeInTheDocument();
  });

  it('frees the reserved guide so the experience can be booked again', () => {
    useBookingStore.setState({
      bookings: [makeBooking({ guideId: 7, guideName: 'Lhakpa' })],
    });

    renderCart();
    fireEvent.click(screen.getByRole('button', { name: /cancel and delete this booking/i }));

    expect(useBookingStore.getState().bookings).toEqual([]);
  });

  it('only removes the line for regular cart items', () => {
    renderCart();

    const item: Omit<CartItem, 'id' | 'quantity'> = {
      title: 'Nepali Cooking Class',
      price: 35,
      currency: 'USD',
      category: 'Cooking',
    };
    act(() => {
      cartApi.addItem(item);
    });

    expect(screen.getByText('Nepali Cooking Class')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /remove from cart/i }));

    expect(cartApi.items).toHaveLength(0);
    // No booking was touched, so the store stays untouched.
    expect(useBookingStore.getState().bookings).toHaveLength(0);
  });
});
