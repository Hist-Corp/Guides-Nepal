import React, { useState } from 'react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { Button } from '../../components/common/Button';
import { Star, Users, Heart, ShieldCheck, Check, Clock, ChevronRight, Play, ArrowLeft } from 'lucide-react';
import { kathmanduTours } from '../../data/kathmanduTours';
import { useNavigate } from 'react-router-dom';

const kathmanduLocals = [
  { name: "Artty", title: "The Lovely Storyteller", reviews: 814, languages: "English・Nepali" },
  { name: "Chef Jekky", title: "Chef Jekky and The Team", reviews: 195, languages: "English・French・Nepali" },
  { name: "Wasana", title: "The Food Maniac & Nepali Cooking Class", reviews: 199, languages: "English・Nepali" },
  { name: "Sammy", title: "The Good Mood Ambassador", reviews: 210, languages: "English" },
  { name: "Araya", title: "The Culinary and Culture Admirer", reviews: 420, languages: "English・French・Nepali" },
  { name: "Apicha", title: "The local food expert", reviews: 54, languages: "English・Nepali" },
  { name: "Zarut", title: "Recommended local insider", reviews: 115, languages: "English・Nepali" },
  { name: "Tuangtip", title: "The Food Magician", reviews: 933, languages: "English・Nepali" },
  { name: "Jojo", title: "The Nature Lover", reviews: 57, languages: "English" },
  { name: "Kung", title: "The Easygoing Local", reviews: 39, languages: "English・Nepali" }
];

export const KathmanduPage: React.FC = () => {
  const navigate = useNavigate();
  const [showAllLocals, setShowAllLocals] = useState(false);
  const displayedLocals = showAllLocals ? kathmanduLocals : kathmanduLocals.slice(0, 5);
  const displayedTours = kathmanduTours.slice(0, 6);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white">
      <Header />
      
      {/* Hero Section */}
      <div className="relative pt-4 pb-16 overflow-hidden bg-[#FFF0E6]">
        <div className="container mx-auto px-4 relative z-10">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-gray-600 hover:text-[#213448] font-bold mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <div className="flex flex-col md:flex-row items-center gap-12">
            {/* Left Content */}
            <div className="w-full md:w-1/2 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-600 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-brand-yellow animate-pulse"></span>
                100% private & flexible
              </div>
              
              <h1 className="text-2xl md:text-4xl font-bold text-gray-900 leading-tight">
                Experience the best of <br className="hidden md:block" />
                <span className="text-[#213448]">Kathmandu</span> with our locals
              </h1>
              
              <p className="text-xl text-gray-600 max-w-lg leading-relaxed">
                Skip the tourist traps and get the local experience. 
                Explore the city with a friendly guide who shows you 
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

            {/* Right Content - Image Collage */}
            <div className="w-full md:w-1/2 relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4 translate-y-8">
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-lg">
                    <img 
                      src="https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&w=400&q=80" 
                      alt="Kathmandu Temple"
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-lg bg-[#E0F2FE] p-4 flex items-center justify-center text-center">
                    <div>
                      <div className="text-3xl font-bold text-[#213448] mb-1">50+</div>
                      <div className="text-gray-600 font-medium">Local Hosts</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-lg">
                    <img 
                      src="https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=400&q=80" 
                      alt="Food Tour"
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-lg rounded-bl-[4rem]">
                    <img 
                      src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=400&q=80" 
                      alt="Local Guide"
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
             <div className="w-20 h-20 rounded-full bg-[#FFF0E6] flex items-center justify-center text-[#213448] mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-10 h-10" />
             </div>
             <h3 className="font-bold text-xl mb-3 text-gray-900">Real People. Real Stories.</h3>
             <p className="text-gray-500 max-w-xs">Really Good Travel.</p>
          </div>
          <div className="flex flex-col items-center group">
             <div className="w-20 h-20 rounded-full bg-[#FFF0E6] flex items-center justify-center text-[#213448] mb-6 group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck className="w-10 h-10" />
             </div>
             <h3 className="font-bold text-xl mb-3 text-gray-900">Feel like a local, not a tourist</h3>
             <p className="text-gray-500 max-w-xs">Always private. It's just you and your local host. No strangers, no groups.</p>
          </div>
          <div className="flex flex-col items-center group">
             <div className="w-20 h-20 rounded-full bg-[#FFF0E6] flex items-center justify-center text-[#213448] mb-6 group-hover:scale-110 transition-transform duration-300">
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
                 <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Top Rated in Kathmandu</h2>
              </div>
              <button 
                onClick={() => navigate('/city/kathmandu/experiences')}
                className="hidden md:flex items-center text-[#213448] font-bold hover:underline"
              >
                 View all experiences <ChevronRight className="w-5 h-5" />
              </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {kathmanduTours.slice(0, 2).map((tour) => (
                 <div 
                   key={tour.id} 
                   className="group relative rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300"
                   onClick={() => {
                      navigate(`/city/kathmandu/experience/${tour.slug}`);
                      window.scrollTo({ top: 0, behavior: 'instant' });
                   }}
                 >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>
                    <img src={tour.image} alt={tour.title} className="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-500" />
                    
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
                                <img src={`https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80`} className="w-10 h-10 rounded-full border-2 border-white object-cover" />
                                <div className="w-10 h-10 rounded-full border-2 border-white bg-white/20 backdrop-blur-md flex items-center justify-center text-xs font-bold">+12</div>
                             </div>
                             <span className="text-sm font-bold">Choose your local</span>
                          </div>
                          <div className="text-right">
                             <div className="text-xs opacity-80">From</div>
                             <div className="text-xl font-bold">€{tour.price}</div>
                          </div>
                       </div>
                    </div>
                 </div>
              ))}
           </div>
        </div>

        {/* Reviews Section (Pink Background) */}
        <div className="full-width bg-[#FFF0E6] -mx-4 md:-mx-[max(1rem,calc((100vw-80rem)/2))] px-4 md:px-[max(1rem,calc((100vw-80rem)/2))] py-20 mb-24">
           <div className="text-center mb-12">
             <h2 className="text-3xl font-bold text-gray-900 mb-4">Travelers love our locals</h2>
             <p className="text-gray-600">Reviews from guests about our tours and locals</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {[
                { 
                  name: "Racquel", 
                  review: "Highly enthusiastic sharing Nepali culture, great food selections where locals eat, very kind, and our family sure enjoyed her company! Thank you Araya♥️", 
                  host: "Araya",
                  date: "Kathmandu, January 21, 2026"
                },
                { 
                  name: "Bartek", 
                  review: "Araya was wonderful and clearly knew what she was talking about. She created a personalised tour and all the food places she picked were delicious.", 
                  host: "Araya",
                  date: "Kathmandu, January 21, 2026"
                },
                { 
                  name: "Sammy", 
                  review: "Sammy gave us a Great Tour through some hotspots of Kathmandu. He was very flexible and listened to us attentively. The answers to questions were always elaborate.", 
                  host: "Sammy",
                  date: "Kathmandu, January 18, 2026"
                }
              ].map((review, i) => (
                <div key={i} className="bg-white p-8 rounded-3xl shadow-sm relative">
                   {/* Speech bubble tail could go here */}
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
             <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Explore Kathmandu with our <span className="text-[#213448]">incredible locals</span></h2>
             <p className="text-gray-600 max-w-2xl mx-auto">Learn about their personal stories and find out how you can explore Kathmandu with locals who know the city best.</p>
           </div>
           
           <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
              {displayedLocals.map((local, i) => (
                 <div 
                   key={i} 
                   className="flex flex-col items-center group cursor-pointer"
                   onClick={() => {
                     // Demo: Cycle through the 4 rich profiles we have
                     const demoId = (i % 4) + 1;
                     navigate(`/local/${demoId}`);
                     window.scrollTo({ top: 0, behavior: 'instant' });
                   }}
                 >
                    <div className="relative w-32 h-32 mb-4">
                       <img 
                         src={`https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&q=80`} 
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
             <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Things to do in Kathmandu</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {displayedTours.map((tour) => (
              <div 
                key={tour.id} 
                className="flex flex-col border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 bg-white group cursor-pointer"
                onClick={() => {
                  navigate(`/city/kathmandu/experience/${tour.slug}`);
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
              >
                <div className="relative h-48 aspect-[4/3] overflow-hidden">
                  <img src={tour.image} alt={tour.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
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
                           <img key={i} src={`https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80`} className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                        ))}
                     </div>
                     <div className="text-right">
                        <div className="text-[10px] text-gray-400 uppercase">From</div>
                        <div className="text-lg font-bold text-gray-900">€{Math.floor(tour.price)}</div>
                     </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
             <Button 
                onClick={() => navigate('/city/kathmandu/experiences')}
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
                "City highlights tours", "Day trips", "Food tours", "Off the beaten track tours", 
                "Art & Culture tours", "Workshops", "Night tours", "Food & Drink tastings", "Home dinners"
              ].map((cat, i) => (
                 <div key={i} className="px-5 py-2.5 rounded-full border border-gray-200 hover:border-[#213448] hover:bg-[#213448] hover:text-white cursor-pointer transition-all bg-white text-gray-600 font-medium text-sm">
                    {cat}
                 </div>
              ))}
           </div>
        </div>

        {/* SEO / Articles Section */}
        <div className="mb-24">
           <div className="relative h-[400px] rounded-3xl overflow-hidden mb-16 group cursor-pointer">
              <img src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=400&q=80" className="w-full h-full object-cover brightness-[0.6] group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 flex flex-col justify-center p-8 md:p-16">
                 <div className="bg-[#213448] w-16 h-1 mb-6"></div>
                 <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 max-w-2xl leading-tight">
                    Top 10 things to do in <br/> Kathmandu
                 </h2>
                 <div className="flex items-center gap-3 text-white font-bold">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                       <Play className="w-5 h-5 fill-white" />
                    </div>
                    <span>Watch video</span>
                 </div>
              </div>
              <div className="absolute bottom-8 right-8 text-white font-bold text-xl tracking-widest">
                 Guides Nepal
              </div>
           </div>

           <div className="space-y-24">
              {/* Article 1: Cycle */}
              <div className="flex flex-col md:flex-row gap-12 items-center">
                 <div className="md:w-1/2">
                    <img src="https://images.unsplash.com/photo-1605640840605-14ac1855827b?auto=format&fit=crop&w=400&q=80" className="rounded-3xl shadow-xl w-full aspect-[4/3] object-cover" />
                 </div>
                 <div className="md:w-1/2">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Cycle on the off roads</h3>
                    <p className="text-gray-600 leading-relaxed mb-6">
                       A private cycling tour in Kathmandu is the easiest and most exciting way to see the off roads of the valley. It's super fun, energizing and gives you the chance to see lots of awesome places. Most tourists cycle around Thamel every weekend, but only try the main roads.
                    </p>
                    <p className="text-gray-600 leading-relaxed">
                       Choose one of our local hosts, who can truly give you an experience worth remembering. They'll show you around and tell you more about the sites you're visiting. You'll hear tons about the local lifestyle!
                    </p>
                 </div>
              </div>

              {/* Article 2: Dine */}
              <div className="flex flex-col md:flex-row-reverse gap-12 items-center">
                 <div className="md:w-1/2">
                    <img src="https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=400&q=80" className="rounded-3xl shadow-xl w-full" />
                 </div>
                 <div className="md:w-1/2">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Dine with enthusiastic locals</h3>
                    <p className="text-gray-600 leading-relaxed mb-6">
                       The most authentic thing to do in Kathmandu is having a delicious dinner with locals, inside their cozy, warm homes. A restaurant will never give you the magic experience of a home cooked meal. You'll enjoy the presence of some lovely hosts, who will share their stories with you.
                    </p>
                    <div className="bg-[#FFF0E6] p-6 rounded-2xl border-l-4 border-[#213448]">
                       <h4 className="font-bold text-[#213448] mb-2">Must Try Dishes</h4>
                       <p className="text-sm text-gray-700">Dal Bhat, Momo, Thukpa, Sel Roti, Gundruk, Choila</p>
                    </div>
                 </div>
              </div>

              {/* Article 3: Markets */}
              <div className="flex flex-col md:flex-row gap-12 items-center">
                 <div className="md:w-1/2">
                    <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80" className="rounded-3xl shadow-xl w-full" />
                 </div>
                 <div className="md:w-1/2">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Enjoy the fun Local Markets</h3>
                    <p className="text-gray-600 leading-relaxed mb-6">
                       The Local Markets are a joy for the eyes and a delight for foodies! Add them on your things to do in Kathmandu list and you won't regret it! You will find there everything from fresh spices to traditionally made fabrics.
                    </p>
                    <p className="text-gray-600 leading-relaxed">
                       Most of the markets are really crowded, but that's part of their charm. Your host will help you handle all the fuss and give insights on what you should buy.
                    </p>
                 </div>
              </div>

              {/* Article 4: Temples */}
              <div className="flex flex-col md:flex-row-reverse gap-12 items-center">
                 <div className="md:w-1/2">
                    <img src="https://images.unsplash.com/photo-1516594798947-e65505dbb29d?auto=format&fit=crop&w=400&q=80" className="rounded-3xl shadow-xl w-full aspect-[4/3] object-cover" />
                 </div>
                 <div className="md:w-1/2">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Visit Kathmandu Durbar Square & Swayambhunath</h3>
                    <p className="text-gray-600 leading-relaxed mb-6">
                       There quite a few highlights worth seeing in Kathmandu, but these 2 are surely must see spots. To get a complete view of the city you'll have to see them. Kathmandu Durbar Square has wowed its visitors since the beginning.
                    </p>
                    <div className="inline-block bg-gray-100 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide text-gray-600">
                       PRO TIP: Watch out for the monkeys!
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Why Guides Nepal Icons Grid (Bottom) */}
        <div className="mb-24 pt-16 border-t border-gray-100">
           <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-[#213448]">Why do Guides Nepal love what they do?</h2>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              {[
                 { title: "A fair income", desc: "Our hosts set their own price.", icon: <ShieldCheck className="w-8 h-8" /> },
                 { title: "Passion for culture", desc: "Sharing their heritage with you.", icon: <Heart className="w-8 h-8" /> },
                 { title: "Eco-friendly", desc: "Low impact, high connection.", icon: <Users className="w-8 h-8" /> },
                 { title: "Unique skills", desc: "From chefs to historians.", icon: <Star className="w-8 h-8" /> },
                 { title: "Flexible schedule", desc: "Tours that fit your time.", icon: <Clock className="w-8 h-8" /> },
                 { title: "Global community", desc: "Connecting the world.", icon: <Users className="w-8 h-8" /> }
              ].map((item, i) => (
                 <div key={i} className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-[#FFF0E6] flex items-center justify-center text-[#213448] mb-4">
                       {item.icon}
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-500 text-sm">{item.desc}</p>
                 </div>
              ))}
           </div>
        </div>

        {/* Best things to do in Kathmandu SEO Text */}
        <div className="mb-24 text-center max-w-4xl mx-auto">
           <h2 className="text-2xl font-bold text-[#213448] mb-6">Best things to do in Kathmandu</h2>
           <div className="space-y-6 text-gray-600 leading-relaxed text-sm md:text-base">
              <p>
                 Kathmandu is a city that will excite all your senses! The smelling of incense, the colorful temples, the busy streets, and the friendly locals. There are so many things to do in Kathmandu, and with a local host, you can experience it all!
              </p>
              <p>
                 Start your journey at the <strong className="text-gray-900">Durbar Square</strong>, the heart of the city. Here you can see the old royal palaces and learn about the history of Nepal. Don't forget to visit the <strong className="text-gray-900">Swayambhunath Stupa</strong>, also known as the Monkey Temple. It's a bit of a climb, but the view over the city is totally worth it!
              </p>
              <p>
                 If you're a foodie, you're in for a treat! Kathmandu has a vibrant street food scene. Try some <strong className="text-gray-900">Momo</strong> (dumplings) or <strong className="text-gray-900">Sel Roti</strong> (sweet rice bread). Your local host can show you the best places to eat, hidden away from the tourist traps.
              </p>
              <p>
                 Want to escape the hustle and bustle? Take a day trip to <strong className="text-gray-900">Nagarkot</strong> or <strong className="text-gray-900">Bhaktapur</strong>. These places are just a short drive away and offer a completely different vibe. You can enjoy the stunning views of the Himalayas or wander through the ancient streets of a medieval city.
              </p>
              <p>
                 No matter what you're interested in, there's always something to do in Kathmandu. And with a Guides Nepal tour, you can customize your experience to fit your interests perfectly. So what are you waiting for? Book your private tour today and discover the magic of Kathmandu!
              </p>
           </div>
        </div>

        {/* Related Keywords Cloud */}
        <div className="mb-12">
           <div className="text-center mb-8">
              <h3 className="text-[#213448] font-bold text-sm uppercase tracking-wider">Related keywords</h3>
           </div>
           <div className="flex flex-wrap justify-center gap-2">
              {[
                 "Kathmandu nightlife", "City tours Kathmandu", "Local guides Nepal", "Food tours Kathmandu", 
                 "Walking tours", "Private drivers", "Day trips from Kathmandu", "Bhaktapur tour", "Nagarkot sunrise",
                 "Patan Durbar Square", "Cooking classes", "Spiritual tours", "Boudhanath Stupa", "Thamel markets",
                 "Heritage walks", "Photography tours", "Hiking near Kathmandu", "Cultural experiences", "Family friendly tours",
                 "Solo travel Nepal", "Luxury experiences", "Budget tours", "Student trips", "Historical sites",
                 "Art galleries", "Museum visits", "Temple runs", "Monastery visits", "Yoga retreats", "Meditation spots"
              ].map((tag, i) => (
                 <a key={i} href="#" className="px-3 py-1.5 bg-[#FFF0E6] text-[#213448] text-xs font-bold rounded hover:bg-[#213448] hover:text-white transition-colors">
                    {tag}
                 </a>
              ))}
           </div>
        </div>

      </main>
      <Footer />
    </div>
  );
};

export default KathmanduPage;
