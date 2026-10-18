import React, { useState } from 'react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { useBookingStore } from '../../store/bookingStore';
import { Price } from '../../components/common/Price';
import { Calendar, MapPin, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const BookingsPage: React.FC = () => {
  const { bookings, cancelBooking } = useBookingStore();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'archived'>('upcoming');

  const upcomingBookings = bookings.filter(b => b.status === 'upcoming');
  const archivedBookings = bookings.filter(b => b.status !== 'upcoming');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Bookings Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              
              {/* Tabs */}
              <div className="flex border-b border-gray-100">
                <button 
                  onClick={() => setActiveTab('upcoming')}
                  className={`flex-1 py-4 text-sm font-bold text-center transition-colors ${
                    activeTab === 'upcoming' 
                      ? 'text-gray-900 border-b-2 border-transparent' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Upcoming bookings
                </button>
                <button 
                  onClick={() => setActiveTab('archived')}
                  className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${
                    activeTab === 'archived' 
                      ? 'text-gray-900 border-b-2 border-transparent' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <span className={`${activeTab === 'archived' ? '' : 'bg-secondary/10 text-secondary px-2 py-0.5 rounded-full text-xs'}`}>
                    Archived bookings
                  </span>
                </button>
              </div>

              {/* Content Area */}
              <div className="min-h-[400px]">
                {activeTab === 'upcoming' ? (
                  upcomingBookings.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {upcomingBookings.map((booking) => (
                        <div key={booking.id} className="p-6 hover:bg-gray-50 transition-colors">
                          <div className="flex gap-4">
                            <img 
                              src={booking.image} 
                              alt={booking.experienceTitle} 
                              className="w-20 h-20 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">{booking.experienceTitle}</h3>
                              <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                                <MapPin className="w-3 h-3" />
                                {booking.city}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                                <Calendar className="w-3 h-3" />
                                {new Date(booking.date).toLocaleDateString()}
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-primary"><Price amount={booking.price} /></span>
                                <button 
                                  onClick={() => cancelBooking(booking.id)}
                                  className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
                                >
                                  <XCircle className="w-3 h-3" /> Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 flex flex-col items-center justify-center text-center h-[400px]">
                      {/* Illustration */}
                      <div className="mb-6 relative">
                        <div className="w-48 h-32 mx-auto flex items-center justify-center text-[#213448]">
                          <svg viewBox="0 0 200 150" className="w-full h-full stroke-current fill-none stroke-[1.5]">
                            <circle cx="100" cy="75" r="40" />
                            <path d="M100 35c-10 15-15 30-15 40s5 25 15 40" />
                            <path d="M100 35c10 15 15 30 15 40s-5 25-15 40" />
                            <path d="M65 65h70" />
                            <path d="M65 85h70" />
                            <path d="M40 70h-20a5 5 0 0 0 -5 5v20a5 5 0 0 0 5 5h20" />
                            <path d="M40 100l5 5l-5-5" />
                            <rect x="150" y="50" width="30" height="50" rx="4" />
                            <circle cx="165" cy="90" r="2" />
                            <path d="M90 25l2 2l2 -2" />
                            <path d="M110 25l2 2l2 -2" />
                          </svg>
                        </div>
                      </div>
                      <h2 className="text-xl font-bold text-gray-900 mb-2">No upcoming bookings</h2>
                      <Link to="/explore" className="text-[#213448] font-bold text-sm hover:underline">
                        Explore things to do.
                      </Link>
                    </div>
                  )
                ) : (
                  archivedBookings.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {archivedBookings.map((booking) => (
                        <div key={booking.id} className="p-6 opacity-75">
                          <div className="flex gap-4">
                            <img 
                              src={booking.image} 
                              alt={booking.experienceTitle} 
                              className="w-20 h-20 rounded-lg object-cover grayscale"
                            />
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">{booking.experienceTitle}</h3>
                              <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                <span className={`px-2 py-0.5 rounded-full ${booking.status === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                                  {booking.status === 'cancelled' ? 'Cancelled' : 'Completed'}
                                </span>
                                <span>{new Date(booking.date).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 flex flex-col items-center justify-center text-center h-[400px]">
                       <h2 className="text-xl font-bold text-gray-900 mb-2">No archived bookings</h2>
                       <p className="text-gray-500 text-sm">Your past adventures will appear here.</p>
                    </div>
                  )
                )}
              </div>

            </div>
          </div>

          {/* Right Column: Empty White Area */}
          <div className="lg:col-span-2 hidden lg:block">
            {/* Intentionally left empty to match design */}
          </div>

        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BookingsPage;
