import React from 'react';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { Link } from 'react-router-dom';
import { MapPin, Star, Users } from 'lucide-react';
import { useImagePlacement } from '../hooks/useCms';

const destinations = [
  {
    id: 'kathmandu',
    name: 'Kathmandu',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
    description: 'The capital city filled with ancient temples, vibrant markets, and rich Newari culture.',
    guides: 45,
    experiences: 120,
    rating: 4.9
  },
  {
    id: 'pokhara',
    name: 'Pokhara',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80',
    description: 'The adventure capital with stunning lake views and the Annapurna mountain range.',
    guides: 35,
    experiences: 85,
    rating: 4.8
  },
  {
    id: 'lalitpur',
    name: 'Lalitpur',
    image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80',
    description: 'The city of fine arts, known for its ancient craftsmen and stunning Durbar Square.',
    guides: 25,
    experiences: 60,
    rating: 4.7
  },
  {
    id: 'bhaktapur',
    name: 'Bhaktapur',
    image: 'https://images.unsplash.com/photo-1605640840605-14ac1855827b?auto=format&fit=crop&w=800&q=80',
    description: 'A living medieval city with preserved architecture and traditional pottery.',
    guides: 20,
    experiences: 45,
    rating: 4.9
  },
  {
    id: 'bharatpur',
    name: 'Bharatpur',
    image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
    description: 'Gateway to Chitwan National Park and its incredible wildlife experiences.',
    guides: 15,
    experiences: 35,
    rating: 4.6
  }
];

const DestinationCard: React.FC<{ dest: (typeof destinations)[number] }> = ({ dest }) => {
  // Dashboard-placed image wins over the hardcoded default.
  const placedImage = useImagePlacement(`destinations-${dest.id}`);
  return (
    <Link
      to={`/city/${dest.id}`}
      className="group bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-all"
    >
      <div className="h-56 overflow-hidden">
        <img
          src={placedImage || dest.image}
          alt={dest.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold text-xl text-slate-900 group-hover:text-primary transition-colors">{dest.name}</h2>
          <div className="flex items-center gap-1 text-sm">
            <Star className="w-4 h-4 text-brand-yellow fill-brand-yellow" />
            <span className="font-bold">{dest.rating}</span>
          </div>
        </div>
        <p className="text-slate-600 mb-4">{dest.description}</p>
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {dest.guides} guides
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {dest.experiences} experiences
          </span>
        </div>
      </div>
    </Link>
  );
};

const DestinationsPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <section className="bg-primary py-20 text-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Destinations</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Explore Nepal's most beautiful cities with local guides who know them best.
            </p>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {destinations.map((dest) => (
                <DestinationCard key={dest.id} dest={dest} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default DestinationsPage;