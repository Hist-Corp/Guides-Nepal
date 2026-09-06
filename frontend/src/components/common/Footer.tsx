import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { useCmsSection } from '../../hooks/useCms';

export const Footer: React.FC = () => {
  const cmsFooter = useCmsSection('home', 'home-footer');
  return (
    <footer>
      {/* Magenta Strip (OCR Requirement) */}
      <div className="bg-primary py-8">
        <div className="container mx-auto px-4 flex flex-wrap justify-between items-center text-white gap-4">
           <div className="flex gap-8 font-bold text-sm">
             <Link to="/about" className="hover:underline">About</Link>
             <Link to="/help" className="hover:underline">Help</Link>
             <Link to="/hosting" className="hover:underline">Hosting</Link>
             <Link to="/community" className="hover:underline">Community</Link>
           </div>
           <div className="text-sm opacity-90">
             Join millions of people who love travel
           </div>
        </div>
      </div>

      <div className="bg-peach pt-16 pb-8 border-t border-slate-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Company */}
          <div>
            <h4 className="font-bold text-slate-900 mb-4">About Withlocals</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/careers" className="hover:text-primary transition-colors">Jobs</Link></li>
              <li><Link to="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
              <li><Link to="/press" className="hover:text-primary transition-colors">Press</Link></li>
              <li><Link to="/sustainability" className="hover:text-primary transition-colors">Sustainability</Link></li>
            </ul>
          </div>

          {/* For guests */}
          <div>
            <h4 className="font-bold text-slate-900 mb-4">For guests</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><Link to="/search" className="hover:text-primary transition-colors">Search experiences</Link></li>
              <li><Link to="/destinations" className="hover:text-primary transition-colors">Destinations</Link></li>
              <li><Link to="/how-it-works" className="hover:text-primary transition-colors">How it works</Link></li>
              <li><Link to="/gift-cards" className="hover:text-primary transition-colors">Gift cards</Link></li>
            </ul>
          </div>

          {/* Become a host */}
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Become a host</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><Link to="/host" className="hover:text-primary transition-colors">Become a host</Link></li>
              <li><Link to="/host-center" className="hover:text-primary transition-colors">Host center</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link to="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
             <span className="text-primary font-bold text-lg">guides-nepal</span>
             <span className="text-xs text-slate-500">© {new Date().getFullYear()} {cmsFooter?.content?.copyright || "guides-nepal. All rights reserved."}</span>
          </div>
          <div className="flex gap-4">
            <a href="#" className="text-slate-400 hover:text-primary transition-colors"><Facebook className="w-5 h-5" /></a>
            <a href="#" className="text-slate-400 hover:text-primary transition-colors"><Twitter className="w-5 h-5" /></a>
            <a href="#" className="text-slate-400 hover:text-primary transition-colors"><Instagram className="w-5 h-5" /></a>
            <a href="#" className="text-slate-400 hover:text-primary transition-colors"><Linkedin className="w-5 h-5" /></a>
          </div>
        </div>
      </div>
      </div>
    </footer>
  );
};

export default Footer;
