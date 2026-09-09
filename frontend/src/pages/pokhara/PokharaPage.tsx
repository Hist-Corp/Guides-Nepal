import React, { useState } from 'react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { Button } from '../../components/common/Button';
import { Star, Users, Heart, ShieldCheck, Check, Clock, ChevronRight, Play, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { pokharaRichData } from '../../data/pokharaRichData';
import { allGuides } from '../../data/guidesData';

export const PokharaPage: React.FC = () => {
  const navigate = useNavigate();
  const [showAllLocals, setShowAllLocals] = useState(false);
  
  // Filter guides who work in Pokhara
  const pokharaGuides = allGuides.filter(g => g.cities?.includes('Pokhara'));
  const displayedLocals = showAllLocals ? pokharaGuides : pokharaGuides.slice(0, 5);
  const displayedTours = pokharaRichData.slice(0, 6);

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
              
              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight">
                Relax in <span className="text-[#213448]">Pokhara</span> <br className="hidden md:block" />
                with our locals
              </h1>
              
              <p className="text-xl text-gray-600 max-w-lg leading-relaxed">
                From the serene Phewa Lake to the stunning Annapurna range. 
                Discover the natural beauty of Pokhara with a local friend.
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
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400" 
                      alt="Phewa Lake"
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-lg bg-[#E0F2FE] p-4 flex items-center justify-center text-center">
                    <div>
                      <div className="text-3xl font-bold text-[#213448] mb-1">20+</div>
                      <div className="text-gray-600 font-medium">Local Hosts</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-lg">
                    <img 
                      src="https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400" 
                      alt="Adventure"
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-lg rounded-bl-[4rem]">
                    <img 
                      src="https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=400" 
                      alt="Hiking Guide"
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

        {/* Featured Section */}
        <div className="mb-24">
           <div className="flex items-end justify-between mb-8">
              <div>
                 <h3 className="text-[#213448] font-bold uppercase tracking-wider text-sm mb-2">Don't miss out</h3>
                 <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Top Rated in Pokhara</h2>
              </div>
              <button 
                onClick={() => navigate('/city/pokhara/experiences')}
                className="hidden md:flex items-center text-[#213448] font-bold hover:underline"
              >
                 View all experiences <ChevronRight className="w-5 h-5" />
              </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {displayedTours.slice(0, 2).map((tour) => (
                 <div 
                   key={tour.id} 
                   className="group relative rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300"
                   onClick={() => {
                      navigate(`/city/pokhara/experience/${tour.slug}`);
                      window.scrollTo({ top: 0, behavior: 'instant' });
                   }}
                 >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>
                    <img src={tour.heroImage} alt={tour.title} className="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-500" />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-8 z-20 text-white">
                       <h3 className="text-2xl font-bold mb-2 leading-tight">{tour.title}</h3>
                       <div className="flex items-center gap-4 text-sm font-medium text-white/90 mb-6">
                          <span>{tour.type}</span>
                          <span>•</span>
                          <span>{tour.duration}</span>
                       </div>
                       
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <img src={tour.host.image} className="w-10 h-10 rounded-full border-2 border-white object-cover" />
                             <span className="text-sm font-bold">Hosted by {tour.host.name}</span>
                          </div>
                          <div className="text-right">
                             <div className="text-xs opacity-80">From</div>
                             <div className="text-xl font-bold text-white">€{tour.price}</div>
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
                  name: "Sarah", 
                  review: "The sunrise at Sarangkot with our guide was magical. He knew exactly where to go to avoid the crowds.", 
                  host: "Ramesh",
                  date: "Pokhara, January 21, 2026"
                },
                { 
                  name: "James", 
                  review: "Paragliding was intense but safe! Thanks to our local host for arranging everything seamlessly.", 
                  host: "Bijay",
                  date: "Pokhara, January 20, 2026"
                },
                { 
                  name: "Elena", 
                  review: "We loved the food tour near Lakeside. The momos were the best I've ever had!", 
                  host: "Kiran",
                  date: "Pokhara, January 18, 2026"
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
             <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Meet our <span className="text-[#213448]">Pokhara locals</span></h2>
             <p className="text-gray-600 max-w-2xl mx-auto">Friendly guides ready to show you the magic of the lake city.</p>
           </div>
           
           <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
              {displayedLocals.map((local, i) => (
                 <div 
                   key={i} 
                   className="flex flex-col items-center group cursor-pointer"
                   onClick={() => {
                     navigate(`/local/${local.id}`);
                     window.scrollTo({ top: 0, behavior: 'instant' });
                   }}
                 >
                    <div className="relative w-32 h-32 mb-4">
                       <img 
                         src={local.image} 
                         alt={local.name} 
                         className="w-full h-full rounded-full object-cover border-4 border-white shadow-md group-hover:border-brand-yellow transition-all duration-300"
                       />
                       <div className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm text-xs font-bold border border-gray-100">
                          🇳🇵
                       </div>
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-[#213448] transition-colors">{local.name}</h3>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2 text-center line-clamp-1 px-2">{local.role}</p>
                    <div className="flex items-center gap-1 text-xs font-bold text-gray-600">
                       <Star className="w-3 h-3 fill-brand-yellow text-brand-yellow" />
                       <span>{local.rating}</span>
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
             <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Things to do in Pokhara</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {displayedTours.map((tour) => (
              <div 
                key={tour.id} 
                className="flex flex-col border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 bg-white group cursor-pointer"
                onClick={() => {
                  navigate(`/city/pokhara/experience/${tour.slug}`);
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
              >
                <div className="relative h-48 aspect-[4/3] overflow-hidden">
                  <img src={tour.heroImage} alt={tour.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide text-gray-800">
                    {tour.type}
                  </div>
                </div>
                
                <div className="flex-1 p-5 flex flex-col">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 leading-snug line-clamp-2 group-hover:text-[#213448] transition-colors">
                    {tour.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                     <Clock className="w-3 h-3" />
                     <span>{tour.duration}</span>
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <img src={tour.host.image} className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                        <span className="text-xs text-gray-500">{tour.host.name}</span>
                     </div>
                     <div className="text-right">
                        <div className="text-[10px] text-gray-400 uppercase">From</div>
                        <div className="text-lg font-bold text-gray-900">€{tour.price}</div>
                     </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
             <Button 
                onClick={() => navigate('/city/pokhara/experiences')}
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
                "Paragliding", "Boating", "Hiking", "Yoga Retreats", "Caves", 
                "Waterfalls", "Meditation", "Trekking", "Sunrise Tours", "Food Tours"
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
              <img src="https://images.unsplash.com/photo-1528181304800-259b08848526?w=400" className="w-full h-full object-cover brightness-[0.6] group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 flex flex-col justify-center p-8 md:p-16">
                 <div className="bg-[#213448] w-16 h-1 mb-6"></div>
                 <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 max-w-2xl leading-tight">
                    Top 10 things to do in <br/> Pokhara
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
              {/* Article 1: Paragliding */}
              <div className="flex flex-col md:flex-row gap-12 items-center">
                 <div className="md:w-1/2">
                    <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400" className="rounded-3xl shadow-xl w-full aspect-[4/3] object-cover" />
                 </div>
                 <div className="md:w-1/2">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Soar above the clouds</h3>
                    <p className="text-gray-600 leading-relaxed mb-6">
                       Paragliding in Pokhara is a bucket-list experience. Take off from Sarangkot and float over the Phewa Lake with the Annapurna range as your backdrop. It's an adrenaline rush with the most peaceful view you can imagine.
                    </p>
                    <p className="text-gray-600 leading-relaxed">
                       Our local experts can arrange the best pilots and timing for you, ensuring a safe and unforgettable flight.
                    </p>
                 </div>
              </div>

              {/* Article 2: Boating */}
              <div className="flex flex-col md:flex-row-reverse gap-12 items-center">
                 <div className="md:w-1/2">
                    <img src="https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400" className="rounded-3xl shadow-xl w-full" />
                 </div>
                 <div className="md:w-1/2">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Relax on Phewa Lake</h3>
                    <p className="text-gray-600 leading-relaxed mb-6">
                       Rent a colorful 'doonga' (boat) and paddle out to the Tal Barahi Temple in the middle of the lake. The reflection of Machhapuchhre mountain in the water is a sight to behold, especially during sunset.
                    </p>
                    <div className="bg-[#FFF0E6] p-6 rounded-2xl border-l-4 border-[#213448]">
                       <h4 className="font-bold text-[#213448] mb-2">Best Time</h4>
                       <p className="text-sm text-gray-700">Late afternoon for the golden hour glow.</p>
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

        {/* Best things to do in Pokhara SEO Text */}
        <div className="mb-24 text-center max-w-4xl mx-auto">
           <h2 className="text-2xl font-bold text-[#213448] mb-6">Best things to do in Pokhara</h2>
           <div className="space-y-6 text-gray-600 leading-relaxed text-sm md:text-base">
              <p>
                 Pokhara is the adventure capital of Nepal and the gateway to the Annapurna Circuit. But it's also a place of deep relaxation. Whether you want to fly high in the sky or sit by the lake with a book, Pokhara has it all.
              </p>
              <p>
                 Start your day with a hike to the <strong className="text-gray-900">World Peace Pagoda</strong> for a panoramic view of the valley. Then, explore the mysterious <strong className="text-gray-900">Mahendra Cave</strong> or the <strong className="text-gray-900">Davis Falls</strong> where the water vanishes underground.
              </p>
              <p>
                 In the evening, Lakeside comes alive with live music, delicious food, and a vibrant atmosphere. Let our local guides show you the best spots to unwind and enjoy the nightlife.
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
                 "Pokhara paragliding", "Annapurna trekking", "Phewa Lake boating", "Sarangkot sunrise", 
                 "Yoga retreats Pokhara", "Davis Falls", "World Peace Pagoda", "Begnas Lake", 
                 "Tibetan refugee camp", "Ultralight flight", "Zip flyer", "Seti River rafting",
                 "Hiking near Pokhara", "Meditation centers", "Lakeside dining", "Live music Pokhara"
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

export default PokharaPage;
