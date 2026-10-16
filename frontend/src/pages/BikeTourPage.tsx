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
  Activity,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../contexts/CurrencyContext';
import { useGoBack } from '../utils/backNavigation';

const bikeLocals = [
  {
    name: 'Pema',
    title: 'The Pokhara Cycling Guide',
    reviews: 214,
    languages: 'English・Nepali',
  },
  { name: 'Lhakpa', title: 'The Kathmandu Valley Cyclist', reviews: 178, languages: 'English・Nepali' },
  { name: 'Tashi', title: 'The Bhaktapur Activity Explorer', reviews: 163, languages: 'English・Nepali' },
  { name: 'Mingma', title: 'The Hillside Ride Leader', reviews: 156, languages: 'English・Nepali' },
  { name: 'Pasang', title: 'The Riverside Cycling Guide', reviews: 142, languages: 'English・Nepali' },
  { name: 'Ang', title: 'The Lakeside Activity Host', reviews: 139, languages: 'English・Nepali' },
  { name: 'Nima', title: 'The Cultural Cycling Guide', reviews: 127, languages: 'English・Nepali' },
  {
    name: 'Tenzin',
    title: 'The Mountain Activity Specialist',
    reviews: 118,
    languages: 'English・French・Nepali',
  },
];

export const bikeTours = [
  {
    id: 801,
    title: 'Pokhara Lakeside Activity Ride',
    rating: 4.9,
    reviews: 342,
    type: 'Activity Tour',
    duration: '3 hours',
    price: 32,
    image:
      'https://images.unsplash.com/photo-1533245707348-571b8e16f54b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    locals: ['Pema', 'Ang'],
    slug: 'pokhara-lakeside-bike-ride',
  },
  {
    id: 802,
    title: 'Kathmandu Valley Cycling Tour',
    rating: 4.8,
    reviews: 219,
    type: 'Activity Tour',
    duration: '4 hours',
    price: 38,
    image:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    locals: ['Lhakpa', 'Nima'],
    slug: 'kathmandu-valley-cycling-tour',
  },
  {
    id: 803,
    title: 'Bhaktapur Heritage Activity Tour',
    rating: 4.7,
    reviews: 184,
    type: 'Activity Tour',
    duration: '3 hours',
    price: 35,
    image:
      'https://images.unsplash.com/photo-1533107812167-e1e2f52b9867?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    locals: ['Tashi', 'Pasang'],
    slug: 'bhaktapur-heritage-bike-tour',
  },
  {
    id: 804,
    title: 'Nagarkot Hill Cycling Tour',
    rating: 4.9,
    reviews: 156,
    type: 'Activity Tour',
    duration: '5 hours',
    price: 45,
    image:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    locals: ['Mingma', 'Tenzin'],
    slug: 'nagarkot-hill-cycling-tour',
  },
];

export const ActivityTourPage: React.FC = () => {
  const navigate = useNavigate();
  const goBack = useGoBack();
  const { formatPrice } = useCurrency();
  const [showAllLocals, setShowAllLocals] = useState(false);
  const displayedLocals = showAllLocals ? bikeLocals : bikeLocals.slice(0, 5);
  const displayedTours = bikeTours.slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white">
      <Header />

      <div className="relative pt-4 pb-16 overflow-hidden bg-[#E0F2FE]">
        <div className="container mx-auto px-4 relative z-10">
          <button
            onClick={goBack}
            className="flex items-center gap-2 text-gray-600 hover:text-[#213448] font-bold mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <div className="relative rounded-2xl overflow-hidden shadow-lg group cursor-pointer mb-12">
            <img
              src="https://images.unsplash.com/photo-1533245707348-571b8e16f54b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
              alt="Activity tours in Nepal"
              className="w-full h-[500px] object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <button className="w-20 h-20 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white group-hover:bg-white/50 transition-colors">
                <Activity className="w-10 h-10 fill-current" />
              </button>
            </div>
            <div className="absolute bottom-8 left-8 text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-2">Activity Tours in Nepal</h1>
              <p className="text-xl">
                Explore valleys, lakesides, and heritage roads on two wheels with local guides.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="w-full md:w-1/2 space-y-6">
              <h1 className="text-2xl md:text-4xl font-bold text-gray-900 leading-tight">
                Explore Nepal by bike <br className="hidden md:block" />
                <span className="text-[#213448]">with our locals</span>
              </h1>

              <p className="text-xl text-gray-600 max-w-lg leading-relaxed">
                Ride quiet roads through Pokhara lakeside, Kathmandu valley villages, Bhaktapur
                heritage lanes, and Nagarkot hills with a local cyclist who knows the best routes.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <button
                  className="px-8 py-3.5 bg-brand-yellow hover:bg-[#E5A800] text-slate-900 font-bold rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  Find your local
                </button>
              </div>
            </div>

            <div className="w-full md:w-1/2 relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4 translate-y-8">
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-lg">
                    <img
                      src="https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
                      alt="Activity Guide"
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-lg bg-[#FFF0E6] p-4 flex items-center justify-center text-center">
                    <div>
                      <div className="text-3xl font-bold text-[#213448] mb-1">20+</div>
                      <div className="text-gray-600 font-medium">Activity Guides</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-lg">
                    <img
                      src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
                      alt="Activity Ride"
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-lg rounded-bl-[4rem]">
                    <img
                      src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
                      alt="Cycling Guide"
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white py-16 text-center border-b border-gray-100">
        <h2 className="text-3xl md:text-4xl font-bold text-[#213448] leading-tight font-sans tracking-tight">
          Real Rides. Real Stories.
          <br />
          Really Good Travel.
        </h2>
      </div>

      <main className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20 text-center">
          <div className="flex flex-col items-center group">
            <div className="w-20 h-20 rounded-full bg-[#E0F2FE] flex items-center justify-center text-[#213448] mb-6 group-hover:scale-110 transition-transform duration-300">
              <Activity className="w-10 h-10" />
            </div>
            <h3 className="font-bold text-xl mb-3 text-gray-900">Real Rides. Real Stories.</h3>
            <p className="text-gray-500 max-w-xs">Really Good Travel.</p>
          </div>
          <div className="flex flex-col items-center group">
            <div className="w-20 h-20 rounded-full bg-[#E0F2FE] flex items-center justify-center text-[#213448] mb-6 group-hover:scale-110 transition-transform duration-300">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <h3 className="font-bold text-xl mb-3 text-gray-900">Feel like a local, not a tourist</h3>
            <p className="text-gray-500 max-w-xs">
              Always private. It's just you and your local host on the road.
            </p>
          </div>
          <div className="flex flex-col items-center group">
            <div className="w-20 h-20 rounded-full bg-[#E0F2FE] flex items-center justify-center text-[#213448] mb-6 group-hover:scale-110 transition-transform duration-300">
              <Check className="w-10 h-10" />
            </div>
            <h3 className="font-bold text-xl mb-3 text-gray-900">More you, less checklist</h3>
            <p className="text-gray-500 max-w-xs">
              Let your local host tailor the bike route completely to your wishes.
            </p>
          </div>
        </div>

        <div className="mb-24">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h3 className="text-[#213448] font-bold uppercase tracking-wider text-sm mb-2">
                Don't miss out
              </h3>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Top Rated Activity Experiences
              </h2>
            </div>
            <button
              onClick={() => navigate('/search?q=bike+tours')}
              className="hidden md:flex items-center text-[#213448] font-bold hover:underline"
            >
              View all experiences <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {bikeTours.slice(0, 2).map((tour) => (
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

        <div className="full-width bg-[#E0F2FE] -mx-4 md:-mx-[max(1rem,calc((100vw-80rem)/2))] px-4 md:px-[max(1rem,calc((100vw-80rem)/2))] py-20 mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Travelers love our bike guides</h2>
            <p className="text-gray-600">Reviews from guests about our bike tours and locals</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {[
              {
                name: 'Sarah',
                review:
                  'Pema led us on a stunning lakeside bike ride around Phewa Lake. The views and quiet roads were perfect.',
                host: 'Pema',
                date: 'Pokhara, February 2, 2026',
              },
              {
                name: 'Michael',
                review:
                  "Lhakpa showed us Kathmandu's valley villages by bike. Safe, fun, and full of local stories.",
                host: 'Lhakpa',
                date: 'Kathmandu, January 30, 2026',
              },
              {
                name: 'Emma',
                review:
                  "Tashi's Bhaktapur heritage bike tour was a highlight — ancient lanes best seen on two wheels.",
                host: 'Tashi',
                date: 'Bhaktapur, January 27, 2026',
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

        <div className="mb-24" id="locals-section">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Explore Nepal by bike with our <span className="text-[#213448]">incredible locals</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Learn about their personal stories and find out how you can explore Nepal on two
              wheels with locals who know the roads best.
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

        <div className="full-width bg-[#E0F2FE] -mx-4 md:-mx-[max(1rem,calc((100vw-80rem)/2))] px-4 md:px-[max(1rem,calc((100vw-80rem)/2))] py-20 mb-24">
          <div className="text-center mb-12">
            <span className="text-[#213448] font-bold uppercase tracking-wider text-sm block mb-2">
              Experiences
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Activity adventures in Nepal
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
              onClick={() => navigate('/search?q=bike+tours')}
              className="bg-transparent border border-[#213448] text-[#213448] hover:bg-brand-yellow hover:border-brand-yellow hover:text-slate-900 rounded-full px-8 py-3 font-bold transition-all"
            >
              Explore more
            </Button>
          </div>
        </div>

        <div className="mb-24">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-[#213448] mb-2">Find bike experiences by category</h2>
          </div>

          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            {[
              'Lakeside Activity Tour',
              'Valley Cycling Tour',
              'Heritage Activity Tour',
              'Hill Cycling Tour',
              'Mountain Activity Tour',
              'City Activity Ride',
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

        <div className="mb-24 pt-16 border-t border-gray-100">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-[#213448]">
              Why do Guides Nepal bike hosts love what they do?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {[
              {
                title: 'Local bike experts',
                desc: 'Our hosts know the best cycling roads.',
                icon: <Activity className="w-8 h-8" />,
              },
              {
                title: 'Safe rides',
                desc: 'Private, guided bike experiences.',
                icon: <ShieldCheck className="w-8 h-8" />,
              },
              {
                title: 'Hidden routes',
                desc: 'Quiet lanes few tourists ride.',
                icon: <Star className="w-8 h-8" />,
              },
              {
                title: 'Flexible schedule',
                desc: 'Tours that fit your time.',
                icon: <Clock className="w-8 h-8" />,
              },
              {
                title: 'Local stories',
                desc: 'Tales from the road in Nepal.',
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

        <div className="mb-24 text-center max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-[#213448] mb-6">
            Best bike experiences in Nepal
          </h2>
          <div className="space-y-6 text-gray-600 leading-relaxed text-sm md:text-base">
            <p>
              Nepal is beautiful on two wheels. From Pokhara's peaceful lakeside roads to Kathmandu
              Valley's village lanes and Nagarkot's hill climbs, cycling reveals a side of Nepal
              most visitors miss.
            </p>
            <p>
              Start with a{' '}
              <strong className="text-gray-900">lakeside bike ride around Phewa Lake</strong>,
              where flat roads and mountain views make for a relaxed, scenic experience.
            </p>
            <p>
              For culture lovers,{' '}
              <strong className="text-gray-900">Bhaktapur heritage bike tour</strong> takes you
              through ancient squares and pottery lanes best explored at cycling pace.
            </p>
            <p>
              Adventure riders can enjoy{' '}
              <strong className="text-gray-900">Kathmandu Valley cycling</strong>,{' '}
              <strong className="text-gray-900">Nagarkot hill cycling</strong>, or a full-day
              ride through the countryside with a local guide.
            </p>
            <p>
              No matter which bike experience you choose, exploring Nepal with a local cycling
              guide ensures safety, great routes, and access to quiet spots off the beaten path.
              Book your private bike tour today and discover Nepal on two wheels!
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ActivityTourPage;
