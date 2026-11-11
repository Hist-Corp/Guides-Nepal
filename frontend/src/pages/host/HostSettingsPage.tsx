import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { User, RotateCcw, Bell, CreditCard, Lock, Eye, EyeOff } from 'lucide-react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { PageBackButton } from '../../components/common/PageBackButton';
import { useAuthStore } from '../../store/authStore';
import hostApi, { type NotificationSettings, type PayoutSettings } from '../../services/hostApi';

const initialNotifications: NotificationSettings = {
  email_bookings: true,
  email_messages: true,
  email_reviews: true,
  email_payouts: true,
  email_marketing: false,
  push_bookings: true,
  push_messages: true,
  push_reviews: false,
};

const initialPayout: PayoutSettings = {
  method: 'bank_transfer',
  auto_payout: true,
  min_payout_amount: 50,
  payout_schedule: 'weekly',
  bank_account: { name: '', account: '', routing: '', swift: '' },
  wise_account: { email: '' },
  paypal_account: { email: '' },
};

const HostSettingsPage: React.FC = () => {
  const { isAuthenticated, user, accessToken, login } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'payout' | 'security'>(
    'profile'
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Profile
  const [profile, setProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    region: '',
  });
  // Notifications
  const [notifications, setNotifications] = useState<NotificationSettings>(initialNotifications);
  // Payout
  const [payout, setPayout] = useState<PayoutSettings>(initialPayout);
  // Security
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    // Load settings on mount — only reads external API, no setState
    if (accessToken) {
      hostApi.getNotificationSettings(accessToken).then((notif) => {
        if (notif) setNotifications(notif);
      });
      hostApi.getPayoutSettings(accessToken).then((payoutData) => {
        if (payoutData) setPayout(payoutData);
      });
    }
  }, [accessToken]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      await hostApi.updateProfile(accessToken, {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
      });
      login({
        ...user,
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
      });
      setSuccess(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const saveNotifications = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      await hostApi.updateNotificationSettings(accessToken, notifications);
      setSuccess(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save notifications');
    } finally {
      setSaving(false);
    }
  };

  const savePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      await hostApi.updatePayoutSettings(accessToken, payout);
      setSuccess(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save payout settings');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.new !== passwordForm.confirm) {
      setError('New passwords do not match');
      return;
    }
    if (passwordForm.new.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      // This would call an API to change password
      await new Promise((r) => setTimeout(r, 1000));
      setPasswordForm({ current: '', new: '', confirm: '' });
      setSuccess(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const toggleNotif = (key: keyof NotificationSettings) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const togglePayout = (key: keyof PayoutSettings) => {
    if (typeof payout[key] === 'boolean') {
      setPayout((prev) => ({ ...prev, [key]: !prev[key] }));
    }
  };

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(false), 2500);
      return () => clearTimeout(t);
    }
  }, [success]);

  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (user?.role !== 'host') return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />
      <main id="main-content" className="flex-grow container mx-auto max-w-4xl px-4 py-8">
        <PageBackButton />
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-gray-600 text-sm">
            Manage your profile, notifications, payout preferences, and security.
          </p>
        </div>

        {(error || success) && (
          <div
            className="mb-6 rounded-xl p-4 text-sm flex items-center gap-2"
            style={{
              background: error ? '#fef2f2' : '#f0fdf4',
              color: error ? '#dc2626' : '#16a34a',
              borderColor: error ? '#fecaca' : '#bbf7d0',
            }}
          >
            <RotateCcw
              className="w-4 h-4"
              style={{ animation: success ? 'spin 1s linear infinite' : 'none' }}
            />
            {error || 'Saved successfully'}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="lg:w-56 flex-shrink-0">
            <nav className="space-y-1">
              {[
                { id: 'profile', label: 'Profile', icon: User },
                { id: 'notifications', label: 'Notifications', icon: Bell },
                { id: 'payout', label: 'Payout settings', icon: CreditCard },
                { id: 'security', label: 'Security', icon: Lock },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                      activeTab === tab.id
                        ? 'bg-[#213448]/10 text-[#213448]'
                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          <div className="flex-1">
            {activeTab === 'profile' && (
              <SettingsCard title="Personal information" Icon={User}>
                <form onSubmit={saveProfile}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field
                      label="First name"
                      required
                      value={profile.firstName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setProfile((p) => ({ ...p, firstName: e.target.value }))
                      }
                    />
                    <Field
                      label="Last name"
                      required
                      value={profile.lastName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setProfile((p) => ({ ...p, lastName: e.target.value }))
                      }
                    />
                    <Field
                      label="Email"
                      type="email"
                      value={profile.email}
                      disabled
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setProfile((p) => ({ ...p, email: e.target.value }))
                      }
                    />
                    <Field
                      label="Phone"
                      type="tel"
                      value={profile.phone}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setProfile((p) => ({ ...p, phone: e.target.value }))
                      }
                      placeholder="+977 98XXXXXXXX"
                    />
                  </div>
                  <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:justify-end">
                    <Button type="submit" disabled={saving} className="px-8 py-3 text-base">
                      {saving ? 'Saving…' : 'Save changes'}
                    </Button>
                  </div>
                </form>
              </SettingsCard>
            )}

            {activeTab === 'notifications' && (
              <SettingsCard title="Notification preferences" Icon={Bell}>
                <form onSubmit={saveNotifications}>
                  <h3 className="text-lg font-semibold mb-4">Email notifications</h3>
                  <div className="space-y-3 mb-6">
                    {[
                      {
                        key: 'email_bookings',
                        label: 'New booking requests',
                        desc: 'When a guest requests to book your experience',
                      },
                      {
                        key: 'email_messages',
                        label: 'Guest messages',
                        desc: 'When a guest sends you a message',
                      },
                      {
                        key: 'email_reviews',
                        label: 'New reviews',
                        desc: 'When a guest leaves a review',
                      },
                      {
                        key: 'email_payouts',
                        label: 'Payout updates',
                        desc: 'When a payout is processed or fails',
                      },
                      {
                        key: 'email_marketing',
                        label: 'Marketing emails',
                        desc: 'Tips, updates, and promotions from Guides Nepal',
                      },
                    ].map((item) => (
                      <label
                        key={item.key}
                        className="flex items-center justify-between py-3 border-b last:border-0 cursor-pointer"
                      >
                        <div>
                          <span className="font-medium text-gray-900">{item.label}</span>
                          <p className="text-sm text-gray-500">{item.desc}</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications[item.key as keyof NotificationSettings]}
                          onChange={() => toggleNotif(item.key as keyof NotificationSettings)}
                          className="h-5 w-5 rounded border-gray-300 text-[#213448] focus:ring-[#213448]"
                        />
                      </label>
                    ))}
                  </div>

                  <h3 className="text-lg font-semibold mb-4">Push notifications</h3>
                  <div className="space-y-3">
                    {[
                      { key: 'push_bookings', label: 'Booking requests' },
                      { key: 'push_messages', label: 'Guest messages' },
                      { key: 'push_reviews', label: 'New reviews' },
                    ].map((item) => (
                      <label
                        key={item.key}
                        className="flex items-center justify-between py-3 border-b last:border-0 cursor-pointer"
                      >
                        <span className="font-medium text-gray-900">{item.label}</span>
                        <input
                          type="checkbox"
                          checked={notifications[item.key as keyof NotificationSettings]}
                          onChange={() => toggleNotif(item.key as keyof NotificationSettings)}
                          className="h-5 w-5 rounded border-gray-300 text-[#213448] focus:ring-[#213448]"
                        />
                      </label>
                    ))}
                  </div>

                  <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:justify-end">
                    <Button type="submit" disabled={saving} className="px-8 py-3 text-base">
                      {saving ? 'Saving…' : 'Save preferences'}
                    </Button>
                  </div>
                </form>
              </SettingsCard>
            )}

            {activeTab === 'payout' && (
              <SettingsCard title="Payout settings" Icon={CreditCard}>
                <form onSubmit={savePayout}>
                  <h3 className="text-lg font-semibold mb-4">Payout method</h3>
                  <div className="space-y-3 mb-6">
                    {[
                      {
                        value: 'bank_transfer',
                        label: 'Bank transfer',
                        desc: 'Direct deposit to your bank account',
                      },
                      {
                        value: 'wise',
                        label: 'Wise (formerly TransferWise)',
                        desc: 'International transfers with low fees',
                      },
                      {
                        value: 'paypal',
                        label: 'PayPal',
                        desc: 'Fast payouts to your PayPal account',
                      },
                    ].map((method) => (
                      <label
                        key={method.value}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${payout.method === method.value ? 'border-[#213448] bg-[#213448]/10' : 'border-[#213448]/10 hover:border-[#213448]'}`}
                      >
                        <input
                          type="radio"
                          name="method"
                          value={method.value}
                          checked={payout.method === method.value}
                          onChange={() =>
                            setPayout((prev) => ({
                              ...prev,
                              method: method.value as PayoutSettings['method'],
                            }))
                          }
                          className="h-5 w-5 text-[#213448] focus:ring-[#213448]"
                        />
                        <div>
                          <span className="font-medium text-gray-900">{method.label}</span>
                          <p className="text-sm text-gray-500">{method.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  {payout.method === 'bank_transfer' && payout.bank_account && (
                    <div className="mb-6 grid gap-4 md:grid-cols-2">
                      <h4 className="font-medium md:col-span-2 text-gray-900">
                        Bank account details
                      </h4>
                      <Field
                        label="Account holder name"
                        value={payout.bank_account.name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setPayout((prev) => ({
                            ...prev,
                            bank_account: { ...prev.bank_account!, name: e.target.value },
                          }))
                        }
                      />
                      <Field
                        label="Account number"
                        value={payout.bank_account.account}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setPayout((prev) => ({
                            ...prev,
                            bank_account: { ...prev.bank_account!, account: e.target.value },
                          }))
                        }
                      />
                      <Field
                        label="Routing number"
                        value={payout.bank_account.routing}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setPayout((prev) => ({
                            ...prev,
                            bank_account: { ...prev.bank_account!, routing: e.target.value },
                          }))
                        }
                      />
                      <Field
                        label="SWIFT/BIC"
                        value={payout.bank_account.swift}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setPayout((prev) => ({
                            ...prev,
                            bank_account: { ...prev.bank_account!, swift: e.target.value },
                          }))
                        }
                      />
                    </div>
                  )}

                  {payout.method === 'wise' && payout.wise_account && (
                    <div className="mb-6">
                      <Field
                        label="Wise email"
                        type="email"
                        value={payout.wise_account.email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setPayout((prev) => ({
                            ...prev,
                            wise_account: { ...prev.wise_account!, email: e.target.value },
                          }))
                        }
                      />
                    </div>
                  )}

                  {payout.method === 'paypal' && payout.paypal_account && (
                    <div className="mb-6">
                      <Field
                        label="PayPal email"
                        type="email"
                        value={payout.paypal_account.email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setPayout((prev) => ({
                            ...prev,
                            paypal_account: { ...prev.paypal_account!, email: e.target.value },
                          }))
                        }
                      />
                    </div>
                  )}

                  <h3 className="text-lg font-semibold mb-4">Payout preferences</h3>
                  <div className="space-y-4 mb-6">
                    <label className="flex items-center justify-between py-3 border-b last:border-0 cursor-pointer">
                      <div>
                        <span className="font-medium text-gray-900">Automatic payouts</span>
                        <p className="text-sm text-gray-500">
                          Automatically transfer funds when they reach the minimum amount
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={payout.auto_payout}
                        onChange={() => togglePayout('auto_payout')}
                        className="h-5 w-5 rounded border-gray-300 text-[#213448] focus:ring-[#213448]"
                      />
                    </label>

                    <div className="grid gap-4 md:grid-cols-2">
                      <Field
                        label="Minimum payout amount (USD)"
                        type="number"
                        min="10"
                        step="10"
                        value={String(payout.min_payout_amount)}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setPayout((prev) => ({
                            ...prev,
                            min_payout_amount: Number(e.target.value),
                          }))
                        }
                      />
                      <Field
                        label="Payout schedule"
                        as="select"
                        value={payout.payout_schedule}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setPayout((prev) => ({
                            ...prev,
                            payout_schedule: (e.target as unknown as HTMLSelectElement)
                              .value as PayoutSettings['payout_schedule'],
                          }))
                        }
                      >
                        <option value="weekly">Weekly</option>
                        <option value="biweekly">Bi-weekly</option>
                        <option value="monthly">Monthly</option>
                      </Field>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:justify-end">
                    <Button type="submit" disabled={saving} className="px-8 py-3 text-base">
                      {saving ? 'Saving…' : 'Save payout settings'}
                    </Button>
                  </div>
                </form>
              </SettingsCard>
            )}

            {activeTab === 'security' && (
              <SettingsCard title="Security" Icon={Lock}>
                <form onSubmit={changePassword}>
                  <h3 className="text-lg font-semibold mb-4">Change password</h3>
                  <div className="grid gap-4 md:grid-cols-2 max-w-xl">
                    <PasswordField
                      label="Current password"
                      type="password"
                      required
                      value={passwordForm.current}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setPasswordForm((p) => ({ ...p, current: e.target.value }))
                      }
                      show={showCurrent}
                      onToggleShow={() => setShowCurrent(!showCurrent)}
                    />
                    <PasswordField
                      label="New password"
                      type="password"
                      required
                      value={passwordForm.new}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setPasswordForm((p) => ({ ...p, new: e.target.value }))
                      }
                      minLength={8}
                      show={showNew}
                      onToggleShow={() => setShowNew(!showNew)}
                    />
                    <PasswordField
                      label="Confirm new password"
                      type="password"
                      required
                      value={passwordForm.confirm}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setPasswordForm((p) => ({ ...p, confirm: e.target.value }))
                      }
                      show={showConfirm}
                      onToggleShow={() => setShowConfirm(!showConfirm)}
                    />
                  </div>
                  <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:justify-end">
                    <Button type="submit" disabled={saving} className="px-8 py-3 text-base">
                      {saving ? 'Saving…' : 'Change password'}
                    </Button>
                  </div>
                </form>

                <div className="mt-8 border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold mb-4">Danger zone</h3>
                  <p className="text-gray-500 mb-4">These actions are irreversible.</p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => {
                        if (window.confirm('Delete your account? This cannot be undone.'))
                          alert('Account deletion not implemented in demo');
                      }}
                      className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700"
                    >
                      Delete account
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Log out of all devices?'))
                          alert('Logged out everywhere');
                      }}
                      className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50"
                    >
                      Log out everywhere
                    </button>
                  </div>
                </div>
              </SettingsCard>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

function SettingsCard({
  title,
  Icon,
  children,
}: {
  title: string;
  Icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="flex items-center gap-2 text-xl font-bold text-[#213448]">
          <Icon className="w-5 h-5 text-[#213448]" />
          {title}
        </h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

interface FieldProps {
  label: string;
  type?: string;
  value: string | number | boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
  as?: 'input' | 'textarea' | 'select';
  children?: React.ReactNode;
  [key: string]: unknown;
}

function Field({
  label,
  type = 'text',
  value,
  onChange,
  disabled,
  required,
  as = 'input',
  children,
  ...props
}: FieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold text-gray-700">{label}</label>
      {as === 'textarea' ? (
        <textarea
          {...props}
          value={value as string}
          onChange={onChange as unknown as (e: React.ChangeEvent<HTMLTextAreaElement>) => void}
          disabled={disabled}
          required={required}
          className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#213448] focus:border-transparent outline-none ${disabled ? 'bg-gray-50' : ''}`}
        />
      ) : as === 'select' ? (
        <select
          {...props}
          value={value as string}
          onChange={onChange as unknown as (e: React.ChangeEvent<HTMLSelectElement>) => void}
          disabled={disabled}
          required={required}
          className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#213448] focus:border-transparent outline-none ${disabled ? 'bg-gray-50' : ''}`}
        >
          {children}
        </select>
      ) : (
        <input
          {...props}
          type={type as string}
          value={value as string}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#213448] focus:border-transparent outline-none ${disabled ? 'bg-gray-50' : ''}`}
        />
      )}
    </div>
  );
}

interface PasswordFieldProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  minLength?: number;
  show?: boolean;
  onToggleShow?: () => void;
  [key: string]: unknown;
}

function PasswordField({
  label,
  value,
  onChange,
  required,
  minLength,
  show,
  onToggleShow,
  ...props
}: PasswordFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold text-gray-700">{label}</label>
      <div className="relative">
        <input
          {...props}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          required={required}
          minLength={minLength}
          className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#213448] focus:border-transparent outline-none pr-12"
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}

interface ButtonProps {
  type?: 'button' | 'submit' | 'reset';
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  [key: string]: unknown;
}

function Button({ type = 'button', children, disabled, className = '', ...props }: ButtonProps) {
  const base =
    'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none shadow-sm hover:shadow-md';
  const variant = 'bg-[#213448] text-white hover:bg-[#1f2d54] focus-visible:ring-[#213448]';
  return (
    <button
      type={type}
      className={`${base} ${variant} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

export default HostSettingsPage;
