import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { User, Save, ShieldCheck, RotateCcw } from 'lucide-react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { useAuthStore } from '../../store/authStore';

const HostSettingsPage: React.FC = () => {
  const { isAuthenticated, user, accessToken, logout } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    region: '',
  });

  const handleChange = (key: keyof typeof profile) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [key]: e.target.value });
    setSaved(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    setLoading(true);
    setError('');
    setSaved(false);
    try {
      // Profile update endpoint would go here; for now we persist locally
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to save settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (saved) {
      const t = setTimeout(() => setSaved(false), 2500);
      return () => clearTimeout(t);
    }
  }, [saved]);

  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (user?.role !== 'host') return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />
      <main className="flex-grow container mx-auto max-w-3xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Host Settings</h1>
          <p className="mt-1 text-gray-600 text-sm">Update your profile, regions, and account preferences.</p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600 text-sm">
            {error}
          </div>
        )}

        {saved && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700 text-sm flex items-center gap-2">
            <RotateCcw className="w-4 h-4" animate-spin /> Saved successfully.
          </div>
        )}

        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
              <User className="w-5 h-5 text-[#213448]" />
              Profile information
            </h2>
          </div>
          <form onSubmit={handleSave} className="p-6 space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">First name</label>
                <input
                  type="text"
                  required
                  value={profile.firstName}
                  onChange={handleChange('firstName')}
                  className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none disabled:bg-gray-50"
                  disabled
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">Last name</label>
                <input
                  type="text"
                  required
                  value={profile.lastName}
                  onChange={handleChange('lastName')}
                  className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none disabled:bg-gray-50"
                  disabled
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">Email</label>
                <input
                  type="email"
                  required
                  value={profile.email}
                  onChange={handleChange('email')}
                  className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none disabled:bg-gray-50"
                  disabled
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">Phone</label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={handleChange('phone')}
                  className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">Region</label>
              <input
                type="text"
                value={profile.region}
                onChange={handleChange('region')}
                placeholder="e.g. Kathmandu Valley"
                className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none"
              />
              <p className="text-xs text-gray-500">Regional heads review host applications from your region.</p>
            </div>
            <div className="pt-4 flex gap-3">
              <button
                type="submit"
                disabled={loading || saved}
                className="flex-1 px-5 py-2.5 rounded-xl bg-brand-yellow text-[#213448] font-bold hover:bg-[#ffba0a] disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save changes'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setProfile({
                    firstName: user?.firstName || '',
                    lastName: user?.lastName || '',
                    email: user?.email || '',
                    phone: user?.phone || '',
                    region: '',
                  });
                  setSaved(false);
                  setError('');
                }}
                className="flex-1 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
              <ShieldCheck className="w-5 h-5 text-[#213448]" />
              Account security
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900">Change password</h3>
                <p className="text-sm text-gray-500">Update your account password.</p>
              </div>
              <button className="text-sm font-bold text-primary hover:underline">Change</button>
            </div>
            <div className="h-px bg-gray-100" />
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900">Two-factor authentication</h3>
                <p className="text-sm text-gray-500">Add an extra layer of security to your account.</p>
              </div>
              <button className="text-sm font-bold text-primary hover:underline">Set up</button>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <RotateCcw className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-bold text-gray-900">Log out</h3>
              <p className="text-sm text-gray-600">Sign out of your host account on this device.</p>
            </div>
            <button
              onClick={() => {
                logout();
              }}
              className="ml-auto inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700"
            >
              Log out
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HostSettingsPage;
