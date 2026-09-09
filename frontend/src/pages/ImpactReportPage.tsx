import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { Button } from '../components/common/Button';

const ImpactReportPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeCard, setActiveCard] = useState<number | null>(null);

  const cardDetails = [
    {
      id: 1,
      title: "Reduce the Impact of Tourism on Climate Change.",
      content: (
        <div className="space-y-4">
          <p>
            Tourism accounts for roughly 8% of the world’s carbon emissions. At Guides Nepal, we are committed to reducing this footprint by focusing on low-impact, local experiences.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Carbon Offsetting:</strong> We partner with local forestry projects to offset the carbon footprint of every trip booked through our platform.</li>
            <li><strong>Slow Travel:</strong> We encourage longer stays and slower modes of transport to minimize emissions per traveler.</li>
            <li><strong>Plastic-Free:</strong> We actively campaign against single-use plastics and provide filtered water stations on our tours.</li>
          </ul>
        </div>
      )
    },
    {
      id: 2,
      title: "Maximize Local Benefits.",
      content: (
        <div className="space-y-4">
          <p>
            Tourism should benefit the communities visited, not just the visitors. We ensure that the money you spend stays in the local economy.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>100% Local Guides:</strong> All our guides are locals who set their own rates and keep the majority of the fee.</li>
            <li><strong>Community Fund:</strong> A portion of our profits goes directly into a community fund that supports local schools and healthcare initiatives.</li>
            <li><strong>Supporting Small Business:</strong> Our tours prioritize visits to family-owned restaurants, artisan workshops, and local markets.</li>
          </ul>
        </div>
      )
    },
    {
      id: 3,
      title: "Respect & Protect.",
      content: (
        <div className="space-y-4">
          <p>
            We believe in travel that respects local cultures and protects natural habitats. Our "Respect & Protect" policy guides every interaction.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Animal Welfare:</strong> We do not offer tours that involve captive animals or unethical wildlife interactions.</li>
            <li><strong>Cultural Sensitivity:</strong> We provide travelers with guidelines on local customs, dress codes, and etiquette before they arrive.</li>
            <li><strong>Heritage Preservation:</strong> We work with heritage sites to ensure our tours contribute to their conservation rather than their degradation.</li>
          </ul>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen font-sans">
      <Header />
      
      {/* Back Button (Fixed or Sticky) */}
      <div className="fixed top-24 left-4 z-50 md:left-8">
        <button 
          onClick={() => navigate(-1)} 
          className="bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition-all group"
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6 text-gray-800 group-hover:text-primary" />
        </button>
      </div>

      <main>
        {/* Hero Section */}
        <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
             <img 
               src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400" 
               alt="Impact Travel" 
               className="w-full h-full object-cover"
             />
             <div className="absolute inset-0 bg-black/40"></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10 text-white">
            <div className="max-w-3xl">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Traveling with <br/>
                <span className="text-secondary">people</span>, <span className="text-secondary">places</span> & <br/>
                the <span className="text-primary">planet</span> in mind
              </h1>
              <p className="text-xl md:text-2xl mb-8 font-medium text-white/90 max-w-2xl">
                Curious & conscious travel is at the heart of everything we do.
              </p>
              <Button className="bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-full text-lg font-bold border-none">
                Read our report
              </Button>
            </div>
          </div>
          
          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white text-center animate-bounce">
             <p className="text-sm font-bold uppercase tracking-widest mb-2">Our journey</p>
             <ArrowRight className="w-5 h-5 mx-auto rotate-90" />
          </div>
        </section>

        {/* Section Divider */}
        <div className="bg-slate-800 py-16 text-center">
          <div className="container mx-auto px-4">
             <h2 className="text-2xl md:text-3xl font-bold text-white max-w-2xl mx-auto leading-relaxed">
               See how we turn words into action.
             </h2>
          </div>
        </div>

        {/* Three Card Stack Section */}
        <section className="py-20 bg-slate-100">
           <div className="container mx-auto px-4">
              <div className="space-y-16 max-w-5xl mx-auto">
                 
                 {/* Card 1 */}
                 <div className="bg-[#FFF8F0] rounded-3xl overflow-hidden shadow-xl flex flex-col md:flex-row">
                    <div className="md:w-1/2 h-64 md:h-auto relative">
                       <img src="https://images.unsplash.com/photo-1444464666168-49d633b86797?w=400" alt="Climate Change" className="w-full h-full object-cover" />
                    </div>
                    <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                       <h3 className="text-3xl font-bold text-slate-900 mb-4">Reduce the Impact of Tourism on Climate Change.</h3>
                       <p className="text-slate-600 mb-8 leading-relaxed">
                          We prioritize sustainable tourism at the core of our business, working to minimize carbon footprints and promote eco-friendly practices across all our destinations.
                       </p>
                       <div>
                          <Button 
                            className="bg-primary hover:bg-primary-hover text-white rounded-full px-8 border-none"
                            onClick={() => setActiveCard(1)}
                          >
                             Read more
                          </Button>
                       </div>
                    </div>
                 </div>

                 {/* Card 2 */}
                 <div className="bg-[#FFF8F0] rounded-3xl overflow-hidden shadow-xl flex flex-col md:flex-row-reverse">
                    <div className="md:w-1/2 h-64 md:h-auto relative">
                       <img src="https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=400" alt="Local Benefits" className="w-full h-full object-cover" />
                    </div>
                    <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                       <h3 className="text-3xl font-bold text-slate-900 mb-4">Maximize Local Benefits.</h3>
                       <p className="text-slate-600 mb-8 leading-relaxed">
                          We exist to empower locals, improve their livelihoods and enable them to boost local economies through authentic cultural exchange.
                       </p>
                       <div>
                          <Button 
                            className="bg-primary hover:bg-primary-hover text-white rounded-full px-8 border-none"
                            onClick={() => setActiveCard(2)}
                          >
                             Read more
                          </Button>
                       </div>
                    </div>
                 </div>

                 {/* Card 3 */}
                 <div className="bg-[#FFF8F0] rounded-3xl overflow-hidden shadow-xl flex flex-col md:flex-row">
                    <div className="md:w-1/2 h-64 md:h-auto relative">
                       <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400" alt="Respect and Protect" className="w-full h-full object-cover" />
                    </div>
                    <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                       <h3 className="text-3xl font-bold text-slate-900 mb-4">Respect & Protect.</h3>
                       <p className="text-slate-600 mb-8 leading-relaxed">
                          We passionately promote respect towards people, animals, the planet, different cultures, and different ideas.
                       </p>
                       <div>
                          <Button 
                            className="bg-primary hover:bg-primary-hover text-white rounded-full px-8 border-none"
                            onClick={() => setActiveCard(3)}
                          >
                             Read more
                          </Button>
                       </div>
                    </div>
                 </div>

              </div>
           </div>

           {/* Details Modal */}
           {activeCard && (
             <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
               <div className="bg-white rounded-3xl max-w-2xl w-full p-8 relative shadow-2xl animate-in zoom-in-95 duration-200">
                 <button 
                   onClick={() => setActiveCard(null)}
                   className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                 >
                   <X className="w-6 h-6 text-gray-600" />
                 </button>
                 
                 <div className="mt-2">
                   <h3 className="text-3xl font-bold text-slate-900 mb-6 pr-10">
                     {cardDetails.find(c => c.id === activeCard)?.title}
                   </h3>
                   <div className="text-slate-600 text-lg leading-relaxed">
                     {cardDetails.find(c => c.id === activeCard)?.content}
                   </div>
                   
                   <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                     <Button 
                       className="bg-slate-900 text-white hover:bg-slate-800 rounded-full px-6"
                       onClick={() => setActiveCard(null)}
                     >
                       Close
                     </Button>
                   </div>
                 </div>
               </div>
             </div>
           )}
        </section>

        {/* B Corp Section */}
        <section className="py-20 bg-slate-800 text-white text-center">
           <div className="container mx-auto px-4 max-w-3xl">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-secondary">Guides Nepal is B Corp certified</h2>
              <p className="text-lg text-slate-300 mb-10 leading-relaxed">
                 Since 2024, we have been joining a global movement of people using business as a force for good. 
                 B Corp certification measures a company's entire social and environmental impact.
              </p>
              <Button className="bg-secondary hover:bg-secondary-hover text-slate-900 font-bold rounded-full px-8 mb-12 border-none">
                 Learn more
              </Button>
              
              <div className="flex justify-center">
                 <div className="w-24 h-24 border-2 border-white rounded-full flex items-center justify-center">
                    <span className="font-bold text-2xl">B</span>
                 </div>
              </div>
           </div>
        </section>

        {/* Sustainable Travel Section */}
        <section className="py-20 bg-[#1A4D2E] text-white text-center">
           <div className="container mx-auto px-4 max-w-4xl">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                 Start traveling.<br/>
                 The <span className="text-secondary">sustainable</span> way.
              </h2>
              <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
                 Be the friends and family who explore with people, planet and purpose in mind. Enjoy life-changing vibes, celebrate the sustainable way with locals.
              </p>
              <Button 
                className="bg-white text-slate-900 hover:bg-gray-100 rounded-full px-8 py-3 text-lg font-bold border-none"
                onClick={() => navigate('/explore')}
              >
                 Start exploring
              </Button>
           </div>
           
           {/* Experience Tiles */}
           <div className="container mx-auto px-4 mt-16">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                 {[1, 2, 3].map((item) => (
                    <div key={item} className="bg-white rounded-2xl overflow-hidden p-4 pb-0 h-80 flex flex-col text-left group cursor-pointer hover:-translate-y-2 transition-transform duration-300">
                       <h3 className="text-slate-900 font-bold text-xl mb-2 px-2">Local culture & heritage tours</h3>
                       <p className="text-slate-500 text-sm mb-4 px-2 line-clamp-2">Immerse yourself in the authentic traditions and history.</p>
                       <div className="flex-grow rounded-t-xl overflow-hidden mt-auto">
                          <img 
                             src={`https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400`} 
                             className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                             alt="Experience" 
                          />
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </section>

        {/* Host Recruitment */}
        <section className="py-20 bg-background-cream text-center">
           <div className="container mx-auto px-4">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                 Join our mission.<br/>
                 Become a <span className="text-primary">host</span>.
              </h2>
              <p className="text-slate-600 mb-10 max-w-2xl mx-auto text-lg">
                 Visit us in your city, join our community and teach travelers our global community of Guides Nepal hosts and fuel your passion into practice.
          </p>
          <Button 
            className="bg-primary hover:bg-primary-hover text-white rounded-full px-8 py-3 text-lg font-bold border-none"
            onClick={() => navigate('/become-host')}
          >
             Become a host
          </Button>
       </div>
    </section>

        {/* Quote Section */}
        <section className="py-24 bg-primary text-white text-center">
           <div className="container mx-auto px-4 max-w-4xl">
              <blockquote className="text-3xl md:text-5xl font-bold leading-tight mb-8">
                 "I believe that by putting people and planet first, profit will always follow."
              </blockquote>
              <cite className="not-italic font-medium text-white/80">
                 — Guides Nepal Team
              </cite>
           </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default ImpactReportPage;
