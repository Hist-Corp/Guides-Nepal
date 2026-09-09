import React from 'react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { kathmanduTours } from '../../data/kathmanduTours';
import { Star, Clock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const KathmanduExperiencesPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white">
      <Header />
      
      <main className="container mx-auto px-4 py-16 max-w-7xl flex-grow">
        <div className="mb-12">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-gray-600 hover:text-brand-yellow font-bold mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">All Experiences in Kathmandu</h1>
          <p className="text-gray-600">Discover all the amazing things you can do with our locals.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {kathmanduTours.map((tour) => (
            <div 
              key={tour.id} 
              className="flex flex-col border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 bg-white group cursor-pointer"
              onClick={() => {
                navigate(`/city/kathmandu/experience/${tour.slug}`);
                window.scrollTo({ top: 0, behavior: 'instant' });
              }}
            >
              <div className="relative h-48 overflow-hidden">
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
                <h3 className="text-lg font-bold text-gray-900 mb-2 leading-snug line-clamp-2 group-hover:text-brand-yellow transition-colors">
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
                         <img key={i} src={`https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=128&h=128&q=80`} className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                      ))}
                   </div>
                   <div className="text-right">
                      <div className="text-[10px] text-gray-400 uppercase">From</div>
                      <div className="text-lg font-bold text-secondary">${Math.floor(tour.price)}</div>
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

export default KathmanduExperiencesPage;
