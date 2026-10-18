import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Reveal } from '../common/Reveal';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCmsSection } from '../../hooks/useCms';
import { cmsBackground } from '../../utils/cmsText';
import { trekRoutes } from '../../pages/TrekHikingPage';
import { experienceSlugPath } from '../../utils/canonicalExperience';

const experiences = trekRoutes.map((t) => ({
  id: t.id,
  title: t.title,
  description: t.highlight,
  image: t.image,
  price: t.price,
  slug: t.slug,
  rating: t.rating,
}));

export const FeaturedExperiences: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const cms = useCmsSection('home', 'home-featured');
  const heading = cms?.content?.heading || 'Trek / Hiking';
  const subtitle = cms?.content?.subtitle || 'Find unforgettable experiences with locals';

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const containerWidth = scrollContainerRef.current.clientWidth;
      const scrollAmount = containerWidth / 3;
      scrollContainerRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section id="featured-experiences" data-cms-id="home-featured" data-cms-label="Featured" className="py-16 bg-white" style={cmsBackground(cms?.style, '#ffffff')}>
      <div className="container mx-auto px-4">
        <Reveal className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-xl font-bold text-primary mb-1">{heading}</h2>
            <p className="text-slate-500 text-sm">{subtitle}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => scroll('left')} aria-label="Scroll to previous experiences" className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:border-brand-yellow hover:bg-brand-yellow hover:text-primary hover:-translate-x-0.5 shadow-sm transition-all"><ChevronLeft className="w-5 h-5" /></button>
            <button onClick={() => scroll('right')} aria-label="Scroll to next experiences" className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:border-brand-yellow hover:bg-brand-yellow hover:text-primary hover:translate-x-0.5 shadow-sm transition-all"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </Reveal>
        <div ref={scrollContainerRef} className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {experiences.map((exp, index) => (
            <Reveal key={exp.id} delay={index * 110} className="min-w-[300px] md:min-w-[calc(33.333%-1rem)] snap-start block h-full">
              <Link to={experienceSlugPath(exp.slug)} className="group block h-full">
                <Card hoverEffect className="h-full flex flex-col transition-all duration-300 hover:-translate-y-2">
                  <div className="relative h-80 overflow-hidden">
                    <img src={exp.image} alt={exp.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" onError={(e) => (e.currentTarget.src = '/images/placeholder.svg')} />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                      <Star className="w-3 h-3 text-brand-yellow fill-current" />
                      {exp.rating}
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-bold text-lg mb-1">{exp.title}</h3>
                    <p className="text-slate-600 text-sm mb-4 line-clamp-2 min-h-[40px]">{exp.description}</p>
                    <div className="flex items-center justify-center mt-auto w-full">
                      <Button size="sm" className="w-full bg-brand-yellow hover:bg-[#E5A800] text-slate-900 rounded-md py-2 h-auto text-sm font-bold uppercase tracking-wide pointer-events-none">Explore</Button>
                    </div>
                  </div>
                </Card>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};
export default FeaturedExperiences;
