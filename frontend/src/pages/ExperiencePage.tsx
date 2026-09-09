import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { Button } from '../components/common/Button';
import { Star, Clock, User, ShieldCheck, MapPin, CheckCircle, Calendar, ArrowLeft, Bookmark, DollarSign } from 'lucide-react';
import { useBookingStore } from '../store/bookingStore';
import { useAuthStore } from '../store/authStore';
import { useProfileStore } from '../store/profileStore';
import guidesApi from '../services/guidesApi';
import { CurrencyConverterModal } from '../components/common/CurrencyConverterModal';

interface Host {
  name: string;
  image: string;
  rating: number;
  reviews: number;
  about: string;
}

interface Experience {
  id: number;
  title: string;
  city: string;
  rating: number;
  reviews: number;
  price: number;
  duration: string;
  images: string[];
  description: string;
  highlights: string[];
  host: Host;
}

// Extended mock data for experiences
const experiencesData: Record<string, Experience> = {
  // Kathmandu
  '101': {
    id: 101,
    title: 'Hidden Gems of Kathmandu',
    city: 'Kathmandu',
    rating: 4.9,
    reviews: 124,
    price: 25,
    duration: '3 hours',
    images: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80'
    ],
    description: "Discover the secret side of Kathmandu that tourists often miss. We'll navigate through narrow alleys, visit hidden stupas in private courtyards, and taste the best local tea. This tour is perfect for those who want to see the authentic daily life of the city.",
    highlights: [
      'Visit 3 hidden temples not on the tourist map',
      'Try authentic local snacks and tea',
      'Learn about Newari architecture and history',
      'Explore the oldest markets in the city'
    ],
    host: {
      name: 'Rajesh',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=80&h=80&q=80',
      rating: 5.0,
      reviews: 45,
      about: "Namaste! I'm Rajesh, born and raised in the heart of Kathmandu. I love sharing stories about my city's history and culture that you won't find in guidebooks."
    }
  },
  '102': {
    id: 102,
    title: 'Authentic Newari Food Tour',
    city: 'Kathmandu',
    rating: 5.0,
    reviews: 89,
    price: 35,
    duration: '4 hours',
    images: [
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80'
    ],
    description: "Embark on a culinary journey through the flavors of the Newari people. We will visit local eateries and try dishes like Bara, Chatamari, and the famous Yomari.",
    highlights: ['Taste 5 different Newari dishes', 'Visit a traditional kitchen', 'Learn about spices used in Nepali cooking'],
    host: {
      name: 'Sita',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=80&h=80&q=80',
      rating: 4.9,
      reviews: 32,
      about: "I am a food enthusiast and love cooking traditional meals for my family. Join me to explore the delicious side of Kathmandu!"
    }
  },
  '103': {
    id: 103,
    title: 'Spiritual Morning at Swayambhunath',
    city: 'Kathmandu',
    rating: 4.8,
    reviews: 210,
    price: 20,
    duration: '2.5 hours',
    images: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80'
    ],
    description: "Start your day with peace and spirituality at the Monkey Temple. Watch the sunrise over the valley and observe the morning rituals of the monks and locals.",
    highlights: ['Sunrise view of Kathmandu Valley', 'Observe morning Buddhist rituals', 'Feed the monkeys (carefully!)'],
    host: {
      name: 'Nima',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=80&h=80&q=80',
      rating: 4.9,
      reviews: 67,
      about: "I grew up in a Buddhist family and Swayambhunath has always been a special place for me. I'd love to share its spiritual significance with you."
    }
  },
  // Pokhara
  '201': {
    id: 201,
    title: 'Sunrise at Sarangkot',
    city: 'Pokhara',
    rating: 4.9,
    reviews: 312,
    price: 30,
    duration: '3 hours',
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80'
    ],
    description: "Witness the majestic Annapurna range light up with the first rays of the sun. A short drive and hike will take us to the best viewpoint in Pokhara.",
    highlights: ['Breathtaking sunrise views', 'See Mt. Machhapuchhre up close', 'Morning tea with a view'],
    host: {
      name: 'Karma',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=80&h=80&q=80',
      rating: 5.0,
      reviews: 55,
      about: "The mountains are my home. I love showing visitors the beauty of the Himalayas from the best vantage points."
    }
  },
  '202': {
    id: 202,
    title: 'Phewa Lake Boat Ride & Hike',
    city: 'Pokhara',
    rating: 4.8,
    reviews: 156,
    price: 40,
    duration: '4 hours',
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80'
    ],
    description: "Row across the serene Phewa Lake and hike up to the World Peace Pagoda. Enjoy panoramic views of the lake and the city below.",
    highlights: ['Traditional boat ride', 'Hike through lush forest', 'Visit the World Peace Pagoda'],
    host: {
      name: 'Anjali',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=80&h=80&q=80',
      rating: 4.9,
      reviews: 42,
      about: "I am a nature lover and hiking enthusiast. This trail is my favorite way to disconnect and enjoy nature."
    }
  },
  // Lalitpur
  '301': {
    id: 301,
    title: 'Patan Durbar Square Walk',
    city: 'Lalitpur',
    rating: 4.9,
    reviews: 180,
    price: 28,
    duration: '2.5 hours',
    images: [
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80'
    ],
    description: "Explore the architectural marvels of Patan Durbar Square. Visit the museum, the Krishna Mandir, and learn about the history of the Malla kings.",
    highlights: ['Visit the Patan Museum', 'Admire the Krishna Mandir', 'Explore hidden courtyards'],
    host: {
      name: 'Suresh',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=80&h=80&q=80',
      rating: 4.9,
      reviews: 76,
      about: "History and art are my passions. I can tell you stories about every stone and statue in this square."
    }
  },
  // Bhaktapur
  '401': {
    id: 401,
    title: 'Bhaktapur Heritage Walk',
    city: 'Bhaktapur',
    rating: 4.9,
    reviews: 245,
    price: 35,
    duration: '3.5 hours',
    images: [
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80'
    ],
    description: "Walk through the living museum of Bhaktapur. See the 55-Window Palace, the Nyatapola Temple, and witness pottery making in the streets.",
    highlights: ['Visit the tallest temple in Nepal', 'See the 55-Window Palace', 'Watch potters at work'],
    host: {
      name: 'Krishna',
      image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=80&h=80&q=80',
      rating: 5.0,
      reviews: 98,
      about: "Bhaktapur is not just a city, it's a lifestyle. I want to show you the traditions that have been kept alive for centuries."
    }
  }
};

const ExperiencePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [staticExperience] = useState(id ? experiencesData[id] : undefined);
  const [apiExperience, setApiExperience] = useState<Experience | undefined>(undefined);
  const [loading, setLoading] = useState(!staticExperience);
  const experience = staticExperience ?? apiExperience;

  // If the id is not in the static map (e.g. it comes from the backend
  // catalog surfaced via Search), resolve it from the API.
  useEffect(() => {
    if (staticExperience || !id) return;
    let cancelled = false;
    (async () => {
      try {
        const list = await guidesApi.getExperiences();
        if (cancelled) return;
        const match = list.find((e) => String(e.id) === id || e.slug === id);
        if (match) {
          setApiExperience({
            ...match,
            city: match.city ?? 'Kathmandu',
            images: [match.heroImage],
            highlights: [],
            rating: match.rating ?? 4.5,
            reviews: match.reviews ?? 0,
            price: match.price ?? 0,
            duration: match.duration ?? '3 hours',
            host: (match.host
              ? { ...match.host, about: (match.host as any).about ?? 'A passionate local guide ready to show you the best of Nepal.' }
              : {
                  name: 'Local guide',
                  image: '/images/placeholder.svg',
                  rating: 4.5,
                  reviews: 0,
                  about: 'A passionate local guide ready to show you the best of Nepal.',
                }) as Host,
          });
        }
      } catch (error) {
        console.error('Failed to load experience:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id, staticExperience]);

  const { addBooking } = useBookingStore();
  const { isAuthenticated } = useAuthStore();
  const [isBooked, setIsBooked] = useState(false);
  const { addBookmark } = useProfileStore();

  // Currency converter modal state
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);

  // Booking form state (date + guests)
  const [selectedDate, setSelectedDate] = useState('');
  const [guests, setGuests] = useState(2);
  const [showGuestsPicker, setShowGuestsPicker] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookmarkSaved, setBookmarkSaved] = useState(false);

  const handleBooking = () => {
    if (!isAuthenticated) {
      alert('Please log in to book an experience');
      return;
    }

    if (!selectedDate) {
      setBookingError('Please select a date before booking.');
      return;
    }

    if (experience) {
      setBookingError(null);
      addBooking({
        id: Math.random().toString(36).substr(2, 9),
        experienceId: experience.id,
        experienceTitle: experience.title,
        city: experience.city,
        date: selectedDate,
        guests: guests,
        price: experience.price,
        image: experience.images[0],
        status: 'upcoming'
      });
      setIsBooked(true);
      setTimeout(() => navigate('/bookings'), 1000);
    }
  };

  const handleBookmark = () => {
    if (!experience) return;
    addBookmark({
      id: `exp-${experience.id}`,
      title: experience.title,
      city: experience.city,
      image: experience.images[0],
      createdAt: new Date().toISOString(),
      link: `/experience/${experience.id}`,
    });
    setBookmarkSaved(true);
    setTimeout(() => setBookmarkSaved(false), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col font-sans">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="min-h-screen flex flex-col font-sans">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
             <h1 className="text-4xl font-bold text-primary mb-4">Experience not found</h1>
             <p className="text-gray-600 mb-6">It may have been removed, or the link is incorrect.</p>
             <div className="flex items-center justify-center gap-3">
               <Link to="/search">
                 <Button>Back to Search</Button>
               </Link>
               <Link to="/">
                 <Button variant="outline">Go Home</Button>
               </Link>
             </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background-cream">
      <Header />

      <main className="flex-grow">
        {/* Gallery Grid (Mobile: Carousel, Desktop: Grid) */}
        <div className="h-[40vh] md:h-[60vh] relative bg-slate-100">
           <button 
             onClick={() => navigate(-1)} 
             className="absolute top-8 left-8 z-20 flex items-center gap-2 text-white hover:text-accent font-bold transition-colors bg-black/20 hover:bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full"
           >
             <ArrowLeft className="w-5 h-5" />
             Back
           </button>
           {/* Simple single image for now, but could be a grid */}
          <img
            src={experience.images[0]}
            alt={experience.title}
            className="w-full h-full object-cover"
            onError={(e) => (e.currentTarget.src = '/images/placeholder.svg')}
          />
           <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-md text-sm font-bold shadow-sm">
             View all photos
           </div>
        </div>

        <div className="container mx-auto px-4 py-8">
           <div className="flex flex-col lg:flex-row gap-12">
              
              {/* Left Content */}
              <div className="lg:w-2/3 space-y-8">
                 <div>
                    <div className="flex items-center gap-2 text-primary font-bold uppercase text-xs tracking-wider mb-2">
                       <MapPin className="w-4 h-4" />
                       {experience.city}
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">{experience.title}</h1>
                    <div className="flex items-center gap-4 text-sm">
                       <div className="flex items-center gap-1 font-bold">
                          <Star className="w-4 h-4 fill-secondary text-secondary" />
                          {experience.rating} <span className="text-slate-500 font-normal">({experience.reviews} reviews)</span>
                       </div>
                       <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                       <div className="flex items-center gap-1 text-slate-600">
                          <Clock className="w-4 h-4" />
                          {experience.duration}
                       </div>
                    </div>
                 </div>

                 <div className="border-t border-b border-slate-200 py-6 flex flex-wrap gap-6">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <User className="w-5 h-5" />
                       </div>
                       <div>
                          <p className="font-bold text-sm">Private Tour</p>
                          <p className="text-xs text-slate-500">Only you and your host</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <ShieldCheck className="w-5 h-5" />
                       </div>
                       <div>
                          <p className="font-bold text-sm">100% Personalized</p>
                          <p className="text-xs text-slate-500">Customize your experience</p>
                       </div>
                    </div>
                 </div>

                 <div>
                    <h2 className="text-2xl font-bold mb-4">What you'll do</h2>
                    <p className="text-slate-700 leading-relaxed text-lg">{experience.description}</p>
                 </div>

                 <div>
                    <h2 className="text-2xl font-bold mb-4">Highlights</h2>
                    <ul className="space-y-3">
                       {experience.highlights?.map((highlight: string, index: number) => (
                          <li key={index} className="flex items-start gap-3 text-slate-700">
                             <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                             <span>{highlight}</span>
                          </li>
                       ))}
                    </ul>
                 </div>

                 {/* Currency Converter Button */}
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between">
                       <div>
                          <h2 className="text-2xl font-bold mb-2">Currency Converter</h2>
                          <p className="text-slate-600">Convert prices to your preferred currency</p>
                       </div>
                       <Button 
                          onClick={() => setIsCurrencyModalOpen(true)}
                          variant="outline" 
                          className="flex items-center gap-2"
                       >
                          <DollarSign className="w-5 h-5" />
                          Convert
                       </Button>
                    </div>
                 </div>

                 {/* Host Section */}
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h2 className="text-2xl font-bold mb-6">Your Host</h2>
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                       <div className="flex-shrink-0 text-center">
                         <img
                           src={experience.host.image}
                           alt={experience.host.name}
                           className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md mb-2"
                           onError={(e) => (e.currentTarget.src = '/images/placeholder.svg')}
                         />
                          <div className="font-bold text-lg">{experience.host.name}</div>
                          <div className="text-secondary font-bold text-sm flex items-center justify-center gap-1">
                             <Star className="w-3 h-3 fill-current" />
                             {experience.host.rating}
                          </div>
                       </div>
                       <div>
                          <p className="italic text-slate-600 mb-4">"{experience.host.about}"</p>
                          <Button variant="outline" size="sm" className="rounded-full" onClick={() => navigate(`/local/${experience.id}/contact`)}>Contact Host</Button>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Right Sidebar (Booking Card) */}
              <div className="lg:w-1/3">
                 <div className="sticky top-24 bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
                    <div className="flex items-center space-x-1 mb-2">
                       {[...Array(5)].map((_, i) => (
                          <Star
                             key={i}
                             className={`w-5 h-5 ${i < Math.round(experience.rating) ? 'text-brand-yellow fill-brand-yellow' : 'text-gray-300'}`}
                          />
                       ))}
                       <span className="text-sm text-gray-500 ml-2">({experience.reviews} reviews)</span>
                    </div>

                    <div className="flex items-baseline space-x-2 mb-6">
                       <span className="text-3xl font-bold text-secondary">€{experience.price}</span>
                       <span className="text-gray-500">/ person</span>
                    </div>

                    <div className="space-y-4 mb-6">
                       <div>
                         <label className="border border-slate-200 rounded-lg p-3 flex items-center justify-between cursor-pointer hover:border-primary transition-colors">
                            <div className="flex items-center gap-3">
                               <Calendar className="w-5 h-5 text-slate-400" />
                               <span className="font-medium text-slate-700">
                                 {selectedDate || 'Select Date'}
                               </span>
                            </div>
                            <span className="text-primary font-bold text-sm">Change</span>
                            <input
                              type="date"
                              value={selectedDate}
                              min={new Date().toISOString().split('T')[0]}
                              onChange={(e) => { setSelectedDate(e.target.value); setBookingError(null); }}
                              className="sr-only"
                            />
                         </label>
                       </div>
                       <div className="relative">
                         <div
                           onClick={() => setShowGuestsPicker((v) => !v)}
                           className="border border-slate-200 rounded-lg p-3 flex items-center justify-between cursor-pointer hover:border-primary transition-colors"
                         >
                            <div className="flex items-center gap-3">
                               <User className="w-5 h-5 text-slate-400" />
                               <span className="font-medium text-slate-700">
                                 {guests} {guests === 1 ? 'Adult' : 'Adults'}
                               </span>
                            </div>
                            <span className="text-primary font-bold text-sm">Change</span>
                         </div>
                         {showGuestsPicker && (
                           <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg p-3 space-y-2">
                             <div className="flex items-center justify-between">
                               <span className="text-sm text-slate-700">Adults</span>
                               <div className="flex items-center gap-3">
                                 <button type="button" onClick={() => setGuests((g) => Math.max(1, g - 1))} className="h-8 w-8 rounded-full border border-slate-300 font-bold text-slate-700 hover:border-primary">−</button>
                                 <span className="w-6 text-center font-semibold">{guests}</span>
                                 <button type="button" onClick={() => setGuests((g) => Math.min(20, g + 1))} className="h-8 w-8 rounded-full border border-slate-300 font-bold text-slate-700 hover:border-primary">+</button>
                               </div>
                             </div>
                             <button
                               type="button"
                               onClick={() => setShowGuestsPicker(false)}
                               className="w-full text-sm font-semibold text-white bg-primary rounded-lg py-1.5 hover:bg-primary-hover"
                             >
                               Done
                             </button>
                           </div>
                         )}
                       </div>
                       {guests > 1 && experience && (
                         <div className="flex justify-between text-sm text-slate-600 border-t border-slate-100 pt-3">
                           <span>€{experience.price} × {guests} guests</span>
                           <span className="font-bold text-secondary">€{experience.price * guests}</span>
                         </div>
                       )}
                       {bookingError && (
                         <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{bookingError}</p>
                       )}
                       {isBooked && (
                         <p className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                           Booking confirmed! Taking you to your bookings…
                         </p>
                       )}
                    </div>

                    <Button 
                      className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 text-lg rounded-xl mb-4 shadow-lg shadow-primary/20"
                      onClick={handleBooking}
                    >
                       {isBooked ? 'Booked!' : 'Book Now'}
                    </Button>

                    <div className="text-center text-xs text-slate-500 space-y-2">
                       <p className="flex items-center justify-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Free cancellation up to 24h before
                       </p>
                       <p>No payment required today</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleBookmark}
                      className="w-full border border-gray-200 hover:border-primary text-primary font-bold py-3 rounded-xl mt-3 flex items-center justify-center gap-2"
                    >
                      <Bookmark className="w-4 h-4" /> Save for later
                    </button>
                 </div>
              </div>

           </div>
        </div>
      </main>

      <Footer />
      
      {/* Currency Converter Modal */}
      <CurrencyConverterModal
        isOpen={isCurrencyModalOpen}
        onClose={() => setIsCurrencyModalOpen(false)}
        initialAmount={experience?.price || 0}
      />
    </div>
  );
};

export default ExperiencePage;
