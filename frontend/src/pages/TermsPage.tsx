import React from 'react';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';

const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <section className="bg-primary py-20 text-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Last updated: January 2026
            </p>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto prose prose-slate">
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Acceptance of Terms</h2>
                  <p className="text-slate-600">By accessing and using Guides Nepal, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.</p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Description of Service</h2>
                  <p className="text-slate-600">Guides Nepal is a platform that connects travelers with local guides offering experiences in Nepal. We facilitate bookings and payments between travelers and guides.</p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">3. User Accounts</h2>
                  <p className="text-slate-600">You must create an account to book experiences. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Booking and Payment</h2>
                  <p className="text-slate-600">All bookings are subject to availability. Payment is required at the time of booking. Prices are listed in the local currency and may vary based on group size and customization.</p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Cancellation Policy</h2>
                  <p className="text-slate-600">Free cancellation is available up to 24 hours before the scheduled experience. Cancellations made within 24 hours may be subject to a cancellation fee. No-shows are not eligible for refunds.</p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Guide Responsibilities</h2>
                  <p className="text-slate-600">Guides are responsible for providing safe, accurate, and enjoyable experiences. They must maintain appropriate licenses and insurance for their activities.</p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Traveler Responsibilities</h2>
                  <p className="text-slate-600">Travelers must arrive on time, follow safety instructions, and treat guides and local communities with respect. Travelers are responsible for their own travel insurance.</p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Limitation of Liability</h2>
                  <p className="text-slate-600">Guides Nepal acts as a platform connecting travelers and guides. We are not liable for any injuries, losses, or damages that occur during experiences.</p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Intellectual Property</h2>
                  <p className="text-slate-600">All content on Guides Nepal, including text, images, and logos, is protected by intellectual property laws. Users may not reproduce or distribute content without permission.</p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">10. Changes to Terms</h2>
                  <p className="text-slate-600">We reserve the right to modify these terms at any time. Changes will be posted on this page with an updated date. Continued use of the platform constitutes acceptance of the modified terms.</p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">11. Contact</h2>
                  <p className="text-slate-600">For questions about these terms, please contact us at legal@guides-nepal.com.</p>
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

export default TermsPage;