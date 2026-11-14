import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { collectPageRevealItems } from '../../utils/revealPlan';
import { prefersReducedMotion } from '../../utils/motion';

const ANIM_CLASS = 'animate-fade-in-up';

/**
 * Scroll-reveal animations for CMS/content pages (About, FAQ, Blog, …) **and
 * every other non-home route** — applied uniformly across all pages and sub-pages.
 *
 * What gets animated (decided by `revealPlan.collectPageRevealItems`):
 *  - the inner content blocks of `<main><section>` layouts (CMS pages);
 *  - the direct content blocks of `<main>` layouts that have no `<section>`
 *    (city pages, experiences, local profiles, account pages, …);
 *  - a uniform grid/list of cards or tiles is exploded into individually
 *    staggered items, so listing & gallery pages cascade just like the home
 *    page does;
 *  - pages that still omit `<main>` fall back to a scoped `#root` wrapper.
 *
 * Safety properties:
 *  - `prefers-reduced-motion` users see content immediately (no animation), and
 *    any leftover inline `opacity` from a previous navigation is cleared;
 *  - content already in view at load gets a quick staggered entrance — the very
 *    first frame is already the animation's start state (useLayoutEffect + inline
 *    `opacity:0`), so there is never a flash;
 *  - below-the-fold content is hidden until it nears the viewport (the sweet
 *    spot), then runs `animate-fade-in-up` once;
 *  - a 2.5 s fail-safe and a near-bottom catcher guarantee nothing stays stuck
 *    invisible (observer edge cases, CMS re-renders, etc.);
 *  - Re-runs on every route change (incl. same-path navigations via `location.key`).
 *  - The home page (`/`) is excluded — its sections run their own animations.
 */
export default function PageReveal() {
  const location = useLocation();

  useLayoutEffect(() => {
    if (location.pathname === '/') return;
    if (prefersReducedMotion()) {
      for (const el of document.querySelectorAll('[data-page-reveal]')) {
        (el as HTMLElement).style.opacity = '';
      }
      return;
    }

    const items = collectPageRevealItems(document);
    if (items.length === 0) return;

    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    const reveal = (el: HTMLElement, delayMs: number) => {
      el.dataset.pageReveal = 'done';
      el.style.opacity = '';
      el.style.animationDelay = `${delayMs}ms`;
      el.classList.add(ANIM_CLASS);
    };

    // Items already in view: quick staggered page entrance.
    // Items below the fold: hidden pre-paint, revealed on scroll at the sweet spot.
    const pendingScroll: HTMLElement[] = [];
    let loadStagger = 0;

    for (const el of items) {
      if (el.dataset.pageReveal === 'done') continue;
      const rect = el.getBoundingClientRect();
      const inInitialView = rect.top < viewportHeight && rect.bottom > 0;
      if (inInitialView) {
        reveal(el, Math.min(loadStagger * 90, 270));
        loadStagger += 1;
      } else {
        el.style.opacity = '0';
        pendingScroll.push(el);
      }
    }

    const observer =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(
            (entries) => {
              for (const entry of entries) {
                if (!entry.isIntersecting) continue;
                const el = entry.target as HTMLElement;
                reveal(el, 0);
                observer?.unobserve(el);
              }
            },
            // threshold 0 + bottom rootMargin: fires just before the content
            // fully enters the viewport (the sweet spot), even for tall items.
            { threshold: 0, rootMargin: '0px 0px -12% 0px' }
          );

    for (const el of pendingScroll) {
      if (observer) {
        observer.observe(el);
      } else {
        reveal(el, 0);
      }
    }

    // Content at the very bottom of a page may never cross the sweet-spot line
    // (the page ends first) — reveal it as soon as the user reaches the bottom.
    const onNearBottom = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8) {
        for (const el of pendingScroll) {
          if (el.dataset.pageReveal !== 'done') reveal(el, 0);
        }
      }
    };
    window.addEventListener('scroll', onNearBottom, { passive: true });

    // Fail-safe: force-reveal anything still hidden after 2.5s so content can
    // never get stuck invisible (observer edge cases, CMS re-renders).
    const fallback = window.setTimeout(() => {
      for (const el of pendingScroll) {
        if (el.dataset.pageReveal !== 'done') reveal(el, 0);
      }
    }, 2500);

    return () => {
      window.clearTimeout(fallback);
      window.removeEventListener('scroll', onNearBottom);
      observer?.disconnect();
      for (const el of pendingScroll) {
        if (el.dataset.pageReveal !== 'done') {
          el.style.opacity = '';
        }
      }
    };
  }, [location.pathname, location.key]);

  return null;
}
