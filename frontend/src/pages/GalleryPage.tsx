import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { ArrowLeft } from 'lucide-react';
import { allGuides } from '../data/guidesData';
import { Guide } from '../data/types';

const GalleryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [guide, setGuide] = useState<Guide | null>(null);

  useEffect(() => {
    const guideId = id ? parseInt(id) : 1;
    const foundGuide = allGuides.find(g => g.id === guideId) || allGuides[0];
    setGuide(foundGuide);
  }, [id]);

  if (!guide || !guide.gallery) return null;

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white">
      <Header />
      
      <main className="flex-grow bg-gray-50/50">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center gap-2 text-gray-600 hover:text-[#213448] font-bold mb-6 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Profile
            </button>
            <h1 className="text-3xl font-bold text-gray-900">{guide.name}'s Gallery</h1>
            <p className="text-gray-500 mt-2">A collection of moments and memories</p>
          </div>

          {/* Masonry Grid */}
          <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
            {/* Hero Image First */}
            <div className="break-inside-avoid rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group relative">
              <img 
                src={guide.image} 
                alt={`${guide.name} Profile`}
                className="w-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
            </div>

            {/* Gallery Images */}
            {guide.gallery.map((img, index) => (
              <div 
                key={index} 
                className="break-inside-avoid rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group relative"
              >
                <img 
                  src={img} 
                  alt={`Gallery ${index + 1}`}
                  className="w-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
              </div>
            ))}

            {/* Additional Generated Placeholders for Demo (to show masonry effect) */}
            {[...Array(6)].map((_, i) => (
              <div 
                key={`extra-${i}`} 
                className="break-inside-avoid rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group relative"
              >
                <img 
                  src="https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=400&q=80"
                  alt={`Extra Gallery ${i}`}
                  className="w-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GalleryPage;
