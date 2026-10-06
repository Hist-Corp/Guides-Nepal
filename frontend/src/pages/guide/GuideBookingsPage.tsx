import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Calendar, MapPin, Users } from 'lucide-react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { getApiUrl } from '../../config/api';
import { useAuthStore } from '../../store/authStore';

interface GuideBooking {
  id: number;
  experience_title: string;
  city: string;
  date: string;
  guests: number;
  price: number;
  image?: string;
  status: string;
  traveler_name: string;
  traveler_email: string;
}

const GuideBookingsPage: React.FC = () => {
  const { accessToken, isAuthenticated, user } = useAuthStore();
  const [bookings, setBookings] = useState<GuideBooking[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken || user?.role !== 'guide') return;
    fetch(getApiUrl('/guide/bookings'), { headers: { Authorization: `Bearer ${accessToken}` } })
      .then(async (response) => {
        if (!response.ok) throw new Error((await response.json()).detail || 'Unable to load bookings.');
        return response.json();
      })
      .then(setBookings)
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [accessToken, user?.role]);

  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (user?.role !== 'guide') return <Navigate to="/bookings" replace />;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />
      <main className="flex-grow container mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900">Booking requests</h1>
        <p className="mt-2 text-gray-600">Requests assigned to your guide account.</p>
        {loading ? <p className="mt-8 text-gray-500">Loading bookings…</p> : error ? <p className="mt-8 text-red-600">{error}</p> : bookings.length === 0 ? (
          <div className="mt-8 rounded-xl border border-gray-100 bg-white p-10 text-center text-gray-500">No booking requests yet.</div>
        ) : (
          <div className="mt-8 space-y-4">
            {bookings.map((booking) => (
              <article key={booking.id} className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm sm:flex-row">
                {booking.image && <img src={booking.image} alt="" className="h-24 w-full rounded-lg object-cover sm:w-32" />}
                <div className="flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2"><h2 className="text-lg font-bold text-gray-900">{booking.experience_title}</h2><span className="rounded-full bg-brand-yellow/20 px-3 py-1 text-xs font-bold capitalize text-gray-700">{booking.status}</span></div>
                  <p className="mt-1 text-sm text-gray-600">{booking.traveler_name} · {booking.traveler_email}</p>
                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500"><span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{booking.city}</span><span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{new Date(booking.date).toLocaleDateString()}</span><span className="flex items-center gap-1"><Users className="h-4 w-4" />{booking.guests} guests</span><strong className="text-primary">${booking.price}</strong></div>
                </div>
              </article>
            ))}
          </div>
        )}
        <Link to="/" className="mt-8 inline-block text-sm font-bold text-primary hover:underline">Back to home</Link>
      </main>
      <Footer />
    </div>
  );
};

export default GuideBookingsPage;
