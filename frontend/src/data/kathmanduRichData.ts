import { allGuides } from './guidesData';
import { RichExperienceData } from './types';

// Re-export types for backward compatibility
export type { Guide } from './types';
export type { RichExperienceData } from './types';

// For backward compatibility within this file
export const commonGuides = allGuides;

export const kathmanduRichData: RichExperienceData[] = [
  {
    id: 1,
    slug: '10-tastings-kathmandu-street-food',
    title: "The 10 Tastings of Kathmandu: Street Food",
    heroImage: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80",
    host: {
      name: "Apicha",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=128&h=128&q=80",
      type: "Foodie & Local Expert"
    },
    guides: [commonGuides[0], commonGuides[1], commonGuides[2]],
    description: "Ready to taste the best food in Kathmandu? Satisfy your cravings for local food and culture with highlights along the way, together with a foodie host. Enjoy 10 delicious and typical tastings that range from sweet to savory as well as drinks on a tasty food tour in Kathmandu.",
    tourStructure: {
      steps: [
        { name: "Thamel", label: "Start Point" },
        { name: "Asan Tole", label: "Market Tastings" },
        { name: "Durbar Sq.", label: "Cultural Bites" }
      ]
    },
    exploration: {
      title: "How we explore the city",
      description: "We'll navigate the bustling streets of Kathmandu, diving into local markets and hidden alleys to find the most authentic flavors. This isn't just about food; it's about the culture behind it.",
      points: [
        "Trying the famous Buffalo Momo at a local favorite spot",
        "Sipping authentic Masala Tea in a hidden courtyard",
        "Tasting Sel Roti (sweet rice bread) fresh from the pan",
        "Exploring the spice markets of Asan",
        "Learning about Newari culinary traditions"
      ]
    },
    atmosphere: "We keep it casual and fun! Think of it as a walking dinner party with a friend who knows exactly where to go.",
    hiddenGems: "Between bites, we'll slip into quiet courtyards and visit small shrines that most tourists walk right past.",
    city: "Kathmandu",
    price: 45,
    duration: "3 hours",
    type: "Food Tour",
    rating: 4.9,
    reviews: 124
  },
  {
    id: 2,
    slug: 'taste-of-kathmandu-street-food',
    title: "A Taste of Kathmandu: Street Food Tour",
    heroImage: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80",
    host: {
      name: "Jojo",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=128&h=128&q=80",
      type: "Culinary Guide"
    },
    guides: [
        { ...commonGuides[1], name: "Jojo", role: "Culinary Guide" }, // Customized for this tour
        commonGuides[0],
        commonGuides[3]
    ],
    description: "Want to get a real local taste of Kathmandu? Give it a taste and find out on this street food private tour in Kathmandu! Join a local host expert in food and culture on a tour that will satisfy your cultural cravings.",
    tourStructure: {
      steps: [
        { name: "Freak St.", label: "Meeting Point" },
        { name: "Local Eatery", label: "Main Tasting" },
        { name: "Sweet Shop", label: "Dessert" }
      ]
    },
    exploration: {
      title: "How we explore the city",
      description: "A focused culinary journey through the heart of the city, targeting the absolute must-try dishes.",
      points: [
        "Sampling the best Laphing in town",
        "Visiting a traditional sweet shop",
        "Trying local chatpate",
        "Walking through historic bazaars"
      ]
    },
    atmosphere: "Friendly and educational. Ask anything about the ingredients and cooking methods!",
    hiddenGems: "We'll show you a rooftop view of the market that only locals know about.",
    city: "Kathmandu",
    price: 35,
    duration: "2.5 hours",
    type: "Food Tour"
  },
  {
    id: 3,
    slug: 'highlights-hidden-gems-kathmandu',
    title: "Highlights & Hidden Gems of Kathmandu",
    heroImage: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80",
    host: {
      name: "Artty",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=128&h=128&q=80",
      type: "Storyteller"
    },
    guides: [
        { ...commonGuides[1], name: "Artty", role: "Storyteller" },
        commonGuides[3],
        commonGuides[2]
    ],
    description: "Want to see the best of Kathmandu? We got you covered. But as you can expect from a Guides Nepal experience, the real excitement is its hidden gems. Join your favorite local and get a feeling of the city's real vibe.",
    tourStructure: {
      steps: [
        { name: "Garden of Dreams", label: "Start" },
        { name: "Old City", label: "Hidden Alleys" },
        { name: "Durbar Square", label: "Grand Finale" }
      ]
    },
    exploration: {
      title: "How we explore the city",
      description: "We mix the big sights with the secret spots. You'll see the famous temples, but also the quiet corners where daily life happens.",
      points: [
        "Visiting the Living Goddess's residence",
        "Finding secret stupas inside residential courtyards",
        "Walking the ancient trade routes",
        "Seeing traditional woodcarvers at work"
      ]
    },
    atmosphere: "Relaxed and full of stories. It's like walking with an old friend who wants to show you their neighborhood.",
    hiddenGems: "Discover a 500-year-old monastery hidden behind a modern shop front.",
    city: "Kathmandu",
    price: 40,
    duration: "3 hours",
    type: "City Highlight"
  },
  {
    id: 4,
    slug: 'treasures-of-kathmandu-buddhism',
    title: "Treasures of Kathmandu: Buddhism and Monks Tour",
    heroImage: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80",
    host: {
      name: "Piyawee",
      image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=128&h=128&q=80",
      type: "Culture Expert"
    },
    guides: [
        { ...commonGuides[2], name: "Piyawee", role: "Culture Expert" },
        commonGuides[1],
        commonGuides[0]
    ],
    description: "You've probably heard that Kathmandu is well-known for Buddhism and its monks, but do you know the stories and origin behind it? On this private city tour, you are in for a cultural treat!",
    tourStructure: {
      steps: [
        { name: "Boudhanath", label: "The Great Stupa" },
        { name: "Monastery", label: "Monk Life" },
        { name: "Kopan", label: "Meditation View" }
      ]
    },
    exploration: {
      title: "How we explore the city",
      description: "A spiritual journey through the Buddhist heritage of the valley. Respectful, insightful, and peaceful.",
      points: [
        "Circumambulating Boudhanath Stupa with pilgrims",
        "Visiting a painting school for Thangkas",
        "Lighting butter lamps",
        "Meeting a local monk (if available)"
      ]
    },
    atmosphere: "Serene and respectful. We take our time to absorb the spiritual atmosphere.",
    hiddenGems: "A small meditation cave used by ancient masters.",
    city: "Kathmandu",
    price: 50,
    duration: "4 hours",
    type: "Cultural Tour"
  },
  {
    id: 5,
    slug: 'drinks-bites-kathmandu',
    title: "Drinks & Bites in Kathmandu Tour",
    heroImage: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80",
    host: {
      name: "Nok",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=128&h=128&q=80",
      type: "Nightlife Insider"
    },
    guides: [
        { ...commonGuides[3], name: "Nok", role: "Nightlife Insider" },
        commonGuides[0],
        commonGuides[2]
    ],
    description: "Picture this, a night out in Kathmandu hopping from hot spot to hot spot, discovering local nightlife while tasting typical local drinks perfectly paired with delicious local bites.",
    tourStructure: {
      steps: [
        { name: "Thamel", label: "Night Market" },
        { name: "Local Pub", label: "Live Music" },
        { name: "Rooftop", label: "City Views" }
      ]
    },
    exploration: {
      title: "How we explore the city",
      description: "We hit the streets when the sun goes down to see a different side of Kathmandu.",
      points: [
        "Tasting local rice wine (Raksi)",
        "Trying spicy buffalo wings (Choila)",
        "Listening to a live folk band",
        "Visiting a trendy local bar"
      ]
    },
    atmosphere: "Energetic and fun! Get ready to mingle and enjoy the music.",
    hiddenGems: "A speakeasy-style bar that serves the best cocktails with local ingredients.",
    city: "Kathmandu",
    price: 60,
    duration: "3 hours",
    type: "Nightlife"
  },
  {
    id: 6,
    slug: 'nagarkot-day-trip',
    title: "City Escape: Nagarkot Day Trip",
    heroImage: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80",
    host: {
      name: "Chef Hnoi",
      image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=128&h=128&q=80",
      type: "Nature Lover"
    },
    guides: [
        { ...commonGuides[3], name: "Hnoi", role: "Nature Lover" },
        commonGuides[1],
        commonGuides[0]
    ],
    description: "Imagine this: a scenic road trip from Kathmandu to explore Nagarkot with stops along the way to discover viewpoints, villages, incredible nature, and cultural gems.",
    tourStructure: {
      steps: [
        { name: "Drive", label: "Scenic Route" },
        { name: "Nagarkot", label: "Mountain Views" },
        { name: "Village", label: "Local Lunch" }
      ]
    },
    exploration: {
      title: "How we explore the region",
      description: "We leave the dusty city behind and head into the fresh mountain air.",
      points: [
        "Viewing the Himalayan range (weather permitting)",
        "Short hike through pine forests",
        "Visiting a traditional Tamang village",
        "Enjoying a farm-to-table lunch"
      ]
    },
    atmosphere: "Refreshing and peaceful. A perfect break from the city chaos.",
    hiddenGems: "A secret viewpoint away from the main hotel strip.",
    city: "Kathmandu",
    price: 80,
    duration: "6 hours",
    type: "Day Trip"
  },
  {
    id: 7,
    slug: 'bhaktapur-day-trip',
    title: "The Ultimate Ancient City of Bhaktapur Day Trip",
    heroImage: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80",
    host: {
      name: "Natcha",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=128&h=128&q=80",
      type: "History Buff"
    },
    guides: [
        { ...commonGuides[1], name: "Natcha", role: "History Buff" },
        commonGuides[2],
        commonGuides[3]
    ],
    description: "Embark on a Ancient city of Bhaktapur day trip outside of Kathmandu where many treasures, insights, and stories are waiting. Let a local host show you around.",
    tourStructure: {
      steps: [
        { name: "Durbar Sq.", label: "Golden Gate" },
        { name: "Pottery Sq.", label: "Crafts" },
        { name: "Nyatapola", label: "Temple View" }
      ]
    },
    exploration: {
      title: "How we explore the city",
      description: "Bhaktapur is a living museum. We walk its brick-paved streets to travel back in time.",
      points: [
        "Trying the famous Juju Dhau (King Curd)",
        "Watching potters spin clay wheels",
        "Admiring the Peacock Window",
        "Visiting the 55 Window Palace"
      ]
    },
    atmosphere: "Timeless and artistic. You'll feel the history in every brick.",
    hiddenGems: "A workshop where they make traditional paper masks.",
    city: "Kathmandu",
    price: 55,
    duration: "4 hours",
    type: "Day Trip"
  },
  {
    id: 8,
    slug: 'culinary-kickstart-kathmandu',
    title: "Culinary Kickstart Tour: Kathmandu",
    heroImage: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80",
    host: {
      name: "Nakarin",
      image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=128&h=128&q=80",
      type: "Food Explorer"
    },
    guides: [
        { ...commonGuides[0], name: "Nakarin", role: "Food Explorer" },
        commonGuides[2],
        commonGuides[1]
    ],
    description: "The way to a city's heart it's through its food! And on this private food tour, you'll get to know Kathmandu through its cuisine and the tastings favorite of the locals.",
    tourStructure: {
      steps: [
        { name: "Market", label: "Ingredients" },
        { name: "Street Stall", label: "Quick Bite" },
        { name: "Cafe", label: "Coffee/Tea" }
      ]
    },
    exploration: {
      title: "How we explore the city",
      description: "A quick but comprehensive intro to Nepali flavors.",
      points: [
        "Learning the difference between Momo and Dumplings",
        "Tasting local donuts",
        "Drinking lassi",
        "Visiting a spice shop"
      ]
    },
    atmosphere: "Fast-paced and tasty. Perfect for your first day in the city.",
    hiddenGems: "The best Lassi shop in town, hidden near Indra Chowk.",
    city: "Kathmandu",
    price: 30,
    duration: "2 hours",
    type: "Food Tour"
  },
  {
    id: 9,
    slug: 'full-coverage-kathmandu',
    title: "Full Coverage Kathmandu City Tour",
    heroImage: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80",
    host: {
      name: "Agrindra",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=128&h=128&q=80",
      type: "Expert Guide"
    },
    guides: [
        { ...commonGuides[1], name: "Agrindra", role: "Expert Guide" },
        commonGuides[3],
        commonGuides[0]
    ],
    description: "Ready for a jam-packed tour, full of history, culture, stories, and sights? Checkmark from your travel bucket list all your must-sees of Kathmandu.",
    tourStructure: {
      steps: [
        { name: "Swayambhu", label: "Morning" },
        { name: "Patan", label: "Afternoon" },
        { name: "Pashupati", label: "Evening" }
      ]
    },
    exploration: {
      title: "How we explore the city",
      description: "We cover the big 3 UNESCO sites in one day. It's intense but rewarding.",
      points: [
        "Climbing the Monkey Temple stairs",
        "Walking the ghats of Pashupatinath",
        "Exploring the arts of Patan",
        "Private car transport included"
      ]
    },
    atmosphere: "Comprehensive and informative. You'll become a Kathmandu expert.",
    hiddenGems: "A quiet spot by the Bagmati river away from the crowds.",
    city: "Kathmandu",
    price: 90,
    duration: "7 hours",
    type: "City Highlight"
  },
  {
    id: 10,
    slug: 'chandragiri-hills-day-trip',
    title: "Chandragiri Hills & Cable Car Day Trip",
    heroImage: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80",
    host: {
      name: "Sudarat",
      image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=128&h=128&q=80",
      type: "Adventure Guide"
    },
    guides: [
        { ...commonGuides[3], name: "Sudarat", role: "Adventure Guide" },
        commonGuides[1],
        commonGuides[2]
    ],
    description: "Embark on a Chandragiri Hills day trip outside of Kathmandu. Ride the cable car for panoramic views of the Himalayas.",
    tourStructure: {
      steps: [
        { name: "Base", label: "Arrival" },
        { name: "Cable Car", label: "The Ride" },
        { name: "Top", label: "The View" }
      ]
    },
    exploration: {
      title: "How we explore the area",
      description: "A vertical journey from the valley floor to the mountain top.",
      points: [
        "Riding the steep cable car",
        "Visiting the Bhaleshwor Mahadev temple",
        "Viewing Everest (on a clear day)",
        "Nature walk on the ridge"
      ]
    },
    atmosphere: "Exciting and scenic. Bring your camera!",
    hiddenGems: "A playground for kids that has the best view in the world.",
    city: "Kathmandu",
    price: 65,
    duration: "5 hours",
    type: "Day Trip"
  }
];
