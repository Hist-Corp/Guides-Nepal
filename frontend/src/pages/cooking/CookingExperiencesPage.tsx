import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Star, Clock, ChevronRight } from 'lucide-react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { cookingExperiencesData } from './CookingExperiencePage';

// Listing page for all cooking experiences — the target of the
// "View all" buttons on /cooking-classes (route: /cooking-classes/experiences).
export const CookingExperiencesPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-background-cream">
      <Header />
      <main className="flex-grow">
        {/* Hero */}
        <section className="bg-[#213448] text-white">
          <div className="container mx-auto px-4 py-14">
            <Link
              to="/cooking-classes"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white font-medium mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Cooking Classes
            </Link>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">All Cooking Experiences</h1>
            <p className="text-white/80 max-w-2xl leading-relaxed">
              Go hands-on with Nepal's cuisine — market visits, momo workshops, Newari feasts and
              farm-to-table classes hosted by local home chefs.
            </p>
          </div>
        </section>

        {/* Grid */}
        <section className="py-14">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cookingExperiencesData.map((exp) => (
                <Link
                  key={exp.slug}
                  to={`/cooking-classes/experience/${exp.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
                >
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={exp.heroImage}
                      alt={exp.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                      <Star className="w-3.5 h-3.5 fill-[#F4B400] text-[#F4B400]" />
                      {exp.rating}{' '}
                      <span className="font-normal text-gray-500">({exp.reviews})</span>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#F4B400] mb-1">
                      {exp.host.type}
                    </p>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                      {exp.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">{exp.description}</p>
                    <div className="mt-auto flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5 text-gray-500">
                        <Clock className="w-4 h-4" /> {exp.duration}
                      </span>
                      <span className="font-bold text-gray-900">
                        ${exp.price}
                        <span className="text-xs text-gray-400 font-normal"> / person</span>
                      </span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-sm">
                      <span className="text-gray-600">Hosted by {exp.host.name}</span>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CookingExperiencesPage;
