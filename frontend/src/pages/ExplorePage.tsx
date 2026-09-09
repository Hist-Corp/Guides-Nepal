import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { Button } from '../components/common/Button';
import { Star, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { NEPAL_IMAGES } from '../data/images';

// --- Mock Data ---

const topThingsToDo = [
  {
    id: 1,
    title: 'Eat & drink with locals',
    description: 'Discover the authentic flavors of the city.',
    image: NEPAL_IMAGES.newariFeast,
    link: '/search?category=food'
  },
  {
    id: 2,
    title: 'Hidden Gems Tour',
    description: 'Explore secret spots only locals know.',
    image: NEPAL_IMAGES.oldTown,
    link: '/search?category=tours'
  },
  {
    id: 3,
    title: 'Cultural Heritage',
    description: 'Dive deep into the rich history and traditions.',
    image: NEPAL_IMAGES.heritage,
    link: '/search?category=culture'
  },
  {
    id: 4,
    title: 'Art & Workshops',
    description: 'Create your own masterpiece with local artisans.',
    image: NEPAL_IMAGES.temples,
    link: '/search?category=art'
  }
];

const popularDestinations = [
  { name: 'Kathmandu', image: NEPAL_IMAGES.oldTown },
  { name: 'Pokhara', image: NEPAL_IMAGES.phewaLake },
  { name: 'Lalitpur', image: NEPAL_IMAGES.heritage },
  { name: 'Bhaktapur', image: NEPAL_IMAGES.boudhanath },
  { name: 'Chitwan', image: NEPAL_IMAGES.forestHills },
];

const categories = [
  { name: 'Foodies', image: NEPAL_IMAGES.momos },
  { name: 'Families', image: NEPAL_IMAGES.phewaLake },
  { name: 'Night owls', image: NEPAL_IMAGES.nightMountains },
  { name: 'Newbies', image: NEPAL_IMAGES.everest },
  { name: 'Outdoor', image: NEPAL_IMAGES.annapurna },
];

const experienceGrid = [
  {
    id: 1,
    title: 'Taste of Kathmandu',
    description: 'Savor the best street food in town.',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    guide: { name: 'Aarav', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=80&h=80&q=80' },
    link: '/city/kathmandu/experience/taste-of-kathmandu',
    rating: 4.8,
    reviews: 42,
    price: '€25'
  },
  {
    id: 2,
    title: 'Historic Patan Walk',
    description: 'Walk through centuries of history.',
    image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    guide: { name: 'Sina', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=80&h=80&q=80' },
    link: '/city/lalitpur/experience/historic-patan',
    rating: 4.9,
    reviews: 56,
    price: '€28'
  },
  {
    id: 3,
    title: 'Local Wine & Bites',
    description: 'Taste local rice wine and snacks.',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    guide: { name: 'Raj', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=80&h=80&q=80' },
    link: '/city/kathmandu/experience/wine-bites',
    rating: 4.7,
    reviews: 28,
    price: '€30'
  },
  {
    id: 4,
    title: 'Hidden Gems of Bhaktapur',
    description: 'Uncover the secrets of the city of devotees.',
    image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    guide: { name: 'Maya', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=80&h=80&q=80' },
    link: '/city/bhaktapur/experience/hidden-gems',
    rating: 4.9,
    reviews: 89,
    price: '€35'
  },
];

const localExperts = [
  { name: 'Kiran', tag: 'Foodie', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80' },
  { name: 'Sita', tag: 'History Buff', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80' },
  { name: 'Ramesh', tag: 'Outdoor', image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80' },
  { name: 'Priya', tag: 'Art Lover', image: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80' },
  { name: 'Bijay', tag: 'Night Owl', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80' },
];

const testimonials = [
  { name: 'Olivia', rating: 5, text: "An unforgettable experience! The guide was so knowledgeable and friendly.", image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=80&h=80&q=80' },
  { name: 'Charlotte', rating: 5, text: "I learned so much about the culture. Highly recommended!", image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=80&h=80&q=80' },
  { name: 'Mateo', rating: 5, text: "The food tour was the highlight of my trip. Delicious!", image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=80&h=80&q=80' },
];


const ExplorePage: React.FC = () => {
  return (
    <div className="min-h-screen font-sans bg-gray-50">
      <Header />
      
      <main>
        {/* --- Top 10 Things to Do Carousel --- */}
        <section className="py-12 container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
             <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Top 10 Things to do</h2>
             <div className="flex gap-2">
                <button className="p-2 rounded-full border border-gray-200 hover:border-primary hover:text-primary transition-colors"><ChevronLeft className="w-5 h-5" /></button>
                <button className="p-2 rounded-full border border-gray-200 hover:border-primary hover:text-primary transition-colors"><ChevronRight className="w-5 h-5" /></button>
             </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {topThingsToDo.map(item => (
              <div key={item.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow group relative">
                 <div className="absolute top-3 right-3 z-10 bg-white/80 p-1.5 rounded-full cursor-pointer hover:text-primary transition-colors">
                    <Heart className="w-4 h-4" />
                 </div>
                 <div className="h-48 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => (e.currentTarget.src = '/images/placeholder.svg')}
                    />
                 </div>
                 <div className="p-4">
                    <h3 className="font-bold text-lg mb-2 text-gray-900">{item.title}</h3>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">{item.description}</p>
                    <div className="flex gap-2">
                       <Link to={item.link} className="flex-1">
                          <Button size="sm" className="w-full bg-primary hover:bg-primary-hover text-white text-xs font-bold py-2 border-none">Read more</Button>
                       </Link>
                       <Link to={item.link} className="flex-1">
                          <Button size="sm" variant="outline" className="w-full border-primary text-primary hover:bg-primary/5 text-xs font-bold py-2">Book now</Button>
                       </Link>
                    </div>
                 </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- Maroon Band (USPs) --- */}
        <section className="bg-[#9A2143] py-6 text-white">
           <div className="container mx-auto px-4">
              <div className="flex flex-wrap justify-center items-center gap-4 md:gap-12 text-sm md:text-base font-medium">
                 <div className="flex items-center gap-2">
                    <span className="hidden md:inline text-white/50">|</span>
                    <span>Different experiences</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="text-white/50">|</span>
                    <span>Private & personalized</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="text-white/50">|</span>
                    <span>Small group adventures</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="text-white/50">|</span>
                    <span>Verified locals</span>
                 </div>
              </div>
           </div>
        </section>

        {/* --- Popular Destinations --- */}
        <section className="py-12 container mx-auto px-4">
           <div className="flex justify-between items-center mb-6">
             <h2 className="text-2xl font-bold text-gray-900">Popular destinations</h2>
             <div className="flex gap-2">
                <button className="p-1.5 rounded-full border border-gray-200 hover:border-primary hover:text-primary transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                <button className="p-1.5 rounded-full border border-gray-200 hover:border-primary hover:text-primary transition-colors"><ChevronRight className="w-4 h-4" /></button>
             </div>
           </div>
           <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {popularDestinations.map((dest, i) => (
                 <Link key={i} to={`/city/${dest.name.toLowerCase()}`} className="flex-shrink-0 w-32 md:w-40 group cursor-pointer">
                    <div className="rounded-xl overflow-hidden aspect-square mb-2 relative">
                       <img
                         src={dest.image}
                         alt={dest.name}
                         className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                         onError={(e) => (e.currentTarget.src = '/images/placeholder.svg')}
                       />
                       <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                       <span className="absolute bottom-2 left-3 text-white font-bold text-sm shadow-black drop-shadow-md">{dest.name}</span>
                    </div>
                 </Link>
              ))}
           </div>
        </section>

        {/* --- Categories (Experiences for every interest) --- */}
        <section className="py-12 container mx-auto px-4">
           <h2 className="text-2xl font-bold text-gray-900 mb-6">Experiences for every interest</h2>
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {categories.map((cat, i) => (
                 <Link key={i} to={`/search?category=${cat.name.toLowerCase()}`} className="relative rounded-xl overflow-hidden aspect-[3/4] group cursor-pointer">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => (e.currentTarget.src = '/images/placeholder.svg')}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                       <h3 className="text-white font-bold text-xl mb-3">{cat.name}</h3>
                       <span className="inline-block bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2 rounded-full transition-colors">
                          Explore
                       </span>
                    </div>
                 </Link>
              ))}
           </div>
        </section>

        {/* --- Experience Grid --- */}
        <section className="py-12 container mx-auto px-4">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {experienceGrid.map(exp => (
                 <Link key={exp.id} to={exp.link} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group">
                    <div className="relative h-48 overflow-hidden">
                       <img
                         src={exp.image}
                         alt={exp.title}
                         className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                         onError={(e) => (e.currentTarget.src = '/images/placeholder.svg')}
                       />
                       <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-white/90 backdrop-blur-sm pr-3 pl-1 py-1 rounded-full text-xs font-bold text-gray-800 shadow-sm">
                          <img
                            src={exp.guide.image}
                            alt={exp.guide.name}
                            className="w-6 h-6 rounded-full object-cover"
                            onError={(e) => (e.currentTarget.src = '/images/placeholder.svg')}
                          />
                          <span>Local Expert {exp.guide.name}</span>
                       </div>
                    </div>
                    <div className="p-4">
                       <h3 className="font-bold text-gray-900 mb-1 truncate">{exp.title}</h3>
                       <p className="text-gray-500 text-xs mb-4">{exp.description}</p>
                       <div className="flex items-center space-x-1 mb-2">
                          <Star className="w-4 h-4 text-brand-yellow fill-brand-yellow" />
                          <span className="font-medium text-gray-900">{exp.rating}</span>
                          <span className="text-gray-500">({exp.reviews})</span>
                       </div>
                       <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-secondary">{exp.price}</span>
                          <button className="text-sm font-medium text-primary hover:text-brand-yellow transition-colors">
                             View Details
                          </button>
                       </div>
                    </div>
                 </Link>
              ))}
           </div>
           <div className="text-center">
              <Link to="/search">
                 <Button className="bg-primary hover:bg-primary-hover text-white font-bold px-8 py-3 rounded-full border-none shadow-lg shadow-primary/20">
                    View more experiences
                 </Button>
              </Link>
           </div>
        </section>

        {/* --- Local Experts Carousel --- */}
        <section className="py-16 bg-gray-50">
           <div className="container mx-auto px-4">
              <div className="flex justify-between items-center mb-8">
                 <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Explore the city with a local of your choice</h2>
                 <div className="flex gap-2">
                    <button className="p-2 rounded-full border border-gray-200 bg-white hover:border-primary hover:text-primary transition-colors"><ChevronLeft className="w-5 h-5" /></button>
                    <button className="p-2 rounded-full border border-gray-200 bg-white hover:border-primary hover:text-primary transition-colors"><ChevronRight className="w-5 h-5" /></button>
                 </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                 {localExperts.map((expert, i) => (
                    <div key={i} className="group cursor-pointer">
                       <div className="relative rounded-2xl overflow-hidden aspect-[3/4] mb-3">
                          <img
                            src={expert.image}
                            alt={expert.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 grayscale group-hover:grayscale-0"
                            onError={(e) => (e.currentTarget.src = '/images/placeholder.svg')}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4">
                             <Button size="sm" className="bg-primary text-white border-none text-xs">View Profile</Button>
                          </div>
                       </div>
                       <div className="text-center">
                          <h3 className="font-bold text-gray-900 text-lg">{expert.name}</h3>
                          <span className="text-primary font-medium text-sm uppercase tracking-wide">{expert.tag}</span>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </section>

        {/* --- Testimonials --- */}
        <section className="py-16 container mx-auto px-4">
           <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-10 text-center">What other travelers love about our local experts</h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((t, i) => (
                 <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                    <img
                      src={t.image}
                      alt={t.name}
                      className="w-16 h-16 rounded-full object-cover mb-4 ring-4 ring-gray-50"
                      onError={(e) => (e.currentTarget.src = '/images/placeholder.svg')}
                    />
                    <div className="flex gap-1 mb-3">
                       {[...Array(t.rating)].map((_, j) => (
                          <Star key={j} className="w-4 h-4 fill-accent text-accent" />
                       ))}
                    </div>
                    <p className="text-gray-600 italic mb-4">"{t.text}"</p>
                    <h4 className="font-bold text-gray-900 mt-auto">{t.name}</h4>
                    <button className="text-primary text-sm font-bold mt-2 hover:underline">Read more stories</button>
                 </div>
              ))}
           </div>
        </section>

        {/* --- Bottom Promo Banner --- */}
        <section className="bg-[#9A2143] py-20 text-white relative overflow-hidden">
           <div className="absolute inset-0 opacity-20">
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
                className="w-full h-full object-cover"
                alt="Background"
                onError={(e) => (e.currentTarget.src = '/images/placeholder.svg')}
              />
           </div>
           <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-xl">
                 <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                    Enjoy the Best of the City Like a Local
                 </h2>
                 <p className="text-white/80 text-lg mb-8">
                    Skip the tourist traps and explore the city with people who know it best.
                 </p>
                 <Link to="/search">
                    <Button className="bg-white text-[#9A2143] hover:bg-gray-100 font-bold px-8 py-3 rounded-full border-none text-lg">
                       Find a Local
                    </Button>
                 </Link>
              </div>
              <div className="relative">
                 {/* Video Placeholder */}
                 <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 w-full max-w-md aspect-video relative group cursor-pointer">
                    <img
                      src="https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"
                      className="w-full h-full object-cover"
                      alt="Video thumbnail"
                      onError={(e) => (e.currentTarget.src = '/images/placeholder.svg')}
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                       <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white pl-1 shadow-lg group-hover:scale-110 transition-transform">
                          <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default ExplorePage;
