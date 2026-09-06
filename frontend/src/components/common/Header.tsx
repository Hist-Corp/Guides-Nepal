import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { AlignJustify, Search, MapPin, ChevronRight, ChevronLeft, X, MessageSquare, Heart, User, ShoppingCart } from 'lucide-react';
import { LoginModal } from '../auth/LoginModal';
import { SignupModal } from '../auth/SignupModal';
import { ForgotPasswordModal } from '../auth/ForgotPasswordModal';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { useCart } from '../../contexts/CartContext';
import { CurrencyConverterModal } from './CurrencyConverterModal';

export const Header: React.FC<{ onCartOpen?: () => void }> = ({ onCartOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isSearchOpen, openSearch, closeSearch, searchQuery, setSearchQuery } = useUIStore();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { getTotalItems } = useCart();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [isCurrencyConverterOpen, setIsCurrencyConverterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'experiences' | 'guides'>('experiences');
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [hasPassedFeatured, setHasPassedFeatured] = useState(false);

  // Check if current page is Home Page
  const isHomePage = location.pathname === '/';
  const isHostApplicationPage = location.pathname === '/host-application';

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      closeSearch();
      setSearchQuery('');
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Handle Navbar Visibility (Hide on scroll down, show on scroll up)
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      // Handle Background Color Change
      // Only change color if we've scrolled past the "Featured Experiences" section
      const featuredSection = document.getElementById('featured-experiences');
      if (featuredSection) {
        const offsetTop = featuredSection.offsetTop;
        // Subtract header height (80px) to trigger slightly before/at the section
        if (currentScrollY >= offsetTop - 80) {
          setHasPassedFeatured(true);
        } else {
          setHasPassedFeatured(false);
        }
      } else {
        // Fallback for other pages: standard scroll behavior
        if (currentScrollY > 10) {
          setHasPassedFeatured(true);
        } else {
          setHasPassedFeatured(false);
        }
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Disable body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen || isSearchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen, isSearchOpen]);

  // Suggestions Data
  const suggestions = [
    { title: 'Highlights & Hidden Gems of Kathmandu', sub: 'City Highlight Tours, Kathmandu', link: '/city/kathmandu/experience/kathmandu-highlights' },
    { title: 'Sunrise at Sarangkot', sub: 'Nature Tours, Pokhara', link: '/city/pokhara/experience/sarangkot-sunrise' },
    { title: 'Patan Durbar Square Walk', sub: 'Heritage Tours, Lalitpur', link: '/city/lalitpur/experience/patan-durbar' },
    { title: 'Kathmandu', sub: 'Nepal', link: '/city/kathmandu' },
    { title: 'Pokhara', sub: 'Nepal', link: '/city/pokhara' },
    { title: 'Bhaktapur', sub: 'Nepal', link: '/city/bhaktapur' },
    { title: 'Lalitpur', sub: 'Nepal', link: '/city/lalitpur' },
  ];

  // Filtered Suggestions
  const filteredSuggestions = suggestions.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.sub.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <header 
      className={`sticky top-0 z-50 w-full border-b border-transparent transition-all duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      } ${hasPassedFeatured ? 'bg-white shadow-md' : 'bg-peach'}`}
    >
      <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-2">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
           <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
             <span className="font-bold text-xs">:)</span>
           </div>
           <span className="text-2xl font-bold text-primary tracking-tight hidden sm:block">guides-nepal</span>
        </Link>

        {/* Search Bar (Visible on non-home pages) */}
        {!isHomePage && !isHostApplicationPage && (
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full group">
              <input 
                type="text" 
                placeholder="Where are you going?" 
                readOnly
                onClick={openSearch}
                className="w-full h-12 pl-6 pr-12 rounded-full border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer text-gray-700 placeholder-gray-400 focus:outline-none"
              />
              <button 
                onClick={openSearch}
                className="absolute right-1 top-1 bottom-1 w-10 h-10 bg-brand-yellow rounded-full flex items-center justify-center text-[#213448] transition-transform group-hover:scale-105"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          {!isAuthenticated ? (
            <>
              <button 
                onClick={() => setIsLoginOpen(true)}
                className="text-base font-medium text-gray-800 hover:text-primary transition-colors"
              >
                Log in
              </button>
              <button 
                onClick={() => setIsSignupOpen(true)}
                className="bg-primary hover:bg-primary-hover text-white text-sm font-bold px-5 py-2.5 rounded-full transition-colors"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              <Link to="/bookings" className="text-sm font-bold text-gray-800 hover:text-primary transition-colors flex items-center gap-2">
                 Bookings
              </Link>
              <Link to="/chat" className="text-gray-800 hover:text-primary transition-colors">
                 <MessageSquare className="w-6 h-6" />
              </Link>
              <Link to="/favorites" className="text-gray-800 hover:text-primary transition-colors">
                 <Heart className="w-6 h-6" />
              </Link>
              <div className="relative group">
                <button onClick={() => navigate('/profile')} className="flex items-center gap-2 text-gray-800 hover:text-primary transition-colors">
                   <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border border-gray-300">
                     {user?.firstName ? (
                       <span className="font-bold text-sm text-gray-700">{user.firstName[0]}</span>
                     ) : (
                       <User className="w-5 h-5 text-gray-500" />
                     )}
                   </div>
                </button>
                {/* Dropdown for logout */}
                <div className="absolute right-0 top-full pt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 hidden group-hover:block animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-4 py-2 border-b border-gray-100 mb-2">
                     <p className="font-bold text-gray-900 truncate">{user?.firstName} {user?.lastName}</p>
                     <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary">Profile</Link>
                  <button 
                    onClick={() => {
                      logout();
                      navigate('/');
                    }} 
                    className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-bold"
                  >
                    Log out
                  </button>
                </div>
              </div>
            </>
          )}
          
          {/* Cart Icon */}
          <button
            onClick={() => onCartOpen?.()}
            className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ShoppingCart className="h-6 w-6 text-gray-700" />
            {getTotalItems() > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {getTotalItems()}
              </span>
            )}
          </button>
          
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-10 h-10 bg-white hover:bg-gray-50 text-gray-800 rounded-lg flex items-center justify-center transition-colors shadow-sm"
          >
            <AlignJustify className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Actions */}
        <div className="flex items-center gap-2 md:hidden">
           {/* Mobile Search Icon (non-home) */}
           {!isHomePage && !isHostApplicationPage && (
              <button 
                onClick={openSearch}
                className="w-10 h-10 bg-brand-yellow text-[#213448] rounded-full flex items-center justify-center shadow-sm"
              >
                 <Search className="w-5 h-5" />
              </button>
           )}
           {!isAuthenticated && (
             <>
               <button 
                 onClick={() => setIsLoginOpen(true)}
                 className="shrink-0 text-sm font-bold px-3 py-2 rounded-full transition-colors shadow-sm bg-white hover:bg-slate-50 text-gray-800"
               >
                 Log in
               </button>
               <button 
                 onClick={() => setIsSignupOpen(true)}
                 className="shrink-0 bg-brand-yellow hover:bg-[#E5A800] text-[#213448] text-sm font-bold px-3.5 py-2 rounded-full transition-colors shadow-sm"
               >
                 Sign up
               </button>
             </>
           )}
           <button 
             onClick={() => setIsMenuOpen(!isMenuOpen)}
             className="w-10 h-10 bg-white hover:bg-slate-50 text-gray-800 rounded-lg flex items-center justify-center transition-colors shadow-sm"
           >
              <AlignJustify className="w-5 h-5" />
           </button>
        </div>
      </div>

      {/* Hamburger Menu Portal */}
      {isMenuOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 backdrop-blur-md transition-opacity"
            onClick={() => setIsMenuOpen(false)}
          ></div>

          {/* Menu Content */}
          <div className="relative w-full max-w-sm h-full bg-background-cream shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="p-6 flex justify-between items-center border-b border-gray-200/50">
               <span className="font-bold text-lg text-gray-800">Menu</span>
               <button 
                 onClick={() => setIsMenuOpen(false)}
                 className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-800 hover:bg-slate-50 transition-colors shadow-sm"
               >
                 <X className="w-5 h-5" />
               </button>
            </div>
            
            <div className="flex-1 overflow-y-auto py-6 px-6 space-y-6">
              {/* Main Links */}
              <div className="space-y-1">
                <Link to="/" className="block px-4 py-3 rounded-full bg-gray-100 font-bold text-gray-800" onClick={() => setIsMenuOpen(false)}>
                  Home
                </Link>
                <Link to="/explore" className="block px-4 py-3 rounded-lg text-gray-800 font-medium hover:bg-black/5 transition-colors" onClick={() => setIsMenuOpen(false)}>
                  Explore
                </Link>


                <button  
                  onClick={() => {
                    setIsMenuOpen(false);
                    openSearch();
                  }}
                  className="w-full text-left block px-4 py-3 rounded-lg text-gray-800 font-medium hover:bg-black/5 transition-colors cursor-pointer"
                >
                  Search
                </button>
              </div>

              <div className="h-px bg-gray-200 w-full"></div>

              {/* Profile Section */}
              <div className="space-y-3">
                <h3 className="text-xs font-medium text-gray-400 px-4 uppercase tracking-wide">Profile</h3>
                <div className="space-y-1">
                  {!isAuthenticated ? (
                    <>
                      <button 
                        onClick={() => {
                          setIsLoginOpen(true);
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left block px-4 py-2 text-gray-800 font-medium hover:text-secondary hover:bg-secondary/10 rounded-lg transition-colors mx-2"
                      >
                        Log in
                      </button>
                      <button 
                        onClick={() => {
                          setIsSignupOpen(true);
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left block px-4 py-2 text-gray-800 font-medium hover:text-secondary hover:bg-secondary/10 rounded-lg transition-colors mx-2"
                      >
                        Sign up
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="px-4 py-2 mb-2">
                         <p className="font-bold text-gray-900 truncate">{user?.firstName} {user?.lastName}</p>
                         <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      <Link to="/bookings" className="block px-4 py-2 text-gray-800 font-medium hover:text-secondary hover:bg-secondary/10 rounded-lg transition-colors mx-2" onClick={() => setIsMenuOpen(false)}>
                        Bookings
                      </Link>
                      <Link to="/chat" className="block px-4 py-2 text-gray-800 font-medium hover:text-secondary hover:bg-secondary/10 rounded-lg transition-colors mx-2" onClick={() => setIsMenuOpen(false)}>
                        Chat
                      </Link>
                      <Link to="/favorites" className="block px-4 py-2 text-gray-800 font-medium hover:text-secondary hover:bg-secondary/10 rounded-lg transition-colors mx-2" onClick={() => setIsMenuOpen(false)}>
                        Favorites
                      </Link>
                      <Link to="/profile" className="block px-4 py-2 text-gray-800 font-medium hover:text-secondary hover:bg-secondary/10 rounded-lg transition-colors mx-2" onClick={() => setIsMenuOpen(false)}>
                        Profile
                      </Link>
                      <button 
                        onClick={() => {
                          logout();
                          setIsMenuOpen(false);
                          navigate('/');
                        }} 
                        className="w-full text-left block px-4 py-2 text-red-600 font-bold hover:bg-red-50 rounded-lg transition-colors mx-2"
                      >
                        Log out
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="h-px bg-gray-200 w-full"></div>

              {/* Support Section */}
              <div className="space-y-3">
                <h3 className="text-xs font-medium text-gray-400 px-4 uppercase tracking-wide">Support</h3>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setIsCurrencyConverterOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-gray-800 font-medium hover:text-secondary hover:bg-secondary/10 rounded-lg transition-colors mx-2"
                  >
                    Currency Converter
                  </button>
                  <Link to="/gift-voucher" className="block px-4 py-2 text-gray-800 font-medium hover:text-secondary hover:bg-secondary/10 rounded-lg transition-colors mx-2" onClick={() => setIsMenuOpen(false)}>
                    Buy a gift voucher
                  </Link>
                  {isAuthenticated && (
                    <Link to="/become-host" className="block px-4 py-2 text-gray-800 font-medium hover:text-secondary hover:bg-secondary/10 rounded-lg transition-colors mx-2" onClick={() => setIsMenuOpen(false)}>
                      Become a host
                    </Link>
                  )}
                  <Link to="/consent" className="block px-4 py-2 text-gray-800 font-medium hover:text-secondary hover:bg-secondary/10 rounded-lg transition-colors mx-2" onClick={() => setIsMenuOpen(false)}>
                    Consent
                  </Link>
                  <Link to="/privacy" className="block px-4 py-2 text-gray-800 font-medium hover:text-secondary hover:bg-secondary/10 rounded-lg transition-colors mx-2" onClick={() => setIsMenuOpen(false)}>
                    Privacy policy
                  </Link>
                  <Link to="/help" className="block px-4 py-2 text-gray-800 font-medium hover:text-secondary hover:bg-secondary/10 rounded-lg transition-colors mx-2" onClick={() => setIsMenuOpen(false)}>
                    Help
                  </Link>
                </div>
              </div>

              <div className="h-px bg-gray-200 w-full"></div>

            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Search Modal Portal */}
      {isSearchOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20">
          {/* Backdrop (Blurred) */}
          <div 
            className="absolute inset-0 backdrop-blur-md transition-opacity"
            onClick={() => closeSearch()}
          ></div>

          {/* Search Modal Content */}
          <div className="relative w-[600px] bg-[#FFF0E6] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 min-h-[500px]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 relative">
              <button 
                onClick={() => closeSearch()}
                className="w-8 h-8 rounded-full bg-white hover:bg-white/80 flex items-center justify-center text-[#213448] transition-colors shadow-sm"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-[#213448] font-bold text-lg absolute left-1/2 -translate-x-1/2">
                {activeTab === 'experiences' ? 'Find an experience' : 'Find a local guide'}
              </h2>
              <div className="w-8"></div> {/* Spacer for centering */}
            </div>

            <div className="px-6 pb-6">
              {/* Search Input */}
              <div className="relative mb-6">
                <input
                  type="text"
                  placeholder={activeTab === 'experiences' ? "Where are you going?" : "Find your local in..."}
                  className="w-full h-14 pl-6 pr-14 rounded-full border-2 border-transparent focus:border-brand-yellow bg-white shadow-sm text-[#213448] placeholder:text-gray-400 focus:ring-0 text-lg transition-all"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button 
                onClick={handleSearch}
                className="absolute right-2 top-2 bottom-2 w-10 h-10 bg-brand-yellow hover:bg-[#E5A800] rounded-full flex items-center justify-center text-[#213448] transition-transform hover:scale-105 active:scale-95 shadow-sm"
              >
                <Search className="w-5 h-5" />
              </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-4 mb-8">
                <button 
                  onClick={() => setActiveTab('experiences')}
                  className={`flex-1 h-10 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                    activeTab === 'experiences' 
                      ? 'bg-[#213448] text-white shadow-md' 
                      : 'bg-white text-[#213448] border border-transparent hover:bg-white/50'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${activeTab === 'experiences' ? 'border-brand-yellow text-brand-yellow' : 'border-[#213448] text-[#213448]'}`}>
                    <span className="text-[10px]">★</span>
                  </span>
                  Experiences
                </button>
                <button 
                  onClick={() => setActiveTab('guides')}
                  className={`flex-1 h-10 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                    activeTab === 'guides' 
                      ? 'bg-[#213448] text-white shadow-md' 
                      : 'bg-white text-[#213448] border border-transparent hover:bg-white/50'
                  }`}
                >
                   <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${activeTab === 'guides' ? 'border-brand-yellow text-brand-yellow' : 'border-[#213448] text-[#213448]'}`}>
                    <span className="text-[10px]">●</span>
                  </span>
                  Local guides
                </button>
              </div>

              {/* Content Area */}
              <div className="bg-white rounded-xl min-h-[300px] -mx-6 -mb-6 p-6">
                {activeTab === 'experiences' ? (
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-[#213448] mb-3 uppercase tracking-wider">
                      {searchQuery ? 'Search results:' : 'Experiences in:'}
                    </h3>
                    
                    {filteredSuggestions.length > 0 ? (
                      filteredSuggestions.map((item, i) => (
                        <div 
                          key={i} 
                          className="group cursor-pointer"
                          onClick={() => {
                            closeSearch();
                            navigate(item.link);
                          }}
                        >
                          <div className="flex items-center gap-4 p-3 rounded-r-xl transition-colors border-l-[4px] border-transparent hover:bg-[#FFF0E6] hover:border-brand-yellow">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center border bg-gray-50 text-gray-400 border-gray-100 group-hover:bg-brand-yellow group-hover:text-[#213448] group-hover:border-transparent group-hover:shadow-sm transition-all">
                              <MapPin className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-[#213448] text-base">{item.title}</h4>
                              <p className="text-xs text-gray-500 font-medium">{item.sub}</p>
                            </div>
                            <ChevronRight className="w-5 h-5 transition-colors text-gray-300 group-hover:text-brand-yellow" />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-gray-400">
                        No results found for "{searchQuery}"
                      </div>
                    )}
                  </div>
                ) : (
                  // Local Guides Empty State
                  <div className="h-full flex flex-col items-center justify-center text-center pt-10">
                    {/* Empty state per OCR image 2 (just white space) */}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Login Modal Portal */}
      {isLoginOpen && createPortal(
        <LoginModal 
          isOpen={isLoginOpen} 
          onClose={() => setIsLoginOpen(false)} 
          onSwitchToSignup={() => {
            setIsLoginOpen(false);
            setIsSignupOpen(true);
          }}
          onSwitchToForgotPassword={() => {
            setIsLoginOpen(false);
            setIsForgotPasswordOpen(true);
          }}
        />,
        document.body
      )}

      {/* Signup Modal Portal */}
      {isSignupOpen && createPortal(
        <SignupModal 
          isOpen={isSignupOpen} 
          onClose={() => setIsSignupOpen(false)} 
          onSwitchToLogin={() => {
            setIsSignupOpen(false);
            setIsLoginOpen(true);
          }} 
        />,
        document.body
      )}

      {/* Forgot Password Modal Portal */}
      {isForgotPasswordOpen && createPortal(
        <ForgotPasswordModal
          isOpen={isForgotPasswordOpen}
          onClose={() => setIsForgotPasswordOpen(false)}
          onSwitchToLogin={() => {
            setIsForgotPasswordOpen(false);
            setIsLoginOpen(true);
          }}
        />,
        document.body
      )}

      {/* Currency Converter Modal Portal */}
      {isCurrencyConverterOpen && createPortal(
        <CurrencyConverterModal
          isOpen={isCurrencyConverterOpen}
          onClose={() => setIsCurrencyConverterOpen(false)}
        />,
        document.body
      )}
    </header>
  );
};

export default Header;
