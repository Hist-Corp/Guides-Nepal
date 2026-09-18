import { useEffect, useRef, useState, type RefObject } from 'react';
import { prefersReducedMotion } from '../utils/motion';

export interface UseInViewOptions {
  /** Fraction of the element that must be visible before it reveals (default 0.15). */
  threshold?: number;
  /** Observer margin — the default reveals just before full entry ("sweet spot"). */
  rootMargin?: string;
  /** Reveal once and stop observing (default), or hide again when scrolled past. */
  once?: boolean;
  /** Set false to skip observing entirely and start revealed. */
  enabled?: boolean;
}

export interface UseInViewResult<T extends HTMLElement> {
  ref: RefObject<T | null>;
  inView: boolean;
}

/**
 * Safety net: if the observer never fires (CMS re-render, layout edge cases)
 * the content is force-revealed so it can never get stuck invisible.
 */
const FALLBACK_DELAY_MS = 2500;

/**
 * Tracks whether the element behind `ref` has entered the viewport.
 *
 * Mirrors the behaviour of `components/common/PageReveal` (which handles the
 * CMS/content pages) but as a component-level hook, so individual pieces of
 * content can animate themselves:
 * - reduces to `inView: true` immediately for `prefers-reduced-motion` users
 *   and environments without `IntersectionObserver` (jsdom/older browsers);
 * - has a timed fallback so content is never permanently hidden;
 * - disconnects the observer once revealed (no scroll listeners left behind).
 */
export function useInView<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.15,
  rootMargin = '0px 0px -10% 0px',
  once = true,
  enabled = true,
}: UseInViewOptions = {}): UseInViewResult<T> {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setInView(true);
      return;
    }

    const node = ref.current;
    if (!node) return;

    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            if (once) observer.disconnect();
          } else if (!once) {
            setInView(false);
          }
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(node);
    const fallback = window.setTimeout(() => setInView(true), FALLBACK_DELAY_MS);

    return () => {
      window.clearTimeout(fallback);
      observer.disconnect();
    };
  }, [threshold, rootMargin, once, enabled]);

  return { ref, inView };
}

export default useInView;
