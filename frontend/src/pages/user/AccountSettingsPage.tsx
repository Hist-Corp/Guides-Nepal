import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { useAuthStore } from '../../store/authStore';
import {
  User as UserIcon,
  Mail,
  Phone,
  Camera,
  Lock,
  LogOut,
  Check,
  AlertCircle,
  UserCog,
  Eye,
  EyeOff,
} from 'lucide-react';

const API_BASE = `${import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api/v1' : 'https://guides-nepal.onrender.com/api/v1')}`;

const AccountSettingsPage: React.FC = () => {
  const { user, login, accessToken, logout } = useAuthStore();
  const navigate = useNavigate();
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  // Profile form state
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: '',
  });
  const [avatarUrl, setAvatarUrl] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  // Load the latest profile from the backend on mount
  useEffect(() => {
    const load = async () => {
      try {
        const headers: Record<string, string> = {};
        if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
        const res = await fetch(`${API_BASE}/profile/me`, { headers });
        if (!res.ok) return;
        const data = await res.json();
        setForm({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phone: data.phone || '',
          bio: data.bio || '',
        });
        setAvatarUrl(data.avatarUrl || '');
      } catch {
        // keep local values if the request fails
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
      const res = await fetch(`${API_BASE}/profile/me`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          bio: form.bio,
          avatar_url: avatarUrl,
        }),
      });
      if (res.ok) {
        login({ firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone });
        setProfileMsg({ type: 'ok', text: 'Profile updated successfully.' });
      } else {
        const data = await res.json().catch(() => ({}));
        setProfileMsg({ type: 'error', text: data.detail || 'Failed to update profile.' });
      }
    } catch {
      setProfileMsg({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    try {
      const formData = new FormData();
      formData.append('file', file);
      const headers: Record<string, string> = {};
      if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
      const res = await fetch(`${API_BASE}/profile/photos/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setAvatarUrl(data.url);
      } else {
        const reader = new FileReader();
        reader.onload = (r) => r.target?.result && setAvatarUrl(r.target.result as string);
        reader.readAsDataURL(file);
      }
    } catch {
      const reader = new FileReader();
      reader.onload = (r) => r.target?.result && setAvatarUrl(r.target.result as string);
      reader.readAsDataURL(file);
    } finally {
      e.target.value = '';
    }
  };

  const handleChangePassword = async () => {
    setPwMsg(null);
    if (newPassword.length < 8) {
      setPwMsg({ type: 'error', text: 'New password must be at least 8 characters.' });
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setPwMsg({ type: 'error', text: 'New password must contain at least one uppercase letter.' });
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      setPwMsg({ type: 'error', text: 'New password must contain at least one number.' });
      return;
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};:,.<>?]/.test(newPassword)) {
      setPwMsg({ type: 'error', text: 'New password must contain at least one special character (!@#$%^&*).' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwMsg({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }
    setSavingPassword(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setPwMsg({ type: 'ok', text: 'Password updated successfully.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPwMsg({ type: 'error', text: data.detail || 'Failed to update password.' });
      }
    } catch {
      setPwMsg({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const inputClass =
    'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow';
  const labelClass = 'block text-xs font-bold text-gray-600 uppercase mb-1';
  const eyeButtonClass =
    'absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans overflow-x-clip">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="mb-2">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <UserCog className="w-6 h-6 text-primary" /> Account Settings
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your personal details, avatar, and password.
            </p>
          </div>

          {/* Profile Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Profile Information</h2>

            {profileMsg && (
              <div
                className={`mb-4 flex items-start gap-2 rounded-lg px-3 py-2 text-sm ${
                  profileMsg.type === 'ok'
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}
              >
                {profileMsg.type === 'ok' ? <Check className="w-4 h-4 mt-0.5 shrink-0" /> : <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />}
                <span className="min-w-0 break-words">{profileMsg.text}</span>
              </div>
            )}

            {/* Avatar row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3 mb-6">
              <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden border border-gray-300 flex items-center justify-center shrink-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                ) : user?.firstName ? (
                  <span className="font-bold text-xl text-gray-700">{user.firstName[0]}</span>
                ) : (
                  <UserIcon className="w-8 h-8 text-gray-500" />
                )}
              </div>
              <button
                onClick={() => avatarInputRef.current?.click()}
                className="px-3 py-2 rounded-full bg-gray-100 text-gray-800 text-sm font-bold flex items-center gap-2 hover:bg-gray-200 transition-colors"
              >
                <Camera className="w-4 h-4 shrink-0" /> Change photo
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onAvatarChange}
              />
            </div>

            {/* Name / contact fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-4">
              <div>
                <label className={labelClass}>First Name</label>
                <input className={inputClass} value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Last Name</label>
                <input className={inputClass} value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input type="email" className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input className={inputClass} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+977-XXXXXXXXXX" />
              </div>
            </div>

            {/* Bio — full width below the grid */}
            <div className="mt-4">
              <label className={labelClass}>Bio</label>
              <textarea
                rows={3}
                className={inputClass + ' resize-y'}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Tell us about your travel preferences..."
              />
            </div>

            <div className="mt-6">
              <button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="w-full sm:w-auto text-center px-6 py-2 rounded-full bg-primary text-white text-sm font-bold hover:bg-primary-hover disabled:opacity-50"
              >
                {savingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" /> Change Password
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Must be at least 8 characters with an uppercase letter, a number, and a special character.
            </p>

            {pwMsg && (
              <div
                className={`mb-4 flex items-start gap-2 rounded-lg px-3 py-2 text-sm ${
                  pwMsg.type === 'ok'
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}
              >
                {pwMsg.type === 'ok' ? <Check className="w-4 h-4 mt-0.5 shrink-0" /> : <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />}
                <span className="min-w-0 break-words">{pwMsg.text}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className={labelClass}>Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    className={inputClass + ' pr-11'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    autoComplete="current-password"
                    placeholder="Enter your current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent((v) => !v)}
                    aria-label={showCurrent ? 'Hide current password' : 'Show current password'}
                    title={showCurrent ? 'Hide password' : 'Show password'}
                    className={eyeButtonClass}
                  >
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className={labelClass}>New Password</label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    className={inputClass + ' pr-11'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                    placeholder="Enter a new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((v) => !v)}
                    aria-label={showNew ? 'Hide new password' : 'Show new password'}
                    title={showNew ? 'Hide password' : 'Show password'}
                    className={eyeButtonClass}
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className={labelClass}>Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    className={inputClass + ' pr-11'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    placeholder="Re-enter your new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    aria-label={showConfirm ? 'Hide confirmation password' : 'Show confirmation password'}
                    title={showConfirm ? 'Hide password' : 'Show password'}
                    className={eyeButtonClass}
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={handleChangePassword}
              disabled={savingPassword}
              className="mt-6 w-full sm:w-auto text-center px-6 py-2 rounded-full bg-primary text-white text-sm font-bold hover:bg-primary-hover disabled:opacity-50"
            >
              {savingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </div>

          {/* Account / Session */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-primary" /> Account
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2 border-b border-gray-100">
                <span className="flex items-center gap-2 text-gray-600 shrink-0">
                  <Mail className="w-4 h-4 shrink-0" /> Email
                </span>
                <span className="font-medium text-gray-900 break-all min-w-0">
                  {user?.email || form.email || 'Not set'}
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2 border-b border-gray-100">
                <span className="flex items-center gap-2 text-gray-600 shrink-0">
                  <Phone className="w-4 h-4 shrink-0" /> Phone
                </span>
                <span className="font-medium text-gray-900 break-all min-w-0">
                  {user?.phone || form.phone || 'Not set'}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-6 w-full sm:w-auto justify-center px-6 py-2 rounded-full bg-red-50 border border-red-200 text-red-600 text-sm font-bold hover:bg-red-100 transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4 shrink-0" /> Log out
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AccountSettingsPage;
