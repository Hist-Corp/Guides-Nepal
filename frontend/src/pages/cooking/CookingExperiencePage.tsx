import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { 
  Check, ArrowRight, ArrowLeft, Star, ShieldCheck, 
  Globe, X, User, Clock 
} from 'lucide-react';

interface Guide {
  id: number;
  name: string;
  role: string;
  image: string;
  rating: number;
  reviews: number;
  bio?: string;
  languages?: string[];
}

interface CookingExperience {
  id: number;
  title: string;
  slug: string;
  heroImage: string;
  rating: number;
  reviews: number;
  price: number;
  duration: string;
  host: {
    name: string;
    type: string;
    image: string;
  };
  guides: Guide[];
  description: string;
  tourStructure: {
    steps: Array<{
      name: string;
      label: string;
    }>;
  };
  exploration: {
    title: string;
    description: string;
    points: string[];
  };
  atmosphere: string;
  hiddenGems: string;
}

const cookingExperiencesData: CookingExperience[] = [
  {
    id: 1,
    title: "Authentic Nepali Cooking Class with Market Visit",
    slug: "nepali-cooking-class-market-visit",
    heroImage: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
    rating: 4.9,
    reviews: 892,
    price: 65,
    duration: "4 hours",
    host: {
      name: "Chef Sita",
      type: "Cooking Class",
      image: "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=128&h=128&q=80"
    },
    guides: [
      {
        id: 1,
        name: "Chef Sita",
        role: "Traditional Newari Cooking Expert",
        image: "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=128&h=128&q=80",
        rating: 4.9,
        reviews: 892,
        bio: "Namaste! I'm Chef Sita, a third-generation Newari cook with over 15 years of experience. I learned traditional cooking techniques from my grandmother and have been sharing the secrets of Nepali cuisine with visitors for the past 8 years. I believe food is the best way to understand a culture!",
        languages: ["English", "Nepali", "Hindi"]
      },
      {
        id: 2,
        name: "Chef Maya",
        role: "Organic Farm to Table Specialist",
        image: "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=128&h=128&q=80",
        rating: 4.8,
        reviews: 567,
        bio: "Hello! I'm Chef Maya, passionate about organic farming and sustainable cooking. I grow my own herbs and vegetables and love teaching visitors about the connection between fresh ingredients and delicious food.",
        languages: ["English", "Nepali"]
      }
    ],
    description: "Discover the authentic flavors of Nepal in this hands-on cooking class! Start with a guided tour of a local market to select fresh ingredients, then learn to prepare traditional Nepali dishes in a cozy home kitchen. You'll master the art of making dal bhat, momo dumplings, and other beloved Nepali specialties.",
    tourStructure: {
      steps: [
        { name: "Market Tour", label: "30 min" },
        { name: "Ingredient Prep", label: "45 min" },
        { name: "Cooking Session", label: "2 hours" },
        { name: "Shared Meal", label: "45 min" }
      ]
    },
    exploration: {
      title: "What you'll learn",
      description: "This immersive cooking experience will teach you the fundamental techniques of Nepali cuisine while sharing stories about the cultural significance of each dish.",
      points: [
        "How to properly season and cook dal (lentil soup)",
        "The secret to perfect basmati rice",
        "Momo folding techniques and filling recipes",
        "Traditional spice blending methods",
        "Presentation and serving customs"
      ]
    },
    atmosphere: "My kitchen is warm and welcoming, filled with the aromas of traditional spices. I create a relaxed environment where you can ask questions, take photos, and truly immerse yourself in Nepali cooking culture. We often share stories while cooking, and I love hearing about your own food traditions!",
    hiddenGems: "I'll share my grandmother's secret spice combinations that have been passed down through generations. You'll also learn about the medicinal properties of different herbs and how to adapt Nepali recipes using ingredients available in your home country."
  },
  {
    id: 2,
    title: "Momo Making Workshop: Nepal's Famous Dumplings",
    slug: "momo-making-workshop",
    heroImage: "https://images.unsplash.com/photo-1617093727343-374698b1b08d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
    rating: 4.8,
    reviews: 567,
    price: 45,
    duration: "3 hours",
    host: {
      name: "Raju",
      type: "Cooking Workshop",
      image: "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=128&h=128&q=80"
    },
    guides: [
      {
        id: 3,
        name: "Raju",
        role: "Momo Master & Street Food Guide",
        image: "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=128&h=128&q=80",
        rating: 4.8,
        reviews: 567,
        bio: "I'm Raju, Kathmandu-born and raised! I've been making momos since I was 12 years old, learning from my mother who had a small street food stall. Momos are my passion - I know over 20 different filling variations!",
        languages: ["English", "Nepali"]
      }
    ],
    description: "Master the art of Nepal's most beloved dish - momo dumplings! In this hands-on workshop, you'll learn to make perfect momo wrappers, create delicious fillings, and master the traditional folding techniques. From classic chicken momos to creative vegetarian variations.",
    tourStructure: {
      steps: [
        { name: "Dough Making", label: "30 min" },
        { name: "Filling Prep", label: "45 min" },
        { name: "Folding Techniques", label: "1 hour" },
        { name: "Steaming & Tasting", label: "45 min" }
      ]
    },
    exploration: {
      title: "What you'll master",
      description: "This specialized workshop focuses entirely on momo making, from basic techniques to advanced presentation skills.",
      points: [
        "Perfect dough consistency and rolling technique",
        "Traditional and modern filling recipes",
        "Multiple folding styles (round, half-moon, pleated)",
        "Steaming timing and temperature control",
        "Spicy tomato chutney preparation"
      ]
    },
    atmosphere: "My workshop space is casual and fun - we usually have music playing and share lots of laughs while folding momos. I encourage everyone to get creative with their folding styles and we often have friendly competitions for the most beautiful momo!",
    hiddenGems: "I'll teach you the secret to making momos that don't fall apart during steaming, plus my special spice blend that makes the fillings incredibly flavorful. You'll also learn how to freeze momos properly so you can enjoy them anytime!"
  }
];

const ReadMoreText = ({ 
  text, 
  limit = 150, 
  textClassName = "text-gray-600 leading-relaxed", 
  buttonClassName = "ml-2 font-bold underline decoration-gray-900 decoration-1 underline-offset-2 text-gray-900 hover:text-gray-700 inline-block text-sm" 
}: { 
  text: string; 
  limit?: number; 
  textClassName?: string;
  buttonClassName?: string;
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  React.useEffect(() => {
    setIsExpanded(false);
  }, [text]);
  
  if (!text || text.length <= limit) {
    return <p className={textClassName}>{text}</p>;
  }

  return (
    <div>
      <p className={`${textClassName} inline`}>
        {isExpanded ? text : `${text.substring(0, limit)}...`}
      </p>
      <button 
        onClick={() => setIsExpanded(!isExpanded)} 
        className={buttonClassName}
      >
        {isExpanded ? 'Show less' : 'Show more'}
      </button>
    </div>
  );
};

const CookingExperiencePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState(cookingExperiencesData.find(d => d.slug === slug));
  
  // Guide Selection State
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [viewingGuide, setViewingGuide] = useState<Guide | null>(null);
  const [isChangingGuide, setIsChangingGuide] = useState(false);
  const [guestCount, setGuestCount] = useState(1);
  const [pricePerPerson, setPricePerPerson] = useState(65);
  
  // Form State
  const [bookingTime, setBookingTime] = useState('09:00');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [isBookingConfirmed, setIsBookingConfirmed] = useState(false);
  
  const handleBookNow = () => {
    if (!checkIn) {
      const infoElement = document.getElementById('booking-info-message');
      if (infoElement) {
        infoElement.textContent = "Please select a check-in date";
        infoElement.classList.remove('hidden');
        infoElement.classList.add('text-red-500');
      }
      
      const checkInInput = document.getElementById('card-checkin');
      if (checkInInput) {
        checkInInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        checkInInput.focus();
        checkInInput.classList.add('ring-2', 'ring-primary');
        setTimeout(() => checkInInput.classList.remove('ring-2', 'ring-primary'), 2000);
      }
      return;
    }

    if (!checkOut) {
      const infoElement = document.getElementById('booking-info-message');
      if (infoElement) {
        infoElement.textContent = "Please select a check-out date";
        infoElement.classList.remove('hidden');
        infoElement.classList.add('text-red-500');
      }
      const checkOutInput = document.getElementById('card-checkout');
      if (checkOutInput) {
        checkOutInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        checkOutInput.focus();
        checkOutInput.classList.add('ring-2', 'ring-primary');
        setTimeout(() => checkOutInput.classList.remove('ring-2', 'ring-primary'), 2000);
      }
      return;
    }

    // Clear error message if valid
    const infoElement = document.getElementById('booking-info-message');
    if (infoElement) {
        infoElement.classList.add('hidden');
    }

    // Set confirmation state
    setIsBookingConfirmed(true);
    
    // Scroll to top of card to ensure confirmation is visible
    const cardElement = document.getElementById('booking-card-desktop');
    if (cardElement) {
        cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  useEffect(() => {
    const found = cookingExperiencesData.find(d => d.slug === slug);
    if (found) {
      setData(found);
      setPricePerPerson(found.price || 65);
      // Default to the first guide if available
      if (found.guides && found.guides.length > 0) {
        setSelectedGuide(found.guides[0]);
      }
    }
  }, [slug]);

  const getDaysDifference = () => {
    if (checkIn && checkOut) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      return diffDays > 0 ? diffDays : 1;
    }
    return 1;
  };

  const cleaningFee = 15;
  const serviceFee = 0;
  const days = getDaysDifference();
  const subtotal = pricePerPerson * guestCount * days;
  const total = subtotal + cleaningFee + serviceFee;

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col font-sans bg-white">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold">Cooking experience not found</h1>
          <button onClick={() => navigate('/cooking-classes')} className="text-primary hover:underline mt-4">
            Back to Cooking Classes
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white">
      <Header />
      
      {/* Hero Section */}
      <div className="relative min-h-[70vh] flex items-center">
        {/* Full-bleed background image */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${data.heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
        </div>
        
        {/* Navigation button */}
        <div className="container mx-auto px-4 relative z-10 flex flex-col h-full justify-center">
          <div className="absolute top-8 left-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-white hover:text-brand-yellow font-bold transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
          </div>
          
          {/* Left-aligned content */}
          <div className="max-w-2xl text-left space-y-6 mt-20">
            <div className="flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/90 border border-gray-200 rounded-full text-sm font-medium text-gray-700 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-brand-yellow animate-pulse"></span>
                Kathmandu • {data.host.type}
              </div>
              <div className="inline-flex items-center px-3 py-1 bg-white/90 border border-gray-200 rounded-full text-sm font-medium text-gray-600 shadow-sm">
                {data.duration}
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
              {data.title}
            </h1>

            <div className="flex items-center gap-2 text-sm text-white/80 uppercase tracking-wider font-medium">
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-brand-yellow text-brand-yellow" />
                {data.rating}
              </span>
              <span className="w-1 h-1 rounded-full bg-white/60"></span>
              <span>{data.reviews} reviews</span>
            </div>

            <p className="text-white/80 max-w-xl">{data.description}</p>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => document.getElementById('guides-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-3.5 bg-brand-yellow hover:bg-[#E5A800] text-slate-900 font-bold rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Meet Your Chef
              </button>
              <button
                onClick={() => navigate('/cooking-classes')}
                className="px-8 py-3.5 bg-white/90 hover:bg-white text-[#213448] font-bold rounded-full transition-all shadow-sm border border-white/50"
              >
                More Classes
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="lg:grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-12">
              <div id="guides-section" className="pb-8 border-b border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Who you'll meet</h2>
                  <span className="text-sm text-gray-500 hidden md:block">Select a chef to see their availability</span>
                </div>

                {data.guides && data.guides.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {data.guides.map((guide) => (
                      <div
                        key={guide.id}
                        className={`
                          relative flex flex-col items-center p-4 rounded-xl border transition-all cursor-pointer group
                          ${selectedGuide?.id === guide.id
                            ? 'border-black ring-1 ring-black bg-gray-50'
                            : 'border-gray-200 hover:border-gray-400 hover:shadow-md'
                          }
                        `}
                        onClick={() => setSelectedGuide(guide)}
                      >
                        {selectedGuide?.id === guide.id && (
                          <div className="absolute top-2 right-2 bg-black text-white rounded-full p-0.5">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                        <img src={guide.image} alt={guide.name} className="w-20 h-20 rounded-full object-cover mb-3 ring-2 ring-white shadow-sm" />
                        <span className="font-bold text-gray-900 text-sm">{guide.name}</span>
                        <span className="text-xs text-gray-500 text-center mb-2">{guide.role}</span>

                        <div className="flex items-center gap-1 text-xs font-medium text-gray-900 mb-3">
                          <Star className="w-3 h-3 fill-brand-yellow text-brand-yellow" />
                          {guide.rating} <span className="text-gray-400">({guide.reviews})</span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewingGuide(guide);
                            setShowGuideModal(true);
                          }}
                          className="text-xs font-bold underline decoration-gray-400 decoration-1 underline-offset-2 hover:text-primary mt-auto"
                        >
                          View Profile
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full p-1 border-2 border-secondary">
                      <img
                        src={data.host.image}
                        alt={data.host.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{data.host.name}</h3>
                      <p className="text-gray-500 text-sm">{data.host.type}</p>
                      <div className="flex items-center gap-2 text-secondary text-xs font-bold mt-1">
                        <Check className="w-3 h-3" />
                        <span>VERIFIED CHEF</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="prose prose-lg max-w-none text-gray-600">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">What is this experience?</h2>
                <p className="mb-6 leading-relaxed">
                  {data.description}
                </p>

                <div className="my-8 p-6 bg-orange-50 rounded-xl border border-orange-200">
                  <h3 className="text-orange-800 font-bold mb-2 uppercase text-sm tracking-wide">Cooking Class Structure</h3>
                  <div className="flex flex-col md:flex-row gap-4 justify-between items-center text-center">
                    {data.tourStructure.steps.map((step, index) => (
                      <React.Fragment key={index}>
                        <div className="bg-white p-4 rounded-lg shadow-sm w-full">
                          <span className="block font-bold text-gray-900">{step.name}</span>
                          <span className="text-xs text-gray-500">{step.label}</span>
                        </div>
                        {index < data.tourStructure.steps.length - 1 && (
                          <ArrowRight className="text-orange-600 hidden md:block" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">{data.exploration.title}</h2>
                <p className="mb-4">
                  {data.exploration.description}
                </p>
                <ul className="space-y-3 mb-8">
                  {data.exploration.points.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-orange-600 mt-2.5 flex-shrink-0"></div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <h3 className="text-xl font-bold text-gray-900 mb-3">Cooking Atmosphere</h3>
                <p className="mb-6">
                  {data.atmosphere}
                </p>

                <h3 className="text-xl font-bold text-gray-900 mb-3">Chef's Secrets</h3>
                <p className="mb-6">
                  {data.hiddenGems}
                </p>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-8">
                {/* Booking Card */}
                {/* Mobile Bottom Bar */}
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-2xl lg:hidden z-40 flex items-center justify-between">
                  <div className="flex flex-col">
                     <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-gray-900">€{data.price || 65}</span>
                        <span className="text-gray-500 text-xs">/ person</span>
                     </div>
                     <span className="text-xs underline font-bold text-gray-900">Show dates</span>
                  </div>
                  <button 
                    onClick={() => {
                        const formElement = document.getElementById('booking');
                        if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg uppercase tracking-wide"
                  >
                    Book Now
                  </button>
                </div>

                {/* Desktop Booking Card */}
                <div id="booking-card-desktop" className="hidden lg:block bg-white rounded-2xl shadow-xl border border-gray-100 p-6 overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-full h-1 bg-orange-600"></div>
                  
                  {!isBookingConfirmed ? (
                    <>
                      <div className="flex items-center space-x-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${i < Math.round(data.rating || 0) ? 'text-brand-yellow fill-brand-yellow' : 'text-gray-300'}`}
                          />
                        ))}
                        <span className="text-sm text-gray-500 ml-2">({data.reviews || 124} reviews)</span>
                      </div>

                      <div className="flex items-baseline space-x-2 mb-6">
                        <span className="text-3xl font-bold text-orange-600">€{data.price || 65}</span>
                        <span className="text-gray-500">/ person</span>
                      </div>
                  
                  <div className="space-y-4 mb-6">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-white rounded-xl border border-gray-200 hover:border-gray-900 cursor-pointer transition-colors relative group">
                        <label className="block text-[10px] font-bold text-gray-800 uppercase mb-0.5">Check In</label>
                        <input 
                          id="card-checkin"
                          type="date" 
                          value={checkIn}
                          onChange={(e) => setCheckIn(e.target.value)}
                          className="w-full bg-transparent text-sm font-medium outline-none text-gray-600 font-sans p-0 cursor-pointer" 
                        />
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-gray-200 hover:border-gray-900 cursor-pointer transition-colors relative group">
                        <label className="block text-[10px] font-bold text-gray-800 uppercase mb-0.5">Check Out</label>
                        <input 
                          id="card-checkout"
                          type="date" 
                          value={checkOut}
                          onChange={(e) => setCheckOut(e.target.value)}
                          className="w-full bg-transparent text-sm font-medium outline-none text-gray-600 font-sans p-0 cursor-pointer" 
                        />
                      </div>
                    </div>
                    
                    <div className="p-3 bg-white rounded-xl border border-gray-200 hover:border-gray-900 cursor-pointer transition-colors">
                      <label className="block text-[10px] font-bold text-gray-800 uppercase mb-0.5">Guests</label>
                      <select 
                        value={guestCount}
                        onChange={(e) => setGuestCount(parseInt(e.target.value))}
                        className="w-full bg-transparent text-sm font-medium outline-none text-gray-600 cursor-pointer"
                      >
                        <option value="1">1 Guest</option>
                        <option value="2">2 Guests</option>
                        <option value="3">3 Guests</option>
                        <option value="4">4 Guests</option>
                        <option value="5">5 Guests</option>
                        <option value="6">6 Guests</option>
                      </select>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-gray-200 hover:border-gray-900 cursor-pointer transition-colors">
                      <label className="block text-[10px] font-bold text-gray-800 uppercase mb-0.5">Start Time</label>
                      <select 
                        value={bookingTime}
                        onChange={(e) => setBookingTime(e.target.value)}
                        className="w-full bg-transparent text-sm font-medium outline-none text-gray-600 cursor-pointer"
                      >
                        <option value="09:00">09:00 AM</option>
                        <option value="10:00">10:00 AM</option>
                        <option value="11:00">11:00 AM</option>
                        <option value="12:00">12:00 PM</option>
                        <option value="13:00">01:00 PM</option>
                        <option value="14:00">02:00 PM</option>
                        <option value="15:00">03:00 PM</option>
                        <option value="16:00">04:00 PM</option>
                        <option value="17:00">05:00 PM</option>
                      </select>
                    </div>

                    {/* Selected Guide Preview */}
                    {selectedGuide && (
                      <div className="p-3 bg-white rounded-xl border border-gray-200 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <img src={selectedGuide.image} alt={selectedGuide.name} className="w-10 h-10 rounded-full object-cover" />
                            <div>
                               <p className="text-[10px] font-bold text-gray-500 uppercase">Selected Chef</p>
                               <p className="text-sm font-bold text-gray-900">{selectedGuide.name}</p>
                            </div>
                         </div>
                         <button 
                           onClick={() => {
                             const guideSection = document.querySelector('h2:contains("Who you\'ll meet")')?.parentElement;
                             if (guideSection) guideSection.scrollIntoView({ behavior: 'smooth' });
                           }}
                           className="text-xs font-bold underline text-gray-900"
                         >
                           Change
                         </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 mb-6">
                    <button 
                      onClick={handleBookNow}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-orange-600/20 hover:shadow-orange-600/40 active:scale-[0.98]"
                    >
                      Book Now
                    </button>
                    <p id="booking-info-message" className="text-center text-xs font-medium hidden transition-all duration-300"></p>
                    <p className="text-center text-xs text-gray-500 font-medium">You won't be charged yet</p>
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-3 pt-6">
                     <div className="flex justify-between text-sm text-gray-600">
                        <span className="underline decoration-gray-300 decoration-1 underline-offset-2">
                          €{pricePerPerson} x {guestCount} guests {days > 1 && `x ${days} days`}
                        </span>
                        <span>€{subtotal}</span>
                     </div>
                     <div className="flex justify-between text-sm text-gray-600">
                        <span className="underline decoration-gray-300 decoration-1 underline-offset-2">Cleaning fee</span>
                        <span>€{cleaningFee}</span>
                     </div>
                     <div className="flex justify-between text-sm text-gray-600">
                        <span className="underline decoration-gray-300 decoration-1 underline-offset-2">Service fee</span>
                        <span>€{serviceFee}</span>
                     </div>
                     <div className="flex justify-between text-base font-bold text-gray-900 pt-4 border-t border-gray-100">
                        <span>Total</span>
                        <span>€{total}</span>
                     </div>
                  </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center text-center py-8 animate-in fade-in zoom-in duration-300">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <Check className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Booking Confirmed!</h3>
                      <p className="text-gray-500 text-sm mb-6">Your cooking class has been reserved.</p>
                       
                      <div className="w-full bg-gray-50 rounded-xl p-4 mb-6 text-left space-y-3">
                        <div className="flex justify-between text-sm">
                           <span className="text-gray-500">Date</span>
                           <span className="font-bold text-gray-900">
                             {new Date(checkIn).toLocaleDateString()}
                             {days > 1 && checkOut && ` - ${new Date(checkOut).toLocaleDateString()}`}
                           </span>
                        </div>
                        {days > 1 && (
                          <div className="flex justify-between text-sm">
                             <span className="text-gray-500">Duration</span>
                             <span className="font-bold text-gray-900">{days} days</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                           <span className="text-gray-500">Time</span>
                           <span className="font-bold text-gray-900">{bookingTime}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                           <span className="text-gray-500">Guests</span>
                           <span className="font-bold text-gray-900">{guestCount}</span>
                        </div>
                        <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                           <span className="text-gray-500">Total</span>
                           <span className="font-bold text-gray-900">€{total}</span>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => setIsBookingConfirmed(false)}
                        className="text-orange-600 hover:underline text-sm font-bold"
                      >
                        Make another booking
                      </button>
                    </div>
                  )}

                </div>

                {/* Similar Experiences */}
                <div>
                  <h3 className="font-bold text-xl text-gray-900 mb-6 border-b pb-2">Similar cooking experiences</h3>
                  
                  <div className="space-y-6">
                    {cookingExperiencesData.filter(d => d.id !== data.id).slice(0, 4).map((item, i) => (
                      <div 
                        key={i} 
                        className="flex gap-4 group cursor-pointer"
                        onClick={() => {
                          navigate(`/cooking-classes/experience/${item.slug}`);
                          window.scrollTo({ top: 0, behavior: 'instant' });
                        }}
                      >
                        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 relative">
                          <img src={item.heroImage} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-orange-600/20 mix-blend-multiply"></div>
                        </div>
                        <div className="flex flex-col justify-between py-1">
                          <h4 className="font-bold text-sm text-gray-900 leading-snug group-hover:text-orange-600 transition-colors line-clamp-2">
                            {item.title}
                          </h4>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>{item.duration}</span>
                          </div>
                          <span className="text-[10px] font-bold text-orange-600 tracking-wider uppercase">
                            READ MORE
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lead Capture / Contact Section */}
        <div id="booking" className="bg-orange-50 py-16">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              
              {/* Form */}
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-2">Ready to cook?</h2>
                <p className="text-gray-500 mb-8">Complete the form below and we'll confirm your cooking class shortly.</p>
                
                <form className="space-y-4">
                  {/* Selected Guide Display in Form */}
                  {selectedGuide && (
                    <div className="mb-6">
                      {!isChangingGuide ? (
                        <div className="bg-white p-4 rounded-lg border border-orange-600/20 shadow-sm flex items-center gap-4">
                           <img src={selectedGuide.image} alt={selectedGuide.name} className="w-12 h-12 rounded-full object-cover" />
                           <div>
                             <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Your Chef</span>
                             <h3 className="font-bold text-gray-900">{selectedGuide.name}</h3>
                           </div>
                           <button 
                             type="button" 
                             className="ml-auto text-xs text-gray-500 underline hover:text-gray-900" 
                             onClick={() => setIsChangingGuide(true)}
                           >
                             Change
                           </button>
                        </div>
                      ) : (
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-sm font-bold text-gray-900">Select a chef</span>
                            <button 
                              type="button" 
                              onClick={() => setIsChangingGuide(false)}
                              className="text-xs text-gray-500 hover:text-gray-900"
                            >
                              Cancel
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto custom-scrollbar">
                            {data.guides?.map(guide => (
                              <button
                                key={guide.id}
                                type="button"
                                onClick={() => {
                                  setSelectedGuide(guide);
                                  setIsChangingGuide(false);
                                }}
                                className={`
                                  flex items-center gap-3 p-2 rounded-lg border text-left transition-all
                                  ${selectedGuide.id === guide.id 
                                    ? 'border-orange-600 bg-orange-50 ring-1 ring-orange-600' 
                                    : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                                  }
                                `}
                              >
                                <img src={guide.image} alt={guide.name} className="w-8 h-8 rounded-full object-cover" />
                                <div>
                                  <div className="text-xs font-bold text-gray-900">{guide.name}</div>
                                  <div className="text-[10px] text-gray-500 flex items-center gap-1">
                                    <Star className="w-2 h-2 fill-brand-yellow text-brand-yellow" />
                                    {guide.rating}
                                  </div>
                                </div>
                                {selectedGuide.id === guide.id && <Check className="w-3 h-3 text-orange-600 ml-auto" />}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Name</label>
                      <input type="text" className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all" placeholder="Your name" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Phone number</label>
                      <input type="text" className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all" placeholder="+1 234 567 890" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                      <input type="email" className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all" placeholder="you@example.com" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Date</label>
                      <input type="date" className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all" />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Special Requests</label>
                    <textarea className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all h-32 resize-none" placeholder="Any dietary restrictions or preferences?"></textarea>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <input type="checkbox" id="consent" className="rounded text-orange-600 focus:ring-orange-600" />
                    <label htmlFor="consent" className="text-xs text-gray-500">I agree to the terms and conditions and cancellation policy.</label>
                  </div>

                  <button type="button" className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-full uppercase tracking-wider transition-all shadow-lg shadow-orange-600/30 flex items-center gap-2">
                    Send Request
                  </button>
                </form>
              </div>

              {/* Right Illustration/Profile */}
              <div className="relative hidden lg:block">
                 <div className="relative z-10 text-center">
                    <div className="w-64 h-64 mx-auto rounded-full p-2 border-4 border-orange-600 relative bg-white shadow-xl transition-all duration-500">
                      <img 
                         src={selectedGuide ? selectedGuide.image : data.host.image}
                         alt={selectedGuide ? selectedGuide.name : data.host.name}
                         className="w-full h-full rounded-full object-cover grayscale"
                      />
                      {/* Decorative elements */}
                      <div className="absolute -top-4 -right-4 w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg animate-bounce">
                        100%
                      </div>
                      <div className="absolute top-1/2 -left-12 bg-white p-3 rounded-xl shadow-lg flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-orange-600"></div>
                         <span className="text-xs font-bold">Verified Chef</span>
                      </div>
                    </div>
                    
                    <div className="mt-8">
                       <h3 className="font-bold text-xl text-gray-900">{selectedGuide ? selectedGuide.name : data.host.name}</h3>
                       <p className="text-orange-600 font-medium">{selectedGuide ? selectedGuide.role : data.host.type}</p>
                    </div>
                 </div>
                 
                 {/* Background decorative blob */}
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-orange-600/20 to-yellow-500/20 rounded-full blur-3xl -z-0"></div>
              </div>
            </div>
          </div>
        </div>

      </main>
      
      {/* Guide Profile Modal */}
      {showGuideModal && viewingGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowGuideModal(false)}>
          <div 
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-300 no-scrollbar"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex justify-between items-center z-10">
              <h3 className="font-bold text-lg">Chef Profile</h3>
              <button onClick={() => setShowGuideModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8">
              <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
                <img src={viewingGuide.image} alt={viewingGuide.name} className="w-32 h-32 rounded-full object-cover border-4 border-gray-50 shadow-lg" />
                <div className="space-y-4">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-1">Hi, I'm {viewingGuide.name}</h2>
                    <p className="text-gray-500 font-medium">{viewingGuide.role}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm">
                    {viewingGuide.rating && (
                      <div className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 fill-brand-yellow text-brand-yellow" />
                        <span className="font-bold text-gray-900">{viewingGuide.rating}</span>
                        <span className="text-gray-500">({viewingGuide.reviews} reviews)</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Identity verified</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">About me</h3>
                  <ReadMoreText text={viewingGuide.bio || `I'm ${viewingGuide.name}, a passionate local chef who loves sharing the authentic flavors of Nepali cuisine. I believe cooking is the best way to connect with culture!`} />
                </div>

                {viewingGuide.languages && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Languages I speak</h3>
                    <div className="flex flex-wrap gap-3">
                      {viewingGuide.languages.map((lang: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-lg text-orange-800 font-bold text-sm tracking-wide">
                          <Globe className="w-4 h-4 text-orange-600" />
                          {lang}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="pt-6 border-t border-gray-100 flex flex-col gap-3">
                  <button 
                    onClick={() => {
                      setSelectedGuide(viewingGuide);
                      setShowGuideModal(false);
                      // Optional: scroll to booking form
                      const formElement = document.querySelector('form');
                      if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-orange-600/20"
                  >
                    <Check className="w-5 h-5" />
                    Choose {viewingGuide.name} as my chef
                  </button>

                  <button 
                    onClick={() => {
                      navigate(`/cooking-classes/chef/${viewingGuide.id}`);
                      window.scrollTo({ top: 0, behavior: 'instant' });
                    }}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    View Chef Portfolio
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default CookingExperiencePage;
