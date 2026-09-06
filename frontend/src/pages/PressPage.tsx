import React from 'react';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { ExternalLink, Calendar } from 'lucide-react';

const pressReleases = [
  {
    id: 1,
    title: 'Guides Nepal Raises $2M to Expand Local Tourism Platform',
    source: 'TechCrunch',
    date: '2026-01-20',
    excerpt: 'The Nepal-based startup aims to connect travelers with authentic local experiences across South Asia.'
  },
  {
    id: 2,
    title: 'How Guides Nepal is Revolutionizing Tourism in Nepal',
    source: 'Lonely Planet',
    date: '2025-12-15',
    excerpt: 'A new platform is making it easier for travelers to connect with local guides and experience authentic culture.'
  },
  {
    id: 3,
    title: 'Top 10 Travel Startups to Watch in 2026',
    source: 'Forbes',
    date: '2025-11-30',
    excerpt: 'Guides Nepal featured among the most promising travel technology startups transforming how we explore.'
  },
  {
    id: 4,
    title: 'Sustainable Tourism: Guides Nepal\'s Community Approach',
    source: 'National Geographic',
    date: '2025-10-20',
    excerpt: 'How one platform is putting local communities at the center of the travel experience.'
  },
  {
    id: 5,
    title: 'Guides Nepal Launches in Five Cities Across Nepal',
    source: 'Kathmandu Post',
    date: '2025-09-01',
    excerpt: 'The platform now offers experiences in Kathmandu, Pokhara, Lalitpur, Bhaktapur, and Bharatpur.'
  }
];

const PressPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <section className="bg-primary py-20 text-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Press</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Latest news and media coverage about Guides Nepal.
            </p>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-slate-900 mb-8">In The News</h2>
              <div className="space-y-6">
                {pressReleases.map((item) => (
                  <div key={item.id} className="border border-slate-200 rounded-xl p-6 hover:border-primary hover:shadow-md transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-xs font-bold text-primary uppercase tracking-wide">{item.source}</span>
                        <h3 className="font-bold text-lg mt-1 text-slate-900">{item.title}</h3>
                        <p className="text-slate-600 mt-2">{item.excerpt}</p>
                        <div className="flex items-center gap-2 mt-3 text-sm text-slate-500">
                          <Calendar className="w-4 h-4" />
                          {new Date(item.date).toLocaleDateString()}
                        </div>
                      </div>
                      <button className="text-primary hover:text-primary-hover whitespace-nowrap">
                        <ExternalLink className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Media Inquiries</h2>
            <p className="text-slate-600 max-w-xl mx-auto mb-6">
              For press inquiries, interviews, or partnership opportunities, please reach out to our communications team.
            </p>
            <a href="mailto:press@guides-nepal.com" className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-hover transition-colors">
              Contact Press Team
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PressPage;