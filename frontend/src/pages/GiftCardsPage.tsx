import React, { useState } from 'react';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { Gift, Heart, PartyPopper, Sparkles } from 'lucide-react';

const giftCardAmounts = [25, 50, 100, 200];

const GiftCardsPage: React.FC = () => {
  const [selectedAmount, setSelectedAmount] = useState(50);
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [message, setMessage] = useState('');

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <section className="bg-gradient-to-r from-primary to-primary-hover py-20 text-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Gift Cards</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Give the gift of authentic local experiences in Nepal.
            </p>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="flex flex-col items-center">
                  <div className="w-80 h-48 bg-gradient-to-br from-primary to-primary-hover rounded-2xl shadow-xl p-6 text-white flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <Gift className="w-8 h-8" />
                      <span className="font-bold text-lg">Guides Nepal</span>
                    </div>
                    <div>
                      <div className="text-3xl font-bold">${selectedAmount}</div>
                      <div className="text-sm text-white/80">Gift Card</div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Sparkles className="w-4 h-4" />
                      <span>Valid for all experiences</span>
                    </div>
                  </div>
                  <p className="text-slate-500 text-sm mt-4 text-center">Preview of your gift card</p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Purchase Gift Card</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Select Amount</label>
                      <div className="grid grid-cols-4 gap-2">
                        {giftCardAmounts.map((amount) => (
                          <button
                            key={amount}
                            onClick={() => setSelectedAmount(amount)}
                            className={`py-3 rounded-lg font-bold transition-colors ${
                              selectedAmount === amount
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 text-slate-700 hover:bg-gray-200'
                            }`}
                          >
                            ${amount}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Recipient Name</label>
                      <input
                        type="text"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Enter recipient's name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Recipient Email</label>
                      <input
                        type="email"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Enter recipient's email"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Personal Message</label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary h-24 resize-none"
                        placeholder="Add a personal message..."
                      />
                    </div>
                    <button className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-primary-hover transition-colors">
                      Purchase Gift Card - ${selectedAmount}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default GiftCardsPage;