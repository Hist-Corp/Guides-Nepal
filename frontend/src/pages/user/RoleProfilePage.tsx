import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { useAuthStore } from '../../store/authStore';
import { useProfileStore } from '../../store/profileStore';
import { LayoutDashboard, Calendar, Book, Star, Users, CreditCard } from 'lucide-react';

const RoleProfilePage: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  const { profile } = useProfileStore();

  if (!isAuthenticated) return <Navigate to="/" replace />;

  const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || 'User';
  const email = user?.email || profile.email || '';
  const avatar = profile.avatarUrl || user?.avatarUrl;

  const guideCards = [
    {
      icon: LayoutDashboard,
      title: 'Dashboard',
      description: 'Manage your availability, bookings and earnings.',
      to: '/guide/dashboard',
    },
    {
      icon: Book,
      title: 'My Listings',
      description: 'Create and manage your guide listings.',
      to: '/guide/listings',
    },
    {
      icon: Users,
      title: 'My Bookings',
      description: 'View upcoming and past traveller bookings.',
      to: '/guide/bookings',
    },
  ];

  const hostCards = [
    {
      icon: LayoutDashboard,
      title: 'Host Dashboard',
      description: 'Manage your experiences, bookings and earnings.',
      to: '/host/dashboard',
    },
    {
      icon: Book,
      title: 'My Experiences',
      description: 'Create and manage the experiences you offer.',
      to: '/host/experiences',
    },
    {
      icon: Calendar,
      title: 'My Bookings',
      description: 'View upcoming and past guest bookings.',
      to: '/host/bookings',
    },
    {
      icon: CreditCard,
      title: 'Earnings',
      description: 'Track your payouts and earnings summary.',
      to: '/host/earnings',
    },
  ];

  const cards = user?.role === 'host' ? hostCards : guideCards;
  const roleLabel = user?.role === 'host' ? 'Host' : 'Guide';
  const dashboardTo = user?.role === 'host' ? '/host/dashboard' : '/guide/dashboard';

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 font-sans">
      <Header />
      <main id="main-content" className="container mx-auto max-w-6xl flex-grow px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Profile card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <Link
                  to={dashboardTo}
                  className="px-3 py-2 rounded-full bg-gray-100 text-gray-800 text-sm font-bold hover:bg-gray-200 transition-colors flex items-center gap-1"
                >
                  Back to Dashboard
                </Link>
                <Link
                  to="/account"
                  className="px-3 py-2 rounded-full bg-gray-100 text-gray-800 text-sm font-bold hover:bg-gray-200 transition-colors"
                >
                  Account Settings
                </Link>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden border border-gray-300 flex items-center justify-center">
                  {avatar ? (
                    <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-bold text-sm text-gray-700">
                      {name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{name}</h2>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#213448]/10 text-[#213448] text-xs font-semibold">
                    {roleLabel} profile
                  </span>
                  <p className="text-gray-500 text-sm mt-1">{email}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Email</label>
                  <p className="text-gray-700">{email || 'Not set'}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Phone</label>
                  <p className="text-gray-700">{profile.phone || 'Not set'}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Bio</label>
                  <p className="text-gray-700 whitespace-pre-wrap">{profile.bio || 'No bio added yet.'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Middle/Right: Role cards (Guide & Host only) */}
          {user?.role === 'guide' || user?.role === 'host' ? (
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">{roleLabel} Tools</h3>
                  <Link
                    to={dashboardTo}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Open {roleLabel} Dashboard
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {cards.map((card, i) => (
                    <Link
                      key={i}
                      to={card.to}
                      className="flex flex-col items-start gap-2 p-5 rounded-xl border border-gray-100 bg-white hover:border-primary hover:bg-primary/5 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                        <card.icon className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-gray-900">{card.title}</h4>
                      <p className="text-sm text-gray-500">{card.description}</p>
                    </Link>
                  ))}
                </div>
              </div>

              {user?.role === 'guide' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">About your guide profile</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Complete your onboarding to start receiving traveller inquiries and bookings.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Travel Preferences</h3>
                <p className="text-gray-600 text-sm">
                  Save experiences to your bookmarks and they'll appear here.
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  No saved experiences yet. Browse and bookmark trips to come back to them later.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RoleProfilePage;
