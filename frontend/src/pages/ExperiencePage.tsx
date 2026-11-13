import React, { useState, useEffect, useMemo } from 'react';
import { StickyBarPortal } from '../components/common/StickyBarPortal';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { Button } from '../components/common/Button';
import {
  Star,
  Clock,
  User,
  ShieldCheck,
  MapPin,
  CheckCircle,
  ArrowLeft,
  Bookmark,
} from 'lucide-react';
import { useBookingStore } from '../store/bookingStore';
import { BookingLoginPrompt } from '../components/common/BookingLoginPrompt';
import { useAuthStore } from '../store/authStore';
import { useProfileStore } from '../store/profileStore';
import guidesApi from '../services/guidesApi';
import { isOwnGuide, useViewerGuideId } from '../utils/guides';
import { guideContactPath } from '../utils/guideUrl';
import { guideDashboardApi } from '../services/guideDashboardApi';
import { useCurrency } from '../contexts/CurrencyContext';
import { getApiUrl } from '../config/api';
import { ReviewCard } from '../components/common/ReviewCard';
import { ReviewForm } from '../components/common/ReviewForm';
import { BookingCalendar } from '../components/common/BookingCalendar';
import { GuestPicker } from '../components/common/GuestPicker';
import { MobileBookingSheet, SheetGuide } from '../components/common/MobileBookingSheet';
import { NEPAL_IMAGES } from '../data/images';
import { trekRouteContent, type TrekRouteContent } from '../data/trekRoutesData';
import { culturalTours } from './CulturalToursPage';
import { outdoorActivities } from './OutdoorActivitiesPage';
import { trekRoutes } from './TrekHikingPage';
import { goBack } from '@/utils/backNavigation';

interface Host {
  name: string;
  image: string;
  rating: number;
  reviews: number;
  about: string;
}

/** Guide approved by a Regional Head for this experience. */
interface AssignedGuide {
  id: number;
  // Public profile slug, so "View profile" links to the canonical guide URL.
  slug?: string | null;
  name: string;
  image: string;
  role?: string;
  rating: number;
  reviews: number;
  // The guide's own per-person price for this experience, when they were
  // approved with a quote. Falls back to the experience price.
  price?: number | null;
  slots?: number | null;
}

interface Experience {
  id: number;
  title: string;
  city: string;
  rating: number;
  reviews: number;
  price: number;
  duration: string;
  images: string[];
  description: string;
  highlights: string[];
  host: Host;
  // Approved guides, only returned by the backend catalog.
  guides?: AssignedGuide[];
  // Live capacity of a published guide listing (undefined elsewhere).
  maxGuests?: number;
  availableSlots?: number;
  // Trek route extras — only set for the /trek-hiking catalog.
  tagline?: string;
  itinerary?: TrekRouteContent['itinerary'];
  includes?: string[];
  meetingPoint?: string;
  bestSeason?: string;
  grade?: string;
  maxAltitude?: string;
  region?: string;
}

interface Review {
  id: number;
  user_name: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
}

// Extended mock data for experiences
const experiencesData: Record<string, Experience> = {
  // Kathmandu
  '101': {
    id: 101,
    title: 'Hidden Gems of Kathmandu',
    city: 'Kathmandu',
    rating: 4.9,
    reviews: 124,
    price: 25,
    duration: '3 hours',
    images: [
      'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
      'https://images.unsplash.com/photo-1545126178-862cdb469409?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    ],
    description:
      "Discover the secret side of Kathmandu that tourists often miss. We'll navigate through narrow alleys, visit hidden stupas in private courtyards, and taste the best local tea. This tour is perfect for those who want to see the authentic daily life of the city.",
    highlights: [
      'Visit 3 hidden temples not on the tourist map',
      'Try authentic local snacks and tea',
      'Learn about Newari architecture and history',
      'Explore the oldest markets in the city',
    ],
    host: {
      name: 'Rajesh',
      image:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=80&h=80&q=80',
      rating: 5.0,
      reviews: 45,
      about:
        "Namaste! I'm Rajesh, born and raised in the heart of Kathmandu. I love sharing stories about my city's history and culture that you won't find in guidebooks.",
    },
  },
  '102': {
    id: 102,
    title: 'Authentic Newari Food Tour',
    city: 'Kathmandu',
    rating: 5.0,
    reviews: 89,
    price: 35,
    duration: '4 hours',
    images: [
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
      'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    ],
    description:
      'Embark on a culinary journey through the flavors of the Newari people. We will visit local eateries and try dishes like Bara, Chatamari, and the famous Yomari.',
    highlights: [
      'Taste 5 different Newari dishes',
      'Visit a traditional kitchen',
      'Learn about spices used in Nepali cooking',
    ],
    host: {
      name: 'Sita',
      image:
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=80&h=80&q=80',
      rating: 4.9,
      reviews: 32,
      about:
        'I am a food enthusiast and love cooking traditional meals for my family. Join me to explore the delicious side of Kathmandu!',
    },
  },
  '103': {
    id: 103,
    title: 'Spiritual Morning at Swayambhunath',
    city: 'Kathmandu',
    rating: 4.8,
    reviews: 210,
    price: 20,
    duration: '2.5 hours',
    images: [
      'https://images.unsplash.com/photo-1516466723877-e4ec1d736c8a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
      'https://images.unsplash.com/photo-1516280440614-37939bbacd81?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    ],
    description:
      'Start your day with peace and spirituality at the Monkey Temple. Watch the sunrise over the valley and observe the morning rituals of the monks and locals.',
    highlights: [
      'Sunrise view of Kathmandu Valley',
      'Observe morning Buddhist rituals',
      'Feed the monkeys (carefully!)',
    ],
    host: {
      name: 'Nima',
      image:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=80&h=80&q=80',
      rating: 4.9,
      reviews: 67,
      about:
        "I grew up in a Buddhist family and Swayambhunath has always been a special place for me. I'd love to share its spiritual significance with you.",
    },
  },
  // Pokhara
  '201': {
    id: 201,
    title: 'Sunrise at Sarangkot',
    city: 'Pokhara',
    rating: 4.9,
    reviews: 312,
    price: 30,
    duration: '3 hours',
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    ],
    description:
      'Witness the majestic Annapurna range light up with the first rays of the sun. A short drive and hike will take us to the best viewpoint in Pokhara.',
    highlights: [
      'Breathtaking sunrise views',
      'See Mt. Machhapuchhre up close',
      'Morning tea with a view',
    ],
    host: {
      name: 'Karma',
      image:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=80&h=80&q=80',
      rating: 5.0,
      reviews: 55,
      about:
        'The mountains are my home. I love showing visitors the beauty of the Himalayas from the best vantage points.',
    },
  },
  '202': {
    id: 202,
    title: 'Phewa Lake Boat Ride & Hike',
    city: 'Pokhara',
    rating: 4.8,
    reviews: 156,
    price: 40,
    duration: '4 hours',
    images: [
      'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
      'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    ],
    description:
      'Row across the serene Phewa Lake and hike up to the World Peace Pagoda. Enjoy panoramic views of the lake and the city below.',
    highlights: [
      'Traditional boat ride',
      'Hike through lush forest',
      'Visit the World Peace Pagoda',
    ],
    host: {
      name: 'Anjali',
      image:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=80&h=80&q=80',
      rating: 4.9,
      reviews: 42,
      about:
        'I am a nature lover and hiking enthusiast. This trail is my favorite way to disconnect and enjoy nature.',
    },
  },
  // Lalitpur
  '301': {
    id: 301,
    title: 'Patan Durbar Square Walk',
    city: 'Lalitpur',
    rating: 4.9,
    reviews: 180,
    price: 28,
    duration: '2.5 hours',
    images: [
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
      'https://images.unsplash.com/photo-1426604966848-d7adac402bff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    ],
    description:
      'Explore the architectural marvels of Patan Durbar Square. Visit the museum, the Krishna Mandir, and learn about the history of the Malla kings.',
    highlights: [
      'Visit the Patan Museum',
      'Admire the Krishna Mandir',
      'Explore hidden courtyards',
    ],
    host: {
      name: 'Suresh',
      image:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=80&h=80&q=80',
      rating: 4.9,
      reviews: 76,
      about:
        'History and art are my passions. I can tell you stories about every stone and statue in this square.',
    },
  },
  // Bhaktapur
  '401': {
    id: 401,
    title: 'Bhaktapur Heritage Walk',
    city: 'Bhaktapur',
    rating: 4.9,
    reviews: 245,
    price: 35,
    duration: '3.5 hours',
    images: [
      'https://images.unsplash.com/photo-1465101162946-4377e57745c3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    ],
    description:
      'Walk through the living museum of Bhaktapur. See the 55-Window Palace, the Nyatapola Temple, and witness pottery making in the streets.',
    highlights: [
      'Visit the tallest temple in Nepal',
      'See the 55-Window Palace',
      'Watch potters at work',
    ],
    host: {
      name: 'Krishna',
      image:
        'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=80&h=80&q=80',
      rating: 5.0,
      reviews: 98,
      about:
        "Bhaktapur is not just a city, it's a lifestyle. I want to show you the traditions that have been kept alive for centuries.",
    },
  },
  // Night tours
  'kathmandu-thamel-night-walk': {
    id: 701,
    title: 'Kathmandu Thamel Night Walk',
    city: 'Kathmandu',
    rating: 4.9,
    reviews: 342,
    price: 28,
    duration: '2 hours',
    images: [
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
      'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    ],
    description:
      "Experience Kathmandu after dark on a lantern-lit walk through Thamel's lively streets, hidden courtyards, and night food stalls. Your local guide shares stories you won't find in guidebooks and takes you to the best evening spots.",
    highlights: [
      'Lantern-lit Thamel street walk',
      'Hidden courtyards and local shrines',
      'Taste night market snacks and tea',
      'Stories of Kathmandu nightlife and culture',
    ],
    host: {
      name: 'Lhakpa',
      image:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=80&h=80&q=80',
      rating: 4.9,
      reviews: 214,
      about:
        "I'm Lhakpa, a Kathmandu local who loves showing travelers the evening side of my city. Join me for lantern-lit alleys, night bites, and real stories after sunset.",
    },
  },
  'bhaktapur-lantern-evening-tour': {
    id: 702,
    title: 'Bhaktapur Lantern Evening Tour',
    city: 'Bhaktapur',
    rating: 4.8,
    reviews: 219,
    price: 32,
    duration: '2.5 hours',
    images: [
      'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
      'https://images.unsplash.com/photo-1465101162946-4377e57745c3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    ],
    description:
      "Explore Bhaktapur's ancient squares, temples, and pottery lanes under lantern light. A peaceful heritage tour with a local guide who brings the nighttime city to life.",
    highlights: [
      'Ancient temples under lantern light',
      'Pottery squares after dark',
      'Quiet heritage lanes away from crowds',
      'Local evening stories and rituals',
    ],
    host: {
      name: 'Tashi',
      image:
        'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=80&h=80&q=80',
      rating: 4.9,
      reviews: 98,
      about:
        'Bhaktapur at night is peaceful and magical. I love sharing the stories of our temples and squares when the day crowds have gone.',
    },
  },
  'phewa-lake-sunset-night-boating': {
    id: 703,
    title: 'Phewa Lake Sunset & Night Boating',
    city: 'Pokhara',
    rating: 4.9,
    reviews: 278,
    price: 35,
    duration: '2 hours',
    images: [
      'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
      'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    ],
    description:
      'Row across Phewa Lake at sunset and watch the city lights reflect on the water. A calm night boating experience with views of Pokhara and the mountains in the distance.',
    highlights: [
      'Sunset rowboat ride on Phewa Lake',
      'City lights reflecting on the water',
      'Views of Pokhara and distant peaks',
      'Peaceful evening on the water',
    ],
    host: {
      name: 'Ang',
      image:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=80&h=80&q=80',
      rating: 4.9,
      reviews: 42,
      about:
        'Phewa Lake is my favorite place in Pokhara, especially at sunset and night. Let me show you the calm side of the lake after dark.',
    },
  },
  // Bike tours
  'pokhara-lakeside-bike-ride': {
    id: 801,
    title: 'Pokhara Lakeside Bike Ride',
    city: 'Pokhara',
    rating: 4.9,
    reviews: 342,
    price: 32,
    duration: '3 hours',
    images: [
      'https://images.unsplash.com/photo-1533245707348-571b8e16f54b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
      'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    ],
    description:
      'Ride along the peaceful Phewa Lake shore with mountain views in the distance. A relaxed lakeside bike tour with a local Pokhara cyclist who knows the best quiet roads and photo spots.',
    highlights: [
      'Lakeside bike ride along Phewa Lake',
      'Quiet roads with mountain views',
      'Local cycling guide',
      'Photo stops and tea break',
    ],
    host: {
      name: 'Pema',
      image:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=80&h=80&q=80',
      rating: 4.9,
      reviews: 214,
      about:
        'I am Pema, a Pokhara local and cycling enthusiast. The lakeside roads are my favorite place to ride, and I love sharing them with visitors.',
    },
  },
  'kathmandu-valley-cycling-tour': {
    id: 802,
    title: 'Kathmandu Valley Cycling Tour',
    city: 'Kathmandu',
    rating: 4.8,
    reviews: 219,
    price: 38,
    duration: '4 hours',
    images: [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
      'https://images.unsplash.com/photo-1465101162946-4377e57745c3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    ],
    description:
      'Cycle through Kathmandu Valley villages, quiet backroads, and heritage lanes. A cultural bike tour led by a local who knows the safe routes and hidden village stops.',
    highlights: [
      'Village backroads cycling',
      'Heritage lanes and temples',
      'Local village tea stop',
      'Safe, guided cycling route',
    ],
    host: {
      name: 'Lhakpa',
      image:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=80&h=80&q=80',
      rating: 4.9,
      reviews: 178,
      about:
        "I'm Lhakpa, a Kathmandu Valley cyclist. Let me take you on quiet roads through villages and heritage sites you won't see by car.",
    },
  },
  'bhaktapur-heritage-bike-tour': {
    id: 803,
    title: 'Bhaktapur Heritage Bike Tour',
    city: 'Bhaktapur',
    rating: 4.7,
    reviews: 184,
    price: 35,
    duration: '3 hours',
    images: [
      'https://images.unsplash.com/photo-1533107812167-e1e2f52b9867?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
      'https://images.unsplash.com/photo-1465101162946-4377e57745c3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    ],
    description:
      "Explore Bhaktapur's ancient squares, temples, and pottery lanes on two wheels. A relaxed heritage bike tour through lanes best seen by bike.",
    highlights: [
      'Ancient squares by bike',
      'Pottery lanes and temples',
      'Quiet heritage lanes away from crowds',
      'Local heritage guide',
    ],
    host: {
      name: 'Tashi',
      image:
        'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=80&h=80&q=80',
      rating: 4.9,
      reviews: 98,
      about:
        'Bhaktapur is best explored at a slow pace. I love showing visitors the heritage lanes by bike.',
    },
  },
  'nagarkot-hill-cycling-tour': {
    id: 804,
    title: 'Nagarkot Hill Cycling Tour',
    city: 'Nagarkot',
    rating: 4.9,
    reviews: 156,
    price: 45,
    duration: '5 hours',
    images: [
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    ],
    description:
      'Cycle up to Nagarkot hill for sunrise views of the Himalayas. A scenic hill cycling tour with a local guide who knows the best viewpoints and quiet roads.',
    highlights: [
      'Hill cycling to Nagarkot',
      'Himalaya sunrise views',
      'Quiet mountain roads',
      'Local cycling guide',
    ],
    host: {
      name: 'Mingma',
      image:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=80&h=80&q=80',
      rating: 5.0,
      reviews: 156,
      about:
        'The hill roads around Nagarkot are my home. Let me show you the best Himalayan views by bike.',
    },
  },
};

// Resolve the Cultural Tours & Outdoor Activities catalogs (exported from
// their category pages) into full detail entries, so the /experience/:slug
// links on those pages render a complete page instead of dead-ending at
// "Experience not found".
const inferCityFromSlug = (slug: string): string => {
  if (slug.includes('pokhara')) return 'Pokhara';
  if (slug.includes('bhaktapur')) return 'Bhaktapur';
  if (slug.includes('changu')) return 'Bhaktapur';
  if (slug.includes('patan') || slug.includes('lalitpur')) return 'Lalitpur';
  if (slug.includes('chitwan') || slug.includes('bharatpur')) return 'Bharatpur';
  if (slug.includes('everest')) return 'Everest Region';
  if (slug.includes('khopra') || slug.includes('mardi')) return 'Annapurna Region';
  if (slug.includes('annapurna') || slug.includes('poon')) return 'Annapurna Region';
  if (slug.includes('langtang')) return 'Langtang Region';
  if (slug.includes('helambu') || slug.includes('gosainkunda')) return 'Helambu & Langtang';
  if (slug.includes('shivapuri')) return 'Shivapuri National Park';
  if (slug.includes('dhulikhel')) return 'Dhulikhel';
  if (slug.includes('trishuli')) return 'Trishuli River';
  if (slug.includes('nagarkot')) return 'Nagarkot';
  return 'Kathmandu';
};

const categoryPortraits = [
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&h=200&q=80',
  'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=200&h=200&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&h=200&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&h=200&q=80',
];

// Resolve the Trek/Hiking catalog (exported from the /trek-hiking page) into
// full detail entries with editorial content from trekRoutesData, so every
// trek card links to a complete route page with itinerary and inclusions.
const trekHostPortraits = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80',
  'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=200&h=200&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&h=200&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&h=200&q=80',
];

trekRoutes.forEach((trek, index) => {
  if (!trek?.slug || experiencesData[trek.slug]) return;
  const content = trekRouteContent[trek.slug];
  if (!content) return;
  const hostName = trek.locals?.[0] ?? 'Local guide';
  experiencesData[trek.slug] = {
    id: trek.id,
    title: trek.title,
    city: inferCityFromSlug(trek.slug),
    rating: trek.rating,
    reviews: trek.reviews,
    price: trek.price,
    duration: trek.duration,
    images: [trek.image, ...content.gallery],
    description: content.description,
    highlights: content.highlights,
    host: {
      name: hostName,
      image: trekHostPortraits[index % trekHostPortraits.length],
      rating: trek.rating,
      reviews: trek.reviews,
      about: `${hostName} is a licensed trekking guide who leads this route in ${trek.region}. Expect a safe acclimatisation plan, honest pace-setting and the teahouses and viewpoints that don't make it into the guidebooks.`,
    },
    tagline: content.tagline,
    itinerary: content.itinerary,
    includes: content.includes,
    meetingPoint: content.meetingPoint,
    bestSeason: content.bestSeason,
    grade: trek.grade,
    maxAltitude: trek.maxAltitude,
    region: trek.region,
  };
});

[...culturalTours, ...outdoorActivities].forEach((tour, index) => {
  if (!tour?.slug || experiencesData[tour.slug]) return;
  const hostName = tour.locals?.[0] ?? 'Local guide';
  experiencesData[tour.slug] = {
    id: tour.id,
    title: tour.title,
    city: inferCityFromSlug(tour.slug),
    rating: tour.rating,
    reviews: tour.reviews,
    price: tour.price,
    duration: tour.duration,
    images: [tour.image],
    description: `${tour.title} — a private ${String(tour.type ?? 'experience').toLowerCase()} hosted by ${tour.locals?.join(' & ') ?? 'a licensed local guide'}. Your local expert tailors every stop to your interests, shares the stories you won't find in guidebooks, and shows you the authentic side of Nepal.`,
    highlights: [
      'Led by a verified local guide',
      'Private experience — only your group',
      'Flexible itinerary and free cancellation',
      `Duration: ${tour.duration}`,
    ],
    host: {
      name: hostName,
      image: categoryPortraits[index % categoryPortraits.length],
      rating: tour.rating,
      reviews: tour.reviews,
      about: `${hostName} was born and raised in Nepal and has been hosting travelers for years. Expect local insight, hidden gems and plenty of stories along the way.`,
    },
  };
});
const ExperiencePage: React.FC = () => {
  const { id, slug } = useParams<{ id: string; slug: string }>();
  // :id on the legacy /experience/:id route; :slug when this page is rendered
  // from a kind URL (/trek/:slug or /hike/:slug) for slugs that live outside
  // the city catalogs.
  const experienceId = id ?? slug;
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  // Derive this from the URL on every render. React Router can reuse this
  // component when only :id changes (for example, from a related experience),
  // so storing it in state would leave the previous experience on screen.
  const staticExperience = experienceId ? experiencesData[experienceId] : undefined;
  const [apiExperience, setApiExperience] = useState<Experience | undefined>(undefined);
  const [listingExperience, setListingExperience] = useState<Experience | undefined>(undefined);
  // Public slug of a database-backed experience, so capacity can be re-read
  // after a booking without reloading the page.
  const [resolvedSlug, setResolvedSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(!staticExperience);
  const experience = staticExperience ?? apiExperience ?? listingExperience;

  // If the id is not in the static map (e.g. it comes from the backend
  // catalog surfaced via Search), resolve it from the API. Also try the
  // public guide/host listings (created at /guide/listings) as a fallback
  // so traveler-facing /experience/:id pages show database listings.
  useEffect(() => {
    setApiExperience(undefined);

    setListingExperience(undefined);

    setResolvedSlug(null);

    if (staticExperience || !experienceId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    let cancelled = false;
    (async () => {
      try {
        const list = await guidesApi.getExperiences();
        if (cancelled) return;
        const match = list.find((e) => String(e.id) === experienceId || e.slug === experienceId);
        if (match) {
          setApiExperience({
            ...match,
            city: match.city ?? 'Kathmandu',
            images: [match.heroImage],
            highlights: [],
            rating: match.rating ?? 4.5,
            reviews: match.reviews ?? 0,
            price: match.price ?? 0,
            duration: match.duration ?? '3 hours',
            maxGuests: match.maxGuests ?? undefined,
            availableSlots: match.availableSlots ?? undefined,
            host: (match.host
              ? {
                  ...match.host,
                  about:
                    (match.host as unknown as { about?: string }).about ??
                    'A passionate local guide ready to show you the best of Nepal.',
                }
              : {
                  name: 'Local guide',
                  image: NEPAL_IMAGES.guideMale,
                  rating: 4.5,
                  reviews: 0,
                  about: 'A passionate local guide ready to show you the best of Nepal.',
                }) as Host,
          });
          setResolvedSlug(match.slug ?? null);
          setLoading(false);
          return;
        }

        // Fallback: public guide/host listings stored in the database.
        const listings = await guideDashboardApi.listPublicListings();
        if (cancelled) return;
        const listingMatch = listings.find((l) => String(l.id) === experienceId);
        if (listingMatch) {
          setListingExperience({
            id: listingMatch.id,
            title: listingMatch.title,
            city: listingMatch.city,
            rating: 4.5,
            reviews: 0,
            price: listingMatch.price,
            duration: listingMatch.duration,
            images: ['/images/placeholder.svg'],
            description: listingMatch.description,
            highlights: [],
            host: {
              name: 'Local Guide',
              image: '/images/placeholder.svg',
              rating: 4.5,
              reviews: 0,
              about: 'A local guide offering this experience.',
            },
            meetingPoint: listingMatch.meeting_point ?? undefined,
            maxGuests: listingMatch.max_guests,
            availableSlots: listingMatch.available_spots,
          });
          setResolvedSlug(`guide-${listingMatch.id}`);
        }
      } catch (error) {
        console.error('Failed to load experience:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [experienceId, staticExperience]);

  const { isAuthenticated, accessToken } = useAuthStore();

  const { addBooking } = useBookingStore();
  const [isBooked, setIsBooked] = useState(false);
  const { profile, addBookmark, removeBookmark } = useProfileStore();

  // Booking form state (date + guests)
  const [selectedDate, setSelectedDate] = useState('');
  const [guests, setGuests] = useState(2);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  // Set after saving a bookmark (the card button feedback lives in handleBookmark).
  const [, setBookmarkSaved] = useState(false);
  // Booking confirmation popup shown just before confirming.
  const [confirmPopup, setConfirmPopup] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Mobile sticky footer: configure-booking sheet state (same flow as the
  // city experience pages - dates, guests, start time and host in a sheet).
  const [bookingTime, setBookingTime] = useState('09:00');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sheetError, setSheetError] = useState<string | null>(null);
  const [sheetConfirmed, setSheetConfirmed] = useState(false);
  const [disabledDates, setDisabledDates] = useState<string[]>([]);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [canReview, setCanReview] = useState<boolean | null>(null);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);

  const fetchUnavailableDates = async (year: number, month: number) => {
    if (!accessToken) return;
    try {
      const url = getApiUrl(`/bookings/availability/month?year=${year}&month=${month}`);
      const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
      if (res.ok) {
        const data = await res.json();
        setDisabledDates(Array.isArray(data.unavailable) ? data.unavailable : []);
      }
    } catch {
      // Silently fail
    }
  };

  useEffect(() => {
    if (accessToken) {
      const now = new Date();
      fetchUnavailableDates(now.getFullYear(), now.getMonth() + 1);
    }
  }, [accessToken, fetchUnavailableDates]);

  // Load reviews for this experience and check whether the traveller is
  // eligible to leave one (completed booking + not yet reviewed).
  // Load reviews for this experience and check whether the current traveller
  // is eligible to leave one (completed booking + not yet reviewed).
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [reviewsRes, canRes] = await Promise.all([
          fetch(getApiUrl(`/reviews/?experience_id=${experience.id}`)),
          isAuthenticated
            ? fetch(getApiUrl(`/reviews/can-review?experience_id=${experience.id}`), {
                headers: { Authorization: `Bearer ${accessToken}` },
              })
            : null,
        ]);
        if (cancelled) return;
        const reviewsData = await reviewsRes.json();
        setReviews(Array.isArray(reviewsData) ? reviewsData : []);
        if (canRes) {
          const canData = await canRes.json();
          setCanReview(canData.can_review ?? false);
        }
      } catch (error) {
        console.error('Failed to load reviews:', error);
        setReviews([]);
      }
    };
    if (experience) load();
    return () => {
      cancelled = true;
    };
  }, [experience, isAuthenticated, accessToken]);

  // A signed-in guide must not see themselves in "Who you'll meet".
  const viewerGuideId = useViewerGuideId();
  const visibleGuides = useMemo(
    () => (experience?.guides ?? []).filter((g) => !isOwnGuide(g, viewerGuideId)),
    [experience, viewerGuideId]
  );

  // The guide the traveller picked out of "Who you'll meet". Guides quote their
  // own per-person price, so the booking card prices the booking for them.
  const [selectedGuideId, setSelectedGuideId] = useState<number | null>(null);
  const selectedGuide =
    selectedGuideId === null
      ? null
      : (visibleGuides.find((g) => String(g.id) === String(selectedGuideId)) ?? null);
  const unitPrice = selectedGuide?.price ?? experience?.price ?? 0;

  // A new experience resets the choice so its own price shows first.
  useEffect(() => {
    setSelectedGuideId(null);
  }, [experienceId]);

  // The mobile sheet offers the same guides, so both booking paths agree.
  const hostGuide: SheetGuide | null = experience
    ? {
        id: selectedGuide ? selectedGuide.id : `host-${experience.id}`,
        name: selectedGuide?.name ?? experience.host.name,
        role: selectedGuide?.role ?? 'Your host',
        image: selectedGuide?.image ?? experience.host.image,
        rating: selectedGuide?.rating ?? experience.host.rating,
        reviews: selectedGuide?.reviews ?? experience.host.reviews,
      }
    : null;
  const sheetGuides: SheetGuide[] = visibleGuides.length
    ? visibleGuides.map((g) => ({
        id: g.id,
        name: g.name,
        role: g.role ?? 'Experience Guide',
        image: g.image,
        rating: g.rating,
        reviews: g.reviews,
      }))
    : hostGuide
      ? [hostGuide]
      : [];

  // Live remaining capacity of a published guide listing. Catalog experiences
  // do not track slots, so they keep the previous 20-guest ceiling.
  const slotsLeft =
    typeof experience?.availableSlots === 'number' ? experience.availableSlots : null;
  const guestCeiling = slotsLeft === null ? 20 : Math.max(1, Math.min(20, slotsLeft));

  // Other travellers can take slots while this page is open, so re-read the
  // listing capacity after a booking instead of trusting the first payload.
  const refreshCapacity = async () => {
    if (!resolvedSlug) return;
    try {
      const fresh = await guidesApi.getExperience(resolvedSlug);
      setApiExperience((prev) =>
        prev
          ? {
              ...prev,
              maxGuests: fresh.maxGuests ?? prev.maxGuests,
              availableSlots: fresh.availableSlots ?? prev.availableSlots,
            }
          : prev
      );
    } catch {
      // Keep the last known capacity when the refresh cannot be reached.
    }
  };

  // Never leave the guest picker above the remaining slots.
  useEffect(() => {
    if (slotsLeft !== null && guests > slotsLeft) {
      setGuests(Math.max(1, Math.min(slotsLeft, 20)));
    }
  }, [slotsLeft, guests]);

  const persistBooking = async () => {
    if (!experience) return false;
    const bookingId = crypto.randomUUID?.() ?? Math.random().toString(36).substr(2, 9);
    const bookingSaved = await addBooking({
      id: bookingId,
      experienceId: experience.id,
      experienceTitle: experience.title,
      city: experience.city,
      date: selectedDate,
      guests: guests,
      price: unitPrice,
      image: experience.images[0],
      status: 'upcoming',
      ...(selectedGuide ? { guideId: selectedGuide.id, guideName: selectedGuide.name } : {}),
    });
    if (bookingSaved) {
      setIsBooked(true);
      setBookingConfirmed(true);
      void refreshCapacity();
    }
    return bookingSaved;
  };

  const handleBooking = async () => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }

    if (!selectedDate) {
      setBookingError('Please select a date before booking.');
      return;
    }

    // Pre-check guide availability before opening the Confirm Booking popup.
    // Only block when the guide is already booked/reserved on the chosen date.
    const apiDate = (() => {
      const m = selectedDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (m) return `${m[1]}-${m[2]}-${m[3]}`;
      const m2 = selectedDate.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (m2) return `${m2[3]}-${m2[2]}-${m2[1]}`;
      return null;
    })();
    if (apiDate) {
      try {
        const res = await fetch(getApiUrl(`/bookings/availability?date=${apiDate}`), {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (!data.available) {
            setBookingError(
              `The guide is already ${data.status} on this date. Please choose another date.`
            );
            return;
          }
        }
      } catch {
        // If the availability check cannot be reached, fall through so the
        // booking attempt below surfaces its own error.
      }
    }

    if (experience) {
      setBookingError(null);
      setConfirmPopup(true);
    }
  };

  const confirmBooking = async () => {
    if (await persistBooking()) {
      setConfirmPopup(false);
    }
  };

  const openSheet = () => {
    setSheetError(null);
    setSheetConfirmed(false);
    setIsSheetOpen(true);
  };

  const handleSheetConfirm = async () => {
    if (!selectedDate) {
      setSheetError('Please select a date');
      return;
    }
    if (!isAuthenticated) {
      setSheetError('Please log in to book this experience');
      return;
    }

    // Pre-check guide availability before confirming on mobile too.
    const apiDate = (() => {
      const m = selectedDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (m) return `${m[1]}-${m[2]}-${m[3]}`;
      const m2 = selectedDate.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (m2) return `${m2[3]}-${m2[2]}-${m2[1]}`;
      return null;
    })();
    if (apiDate) {
      try {
        const res = await fetch(getApiUrl(`/bookings/availability?date=${apiDate}`), {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (!data.available) {
            setSheetError(
              `The guide is already ${data.status} on this date. Please choose another date.`
            );
            return;
          }
        }
      } catch {
        /* fall through and let persistBooking surface its own error */
      }
    }

    setSheetError(null);
    setBookingError(null);
    if (await persistBooking()) setIsSheetOpen(false);
  };

  const closeSheet = () => {
    const wasConfirmed = sheetConfirmed;
    setIsSheetOpen(false);
    setSheetError(null);
    setSheetConfirmed(false);
    // Mirrors the card flow: once booked, head over to the bookings page.
    if (wasConfirmed) navigate('/bookings');
  };

  const bookmarkId = experience ? `exp-${experience.id}` : '';
  const isBookmarked = profile.bookmarks.some((bookmark) => bookmark.id === bookmarkId);

  const handleBookmark = () => {
    if (!experience) return;
    if (isBookmarked) {
      removeBookmark(bookmarkId);
      return;
    }
    addBookmark({
      id: bookmarkId,
      title: experience.title,
      city: experience.city,
      image: experience.images[0],
      createdAt: new Date().toISOString(),
      link: `/experience/${experience.id}`,
    });
    setBookmarkSaved(true);
    setTimeout(() => setBookmarkSaved(false), 2500);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col font-sans">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="min-h-screen flex flex-col font-sans">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-primary mb-4">Experience not found</h1>
            <p className="text-gray-600 mb-6">
              It may have been removed, or the link is incorrect.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link to="/search">
                <Button>Back to Search</Button>
              </Link>
              <Link to="/">
                <Button variant="outline">Go Home</Button>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background-cream">
      <Header />

      <main id="main-content" className="flex-grow">
        {/* Gallery Grid (Mobile: Carousel, Desktop: Grid) */}
        <div className="h-[40vh] md:h-[60vh] relative bg-slate-100">
          <button
            onClick={() => goBack(navigate)}
            className="absolute top-8 left-8 z-20 flex items-center gap-2 text-white hover:text-accent font-bold transition-colors bg-black/20 hover:bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          {/* Simple single image for now, but could be a grid */}
          <img
            src={experience.images[0]}
            alt={experience.title}
            className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
            onError={(e) => (e.currentTarget.src = '/images/placeholder.svg')}
            onClick={() => {
              setLightboxImages(experience.images);
              setLightboxIndex(0);
              setLightboxOpen(true);
            }}
          />
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-md text-sm font-bold shadow-sm">
            View all photos
          </div>
        </div>

        {/* Gallery thumbnails (routes with extra images, e.g. treks) */}
        {experience.images.length > 1 && (
          <div className="container mx-auto px-4 pt-4">
            <div className="grid grid-cols-4 gap-2">
              {experience.images.slice(0, 4).map((image, index) => (
                <div
                  key={index}
                  className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <img
                    src={image}
                    alt={`${experience.title} photo ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => (e.currentTarget.src = '/images/placeholder.svg')}
                    onClick={() => {
                      setLightboxImages(experience.images);
                      setLightboxIndex(index);
                      setLightboxOpen(true);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Left Content */}
            <div className="lg:w-2/3 space-y-8">
              <div>
                <div className="flex items-center gap-2 text-primary font-bold uppercase text-xs tracking-wider mb-2">
                  <MapPin className="w-4 h-4" />
                  {experience.city}
                </div>
                <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
                  {experience.title}
                </h1>
                {experience.tagline && (
                  <p className="text-lg text-slate-600 mb-4 leading-relaxed">
                    {experience.tagline}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 font-bold">
                    <Star className="w-4 h-4 fill-secondary text-secondary" />
                    {experience.rating}{' '}
                    <span className="text-slate-500 font-normal">
                      ({experience.reviews} reviews)
                    </span>
                  </div>
                  <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                  <div className="flex items-center gap-1 text-slate-600">
                    <Clock className="w-4 h-4" />
                    {experience.duration}
                  </div>
                </div>
              </div>

              <div className="border-t border-b border-slate-200 py-6 flex flex-wrap gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Private Tour</p>
                    <p className="text-xs text-slate-500">Only you and your host</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">100% Personalized</p>
                    <p className="text-xs text-slate-500">Customize your experience</p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">What you'll do</h2>
                <p className="text-slate-700 leading-relaxed text-lg">{experience.description}</p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">Highlights</h2>
                <ul className="space-y-3">
                  {experience.highlights?.map((highlight: string, index: number) => (
                    <li key={index} className="flex items-start gap-3 text-slate-700">
                      <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Trek route facts: grade, altitude, season, meeting point */}
              {(experience.grade || experience.maxAltitude || experience.region) && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Difficulty', value: experience.grade },
                    { label: 'Max altitude', value: experience.maxAltitude },
                    { label: 'Region', value: experience.region },
                    { label: 'Best season', value: experience.bestSeason },
                  ]
                    .filter((fact) => fact.value)
                    .map((fact) => (
                      <div
                        key={fact.label}
                        className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm"
                      >
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                          {fact.label}
                        </p>
                        <p className="font-bold text-slate-900">{fact.value}</p>
                      </div>
                    ))}
                </div>
              )}

              {/* Day-by-day itinerary */}
              {experience.itinerary && experience.itinerary.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Day by day itinerary</h2>
                  <ol className="relative border-l-2 border-slate-200 ml-3 space-y-8">
                    {experience.itinerary.map((day, index) => (
                      <li key={index} className="ml-6">
                        <span className="absolute -left-[11px] flex items-center justify-center w-5 h-5 rounded-full bg-secondary ring-4 ring-background-cream" />
                        <p className="text-xs font-bold uppercase tracking-wider text-secondary mb-1">
                          {day.day}
                        </p>
                        <h3 className="font-bold text-lg text-slate-900 mb-1">{day.title}</h3>
                        <p className="text-slate-600 leading-relaxed">{day.detail}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* What's included + meeting point */}
              {(experience.includes?.length || experience.meetingPoint) && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h2 className="text-2xl font-bold mb-6">What&apos;s included</h2>
                  {experience.includes && (
                    <ul className="grid md:grid-cols-2 gap-3">
                      {experience.includes.map((item: string, index: number) => (
                        <li key={index} className="flex items-start gap-3 text-slate-700">
                          <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {experience.meetingPoint && (
                    <div className="mt-6 pt-6 border-t border-slate-100 flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-sm text-slate-900">Meeting point</p>
                        <p className="text-slate-600 text-sm">{experience.meetingPoint}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Host Section */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h2 className="text-2xl font-bold mb-6">Your Host</h2>
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex-shrink-0 text-center">
                    <img
                      src={experience.host.image}
                      alt={experience.host.name}
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md mb-2 cursor-pointer hover:opacity-90 transition-opacity"
                      onError={(e) => (e.currentTarget.src = '/images/placeholder.svg')}
                      onClick={() => {
                        setLightboxImages([experience.host.image]);
                        setLightboxIndex(0);
                        setLightboxOpen(true);
                      }}
                    />
                    <div className="font-bold text-lg">{experience.host.name}</div>
                    <div className="text-secondary font-bold text-sm flex items-center justify-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      {experience.host.rating}
                    </div>
                  </div>
                  <div>
                    <p className="italic text-slate-600 mb-4">"{experience.host.about}"</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      onClick={() =>
                        navigate(visibleGuides[0] ? guideContactPath(visibleGuides[0]) : '/contact')
                      }
                    >
                      Contact Host
                    </Button>
                  </div>
                </div>
              </div>
              {/* Who you'll meet — approved guides assigned to this experience */}
              {visibleGuides.length > 0 && (
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Who you'll meet</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Pick your guide — each one sets their own price.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {visibleGuides.map((g) => {
                      const isSelected = String(selectedGuideId) === String(g.id);
                      return (
                        <div
                          key={g.id}
                          className={`flex w-44 flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-colors ${
                            isSelected
                              ? 'border-primary bg-primary/5 ring-1 ring-primary'
                              : 'border-slate-200 hover:border-slate-400'
                          }`}
                        >
                          <button
                            type="button"
                            aria-pressed={isSelected}
                            aria-label={`Select guide ${g.name}`}
                            onClick={() => setSelectedGuideId(isSelected ? null : g.id)}
                            className="flex w-full flex-col items-center gap-2"
                          >
                            <img
                              src={g.image}
                              alt={g.name}
                              className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
                              onError={(e) => (e.currentTarget.src = '/images/placeholder.svg')}
                            />
                            <div>
                              <div className="font-bold text-gray-900">{g.name}</div>
                              <div className="text-xs text-gray-500">
                                {g.role || 'Experience Guide'}
                              </div>
                              <div className="text-sm text-gray-600">
                                {g.rating} ★ ({g.reviews} reviews)
                              </div>
                            </div>
                            {typeof g.price === 'number' && (
                              <div className="text-sm font-bold text-secondary">
                                {formatPrice(g.price, 'USD')}{' '}
                                <span className="text-xs font-medium text-slate-500">/ person</span>
                              </div>
                            )}
                          </button>
                          <Link
                            to={`/guidesprofile/${g.slug || g.id}`}
                            aria-label={`View ${g.name}'s profile`}
                            className="text-xs font-bold text-primary hover:underline"
                          >
                            View profile
                          </Link>
                          {isSelected && (
                            <span className="text-xs font-bold uppercase tracking-wider text-primary">
                              Selected
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {/* Reviews Section */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900">Traveller Reviews</h2>
                  {canReview && (
                    <Button variant="outline" size="sm" onClick={() => setReviewFormOpen(true)}>
                      Write a review
                    </Button>
                  )}
                </div>
                {reviews.length > 0 ? (
                  <div className="space-y-3">
                    {reviews.map((review) => (
                      <ReviewCard key={review.id} review={review} />
                    ))}
                  </div>
                ) : canReview ? (
                  <p className="text-slate-500 text-sm">
                    No reviews yet. Be the first to share your experience!
                  </p>
                ) : (
                  <p className="text-slate-500 text-sm">
                    Reviews appear once you have taken the experience.
                  </p>
                )}
              </div>
              {reviewFormOpen && canReview && (
                <ReviewForm
                  experienceId={experience.id}
                  onReviewSaved={(saved) => {
                    setReviews((prev) => [
                      {
                        id: -Date.now(),
                        user_name: 'You',
                        rating: saved.rating,
                        comment: saved.comment,
                        created_at: new Date().toISOString(),
                      },
                      ...prev,
                    ]);
                    setCanReview(false);
                    setReviewFormOpen(false);
                  }}
                />
              )}
            </div>

            {/* Right Sidebar (Booking Card) */}
            <div className="lg:w-1/3">
              {/* Mobile sticky footer (visible only on small screens) */}
              <StickyBarPortal>
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-2xl lg:hidden z-40 flex items-center justify-between">
                  <div className="flex flex-col">
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold text-gray-900">
                        {formatPrice(unitPrice, 'USD')}
                      </span>
                      <span className="text-gray-500 text-xs">/ person</span>
                    </div>
                    {slotsLeft !== null && (
                      <span
                        className={`text-[11px] font-semibold ${
                          slotsLeft > 0 ? 'text-green-700' : 'text-amber-700'
                        }`}
                      >
                        {slotsLeft > 0 ? `${slotsLeft} slots left` : 'Fully booked'}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={openSheet}
                      className="text-xs underline font-bold text-gray-900 text-left"
                    >
                      Show dates
                    </button>
                  </div>
                  <button
                    onClick={openSheet}
                    disabled={slotsLeft === 0}
                    className="bg-primary hover:bg-primary-hover text-white font-bold py-3 px-6 rounded-lg uppercase tracking-wide disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Book Now
                  </button>
                </div>
              </StickyBarPortal>

              <div className="sticky top-24 bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
                <div className="flex items-center space-x-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < Math.round(experience.rating) ? 'text-brand-yellow fill-brand-yellow' : 'text-gray-300'}`}
                    />
                  ))}
                  <span className="text-sm text-gray-500 ml-2">({experience.reviews} reviews)</span>
                </div>

                <div className="flex items-baseline space-x-2 mb-6">
                  <span className="text-3xl font-bold text-secondary">
                    {formatPrice(unitPrice, 'USD')}
                  </span>
                  <span className="text-gray-500">/ person</span>
                  {selectedGuide && (
                    <span className="ml-1 text-sm text-slate-500">with {selectedGuide.name}</span>
                  )}
                </div>

                {slotsLeft !== null && (
                  <div className="mb-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${
                        slotsLeft > 0
                          ? 'border-green-100 bg-green-50 text-green-700'
                          : 'border-amber-100 bg-amber-50 text-amber-700'
                      }`}
                    >
                      {slotsLeft > 0
                        ? `${slotsLeft} of ${experience.maxGuests ?? slotsLeft} slots left`
                        : 'Fully booked'}
                    </span>
                  </div>
                )}

                <div className="space-y-4 mb-6">
                  <div>
                    <BookingCalendar
                      checkIn={selectedDate}
                      checkOut=""
                      onChange={(ci) => {
                        setSelectedDate(ci);
                        setBookingError(null);
                      }}
                      idPrefix="exp"
                      single
                      ariaLabel="Choose experience date"
                      disabledDates={disabledDates}
                      onMonthChange={fetchUnavailableDates}
                    />
                  </div>
                  <GuestPicker
                    value={guests}
                    onChange={(g) => {
                      setGuests(g);
                      setBookingError(null);
                    }}
                    maxGuests={guestCeiling}
                    idPrefix="exp"
                  />
                  {experience && (
                    <div className="flex justify-between text-sm text-slate-600 border-t border-slate-100 pt-3">
                      <span>
                        {formatPrice(unitPrice, 'USD')} × {guests} guest
                        {guests === 1 ? '' : 's'}
                      </span>
                      <span className="font-bold text-secondary">
                        {formatPrice(unitPrice * guests, 'USD')}
                      </span>
                    </div>
                  )}
                  {bookingError && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                      {bookingError}
                    </p>
                  )}
                  {isBooked && (
                    <div className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2 space-y-1">
                      <p className="font-bold">Booking confirmed!</p>
                      <p>{experience.title}</p>
                      <p>Date: {selectedDate}</p>
                      <p>Guests: {guests}</p>
                      <p>Total: {formatPrice(unitPrice * guests, 'USD')}</p>
                      <p>City: {experience.city}</p>
                      <p>Guide: {selectedGuide?.name ?? experience.host.name}</p>
                    </div>
                  )}
                </div>

                <Button
                  className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 text-lg rounded-xl mb-4 shadow-lg shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={handleBooking}
                  disabled={slotsLeft === 0}
                >
                  {isBooked ? 'Booked!' : slotsLeft === 0 ? 'Sold out' : 'Book Now'}
                </Button>

                <div className="text-center text-xs text-slate-500 space-y-2">
                  <p className="flex items-center justify-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Free cancellation up to 24h before
                  </p>
                  <p>No payment required today</p>
                </div>
                <button
                  type="button"
                  onClick={handleBookmark}
                  aria-pressed={isBookmarked}
                  className={`w-full border font-bold py-3 rounded-xl mt-3 flex items-center justify-center gap-2 transition-colors ${
                    isBookmarked
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-200 hover:border-primary text-primary'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                  {isBookmarked ? 'Saved — remove bookmark' : 'Save for later'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile configure-booking sheet opened from the sticky footer */}
      {isSheetOpen && (
        <MobileBookingSheet
          open={isSheetOpen}
          onClose={closeSheet}
          pricePerPerson={unitPrice}
          rating={experience.rating}
          reviews={experience.reviews}
          accentClass="bg-primary hover:bg-primary-hover"
          singleDate
          checkIn={selectedDate}
          checkOut=""
          onDateChange={(ci) => {
            setSelectedDate(ci);
            setBookingError(null);
          }}
          guests={guests}
          onGuestsChange={(g) => {
            setGuests(g);
            setBookingError(null);
          }}
          maxGuests={guestCeiling}
          bookingTime={bookingTime}
          onTimeChange={setBookingTime}
          guides={sheetGuides}
          selectedGuide={hostGuide}
          onSelectGuide={(g) => {
            const id = Number(g.id);
            if (Number.isFinite(id)) setSelectedGuideId(id);
          }}
          onConfirm={handleSheetConfirm}
          error={sheetError}
          confirmed={sheetConfirmed}
          confirmedSummary={
            <ul className="space-y-1">
              <li>
                <span className="font-bold">Date:</span> {selectedDate}
              </li>
              <li>
                <span className="font-bold">Guests:</span> {guests}
              </li>
              <li>
                <span className="font-bold">Start time:</span> {bookingTime}
              </li>
              <li>
                <span className="font-bold">Host:</span>{' '}
                {selectedGuide?.name ?? experience.host.name}
              </li>
            </ul>
          }
        />
      )}

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Image gallery"
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              closeLightbox();
            }}
            className="absolute top-6 right-6 z-20 text-white text-2xl font-bold"
          >
            ×
          </button>
          <div
            className="relative max-w-5xl max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxImages[lightboxIndex]}
              alt={experience.title}
              className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-2xl"
              onError={(e) => (e.currentTarget.src = '/images/placeholder.svg')}
            />
            <div className="mt-2 text-white text-sm">
              {lightboxIndex + 1} of {lightboxImages.length}
            </div>
            {lightboxImages.length > 1 && (
              <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 pointer-events-none">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex(
                      (i) => (i - 1 + lightboxImages.length) % lightboxImages.length
                    );
                  }}
                  className="pointer-events-auto z-20 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((i) => (i + 1) % lightboxImages.length);
                  }}
                  className="pointer-events-auto z-20 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full"
                >
                  ›
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Booking confirmation popup with all details */}
      {confirmPopup && experience && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Confirm booking"
        >
          <div
            className="flex items-center justify-between mb-4"
            onClick={() => setConfirmPopup(false)}
          />
          <div
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Confirm booking</h2>
              <button
                type="button"
                onClick={() => setConfirmPopup(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <img
                src={experience.images[0]}
                alt={experience.title}
                className="w-16 h-16 rounded-xl object-cover"
                onError={(e) => (e.currentTarget.src = '/images/placeholder.svg')}
              />
              <div>
                <h3 className="font-bold text-gray-900">{experience.title}</h3>
                <p className="text-sm text-gray-500">{experience.city}</p>
              </div>
            </div>
            <div className="space-y-3 text-sm text-gray-700 mb-6">
              <div className="flex justify-between border-b pb-2">
                <span>Date</span>
                <span className="font-medium">{selectedDate}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span>Guests</span>
                <span className="font-medium">{guests}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span>{selectedGuide ? 'Guide' : 'Host'}</span>
                <span className="font-medium">{selectedGuide?.name ?? experience.host.name}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span>Price per person</span>
                <span className="font-medium">{formatPrice(unitPrice, 'USD')}</span>
              </div>
              <div className="flex justify-between border-b pb-2 font-bold text-primary">
                <span>Total</span>
                <span className="font-bold">{formatPrice(unitPrice * guests, 'USD')}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmPopup(false)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmBooking}
                className="flex-1 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20"
              >
                Confirm booking
              </button>
            </div>
          </div>
        </div>
      )}
      <BookingLoginPrompt isOpen={showLoginPrompt} onClose={() => setShowLoginPrompt(false)} />

      {bookingConfirmed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl animate-in fade-in zoom-in-95">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Booking Confirmed!</h2>
            <p className="mt-2 text-sm text-gray-600">
              Your booking has been confirmed. You can view it in your bookings.
            </p>
            <button
              onClick={() => setBookingConfirmed(false)}
              className="mt-6 w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-primary/90 active:scale-[0.98]"
            >
              OK
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ExperiencePage;
