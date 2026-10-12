import React from 'react';
import { describe, expect, it, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { CartProvider, useCart } from '../../contexts/CartContext';
import { useBookingStore, type Booking } from '../../store/bookingStore';

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
    useBookingStore.setState({ bookings: [] });
  });

  it('shows bookings already made in the cart', () => {
    useBookingStore.setState({ bookings: [makeBooking()] });

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
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.items).toHaveLength(0);

    act(() => {
      useBookingStore.setState({ bookings: [makeBooking({ id: 'b2' })] });
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].id).toBe('booking-b2');
    expect(result.current.getTotalItems()).toBe(1);
  });

  it('never lists the same booking twice', () => {
    useBookingStore.setState({ bookings: [makeBooking()] });

    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      useBookingStore.setState({
        bookings: [makeBooking(), makeBooking({ id: 'b2', experienceTitle: 'Everest Base Camp Trek' })],
      });
    });

    expect(result.current.items.map((item) => item.id)).toEqual(['booking-b1', 'booking-b2']);
  });

  it('drops the cart line when the booking is cancelled', () => {
    const booking = makeBooking();
    useBookingStore.setState({ bookings: [booking] });

    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.items).toHaveLength(1);

    act(() => {
      useBookingStore.setState({ bookings: [{ ...booking, status: 'cancelled' }] });
    });

    expect(result.current.items).toHaveLength(0);
  });

  it('ignores archived and cancelled bookings on first load', () => {
    useBookingStore.setState({
      bookings: [
        makeBooking({ id: 'b1' }),
        makeBooking({ id: 'b2', status: 'cancelled' }),
        makeBooking({ id: 'b3', status: 'archived' }),
      ],
    });

    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.items.map((item) => item.id)).toEqual(['booking-b1']);
  });
});
