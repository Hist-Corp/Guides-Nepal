import React, { useState } from 'react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { useBookingStore } from '../../store/bookingStore';
import { Price } from '../../components/common/Price';
import { Calendar, MapPin, XCircle, Clock, Users, CheckCircle2, Plane, ArrowRight, MapPinned, Luggage } from 'lucide-react';
import { Link } from 'react-router-dom';

const BookingsPage: React.FC = () => {
  const { bookings, cancelBooking } = useBookingStore();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'archived'>('upcoming');

  const upcomingBookings = bookings.filter(b => b.status === 'upcoming');
  const archivedBookings = bookings.filter(b => b.status !== 'upcoming');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col font-sans">
      <Header />

      <main id="main-content" className="flex-grow">
        {/* Hero banner */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-white py-10">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur ring-2 ring-white/30 shadow-lg transition-transform duration-300 hover:scale-105">
                <MapPinned className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">My Travel List</h1>
                <p className="text-white/80 text-sm mt-1">All your booked experiences, dates, and guides in one place.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                activeTab === 'upcoming'
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Upcoming ({upcomingBookings.length})
            </button>
            <button
              onClick={() => setActiveTab('archived')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                activeTab === 'archived'
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Clock className="w-4 h-4" />
              Archived ({archivedBookings.length})
            </button>
          </div>

          {/* Content */}
          {activeTab === 'upcoming' ? (
            upcomingBookings.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {upcomingBookings.map((booking) => (
                  <div key={booking.id} className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                    {/* Top image with overlay */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={booking.image}
                        alt={booking.experienceTitle}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => (e.currentTarget.src = '/images/placeholder.svg')}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-4 right-4">
                        <h3 className="font-bold text-white text-lg line-clamp-2 drop-shadow-md">{booking.experienceTitle}</h3>
                      </div>
                      <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Upcoming
                      </div>
                    </div>
                    {/* Details */}
                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4 text-primary shrink-0" />
                          <span className="font-medium">{booking.city}</span>
                        </div>
                        <span className="font-bold text-primary text-lg"><Price amount={booking.price} /></span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 shrink-0" />
                          <span>{new Date(booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-4 h-4 shrink-0" />
                          <span>{booking.guests}</span>
                        </div>
                      </div>
                      {booking.guideName && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 bg-slate-50 rounded-lg px-3 py-2">
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                            {booking.guideName.charAt(0)}
                          </div>
                          <span>Guide: <span className="font-medium text-gray-900">{booking.guideName}</span></span>
                        </div>
                      )}
                      <button
                        onClick={() => cancelBooking(booking.id)}
                        className="w-full mt-2 text-sm text-red-500 hover:text-red-700 font-medium flex items-center justify-center gap-1.5 py-2 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <XCircle className="w-4 h-4" /> Cancel booking
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-primary/5 ring-2 ring-primary/20">
                  <Luggage className="h-10 w-10 text-primary/60" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">No upcoming bookings</h2>
                <p className="text-gray-500 text-sm mb-6 max-w-md">
                  You haven't booked any experiences yet. Start exploring Nepal and create your first adventure!
                </p>
                <Link to="/explore" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-primary/90 transition-colors">
                  Explore things to do
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )
          ) : (
            archivedBookings.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {archivedBookings.map((booking) => (
                  <div key={booking.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden opacity-60 hover:opacity-80 transition-opacity">
                    <div className="relative h-36 overflow-hidden">
                      <img
                        src={booking.image}
                        alt={booking.experienceTitle}
                        className="w-full h-full object-cover grayscale"
                        onError={(e) => (e.currentTarget.src = '/images/placeholder.svg')}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-3 left-4">
                        <h3 className="font-bold text-white text-sm line-clamp-1 drop-shadow">{booking.experienceTitle}</h3>
                      </div>
                      <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold shadow-sm ${booking.status === 'cancelled' ? 'bg-red-500 text-white' : 'bg-gray-700 text-white'}`}>
                        {booking.status === 'cancelled' ? 'Cancelled' : 'Completed'}
                      </div>
                    </div>
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span>{booking.city}</span>
                        <span className="text-gray-300">·</span>
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span>{new Date(booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                      <span className="font-bold text-gray-400 text-sm"><Price amount={booking.price} /></span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-100">
                  <Clock className="h-10 w-10 text-slate-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">No archived bookings</h2>
                <p className="text-gray-500 text-sm">Your past adventures will appear here.</p>
              </div>
            )
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookingsPage;
