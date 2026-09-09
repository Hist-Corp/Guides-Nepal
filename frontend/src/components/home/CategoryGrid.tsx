import { Utensils, Landmark, Mountain, Soup } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../common/Button';
import { SafeImage } from '../common/SafeImage';
import { NEPAL_IMAGES } from '../../data/images';

const categories = [
  {
    id: 1,
    title: 'Food tours',
    icon: <Utensils className="w-6 h-6 text-white" />,
    image: NEPAL_IMAGES.momos,
    description: 'Taste the local culture',
    path: '/food-tours',
  },
  {
    id: 2,
    title: 'Cultural tours',
    icon: <Landmark className="w-6 h-6 text-white" />,
    image: NEPAL_IMAGES.heritage,
    description: 'Discover history & heritage',
    path: '/cultural-tours',
  },
  {
    id: 3,
    title: 'Outdoor activities',
    icon: <Mountain className="w-6 h-6 text-white" />,
    image: NEPAL_IMAGES.trekking,
    description: 'Explore nature & adventure',
    path: '/outdoor-activities',
  },
  {
    id: 4,
    title: 'Cooking classes',
    icon: <Soup className="w-6 h-6 text-white" />,
    image: NEPAL_IMAGES.cookingClass,
    description: 'Learn to cook local dishes',
    path: '/cooking-classes',
  },
];

import { useCmsSection } from '../../hooks/useCms';

export const CategoryGrid: React.FC = () => {
  const cmsCat = useCmsSection('home', 'home-categories');
  return (
    <section data-cms-id="home-categories" data-cms-label="Categories" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
           <h2 className="text-xl font-bold text-brand-yellow mb-2 uppercase tracking-wide">
             {cmsCat?.content?.heading ? (
               cmsCat.content.heading
             ) : (
               <>
             <Link to="/most-popular">Most Popular</Link>. <Link to="/most-delicious">Most Delicious</Link>.
               </>
             )}
           </h2>
           <h3 className="text-3xl font-bold text-slate-800">
             {cmsCat?.content?.subtitle ? (
               cmsCat.content.subtitle
             ) : (
               <Link to="/real-good-travel">Real-Good Travel.</Link>
             )}
           </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link to={cat.path} key={cat.id} className="group relative rounded-xl overflow-hidden h-80 block">
              <SafeImage
                src={cat.image}
                alt={cat.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-6 left-0 right-0 text-center px-4">
                <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full p-3 mb-3">
                   {cat.icon}
                </div>
                <h3 className="text-white font-bold text-lg mb-1">{cat.title}</h3>
                <p className="text-white/90 text-sm mb-4">{cat.description}</p>
                <Button variant="primary" size="sm" className="bg-brand-yellow text-slate-900 hover:bg-[#E5A800] border-none font-bold">
                   Explore
                </Button>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
