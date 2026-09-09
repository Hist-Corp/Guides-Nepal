import { allGuides } from './guidesData';
import { RichExperienceData } from './types';

export const pokharaRichData: RichExperienceData[] = [
  {
    id: 101,
    slug: 'pokhara-lakeside-food-tour',
    title: "Pokhara Lakeside Food Tour",
    heroImage: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1740&q=80",
    host: {
      name: "Sujal",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80",
      type: "History & Culture Buff"
    },
    guides: [allGuides[1], allGuides[3]], // Sujal & Rohan
    description: "Discover the culinary delights of Pokhara's Lakeside. From fresh fish from Phewa Lake to traditional Thakali sets, taste the best of the city with a stunning mountain backdrop.",
    tourStructure: {
      steps: [
        { name: "Lakeside", label: "Meet Up" },
        { name: "Fish Stall", label: "Local Delicacy" },
        { name: "Thakali House", label: "Main Course" }
      ]
    },
    exploration: {
      title: "How we explore Pokhara",
      description: "A relaxing walk along the lake combined with delicious food stops.",
      points: [
        "Eating fresh fried fish",
        "Trying the famous Thakali Dal Bhat",
        "Enjoying a sunset drink by the lake"
      ]
    },
    atmosphere: "Chill and scenic. The vibe in Pokhara is much more relaxed than Kathmandu.",
    hiddenGems: "A small family-run pickle shop that makes the best spicy radish pickle.",
    city: "Pokhara",
    price: 45,
    duration: "3 hours",
    type: "Food Tour"
  },
  {
    id: 102,
    slug: 'sarangkot-sunrise-hike',
    title: "Sarangkot Sunrise Hike & Breakfast",
    heroImage: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1740&q=80",
    host: {
      name: "Rohan",
      image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=128&q=80",
      type: "Adventure Enthusiast"
    },
    guides: [allGuides[3], allGuides[2]], // Rohan & Priya
    description: "Watch the sun paint the Annapurna range in gold. A morning hike up to Sarangkot followed by a hearty local breakfast.",
    tourStructure: {
      steps: [
        { name: "Base", label: "Start Hike" },
        { name: "Viewpoint", label: "Sunrise" },
        { name: "Local Home", label: "Breakfast" }
      ]
    },
    exploration: {
      title: "How we explore the hills",
      description: "An early morning adventure to catch the best views in Nepal.",
      points: [
        "Hiking through village trails",
        "Viewing Machhapuchhre (Fishtail) mountain",
        "Drinking tea with a local family"
      ]
    },
    atmosphere: "Active and awe-inspiring. Worth the early wake-up call!",
    hiddenGems: "A trail that avoids the main tourist crowds.",
    city: "Pokhara",
    price: 55,
    duration: "4 hours",
    type: "Nature & Hiking"
  }
];
