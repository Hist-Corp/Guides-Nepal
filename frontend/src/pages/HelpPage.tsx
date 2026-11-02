import React from 'react';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { PageBackButton } from '../components/common/PageBackButton';
import { Link } from 'react-router-dom';
import { HelpCircle, BookOpen, MessageCircle, Mail, CreditCard, Calendar, ShieldCheck, LifeBuoy, ArrowRight } from 'lucide-react';

const helpTopics = [
  { icon: BookOpen, title: 'Getting Started', description: 'Learn how to use Guides Nepal', link: '/how-it-works' },
  { icon: Calendar, title: 'Booking Help', description: 'How to book and manage reservations', link: '/faq' },
  { icon: CreditCard, title: 'Payments & Refunds', description: 'Payment methods and refund policies', link: '/faq' },
  { icon: ShieldCheck, title: 'Safety & Trust', description: 'Our safety guidelines and verification', link: '/faq' },
  { icon: MessageCircle, title: 'Contact Support', description: 'Get in touch with our team', link: '/contact' },
  { icon: HelpCircle, title: 'FAQ', description: 'Frequently asked questions', link: '/faq' }
];

const HelpPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <PageBackButton />
      <main className="flex-grow">
        <section className="relative overflow-hidden bg-gradient-to-br from-primary to-primary/80 py-20 text-white">
          <div className="absolute inset-0 opacity-10">
            <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <circle cx="80" cy="20" r="40" fill="white" />
              <circle cx="20" cy="80" r="30" fill="white" />
            </svg>
          </div>
          <div className="container relative mx-auto px-4 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur ring-2 ring-white/30">
              <LifeBuoy className="h-8 w-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Help Center</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              How can we help you today?
            </p>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-b from-white to-slate-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary mb-3">Support</span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900">How can we help?</h2>
              <p className="mt-3 text-slate-500 max-w-xl mx-auto">Find answers, get support, and learn how to make the most of Guides Nepal.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {helpTopics.map((topic, index) => (
                <Link
                  key={index}
                  to={topic.link}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-primary/30 block"
                >
                  <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/5 transition-transform duration-500 group-hover:scale-150" />
                  <div className="relative">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary ring-1 ring-primary/10 transition-all duration-300 group-hover:from-primary group-hover:to-primary/80 group-hover:text-white group-hover:ring-primary/30 group-hover:shadow-md">
                      <topic.icon className="h-6 w-6" />
                    </div>
                    <h3 className="mb-2 text-lg font-bold text-slate-900 transition-colors group-hover:text-primary">{topic.title}</h3>
                    <p className="text-sm leading-relaxed text-slate-500">{topic.description}</p>
                    <div className="mt-5 flex items-center gap-1.5 text-sm font-semibold text-primary opacity-0 transition-all duration-300 group-hover:opacity-100">
                      Learn more
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
          <div className="container mx-auto px-4 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">Still need help?</h2>
            <p className="text-slate-500 max-w-xl mx-auto mb-8">
              Our support team is available 24/7 to assist you with any questions or concerns.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact" className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-bold text-white shadow-md hover:bg-primary/90 transition-colors">
                Contact Us
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="mailto:support@guides-nepal.com" className="inline-flex items-center gap-2 rounded-full border-2 border-primary bg-white px-8 py-3 text-sm font-bold text-primary hover:bg-primary hover:text-white transition-colors">
                <Mail className="h-4 w-4" />
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