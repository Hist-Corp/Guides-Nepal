import React from 'react';
import { Link } from 'react-router-dom';
import { useCmsSection } from '../../hooks/useCms';

const SOCIAL_LOGOS: Record<string, string> = {
  facebook: '/images/facebook.png',
  x: '/images/x.png',
  linkedin: '/images/linkedin.png',
  whatsapp: '/images/whatsapp.png',
};

export const Footer: React.FC = () => {
  const cmsFooter = useCmsSection('home', 'home-footer');
  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
  const pageText = typeof document !== 'undefined' ? document.title : 'Guides Nepal';

  const socialShares = [
    {
      imgSrc: SOCIAL_LOGOS.facebook,
      color: '#1877F2',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`,
      label: 'Share on Facebook',
    },
    {
      imgSrc: SOCIAL_LOGOS.x,
      color: '#000000',
      url: `https://x.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(pageText)}`,
      label: 'Share on X',
    },
    {
      imgSrc: SOCIAL_LOGOS.linkedin,
      color: '#0A66C2',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`,
      label: 'Share on LinkedIn',
    },
    {
      imgSrc: SOCIAL_LOGOS.whatsapp,
      color: '#25D366',
      url: `https://wa.me/?text=${encodeURIComponent(`${pageText} ${pageUrl}`)}`,
      label: 'Share on WhatsApp',
    },
  ];

  const shareOn = (url: string) => {
    const w = 600;
    const h = 400;
    const left = (window.screen.width - w) / 2;
    const top = (window.screen.height - h) / 2;
    window.open(
      url,
      'share',
      `width=${w},height=${h},top=${top},left=${left},resizable=yes,scrollbars=yes`
    );
  };

  return (
    <footer data-cms-id="home-footer" data-cms-label="Footer">
      {/* Top gradient strip */}
      <div className="bg-gradient-to-r from-primary to-primary/80 py-6">
        <div className="container mx-auto px-4 flex flex-wrap justify-between items-center text-white gap-4">
          <div className="flex gap-6 font-semibold text-sm">
            <Link to="/about" className="hover:underline underline-offset-4">
              About
            </Link>
            <Link to="/help" className="hover:underline underline-offset-4">
              Help
            </Link>
            <Link to="/hosting" className="hover:underline underline-offset-4">
              Hosting
            </Link>
            <Link to="/community" className="hover:underline underline-offset-4">
              Community
            </Link>
          </div>
          <div className="text-sm opacity-90">Join millions of people who love travel</div>
        </div>
      </div>

      <div className="bg-peach pt-16 pb-8 border-t border-slate-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            {/* Company */}
            <div>
              <h4 className="font-bold text-slate-900 mb-5 text-sm uppercase tracking-wide">
                About Guides Nepal
              </h4>
              <ul className="space-y-3 text-sm text-slate-600">
                <li>
                  <Link to="/about" className="hover:text-primary transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/careers" className="hover:text-primary transition-colors">
                    Jobs
                  </Link>
                </li>
                <li>
                  <Link to="/blog" className="hover:text-primary transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link to="/press" className="hover:text-primary transition-colors">
                    Press
                  </Link>
                </li>
                <li>
                  <Link to="/sustainability" className="hover:text-primary transition-colors">
                    Sustainability
                  </Link>
                </li>
              </ul>
            </div>

            {/* For guests */}
            <div>
              <h4 className="font-bold text-slate-900 mb-5 text-sm uppercase tracking-wide">
                For guests
              </h4>
              <ul className="space-y-3 text-sm text-slate-600">
                <li>
                  <Link to="/search" className="hover:text-primary transition-colors">
                    Search experiences
                  </Link>
                </li>
                <li>
                  <Link to="/destinations" className="hover:text-primary transition-colors">
                    Destinations
                  </Link>
                </li>
                <li>
                  <Link to="/how-it-works" className="hover:text-primary transition-colors">
                    How it works
                  </Link>
                </li>
                <li>
                  <Link to="/gift-cards" className="hover:text-primary transition-colors">
                    Gift cards
                  </Link>
                </li>
              </ul>
            </div>

            {/* Become an agency */}
            <div>
              <h4 className="font-bold text-slate-900 mb-5 text-sm uppercase tracking-wide">
                Become an agency
              </h4>
              <ul className="space-y-3 text-sm text-slate-600">
                <li>
                  <Link to="/agency-application" className="hover:text-primary transition-colors">
                    Become an agency
                  </Link>
                </li>
                <li>
                  <Link to="/agency-center" className="hover:text-primary transition-colors">
                    Agency center
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-bold text-slate-900 mb-5 text-sm uppercase tracking-wide">
                Support
              </h4>
              <ul className="space-y-3 text-sm text-slate-600">
                <li>
                  <Link to="/contact" className="hover:text-primary transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="hover:text-primary transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-primary transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="hover:text-primary transition-colors">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <img
                src="/images/footerguidesnepal.png"
                alt="Guides Nepal footer logo"
                className="object-contain shrink-0"
                style={{ maxWidth: '160px', maxHeight: '28px' }}
              />
              <span className="text-xs text-slate-500">
                © {new Date().getFullYear()}{' '}
                {cmsFooter?.content?.copyright || 'guides-nepal. All rights reserved.'}
              </span>
            </div>
            <div className="flex gap-3">
              {socialShares.map(({ imgSrc, color, url, label }) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.preventDefault();
                    shareOn(url);
                  }}
                  className={`w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-[${color}] hover:bg-[${color}] hover:text-white transition-colors`}
                  aria-label={label}
                >
                  <img src={imgSrc} alt={label} className="w-6 h-6" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
