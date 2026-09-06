import React from 'react';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { Users, MapPin, Award, Heart } from 'lucide-react';
import { useCmsSection, useSeoMeta } from '../hooks/useCms';

const AboutPage: React.FC = () => {
  useSeoMeta('about', 'About Us | Guides Nepal');
  const cmsHero = useCmsSection('about', 'about-hero');
  const cmsMission = useCmsSection('about', 'about-mission');
  const cmsValues = useCmsSection('about', 'about-values');
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section data-cms-id="about-hero" data-cms-label="About Hero" className="bg-primary py-20 text-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {cmsHero?.content?.heading || 'About Guides Nepal'}
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              {cmsHero?.content?.subtitle || "Connecting travelers with authentic local experiences across Nepal's most beautiful destinations."}
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section data-cms-id="about-mission" data-cms-label="Our Mission" className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                {cmsMission?.content?.heading || 'Our Mission'}
              </h2>
              <p className="text-lg text-slate-600">
                {cmsMission?.content?.body || 'We believe that the best travel experiences come from connecting with locals who share their passion, knowledge, and culture. Our platform makes it easy to find authentic guided experiences across Nepal.'}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">500+ Guides</h3>
                <p className="text-slate-500">Local experts ready to share their knowledge</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">5 Cities</h3>
                <p className="text-slate-500">Covering Nepal's most popular destinations</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">1000+ Experiences</h3>
                <p className="text-slate-500">Unique activities for every traveler</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">50k+ Travelers</h3>
                <p className="text-slate-500">Happy customers from around the world</p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section data-cms-id="about-values" data-cms-label="Our Values" className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-xl shadow-sm">
                <h3 className="font-bold text-xl mb-3 text-primary">Authenticity</h3>
                <p className="text-slate-600">Every experience is led by a local who lives and breathes their culture. No scripts, no tourist traps—just real connections.</p>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-sm">
                <h3 className="font-bold text-xl mb-3 text-primary">Sustainability</h3>
                <p className="text-slate-600">We support local communities and promote responsible tourism that benefits both travelers and hosts.</p>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-sm">
                <h3 className="font-bold text-xl mb-3 text-primary">Community</h3>
                <p className="text-slate-600">We're building a global community of curious travelers and passionate locals who believe in the power of shared experiences.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Story</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Founded in 2020, Guides Nepal was born from a simple idea: that travel should be about connections, not just destinations. We work with local guides across Kathmandu, Pokhara, Lalitpur, Bhaktapur, and Bharatpur to create unforgettable experiences.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;