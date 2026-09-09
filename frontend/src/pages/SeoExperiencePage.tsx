import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { 
  Check, MapPin, Wifi, Wind, Coffee, 
  Ban, ShieldCheck, Star, Heart, Award,
  Utensils, Camera, Ticket, Bus, Home, ChevronRight, 
  Gift, Globe, X, ArrowLeft, User
} from 'lucide-react';
import { seoExperiences, Guide } from '../data/seoExperiences';
import { ExperienceCurrencyConverter } from '../components/common/ExperienceCurrencyConverter';

const ReadMoreText = ({ 
  text, 
  limit = 150, 
  textClassName = "text-gray-600 leading-relaxed text-lg", 
  buttonClassName = "ml-2 font-bold underline decoration-gray-900 decoration-1 underline-offset-2 text-gray-900 hover:text-gray-700 inline-block text-base" 
}: { 
  text: string; 
  limit?: number; 
  textClassName?: string;
  buttonClassName?: string;
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Reset expansion state when text changes
  React.useEffect(() => {
    setIsExpanded(false);
  }, [text]);
  
  if (!text || text.length <= limit) {
    return <p className={textClassName}>{text}</p>;
  }

  return (
    <div>
      <p className={`${textClassName} inline`}>
        {isExpanded ? text : `${text.substring(0, limit)}...`}
      </p>
      <button 
        onClick={() => setIsExpanded(!isExpanded)} 
        className={buttonClassName}
      >
        {isExpanded ? 'Show less' : 'Show more'}
      </button>
    </div>
  );
};

const SeoExperiencePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const data = seoExperiences[slug || ''];
  const [selectedDate, setSelectedDate] = useState('');
  const [guests, setGuests] = useState(1);
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(data?.guides?.[0] || null);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [viewingGuide, setViewingGuide] = useState<Guide | null>(null);

  useEffect(() => {
    if (data?.guides && data.guides.length > 0) {
        setSelectedGuide(data.guides[0]);
    }
  }, [slug, data]);

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col font-sans">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
             <h1 className="text-4xl font-bold text-gray-800 mb-4">Experience not found</h1>
             <Link to="/" className="text-primary font-bold hover:underline">Go Home</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const getAmenityIcon = (amenity: string) => {
    const lower = amenity.toLowerCase();
    if (lower.includes('wifi')) return <Wifi className="w-5 h-5" />;
    if (lower.includes('food') || lower.includes('lunch') || lower.includes('tasting')) return <Utensils className="w-5 h-5" />;
    if (lower.includes('drink') || lower.includes('coffee')) return <Coffee className="w-5 h-5" />;
    if (lower.includes('photo')) return <Camera className="w-5 h-5" />;
    if (lower.includes('transport') || lower.includes('boat')) return <Bus className="w-5 h-5" />;
    if (lower.includes('ticket') || lower.includes('entrance')) return <Ticket className="w-5 h-5" />;
    if (lower.includes('first aid')) return <ShieldCheck className="w-5 h-5" />;
    if (lower.includes('heating')) return <Wind className="w-5 h-5" />;
    return <Check className="w-5 h-5" />;
  };

  const getHighlightIcon = (item: string) => {
    const lower = item.toLowerCase();
    if (lower.includes('location')) return <MapPin className="w-5 h-5" />;
    if (lower.includes('private')) return <Home className="w-5 h-5" />;
    if (lower.includes('free')) return <Award className="w-5 h-5" />;
    if (lower.includes('non-smoking')) return <Ban className="w-5 h-5" />;
    return <Star className="w-5 h-5" />;
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background-white text-gray-800">
      <Header />
      
      <main className="flex-grow pt-8 pb-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-gray-600 hover:text-primary font-bold mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          
          {/* Header Title Section (Above Layout) */}
          <div className="mb-6">
             <h1 className="text-3xl md:text-[2.5rem] font-bold text-gray-900 mb-2 leading-tight">{data.title}</h1>
             <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1 font-medium text-gray-900">
                  <Star className="w-3.5 h-3.5 fill-accent text-accent" />
                  {data.rating}
                  <span className="text-gray-500 underline decoration-gray-400 decoration-1 underline-offset-2">({data.reviewsCount} reviews)</span>
                </span>
                <span className="text-gray-300">·</span>
                <span className="flex items-center gap-1 underline decoration-gray-400 decoration-1 underline-offset-2 font-medium text-gray-700 cursor-pointer hover:text-gray-900">
                  <Award className="w-3.5 h-3.5 text-primary" />
                  Superhost
                </span>
                <span className="text-gray-300">·</span>
                <span className="flex items-center gap-1 underline decoration-gray-400 decoration-1 underline-offset-2 font-medium text-gray-700 cursor-pointer hover:text-gray-900">
                  {data.location}
                </span>
             </div>
          </div>

          {/* Hero Image / Gallery */}
          <div className="relative rounded-xl overflow-hidden aspect-[16/9] md:aspect-[2/1] lg:aspect-[2.5/1] mb-8 group">
            <img 
              src={data.heroImage} 
              alt={data.title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <button className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm hover:bg-white p-2 rounded-full shadow-sm transition-all flex items-center gap-2 px-4 group/btn">
              <Heart className="w-4 h-4 text-gray-700 group-hover/btn:text-primary transition-colors" />
              <span className="text-xs font-bold text-gray-700 underline group-hover/btn:text-primary transition-colors">Save</span>
            </button>
          </div>

          {/* Anchor Tabs (OCR Requirement) */}
          <div className="sticky top-0 z-20 bg-background-white pt-4 pb-2 border-b border-gray-200 mb-8 overflow-x-auto flex">
            {[
              { label: 'Overview', id: 'overview' },
              { label: 'Amenities', id: 'amenities' },
              { label: 'Reviews', id: 'reviews' },
              { label: 'Location', id: 'location' }
            ].map((tab, i) => (
              <button 
                key={i} 
                onClick={() => scrollToSection(tab.id)}
                className={`py-4 mr-8 font-medium text-sm border-b-2 transition-colors whitespace-nowrap border-transparent text-gray-500 hover:text-primary hover:border-primary`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] gap-16 relative">
            
            {/* LEFT COLUMN - Main Content */}
            <div className="space-y-12">
              
              {/* Host & Brief Info */}
              <div id="overview" className="flex justify-between items-start border-b border-gray-200 pb-8 scroll-mt-28">
                <div>
                   <h2 className="text-2xl font-bold text-gray-900 mb-1">
                     Hosted by {data.author.name}
                   </h2>
                   <p className="text-gray-500 mb-4">
                     {data.space?.propertyType} · {data.space?.roomType}
                   </p>
                   {data.space && (
                     <div className="flex gap-4 text-gray-600 text-sm">
                        <span>{data.tourStructure.steps.length} stops</span>
                        <span>·</span>
                        <span>{data.space.bathrooms} bathroom</span>
                        <span>·</span>
                        <span>3 hours duration</span>
                     </div>
                   )}
                </div>
                <div className="relative">
                  <img 
                    src={data.author.image} 
                    alt={data.author.name} 
                    className="w-14 h-14 rounded-full object-cover border border-gray-200"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
                    <ShieldCheck className="w-3 h-3 text-primary" />
                  </div>
                </div>
              </div>

              {/* Highlights */}
              <div className="space-y-6 border-b border-gray-200 pb-8">
                {data.highlights.items.slice(0, 4).map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="text-gray-600 mt-1">
                      {getHighlightIcon(item)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm mb-0.5">{item}</h3>
                      <p className="text-gray-500 text-sm">One of the most loved features of this experience.</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div className="space-y-6 border-b border-gray-200 pb-8">
                <h2 className="text-2xl font-bold text-gray-900">What to expect</h2>
                <div className="prose prose-slate max-w-none text-gray-600">
                  <ReadMoreText 
                    text={data.description} 
                    limit={200}
                    textClassName="leading-relaxed whitespace-pre-line"
                    buttonClassName="flex items-center gap-1 font-bold underline decoration-gray-900 decoration-1 underline-offset-2 text-gray-900 hover:text-gray-700 mt-4"
                  />
                </div>
                
                {data.secondaryImage && (
                  <div className="rounded-xl overflow-hidden aspect-video my-6">
                    <img src={data.secondaryImage} alt="Experience Detail" className="w-full h-full object-cover" />
                  </div>
                )}
                
                {/* Additional Content for Overview */}
                {data.whatIncluded && (
                   <div className="mt-6 pt-6 border-t border-gray-100">
                      <h3 className="font-bold text-gray-900 mb-2">What's included</h3>
                      <p className="text-gray-600 leading-relaxed">{data.whatIncluded}</p>
                   </div>
                )}

                {data.whatNotIncluded && (
                   <div className="mt-6 pt-6 border-t border-gray-100">
                      <h3 className="font-bold text-gray-900 mb-2">What's not included</h3>
                      <p className="text-gray-600 leading-relaxed">{data.whatNotIncluded}</p>
                   </div>
                )}
              </div>

              {/* Who you'll meet (New Section from visual cues) */}
              {data.guides && (
                <div className="space-y-6 border-b border-gray-200 pb-8">
                  <div className="flex justify-between items-center">
                     <h2 className="text-2xl font-bold text-gray-900">Who you'll meet</h2>
                     <span className="text-sm text-gray-500">Select a guide to see their availability</span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {data.guides.map((guide, i) => (
                      <div 
                        key={i} 
                        className={`
                          relative flex flex-col items-center p-4 rounded-xl border transition-all cursor-pointer group
                          ${selectedGuide?.id === guide.id 
                            ? 'border-black ring-1 ring-black bg-gray-50' 
                            : 'border-gray-200 hover:border-gray-400 hover:shadow-md'
                          }
                        `}
                        onClick={() => setSelectedGuide(guide)}
                      >
                        {selectedGuide?.id === guide.id && (
                          <div className="absolute top-2 right-2 bg-black text-white rounded-full p-0.5">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                        <img src={guide.image} alt={guide.name} className="w-20 h-20 rounded-full object-cover mb-3" />
                        <span className="font-bold text-gray-900 text-sm">{guide.name}</span>
                        <span className="text-xs text-gray-500 text-center mb-2">{guide.role}</span>
                        
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewingGuide(guide);
                            setShowGuideModal(true);
                          }}
                          className="text-xs font-bold underline decoration-gray-400 decoration-1 underline-offset-2 hover:text-primary mt-auto"
                        >
                          View Profile
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Amenities */}
              <div id="amenities" className="space-y-6 border-b border-gray-200 pb-8 scroll-mt-28">
                <h2 className="text-2xl font-bold text-gray-900">What this place offers</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                  {data.amenities.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 text-gray-700">
                      <div className="text-gray-600">
                        {getAmenityIcon(item)}
                      </div>
                      <span className="text-gray-600">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-4">
                  <button className="border border-black bg-white text-gray-900 font-bold py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                    Show all {data.amenities.length} amenities
                  </button>
                </div>
              </div>

              {/* Location Map */}
              <div id="location" className="space-y-6 border-b border-gray-200 pb-8 scroll-mt-28">
                 <h2 className="text-2xl font-bold text-gray-900">Where you'll be</h2>
                 <p className="text-gray-600">{data.location}</p>
                 {data.locationDescription && (
                    <ReadMoreText 
                       text={data.locationDescription}
                       limit={150}
                       textClassName="text-gray-600 leading-relaxed whitespace-pre-line mb-4 block"
                       buttonClassName="font-bold underline decoration-gray-900 decoration-1 underline-offset-2 text-gray-900 flex items-center gap-1"
                    />
                 )}
                 <div className="rounded-xl overflow-hidden h-[400px] relative bg-gray-100 group">
                    {data.mapImage ? (
                      <img src={data.mapImage} alt="Map Location" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <MapPin className="w-12 h-12" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="bg-white p-3 rounded-full shadow-lg">
                        <Home className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                 </div>
              </div>

              {/* Reviews */}
              <div id="reviews" className="space-y-8 border-b border-gray-200 pb-8 scroll-mt-28">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-5 h-5 fill-accent text-accent" />
                  <h2 className="text-2xl font-bold text-gray-900">{data.rating} · {data.reviewsCount} reviews</h2>
                </div>
                
                <div className="flex flex-col gap-8">
                  {data.reviews.slice(0, 6).map((review) => (
                    <div key={review.id} className="space-y-3">
                      <div className="flex items-center gap-3">
                        <img src={review.avatar} alt={review.author} className="w-10 h-10 rounded-full object-cover" />
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm">{review.author}</h4>
                          <p className="text-xs text-gray-500">{review.date}</p>
                        </div>
                      </div>
                      <ReadMoreText 
                        text={review.content} 
                        limit={120}
                        textClassName="text-sm text-gray-600 leading-relaxed whitespace-pre-line" 
                        buttonClassName="text-sm font-bold underline decoration-gray-900 decoration-1 underline-offset-2 text-gray-900 hover:text-gray-700 ml-1"
                      />
                    </div>
                  ))}
                </div>
                <button className="border border-black bg-white text-gray-900 font-bold py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  Show all {data.reviewsCount} reviews
                </button>
              </div>

              {/* Host Details */}
              <div className="space-y-6 border-b border-gray-200 pb-8">
                <div className="flex items-center gap-4 mb-4">
                   <img src={data.author.image} alt={data.author.name} className="w-16 h-16 rounded-full object-cover" />
                   <div>
                      <h2 className="text-2xl font-bold text-gray-900">Hosted by {data.author.name}</h2>
                      <p className="text-gray-500 text-sm">Joined in {data.author.joined}</p>
                   </div>
                </div>
                
                <div className="flex flex-col md:flex-row gap-8">
                   <div className="flex-1 space-y-4">
                      <div className="flex gap-2 text-gray-600">
                         <Star className="w-4 h-4 text-accent fill-accent" />
                         <span className="text-sm">{data.reviewsCount} Reviews</span>
                      </div>
                      <div className="flex gap-2 text-gray-600">
                         <ShieldCheck className="w-4 h-4 text-primary" />
                         <span className="text-sm">Identity verified</span>
                      </div>
                      <div className="flex gap-2 text-gray-600">
                         <Award className="w-4 h-4 text-primary" />
                         <span className="text-sm">Superhost</span>
                      </div>
                   </div>
                   <div className="flex-1 space-y-4">
                      <p className="text-gray-600 text-sm leading-relaxed">
                         Response rate: {data.author.responseRate}%<br/>
                         Response time: {data.author.responseTime}
                      </p>
                      <button className="border border-black bg-white text-gray-900 font-bold py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                        Contact Host
                      </button>
                   </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 pt-4">
                   <ShieldCheck className="w-3 h-3" />
                   <span>To protect your payment, never transfer money or communicate outside of the guides-nepal website or app.</span>
                </div>
              </div>

              {/* Things to know */}
              <div className="space-y-6">
                 <h2 className="text-2xl font-bold text-gray-900">Things to know</h2>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
                    {/* House Rules */}
                    <div>
                       <h3 className="font-bold text-gray-900 mb-3">House Rules</h3>
                       <div className="text-gray-600">
                         <ul className="space-y-2 mb-2">
                            {data.houseRules.slice(0, 3).map((rule, i) => (
                               <li key={i}>{rule}</li>
                            ))}
                         </ul>
                         {data.houseRules.length > 3 && (
                            <ReadMoreText 
                              text={data.houseRules.slice(3).join('\n')} 
                              limit={0}
                              textClassName="space-y-2 block"
                              buttonClassName="font-bold underline decoration-gray-900 decoration-1 underline-offset-2 text-gray-900 mt-3 flex items-center gap-1"
                            />
                         )}
                       </div>
                    </div>
                    {/* Safety */}
                    <div>
                       <h3 className="font-bold text-gray-900 mb-3">Safety & property</h3>
                       <div className="text-gray-600">
                         <ul className="space-y-2 mb-2">
                            {data.safety?.items.slice(0, 2).map((item, i) => (
                               <li key={i}>{item}</li>
                            ))}
                         </ul>
                         {data.safety?.items && data.safety.items.length > 2 && (
                            <ReadMoreText 
                              text={data.safety.items.slice(2).join('\n')} 
                              limit={0}
                              textClassName="space-y-2 block"
                              buttonClassName="font-bold underline decoration-gray-900 decoration-1 underline-offset-2 text-gray-900 mt-3 flex items-center gap-1"
                            />
                         )}
                       </div>
                    </div>
                    {/* Cancellation */}
                    <div>
                       <h3 className="font-bold text-gray-900 mb-3">Cancellation policy</h3>
                       <ReadMoreText 
                          text={data.cancellation || ''} 
                          limit={100}
                          textClassName="text-gray-600 leading-relaxed"
                          buttonClassName="font-bold underline decoration-gray-900 decoration-1 underline-offset-2 text-gray-900 mt-3 flex items-center gap-1"
                       />
                    </div>
                 </div>
              </div>

            </div>

            {/* RIGHT COLUMN - Sticky Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 space-y-6">
                
                {/* Booking Widget */}
                <div className="border border-gray-200 rounded-xl shadow-[0_6px_16px_rgba(0,0,0,0.12)] p-6 bg-white">
                  <div className="flex justify-between items-end mb-6">
                    <div>
                      <span className="text-2xl font-bold text-gray-900">€{data.price}</span>
                      <span className="text-gray-500 text-sm"> / person</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm font-bold text-gray-700">
                      <Star className="w-3 h-3 fill-accent text-accent" />
                      {data.rating}
                      <span className="text-gray-400 font-normal underline decoration-gray-400 decoration-1 underline-offset-2">({data.reviewsCount} reviews)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="p-3.5 border border-gray-300 rounded-2xl hover:border-gray-800 focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all cursor-pointer bg-white">
                        <label className="block text-[10px] font-bold uppercase text-gray-800 tracking-wider mb-0.5">Check-in</label>
                        <input 
                          type="date" 
                          className="w-full text-sm outline-none text-gray-600 bg-transparent cursor-pointer font-medium"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                        />
                    </div>
                    <div className="p-3.5 border border-gray-300 rounded-2xl hover:border-gray-800 focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all cursor-pointer bg-white">
                        <label className="block text-[10px] font-bold uppercase text-gray-800 tracking-wider mb-0.5">Check-out</label>
                        <input 
                          type="date" 
                          className="w-full text-sm outline-none text-gray-600 bg-transparent cursor-pointer font-medium"
                        />
                    </div>
                  </div>

                  <div className="p-3.5 border border-gray-300 rounded-2xl mb-4 hover:border-gray-800 focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all cursor-pointer bg-white relative">
                      <label className="block text-[10px] font-bold uppercase text-gray-800 tracking-wider mb-0.5">Guests</label>
                      <select 
                        className="w-full text-sm outline-none text-gray-600 bg-transparent cursor-pointer appearance-none font-medium"
                        value={guests}
                        onChange={(e) => setGuests(Number(e.target.value))}
                      >
                        {[1,2,3,4,5,6].map(n => (
                          <option key={n} value={n}>{n} guest{n > 1 ? 's' : ''}</option>
                        ))}
                      </select>
                      <ChevronRight className="w-4 h-4 absolute right-4 top-1/2 mt-1 -translate-y-1/2 rotate-90 text-gray-500 pointer-events-none" />
                  </div>

                  {/* Selected Guide Display */}
                  {selectedGuide && (
                    <div className="p-3 bg-secondary/5 border border-secondary/20 rounded-xl flex items-center gap-3 mb-6">
                       <img src={selectedGuide.image} alt={selectedGuide.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-white" />
                       <div>
                          <label className="block text-[10px] font-bold uppercase text-secondary tracking-wider">Selected Guide</label>
                          <span className="text-sm font-bold text-gray-900">{selectedGuide.name}</span>
                       </div>
                    </div>
                  )}

                  <button className="w-full bg-secondary hover:bg-secondary-hover text-white font-bold py-3.5 rounded-lg mb-4 transition-colors text-lg shadow-sm">
                    Book Now
                  </button>

                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-4">You won't be charged yet</p>
                    <ExperienceCurrencyConverter price={data.price} />
                    <div className="flex justify-between text-gray-600 mb-3 text-sm">
                      <span className="underline decoration-gray-300">€{data.price} x {guests} guests</span>
                      <span>€{data.price * guests}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 mb-3 text-sm">
                      <span className="underline decoration-gray-300">Cleaning fee</span>
                      <span>€15</span>
                    </div>
                    <div className="flex justify-between text-gray-600 border-b border-gray-200 pb-4 mb-4 text-sm">
                      <span className="underline decoration-gray-300">Service fee</span>
                      <span>€0</span>
                    </div>
                    <div className="flex justify-between font-bold text-gray-900 text-lg">
                      <span>Total</span>
                      <span>€{(data.price * guests) + 15}</span>
                    </div>
                  </div>
                </div>

                {/* Secondary Card: Gift / Private (Visual match) */}
                <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
                   <div className="flex gap-4 items-start mb-4">
                      <div className="p-2 bg-secondary/10 rounded-lg">
                        <Gift className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Gift this experience</h3>
                        <p className="text-xs text-gray-500 mt-1">Surprise your friends with a unique local tour.</p>
                      </div>
                   </div>
                   <button className="w-full border border-primary text-primary font-bold py-3 rounded-lg hover:bg-secondary/10/20 transition-colors text-sm">
                     Buy a Gift Card
                   </button>
                </div>

                {/* Report */}
                <div className="flex items-center justify-center gap-2 text-gray-500 text-xs mt-6">
                  <ShieldCheck className="w-3 h-3" />
                  <span className="underline decoration-gray-400 cursor-pointer hover:text-gray-800">Report this listing</span>
                </div>

              </div>
            </div>

          </div>

          {/* Similar Listings - Bottom */}
          <div className="mt-20 pt-10 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Similar experiences nearby</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {data.similarListings.map((item, i) => (
                <div key={i} className="group cursor-pointer">
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <button className="absolute top-3 right-3 bg-white/80 p-1.5 rounded-full hover:bg-white">
                      <Heart className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1">{item.title}</h3>
                      <div className="flex items-center gap-1 text-sm font-medium">
                        <Star className="w-3 h-3 fill-accent text-accent" />
                        {item.rating}
                      </div>
                    </div>
                    <p className="text-gray-500 text-sm">{item.location}</p>
                    <p className="text-gray-900 font-medium mt-1">
                      <span className="font-bold">€{item.price}</span> / person
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
      
      {/* Guide Details Modal */}
      {showGuideModal && viewingGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowGuideModal(false)}>
          <div 
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-300"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex justify-between items-center z-10">
              <h3 className="font-bold text-lg">Guide Profile</h3>
              <button onClick={() => setShowGuideModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8">
              <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
                <img src={viewingGuide.image} alt={viewingGuide.name} className="w-32 h-32 rounded-full object-cover border-4 border-gray-50 shadow-lg" />
                <div className="space-y-4">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-1">Hi, I'm {viewingGuide.name}</h2>
                    <p className="text-gray-500 font-medium">{viewingGuide.role}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm">
                    {viewingGuide.rating && (
                      <div className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 fill-accent text-accent" />
                        <span className="font-bold text-gray-900">{viewingGuide.rating}</span>
                        <span className="text-gray-500">({viewingGuide.reviews} reviews)</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Identity verified</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">About me</h3>
                  <ReadMoreText text={viewingGuide.bio || `I'm ${viewingGuide.name}, a passionate local guide who loves sharing the hidden stories of our city. I believe the best way to explore is through the eyes of a local.`} />
                </div>

                {viewingGuide.languages && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Languages I speak</h3>
                    <div className="flex flex-wrap gap-3">
                      {viewingGuide.languages.map((lang: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 px-4 py-2 bg-secondary/10 rounded-lg text-secondary font-bold text-sm tracking-wide">
                          <Globe className="w-4 h-4 text-secondary" />
                          {lang}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="pt-6 border-t border-gray-100 flex flex-col gap-3">
                  <button 
                    onClick={() => {
                      setSelectedGuide(viewingGuide);
                      setShowGuideModal(false);
                    }}
                    className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                  >
                    <Check className="w-5 h-5" />
                    Choose {viewingGuide.name} as my guide
                  </button>

                  <button 
                    onClick={() => {
                      navigate(`/local/${viewingGuide.id}`);
                      window.scrollTo({ top: 0, behavior: 'instant' });
                    }}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    View Portfolio
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default SeoExperiencePage;
