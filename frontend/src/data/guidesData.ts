import { Guide } from './types';

/**
 * Fill in the fields every public profile needs, so a guide entry never renders
 * with a missing gallery, verification badge or response time.  Callers can
 * still override any default explicitly.
 */
const makeGuide = (guide: Guide): Guide => ({
  verified: true,
  responseTime: 'within a few hours',
  ...guide,
  gallery: guide.gallery && guide.gallery.length > 0 ? guide.gallery : [guide.image],
});

const guideCatalog: Guide[] = [
  {
    id: 1,
    name: 'Apicha',
    image:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80',
    role: 'Foodie & Local Expert',
    rating: 4.98,
    reviews: 124,
    bio: 'I was born and raised in the heart of Kathmandu. Food is my language! I love taking guests to the hidden alleys where my grandmother used to take me for the best treats. I believe that to truly know a city, you must taste it first.',
    languages: ['English', 'Nepali', 'Hindi'],
    verified: true,
    responseTime: 'less than 2 hours',
    livesIn: 'Kathmandu',
    cities: ['Kathmandu', 'Lalitpur'],
    gallery: [
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1740&q=80',
      'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1740&q=80',
      'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?auto=format&fit=crop&w=1740&q=80',
    ],
  },
  {
    id: 2,
    name: 'Sujal',
    image:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=128&q=80',
    role: 'History & Culture Buff',
    rating: 4.95,
    reviews: 89,
    bio: "History doesn't have to be boring. I tell the stories of Kathmandu's kings and commoners with a twist of humor. Let's explore the living museum that is my city.",
    languages: ['English', 'Nepali', 'Newari'],
    verified: true,
    responseTime: 'less than 1 hour',
    livesIn: 'Patan',
    cities: ['Kathmandu', 'Lalitpur', 'Pokhara'],
    gallery: [
      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1740&q=80',
      'https://images.unsplash.com/photo-1605640840605-14ac1855827b?auto=format&fit=crop&w=1740&q=80',
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1740&q=80',
    ],
  },
  {
    id: 3,
    name: 'Priya',
    image:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=128&q=80',
    role: 'Art & Lifestyle Host',
    rating: 5.0,
    reviews: 42,
    bio: 'As an artist myself, I see Kathmandu through colors and patterns. Join me to discover the vibrant art scene, from ancient Thangkas to modern street art.',
    languages: ['English', 'Nepali', 'French'],
    verified: true,
    responseTime: 'within a few hours',
    livesIn: 'Kathmandu',
    cities: ['Kathmandu', 'Pokhara'],
    gallery: [
      'https://images.unsplash.com/photo-1554188248-986adbb73be4?auto=format&fit=crop&w=1740&q=80',
      'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=1740&q=80',
      'https://images.unsplash.com/photo-1605640840605-14ac1855827b?auto=format&fit=crop&w=1740&q=80',
    ],
  },
  {
    id: 4,
    name: 'Rohan',
    image:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=128&q=80',
    role: 'Adventure Enthusiast',
    rating: 4.92,
    reviews: 156,
    bio: "I love the outdoors and the chaotic energy of Kathmandu. Whether it's hiking the hills or navigating the busiest markets, I'll ensure you have a safe and thrilling time.",
    languages: ['English', 'Nepali', 'German'],
    verified: true,
    responseTime: 'less than 1 hour',
    livesIn: 'Kathmandu',
    cities: ['Kathmandu', 'Pokhara', 'Lalitpur'],
    gallery: [
      'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1740&q=80',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1740&q=80',
      'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1740&q=80',
    ],
  },
  {
    id: 39,
    name: 'Kung',
    image:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80',
    role: 'The Easygoing Local',
    rating: 4.85,
    reviews: 67,
    bio: 'Relaxed and friendly, I love showing visitors the everyday charm of my neighborhood. Let me take you to the spots where locals actually hang out.',
    languages: ['English', 'Nepali', 'Mandarin'],
    verified: true,
    responseTime: 'within a few hours',
    livesIn: 'Kathmandu',
    cities: ['Kathmandu', 'Bhaktapur'],
    gallery: [
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1740&q=80',
      'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?auto=format&fit=crop&w=1740&q=80',
    ],
  },
  {
    id: 57,
    name: 'Jojo',
    image:
      'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=128&q=80',
    role: 'The Nature Lover',
    rating: 4.9,
    reviews: 54,
    bio: 'Nature is my passion. From forest trails to mountain meadows, I know the best places to connect with the natural beauty of Nepal.',
    languages: ['English', 'Nepali'],
    verified: true,
    responseTime: 'less than 1 hour',
    livesIn: 'Pokhara',
    cities: ['Pokhara', 'Chitwan'],
    gallery: [
      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1740&q=80',
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1740&q=80',
    ],
  },
  {
    id: 156,
    name: 'Mingma',
    image:
      'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=128&q=80',
    role: 'The Rock Climbing Pro',
    rating: 4.96,
    reviews: 89,
    bio: 'Certified rock climbing instructor with years of experience scaling the cliffs around Nepal. Safety first, adventure always.',
    languages: ['English', 'Nepali', 'Hindi'],
    verified: true,
    responseTime: 'less than 2 hours',
    livesIn: 'Pokhara',
    cities: ['Pokhara', 'Kathmandu'],
    gallery: [
      'https://images.unsplash.com/photo-1554188248-986adbb73be4?auto=format&fit=crop&w=1740&q=80',
      'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=1740&q=80',
    ],
  },
  {
    id: 178,
    name: 'Ang',
    image:
      'https://images.unsplash.com/photo-1535713875002-d1d0cf327fde?auto=format&fit=crop&w=128&q=80',
    role: 'The Paragliding Pilot',
    rating: 4.94,
    reviews: 73,
    bio: "Soar above Pokhara with me. I am a certified paragliding pilot who will show you the Himalayas from a bird's eye view.",
    languages: ['English', 'Nepali', 'French'],
    verified: true,
    responseTime: 'within a few hours',
    livesIn: 'Pokhara',
    cities: ['Pokhara', 'Sarangkot'],
    gallery: [
      'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1740&q=80',
      'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1740&q=80',
    ],
  },
  {
    id: 195,
    name: 'Chef Jekky',
    image:
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=128&q=80',
    role: 'Chef Jekky and The Team',
    rating: 4.91,
    reviews: 112,
    bio: 'Authentic Nepali cuisine expert. Join me for a cooking class where you will learn to make momos, dal bhat, and other local delicacies.',
    languages: ['English', 'Nepali', 'Hindi'],
    verified: true,
    responseTime: 'within a few hours',
    livesIn: 'Kathmandu',
    cities: ['Kathmandu', 'Bhaktapur'],
    gallery: [
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1740&q=80',
      'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1740&q=80',
    ],
  },
  {
    id: 198,
    name: 'Dorje',
    image:
      'https://images.unsplash.com/photo-1524505287194-e9016ce82611?auto=format&fit=crop&w=128&q=80',
    role: 'The Jungle Explorer',
    rating: 4.88,
    reviews: 41,
    bio: 'Jungle safari specialist. I will take you deep into Chitwan National Park to spot rhinos, tigers, and exotic birds.',
    languages: ['English', 'Nepali', 'Tharu'],
    verified: true,
    responseTime: 'less than 1 hour',
    livesIn: 'Chitwan',
    cities: ['Chitwan', 'Sauraha'],
    gallery: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1740&q=80',
      'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=1740&q=80',
    ],
  },
  {
    id: 199,
    name: 'Wasana',
    image:
      'https://images.unsplash.com/photo-1548187741-774e714a33c9?auto=format&fit=crop&w=128&q=80',
    role: 'The Food Maniac & Nepali Cooking Class',
    rating: 4.93,
    reviews: 96,
    bio: 'Food is my life. I teach travelers how to cook authentic Nepali dishes using fresh local ingredients from the market.',
    languages: ['English', 'Nepali', 'Hindi'],
    verified: true,
    responseTime: 'less than 2 hours',
    livesIn: 'Kathmandu',
    cities: ['Kathmandu', 'Patan'],
    gallery: [
      'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?auto=format&fit=crop&w=1740&q=80',
      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1740&q=80',
    ],
  },
  {
    id: 203,
    name: 'Pasang',
    image:
      'https://images.unsplash.com/photo-1500530854675-371b47c33b6f?auto=format&fit=crop&w=128&q=80',
    role: 'The River Guide',
    rating: 4.89,
    reviews: 58,
    bio: "White water rafting and river guiding expert. I know every rapid and calm stretch of Nepal's rivers.",
    languages: ['English', 'Nepali'],
    verified: true,
    responseTime: 'within a few hours',
    livesIn: 'Pokhara',
    cities: ['Pokhara', 'Trishuli'],
    gallery: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1740&q=80',
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1740&q=80',
    ],
  },
  {
    id: 210,
    name: 'Sammy',
    image:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=128&q=80',
    role: 'The Good Mood Ambassador',
    rating: 4.97,
    reviews: 143,
    bio: 'Always smiling, always welcoming. I make sure every traveler leaves Nepal with great memories and new friends.',
    languages: ['English', 'Nepali', 'French', 'Spanish'],
    verified: true,
    responseTime: 'less than 1 hour',
    livesIn: 'Kathmandu',
    cities: ['Kathmandu', 'Nagarkot'],
    gallery: [
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=1740&q=80',
      'https://images.unsplash.com/photo-1554188248-986adbb73be4?auto=format&fit=crop&w=1740&q=80',
    ],
  },
  {
    id: 267,
    name: 'Tashi',
    image:
      'https://images.unsplash.com/photo-1500294073028-a5daa6e44c6c?auto=format&fit=crop&w=128&q=80',
    role: 'The Eco-Tourism Guide',
    rating: 4.92,
    reviews: 78,
    bio: 'Sustainable travel advocate. I design eco-friendly tours that support local communities and protect the environment.',
    languages: ['English', 'Nepali', 'French'],
    verified: true,
    responseTime: 'within a few hours',
    livesIn: 'Kathmandu',
    cities: ['Kathmandu', 'Lamjung'],
    gallery: [
      'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1740&q=80',
      'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1740&q=80',
    ],
  },
  {
    id: 287,
    name: 'Pema',
    image:
      'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=128&q=80',
    role: 'The Adventure Expert',
    rating: 4.95,
    reviews: 134,
    bio: 'Trekking, climbing, and adventure sports specialist. I have led expeditions across the Annapurna and Everest regions.',
    languages: ['English', 'Nepali', 'Hindi'],
    verified: true,
    responseTime: 'less than 1 hour',
    livesIn: 'Pokhara',
    cities: ['Pokhara', 'Jomsom'],
    gallery: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1740&q=80',
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1740&q=80',
    ],
  },
  {
    id: 321,
    name: 'Nima',
    image:
      'https://images.unsplash.com/photo-1432352898111-0f88b128e2df?auto=format&fit=crop&w=128&q=80',
    role: 'The Wildlife Expert',
    rating: 4.9,
    reviews: 63,
    bio: "Wildlife biologist and nature guide. I help travelers spot rare animals and birds in Nepal's national parks and reserves.",
    languages: ['English', 'Nepali'],
    verified: true,
    responseTime: 'within a few hours',
    livesIn: 'Chitwan',
    cities: ['Chitwan', 'Bardia'],
    gallery: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1740&q=80',
      'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=1740&q=80',
    ],
  },
  {
    id: 342,
    name: 'Tenzin',
    image:
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=128&q=80',
    role: 'The Mountain Guide',
    rating: 4.98,
    reviews: 156,
    bio: 'High-altitude mountain guide with summits across the Himalayas. I specialize in Everest Base Camp and high-pass treks.',
    languages: ['English', 'Nepali', 'Sherpa'],
    verified: true,
    responseTime: 'less than 1 hour',
    livesIn: 'Solukhumbu',
    cities: ['Lukla', 'Namche'],
    gallery: [
      'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1740&q=80',
      'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1740&q=80',
    ],
  },
  {
    id: 420,
    name: 'Araya',
    image:
      'https://images.unsplash.com/photo-1489424723077-5477077dc8e2?auto=format&fit=crop&w=128&q=80',
    role: 'The Culinary and Culture Admirer',
    rating: 4.89,
    reviews: 52,
    bio: 'Food and culture enthusiast. I combine market visits, cooking classes, and heritage walks into unforgettable experiences.',
    languages: ['English', 'Nepali', 'French'],
    verified: true,
    responseTime: 'within a few hours',
    livesIn: 'Patan',
    cities: ['Patan', 'Kathmandu', 'Bhaktapur'],
    gallery: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1740&q=80',
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1740&q=80',
    ],
  },
  {
    id: 445,
    name: 'Lhakpa',
    image:
      'https://images.unsplash.com/photo-1526942288877-90568e0c3ca6?auto=format&fit=crop&w=128&q=80',
    role: 'The Trekking Specialist',
    rating: 4.94,
    reviews: 121,
    bio: 'Trekking route expert. From easy day hikes to challenging multi-day treks, I guide you safely through the mountains.',
    languages: ['English', 'Nepali', 'Hindi'],
    verified: true,
    responseTime: 'less than 1 hour',
    livesIn: 'Pokhara',
    cities: ['Pokhara', 'Ghorepani'],
    gallery: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1740&q=80',
      'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=1740&q=80',
    ],
  },
  {
    id: 54,
    name: 'Apicha',
    image:
      'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=128&q=80',
    role: 'The local culture expert',
    rating: 4.98,
    reviews: 124,
    bio: 'I was born and raised in the heart of Kathmandu. Food is my language! I love taking guests to the hidden alleys where my grandmother used to take me for the best treats.',
    languages: ['English', 'Nepali', 'Hindi'],
    verified: true,
    responseTime: 'less than 2 hours',
    livesIn: 'Kathmandu',
    cities: ['Kathmandu', 'Lalitpur'],
    gallery: [
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1740&q=80',
      'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1740&q=80',
      'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?auto=format&fit=crop&w=1740&q=80',
    ],
  },
  {
    id: 814,
    name: 'Artty',
    image:
      'https://images.unsplash.com/photo-1507656409469-f5c99c40b292?auto=format&fit=crop&w=128&q=80',
    role: 'The Lovely Storyteller',
    rating: 4.87,
    reviews: 38,
    bio: 'Storyteller and cultural heritage guide. I share the legends, myths, and history behind every temple and monument in the valley.',
    languages: ['English', 'Nepali', 'Newari'],
    verified: true,
    responseTime: 'within a few hours',
    livesIn: 'Kathmandu',
    cities: ['Kathmandu', 'Bhaktapur'],
    gallery: [
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=1740&q=80',
      'https://images.unsplash.com/photo-1554188248-986adbb73be4?auto=format&fit=crop&w=1740&q=80',
    ],
  },
  {
    id: 933,
    name: 'Zarut',
    image:
      'https://images.unsplash.com/photo-1543852786-2cf114bb0d2c?auto=format&fit=crop&w=128&q=80',
    role: 'The Culture Magician',
    rating: 4.91,
    reviews: 71,
    bio: 'Cultural immersion specialist. I arrange authentic experiences with local families, festivals, and traditional ceremonies.',
    languages: ['English', 'Nepali', 'Hindi'],
    verified: true,
    responseTime: 'less than 1 hour',
    livesIn: 'Bhaktapur',
    cities: ['Bhaktapur', 'Kathmandu', 'Patan'],
    gallery: [
      'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?auto=format&fit=crop&w=1740&q=80',
      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1740&q=80',
    ],
  },
  {
    id: 1001,
    name: 'Sita',
    image:
      'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=128&q=80',
    role: 'The Night Market Foodie',
    rating: 4.85,
    reviews: 163,
    bio: 'Night market specialist who knows all the best street food stalls in Kathmandu and Bhaktapur.',
    languages: ['English', 'Nepali', 'Newari'],
    verified: true,
    responseTime: 'within a few hours',
    livesIn: 'Kathmandu',
    cities: ['Kathmandu', 'Bhaktapur'],
    gallery: [
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1740&q=80',
      'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?auto=format&fit=crop&w=1740&q=80',
    ],
  },
  {
    id: 1002,
    name: 'Chef Sita',
    image:
      'https://images.unsplash.com/photo-1520813788428-75e9d2c538b8?auto=format&fit=crop&w=128&q=80',
    role: 'Traditional Newari Cooking Expert',
    rating: 4.92,
    reviews: 892,
    bio: 'Master of Newari cuisine with generations of family recipes. Specializes in yomari, chatamari, and traditional feasts.',
    languages: ['English', 'Nepali', 'Newari'],
    verified: true,
    responseTime: 'less than 2 hours',
    livesIn: 'Patan',
    cities: ['Patan', 'Kathmandu', 'Bhaktapur'],
    gallery: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1740&q=80',
      'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=1740&q=80',
    ],
  },
  {
    id: 1003,
    name: 'Maya',
    image:
      'https://images.unsplash.com/photo-1511729198227-bc431c391c5e?auto=format&fit=crop&w=128&q=80',
    role: 'Organic Farm to Table Specialist',
    rating: 4.88,
    reviews: 567,
    bio: 'Organic farming advocate who connects travelers with local farms and fresh, seasonal Nepali produce.',
    languages: ['English', 'Nepali'],
    verified: true,
    responseTime: 'within a few hours',
    livesIn: 'Pokhara',
    cities: ['Pokhara', 'Nagarkot'],
    gallery: [
      'https://images.unsplash.com/photo-1554188248-986adbb73be4?auto=format&fit=crop&w=1740&q=80',
      'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=1740&q=80',
    ],
  },
  {
    id: 1004,
    name: 'Raju',
    image:
      'https://images.unsplash.com/photo-1530672187241-b8fb0a4c81e9?auto=format&fit=crop&w=128&q=80',
    role: 'Momo Master & Street Food Guide',
    rating: 4.9,
    reviews: 334,
    bio: 'Momo specialist who knows every dumpling stall in the valley. From steamed to jhol momo, I cover them all.',
    languages: ['English', 'Nepali', 'Hindi'],
    verified: true,
    responseTime: 'less than 1 hour',
    livesIn: 'Kathmandu',
    cities: ['Kathmandu', 'Thamel'],
    gallery: [
      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1740&q=80',
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1740&q=80',
    ],
  },
  {
    id: 1005,
    name: 'Bikash',
    image:
      'https://images.unsplash.com/photo-1514834939393-8c6e8e32690c?auto=format&fit=crop&w=128&q=80',
    role: 'Traditional Thakali Kitchen',
    rating: 4.91,
    reviews: 445,
    bio: 'Thakali cuisine expert from Mustang. Authentic dal bhat, buckwheat pancakes, and apple brandy pairings.',
    languages: ['English', 'Nepali', 'Thakali'],
    verified: true,
    responseTime: 'within a few hours',
    livesIn: 'Pokhara',
    cities: ['Pokhara', 'Jomsom'],
    gallery: [
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=1740&q=80',
      'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1740&q=80',
    ],
  },
  {
    id: 1006,
    name: 'Anita',
    image:
      'https://images.unsplash.com/photo-1532012870230-3f1d9843a32c?auto=format&fit=crop&w=128&q=80',
    role: 'Home Cooking & Family Recipes',
    rating: 4.89,
    reviews: 189,
    bio: 'Home cook sharing generations of family recipes. Warm, welcoming kitchen experiences in a traditional Nepali home.',
    languages: ['English', 'Nepali'],
    verified: true,
    responseTime: 'less than 2 hours',
    livesIn: 'Kathmandu',
    cities: ['Kathmandu', 'Patan'],
    gallery: [
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1740&q=80',
      'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1740&q=80',
    ],
  },
  {
    id: 1007,
    name: 'Tuangtip',
    image:
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=128&q=80',
    role: 'The Food Magician',
    rating: 4.93,
    reviews: 933,
    bio: "Street food connoisseur who reveals the hidden flavors of Kathmandu's alleys and markets.",
    languages: ['English', 'Nepali', 'Hindi'],
    verified: true,
    responseTime: 'less than 1 hour',
    livesIn: 'Kathmandu',
    cities: ['Kathmandu', 'Thamel', 'Asan'],
    gallery: [
      'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1740&q=80',
      'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1740&q=80',
    ],
  },
];

/*
 * Guides that only existed as renamed copies of another guide in the city
 * experience catalogs.  Renaming a spread (`{ ...commonGuides[0], name: 'X' }`)
 * kept Apicha's id, so every one of those cards opened Apicha's profile.  These
 * entries give each guide its own stable id (9000+) and a complete profile.
 */
export const krishnaGuide = makeGuide({
  id: 9001,
  name: 'Krishna',
  image:
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80',
  role: 'Heritage & Night Guide',
  rating: 4.9,
  reviews: 98,
  bio: 'I grew up between Bhaktapur Durbar Square and the pottery squares, and I have spent my life learning the stories behind every temple, courtyard and festival in the city. Walking Bhaktapur after dark, when the crowds have gone and the temples are lit, is my favourite way to share it.',
  languages: ['English', 'Nepali', 'Newari'],
  livesIn: 'Bhaktapur',
  cities: ['Bhaktapur', 'Kathmandu'],
  gallery: [
    'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1740&q=80',
    'https://images.unsplash.com/photo-1605640840605-14ac1855827b?auto=format&fit=crop&w=1740&q=80',
  ],
});

export const radhaGuide = makeGuide({
  id: 9002,
  name: 'Radha',
  image:
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=128&q=80',
  role: 'Artisan & Art Guide',
  rating: 4.9,
  reviews: 45,
  bio: "I am a potter and Thangka painter from Bhaktapur. My family has worked in the city's craft workshops for generations, and I love introducing travellers to the makers behind the art — the wheel, the clay, the pigments and the patience.",
  languages: ['English', 'Nepali', 'Newari'],
  livesIn: 'Bhaktapur',
  cities: ['Bhaktapur', 'Lalitpur'],
  gallery: [
    'https://images.unsplash.com/photo-1554188248-986adbb73be4?auto=format&fit=crop&w=1740&q=80',
    'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=1740&q=80',
  ],
});

export const prakashGuide = makeGuide({
  id: 9003,
  name: 'Prakash',
  image:
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=128&q=80',
  role: 'Bhaktapur Foodie Guide',
  rating: 4.8,
  reviews: 62,
  bio: "Juju dhau, the king of yoghurt, is only the beginning. I take guests through Bhaktapur's lanes for Newari snacks, fresh curd, bara and the sweet shops that locals have trusted for decades.",
  languages: ['English', 'Nepali', 'Newari'],
  livesIn: 'Bhaktapur',
  cities: ['Bhaktapur', 'Kathmandu'],
  gallery: [
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1740&q=80',
    'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?auto=format&fit=crop&w=1740&q=80',
  ],
});

export const laxmiGuide = makeGuide({
  id: 9004,
  name: 'Laxmi',
  image:
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80',
  role: 'Nature & Village Guide',
  rating: 4.9,
  reviews: 37,
  bio: 'I walk the ridge between Bhaktapur and Changu Narayan almost every week. The pine forest, the old village lanes and the views over the valley are my idea of a perfect morning, and I would love to share them with you.',
  languages: ['English', 'Nepali'],
  livesIn: 'Bhaktapur',
  cities: ['Bhaktapur', 'Nagarkot'],
  gallery: [
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1740&q=80',
    'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1740&q=80',
  ],
});

export const ramGuide = makeGuide({
  id: 9005,
  name: 'Ram',
  image:
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=128&q=80',
  role: 'Wildlife Expert',
  rating: 4.9,
  reviews: 76,
  bio: 'I have guided safaris in Chitwan National Park for more than fifteen years. Rhinos, tigers, elephants and the birds of the grassland — I know where to look, when to be quiet, and how to keep both guests and wildlife safe.',
  languages: ['English', 'Nepali', 'Tharu'],
  livesIn: 'Bharatpur',
  cities: ['Bharatpur', 'Chitwan', 'Sauraha'],
  gallery: [
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1740&q=80',
    'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1740&q=80',
  ],
});

export const sitaCulturalGuide = makeGuide({
  id: 9006,
  name: 'Sita',
  image:
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=128&q=80',
  role: 'Tharu Cultural Guide',
  rating: 4.9,
  reviews: 54,
  bio: 'I was born in a Tharu village at the edge of Chitwan. I share our mud houses, stick dance, language and food with travellers who want to understand the people of the Terai, not just its animals.',
  languages: ['English', 'Nepali', 'Tharu'],
  livesIn: 'Bharatpur',
  cities: ['Bharatpur', 'Chitwan', 'Sauraha'],
  gallery: [
    'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?auto=format&fit=crop&w=1740&q=80',
    'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1740&q=80',
  ],
});

export const bishnuGuide = makeGuide({
  id: 9007,
  name: 'Bishnu',
  image:
    'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=128&q=80',
  role: 'River Guide',
  rating: 4.8,
  reviews: 43,
  bio: 'The Rapti and Narayani rivers are my second home. I paddle traditional dugout canoes, read the currents, and find the quiet stretches where crocodiles bask and kingfishers hunt.',
  languages: ['English', 'Nepali'],
  livesIn: 'Bharatpur',
  cities: ['Bharatpur', 'Chitwan'],
  gallery: [
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1740&q=80',
    'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1740&q=80',
  ],
});

export const kumarGuide = makeGuide({
  id: 9008,
  name: 'Kumar',
  image:
    'https://images.unsplash.com/photo-1535713875002-d1d0cf327fde?auto=format&fit=crop&w=128&q=80',
  role: 'Animal Expert',
  rating: 4.8,
  reviews: 58,
  bio: 'I work with the elephant breeding centre and the community forests around Chitwan. My tours focus on animal welfare, conservation and the everyday lives of the mahouts who care for the elephants.',
  languages: ['English', 'Nepali'],
  livesIn: 'Bharatpur',
  cities: ['Bharatpur', 'Chitwan', 'Sauraha'],
  gallery: [
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1740&q=80',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1740&q=80',
  ],
});

export const rameshGuide = makeGuide({
  id: 9009,
  name: 'Ramesh',
  image:
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=128&q=80',
  role: 'Ornithologist',
  rating: 4.9,
  reviews: 41,
  bio: 'I have recorded more than 400 bird species in the Chitwan buffer zone. Bishazari Tal is my favourite place on earth, and I can help you find everything from hornbills to lesser adjutants.',
  languages: ['English', 'Nepali'],
  livesIn: 'Bharatpur',
  cities: ['Bharatpur', 'Chitwan'],
  gallery: [
    'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1740&q=80',
    'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1740&q=80',
  ],
});

export const panditGuide = makeGuide({
  id: 9010,
  name: 'Pandit',
  image:
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=128&q=80',
  role: 'Spiritual Guide',
  rating: 4.9,
  reviews: 33,
  bio: 'Devghat Dham, at the meeting of the Kali Gandaki and Trishuli, is a place of pilgrimage and quiet. I explain its rituals and temples with respect, and make sure every guest feels welcome.',
  languages: ['English', 'Nepali', 'Hindi'],
  livesIn: 'Bharatpur',
  cities: ['Bharatpur', 'Chitwan'],
  gallery: [
    'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1740&q=80',
    'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?auto=format&fit=crop&w=1740&q=80',
  ],
});

export const piyaweeGuide = makeGuide({
  id: 9011,
  name: 'Piyawee',
  image:
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=128&q=80',
  role: 'Buddhist Culture Expert',
  rating: 4.9,
  reviews: 87,
  bio: "I studied Buddhist philosophy in Kathmandu and have spent years walking the valley's monasteries and stupas. I explain the symbols, the rituals and the everyday practice of the monks with patience and humour.",
  languages: ['English', 'Nepali', 'Thai'],
  livesIn: 'Kathmandu',
  cities: ['Kathmandu', 'Lalitpur'],
  gallery: [
    'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1740&q=80',
    'https://images.unsplash.com/photo-1605640840605-14ac1855827b?auto=format&fit=crop&w=1740&q=80',
  ],
});

export const nokGuide = makeGuide({
  id: 9012,
  name: 'Nok',
  image:
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=128&q=80',
  role: 'Nightlife Insider',
  rating: 4.9,
  reviews: 69,
  bio: 'After sunset, Kathmandu changes. I know the rooftop bars, the live folk-music pubs and the tiny kitchens in Thamel that stay open until the last guest leaves — and the drinks and bites that go with them.',
  languages: ['English', 'Nepali'],
  livesIn: 'Kathmandu',
  cities: ['Kathmandu'],
  gallery: [
    'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1740&q=80',
    'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?auto=format&fit=crop&w=1740&q=80',
  ],
});

export const hnoiGuide = makeGuide({
  id: 9013,
  name: 'Hnoi',
  image:
    'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=128&q=80',
  role: 'Nature Lover',
  rating: 4.8,
  reviews: 52,
  bio: 'I escape the city every chance I get, and Nagarkot is where I go. I know the quiet trails, the village tea stops and the viewpoints that are worth the early start — and I bring the picnic.',
  languages: ['English', 'Nepali'],
  livesIn: 'Kathmandu',
  cities: ['Kathmandu', 'Nagarkot', 'Bhaktapur'],
  gallery: [
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1740&q=80',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1740&q=80',
  ],
});

export const natchaGuide = makeGuide({
  id: 9014,
  name: 'Natcha',
  image:
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=128&q=80',
  role: 'History Buff',
  rating: 4.9,
  reviews: 64,
  bio: 'Bhaktapur is a living museum, and I love reading its layers aloud: the Malla kings, the Newari traders, the temples that survived earthquakes and the courtyards where people still live. History here is never only history.',
  languages: ['English', 'Nepali', 'Newari'],
  livesIn: 'Kathmandu',
  cities: ['Kathmandu', 'Bhaktapur'],
  gallery: [
    'https://images.unsplash.com/photo-1605640840605-14ac1855827b?auto=format&fit=crop&w=1740&q=80',
    'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1740&q=80',
  ],
});

export const nakarinGuide = makeGuide({
  id: 9015,
  name: 'Nakarin',
  image:
    'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=128&q=80',
  role: 'Food Explorer',
  rating: 4.9,
  reviews: 73,
  bio: 'I judge a city by its breakfast, its market and its momo. In Kathmandu I have found the best of all three, and I take guests on a food walk that follows the locals rather than the guidebooks.',
  languages: ['English', 'Nepali', 'Thai'],
  livesIn: 'Kathmandu',
  cities: ['Kathmandu', 'Lalitpur'],
  gallery: [
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1740&q=80',
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1740&q=80',
  ],
});

export const agrindraGuide = makeGuide({
  id: 9016,
  name: 'Agrindra',
  image:
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=128&q=80',
  role: 'City Expert Guide',
  rating: 4.8,
  reviews: 96,
  bio: 'I have been guiding in the Kathmandu Valley for over a decade and still find new corners. Durbar Square, Swayambhunath, Patan, the back lanes of Asan — I build a route around what you care about.',
  languages: ['English', 'Nepali', 'Hindi'],
  livesIn: 'Kathmandu',
  cities: ['Kathmandu', 'Lalitpur', 'Bhaktapur'],
  gallery: [
    'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1740&q=80',
    'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1740&q=80',
  ],
});

export const sudaratGuide = makeGuide({
  id: 9017,
  name: 'Sudarat',
  image:
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=128&q=80',
  role: 'Adventure Guide',
  rating: 4.9,
  reviews: 57,
  bio: 'Cable cars, ridge walks and sunrise hikes are my speciality. Chandragiri and the hills around the valley give you the Himalaya without the expedition, and I make the day as active or as easy as you like.',
  languages: ['English', 'Nepali'],
  livesIn: 'Kathmandu',
  cities: ['Kathmandu', 'Chandragiri'],
  gallery: [
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1740&q=80',
    'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1740&q=80',
  ],
});

/**
 * The one public guide catalog.  Cards, profiles, galleries and the chat pages
 * all resolve against this list, so an id here always identifies one person.
 * New experience-only guides are appended so existing ids never shift.
 */
export const allGuides: Guide[] = [
  ...guideCatalog,
  krishnaGuide,
  radhaGuide,
  prakashGuide,
  laxmiGuide,
  ramGuide,
  sitaCulturalGuide,
  bishnuGuide,
  kumarGuide,
  rameshGuide,
  panditGuide,
  piyaweeGuide,
  nokGuide,
  hnoiGuide,
  natchaGuide,
  nakarinGuide,
  agrindraGuide,
  sudaratGuide,
];

export const findGuideById = (id: number): Guide | undefined =>
  allGuides.find((guide) => guide.id === id);

/**
 * Same as {@link findGuideById}, for data files where a missing guide is a
 * programming error and should fail loudly instead of silently borrowing
 * another guide's identity.
 */
export const requireGuideById = (id: number): Guide => {
  const guide = findGuideById(id);
  if (!guide) throw new Error(`Guide ${id} is missing from the guide catalog`);
  return guide;
};
