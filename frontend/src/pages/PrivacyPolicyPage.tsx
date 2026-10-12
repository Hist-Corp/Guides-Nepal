import React from 'react';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { PageBackButton } from '../components/common/PageBackButton';

const PrivacyPolicyPage: React.FC = () => {
  return (
      <div className="min-h-screen bg-gray-50 font-sans">
        <Header />
        <PageBackButton className="max-w-4xl" />

        <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-gray-500 mb-8">Last updated: January 24, 2026</p>
          
          <div className="prose prose-lg text-gray-600 max-w-none">
            <p className="mb-6">
              Guides-Nepal ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website guides-nepal.com, use our mobile application, or engage with our services.
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. Information We Collect</h2>
              <p className="mb-3">
                We collect information that identifies, relates to, describes, references, is capable of being associated with, or could reasonably be linked, directly or indirectly, with a particular consumer or device.
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Personal Information:</strong> Name, email address, phone number, billing address, and payment information when you book an experience.</li>
                <li><strong>Profile Information:</strong> Bio, profile photo, and preferences if you create a user or host account.</li>
                <li><strong>Communication Data:</strong> Messages sent between users and guides through our platform.</li>
                <li><strong>Technical Data:</strong> IP address, browser type, device information, and operating system.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. How We Use Your Information</h2>
              <p className="mb-3">
                We use the collected information for various purposes, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>To facilitate bookings and payments between travelers and local guides.</li>
                <li>To verify identities and maintain the safety and security of our platform.</li>
                <li>To improve our website, services, marketing, and user experience.</li>
                <li>To send administrative information, such as booking confirmations and policy updates.</li>
                <li>To provide customer support and respond to inquiries.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. Sharing Your Information</h2>
              <p className="mb-3">
                We may share your information with:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Service Providers:</strong> Third-party vendors who perform services for us (e.g., payment processing, data analysis, email delivery).</li>
                <li><strong>Hosts/Guides:</strong> Necessary information (like name and travel details) is shared with the guide you book with.</li>
                <li><strong>Legal Requirements:</strong> If required by law or in response to valid requests by public authorities.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. Data Security</h2>
              <p className="mb-4">
                We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-3">5. Your Privacy Rights</h2>
              <p className="mb-4">
                Depending on your location, you may have the right to access, correct, delete, or restrict the use of your personal data. You can manage your communication preferences and update your profile information directly through your account settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-3">6. Contact Us</h2>
              <p className="mb-4">
                If you have questions or comments about this Privacy Policy, please contact us at:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 inline-block">
                <p className="font-medium text-gray-900">Guides-Nepal Privacy Team</p>
                <p>Email: privacy@guides-nepal.com</p>
                <p>Address: Thamel, Kathmandu, Nepal</p>
              </div>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;
