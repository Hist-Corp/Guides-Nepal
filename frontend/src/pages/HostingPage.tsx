import React from 'react';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { Link } from 'react-router-dom';
import { DollarSign, Users, Clock, Shield, Globe, Heart } from 'lucide-react';

const benefits = [
  { icon: DollarSign, title: 'Earn Extra Income', description: 'Set your own prices and earn money sharing your passion.' },
  { icon: Users, title: 'Meet People Worldwide', description: 'Connect with travelers from all over the globe.' },
  { icon: Clock, title: 'Flexible Schedule', description: 'Choose when and how often you want to host.' },
  { icon: Shield, title: 'Protected & Insured', description: 'We provide coverage for all experiences.' },
  { icon: Globe, title: 'Share Your Culture', description: 'Show visitors the authentic side of Nepal.' },
  { icon: Heart, title: 'Make an Impact', description: 'Help travelers create unforgettable memories.' }
];

const HostingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <section className="bg-primary py-20 text-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Start Hosting</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
              Share your knowledge, culture, and passion with travelers from around the world.
            </p>
            <Link to="/become-host" className="inline-block bg-brand-yellow text-slate-900 px-8 py-3 rounded-lg font-bold hover:bg-[#E5A800] transition-colors">
              Become a Host
            </Link>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Why Host with Us?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {benefits.map((benefit, index) => (
                <div key={index} className="text-center p-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{benefit.title}</h3>
                  <p className="text-slate-600">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">How It Works</h2>
            <div className="max-w-3xl mx-auto">
              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">1</div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Apply to Host</h3>
                    <p className="text-slate-600">Tell us about yourself and the experience you want to offer.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">2</div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Get Approved</h3>
                    <p className="text-slate-600">Our team reviews your application within 48 hours.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">3</div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Create Your Experience</h3>
                    <p className="text-slate-600">Set your schedule, pricing, and experience details.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">4</div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Start Earning</h3>
                    <p className="text-slate-600">Welcome travelers and get paid after each experience.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Ready to Get Started?</h2>
            <p className="text-slate-600 max-w-xl mx-auto mb-6">
              Join hundreds of local guides already earning income sharing their culture.
            </p>
            <Link to="/become-host" className="inline-block bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-primary-hover transition-colors">
              Apply Now
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HostingPage;