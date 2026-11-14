import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Cart from '../../components/common/Cart';
import { CartProvider, useCart, type CartItem } from '../../contexts/CartContext';
import type { Booking } from '../../store/bookingStore';
import * as bookingStore from '../../store/bookingStore';

// Mock stores before importing components that use them
vi.mock('../../store/bookingStore', () => ({
  useBookingStore: {
    getState: vi.fn(),
    setState: vi.fn(),
    subscribe: vi.fn(),
    destroy: vi.fn(),
  },
}));

vi.mock('../../store/authStore', () => ({
  useAuthStore: {
    getState: vi.fn(() => ({ user: { role: 'traveler' }, isAuthenticated: true })),
    setState: vi.fn(),
    subscribe: vi.fn(),
    destroy: vi.fn(),
  },
}));

// Currency is only used for price display, so the hook is mocked outright.
vi.mock('../../contexts/CurrencyContext', () => ({
  useCurrency: () => ({ formatPrice: (amount: number) => `$${amount}` }),
}));

vi.mock('../../utils/bookingCart', () => ({
  buildBookingCartItem: vi.fn((booking: Booking) => ({
    id: `booking-${booking.id}`,
    title: booking.experienceTitle,
    price: booking.price,
    currency: 'USD',
    quantity: 1,
    category: 'Booking',
    image: booking.image,
    description: `${booking.date.split('-').reverse().join('/')} · ${booking.guests} guests`,
  })),
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

// Shares one CartProvider instance with the rendered <Cart /> so items added
// here are the same lines the panel shows.
interface CartApiProbeProps {
  cartApiRef: React.MutableRefObject<ReturnType<typeof useCart> | null>;
}

const CartApiProbe: React.FC<CartApiProbeProps> = ({ cartApiRef }) => {
  const api = useCart();
  React.useLayoutEffect(() => {
    cartApiRef.current = api;
  }, [api, cartApiRef]);
  return null;
};

const renderCart = (cartApiRef: React.MutableRefObject<ReturnType<typeof useCart> | null>) =>
  render(
    <MemoryRouter>
      <CartProvider>
        <CartApiProbe cartApiRef={cartApiRef} />
        <Cart isOpen onClose={() => undefined} />
      </CartProvider>
    </MemoryRouter>
  );

describe('Cart remove button', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock booking store state
    const mockBookingStore = {
      bookings: [],
      addBooking: vi.fn(),
      cancelBooking: vi.fn(),
      deleteBooking: vi.fn(),
      archiveBooking: vi.fn(),
    };
    vi.mocked(bookingStore.useBookingStore.getState).mockReturnValue(mockBookingStore);
  });

  it('cancels and deletes the booking when the remove button is clicked', () => {
    const cartApiRef = { current: null as ReturnType<typeof useCart> | null };
    const booking = makeBooking();

    const mockBookingStore = {
      bookings: [booking],
      addBooking: vi.fn(),
      cancelBooking: vi.fn(),
      deleteBooking: vi.fn(),
      archiveBooking: vi.fn(),
    };
    vi.mocked(bookingStore.useBookingStore.getState).mockReturnValue(mockBookingStore);

    renderCart(cartApiRef);
    expect(screen.getByText('Everest Base Camp Trek')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /cancel and delete this booking/i }));

    // The booking record is gone from the store — not just hidden from the cart.
    expect(mockBookingStore.bookings).toHaveLength(0);
    expect(screen.queryByText('Everest Base Camp Trek')).not.toBeInTheDocument();
  });

  it('frees the reserved guide so the experience can be booked again', () => {
    const cartApiRef = { current: null as ReturnType<typeof useCart> | null };
    const booking = makeBooking({ guideId: 7, guideName: 'Lhakpa' });

    const mockBookingStore = {
      bookings: [booking],
      addBooking: vi.fn(),
      cancelBooking: vi.fn(),
      deleteBooking: vi.fn(),
      archiveBooking: vi.fn(),
    };
    vi.mocked(bookingStore.useBookingStore.getState).mockReturnValue(mockBookingStore);

    renderCart(cartApiRef);
    fireEvent.click(screen.getByRole('button', { name: /cancel and delete this booking/i }));

    expect(mockBookingStore.bookings).toEqual([]);
  });

  it('only removes the line for regular cart items', () => {
    const cartApiRef = { current: null as ReturnType<typeof useCart> | null };

    const mockBookingStore = {
      bookings: [],
      addBooking: vi.fn(),
      cancelBooking: vi.fn(),
      deleteBooking: vi.fn(),
      archiveBooking: vi.fn(),
    };
    vi.mocked(bookingStore.useBookingStore.getState).mockReturnValue(mockBookingStore);

    renderCart(cartApiRef);

    const item: Omit<CartItem, 'id' | 'quantity'> = {
      title: 'Nepali Cooking Class',
      price: 35,
      currency: 'USD',
      category: 'Cooking',
    };
    act(() => {
      cartApiRef.current?.addItem(item);
    });

    expect(screen.getByText('Nepali Cooking Class')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /remove from cart/i }));

    expect(cartApiRef.current?.items).toHaveLength(0);
    // No booking was touched, so the store stays untouched.
    expect(mockBookingStore.bookings).toHaveLength(0);
  });
});
