import React from 'react';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { HeroSection } from '../components/home/HeroSection';
import { FeaturedExperiences } from '../components/home/FeaturedExperiences';
import { PromoBanner } from '../components/home/PromoBanner';
import { CategoryGrid } from '../components/home/CategoryGrid';
import { FindYourExperience } from '../components/home/FindYourExperience';
import { Testimonials } from '../components/home/Testimonials';
import { ValuePropositions } from '../components/home/ValuePropositions';
import { DiscoverRegions } from '../components/home/DiscoverRegions';
import { PlanBookOnTheGo } from '../components/home/PlanBookOnTheGo';
import { useSeoMeta } from '../hooks/useCms';

interface HomePageProps {
  onCartOpen: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onCartOpen }) => {
  useSeoMeta('homepage', 'Guides Nepal - Go Local in Charming Cities');
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header onCartOpen={onCartOpen} />
      <main className="flex-grow">
        <HeroSection />
        <FeaturedExperiences />
        <PromoBanner />
        <CategoryGrid />
        <FindYourExperience />
        <Testimonials />
        <ValuePropositions />
        <DiscoverRegions />
        <PlanBookOnTheGo />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
