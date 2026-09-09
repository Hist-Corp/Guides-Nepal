import React, { useState } from 'react';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { Button } from '../components/common/Button';
import { Star, Users, Heart, ShieldCheck, Check, Clock, ChevronRight, Play, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const cookingClassLocals = [
  { name: "Chef Sita", title: "Traditional Newari Cooking Expert", reviews: 892, languages: "English・Nepali" },
  { name: "Araya", title: "The Culinary and Culture Admirer", reviews: 420, languages: "English・French・Nepali" },
  { name: "Chef Jekky", title: "Chef Jekky and The Team", reviews: 195, languages: "English・French・Nepali" },
  { name: "Wasana", title: "The Food Maniac & Nepali Cooking Class", reviews: 199, languages: "English・Nepali" },
  { name: "Maya", title: "Organic Farm to Table Specialist", reviews: 567, languages: "English・Nepali" },
  { name: "Raju", title: "Momo Master & Street Food Guide", reviews: 334, languages: "English・Nepali" },
  { name: "Priya", title: "Vegetarian Nepali Cuisine Expert", reviews: 278, languages: "English・Hindi・Nepali" },
  { name: "Bikash", title: "Traditional Thakali Kitchen", reviews: 445, languages: "English・Nepali" },
  { name: "Anita", title: "Home Cooking & Family Recipes", reviews: 189, languages: "English・Nepali" },
  { name: "Tenzin", title: "Tibetan-Nepali Fusion Chef", reviews: 312, languages: "English・Tibetan・Nepali" }
];

const cookingTours = [
  {
    id: 1,
    title: "Authentic Nepali Cooking Class with Market Visit",
    slug: "nepali-cooking-class-market-visit",
    image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1740&q=80",
    rating: 4.9,
    reviews: 892,
    type: "Cooking Class",
    duration: "4 hours",
    price: 65,
    locals: ["Chef Sita"]
  },
  {
    id: 2,
    title: "Momo Making Workshop: Nepal's Famous Dumplings",
    slug: "momo-making-workshop",
    image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=1740&q=80",
    rating: 4.8,
    reviews: 567,
    type: "Cooking Workshop",
    duration: "3 hours",
    price: 45,
    locals: ["Raju"]
  },
  {
    id: 3,
    title: "Traditional Newari Feast Cooking Experience",
    slug: "newari-feast-cooking",
    image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1740&q=80",
    rating: 4.9,
    reviews: 445,
    type: "Cultural Cooking",
    duration: "5 hours",
    price: 78,
    locals: ["Chef Sita"]
  },
  {
    id: 4,
    title: "Organic Farm Visit & Farm-to-Table Cooking",
    slug: "organic-farm-cooking",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1740&q=80",
    rating: 4.7,
    reviews: 334,
    type: "Farm Experience",
    duration: "6 hours",
    price: 85,
    locals: ["Maya"]
  },
  {
    id: 5,
    title: "Dal Bhat Cooking: Nepal's National Dish",
    slug: "dal-bhat-cooking-class",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1740&q=80",
    rating: 4.8,
    reviews: 723,
    type: "Traditional Cooking",
    duration: "3.5 hours",
    price: 52,
    locals: ["Araya"]
  },
  {
    id: 6,
    title: "Vegetarian Nepali Cuisine Masterclass",
    slug: "vegetarian-nepali-cooking",
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1740&q=80",
    rating: 4.6,
    reviews: 278,
    type: "Vegetarian Cooking",
    duration: "4 hours",
    price: 58,
    locals: ["Priya"]
  }
];

export const CookingClassesPage: React.FC = () => {
  const navigate = useNavigate();
  const [showAllLocals, setShowAllLocals] = useState(false);
  const displayedLocals = showAllLocals ? cookingClassLocals : cookingClassLocals.slice(0, 5);
  const displayedTours = cookingTours.slice(0, 6);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white">
      <Header />
      
      {/* Hero Section */}
      <div className="relative pt-4 pb-16 overflow-hidden bg-[#FFF0E6]">
        <div className="container mx-auto px-4 relative z-10">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-gray-600 hover:text-[#213448] font-bold mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <div className="flex flex-col md:flex-row items-center gap-12">
            {/* Left Content */}
            <div className="w-full md:w-1/2 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-600 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-brand-yellow animate-pulse"></span>
                100% private & flexible
              </div>
              
              <h1 className="text-2xl md:text-4xl font-bold text-gray-900 leading-tight">
                Master <br className="hidden md:block" />
                <span className="text-[#213448]">Nepali Cuisine</span> with our locals
              </h1>
              
              <p className="text-xl text-gray-600 max-w-lg leading-relaxed">
                Learn to cook authentic Nepali dishes with experienced local chefs. 
                From momo dumplings to traditional dal bhat, discover the secrets 
                of Nepali cooking in a hands-on experience.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <button 
                  onClick={() => document.getElementById('locals-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-3.5 bg-brand-yellow hover:bg-[#E5A800] text-slate-900 font-bold rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  Find your cooking host
                </button>
              </div>
            </div>

            {/* Right Content - Image Collage */}
            <div className="w-full md:w-1/2 relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4 translate-y-8">
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-lg">
                    <img 
                      src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1740&q=80" 
                      alt="Nepali Cooking Class"
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-lg bg-[#E0F2FE] p-4 flex items-center justify-center text-center">
                    <div>
                      <div className="text-3xl font-bold text-[#213448] mb-1">25+</div>
                      <div className="text-gray-600 font-medium">Cooking Hosts</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-lg">
                    <img 
                      src="https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=1740&q=80" 
                      alt="Momo Making"
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-lg rounded-bl-[4rem]">
                    <img 
                      src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1740&q=80" 
                      alt="Nepali Chef"
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tagline Section */}
      <div className="bg-white py-16 text-center border-b border-gray-100">
         <h2 className="text-3xl md:text-4xl font-bold text-[#213448] leading-tight font-sans tracking-tight">
            Real People. Real Stories.<br />
            Really Good Travel.
         </h2>
      </div>

      <main className="container mx-auto px-4 py-16 max-w-7xl">
        
        {/* Value Props */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20 text-center">
          <div className="flex flex-col items-center group">
             <div className="w-20 h-20 rounded-full bg-[#FFF0E6] flex items-center justify-center text-[#213448] mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-10 h-10" />
             </div>
             <h3 className="font-bold text-xl mb-3 text-gray-900">Real People. Real Stories.</h3>
             <p className="text-gray-500 max-w-xs">Really Good Travel.</p>
          </div>
          <div className="flex flex-col items-center group">
             <div className="w-20 h-20 rounded-full bg-[#FFF0E6] flex items-center justify-center text-[#213448] mb-6 group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck className="w-10 h-10" />
             </div>
             <h3 className="font-bold text-xl mb-3 text-gray-900">Feel like a local, not a tourist</h3>
             <p className="text-gray-500 max-w-xs">Always private. It's just you and your local host. No strangers, no groups.</p>
          </div>
          <div className="flex flex-col items-center group">
             <div className="w-20 h-20 rounded-full bg-[#FFF0E6] flex items-center justify-center text-[#213448] mb-6 group-hover:scale-110 transition-transform duration-300">
                <Check className="w-10 h-10" />
             </div>
             <h3 className="font-bold text-xl mb-3 text-gray-900">More you, less checklist</h3>
             <p className="text-gray-500 max-w-xs">Let your local host tailor the experience completely to your wishes.</p>
          </div>
        </div>

        {/* Detailed Cooking Experiences */}
        <div className="full-width bg-[#E0F2FE] -mx-4 md:-mx-[max(1rem,calc((100vw-80rem)/2))] px-4 md:px-[max(1rem,calc((100vw-80rem)/2))] py-20 mb-24">
          <div className="text-center mb-12">
             <span className="text-[#213448] font-bold uppercase tracking-wider text-sm block mb-2">Experiences</span>
             <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Things to do in Nepal</h2>
          </div>
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card 1: Dal Bhat */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1740&q=80" alt="Dal Bhat" className="w-full h-64 object-cover" />
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Master the Art of Dal Bhat</h3>
                <p className="text-gray-600 mb-4">A private cooking class in Kathmandu is the easiest and most authentic way to learn Nepal's national dish. Dal Bhat isn't just food—it's a cultural experience that brings families together every day.</p>
                <p className="text-gray-600">Choose one of our local hosts, who can truly give you an experience worth remembering. They'll show you how to perfectly season the lentils, cook the rice to fluffy perfection, and prepare the accompanying vegetables and pickles.</p>
              </div>
            </div>
            {/* Card 2: Momo */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <img src="https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=1740&q=80" alt="Momo Making" className="w-full h-64 object-cover" />
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Perfect the Momo Folding Technique</h3>
                <p className="text-gray-600 mb-4">The most fun thing to learn in Kathmandu is the art of momo making. These delicious dumplings are a staple of Nepali cuisine, and mastering the folding technique is both challenging and rewarding.</p>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <h4 className="font-bold text-gray-800 mb-2">Must Try Fillings</h4>
                  <ul className="list-disc list-inside text-gray-600">
                    <li>Chicken, Buff (Buffalo), Vegetable, Cheese, Chocolate (for dessert momos!)</li>
                  </ul>
                </div>
              </div>
            </div>
            {/* Card 3: Spice Markets */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <img src="https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&w=1740&q=80" alt="Spice Market" className="w-full h-64 object-cover" />
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Explore Aromatic Spice Markets</h3>
                <p className="text-gray-600 mb-4">The Local Spice Markets are a joy for the senses and essential for authentic Nepali cooking! Add them to your cooking class experience and you won't regret it! You will find everything from fresh turmeric to aromatic cardamom.</p>
                <p className="text-gray-600">Most of the markets are really crowded, but that's part of their charm. Your host will help you navigate all the spices and give insights on which ones to use for different dishes.</p>
              </div>
            </div>
            {/* Card 4: Newari Recipes */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <img src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1740&q=80" alt="Newari Food" className="w-full h-64 object-cover" />
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Discover Ancient Newari Recipes</h3>
                <p className="text-gray-600 mb-4">There are quite a few culinary highlights worth learning in Kathmandu, but Newari cuisine is surely a must-try! These ancient recipes have been passed down through generations and represent the rich cultural heritage of the Kathmandu Valley.</p>
                <div className="bg-yellow-100 p-4 rounded-lg">
                  <h4 className="font-bold text-yellow-800 mb-2">PRO TIP</h4>
                  <p className="text-yellow-700">Try Yomari - a sweet steamed dumpling!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Why Guides Nepal Section */}
        <div className="py-20 text-center">
           <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">Why do Guides Nepal love what they do?</h2>
           <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-12">
              <div className="flex flex-col items-center">
                 <h3 className="font-bold text-xl text-gray-900 mb-2">A fair income</h3>
                 <p className="text-gray-600">Our hosts set their own price.</p>
              </div>
              <div className="flex flex-col items-center">
                 <h3 className="font-bold text-xl text-gray-900 mb-2">Passion for culture</h3>
                 <p className="text-gray-600">Sharing their heritage with you.</p>
              </div>
              <div className="flex flex-col items-center">
                 <h3 className="font-bold text-xl text-gray-900 mb-2">Eco-friendly</h3>
                 <p className="text-gray-600">Low impact, high connection.</p>
              </div>
              <div className="flex flex-col items-center">
                 <h3 className="font-bold text-xl text-gray-900 mb-2">Unique skills</h3>
                 <p className="text-gray-600">From chefs to historians.</p>
              </div>
              <div className="flex flex-col items-center">
                 <h3 className="font-bold text-xl text-gray-900 mb-2">Flexible schedule</h3>
                 <p className="text-gray-600">Tours that fit your time.</p>
              </div>
              <div className="flex flex-col items-center">
                 <h3 className="font-bold text-xl text-gray-900 mb-2">Global community</h3>
                 <p className="text-gray-600">Connecting the world.</p>
              </div>
           </div>
        </div>

        {/* Best Cooking Experiences */}
        <div className="py-20 bg-gray-50 rounded-3xl">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Best cooking experiences in Nepal</h2>
            <div className="prose prose-lg max-w-none text-gray-600">
              <p>Nepali cuisine is a delightful blend of flavors, spices, and traditions that will tantalize your taste buds! From the aromatic dal bhat to the delicate momo dumplings, every dish tells a story of cultural heritage and family traditions.</p>
              <p>Start your culinary journey with Dal Bhat, the national dish that powers Nepal. This nutritious combination of lentil soup, rice, and vegetables is more than just food—it's a daily ritual that brings families together.</p>
              <p>If you're a fan of dumplings, you're in for a treat! Momo making is an art form in Nepal. These juicy dumplings, filled with spiced meat or vegetables, are steamed to perfection and served with fiery tomato chutney.</p>
              <p>Want to explore beyond the basics? Discover Newari cuisine, the indigenous food culture of the Kathmandu Valley. From spicy choila meat to sweet yomari dumplings, these ancient recipes offer a taste of authentic Nepali heritage.</p>
              <p>No matter what your culinary interests are, there's always something delicious to learn in Nepal. And with a Guides Nepal cooking class, you can customize your experience to focus on your favorite flavors. So what are you waiting for? Book your private cooking class today and discover the magic of Nepali cuisine!</p>
            </div>
          </div>
        </div>

        {/* Related Keywords */}
        <div className="py-20">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Related keywords</h2>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                "Nepali cooking class", "Momo making workshop", "Dal bhat cooking", "Newari food tour",
                "Kathmandu cooking school", "Traditional Nepali recipes", "Spice market tour", "Home cooking Nepal",
                "Organic farm cooking", "Vegetarian Nepali food", "Nepali street food", "Cooking with locals",
                "Authentic Nepali cuisine", "Kathmandu food experience", "Nepali chef guide", "Hands-on cooking class",
                "Nepali kitchen basics", "Traditional cooking methods", "Nepali family cooking", "Cultural food tour",
                "Nepali spices", "Kathmandu culinary tour", "Cooking vacation Nepal", "Food tour Kathmandu",
                "Local food experience"
              ].map(keyword => (
                <span key={keyword} className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">{keyword}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Featured Section (2 Large Cards) */}
        <div className="mb-24">
           <div className="flex items-end justify-between mb-8">
              <div>
                 <h3 className="text-[#213448] font-bold uppercase tracking-wider text-sm mb-2">Don't miss out</h3>
                 <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Top Rated Cooking Classes</h2>
              </div>
              <button 
                onClick={() => navigate('/cooking-classes/experiences')}
                className="hidden md:flex items-center text-[#213448] font-bold hover:underline"
              >
                 View all experiences <ChevronRight className="w-5 h-5" />
              </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {cookingTours.slice(0, 2).map((tour) => (
                 <div 
                   key={tour.id} 
                   className="group relative rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300"
                   onClick={() => {
                      navigate(`/cooking-classes/experience/${tour.slug}`);
                      window.scrollTo({ top: 0, behavior: 'instant' });
                   }}
                 >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>
                    <img src={tour.image} alt={tour.title} className="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-500" />
                    
                    <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-1 text-xs font-bold text-gray-900">
                       <Star className="w-3 h-3 fill-brand-yellow text-brand-yellow" />
                       {tour.rating} ({tour.reviews})
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-8 z-20 text-white">
                       <h3 className="text-2xl font-bold mb-2 leading-tight">{tour.title}</h3>
                       <div className="flex items-center gap-4 text-sm font-medium text-white/90 mb-6">
                          <span>{tour.type}</span>
                          <span>•</span>
                          <span>{tour.duration}</span>
                       </div>
                       
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <div className="flex -space-x-3">
                                <img src={`https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80`} className="w-10 h-10 rounded-full border-2 border-white object-cover" />
                                <div className="w-10 h-10 rounded-full border-2 border-white bg-white/20 backdrop-blur-md flex items-center justify-center text-xs font-bold">+12</div>
                             </div>
                             <span className="text-sm font-bold">Choose your local</span>
                          </div>
                          <div className="text-right">
                             <div className="text-xs opacity-80">From</div>
                             <div className="text-xl font-bold">€{tour.price}</div>
                          </div>
                       </div>
                    </div>
                 </div>
              ))}
           </div>
        </div>

        {/* Reviews Section (Pink Background) */}
        <div className="full-width bg-[#FFF0E6] -mx-4 md:-mx-[max(1rem,calc((100vw-80rem)/2))] px-4 md:px-[max(1rem,calc((100vw-80rem)/2))] py-20 mb-24">
           <div className="text-center mb-12">
             <h2 className="text-3xl font-bold text-gray-900 mb-4">Travelers love our cooking hosts</h2>
             <p className="text-gray-600">Reviews from guests about our cooking classes and local hosts</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {[
                { 
                  name: "Sarah", 
                  review: "Chef Sita was amazing! She taught us how to make authentic dal bhat and momos. The market visit was fascinating, and we learned so much about Nepali spices and ingredients.", 
                  host: "Chef Sita",
                  date: "Kathmandu, January 21, 2026"
                },
                { 
                  name: "Michael", 
                  review: "The momo making workshop with Raju was incredible! He made it so easy to follow along, and the dumplings we made were delicious. Best cooking class I've ever taken!", 
                  host: "Raju",
                  date: "Kathmandu, January 20, 2026"
                },
                { 
                  name: "Emma", 
                  review: "Araya's cooking class was the highlight of our Nepal trip! She welcomed us into her home like family. The Newari feast we prepared together was absolutely delicious.", 
                  host: "Araya",
                  date: "Kathmandu, January 18, 2026"
                }
              ].map((review, i) => (
                <div key={i} className="bg-white p-8 rounded-3xl shadow-sm relative">
                   {/* Speech bubble tail could go here */}
                   <div className="flex gap-1 mb-6">
                     {[1,2,3,4,5].map(s => <Star key={s} className="w-5 h-5 fill-brand-yellow text-brand-yellow" />)}
                   </div>
                   <p className="text-gray-800 font-medium italic mb-8 leading-relaxed">"{review.review}"</p>
                   <div className="flex items-center gap-4 mt-auto">
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">
                         {review.name[0]}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{review.name}</div>
                        <div className="text-xs text-[#213448] font-bold uppercase">About local {review.host}</div>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Locals Grid */}
        <div className="mb-24" id="locals-section">
           <div className="text-center mb-16">
             <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Explore cooking classes with our <span className="text-[#213448]">incredible local chefs</span></h2>
             <p className="text-gray-600 max-w-2xl mx-auto">Learn about their personal cooking stories and find out how you can master Nepali cuisine with locals who know the flavors best.</p>
           </div>
           
           <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
              {displayedLocals.map((local, i) => (
                 <div 
                   key={i} 
                   className="flex flex-col items-center group cursor-pointer"
                   onClick={() => {
                     // Demo: Cycle through the 4 rich profiles we have
                     const demoId = (i % 4) + 1;
                     navigate(`/local/${demoId}`);
                     window.scrollTo({ top: 0, behavior: 'instant' });
                   }}
                 >
                    <div className="relative w-32 h-32 mb-4">
                       <img 
                         src={`https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=128&q=80`} 
                         alt={local.name} 
                         className="w-full h-full rounded-full object-cover border-4 border-white shadow-md group-hover:border-brand-yellow transition-all duration-300"
                       />
                       <div className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm text-xs font-bold border border-gray-100">
                          🇳🇵
                       </div>
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-[#213448] transition-colors">{local.name}</h3>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2 text-center line-clamp-1 px-2">{local.title}</p>
                    <div className="flex items-center gap-1 text-xs font-bold text-gray-600">
                       <Star className="w-3 h-3 fill-brand-yellow text-brand-yellow" />
                       <span>{local.reviews}</span>
                    </div>
                 </div>
              ))}
           </div>

           <div className="text-center mt-12">
             <Button 
               onClick={() => setShowAllLocals(!showAllLocals)}
               className="bg-transparent border border-[#213448] text-[#213448] hover:bg-brand-yellow hover:border-brand-yellow hover:text-slate-900 rounded-full px-8 py-3 font-bold transition-all"
             >
               {showAllLocals ? "See less" : "Show more locals"}
             </Button>
           </div>
        </div>

        {/* Things to do Grid */}
        <div className="full-width bg-[#E0F2FE] -mx-4 md:-mx-[max(1rem,calc((100vw-80rem)/2))] px-4 md:px-[max(1rem,calc((100vw-80rem)/2))] py-20 mb-24">
          <div className="text-center mb-12">
             <span className="text-[#213448] font-bold uppercase tracking-wider text-sm block mb-2">Experiences</span>
             <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Cooking experiences in Nepal</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {displayedTours.map((tour) => (
              <div 
                key={tour.id} 
                className="flex flex-col border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 bg-white group cursor-pointer"
                onClick={() => {
                  navigate(`/cooking-classes/experience/${tour.slug}`);
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
              >
                <div className="relative h-48 aspect-[4/3] overflow-hidden">
                  <img src={tour.image} alt={tour.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide text-gray-800">
                    {tour.type}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                    <Star className="w-3 h-3 fill-brand-yellow text-brand-yellow" />
                    {tour.rating}
                  </div>
                </div>
                
                <div className="flex-1 p-5 flex flex-col">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 leading-snug line-clamp-2 group-hover:text-[#213448] transition-colors">
                    {tour.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                     <Clock className="w-3 h-3" />
                     <span>{tour.duration}</span>
                     <span>•</span>
                     <span>{tour.reviews} reviews</span>
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                     <div className="flex -space-x-2">
                        {tour.locals.map((l, i) => (
                           <img key={i} src={`https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=128&q=80`} className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                        ))}
                     </div>
                     <div className="text-right">
                        <div className="text-xs text-gray-500">From</div>
                        <div className="text-lg font-bold text-gray-900">€{tour.price}</div>
                     </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button 
              onClick={() => navigate('/cooking-classes/experiences')}
              className="bg-white text-[#213448] font-bold px-8 py-3 rounded-full hover:bg-[#213448] hover:text-white transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Explore more cooking experiences
            </button>
          </div>
        </div>

        {/* Video Section */}
        <div className="mb-24">
           <div className="relative rounded-2xl overflow-hidden shadow-lg group cursor-pointer">
              <img 
                src="https://images.unsplash.com/photo-1533105079780-92b9be482077777?auto=format&fit=crop&w=1740&q=80" 
                alt="Nepali Family Cooking" 
                className="w-full h-[500px] object-cover transition-transform duration-500 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="w-20 h-20 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white group-hover:bg-white/50 transition-colors">
                  <Play className="w-10 h-10 fill-current" />
                </button>
              </div>
              <div className="absolute bottom-8 left-8 text-white">
                <h3 className="text-3xl font-bold mb-2">Cook with Local Families</h3>
                <p className="text-lg">Experience authentic Nepali hospitality and traditional cooking methods.</p>
              </div>
              <div className="absolute bottom-8 right-8 text-white font-bold text-xl tracking-widest">
                 Guides Nepal
              </div>
           </div>

           <div className="space-y-24">
              {/* Article 1: Dal Bhat */}
              <div className="flex flex-col md:flex-row gap-12 items-center">
                 <div className="md:w-1/2">
                    <img src="https://images.unsplash.com/photo-1609501676725-7186f017a4b7?auto=format&fit=crop&w=1740&q=80" className="rounded-3xl shadow-xl w-full aspect-[4/3] object-cover" />
                 </div>
                 <div className="md:w-1/2">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Master the Art of Dal Bhat</h3>
                    <p className="text-gray-600 leading-relaxed mb-6">
                       A private cooking class in Kathmandu is the easiest and most authentic way to learn Nepal's national dish. Dal Bhat isn't just food—it's a cultural experience that brings families together every day.
                    </p>
                    <p className="text-gray-600 leading-relaxed">
                       Choose one of our local hosts, who can truly give you an experience worth remembering. They'll show you how to perfectly season the lentils, cook the rice to fluffy perfection, and prepare the accompanying vegetables and pickles.
                    </p>
                 </div>
              </div>

              {/* Article 2: Momo Making */}
              <div className="flex flex-col md:flex-row-reverse gap-12 items-center">
                 <div className="md:w-1/2">
                    <img src="https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&w=1740&q=80" className="rounded-3xl shadow-xl w-full" />
                 </div>
                 <div className="md:w-1/2">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Perfect the Momo Folding Technique</h3>
                    <p className="text-gray-600 leading-relaxed mb-6">
                       The most fun thing to learn in Kathmandu is the art of momo making. These delicious dumplings are a staple of Nepali cuisine, and mastering the folding technique is both challenging and rewarding.
                    </p>
                    <div className="bg-[#FFF0E6] p-6 rounded-2xl border-l-4 border-[#213448]">
                       <h4 className="font-bold text-[#213448] mb-2">Must Try Fillings</h4>
                       <p className="text-sm text-gray-700">Chicken, Buff (Buffalo), Vegetable, Cheese, Chocolate (for dessert momos!)</p>
                    </div>
                 </div>
              </div>

              {/* Article 3: Spice Markets */}
              <div className="flex flex-col md:flex-row gap-12 items-center">
                 <div className="md:w-1/2">
                    <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1740&q=80" className="rounded-3xl shadow-xl w-full" />
                 </div>
                 <div className="md:w-1/2">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Explore Aromatic Spice Markets</h3>
                    <p className="text-gray-600 leading-relaxed mb-6">
                       The Local Spice Markets are a joy for the senses and essential for authentic Nepali cooking! Add them to your cooking class experience and you won't regret it! You will find everything from fresh turmeric to aromatic cardamom.
                    </p>
                    <p className="text-gray-600 leading-relaxed">
                       Most of the markets are really crowded, but that's part of their charm. Your host will help you navigate all the spices and give insights on which ones to use for different dishes.
                    </p>
                 </div>
              </div>

              {/* Article 4: Newari Cuisine */}
              <div className="flex flex-col md:flex-row-reverse gap-12 items-center">
                 <div className="md:w-1/2">
                    <img src="https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1740&q=80" className="rounded-3xl shadow-xl w-full aspect-[4/3] object-cover" />
                 </div>
                 <div className="md:w-1/2">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Discover Ancient Newari Recipes</h3>
                    <p className="text-gray-600 leading-relaxed mb-6">
                       There are quite a few culinary highlights worth learning in Kathmandu, but Newari cuisine is surely a must-try! These ancient recipes have been passed down through generations and represent the rich cultural heritage of the Kathmandu Valley.
                    </p>
                    <div className="inline-block bg-gray-100 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide text-gray-600">
                       PRO TIP: Try Yomari - a sweet steamed dumpling!
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Why Guides Nepal Icons Grid (Bottom) */}
        <div className="mb-24 pt-16 border-t border-gray-100">
           <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-[#213448]">Why do Guides Nepal love what they do?</h2>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              {[
                 { title: "A fair income", desc: "Our hosts set their own price.", icon: <ShieldCheck className="w-8 h-8" /> },
                 { title: "Passion for culture", desc: "Sharing their heritage with you.", icon: <Heart className="w-8 h-8" /> },
                 { title: "Eco-friendly", desc: "Low impact, high connection.", icon: <Users className="w-8 h-8" /> },
                 { title: "Unique skills", desc: "From chefs to historians.", icon: <Star className="w-8 h-8" /> },
                 { title: "Flexible schedule", desc: "Tours that fit your time.", icon: <Clock className="w-8 h-8" /> },
                 { title: "Global community", desc: "Connecting the world.", icon: <Users className="w-8 h-8" /> }
              ].map((item, i) => (
                 <div key={i} className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-[#FFF0E6] flex items-center justify-center text-[#213448] mb-4">
                       {item.icon}
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-500 text-sm">{item.desc}</p>
                 </div>
              ))}
           </div>
        </div>

        {/* Best things to do in Kathmandu SEO Text */}
        <div className="mb-24 text-center max-w-4xl mx-auto">
           <h2 className="text-2xl font-bold text-[#213448] mb-6">Best cooking experiences in Nepal</h2>
           <div className="space-y-6 text-gray-600 leading-relaxed text-sm md:text-base">
              <p>
                 Nepali cuisine is a delightful blend of flavors, spices, and traditions that will tantalize your taste buds! From the aromatic dal bhat to the delicate momo dumplings, every dish tells a story of cultural heritage and family traditions.
              </p>
              <p>
                 Start your culinary journey with <strong className="text-gray-900">Dal Bhat</strong>, the national dish that powers Nepal. This nutritious combination of lentil soup, rice, and vegetables is more than just food—it's a daily ritual that brings families together.
              </p>
              <p>
                 If you're a fan of dumplings, you're in for a treat! <strong className="text-gray-900">Momo making</strong> is an art form in Nepal. These juicy dumplings, filled with spiced meat or vegetables, are steamed to perfection and served with fiery tomato chutney.
              </p>
              <p>
                 Want to explore beyond the basics? Discover <strong className="text-gray-900">Newari cuisine</strong>, the indigenous food culture of the Kathmandu Valley. From spicy choila meat to sweet yomari dumplings, these ancient recipes offer a taste of authentic Nepali heritage.
              </p>
              <p>
                 No matter what your culinary interests are, there's always something delicious to learn in Nepal. And with a Guides Nepal cooking class, you can customize your experience to focus on your favorite flavors. So what are you waiting for? Book your private cooking class today and discover the magic of Nepali cuisine!
              </p>
           </div>
        </div>

        {/* Related Keywords Cloud */}
        <div className="mb-12">
           <div className="text-center mb-8">
              <h3 className="text-[#213448] font-bold text-sm uppercase tracking-wider">Related keywords</h3>
           </div>
           <div className="flex flex-wrap justify-center gap-2">
              {[
                 "Nepali cooking class", "Momo making workshop", "Dal bhat cooking", "Newari food tour", 
                 "Kathmandu cooking school", "Traditional Nepali recipes", "Spice market tour", "Home cooking Nepal",
                 "Organic farm cooking", "Vegetarian Nepali food", "Nepali street food", "Cooking with locals",
                 "Authentic Nepali cuisine", "Kathmandu food experience", "Nepali chef guide", "Hands-on cooking class",
                 "Nepali kitchen basics", "Traditional cooking methods", "Nepali family cooking", "Cultural food tour",
                 "Nepali spices", "Kathmandu culinary tour", "Cooking vacation Nepal", "Food tour Kathmandu", "Local food experience"
              ].map((tag, i) => (
                 <a key={i} href="#" className="px-3 py-1.5 bg-[#FFF0E6] text-[#213448] text-xs font-bold rounded hover:bg-[#213448] hover:text-white transition-colors">
                    {tag}
                 </a>
              ))}
           </div>
        </div>

      </main>
      <Footer />
    </div>
  );
};

export default CookingClassesPage;