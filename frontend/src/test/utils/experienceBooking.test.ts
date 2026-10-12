import { describe, expect, it } from 'vitest';
import { isPredefinedTrip } from '../../utils/experienceBooking';

describe('isPredefinedTrip', () => {
  it('treats day-based durations as pre-defined tours/trips', () => {
    expect(isPredefinedTrip({ duration: '9 days' })).toBe(true);
    expect(isPredefinedTrip({ duration: '12 days' })).toBe(true);
    expect(isPredefinedTrip({ duration: '1 day' })).toBe(true);
    expect(isPredefinedTrip({ duration: '9 Days' })).toBe(true);
    expect(isPredefinedTrip({ duration: '9 days, 8 nights' })).toBe(true);
  });

  it('keeps hourly experiences on the check-in/check-out range system', () => {
    expect(isPredefinedTrip({ duration: '3 hours' })).toBe(false);
    expect(isPredefinedTrip({ duration: '7 hours' })).toBe(false);
    expect(isPredefinedTrip({ duration: 'half day' })).toBe(false);
  });

  it('handles missing data without throwing', () => {
    expect(isPredefinedTrip(undefined)).toBe(false);
    expect(isPredefinedTrip(null)).toBe(false);
    expect(isPredefinedTrip({})).toBe(false);
    expect(isPredefinedTrip({ duration: '' })).toBe(false);
  });
});
