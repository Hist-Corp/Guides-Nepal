import React, { useState } from 'react';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { Button } from '../components/common/Button';
import {
  Star,
  Users,
  Heart,
  ShieldCheck,
  Check,
  Clock,
  ChevronRight,
  Mountain,
  Footprints,
  Compass,
  ArrowLeft,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../contexts/CurrencyContext';
import { getCanonicalExperienceBySlug } from '../utils/canonicalExperience';
import { useGoBack } from '../utils/backNavigation';

type TrekGrade = 'Easy' | 'Moderate' | 'Challenging';

interface TrekRoute {
  id: number;
  title: string;
  rating: number;
  reviews: number;
  type: 'Trekking' | 'Hiking';
  grade: TrekGrade;
  duration: string;
  maxAltitude: string;
  region: string;
  highlight: string;
  price: number;
  image: string;
  locals: string[];
  slug: string;
}

// Licensed trekking & hiking guides who lead our routes across Nepal.
const trekLocals = [
  {
    name: 'Lhakpa',
    title: 'The Everest Local',
    reviews: 512,
    languages: 'English・Sherpa・Nepali',
  },
  { name: 'Tenzin', title: 'The Trekking Specialist', reviews: 445, languages: 'English・Nepali・Tibetan' },
  { name: 'Pema', title: 'The Annapurna Expert', reviews: 287, languages: 'English・Nepali' },
  { name: 'Nima', title: 'The Sunrise Hiker', reviews: 198, languages: 'English・Nepali' },
  { name: 'Dorje', title: 'The Trail Photographer', reviews: 176, languages: 'English・Nepali' },
  { name: 'Pasang', title: 'The Rhododendron Guide', reviews: 163, languages: 'English・Nepali' },
  { name: 'Mingma', title: 'The High-Altitude Runner', reviews: 156, languages: 'English・Nepali' },
  { name: 'Tashi', title: 'The Eco Trekker', reviews: 267, languages: 'English・German・Nepali' },
];

// The Trek/Hiking sub-category: multi-day teahouse treks plus single-day
// valley hikes, each led by a licensed local guide.
export const trekRoutes: TrekRoute[] = [
  {
    id: 1,
    title: 'Everest Base Camp Trek',
    rating: 5,
    reviews: 1273,
    type: 'Trekking',
    grade: 'Challenging',
    duration: '12 days',
    maxAltitude: '5,364 m',
    region: 'Everest (Khumbu)',
    highlight:
      'Walk the Khumbu to the foot of Everest via Namche Bazaar, Tengboche monastery and a sunrise from Kala Patthar.',
    price: 899,
    image:
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    locals: ['Lhakpa', 'Tenzin', 'Nima'],
    slug: 'everest-base-camp-trek',
  },
  {
    id: 2,
    title: 'Annapurna Base Camp Trek',
    rating: 4.9,
    reviews: 892,
    type: 'Trekking',
    grade: 'Moderate',
    duration: '8 days',
    maxAltitude: '4,130 m',
    region: 'Annapurna',
    highlight:
      'Into the heart of the Annapurna sanctuary — Gurung villages, the hot springs of Jhinu Danda and a 360° amphitheatre of peaks.',
    price: 549,
    image:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    locals: ['Pema', 'Tenzin'],
    slug: 'annapurna-base-camp-trek',
  },
  {
    id: 3,
    title: 'Annapurna Circuit Trek',
    rating: 4.9,
    reviews: 864,
    type: 'Trekking',
    grade: 'Challenging',
    duration: '14 days',
    maxAltitude: '5,416 m',
    region: 'Annapurna & Mustang',
    highlight:
      'Cross the 5,416 m Thorong La pass from green rice terraces into the rain-shadow landscapes of Mustang.',
    price: 749,
    image:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    locals: ['Pema', 'Mingma'],
    slug: 'annapurna-circuit-trek',
  },
  {
    id: 4,
    title: 'Ghorepani Poon Hill Trek',
    rating: 4.8,
    reviews: 521,
    type: 'Trekking',
    grade: 'Easy',
    duration: '5 days',
    maxAltitude: '3,210 m',
    region: 'Annapurna',
    highlight:
      'The classic short trek — a sunrise panorama of Dhaulagiri and Annapurna from the 3,210 m Poon Hill ridge.',
    price: 349,
    image:
      'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    locals: ['Pasang', 'Nima'],
    slug: 'ghorepani-poon-hill-trek',
  },
  {
    id: 5,
    title: 'Langtang Valley Trek',
    rating: 4.8,
    reviews: 412,
    type: 'Trekking',
    grade: 'Moderate',
    duration: '9 days',
    maxAltitude: '3,870 m',
    region: 'Langtang',
    highlight:
      'Tamang villages, yak pastures and hanging glaciers a day’s drive from Kathmandu, on a trail rebuilt by the valley’s own communities.',
    price: 649,
    image:
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    locals: ['Dorje', 'Tenzin'],
    slug: 'langtang-valley-trek',
  },
  {
    id: 6,
    title: 'Mardi Himal Trek',
    rating: 4.9,
    reviews: 236,
    type: 'Trekking',
    grade: 'Moderate',
    duration: '7 days',
    maxAltitude: '3,580 m',
    region: 'Annapurna',
    highlight:
      'A forested ridge line directly beneath Machhapuchhre — Nepal’s best-value trek off the beaten track.',
    price: 499,
    image:
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    locals: ['Pema', 'Pasang'],
    slug: 'mardi-himal-trek',
  },
  {
    id: 7,
    title: 'Sarangkot Sunrise Hike',
    rating: 4.9,
    reviews: 378,
    type: 'Hiking',
    grade: 'Easy',
    duration: '1 day',
    maxAltitude: '1,592 m',
    region: 'Pokhara',
    highlight:
      'A pre-dawn start from Pokhara for a golden Annapurna sunrise, followed by breakfast with a local family.',
    price: 45,
    image:
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    locals: ['Nima', 'Pema'],
    slug: 'sarangkot-sunrise-hike',
  },
  {
    id: 8,
    title: 'Changu Narayan Hike',
    rating: 4.8,
    reviews: 194,
    type: 'Hiking',
    grade: 'Easy',
    duration: '1 day',
    maxAltitude: '1,551 m',
    region: 'Bhaktapur',
    highlight:
      'A pine-forest ridge walk from Bhaktapur to Nepal’s oldest living temple, with valley-to-mountain views.',
    price: 39,
    image:
      'https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    locals: ['Dorje', 'Pasang'],
    slug: 'changu-narayan-hike',
  },
  {
    id: 9,
    title: 'Khopra Ridge Trek',
    rating: 4.9,
    reviews: 268,
    type: 'Trekking',
    grade: 'Moderate',
    duration: '10 days',
    maxAltitude: '3,660 m',
    region: 'Annapurna',
    highlight:
      'A quiet community-run ridge above the Modi Khola, with Dhaulagiri on one side, Annapurna on the other and a night beside glacial Khayer Lake.',
    price: 629,
    image:
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1740&q=80',
    locals: ['Pasang', 'Dorje', 'Pema'],
    slug: 'khopra-ridge-trek',
  },
  {
    id: 10,
    title: 'Helambu & Gosainkunda Trek',
    rating: 4.8,
    reviews: 341,
    type: 'Trekking',
    grade: 'Moderate',
    duration: '8 days',
    maxAltitude: '4,380 m',
    region: 'Helambu & Langtang',
    highlight:
      'Through Tamang and Sherpa farming villages into the sacred alpine lakes of Gosainkunda, ringed by the Langtang Himal.',
    price: 529,
    image:
      'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    locals: ['Tashi', 'Tenzin'],
    slug: 'helambu-gosainkunda-trek',
  },
  {
    id: 11,
    title: 'Shivapuri National Park Hike',
    rating: 4.7,
    reviews: 176,
    type: 'Hiking',
    grade: 'Easy',
    duration: '1 day',
    maxAltitude: '2,732 m',
    region: 'Kathmandu Valley',
    highlight:
      'Cloud forest, waterfalls and hilltop Hindu and Buddhist shrines — the greenest half-day escape just north of Kathmandu.',
    price: 29,
    image:
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    locals: ['Dorje', 'Tashi'],
    slug: 'shivapuri-day-hike',
  },
  {
    id: 12,
    title: 'Nagarkot to Dhulikhel Ridge Hike',
    rating: 4.8,
    reviews: 214,
    type: 'Hiking',
    grade: 'Easy',
    duration: '2 days',
    maxAltitude: '2,195 m',
    region: 'Kathmandu Valley',
    highlight:
      'Ridge walking between two classic hill stations, with the Everest range on the horizon and sunset over the valley below.',
    price: 99,
    image:
      'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    locals: ['Nima', 'Mingma'],
    slug: 'nagarkot-dhulikhel-hike',
  },
];

// Highest-rated multi-day treks headlined under "Top Rated Treks in Nepal".
const topRatedSlugs = [
  'everest-base-camp-trek',
  'annapurna-base-camp-trek',
  'annapurna-circuit-trek',
  'langtang-valley-trek',
];

const topRatedTreks = trekRoutes.filter((route) => topRatedSlugs.includes(route.slug));

const grades: ('All routes' | TrekGrade)[] = ['All routes', 'Easy', 'Moderate', 'Challenging'];

const gradeStyles: Record<TrekGrade, string> = {
  Easy: 'bg-green-100 text-green-700',
  Moderate: 'bg-amber-100 text-amber-700',
  Challenging: 'bg-red-100 text-red-700',
};

const bestSeasons = [
  {
    season: 'Spring',
    months: 'March – May',
    desc: 'Rhododendron forests blaze red and pink, days are warm and long, and the rhododendron valleys of Annapurna and Langtang are at their best.',
    icon: <Mountain className="w-8 h-8" />,
  },
  {
    season: 'Autumn',
    months: 'September – November',
    desc: 'Peak trekking season. The monsoon haze clears for crystal views of Everest, Annapurna and the whole Himalayan skyline.',
    icon: <Compass className="w-8 h-8" />,
  },
  {
    season: 'Winter',
    months: 'December – February',
    desc: 'Quiet trails, crisp snow mornings and lower teahouse prices — perfect for Poon Hill and valley hikes below 3,000 m.',
    icon: <Footprints className="w-8 h-8" />,
  },
  {
    season: 'Monsoon',
    months: 'June – August',
    desc: 'Lush green valleys, waterfalls in full flow and very few trekkers. Rain-shadow regions like Mustang and Dolpo shine.',
    icon: <ShieldCheck className="w-8 h-8" />,
  },
];

const included = [
  'Licensed, English-speaking local trekking guide',
  'All teahouse & lodge bookings along the route',
  'Trekking permits: TIMS card and national park entry',
  'Private transport to and from the trailhead',
  'Porter and luggage options on request',
  'Daily altitude checks with pulse oximeter',
  'Three meals a day on the trek (dal bhat power)',
  'Emergency evacuation support and 24/7 trail contact',
];

const trekFaqs = [
  {
    q: 'Do I need previous trekking experience?',
    a: 'For our Easy routes — Poon Hill, Sarangkot and the Kathmandu valley hikes — no experience is needed; if you can walk for four to five hours with breaks, you will enjoy them. Moderate treks such as Annapurna Base Camp and Langtang Valley suit anyone who is reasonably fit and walks regularly. Challenging routes like Everest Base Camp and the Annapurna Circuit are best tackled with some high-altitude experience or a good base of hill walking.',
  },
  {
    q: 'How do the guides handle altitude sickness?',
    a: 'Every trek is led by a licensed guide trained in wilderness first aid and altitude awareness. We build rest and acclimatisation days into itineraries above 3,000 m, carry a pulse oximeter for daily checks, and follow a conservative "walk high, sleep low" plan. If symptoms appear, your guide can arrange descent, oxygen or a helicopter evacuation immediately — evacuation cover is included with every booking.',
  },
  {
    q: 'Which permits do I need for a trek in Nepal?',
    a: 'Most treks require a TIMS card (Trekkers’ Information Management System) plus the entry permit of the conservation area or national park — for example the Annapurna Conservation Area Permit (ACAP) for Annapurna routes and the Sagarmatha National Park permit for Everest. Your guide arranges and carries all permits; simply bring your passport and a few passport photos.',
  },
  {
    q: 'What should I pack?',
    a: 'Pack light and layer: broken-in trekking boots, a down jacket for evenings above 3,000 m, thermal layers, a rain shell, sun protection, a refillable water bottle and purification tablets, plus a sleeping bag for winter departures. A small daypack for trail snacks and a basic first-aid kit complete the kit. Your guide sends a detailed packing list after booking.',
  },
  {
    q: 'When is the best time to trek in Nepal?',
    a: 'Autumn (September to November) and spring (March to May) are the classic windows: stable weather, good visibility and comfortable temperatures. Winter is beautiful and quiet on lower routes, while the monsoon suits rain-shadow regions such as Upper Mustang. We run private departures year-round and adjust routes to the season.',
  },
  {
    q: 'Can I book a private or custom trek?',
    a: 'Yes. Every trek and hike is private by default — it is just you, your group and your guide. Tell us your dates, fitness level and wish list and we can adjust the length, add side trails such as Poon Hill or Ghandruk, slow down the pace, or arrange a helicopter return from Everest Base Camp.',
  },
];

export const TrekHikingPage: React.FC = () => {
  const navigate = useNavigate();
  const goBack = useGoBack();
  const { formatPrice } = useCurrency();
  const [showAllLocals, setShowAllLocals] = useState(false);
  const [activeGrade, setActiveGrade] = useState<'All routes' | TrekGrade>('All routes');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const displayedLocals = showAllLocals ? trekLocals : trekLocals.slice(0, 5);
  const displayedRoutes =
    activeGrade === 'All routes'
      ? trekRoutes
      : trekRoutes.filter((route) => route.grade === activeGrade);

  const openRoute = (slug: string) => {
    navigate(getCanonicalExperienceBySlug(slug)?.path ?? `/experience/${slug}`);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white">
      <Header />

      {/* Hero Section */}
      <div className="relative pt-4 pb-16 overflow-hidden bg-[#E0F2FE]">
        <div className="container mx-auto px-4 relative z-10">
          <button
            onClick={goBack}
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
                Trek & hike the Himalayas of <br className="hidden md:block" />
                <span className="text-[#213448]">Nepal</span> with our locals
              </h1>

              <p className="text-xl text-gray-600 max-w-lg leading-relaxed">
                From one-day sunrise hikes above Pokhara to two weeks on the trail to Everest Base
                Camp — walk with a licensed local guide who knows every teahouse, shortcut and
                acclimatisation day that makes the difference.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <button
                  onClick={() =>
                    document
                      .getElementById('trek-routes-section')
                      ?.scrollIntoView({ behavior: 'smooth' })
                  }
                  className="px-8 py-3.5 bg-brand-yellow hover:bg-[#E5A800] text-slate-900 font-bold rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  Find your trek
                </button>
                <button
                  onClick={() => navigate('/search?q=trek+hiking')}
                  className="px-8 py-3.5 bg-white border border-[#213448] text-[#213448] font-bold rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  Browse all experiences
                </button>
              </div>
            </div>

            {/* Right Content - Image Collage */}
            <div className="w-full md:w-1/2 relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4 translate-y-8">
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-lg">
                    <img
                      src="https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"
                      alt="Trekker on a Himalayan trail"
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-lg bg-[#FFF0E6] p-4 flex items-center justify-center text-center">
                    <div>
                      <div className="text-3xl font-bold text-[#213448] mb-1">12</div>
                      <div className="text-gray-600 font-medium">Signature Routes</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-lg">
                    <img
                      src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fA%3D%3D&auto=format&fit=crop&w=800&h=800&q=80"
                      alt="Himalayan peaks"
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-lg rounded-bl-[4rem]">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"
                      alt="Local trekking guide"
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
          Real People. Real Stories.
          <br />
          Really Good Travel.
        </h2>
      </div>

      <main className="container mx-auto px-4 py-16 max-w-7xl">
        {/* Value Props */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20 text-center">
          <div className="flex flex-col items-center group">
            <div className="w-20 h-20 rounded-full bg-[#E0F2FE] flex items-center justify-center text-[#213448] mb-6 group-hover:scale-110 transition-transform duration-300">
              <Users className="w-10 h-10" />
            </div>
            <h3 className="font-bold text-xl mb-3 text-gray-900">Real People. Real Stories.</h3>
            <p className="text-gray-500 max-w-xs">Really Good Travel.</p>
          </div>
          <div className="flex flex-col items-center group">
            <div className="w-20 h-20 rounded-full bg-[#E0F2FE] flex items-center justify-center text-[#213448] mb-6 group-hover:scale-110 transition-transform duration-300">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <h3 className="font-bold text-xl mb-3 text-gray-900">Licensed local trekking guides</h3>
            <p className="text-gray-500 max-w-xs">
              Government-certified guides who live in the regions they lead — trained in first aid
              and altitude care.
            </p>
          </div>
          <div className="flex flex-col items-center group">
            <div className="w-20 h-20 rounded-full bg-[#E0F2FE] flex items-center justify-center text-[#213448] mb-6 group-hover:scale-110 transition-transform duration-300">
              <Check className="w-10 h-10" />
            </div>
            <h3 className="font-bold text-xl mb-3 text-gray-900">More you, less checklist</h3>
            <p className="text-gray-500 max-w-xs">
              Set your own pace, rest days and wish list — every trek is private and shaped around
              you.
            </p>
          </div>
        </div>

        {/* Featured Section (Top Rated Treks) */}
        <div className="mb-24">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h3 className="text-[#213448] font-bold uppercase tracking-wider text-sm mb-2">
                Don't miss out
              </h3>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Top Rated Treks in Nepal
              </h2>
            </div>
            <button
              onClick={() => navigate('/search?q=trek+hiking')}
              className="hidden md:flex items-center text-[#213448] font-bold hover:underline"
            >
              View all experiences <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {topRatedTreks.map((trek) => (
              <div
                key={trek.id}
                className="group relative rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300"
                onClick={() => openRoute(trek.slug)}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>
                <img
                  src={trek.image}
                  alt={trek.title}
                  className="w-full h-[340px] object-cover group-hover:scale-105 transition-transform duration-500"
                />

                <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                  <span className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-1 text-xs font-bold text-gray-900">
                    <Star className="w-3 h-3 fill-brand-yellow text-brand-yellow" />
                    {trek.rating} ({trek.reviews})
                  </span>
                  <span
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold ${gradeStyles[trek.grade]}`}
                  >
                    {trek.grade}
                  </span>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-8 z-20 text-white">
                  <h3 className="text-2xl font-bold mb-2 leading-tight">{trek.title}</h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-white/90 mb-3">
                    <span>{trek.type}</span>
                    <span>•</span>
                    <span>{trek.duration}</span>
                    <span>•</span>
                    <span>Max {trek.maxAltitude}</span>
                  </div>
                  <p className="text-sm text-white/80 mb-6 leading-relaxed line-clamp-2">
                    {trek.highlight}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-3">
                        <img
                          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fA%3D%3D&auto=format&fit=crop&w=100&h=100&q=80"
                          className="w-10 h-10 rounded-full border-2 border-white object-cover"
                        />
                        <div className="w-10 h-10 rounded-full border-2 border-white bg-white/20 backdrop-blur-md flex items-center justify-center text-xs font-bold">
                          +12
                        </div>
                      </div>
                      <span className="text-sm font-bold">Choose your local</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs opacity-80">From</div>
                      <div className="text-xl font-bold">{formatPrice(trek.price, 'USD')}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trek Routes with grade filter */}
        <div className="mb-24" id="trek-routes-section">
          <div className="text-center mb-10">
            <span className="text-[#213448] font-bold uppercase tracking-wider text-sm block mb-2">
              Trek & Hiking routes
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Choose your trail by difficulty
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Every route below is walked with a licensed local guide. Pick a grade — we take care of
              permits, teahouses, transport and the acclimatisation plan.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {grades.map((grade) => (
              <button
                key={grade}
                onClick={() => setActiveGrade(grade)}
                className={`px-5 py-2.5 rounded-full border font-medium text-sm transition-all ${
                  activeGrade === grade
                    ? 'bg-[#213448] border-[#213448] text-white'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-[#213448]'
                }`}
              >
                {grade}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedRoutes.map((trek) => (
              <div
                key={trek.id}
                className="flex flex-col border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 bg-white group cursor-pointer"
                onClick={() => openRoute(trek.slug)}
              >
                <div className="relative h-48 aspect-[4/3] overflow-hidden">
                  <img
                    src={trek.image}
                    alt={trek.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide text-gray-800">
                    {trek.type}
                  </div>
                  <div
                    className={`absolute top-3 right-3 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${gradeStyles[trek.grade]}`}
                  >
                    {trek.grade}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                    <Star className="w-3 h-3 fill-brand-yellow text-brand-yellow" />
                    {trek.rating}
                  </div>
                </div>

                <div className="flex-1 p-5 flex flex-col">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 leading-snug line-clamp-2 group-hover:text-[#213448] transition-colors">
                    {trek.title}
                  </h3>

                  <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-3">
                    {trek.highlight}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500 mb-2">
                    <Clock className="w-3 h-3" />
                    <span>{trek.duration}</span>
                    <span>•</span>
                    <span>Max {trek.maxAltitude}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500 mb-4">
                    <Mountain className="w-3 h-3" />
                    <span>{trek.region}</span>
                    <span>•</span>
                    <span>{trek.reviews} reviews</span>
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {trek.locals.map((l, i) => (
                        <img
                          key={i}
                          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fA%3D%3D&auto=format&fit=crop&w=80&h=80&q=80"
                          className="w-8 h-8 rounded-full border-2 border-white object-cover"
                          alt={`Guide ${l}`}
                        />
                      ))}
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-gray-400 uppercase">From</div>
                      <div className="text-lg font-bold text-gray-900">
                        {formatPrice(Math.floor(trek.price), 'USD')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              onClick={() => navigate('/search?q=trek+hiking')}
              className="bg-transparent border border-[#213448] text-[#213448] hover:bg-brand-yellow hover:border-brand-yellow hover:text-slate-900 rounded-full px-8 py-3 font-bold transition-all"
            >
              Explore more
            </Button>
          </div>
        </div>

        {/* Best Season Section */}
        <div className="full-width bg-[#FFF0E6] -mx-4 md:-mx-[max(1rem,calc((100vw-80rem)/2))] px-4 md:px-[max(1rem,calc((100vw-80rem)/2))] py-20 mb-24">
          <div className="text-center mb-12">
            <span className="text-[#213448] font-bold uppercase tracking-wider text-sm block mb-2">
              Plan your dates
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Best seasons for trekking in Nepal
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {bestSeasons.map((season) => (
              <div
                key={season.season}
                className="bg-white p-8 rounded-3xl shadow-sm flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 rounded-full bg-[#E0F2FE] flex items-center justify-center text-[#213448] mb-4">
                  {season.icon}
                </div>
                <h3 className="font-bold text-xl text-gray-900 mb-1">{season.season}</h3>
                <p className="text-sm font-bold text-[#213448] mb-3">{season.months}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{season.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* What's included */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What&apos;s included in every trek
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              No hidden fees on the trail. Your booking covers the whole journey from the moment we
              pick you up to the moment you are back in Kathmandu or Pokhara.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-5 max-w-4xl mx-auto">
            {included.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-gray-700">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="full-width bg-[#E0F2FE] -mx-4 md:-mx-[max(1rem,calc((100vw-80rem)/2))] px-4 md:px-[max(1rem,calc((100vw-80rem)/2))] py-20 mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Travelers love our treks</h2>
            <p className="text-gray-600">Reviews from trekkers who walked with our local guides</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {[
              {
                name: 'Sofia',
                review:
                  'Lhakpa knew every teahouse on the way to Everest Base Camp and kept the pace perfect for acclimatisation. Summiting Kalapatthar at sunrise with him is a memory I will keep forever.',
                host: 'Lhakpa',
                date: 'Everest Region, November 12, 2025',
              },
              {
                name: 'Marco',
                review:
                  'Pema adapted our Annapurna Base Camp trek around our fitness and added an extra rest day in Ghorepani. Safe, knowledgeable and great company on the trail.',
                host: 'Pema',
                date: 'Annapurna, October 3, 2025',
              },
              {
                name: 'Yuki',
                review:
                  'The Sarangkot sunrise hike with Nima was the highlight of our Pokhara stay. He picked the best viewpoint, carried extra thermoses of tea and told us stories about every peak.',
                host: 'Nima',
                date: 'Pokhara, September 21, 2025',
              },
            ].map((review, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl shadow-sm relative">
                <div className="flex gap-1 mb-6">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-5 h-5 fill-brand-yellow text-brand-yellow" />
                  ))}
                </div>
                <p className="text-gray-800 font-medium italic mb-8 leading-relaxed">
                  "{review.review}"
                </p>
                <div className="flex items-center gap-4 mt-auto">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">
                    {review.name[0]}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{review.name}</div>
                    <div className="text-xs text-[#213448] font-bold uppercase">
                      About local {review.host}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Locals Grid */}
        <div className="mb-24" id="locals-section">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trek with our <span className="text-[#213448]">incredible locals</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Meet the licensed guides who lead our treks and hikes — from Sherpa high-altitude
              leaders to Pokhara sunrise specialists.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {displayedLocals.map((local, i) => (
              <div
                key={i}
                className="flex flex-col items-center group cursor-pointer"
                onClick={() => {
                  const demoId = (i % 4) + 1;
                  navigate(`/local/${demoId}`);
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
              >
                <div className="relative w-32 h-32 mb-4">
                  <img
                    src={`https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=128&h=128&q=80`}
                    alt={local.name}
                    className="w-full h-full rounded-full object-cover border-4 border-white shadow-md group-hover:border-brand-yellow transition-all duration-300"
                  />
                  <div className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm text-xs font-bold border border-gray-100">
                    🇳🇵
                  </div>
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-[#213448] transition-colors">
                  {local.name}
                </h3>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2 text-center line-clamp-1 px-2">
                  {local.title}
                </p>
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
              {showAllLocals ? 'See less' : 'Show more locals'}
            </Button>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-24 max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trekking questions, answered
            </h2>
            <p className="text-gray-600">
              Everything first-time and returning trekkers ask our guides.
            </p>
          </div>

          <div className="space-y-4">
            {trekFaqs.map((faq, i) => (
              <div key={faq.q} className="border border-gray-200 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 p-6 text-left bg-white hover:bg-gray-50 transition-colors"
                >
                  <span className="font-bold text-gray-900">{faq.q}</span>
                  <ChevronRight
                    className={`w-5 h-5 text-[#213448] shrink-0 transition-transform duration-300 ${
                      openFaq === i ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 text-gray-600 leading-relaxed text-sm">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="mb-24">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-[#213448] mb-2">Find experiences by category</h2>
          </div>

          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            {[
              'Multi-day treks',
              'Day hikes',
              'Sunrise hikes',
              'National park treks',
              'Base camp treks',
              'Teahouse treks',
              'Family friendly trails',
              'Off the beaten track',
              'Photography treks',
            ].map((cat, i) => (
              <div
                key={i}
                className="px-5 py-2.5 rounded-full border border-gray-200 hover:border-[#213448] hover:bg-[#213448] hover:text-white cursor-pointer transition-all bg-white text-gray-600 font-medium text-sm"
              >
                {cat}
              </div>
            ))}
          </div>
        </div>

        {/* Why Guides Nepal Icons Grid (Bottom) */}
        <div className="mb-24 pt-16 border-t border-gray-100">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-[#213448]">
              Why do Guides Nepal love what they do?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {[
              {
                title: 'A fair income',
                desc: 'Our guides set their own trek prices.',
                icon: <ShieldCheck className="w-8 h-8" />,
              },
              {
                title: 'Mountain born',
                desc: 'Guides who grew up on these trails.',
                icon: <Mountain className="w-8 h-8" />,
              },
              {
                title: 'Eco-friendly',
                desc: 'Low impact trekking, waste-free teahouses.',
                icon: <Heart className="w-8 h-8" />,
              },
              {
                title: 'Unique skills',
                desc: 'From flora experts to Sherpa historians.',
                icon: <Star className="w-8 h-8" />,
              },
              {
                title: 'Flexible schedule',
                desc: 'Rest days and side trails when you want them.',
                icon: <Clock className="w-8 h-8" />,
              },
              {
                title: 'Global community',
                desc: 'Connecting the world on the trail.',
                icon: <Users className="w-8 h-8" />,
              },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-[#E0F2FE] flex items-center justify-center text-[#213448] mb-4">
                  {item.icon}
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Best trekking & hiking experiences in Nepal SEO Text */}
        <div className="mb-24 text-center max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-[#213448] mb-6">
            Best trekking & hiking experiences in Nepal
          </h2>
          <div className="space-y-6 text-gray-600 leading-relaxed text-sm md:text-base">
            <p>
              Nepal is trekking country — a narrow strip of land with eight of the world&apos;s ten
              highest mountains, a network of centuries-old trade trails and a teahouse culture that
              lets you walk for weeks carrying nothing more than a daypack. Whether you want the
              classic{' '}
              <strong className="text-gray-900">Annapurna Base Camp Trek</strong>, the epic{' '}
              <strong className="text-gray-900">Everest Base Camp Trek</strong> or a gentle morning
              hike above Pokhara, a licensed local guide turns a route into a story.
            </p>
            <p>
              The Annapurna region is the perfect introduction. The{' '}
              <strong className="text-gray-900">Ghorepani Poon Hill Trek</strong> delivers a
              Himalayan sunrise from a 3,210 m viewpoint in just five days, while{' '}
              <strong className="text-gray-900">Mardi Himal</strong> follows a quiet ridge line
              straight beneath Machhapuchhre. For fewer crowds, the{' '}
              <strong className="text-gray-900">Khopra Ridge Trek</strong> runs a community trail
              above the Modi Khola with Dhaulagiri filling the western sky. Longer routes like the{' '}
              <strong className="text-gray-900">Annapurna Circuit</strong> cross the 5,416 m
              Thorong La pass, the <strong className="text-gray-900">Langtang Valley</strong>{' '}
              trek winds through Tamang villages and yak pastures only a day&apos;s drive from
              Kathmandu, and <strong className="text-gray-900">Helambu & Gosainkunda</strong>{' '}
              climbs through Sherpa villages to a ring of sacred alpine lakes.
            </p>
            <p>
              Prefer a single day on foot? The Kathmandu Valley hides excellent hikes: the{' '}
              <strong className="text-gray-900">Nagarkot to Dhulikhel Ridge Hike</strong> and{' '}
              <strong className="text-gray-900">Chandragiri</strong> for sunrise ridgelines,{' '}
              <strong className="text-gray-900">Shivapuri National Park</strong> for cloud forest,
              and the <strong className="text-gray-900">Changu Narayan Hike</strong> through
              farming villages to Nepal&apos;s oldest temple. Around Pokhara, the{' '}
              <strong className="text-gray-900">Sarangkot Sunrise Hike</strong> looks straight
              across the Annapurnas before breakfast.
            </p>
            <p>
              Trekking with a local guide is also the responsible way to travel. Our guides are
              licensed by the Nepal Academy of Tourism and Hotel Management, trained in wilderness
              first aid and altitude awareness, and they keep your money in the communities you walk
              through — teahouses, porters and village cooperatives. They handle permits, plan
              acclimatisation days, and know exactly which teahouse has the hot apple pie.
            </p>
            <p>
              Whatever your fitness level, there is a trek or hike in Nepal that fits it — from
              two-hour family walks to three-week expeditions. Browse the routes above, pick your
              dates, and your local guide will build the rest around you.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TrekHikingPage;
