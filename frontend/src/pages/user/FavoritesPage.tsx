import React from 'react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { useProfileStore } from '../../store/profileStore';
import { Bookmark, MapPin, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const FavoritesPage: React.FC = () => {
  const { profile, removeBookmark } = useProfileStore();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />
      <main id="main-content" className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900">Bookmarks</h1>
                <div className="text-xs text-gray-500">Saved places to visit later</div>
              </div>

              {profile.bookmarks.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-600 text-sm mb-2">No bookmarks yet.</p>
                  <Link to="/explore" className="text-primary font-bold text-sm hover:underline">Explore experiences</Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {profile.bookmarks.map((bm) => (
                    <div key={bm.id} className="py-4 flex items-center gap-4">
                      {bm.image && (
                        <img src={bm.image} alt={bm.title} className="w-20 h-20 rounded-lg object-cover" />
                      )}
                      <div className="flex-1">
                        <div className="font-bold text-gray-900">{bm.title}</div>
                        <div className="text-xs text-gray-600 flex items-center gap-2">
                          <Bookmark className="w-3 h-3" /> Saved {new Date(bm.createdAt).toLocaleDateString()}
                        </div>
                        {bm.city && (
                          <div className="text-xs text-gray-600 flex items-center gap-2">
                            <MapPin className="w-3 h-3" /> {bm.city}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {bm.link && (
                          <Link to={bm.link} className="text-primary font-bold text-sm hover:underline">
                            View
                          </Link>
                        )}
                        <button
                          onClick={() => removeBookmark(bm.id)}
                          className="p-2 rounded-full hover:bg-red-50"
                          title="Remove bookmark"
                        >
                          <Trash2 className="w-5 h-5 text-red-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Tips</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>Bookmark experiences you want to revisit or plan for later.</li>
                <li>Use your Profile to manage personal info and upload travel photos.</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FavoritesPage;
