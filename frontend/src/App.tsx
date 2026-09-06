import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/common/ScrollToTop';
import CmsEditMode from './components/common/CmsEditMode';
import { GlobalImageFallback } from './components/common/GlobalImageFallback';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { CartProvider } from './contexts/CartContext';
import Cart from './components/common/Cart';
import { useState } from 'react';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import ExperiencePage from './pages/ExperiencePage';
import SeoExperiencePage from './pages/SeoExperiencePage';
import CityPage from './pages/CityPage';
import KathmanduPage from './pages/kathmandu/KathmanduPage';
import KathmanduExperiencesPage from './pages/kathmandu/KathmanduExperiencesPage';
import KathmanduExperiencePage from './pages/kathmandu/KathmanduExperiencePage';
import PokharaPage from './pages/pokhara/PokharaPage';
import PokharaExperiencesPage from './pages/pokhara/PokharaExperiencesPage';
import PokharaExperiencePage from './pages/pokhara/PokharaExperiencePage';
import LalitpurPage from './pages/lalitpur/LalitpurPage';
import LalitpurExperiencesPage from './pages/lalitpur/LalitpurExperiencesPage';
import LalitpurExperiencePage from './pages/lalitpur/LalitpurExperiencePage';
import BhaktapurPage from './pages/bhaktapur/BhaktapurPage';
import BhaktapurExperiencesPage from './pages/bhaktapur/BhaktapurExperiencesPage';
import BhaktapurExperiencePage from './pages/bhaktapur/BhaktapurExperiencePage';
import BharatpurPage from './pages/bharatpur/BharatpurPage';
import BharatpurExperiencesPage from './pages/bharatpur/BharatpurExperiencesPage';
import BharatpurExperiencePage from './pages/bharatpur/BharatpurExperiencePage';
import LocalProfilePage from './pages/LocalProfilePage';
import GalleryPage from './pages/GalleryPage';
import GuidePortfolioPage from './pages/GuidePortfolioPage';
import ContactGuidePage from './pages/ContactGuidePage';
import ImpactReportPage from './pages/ImpactReportPage';
import ExplorePage from './pages/ExplorePage';
import BecomeHostPage from './pages/host/BecomeHostPage';
import HostApplicationPage from './pages/host/HostApplicationPage';
import BookingsPage from './pages/user/BookingsPage';
import ProfilePage from './pages/user/ProfilePage';
import FavoritesPage from './pages/user/FavoritesPage';
import ChatPage from './pages/user/ChatPage';
import ConsentPage from './pages/ConsentPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import MailaDaiChatPage from './pages/MailaDaiChatPage';
import OAuthCallback from './pages/auth/OAuthCallback';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

import MostPopularPage from './pages/MostPopularPage';
import MostDeliciousPage from './pages/MostDeliciousPage';
import RealGoodTravelPage from './pages/RealGoodTravelPage';
import { FoodToursPage } from './pages/FoodToursPage';
import CulturalToursPage from './pages/CulturalToursPage';
import OutdoorActivitiesPage from './pages/OutdoorActivitiesPage';
import CookingClassesPage from './pages/CookingClassesPage';
import FoodTourCulturePage from './pages/food/FoodTourCulturePage';

// Footer Pages
import AboutPage from './pages/AboutPage';
import JobsPage from './pages/JobsPage';
import BlogPage from './pages/BlogPage';
import PressPage from './pages/PressPage';
import SustainabilityPage from './pages/SustainabilityPage';
import DestinationsPage from './pages/DestinationsPage';
import HowItWorksPage from './pages/HowItWorksPage';
import GiftCardsPage from './pages/GiftCardsPage';
import HostCenterPage from './pages/HostCenterPage';
import ContactPage from './pages/ContactPage';
import FaqPage from './pages/FaqPage';
import TermsPage from './pages/TermsPage';
import HelpPage from './pages/HelpPage';
import HostingPage from './pages/HostingPage';
import CommunityPage from './pages/CommunityPage';

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <CurrencyProvider>
      <CartProvider>
        <Router>
          <CmsEditMode />
          <ScrollToTop />
          <GlobalImageFallback />
          <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
          <Routes>
          <Route path="/" element={<HomePage onCartOpen={() => setIsCartOpen(true)} />} />
          <Route path="/most-popular" element={<MostPopularPage />} />
          <Route path="/most-delicious" element={<MostDeliciousPage />} />
          <Route path="/real-good-travel" element={<RealGoodTravelPage />} />
          <Route path="/food-tours" element={<FoodToursPage />} />
          <Route path="/food-tours/culture/:slug" element={<FoodTourCulturePage />} />
          <Route path="/cultural-tours" element={<CulturalToursPage />} />
          <Route path="/outdoor-activities" element={<OutdoorActivitiesPage />} />
          <Route path="/cooking-classes" element={<CookingClassesPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/become-host" element={<BecomeHostPage />} />
          <Route path="/host-application" element={<HostApplicationPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/maila-dai" element={<MailaDaiChatPage />} />
          <Route path="/consent" element={<ConsentPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/impact-report-2024" element={<ImpactReportPage />} />
          <Route path="/experience/seo/:slug" element={<SeoExperiencePage />} />
          <Route path="/experience/:id" element={<ExperiencePage />} />
          <Route path="/auth/callback" element={<OAuthCallback />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          
          {/* Kathmandu Routes */}
          <Route path="/city/kathmandu" element={<KathmanduPage />} />
          <Route path="/city/kathmandu/experiences" element={<KathmanduExperiencesPage />} />
          <Route path="/city/kathmandu/experience/:slug" element={<KathmanduExperiencePage />} />

          {/* Pokhara Routes */}
          <Route path="/city/pokhara" element={<PokharaPage />} />
          <Route path="/city/pokhara/experiences" element={<PokharaExperiencesPage />} />
          <Route path="/city/pokhara/experience/:slug" element={<PokharaExperiencePage />} />

          {/* Lalitpur Routes */}
          <Route path="/city/lalitpur" element={<LalitpurPage />} />
          <Route path="/city/lalitpur/experiences" element={<LalitpurExperiencesPage />} />
          <Route path="/city/lalitpur/experience/:slug" element={<LalitpurExperiencePage />} />

          {/* Bhaktapur Routes */}
          <Route path="/city/bhaktapur" element={<BhaktapurPage />} />
          <Route path="/city/bhaktapur/experiences" element={<BhaktapurExperiencesPage />} />
          <Route path="/city/bhaktapur/experience/:slug" element={<BhaktapurExperiencePage />} />

          {/* Bharatpur Routes */}
          <Route path="/city/bharatpur" element={<BharatpurPage />} />
          <Route path="/city/bharatpur/experiences" element={<BharatpurExperiencesPage />} />
          <Route path="/city/bharatpur/experience/:slug" element={<BharatpurExperiencePage />} />

          <Route path="/local/:id" element={<LocalProfilePage />} />
          <Route path="/local/:id/gallery" element={<GalleryPage />} />
          <Route path="/local/:id/portfolio" element={<GuidePortfolioPage />} />
          <Route path="/local/:id/contact" element={<ContactGuidePage />} />
          <Route path="/city/:cityId" element={<CityPage />} />
          
          {/* Footer Pages */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/press" element={<PressPage />} />
          <Route path="/sustainability" element={<SustainabilityPage />} />
          <Route path="/destinations" element={<DestinationsPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/gift-cards" element={<GiftCardsPage />} />
          <Route path="/host-center" element={<HostCenterPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/hosting" element={<HostingPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/host" element={<BecomeHostPage />} />
          <Route path="/careers" element={<JobsPage />} />
          
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </Router>
    </CartProvider>
  </CurrencyProvider>
  );
}

export default App;
