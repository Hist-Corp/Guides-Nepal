import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoBack } from '../utils/backNavigation';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { ArrowLeft, ArrowRight, X, Leaf, HandHeart, ShieldCheck, Globe, Users } from 'lucide-react';
import { Button } from '../components/common/Button';

const ImpactReportPage: React.FC = () => {
  const navigate = useNavigate();
  const goBack = useGoBack();
  const [activeCard, setActiveCard] = useState<number | null>(null);

  const impactCards = [
    {
      id: 1,
      title: 'Reduce the Impact of Tourism on Climate Change',
      icon: <Leaf className="w-8 h-8" />,
      color: 'bg-slate-50 border-slate-200 text-slate-600',
      stat: '8%',
      statLabel: 'of global carbon emissions from tourism',
      content: (
        <div className="space-y-6">
          <p className="text-slate-600 leading-relaxed">
            Tourism accounts for roughly 8% of the world&rsquo;s carbon emissions. At Guides Nepal,
            we are committed to reducing this footprint by focusing on low-impact, local
            experiences.
          </p>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Leaf className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Carbon Offsetting</h4>
                <p className="text-slate-500 text-sm">
                  We partner with local forestry projects to offset the carbon footprint of every
                  trip booked through our platform.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Leaf className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Slow Travel</h4>
                <p className="text-slate-500 text-sm">
                  We encourage longer stays and slower modes of transport to minimize emissions per
                  traveler.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Leaf className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Plastic-Free</h4>
                <p className="text-slate-500 text-sm">
                  We actively campaign against single-use plastics and provide filtered water
                  stations on our tours.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      title: 'Maximize Local Benefits',
      icon: <HandHeart className="w-8 h-8" />,
      color: 'bg-slate-50 border-slate-200 text-slate-600',
      stat: '100%',
      statLabel: 'local guides setting their own rates',
      content: (
        <div className="space-y-6">
          <p className="text-slate-600 leading-relaxed">
            Tourism should benefit the communities visited, not just the visitors. We ensure that
            the money you spend stays in the local economy.
          </p>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Users className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">100% Local Guides</h4>
                <p className="text-slate-500 text-sm">
                  All our guides are locals who set their own rates and keep the majority of the
                  fee.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <ShieldCheck className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Community Fund</h4>
                <p className="text-slate-500 text-sm">
                  A portion of our profits goes directly into a community fund that supports local
                  schools and healthcare initiatives.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Globe className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Supporting Small Business</h4>
                <p className="text-slate-500 text-sm">
                  Our tours prioritize visits to family-owned restaurants, artisan workshops, and
                  local markets.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      title: 'Respect & Protect',
      icon: <ShieldCheck className="w-8 h-8" />,
      color: 'bg-slate-50 border-slate-200 text-slate-600',
      stat: 'Zero',
      statLabel: 'captive animal tours offered',
      content: (
        <div className="space-y-6">
          <p className="text-slate-600 leading-relaxed">
            We believe in travel that respects local cultures and protects natural habitats. Our
            &ldquo;Respect &amp; Protect&rdquo; policy guides every interaction.
          </p>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <ShieldCheck className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Animal Welfare</h4>
                <p className="text-slate-500 text-sm">
                  We do not offer tours that involve captive animals or unethical wildlife
                  interactions.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Users className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Cultural Sensitivity</h4>
                <p className="text-slate-500 text-sm">
                  We provide travelers with guidelines on local customs, dress codes, and etiquette
                  before they arrive.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Leaf className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Heritage Preservation</h4>
                <p className="text-slate-500 text-sm">
                  We work with heritage sites to ensure our tours contribute to their conservation
                  rather than their degradation.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const missionItems = [
    {
      icon: <Users className="w-6 h-6 text-slate-600" />,
      title: 'People',
      subtitle: 'Empowering local guides and communities',
      description:
        'Every booking puts income directly into the hands of local guides, families, and small businesses across Nepal.',
    },
    {
      icon: <Leaf className="w-6 h-6 text-slate-600" />,
      title: 'Places',
      subtitle: "Protecting Nepal's natural heritage",
      description:
        'Low-impact experiences, plastic-free tours, and carbon offsetting keep our trails and peaks pristine for generations.',
    },
    {
      icon: <Globe className="w-6 h-6 text-slate-600" />,
      title: 'Planet',
      subtitle: 'Sustainable travel for a healthier world',
      description:
        'Slow travel, filtered water stations, and forestry partnerships reduce the footprint of every journey.',
    },
  ];

  const exploreCards = [
    {
      id: 1,
      title: 'Local Culture & Heritage',
      description: 'Immerse yourself in authentic traditions, temples, and living history.',
      image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80',
      link: '/explore?category=culture',
    },
    {
      id: 2,
      title: 'Mountain Trekking',
      description: 'Hike the Himalayas with certified local guides who know every trail.',
      image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
      link: '/explore?category=trekking',
    },
    {
      id: 3,
      title: 'Food & Cooking',
      description: 'Learn Nepali cuisine from local chefs in family kitchens and markets.',
      image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80',
      link: '/explore?category=food',
    },
    {
      id: 4,
      title: 'Wildlife & Nature',
      description: "Discover Chitwan's rhinos, tigers, and birds with wildlife experts.",
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80',
      link: '/explore?category=wildlife',
    },
  ];

  return (
    <div className="min-h-screen font-sans text-slate-900 bg-white">
      <Header />

      <main id="main-content" className="relative">
        {/* Back Button — consistently below header */}
        <div className="absolute top-0 left-0 z-20 mt-6 ml-6 md:ml-8">
          <button
            onClick={goBack}
            className="w-10 h-10 bg-white p-0 rounded-full border border-slate-200 shadow-sm flex items-center justify-center hover:bg-slate-50 hover:border-slate-300 transition-colors duration-200"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4.5 h-4.5 text-slate-600 hover:text-[#213448] transition-colors duration-200" />
          </button>
        </div>

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
            <div className="absolute inset-0 bg-gradient-to-t from-[#213448] via-[#213448]/45 to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-[#213448]/60 to-transparent"></div>
          </div>

          <div className="container mx-auto px-6 relative z-10 max-w-4xl pt-12 pb-20">
            <div className="flex items-center gap-2 mb-6">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/85 backdrop-blur-sm border border-slate-200 text-[#213448] text-xs font-semibold uppercase tracking-wider shadow-sm">
                2024 Impact Report
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-white leading-[1.15] mb-6 tracking-tight">
              Traveling with <span className="font-bold text-brand-yellow">people</span>,{' '}
              <span className="font-bold text-brand-yellow">places</span> &amp;{' '}
              <span className="font-bold text-white">the planet</span> in mind
            </h1>

            <p className="text-lg text-white/90 mb-10 max-w-xl leading-relaxed font-normal">
              Curious and conscious travel is at the heart of everything we do. Discover how we put
              people, places, and the planet first in every journey.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                className="bg-[#213448] text-white hover:bg-slate-700 px-8 py-4 text-base font-medium rounded-full border-none transition-colors shadow-sm hover:shadow-md"
                onClick={() => setActiveCard(1)}
              >
                Read our report
              </Button>
              <Button
                variant="outline"
                className="border-white/25 text-white hover:bg-white hover:text-[#213448] px-8 py-4 text-base font-medium rounded-full transition-colors shadow-sm hover:shadow-md"
                onClick={() => navigate('/sustainability')}
              >
                Learn about our impact
              </Button>
            </div>

            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 text-white/60 text-sm font-medium uppercase tracking-wider">
              <p className="tracking-[0.15em]">Our journey</p>
              <ArrowRight className="w-3.5 h-3.5 rotate-90 animate-[bounce_2s_infinite]" />
            </div>
          </div>
        </section>

        {/* ============================================
           SECTION DIVIDER
           ============================================ */}
        <div className="py-16">
          <div className="container mx-auto px-6 text-center">
            <div className="w-12 h-[1px] bg-slate-200 mx-auto mb-8" />
            <h2 className="text-3xl md:text-4xl font-light text-[#213448] max-w-2xl mx-auto leading-tight tracking-tight">
              See how we turn words into action.
            </h2>
          </div>
        </div>

        {/* ============================================
           MISSION SECTION - People / Places / Planet
           ============================================ */}
        <section className="py-24 bg-white border-y border-slate-100 relative overflow-hidden">
          <div className="absolute inset-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=80')] bg-cover bg-center opacity-8" />

          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-16">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                    <Leaf className="w-5 h-5 text-slate-600" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-light text-[#213448] leading-tight tracking-tight">
                    Traveling with people, places &amp; the planet in mind
                  </h2>
                </div>
                <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
                  Our impact isn&rsquo;t measured in bookings&mdash;it&rsquo;s measured in lives
                  improved, ecosystems protected, and cultures preserved.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {missionItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-8 rounded-2xl border border-slate-200 bg-white transition-colors duration-200 hover:border-slate-300 hover:bg-slate-50"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mb-5 border border-slate-200 shadow-sm">
                      {item.icon}
                    </div>
                    <h3 className="text-xl font-light text-[#213448] mb-2 tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-600 font-medium mb-3">{item.subtitle}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============================================
           IMPACT CARDS SECTION
           ============================================ */}
        <section className="py-24 bg-slate-50/30">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-sm font-medium text-[#213448] uppercase tracking-wider">
                Impact Pillars
              </span>
              <h2 className="text-3xl md:text-4xl font-light text-[#213448] mt-6 leading-tight tracking-tight">
                Three pillars of responsible travel
              </h2>
              <p className="text-lg text-slate-600 mt-4 max-w-xl mx-auto leading-relaxed">
                Every tour we offer advances at least one of these commitments to people, places,
                and the planet.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {impactCards.map((card) => (
                <div
                  key={card.id}
                  className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:border-slate-300 transition-colors duration-200 cursor-pointer h-full flex flex-col"
                  onClick={() => setActiveCard(card.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setActiveCard(card.id)}
                >
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    <img
                      src={`https://images.unsplash.com/photo-${card.id === 1 ? '1444464666168-49d633b86797' : card.id === 2 ? '1454496522488-7a8e488e8606' : '1414235077428-338989a2e8c0'}?w=800&q=80`}
                      alt={card.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-white/90 px-3 py-1.5 rounded-full shadow-sm">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                        {card.stat}
                      </span>
                    </div>
                  </div>

                  <div className="p-7 flex flex-col h-full">
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex items-center gap-2 mb-5">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shadow-sm">
                          {card.icon}
                        </div>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          Pillar {card.id}
                        </span>
                      </div>
                      <h3 className="text-xl font-light text-[#213448] mb-4 leading-tight tracking-tight">
                        {card.title}
                      </h3>
                      <p className="text-slate-600 leading-relaxed mb-6 text-sm line-clamp-4">
                        {card.content.props.children[0]?.props.children || card.title}
                      </p>
                    </div>
                    <Button
                      className="w-full bg-[#213448] text-white hover:bg-slate-700 text-sm font-medium py-3 rounded-xl border-none transition-colors"
                      onClick={() => setActiveCard(card.id)}
                    >
                      View details <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Details Modal */}
        {activeCard && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label="Impact details"
          >
            <div className="bg-white rounded-2xl max-w-2xl w-full p-0 shadow-xl flex flex-col max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <button
                  onClick={() => setActiveCard(null)}
                  className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-600 hover:text-[#213448]"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
                <h3 className="text-xl font-light text-[#213448] tracking-tight">
                  {impactCards.find((c) => c.id === activeCard)?.title}
                </h3>
                <div className="w-8" />
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className={`w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shadow-sm`}
                  >
                    {impactCards.find((c) => c.id === activeCard)?.icon}
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {impactCards.find((c) => c.id === activeCard)?.stat}
                  </span>
                  <span className="text-xs text-slate-500 font-medium ml-2">
                    {impactCards.find((c) => c.id === activeCard)?.statLabel}
                  </span>
                </div>

                {impactCards.find((c) => c.id === activeCard)?.content}

                <div className="pt-6 border-t border-slate-100 flex justify-end">
                  <Button
                    className="bg-[#213448] text-white hover:bg-slate-700 rounded-full px-6 py-2.5 text-sm font-medium border-none transition-colors"
                    onClick={() => setActiveCard(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================
           B CORP SECTION
           ============================================ */}
        <section className="py-24 bg-[#213448] text-white overflow-hidden relative">
          <div className="absolute inset-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1471291011286-91b2a7e6c7e0?w=1600&q=80')] bg-cover bg-center opacity-20" />

          <div className="container mx-auto px-6 relative z-10 text-center max-w-3xl">
            <div className="flex justify-center mb-10">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-2 border-brand-yellow/40 rounded-full" />
                <div className="relative w-full h-full flex items-center justify-center border-2 border-brand-yellow rounded-full bg-[#213448]">
                  <span className="text-3xl font-bold text-brand-yellow tracking-tighter">B</span>
                  <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-brand-yellow flex items-center justify-center text-[8px] font-black text-[#213448]">
                    CORP
                  </span>
                </div>
              </div>
            </div>

            <h2 className="text-3xl md:text-4xl font-light mb-6 leading-tight tracking-tight">
              Guides Nepal is B Corp certified
            </h2>
            <p className="text-lg text-slate-300 mb-12 leading-relaxed max-w-xl mx-auto">
              Since 2024, we&rsquo;ve joined a global movement of people using business as a force
              for good. B Corp certification measures our entire social and environmental
              impact&mdash;from how we treat our guides to how we protect the places we explore.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                className="bg-brand-yellow text-[#213448] hover:bg-[#e6a900] font-medium px-8 py-4 rounded-full text-base border-none transition-colors"
                onClick={() => navigate('/sustainability')}
              >
                View our B Corp profile
              </Button>
              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white hover:text-[#213448] px-8 py-4 font-medium rounded-full border-none transition-colors"
                onClick={() => navigate('/explore')}
              >
                Start traveling sustainably
              </Button>
            </div>
          </div>
        </section>

        {/* ============================================
           START EXPLORING SECTION
           ============================================ */}
        <section className="py-24 bg-white border-t border-slate-100 relative overflow-hidden">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-light text-[#213448] leading-tight mb-6 tracking-tight">
                Start traveling.
                <br />
                <span className="text-brand-yellow font-bold">The sustainable way.</span>
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
                Be the friends and family who explore with people, planet, and purpose in mind.
                Enjoy life-changing experiences while celebrating sustainable travel with locals.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {exploreCards.map((card) => (
                <div
                  key={card.id}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:border-slate-300 transition-colors duration-200 group cursor-pointer"
                  onClick={() => navigate(card.link)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(card.link)}
                >
                  <div className="h-48 overflow-hidden bg-slate-100 relative">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm border border-slate-100/50 text-[10px] font-semibold text-[#213448] uppercase tracking-wider">
                      Sustainable
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-light text-[#213448] mb-3 leading-tight tracking-tight">
                      {card.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed mb-6">
                      {card.description}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100/50">
                      <span className="text-[10px] font-bold text-[#213448] uppercase tracking-wider">
                        View experiences
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 transition-colors" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-20 flex justify-center">
              <Button
                className="bg-[#213448] text-white hover:bg-slate-700 font-medium px-10 py-4 text-base rounded-full border-none transition-colors"
                onClick={() => navigate('/explore')}
              >
                Start exploring
              </Button>
            </div>
          </div>
        </section>

        {/* ============================================
           HOST RECRUITMENT
           ============================================ */}
        <section className="py-24 bg-slate-50/30 border-t border-slate-100 text-center relative overflow-hidden">
          <div className="container mx-auto px-6 relative z-10">
            <h2 className="text-4xl md:text-5xl font-light text-[#213448] leading-tight mb-6 tracking-tight">
              Join our mission.
              <br />
              Become a <span className="font-bold text-brand-yellow">host</span>.
            </h2>
            <p className="text-slate-600 mb-12 max-w-2xl mx-auto text-lg leading-relaxed">
              Visit us in your city, join our community, and teach travelers our global community of
              Guides Nepal hosts. Fuel your passion into practice.
            </p>
            <Button
              className="bg-[#213448] text-white hover:bg-slate-700 font-medium px-10 py-4 text-base rounded-full border-none transition-colors"
              onClick={() => navigate('/become-host')}
            >
              Become a host
            </Button>
          </div>
        </section>

        {/* ============================================
           QUOTE SECTION
           ============================================ */}
        <section className="py-24 bg-[#213448] text-white text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-yellow/30 to-transparent" />
          <div className="container mx-auto px-6 max-w-4xl relative z-10">
            <blockquote className="text-3xl md:text-4xl font-light leading-tight mb-8 text-white tracking-tight">
              &ldquo;I believe that by putting people and planet first, profit will always
              follow.&rdquo;
            </blockquote>
            <cite className="text-white/60 font-medium tracking-wide text-xs uppercase">
              &mdash; Guides Nepal Team
            </cite>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ImpactReportPage;
