import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { useAuthStore } from '../../store/authStore';
import { useBookingStore } from '../../store/bookingStore';
import { useProfileStore } from '../../store/profileStore';
import { Camera, Trash2, Bookmark, MapPin, Calendar, User as UserIcon } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user, login, accessToken } = useAuthStore();
  const { bookings } = useBookingStore();
  const { profile, updateProfile, addPhoto, removePhoto } = useProfileStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: profile.firstName || user?.firstName || '',
    lastName: profile.lastName || user?.lastName || '',
    email: profile.email || user?.email || '',
    phone: profile.phone || user?.phone || '',
    bio: profile.bio || ''
  });
  const API_BASE = `${import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api/v1' : 'https://guides-nepal.onrender.com/api/v1')}/profile`;

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

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    try {
      const formData = new FormData();
      formData.append('file', file);
      const headers: Record<string, string> = {};
      if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
      const res = await fetch(`${API_BASE}/photos/upload`, {
        method: 'POST',
        headers,
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        updateProfile({ avatarUrl: data.url });
      } else {
        const reader = new FileReader();
        reader.onload = (r) => {
          const dataUrl = r.target?.result as string;
          if (dataUrl) updateProfile({ avatarUrl: dataUrl });
        };
        reader.readAsDataURL(file);
      }
    } catch {
      const reader = new FileReader();
      reader.onload = (r) => {
        const dataUrl = r.target?.result as string;
        if (dataUrl) updateProfile({ avatarUrl: dataUrl });
      };
      reader.readAsDataURL(file);
    } finally {
      e.target.value = '';
    }
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
        login({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phone: data.phone || ''
        });
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
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex flex-wrap items-center justify-end gap-2 mb-2">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-3 py-2 rounded-full bg-primary text-white text-sm font-bold"
                  >
                    Edit
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      updateProfile(form);
                      login({
                        firstName: form.firstName,
                        lastName: form.lastName,
                        email: form.email,
                        phone: form.phone
                      });
                      fetch(`${API_BASE}/me`, {
                        method: 'PATCH',
                        headers: {
                          'Content-Type': 'application/json',
                          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
                        },
                        body: JSON.stringify({
                          firstName: form.firstName,
                          lastName: form.lastName,
                          email: form.email,
                          phone: form.phone,
                      bio: form.bio,
                      avatar_url: profile.avatarUrl
                        })
                      }).catch(() => {});
                      setIsEditing(false);
                    }}
                    className="px-3 py-2 rounded-full bg-secondary text-white text-sm font-bold"
                  >
                    Save
                  </button>
                )}
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
                    className="px-3 py-2 rounded-full bg-gray-100 text-gray-800 text-xs font-bold"
                  >
                    Change
                  </button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onAvatarChange}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">First Name</label>
                  <input
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 disabled:bg-gray-50"
                    disabled={!isEditing}
                    placeholder="Your first name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Last Name</label>
                  <input
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 disabled:bg-gray-50"
                    disabled={!isEditing}
                    placeholder="Your last name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Email</label>
                  <input
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 disabled:bg-gray-50"
                    disabled={!isEditing}
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Phone</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 disabled:bg-gray-50"
                    disabled={!isEditing}
                    placeholder="+977-XXXXXXXXXX"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Bio</label>
                  <textarea
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 disabled:bg-gray-50"
                    disabled={!isEditing}
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
                      <img src={src} alt={`photo-${i}`} className="w-full h-32 object-cover rounded-lg border border-gray-100" />
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
                          <Calendar className="w-3 h-3" /> {new Date(b.date).toLocaleDateString()}
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
                          <Calendar className="w-3 h-3" /> {new Date(b.date).toLocaleDateString()}
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
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;
