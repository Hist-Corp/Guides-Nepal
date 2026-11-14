import type { CartItem } from '../contexts/CartContext';
import type { Booking } from '../store/bookingStore';

/**
 * Formats a yyyy-mm-dd booking date as DD/MM/YYYY, the format the booking
 * calendar and confirmations already display. Falls back to the raw value so
 * malformed dates never render as "Invalid Date".
 */
export const formatBookingDate = (date: string): string => {
  const [y, m, d] = date.split('-').map(Number);
  if (!y || !m || !d) return date;
  return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
};

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
