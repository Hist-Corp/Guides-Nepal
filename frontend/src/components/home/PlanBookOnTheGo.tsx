import React from 'react';
import {
  Smartphone,
  MessagesSquare,
  Ticket,
  CalendarCheck,
  Star,
  CheckCircle2,
} from 'lucide-react';
import { SafeImage } from '../common/SafeImage';
import { NEPAL_IMAGES } from '../../data/images';
import { useCmsSection } from '../../hooks/useCms';
import { cmsBackground } from '../../utils/cmsText';

const features = [
  {
    icon: Smartphone,
    title: 'Book in a few taps',
    text: 'Pick a date, pay securely and get instant confirmation.',
  },
  {
    icon: MessagesSquare,
    title: 'Chat with your local',
    text: 'Message your guide before and after you book.',
  },
  {
    icon: Ticket,
    title: 'All your tickets in one place',
    text: 'Every booking, chat and ticket lives in your pocket.',
  },
  {
    icon: CalendarCheck,
    title: 'Flexible plans',
    text: 'Change or cancel easily when your plans shift.',
  },
];

export const PlanBookOnTheGo: React.FC = () => {
  const cms = useCmsSection('home', 'home-plan-book');
  const heading = cms?.content?.heading || 'Plan and book on the go';
  const subtitle =
    cms?.content?.subtitle ||
    'Your whole trip, one pocket-sized local — book, chat and travel from your phone.';

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
      { threshold: 0.15 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="plan-book-on-the-go"
      data-cms-id="home-plan-book"
      data-cms-label="Plan and book on the go"
      className="py-16 bg-[#E0F2FE]"
      style={cmsBackground(cms?.style, '#E0F2FE')}
    >
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          {/* Left: copy + features */}
          <div
            className={inView ? 'animate-fade-in-up' : 'opacity-0'}
            style={{ animationDelay: '0ms' }}
          >
            <h2 className="text-2xl md:text-3xl font-semibold leading-[1.2] mb-3 text-primary">
              {heading.split('on the go').length > 1 ? (
                <>
                  {heading.split('on the go')[0]}
                  <mark className="bg-transparent text-brand-yellow">on the go</mark>
                  {heading.split('on the go')[1]}
                </>
              ) : (
                heading
              )}
            </h2>
            <p className="text-slate-600 mb-8 max-w-md">{subtitle}</p>

            <ul className="space-y-5 max-w-md">
              {features.map((feature, index) => (
                <li
                  key={feature.title}
                  className={'flex items-start gap-4 ' + (inView ? 'animate-fade-in-up' : 'opacity-0')}
                  style={{ animationDelay: 100 + index * 90 + 'ms' }}
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-primary shadow-[0_1px_1px_0_rgba(0,0,0,0.05),0_2px_2px_0_rgba(0,0,0,0.05)] ring-1 ring-primary/10 transition-all duration-300 hover:scale-105 hover:bg-primary hover:text-white">
                    <feature.icon className="h-5 w-5" strokeWidth={1.8} />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-primary">{feature.title}</h3>
                    <p className="mt-0.5 text-sm leading-relaxed text-slate-600">{feature.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: phone mockup */}
          <div
            className={'flex justify-center lg:justify-end ' + (inView ? 'animate-fade-in-up' : 'opacity-0')}
            style={{ animationDelay: '180ms' }}
          >
            <div className="relative w-[270px] rotate-2 transition-transform duration-500 hover:rotate-0">
              {/* Phone frame */}
              <div className="relative rounded-[2.5rem] border-[10px] border-primary bg-primary shadow-[0_24px_60px_rgba(33,52,72,0.35)]">
                {/* Notch */}
                <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-primary" />
                {/* Screen */}
                <div className="relative aspect-[9/19] overflow-hidden rounded-[2rem] bg-white">
                  <SafeImage
                    src={NEPAL_IMAGES.phewaLake}
                    alt="Guides Nepal mobile booking"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#213448]/90 via-[#213448]/10 to-[#213448]/30" />

                  {/* App header */}
                  <div className="absolute inset-x-0 top-9 flex items-center justify-between px-4">
                    <span className="rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white ring-1 ring-white/30 backdrop-blur-sm">
                      🇳🇵 Guides Nepal
                    </span>
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-white/20 ring-1 ring-white/30 backdrop-blur-sm">
                      <MessagesSquare className="h-3.5 w-3.5 text-white" />
                    </span>
                  </div>

                  {/* Booking card inside the screen */}
                  <div className="absolute inset-x-3 bottom-3 rounded-2xl bg-white p-3 shadow-lg">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[11px] font-black leading-tight text-primary">
                          Momo Tasting Through Kathmandu
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-500">
                          <Star className="h-3 w-3 fill-current text-brand-yellow" />
                          4.9 · 3 hours
                        </p>
                      </div>
                      <span className="text-[11px] font-bold text-primary">€25</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-green-700 ring-1 ring-green-200">
                        <CheckCircle2 className="h-3 w-3" />
                        Booked
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
                        Ticket · Tomorrow
                      </span>
                    </div>
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

export default PlanBookOnTheGo;
