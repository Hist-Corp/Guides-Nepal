import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../common/Button';
import { SafeImage } from '../common/SafeImage';
import { NEPAL_IMAGES } from '../../data/images';
import { useCmsSection } from '../../hooks/useCms';

export const PromoBanner: React.FC = () => {
  const navigate = useNavigate();
  const cmsPromo = useCmsSection('home', 'home-promo');

  return (
    <section data-cms-id="home-promo" data-cms-label="Promo Banner" className="py-16 bg-background-cream">
       <div className="container mx-auto px-4">
          <div className="bg-sky-500 rounded-[34px] md:rounded-3xl overflow-hidden flex flex-col md:flex-row text-white relative px-8 md:px-10 py-8 md:py-0 gap-6 md:gap-12">
            {/* Left Content */}
            <div className="flex-1 p-8 md:p-12 lg:p-16 z-10">
               {cmsPromo?.content?.tagline && (
                 <h3 className="text-sm font-bold uppercase tracking-wider text-brand-yellow mb-4">{cmsPromo.content.tagline}</h3>
               )}
               <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                  {cmsPromo?.content?.heading ? (
                    cmsPromo.content.heading
                  ) : (
                    <>
                  We have released our <span className="text-brand-yellow">2024</span><br />
                  Impact Report!
                    </>
                  )}
               </h2>
               <p className="text-white/80 mb-8 max-w-md leading-relaxed">
                  {cmsPromo?.content?.subtitle ? (
                    cmsPromo.content.subtitle
                  ) : (
                    <>
                  Discover the true power of your travel with our 2024 Impact Report. 
                  See how responsible tourism supports local communities, preserves culture, 
                  and protects the planet.
                    </>
                  )}
               </p>
               <Button 
                 className="bg-white text-sky-500 hover:bg-slate-100 border-none"
                 onClick={() => navigate('/impact-report-2024')}
               >
                  {cmsPromo?.content?.buttonText || 'Read our report'}
               </Button>
            </div>

            {/* Right Image/Card */}
            <div className="flex-1 relative min-h-[300px] md:min-h-auto">
               <div className="absolute inset-0 md:-left-20 flex items-center justify-center md:justify-end p-8">
                  <div className="relative group">
                     {/* Back Card */}
                     <div className="absolute inset-0 bg-white rounded-xl shadow-xl transform -rotate-6 -translate-x-3 translate-y-2 transition-transform duration-500 group-hover:rotate-[-12deg] group-hover:-translate-x-8 z-0">
                        <div className="p-4 opacity-40">
                           <div className="grid grid-cols-2 gap-2 mb-4">
                              <SafeImage src={NEPAL_IMAGES.temples} alt="Nepal temples" className="rounded-lg w-full h-24 object-cover grayscale" />
                              <SafeImage src={NEPAL_IMAGES.everest} alt="Everest" className="rounded-lg w-full h-24 object-cover grayscale" />
                              <SafeImage src={NEPAL_IMAGES.annapurna} alt="Annapurna" className="rounded-lg w-full h-24 object-cover grayscale" />
                              <SafeImage src={NEPAL_IMAGES.phewaLake} alt="Phewa Lake" className="rounded-lg w-full h-24 object-cover grayscale" />
                           </div>
                           <div className="text-center">
                              <h4 className="font-bold text-xl mb-1 text-gray-800">Impact Report</h4>
                              <p className="text-primary font-bold text-2xl">2023</p>
                           </div>
                        </div>
                     </div>

                     {/* Front Card */}
                     <div className="relative z-10 bg-background-cream text-slate-800 p-4 rounded-xl shadow-2xl rotate-3 max-w-xs transform group-hover:rotate-0 transition-transform duration-500">
                        <div className="grid grid-cols-2 gap-2 mb-4">
                           <SafeImage src={NEPAL_IMAGES.heritage} alt="Heritage" className="rounded-lg w-full h-24 object-cover" />
                           <SafeImage src={NEPAL_IMAGES.oldTown} alt="Old town" className="rounded-lg w-full h-24 object-cover" />
                           <SafeImage src={NEPAL_IMAGES.boudhanath} alt="Boudhanath" className="rounded-lg w-full h-24 object-cover" />
                           <SafeImage src={NEPAL_IMAGES.guideFemale} alt="Local guide" className="rounded-lg w-full h-24 object-cover" />
                        </div>
                        <div className="text-center">
                           <h4 className="font-bold text-xl mb-1">Impact Report</h4>
                           <p className="text-primary font-bold text-2xl">2024</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
       </div>
    </section>
  );
};

export default PromoBanner;
