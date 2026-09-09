import React from 'react';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { Button } from '../components/common/Button';
import { Link } from 'react-router-dom';
import { Star, MapPin } from 'lucide-react';

// Mock data - in a real app, this would be fetched from an API
const experiencesData = {
  '103': {
    id: 103,
    title: 'Spiritual Morning at Swayambhunath',
    city: 'Kathmandu',
    rating: 4.8,
    reviews: 210,
    price: 20,
    images: ['https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80'],
    description: "Start your day with peace and spirituality at the Monkey Temple."
  },
  '401': {
    id: 401,
    title: 'Bhaktapur Heritage Walk',
    city: 'Bhaktapur',
    rating: 4.9,
    reviews: 245,
    price: 35,
    images: ['https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80'],
    description: "Walk through the living museum of Bhaktapur."
  },
  '201': {
    id: 201,
    title: 'Paragliding over Phewa Lake',
    city: 'Pokhara',
    rating: 4.9,
    reviews: 350,
    price: 90,
    images: ['https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80'],
    description: "Experience the thrill of flying over the beautiful Phewa Lake."
  }
};

const MostPopularPage: React.FC = () => {
  const popularExperiences = Object.values(experiencesData);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background-cream">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">Most Popular Experiences</h1>
          <p className="text-lg text-slate-600">Discover the tours and activities that travelers love the most.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {popularExperiences.map((exp) => (
            <Link to={`/experience/${exp.id}`} key={exp.id} className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 group">
              <div className="relative">
                <img src={exp.images[0]} alt={exp.title} className="w-full h-56 object-cover" />
                <div className="absolute top-4 right-4 bg-primary text-white text-sm font-bold py-1 px-3 rounded-full">
                  ${exp.price}
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1 text-sm text-slate-600">
                    <MapPin className="w-4 h-4" />
                    {exp.city}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-bold">{exp.rating}</span>
                    <span className="text-sm text-slate-500">({exp.reviews})</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-primary transition-colors">{exp.title}</h3>
                <p className="text-slate-600 text-sm mb-4">{exp.description}</p>
                <Button variant="outline" className="w-full">View Details</Button>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MostPopularPage;
