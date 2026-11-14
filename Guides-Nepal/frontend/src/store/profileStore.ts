import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Bookmark {
  id: string;
  title: string;
  city?: string;
  image?: string;
  createdAt: string;
  link?: string;
}

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  bio?: string;
  avatarUrl?: string;
  travelPhotos: string[];
  bookmarks: Bookmark[];
}

interface ProfileStore {
  profile: UserProfile;
  updateProfile: (partial: Partial<UserProfile>) => void;
  addPhoto: (dataUrl: string) => void;
  removePhoto: (index: number) => void;
  addBookmark: (bm: Bookmark) => void;
  removeBookmark: (id: string) => void;
  clearAll: () => void;
}

const initialProfile: UserProfile = {
  travelPhotos: [],
  bookmarks: [],
};

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
      profile: initialProfile,
      updateProfile: (partial) =>
        set((state) => ({
          profile: { ...state.profile, ...partial },
        })),
      addPhoto: (dataUrl) =>
        set((state) => ({
          profile: {
            ...state.profile,
            travelPhotos: [dataUrl, ...state.profile.travelPhotos].slice(0, 60),
          },
        })),
      removePhoto: (index) =>
        set((state) => ({
          profile: {
            ...state.profile,
            travelPhotos: state.profile.travelPhotos.filter((_, i) => i !== index),
          },
        })),
      addBookmark: (bm) =>
        set((state) => ({
          profile: {
            ...state.profile,
            bookmarks: [
              bm,
              ...state.profile.bookmarks.filter((b) => b.id !== bm.id),
            ],
          },
        })),
      removeBookmark: (id) =>
        set((state) => ({
          profile: {
            ...state.profile,
            bookmarks: state.profile.bookmarks.filter((b) => b.id !== id),
          },
        })),
      clearAll: () => set({ profile: initialProfile }),
    }),
    { name: 'profile-storage' }
  )
);
