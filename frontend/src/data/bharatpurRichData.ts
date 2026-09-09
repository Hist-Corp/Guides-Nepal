import { allGuides } from './guidesData';
import { RichExperienceData } from './types';

// For backward compatibility within this file
export const commonGuides = allGuides;

export const bharatpurRichData: RichExperienceData[] = [
  {
    id: 1,
    slug: 'chitwan-jungle-safari',
    title: "Chitwan Jungle Safari",
    heroImage: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=400&q=80",
    host: {
      name: "Ram",
      image: "https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=400&q=80",
      type: "Wildlife Expert"
    },
    guides: [
        { ...commonGuides[0], name: "Ram", role: "Wildlife Expert" },
        commonGuides[3],
        commonGuides[2]
    ],
    description: "Embark on a thrilling jeep safari deep into the heart of Chitwan National Park. Spot one-horned rhinos, royal bengal tigers, and wild elephants.",
    tourStructure: {
      steps: [
        { name: "Entry", label: "Park Gate" },
        { name: "Safari", label: "Jeep Ride" },
        { name: "River", label: "Sunset View" }
      ]
    },
    exploration: {
      title: "How we explore the jungle",
      description: "A 4-hour open jeep drive through the grasslands and sal forests.",
      points: [
        "Tracking rhinos and tigers",
        "Bird watching at Bishazari Tal",
        "Visiting the crocodile breeding center",
        "Sunset over the Rapti River"
      ]
    },
    atmosphere: "Wild and adventurous. Keep your camera ready!",
    hiddenGems: "A quiet spot by the river where deer come to drink at sunset.",
    city: "Bharatpur",
    price: 45,
    duration: "4 hours",
    type: "Wildlife",
    rating: 4.8,
    reviews: 310
  },
  {
    id: 2,
    slug: 'tharu-village-culture-tour',
    title: "Tharu Village Culture Tour",
    heroImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=400&q=80",
    host: {
      name: "Sita",
      image: "https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&w=400&q=80",
      type: "Cultural Guide"
    },
    guides: [
        { ...commonGuides[1], name: "Sita", role: "Cultural Guide" },
        commonGuides[2],
        commonGuides[0]
    ],
    description: "Immerse yourself in the unique culture of the Tharu people. Visit traditional mud houses, see their stick dance, and taste local delicacies.",
    tourStructure: {
      steps: [
        { name: "Village", label: "Walk" },
        { name: "Museum", label: "History" },
        { name: "Dance", label: "Performance" }
      ]
    },
    exploration: {
      title: "How we explore the culture",
      description: "A walk through a living Tharu village near the park.",
      points: [
        "Walking through traditional mud houses",
        "Learning about Tharu history and resistance to malaria",
        "Watching the famous Stick Dance",
        "Tasting Ghonghi (snail curry)"
      ]
    },
    atmosphere: "Warm and welcoming. A true cultural immersion.",
    hiddenGems: "A local grandmother who tells ancient Tharu folktales.",
    city: "Bharatpur",
    price: 25,
    duration: "2 hours",
    type: "Culture",
    rating: 4.7,
    reviews: 150
  },
  {
    id: 3,
    slug: 'canoe-ride-rapti-river',
    title: "Canoe Ride on Rapti River",
    heroImage: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=400&q=80",
    host: {
      name: "Bishnu",
      image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=400&q=80",
      type: "River Guide"
    },
    guides: [
        { ...commonGuides[3], name: "Bishnu", role: "River Guide" },
        commonGuides[0],
        commonGuides[1]
    ],
    description: "Drift silently down the Rapti River in a traditional dugout canoe. It's the best way to see crocodiles basking on the banks and water birds.",
    tourStructure: {
      steps: [
        { name: "Bank", label: "Boarding" },
        { name: "River", label: "Floating" },
        { name: "Jungle", label: "Walk Back" }
      ]
    },
    exploration: {
      title: "How we explore the river",
      description: "A peaceful 45-minute ride followed by a short jungle walk.",
      points: [
        "Spotting Marsh Mugger and Gharial crocodiles",
        "Watching Kingfishers and Egrets",
        "Experiencing the silence of the river",
        "Short nature walk back to the village"
      ]
    },
    atmosphere: "Serene and slightly thrilling (because of the crocs!).",
    hiddenGems: "A secret spot where elephants often cross the river.",
    city: "Bharatpur",
    price: 20,
    duration: "1.5 hours",
    type: "Nature",
    rating: 4.9,
    reviews: 200
  },
  {
    id: 4,
    slug: 'elephant-breeding-center',
    title: "Elephant Breeding Center Visit",
    heroImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    host: {
      name: "Kumar",
      image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&q=80",
      type: "Animal Expert"
    },
    guides: [
        { ...commonGuides[2], name: "Kumar", role: "Animal Expert" },
        commonGuides[3],
        commonGuides[0]
    ],
    description: "Visit one of the few elephant breeding centers in the world. See baby elephants playing with their mothers and learn about conservation efforts.",
    tourStructure: {
      steps: [
        { name: "Center", label: "Visit" },
        { name: "Museum", label: "Education" },
        { name: "Feeding", label: "Observation" }
      ]
    },
    exploration: {
      title: "How we explore the center",
      description: "An educational visit to learn about Asian Elephants.",
      points: [
        "Seeing adorable baby elephants",
        "Learning about elephant behavior",
        "Understanding the challenges of conservation",
        "Visiting the small museum on site"
      ]
    },
    atmosphere: "Cute and educational. Great for families.",
    hiddenGems: "Arrive early to see the elephants being bathed.",
    city: "Bharatpur",
    price: 15,
    duration: "1 hour",
    type: "Wildlife",
    rating: 4.6,
    reviews: 180
  },
  {
    id: 5,
    slug: 'bishazari-tal-bird-watching',
    title: "20,000 Lake Bird Watching",
    heroImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    host: {
      name: "Ramesh",
      image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=400&q=80",
      type: "Ornithologist"
    },
    guides: [
        { ...commonGuides[0], name: "Ramesh", role: "Ornithologist" },
        commonGuides[1],
        commonGuides[2]
    ],
    description: "Visit Bishazari Tal (20,000 Lake), a Ramsar site in the buffer zone. A paradise for bird watchers and nature lovers.",
    tourStructure: {
      steps: [
        { name: "Lake", label: "Arrival" },
        { name: "Walk", label: "Birding" },
        { name: "Tower", label: "View" }
      ]
    },
    exploration: {
      title: "How we explore the wetlands",
      description: "A quiet morning walk around the oxbow lakes.",
      points: [
        "Spotting migratory birds",
        "Looking for rhinos cooling in the water",
        "Enjoying the reflection of the forest in the lake",
        "Climbing the watchtower for a better view"
      ]
    },
    atmosphere: "Quiet and peaceful. Nature at its best.",
    hiddenGems: "A hidden trail where you can see peacocks dancing.",
    city: "Bharatpur",
    price: 35,
    duration: "3 hours",
    type: "Nature",
    rating: 4.8,
    reviews: 90
  },
  {
    id: 6,
    slug: 'devghat-spiritual-tour',
    title: "Devghat Spiritual Tour",
    heroImage: "https://images.unsplash.com/photo-1605640840605-14ac1855827b?auto=format&fit=crop&w=400&q=80",
    host: {
      name: "Pandit",
      image: "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=400&q=80",
      type: "Spiritual Guide"
    },
    guides: [
        { ...commonGuides[3], name: "Pandit", role: "Spiritual Guide" },
        commonGuides[0],
        commonGuides[1]
    ],
    description: "Visit Devghat Dham, the holiest place in Chitwan at the confluence of the Kaligandaki and Trishuli rivers. A place of meditation and elderly care.",
    tourStructure: {
      steps: [
        { name: "Bridge", label: "Crossing" },
        { name: "Temple", label: "Worship" },
        { name: "Ashram", label: "Visit" }
      ]
    },
    exploration: {
      title: "How we explore the dham",
      description: "A spiritual journey to the confluence of holy rivers.",
      points: [
        "Crossing the suspension bridge",
        "Visiting the elderly care homes (Ashrams)",
        "Dipping in the holy confluence",
        "Listening to Sanskrit chants"
      ]
    },
    atmosphere: "Spiritual and humbling.",
    hiddenGems: "The caves where sages used to meditate.",
    city: "Bharatpur",
    price: 30,
    duration: "3 hours",
    type: "Spiritual",
    rating: 4.7,
    reviews: 60
  }
];
