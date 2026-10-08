import { allGuides } from './guidesData';
import { RichExperienceData } from './types';

export const pokharaRichData: RichExperienceData[] = [
  {
    id: 101,
    slug: 'pokhara-lakeside-food-tour',
    title: 'Pokhara Lakeside Food Tour',
    heroImage:
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1740&q=80',
    host: {
      name: 'Sujal',
      image:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80',
      type: 'History & Culture Buff',
    },
    guides: [allGuides[1], allGuides[3]], // Sujal & Rohan
    description:
      "Discover the culinary delights of Pokhara's Lakeside. From fresh fish from Phewa Lake to traditional Thakali sets, taste the best of the city with a stunning mountain backdrop.",
    tourStructure: {
      steps: [
        { name: 'Lakeside', label: 'Meet Up' },
        { name: 'Fish Stall', label: 'Local Delicacy' },
        { name: 'Thakali House', label: 'Main Course' },
      ],
    },
    exploration: {
      title: 'How we explore Pokhara',
      description: 'A relaxing walk along the lake combined with delicious food stops.',
      points: [
        'Eating fresh fried fish',
        'Trying the famous Thakali Dal Bhat',
        'Enjoying a sunset drink by the lake',
      ],
    },
    atmosphere: 'Chill and scenic. The vibe in Pokhara is much more relaxed than Kathmandu.',
    hiddenGems: 'A small family-run pickle shop that makes the best spicy radish pickle.',
    city: 'Pokhara',
    price: 45,
    duration: '3 hours',
    type: 'Food Tour',
  },
  {
    id: 102,
    slug: 'sarangkot-sunrise-hike',
    title: 'Sarangkot Sunrise Hike & Breakfast',
    heroImage:
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1740&q=80',
    host: {
      name: 'Rohan',
      image:
        'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=128&q=80',
      type: 'Adventure Enthusiast',
    },
    guides: [allGuides[3], allGuides[2]], // Rohan & Priya
    description:
      'Watch the sun paint the Annapurna range in gold. A morning hike up to Sarangkot followed by a hearty local breakfast.',
    tourStructure: {
      steps: [
        { name: 'Base', label: 'Start Hike' },
        { name: 'Viewpoint', label: 'Sunrise' },
        { name: 'Local Home', label: 'Breakfast' },
      ],
    },
    exploration: {
      title: 'How we explore the hills',
      description: 'An early morning adventure to catch the best views in Nepal.',
      points: [
        'Hiking through village trails',
        'Viewing Machhapuchhre (Fishtail) mountain',
        'Drinking tea with a local family',
      ],
    },
    atmosphere: 'Active and awe-inspiring. Worth the early wake-up call!',
    hiddenGems: 'A trail that avoids the main tourist crowds.',
    city: 'Pokhara',
    price: 55,
    duration: '4 hours',
    type: 'Nature & Hiking',
  },
  {
    id: 103,
    slug: 'annapurna-base-camp-trek',
    title: 'Annapurna Base Camp Trek',
    heroImage:
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1740&q=80',
    host: {
      name: 'Magical Nepal',
      image:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80',
      type: 'Trekking Agency',
    },
    guides: [allGuides[3], allGuides[2]], // Rohan & Priya
    description:
      'Trekking in the Annapurnas is the one thing everyone aspires to when they visit Nepal. Whether you are traveling with children, are a bit on the older side, are an experienced trekker, or a newbie, the Annapurna region has something for you. Ranging from a three\u2014or four-day trek to around two weeks, you can choose which trek suits you best. Even while sitting in Pokhara preparing for your trek, you get close-up views of the mountains, particularly Fishtail (Machhapuchhare). From day one, you are there, in the mountains.\n\nIt is one of the most popular treks to Annapurna Base Camp. Here, you get to explore not just one but two base camps: Annapurna and Machhapucchre base camp. The landscape varies \u2013 from the hot water pools at Jhinu Danda, the mighty Modi Khola River, and pine and rhododendron forests to the high mountains. At both base camps, the views of Machhapucchre with its unique fishtail shape, Mt. Hiunchuli, Annapurna South, Annapurna I, and Annapurna III are astounding. The trek\u2019s highest point is Annapurna Base Camp, 4,130 m / 13,549 ft. Since there is only one night at high altitude on this eight-day, all-season trek, there is relatively less chance of altitude-related illnesses. Starting and ending at Pokhara, this is an enviable trek full of fabulous flora and fauna, majestic mountains, friendly people, and fun and relaxation by the lake in Pokhara.',
    tourStructure: {
      steps: [
        { name: 'Kathmandu', label: 'Day 1 Depart' },
        { name: 'Ghandruk', label: 'Day 1 Arrive' },
        { name: 'Chomrong', label: 'Day 2' },
        { name: 'Bamboo', label: 'Day 3' },
        { name: 'Deurali', label: 'Day 4' },
        { name: 'Annapurna BC', label: 'Day 5 Summit' },
        { name: 'Bamboo', label: 'Day 6 Descent' },
        { name: 'Jhinu Danda', label: 'Day 7 Hot Springs' },
        { name: 'Pokhara', label: 'Day 8 Return' },
        { name: 'Kathmandu', label: 'Day 9 Final' },
      ],
    },
    exploration: {
      title: 'Annapurna Base Camp Trek Highlights',
      description:
        'The peak that dominates the sanctuary has never been climbed, a story told in Machhapuchhre, the mountain nobody may climb. The trek includes 7 nights\u2019 accommodation in mountain teahouses and 1 night in Pokhara, with a licensed, English-speaking local guide, permits, transport, and three meals a day.',
      points: [
        '360\u00b0 views at Annapurna Base Camp',
        'Cover two base camps in one trek (Annapurna and Machhapucchre)',
        'See the amazingly shaped Machhapucchre mountain, aptly named fish tail, dominate your skyline',
        'Watch the sunrise over the Annapurna mountains from the base camp',
        'See spectacular waterfalls and glacier-fed rivers',
        'Learn about the traditions and culture of the Gurung people in Ghandruk village',
        'Experience hiking through forests ablaze with red rhododendrons in the spring',
        'Enjoy the relaxing hot water pool at Jhinu Danda',
      ],
    },
    atmosphere:
      'Immersive and majestic. A moderate trek that rewards trekkers with a 360-degree panorama of the wonderful Himalayan mountains. Trek with licensed, English-speaking guides who know the Annapurna region inside out, with trekking essentials such as sleeping bags and down jackets provided.',
    hiddenGems:
      'The natural hot springs at Jhinu Danda beside the Modi Khola River, the Gurung Museum in Ghandruk, and the quiet bamboo groves of Bamboo village.',
    city: 'Pokhara',
    price: 786,
    duration: '9 days',
    type: 'Trekking',
    rating: 5.0,
    reviews: 25,
  },
];
