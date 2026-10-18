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
  {
    id: 104,
    slug: 'everest-base-camp-trek',
    title: 'Everest Base Camp Trek',
    heroImage:
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1740&q=80',
    host: {
      name: 'Magical Nepal',
      image:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80',
      type: 'Trekking Agency',
    },
    guides: [allGuides[3], allGuides[2]], // Rohan & Priya
    description:
      'Most people who email us, or walk into the office in Jamal, start with the same question: \u201cCan I actually do this?\u201d After running 600 to 800 trekkers through the Khumbu every year, the honest answer is yes, provided you can walk 5 to 7 hours a day on uneven ground for two weeks, and you take altitude seriously. This is the 14-day version: 12 days on the trail from Lukla, two acclimatization stops, and Kala Patthar at 5,545 m / 18,192 ft for the Everest view that Base Camp itself does not give you.',
    tourStructure: {
      steps: [
        { name: 'Kathmandu', label: 'Day 1 Arrive' },
        { name: 'Lukla', label: 'Day 2 Fly' },
        { name: 'Phakding', label: 'Day 2 Trek' },
        { name: 'Namche', label: 'Day 3-4' },
        { name: 'Tengboche', label: 'Day 5' },
        { name: 'Dingboche', label: 'Day 6-7' },
        { name: 'Lobuche', label: 'Day 8' },
        { name: 'EBC + Kala Patthar', label: 'Day 9 Summit' },
        { name: 'Pheriche', label: 'Day 10 Descent' },
        { name: 'Namche', label: 'Day 11 Descent' },
        { name: 'Lukla', label: 'Day 12 Descent' },
        { name: 'Kathmandu', label: 'Day 13-14 Return' },
      ],
    },
    exploration: {
      title: 'Everest Base Camp Trek Highlights',
      description:
        'The route runs from Lukla up the Dudh Koshi valley through Phakding, Namche Bazaar, Tengboche and Dingboche, then into open rocky ground around Lobuche and Gorakshep. Roughly 115 km / 71 miles of scheduled walking with a licensed, English-speaking local guide, permits, transport, and three meals a day.',
      points: [
        'Stand at Everest Base Camp (5,364 m) beneath the Khumbu icefall',
        'Sunrise over Everest from Kala Patthar (5,545 m)',
        'Namche Bazaar \u2014 the trading capital of the Khumbu',
        'Tengboche monastery, the spiritual heart of the Khumbu',
        'Cross the suspension bridges and mani walls of the Dudh Koshi valley',
        'Sherpa teahouse hospitality, dal bhat and apple pie every evening',
        'Sagarmatha National Park \u2014 yeti scalp legend and Himalayan wildlife',
      ],
    },
    atmosphere:
      'Demanding but achievable. A strenuous trek that rewards trekkers with the closest views of the highest mountains on earth. Trek with licensed, English-speaking guides who know the Khumbu region inside out, with trekking essentials such as sleeping bags and down jackets provided.',
    hiddenGems:
      'The Everest View Hotel breakfast above Namche, the Sherpa museum in Namche, and the quiet memorial chortens above Thukla pass.',
    city: 'Pokhara',
    price: 1456,
    duration: '14 days',
    type: 'Trekking',
    rating: 5.0,
    reviews: 55,
  },
  {
    id: 105,
    slug: 'annapurna-circuit-trek',
    title: 'Annapurna Circuit Trek',
    heroImage:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1740&q=80',
    host: {
      name: 'Magical Nepal',
      image:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80',
      type: 'Trekking Agency',
    },
    guides: [allGuides[3], allGuides[2]], // Rohan & Priya
    description:
      'The Annapurna Circuit is one of the world’s great walks: a 14-day loop from the sub-tropical Marsyangdi valley through Tibetan-style Manang, over the 5,416 m Thorong La pass, and down into the rain-shadow Kali Gandaki, the deepest gorge on earth. Few treks pack in so much variety — paddy terraces, pine forest, high desert, glaciers and the shrine of Muktinath — with Annapurna and Dhaulagiri both in sight on the same day.\n\nBecause the route climbs slowly and includes acclimatisation days in Manang, it is challenging but achievable for walkers with a good base of fitness. Our guides arrange the Permits, the teahouses and the mountain rescue insurance, and pace the crossing so the pass day starts in the dark, on schedule and safely.',
    tourStructure: {
      steps: [
        { name: 'Kathmandu', label: 'Day 1 Start' },
        { name: 'Bhulbhule', label: 'Day 2' },
        { name: 'Jagat', label: 'Day 3' },
        { name: 'Dharapani', label: 'Day 4' },
        { name: 'Chame', label: 'Day 5' },
        { name: 'Upper Pisang', label: 'Day 6' },
        { name: 'Acclimatisation da', label: 'Day 7' },
        { name: 'Manang', label: 'Day 8' },
        { name: 'Yak Kharka', label: 'Day 9' },
        { name: 'Thorong La (5', label: 'Day 10' },
        { name: 'Muktinath', label: 'Day 11' },
        { name: 'Marpha', label: 'Day 12' },
        { name: 'Tatopani', label: 'Day 13' },
        { name: 'Poon Hill (3', label: 'Day 14 Finish' },
      ],
    },
    exploration: {
      title: 'Annapurna Circuit Trek Highlights',
      description:
        'Around the great Himalaya — Marsyangdi to Kali Gandaki. 14 days on the trail with a licensed, English-speaking local guide, permits, transport, and three meals a day.',
      points: [
        'Cross Thorong La (5,416 m) at sunrise',
        'The Kali Gandaki — the deepest gorge on earth',
        'Muktinath temple, sacred to Hindus and Buddhists alike',
        'Manang’s Tibetan-Buddhist villages and 500-year-old gompa',
        'Hot springs at Tatopani on the way out',
        'Poon Hill sunrise finale over Dhaulagiri and Annapurna',
        'Sub-tropical forest to high desert in a single loop',
      ],
    },
    atmosphere:
      'Authentic and immersive. A licensed, English-speaking local guide who knows the route inside out, with trekking essentials such as sleeping bags and down jackets provided.',
    hiddenGems:
      'The cave monasteries of Hongde, the apple orchards of Marpha, and the hot springs at Tatopani.',
    city: 'Pokhara',
    price: 1250,
    duration: '14 days',
    type: 'Trekking',
    rating: 5.0,
    reviews: 31,
  },
  {
    id: 106,
    slug: 'ghorepani-poon-hill-trek',
    title: 'Ghorepani Poon Hill Trek',
    heroImage:
      'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1740&q=80',
    host: {
      name: 'Magical Nepal',
      image:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80',
      type: 'Trekking Agency',
    },
    guides: [allGuides[3], allGuides[2]], // Rohan & Priya
    description:
      'The Ghorepani Poon Hill trek is the finest short trek in Nepal: five days on foot through rhododendron forest, Gurung villages and alpine ridge, ending with a pre-dawn climb to Poon Hill for one of the great mountain panoramas on earth — Dhaulagiri, Annapurna South, Machhapuchhre and Nilgiri turning gold in the first light.\n\nFrom Pokhara it is an easy drive to Nayapul and a gentle climb on stone steps to Tikhedhunga, following the Modi Khola through Ulleri and Ghorepani. Because the highest point is only 3,210 m, the route suits families, first-time trekkers and anyone short on time — and the walk out through Ghandruk adds one of the most beautiful stone villages in the Annapurna region.',
    tourStructure: {
      steps: [
        { name: 'Pokhara', label: 'Day 1 Start' },
        { name: 'Tikhedhunga', label: 'Day 2' },
        { name: 'Poon Hill (3', label: 'Day 3' },
        { name: 'Tadapani', label: 'Day 4' },
        { name: 'Ghandruk', label: 'Day 5 Finish' },
      ],
    },
    exploration: {
      title: 'Ghorepani Poon Hill Trek Highlights',
      description:
        'Nepal’s classic short trek — sunrise from Poon Hill. 5 days on the trail with a licensed, English-speaking local guide, permits, transport, and three meals a day.',
      points: [
        'Sunrise panorama over Dhaulagiri and Annapurna from Poon Hill (3,210 m)',
        'Rhododendron and magnolia forest — ablaze with colour in spring',
        'The stone village of Ghandruk and its Gurung culture',
        'Stone staircases of Ulleri — the staircase to the Himalaya',
        'Only five days, with modest daily distances',
        'Family friendly — great for children over eight',
        'Optional golden-hour photography walk from Ghorepani',
      ],
    },
    atmosphere:
      'Authentic and immersive. A licensed, English-speaking local guide who knows the route inside out, with trekking essentials such as sleeping bags and down jackets provided.',
    hiddenGems:
      'The Gurung museum in Ghandruk, the stone lanes of Ulleri, and the quiet viewpoint beyond Poon Hill.',
    city: 'Pokhara',
    price: 445,
    duration: '5 days',
    type: 'Trekking',
    rating: 4.9,
    reviews: 48,
  },
  {
    id: 107,
    slug: 'langtang-valley-trek',
    title: 'Langtang Valley Trek',
    heroImage:
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1740&q=80',
    host: {
      name: 'Magical Nepal',
      image:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80',
      type: 'Trekking Agency',
    },
    guides: [allGuides[3], allGuides[2]], // Rohan & Priya
    description:
      'The Langtang Valley trek is the most accessible of Nepal’s great treks — a day’s drive from Kathmandu and you are walking through Tamang villages, yak pastures and hanging glaciers towards the Langtang Lirung (7,227 m). The valley was rebuilt stone by stone after the 2015 earthquake, and trekking here is among the most meaningful ways to support the communities that have welcomed travellers for generations.\n\nThe route climbs gently from Syabrubesi along the Langtang Khola through Lama Hotel and Langtang village to Kyanjin Gompa, the last settlement, ringed by ice walls. Optional walks climb Kyanjin Ri and Tsergo Ri for views across to the Tibetan frontier — the whole trek stays moderate in difficulty with a highest point under 4,000 m.',
    tourStructure: {
      steps: [
        { name: 'Kathmandu', label: 'Day 1 Start' },
        { name: 'Syabrubesi', label: 'Day 2' },
        { name: 'Lama Hotel', label: 'Day 3' },
        { name: 'Langtang village', label: 'Day 4' },
        { name: 'Trail', label: 'Day 5' },
        { name: 'Kyanjin Gompa', label: 'Day 6' },
        { name: 'Lama Hotel', label: 'Day 7' },
        { name: 'Syabrubesi', label: 'Day 8' },
        { name: 'Buffer / weather d', label: 'Day 9 Finish' },
      ],
    },
    exploration: {
      title: 'Langtang Valley Trek Highlights',
      description:
        'Tamang villages and glaciers a day from Kathmandu. 9 days on the trail with a licensed, English-speaking local guide, permits, transport, and three meals a day.',
      points: [
        'Langtang Lirung (7,227 m) filling the head of the valley',
        'Tamang villages, monasteries and cheese factories',
        'Sunrise from Kyanjin Ri or Tsergo Ri',
        'Yak pastures, Himalayan tahr and red pandas in the national park',
        'Views across to the Tibetan plateau from the ridgelines',
        'Rebuilt with community homestays — trekking that gives back',
        'Shortest access to true alpine trekking from Kathmandu',
      ],
    },
    atmosphere:
      'Authentic and immersive. A licensed, English-speaking local guide who knows the route inside out, with trekking essentials such as sleeping bags and down jackets provided.',
    hiddenGems:
      'The Kyanjin cheese factory, the rebuilt Tamang villages, and the quiet trail to Tsergo Ri.',
    city: 'Pokhara',
    price: 690,
    duration: '9 days',
    type: 'Trekking',
    rating: 4.9,
    reviews: 27,
  },
  {
    id: 108,
    slug: 'mardi-himal-trek',
    title: 'Mardi Himal Trek',
    heroImage:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1740&q=80',
    host: {
      name: 'Magical Nepal',
      image:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80',
      type: 'Trekking Agency',
    },
    guides: [allGuides[3], allGuides[2]], // Rohan & Priya
    description:
      'Mardi Himal is the best-kept secret of the Annapurna region: a narrow, forested ridge that runs straight beneath the fishtail of Machhapuchhre to a base camp at 3,580 m, with the whole Annapurna range laid out to the north. Where other routes fill teahouses with crowds, Mardi stays quiet — perfect if you want the mountains to yourselves.\n\nThe trek climbs from Phedi above Pokhara through Forest Camp and High Camp along a ridge of rhododendron and bamboo, opening into the high country with views of Annapurna South, Hiunchuli and the Machhapuchhre wall. The descent exits over the ridge through Landruk, one of the most beautiful Gurung villages in Nepal.',
    tourStructure: {
      steps: [
        { name: 'Pokhara', label: 'Day 1 Start' },
        { name: 'Forest Camp', label: 'Day 2' },
        { name: 'Low Camp', label: 'Day 3' },
        { name: 'High Camp', label: 'Day 4' },
        { name: 'High Camp', label: 'Day 5' },
        { name: 'Forest Camp', label: 'Day 6' },
        { name: 'Landruk', label: 'Day 7 Finish' },
      ],
    },
    exploration: {
      title: 'Mardi Himal Trek Highlights',
      description:
        'The ridge line beneath Fishtail. 7 days on the trail with a licensed, English-speaking local guide, permits, transport, and three meals a day.',
      points: [
        'Camp-like ridge trail with Machhapuchhre (6,993 m) alongside',
        'Panoramas of Annapurna South, Hiunchuli and Annapurna I from High Camp',
        'Quiet teahouses — far fewer trekkers than ABC or Poon Hill',
        'Forest of rhododendron, bamboo and oak, full of birdsong',
        'Sunrise on the Annapurnas from the ridge',
        'Exit through the Gurung village of Landruk',
        'The highest of Nepal’s shorter treks — only 3,580 m at the top',
      ],
    },
    atmosphere:
      'Authentic and immersive. A licensed, English-speaking local guide who knows the route inside out, with trekking essentials such as sleeping bags and down jackets provided.',
    hiddenGems:
      'The dawn viewpoint above High Camp, the birdsong of Forest Camp, and the stone lanes of Landruk.',
    city: 'Pokhara',
    price: 520,
    duration: '7 days',
    type: 'Trekking',
    rating: 5.0,
    reviews: 22,
  },
  {
    id: 109,
    slug: 'khopra-ridge-trek',
    title: 'Khopra Ridge Trek',
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
      'Khopra Ridge is the ridge less travelled: a community-run alternative to Poon Hill that stays high above the Modi Khola, on a grassy crest with Dhaulagiri and the whole Annapurna range competing for attention. Far fewer trekkers walk here, and every teahouse along the way belongs to a village homestay committee, so your stay supports the settlement you sleep in.\n\nThe route climbs through Gurung villages to the Khopra ridge at 3,660 m and the glacial lake of Khayer Lake, returns via the forest village of Swanta, and joins the classic trail at Ghorepani for the Poon Hill sunrise finale. It is moderate in difficulty, with only two nights above 3,000 m, and the ridgeline walking is among the finest half-days in the Annapurna region.',
    tourStructure: {
      steps: [
        { name: 'Pokhara', label: 'Day 1 Start' },
        { name: 'Ghandruk', label: 'Day 2' },
        { name: 'Bayeli', label: 'Day 3' },
        { name: 'Rest day on the ri', label: 'Day 4' },
        { name: 'Khopra ridge', label: 'Day 5' },
        { name: 'Swanta', label: 'Day 6' },
        { name: 'Poon Hill (3', label: 'Day 7' },
        { name: 'Hile', label: 'Day 8 Finish' },
      ],
    },
    exploration: {
      title: 'Khopra Ridge Trek Highlights',
      description:
        'The quiet community trek above the Modi Khola. 8 days on the trail with a licensed, English-speaking local guide, permits, transport, and three meals a day.',
      points: [
        'Dhaulagiri’s 8,167 m wall filling the western sky from the Khopra ridge',
        'A night beside glacial Khayer Lake',
        'Community homestays run by village committees — trekking that gives back',
        'Gurung villages of Landruk, Bayeli and Swanta off the main trail',
        'Sunrise finale from Poon Hill (3,210 m)',
        'Rhododendron forest and ridge walking without the crowds',
        'Optional side trip to the Machhapuchhre base camp viewpoint',
      ],
    },
    atmosphere:
      'Authentic and immersive. A licensed, English-speaking local guide who knows the route inside out, with trekking essentials such as sleeping bags and down jackets provided.',
    hiddenGems:
      'The glacial Khayer Lake, the community lodge at Bayeli, and the empty crest at dusk.',
    city: 'Pokhara',
    price: 585,
    duration: '8 days',
    type: 'Trekking',
    rating: 4.9,
    reviews: 19,
  },
  {
    id: 110,
    slug: 'helambu-gosainkunda-trek',
    title: 'Helambu Gosainkunda Trek',
    heroImage:
      'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=1740&q=80',
    host: {
      name: 'Magical Nepal',
      image:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80',
      type: 'Trekking Agency',
    },
    guides: [allGuides[3], allGuides[2]], // Rohan & Priya
    description:
      'This quiet route follows the watershed north of the Kathmandu Valley through Helambu — the home of the Hyolmo (Helambu Sherpa) people — to Gosainkunda, a chain of glacial lakes sacred to Hindus and Buddhists alike, where Shiva is said to have struck the earth with his trident to release the water.\n\nThe trek climbs from Sundarijal through the Shivapuri ridge to the Tamang and Hyolmo villages of Tharepati and Timbu, then over high pastures to the lakes at 4,380 m, ringed by Langtang Lirung. Pilgrims bathe in the lake during the Janai Purnima festival each August; outside festival season the ridges are almost empty. The walk is moderate, staying under 4,400 m, and the whole route sits within earshot of Kathmandu yet feels a world away.',
    tourStructure: {
      steps: [
        { name: 'Kathmandu', label: 'Day 1 Start' },
        { name: 'Chisopati', label: 'Day 2' },
        { name: 'Mulkharka', label: 'Day 3' },
        { name: 'Tharepati', label: 'Day 4' },
        { name: 'around the lakes', label: 'Day 5' },
        { name: 'Gosainkunda', label: 'Day 6' },
        { name: 'Laurebina', label: 'Day 7' },
        { name: 'Dhunche', label: 'Day 8 Finish' },
      ],
    },
    exploration: {
      title: 'Helambu Gosainkunda Trek Highlights',
      description:
        'Sacred alpine lakes above the Helambu villages. 8 days on the trail with a licensed, English-speaking local guide, permits, transport, and three meals a day.',
      points: [
        'Gosainkunda lake (4,380 m) and its ring of sacred ponds',
        'Hyolmo (Helambu Sherpa) and Tamang villages and monasteries',
        'Ridge walking along the Shivapuri watershed',
        'Langtang Lirung and the Ganesh Himal from the pass',
        'The Janai Purnima pilgrimage in August, if timed well',
        'Cloud forest, waterfalls and the source of the Bagmati river',
        'A short drive from Kathmandu — no domestic flights needed',
      ],
    },
    atmosphere:
      'Authentic and immersive. A licensed, English-speaking local guide who knows the route inside out, with trekking essentials such as sleeping bags and down jackets provided.',
    hiddenGems:
      'The ring of sacred ponds around Gosainkunda, the Hyolmo villages, and the source of the Bagmati.',
    city: 'Pokhara',
    price: 610,
    duration: '8 days',
    type: 'Trekking',
    rating: 4.8,
    reviews: 17,
  },
];
