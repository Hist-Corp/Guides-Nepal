import React from 'react';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { Leaf, Users, TreePine, Heart, Globe, Recycle } from 'lucide-react';

const SustainabilityPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <section className="bg-green-700 py-20 text-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Sustainability</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              We're committed to responsible tourism that benefits local communities and protects Nepal's natural beauty.
            </p>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Commitment</h2>
              <p className="text-lg text-slate-600">
                Sustainability isn't just a buzzword for us—it's at the core of everything we do. We believe travel should leave a positive impact on both the places we visit and the people who call them home.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-green-700" />
                </div>
                <h3 className="font-bold text-lg mb-2">Local Empowerment</h3>
                <p className="text-slate-600">100% of our guides are local residents. We ensure fair compensation and support their livelihoods.</p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TreePine className="w-8 h-8 text-green-700" />
                </div>
                <h3 className="font-bold text-lg mb-2">Environmental Protection</h3>
                <p className="text-slate-600">We promote eco-friendly experiences and minimize the environmental footprint of tourism.</p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-green-700" />
                </div>
                <h3 className="font-bold text-lg mb-2">Cultural Preservation</h3>
                <p className="text-slate-600">We help preserve Nepal's rich cultural heritage by sharing it with respectful travelers.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-green-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Our Impact Goals</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <Globe className="w-6 h-6 text-green-700" />
                  <h3 className="font-bold text-lg">Carbon Neutral by 2027</h3>
                </div>
                <p className="text-slate-600">We're working to offset all carbon emissions from travel experiences on our platform.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <Recycle className="w-6 h-6 text-green-700" />
                  <h3 className="font-bold text-lg">Zero Waste Experiences</h3>
                </div>
                <p className="text-slate-600">All our experiences follow sustainable practices to minimize waste and plastic use.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="w-6 h-6 text-green-700" />
                  <h3 className="font-bold text-lg">1000 Local Jobs</h3>
                </div>
                <p className="text-slate-600">Our goal is to create 1000 sustainable livelihoods for local guides by 2028.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <Leaf className="w-6 h-6 text-green-700" />
                  <h3 className="font-bold text-lg">Reforestation Program</h3>
                </div>
                <p className="text-slate-600">For every booking made, we plant a tree in Nepal's reforestation areas.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Travel Responsibly</h2>
            <p className="text-slate-600 max-w-xl mx-auto mb-6">
              When you book with Guides Nepal, you're supporting local families and helping preserve Nepal's culture and environment for future generations.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default SustainabilityPage;