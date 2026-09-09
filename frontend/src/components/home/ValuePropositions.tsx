import React from 'react';
import { UserCheck, Sliders, Heart } from 'lucide-react';
import { useCmsSection } from '../../hooks/useCms';

const features = [
  {
    icon: UserCheck,
    title: 'People first',
    description: 'Connect with a local who shares your interests and travel style.',
  },
  {
    icon: Sliders,
    title: 'Tailor it to your wishes',
    description: 'Personalize your experience to make it uniquely yours.',
  },
  {
    icon: Heart,
    title: 'More you, less checklist',
    description: 'Experience the city authentically, away from the tourist traps.',
  },
];

export const ValuePropositions: React.FC = () => {
  const cms = useCmsSection('home', 'home-values');
  const heading = cms?.content?.heading || 'Why guides-nepal?';
  return (
    <section data-cms-id="home-values" data-cms-label="Why us" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-xl font-bold text-primary mb-2">{heading}</h2>
          <h3 className="text-3xl font-bold text-slate-800">The best way to travel is like a local.</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {features.map((feature, index) => (
            <div key={index} className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary/10 text-primary mb-6 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-10 h-10" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold mb-4 text-slate-900">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed max-w-xs mx-auto">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValuePropositions;
