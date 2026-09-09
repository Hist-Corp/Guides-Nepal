import { allGuides } from './guidesData';
import { RichExperienceData } from './types';

export const lalitpurRichData: RichExperienceData[] = [
  {
    id: 201,
    slug: 'patans-hidden-courtyards',
    title: "Patan's Hidden Courtyards & Arts",
    heroImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Nepal_Patan_Durbar_Square_10_%28full_res%29.jpg/960px-Nepal_Patan_Durbar_Square_10_%28full_res%29.jpg",
    host: {
      name: "Sujal",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
      type: "History & Culture Buff"
    },
    guides: [allGuides[1], allGuides[0]], // Sujal & Apicha
    description: "Explore the City of Fine Arts. Lalitpur (Patan) is famous for its intricate metal and stone work. We'll visit workshops and hidden Buddhist courtyards.",
    tourStructure: {
      steps: [
        { name: "Patan Gate", label: "Welcome" },
        { name: "Golden Temple", label: "History" },
        { name: "Workshops", label: "Artisans" }
      ]
    },
    exploration: {
      title: "How we explore Lalitpur",
      description: "Walking through the narrow alleys where the sound of hammers on metal rings out.",
      points: [
        "Visiting the Golden Temple (Hiranya Varna Mahavihar)",
        "Watching a singing bowl demonstration",
        "Exploring traditional Newari architecture"
      ]
    },
    atmosphere: "Artistic and spiritual. A deep dive into Nepal's craftsmanship.",
    hiddenGems: "A small courtyard where they still make statues using the lost-wax technique.",
    city: "Lalitpur",
    price: 45,
    duration: "3 hours",
    type: "Art & Culture"
  },
  {
    id: 202,
    slug: 'authentic-newari-feast-lalitpur',
    title: "Authentic Newari Feast in Lalitpur",
    heroImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Momo_nepal.jpg/960px-Momo_nepal.jpg",
    host: {
      name: "Apicha",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
      type: "Foodie & Local Expert"
    },
    guides: [allGuides[0], allGuides[3]], // Apicha & Rohan
    description: "Experience the rich flavors of Newari cuisine in its heartland. From Samay Baji to Yomari, taste it all.",
    tourStructure: {
      steps: [
        { name: "Mangal Bazar", label: "Appetizers" },
        { name: "Heritage Home", label: "Main Feast" },
        { name: "Dessert Spot", label: "Sweet End" }
      ]
    },
    exploration: {
      title: "How we eat in Lalitpur",
      description: "A culinary journey through the traditional tastes of the Kathmandu Valley's indigenous people.",
      points: [
        "Eating a full Samay Baji set",
        "Trying local rice beer (Thwon)",
        "Learning how to eat with your hands (optional!)"
      ]
    },
    atmosphere: "Warm and filling. Come with an empty stomach!",
    hiddenGems: "A hole-in-the-wall place that serves the best Bara (lentil pancakes).",
    city: "Lalitpur",
    price: 50,
    duration: "3.5 hours",
    type: "Food Tour"
  }
];
