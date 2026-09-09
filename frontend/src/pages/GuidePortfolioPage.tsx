import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { 
  ArrowLeft, Star, MapPin, 
  Award, Calendar, MessageCircle, Check 
} from 'lucide-react';
import { allGuides } from '../data/guidesData';
import { Guide } from '../data/types';

const GuidePortfolioPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [guide, setGuide] = useState<Guide | null>(null);

  useEffect(() => {
    const guideId = id ? parseInt(id) : 1;
    const foundGuide = allGuides.find(g => g.id === guideId) || allGuides[0];
    setGuide(foundGuide);
  }, [id]);

  if (!guide) return null;

  // Mock Portfolio Data
  const portfolioHighlights = [
    {
      title: "Everest Base Camp Expedition 2023",
      role: "Lead Guide",
      date: "April 2023",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
      description: "Led a group of 12 trekkers to EBC. Successfully managed altitude acclimatization for all members. 100% summit success rate for Kalapatthar."
    },
    {
      title: "National Geographic Documentary Fixer",
      role: "Local Coordinator",
      date: "Nov 2022",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
      description: "Assisted a film crew in locating authentic cultural spots in Bhaktapur and Patan. Managed logistics and translation for interviews with local artisans."
    },
    {
      title: "Sustainable Tourism Workshop",
      role: "Speaker",
      date: "Jan 2024",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
      description: "Conducted a workshop for new guides on sustainable trekking practices and waste management in the Himalayas."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white">
      <Header />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-gray-600 hover:text-[#213448] font-bold mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          
          {/* Title Section */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">{guide.name}'s Portfolio</h1>
            <div className="flex items-center space-x-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < 5 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 uppercase tracking-wider font-medium">
              <span>Professional Guide</span>
              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
              <span>Since 2018</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2">
              {/* Hero Image */}
              <div className="relative rounded-2xl overflow-hidden mb-8 h-[400px] group">
                <img 
                  src={guide.gallery?.[0] || guide.image} 
                  alt={guide.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm">
                  <Award className="w-5 h-5 text-gray-700 hover:text-primary cursor-pointer transition-colors" />
                </div>
              </div>

              {/* Guide Stats/Bio Block */}
              <div className="mb-12 pb-8 border-b border-gray-100 flex flex-col md:flex-row gap-6 items-start">
                 <img src={guide.image} alt={guide.name} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg" />
                 <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">My Professional Journey</h2>
                    <p className="text-gray-600 leading-relaxed">
                       I started my career as a porter in the Annapurna region and worked my way up to become a certified city and trekking guide. 
                       My passion lies in bridging the gap between travelers and the authentic local lifestyle of Nepal.
                    </p>
                    <div className="flex flex-wrap gap-4 mt-4">
                       <div className="flex items-center gap-1 text-sm font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                          <Check className="w-4 h-4 text-green-500" /> Government Certified
                       </div>
                       <div className="flex items-center gap-1 text-sm font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                          <Check className="w-4 h-4 text-green-500" /> First Aid Trained
                       </div>
                       <div className="flex items-center gap-1 text-sm font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                          <Check className="w-4 h-4 text-green-500" /> English/French Speaker
                       </div>
                    </div>
                 </div>
              </div>

              {/* Portfolio Highlights */}
              <div className="prose prose-lg max-w-none text-gray-600">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Projects & Expeditions</h2>
                
                <div className="space-y-8">
                   {portfolioHighlights.map((item, index) => (
                      <div key={index} className="flex flex-col md:flex-row gap-6 bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
                         <div className="md:w-1/3 h-48 md:h-auto">
                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                         </div>
                         <div className="p-6 md:w-2/3 flex flex-col justify-center">
                            <div className="flex items-center justify-between mb-2">
                               <span className="text-[#213448] font-bold text-xs uppercase tracking-wide">{item.role}</span>
                               <span className="text-gray-400 text-xs font-medium flex items-center gap-1"><Calendar className="w-3 h-3" /> {item.date}</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2 mt-0 leading-tight">{item.title}</h3>
                            <p className="text-sm text-gray-600 mb-0">{item.description}</p>
                         </div>
                      </div>
                   ))}
                </div>

                <div className="my-12">
                   <h2 className="text-2xl font-bold text-gray-900 mb-4">My Philosophy</h2>
                   <blockquote className="border-l-4 border-[#213448] pl-4 italic text-gray-700 bg-gray-50 p-4 rounded-r-lg">
                      "Travel is not just about seeing new places; it's about feeling them. I believe in sustainable tourism that respects local communities and preserves our heritage for future generations."
                   </blockquote>
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-8">
                
                {/* Contact Box */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                   <h3 className="font-bold text-xl text-gray-900 mb-2">Work with me</h3>
                   <p className="text-sm text-gray-500 mb-6">Looking for a guide for your next documentary, research trip, or private expedition?</p>
                   
                   <div className="space-y-4 mb-6">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                            <MessageCircle className="w-5 h-5" />
                         </div>
                         <div>
                            <div className="text-xs font-bold text-gray-500 uppercase">Consultation</div>
                            <div className="font-bold text-gray-900">Free 15-min call</div>
                         </div>
                      </div>
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                            <MapPin className="w-5 h-5" />
                         </div>
                         <div>
                            <div className="text-xs font-bold text-gray-500 uppercase">Specialty</div>
                            <div className="font-bold text-gray-900">Custom Itineraries</div>
                         </div>
                      </div>
                   </div>

                   <button 
                     onClick={() => navigate(`/local/${guide.id}/contact`)}
                     className="w-full bg-[#213448] hover:bg-[#1a2a3a] text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-primary/20"
                   >
                     Send Inquiry
                   </button>
                </div>

                {/* Similar Profiles / Colleagues */}
                <div>
                   <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">My Colleagues</h3>
                   <div className="space-y-4">
                      {allGuides.filter(g => g.id !== guide.id).slice(0, 3).map((colleague) => (
                         <div 
                           key={colleague.id} 
                           className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group"
                           onClick={() => {
                              navigate(`/local/${colleague.id}`);
                              window.scrollTo({ top: 0, behavior: 'instant' });
                           }}
                         >
                            <img src={colleague.image} alt={colleague.name} className="w-12 h-12 rounded-full object-cover" />
                            <div>
                               <h4 className="font-bold text-gray-900 group-hover:text-[#213448] transition-colors">{colleague.name}</h4>
                               <p className="text-xs text-gray-500">{colleague.role}</p>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default GuidePortfolioPage;
