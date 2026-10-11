import React, { useState } from 'react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { SlidersHorizontal, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGoBack } from '../../utils/backNavigation';
import { pokharaRichData } from '../../data/pokharaRichData';

export const PokharaExperiencesPage: React.FC = () => {
  const navigate = useNavigate();
  const goBack = useGoBack();
  const [filterType, setFilterType] = useState('All');

  const filteredData = filterType === 'All' 
    ? pokharaRichData 
    : pokharaRichData.filter(item => item.type?.includes(filterType) || item.title.includes(filterType));

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
           <button 
             onClick={goBack} 
             className="flex items-center gap-2 text-gray-600 hover:text-brand-yellow font-bold mb-4 transition-colors"
           >
             <ArrowLeft className="w-5 h-5" />
             Back
           </button>
           <h1 className="text-3xl font-bold text-gray-900 mb-2">Experiences in Pokhara</h1>
           <p className="text-gray-500">Discover {pokharaRichData.length} unique activities hosted by locals</p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-2 mb-8 sticky top-20 z-10 bg-gray-50/95 backdrop-blur-sm py-4 -mx-4 px-4 border-b border-gray-200/50">
           {['All', 'Food', 'Culture', 'Hiking', 'Adventure'].map(type => (
              <button 
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${
                  filterType === type 
                  ? 'bg-black text-white border-black' 
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                }`}
              >
                {type}
              </button>
           ))}
           <button className="ml-auto px-4 py-2 rounded-full text-sm font-bold border border-gray-200 bg-white flex items-center gap-2 hover:bg-gray-50">
              <SlidersHorizontal className="w-4 h-4" /> Filters
           </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredData.map((tour) => (
              <div 
                key={tour.id} 
                className="flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer"
                onClick={() => {
                  navigate(`/city/pokhara/experience/${tour.slug}`);
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
              >
                <div className="relative h-48 aspect-[4/3] overflow-hidden">
                  <img src={tour.heroImage} alt={tour.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  {tour.type && (
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide text-gray-800">
                      {tour.type}
                    </div>
                  )}
                  {/* Heart Icon Placeholder */}
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center hover:bg-white transition-colors">
                     <div className="w-4 h-4 border-2 border-gray-400 rounded-full"></div> 
                  </div>
                </div>
                
                <div className="flex-1 p-5 flex flex-col">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
                    {tour.city || "Pokhara"}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 leading-snug line-clamp-2 group-hover:text-[#213448] transition-colors">
                    {tour.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                     <span>{tour.duration}</span>
                     <span>•</span>
                     <span>Free cancellation</span>
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <img src={tour.host.image} className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                        <span className="text-xs text-gray-500 line-clamp-1">By {tour.host.name}</span>
                     </div>
                     <div className="text-right shrink-0">
                        <div className="text-[10px] text-gray-400 uppercase">From</div>
                        <div className="text-lg font-bold text-secondary">${tour.price}</div>
                     </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PokharaExperiencesPage;
