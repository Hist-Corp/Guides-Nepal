import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useCmsSection } from '../../hooks/useCms';
import { cmsBackground } from '../../utils/cmsText';

interface ExperienceTypeTile {
  emoji: string;
  word: string;
  label: string;
  path: string;
}

// The exact tile set of the "Find your perfect experience" section on
// withlocals.com: emoji + display word + category, as light pill cards.
const tiles: ExperienceTypeTile[] = [
  { emoji: '🍕', word: 'Delicious', label: 'Food tours', path: '/food-tours' },
  { emoji: '🚶', word: 'Amazing', label: 'Walking tour', path: '/cultural-tours' },
  { emoji: '⛰️', word: 'Gorgeous', label: 'Day trips', path: '/outdoor-activities' },
  { emoji: '👨‍👩‍👧', word: 'Memories', label: 'With the family', path: '/most-popular' },
  { emoji: '🌙', word: 'Enchanting', label: 'Night tour', path: '/explore' },
  { emoji: '🚴', word: 'Active', label: 'Bike tour', path: '/outdoor-activities' },
];

export const FindYourExperience: React.FC = () => {
  const cms = useCmsSection('home', 'home-find-experience');
  const heading = cms?.content?.heading || 'Find your perfect experience';
  const subtitle = cms?.content?.subtitle || 'Discover experiences based on your interest';

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
      id="find-your-experience"
      data-cms-id="home-find-experience"
      data-cms-label="Find your perfect experience"
      className="py-16 bg-white"
      style={cmsBackground(cms?.style, '#ffffff')}
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-primary mb-2">
            {heading.split('perfect').length > 1 ? (
              <>
                {heading.split('perfect')[0]}
                <mark className="bg-transparent text-brand-yellow">perfect</mark>
                {heading.split('perfect')[1]}
              </>
            ) : (
              heading
            )}
          </h2>
          <p className="text-slate-600">{subtitle}</p>
        </div>

        {/* Category pill cards — emoji + word + label, like withlocals */}
        <div className="flex flex-wrap items-stretch justify-center gap-4">
          {tiles.map((tile, index) => (
            <div
              key={tile.label}
              className={'w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(25%-1rem)] max-w-[430px] ' + (inView ? 'animate-fade-in-up' : 'opacity-0')}
              style={{ animationDelay: index * 90 + 'ms' }}
            >
              <Link
                to={tile.path}
                className="group flex h-full items-center gap-4 rounded-2xl border border-peach bg-peach/25 px-5 py-4 text-left transition-all duration-300 ease-out hover:-translate-y-1 hover:border-brand-yellow/70 hover:bg-peach/40 hover:shadow-[0_10px_26px_rgba(33,52,72,0.12)]"
                aria-label={tile.word + ' — ' + tile.label}
              >
                <span aria-hidden className="text-3xl leading-none transition-transform duration-300 group-hover:scale-110">
                  {tile.emoji}
                </span>
                <span className="flex flex-col">
                  <span className="text-sm font-semibold leading-tight text-secondary">
                    {tile.word}
                  </span>
                  <span className="text-lg font-bold leading-snug text-primary">
                    {tile.label}
                  </span>
                </span>
                <span className="ml-auto grid h-8 w-8 shrink-0 place-items-center rounded-full text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white">
                  <ChevronRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2.5} />
                </span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FindYourExperience;
