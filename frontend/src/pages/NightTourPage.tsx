import React, { useState } from 'react';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { Button } from '../components/common/Button';
import {
  Star,
  Users,
  ShieldCheck,
  Check,
  Clock,
  ChevronRight,
  ArrowLeft,
  Moon,
  Play,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../contexts/CurrencyContext';
import { useGoBack } from '../utils/backNavigation';

const nightLocals = [
  {
    name: 'Lhakpa',
    title: 'The Night Culture Guide',
    reviews: 214,
    languages: 'English・Nepali・Newari',
  },
  { name: 'Tashi', title: 'The Evening Heritage Expert', reviews: 178, languages: 'English・Nepali' },
  { name: 'Sita', title: 'The Night Market Foodie', reviews: 163, languages: 'English・Nepali' },
  { name: 'Mingma', title: 'The Kathmandu After-Dark Guide', reviews: 156, languages: 'English・Nepali' },
  { name: 'Pasang', title: 'The Bhaktapur Lantern Guide', reviews: 142, languages: 'English・Nepali' },
  { name: 'Ang', title: 'The Phewa Lake Sunset Guide', reviews: 139, languages: 'English・Nepali' },
  { name: 'Nima', title: 'The Spiritual Night Guide', reviews: 127, languages: 'English・Nepali' },
  {
    name: 'Tenzin',
    title: 'The Thamel Night Explorer',
    reviews: 118,
    languages: 'English・French・Nepali',
  },
];

export const nightTours = [
  {
    id: 1,
    title: 'Kathmandu Thamel Night Walk',
    rating: 4.9,
    reviews: 342,
    type: 'Night Walking Tour',
    duration: '2 hours',
    price: 28,
    image:
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    locals: ['Lhakpa', 'Tenzin', 'Sita'],
    slug: 'kathmandu-thamel-night-walk',
  },
  {
    id: 2,
    title: 'Bhaktapur Lantern Evening Tour',
    rating: 4.8,
    reviews: 219,
    type: 'Night Heritage Tour',
    duration: '2.5 hours',
    price: 32,
    image:
      'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    locals: ['Pasang', 'Tashi'],
    slug: 'bhaktapur-lantern-evening-tour',
  },
  {
    id: 3,
    title: 'Phewa Lake Sunset & Night Boating',
    rating: 4.9,
    reviews: 278,
    type: 'Night Lake Tour',
    duration: '2 hours',
    price: 35,
    image:
      'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    locals: ['Ang', 'Mingma'],
    slug: 'phewa-lake-sunset-night-boating',
  },
  {
    id: 4,
    title: 'Patan Durbar Square by Night',
    rating: 4.7,
    reviews: 184,
    type: 'Night Heritage Tour',
    duration: '2 hours',
    price: 30,
    image:
      'https://images.unsplash.com/photo-1517335277475-ae7e773a7c8a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    locals: ['Sita', 'Nima'],
    slug: 'patan-durbar-square-by-night',
  },
  {
    id: 5,
    title: 'Kathmandu Night Food Tour',
    rating: 5.0,
    reviews: 156,
    type: 'Night Food Tour',
    duration: '3 hours',
    price: 45,
    image:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    locals: ['Sita', 'Lhakpa'],
    slug: 'kathmandu-night-food-tour',
  },
  {
    id: 6,
    title: 'Nagarkot Stargazing Tour',
    rating: 4.8,
    reviews: 93,
    type: 'Night Nature Tour',
    duration: '3 hours',
    price: 40,
    image:
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    locals: ['Nima', 'Mingma'],
    slug: 'nagarkot-stargazing-tour',
  },
];

export const NightTourPage: React.FC = () => {
  const navigate = useNavigate();
  const goBack = useGoBack();
  const { formatPrice } = useCurrency();
  const [showAllLocals, setShowAllLocals] = useState(false);
  const displayedLocals = showAllLocals ? nightLocals : nightLocals.slice(0, 5);
  const displayedTours = nightTours.slice(0, 6);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white">
      <Header />

      {/* Hero Section with Video */}
      <div data-page-hero="true" className="relative pt-4 pb-16 overflow-hidden bg-[#E0F2FE]">
        <div className="container mx-auto px-4 relative z-10">
          <button
            onClick={goBack}
            className="flex items-center gap-2 text-gray-600 hover:text-[#213448] font-bold mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          {/* Video Section as Hero */}
          <div className="relative rounded-2xl overflow-hidden shadow-lg group cursor-pointer mb-12">
            <img
              src="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
              alt="Night tours in Nepal"
              className="w-full h-[500px] object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <button className="w-20 h-20 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white group-hover:bg-white/50 transition-colors">
                <Play className="w-10 h-10 fill-current" />
              </button>
            </div>
            <div className="absolute bottom-8 left-8 text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-2">Enchanting Night Tours</h1>
              <p className="text-xl">
                Discover Nepal after dark with local guides who know the evening stories.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-12">
            {/* Left Content */}
            <div className="w-full md:w-1/2 space-y-6">
              <h1 className="text-2xl md:text-4xl font-bold text-gray-900 leading-tight">
                Explore Nepal at night <br className="hidden md:block" />
                <span className="text-[#213448]">with our locals</span>
              </h1>

              <p className="text-xl text-gray-600 max-w-lg leading-relaxed">
                Experience lantern-lit heritage squares, night food walks, and moonlit lake
                rides with a friendly local host who shares the hidden gems after sunset.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <button
                  onClick={() =>
                    document
                      .getElementById('locals-section')
                      ?.scrollIntoView({ behavior: 'smooth' })
                  }
                  className="px-8 py-3.5 bg-brand-yellow hover:bg-[#ffba0a] text-slate-900 font-bold rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  Find your local
                </button>
              </div>
            </div>

            {/* Right Content - Stats */}
            <div className="w-full md:w-1/2 relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4 translate-y-8">
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-lg">
                    <img
                      src="https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
                      alt="Night Guide"
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-lg bg-[#FFF0E6] p-4 flex items-center justify-center text-center">
                    <div>
                      <div className="text-3xl font-bold text-[#213448] mb-1">30+</div>
                      <div className="text-gray-600 font-medium">Night Guides</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-lg">
                    <img
                      src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
                      alt="Night Heritage"
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-lg rounded-bl-[4rem]">
                    <img
                      src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
                      alt="Night Food"
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tagline Section */}
      <div className="bg-white py-16 text-center border-b border-gray-100">
        <h2 className="text-3xl md:text-4xl font-bold text-[#213448] leading-tight font-sans tracking-tight">
          Real Nights. Real Stories.
          <br />
          Really Good Travel.
        </h2>
      </div>

      <main className="container mx-auto px-4 py-16 max-w-7xl">
        {/* Value Props */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20 text-center">
          <div className="flex flex-col items-center group">
            <div className="w-20 h-20 rounded-full bg-[#E0F2FE] flex items-center justify-center text-[#213448] mb-6 group-hover:scale-110 transition-transform duration-300">
              <Moon className="w-10 h-10" />
            </div>
            <h3 className="font-bold text-xl mb-3 text-gray-900">Real Nights. Real Stories.</h3>
            <p className="text-gray-500 max-w-xs">Really Good Travel.</p>
          </div>
          <div className="flex flex-col items-center group">
            <div className="w-20 h-20 rounded-full bg-[#E0F2FE] flex items-center justify-center text-[#213448] mb-6 group-hover:scale-110 transition-transform duration-300">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <h3 className="font-bold text-xl mb-3 text-gray-900">Feel like a local, not a tourist</h3>
            <p className="text-gray-500 max-w-xs">
              Always private. It's just you and your local host. No strangers, no groups.
            </p>
          </div>
          <div className="flex flex-col items-center group">
            <div className="w-20 h-20 rounded-full bg-[#E0F2FE] flex items-center justify-center text-[#213448] mb-6 group-hover:scale-110 transition-transform duration-300">
              <Check className="w-10 h-10" />
            </div>
            <h3 className="font-bold text-xl mb-3 text-gray-900">More you, less checklist</h3>
            <p className="text-gray-500 max-w-xs">
              Let your local host tailor the night experience completely to your wishes.
            </p>
          </div>
        </div>

        {/* Featured Section (2 Large Cards) */}
        <div className="mb-24">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h3 className="text-[#213448] font-bold uppercase tracking-wider text-sm mb-2">
                Don't miss out
              </h3>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Top Rated Night Experiences
              </h2>
            </div>
            <button
              onClick={() => navigate('/search?q=night+tours')}
              className="hidden md:flex items-center text-[#213448] font-bold hover:underline"
            >
              View all experiences <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {nightTours.slice(0, 2).map((tour) => (
              <div
                key={tour.id}
                className="group relative rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300"
                onClick={() => {
                  navigate(`/experience/${tour.slug}`);
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>
                <img
                  src={tour.image}
                  alt={tour.title}
                  className="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-500"
                />

                <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-1 text-xs font-bold text-gray-900">
                  <Star className="w-3 h-3 fill-brand-yellow text-brand-yellow" />
                  {tour.rating} ({tour.reviews})
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-8 z-20 text-white">
                  <h3 className="text-2xl font-bold mb-2 leading-tight">{tour.title}</h3>
                  <div className="flex items-center gap-4 text-sm font-medium text-white/90 mb-6">
                    <span>{tour.type}</span>
                    <span>•</span>
                    <span>{tour.duration}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-3">
                        <img
                          src={`https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&h=100&q=80`}
                          className="w-10 h-10 rounded-full border-2 border-white object-cover"
                        />
                        <div className="w-10 h-10 rounded-full border-2 border-white bg-white/20 backdrop-blur-md flex items-center justify-center text-xs font-bold">
                          +{tour.locals.length}
                        </div>
                      </div>
                      <span className="text-sm font-bold">Choose your local</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs opacity-80">From</div>
                      <div className="text-xl font-bold">{formatPrice(tour.price, 'USD')}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="full-width bg-[#E0F2FE] -mx-4 md:-mx-[max(1rem,calc((100vw-80rem)/2))] px-4 md:px-[max(1rem,calc((100vw-80rem)/2))] py-20 mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Travelers love our night guides</h2>
            <p className="text-gray-600">Reviews from guests about our night tours and locals</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {[
              {
                name: 'Sarah',
                review:
                  "Lhakpa took us on a magical Thamel night walk. The hidden courtyards and night markets were unforgettable. Highly recommended!",
                host: 'Lhakpa',
                date: 'Kathmandu, February 1, 2026',
              },
              {
                name: 'Michael',
                review:
                  "Tashi showed us Bhaktapur's ancient squares under lantern light. The atmosphere was peaceful and the stories were incredible.",
                host: 'Tashi',
                date: 'Bhaktapur, January 28, 2026',
              },
              {
                name: 'Emma',
                review:
                  'Sunset boating on Phewa Lake followed by night views of the city was the highlight of our trip.',
                host: 'Ang',
                date: 'Pokhara, January 25, 2026',
              },
            ].map((review, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl shadow-sm relative">
                <div className="flex gap-1 mb-6">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-5 h-5 fill-brand-yellow text-brand-yellow" />
                  ))}
                </div>
                <p className="text-gray-800 font-medium italic mb-8 leading-relaxed">
                  "{review.review}"
                </p>
                <div className="flex items-center gap-4 mt-auto">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">
                    {review.name[0]}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{review.name}</div>
                    <div className="text-xs text-[#213448] font-bold uppercase">
                      About local {review.host}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Locals Grid */}
        <div className="mb-24" id="locals-section">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Explore Nepal at night with our <span className="text-[#213448]">incredible locals</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Learn about their personal stories and find out how you can explore Nepal after dark
              with locals who know the night best.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {displayedLocals.map((local, i) => (
              <div
                key={i}
                className="flex flex-col items-center group cursor-pointer"
                onClick={() => {
                  const demoId = (i % 4) + 1;
                  navigate(`/local/${demoId}`);
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
              >
                <div className="relative w-32 h-32 mb-4">
                  <img
                    src={`https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&h=100&q=80`}
                    alt={local.name}
                    className="w-full h-full rounded-full object-cover border-4 border-white shadow-md group-hover:border-brand-yellow transition-all duration-300"
                  />
                  <div className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm text-xs font-bold border border-gray-100">
                    🇳🇵
                  </div>
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-[#213448] transition-colors">
                  {local.name}
                </h3>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2 text-center line-clamp-1 px-2">
                  {local.title}
                </p>
                <div className="flex items-center gap-1 text-xs font-bold text-gray-600">
                  <Star className="w-3 h-3 fill-brand-yellow text-brand-yellow" />
                  <span>{local.reviews}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              onClick={() => setShowAllLocals(!showAllLocals)}
              className="bg-transparent border border-[#213448] text-[#213448] hover:bg-brand-yellow hover:border-brand-yellow hover:text-slate-900 rounded-full px-8 py-3 font-bold transition-all"
            >
              {showAllLocals ? 'See less' : 'Show more locals'}
            </Button>
          </div>
        </div>

        {/* Things to do Grid */}
        <div className="full-width bg-[#E0F2FE] -mx-4 md:-mx-[max(1rem,calc((100vw-80rem)/2))] px-4 md:px-[max(1rem,calc((100vw-80rem)/2))] py-20 mb-24">
          <div className="text-center mb-12">
            <span className="text-[#213448] font-bold uppercase tracking-wider text-sm block mb-2">
              Experiences
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Night adventures in Nepal
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {displayedTours.map((tour) => (
              <div
                key={tour.id}
                className="flex flex-col border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 bg-white group cursor-pointer"
                onClick={() => {
                  navigate(`/experience/${tour.slug}`);
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
              >
                <div className="relative h-48 aspect-[4/3] overflow-hidden">
                  <img
                    src={tour.image}
                    alt={tour.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide text-gray-800">
                    {tour.type}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                    <Star className="w-3 h-3 fill-brand-yellow text-brand-yellow" />
                    {tour.rating}
                  </div>
                </div>

                <div className="flex-1 p-5 flex flex-col">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 leading-snug line-clamp-2 group-hover:text-[#213448] transition-colors">
                    {tour.title}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                    <Clock className="w-3 h-3" />
                    <span>{tour.duration}</span>
                    <span>•</span>
                    <span>{tour.reviews} reviews</span>
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {tour.locals.map((l, i) => (
                        <img
                          key={i}
                          src={`https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=80&h=80&q=80`}
                          className="w-8 h-8 rounded-full border-2 border-white object-cover"
                        />
                      ))}
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-gray-400 uppercase">From</div>
                      <div className="text-lg font-bold text-gray-900">
                        {formatPrice(Math.floor(tour.price), 'USD')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              onClick={() => navigate('/search?q=night+tours')}
              className="bg-transparent border border-[#213448] text-[#213448] hover:bg-brand-yellow hover:border-brand-yellow hover:text-slate-900 rounded-full px-8 py-3 font-bold transition-all"
            >
              Explore more
            </Button>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-24">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-[#213448] mb-2">Find night experiences by category</h2>
          </div>

          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            {[
              'Night Walking Tour',
              'Night Heritage Tour',
              'Night Food Tour',
              'Night Lake Tour',
              'Night Nature Tour',
              'Stargazing Tour',
              'Moonlit Hike',
            ].map((cat, i) => (
              <div
                key={i}
                className="px-5 py-2.5 rounded-full border border-gray-200 hover:border-[#213448] hover:bg-[#213448] hover:text-white cursor-pointer transition-all bg-white text-gray-600 font-medium text-sm"
              >
                {cat}
              </div>
            ))}
          </div>
        </div>

        {/* Why Guides Nepal Icons Grid (Bottom) */}
        <div className="mb-24 pt-16 border-t border-gray-100">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-[#213448]">
              Why do Guides Nepal night hosts love what they do?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {[
              {
                title: 'Local night experts',
                desc: 'Our hosts know the evenings best.',
                icon: <Moon className="w-8 h-8" />,
              },
              {
                title: 'Safe after dark',
                desc: 'Private, guided night experiences.',
                icon: <ShieldCheck className="w-8 h-8" />,
              },
              {
                title: 'Hidden gems',
                desc: 'Lantern lit streets few tourists see.',
                icon: <Star className="w-8 h-8" />,
              },
              {
                title: 'Flexible schedule',
                desc: 'Tours that fit your time.',
                icon: <Clock className="w-8 h-8" />,
              },
              {
                title: 'Local stories',
                desc: 'Evening tales from Nepal.',
                icon: <Users className="w-8 h-8" />,
              },
              {
                title: 'Global community',
                desc: 'Connecting the world.',
                icon: <Users className="w-8 h-8" />,
              },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-[#E0F2FE] flex items-center justify-center text-[#213448] mb-4">
                  {item.icon}
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Best things to do SEO Text */}
        <div className="mb-24 text-center max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-[#213448] mb-6">
            Best night experiences in Nepal
          </h2>
          <div className="space-y-6 text-gray-600 leading-relaxed text-sm md:text-base">
            <p>
              Nepal doesn't sleep when the sun sets. From lantern-lit heritage squares in
              Bhaktapur to moonlit shores of Phewa Lake, the country reveals a different charm
              after dark.
            </p>
            <p>
              Start with a{' '}
              <strong className="text-gray-900">night walk through Thamel</strong>, where
              Kathmandu's vibrant streets come alive with lights, food stalls, and local stories
              shared by your guide.
            </p>
            <p>
              For heritage lovers,{' '}
              <strong className="text-gray-900">Bhaktapur by lantern light</strong> offers a
              peaceful exploration of ancient temples and courtyards far from the daytime crowds.
            </p>
            <p>
              Nature seekers can enjoy{' '}
              <strong className="text-gray-900">sunset boating on Phewa Lake</strong>,{' '}
              <strong className="text-gray-900">stargazing near Nagarkot</strong>, or a{' '}
              <strong className="text-gray-900">night food tour</strong> tasting local delicacies
              under the stars.
            </p>
            <p>
              No matter which night experience you choose, exploring Nepal with a local guide
              ensures safety, cultural insight, and access to hidden spots off the beaten path.
              Book your private night tour today and discover Nepal after dark!
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NightTourPage;
