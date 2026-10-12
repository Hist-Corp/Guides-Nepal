import { describe, expect, it } from 'vitest';
import { buildBookingCartItem, formatBookingDate } from '../../utils/bookingCart';
import type { Booking } from '../../store/bookingStore';

const booking: Booking = {
  id: 'b1',
  experienceId: 1,
  experienceTitle: 'Annapurna Base Camp Trek',
  city: 'Pokhara',
  date: '2026-11-05',
  guests: 3,
  price: 2358,
  image: 'abc.jpg',
  status: 'upcoming',
};

describe('formatBookingDate', () => {
  it('formats a yyyy-mm-dd date as DD/MM/YYYY', () => {
    expect(formatBookingDate('2026-11-05')).toBe('05/11/2026');
    expect(formatBookingDate('2026-01-12')).toBe('12/01/2026');
  });

  it('passes malformed dates through unchanged', () => {
    expect(formatBookingDate('')).toBe('');
    expect(formatBookingDate('not-a-date')).toBe('not-a-date');
  });
});

describe('buildBookingCartItem', () => {
  it('maps a booking onto a cart line with date and guest count', () => {
    expect(buildBookingCartItem(booking)).toEqual({
      id: 'booking-b1',
      title: 'Annapurna Base Camp Trek',
      price: 2358,
      currency: 'USD',
      quantity: 1,
      category: 'Booking',
      image: 'abc.jpg',
      description: '05/11/2026 · 3 guests',
    });
  });

  it('uses the singular for one guest', () => {
    const item = buildBookingCartItem({ ...booking, guests: 1 });
    expect(item.description).toBe('05/11/2026 · 1 guest');
  });

  it('defaults a missing guest count to one', () => {
    const item = buildBookingCartItem({ ...booking, guests: 0 });
    expect(item.description).toBe('05/11/2026 · 1 guest');
  });
});
