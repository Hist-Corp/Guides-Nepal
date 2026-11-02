import React, { useCallback, useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Plus, Trash2, Edit3, Eye, CalendarDays, AlertCircle } from 'lucide-react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { useAuthStore } from '../../store/authStore';
import hostApi, { type HostExperience, type HostExperienceCreate } from '../../services/hostApi';

const HostExperiencesPage: React.FC = () => {
  const { isAuthenticated, user, accessToken } = useAuthStore();
  const [experiences, setExperiences] = useState<HostExperience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<HostExperienceCreate>({
    title: '',
    city: '',
    category: '',
    description: '',
    price: 0,
    duration: '',
    hero_image: '',
  });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError('');
    try {
      const data = await hostApi.getExperiences(accessToken);
      setExperiences(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load experiences.');
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (accessToken && user?.role === 'host') load();
  }, [accessToken, user?.role, load]);

  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (user?.role !== 'host') return <Navigate to="/" replace />;

  const resetForm = () => {
    setForm({ title: '', city: '', category: '', description: '', price: 0, duration: '', hero_image: '' });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    setSaving(true);
    setError('');
    try {
      if (editingId !== null) {
        await hostApi.updateExperience(accessToken, editingId, form);
      } else {
        await hostApi.createExperience(accessToken, form);
      }
      setOpenForm(false);
      resetForm();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to save experience.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this experience? This cannot be undone.')) return;
    if (!accessToken) return;
    setDeletingId(id);
    try {
      await hostApi.deleteExperience(accessToken, id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to delete experience.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (exp: HostExperience) => {
    setEditingId(exp.id);
    setForm({
      title: exp.title,
      city: exp.city,
      category: exp.category,
      description: exp.description,
      price: exp.price,
      duration: exp.duration,
      hero_image: exp.hero_image ?? '',
    });
    setOpenForm(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />
      <main className="flex-grow container mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Experiences</h1>
            <p className="mt-1 text-gray-600 text-sm">
              Create and manage the experiences you offer to travelers.
            </p>
          </div>
          <button
            onClick={() => { resetForm(); setOpenForm(true); }}
            className="flex items-center gap-2 rounded-full bg-[#213448] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#1a2a3a]"
          >
            <Plus className="h-4 w-4" /> New experience
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {loading ? (
            <div className="col-span-full py-20 text-center text-gray-500 text-sm">
              Loading experiences...
            </div>
          ) : experiences.length === 0 ? (
            <div className="col-span-full p-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
              <CalendarDays className="w-12 h-12 text-gray-300 mb-3" />
              <h3 className="text-lg font-bold text-gray-900 mb-1">No experiences yet</h3>
              <p className="text-gray-500 text-sm mb-6">
                Create your first experience to start hosting travelers.
              </p>
              <button
                onClick={() => { resetForm(); setOpenForm(true); }}
                className="rounded-full bg-brand-yellow px-5 py-2.5 text-sm font-bold text-[#213448] hover:bg-[#ffba0a]"
              >
                Add experience
              </button>
            </div>
          ) : (
            experiences.map((exp) => (
              <article
                key={exp.id}
                className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm hover:shadow-md transition-all"
              >
                <div className="h-48 bg-gray-100 relative overflow-hidden">
                  {exp.hero_image ? (
                    <img src={exp.hero_image} alt={exp.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Eye className="w-8 h-8" />
                    </div>
                  )}
                  <span className="absolute top-2 left-2 rounded-full bg-gray-900/80 px-2 py-1 text-xs font-bold text-white capitalize">
                    {exp.category}
                  </span>
                  <span className="absolute top-2 right-2 rounded-full bg-white px-2 py-1 text-xs font-bold text-gray-900">
                    {exp.price}
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{exp.title}</h3>
                    <span className="flex items-center gap-1 text-xs font-bold text-gray-500 uppercase">
                      {exp.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <span>{exp.city}</span>
                    <span>•</span>
                    <span>{exp.duration}</span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">{exp.description}</p>
                  <div className="flex gap-2">
                    <Link
                      to={`/experience/${exp.id}`}
                      className="flex-1 text-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-800 hover:bg-gray-50"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleEdit(exp)}
                      className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-800 hover:bg-gray-50"
                    >
                      <Edit3 className="w-4 h-4 mr-1" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(exp.id)}
                      disabled={deletingId === exp.id}
                      className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-60"
                    >
                      {deletingId === exp.id ? 'Deleting...' : <Trash2 className="w-4 h-4 mr-1" />}
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </main>
      <Footer />

      {openForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setOpenForm(false)}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingId ? 'Edit Experience' : 'Add Experience'}
              </h2>
              <button onClick={() => setOpenForm(false)} className="text-gray-400 hover:text-gray-600">
                <AlertCircle className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  required
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  required
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  required
                  minLength={30}
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Price</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Duration</label>
                  <input
                    type="text"
                    required
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Hero image URL</label>
                <input
                  type="text"
                  value={form.hero_image}
                  onChange={(e) => setForm({ ...form, hero_image: e.target.value })}
                  className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none"
                />
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setOpenForm(false)}
                  className="flex-1 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-5 py-2.5 rounded-xl bg-brand-yellow text-[#213448] font-bold hover:bg-[#ffba0a] disabled:opacity-60"
                >
                  {saving ? 'Saving...' : editingId ? 'Update experience' : 'Create experience'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HostExperiencesPage;
