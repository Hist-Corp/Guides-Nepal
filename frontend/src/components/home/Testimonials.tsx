import React, { useState, useRef } from 'react';
import { Card } from '../common/Card';
import { SafeImage } from '../common/SafeImage';
import { Reveal } from '../common/Reveal';
import { NEPAL_IMAGES } from '../../data/images';
import { useCmsSection } from '../../hooks/useCms';
import { cmsBackground } from '../../utils/cmsText';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Nepal cities with reasonable, verified imagery:
// Kathmandu/Bhaktapur/Lalitpur -> heritage temples & old towns
// Pokhara/Chitwan -> lakes, Himalayas, jungle hills
const testimonials = [
  {
    id: 1,
    quote:
      'A must-do tour in Kathmandu! We learned so much about the city and its history. Our guide was fantastic and made the experience truly special.',
    author: 'Sarah J.',
    location: 'Kathmandu',
    image: NEPAL_IMAGES.traveler1,
  },
  {
    id: 2,
    quote:
      "The best food tour I've ever been on! We tasted so many delicious dishes that we never would have found on our own. Highly recommend!",
    author: 'Michael T.',
    location: 'Pokhara',
    image: NEPAL_IMAGES.traveler2,
  },
  {
    id: 3,
    quote:
      'Our guide was amazing! She was so knowledgeable and friendly. It felt like exploring the city with an old friend. Best part of our trip!',
    author: 'Emily R.',
    location: 'Bhaktapur',
    image: NEPAL_IMAGES.traveler3,
  },
];

export const Testimonials: React.FC = () => {
  const cms = useCmsSection('home', 'home-testimonials');
  const heading = cms?.content?.heading || 'Travelers love our locals';
  const subtitle = cms?.content?.subtitle || 'Real reviews from real travelers in Nepal';
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const card = scrollContainerRef.current.firstElementChild as HTMLElement;
      const cardWidth = card ? card.offsetWidth + 16 : scrollContainerRef.current.clientWidth;
      const { scrollLeft } = scrollContainerRef.current;
      const index = Math.round(scrollLeft / cardWidth);
      setActiveIndex(Math.min(Math.max(0, index), testimonials.length - 1));
    }
  };

  const scrollToIndex = (index: number) => {
    if (scrollContainerRef.current) {
      const card = scrollContainerRef.current.firstElementChild as HTMLElement;
      const cardWidth = card ? card.offsetWidth + 16 : scrollContainerRef.current.clientWidth;
      scrollContainerRef.current.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth',
      });
      setActiveIndex(index);
    }
  };
  return (
    <section
      data-cms-id="home-testimonials"
      data-cms-label="Testimonials"
      className="py-16 bg-[#E0F2FE]"
      style={cmsBackground(cms?.style, '#E0F2FE')}
    >
      <div className="container mx-auto px-4">
        <Reveal variant="down">
          <h2 className="text-3xl font-bold text-primary text-center mb-2">{heading}</h2>
        </Reveal>
        <Reveal variant="down" delay={90}>
          <p className="text-center text-slate-600 mb-12">{subtitle}</p>
        </Reveal>

        {/* Responsive scroll: 1/2/3 cards per view with prev/next */}
        <div className="relative px-12">
          <button
            onClick={() => scrollToIndex(Math.max(0, activeIndex - 1))}
            disabled={activeIndex === 0}
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center border border-slate-200 transition-colors ${activeIndex === 0 ? 'text-slate-300 cursor-not-allowed opacity-50' : 'text-slate-700 hover:bg-slate-50'}`}
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto gap-4 pb-4 px-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="flex-shrink-0 w-full min-[650px]:w-[calc(50%-0.5rem)] min-[950px]:w-[calc(33.333%-0.667rem)] snap-center">
                <Card className="group p-6 border-none shadow-sm h-full flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                  <div>
                    <div className="text-primary text-4xl font-serif mb-4 leading-none transition-all duration-300 group-hover:scale-110 group-hover:text-brand-yellow">
                      “
                    </div>
                    <p className="text-slate-700 mb-6 italic leading-relaxed">{testimonial.quote}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <SafeImage
                      src={testimonial.image}
                      alt={testimonial.author}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900">{testimonial.author}</h4>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">
                        Visited {testimonial.location}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
          <button
            onClick={() => scrollToIndex(Math.min(testimonials.length - 1, activeIndex + 1))}
            disabled={activeIndex >= testimonials.length - 1}
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center border border-slate-200 transition-colors ${activeIndex >= testimonials.length - 1 ? 'text-slate-300 cursor-not-allowed opacity-50' : 'text-slate-700 hover:bg-slate-50'}`}
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          {/* Dot indicators */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToIndex(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === activeIndex
                    ? 'w-6 h-2 bg-brand-yellow'
                    : 'w-2 h-2 bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default Testimonials;
