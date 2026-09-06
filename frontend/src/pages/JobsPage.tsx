import React from 'react';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { Briefcase, MapPin, Clock } from 'lucide-react';

const jobs = [
  {
    id: 1,
    title: 'Senior Full Stack Developer',
    department: 'Engineering',
    location: 'Kathmandu, Nepal',
    type: 'Full-time',
    description: 'Join our engineering team to build the future of travel experiences in Nepal.'
  },
  {
    id: 2,
    title: 'Community Manager',
    department: 'Operations',
    location: 'Remote',
    type: 'Full-time',
    description: 'Help grow our community of guides and travelers across Nepal.'
  },
  {
    id: 3,
    title: 'UX Designer',
    department: 'Design',
    location: 'Kathmandu, Nepal',
    type: 'Full-time',
    description: 'Design beautiful experiences that connect travelers with local culture.'
  },
  {
    id: 4,
    title: 'Content Writer',
    department: 'Marketing',
    location: 'Remote',
    type: 'Part-time',
    description: 'Create compelling stories about Nepal\'s culture, food, and experiences.'
  },
  {
    id: 5,
    title: 'Guide Partnership Coordinator',
    department: 'Operations',
    location: 'Pokhara, Nepal',
    type: 'Full-time',
    description: 'Recruit and support local guides in the Pokhara region.'
  }
];

const JobsPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <section className="bg-primary py-20 text-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Join Our Team</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Help us connect travelers with authentic experiences in Nepal.
            </p>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-slate-900 mb-8">Open Positions</h2>
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div key={job.id} className="border border-slate-200 rounded-xl p-6 hover:border-primary hover:shadow-md transition-all">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-lg text-slate-900">{job.title}</h3>
                        <p className="text-slate-600 mt-1">{job.description}</p>
                        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            {job.department}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {job.type}
                          </span>
                        </div>
                      </div>
                      <button className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-hover transition-colors whitespace-nowrap">
                        Apply Now
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
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Don't see a role for you?</h2>
            <p className="text-slate-600 max-w-xl mx-auto mb-6">
              We're always looking for talented people. Send us your resume and we'll keep you in mind for future opportunities.
            </p>
            <button className="bg-brand-yellow text-slate-900 px-8 py-3 rounded-lg font-bold hover:bg-[#E5A800] transition-colors">
              Send Resume
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default JobsPage;