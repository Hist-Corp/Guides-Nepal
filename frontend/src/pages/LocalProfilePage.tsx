import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { 
  Star, ShieldCheck, MapPin, MessageCircle, Clock, 
  Check, Share, Play, Package, User, Award, Calendar, X, ArrowLeft
} from 'lucide-react';
import guidesApi, { Guide } from '../services/guidesApi';
import { kathmanduRichData } from '../data/kathmanduRichData';
import { pokharaRichData } from '../data/pokharaRichData';
import { lalitpurRichData } from '../data/lalitpurRichData';

// Combine all experiences for lookup
const allExperiences = [
  ...kathmanduRichData,
  ...pokharaRichData,
  ...lalitpurRichData
];

const LocalProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showHowItWorksModal, setShowHowItWorksModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);

  useEffect(() => {
    const fetchGuide = async () => {
      try {
        const guideId = id ? parseInt(id) : 1;
        const guideData = await guidesApi.getGuide(guideId);
        setGuide(guideData);
      } catch (error) {
        console.error('Error fetching guide:', error);
        // Fallback to default guide if API fails
        setGuide({
          id: 1,
          name: "Apicha",
          image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80",
          role: "Cultural Expert",
          rating: 4.9,
          reviews: 120,
          bio: "Expert in Kathmandu Valley history, culture, and hidden gems. Passionate about sharing authentic Nepali experiences.",
          languages: ["English", "Nepali", "Newari"],
          verified: true,
          livesIn: "Kathmandu",
          cities: ["Kathmandu", "Bhaktapur"],
          gallery: [
            "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1740&q=80",
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1740&q=80",
            "https://images.unsplash.com/photo-1605640840605-14ac1855827b?auto=format&fit=crop&w=1740&q=80"
          ],
          is_active: true
        });
      }
    };

    fetchGuide();
  }, [id]);

  if (!guide) return null;

  // Mock Portfolio Data
  const portfolioHighlights = [
    {
      title: "Everest Base Camp Expedition 2023",
      role: "Lead Guide",
      date: "April 2023",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1740&q=80",
      description: "Led a group of 12 trekkers to EBC. Successfully managed altitude acclimatization for all members. 100% summit success rate for Kalapatthar."
    },
    {
      title: "National Geographic Documentary Fixer",
      role: "Local Coordinator",
      date: "Nov 2022",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1740&q=80",
      description: "Assisted a film crew in locating authentic cultural spots in Bhaktapur and Patan. Managed logistics and translation for interviews with local artisans."
    },
    {
      title: "Sustainable Tourism Workshop",
      role: "Speaker",
      date: "Jan 2024",
      image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1740&q=80",
      description: "Conducted a workshop for new guides on sustainable trekking practices and waste management in the Himalayas."
    }
  ];

  // Find tours offered by this guide across ALL cities
  const myTours = allExperiences.filter(tour => 
    tour.guides?.some(g => g.id === guide.id)
  );

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white">
      <Header />
      
      <main className="flex-grow bg-gray-50/50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-gray-600 hover:text-[#213448] font-bold mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          
          <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Left Sidebar - Sticky Profile Card */}
            <div className="lg:w-1/3">
              <div className="sticky top-24 space-y-6">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-3">
                      <div className="w-28 h-28 rounded-full p-1 border-2 border-[#213448]">
                        <img 
                          src={guide.image} 
                          alt={guide.name} 
                          className="w-full h-full rounded-full object-cover"
                          onError={(e) => (e.currentTarget.src = '/images/placeholder.svg')}
                        />
                      </div>
                      {guide.verified && (
                        <div className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow-md" title="Verified Host">
                          <ShieldCheck className="w-4 h-4 text-[#213448] fill-white" />
                        </div>
                      )}
                    </div>
                    
                    <h1 className="text-xl font-bold text-gray-900 mb-0.5">{guide.name}</h1>
                    <p className="text-[#213448] font-bold text-xs uppercase tracking-wide mb-3">{guide.role}</p>
                    
                    <div className="flex items-center gap-1 mb-4">
                      <div className="flex text-[#FFD700]">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                      <span className="font-bold text-gray-900 text-sm">{guide.rating}</span>
                      <span className="text-gray-500 text-xs">({guide.reviews} reviews)</span>
                    </div>

                    <div className="w-full space-y-3 text-left border-t border-gray-100 pt-4">
                      <div className="flex items-start gap-2.5 text-xs text-gray-600">
                        <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-gray-900 block">Lives in</span>
                          {guide.livesIn || "Kathmandu"}
                        </div>
                      </div>

                      {/* Added Cities Supported */}
                      <div className="flex items-start gap-2.5 text-xs text-gray-600">
                        <MapPin className="w-4 h-4 text-[#213448] shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-gray-900 block">Guides in</span>
                          <div className="flex flex-wrap gap-1 mt-0.5">
                             {guide.cities.map(city => (
                               <span key={city} className="bg-[#213448]/10 text-[#213448] text-[10px] px-1.5 py-0.5 rounded font-bold">
                                 {city}
                               </span>
                             ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2.5 text-xs text-gray-600">
                        <MessageCircle className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-gray-900 block">Speaks</span>
                          {guide.languages.join(", ")}
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 text-xs text-gray-600">
                        <Clock className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-gray-900 block">Response time</span>
                          {guide.responseTime || "within a few hours"}
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 text-xs text-gray-600">
                        <Package className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-gray-900 block">Experience</span>
                          {myTours.length > 0 ? `${myTours.length} offers` : "Custom tours"}
                        </div>
                      </div>

                      {guide.verified && (
                        <div className="flex items-start gap-2.5 text-xs text-gray-600">
                          <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-gray-900 block">Verified Host</span>
                            <span className="text-[10px]">Identity & contact info verified</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <button 
                      onClick={() => {
                        navigate(`/local/${guide.id}/contact`);
                        window.scrollTo({ top: 0, behavior: 'instant' });
                      }}
                      className="w-full mt-6 bg-[#213448] hover:bg-[#1a2a3a] text-white font-bold py-2.5 rounded-full transition-colors shadow-lg shadow-primary/20 text-sm"
                    >
                      Contact me
                    </button>
                    
                    <div className="mt-3 flex gap-2">
                       <button className="flex-1 text-gray-500 text-xs font-medium hover:text-gray-900 flex items-center justify-center gap-1.5 py-1.5 rounded-full hover:bg-gray-50 transition-colors">
                         <Share className="w-3.5 h-3.5" /> Share
                       </button>
                       <button 
                         className="flex-1 text-gray-500 text-xs font-medium hover:text-gray-900 flex items-center justify-center gap-1.5 py-1.5 rounded-full hover:bg-gray-50 transition-colors"
                         onClick={() => {
                           navigate(`/local/${guide.id}/contact`);
                            window.scrollTo({ top: 0, behavior: 'instant' });
                         }}
                       >
                         <User className="w-3.5 h-3.5" /> Portfolio
                       </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Main Info */}
            <div className="lg:w-2/3 space-y-12">
              
              {/* Bio Section with Portfolio Style */}
              <section>
                <div className="relative rounded-2xl overflow-hidden mb-8 h-[400px] group shadow-sm">
                  <img 
                    src={guide.gallery?.[0] || guide.image} 
                    alt={guide.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => (e.currentTarget.src = '/images/placeholder.svg')}
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm">
                    <Award className="w-5 h-5 text-gray-700 hover:text-primary cursor-pointer transition-colors" />
                  </div>
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-4">Hi there! Nice to meet you</h2>
                
                <div className="prose prose-lg text-gray-600 max-w-none">
                  <p>{guide.bio}</p>
                  
                  {/* Portfolio Badges */}
                  <div className="flex flex-wrap gap-3 my-6 not-prose">
                     <div className="flex items-center gap-1 text-xs font-bold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
                        <Check className="w-3.5 h-3.5 text-green-500" /> Government Certified
                     </div>
                     <div className="flex items-center gap-1 text-xs font-bold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
                        <Check className="w-3.5 h-3.5 text-green-500" /> First Aid Trained
                     </div>
                     <div className="flex items-center gap-1 text-xs font-bold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
                        <Check className="w-3.5 h-3.5 text-green-500" /> English/French Speaker
                     </div>
                  </div>

                  <p>
                    I love meeting new people and showing them the hidden gems of my city. 
                    Whether you are a foodie, a history buff, or just looking for a good time, 
                    I can customize the perfect experience for you.
                  </p>
                  
                  {isBioExpanded && (
                    <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      <p>
                        Growing up in Nepal has given me a deep appreciation for our rich culture and traditions. 
                        I've spent years exploring every corner of the valley, finding the best local eateries, 
                        ancient temples that aren't on the tourist maps, and viewpoints with the most breathtaking sunrises.
                      </p>
                      <p>
                        My goal is to make you feel like a local, not just a tourist. We'll navigate the bustling markets together, 
                        share stories over cups of masala chai, and create memories that you'll cherish long after you leave. 
                        I'm flexible and happy to adjust our plans based on your interests and pace.
                      </p>
                      <p>
                        Safety and comfort are my top priorities. I'm trained in first aid and know the city inside out. 
                        Let's embark on an adventure that goes beyond the guidebooks!
                      </p>
                    </div>
                  )}

                  <button 
                    onClick={() => setIsBioExpanded(!isBioExpanded)}
                    className="text-[#213448] font-bold text-sm uppercase tracking-wide mt-4 hover:underline"
                  >
                    {isBioExpanded ? 'Read less' : 'Read more'}
                  </button>
                </div>
              </section>

              {/* Portfolio Highlights Section (Added from Portfolio Page) */}
              <section className="border-t border-gray-100 pt-12">
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
                            <p className="text-sm text-gray-600 mb-0 leading-relaxed">{item.description}</p>
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
              </section>

              {/* Gallery Section */}
              {guide.gallery && guide.gallery.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">My thoughts in pictures</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {guide.gallery.slice(1).map((img, i) => (
                      <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity shadow-sm">
                        <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {/* Add one more placeholder if only 1 image in gallery slice */}
                    {guide.gallery.length < 3 && (
                       <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center text-gray-400">
                          <span>More moments coming soon</span>
                       </div>
                    )}
                  </div>
                  <button 
                    onClick={() => {
                      navigate(`/local/${guide.id}/gallery`);
                      window.scrollTo({ top: 0, behavior: 'instant' });
                    }}
                    className="text-[#213448] font-bold text-sm uppercase tracking-wide mt-4 hover:underline"
                  >
                    View all photos
                  </button>
                </section>
              )}

              {/* Offers Section */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Book one of my offers</h2>
                <p className="text-gray-500 mb-8">
                  Check out the personalized tours I can offer you across Nepal. Each experience can be 100% tailored to your wishes!
                </p>
                
                <div className="space-y-6">
                  {myTours.length > 0 ? myTours.map((tour) => (
                    <div 
                      key={tour.id} 
                      onClick={() => {
                        const citySlug = tour.city?.toLowerCase() || 'kathmandu';
                        navigate(`/city/${citySlug}/experience/${tour.slug}`);
                        window.scrollTo({ top: 0, behavior: 'instant' });
                      }}
                      className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md border border-gray-100 transition-all cursor-pointer flex flex-col md:flex-row gap-6 group"
                    >
                      <div className="w-full md:w-48 h-48 md:h-auto rounded-xl overflow-hidden shrink-0 relative">
                        <img src={tour.heroImage} alt={tour.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide text-gray-800">
                          {tour.city || "Nepal"}
                        </div>
                      </div>
                      
                      <div className="flex flex-col justify-between py-2 flex-grow">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#213448] transition-colors">
                            {tour.title}
                          </h3>
                          <p className="text-gray-500 line-clamp-2 text-sm mb-4">
                            {tour.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs font-bold text-gray-600 uppercase tracking-wide">
                             <span className="flex items-center gap-1">
                               <Clock className="w-4 h-4" /> {tour.duration || "3 hours"}
                             </span>
                             <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                             <span>{tour.type}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-50">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-[#FFD700] text-[#FFD700]" />
                            <span className="font-bold text-gray-900">4.9</span>
                            <span className="text-gray-400 text-sm">(120)</span>
                          </div>
                          <div className="text-right">
                             <span className="text-xs text-gray-400 uppercase mr-2">From</span>
                             <span className="text-xl font-bold text-gray-900">€{tour.price}</span>
                             <span className="text-xs text-gray-400"> pp</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                       <p className="text-gray-500">No specific offers listed yet. Contact me for a custom tour!</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Review CTA */}
              <section className="bg-secondary/10 rounded-2xl p-8 text-center relative overflow-hidden">
                <div className="relative z-10">
                   <div className="w-16 h-16 rounded-full bg-white mx-auto mb-4 p-1 shadow-sm">
                      <img src={guide.image} className="w-full h-full rounded-full object-cover" alt={guide.name} />
                   </div>
                   <h3 className="text-xl font-bold text-[#213448] mb-2">Did you meet me?</h3>
                   <p className="text-gray-600 mb-6 max-w-md mx-auto">
                     Share your experience with the community! Your review helps others find the best local guides.
                   </p>
                   <button 
                     onClick={() => setShowReviewModal(true)}
                     className="bg-[#213448] text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl hover:bg-[#1a2a3a] transition-all"
                   >
                     Leave a review
                   </button>
                   <button 
                     onClick={() => setShowHowItWorksModal(true)}
                     className="block mx-auto mt-4 text-xs font-bold text-[#213448] uppercase tracking-wide hover:underline"
                   >
                     How does it work?
                   </button>
                </div>
                {/* Decorative circles */}
                <div className="absolute -top-12 -left-12 w-32 h-32 bg-[#213448]/10 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-[#213448]/10 rounded-full blur-2xl"></div>
              </section>

              {/* Reviews List */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Reviews</h2>
                <div className="space-y-8">
                  {[
                    { name: "Sarah J.", date: "October 2025", text: "Absolutely amazing experience! The food was incredible and the stories were even better.", rating: 5 },
                    { name: "Mike T.", date: "September 2025", text: "We felt like we were walking around with a friend. Highly recommend!", rating: 5 },
                    { name: "Emma W.", date: "August 2025", text: "Such a knowledgeable guide. We learned so much about the local culture.", rating: 5 }
                  ].map((review, i) => (
                    <div key={i} className="flex gap-4 border-b border-gray-100 pb-8 last:border-0">
                       <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500 shrink-0">
                          {review.name[0]}
                       </div>
                       <div>
                          <div className="flex items-center gap-2 mb-1">
                             <span className="font-bold text-gray-900">{review.name}</span>
                             <span className="text-gray-400 text-sm">• {review.date}</span>
                          </div>
                          <div className="flex text-[#FFD700] mb-3">
                             {[...Array(review.rating)].map((_, r) => <Star key={r} className="w-3 h-3 fill-current" />)}
                          </div>
                          <p className="text-gray-600 leading-relaxed">"{review.text}"</p>
                       </div>
                    </div>
                  ))}
                </div>
                <button className="w-full py-4 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors mt-4">
                  Show all {guide.reviews} reviews
                </button>
              </section>

              {/* This is Guides Nepal Section */}
              <section className="space-y-6 pt-8 border-t border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">This is Guides Nepal</h2>
                <div className="rounded-2xl overflow-hidden relative aspect-video group cursor-pointer">
                   <img 
                     src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1740&q=80" 
                     alt="This is Guides Nepal" 
                     className="w-full h-full object-cover brightness-75 group-hover:scale-105 transition-transform duration-700"
                   />
                   <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/50 transition-colors">
                         <Play className="w-8 h-8 fill-white text-white ml-1" />
                      </div>
                   </div>
                </div>
              </section>

              {/* App Download Banner */}
              <section className="bg-[#570D46] rounded-2xl p-8 md:p-12 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
                 <div className="relative z-10 max-w-md">
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">Connect with locals wherever and whenever!</h2>
                    <p className="text-white/80 mb-8">
                       Get the app to become part of the fastest growing travel community. 
                       Join now & pull up a chair at the table with our hosts, friends and chefs!
                    </p>
                    <div className="flex gap-4">
                       <button className="bg-black/30 hover:bg-black/50 p-2 rounded-lg border border-white/20 flex items-center gap-2 pr-4 transition-colors">
                          <div className="w-6 h-6 bg-white rounded-full"></div> {/* Apple Icon Placeholder */}
                          <div className="text-left">
                             <div className="text-[10px] uppercase">Download on the</div>
                             <div className="text-sm font-bold leading-none">App Store</div>
                          </div>
                       </button>
                       <button className="bg-black/30 hover:bg-black/50 p-2 rounded-lg border border-white/20 flex items-center gap-2 pr-4 transition-colors">
                          <div className="w-6 h-6 bg-white rounded-full"></div> {/* Play Store Icon Placeholder */}
                          <div className="text-left">
                             <div className="text-[10px] uppercase">Get it on</div>
                             <div className="text-sm font-bold leading-none">Google Play</div>
                          </div>
                       </button>
                    </div>
                 </div>
                 <div className="relative z-10 w-64 md:w-80 shrink-0">
                    <img 
                      src="https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?auto=format&fit=crop&w=800&q=80" 
                      alt="App Preview" 
                      className="w-full rounded-2xl shadow-2xl border-4 border-white/10 rotate-6 hover:rotate-0 transition-transform duration-500"
                    />
                 </div>
                 
                 {/* Background decoration */}
                 <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-[#213448]/20 to-transparent pointer-events-none"></div>
              </section>

            </div>
          </div>
        </div>
      </main>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowReviewModal(false)}>
          <div 
            className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-300"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Leave a Review</h3>
              <button 
                onClick={() => setShowReviewModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <img src={guide.image} alt={guide.name} className="w-16 h-16 rounded-full object-cover" />
                <div>
                  <p className="text-sm text-gray-500">Reviewing</p>
                  <h4 className="font-bold text-gray-900 text-lg">{guide.name}</h4>
                </div>
              </div>
              
              <form className="space-y-4" onSubmit={(e) => {
                e.preventDefault();
                if (selectedRating === 0) {
                  alert("Please select a rating!");
                  return;
                }
                alert(`Thank you for your ${selectedRating}-star review! It will be posted after moderation.`);
                setShowReviewModal(false);
                setSelectedRating(0);
              }}>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button 
                        type="button" 
                        key={star} 
                        onClick={() => setSelectedRating(star)}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star 
                          className={`w-8 h-8 transition-colors ${
                            star <= selectedRating 
                              ? "text-[#FFD700] fill-[#FFD700]" 
                              : "text-gray-300 hover:text-[#FFD700] hover:fill-[#FFD700]"
                          }`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Your experience</label>
                  <textarea 
                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-[#213448] focus:border-transparent outline-none min-h-[120px]"
                    placeholder="Tell us about your tour..."
                    required
                  ></textarea>
                </div>
                
                <button 
                  type="submit"
                  className="w-full bg-[#213448] hover:bg-[#1a2a3a] text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-primary/20"
                >
                  Submit Review
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* How it Works Modal */}
      {showHowItWorksModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowHowItWorksModal(false)}>
          <div 
            className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-300"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">How Reviews Work</h3>
              <button 
                onClick={() => setShowHowItWorksModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[#213448]/10 flex items-center justify-center shrink-0">
                  <Check className="w-5 h-5 text-[#213448]" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Verified Experiences</h4>
                  <p className="text-sm text-gray-600">Only travelers who have booked and completed a tour with this guide can leave a review. This ensures all feedback is authentic.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[#213448]/10 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-[#213448]" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Community Guidelines</h4>
                  <p className="text-sm text-gray-600">We moderate reviews to ensure they follow our community guidelines. We don't edit the content, but we remove spam or abusive language.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[#213448]/10 flex items-center justify-center shrink-0">
                  <Star className="w-5 h-5 text-[#213448]" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Fair Rating System</h4>
                  <p className="text-sm text-gray-600">Guides are rated on knowledge, friendliness, and service quality. The overall score is a weighted average of all past reviews.</p>
                </div>
              </div>

              <button 
                onClick={() => setShowHowItWorksModal(false)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold py-3 rounded-xl transition-colors mt-4"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default LocalProfilePage;
