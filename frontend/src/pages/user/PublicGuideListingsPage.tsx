import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { MapPin, Star, Users, Clock } from 'lucide-react';
import { guideDashboardApi, type GuideListing } from '../../services/guideDashboardApi';
import { useCurrency } from '../../contexts/CurrencyContext';

/** Public page: travelers browse all active guide/host listings. No auth required. */
const PublicGuideListingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const [listings, setListings] = useState<GuideListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await guideDashboardApi.listPublicListings();
        setListings(data.filter((l) => l.is_active));
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unable to load listings.');
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50 font-sans">
        <Header />
        <main className="container mx-auto max-w-6xl flex-grow px-4 py-10">
          <p className="mt-20 text-center text-gray-500">Loading listings...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50 font-sans">
        <Header />
        <main className="container mx-auto max-w-6xl flex-grow px-4 py-10">
          <div className="mt-20 rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-600">
            {error}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 font-sans">
      <Header />
      <main className="container mx-auto max-w-6xl flex-grow px-4 py-10">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Experiences</h1>
            <p className="mt-2 text-gray-600">Browse tours and activities offered by local guides and hosts.</p>
          </div>
        </div>

        {listings.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-12 text-center text-gray-500">
            No experiences listed yet. Check back soon!
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((l) => (
                <article
                key={l.id}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
                onClick={() => navigate(`/experience/${l.id}`)}
              >
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <p className="text-xs font-bold uppercase text-gray-500">
                      {l.category} - {l.city}{l.area ? ` - ${l.area}` : ''}
                    </p>
                    <h2 className="mt-1 text-lg font-bold text-gray-900 group-hover:text-[#213448] transition-colors">
                      {l.title}
                    </h2>
                    <p className="mt-2 flex items-center gap-1 text-sm text-gray-600">
                      <Users className="w-4 h-4" /> {l.booked_guests}/{l.max_guests} guests
                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                      <Clock className="w-3 h-3" /> {l.duration}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-gray-900 block">
                      {formatPrice(l.price, 'USD')}
                    </span>
                    <span className="text-xs text-gray-500">per guest</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                  <MapPin className="w-3 h-3" /> {l.city}
                </div>
                <div className="flex text-[#ffba0a] mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                  {l.description}
                </p>
                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500">
                    {l.available_spots} spots left
                  </span>
                  <Link
                    to={`/experience/${l.id}`}
                    className="text-sm font-bold text-primary hover:underline"
                  >
                    View details
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default PublicGuideListingsPage;
