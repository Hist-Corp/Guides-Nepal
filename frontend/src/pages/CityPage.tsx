import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Star, Users, Heart, ShieldCheck, Clock, ArrowLeft } from 'lucide-react';

interface Tour {
  id: number;
  title: string;
  rating: number;
  reviews: number;
  price: number;
  image: string;
}

interface Guide {
  id: number;
  name: string;
  image: string;
  rating: number;
  reviews: number;
}

interface CityData {
  name: string;
  heroImage: string;
  description: string;
  topThings: Tour[];
  guides: Guide[];
}

// Mock data for cities (in a real app this would come from an API)
const cityData: Record<string, CityData> = {
  bangkok: {
    name: 'Bangkok',
    heroImage: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=1740&q=80',
    description: 'Immerse yourself in the vibrant energy of Bangkok. From ancient temples to bustling street markets, experience the City of Angels.',
    topThings: [
      { id: 1001, title: 'A Taste Of Bangkok: Street Food Tour', rating: 4.9, reviews: 312, price: 45, image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1740&q=80' },
      { id: 1002, title: 'Grand Palace & Wat Phra Kaew', rating: 4.8, reviews: 540, price: 55, image: 'https://images.unsplash.com/photo-1605640840605-14ac1855827b?auto=format&fit=crop&w=1740&q=80' },
      { id: 1003, title: 'Chao Phraya River Dinner Cruise', rating: 4.7, reviews: 210, price: 65, image: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=1740&q=80' },
    ],
    guides: [
      { id: 20, name: 'Somsak', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80', rating: 5.0, reviews: 89 },
      { id: 21, name: 'Noy', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80', rating: 4.9, reviews: 120 },
      { id: 22, name: 'Lek', image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=128&q=80', rating: 4.8, reviews: 45 },
      { id: 23, name: 'Joy', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=128&q=80', rating: 5.0, reviews: 67 },
    ]
  },
  corfu: {
    name: 'Corfu',
    heroImage: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=1740&q=80',
    description: 'Discover the Emerald Island of Greece. Explore Venetian fortresses, crystal clear beaches, and olive groves.',
    topThings: [
      { id: 2001, title: 'Corfu Old Town Walking Tour', rating: 4.9, reviews: 180, price: 40, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1740&q=80' },
      { id: 2002, title: 'Achilleion Palace Visit', rating: 4.8, reviews: 150, price: 50, image: 'https://images.unsplash.com/photo-1605640840605-14ac1855827b?auto=format&fit=crop&w=1740&q=80' },
      { id: 2003, title: 'Paleokastritsa Boat Trip', rating: 5.0, reviews: 230, price: 60, image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1740&q=80' },
    ],
    guides: [
      { id: 30, name: 'Nikos', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80', rating: 5.0, reviews: 90 },
      { id: 31, name: 'Eleni', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80', rating: 4.9, reviews: 75 },
      { id: 32, name: 'Giorgos', image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=128&q=80', rating: 4.8, reviews: 55 },
      { id: 33, name: 'Maria', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=128&q=80', rating: 5.0, reviews: 40 },
    ]
  },
  barcelona: {
    name: 'Barcelona',
    heroImage: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1740&q=80',
    description: 'Experience the architectural marvels of Gaudi, the vibrant Gothic Quarter, and the Mediterranean lifestyle.',
    topThings: [
      { id: 3001, title: 'Sagrada Familia Guided Tour', rating: 4.9, reviews: 890, price: 35, image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1740&q=80' },
      { id: 3002, title: 'Park Guell & Gaudi Houses', rating: 4.8, reviews: 450, price: 30, image: 'https://images.unsplash.com/photo-1605640840605-14ac1855827b?auto=format&fit=crop&w=1740&q=80' },
      { id: 3003, title: 'Tapas & Wine Experience', rating: 5.0, reviews: 600, price: 75, image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1740&q=80' },
    ],
    guides: [
      { id: 40, name: 'Javier', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80', rating: 5.0, reviews: 150 },
      { id: 41, name: 'Carmen', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80', rating: 4.9, reviews: 200 },
      { id: 42, name: 'Pablo', image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=128&q=80', rating: 4.8, reviews: 80 },
      { id: 43, name: 'Lucia', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=128&q=80', rating: 5.0, reviews: 110 },
    ]
  },
  kathmandu: {
    name: 'Kathmandu',
    heroImage: 'https://images.unsplash.com/photo-1605640840605-14ac1855827b?auto=format&fit=crop&w=1740&q=80',
    description: 'Experience the spiritual heart of Nepal. From ancient temples to vibrant street markets, discover Kathmandu with a local.',
    topThings: [
      { id: 101, title: 'Hidden Gems of Kathmandu', rating: 4.9, reviews: 124, price: 25, image: 'https://images.unsplash.com/photo-1605640840605-14ac1855827b?auto=format&fit=crop&w=1740&q=80' },
      { id: 102, title: 'Authentic Newari Food Tour', rating: 5.0, reviews: 89, price: 35, image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1740&q=80' },
      { id: 103, title: 'Spiritual Morning at Swayambhunath', rating: 4.8, reviews: 210, price: 20, image: 'https://images.unsplash.com/photo-1605640840605-14ac1855827b?auto=format&fit=crop&w=1740&q=80' },
    ],
    guides: [
      { id: 1, name: 'Rajesh', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80', rating: 5.0, reviews: 45 },
      { id: 2, name: 'Sita', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80', rating: 4.9, reviews: 32 },
      { id: 3, name: 'Nima', image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=128&q=80', rating: 4.9, reviews: 67 },
      { id: 4, name: 'Binod', image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=128&q=80', rating: 4.8, reviews: 15 },
    ]
  },
  pokhara: {
    name: 'Pokhara',
    heroImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=1740&q=80',
    description: 'Relax by the lake or embark on a mountain adventure. Pokhara is the gateway to the Annapurna circuit.',
    topThings: [
      { id: 201, title: 'Sunrise at Sarangkot', rating: 4.9, reviews: 312, price: 30, image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1740&q=80' },
      { id: 202, title: 'Phewa Lake Boat Ride & Hike', rating: 4.8, reviews: 156, price: 40, image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=1740&q=80' },
      { id: 203, title: 'Tibetan Culture Tour', rating: 4.9, reviews: 98, price: 35, image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=1740&q=80' },
    ],
    guides: [
      { id: 5, name: 'Karma', image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=128&q=80', rating: 5.0, reviews: 55 },
      { id: 6, name: 'Anjali', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80', rating: 4.9, reviews: 42 },
      { id: 7, name: 'Deepak', image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=128&q=80', rating: 4.8, reviews: 88 },
      { id: 8, name: 'Maya', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=128&q=80', rating: 5.0, reviews: 21 },
    ]
  },
  lalitpur: {
    name: 'Lalitpur',
    heroImage: 'https://images.unsplash.com/photo-1605640840605-14ac1855827b?auto=format&fit=crop&w=1740&q=80',
    description: 'Explore the city of fine arts. Lalitpur (Patan) is famous for its intricate architecture and master craftsmen.',
    topThings: [
      { id: 301, title: 'Patan Durbar Square Walk', rating: 4.9, reviews: 180, price: 28, image: 'https://images.unsplash.com/photo-1605640840605-14ac1855827b?auto=format&fit=crop&w=1740&q=80' },
      { id: 302, title: 'Traditional Metal Craft Workshop', rating: 5.0, reviews: 65, price: 45, image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1740&q=80' },
      { id: 303, title: 'Golden Temple & Hidden Courtyards', rating: 4.8, reviews: 112, price: 25, image: 'https://images.unsplash.com/photo-1605640840605-14ac1855827b?auto=format&fit=crop&w=1740&q=80' },
    ],
    guides: [
      { id: 9, name: 'Suresh', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80', rating: 4.9, reviews: 76 },
      { id: 10, name: 'Rina', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80', rating: 4.8, reviews: 34 },
      { id: 11, name: 'Bikash', image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=128&q=80', rating: 5.0, reviews: 29 },
      { id: 12, name: 'Sarita', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=128&q=80', rating: 4.9, reviews: 52 },
    ]
  },
  bhaktapur: {
    name: 'Bhaktapur',
    heroImage: 'https://images.unsplash.com/photo-1605640840605-14ac1855827b?auto=format&fit=crop&w=1740&q=80',
    description: 'Step back in time in the medieval city of devotees. Famous for pottery, curd, and timeless architecture.',
    topThings: [
      { id: 401, title: 'Bhaktapur Heritage Walk', rating: 4.9, reviews: 245, price: 35, image: 'https://images.unsplash.com/photo-1605640840605-14ac1855827b?auto=format&fit=crop&w=1740&q=80' },
      { id: 402, title: 'Pottery Making Class', rating: 4.8, reviews: 134, price: 30, image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1740&q=80' },
      { id: 403, title: 'Taste Juju Dhau (King Curd)', rating: 5.0, reviews: 320, price: 15, image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=1740&q=80' },
    ],
    guides: [
      { id: 13, name: 'Krishna', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80', rating: 5.0, reviews: 98 },
      { id: 14, name: 'Radha', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80', rating: 4.9, reviews: 45 },
      { id: 15, name: 'Prakash', image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=128&q=80', rating: 4.8, reviews: 62 },
      { id: 16, name: 'Laxmi', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=128&q=80', rating: 4.9, reviews: 38 },
    ]
  }
};

const CityPage: React.FC = () => {
  const { cityId } = useParams<{ cityId: string }>();
  const navigate = useNavigate();
  const city = cityData[cityId?.toLowerCase() || ''];

  if (!city) {
    return (
      <div className="min-h-screen flex flex-col font-sans">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
             <h1 className="text-4xl font-bold text-primary mb-4">City not found</h1>
             <Link to="/">
               <Button>Go Home</Button>
             </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background-cream">
      <Header />
      
      {/* City Hero */}
      <div className="relative h-[50vh] min-h-[400px]">
        <button 
          onClick={() => navigate(-1)} 
          className="absolute top-8 left-8 z-20 flex items-center gap-2 text-white hover:text-accent font-bold transition-colors bg-black/20 hover:bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <img
          src={city.heroImage}
          alt={city.name}
          className="w-full h-full object-cover"
          onError={(e) => (e.currentTarget.src = '/images/placeholder.svg')}
        />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
           <div className="text-center text-white px-4 max-w-3xl">
             <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg">
               Experience the best of <span className="text-brand-yellow">{city.name}</span> with guides-nepal
             </h1>
             <p className="text-lg md:text-xl font-medium drop-shadow-md mb-8">
               {city.description}
             </p>
             <Button className="bg-brand-yellow hover:bg-brand-yellow/90 text-white font-bold text-lg px-8 rounded-full border-none">
               View all tours
             </Button>
           </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-12 space-y-20">
        
        {/* Value Props Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center border-b border-slate-200 pb-12">
          <div className="flex flex-col items-center gap-3">
             <div className="w-12 h-12 rounded-full bg-brand-yellow/10 flex items-center justify-center text-brand-yellow">
                <Users className="w-6 h-6" />
             </div>
             <h3 className="font-bold text-lg">100% Private</h3>
             <p className="text-slate-600 text-sm">It's just you and your local host</p>
          </div>
          <div className="flex flex-col items-center gap-3">
             <div className="w-12 h-12 rounded-full bg-brand-yellow/10 flex items-center justify-center text-brand-yellow">
                <ShieldCheck className="w-6 h-6" />
             </div>
             <h3 className="font-bold text-lg">Verified Locals</h3>
             <p className="text-slate-600 text-sm">We verify every host for quality</p>
          </div>
          <div className="flex flex-col items-center gap-3">
             <div className="w-12 h-12 rounded-full bg-brand-yellow/10 flex items-center justify-center text-brand-yellow">
                <Heart className="w-6 h-6" />
             </div>
             <h3 className="font-bold text-lg">Authentic Experiences</h3>
             <p className="text-slate-600 text-sm">Discover the real city, away from crowds</p>
          </div>
        </div>

        {/* Top Things to Do */}
        <section>
          <div className="flex items-center justify-between mb-8">
             <h2 className="text-3xl font-bold text-primary">Top things to do in {city.name}</h2>
             <Link to="#" className="text-primary font-bold hover:underline">See all tours</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {city.topThings.map((tour: Tour) => (
              <Link key={tour.id} to={`/experience/${tour.id}`} className="block h-full">
                <Card className="border-none shadow-md hover:shadow-xl transition-shadow bg-white h-full">
                   <div className="relative h-56 overflow-hidden rounded-t-lg">
                      <img
                        src={tour.image}
                        alt={tour.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        onError={(e) => (e.currentTarget.src = '/images/placeholder.svg')}
                      />
                      <div className="absolute top-3 left-3 bg-white text-slate-800 text-xs font-bold px-2 py-1 rounded-md shadow-sm flex items-center gap-1">
                         <Star className="w-3 h-3 fill-brand-yellow text-brand-yellow" />
                         {tour.rating}
                      </div>
                      <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded-md backdrop-blur-sm">
                         {tour.reviews} reviews
                      </div>
                   </div>
                   <div className="p-5">
                      <h3 className="font-bold text-xl mb-2 line-clamp-2">{tour.title}</h3>
                      <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
                         <Clock className="w-4 h-4" />
                         <span>3 hours</span>
                         <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                         <span>Private tour</span>
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                         <div className="text-xs text-slate-500">
                            Starting price <br/>
                            <span className="text-lg font-bold text-primary">€{tour.price}</span> <span className="text-slate-400">pp</span>
                         </div>
                         <Button size="sm" className="bg-primary hover:bg-primary-hover text-white">Book Now</Button>
                      </div>
                   </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Local Guides Grid */}
        <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
           <h2 className="text-2xl font-bold text-primary mb-2 text-center">Explore {city.name} with our incredible locals</h2>
           <p className="text-slate-500 text-center mb-8">Meet the people who know the city best</p>
           
           <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {city.guides.map((guide: Guide) => (
                <div key={guide.id} className="text-center group cursor-pointer">
                   <div className="relative w-32 h-32 mx-auto mb-4">
                      <img
                        src={guide.image}
                        alt={guide.name}
                        className="w-full h-full object-cover rounded-full border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => (e.currentTarget.src = '/images/placeholder.svg')}
                      />
                      <div className="absolute bottom-1 right-1 bg-brand-yellow text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                        <Star className="w-2.5 h-2.5 fill-current" />
                        {guide.rating}
                      </div>
                   </div>
                   <h4 className="font-bold text-lg text-slate-800 group-hover:text-primary transition-colors">{guide.name}</h4>
                   <p className="text-xs text-slate-500">{guide.reviews} reviews</p>
                </div>
              ))}
           </div>
           
           <div className="text-center mt-8">
              <Button variant="outline" className="rounded-full px-8 text-primary border-primary hover:bg-brand-yellow hover:text-white hover:border-brand-yellow transition-colors">View all locals</Button>
           </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default CityPage;
