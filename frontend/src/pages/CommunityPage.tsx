import React from 'react';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { Users, Heart, Globe, Star, MessageCircle, Calendar } from 'lucide-react';

const communityStats = [
  { value: '500+', label: 'Local Guides' },
  { value: '50,000+', label: 'Travelers Served' },
  { value: '5', label: 'Cities Covered' },
  { value: '4.9', label: 'Average Rating' }
];

const testimonials = [
  {
    name: 'Sarah Johnson',
    location: 'United States',
    text: 'The local guide made my trip to Nepal unforgettable. I learned so much about the culture!',
    rating: 5
  },
  {
    name: 'Hans Mueller',
    location: 'Germany',
    text: 'Booking through Guides Nepal was easy and the experience was authentic. Highly recommend!',
    rating: 5
  },
  {
    name: 'Yuki Tanaka',
    location: 'Japan',
    text: 'My guide in Pokhara was amazing. The mountain views and local food were incredible.',
    rating: 5
  }
];

const CommunityPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <section className="bg-primary py-20 text-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Community</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Join a global community of travelers and local guides connected by a love for authentic experiences.
            </p>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {communityStats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-1">{stat.value}</div>
                  <div className="text-slate-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">What Our Community Says</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="flex gap-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-brand-yellow fill-brand-yellow" />
                    ))}
                  </div>
                  <p className="text-slate-600 mb-4 italic">"{testimonial.text}"</p>
                  <div>
                    <div className="font-bold text-slate-900">{testimonial.name}</div>
                    <div className="text-sm text-slate-500">{testimonial.location}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Get Involved</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center p-6 border border-slate-200 rounded-xl">
                <Users className="w-10 h-10 text-primary mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Become a Guide</h3>
                <p className="text-slate-600 mb-4">Share your local knowledge and earn income.</p>
                <button className="text-primary font-bold hover:underline">Learn More</button>
              </div>
              <div className="text-center p-6 border border-slate-200 rounded-xl">
                <Calendar className="w-10 h-10 text-primary mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Attend Events</h3>
                <p className="text-slate-600 mb-4">Join community meetups and workshops.</p>
                <button className="text-primary font-bold hover:underline">View Events</button>
              </div>
              <div className="text-center p-6 border border-slate-200 rounded-xl">
                <MessageCircle className="w-10 h-10 text-primary mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Join the Forum</h3>
                <p className="text-slate-600 mb-4">Connect with guides and travelers.</p>
                <button className="text-primary font-bold hover:underline">Join Now</button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 text-center">
            <Globe className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Global Reach</h2>
            <p className="text-slate-600 max-w-xl mx-auto">
              Travelers from over 50 countries have experienced Nepal through our local guides. Join our growing community and discover the world through local eyes.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CommunityPage;