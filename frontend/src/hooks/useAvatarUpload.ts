import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { getApiUrl } from '../config/api';
import { useAuthStore } from '../store/authStore';
import { useProfileStore } from '../store/profileStore';

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

/** True for http(s), root-relative and inline data image URLs. */
export const isSafeImageUrl = (url?: string): boolean => {
  if (!url) return false;
  const trimmed = url.trim();
  const lower = trimmed.toLowerCase();
  return (
    lower.startsWith('http://') ||
    lower.startsWith('https://') ||
    trimmed.startsWith('/') ||
    lower.startsWith('data:image/')
  );
};

/**
 * Profile-photo upload shared by /account and /profile.
 *
 * A successful upload is saved immediately on the server and mirrored into the
 * auth store (header avatar) and profile store, so no separate "save" step is
 * needed. Resolves to the new URL, or null when nothing was uploaded.
 */
export function useAvatarUpload() {
  const { user, login, accessToken } = useAuthStore();
  const updateProfile = useProfileStore((state) => state.updateProfile);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const onChange = async (e: ChangeEvent<HTMLInputElement>): Promise<string | null> => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return null;
    if (!file.type.startsWith('image/')) {
      setError('Choose a JPG, PNG, WebP or GIF image.');
      return null;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setError('Profile photos must be 5 MB or smaller.');
      return null;
    }
    setError('');
    setUploading(true);
    try {
      const body = new FormData();
      body.append('file', file);
      const res = await fetch(getApiUrl('/profile/photos/upload'), {
        method: 'POST',
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        body,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.detail || 'Failed to upload photo.');
        return null;
      }
      updateProfile({ avatarUrl: data.url });
      if (user) login({ ...user, avatarUrl: data.url });
      return data.url as string;
    } catch {
      setError('Network error. Please try again.');
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { inputRef, uploading, error, onChange };
}
