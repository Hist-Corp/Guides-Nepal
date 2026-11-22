import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoBack } from '../../utils/backNavigation';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { useAuthStore } from '../../store/authStore';
import { useBookingStore } from '../../store/bookingStore';
import GuideProfileSection from '../../components/guide/GuideProfileSection';
import InlineMessage from '../../components/common/InlineMessage';
import { isSafeImageUrl, useAvatarUpload } from '../../hooks/useAvatarUpload';
import { slugifyGuideName } from '../../utils/guideUrl';
import { subscribeGuideDraft, writeGuideDraft } from '../../utils/guideProfileDraft';
import {
  User as UserIcon,
  Mail,
  Phone,
  Camera,
  Lock,
  LogOut,
  UserCog,
  Eye,
  EyeOff,
  X,
  ArrowLeft,
} from 'lucide-react';

const API_BASE = `${import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api/v1' : 'https://guides-nepal.onrender.com/api/v1')}`;

const AccountSettingsPage: React.FC = () => {
  const { user, login, accessToken, logout } = useAuthStore();
  const navigate = useNavigate();
  const goBack = useGoBack();

  // Profile form state
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);
  const [previewSlug, setPreviewSlug] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

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
    let cancelled = false;
    const load = async () => {
      try {
        const headers: Record<string, string> = {};
        if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
        const res = await fetch(`${API_BASE}/profile/me`, { headers });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        setForm({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phone: data.phone || '',
          bio: data.bio || '',
        });
        // Keep the header avatar in step with the saved profile photo.
        if (data.avatarUrl && user && data.avatarUrl !== user.avatarUrl) {
          login({ ...user, avatarUrl: data.avatarUrl });
        }
        // Seed the live-preview draft with what is saved right now.
        writeGuideDraft(user?.email, { bio: data.bio || '' }, 'account');
      } catch {
        // keep local values if the request fails
      }
    };
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Edits made inside the live preview flow back into this form.
  useEffect(() => {
    const email = user?.email;
    if (!email) return;
    return subscribeGuideDraft(email, (draft, source) => {
      if (source !== 'preview') return;
      setForm((current) => ({ ...current, bio: draft.bio ?? current.bio }));
    });
  }, [user?.email]);

  const updateField = (key: 'firstName' | 'lastName' | 'bio', value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    // Only the bio is shown on the public guide profile.
    if (key === 'bio') writeGuideDraft(user?.email, { bio: value }, 'account');
  };

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || '';
  const previewHref = `/guidesprofile/${encodeURIComponent(
    previewSlug || slugifyGuideName(fullName),
  )}?preview=1`;

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
        }),
      });
      if (res.ok) {
        login({ ...user, firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone });
        writeGuideDraft(user?.email, { bio: form.bio }, 'account');
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

  const {
    inputRef: avatarInputRef,
    uploading: uploadingAvatar,
    error: avatarError,
    onChange: uploadAvatar,
  } = useAvatarUpload();

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileMsg(null);
    const url = await uploadAvatar(e);
    if (!url) return;
    writeGuideDraft(user?.email, { avatarUrl: url }, 'account');
    setProfileMsg({ type: 'ok', text: 'Profile photo updated.' });
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
    if (!/[!@#$%^&*()_+\-=[\]{};:,.<>?]/.test(newPassword)) {
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
    useBookingStore.setState({ bookings: [] });
    navigate('/');
  };

  const safeAvatarUrl = isSafeImageUrl(user?.avatarUrl) ? (user?.avatarUrl as string) : '';

  const inputClass =
    'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow';
  const labelClass = 'block text-xs font-bold text-gray-600 uppercase mb-1';
  const eyeButtonClass =
    'absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans overflow-x-clip">
      <Header />
      <main id="main-content" className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
            <div>
              <button
                onClick={goBack}
                className="px-3 py-2 rounded-full bg-gray-100 text-gray-800 text-sm font-bold hover:bg-gray-200 transition-colors flex items-center gap-1 mb-3"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <UserCog className="w-6 h-6 text-primary" /> Account Settings
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage your personal details, avatar, password, and public guide profile.
              </p>
            </div>
            {user?.role === 'guide' && (
              <button
                onClick={() => setShowPreview(true)}
                className="shrink-0 px-4 py-2 rounded-full bg-primary text-white text-sm font-bold hover:bg-primary-hover transition-colors flex items-center gap-2"
              >
                <Eye className="w-4 h-4" /> Edit live preview
              </button>
            )}
          </div>

          {/* Profile Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Profile Information</h2>

            {profileMsg && <InlineMessage type={profileMsg.type} text={profileMsg.text} />}
            {avatarError && <InlineMessage type="error" text={avatarError} />}

            {/* Avatar row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3 mb-6">
              <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden border border-gray-300 flex items-center justify-center shrink-0">
                {safeAvatarUrl ? (
                  <img src={safeAvatarUrl} alt="avatar" className="w-full h-full object-cover" />
                ) : user?.firstName ? (
                  <span className="font-bold text-xl text-gray-700">{user.firstName[0]}</span>
                ) : (
                  <UserIcon className="w-8 h-8 text-gray-500" />
                )}
              </div>
              <button
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="px-3 py-2 rounded-full bg-gray-100 text-gray-800 text-sm font-bold flex items-center gap-2 hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <Camera className="w-4 h-4 shrink-0" /> {uploadingAvatar ? 'Uploading…' : 'Change photo'}
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={onAvatarChange}
                aria-label="Profile photo"
              />
            </div>

            {/* Name / contact fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-4">
              <div>
                <label className={labelClass}>First Name</label>
                <input className={inputClass} value={form.firstName} onChange={(e) => updateField('firstName', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Last Name</label>
                <input className={inputClass} value={form.lastName} onChange={(e) => updateField('lastName', e.target.value)} />
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
                onChange={(e) => updateField('bio', e.target.value)}
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

          {/* Guide-only: Trip Support and certificates shown on the public profile */}
          {user?.role === 'guide' && <GuideProfileSection onPublicSlugChange={setPreviewSlug} />}

          {/* Change Password */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" /> Change Password
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Must be at least 8 characters with an uppercase letter, a number, and a special character.
            </p>

            {pwMsg && <InlineMessage type={pwMsg.type} text={pwMsg.text} />}

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

      {/* Live preview of the public guide profile, kept beside the editor */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex bg-black/60 sm:p-6">
          <div className="mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden bg-white shadow-2xl sm:rounded-2xl">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 bg-gray-50 px-4 py-3">
              <div>
                <h2 className="text-sm font-bold text-gray-900">
                  Live preview of your public profile
                </h2>
                <p className="text-xs text-gray-500">
                  Changes here and in the form stay in sync. Nothing is published until you save.
                </p>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="rounded-full bg-gray-200 px-3 py-1.5 text-sm font-bold text-gray-800 hover:bg-gray-300 transition-colors flex items-center gap-1"
              >
                <X className="w-4 h-4" /> Close preview
              </button>
            </div>
            <iframe
              title="Public guide profile preview"
              src={previewHref}
              className="w-full flex-grow border-0"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSettingsPage;
