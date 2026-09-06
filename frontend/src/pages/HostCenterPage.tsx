import React from 'react';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { Link } from 'react-router-dom';
import { BookOpen, DollarSign, Users, Star, Shield, Headphones } from 'lucide-react';

const resources = [
  {
    icon: BookOpen,
    title: 'Getting Started Guide',
    description: 'Learn how to create compelling experiences that travelers love.'
  },
  {
    icon: DollarSign,
    title: 'Pricing & Payments',
    description: 'Understand how pricing works and when you get paid.'
  },
  {
    icon: Users,
    title: 'Building Your Community',
    description: 'Tips for growing your traveler community and getting reviews.'
  },
  {
    icon: Star,
    title: 'Creating Great Experiences',
    description: 'Best practices for memorable and highly-rated experiences.'
  },
  {
    icon: Shield,
    title: 'Safety & Insurance',
    description: 'Information about our safety guidelines and coverage.'
  },
  {
    icon: Headphones,
    title: 'Support Center',
    description: 'Get help from our team whenever you need it.'
  }
];

const HostCenterPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <section className="bg-primary py-20 text-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Host Center</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Everything you need to know to be a successful host on Guides Nepal.
            </p>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">Resources for Hosts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {resources.map((resource, index) => (
                <div key={index} className="border border-slate-200 rounded-xl p-6 hover:border-primary hover:shadow-md transition-all">
                  <resource.icon className="w-10 h-10 text-primary mb-4" />
                  <h3 className="font-bold text-lg text-slate-900 mb-2">{resource.title}</h3>
                  <p className="text-slate-600">{resource.description}</p>
                  <button className="mt-4 text-primary font-bold text-sm hover:underline">Learn More</button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Ready to Start Hosting?</h2>
            <p className="text-slate-600 max-w-xl mx-auto mb-6">
              Join our community of local guides and start sharing your passion with travelers from around the world.
            </p>
            <Link to="/become-host" className="inline-block bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-primary-hover transition-colors">
              Become a Host
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HostCenterPage;