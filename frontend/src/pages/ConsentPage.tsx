import React from 'react';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';

const ConsentPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header />
      
      <main id="main-content" className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">Consent & Privacy Preferences</h1>
          
          <div className="prose prose-lg text-gray-600 max-w-none">
            <p className="mb-6">
              At Guides-Nepal, we value your privacy and believe in transparency. This page outlines how we handle your data and gives you control over your preferences.
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Data Collection & Usage</h2>
              <p className="mb-4">
                We collect information to provide you with better services, personalized experiences, and to improve our platform. This includes:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Account Information:</strong> Name, email, and profile details you provide.</li>
                <li><strong>Usage Data:</strong> How you interact with our website, including pages visited and time spent.</li>
                <li><strong>Booking Details:</strong> Information related to tours and experiences you book.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Cookie Policy</h2>
              <p className="mb-4">
                We use cookies to enhance your browsing experience. Cookies help us remember your login status, preferences, and understand how you use our site.
              </p>
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-3">Manage Cookie Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <input type="checkbox" id="necessary" checked disabled className="mt-1 w-5 h-5 text-primary rounded focus:ring-primary" />
                    <div>
                      <label htmlFor="necessary" className="font-medium text-gray-900 block">Strictly Necessary Cookies</label>
                      <p className="text-sm text-gray-500">Essential for the website to function properly. Cannot be disabled.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <input type="checkbox" id="analytics" defaultChecked className="mt-1 w-5 h-5 text-primary rounded focus:ring-primary" />
                    <div>
                      <label htmlFor="analytics" className="font-medium text-gray-900 block">Analytics Cookies</label>
                      <p className="text-sm text-gray-500">Help us improve our website by collecting and reporting information on how you use it.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <input type="checkbox" id="marketing" className="mt-1 w-5 h-5 text-primary rounded focus:ring-primary" />
                    <div>
                      <label htmlFor="marketing" className="font-medium text-gray-900 block">Marketing Cookies</label>
                      <p className="text-sm text-gray-500">Used to track visitors across websites to display relevant ads.</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <button className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-6 rounded-full transition-colors">
                    Save Preferences
                  </button>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Third-Party Services</h2>
              <p className="mb-4">
                We may share anonymized data with trusted third-party partners for analytics and service improvement. We never sell your personal data to advertisers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Your Rights</h2>
              <p className="mb-4">
                You have the right to access, correct, or delete your personal data. If you wish to exercise these rights or have any questions, please contact our support team.
              </p>
              <p>
                For more detailed information, please read our <a href="/privacy" className="text-primary hover:underline font-medium">Privacy Policy</a>.
              </p>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ConsentPage;
