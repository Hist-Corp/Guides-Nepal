import React from 'react';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { PageBackButton } from '../components/common/PageBackButton';
import { Link } from 'react-router-dom';
import { Rocket, Wallet, Users, Award, ShieldCheck, Headset, ArrowRight } from 'lucide-react';

const resources = [
  {
    icon: Rocket,
    title: 'Getting Started Guide',
    description: 'Learn how to create compelling experiences that travelers love.',
    path: '/host-application'
  },
  {
    icon: Wallet,
    title: 'Pricing & Payments',
    description: 'Understand how pricing works and when you get paid.',
    path: '/host-center'
  },
  {
    icon: Users,
    title: 'Building Your Community',
    description: 'Tips for growing your traveler community and getting reviews.',
    path: '/host-center'
  },
  {
    icon: Award,
    title: 'Creating Great Experiences',
    description: 'Best practices for memorable and highly-rated experiences.',
    path: '/host-application'
  },
  {
    icon: ShieldCheck,
    title: 'Safety & Insurance',
    description: 'Information about our safety guidelines and coverage.',
    path: '/terms'
  },
  {
    icon: Headset,
    title: 'Support Center',
    description: 'Get help from our team whenever you need it.',
    path: '/contact'
  }
];

const HostCenterPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <PageBackButton />
      <main id="main-content" className="flex-grow">
        <section className="bg-primary py-20 text-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Host Center</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Everything you need to know to be a successful host on Guides Nepal.
            </p>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-b from-white to-slate-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary mb-3">Resources</span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Resources for Hosts</h2>
              <p className="mt-3 text-slate-500 max-w-xl mx-auto">Everything you need to grow your hosting business and deliver unforgettable experiences.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {resources.map((resource, index) => (
                <Link
                  key={index}
                  to={resource.path}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-primary/30 block"
                >
                  <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/5 transition-transform duration-500 group-hover:scale-150" />
                  <div className="relative">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary ring-1 ring-primary/10 transition-all duration-300 group-hover:from-primary group-hover:to-primary/80 group-hover:text-white group-hover:ring-primary/30 group-hover:shadow-md">
                      <resource.icon className="h-6 w-6" />
                    </div>
                    <h3 className="mb-2 text-base sm:text-lg font-bold text-slate-900 transition-colors group-hover:text-primary">{resource.title}</h3>
                    <p className="text-sm leading-relaxed text-slate-500">{resource.description}</p>
                    <div className="mt-5 flex items-center gap-1.5 text-sm font-semibold text-primary opacity-0 transition-all duration-300 group-hover:opacity-100">
                      Learn more
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
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
            <Link to="/host-application" className="inline-block bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-primary-hover transition-colors">
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