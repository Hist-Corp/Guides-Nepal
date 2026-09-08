import React, { useState } from 'react';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';
import { useCmsSection, useSeoMeta } from '../hooks/useCms';
import { sendContactMessage } from '../services/publicApi';

const ContactPage: React.FC = () => {
  useSeoMeta('contact', 'Contact Us | Guides Nepal');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const cmsHero = useCmsSection('contact', 'contact-hero');
  const cmsInfo = useCmsSection('contact', 'contact-info');

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setSending(true);
    setSent(null);
    try {
      const result = await sendContactMessage({ name, email, subject: subject || 'General inquiry', message });
      setSent(
        result.synced
          ? "Message sent! We'll get back to you within 24 hours."
          : "Message saved — it will be delivered once the connection is restored."
      );
      setName(''); setEmail(''); setSubject(''); setMessage('');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <section data-cms-id="contact-hero" data-cms-label="Contact Hero" className="bg-primary py-20 text-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {cmsHero?.content?.heading || 'Contact Us'}
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              {cmsHero?.content?.subtitle || "Have a question or need help? We're here for you."}
            </p>
          </div>
        </section>

        <section data-cms-id="contact-info" data-cms-label="Contact Info" className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Get in Touch</h2>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Mail className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">Email</h3>
                        <p className="text-slate-600">{cmsInfo?.content?.email || 'support@guides-nepal.com'}</p>
                        <p className="text-slate-500 text-sm">We respond within 24 hours</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Phone className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">Phone</h3>
                        <p className="text-slate-600">{cmsInfo?.content?.phone || '+977-1-1234567'}</p>
                        <p className="text-slate-500 text-sm">Mon-Fri, 9am-6pm NPT</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">Office</h3>
                        <p className="text-slate-600">{cmsInfo?.content?.address || 'Thamel, Kathmandu, Nepal'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <MessageCircle className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">Live Chat</h3>
                        <p className="text-slate-600">Available 24/7</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Send a Message</h2>
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Your name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="your@email.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                      <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="How can we help?" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                      <textarea value={message} onChange={(e) => setMessage(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary h-32 resize-none" placeholder="Tell us more..." />
                    </div>
                    {sent && (
                      <p className="text-sm bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3">{sent}</p>
                    )}
                    <button type="submit" disabled={sending} className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-primary-hover transition-colors disabled:opacity-50">
                      {sending ? 'Sending…' : 'Send Message'}
                    </button>
                  </form>
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

export default ContactPage;