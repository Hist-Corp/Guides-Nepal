import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Star } from 'lucide-react';

const experiences = [
  {
    id: 1,
    title: 'Kathmandu',
    description: 'Explore the ancient temples and vibrant streets of Thamel',
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400',
    rating: 4.9,
    guide: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400',
    price: 'From €25 pp',
  },
  {
    id: 2,
    title: 'Pokhara',
    description: 'Boating on Phewa Lake with mountain views',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    rating: 4.9,
    guide: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=400',
    price: 'From €30 pp',
  },
  {
    id: 3,
    title: 'Lalitpur',
    description: 'Discover the art and heritage of Patan',
    image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400',
    rating: 4.8,
    guide: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400',
    price: 'From €28 pp',
  },
  {
    id: 4,
    title: 'Bhaktapur',
    description: 'Step back in time in the City of Devotees',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    rating: 4.9,
    guide: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400',
    price: 'From €26 pp',
  },
  {
    id: 5,
    title: 'Bharatpur',
    description: 'Gateway to Chitwan National Park and wildlife',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    rating: 4.7,
    guide: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
    price: 'From €35 pp',
  },
];

export const FeaturedExperiences: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      // Scroll by roughly one card width (assuming 3 columns layout logic or roughly 1/3 container)
      const containerWidth = scrollContainerRef.current.clientWidth;
      const scrollAmount = containerWidth / 3; 
      
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section id="featured-experiences" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-8">
           <div>
              <h2 className="text-xl font-bold text-primary mb-1">Go local in Charming Cities</h2>
              <p className="text-slate-500 text-sm">Find unforgettable experiences with locals</p>
           </div>
           <div className="flex gap-2">
              <button 
                onClick={() => scroll('left')}
                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:border-primary hover:text-primary transition-colors"
              >
                 &lt;
              </button>
              <button 
                onClick={() => scroll('right')}
                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:border-primary hover:text-primary transition-colors"
              >
                 &gt;
              </button>
           </div>
        </div>

        <div 
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {experiences.map((exp) => (
            <Link 
              key={exp.id} 
              to={`/city/${exp.title.toLowerCase()}`} 
              className="min-w-[300px] md:min-w-[calc(33.333%-1rem)] snap-start block h-full"
            >
              <Card hoverEffect className="h-full flex flex-col">
                <div className="relative h-80 overflow-hidden">
                  <img
                    src={exp.image}
                    alt={exp.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => (e.currentTarget.src = '/images/placeholder.svg')}
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <Star className="w-3 h-3 text-brand-yellow fill-current" />
                    {exp.rating}
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-lg mb-1">{exp.title}</h3>
                  <p className="text-slate-600 text-sm mb-4 line-clamp-2 min-h-[40px]">
                    {exp.description}
                  </p>
                  <div className="flex items-center justify-center mt-auto w-full">
                    <Button size="sm" className="w-full bg-brand-yellow hover:bg-[#E5A800] text-slate-900 rounded-md py-2 h-auto text-sm font-bold uppercase tracking-wide pointer-events-none">
                      Explore
                    </Button>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedExperiences;
