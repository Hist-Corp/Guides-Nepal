import React, { useState } from 'react';
import { Search, MapPin, ChevronRight } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { Link } from 'react-router-dom';
import { useCmsSection } from '../../hooks/useCms';
import { cityImages, NEPAL_IMAGES } from '../../data/images';
import { SafeImage } from '../common/SafeImage';

const destinations = [
  { name: 'Kathmandu' },
  { name: 'Pokhara' },
  { name: 'Lalitpur' },
  { name: 'Bhaktapur' },
];

export const HeroSection: React.FC = () => {
  const [destination, setDestination] = useState('');
  const [currentDestIndex, setCurrentDestIndex] = useState(0);
  const { openSearch, setSearchQuery } = useUIStore();
  const cmsHero = useCmsSection('home', 'home-hero');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(destination);
    openSearch();
  };

  const nextDestination = () => {
    setCurrentDestIndex((prev) => (prev + 1) % destinations.length);
  };

  const currentCity = destinations[currentDestIndex];
  const currentImages = cityImages(currentCity.name);

  return (
    <section data-cms-id="home-hero" data-cms-label="Hero" className="bg-peach py-12 md:py-20 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Left Content */}
          <div className="flex-1 space-y-10 z-10 max-w-2xl text-center md:text-left mx-auto md:mx-0">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight">
                {cmsHero?.content?.heading ? (
                  <span className="text-[#547792]">{cmsHero.content.heading}</span>
                ) : (
                  <>
                <span className="text-[#547792]">Enchanting experiences,</span><br />
                <span className="text-[#547792]">with </span>
                <span className="text-[#F4B400] drop-shadow-sm">incredible locals</span>
                  </>
                )}
              </h1>
              <p className="text-xl text-[#555555] font-medium max-w-lg leading-relaxed mx-auto md:mx-0">
                {cmsHero?.content?.subtitle ? (
                  cmsHero.content.subtitle
                ) : (
                  <>
                Book unique and memorable travel<br className="hidden md:block" />
                experiences guided by locals
                  </>
                )}
              </p>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative max-w-lg w-full mx-auto md:mx-0">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Where are you going?"
                  className="w-full h-[72px] pl-8 pr-36 rounded-full border-0 shadow-sm text-[#333333] placeholder:text-[#999999] focus:ring-2 focus:ring-[#213448]/20 bg-white text-lg"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
                <div className="absolute right-2 top-2 bottom-2">
                  <button 
                    type="submit"
                    className="h-full bg-[#F4B400] hover:bg-[#E5A800] text-[#333333] font-bold rounded-full px-8 flex items-center gap-2 transition-transform hover:scale-105 active:scale-95"
                  >
                    <Search className="w-5 h-5 stroke-[2.5]" />
                    <span>Search</span>
                  </button>
                </div>
              </div>
            </form>
            
            {/* Helper Banner (Ask Maila Dai) */}
            <div className="inline-flex items-center gap-4 pt-2 justify-center w-full md:justify-start md:w-auto">
               <div className="flex items-center gap-3">
                 <span className="text-sm font-medium text-[#555555]">Need help planning your trip?</span>
                 <Link to="/maila-dai" className="bg-[#F4B400]/20 hover:bg-[#F4B400]/30 text-[#333333] text-sm font-bold pl-4 pr-1 py-1 rounded-full flex items-center gap-2 transition-colors shadow-sm border border-[#F4B400]/50">
                   Ask Maila Dai!
                    <SafeImage src={NEPAL_IMAGES.guideMale} alt="Maila Dai" className="w-8 h-8 rounded-full object-cover" />
                 </Link>
               </div>
            </div>
          </div>

          {/* Right Image Collage */}
          <div className="flex-1 w-full mt-8 lg:mt-0 relative">
            {/* Desktop 3-column Grid (1-2-2) - Visible on Large screens only */}
            <div className="hidden lg:grid grid-cols-3 gap-4 h-[600px] items-center">
              
              {/* Column 1: Left Tall Image */}
              <div className="col-span-1 h-full flex flex-col justify-center items-center relative">
                <div className="h-[65%] w-full relative overflow-hidden rounded-[2rem] shadow-xl group cursor-pointer mb-6 transition-all duration-500 ease-in-out">
                  <SafeImage 
                    key={`d1-${currentCity.name}`}
                    src={currentImages[0]} 
                    alt={`${currentCity.name} Highlights`} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 animate-in fade-in zoom-in duration-500"
                  />
                </div>
                {/* Location Chip */}
                <button 
                  onClick={nextDestination}
                  className="bg-[#FFF5E6] py-2 px-4 rounded-full shadow-lg flex items-center gap-2 cursor-pointer hover:bg-white hover:scale-105 transition-all min-w-max group"
                >
                  <MapPin className="w-4 h-4 text-[#333333]" />
                  <span className="text-sm font-bold text-[#333333] w-20 text-left">{currentCity.name}</span>
                  <div className="w-6 h-6 rounded-full bg-[#F4B400] flex items-center justify-center group-hover:bg-[#E5A800] transition-colors">
                     <ChevronRight className="w-4 h-4 text-white group-hover:text-white transition-colors" />
                  </div>
                </button>
              </div>
              
              {/* Column 2: Middle Stacked */}
              <div className="col-span-1 flex flex-col justify-center gap-4 h-full">
                <div className="h-[40%] relative overflow-hidden rounded-[2rem] shadow-xl group cursor-pointer transition-all duration-500 ease-in-out">
                    <SafeImage 
                      key={`d2-${currentCity.name}`}
                      src={currentImages[1]} 
                      alt={`${currentCity.name} Scene 1`} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 animate-in fade-in zoom-in duration-500 delay-75"
                    />
                </div>
                <div className="h-[40%] relative overflow-hidden rounded-[2rem] shadow-xl group cursor-pointer transition-all duration-500 ease-in-out">
                    <SafeImage 
                      key={`d3-${currentCity.name}`}
                      src={currentImages[2]} 
                      alt={`${currentCity.name} Scene 2`} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 animate-in fade-in zoom-in duration-500 delay-100"
                    />
                </div>
              </div>

              {/* Column 3: Right Stacked */}
              <div className="col-span-1 flex flex-col justify-center gap-4 h-full">
                 <div className="h-[50%] relative overflow-hidden rounded-[2rem] shadow-xl group cursor-pointer transition-all duration-500 ease-in-out">
                    <SafeImage 
                      key={`d4-${currentCity.name}`}
                      src={currentImages[3]} 
                      alt={`${currentCity.name} Scene 3`} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 animate-in fade-in zoom-in duration-500 delay-150"
                    />
                 </div>
                 <div className="h-[45%] relative overflow-hidden rounded-[2rem] shadow-xl group cursor-pointer transition-all duration-500 ease-in-out">
                    <SafeImage 
                      key={`d5-${currentCity.name}`}
                      src={currentImages[4]} 
                      alt={`${currentCity.name} Scene 4`} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 animate-in fade-in zoom-in duration-500 delay-200"
                    />
                 </div>
              </div>
            </div>

            {/* Mobile/Tablet Layout (2-1-2 Grid) - Visible up to Large screens */}
            <div className="lg:hidden grid grid-cols-3 gap-2 h-[400px] items-center pb-4">
               {/* Left Column: 2 Stacked Images */}
               <div className="col-span-1 flex flex-col gap-2 h-[300px] justify-center">
                 <div className="h-1/2 relative overflow-hidden rounded-[1rem] shadow-lg">
                   <SafeImage 
                     key={`m1-${currentCity.name}`}
                     src={currentImages[0]} 
                     alt={`${currentCity.name} Mobile 1`} 
                     className="w-full h-full object-cover animate-in fade-in zoom-in duration-500"
                   />
                   <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-[#FFF5E6] p-1.5 rounded-lg shadow-md scale-75">
                      <div className="w-6 h-4 bg-[#333333] rounded-md relative flex items-center justify-center">
                          <div className="absolute -bottom-0.5 left-1.5 w-1.5 h-1.5 bg-[#333333] transform rotate-45"></div>
                          <div className="w-2 h-2 bg-[#333333] rounded-full absolute top-1 left-1"></div>
                      </div>
                   </div>
                 </div>
                 <div className="h-1/2 relative overflow-hidden rounded-[1rem] shadow-lg">
                   <SafeImage 
                     key={`m2-${currentCity.name}`}
                     src={currentImages[1]} 
                     alt={`${currentCity.name} Mobile 2`} 
                     className="w-full h-full object-cover animate-in fade-in zoom-in duration-500 delay-75"
                   />
                 </div>
               </div>

               {/* Middle Column: 1 Centered Image */}
               <div className="col-span-1 flex flex-col items-center justify-center gap-4 h-full">
                 <div className="h-[160px] w-full relative overflow-hidden rounded-[1rem] shadow-lg">
                   <SafeImage 
                     key={`m3-${currentCity.name}`}
                     src={currentImages[2]} 
                     alt={`${currentCity.name} Mobile 3`} 
                     className="w-full h-full object-cover animate-in fade-in zoom-in duration-500 delay-100"
                   />
                 </div>
                 
                 {/* Mobile Location Chip (Static) */}
                 <button 
                  onClick={nextDestination}
                  className="bg-[#FFF5E6] py-2 px-4 rounded-full shadow-lg flex items-center gap-2 cursor-pointer hover:bg-white transition-all z-20 min-w-max group mt-2"
                 >
                  <MapPin className="w-4 h-4 text-[#333333]" />
                  <span className="text-sm font-bold text-[#333333] w-20 text-left">{currentCity.name}</span>
                  <div className="w-6 h-6 rounded-full bg-[#F4B400] flex items-center justify-center group-hover:bg-[#E5A800] transition-colors">
                     <ChevronRight className="w-4 h-4 text-white group-hover:text-white transition-colors" />
                  </div>
                 </button>
               </div>

               {/* Right Column: 2 Stacked Images */}
               <div className="col-span-1 flex flex-col gap-2 h-[300px] justify-center">
                 <div className="h-1/2 relative overflow-hidden rounded-[1rem] shadow-lg">
                   <SafeImage 
                     key={`m4-${currentCity.name}`}
                     src={currentImages[3]} 
                     alt={`${currentCity.name} Mobile 4`} 
                     className="w-full h-full object-cover animate-in fade-in zoom-in duration-500 delay-150"
                   />
                 </div>
                 <div className="h-1/2 relative overflow-hidden rounded-[1rem] shadow-lg">
                   <SafeImage 
                     key={`m5-${currentCity.name}`}
                     src={currentImages[4]} 
                     alt={`${currentCity.name} Mobile 5`} 
                     className="w-full h-full object-cover animate-in fade-in zoom-in duration-500 delay-200"
                   />
                 </div>
               </div>
            </div>
            
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;