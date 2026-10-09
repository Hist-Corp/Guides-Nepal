import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { Button } from '../components/common/Button';
import { Price } from '../components/common/Price';
import { Star, ChevronLeft, ChevronRight, Heart, ArrowRight } from 'lucide-react';
import { NEPAL_IMAGES } from '../data/images';
import { getCatalogSearchExperiences } from '../utils/canonicalExperience';

// --- Mock Data ---

const topThingsToDo = [
  {
    id: 1,
    title: 'Eat & drink with locals',
    description: 'Discover the authentic flavors of the city.',
    image: NEPAL_IMAGES.newariFeast,
    link: '/search?category=food',
  },
  {
    id: 2,
    title: 'Hidden Gems Tour',
    description: 'Explore secret spots only locals know.',
    image: NEPAL_IMAGES.oldTown,
    link: '/search?category=tours',
  },
  {
    id: 3,
    title: 'Cultural Heritage',
    description: 'Dive deep into the rich history and traditions.',
    image: NEPAL_IMAGES.heritage,
    link: '/search?category=culture',
  },
  {
    id: 4,
    title: 'Art & Workshops',
    description: 'Create your own masterpiece with local artisans.',
    image: NEPAL_IMAGES.temples,
    link: '/search?category=art',
  },
];

const popularDestinations = [
  { name: 'Kathmandu', link: '/city/kathmandu', image: NEPAL_IMAGES.oldTown },
  { name: 'Pokhara', link: '/city/pokhara', image: NEPAL_IMAGES.phewaLake },
  { name: 'Lalitpur', link: '/city/lalitpur', image: NEPAL_IMAGES.heritage },
  { name: 'Bhaktapur', link: '/city/bhaktapur', image: NEPAL_IMAGES.boudhanath },
  // Chitwan experiences live under the Bharatpur city pages — there is no
  // /city/chitwan route, so link the card at its parent city instead.
  { name: 'Chitwan', link: '/city/bharatpur', image: NEPAL_IMAGES.forestHills },
];

const categories = [
  { name: 'Foodies', image: NEPAL_IMAGES.momos },
  { name: 'Families', image: NEPAL_IMAGES.phewaLake },
  { name: 'Night owls', image: NEPAL_IMAGES.nightMountains },
  { name: 'Newbies', image: NEPAL_IMAGES.everest },
  { name: 'Outdoor', image: NEPAL_IMAGES.annapurna },
];

// Curated picks resolved from the live city catalogs, so the cards always
// link to published experiences. (The old hard-coded slugs such as
// `taste-of-kathmandu` or `historic-patan` matched no catalog entry and
// dead-ended at "Experience not found".)
const EXPLORE_PICKS = [
  { city: 'kathmandu', slug: 'taste-of-kathmandu-street-food' },
  { city: 'lalitpur', slug: 'patans-hidden-courtyards' },
  { city: 'kathmandu', slug: 'drinks-bites-kathmandu' },
  { city: 'bhaktapur', slug: 'bhaktapur-heritage-walk' },
];

const experienceGrid = getCatalogSearchExperiences().filter((exp) =>
  EXPLORE_PICKS.some((pick) => pick.city === exp.city.toLowerCase() && pick.slug === exp.slug)
);

const localExperts = [
  {
    name: 'Kiran',
    tag: 'Foodie',
    image:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Sita',
    tag: 'History Buff',
    image:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Ramesh',
    tag: 'Outdoor',
    image:
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Priya',
    tag: 'Art Lover',
    image:
      'https://images.unsplash.com/photo-1444464666168-49d633b86797?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Bijay',
    tag: 'Night Owl',
    image:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  },
];

const testimonials = [
  {
    name: 'Olivia',
    rating: 5,
    text: 'An unforgettable experience! The guide was so knowledgeable and friendly.',
    image:
      'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=80&h=80&q=80',
  },
  {
    name: 'Charlotte',
    rating: 5,
    text: 'I learned so much about the culture. Highly recommended!',
    image:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=80&h=80&q=80',
  },
  {
    name: 'Mateo',
    rating: 5,
    text: 'The food tour was the highlight of my trip. Delicious!',
    image:
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=80&h=80&q=80',
  },
];

const ExplorePage: React.FC = () => {
  return (
    <div className="min-h-screen font-sans bg-background-cream">
      <Header />

      <main>
        {/* --- Top 10 Things to Do Carousel --- */}
        <section className="py-12 container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-primary">Top 10 Things to do</h2>
            <div className="flex gap-2">
              <button
                className="p-2 rounded-full border border-slate-200 bg-white hover:border-brand-yellow hover:text-primary transition-colors"
                aria-label="Previous"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                className="p-2 rounded-full border border-slate-200 bg-white hover:border-brand-yellow hover:text-primary transition-colors"
                aria-label="Next"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {topThingsToDo.map((item) => (
              <Link
                key={item.id}
                to={item.link}
                className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative flex flex-col focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:ring-offset-2"
              >
                <div className="absolute top-3 right-3 z-10 bg-white/80 backdrop-blur-sm p-1.5 rounded-full">
                  <Heart className="w-4 h-4 text-slate-500 group-hover:text-red-500 transition-colors" />
                </div>
                <div className="h-40 sm:h-44 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => (e.currentTarget.src = '/images/placeholder.svg')}
                  />
                </div>
                <div className="p-4 sm:p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-base sm:text-lg mb-2 text-primary">{item.title}</h3>
                  <p className="text-slate-600 text-sm mb-4 line-clamp-2">{item.description}</p>
                  <span className="mt-auto inline-flex w-fit items-center gap-1.5 bg-brand-yellow group-hover:bg-[#E5A800] text-primary text-xs font-bold py-2 px-4 rounded-full transition-colors pointer-events-none">
                    Explore
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* --- Brand Band (USPs) --- */}
        <section className="bg-primary py-6 text-white">
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
            <h2 className="text-2xl font-bold text-primary">Popular destinations</h2>
            <div className="flex gap-2">
              <button
                className="p-1.5 rounded-full border border-slate-200 bg-white hover:border-brand-yellow hover:text-primary transition-colors"
                aria-label="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                className="p-1.5 rounded-full border border-slate-200 bg-white hover:border-brand-yellow hover:text-primary transition-colors"
                aria-label="Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {popularDestinations.map((dest, i) => (
              <Link
                key={i}
                to={dest.link}
                className="flex-shrink-0 w-32 md:w-40 group cursor-pointer"
              >
                <div className="rounded-3xl overflow-hidden aspect-square mb-2 relative shadow-lg">
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => (e.currentTarget.src = '/images/placeholder.svg')}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent"></div>
                  <span className="absolute bottom-2 left-3 text-white font-bold text-sm drop-shadow-md">
                    {dest.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* --- Categories (Experiences for every interest) --- */}
        <section className="py-12 container mx-auto px-4">
          <h2 className="text-2xl font-bold text-primary mb-6">Experiences for every interest</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((cat, i) => (
              <Link
                key={i}
                to={`/search?category=${cat.name.toLowerCase()}`}
                className="relative rounded-3xl overflow-hidden aspect-[3/4] group cursor-pointer shadow-lg"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  onError={(e) => (e.currentTarget.src = '/images/placeholder.svg')}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                  <h3 className="text-white font-bold text-xl mb-3">{cat.name}</h3>
                  <span className="inline-block bg-brand-yellow text-primary text-xs font-bold px-4 py-2 rounded-full transition-colors group-hover:bg-[#E5A800]">
                    Explore
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* --- Experience Grid --- */}
        <section className="py-12 container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-primary">Handpicked experiences</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {experienceGrid.map((exp) => (
              <Link
                key={exp.id}
                to={exp.path}
                className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={exp.heroImage}
                    alt={exp.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => (e.currentTarget.src = '/images/placeholder.svg')}
                  />
                  <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-white/90 backdrop-blur-sm pr-3 pl-1 py-1 rounded-full text-xs font-bold text-primary shadow-sm">
                    <img
                      src={exp.host.image}
                      alt={exp.host.name}
                      className="w-6 h-6 rounded-full object-cover"
                      onError={(e) => (e.currentTarget.src = '/images/placeholder.svg')}
                    />
                    <span>Local Expert {exp.host.name}</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-primary text-lg mb-1 truncate">{exp.title}</h3>
                  <p className="text-slate-600 text-sm mb-4 line-clamp-2">{exp.description}</p>
                  <div className="flex items-center space-x-1 mb-2">
                    <Star className="w-4 h-4 text-brand-yellow fill-brand-yellow" />
                    <span className="font-medium text-primary">{exp.rating}</span>
                    <span className="text-slate-500 text-sm">({exp.reviews})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Price amount={exp.price} className="text-lg font-bold text-primary" />
                    <button className="text-sm font-bold text-primary hover:text-brand-yellow transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center">
            <Link to="/search">
              <Button className="bg-brand-yellow hover:bg-[#E5A800] text-primary font-bold px-8 py-3 rounded-full border-none shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                View more experiences
              </Button>
            </Link>
          </div>
        </section>

        {/* --- Local Experts Carousel --- */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-primary">
                Explore the city with a local of your choice
              </h2>
              <div className="flex gap-2">
                <button
                  className="p-2 rounded-full border border-slate-200 bg-white hover:border-brand-yellow hover:text-primary transition-colors"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  className="p-2 rounded-full border border-slate-200 bg-white hover:border-brand-yellow hover:text-primary transition-colors"
                  aria-label="Next"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {localExperts.map((expert, i) => (
                <div key={i} className="group cursor-pointer">
                  <div className="relative rounded-3xl overflow-hidden aspect-[3/4] mb-3 shadow-lg">
                    <img
                      src={expert.image}
                      alt={expert.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => (e.currentTarget.src = '/images/placeholder.svg')}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4">
                      <Button
                        size="sm"
                        className="bg-brand-yellow hover:bg-[#E5A800] text-primary border-none text-xs font-bold"
                      >
                        View Profile
                      </Button>
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-primary text-lg">{expert.name}</h3>
                    <span className="text-secondary font-medium text-sm uppercase tracking-wide">
                      {expert.tag}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- Testimonials --- */}
        <section className="py-16 container mx-auto px-4 bg-peach rounded-3xl my-8">
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-10 text-center">
            What other travelers love about our local experts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl shadow-lg p-8 flex flex-col items-center text-center hover:shadow-xl transition-shadow"
              >
                <img
                  src={t.image}
                  alt={t.name}
                  className="w-16 h-16 rounded-full object-cover mb-4 ring-4 ring-brand-yellow/30"
                  onError={(e) => (e.currentTarget.src = '/images/placeholder.svg')}
                />
                <div className="flex gap-1 mb-3">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-brand-yellow text-brand-yellow" />
                  ))}
                </div>
                <p className="text-slate-600 italic mb-4">"{t.text}"</p>
                <h4 className="font-bold text-primary mt-auto">{t.name}</h4>
                <button className="text-primary text-sm font-bold mt-2 hover:text-brand-yellow transition-colors">
                  Read more stories
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* --- Bottom Promo Banner --- */}
        <section className="bg-primary py-20 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <img
              src="https://images.unsplash.com/photo-1508009603885-50cf7c579365?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
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
                <Button className="bg-brand-yellow hover:bg-[#E5A800] text-primary font-bold px-8 py-3 rounded-full border-none text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
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
                  <div className="w-16 h-16 bg-brand-yellow rounded-full flex items-center justify-center text-primary pl-1 shadow-lg group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
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
