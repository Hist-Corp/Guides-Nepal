// Rich editorial content for the Trek/Hiking routes listed on the
// /trek-hiking page. Keyed by route slug and resolved by ExperiencePage so
// every trek card links to a full detail page instead of a generic stub.

export interface TrekRouteContent {
  /** Route-level intro shown in the hero strip of the detail page. */
  tagline: string;
  /** Two-paragraph route story. */
  description: string;
  highlights: string[];
  itinerary: { day: string; title: string; detail: string }[];
  includes: string[];
  meetingPoint: string;
  bestSeason: string;
  /** Extra gallery images beyond the route card image. */
  gallery: string[];
}

const G = {
  peaks: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
  trail: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1200&q=80',
  annapurna:
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80',
  everest: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
  forest:
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
  hills: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1200&q=80',
  lake: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
  nature:
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80',
  night: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=1200&q=80',
  phewa: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80',
};

export const trekRouteContent: Record<string, TrekRouteContent> = {
  'everest-base-camp-trek': {
    tagline: 'The classic Khumbu journey to the foot of Sagarmatha',
    description:
      'The Everest Base Camp trek follows the trail blazed by the 1953 expedition, from the airstrip at Lukla through the Sherpa capital of Namche Bazaar, the gompa at Tengboche and the stone villages of Dingboche and Lobuche to the ice of Gorak Shep. Days are spent walking teahouse to teahouse along the Dudh Koshi river, past mani walls, prayer flags and yak caravans, with the biggest peaks in the world on the skyline the whole way.\n\nWe build in the acclimatisation days this route demands — a rest day in Namche and another above Dingboche — with daily pulse-oximeter checks and a guide who has walked the Khumbu for over a decade. The trek reaches 5,364 m at Everest Base Camp and 5,545 m at the sunrise viewpoint of Kala Patthar, but only ever sleeps one night at altitude, keeping the route challenging yet well within reach of a fit first-timer.',
    highlights: [
      'Stand at Everest Base Camp (5,364 m) beneath the Khumbu icefall',
      'Sunrise over Everest from Kala Patthar (5,545 m)',
      'Namche Bazaar — the trading capital of the Khumbu',
      'Tengboche monastery, the spiritual heart of the Khumbu',
      'Cross the suspension bridges and mani walls of the Dudh Koshi valley',
      'Sherpa teahouse hospitality, dal bhat and apple pie every evening',
      'Sagarmatha National Park — yeti scalp legend and Himalayan wildlife',
    ],
    itinerary: [
      {
        day: 'Day 1',
        title: 'Fly Kathmandu to Lukla (2,840 m), trek to Phakding',
        detail:
          'An early mountain flight lands on Lukla’s short runway. A gentle warm-up walk descends through pine forest to Phakding on the Dudh Koshi.',
      },
      {
        day: 'Day 2',
        title: 'Phakding to Namche Bazaar (3,440 m)',
        detail:
          'Cross five suspension bridges, pass the gateway arch of Jorsale and climb the final switchbacks into Namche, arriving beneath the Kongde ridge.',
      },
      {
        day: 'Day 3',
        title: 'Acclimatisation day in Namche',
        detail:
          'A rest day with an optional walk to the Everest View Hotel or the Sherpa museum — a slow climb, a long look at Ama Dablam, and an early night.',
      },
      {
        day: 'Day 4',
        title: 'Namche to Tengboche (3,860 m)',
        detail:
          'The trail drops to Phunki Tenga then climbs steadily through rhododendron and fir to the monastery at Tengboche.',
      },
      {
        day: 'Day 5',
        title: 'Tengboche to Dingboche (4,410 m)',
        detail:
          'Past Pangboche — the oldest Sherpa settlement in the Khumbu — into the wider, windier valley of Dingboche.',
      },
      {
        day: 'Day 6',
        title: 'Acclimatisation day above Dingboche',
        detail:
          'Climb Nangkartshang (5,083 m) for a 360° panorama before descending to sleep low in Dingboche.',
      },
      {
        day: 'Day 7',
        title: 'Dingboche to Lobuche (4,940 m)',
        detail:
          'Along the lateral moraine of the Khumbu glacier, past memorials to climbers lost on the mountain, to the clustered stone lodges of Lobuche.',
      },
      {
        day: 'Day 8',
        title: 'Lobuche to Gorak Shep (5,164 m), Everest Base Camp (5,364 m)',
        detail:
          'A short, slow climb to Gorak Shep, then on across the glacier snout to the climbers’ tents and ice of base camp before walking back for the night.',
      },
      {
        day: 'Day 9',
        title: 'Kala Patthar (5,545 m) sunrise, trek to Pheriche',
        detail:
          'A pre-dawn climb for sunrise over Everest, then a long descent out of the high valley to Pheriche.',
      },
      {
        day: 'Day 10',
        title: 'Pheriche to Namche Bazaar',
        detail:
          'Retrace the trail through Pangboche and Tengboche to the comfort of Namche — hot showers and celebration apple pie.',
      },
      {
        day: 'Day 11',
        title: 'Namche to Lukla',
        detail:
          'The long final descent along the Dudh Koshi back to Lukla for the last teahouse night.',
      },
      {
        day: 'Day 12',
        title: 'Fly Lukla to Kathmandu',
        detail:
          'Morning flight back to the city, with the afternoon free for Thamel and a proper celebration dinner.',
      },
    ],
    includes: [
      'Licensed, English-speaking Khumbu trekking guide',
      'Return Lukla mountain flights and baggage allowance',
      'Sagarmatha National Park entry permit and TIMS card',
      'All teahouse lodge bookings (twin sharing)',
      'Three meals a day on the trek',
      'Porter option and duffel bag on request',
      'Pulse oximeter, first aid and evacuation support',
    ],
    meetingPoint:
      'Tribhuvan International Airport domestic terminal, Kathmandu — group flight briefing at 6:00 AM (pre-trek briefing the evening before).',
    bestSeason: 'October–November and March–May for clear skies and stable weather.',
    gallery: [G.everest, G.peaks, G.trail],
  },

  'annapurna-base-camp-trek': {
    tagline: 'Into the sanctuary of the Annapurnas',
    description:
      'The Annapurna Base Camp trek walks straight into the heart of the Annapurna — a high glacial amphitheatre ringed by Annapurna I, Machhapuchhre, Hiunchuli and Annapurna South. The route begins with the stone staircases of Ghandruk, home to the Gurung people, climbs through bamboo and rhododendron forest to Chomrong and Deurali, and follows the Modi Khola to base camp at 4,130 m.\n\nIt is the most accessible of Nepal’s great treks: only one night is spent at altitude, the highest point is just over 4,000 m, and the whole route can be walked in eight days from Pokhara. Your guide knows the teahouses with the hot showers, the natural hot springs at Jhinu Danda for the walk out, and exactly where the morning light first hits Machhapuchhre’s fishtail summit.',
    highlights: [
      '360° mountain panorama at Annapurna Base Camp (4,130 m)',
      'Machhapuchhre — Fishtail, the sacred unclimbed peak',
      'Gurung hospitality and the museum in Ghandruk village',
      'Natural hot springs at Jhinu Danda on the walk out',
      'Rhododendron forests at their best in March and April',
      'River gorges, waterfalls and glacier-fed streams of the Modi Khola',
      'Only one night at altitude — great first teahouse trek',
    ],
    itinerary: [
      {
        day: 'Day 1',
        title: 'Drive Pokhara to Nayapul, trek to Ghandruk (1,940 m)',
        detail:
          'A scenic drive along the Seti and Modi valleys, then a climb through rice terraces to the stone-slabbed Gurung village of Ghandruk.',
      },
      {
        day: 'Day 2',
        title: 'Ghandruk to Chomrong (2,170 m)',
        detail:
          'Up and down through forest and side villages with the first big views of Annapurna South and Machhapuchhre.',
      },
      {
        day: 'Day 3',
        title: 'Chomrong to Bamboo (2,310 m)',
        detail:
          'A steep descent to the Chomrong Khola and a long climb through dense bamboo forest to Bamboo.',
      },
      {
        day: 'Day 4',
        title: 'Bamboo to Deurali (3,230 m)',
        detail:
          'The valley narrows between enormous rock walls — the route the avalanche carried the old trail down from — to the bamboo lodges of Deurali.',
      },
      {
        day: 'Day 5',
        title: 'Deurali to Annapurna Base Camp (4,130 m)',
        detail:
          'Past Hinku cave and over the lateral moraine into the sanctuary itself, arriving at base camp beneath the ice walls.',
      },
      {
        day: 'Day 6',
        title: 'Sunrise at base camp, trek to Bamboo',
        detail:
          'An early walk to the Machhapuchhre base camp viewpoint for sunrise, then retrace the trail down to Bamboo.',
      },
      {
        day: 'Day 7',
        title: 'Bamboo to Jhinu Danda (1,760 m)',
        detail:
          'Descend through Sinuwa to the riverside lodges of Jhinu Danda and soak in the natural hot springs.',
      },
      {
        day: 'Day 8',
        title: 'Jhinu Danda to Nayapul, drive to Pokhara',
        detail:
          'A final gentle walk out through Siwai village to the roadhead, and the drive back to lakeside Pokhara.',
      },
    ],
    includes: [
      'Licensed, English-speaking Annapurna trekking guide',
      'Annapurna Conservation Area Permit (ACAP) and TIMS card',
      'Private transport Pokhara–Nayapul–Pokhara',
      'All teahouse lodge bookings (twin sharing)',
      'Three meals a day on the trek',
      'Sleeping bag and down jacket when needed',
      'First aid, oximeter checks and emergency support',
    ],
    meetingPoint:
      'Lakeside Pokhara hotel reception, 7:00 AM pickup (alternative pickup in Kathmandu with tourist bus transfer).',
    bestSeason: 'March–May for rhododendrons and September–November for the clearest views.',
    gallery: [G.annapurna, G.nature, G.hills],
  },

  'annapurna-circuit-trek': {
    tagline: 'Around the great Himalaya — Marsyangdi to Kali Gandaki',
    description:
      'The Annapurna Circuit is one of the world’s great walks: a 14-day loop from the sub-tropical Marsyangdi valley through Tibetan-style Manang, over the 5,416 m Thorong La pass, and down into the rain-shadow Kali Gandaki, the deepest gorge on earth. Few treks pack in so much variety — paddy terraces, pine forest, high desert, glaciers and the shrine of Muktinath — with Annapurna and Dhaulagiri both in sight on the same day.\n\nBecause the route climbs slowly and includes acclimatisation days in Manang, it is challenging but achievable for walkers with a good base of fitness. Our guides arrange the Permits, the teahouses and the mountain rescue insurance, and pace the crossing so the pass day starts in the dark, on schedule and safely.',
    highlights: [
      'Cross Thorong La (5,416 m) at sunrise',
      'The Kali Gandaki — the deepest gorge on earth',
      'Muktinath temple, sacred to Hindus and Buddhists alike',
      'Manang’s Tibetan-Buddhist villages and 500-year-old gompa',
      'Hot springs at Tatopani on the way out',
      'Poon Hill sunrise finale over Dhaulagiri and Annapurna',
      'Sub-tropical forest to high desert in a single loop',
    ],
    itinerary: [
      {
        day: 'Day 1',
        title: 'Drive Kathmandu to Besisahar, trek to Bhulbhule',
        detail:
          'A long drive along the Trishuli and Marsyangdi rivers to the trailhead and a flat warm-up walk.',
      },
      {
        day: 'Day 2',
        title: 'Bhulbhule to Jagat (1,300 m)',
        detail:
          'Through rice terraces and Hindu villages, crossing the river on the long suspension bridge into the first Gurung settlements.',
      },
      {
        day: 'Day 3',
        title: 'Jagat to Dharapani (1,960 m)',
        detail:
          'Entering the restricted area of Manang, the valley closes between cliffs and the architecture turns Tibetan.',
      },
      {
        day: 'Day 4',
        title: 'Dharapani to Chame (2,710 m)',
        detail:
          'Through pine and fir forest with views of Lamjung Himal, reaching the district headquarters at Chame.',
      },
      {
        day: 'Day 5',
        title: 'Chame to Upper Pisang (3,300 m)',
        detail:
          'Along the Paungda Danda rock face — a wall that climbs 1,500 m straight off the river.',
      },
      {
        day: 'Day 6',
        title: 'Upper Pisang to Manang (3,520 m)',
        detail: 'Past the cave monasteries of Hongde to the main village of Manang and its gompa.',
      },
      {
        day: 'Day 7',
        title: 'Acclimatisation day in Manang',
        detail:
          'Rest day walk to the Gangapurna lake viewpoint, the ice cave or the old gompa — slow walking, big views.',
      },
      {
        day: 'Day 8',
        title: 'Manang to Yak Kharka (4,050 m)',
        detail: 'Into the high grazing country of Gandaruchaland, with yaks and blue sheep for company.',
      },
      {
        day: 'Day 9',
        title: 'Yak Kharka to Thorong Phedi (4,525 m)',
        detail: 'A short day to the base of the pass — early dinner, earlier bed, and a very early start.',
      },
      {
        day: 'Day 10',
        title: 'Cross Thorong La (5,416 m) to Muktinath (3,800 m)',
        detail:
          'Start in the dark for the switchbacks to the pass, with prayer flags snapping in the wind, then a long descent to the shrine at Muktinath.',
      },
      {
        day: 'Day 11',
        title: 'Muktinath to Marpha (2,670 m)',
        detail:
          'Into the Kali Gandaki and the rain-shadow villages of the Thakali people — apple orchards and Marpha’s white houses.',
      },
      {
        day: 'Day 12',
        title: 'Marpha to Tatopani (1,200 m)',
        detail: 'Down the Kali Gandaki through Ghasa and the waterfalls of Rupse Chhoro to the hot springs.',
      },
      {
        day: 'Day 13',
        title: 'Tatopani to Ghorepani (2,850 m)',
        detail: 'The long climb out of the gorge through Shikha to the ridge-top village of Ghorepani.',
      },
      {
        day: 'Day 14',
        title: 'Poon Hill (3,210 m) sunrise, trek to Nayapul and drive to Pokhara',
        detail: 'A dawn climb to Poon Hill for the Dhaulagiri–Annapurna panorama, then down to the road.',
      },
    ],
    includes: [
      'Licensed, English-speaking circuit trekking guide',
      'ACAP and Manang restricted-area permits',
      'All teahouse lodge bookings (twin sharing)',
      'Transport Kathmandu–Besisahar and Nayapul–Pokhara',
      'Three meals a day on the trek',
      'Porter option on request',
      'Mountain rescue insurance, first aid and oximeter checks',
    ],
    meetingPoint:
      'Kathmandu hotel pickup at 6:30 AM, or join the trek at Besisahar on Day 1 by tourist bus.',
    bestSeason: 'September–November and March–May; the pass can close in winter storms.',
    gallery: [G.peaks, G.night, G.hills],
  },

  'ghorepani-poon-hill-trek': {
    tagline: 'Nepal’s classic short trek — sunrise from Poon Hill',
    description:
      'The Ghorepani Poon Hill trek is the finest short trek in Nepal: five days on foot through rhododendron forest, Gurung villages and alpine ridge, ending with a pre-dawn climb to Poon Hill for one of the great mountain panoramas on earth — Dhaulagiri, Annapurna South, Machhapuchhre and Nilgiri turning gold in the first light.\n\nFrom Pokhara it is an easy drive to Nayapul and a gentle climb on stone steps to Tikhedhunga, following the Modi Khola through Ulleri and Ghorepani. Because the highest point is only 3,210 m, the route suits families, first-time trekkers and anyone short on time — and the walk out through Ghandruk adds one of the most beautiful stone villages in the Annapurna region.',
    highlights: [
      'Sunrise panorama over Dhaulagiri and Annapurna from Poon Hill (3,210 m)',
      'Rhododendron and magnolia forest — ablaze with colour in spring',
      'The stone village of Ghandruk and its Gurung culture',
      'Stone staircases of Ulleri — the staircase to the Himalaya',
      'Only five days, with modest daily distances',
      'Family friendly — great for children over eight',
      'Optional golden-hour photography walk from Ghorepani',
    ],
    itinerary: [
      {
        day: 'Day 1',
        title: 'Drive Pokhara to Nayapul, trek to Tikhedhunga (1,540 m)',
        detail:
          'A two-hour drive along the Modi valley, then a gentle start past Birethanti to the village of Tikhedhunga.',
      },
      {
        day: 'Day 2',
        title: 'Tikhedhunga to Ghorepani (2,850 m)',
        detail:
          'The climb of the famous Ulleri stone steps, then through forest and the Magar village of Ulleri to Ghorepani.',
      },
      {
        day: 'Day 3',
        title: 'Poon Hill (3,210 m) sunrise, trek to Tadapani',
        detail:
          'An early hour’s climb to the ridge for sunrise over the Annapurnas, breakfast in Ghorepani, then on through forest to Tadapani.',
      },
      {
        day: 'Day 4',
        title: 'Tadapani to Ghandruk (1,940 m)',
        detail:
          'A descent through oak forest to the terraced stone village of Ghandruk, time for the Gurung museum and a village walk.',
      },
      {
        day: 'Day 5',
        title: 'Ghandruk to Nayapul, drive to Pokhara',
        detail: 'A final walk down through Kimche and Siwai to the roadhead and the drive back to the lake.',
      },
    ],
    includes: [
      'Licensed, English-speaking Annapurna trekking guide',
      'ACAP permit and TIMS card',
      'Private transport Pokhara–Nayapul–Pokhara',
      'All teahouse lodge bookings (twin sharing)',
      'Three meals a day on the trek',
      'Porter option on request',
      'First aid and daily altitude checks',
    ],
    meetingPoint: 'Pokhara lakeside hotel pickup, 7:00 AM.',
    bestSeason: 'September–November for clear views, March–April for rhododendrons.',
    gallery: [G.hills, G.annapurna, G.forest],
  },

  'langtang-valley-trek': {
    tagline: 'Tamang villages and glaciers a day from Kathmandu',
    description:
      'The Langtang Valley trek is the most accessible of Nepal’s great treks — a day’s drive from Kathmandu and you are walking through Tamang villages, yak pastures and hanging glaciers towards the Langtang Lirung (7,227 m). The valley was rebuilt stone by stone after the 2015 earthquake, and trekking here is among the most meaningful ways to support the communities that have welcomed travellers for generations.\n\nThe route climbs gently from Syabrubesi along the Langtang Khola through Lama Hotel and Langtang village to Kyanjin Gompa, the last settlement, ringed by ice walls. Optional walks climb Kyanjin Ri and Tsergo Ri for views across to the Tibetan frontier — the whole trek stays moderate in difficulty with a highest point under 4,000 m.',
    highlights: [
      'Langtang Lirung (7,227 m) filling the head of the valley',
      'Tamang villages, monasteries and cheese factories',
      'Sunrise from Kyanjin Ri or Tsergo Ri',
      'Yak pastures, Himalayan tahr and red pandas in the national park',
      'Views across to the Tibetan plateau from the ridgelines',
      'Rebuilt with community homestays — trekking that gives back',
      'Shortest access to true alpine trekking from Kathmandu',
    ],
    itinerary: [
      {
        day: 'Day 1',
        title: 'Drive Kathmandu to Syabrubesi (1,462 m)',
        detail: 'A scenic seven-hour drive along the Trishuli river through the hills to the trailhead.',
      },
      {
        day: 'Day 2',
        title: 'Syabrubesi to Lama Hotel (2,480 m)',
        detail: 'Along the Langtang Khola through bamboo and oak, crossing rivers on log bridges.',
      },
      {
        day: 'Day 3',
        title: 'Lama Hotel to Langtang village (3,430 m)',
        detail:
          'Into the upper valley with first views of Langtang Lirung, through the rebuilt valley settlements.',
      },
      {
        day: 'Day 4',
        title: 'Langtang village to Kyanjin Gompa (3,870 m)',
        detail:
          'A short walk past mani walls and the army post to Kyanjin, beneath the ice walls of Langtang Lirung.',
      },
      {
        day: 'Day 5',
        title: 'Exploration day — Kyanjin Ri (4,773 m)',
        detail:
          'An early climb of Kyanjin Ri for the full ring of peaks and the Langtang glacier, or a gentler walk to the cheese factory.',
      },
      {
        day: 'Day 6',
        title: 'Kyanjin Gompa to Lama Hotel',
        detail: 'Retracing the valley floor back down through Ghora Tabela to Lama Hotel.',
      },
      {
        day: 'Day 7',
        title: 'Lama Hotel to Syabrubesi',
        detail: 'The last day on the trail, descending the last of the river valley to the roadhead.',
      },
      {
        day: 'Day 8',
        title: 'Drive Syabrubesi to Kathmandu',
        detail: 'Return drive along the Trishuli, arriving in Kathmandu by late afternoon.',
      },
      {
        day: 'Day 9',
        title: 'Buffer / weather day',
        detail:
          'A contingency day for road delays or storms in the valley — kept free so the trek never has to rush.',
      },
    ],
    includes: [
      'Licensed, English-speaking Langtang trekking guide',
      'Langtang National Park entry permit and TIMS card',
      'Private transport Kathmandu–Syabrubesi–Kathmandu',
      'All teahouse lodge bookings (twin sharing)',
      'Three meals a day on the trek',
      'Porter option on request',
      'First aid and daily altitude checks',
    ],
    meetingPoint: 'Kathmandu hotel pickup, 6:30 AM for the drive to Syabrubesi.',
    bestSeason: 'September–November and March–May; winter roads to Syabrubesi can be blocked by snow.',
    gallery: [G.forest, G.peaks, G.nature],
  },

  'mardi-himal-trek': {
    tagline: 'The ridge line beneath Fishtail',
    description:
      'Mardi Himal is the best-kept secret of the Annapurna region: a narrow, forested ridge that runs straight beneath the fishtail of Machhapuchhre to a base camp at 3,580 m, with the whole Annapurna range laid out to the north. Where other routes fill teahouses with crowds, Mardi stays quiet — perfect if you want the mountains to yourselves.\n\nThe trek climbs from Phedi above Pokhara through Forest Camp and High Camp along a ridge of rhododendron and bamboo, opening into the high country with views of Annapurna South, Hiunchuli and the Machhapuchhre wall. The descent exits over the ridge through Landruk, one of the most beautiful Gurung villages in Nepal.',
    highlights: [
      'Camp-like ridge trail with Machhapuchhre (6,993 m) alongside',
      'Panoramas of Annapurna South, Hiunchuli and Annapurna I from High Camp',
      'Quiet teahouses — far fewer trekkers than ABC or Poon Hill',
      'Forest of rhododendron, bamboo and oak, full of birdsong',
      'Sunrise on the Annapurnas from the ridge',
      'Exit through the Gurung village of Landruk',
      'The highest of Nepal’s shorter treks — only 3,580 m at the top',
    ],
    itinerary: [
      {
        day: 'Day 1',
        title: 'Drive Pokhara to Phedi, trek to Forest Camp (2,600 m)',
        detail: 'An hour’s drive to Phedi and a steady climb through farmland into the first forest camps.',
      },
      {
        day: 'Day 2',
        title: 'Forest Camp to Low Camp (3,000 m)',
        detail: 'The ridge narrows and the forest turns to rhododendron, with first gaps showing Annapurna South.',
      },
      {
        day: 'Day 3',
        title: 'Low Camp to High Camp (3,550 m)',
        detail: 'Out of the trees onto the open ridge, with Machhapuchhre filling the sky ahead.',
      },
      {
        day: 'Day 4',
        title: 'High Camp to Mardi Himal base camp (3,580 m) and back',
        detail: 'A dawn walk to the base camp viewpoint above the treeline, back to High Camp for lunch and the afternoon light.',
      },
      {
        day: 'Day 5',
        title: 'High Camp to Forest Camp',
        detail: 'Retracing the ridge down into the forest with the day warming behind you.',
      },
      {
        day: 'Day 6',
        title: 'Forest Camp to Landruk (1,565 m)',
        detail: 'A steep, beautiful descent through the village of Chauket to the stone-slabbed lanes of Landruk.',
      },
      {
        day: 'Day 7',
        title: 'Landruk to Siwai, drive to Pokhara',
        detail: 'The final walk out to the road and the drive back to Pokhara by lunchtime.',
      },
    ],
    includes: [
      'Licensed, English-speaking Annapurna trekking guide',
      'ACAP permit and TIMS card',
      'Private transport Pokhara–Phedi–Pokhara',
      'All teahouse lodge bookings (twin sharing)',
      'Three meals a day on the trek',
      'Porter option on request',
      'First aid and daily altitude checks',
    ],
    meetingPoint: 'Pokhara lakeside hotel pickup, 7:00 AM.',
    bestSeason: 'September–November for clear ridge views; spring for rhododendron bloom.',
    gallery: [G.annapurna, G.lake, G.nature],
  },

  'sarangkot-sunrise-hike': {
    tagline: 'Sunrise over the Annapurnas, before breakfast',
    description:
      'Sarangkot is Pokhara’s balcony — a hill above the lake where the whole Annapurna range lines up from Dhaulagiri in the west to Manaslu in the north. This early-morning hike starts in the dark, climbs the quiet forest road and village paths to the 1,592 m viewpoint, and arrives just as the first light paints the peaks gold.\n\nBecause the hike finishes by eight in the morning, the rest of your day in Pokhara is free — and the walk ends the way a morning in Nepal should, with a hot Nepali breakfast and milk tea with a local family in Sarangkot village. No trekking experience is needed; it is a gentle two-hour walk suitable for all ages.',
    highlights: [
      'Sunrise over Annapurna, Dhaulagiri and Manaslu from the Sarangkot viewpoint',
      'Pre-dawn forest walk by torchlight — a Nepali morning ritual',
      'Breakfast and milk tea with a local family',
      'Paragliders launching from the same ridge at first light',
      'Phewa Lake and Pokhara valley waking up below',
      'Only four hours door to door — perfect for a short stay',
      'Private guide with village insight into life on the hill',
    ],
    itinerary: [
      {
        day: 'Pre-dawn',
        title: 'Hotel pickup and drive to Sarangkot',
        detail: 'Pickup at 4:30 AM and a short drive up the Sarangkot road, arriving as the stars fade.',
      },
      {
        day: 'Sunrise',
        title: 'Hike to the viewpoint (1,592 m)',
        detail: 'A 45-minute walk up through the village and forest to the viewpoint tower for the sunrise.',
      },
      {
        day: 'Morning',
        title: 'Breakfast with a local family',
        detail: 'Roti, Tibetan bread and milk tea with hosts in Sarangkot, with paragliders drifting overhead.',
      },
      {
        day: 'Mid-morning',
        title: 'Village walk and return to Pokhara',
        detail: 'A stroll through Sarangkot village before the walk down and drive back to the lake by 9:00 AM.',
      },
    ],
    includes: [
      'Licensed, English-speaking local guide',
      'Private transport Pokhara–Sarangkot–Pokhara',
      'Nepali breakfast and milk tea with a local family',
      'Torch for the pre-dawn walk',
      'Village walk and viewpoint entry',
    ],
    meetingPoint: 'Pokhara lakeside hotel pickup at 4:30 AM (guide arrives the evening before).',
    bestSeason: 'September–November for the clearest Himalayan views; winter mornings are crisp and clear.',
    gallery: [G.phewa, G.annapurna, G.nature],
  },

  'changu-narayan-hike': {
    tagline: 'A pine-forest walk to Nepal’s oldest living temple',
    description:
      'Changu Narayan sits on a wooded ridge above Bhaktapur, its courtyard holding some of the finest Licchavi-era stone carvings in Nepal — a UNESCO World Heritage site and the oldest temple in the Kathmandu Valley still in daily worship. The hike up from Bhaktapur passes farming hamlets, water springs and forest where langur monkeys and hornbills live, with views from the Himalaya to the plains on a clear day.\n\nIt is the perfect half-day walk out of the valley cities: an easy trail ancient traders used for centuries, ending with a temple guide who can read the stories carved into the doors — from the Vishnu Vikranta incarnation to the Narasimha pillar with its sixth-century inscription.',
    highlights: [
      'Changu Narayan temple — a UNESCO-listed Licchavi masterpiece',
      'The 5th-century Narasimha stone pillar and carved door guardians',
      'Panorama from the Himalaya to the Terai plains',
      'Pine forest walk with hornbills and langur monkeys',
      'Bhaktapur pottery and farming villages on the trail',
      'Temple square time with a local storyteller',
      'Half-day walk — back in Bhaktapur for lunch',
    ],
    itinerary: [
      {
        day: 'Morning',
        title: 'Bhaktapur pickup and walk to the Changu ridge',
        detail: 'A short drive to the Changunarayan trailhead north of Bhaktapur, then a two-hour forest walk up to the temple.',
      },
      {
        day: 'Midday',
        title: 'Temple visit with a local storyteller',
        detail: 'Explore the courtyard, the carved wooden struts and the museum with a guide who knows the Licchavi legends.',
      },
      {
        day: 'Afternoon',
        title: 'Lunch in Bhaktapur and return',
        detail: 'Walk or drive down to Bhaktapur Durbar Square for juju dhau curd and a pottery square stroll.',
      },
    ],
    includes: [
      'Licensed, English-speaking local hiking guide',
      'Changu Narayan temple entry and storyteller',
      'Private transport Bhaktapur–trailhead–Bhaktapur',
      'Bottled water and trail snacks',
    ],
    meetingPoint: 'Bhaktapur Durbar Square (or Kathmandu hotel) pickup at 8:00 AM.',
    bestSeason: 'September–November and February–April for clear views; monsoon evenings are dramatic.',
    gallery: [G.forest, G.hills, G.nature],
  },

  'khopra-ridge-trek': {
    tagline: 'The quiet community trek above the Modi Khola',
    description:
      'Khopra Ridge is the ridge less travelled: a community-run alternative to Poon Hill that stays high above the Modi Khola, on a grassy crest with Dhaulagiri and the whole Annapurna range competing for attention. Far fewer trekkers walk here, and every teahouse along the way belongs to a village homestay committee, so your stay supports the settlement you sleep in.\n\nThe route climbs through Gurung villages to the Khopra ridge at 3,660 m and the glacial lake of Khayer Lake, returns via the forest village of Swanta, and joins the classic trail at Ghorepani for the Poon Hill sunrise finale. It is moderate in difficulty, with only two nights above 3,000 m, and the ridgeline walking is among the finest half-days in the Annapurna region.',
    highlights: [
      'Dhaulagiri’s 8,167 m wall filling the western sky from the Khopra ridge',
      'A night beside glacial Khayer Lake',
      'Community homestays run by village committees — trekking that gives back',
      'Gurung villages of Landruk, Bayeli and Swanta off the main trail',
      'Sunrise finale from Poon Hill (3,210 m)',
      'Rhododendron forest and ridge walking without the crowds',
      'Optional side trip to the Machhapuchhre base camp viewpoint',
    ],
    itinerary: [
      {
        day: 'Day 1',
        title: 'Drive Pokhara to Kimche, trek to Ghandruk (1,940 m)',
        detail: 'The drive up the Modi valley to Kimche, then the climb through savoury farmland to Ghandruk.',
      },
      {
        day: 'Day 2',
        title: 'Ghandruk to Bayeli (2,850 m)',
        detail: 'A quiet forest trail above the main route, staying high above the Kimrong Khola to the hamlet of Bayeli.',
      },
      {
        day: 'Day 3',
        title: 'Bayeli to Khopra ridge via Khayer Lake (3,660 m)',
        detail: 'Climb through alpine pasture past the glacial tarn of Khayer Lake to the teahouses on the Khopra ridge.',
      },
      {
        day: 'Day 4',
        title: 'Rest day on the ridge',
        detail: 'A slow day for the Dhaulagiri sunrise, the pond crossers and the herders’ trails along the crest.',
      },
      {
        day: 'Day 5',
        title: 'Khopra ridge to Swanta (2,200 m)',
        detail: 'A long, beautiful descent through oak and magnolia forest to the community village of Swanta.',
      },
      {
        day: 'Day 6',
        title: 'Swanta to Ghorepani (2,850 m)',
        detail: 'Over the ridge through Chistibung to join the classic trail at Ghorepani.',
      },
      {
        day: 'Day 7',
        title: 'Poon Hill (3,210 m) sunrise, trek to Hile',
        detail: 'The dawn climb to Poon Hill, then a full day of descent through Ulleri and Birethanti to Hile.',
      },
      {
        day: 'Day 8',
        title: 'Hile to Nayapul, drive to Pokhara',
        detail: 'The last short walk out to the road and the drive back to Pokhara.',
      },
    ],
    includes: [
      'Licensed, English-speaking Annapurna trekking guide',
      'ACAP permit and TIMS card',
      'Private transport Pokhara–Kimche–Nayapul–Pokhara',
      'All teahouse and community homestay bookings (twin sharing)',
      'Three meals a day on the trek',
      'Sleeping bag and liner for ridge nights',
      'First aid and daily altitude checks',
    ],
    meetingPoint: 'Pokhara lakeside hotel pickup, 6:30 AM for the drive to Kimche.',
    bestSeason: 'September–November for clear ridgeline views; spring for rhododendron and wildflowers.',
    gallery: [G.nature, G.hills, G.peaks],
  },

  'helambu-gosainkunda-trek': {
    tagline: 'Sacred alpine lakes above the Helambu villages',
    description:
      'This quiet route follows the watershed north of the Kathmandu Valley through Helambu — the home of the Hyolmo (Helambu Sherpa) people — to Gosainkunda, a chain of glacial lakes sacred to Hindus and Buddhists alike, where Shiva is said to have struck the earth with his trident to release the water.\n\nThe trek climbs from Sundarijal through the Shivapuri ridge to the Tamang and Hyolmo villages of Tharepati and Timbu, then over high pastures to the lakes at 4,380 m, ringed by Langtang Lirung. Pilgrims bathe in the lake during the Janai Purnima festival each August; outside festival season the ridges are almost empty. The walk is moderate, staying under 4,400 m, and the whole route sits within earshot of Kathmandu yet feels a world away.',
    highlights: [
      'Gosainkunda lake (4,380 m) and its ring of sacred ponds',
      'Hyolmo (Helambu Sherpa) and Tamang villages and monasteries',
      'Ridge walking along the Shivapuri watershed',
      'Langtang Lirung and the Ganesh Himal from the pass',
      'The Janai Purnima pilgrimage in August, if timed well',
      'Cloud forest, waterfalls and the source of the Bagmati river',
      'A short drive from Kathmandu — no domestic flights needed',
    ],
    itinerary: [
      {
        day: 'Day 1',
        title: 'Drive Kathmandu to Sundarijal, trek to Chisopati (1,600 m)',
        detail: 'The trailhead at the edge of Shivapuri National Park and a gentle first day along the Bagmati.',
      },
      {
        day: 'Day 2',
        title: 'Chisopati to Mulkharka (1,896 m)',
        detail: 'Climbing through oak forest and farming hamlets, with waterfalls crossing the trail.',
      },
      {
        day: 'Day 3',
        title: 'Mulkharka to Tharepati (3,500 m)',
        detail: 'The long climb onto the Helambu ridge, with the first high villages and open pastures.',
      },
      {
        day: 'Day 4',
        title: 'Tharepati to Gosainkunda (4,380 m)',
        detail: 'Up through yak pastures and past Surya Kunda to the main lake, sacred to Shiva.',
      },
      {
        day: 'Day 5',
        title: 'Exploration day around the lakes',
        detail: 'Walks to Bhairab Kunda and Saraswati Kunda, and the Laurebina pass viewpoint above the lakes.',
      },
      {
        day: 'Day 6',
        title: 'Gosainkunda to Laurebina (3,700 m)',
        detail: 'A wild descent along the Laurebina valley through the national park to its base lodges.',
      },
      {
        day: 'Day 7',
        title: 'Laurebina to Dhunche (1,970 m)',
        detail: 'Down through the Trishuli valley to Dhunche, the roadhead below the ridge.',
      },
      {
        day: 'Day 8',
        title: 'Drive Dhunche to Kathmandu',
        detail: 'The return drive along the Trishuli river, arriving back in Kathmandu by late afternoon.',
      },
    ],
    includes: [
      'Licensed, English-speaking Helambu trekking guide',
      'Langtang National Park permit and TIMS card',
      'Private transport Kathmandu–Sundarijal and Dhunche–Kathmandu',
      'All teahouse lodge bookings (twin sharing)',
      'Three meals a day on the trek',
      'Porter option on request',
      'First aid and daily altitude checks',
    ],
    meetingPoint: 'Kathmandu hotel pickup, 6:30 AM for the drive to Sundarijal.',
    bestSeason: 'April–June and September–November; August for the Janai Purnima pilgrimage festival.',
    gallery: [G.night, G.peaks, G.forest],
  },

  'shivapuri-day-hike': {
    tagline: 'Cloud forest on Kathmandu’s northern ridge',
    description:
      'Shivapuri National Park protects the watershed above Kathmandu, and its day hike is the valley’s best green escape: a climb from the Bagmati gorge through cloud forest to the park’s 2,732 m peak, where a Hindu temple and Buddhist stupa share the summit and the whole Kathmandu Valley spreads out below.\n\nThe trail passes Bagdwar — the spring where the Bagmati river rises — climbs past waterfalls and fern banks, and runs along ridges frequented by leopard, barking deer and over 300 species of birds. It is an easy half-day walk on a real forest trail, cool even in summer, and the perfect way to spend a morning between temples and cities.',
    highlights: [
      'Panorama of the Kathmandu Valley, Shivapuri Himal and Langtang from the summit',
      'Bagdwar — the sacred source of the Bagmati river',
      'Cloud forest with oak, laurel and fern glades',
      'Birdlife including laughingthrush, barbets and pheasants',
      'Summit temple and chorten shared by Hindus and Buddhists',
      'Cool forest air — a summer escape from the city heat',
      'Half-day walk, back in Kathmandu for lunch',
    ],
    itinerary: [
      {
        day: 'Morning',
        title: 'Drive to Sundarijal and hike to Shivapuri peak (2,732 m)',
        detail: 'The trail climbs from Sundarijal past Bagdwar and through the forest to the summit temple.',
      },
      {
        day: 'Midday',
        title: 'Summit views and picnic lunch',
        detail: 'Time at the top for the 360° panorama, then a packed lunch in the forest shade.',
      },
      {
        day: 'Afternoon',
        title: 'Descend via Nagi Gumba and return',
        detail: 'A loop descent through the ridge forest past Nagi Gumba monastery to the road and drive back.',
      },
    ],
    includes: [
      'Licensed, English-speaking local hiking guide',
      'Shivapuri National Park entry permit',
      'Private transport Kathmandu–Sundarijal–Kathmandu',
      'Packed lunch and bottled water',
    ],
    meetingPoint: 'Kathmandu hotel pickup at 7:30 AM (drive of about 45 minutes to Sundarijal).',
    bestSeason: 'September–November for long views; the forest stays green and cool year-round.',
    gallery: [G.forest, G.hills, G.nature],
  },

  'nagarkot-dhulikhel-hike': {
    tagline: 'Ridge walking between the valley’s two sunrise towns',
    description:
      'Nagarkot and Dhulikhel are the Kathmandu Valley’s two celebrated sunrise viewpoints, and the ridge that joins them is a gentle two-day walk through farming villages, pine groves and quiet forest — with the Everest range on the horizon on a clear morning and the whole valley falling away to the south.\n\nThe route starts before dawn at Nagarkot, follows the ridgeline east through the villages of Chaukot and Tathali, and can take in the hilltop monastery of Namobuddha before finishing at Dhulikhel. It is an easy walk with modest daily distances, ideal as a first multi-day hike or a comfortable weekend between the temples of Bhaktapur and the city.',
    highlights: [
      'Sunrise over Everest, Ganesh Himal and Langtang from Nagarkot',
      'Ridge trail with the Mahabharat range to the south',
      'Village life in Chaukot, Tathali and the Dhulikhel ridge settlements',
      'Optional visit to Namobuddha monastery and its hilltop stupa',
      'Sunrise finale from Dhulikhel’s viewpoint',
      'Only two easy days — an ideal first multi-day walk',
      'Short transfers from Kathmandu or Bhaktapur',
    ],
    itinerary: [
      {
        day: 'Day 1',
        title: 'Drive to Nagarkot, sunrise and ridge walk to Chaukot area',
        detail: 'An afternoon arrival for the sunset over the Himalaya, then an early start for the sunrise before the ridge walk east to an overnight village lodge.',
      },
      {
        day: 'Day 2',
        title: 'Ridge to Namobuddha and on to Dhulikhel (2,195 m)',
        detail: 'Continue along the ridge through Tathali, with the option to detour to the Namobuddha stupa, finishing in Dhulikhel for the drive back.',
      },
    ],
    includes: [
      'Licensed, English-speaking local hiking guide',
      'Village lodge accommodation (twin sharing)',
      'All meals on the hike',
      'Private transport Kathmandu/Bhaktapur–Nagarkot and Dhulikhel–Kathmandu',
      'Bottled water and trail snacks',
    ],
    meetingPoint: 'Kathmandu or Bhaktapur hotel pickup at 12:00 PM for the drive to Nagarkot.',
    bestSeason: 'September–November and February–April for clear mountain views from the ridge.',
    gallery: [G.hills, G.peaks, G.forest],
  },
};
