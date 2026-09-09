import React from 'react';
import { Card } from '../common/Card';

const testimonials = [
  {
    id: 1,
    quote: "A must do tour in Bangkok! We learned so much about the city and its history. Our guide was fantastic and made the experience truly special.",
    author: "Sarah J.",
    location: "Bangkok",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=128&h=128&q=80",
  },
  {
    id: 2,
    quote: "The best food tour I've ever been on! We tasted so many delicious dishes that we never would have found on our own. Highly recommend!",
    author: "Michael T.",
    location: "Rome",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=128&h=128&q=80",
  },
  {
    id: 3,
    quote: "Our guide was amazing! She was so knowledgeable and friendly. It felt like exploring the city with an old friend. Best part of our trip!",
    author: "Emily R.",
    location: "Paris",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=128&h=128&q=80",
  },
];

export const Testimonials: React.FC = () => {
  return (
    <section className="py-16 bg-[#E0F2FE]">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-primary text-center mb-2">Travelers love our locals</h2>
        <p className="text-center text-slate-600 mb-12">Real reviews from real travelers worldwide</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="p-6 border-none shadow-sm h-full flex flex-col justify-between">
              <div>
                 <div className="text-primary text-4xl font-serif mb-4 leading-none">“</div>
                 <p className="text-slate-700 mb-6 italic leading-relaxed">
                   {testimonial.quote}
                 </p>
              </div>
              <div className="flex items-center gap-3">
                <img
                  src={testimonial.image}
                  alt={testimonial.author}
                  className="w-12 h-12 rounded-full object-cover"
                  onError={(e) => (e.currentTarget.src = '/images/placeholder.svg')}
                />
                <div>
                  <h4 className="font-bold text-slate-900">{testimonial.author}</h4>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Visited {testimonial.location}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
