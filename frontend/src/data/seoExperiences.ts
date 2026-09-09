export interface Review {
  id: number;
  author: string;
  avatar: string;
  date: string;
  rating: number;
  content: string;
}

export interface Guide {
  id: string;
  name: string;
  image: string;
  role: string;
  bio: string;
  languages: string[];
  rating: number;
  reviews: number;
}

export interface SeoExperienceData {
  id: string;
  title: string;
  subtitle: string;
  location: string;
  rating: number;
  reviewsCount: number;
  price: number;
  heroImage: string;
  images: string[];
  secondaryImage?: string;
  mapImage?: string;
  author: {
    name: string;
    role: string;
    image: string;
    email: string;
    responseRate: number;
    responseTime: string;
    languages: string[];
    joined: string;
  };
  guides?: Guide[];
  intro: string;
  description: string;
  locationDescription?: string;
  whatIncluded?: string;
  whatNotIncluded?: string;
  tourStructure: {
    title: string;
    steps: { name: string; label: string }[];
  };
  highlights: {
    title: string;
    description: string;
    items: string[];
  };
  amenities: string[];
  houseRules: string[];
  space?: {
    roomType: string;
    beds: number;
    bathrooms: number;
    propertyType: string;
  };
  safety?: {
    items: string[];
  };
  cancellation?: string;
  reviews: Review[];
  similarListings: { title: string; image: string; price: number; rating: number; location: string }[];
}

export const seoExperiences: Record<string, SeoExperienceData> = {
  'amsterdam-highlights': {
    id: 'amsterdam-highlights',
    title: 'Highlights & Hidden Gems Of Amsterdam',
    subtitle: 'City Highlight Tours',
    location: 'Amsterdam, Netherlands',
    rating: 4.9,
    reviewsCount: 124,
    price: 45,
    heroImage: 'https://images.unsplash.com/photo-1605640840605-14ac1855827b?auto=format&fit=crop&w=400&q=80',
    secondaryImage: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=400&q=80',
    mapImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=400&q=80',
    ],
    author: {
      name: 'Anne Betancourt',
      role: 'Senior Local Guide',
      image: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=400&q=80',
      email: 'anne.b@guides-nepal.com',
      responseRate: 100,
      responseTime: 'within an hour',
      languages: ['English', 'Dutch', 'German'],
      joined: 'May 2018'
    },
    guides: [
      { 
        id: 'anne',
        name: 'Anne', 
        role: 'Main Guide', 
        image: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=400&q=80',
        bio: 'Passionate about Amsterdam history and architecture. I love showing guests the hidden courtyards.',
        languages: ['English', 'Dutch', 'German'],
        rating: 4.98,
        reviews: 124
      },
      { 
        id: 'mark',
        name: 'Mark', 
        role: 'Co-host', 
        image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=400&q=80',
        bio: 'Local foodie and night owl. I know the best spots for bitterballen and craft beer.',
        languages: ['English', 'Dutch'],
        rating: 4.92,
        reviews: 86
      },
      { 
        id: 'sophie',
        name: 'Sophie', 
        role: 'Food Expert', 
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
        bio: 'Culinary arts graduate who loves exploring the multicultural food scene of the city.',
        languages: ['English', 'French', 'Spanish'],
        rating: 4.95,
        reviews: 92
      },
      { 
        id: 'lars',
        name: 'Lars', 
        role: 'History Buff', 
        image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=400&q=80',
        bio: 'Retired history teacher specializing in the Golden Age and WWII history of Amsterdam.',
        languages: ['English', 'German'],
        rating: 5.0,
        reviews: 156
      },
    ],
    intro: "Discover the secret side of Amsterdam that tourists often miss. We'll navigate through narrow alleys, visit hidden courtyards (Hofjes), and taste the best local treats.",
    description: "Located in the heart of Amsterdam, our experience offers a unique perspective on the city. Walking distance to major landmarks but tucked away in a quiet neighborhood. You will explore shared spaces and hidden gems that define the local lifestyle. Please respect the local culture and house rules during our tour. \n\nWe will start our journey in the Jordaan district, exploring its labyrinth of narrow streets and canals. Then, we'll head to the Pijp, a vibrant neighborhood known for its multicultural atmosphere and the famous Albert Cuyp Market. Along the way, I'll share stories about the city's history, architecture, and daily life. You'll get to taste some traditional Dutch snacks, like herring and stroopwafels, and learn about the local food culture.",
    locationDescription: "We will meet in the Jordaan district, near the Anne Frank House. This historic neighborhood is famous for its beautiful canals and narrow streets. From there, we will walk towards the Nine Streets area, a shopping district with many unique boutiques and cafes. We will end the tour in the Pijp, a lively neighborhood with many bars and restaurants. \n\nThe exact meeting point will be sent to you after booking. Please make sure to arrive 15 minutes early.",
    whatIncluded: "The price includes the guide fee, food tasting (3 snacks), and a small souvenir. Transport costs are not included as we will be walking.",
    whatNotIncluded: "Drinks (unless specified), gratuities, and hotel pickup/drop-off are not included.",
    space: {
      roomType: 'Private tour',
      beds: 0,
      bathrooms: 1,
      propertyType: 'Walking Tour'
    },
    tourStructure: {
      title: 'Tour Structure',
      steps: [
        { name: 'Jordaan', label: 'Start Point' },
        { name: 'Canals', label: 'Exploration' },
        { name: 'De Pijp', label: 'Food Stop' }
      ]
    },
    highlights: {
      title: 'Experience Highlights',
      description: 'When walking the streets of Amsterdam, we follow a route designed to show you the authentic lifestyle of the locals.',
      items: [
        "Central location visit",
        "Free local snacks included",
        "Private group experience",
        "Shared cultural stories",
        "Non-smoking walking route"
      ]
    },
    amenities: [
      "Local Guide - Expert knowledge",
      "Food Tasting - 3 local snacks",
      "Drinks Included - Water bottle",
      "Photography - Tips & spots",
      "Entrance Fees - Hidden churches",
      "Transport - Walking tour",
      "Small Group - Max 6 people",
      "Instant Confirmation",
      "Wifi - Portable hotspot",
      "Heating - Indoor stops",
      "First Aid Kit - Guide carries one"
    ],
    houseRules: [
      "No smoking during the tour",
      "No parties or loud events",
      "Respect local residents",
      "Arrive 15 mins before start",
      "Comfortable walking shoes required"
    ],
    safety: {
      items: [
        "Committed to enhanced cleaning process",
        "Social distancing guidelines in place",
        "Guides wear masks when required",
        "Sanitizer provided"
      ]
    },
    cancellation: "Free cancellation for 48 hours. Cancel before 24 hours of the start date for a partial refund.",
    reviews: [
      {
        id: 1,
        author: "Sarah Jenkins",
        avatar: "https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=400&q=80",
        date: "October 2023",
        rating: 5,
        content: "Great location and amazing guide! Anne was very helpful and showed us parts of the city we would never have found on our own. Very clean and organized tour. The hidden courtyards were absolutely magical, and the history Anne shared brought them to life. \n\nWe also stopped at a small local bakery that I would have walked right past. The apple pie there was the best I've ever had! Highly recommend this tour for anyone wanting to see the real Amsterdam."
      },
      {
        id: 2,
        author: "Michael Chen",
        avatar: "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=400&q=80",
        date: "September 2023",
        rating: 5,
        content: "Would stay again! The experience was authentic and the food stops were delicious. Highly recommended. \n\nThe guide was knowledgeable not just about the food, but about the cultural significance of each dish. We tried herring, stroopwafel, and bitterballen. Everything was fresh and tasty. It was a great way to spend an afternoon."
      },
      {
        id: 3,
        author: "Emma Wilson",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
        date: "August 2023",
        rating: 4,
        content: "Very informative. A bit of noise at night in the busy areas, but that's Amsterdam! Host was wonderful. \n\nShe gave us great tips for the rest of our trip, including restaurant recommendations and how to use the public transport system efficiently. The group size was small, which made it feel very personal."
      }
    ],
    similarListings: [
      { title: "7 Biggest Red Light District Myths", image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=400&q=80", price: 30, rating: 4.8, location: "Amsterdam" },
      { title: "7 Ways to Live Like a Local in Amsterdam", image: "https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=400&q=80", price: 25, rating: 4.9, location: "Amsterdam" },
      { title: "Museums and Gems: How to Avoid Crowds", image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=400&q=80", price: 40, rating: 4.7, location: "Amsterdam" }
    ]
  },
  'bangkok-food': {
    id: 'bangkok-food',
    title: 'A Taste Of Bangkok: Street Food Tour',
    subtitle: 'Food Tours',
    location: 'Bangkok, Thailand',
    rating: 4.9,
    reviewsCount: 312,
    price: 45,
    heroImage: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=400&q=80'
    ],
    author: {
      name: 'Somsak',
      role: 'Local Food Expert',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      email: 'somsak@guides-nepal.com',
      responseRate: 98,
      responseTime: 'within a few hours',
      languages: ['English', 'Thai'],
      joined: 'Jan 2019'
    },
    intro: "Bangkok is the street food capital of the world. Join me for a culinary adventure.",
    description: "Explore the vibrant street food scene of Bangkok. We visit hidden stalls and famous vendors.",
    tourStructure: {
      title: 'Food Journey',
      steps: [
        { name: 'Chinatown', label: 'Appetizers' },
        { name: 'Flower Market', label: 'Snacks' },
        { name: 'Old City', label: 'Main Course' }
      ]
    },
    highlights: {
      title: 'What we will taste',
      description: 'Prepare your taste buds for an explosion of flavors.',
      items: [
        "Michelin-recommended Guay Jub",
        "Authentic Pad Thai",
        "Spicy Tom Yum Goong",
        "Mango Sticky Rice",
        "Local ordering tips"
      ]
    },
    amenities: ["Food Included", "Drinks", "Transport", "Guide"],
    houseRules: ["Notify of allergies", "Wear comfortable shoes"],
    reviews: [],
    similarListings: []
  },
  'bangkok-highlights': {
    id: 'bangkok-highlights',
    title: 'Highlights & Hidden Gems Of Bangkok',
    subtitle: 'City Highlight Tours',
    location: 'Bangkok, Thailand',
    rating: 4.8,
    reviewsCount: 540,
    price: 55,
    heroImage: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=400&q=80'
    ],
    author: {
      name: 'Noy',
      role: 'Certified City Guide',
      image: 'https://images.unsplash.com/photo-1605640840605-14ac1855827b?auto=format&fit=crop&w=400&q=80',
      email: 'noy@guides-nepal.com',
      responseRate: 100,
      responseTime: 'within an hour',
      languages: ['English', 'Thai'],
      joined: 'Mar 2020'
    },
    guides: [
      {
        id: 'noy',
        name: 'Noy',
        role: 'History Expert',
        image: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=400&q=80',
        bio: 'Specializing in Royal history and Buddhist philosophy.',
        languages: ['English', 'Thai'],
        rating: 4.85,
        reviews: 320
      },
      {
        id: 'chai',
        name: 'Chai',
        role: 'Local Insider',
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80',
        bio: 'I show you the Bangkok that guidebooks miss - the canals and local communities.',
        languages: ['English', 'Thai'],
        rating: 4.8,
        reviews: 220
      }
    ],
    intro: "Experience the contrast of old and new Bangkok.",
    description: "Marvel at glittering temples and explore quiet canals.",
    tourStructure: {
      title: 'City Route',
      steps: [
        { name: 'Grand Palace', label: 'History' },
        { name: 'Wat Pho', label: 'Culture' },
        { name: 'Canals', label: 'Local Life' }
      ]
    },
    highlights: {
      title: 'Tour Highlights',
      description: 'Beyond the main sights, I will show you the hidden corners.',
      items: [
        "Reclining Buddha",
        "Longtail boat ride",
        "Wat Arun",
        "Amulet market",
        "River lunch"
      ]
    },
    amenities: ["Tickets Included", "Boat Ride", "Lunch", "Guide"],
    houseRules: ["Dress modestly for temples", "No flash photography inside"],
    reviews: [],
    similarListings: []
  }
};
