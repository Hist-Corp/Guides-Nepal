import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { 
  ChevronLeft, ChevronRight, Minus, Plus, 
  ShieldCheck, MessageCircle, ArrowLeft 
} from 'lucide-react';
import { commonGuides } from '../data/kathmanduRichData';

const ContactGuidePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [guide, setGuide] = useState(commonGuides[0]);
  
  // Form State
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [selectedDate, setSelectedDate] = useState<number | null>(23); // Default selected for demo
  const [selectedTime, setSelectedTime] = useState({ hour: '09', minute: '00', period: 'AM' });
  const [duration, setDuration] = useState(3);

  useEffect(() => {
    const guideId = id ? parseInt(id) : 1;
    const foundGuide = commonGuides.find(g => g.id === guideId) || commonGuides[0];
    setGuide(foundGuide);
  }, [id]);

  // Calendar generation helper
  const renderCalendar = () => {
    const days = [];
    // Just a demo calendar for Jan 2026 as per image
    // Empty slots for start of month
    for(let i=0; i<4; i++) days.push(<div key={`empty-${i}`} className="h-10"></div>);
    
    // Days 1-31
    for(let i=1; i<=31; i++) {
      const isSelected = i === selectedDate;
      days.push(
        <button 
          key={i}
          onClick={() => setSelectedDate(i)}
          className={`
            h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium transition-all mx-auto
            ${isSelected 
              ? 'bg-brand-yellow text-white font-bold' 
              : 'text-gray-700 hover:bg-gray-100'
            }
          `}
        >
          {i}
        </button>
      );
    }
    return days;
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white">
      <Header />
      
      <main className="flex-grow flex flex-col items-center py-12 px-4">
        
        <div className="w-full max-w-2xl space-y-10">
          
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-gray-600 hover:text-brand-yellow font-bold transition-colors self-start"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          {/* Header Section */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-gray-200">
              <img src={guide.image} alt={guide.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-brand-yellow mb-1">
                S̄wạs̄dī, I am {guide.name}!
              </h1>
              <p className="text-gray-500">
                Thanks for getting in touch.<br />
                Let's personalize your experience!
              </p>
            </div>
          </div>

          {/* Textarea Section */}
          <div className="space-y-3">
            <label className="block text-gray-500 font-medium">
              What makes a perfect tour for you? Include who's joining and your top preferences!
            </label>
            <textarea 
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none min-h-[120px] resize-none text-gray-700 placeholder-gray-400"
              placeholder="E.g., We love food tours with local specialties, street food stops, and unique dining experiences."
            ></textarea>
          </div>

          {/* Group Size Section */}
          <div className="space-y-3">
            <label className="block text-gray-500 font-medium">What is your group size</label>
            <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
              {/* Adults */}
              <div className="flex items-center justify-between p-4 bg-white">
                <span className="font-bold text-gray-900">Adults</span>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setAdults(Math.max(1, adults - 1))}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-brand-yellow hover:text-brand-yellow transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-4 text-center font-bold text-gray-900">{adults}</span>
                  <button 
                    onClick={() => setAdults(adults + 1)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-brand-yellow hover:text-brand-yellow transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {/* Children */}
              <div className="flex items-center justify-between p-4 bg-white">
                <span className="font-bold text-gray-900">Children</span>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setChildren(Math.max(0, children - 1))}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-brand-yellow hover:text-brand-yellow transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-4 text-center font-bold text-gray-900">{children}</span>
                  <button 
                    onClick={() => setChildren(children + 1)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-brand-yellow hover:text-brand-yellow transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Date and Time Section */}
          <div className="space-y-3">
            <label className="block text-gray-500 font-medium">Choose your preferred date and time</label>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              
              {/* Calendar Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <span className="font-bold text-gray-900">January 2026</span>
                <div className="flex gap-2">
                  <button className="p-1 hover:bg-gray-100 rounded-full text-brand-yellow">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button className="p-1 hover:bg-gray-100 rounded-full text-brand-yellow">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="p-4">
                <div className="grid grid-cols-7 text-center mb-2">
                  {['Mo','Tu','We','Th','Fr','Sa','Su'].map(d => (
                    <div key={d} className="text-xs text-gray-400 font-medium py-2">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-y-2">
                  {renderCalendar()}
                </div>
              </div>

              {/* Time Selection */}
              <div className="border-t border-gray-100 p-4 flex items-center justify-between">
                <span className="font-bold text-gray-900 text-sm">Start time</span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 border border-gray-200 rounded px-2 py-1">
                    <span className="font-bold text-gray-900">{selectedTime.hour}</span>
                    <span className="text-gray-400">:</span>
                    <span className="font-bold text-gray-900">{selectedTime.minute}</span>
                  </div>
                  <div className="flex bg-gray-100 rounded p-1 gap-1">
                    <button 
                      onClick={() => setSelectedTime({...selectedTime, period: 'AM'})}
                      className={`px-3 py-1 rounded text-xs font-bold transition-colors ${selectedTime.period === 'AM' ? 'bg-brand-yellow text-white' : 'text-gray-500 hover:bg-gray-200'}`}
                    >
                      AM
                    </button>
                    <button 
                      onClick={() => setSelectedTime({...selectedTime, period: 'PM'})}
                      className={`px-3 py-1 rounded text-xs font-bold transition-colors ${selectedTime.period === 'PM' ? 'bg-brand-yellow text-white' : 'text-gray-500 hover:bg-gray-200'}`}
                    >
                      PM
                    </button>
                  </div>
                </div>
              </div>

              {/* Duration */}
              <div className="border-t border-gray-100 p-4 flex items-center justify-between">
                <span className="font-bold text-gray-900 text-sm">Duration</span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setDuration(Math.max(1, duration - 0.5))}
                    className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-brand-yellow hover:text-brand-yellow"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <div className="border border-gray-200 rounded px-3 py-1 text-sm font-bold text-gray-900 min-w-[80px] text-center">
                    {duration} hours
                  </div>
                  <button 
                    onClick={() => setDuration(duration + 0.5)}
                    className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-brand-yellow hover:text-brand-yellow"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Success / Security Banner */}
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-700 text-sm">Success!</span>
            </div>
            <div className="flex items-center gap-1 opacity-50">
               {/* Cloudflare logo placeholder representation */}
               <span className="font-bold text-[10px]">CLOUDFLARE</span>
            </div>
          </div>

          {/* Submit Button */}
          <button className="w-full bg-brand-yellow hover:bg-yellow-600 text-white font-bold py-4 rounded-full text-lg shadow-lg shadow-primary/20 transition-all transform hover:-translate-y-0.5">
            Send your personalization request
          </button>

          {/* Safety Notice */}
          <div className="bg-[#FFF8E6] border border-[#FFE0B2] rounded-xl p-4 flex items-start gap-3">
             <div className="p-1 bg-brand-yellow rounded-full shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4 text-white" />
             </div>
             <div className="text-sm text-gray-600">
                <span className="font-bold text-gray-900 block mb-1">Safety first</span>
                For your safety, always communicate and transfer money via the Guides Nepal website or app. <a href="#" className="text-brand-yellow font-bold hover:underline">Learn more</a>
             </div>
          </div>

        </div>

      </main>
      
      {/* Floating Chat Button */}
      <div className="fixed bottom-8 left-8 z-50">
        <button className="w-14 h-14 bg-brand-yellow rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform text-white">
           <MessageCircle className="w-7 h-7 fill-current" />
        </button>
      </div>

      <Footer />
    </div>
  );
};

// Simple Check Icon Component for internal use
const Check = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

export default ContactGuidePage;
