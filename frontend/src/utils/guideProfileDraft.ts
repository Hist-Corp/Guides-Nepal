/**
 * Unsaved guide-profile edits shared between Account Settings (`/account`) and
 * the public profile's live preview (`/guidesprofile/:slug?preview=1`).
 *
 * The two pages are usually open in separate tabs, so the draft is kept in
 * localStorage and changes are announced with the browser's `storage` event
 * for other tabs plus a custom event for listeners in the same tab.
 */

export interface GuideProfileDraft {
  bio?: string;
  avatarUrl?: string;
  tripSupport?: string;
}

/** Which page wrote the draft — used to ignore a page's own echo. */
export type GuideDraftSource = 'account' | 'preview';

interface StoredDraft {
  draft: GuideProfileDraft;
  source: GuideDraftSource;
  updatedAt: number;
}

const STORAGE_PREFIX = 'guide-profile-preview';
const CHANGE_EVENT = 'guide-profile-preview-change';

const storageKey = (email?: string | null) =>
  `${STORAGE_PREFIX}:${(email || 'guest').toLowerCase()}`;

const readStored = (email?: string | null): StoredDraft | null => {
  try {
    const raw = localStorage.getItem(storageKey(email));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredDraft;
    return parsed && typeof parsed === 'object' && parsed.draft ? parsed : null;
  } catch {
    return null;
  }
};

export const readGuideDraft = (email?: string | null): GuideProfileDraft =>
  readStored(email)?.draft ?? {};

/** Merge a partial edit into the draft and notify every listening page. */
export const writeGuideDraft = (
  email: string | null | undefined,
  patch: GuideProfileDraft,
  source: GuideDraftSource,
): GuideProfileDraft => {
  const next = { ...readGuideDraft(email), ...patch };
  try {
    localStorage.setItem(
      storageKey(email),
      JSON.stringify({ draft: next, source, updatedAt: Date.now() } satisfies StoredDraft),
    );
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // A full or blocked localStorage only disables the preview sync.
  }
  return next;
};

/** Listen for draft changes from this tab or another one. Returns an unsubscribe. */
export const subscribeGuideDraft = (
  email: string | null | undefined,
  listener: (draft: GuideProfileDraft, source: GuideDraftSource) => void,
): (() => void) => {
  const key = storageKey(email);
  const emit = () => {
    const stored = readStored(email);
    if (stored) listener(stored.draft, stored.source);
  };
  const onStorage = (event: StorageEvent) => {
    if (!event.key || event.key === key) emit();
  };
  window.addEventListener(CHANGE_EVENT, emit);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, emit);
    window.removeEventListener('storage', onStorage);
  };
};
