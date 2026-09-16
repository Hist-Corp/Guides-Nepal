import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight } from 'lucide-react';
import { SafeImage } from '../common/SafeImage';
import { NEPAL_IMAGES } from '../../data/images';
import { useCmsSection } from '../../hooks/useCms';
import { cmsBackground } from '../../utils/cmsText';

interface RegionCard {
  city: string;
  tagline: string;
  image: string;
  path: string;
}

// Nepal's five curated regions, mirroring the "Discovering … through
// local eyes" city tiles on withlocals.com.
const regions: RegionCard[] = [
  {
    city: 'Kathmandu',
    tagline: 'Temples, stupas & street food',
    image: NEPAL_IMAGES.boudhanath,
    path: '/city/kathmandu',
  },
  {
    city: 'Pokhara',
    tagline: 'Lakes, mountains & adventure',
    image: NEPAL_IMAGES.annapurna,
    path: '/city/pokhara',
  },
  {
    city: 'Lalitpur',
    tagline: 'Artisan quarters & Newar culture',
    image: NEPAL_IMAGES.heritage,
    path: '/city/lalitpur',
  },
  {
    city: 'Bhaktapur',
    tagline: 'Medieval city of devotees',
    image: NEPAL_IMAGES.temples,
    path: '/city/bhaktapur',
  },
  {
    city: 'Bharatpur',
    tagline: 'Gateway to Chitwan',
    image: NEPAL_IMAGES.mistyHills,
    path: '/city/bharatpur',
  },
];

export const DiscoverRegions: React.FC = () => {
  const cms = useCmsSection('home', 'home-regions');
  const heading = cms?.content?.heading || 'Discovering Regions through Local Eyes';
  const subtitle =
    cms?.content?.subtitle ||
    'Every corner of Nepal has a story — meet the locals who tell it best.';

  const sectionRef = React.useRef<HTMLElement>(null);
  const [inView, setInView] = React.useState(false);

  React.useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="discover-regions"
      data-cms-id="home-regions"
      data-cms-label="Discovering Regions through Local Eyes"
      className="py-16 bg-primary"
      style={cmsBackground(cms?.style, '#213448')}
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-semibold leading-[1.2] mb-2 text-white">
            {heading.split('Local Eyes').length > 1 ? (
              <>
                {heading.split('Local Eyes')[0]}
                <mark className="bg-transparent text-brand-yellow">Local Eyes</mark>
                {heading.split('Local Eyes')[1]}
              </>
            ) : (
              heading
            )}
          </h2>
          <p className="text-white/75 max-w-xl mx-auto">{subtitle}</p>
        </div>

        {/* Region tiles — withlocals style */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {regions.map((region, index) => (
            <div
              key={region.city}
              className={'h-full ' + (inView ? 'animate-fade-in-up' : 'opacity-0')}
              style={{ animationDelay: index * 110 + 'ms' }}
            >
              <Link
                to={region.path}
                className="group block h-full"
                aria-label={'Discover ' + region.city + ' with a local'}
              >
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-[0_1px_1px_0_rgba(0,0,0,0.05),0_2px_2px_0_rgba(0,0,0,0.05),0_4px_4px_0_rgba(0,0,0,0.05)] transition-all duration-300 ease-out group-hover:-translate-y-2 group-hover:shadow-[0_10px_30px_rgba(33,52,72,0.2)]">
                  <SafeImage
                    src={region.image}
                    alt={region.city}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#213448]/90 via-[#213448]/25 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 text-center">
                    <span className="block font-serif italic text-2xl sm:text-[1.65rem] leading-tight text-white drop-shadow-md">
                      {region.city}
                    </span>
                    <span className="mt-1.5 flex items-center justify-center gap-1 text-[11px] font-semibold text-white/85">
                      <MapPin className="w-3 h-3 shrink-0" />
                      {region.tagline}
                    </span>
                    <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white ring-1 ring-white/30 backdrop-blur-sm transition-all duration-300 group-hover:bg-brand-yellow group-hover:text-primary group-hover:ring-brand-yellow">
                      Explore
                      <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DiscoverRegions;
