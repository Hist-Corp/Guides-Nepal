import type { CartItem } from '../contexts/CartContext';
import type { Booking } from '../store/bookingStore';
import { formatDate } from './date';

/**
 * Formats a yyyy-mm-dd booking date as DD/MM/YYYY, the format the booking
 * calendar and confirmations already display. Falls back to the raw value so
 * malformed dates never render as "Invalid Date".
 */
export const formatBookingDate = (date: string): string =>
  formatDate(date, 'en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) ||
  date;

/**
 * Maps a confirmed booking onto its shopping-cart line so every booking made
 * on the site shows up in the cart with its date and guest count. The cart id
 * is derived from the booking id, so the same booking never produces a
 * duplicate line.
 */
export const buildBookingCartItem = (booking: Booking): CartItem => {
  const guests = booking.guests || 1;
  return {
    id: `booking-${booking.id}`,
    title: booking.experienceTitle,
    price: booking.price,
    currency: 'USD',
    quantity: 1,
    category: 'Booking',
    image: booking.image,
    description: `${formatBookingDate(booking.date)} · ${guests} guest${
      guests === 1 ? '' : 's'
    }`,
  };
};
