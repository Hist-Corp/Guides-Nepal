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
  guest_name: string;
  guest_email: string;
  guest_phone: string | null;
  date: string;
  guests: number;
  total_price: number;
  notes: string | null;
  status: 'upcoming' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
}

interface HostEarnings {
  total_earnings: number;
  pending_earnings: number;
  completed_bookings: number;
  upcoming_bookings: number;
  revenue_this_month: number;
}

const hostApi = {
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

  async updateExperience(token: string, id: number, payload: HostExperienceCreate): Promise<HostExperience> {
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

  async getBookings(token: string): Promise<HostBooking[]> {
    const r = await fetch(getApiUrl('/host/bookings'), {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) throw new Error('Unable to load bookings.');
    return r.json();
  },

  async decideBooking(token: string, id: number, status: 'accepted' | 'rejected' | 'completed'): Promise<{ status: string }> {
    const r = await fetch(getApiUrl(`/host/bookings/${id}`), {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!r.ok) throw new Error('Unable to update booking.');
    return r.json();
  },

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
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && b.status === 'completed';
    });
    return {
      total_earnings: completed.reduce((sum, b) => sum + b.total_price, 0),
      pending_earnings: pending.reduce((sum, b) => sum + b.total_price, 0),
      completed_bookings: completed.length,
      upcoming_bookings: upcoming.length,
      revenue_this_month: thisMonth.reduce((sum, b) => sum + b.total_price, 0),
    };
  },
};

export default hostApi;
export type { HostExperience, HostExperienceCreate, HostBooking, HostEarnings };
