import { allGuides } from './guidesData';
import { RichExperienceData } from './types';

// For backward compatibility within this file
export const commonGuides = allGuides;

export const bhaktapurRichData: RichExperienceData[] = [
  {
    id: 1,
    slug: 'bhaktapur-heritage-walk',
    title: "Bhaktapur Heritage Walk",
    heroImage: "https://images.unsplash.com/photo-1516594798947-e65505dbb29d?auto=format&fit=crop&w=400&q=80",
    host: {
      name: "Krishna",
      image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=400&q=80",
      type: "Heritage Expert"
    },
    guides: [
        { ...commonGuides[0], name: "Krishna", role: "Heritage Expert" },
        commonGuides[1],
        commonGuides[2]
    ],
    description: "Step back in time in the 'City of Devotees'. Walk through medieval streets, admire the 55-Window Palace, and discover the Golden Gate.",
    tourStructure: {
      steps: [
        { name: "Durbar Sq.", label: "Royal Palace" },
        { name: "Taumadhi", label: "Nyatapola Temple" },
        { name: "Dattatreya", label: "Oldest Square" }
      ]
    },
    exploration: {
      title: "How we explore the city",
      description: "A leisurely walk through the brick-paved streets of this open-air museum.",
      points: [
        "Marveling at the 55-Window Palace",
        "Entering the Golden Gate",
        "Climbing the steps of Nyatapola Temple",
        "Watching woodcarvers at work"
      ]
    },
    atmosphere: "Timeless and awe-inspiring. The history here is palpable.",
    hiddenGems: "A hidden courtyard where they dry pottery in the sun.",
    city: "Bhaktapur",
    price: 35,
    duration: "3 hours",
    type: "City Highlight",
    rating: 4.9,
    reviews: 245
  },
  {
    id: 2,
    slug: 'pottery-making-class',
    title: "Pottery Making Class",
    heroImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=400&q=80",
    host: {
      name: "Radha",
      image: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=400&q=80",
      type: "Artisan Guide"
    },
    guides: [
        { ...commonGuides[1], name: "Radha", role: "Artisan Guide" },
        commonGuides[2],
        commonGuides[3]
    ],
    description: "Get your hands dirty! Learn the ancient art of pottery in Bhaktapur's famous Pottery Square from a master craftsman.",
    tourStructure: {
      steps: [
        { name: "Square", label: "Observation" },
        { name: "Wheel", label: "Throwing Clay" },
        { name: "Drying", label: "Finishing" }
      ]
    },
    exploration: {
      title: "How we explore the craft",
      description: "A hands-on workshop right in the heart of Pottery Square.",
      points: [
        "Touring the Pottery Square",
        "Learning to spin the traditional wheel",
        "Shaping your own clay pot",
        "Understanding the firing process"
      ]
    },
    atmosphere: "Creative and fun. Don't be afraid to make a mess!",
    hiddenGems: "The family stories of potters who have been here for generations.",
    city: "Bhaktapur",
    price: 30,
    duration: "2 hours",
    type: "Workshop",
    rating: 4.8,
    reviews: 134
  },
  {
    id: 3,
    slug: 'taste-juju-dhau',
    title: "Taste Juju Dhau (King Curd)",
    heroImage: "https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=400&q=80",
    host: {
      name: "Prakash",
      image: "https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=400&q=80",
      type: "Foodie Guide"
    },
    guides: [
        { ...commonGuides[2], name: "Prakash", role: "Foodie Guide" },
        commonGuides[0],
        commonGuides[1]
    ],
    description: "You can't leave Bhaktapur without trying the King of Yogurt. Discover the secrets behind this creamy, delicious dessert.",
    tourStructure: {
      steps: [
        { name: "Shop", label: "Tasting" },
        { name: "Kitchen", label: "Making Process" },
        { name: "Cafe", label: "Relax" }
      ]
    },
    exploration: {
      title: "How we explore the flavor",
      description: "A short and sweet tour focused on Bhaktapur's culinary pride.",
      points: [
        "Visiting the most famous curd shop",
        "Tasting fresh Juju Dhau in clay pots",
        "Learning why it's called 'King Curd'",
        "Pairing it with local snacks"
      ]
    },
    atmosphere: "Delicious and refreshing.",
    hiddenGems: "A small shop that still uses the ancient recipe.",
    city: "Bhaktapur",
    price: 15,
    duration: "1 hour",
    type: "Food Tour",
    rating: 5.0,
    reviews: 320
  },
  {
    id: 4,
    slug: 'changu-narayan-hike',
    title: "Changu Narayan Temple Hike",
    heroImage: "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=400&q=80",
    host: {
      name: "Laxmi",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
      type: "Nature Guide"
    },
    guides: [
        { ...commonGuides[3], name: "Laxmi", role: "Nature Guide" },
        commonGuides[0],
        commonGuides[2]
    ],
    description: "Hike through pine forests and villages to reach the oldest temple in Nepal, Changu Narayan, a UNESCO World Heritage site.",
    tourStructure: {
      steps: [
        { name: "Telkot", label: "Start Hike" },
        { name: "Forest", label: "Nature Walk" },
        { name: "Temple", label: "Changu Narayan" }
      ]
    },
    exploration: {
      title: "How we explore the trail",
      description: "A scenic hike offering views of the valley and the Himalayas.",
      points: [
        "Walking along the ridge from Telkot",
        "Seeing traditional village life",
        "Exploring the ancient stone sculptures",
        "Enjoying a local lunch with a view"
      ]
    },
    atmosphere: "Peaceful and historic. A perfect mix of nature and culture.",
    hiddenGems: "The Changu Narayan Museum, often overlooked by visitors.",
    city: "Bhaktapur",
    price: 40,
    duration: "4 hours",
    type: "Hiking",
    rating: 4.9,
    reviews: 180
  },
  {
    id: 5,
    slug: 'bhaktapur-night-tour',
    title: "Bhaktapur Night Tour",
    heroImage: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=400&q=80",
    host: {
      name: "Krishna",
      image: "https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=400&q=80",
      type: "Night Guide"
    },
    guides: [
        { ...commonGuides[0], name: "Krishna", role: "Night Guide" },
        commonGuides[1],
        commonGuides[3]
    ],
    description: "Experience the magic of Bhaktapur after dark. The temples are beautifully lit, and the streets are quiet and atmospheric.",
    tourStructure: {
      steps: [
        { name: "Sunset", label: "Golden Hour" },
        { name: "Walk", label: "Night Stroll" },
        { name: "Dinner", label: "Local Feast" }
      ]
    },
    exploration: {
      title: "How we explore the night",
      description: "A magical evening walk when the day-trippers have left.",
      points: [
        "Seeing the Nyatapola Temple illuminated",
        "Listening to local evening prayers",
        "Enjoying a quiet dinner in a heritage home",
        "Stargazing from a quiet square"
      ]
    },
    atmosphere: "Romantic and mystical.",
    hiddenGems: "A local group singing traditional devotional songs (Bhajans).",
    city: "Bhaktapur",
    price: 45,
    duration: "3 hours",
    type: "Night Tour",
    rating: 4.8,
    reviews: 95
  },
  {
    id: 6,
    slug: 'thangka-painting-workshop-bhaktapur',
    title: "Thangka Painting Workshop",
    heroImage: "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=400&q=80",
    host: {
      name: "Radha",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
      type: "Art Guide"
    },
    guides: [
        { ...commonGuides[1], name: "Radha", role: "Art Guide" },
        commonGuides[2],
        commonGuides[0]
    ],
    description: "Learn the intricate art of Thangka painting from a master artist. A spiritual and artistic experience.",
    tourStructure: {
      steps: [
        { name: "School", label: "Introduction" },
        { name: "Sketch", label: "Drawing" },
        { name: "Paint", label: "Coloring" }
      ]
    },
    exploration: {
      title: "How we explore the art",
      description: "A meditative session learning Buddhist art.",
      points: [
        "Understanding the history of Thangka",
        "Learning the grid system of drawing",
        "Using natural mineral pigments",
        "Taking home your own artwork"
      ]
    },
    atmosphere: "Calm and focused.",
    hiddenGems: "The artist's personal collection of antique Thangkas.",
    city: "Bhaktapur",
    price: 50,
    duration: "3 hours",
    type: "Workshop",
    rating: 5.0,
    reviews: 70
  }
];
