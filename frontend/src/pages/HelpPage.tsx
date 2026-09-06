import React from 'react';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { Link } from 'react-router-dom';
import { HelpCircle, BookOpen, MessageCircle, Mail, CreditCard, Calendar, Shield } from 'lucide-react';

const helpTopics = [
  { icon: BookOpen, title: 'Getting Started', description: 'Learn how to use Guides Nepal', link: '/how-it-works' },
  { icon: Calendar, title: 'Booking Help', description: 'How to book and manage reservations', link: '/faq' },
  { icon: CreditCard, title: 'Payments & Refunds', description: 'Payment methods and refund policies', link: '/faq' },
  { icon: Shield, title: 'Safety & Trust', description: 'Our safety guidelines and verification', link: '/faq' },
  { icon: MessageCircle, title: 'Contact Support', description: 'Get in touch with our team', link: '/contact' },
  { icon: HelpCircle, title: 'FAQ', description: 'Frequently asked questions', link: '/faq' }
];

const HelpPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <section className="bg-primary py-20 text-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Help Center</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              How can we help you today?
            </p>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {helpTopics.map((topic, index) => (
                  <Link key={index} to={topic.link} className="border border-slate-200 rounded-xl p-6 hover:border-primary hover:shadow-md transition-all group">
                    <topic.icon className="w-10 h-10 text-primary mb-4" />
                    <h3 className="font-bold text-lg text-slate-900 mb-2 group-hover:text-primary transition-colors">{topic.title}</h3>
                    <p className="text-slate-600 text-sm">{topic.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Still Need Help?</h2>
            <p className="text-slate-600 max-w-xl mx-auto mb-6">
              Our support team is available 24/7 to assist you with any questions or concerns.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact" className="bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-primary-hover transition-colors">
                Contact Us
              </Link>
              <a href="mailto:support@guides-nepal.com" className="bg-white text-primary border border-primary px-8 py-3 rounded-lg font-bold hover:bg-primary hover:text-white transition-colors">
                Email Support
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HelpPage;