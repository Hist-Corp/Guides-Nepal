/**
 * Full-length blog post content keyed by slug.
 *
 * Each entry is a complete article for the /blog/:slug detail page. The
 * listing page shows only the excerpt; the detail page renders the full body.
 * Sections are separated by blank lines so the detail page can split
 * on "\n\n" and render each block as its own paragraph.
 *
 * Individual blog contents live in ./blogs/ to keep each file manageable.
 */

export interface BlogFullContent {
  [slug: string]: string;
}

import { hiddenGemsKathmandu } from './blogs/hidden-gems-kathmandu';
import { foodieGuideNewariCuisine } from './blogs/foodie-guide-newari-cuisine';
import { pokharaBeyondTouristTrail } from './blogs/pokhara-beyond-tourist-trail';
import { sustainableTravelNepalGuide } from './blogs/sustainable-travel-nepal-guide';
import { bhaktapurWalkingLivingHistory } from './blogs/bhaktapur-walking-living-history';
import { howToBecomeLocalGuideNepal } from './blogs/how-to-become-local-guide-nepal';

export const blogFullContent: BlogFullContent = {
  'hidden-gems-kathmandu': hiddenGemsKathmandu,
  'foodie-guide-newari-cuisine': foodieGuideNewariCuisine,
  'pokhara-beyond-tourist-trail': pokharaBeyondTouristTrail,
  'sustainable-travel-nepal-guide': sustainableTravelNepalGuide,
  'bhaktapur-walking-living-history': bhaktapurWalkingLivingHistory,
  'how-to-become-local-guide-nepal': howToBecomeLocalGuideNepal,
};
