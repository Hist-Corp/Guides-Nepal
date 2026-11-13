import React from 'react';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { CartProvider, useCart } from '../../contexts/CartContext';
import type { Booking } from '../../store/bookingStore';
import * as bookingStore from '../../store/bookingStore';

// Mock stores before importing
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
  experienceId: 1,
  experienceTitle: 'Annapurna Base Camp Trek',
  city: 'Pokhara',
  date: '2026-11-05',
  guests: 3,
  price: 2358,
  image: 'abc.jpg',
  status: 'upcoming',
  ...overrides,
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

describe('CartContext booking sync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows bookings already made in the cart', () => {
    const booking = makeBooking();
    const mockBookingStore = {
      bookings: [booking],
      addBooking: vi.fn(),
      cancelBooking: vi.fn(),
      deleteBooking: vi.fn(),
      archiveBooking: vi.fn(),
    };
    vi.mocked(bookingStore.useBookingStore.getState).mockReturnValue(mockBookingStore);

    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.getTotalItems()).toBe(1);
    expect(result.current.items[0]).toMatchObject({
      id: 'booking-b1',
      title: 'Annapurna Base Camp Trek',
      price: 2358,
      currency: 'USD',
      quantity: 1,
      category: 'Booking',
      description: '05/11/2026 · 3 guests',
    });
  });

  it('adds a newly made booking to the cart', () => {
    const mockBookingStore = {
      bookings: [],
      addBooking: vi.fn(),
      cancelBooking: vi.fn(),
      deleteBooking: vi.fn(),
      archiveBooking: vi.fn(),
    };
    vi.mocked(bookingStore.useBookingStore.getState).mockReturnValue(mockBookingStore);

    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.items).toHaveLength(0);

    act(() => {
      mockBookingStore.bookings = [makeBooking({ id: 'b2' })];
      // Trigger the effect by calling getState again
      vi.mocked(bookingStore.useBookingStore.getState).mockReturnValue(mockBookingStore);
    });

    // The cart should now have the new booking
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].id).toBe('booking-b2');
    expect(result.current.getTotalItems()).toBe(1);
  });

  it('never lists the same booking twice', () => {
    const mockBookingStore = {
      bookings: [makeBooking()],
      addBooking: vi.fn(),
      cancelBooking: vi.fn(),
      deleteBooking: vi.fn(),
      archiveBooking: vi.fn(),
    };
    vi.mocked(bookingStore.useBookingStore.getState).mockReturnValue(mockBookingStore);

    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      mockBookingStore.bookings = [
        makeBooking(),
        makeBooking({ id: 'b2', experienceTitle: 'Everest Base Camp Trek' }),
      ];
      vi.mocked(bookingStore.useBookingStore.getState).mockReturnValue(mockBookingStore);
    });

    expect(result.current.items.map((item) => item.id)).toEqual(['booking-b1', 'booking-b2']);
  });

  it('drops the cart line when the booking is cancelled', () => {
    const booking = makeBooking();
    const mockBookingStore = {
      bookings: [booking],
      addBooking: vi.fn(),
      cancelBooking: vi.fn(),
      deleteBooking: vi.fn(),
      archiveBooking: vi.fn(),
    };
    vi.mocked(bookingStore.useBookingStore.getState).mockReturnValue(mockBookingStore);

    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.items).toHaveLength(1);

    act(() => {
      mockBookingStore.bookings = [{ ...booking, status: 'cancelled' }];
      vi.mocked(bookingStore.useBookingStore.getState).mockReturnValue(mockBookingStore);
    });

    expect(result.current.items).toHaveLength(0);
  });

  it('ignores archived and cancelled bookings on first load', () => {
    const mockBookingStore = {
      bookings: [
        makeBooking({ id: 'b1' }),
        makeBooking({ id: 'b2', status: 'cancelled' }),
        makeBooking({ id: 'b3', status: 'archived' }),
      ],
      addBooking: vi.fn(),
      cancelBooking: vi.fn(),
      deleteBooking: vi.fn(),
      archiveBooking: vi.fn(),
    };
    vi.mocked(bookingStore.useBookingStore.getState).mockReturnValue(mockBookingStore);

    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.items.map((item) => item.id)).toEqual(['booking-b1']);
  });
});
