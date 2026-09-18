import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  collectPageRevealItems,
  elementSignature,
  meaningfulChildren,
  uniformChildren,
  drillSingleChild,
  isOutOfFlow,
} from '../../utils/revealPlan';

function make(tag = 'div', className = '', text = ''): HTMLElement {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text) el.textContent = text;
  return el;
}

beforeEach(() => {
  document.body.innerHTML = '';
});
afterEach(() => {
  document.body.innerHTML = '';
});

describe('elementSignature', () => {
  it('treats identical siblings as the same signature', () => {
    const a = make('div', 'bg-white rounded p-4');
    const b = make('div', 'bg-white rounded p-4');
    expect(elementSignature(a)).toBe(elementSignature(b));
  });

  it('distinguishes different tags / classes', () => {
    expect(elementSignature(make('div', 'card'))).not.toBe(elementSignature(make('p', 'card')));
    expect(elementSignature(make('div', 'card'))).not.toBe(elementSignature(make('div', 'other')));
  });

  it('ignores responsive/state prefixes when matching', () => {
    expect(elementSignature(make('div', 'card'))).toBe(
      elementSignature(make('div', 'card hover:scale-105 lg:p-2 md:text-sm'))
    );
  });

  it('returns empty for non-elements', () => {
    expect(elementSignature(null as unknown as HTMLElement)).toBe('');
  });
});

describe('meaningfulChildren', () => {
  it('skips script/style and persistent chrome (header/footer/nav/aside)', () => {
    const main = make('main');
    main.append(
      make('script'),
      make('header', 'page-header'),
      make('nav', 'main-nav'),
      make('section', 'content'),
      make('footer', 'page-footer')
    );
    document.body.append(main);
    expect(meaningfulChildren(main).map((c) => c.tagName)).toEqual(['SECTION']);
  });

  it('skips aria-hidden elements', () => {
    const box = make('div');
    const hidden = make('div');
    hidden.setAttribute('aria-hidden', 'true');
    box.append(make('div', 'visible'), hidden);
    document.body.append(box);
    expect(meaningfulChildren(box).map((c) => c.className)).toEqual(['visible']);
  });
});

describe('isOutOfFlow', () => {
  it('is false under jsdom (no layout)', () => {
    const el = make('div');
    document.body.append(el);
    expect(isOutOfFlow(el)).toBe(false);
  });
});

describe('uniformChildren', () => {
  it('returns a group of identical cards when >= 3', () => {
    const grid = make('div', 'grid');
    for (let i = 0; i < 5; i++) grid.append(make('div', 'card shadow'));
    document.body.append(grid);
    expect(uniformChildren(grid).length).toBe(5);
  });

  it('returns [] when siblings are not uniform', () => {
    const box = make('div');
    box.append(make('div', 'title'), make('div', 'image'), make('div', 'cta'));
    document.body.append(box);
    expect(uniformChildren(box).length).toBe(0);
  });

  it('returns [] when fewer than 3 siblings', () => {
    const grid = make('div', 'grid');
    grid.append(make('div', 'card'), make('div', 'card'));
    document.body.append(grid);
    expect(uniformChildren(grid).length).toBe(0);
  });

  it('returns the largest uniform group', () => {
    const box = make('div');
    box.append(
      make('span'),
      make('span'),
      make('p'),
      make('div', 'card'),
      make('div', 'card'),
      make('div', 'card')
    );
    document.body.append(box);
    expect(uniformChildren(box).length).toBe(3);
  });
});

describe('drillSingleChild', () => {
  it('descends through a single-child wrapper', () => {
    const inner = make('div', 'grid');
    inner.append(make('div', 'card'), make('div', 'card'), make('div', 'card'));
    const wrapper = make('div', 'container');
    wrapper.append(inner);
    expect(drillSingleChild(wrapper)).toBe(inner);
  });

  it('does not descend into a background-painted hero', () => {
    const hero = make('div', 'bg-hero overflow-hidden');
    hero.append(make('img'));
    expect(drillSingleChild(hero)).toBe(hero);
  });

  it('does not descend into an overflow-clipped element', () => {
    const scroller = make('div', 'overflow-hidden');
    scroller.append(make('div', 'card'));
    expect(drillSingleChild(scroller)).toBe(scroller);
  });
});

describe('collectPageRevealItems', () => {
  it('reveals inner children of <section> blocks (CMS pages)', () => {
    const main = make('main');
    const s1 = make('section', 'py-16');
    s1.append(make('div', 'hero'), make('div', 'body'));
    const s2 = make('section', 'py-16');
    s2.append(make('div', 'title'));
    main.append(s1, s2);
    document.body.append(main);

    const items = collectPageRevealItems();
    expect(items.length).toBe(3);
    expect(items.every((i) => !i.classList.contains('py-16'))).toBe(true);
  });

  it('explodes a uniform grid into staggered card items (no <section>)', () => {
    const main = make('main');
    main.append(make('div', 'text-center mb-12'));
    const grid = make('div', 'grid grid-cols-3');
    for (let i = 0; i < 6; i++) grid.append(make('div', 'card shadow'));
    main.append(grid);
    document.body.append(main);

    const items = collectPageRevealItems();
    expect(items.length).toBe(7);
    expect(items.filter((i) => i.classList.contains('card')).length).toBe(6);
  });

  it('drills into a single content-wrapper child', () => {
    const main = make('main');
    const wrapper = make('div', 'container mx-auto');
    const grid = make('div', 'grid');
    for (let i = 0; i < 4; i++) grid.append(make('div', 'card'));
    wrapper.append(grid);
    main.append(wrapper);
    document.body.append(main);

    const items = collectPageRevealItems();
    expect(items.some((i) => i.classList.contains('card'))).toBe(true);
  });

  it('falls back to #root wrapper when no <main> is present', () => {
    const root = make('div', 'page');
    const grid = make('div', 'grid');
    for (let i = 0; i < 3; i++) grid.append(make('div', 'card'));
    root.append(grid);
    const appRoot = make('div');
    appRoot.id = 'root';
    appRoot.append(root);
    document.body.append(appRoot);

    const items = collectPageRevealItems();
    expect(items.filter((i) => i.classList.contains('card')).length).toBe(3);
  });

  it('skips elements already revealed (data-page-reveal="done")', () => {
    const main = make('main');
    const done = make('div', 'card');
    done.dataset.pageReveal = 'done';
    const pending = make('div', 'card');
    main.append(done, pending);
    document.body.append(main);

    const items = collectPageRevealItems();
    expect(items.length).toBe(1);
    expect(items[0]).toBe(pending);
  });

  it('skips display:none style blocks', () => {
    const main = make('main');
    const hidden = make('div', 'off');
    hidden.style.display = 'none';
    const visible = make('div', 'on');
    main.append(hidden, visible);
    document.body.append(main);

    const items = collectPageRevealItems();
    expect(items.map((i) => i.className)).toEqual(['on']);
  });

  it('returns [] when the document has no revealable content', () => {
    expect(collectPageRevealItems()).toEqual([]);
  });
});
