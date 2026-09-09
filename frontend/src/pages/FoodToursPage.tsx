import React, { useEffect, useState } from 'react';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { Button } from '../components/common/Button';
import { ArrowLeft, Check, ShieldCheck, Users } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import guidesApi, { Guide } from '../services/guidesApi';





export const FoodToursPage: React.FC = () => {
  const navigate = useNavigate();
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        const guidesData = await guidesApi.getGuides();
        setGuides(guidesData);
      } catch (error) {
        console.error('Error fetching guides:', error);
        // Fallback to mock data if API fails
        setGuides([
          { id: 1, name: "Apicha", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=128&h=128&q=80", role: "Street Food Specialist", rating: 4.9, reviews: 120, bio: "Expert in Kathmandu Valley street food.", languages: ["English", "Nepali"], verified: true, livesIn: "Kathmandu", cities: ["Kathmandu"], gallery: [], is_active: true },
          { id: 2, name: "Sujal", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=128&h=128&q=80", role: "Newari Cuisine Expert", rating: 4.8, reviews: 89, bio: "Specialist in traditional Newari cuisine.", languages: ["English", "Nepali", "Newari"], verified: true, livesIn: "Kathmandu", cities: ["Kathmandu", "Bhaktapur"], gallery: [], is_active: true },
          { id: 3, name: "Priya", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=128&h=128&q=80", role: "Himalayan Flavors Guide", rating: 4.95, reviews: 156, bio: "Expert in Himalayan regional cuisine.", languages: ["English", "Nepali"], verified: true, livesIn: "Pokhara", cities: ["Pokhara", "Kathmandu"], gallery: [], is_active: true },
          { id: 4, name: "Rohan", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=128&h=128&q=80", role: "Terai Traditions Keeper", rating: 4.92, reviews: 78, bio: "Specialist in Terai region traditions and cuisine.", languages: ["English", "Nepali", "Hindi"], verified: true, livesIn: "Bharatpur", cities: ["Bharatpur", "Kathmandu"], gallery: [], is_active: true }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchGuides();
  }, []);
  const cultureCards = [
    {
      slug: 'newari',
      title: 'Newari Heritage Bites',
      subtitle: 'Kathmandu Valley classics and festival foods',
      image:
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    },
    {
      slug: 'sherpa',
      title: 'Sherpa Mountain Flavors',
      subtitle: 'High‑altitude hearty dishes from the Himalaya',
      image:
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    },
    {
      slug: 'tharu',
      title: 'Tharu Terai Traditions',
      subtitle: 'Forest‑foraged and riverland flavors',
      image:
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    },
    {
      slug: 'tamang',
      title: 'Tamang Hearth & Homestyle',
      subtitle: 'Hillside comfort cuisine',
      image:
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    },
    {
      slug: 'gurung',
      title: 'Gurung Village Plates',
      subtitle: 'Highland soups and smoked meats',
      image:
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    },
    {
      slug: 'tibetan',
      title: 'Tibetan‑Nepali Fusion',
      subtitle: 'Momos, thenthuk, and butter tea',
      image:
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    },
    {
      slug: 'maithil',
      title: 'Maithil Mithila Feasts',
      subtitle: 'Plains’ vegetarian delicacies',
      image:
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    },
    {
      slug: 'thakali',
      title: 'Thakali Spice Trail',
      subtitle: 'Legendary dal‑bhat and achars',
      image:
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white">
      <Header />
      
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
            <div className="w-full md:w-1/2 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-600 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-brand-yellow animate-pulse"></span>
                100% private & flexible
              </div>
              
              <h1 className="text-2xl md:text-4xl font-bold text-gray-900 leading-tight">
                Taste Nepal with locals, <br className="hidden md:block" />
                <span className="text-[#213448]">one bite at a time</span>
              </h1>
              
              <p className="text-xl text-gray-600 max-w-lg leading-relaxed">
                Walk lively markets, follow hidden alleyways, and taste iconic dishes like momos, Newari feast bites, and Thakali thalis. Your local guide shapes the route around your pace and cravings.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <button 
                  onClick={() => document.getElementById('culture-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-3.5 bg-brand-yellow hover:bg-[#E5A800] text-slate-900 font-bold rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  Explore food cultures
                </button>
              </div>
            </div>

            <div className="w-full md:w-1/2 relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4 translate-y-8">
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-lg">
                    <img 
                      src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80" 
                      alt="Local food guide in Kathmandu"
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-lg bg-[#E0F2FE] p-4 flex items-center justify-center text-center">
                    <div>
                      <div className="text-3xl font-bold text-[#213448] mb-1">{cultureCards.length}</div>
                      <div className="text-gray-600 font-medium">Food Cultures</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-lg">
                    <img 
                      src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80" 
                      alt="Momo tasting"
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-lg rounded-bl-[4rem]">
                    <img 
                      src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80" 
                      alt="Newari feast tasting"
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white py-16 text-center border-b border-gray-100">
         <h2 className="text-3xl md:text-4xl font-bold text-[#213448] leading-tight font-sans tracking-tight">
            Real Flavors. Real Stories.<br />
            Really Good Food Tours.
         </h2>
      </div>

      <main className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20 text-center">
          <div className="flex flex-col items-center group">
            <div className="w-20 h-20 rounded-full bg-[#FFF0E6] flex items-center justify-center text-[#213448] mb-6 group-hover:scale-110 transition-transform duration-300">
              <Users className="w-10 h-10" />
            </div>
            <h3 className="font-bold text-xl mb-3 text-gray-900">Real people, real flavors</h3>
            <p className="text-gray-500 max-w-xs">Taste the stories behind Nepal’s everyday food.</p>
          </div>
          <div className="flex flex-col items-center group">
            <div className="w-20 h-20 rounded-full bg-[#FFF0E6] flex items-center justify-center text-[#213448] mb-6 group-hover:scale-110 transition-transform duration-300">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <h3 className="font-bold text-xl mb-3 text-gray-900">Feel like a local, not a tourist</h3>
            <p className="text-gray-500 max-w-xs">Always private. It’s just you and your local guide.</p>
          </div>
          <div className="flex flex-col items-center group">
            <div className="w-20 h-20 rounded-full bg-[#FFF0E6] flex items-center justify-center text-[#213448] mb-6 group-hover:scale-110 transition-transform duration-300">
              <Check className="w-10 h-10" />
            </div>
            <h3 className="font-bold text-xl mb-3 text-gray-900">More you, less checklist</h3>
            <p className="text-gray-500 max-w-xs">Follow your cravings and customize every stop.</p>
          </div>
        </div>

        <section id="guides-section" className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Meet Your Local Food Guides</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Our guides are passionate foodies who will take you on a culinary journey through the heart of Nepal.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="text-center animate-pulse">
                  <div className="aspect-[4/5] rounded-2xl bg-gray-200 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2 w-3/4 mx-auto"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
                </div>
              ))
            ) : guides.length > 0 ? (
              guides.map((guide) => (
                <Link key={guide.name} to={`/local/${guide.id}`} className="text-center group">
                  <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-lg mb-4 group-hover:shadow-xl transition-shadow duration-300">
                    <img src={guide.image} alt={guide.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 group-hover:text-[#D2691E] transition-colors duration-300">{guide.name}</h3>
                  <p className="text-sm text-gray-600">{guide.role}</p>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500">
                <p>No guides available at the moment.</p>
              </div>
            )}
          </div>
        </section>

        <section id="culture-section" className="mb-20">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Explore by Ethnic Food Culture</h2>
              <p className="text-gray-600">Choose a culture to dive into its flavors, places, and stories</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cultureCards.map((c) => (
              <div
                key={c.slug}
                onClick={() => navigate(`/food-tours/culture/${c.slug}`)}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group cursor-pointer"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={c.image}
                    alt={c.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-lg text-gray-900 mb-1 leading-tight group-hover:text-[#213448] transition-colors">
                    {c.title}
                  </h3>
                  <p className="text-sm text-gray-600">{c.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        <div className="full-width bg-[#E0F2FE] -mx-4 md:-mx-[max(1rem,calc((100vw-80rem)/2))] px-4 md:px-[max(1rem,calc((100vw-80rem)/2))] py-20 mb-24">
          <div className="text-center mb-12">
             <span className="text-[#213448] font-bold uppercase tracking-wider text-sm block mb-2">Experiences</span>
             <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Things to do in Nepal</h2>
          </div>
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card 1: Street Food Safari */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80" alt="Street Food Safari" className="w-full h-64 object-cover" />
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Street Food Safari</h3>
                <p className="text-gray-600 mb-4">Dive into the heart of Kathmandu's vibrant street food scene. A private food tour is the best way to discover the most delicious and authentic local snacks, from savory samosas and momos to sweet jalebis and sel roti.</p>
                <p className="text-gray-600">Let a local guide you through the bustling markets and hidden alleyways to taste the true flavors of Nepal. It's an experience that will delight your senses and leave you with a full belly.</p>
              </div>
            </div>
            {/* Card 2: Momo Mania */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80" alt="Momo Mania" className="w-full h-64 object-cover" />
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Momo Mania: A Dumpling Quest</h3>
                <p className="text-gray-600 mb-4">Embark on a quest to find the best momos in Kathmandu! These delicious dumplings, often filled with spiced meat or vegetables, are a Nepali obsession, and every local has their favorite spot. Join a food tour to sample a variety of momos, from traditional to modern twists.</p>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <h4 className="font-bold text-gray-800 mb-2">Popular Momo Varieties</h4>
                  <ul className="list-disc list-inside text-gray-600">
                    <li>Steamed, Fried, Kothey (pan-fried), Chilli (in spicy sauce)</li>
                  </ul>
                </div>
              </div>
            </div>
            {/* Card 3: The Legendary Dal Bhat */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80" alt="Dal Bhat Thali" className="w-full h-64 object-cover" />
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">The Legendary Dal Bhat</h3>
                <p className="text-gray-600 mb-4">Taste the heart and soul of Nepali cuisine: Dal Bhat. This staple meal, consisting of lentil soup, steamed rice, and various side dishes, is eaten daily by millions. A food tour can introduce you to regional variations, from the rich Thakali thali to simple homestyle versions.</p>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <h4 className="font-bold text-gray-800 mb-2">What's in a Thali?</h4>
                  <p className="text-gray-600">Dal (lentils), Bhat (rice), Tarkari (curry), Achar (pickle), and often a meat or vegetable side.</p>
                </div>
              </div>
            </div>
            {/* Card 4: Newari Culinary Journey */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80" alt="Newari Culinary Journey" className="w-full h-64 object-cover" />
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Newari Culinary Journey</h3>
                <p className="text-gray-600 mb-4">Explore the unique and flavorful cuisine of the Newar people, the indigenous inhabitants of the Kathmandu Valley. A Newari food tour will take you to traditional eateries to sample a wide array of dishes, from savory lentil pancakes (wo) and sweet yomari dumplings to spicy buffalo meat (choila).</p>
                <div className="bg-yellow-100 p-4 rounded-lg">
                  <h4 className="font-bold text-yellow-800 mb-2">MUST TRY</h4>
                  <p className="text-yellow-700">Try a traditional Newari feast (Bhoj) for the full experience!</p>
                </div>
              </div>
            </div>
            {/* Card 5: Thakali Thali Trail */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80" alt="Thakali Thali Trail" className="w-full h-64 object-cover" />
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Thakali Thali Trail</h3>
                <p className="text-gray-600 mb-4">Taste why Thakali dal‑bhat became famous across Nepal: clean, balanced flavors, comforting lentils, fluffy rice, seasonal greens, and a bright lineup of achars that wake up every bite.</p>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <h4 className="font-bold text-gray-800 mb-2">LOOK FOR</h4>
                  <p className="text-gray-600">Tangy pickles, gundruk, and that perfect lentil aroma.</p>
                </div>
              </div>
            </div>
            {/* Card 6: Himalayan Noodle Bowls */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80" alt="Himalayan Noodle Bowls" className="w-full h-64 object-cover" />
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Himalayan Noodle Bowls</h3>
                <p className="text-gray-600 mb-4">Warm up with Sherpa and Tibetan‑Nepali comfort food: thukpa and thenthuk broths, dumplings, and teahouse bites that reflect trade routes, altitude life, and mountain hospitality.</p>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <h4 className="font-bold text-gray-800 mb-2">WARMING FAVORITES</h4>
                  <ul className="list-disc list-inside text-gray-600">
                    <li>Thukpa, thenthuk, and spicy chutneys</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

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

        <div className="bg-white py-20">
          <div className="max-w-4xl mx-auto text-left">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Best food tour experiences in Nepal</h2>
            <div className="text-gray-600 space-y-4">
              <p>Nepali cuisine is a delightful blend of flavors, spices, and traditions that will tantalize your taste buds! From the aromatic dal bhat to the delicate momo dumplings, every dish tells a story of cultural heritage and family traditions.</p>
              <p>Start your culinary journey with a Street Food Safari, diving into the heart of Kathmandu's vibrant food scene. This is the best way to discover authentic local snacks, from savory samosas to sweet jalebis, guided by a local expert.</p>
              <p>If you're a fan of dumplings, you're in for a treat! Momo Mania is an art form in Nepal. These juicy dumplings, filled with spiced meat or vegetables, are a national obsession. A food tour will take you to the best spots to taste them, steamed, fried, or in a spicy soup.</p>
              <p>Want to explore beyond the basics? Discover Newari cuisine, the indigenous food culture of the Kathmandu Valley. From spicy choila meat to sweet yomari dumplings, these ancient recipes offer a taste of authentic Nepali heritage.</p>
              <p>No matter what your culinary interests are, there's always something delicious to discover in Nepal. And with a Guides Nepal food tour, you can customize your experience to focus on your favorite flavors. So what are you waiting for? Book your private food tour today and discover the magic of Nepali cuisine!</p>
            </div>
          </div>
        </div>

        <div className="bg-[#F7FAFC] -mx-4 md:-mx-[max(1rem,calc((100vw-80rem)/2))] px-4 md:px-[max(1rem,calc((100vw-80rem)/2))] py-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related keywords</h2>
            <div className="flex flex-wrap gap-3">
              {['Nepali food tour', 'Momo tasting', 'Dal bhat experience', 'Newari cuisine', 'Kathmandu street food', 'Traditional Nepali food', 'Spice market tour', 'Local food guide Nepal', 'Organic farm tour', 'Vegetarian Nepali food', 'Nepali street food', 'Food tasting Nepal', 'Authentic Nepali cuisine', 'Kathmandu food guide', 'Hands-on food tour', 'Nepali kitchen secrets', 'Traditional food methods', 'Nepali family meals', 'Cultural food experience', 'Nepali spices', 'Kathmandu culinary adventure', 'Food vacation Nepal', 'Food tour Kathmandu', 'Local food experience'].map((keyword, index) => (
                <button key={index} className="px-4 py-2 bg-white border border-gray-300 rounded-full text-gray-700 hover:bg-gray-100 transition-colors">
                  {keyword}
                </button>
              ))}
            </div>
          </div>
        </div>

        <section className="bg-[#213448] rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Taste Nepal?</h2>
          <p className="text-xl mb-8 opacity-90">Join thousands of food lovers who've discovered Nepal through its incredible cuisine</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => document.getElementById('culture-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-brand-yellow hover:bg-[#E5A800] text-slate-900 px-8 py-3 rounded-full font-bold transition-all"
            >
              Browse Food Cultures
            </Button>
            <Button 
              onClick={() => document.getElementById('culture-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white hover:bg-gray-100 text-[#213448] px-8 py-3 rounded-full font-bold transition-all"
            >
              Start Exploring
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};
