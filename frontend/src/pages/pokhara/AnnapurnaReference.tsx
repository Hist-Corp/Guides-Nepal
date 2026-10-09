import React, { useEffect, useRef, useState } from 'react';
import './annapurnaTrek.css';
import {
  abcSprite,
  abcHeadingHtml,
  abcStickyHtml,
  abcGalleryHtml,
  abcTrustHtml,
  abcMainHtml,
  abcGalleryData,
} from './annapurnaContent';

/* -------------------------------------------------------------------------------------
 * Ported markup from magicalnepal.com/trip/annapurna-base-camp-trek/.
 * The static HTML lives in annapurnaContent.ts (generated from the reference page);
 * this file re-creates the interactive behaviour (Alpine.js in the reference) in React:
 * share menu, sticky tab navbar, gallery tabs + lightbox, itinerary/trip-details
 * accordions and dead-link fallbacks.
 * ------------------------------------------------------------------------------------- */

interface GItem {
  src: string;
  review?: string;
}

interface TgReview {
  name: string;
  country: string;
  rating: string | number;
  full: string;
  date: string;
  guide: string;
  gphoto: string;
  avatar: string;
}

const DATA = abcGalleryData as unknown as {
  our: GItem[];
  photos: GItem[];
  reviews: TgReview[];
};

const scrollToId = (id: string) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

/* SVG icon sprite referenced through <use href="#i-..."> in the ported markup. */
export const ABCSprite: React.FC = () => (
  <div aria-hidden="true" dangerouslySetInnerHTML={{ __html: abcSprite }} />
);

/* Breadcrumb + eyebrow + title + at-a-glance + rating trust line. */
export const ABCHeading: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    // Share links were Alpine-bound (x-bind:href) in the reference; fill them at runtime.
    // Order in .th-share__menu: Facebook, X, Email (copy-link is a <button>).
    const links = Array.from(root.querySelectorAll<HTMLAnchorElement>('.th-share__menu a'));
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);
    if (links[0]) links[0].href = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    if (links[1]) links[1].href = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
    if (links[2] && !links[2].getAttribute('href'))
      links[2].href = `mailto:?subject=${title}&body=${url}`;

    let tipTimer: ReturnType<typeof setTimeout> | undefined;

    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const shareWrap = t.closest('.th-share') as HTMLElement | null;
      const wishWrap = t.closest('.th-wish') as HTMLElement | null;

      if (shareWrap) {
        const copyBtn = t.closest('.th-share__menu button');
        if (copyBtn) {
          try {
            navigator.clipboard?.writeText(window.location.href);
          } catch {
            /* clipboard unavailable */
          }
          const tip = shareWrap.querySelector<HTMLElement>('.th-act__tip');
          if (tip) {
            tip.style.display = 'block';
            clearTimeout(tipTimer);
            tipTimer = setTimeout(() => (tip.style.display = 'none'), 1600);
          }
          return;
        }
        const act = t.closest('.th-act');
        if (act && !t.closest('.th-share__menu')) {
          const menu = shareWrap.querySelector<HTMLElement>('.th-share__menu');
          if (menu) menu.style.display = menu.style.display === 'none' ? '' : 'none';
          return;
        }
      }
      if (wishWrap) {
        const act = t.closest('.th-act');
        if (act && !t.closest('.th-wish__panel')) {
          const panel = wishWrap.querySelector<HTMLElement>('.th-wish__panel');
          if (panel) panel.style.display = panel.style.display === 'none' ? '' : 'none';
          return;
        }
      }
      // click outside closes open panels
      const m = root.querySelector<HTMLElement>('.th-share__menu');
      if (m && m.style.display !== 'none' && !t.closest('.th-share')) m.style.display = 'none';
      const p = root.querySelector<HTMLElement>('.th-wish__panel');
      if (p && p.style.display !== 'none' && !t.closest('.th-wish')) p.style.display = 'none';
    };

    root.addEventListener('click', onClick);
    return () => {
      root.removeEventListener('click', onClick);
      clearTimeout(tipTimer);
    };
  }, []);

  return <div ref={ref} dangerouslySetInnerHTML={{ __html: abcHeadingHtml }} />;
};
/* Fixed tab navbar that appears once the page is scrolled (id="tripStickyNavbar"). */
export const ABCStickyNav: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const nav = root.querySelector<HTMLElement>('#tripStickyNavbar');
    if (!nav) return;
    const wrapper = nav.querySelector<HTMLElement>('.sticky-navbar-wrapper');
    const trigger = nav.querySelector<HTMLElement>('.sticky-navbar-trigger');

    const tabs: Array<[string, string]> = [
      ['overview', 'Overview'],
      ['itinerary', 'Itinerary'],
      ['includes', 'Includes'],
      ['tripdetails', 'Trip Details'],
      ['map', 'Map'],
      ['reviews', 'Reviews'],
    ];

    const onScroll = () => {
      nav.classList.toggle('hidden', window.scrollY < 520);
      // A section counts as "current" once its heading has scrolled up near the fixed bar.
      const threshold = 140;
      let active = tabs[0];
      for (const tab of tabs) {
        const el = document.getElementById(tab[0]);
        if (el && el.getBoundingClientRect().top <= threshold) active = tab;
      }
      if (trigger) trigger.textContent = active[1];
      nav.querySelectorAll('.sticky-navbar-wrapper a').forEach((node) => {
        const a = node as HTMLAnchorElement;
        a.classList.toggle('active', a.getAttribute('href') === `#${active[0]}`);
      });
    };

    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest('.sticky-navbar-trigger')) {
        wrapper?.classList.toggle('hidden');
        return;
      }
      const scrollBtn = t.closest('[data-scroll-target]') as HTMLElement | null;
      if (scrollBtn?.dataset.scrollTarget) {
        scrollToId(scrollBtn.dataset.scrollTarget.replace('#', ''));
        return;
      }
      const link = t.closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (link) wrapper?.classList.add('hidden'); // close mobile dropdown after jump
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    nav.addEventListener('click', onClick);
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      nav.removeEventListener('click', onClick);
    };
  }, []);

  return <div ref={ref} dangerouslySetInnerHTML={{ __html: abcStickyHtml }} />;
};

/* Photo gallery with the two reference tabs (Trek gallery / Traveller photos) + lightbox. */
export const ABCGallery: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<'our' | 'photos'>('our');
  const [lb, setLb] = useState<{ list: 'our' | 'photos'; index: number } | null>(null);

  // tab visibility / active state
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    root.querySelectorAll<HTMLElement>('[data-gwrap]').forEach((w) => {
      w.style.display = w.dataset.gwrap === tab ? '' : 'none';
    });
    root.querySelectorAll<HTMLElement>('[data-gtab]').forEach((b) => {
      b.classList.toggle('is-active', b.dataset.gtab === tab);
    });
  }, [tab]);

  // tab + lightbox triggers
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const tabBtn = t.closest('[data-gtab]') as HTMLElement | null;
      if (tabBtn?.dataset.gtab) {
        setTab(tabBtn.dataset.gtab as 'our' | 'photos');
        return;
      }
      const openBtn = t.closest('[data-gopen]') as HTMLElement | null;
      if (openBtn?.dataset.gopen) {
        const [list, idx] = openBtn.dataset.gopen.split(':');
        setLb({ list: list as 'our' | 'photos', index: Number(idx) });
      }
    };
    root.addEventListener('click', onClick);
    return () => root.removeEventListener('click', onClick);
  }, []);

  // lightbox: body scroll lock + keyboard controls
  useEffect(() => {
    if (!lb) return;
    document.body.style.overflow = 'hidden';
    const items = lb.list === 'our' ? DATA.our : DATA.photos;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLb(null);
      if (e.key === 'ArrowRight' && lb.index < items.length - 1)
        setLb({ ...lb, index: lb.index + 1 });
      if (e.key === 'ArrowLeft' && lb.index > 0) setLb({ ...lb, index: lb.index - 1 });
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [lb]);

  const items = lb ? (lb.list === 'our' ? DATA.our : DATA.photos) : [];
  const current = lb ? items[lb.index] : undefined;
  const reviewIndex = current?.review;
  const review =
    lb &&
    lb.list === 'photos' &&
    reviewIndex !== undefined &&
    reviewIndex !== '' &&
    !Number.isNaN(Number(reviewIndex))
      ? DATA.reviews[Number(reviewIndex)]
      : undefined;
  const step = (delta: number) => {
    if (!lb) return;
    const next = lb.index + delta;
    if (next >= 0 && next < items.length) setLb({ ...lb, index: next });
  };

  const personAvatar = (
    <span className="tg-lb__ava tg-lb__ava--ph">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </svg>
    </span>
  );

  return (
    <>
      <div ref={ref} dangerouslySetInnerHTML={{ __html: abcGalleryHtml }} />

      {lb && current && (
        <div
          className="tg-lb"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if ((e.target as HTMLElement).classList.contains('tg-lb')) setLb(null);
          }}
        >
          <button type="button" className="tg-lb__x" onClick={() => setLb(null)} aria-label="Close">
            &times;
          </button>
          <button
            type="button"
            className="tg-lb__nav tg-lb__prev"
            onClick={() => step(-1)}
            aria-label="Previous"
            style={lb.index === 0 ? { display: 'none' } : undefined}
          >
            &#8249;
          </button>
          <div className={`tg-lb__inner${review ? ' is-review' : ''}`}>
            <div className="tg-lb__media">
              <img className="tg-lb__img" src={current.src} alt="" />
            </div>
            {review && (
              <div className="tg-lb__review">
                <div className="tg-lb__person">
                  {review.avatar ? (
                    <img className="tg-lb__ava" src={review.avatar} alt="" />
                  ) : (
                    personAvatar
                  )}
                  <div className="tg-lb__pmeta">
                    <p className="tg-lb__name">
                      <strong>{review.name}</strong>
                      {review.country && <span> · {review.country}</span>}
                    </p>
                    {review.date && (
                      <p className="tg-lb__booked">
                        Travelled in <span>{review.date}</span>
                      </p>
                    )}
                  </div>
                </div>
                <div className="tg-lb__stars">{'★'.repeat(Number(review.rating) || 5)}</div>
                <p className="tg-lb__text">{review.full}</p>
                {review.guide && (
                  <div className="tg-lb__guide">
                    {review.gphoto ? (
                      <img className="tg-lb__gava" src={review.gphoto} alt="" />
                    ) : (
                      <span className="tg-lb__gava tg-lb__ava--ph">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="8" r="4" />
                          <path d="M4 21a8 8 0 0 1 16 0" />
                        </svg>
                      </span>
                    )}
                    <span className="tg-lb__gtext">
                      Guided by <strong>{review.guide}</strong>
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
          <button
            type="button"
            className="tg-lb__nav tg-lb__next"
            onClick={() => step(1)}
            aria-label="Next"
            style={lb.index >= items.length - 1 ? { display: 'none' } : undefined}
          >
            &#8250;
          </button>
          <div className="tg-lb__mnav">
            <button type="button" onClick={() => step(-1)} disabled={lb.index === 0}>
              &#8249; Prev
            </button>
            <span className="tg-lb__count">
              {lb.index + 1} / {items.length}
            </span>
            <button type="button" onClick={() => step(1)} disabled={lb.index >= items.length - 1}>
              Next &#8250;
            </button>
          </div>
        </div>
      )}
    </>
  );
};

/* "Govt-registered local agency · 10,000+ travellers · ..." strip below the gallery. */
export const ABCTrustStrip: React.FC = () => (
  <div dangerouslySetInnerHTML={{ __html: abcTrustHtml }} />
);

/* Main content: Introduction → Highlights → Itinerary → Includes/Excludes →
   Trip details → Download → Map (packed/packing & why-book sections excluded).
   Wires the itinerary + "read before you book" accordions and dead CTAs. */
export const ABCMain: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const setDet = (det: HTMLElement, open: boolean) => {
      if (open) {
        det.style.height = `${det.scrollHeight}px`;
        det.dataset.open = '1';
        const onEnd = () => {
          if (det.dataset.open === '1') det.style.height = 'auto';
          det.removeEventListener('transitionend', onEnd);
        };
        det.addEventListener('transitionend', onEnd);
      } else {
        if (det.style.height === 'auto') det.style.height = `${det.scrollHeight}px`;
        det.dataset.open = '0';
        requestAnimationFrame(() => {
          det.style.height = '0px';
        });
      }
    };

    // Default state: every accordion closed.
    root
      .querySelectorAll<HTMLElement>('.block-itinerary__item__details, .block-collapse__details')
      .forEach((det) => {
        det.style.overflow = 'hidden';
        det.style.height = '0px';
        det.dataset.open = '0';
      });

    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement;

      // "Show all" / "Hide all" itinerary toggles
      const trig = t.closest('.itn-toggle') as HTMLElement | null;
      if (trig) {
        const show = (trig.dataset.trigger || '').toLowerCase().includes('show');
        root
          .querySelectorAll<HTMLElement>('.block-itinerary__item__details')
          .forEach((det) => setDet(det, show));
        root
          .querySelectorAll('.block-itinerary__item__header')
          .forEach((h) => h.classList.toggle('active', show));
        const toggles = root.querySelectorAll<HTMLElement>('.itn-toggle');
        toggles[0]?.classList.toggle('hidden', !show);
        toggles[1]?.classList.toggle('hidden', show);
        return;
      }

      // single itinerary day
      const ihdr = t.closest('.block-itinerary__item__header') as HTMLElement | null;
      if (ihdr) {
        const wrap = ihdr.closest('.acf-innerblocks-container') || ihdr.parentElement;
        const det = wrap?.querySelector<HTMLElement>(':scope > .block-itinerary__item__details');
        if (det) {
          const open = det.dataset.open !== '1';
          setDet(det, open);
          ihdr.classList.toggle('active', open);
        }
        return;
      }

      // "read before you book" accordion
      const chdr = t.closest('.block-collapse__header') as HTMLElement | null;
      if (chdr) {
        const det = chdr.parentElement?.querySelector<HTMLElement>(
          ':scope > .block-collapse__details'
        );
        if (det) {
          const open = det.dataset.open !== '1';
          setDet(det, open);
          chdr.classList.toggle('active', open);
        }
        return;
      }

      // Download-PDF style buttons (no backend here) and dead links (e.g. "Plan Your Trip")
      if (t.closest('.modal-trigger')) {
        return;
      }
      const a = t.closest('a') as HTMLAnchorElement | null;
      if (a && !a.getAttribute('href')) {
        return;
      }
    };

    root.addEventListener('click', onClick);
    return () => root.removeEventListener('click', onClick);
  }, []);

  return (
    <div
      ref={ref}
      className="entry-content p-0 wp-block-post-content has-global-padding is-layout-constrained wp-block-post-content-is-layout-constrained"
      dangerouslySetInnerHTML={{ __html: abcMainHtml }}
    />
  );
};
