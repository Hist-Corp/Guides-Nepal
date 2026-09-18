/**
 * Structural helpers that decide *what* to animate on a content page.
 *
 * This module is intentionally layout-free (it never calls `getBoundingClientRect`
 * or reads `offsetHeight`) so the collection logic can be unit-tested under jsdom,
 * which reports zeros for every layout metric. Layout/visibility filtering that is
 * only meaningful in a real browser lives in `PageReveal` itself.
 */

/** Minimum siblings sharing an identity to be treated as a staggerable grid/list. */
export const MIN_STAGGER_GROUP = 3;

const SKIP_TAGS: ReadonlySet<string> = new Set([
  'SCRIPT',
  'STYLE',
  'SVG',
  'VIDEO',
  'CANVAS',
  'IFRAME',
]);
const SKIP_ROLES: ReadonlySet<string> = new Set([
  'banner',
  'contentinfo',
  'navigation',
  'complementary',
]);
const SECTION_LIKE_TAGS = new Set(['SECTION', 'ARTICLE', 'ASIDE']);

/**
 * Stable signature for an element so grid/list siblings can be matched.
 * Responsive and state variants (`md:`, `hover:`, …) are stripped.
 */
export function elementSignature(el: HTMLElement): string {
  if (!(el instanceof HTMLElement)) return '';
  const tag = el.tagName.toLowerCase();
  const cls = (el.getAttribute('class') || '').trim();
  const parts = cls
    .split(/\s+/)
    .filter((c) => c)
    .filter((c) => !/^(hover|focus|active|visited|group-hover|md:|sm:|lg:|xl:|2xl:)/.test(c))
    .sort()
    .join(' ');
  const role = el.getAttribute('role') || '';
  return `${tag}|${parts}|${role}`;
}

export function inlineHidden(el: HTMLElement): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const style = el.style;
  return Boolean(style && (style.display === 'none' || style.visibility === 'hidden'));
}

function isPersistentChrome(el: HTMLElement): boolean {
  const role = el.getAttribute('role');
  if (role && SKIP_ROLES.has(role)) return true;
  const tag = el.tagName;
  if (tag === 'HEADER' || tag === 'FOOTER' || tag === 'NAV' || tag === 'ASIDE') return true;
  if (el.getAttribute('aria-hidden') === 'true') return true;
  return false;
}

/** True when an element is positioned out of normal flow (fixed/absolute/sticky). */
export function isOutOfFlow(el: HTMLElement): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  if (tag === 'SVG' || tag === 'VIDEO' || tag === 'IFRAME' || tag === 'CANVAS') return true;
  if (typeof window === 'undefined') return false;
  const dv = (el.ownerDocument as Document).defaultView;
  if (!dv) return false;
  const cs = dv.getComputedStyle(el);
  const p = cs && cs.position;
  return p === 'fixed' || p === 'absolute' || p === 'sticky';
}

/** Direct element children that are animation candidates, in DOM order. */
export function meaningfulChildren(root: HTMLElement | ParentNode): HTMLElement[] {
  if (!(root instanceof Element)) return [];
  const out: HTMLElement[] = [];
  for (const child of Array.from(root.children)) {
    if (!(child instanceof HTMLElement)) continue;
    if (SKIP_TAGS.has(child.tagName)) continue;
    if (inlineHidden(child)) continue;
    if (isPersistentChrome(child)) continue;
    out.push(child);
  }
  return out;
}

/**
 * If `block` wraps a single piece of content (e.g. a max-width wrapper around a
 * gallery grid), descend once. Won't descend into background-painted or
 * overflow-clipped hero imagery.
 */
export function drillSingleChild(block: HTMLElement): HTMLElement {
  let cur = block;
  let depth = 0;
  while (depth < 2) {
    const cls = cur.getAttribute('class') || '';
    // Stop on a painted / clipped element — it is the block we animate.
    if (/\bbg-/.test(cls) && !/\bcontainer\b/.test(cls)) return cur;
    if (/\boverflow-(hidden|auto|scroll)\b/.test(cls)) return cur;
    // Only descend through a single neutral child.
    if (cur.children.length !== 1) return cur;
    const only = cur.firstElementChild as HTMLElement | null;
    if (!only || !(only instanceof HTMLElement)) return cur;
    cur = only;
    depth++;
  }
  return cur;
}

/**
 * Returns sibling elements forming a uniform grid/list (>=3 identical signature)
 * to animate individually. Returns `[]` otherwise.
 */
export function uniformChildren(block: HTMLElement): HTMLElement[] {
  const kids = meaningfulChildren(block);
  if (kids.length < MIN_STAGGER_GROUP) return [];
  const buckets = new Map<string, HTMLElement[]>();
  for (const child of kids) {
    if (isOutOfFlow(child) || inlineHidden(child)) continue;
    const sig = elementSignature(child);
    if (!sig) continue;
    const arr = buckets.get(sig);
    if (arr) arr.push(child);
    else buckets.set(sig, [child]);
  }
  let best: HTMLElement[] = [];
  for (const group of buckets.values()) {
    if (group.length >= MIN_STAGGER_GROUP && group.length > best.length) best = group;
  }
  return best;
}

function resolveRoots(doc: Document): HTMLElement[] {
  if (!doc || typeof doc.querySelectorAll !== 'function') return [];
  const mains = Array.from(doc.querySelectorAll<HTMLElement>('main'));
  if (mains.length) return mains;
  const appRoot = doc.getElementById('root');
  const wrapper = appRoot?.firstElementChild;
  if (wrapper && wrapper instanceof HTMLElement) return [wrapper];
  if (doc.body) return [doc.body as HTMLElement];
  return [];
}

function collectFromRoot(root: HTMLElement, out: HTMLElement[]): void {
  const blocks = meaningfulChildren(root);

  for (const block of blocks) {
    if (block.dataset.pageReveal === 'done' || inlineHidden(block)) continue;

    // CMS-style block: reveal the section's inner content, not the section.
    if (SECTION_LIKE_TAGS.has(block.tagName)) {
      const inner = meaningfulChildren(block).filter((c) => !isOutOfFlow(c));
      if (inner.length > 0) {
        for (const child of inner) {
          if (child.dataset.pageReveal !== 'done') out.push(child);
        }
        continue;
      }
    }

    // A lone wrapper around real content -> descend once.
    const target = blocks.length === 1 ? drillSingleChild(block) : block;
    if (blocks.length === 1 && target !== block) {
      const group = uniformChildren(target);
      if (group.length >= MIN_STAGGER_GROUP) {
        for (const child of group) {
          if (child.dataset.pageReveal !== 'done' && !isOutOfFlow(child)) out.push(child);
        }
        continue;
      }
      const inner = meaningfulChildren(target).filter((c) => !isOutOfFlow(c));
      if (inner.length > 0) {
        for (const child of inner) {
          if (child.dataset.pageReveal !== 'done') out.push(child);
        }
        continue;
      }
      if (!isOutOfFlow(target)) out.push(target);
      continue;
    }

    const group = uniformChildren(block);
    if (group.length >= MIN_STAGGER_GROUP) {
      for (const child of group) {
        if (child.dataset.pageReveal !== 'done' && !isOutOfFlow(child)) out.push(child);
      }
    } else if (!isOutOfFlow(block)) {
      out.push(block);
    }
  }
}

/**
 * Collects the flat, de-duplicated list of elements that should animate on the
 * current (non-home) page. Order drives the stagger delay.
 */
export function collectPageRevealItems(doc: Document = document): HTMLElement[] {
  const roots = resolveRoots(doc);
  const items: HTMLElement[] = [];
  for (const root of roots) {
    collectFromRoot(root, items);
  }
  return items;
}

/** Variant → Tailwind animation utility (keyframes live in tailwind.config.js). */
export type RevealVariantName = 'up' | 'down' | 'left' | 'right' | 'zoom' | 'pop';
export const REVEAL_VARIANT_CLASS: Record<RevealVariantName, string> = {
  up: 'animate-fade-in-up',
  down: 'animate-fade-in-down',
  left: 'animate-fade-in-left',
  right: 'animate-fade-in-right',
  zoom: 'animate-zoom-in',
  pop: 'animate-pop-in',
};
