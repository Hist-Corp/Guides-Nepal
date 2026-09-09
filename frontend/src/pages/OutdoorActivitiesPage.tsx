import React, { useState } from 'react';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { Button } from '../components/common/Button';
import { Star, Users, Heart, ShieldCheck, Check, Clock, ChevronRight, Play, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const outdoorLocals = [
  { name: "Tenzin", title: "The Mountain Guide", reviews: 342, languages: "English・Nepali・Sherpa" },
  { name: "Pema", title: "The Adventure Expert", reviews: 287, languages: "English・Nepali" },
  { name: "Dorje", title: "The Jungle Explorer", reviews: 198, languages: "English・Nepali" },
  { name: "Lhakpa", title: "The Trekking Specialist", reviews: 445, languages: "English・French・Nepali" },
  { name: "Mingma", title: "The Rock Climbing Pro", reviews: 156, languages: "English・Nepali" },
  { name: "Pasang", title: "The River Guide", reviews: 203, languages: "English・Nepali" },
  { name: "Ang", title: "The Paragliding Pilot", reviews: 178, languages: "English・Nepali" },
  { name: "Nima", title: "The Wildlife Expert", reviews: 321, languages: "English・Nepali" },
  { name: "Tashi", title: "The Eco-Tourism Guide", reviews: 267, languages: "English・German・Nepali" }
];

const outdoorActivities = [
  {
    id: 1,
    title: "Everest Base Camp Trek",
    rating: 5,
    reviews: 1273,
    type: "Trekking",
    duration: "12 days",
    price: 899,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
    locals: ["Tenzin", "Lhakpa", "Pema"],
    slug: "everest-base-camp-trek"
  },
  {
    id: 2,
    title: "Annapurna Circuit Trek",
    rating: 4.9,
    reviews: 892,
    type: "Trekking",
    duration: "14 days",
    price: 749,
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
    locals: ["Pema", "Mingma"],
    slug: "annapurna-circuit-trek"
  },
  {
    id: 3,
    title: "Chitwan Jungle Safari",
    rating: 4.8,
    reviews: 634,
    type: "Wildlife Safari",
    duration: "3 days",
    price: 299,
    image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
    locals: ["Dorje", "Nima"],
    slug: "chitwan-jungle-safari"
  },
  {
    id: 4,
    title: "Pokhara Paragliding Adventure",
    rating: 4.9,
    reviews: 445,
    type: "Adventure Sports",
    duration: "1 day",
    price: 149,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
    locals: ["Ang", "Tashi"],
    slug: "pokhara-paragliding"
  },
  {
    id: 5,
    title: "Trishuli River Rafting",
    rating: 4.7,
    reviews: 378,
    type: "Water Sports",
    duration: "1 day",
    price: 89,
    image: "https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
    locals: ["Pasang", "Tashi"],
    slug: "trishuli-river-rafting"
  },
  {
    id: 6,
    title: "Nagarkot Sunrise Hiking",
    rating: 4.6,
    reviews: 289,
    type: "Hiking",
    duration: "1 day",
    price: 59,
    image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
    locals: ["Mingma", "Pema"],
    slug: "nagarkot-sunrise-hiking"
  }
];

export const OutdoorActivitiesPage: React.FC = () => {
  const navigate = useNavigate();
  const [showAllLocals, setShowAllLocals] = useState(false);
  const displayedLocals = showAllLocals ? outdoorLocals : outdoorLocals.slice(0, 5);
  const displayedActivities = outdoorActivities.slice(0, 6);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white">
      <Header />
      
      {/* Hero Section with Video */}
      <div className="relative pt-4 pb-16 overflow-hidden bg-[#E0F2FE]">
        <div className="container mx-auto px-4 relative z-10">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-gray-600 hover:text-[#213448] font-bold mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          
          {/* Video Section as Hero */}
          <div className="relative rounded-2xl overflow-hidden shadow-lg group cursor-pointer mb-12">
            <img 
              src="https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80" 
              alt="Mountain Trekking in Nepal" 
              className="w-full h-[500px] object-cover transition-transform duration-500 group-hover:scale-105" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <button className="w-20 h-20 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white group-hover:bg-white/50 transition-colors">
                <Play className="w-10 h-10 fill-current" />
              </button>
            </div>
            <div className="absolute bottom-8 left-8 text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-2">Adventure Awaits in Nepal</h1>
              <p className="text-xl">From mountain peaks to jungle valleys, discover Nepal's natural wonders.</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-12">
            {/* Left Content */}
            <div className="w-full md:w-1/2 space-y-6">
              <h1 className="text-2xl md:text-4xl font-bold text-gray-900 leading-tight">
                Explore the great outdoors of <br className="hidden md:block" />
                <span className="text-[#213448]">Nepal</span> with our locals
              </h1>
              
              <p className="text-xl text-gray-600 max-w-lg leading-relaxed">
                Skip the tourist traps and get the authentic outdoor experience. 
                Explore mountains, jungles, and rivers with a friendly guide who shows you 
                the hidden gems & main highlights.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <button 
                  onClick={() => document.getElementById('locals-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-3.5 bg-brand-yellow hover:bg-[#E5A800] text-slate-900 font-bold rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
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
                      src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80" 
                      alt="Mountain Guide"
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-lg bg-[#FFF0E6] p-4 flex items-center justify-center text-center">
                    <div>
                      <div className="text-3xl font-bold text-[#213448] mb-1">30+</div>
                      <div className="text-gray-600 font-medium">Adventure Guides</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-lg">
                    <img 
                      src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80" 
                      alt="Jungle Safari"
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-lg rounded-bl-[4rem]">
                    <img 
                      src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80" 
                      alt="Adventure Guide"
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
            Real People. Real Stories.<br />
            Really Good Travel.
         </h2>
      </div>

      <main className="container mx-auto px-4 py-16 max-w-7xl">
        
        {/* Value Props */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20 text-center">
          <div className="flex flex-col items-center group">
             <div className="w-20 h-20 rounded-full bg-[#E0F2FE] flex items-center justify-center text-[#213448] mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-10 h-10" />
             </div>
             <h3 className="font-bold text-xl mb-3 text-gray-900">Real People. Real Stories.</h3>
             <p className="text-gray-500 max-w-xs">Really Good Travel.</p>
          </div>
          <div className="flex flex-col items-center group">
             <div className="w-20 h-20 rounded-full bg-[#E0F2FE] flex items-center justify-center text-[#213448] mb-6 group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck className="w-10 h-10" />
             </div>
             <h3 className="font-bold text-xl mb-3 text-gray-900">Feel like a local, not a tourist</h3>
             <p className="text-gray-500 max-w-xs">Always private. It's just you and your local host. No strangers, no groups.</p>
          </div>
          <div className="flex flex-col items-center group">
             <div className="w-20 h-20 rounded-full bg-[#E0F2FE] flex items-center justify-center text-[#213448] mb-6 group-hover:scale-110 transition-transform duration-300">
                <Check className="w-10 h-10" />
             </div>
             <h3 className="font-bold text-xl mb-3 text-gray-900">More you, less checklist</h3>
             <p className="text-gray-500 max-w-xs">Let your local host tailor the experience completely to your wishes.</p>
          </div>
        </div>

        {/* Featured Section (2 Large Cards) */}
        <div className="mb-24">
           <div className="flex items-end justify-between mb-8">
              <div>
                 <h3 className="text-[#213448] font-bold uppercase tracking-wider text-sm mb-2">Don't miss out</h3>
                 <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Top Rated Outdoor Adventures</h2>
              </div>
              <button 
                onClick={() => navigate('/search?q=outdoor+adventures')}
                className="hidden md:flex items-center text-[#213448] font-bold hover:underline"
              >
                 View all experiences <ChevronRight className="w-5 h-5" />
              </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {outdoorActivities.slice(0, 2).map((activity) => (
                 <div 
                   key={activity.id} 
                   className="group relative rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300"
                   onClick={() => {
                      navigate(`/experience/${activity.slug}`);
                      window.scrollTo({ top: 0, behavior: 'instant' });
                   }}
                 >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>
                    <img src={activity.image} alt={activity.title} className="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-500" />
                    
                    <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-1 text-xs font-bold text-gray-900">
                       <Star className="w-3 h-3 fill-brand-yellow text-brand-yellow" />
                       {activity.rating} ({activity.reviews})
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-8 z-20 text-white">
                       <h3 className="text-2xl font-bold mb-2 leading-tight">{activity.title}</h3>
                       <div className="flex items-center gap-4 text-sm font-medium text-white/90 mb-6">
                          <span>{activity.type}</span>
                          <span>•</span>
                          <span>{activity.duration}</span>
                       </div>
                       
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <div className="flex -space-x-3">
                                <img src={`https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&h=100&q=80`} className="w-10 h-10 rounded-full border-2 border-white object-cover" />
                                <div className="w-10 h-10 rounded-full border-2 border-white bg-white/20 backdrop-blur-md flex items-center justify-center text-xs font-bold">+12</div>
                             </div>
                             <span className="text-sm font-bold">Choose your local</span>
                          </div>
                          <div className="text-right">
                             <div className="text-xs opacity-80">From</div>
                             <div className="text-xl font-bold">€{activity.price}</div>
                          </div>
                       </div>
                    </div>
                 </div>
              ))}
           </div>
        </div>

        {/* Reviews Section (Light Blue Background) */}
        <div className="full-width bg-[#E0F2FE] -mx-4 md:-mx-[max(1rem,calc((100vw-80rem)/2))] px-4 md:px-[max(1rem,calc((100vw-80rem)/2))] py-20 mb-24">
           <div className="text-center mb-12">
             <h2 className="text-3xl font-bold text-gray-900 mb-4">Travelers love our locals</h2>
             <p className="text-gray-600">Reviews from guests about our tours and locals</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {[
                { 
                  name: "Sarah", 
                  review: "Tenzin was an incredible guide for our Everest Base Camp trek. His knowledge of the mountains and local culture made the journey unforgettable. Highly recommended!", 
                  host: "Tenzin",
                  date: "Kathmandu, January 21, 2026"
                },
                { 
                  name: "Michael", 
                  review: "Pema took us on an amazing Annapurna Circuit trek. The views were spectacular and Pema's expertise ensured we had a safe and enjoyable experience.", 
                  host: "Pema",
                  date: "Pokhara, January 20, 2026"
                },
                { 
                  name: "Emma", 
                  review: "Dorje's jungle safari in Chitwan was incredible! We saw rhinos, tigers, and so many birds. His passion for wildlife conservation was inspiring.", 
                  host: "Dorje",
                  date: "Chitwan, January 18, 2026"
                }
              ].map((review, i) => (
                <div key={i} className="bg-white p-8 rounded-3xl shadow-sm relative">
                   <div className="flex gap-1 mb-6">
                     {[1,2,3,4,5].map(s => <Star key={s} className="w-5 h-5 fill-brand-yellow text-brand-yellow" />)}
                   </div>
                   <p className="text-gray-800 font-medium italic mb-8 leading-relaxed">"{review.review}"</p>
                   <div className="flex items-center gap-4 mt-auto">
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">
                         {review.name[0]}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{review.name}</div>
                        <div className="text-xs text-[#213448] font-bold uppercase">About local {review.host}</div>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Locals Grid */}
        <div className="mb-24" id="locals-section">
           <div className="text-center mb-16">
             <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Explore Nepal with our <span className="text-[#213448]">incredible locals</span></h2>
             <p className="text-gray-600 max-w-2xl mx-auto">Learn about their personal stories and find out how you can explore Nepal with locals who know the outdoors best.</p>
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
                    <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-[#213448] transition-colors">{local.name}</h3>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2 text-center line-clamp-1 px-2">{local.title}</p>
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
               {showAllLocals ? "See less" : "Show more locals"}
             </Button>
           </div>
        </div>

        {/* Things to do Grid */}
        <div className="full-width bg-[#E0F2FE] -mx-4 md:-mx-[max(1rem,calc((100vw-80rem)/2))] px-4 md:px-[max(1rem,calc((100vw-80rem)/2))] py-20 mb-24">
          <div className="text-center mb-12">
             <span className="text-[#213448] font-bold uppercase tracking-wider text-sm block mb-2">Experiences</span>
             <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Outdoor adventures in Nepal</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {displayedActivities.map((activity) => (
              <div 
                key={activity.id} 
                className="flex flex-col border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 bg-white group cursor-pointer"
                onClick={() => {
                  navigate(`/experience/${activity.slug}`);
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
              >
                <div className="relative h-48 aspect-[4/3] overflow-hidden">
                  <img src={activity.image} alt={activity.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide text-gray-800">
                    {activity.type}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                    <Star className="w-3 h-3 fill-brand-yellow text-brand-yellow" />
                    {activity.rating}
                  </div>
                </div>
                
                <div className="flex-1 p-5 flex flex-col">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 leading-snug line-clamp-2 group-hover:text-[#213448] transition-colors">
                    {activity.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                     <Clock className="w-3 h-3" />
                     <span>{activity.duration}</span>
                     <span>•</span>
                     <span>{activity.reviews} reviews</span>
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                     <div className="flex -space-x-2">
                        {activity.locals.map((l, i) => (
                          <img key={i} src={`https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=80&h=80&q=80`} className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                        ))}
                     </div>
                     <div className="text-right">
                        <div className="text-[10px] text-gray-400 uppercase">From</div>
                        <div className="text-lg font-bold text-gray-900">€{Math.floor(activity.price)}</div>
                     </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
             <Button 
                onClick={() => navigate('/search?q=outdoor+adventures')}
                className="bg-transparent border border-[#213448] text-[#213448] hover:bg-brand-yellow hover:border-brand-yellow hover:text-slate-900 rounded-full px-8 py-3 font-bold transition-all"
             >
                Explore more
             </Button>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-24">
           <div className="text-center mb-10">
             <h2 className="text-2xl font-bold text-[#213448] mb-2">Find experiences by category</h2>
           </div>
           
           <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
              {[
                "Trekking", "Mountain biking", "Jungle safari", "Paragliding", 
                "River rafting", "Rock climbing", "Bird watching", "Camping", "Eco tours"
              ].map((cat, i) => (
                 <div key={i} className="px-5 py-2.5 rounded-full border border-gray-200 hover:border-[#213448] hover:bg-[#213448] hover:text-white cursor-pointer transition-all bg-white text-gray-600 font-medium text-sm">
                    {cat}
                 </div>
              ))}
           </div>
        </div>

        {/* Why Guides Nepal Icons Grid (Bottom) */}
        <div className="mb-24 pt-16 border-t border-gray-100">
           <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-[#213448]">Why do Guides Nepal hosts love what they do?</h2>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              {[
                 { title: "A fair income", desc: "Our hosts set their own price.", icon: <ShieldCheck className="w-8 h-8" /> },
                 { title: "Passion for nature", desc: "Sharing their love for the outdoors.", icon: <Heart className="w-8 h-8" /> },
                 { title: "Eco-friendly", desc: "Low impact, high connection.", icon: <Users className="w-8 h-8" /> },
                 { title: "Unique skills", desc: "From mountain guides to wildlife experts.", icon: <Star className="w-8 h-8" /> },
                 { title: "Flexible schedule", desc: "Tours that fit your time.", icon: <Clock className="w-8 h-8" /> },
                 { title: "Global community", desc: "Connecting the world.", icon: <Users className="w-8 h-8" /> }
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
           <h2 className="text-2xl font-bold text-[#213448] mb-6">Best outdoor adventures in Nepal</h2>
           <div className="space-y-6 text-gray-600 leading-relaxed text-sm md:text-base">
              <p>
                 Nepal is an outdoor enthusiast's paradise! From the towering peaks of the Himalayas to the lush jungles of the Terai, this country offers endless opportunities for adventure and exploration. Whether you're seeking high-altitude trekking, wildlife encounters, or adrenaline-pumping sports, Nepal has it all.
              </p>
              <p>
                 Start your outdoor adventure with <strong className="text-gray-900">trekking in the Himalayas</strong>. The <strong className="text-gray-900">Everest Base Camp</strong> and <strong className="text-gray-900">Annapurna Circuit</strong> are world-famous routes that offer breathtaking mountain views and cultural experiences with local communities.
              </p>
              <p>
                 For wildlife lovers, <strong className="text-gray-900">Chitwan National Park</strong> provides incredible safari experiences. Spot endangered one-horned rhinos, Bengal tigers, and hundreds of bird species while learning about conservation efforts from local guides.
              </p>
              <p>
                 Adventure seekers can enjoy <strong className="text-gray-900">paragliding in Pokhara</strong>, <strong className="text-gray-900">white-water rafting</strong> on Himalayan rivers, or <strong className="text-gray-900">rock climbing</strong> in the Kathmandu Valley. Each activity offers unique perspectives of Nepal's diverse landscapes.
              </p>
              <p>
                 No matter what outdoor activity you choose, experiencing Nepal with a local guide ensures safety, cultural insights, and access to hidden gems off the beaten path. Book your private outdoor adventure today and discover the natural wonders of Nepal!
              </p>
           </div>
        </div>

      </main>
      <Footer />
    </div>
  );
};

export default OutdoorActivitiesPage;
