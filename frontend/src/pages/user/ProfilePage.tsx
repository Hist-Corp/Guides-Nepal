import React, { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoBack } from '../../utils/backNavigation';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { useAuthStore } from '../../store/authStore';
import { useBookingStore } from '../../store/bookingStore';
import { useProfileStore } from '../../store/profileStore';
import { listConversations } from '../../services/messageApi';
import { useAvatarUpload } from '../../hooks/useAvatarUpload';
import { Camera, Trash2, Bookmark, MapPin, Calendar, User as UserIcon, ArrowLeft, MessageCircle, Clock } from 'lucide-react';
import { formatDate } from '../../utils/date';

const ProfilePage: React.FC = () => {
  const goBack = useGoBack();
  const { user, login, accessToken } = useAuthStore();
  const { bookings } = useBookingStore();
  const { profile, updateProfile, addPhoto, removePhoto } = useProfileStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const {
    inputRef: avatarInputRef,
    uploading: uploadingAvatar,
    error: avatarError,
    onChange: onAvatarChange,
  } = useAvatarUpload();
  const [form, setForm] = useState({
    firstName: profile.firstName || user?.firstName || '',
    lastName: profile.lastName || user?.lastName || '',
    email: profile.email || user?.email || '',
    phone: profile.phone || user?.phone || '',
    bio: profile.bio || ''
  });
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const API_BASE = `${import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api/v1' : 'https://guides-nepal.onrender.com/api/v1')}/profile`;
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<{
    id: string;
    counterpartId: number | string;
    counterpartName: string;
    counterpartImage: string;
    lastMessage: string;
    lastMessageAt: string;
    unreadCount: number;
  }[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  useEffect(() => {
    const loadMessages = async () => {
      if (!accessToken) return;
      setMessagesLoading(true);
      try {
        const rows = await listConversations(accessToken);
        setConversations(
          rows.map((r) => ({
            id: String(r.id),
            counterpartId: r.guide_id,
            counterpartName: r.guide_name,
            counterpartImage: r.guide_image,
            lastMessage: r.last_message,
            lastMessageAt: r.last_message_at,
            unreadCount: r.unread_count,
          }))
        );
      } catch {
        setConversations([]);
      } finally {
        setMessagesLoading(false);
      }
    };
    loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  const upcoming = bookings.filter((b) => b.status === 'upcoming');
  const past = bookings.filter((b) => b.status !== 'upcoming');

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (r) => {
      const dataUrl = r.target?.result as string;
      if (dataUrl) addPhoto(dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  useEffect(() => {
    const loadRemote = async () => {
      try {
        const headers: Record<string, string> = {};
        if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
        const res = await fetch(`${API_BASE}/me`, { headers });
        if (!res.ok) return;
        const data = await res.json();
        updateProfile({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          bio: data.bio,
          avatarUrl: data.avatarUrl
        });
        if (data.avatarUrl && user && data.avatarUrl !== user.avatarUrl) {
          login({ ...user, avatarUrl: data.avatarUrl });
        }
        setForm({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phone: data.phone || '',
          bio: data.bio || ''
        });
      } catch {
        return;
      }
    };
    loadRemote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 font-sans">
      <Header />
      <main id="main-content" className="container mx-auto max-w-6xl flex-grow px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <button
                  onClick={goBack}
                  className="px-3 py-2 rounded-full bg-gray-100 text-gray-800 text-sm font-bold hover:bg-gray-200 transition-colors flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <Link
                  to="/account"
                  className="px-3 py-2 rounded-full bg-gray-100 text-gray-800 text-sm font-bold hover:bg-gray-200 transition-colors"
                >
                  Account Settings
                </Link>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden border border-gray-300 flex items-center justify-center">
                  {profile.avatarUrl ? (
                    <img src={profile.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-8 h-8 text-gray-500" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {(profile.firstName || user?.firstName || form.firstName || 'Traveler')}{' '}
                    {(profile.lastName || user?.lastName || form.lastName || '')}
                  </h2>
                  <p className="text-gray-500 text-sm">{profile.email || user?.email || form.email || 'Add your email'}</p>
                </div>
                <div className="ml-auto">
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="px-3 py-2 rounded-full bg-gray-100 text-gray-800 text-sm font-bold flex items-center gap-2 hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    <Camera className="w-4 h-4" /> {uploadingAvatar ? 'Uploading…' : 'Change photo'}
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
              </div>
              {avatarError && <p className="mb-4 text-sm text-red-600">{avatarError}</p>}

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">First Name</label>
                  <input
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 disabled:bg-gray-50"
                    disabled
                    placeholder="Your first name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Last Name</label>
                  <input
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 disabled:bg-gray-50"
                    disabled
                    placeholder="Your last name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Email</label>
                  <input
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 disabled:bg-gray-50"
                    disabled
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Phone</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 disabled:bg-gray-50"
                    disabled
                    placeholder="+977-XXXXXXXXXX"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Bio</label>
                  <textarea
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 disabled:bg-gray-50"
                    disabled
                    rows={3}
                    placeholder="Tell us about your travel preferences..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Middle: Travel Photos */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Travel Photos</h3>
                <div className="relative">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 rounded-full bg-primary text-white text-sm font-bold flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" /> Upload
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onFileChange}
                  />
                </div>
              </div>

              {profile.travelPhotos.length === 0 ? (
                <div className="text-center text-gray-500 text-sm">
                  No photos yet. Share your travel memories!
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {profile.travelPhotos.map((src, i) => (
                    <div key={i} className="relative group">
                      <button
                        type="button"
                        onClick={() => setLightboxSrc(src)}
                        className="w-full h-32 rounded-lg overflow-hidden border border-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                        aria-label="View photo full size"
                      >
                        <img src={src} alt={`photo-${i}`} className="w-full h-full object-cover" />
                      </button>
                      <button
                        onClick={() => removePhoto(i)}
                        className="absolute top-2 right-2 bg-white/90 rounded-full p-1 shadow hover:bg-white"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Bookings & Bookmarks */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Upcoming Bookings</h3>
              {upcoming.length === 0 ? (
                <p className="text-sm text-gray-500">No upcoming bookings.</p>
              ) : (
                <div className="space-y-3">
                  {upcoming.map((b) => (
                    <div key={b.id} className="flex gap-3">
                      <img src={b.image} className="w-16 h-16 rounded-lg object-cover" alt={b.experienceTitle} />
                      <div>
                        <div className="font-bold text-gray-900">{b.experienceTitle}</div>
                        <div className="text-xs text-gray-600 flex items-center gap-2">
                          <MapPin className="w-3 h-3" /> {b.city}
                        </div>
                        <div className="text-xs text-gray-600 flex items-center gap-2">
                          <Calendar className="w-3 h-3" /> {formatDate(b.date)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Past & Archived</h3>
              {past.length === 0 ? (
                <p className="text-sm text-gray-500">No past bookings yet.</p>
              ) : (
                <div className="space-y-3">
                  {past.map((b) => (
                    <div key={b.id} className="flex gap-3 opacity-80">
                      <img src={b.image} className="w-16 h-16 rounded-lg object-cover" alt={b.experienceTitle} />
                      <div>
                        <div className="font-bold text-gray-900">{b.experienceTitle}</div>
                        <div className="text-xs text-gray-600 flex items-center gap-2">
                          <MapPin className="w-3 h-3" /> {b.city}
                        </div>
                        <div className="text-xs text-gray-600 flex items-center gap-2">
                          <Calendar className="w-3 h-3" /> {formatDate(b.date)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Bookmarks</h3>
              {profile.bookmarks.length === 0 ? (
                <p className="text-sm text-gray-500">No bookmarks yet. Save experiences to visit later.</p>
              ) : (
                <div className="space-y-3">
                  {profile.bookmarks.map((bm) => (
                    <a key={bm.id} href={bm.link || '#'} className="flex gap-3 group">
                      {bm.image && <img src={bm.image} className="w-16 h-16 rounded-lg object-cover" alt={bm.title} />}
                      <div>
                        <div className="font-bold text-gray-900 group-hover:text-primary">{bm.title}</div>
                        {bm.city && <div className="text-xs text-gray-600 flex items-center gap-2"><MapPin className="w-3 h-3" /> {bm.city}</div>}
                        <div className="text-xs text-gray-500 flex items-center gap-2"><Bookmark className="w-3 h-3" /> Saved {new Date(bm.createdAt).toLocaleDateString()}</div>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Messages</h3>
                <Link
                  to="/messages"
                  className="text-xs font-bold text-primary hover:underline"
                >
                  View all
                </Link>
              </div>
              {messagesLoading ? (
                <p className="text-sm text-gray-500">Loading messages…</p>
              ) : conversations.length === 0 ? (
                <p className="text-sm text-gray-500">No messages yet. Start a conversation from a guide's profile or your bookings.</p>
              ) : (
                <div className="space-y-3">
                  {conversations
                    .slice()
                    .sort(
                      (a, b) =>
                        new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
                    )
                    .map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => navigate(`/messages/guide/${c.counterpartId}`)}
                        className={`w-full text-left flex items-center gap-3 rounded-xl border p-3 transition-all ${
                          c.unreadCount > 0
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
                        }`}
                      >
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-gray-200">
                          <img src={c.counterpartImage} alt={c.counterpartName} className="h-full w-full object-cover" />
                          {c.unreadCount > 0 && (
                            <span className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-sm font-bold text-gray-900">{c.counterpartName}</p>
                            {c.lastMessageAt && (
                              <span className="flex shrink-0 items-center gap-1 text-[10px] text-gray-400">
                                <Clock className="h-3 w-3" />
                                {new Date(c.lastMessageAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <p className="truncate text-sm text-gray-500">
                            {c.lastMessage ? c.lastMessage : 'No messages yet'}
                          </p>
                          {c.unreadCount > 0 && (
                            <span className="text-[10px] font-bold text-primary">{c.unreadCount} new</span>
                          )}
                        </div>
                        <MessageCircle className="h-4 w-4 shrink-0 text-gray-400" />
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxSrc(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxSrc(null)}
            className="absolute top-4 right-4 text-white text-3xl font-bold hover:text-gray-300"
            aria-label="Close"
          >
            &times;
          </button>
          <img
            src={lightboxSrc}
            alt="Full size travel photo"
            className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
