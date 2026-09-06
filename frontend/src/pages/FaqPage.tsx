import React, { useState } from 'react';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqCategories = [
  {
    name: 'Booking & Payments',
    questions: [
      { q: 'How do I book an experience?', a: 'Browse our experiences, select your preferred date and number of guests, and complete the booking process. You can pay securely online.' },
      { q: 'What payment methods do you accept?', a: 'We accept all major credit cards, debit cards, and digital wallets.' },
      { q: 'What is your cancellation policy?', a: 'Free cancellation up to 24 hours before the experience starts. Full refund for cancellations made within this window.' },
      { q: 'Will I get a refund if the guide cancels?', a: 'Yes, you will receive a full refund or the option to reschedule if your guide cancels.' }
    ]
  },
  {
    name: 'During the Experience',
    questions: [
      { q: 'What should I bring?', a: 'Your guide will provide specific recommendations upon booking. Generally, bring comfortable shoes, water, and weather-appropriate clothing.' },
      { q: 'Are experiences suitable for children?', a: 'Many experiences are family-friendly. Check the experience details for age recommendations.' },
      { q: 'What if it rains?', a: 'Experiences may proceed in light rain. In case of severe weather, you can reschedule or receive a full refund.' },
      { q: 'Can I customize my experience?', a: 'Yes! Many guides are happy to accommodate special requests. Contact them before booking.' }
    ]
  },
  {
    name: 'For Guides',
    questions: [
      { q: 'How do I become a guide?', a: 'Apply through our "Become a Host" page. We review applications within 48 hours.' },
      { q: 'How much can I earn?', a: 'Earnings depend on your experience type and pricing. Guides typically earn 80-90% of the booking value.' },
      { q: 'When do I get paid?', a: 'Payments are processed within 48 hours after the experience is completed.' },
      { q: 'Do I need insurance?', a: 'We provide basic coverage for guides. Additional insurance is recommended for high-risk activities.' }
    ]
  }
];

const FaqPage: React.FC = () => {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setOpenItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <section className="bg-primary py-20 text-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">FAQ</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Find answers to commonly asked questions about Guides Nepal.
            </p>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              {faqCategories.map((category, catIdx) => (
                <div key={catIdx} className="mb-10">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">{category.name}</h2>
                  <div className="space-y-3">
                    {category.questions.map((item, qIdx) => {
                      const id = `${catIdx}-${qIdx}`;
                      const isOpen = openItems.includes(id);
                      return (
                        <div key={id} className="border border-slate-200 rounded-lg overflow-hidden">
                          <button
                            onClick={() => toggleItem(id)}
                            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                          >
                            <span className="font-medium text-slate-900">{item.q}</span>
                            {isOpen ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                          </button>
                          {isOpen && (
                            <div className="px-4 pb-4 text-slate-600">
                              {item.a}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default FaqPage;