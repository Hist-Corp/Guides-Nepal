import { getApiUrl } from '../config/api';

interface HostExperience {
  id: number;
  slug: string;
  title: string;
  city: string;
  category: string;
  description: string;
  price: number;
  duration: string;
  hero_image: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  bookings_count: number;
  rating: number;
  review_count: number;
}

interface HostExperienceCreate {
  title: string;
  city: string;
  category: string;
  description: string;
  price: number;
  duration: string;
  hero_image?: string | null;
}

interface HostBooking {
  id: number;
  experience_id: number;
  experience_title: string;
  experience_city: string;
  guest_id: number;
  guest_name: string;
  guest_email: string;
  guest_phone: string | null;
  date: string;
  guests: number;
  total_price: number;
  notes: string | null;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled' | 'upcoming';
  created_at: string;
  updated_at: string;
  timeline?: TimelineEvent[];
}

interface TimelineEvent {
  id: number;
  booking_id: number;
  event_type:
    'created' | 'accepted' | 'rejected' | 'cancelled' | 'completed' | 'message' | 'reminder';
  description: string;
  created_at: string;
  actor: 'guest' | 'host' | 'system';
}

interface HostEarnings {
  total_earnings: number;
  pending_earnings: number;
  completed_bookings: number;
  upcoming_bookings: number;
  revenue_this_month: number;
}

interface Payout {
  id: string;
  date: string;
  amount: number;
  status: 'completed' | 'processing' | 'scheduled' | 'failed';
  items: number;
  method: string;
}

interface EarningsSummary {
  total_earnings: number;
  this_period: number;
  best_day: { date: string; amount: number };
  avg_per_booking: number;
  by_experience: { label: string; value: number; display: string }[];
}

interface NotificationSettings {
  email_bookings: boolean;
  email_messages: boolean;
  email_reviews: boolean;
  email_payouts: boolean;
  email_marketing: boolean;
  push_bookings: boolean;
  push_messages: boolean;
  push_reviews: boolean;
}

interface PayoutSettings {
  method: 'bank_transfer' | 'wise' | 'paypal';
  bank_account?: { name: string; account: string; routing: string; swift: string };
  wise_account?: { email: string };
  paypal_account?: { email: string };
  auto_payout: boolean;
  min_payout_amount: number;
  payout_schedule: 'weekly' | 'biweekly' | 'monthly';
}

const hostApi = {
  // Experiences
  async getExperiences(token: string): Promise<HostExperience[]> {
    const r = await fetch(getApiUrl('/host/experiences'), {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) throw new Error('Unable to load experiences.');
    return r.json();
  },

  async createExperience(token: string, payload: HostExperienceCreate): Promise<HostExperience> {
    const r = await fetch(getApiUrl('/host/experiences'), {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!r.ok) {
      const err = await r.json().catch(() => ({ detail: 'Unable to create experience.' }));
      throw new Error(err.detail || 'Unable to create experience.');
    }
    return r.json();
  },

  async updateExperience(
    token: string,
    id: number,
    payload: HostExperienceCreate
  ): Promise<HostExperience> {
    const r = await fetch(getApiUrl(`/host/experiences/${id}`), {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!r.ok) {
      const err = await r.json().catch(() => ({ detail: 'Unable to update experience.' }));
      throw new Error(err.detail || 'Unable to update experience.');
    }
    return r.json();
  },

  async deleteExperience(token: string, id: number): Promise<void> {
    const r = await fetch(getApiUrl(`/host/experiences/${id}`), {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) throw new Error('Unable to delete experience.');
  },

  async publishExperience(token: string, id: number): Promise<HostExperience> {
    const r = await fetch(getApiUrl(`/host/experiences/${id}/publish`), {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) throw new Error('Unable to publish experience.');
    return r.json();
  },

  async unpublishExperience(token: string, id: number): Promise<HostExperience> {
    const r = await fetch(getApiUrl(`/host/experiences/${id}/unpublish`), {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) throw new Error('Unable to unpublish experience.');
    return r.json();
  },

  // Bookings
  async getBookings(token: string): Promise<HostBooking[]> {
    const r = await fetch(getApiUrl('/host/bookings'), {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) throw new Error('Unable to load bookings.');
    return r.json();
  },

  async getBookingDetail(token: string, id: number): Promise<HostBooking> {
    const r = await fetch(getApiUrl(`/host/bookings/${id}`), {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) throw new Error('Unable to load booking details.');
    return r.json();
  },

  async decideBooking(
    token: string,
    id: number,
    status: 'accepted' | 'rejected' | 'completed'
  ): Promise<{ status: string }> {
    const r = await fetch(getApiUrl(`/host/bookings/${id}`), {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!r.ok) throw new Error('Unable to update booking.');
    return r.json();
  },

  async messageGuest(token: string, bookingId: number, message: string): Promise<void> {
    const r = await fetch(getApiUrl(`/host/bookings/${bookingId}/message`), {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    if (!r.ok) throw new Error('Unable to send message.');
  },

  // Earnings
  async getEarnings(token: string): Promise<HostEarnings> {
    const r = await fetch(getApiUrl('/host/bookings'), {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) throw new Error('Unable to load earnings.');
    const bookings = await r.json();
    const completed = bookings.filter((b: HostBooking) => b.status === 'completed');
    const pending = bookings.filter((b: HostBooking) => b.status === 'accepted');
    const upcoming = bookings.filter((b: HostBooking) => b.status === 'upcoming');
    const now = new Date();
    const thisMonth = bookings.filter((b: HostBooking) => {
      const d = new Date(b.date);
      return (
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear() &&
        b.status === 'completed'
      );
    });
    return {
      total_earnings: completed.reduce((sum, b) => sum + b.total_price, 0),
      pending_earnings: pending.reduce((sum, b) => sum + b.total_price, 0),
      completed_bookings: completed.length,
      upcoming_bookings: upcoming.length,
      revenue_this_month: thisMonth.reduce((sum, b) => sum + b.total_price, 0),
    };
  },

  async getEarningsSummary(token: string): Promise<EarningsSummary> {
    const r = await fetch(getApiUrl('/host/earnings'), {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) throw new Error('Unable to load earnings summary.');
    return r.json();
  },

  async getPayouts(token: string): Promise<Payout[]> {
    const r = await fetch(getApiUrl('/host/payouts'), {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) throw new Error('Unable to load payouts.');
    return r.json();
  },

  async requestPayout(token: string, amount: number): Promise<Payout> {
    const r = await fetch(getApiUrl('/host/payouts'), {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });
    if (!r.ok) throw new Error('Unable to request payout.');
    return r.json();
  },

  // Settings
  async getNotificationSettings(token: string): Promise<NotificationSettings> {
    const r = await fetch(getApiUrl('/host/settings/notifications'), {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) throw new Error('Unable to load notification settings.');
    return r.json();
  },

  async updateNotificationSettings(
    token: string,
    payload: Partial<NotificationSettings>
  ): Promise<NotificationSettings> {
    const r = await fetch(getApiUrl('/host/settings/notifications'), {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!r.ok) throw new Error('Unable to update notification settings.');
    return r.json();
  },

  async getPayoutSettings(token: string): Promise<PayoutSettings> {
    const r = await fetch(getApiUrl('/host/settings/payout'), {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) throw new Error('Unable to load payout settings.');
    return r.json();
  },

  async updatePayoutSettings(
    token: string,
    payload: Partial<PayoutSettings>
  ): Promise<PayoutSettings> {
    const r = await fetch(getApiUrl('/host/settings/payout'), {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!r.ok) throw new Error('Unable to update payout settings.');
    return r.json();
  },

  async updateProfile(
    token: string,
    payload: { firstName?: string; lastName?: string; phone?: string }
  ): Promise<void> {
    const r = await fetch(getApiUrl('/profile/me'), {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!r.ok) throw new Error('Unable to update profile.');
  },
};

export default hostApi;
export type {
  HostExperience,
  HostExperienceCreate,
  HostBooking,
  HostEarnings,
  Payout,
  EarningsSummary,
  NotificationSettings,
  PayoutSettings,
  TimelineEvent,
};
