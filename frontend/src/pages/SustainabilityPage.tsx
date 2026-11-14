import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { PageBackButton } from '../components/common/PageBackButton';
import { Button } from '../components/common/Button';
import { Leaf, Users, TreePine, Heart, Globe, Recycle, ArrowRight } from 'lucide-react';

const SustainabilityPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col text-slate-900 bg-white">
      <Header />
      <PageBackButton />
      <main id="main-content" className="flex-grow relative">
        {/* ============================================
           HERO SECTION
           ============================================ */}
        <section className="relative h-[70vh] min-h-[600px] overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=90"
              alt="Himalayan mountains Nepal"
              className="w-full h-full object-cover object-center"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#213448] via-[#213448]/50 to-transparent" />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(33,52,72,0.35)_0%,rgba(33,52,72,0.15)_50%,transparent_100%)]" />
          </div>

          <div className="container mx-auto px-6 relative z-10 max-w-4xl pt-12 pb-20">
            <div className="flex items-center gap-2 mb-6">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/85 backdrop-blur-sm border border-slate-200 text-[#213448] text-xs font-semibold uppercase tracking-wider shadow-sm">
                Sustainability Report
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-white leading-[1.15] mb-6 tracking-tight">
              Travel that gives back to <span className="font-bold text-brand-yellow">people</span>{' '}
              <span className="font-bold text-brand-yellow">places</span> &amp;{' '}
              <span className="font-bold text-white">the planet</span>
            </h1>

            <p className="text-lg text-white/90 mb-10 max-w-xl leading-relaxed font-normal">
              We're committed to responsible tourism that benefits local communities and protects
              Nepal's natural beauty for generations to come.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                className="bg-[#213448] text-white hover:bg-slate-700 px-8 py-4 text-base font-medium rounded-full border-none transition-colors shadow-sm hover:shadow-md"
                onClick={() => navigate('/explore')}
              >
                Explore Sustainable Experiences
              </Button>
              <Button
                variant="outline"
                className="border-white/25 text-white hover:bg-white hover:text-[#213448] px-8 py-4 text-base font-medium rounded-full transition-colors shadow-sm hover:shadow-md"
                onClick={() => navigate('/impact-report')}
              >
                Read Our Impact Report
              </Button>
            </div>

            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 text-white/60 text-sm font-medium uppercase tracking-wider">
              <p className="tracking-[0.15em]">Our commitment</p>
              <ArrowRight className="w-3.5 h-3.5 rotate-90 animate-[bounce_2s_infinite]" />
            </div>
          </div>
        </section>

        {/* ============================================
           COMMITMENT PILLARS
           ============================================ */}
        <section className="py-24 bg-white border-y border-slate-100 relative overflow-hidden">
          <div className="absolute inset-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=80')] bg-cover bg-center opacity-6" />

          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-5xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-light text-[#213448] leading-tight tracking-tight">
                Our Commitment to Responsible Travel
              </h2>
              <p className="text-lg text-slate-600 mt-4 max-w-2xl mx-auto leading-relaxed">
                Sustainability isn't just a buzzword for us—it's at the core of everything we do. We
                believe travel should leave a positive impact on both the places we visit and the
                people who call them home.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Users className="w-6 h-6" />,
                  title: 'Local Empowerment',
                  stat: '100%',
                  statLabel: 'local guides setting their own rates',
                  description:
                    'All our guides are local residents. We ensure fair compensation and direct livelihood support, keeping tourism income within the communities we serve.',
                },
                {
                  icon: <TreePine className="w-6 h-6" />,
                  title: 'Environmental Protection',
                  stat: 'Eco-friendly',
                  statLabel: 'experiences only',
                  description:
                    'We promote low-impact, eco-conscious tours and actively minimize the environmental footprint of every journey.',
                },
                {
                  icon: <Heart className="w-6 h-6" />,
                  title: 'Cultural Preservation',
                  stat: 'Living',
                  statLabel: 'heritage & traditions',
                  description:
                    'We help preserve Nepal&rsquo;s rich cultural heritage by connecting travelers with respectful, authentic local experiences.',
                },
              ].map((pillar) => (
                <div
                  key={pillar.title}
                  className="p-8 rounded-2xl border border-slate-200 bg-white transition-colors duration-200 hover:border-slate-300 hover:bg-slate-50 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mb-5 border border-slate-200 shadow-sm group-hover:bg-[#213448] group-hover:text-white transition-colors duration-200">
                    {pillar.icon}
                  </div>
                  <h3 className="text-xl font-light text-[#213448] mb-2 tracking-tight">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-slate-600 font-medium mb-3">{pillar.statLabel}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{pillar.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================
           IMPACT GOALS
           ============================================ */}
        <section className="py-24 bg-[#FDF8F5] border-t border-slate-100">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-sm font-medium text-[#213448] uppercase tracking-wider">
                Impact Goals
              </span>
              <h2 className="text-3xl md:text-4xl font-light text-[#213448] mt-6 leading-tight tracking-tight">
                Measurable Goals for 2024–2028
              </h2>
              <p className="text-lg text-slate-600 mt-4 max-w-xl mx-auto leading-relaxed">
                Concrete, time-bound commitments that guide every decision we make as a platform.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {[
                {
                  icon: <Globe className="w-6 h-6" />,
                  title: 'Carbon Neutral by 2027',
                  description:
                    'Offsetting all carbon emissions from travel experiences on our platform.',
                },
                {
                  icon: <Recycle className="w-6 h-6" />,
                  title: 'Zero Waste Experiences',
                  description:
                    'Minimizing waste and single-use plastic across every tour we offer.',
                },
                {
                  icon: <Users className="w-6 h-6" />,
                  title: '1,000 Local Jobs',
                  description: 'Creating sustainable livelihoods for local guides by 2028.',
                },
                {
                  icon: <Leaf className="w-6 h-6" />,
                  title: 'Reforestation Program',
                  description:
                    'Planting a tree in Nepal for every booking made through our platform.',
                },
              ].map((goal) => (
                <div
                  key={goal.title}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:border-slate-300 transition-colors duration-200 group cursor-default"
                >
                  <div className="relative h-40 overflow-hidden bg-slate-100">
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                      <div
                        className={`w-12 h-12 rounded-full bg-[#213448]/10 border border-[#213448]/20 flex items-center justify-center text-[#213448]`}
                      >
                        {goal.icon}
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-light text-[#213448] mb-3 leading-tight tracking-tight">
                      {goal.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{goal.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================
           TRAVEL RESPONSIBLY CTA
           ============================================ */}
        <section className="py-24 bg-[#213448] text-white overflow-hidden relative">
          <div className="absolute inset-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1471291011286-91b2a7e6c7e0?w=1600&q=80')] bg-cover bg-center opacity-15" />
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#ffba0a]/40 to-transparent" />

          <div className="container mx-auto px-6 relative z-10 text-center max-w-3xl">
            <div className="flex justify-center mb-10">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-2 border-[#ffba0a]/30 rounded-full" />
                <div className="relative w-full h-full flex items-center justify-center border-2 border-[#ffba0a] rounded-full bg-[#213448] shadow-[0_0_0_1px_rgba(255,186,10,0.2)]">
                  <span className="text-3xl font-bold text-[#ffba0a] tracking-tighter">B</span>
                  <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#ffba0a] flex items-center justify-center text-[8px] font-black text-[#213448]">
                    CORP
                  </span>
                </div>
              </div>
            </div>

            <h2 className="text-3xl md:text-4xl font-light mb-6 leading-tight tracking-tight">
              Guides Nepal is B Corp certified
            </h2>
            <p className="text-lg text-slate-300 mb-12 leading-relaxed max-w-xl mx-auto">
              Since 2024, we've joined a global movement of people using business as a force for
              good. B Corp certification measures our entire social and environmental impact—from
              how we treat our guides to how we protect the places we explore.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button className="bg-[#ffba0a] text-[#213448] hover:bg-[#e6a900] font-medium px-8 py-4 rounded-full text-base border-none transition-colors shadow-sm hover:shadow-md">
                View Our B Corp Profile
              </Button>
              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white hover:text-[#213448] px-8 py-4 font-medium rounded-full border-none transition-colors shadow-sm hover:shadow-md"
                onClick={() => {}}
              >
                Start Traveling Sustainably
              </Button>
            </div>
          </div>
        </section>

        {/* ============================================
           JOIN THE MISSION
           ============================================ */}
        <section className="py-24 bg-white border-t border-slate-100 text-center relative overflow-hidden">
          <div className="container mx-auto px-6 relative z-10">
            <h2 className="text-4xl md:text-5xl font-light text-[#213448] leading-tight mb-6 tracking-tight">
              Be part of the change.
              <br />
              <span className="font-bold text-brand-yellow">Travel responsibly.</span>
            </h2>
            <p className="text-lg text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              Every booking supports local families, protects Nepal's ecosystems, and preserves
              cultural heritage. Choose experiences that give back.
            </p>
            <Button className="bg-[#213448] text-white hover:bg-slate-700 font-medium px-10 py-4 text-base rounded-full border-none transition-colors shadow-sm hover:shadow-md">
              Start Exploring
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default SustainabilityPage;
