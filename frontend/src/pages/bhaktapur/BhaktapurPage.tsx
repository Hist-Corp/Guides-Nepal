import React, { useState } from 'react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { Button } from '../../components/common/Button';
import { Star, Users, Heart, ShieldCheck, Check, Clock, ChevronRight, Play, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { bhaktapurRichData } from '../../data/bhaktapurRichData';
import { allGuides } from '../../data/guidesData';

export const BhaktapurPage: React.FC = () => {
  const navigate = useNavigate();
  const [showAllLocals, setShowAllLocals] = useState(false);
  
  // Filter guides who work in Bhaktapur
  const bhaktapurGuides = allGuides.filter(g => g.cities?.includes('Bhaktapur'));
  const displayedLocals = showAllLocals ? bhaktapurGuides : bhaktapurGuides.slice(0, 5);
  const displayedTours = bhaktapurRichData.slice(0, 6);

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
                Step back in time in <span className="text-[#213448]">Bhaktapur</span> <br className="hidden md:block" />
                with our locals
              </h1>
              
              <p className="text-xl text-gray-600 max-w-lg leading-relaxed">
                The City of Devotees. Explore medieval squares, try pottery making, 
                and taste the famous Juju Dhau (King Curd).
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
                      src="https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=nyatapola%20temple%20bhaktapur&image_size=portrait_3_4" 
                      alt="Nyatapola Temple"
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-lg bg-[#E0F2FE] p-4 flex items-center justify-center text-center">
                    <div>
                      <div className="text-3xl font-bold text-[#213448] mb-1">10+</div>
                      <div className="text-gray-600 font-medium">Heritage Guides</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-lg">
                    <img 
                      src="https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=bhaktapur%20pottery%20hands&image_size=square" 
                      alt="Pottery Making"
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-lg rounded-bl-[4rem]">
                    <img 
                      src="https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=nepali%20woman%20traditional%20dress%20bhaktapur&image_size=portrait_3_4" 
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

        {/* Featured Section */}
        <div className="mb-24">
           <div className="flex items-end justify-between mb-8">
              <div>
                 <h3 className="text-[#213448] font-bold uppercase tracking-wider text-sm mb-2">Don't miss out</h3>
                 <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Top Rated in Bhaktapur</h2>
              </div>
              <button 
                onClick={() => navigate('/city/bhaktapur/experiences')}
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
                      navigate(`/city/bhaktapur/experience/${tour.slug}`);
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
                  name: "David", 
                  review: "The pottery class was so much fun! My bowl was a bit wonky, but I loved the experience.", 
                  host: "Radha",
                  date: "Bhaktapur, January 22, 2026"
                },
                { 
                  name: "Jennifer", 
                  review: "Juju Dhau is truly the King of Curd. Thanks to Prakash for taking us to the best spot!", 
                  host: "Prakash",
                  date: "Bhaktapur, January 20, 2026"
                },
                { 
                  name: "Robert", 
                  review: "Walking through Bhaktapur felt like time travel. Krishna's stories made it come alive.", 
                  host: "Krishna",
                  date: "Bhaktapur, January 15, 2026"
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
             <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Meet our <span className="text-[#213448]">Bhaktapur locals</span></h2>
             <p className="text-gray-600 max-w-2xl mx-auto">Friendly guides ready to show you the magic of the medieval city.</p>
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
             <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Things to do in Bhaktapur</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {displayedTours.map((tour) => (
              <div 
                key={tour.id} 
                className="flex flex-col border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 bg-white group cursor-pointer"
                onClick={() => {
                  navigate(`/city/bhaktapur/experience/${tour.slug}`);
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
                onClick={() => navigate('/city/bhaktapur/experiences')}
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
                "Pottery Class", "Heritage Walk", "Food Tour", "Thangka Art", "Night Tour", 
                "Photography", "Cooking Class", "Temple Tour", "Wood Carving", "Local Life"
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
              <img src="https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=Bhaktapur%20Durbar%20Square%20panoramic&image_size=landscape_16_9" className="w-full h-full object-cover brightness-[0.6] group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 flex flex-col justify-center p-8 md:p-16">
                 <div className="bg-[#213448] w-16 h-1 mb-6"></div>
                 <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 max-w-2xl leading-tight">
                    Top 10 things to do in <br/> Bhaktapur
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
              {/* Article 1: Pottery */}
              <div className="flex flex-col md:flex-row gap-12 items-center">
                 <div className="md:w-1/2">
                    <img src="https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=drying%20pottery%20bhaktapur%20square&image_size=landscape_4_3" className="rounded-3xl shadow-xl w-full aspect-[4/3] object-cover" />
                 </div>
                 <div className="md:w-1/2">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Spin the Wheel at Pottery Square</h3>
                    <p className="text-gray-600 leading-relaxed mb-6">
                       Bhaktapur is famous for its clay crafts. Visit the Pottery Square where hundreds of pots are laid out to dry in the sun. It's a photographer's dream and a chance to see a tradition that hasn't changed for centuries.
                    </p>
                    <p className="text-gray-600 leading-relaxed">
                       Don't just watch! Join a workshop with a local potter and try your hand at shaping the clay on a traditional wheel.
                    </p>
                 </div>
              </div>

              {/* Article 2: Curd */}
              <div className="flex flex-col md:flex-row-reverse gap-12 items-center">
                 <div className="md:w-1/2">
                    <img src="https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=juju%20dhau%20clay%20pot%20bhaktapur&image_size=landscape_4_3" className="rounded-3xl shadow-xl w-full" />
                 </div>
                 <div className="md:w-1/2">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Taste the King of Curd</h3>
                    <p className="text-gray-600 leading-relaxed mb-6">
                       Juju Dhau, or "King Curd", is a sweet, creamy yogurt unique to Bhaktapur. Made from buffalo milk and set in clay pots, it has a distinct flavor you won't find anywhere else in Nepal.
                    </p>
                    <div className="bg-[#FFF0E6] p-6 rounded-2xl border-l-4 border-[#213448]">
                       <h4 className="font-bold text-[#213448] mb-2">Foodie Tip</h4>
                       <p className="text-sm text-gray-700">Look for the shops with the red flags - they usually serve the freshest curd.</p>
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

        {/* Best things to do in Bhaktapur SEO Text */}
        <div className="mb-24 text-center max-w-4xl mx-auto">
           <h2 className="text-2xl font-bold text-[#213448] mb-6">Best things to do in Bhaktapur</h2>
           <div className="space-y-6 text-gray-600 leading-relaxed text-sm md:text-base">
              <p>
                 Bhaktapur is known as the 'City of Devotees' and for good reason. It has the best-preserved medieval city center in Nepal. No cars are allowed in the main squares, making it a pleasure to explore on foot.
              </p>
              <p>
                 The <strong className="text-gray-900">Nyatapola Temple</strong> is the tallest pagoda in Nepal and a stunning example of Newari engineering. The <strong className="text-gray-900">55-Window Palace</strong> in Durbar Square is a masterpiece of wood carving.
              </p>
              <p>
                 Take your time to wander through the narrow alleys, watch the locals go about their daily life, and soak in the timeless atmosphere of this ancient city.
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
                 "Bhaktapur Durbar Square", "Pottery Square", "Nyatapola Temple", "Juju Dhau tasting", 
                 "55 Window Palace", "Dattatreya Square", "Peacock Window", "Thangka painting", 
                 "Newari architecture", "Medieval city tour", "Car free zone", "Traditional crafts",
                 "Siddha Pokhari", "Bisket Jatra festival", "Heritage hotel stay"
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

export default BhaktapurPage;
