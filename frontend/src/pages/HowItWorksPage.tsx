import React from 'react';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { Search, Calendar, MapPin, Star, MessageCircle, CreditCard } from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Search Experiences',
    description: 'Browse hundreds of unique experiences hosted by locals across Nepal\'s most beautiful cities.'
  },
  {
    icon: Calendar,
    title: 'Book Your Date',
    description: 'Choose a date that works for you. Flexible booking with free cancellation up to 24 hours before.'
  },
  {
    icon: MessageCircle,
    title: 'Connect with Your Guide',
    description: 'Meet your local guide who will share their knowledge, culture, and passion with you.'
  },
  {
    icon: MapPin,
    title: 'Enjoy the Experience',
    description: 'Immerse yourself in authentic local culture and create memories that last a lifetime.'
  },
  {
    icon: Star,
    title: 'Share Your Review',
    description: 'Help other travelers by sharing your experience and supporting your local guide.'
  }
];

const HowItWorksPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <section className="bg-primary py-20 text-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Booking a local experience is easy. Here's how it works in 5 simple steps.
            </p>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-6 mb-12 last:mb-0">
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                      <step.icon className="w-7 h-7 text-primary" />
                    </div>
                    {index < steps.length - 1 && (
                      <div className="w-0.5 h-full bg-primary/20 mt-4"></div>
                    )}
                  </div>
                  <div className="pb-8">
                    <div className="text-sm font-bold text-primary mb-1">Step {index + 1}</div>
                    <h3 className="font-bold text-xl text-slate-900 mb-2">{step.title}</h3>
                    <p className="text-slate-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Why Book With Us</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                <CreditCard className="w-10 h-10 text-primary mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Secure Payments</h3>
                <p className="text-slate-600">Pay securely online with full protection for your booking.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                <Star className="w-10 h-10 text-primary mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Verified Guides</h3>
                <p className="text-slate-600">All guides are verified locals with genuine expertise.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                <MessageCircle className="w-10 h-10 text-primary mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">24/7 Support</h3>
                <p className="text-slate-600">Our team is here to help you anytime, anywhere.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HowItWorksPage;