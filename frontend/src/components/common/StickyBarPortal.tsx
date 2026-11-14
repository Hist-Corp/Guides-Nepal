import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

// Module-level ref count so overlapping bars (e.g. during a route transition)
// keep the flag set until the last one unmounts.
let activeBars = 0;

/**
 * Mounts the sticky mobile Book-Now bar on `document.body` and flags its
 * presence with `data-sticky-bar` on `<body>` while mounted.
 *
 * - Portaling out of the page tree keeps the bar immune to transformed
 *   ancestors (PageReveal's reveal animations) that would otherwise trap
 *   `position: fixed` and pin the bar to a container instead of the viewport.
 * - The body flag lets CSS react to the bar's presence: SupportWidget lifts
 *   itself above the bar on mobile/tablet only on pages that render one, and
 *   sits at its normal bottom position everywhere else.
 */
export function StickyBarPortal({ children }: { children: ReactNode }) {
  useEffect(() => {
    activeBars += 1;
    document.body.setAttribute('data-sticky-bar', 'true');
    return () => {
      activeBars -= 1;
      if (activeBars <= 0) {
        document.body.removeAttribute('data-sticky-bar');
      }
    };
  }, []);

  return createPortal(<>{children}</>, document.body);
}
