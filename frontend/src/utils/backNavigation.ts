import { useCallback } from 'react';
import { matchPath, useNavigate, type NavigateFunction } from 'react-router-dom';

// Registered route patterns, mirrored from src/App.tsx. Only these paths are
// valid fallback back targets, so a nested page never resolves to a missing
// route. City routes use the catch-all patterns because all five cities share
// them.
const registeredRoutes: string[] = [
  '/',
  '/most-popular',
  '/most-delicious',
  '/real-good-travel',
  '/food-tours',
  '/food-tours/culture/:slug',
  '/cultural-tours',
  '/outdoor-activities',
  '/cooking-classes',
  '/cooking-classes/experiences',
  '/cooking-classes/experience/:slug',
  '/explore',
  '/become-host',
  '/host-application',
  '/become-guide',
  '/guide-application',
  '/bookings',
  '/guide/onboarding',
  '/guide/dashboard',
  '/guide/listings',
  '/guide/listings/new',
  '/guide/listings/:id/edit',
  '/guide/listings/:id/propose-change',
  '/guide/proposals',
  '/guide/proposals/new',
  '/guide/proposals/:id',
  '/guide/proposals/:id/edit',
  '/guide/change-requests/:id',
  '/guide/bookings',
  '/profile',
  '/account',
  '/favorites',
  '/chat',
  '/maila-dai',
  '/consent',
  '/privacy',
  '/search',
  '/impact-report-2024',
  '/experience/seo/:slug',
  '/experience/:id',
  '/auth/callback',
  '/reset-password',
  '/city/:cityId',
  '/city/:cityId/experiences',
  '/city/:cityId/experience/:slug',
  '/local/:id',
  '/local/:id/gallery',
  '/local/:id/portfolio',
  '/local/:id/contact',
  '/about',
  '/jobs',
  '/blog',
  '/press',
  '/sustainability',
  '/destinations',
  '/how-it-works',
  '/gift-cards',
  '/host-center',
  '/contact',
  '/faq',
  '/terms',
  '/help',
  '/hosting',
  '/community',
  '/host',
  '/careers',
];

type NavigationAction = 'PUSH' | 'REPLACE' | 'POP';

const STORAGE_KEY = 'guides-nepal:back-stack';
const MAX_ENTRIES = 50;

// Trail of pages visited in this tab, oldest first, current page last. Module
// scoped so it survives StrictMode remounts and hot reloads; persisted to
// sessionStorage so the trail survives a reload of the same tab.
let stack: string[] = [];
let storageLoaded = false;
let pendingBackFrom: string | undefined;

const loadStack = () => {
  if (storageLoaded) return;
  storageLoaded = true;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) {
      stack = parsed.filter((entry): entry is string => typeof entry === 'string').slice(-MAX_ENTRIES);
    }
  } catch {
    stack = [];
  }
};

const persistStack = () => {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stack));
  } catch {
    // Storage can be unavailable (private mode); the in-memory trail still works.
  }
};

const trimTrailingSlash = (path: string) => (path.length > 1 ? path.replace(/\/+$/, '') : path);

const isRegisteredRoute = (path: string) =>
  registeredRoutes.some((pattern) => matchPath({ path: pattern, end: true }, path) !== null);

/**
 * Nearest registered parent page of a nested path, excluding the homepage.
 * Used only as a fallback when the trail has no previous page.
 */
export const resolveBackTarget = (pathname: string): string | undefined => {
  const segments = trimTrailingSlash(pathname).split('/').filter(Boolean);
  for (let depth = segments.length - 1; depth >= 1; depth -= 1) {
    const candidate = `/${segments.slice(0, depth).join('/')}`;
    if (candidate === '/') break;
    if (isRegisteredRoute(candidate)) return candidate;
  }

  return undefined;
};

/** Records every router transition so the trail matches the browser history. */
export const recordNavigation = (pathname: string, action: NavigationAction) => {
  loadStack();

  if (pendingBackFrom !== undefined) {
    // A goBack() transition: the trail is rewound instead of extended, so the
    // page the user came from stays the previous entry.
    if (stack[stack.length - 1] === pendingBackFrom && stack.length > 1) stack.pop();
    pendingBackFrom = undefined;
    if (stack[stack.length - 1] !== pathname) stack.push(pathname);
    persistStack();
    return;
  }

  const current = stack[stack.length - 1];

  if (action === 'PUSH') {
    if (current === pathname) return;
    stack.push(pathname);
  } else if (action === 'REPLACE') {
    if (current === pathname) return;
    stack[stack.length - 1] = pathname;
  } else {
    // Browser back/forward or a fresh load: rewind to the visited page.
    const index = stack.lastIndexOf(pathname);
    if (index >= 0) {
      stack = stack.slice(0, index + 1);
    } else {
      stack.push(pathname);
    }
  }

  if (stack.length > MAX_ENTRIES) stack = stack.slice(-MAX_ENTRIES);
  persistStack();
};

/**
 * Sends the user to the page they came from: the previous entry of the trail
 * (not a blind `history.go(-1)`, which leaves the app or lands on a page
 * replaced by a redirect when the current page was opened directly). Falls
 * back to the nearest parent page, then the homepage, when this page is the
 * first one visited in the tab.
 */
export const goBack = (navigate: NavigateFunction) => {
  loadStack();

  const current = window.location.pathname;
  const previous = stack.length >= 2 ? stack[stack.length - 2] : undefined;
  const target = previous && previous !== current ? previous : (resolveBackTarget(current) ?? '/');

  if (!target || target === current) return;

  pendingBackFrom = current;
  navigate(target);
};

/** Hook wrapper around `goBack` for back-button onClick handlers. */
export const useGoBack = (): (() => void) => {
  const navigate = useNavigate();
  return useCallback(() => goBack(navigate), [navigate]);
};

/** Test-only: clears the trail and any pending back transition. */
export const resetBackNavigationState = () => {
  stack = [];
  storageLoaded = false;
  pendingBackFrom = undefined;
};
