/**
 * Motion helpers shared by the scroll-reveal primitives
 * (`hooks/useInView` + `components/common/Reveal`).
 */

/**
 * True when the visitor asked their OS to minimise animation
 * (`prefers-reduced-motion: reduce`). The reveal primitives use this to show
 * their content immediately instead of animating it in — content is never
 * hidden or delayed for those users.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
