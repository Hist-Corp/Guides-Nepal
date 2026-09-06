import React, { useState } from 'react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { Button } from '../../components/common/Button';
import { 
  Calendar, Tag, Sparkles, Facebook, Instagram, 
  CheckCircle2, Globe, Shield, Zap, Star, ChevronDown, ChevronUp, ArrowRight, Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BecomeHostPage: React.FC = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    { question: "What is an experience?", answer: "An experience is an activity that goes beyond the typical tour or class, designed and led by locals all over the world. Show off your city, craft, cause, or culture by hosting an experience." },
    { question: "What can I host?", answer: "You can host a food tour, a workshop, a city walk, a day trip, or any unique activity that shares your passion and local knowledge." },
    { question: "Do I need to be an experienced host?", answer: "No! You just need passion for your city and a desire to meet new people. We provide the tools and support to help you succeed." },
    { question: "Do I need insurance?", answer: "We recommend checking your local regulations. However, Guides Nepal provides liability insurance for most experiences hosted on our platform." },
    { question: "How do I get paid?", answer: "We offer secure payouts directly to your bank account or via other payment methods, processed shortly after the experience takes place." },
    { question: "Is it safe to host travelers?", answer: "Safety is our priority. We verify travelers and hosts, and our review system builds trust within the community." }
  ];

  return (
    <div className="min-h-screen font-sans bg-white text-gray-900">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[600px] flex flex-col items-center pt-20 overflow-hidden">
         {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1531572753322-ad063cecc140?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80" 
            alt="Become a host" 
            className="w-full h-full object-cover object-top"
          />
          {/* Gradient to ensure text readability if needed */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-transparent h-1/2"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center mt-10">
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Share your city. <span className="text-brand-yellow">Earn money.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-700 mb-8 font-medium">
            <span className="text-brand-yellow font-bold">#GuidesNepal</span> helps you turn your passion into income.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <div className="relative">
                <input 
                    type="text" 
                    placeholder="Find your city to get started" 
                    className="w-full h-14 pl-12 pr-4 rounded-full border border-gray-200 shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow text-gray-700"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          </div>
        </div>
      </section>

      {/* Earn Money Section */}
      <section className="py-24 bg-[#FFF8F0]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-brand-yellow font-bold border-b-2 border-brand-yellow pb-1 uppercase tracking-wider text-sm">Earn money</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-6 mb-4">Earn money doing what you love in your city</h2>
            <p className="text-gray-600 max-w-3xl mx-auto text-lg">
              Guides Nepal lets you share your local knowledge and passions by creating unique experiences for travelers. Set your own schedule and earn money doing what you love.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                icon: <Calendar className="w-8 h-8 text-brand-yellow" />, 
                title: "Set your own schedule", 
                desc: "Host when it works for you — weekdays, weekends, mornings or nights." 
              },
              { 
                icon: <Tag className="w-8 h-8 text-brand-yellow" />, 
                title: "Set your own price", 
                desc: "Decide what your experience costs and adjust anytime to match demand." 
              },
              { 
                icon: <Sparkles className="w-8 h-8 text-brand-yellow" />, 
                title: "Design unique experiences", 
                desc: "Create something special that reflects your passions and your city's soul." 
              }
            ].map((item, i) => (
              <div key={i} className="bg-white p-10 rounded-3xl shadow-lg hover:shadow-xl transition-shadow text-center group">
                <div className="w-20 h-20 mx-auto bg-brand-yellow/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-brand-yellow font-bold border-b-2 border-brand-yellow pb-1 uppercase tracking-wider text-sm">Global community</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-6 mb-4">Thousands of local hosts. One global community.</h2>
            <p className="text-gray-600 max-w-3xl mx-auto text-lg flex items-center justify-center gap-4">
              At Guides Nepal, we're a diverse community of locals sharing authentic experiences.
              <span className="flex gap-2 text-gray-400">
                <Facebook className="w-5 h-5 hover:text-brand-yellow cursor-pointer" />
                <Instagram className="w-5 h-5 hover:text-brand-yellow cursor-pointer" />
              </span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Mina Gloria",
                quote: "When I host with Guides Nepal, I feel like I'm traveling the world right from my own city. I've made friends from everywhere!",
                img: "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&h=100&q=80"
              },
              {
                name: "Jaafar",
                quote: "Guides Nepal allows me to show the real side of my city. I'm proud to be part of it and share my culture.",
                img: "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&h=100&q=80"
              },
              {
                name: "Zsofia",
                quote: "Hosting with Guides Nepal feels like doing what I love, not just a job. The flexibility is amazing for my lifestyle.",
                img: "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&h=100&q=80"
              }
            ].map((host, i) => (
              <div key={i} className="relative group overflow-hidden rounded-3xl h-96 shadow-lg cursor-pointer">
                <img src={host.img} alt={host.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-8 text-white">
                  <p className="text-lg italic font-medium mb-4 opacity-90">"{host.quote}"</p>
                  <h3 className="text-2xl font-bold font-serif">{host.name}</h3>
                  <p className="text-xs uppercase tracking-widest opacity-70 mt-1">Local Host</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Originals Section */}
      <section className="py-24 bg-[#FFF8F0]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-brand-yellow font-bold border-b-2 border-brand-yellow pb-1 uppercase tracking-wider text-sm">Originals</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-6 mb-4">Start hosting fast with Guides Nepal Originals!</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Ready-made experiences you can personalize and launch quickly. No need to start from scratch!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                category: "Food & Drinks",
                title: "The 10 Tastings Tour",
                img: "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
              },
              {
                category: "History & Culture",
                title: "Highlights & Hidden Gems",
                img: "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
              },
              {
                category: "Off the Beaten Track",
                title: "City Unscripted",
                img: "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
              }
            ].map((card, i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-xl hover:-translate-y-2 transition-transform duration-300 flex flex-col">
                <div className="h-64 relative">
                  <img src={card.img} alt={card.title} className="w-full h-full object-cover" />
                  <div className="absolute top-4 left-4 bg-brand-yellow text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                    {card.category}
                  </div>
                </div>
                <div className="p-8 flex flex-col flex-grow text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{card.title}</h3>
                  <p className="text-gray-500 text-sm mb-6">Personalize this template</p>
                  <Button className="mt-auto w-full bg-brand-yellow hover:bg-yellow-600 text-white font-bold rounded-full py-3 border-none">
                    Apply now
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <a href="#" className="text-brand-yellow font-bold hover:underline inline-flex items-center gap-2">
              Looking for your own idea? Apply now to launch your Original! <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-brand-yellow font-bold border-b-2 border-brand-yellow pb-1 uppercase tracking-wider text-sm">Operating since 2013</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-6 mb-16">One platform. All the tools to succeed.</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 max-w-6xl mx-auto">
            {[
              { icon: <Calendar />, title: "Set your own schedule", desc: "Host at times that suit you." },
              { icon: <Globe />, title: "Work from anywhere", desc: "Host in your city and manage on the go." },
              { icon: <Sparkles />, title: "Create unique experiences", desc: "Design and customize your offerings." },
              { icon: <Zap />, title: "Get paid fast", desc: "Secure payouts with reliable systems." },
              { icon: <Shield />, title: "We've got your back", desc: "Support when things go wrong." },
              { icon: <Star />, title: "Grow your audience", desc: "Marketing to help travelers discover you." },
              { icon: <CheckCircle2 />, title: "Build trust with reviews", desc: "A transparent rating system." },
              { icon: <Facebook />, title: "Expert guidance", desc: "Get tips and best practices from our team." }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-start p-4">
                <div className="w-12 h-12 bg-brand-yellow/10 rounded-xl flex items-center justify-center text-brand-yellow mb-4">
                  {React.cloneElement(item.icon as React.ReactElement, { className: "w-6 h-6" })}
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section id="apply-form" className="py-24 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-40">
           <img src="https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80" className="w-full h-full object-cover" alt="Background" />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center text-white">
          <span className="text-brand-yellow font-bold border-b-2 border-brand-yellow pb-1 uppercase tracking-wider text-sm">Become a host</span>
          <h2 className="text-4xl md:text-6xl font-bold mt-8 mb-10">It only takes a minute to apply</h2>
          <Button 
            className="bg-brand-yellow hover:bg-[#E5A800] text-[#213448] px-12 py-5 rounded-full text-xl font-bold border-none shadow-2xl hover:scale-105 transition-transform"
            onClick={() => navigate('/host-application')}
          >
            Apply now
          </Button>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-[#FFF8F0]">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-16">
            <span className="text-[#213448] font-bold border-b-2 border-[#213448] pb-1 uppercase tracking-wider text-sm">Questions?</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-6">You can count on us - we are here to help!</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <button 
                  className="w-full px-8 py-6 flex items-center justify-between text-left font-bold text-gray-900 hover:text-[#213448] transition-colors"
                  onClick={() => toggleFaq(i)}
                >
                  {faq.question}
                  {openFaq === i ? <ChevronUp className="w-5 h-5 text-[#213448]" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </button>
                {openFaq === i && (
                  <div className="px-8 pb-8 text-gray-600 leading-relaxed animate-in fade-in slide-in-from-top-2">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Links */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Join our community here!</h2>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm text-gray-500 font-medium">
            {["Amsterdam", "Barcelona", "Berlin", "Lisbon", "London", "Paris", "Rome", "Bangkok", "Singapore", "Kathmandu", "Pokhara"].map((city, i) => (
              <a key={i} href="#" className="hover:text-brand-yellow transition-colors">{city}</a>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BecomeHostPage;
