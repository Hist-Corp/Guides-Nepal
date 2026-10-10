import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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

    // Remove the third-party "950 reviews on Tripadvisor" badge — we show our own
    // verified-review count instead and don't link out to Tripadvisor.
    root.querySelectorAll('.th-ta').forEach((el) => el.remove());
    root.querySelectorAll('.th-trust--line .th-dot').forEach((el) => el.remove());

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

    // Dock the bar directly BELOW the site header by tracking the header's
    // LIVE viewport position every frame while it moves. Mirroring the header's
    // scroll-direction rule with a CSS `top` transition desyncs: the header's
    // slide is React-state-driven and lags the scroll event, so the bar rides
    // up/down THROUGH the still-visible header and they overlap (worse with
    // momentum scrolling, where direction flickers). Tracking the header's
    // actual bottom edge follows its 300ms slide frame-perfectly instead.
    // While the header is hidden (slid up) its bottom edge reads ~0, so the
    // bar naturally takes the header's place at the very top.
    const header = document.querySelector<HTMLElement>('header.sticky');
    let rafId = 0;
    let stableFrames = 0;
    let lastTop = '';

    const syncTop = () => {
      const bottom = header ? header.getBoundingClientRect().bottom : 0;
      // 0.5px precision: fine enough to track the slide, coarse enough to settle.
      const next = `${Math.max(0, Math.round(bottom * 2) / 2)}px`;
      if (next !== nav.style.top) nav.style.top = next;
      return next;
    };

    const tick = () => {
      const top = syncTop();
      if (top === lastTop) {
        // Stop a few frames after the bar matches the header's bottom edge —
        // by then the header's slide animation has settled too.
        if (++stableFrames >= 3) {
          rafId = 0;
          return;
        }
      } else {
        stableFrames = 0;
        lastTop = top;
      }
      rafId = requestAnimationFrame(tick);
    };

    // Start a tracking run (idempotent): runs each frame until the bar's top
    // has matched the header's bottom edge for a few consecutive frames.
    const track = () => {
      stableFrames = 0;
      if (!rafId) rafId = requestAnimationFrame(tick);
    };

    // The header's slide is class-driven (React commits it a frame or two after
    // the scroll event). If the rAF run happened to settle in that gap, the
    // observer restarts it the moment the class flips, so the bar can never
    // miss the start of a slide-in/slide-out.
    const headerObserver = header ? new MutationObserver(() => track()) : null;
    headerObserver?.observe(header!, { attributes: true, attributeFilter: ['class'] });

    const onScroll = () => {
      const y = window.scrollY;
      track(); // follow the header's slide-in/slide-out frame by frame

      nav.classList.toggle('hidden', y < 520);
      // A section counts as "current" once its heading has scrolled up near the fixed bar
      // (bars stack to ~header 81px + nav ~56px = ~137px, so activate just past them).
      const threshold = 150;
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
    window.addEventListener('resize', track);
    nav.addEventListener('click', onClick);
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', track);
      nav.removeEventListener('click', onClick);
      headerObserver?.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // role="navigation" doubles as a PageReveal exclusion: revealPlan's
  // isPersistentChrome() skips landmark roles, so this wrapper never receives
  // `animate-fade-in-up`. A transformed ancestor would otherwise become the
  // containing block for the bar's position:fixed and pin it to the content.
  return (
    <div
      ref={ref}
      role="navigation"
      aria-label="Trip sections"
      dangerouslySetInnerHTML={{ __html: abcStickyHtml }}
    />
  );
};

/* Photo gallery with the two reference tabs (Trek gallery / Traveller photos) + lightbox.
 * Limits: 10 trek-gallery images, 15 traveller photos. The ported static markup
 * (abcGalleryHtml) may reference larger indices — every data-gopen is remapped /
 * clamped at runtime so the lightbox never points at a missing image. */
const OUR_LIMIT = 10;
const PHOTOS_LIMIT = 15;

const ourItems = (DATA.our || []).slice(0, OUR_LIMIT);
const photoItems = (DATA.photos || []).slice(0, PHOTOS_LIMIT);

export const ABCGallery: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<'our' | 'photos'>('our');
  const [lb, setLb] = useState<{ list: 'our' | 'photos'; index: number } | null>(null);
  const [imgOk, setImgOk] = useState(true);

  // tab visibility / active state + keep hardcoded counts in sync with limits
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    root.querySelectorAll<HTMLElement>('[data-gwrap]').forEach((w) => {
      w.style.display = w.dataset.gwrap === tab ? '' : 'none';
    });
    root.querySelectorAll<HTMLElement>('[data-gtab]').forEach((b) => {
      b.classList.toggle('is-active', b.dataset.gtab === tab);
    });
    // "photos:18" / "our:10" style triggers must stay inside the trimmed lists.
    root.querySelectorAll<HTMLElement>('[data-gopen]').forEach((btn) => {
      const raw = btn.dataset.gopen || '';
      const [list, idxRaw] = raw.split(':');
      const max = list === 'our' ? ourItems.length : photoItems.length;
      const idx = Math.max(0, Math.min(Number(idxRaw) || 0, Math.max(0, max - 1)));
      const fixed = `${list}:${idx}`;
      if (raw !== fixed) btn.dataset.gopen = fixed;
    });
    root.querySelectorAll<HTMLElement>('.tg-switch__btn').forEach((b) => {
      const count = b.querySelector('.tg-switch__count');
      if (!count) return;
      if (b.dataset.gtab === 'our') count.textContent = String(ourItems.length);
      if (b.dataset.gtab === 'photos') count.textContent = String(photoItems.length);
    });
    const pills = root.querySelectorAll<HTMLElement>('.tg-allpill');
    pills.forEach((pill) => {
      pill.innerHTML = pill.innerHTML.replace(
        /View all\s+\d+\s+photos?/i,
        `View all ${ourItems.length} photos`
      );
    });
    const mixMore = root.querySelectorAll<HTMLElement>('.tg-mixmore__n');
    mixMore.forEach((el) => {
      el.textContent = `+${Math.max(0, photoItems.length - 1)}`;
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
        const max = list === 'our' ? ourItems.length : photoItems.length;
        const safe = Math.max(0, Math.min(Number(idx) || 0, Math.max(0, max - 1)));
        setImgOk(true);
        setLb({ list: list as 'our' | 'photos', index: safe });
      }
    };
    root.addEventListener('click', onClick);
    return () => root.removeEventListener('click', onClick);
  }, []);

  // lightbox: body scroll lock + keyboard controls
  useEffect(() => {
    if (!lb) return;
    document.body.style.overflow = 'hidden';
    const items = lb.list === 'our' ? ourItems : photoItems;
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

  // reset the broken-image fallback whenever the slide changes
  useEffect(() => {
    setImgOk(true);
  }, [lb?.list, lb?.index]);

  const items = lb ? (lb.list === 'our' ? ourItems : photoItems) : [];
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
    if (next >= 0 && next < items.length) {
      setImgOk(true);
      setLb({ ...lb, index: next });
    }
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

      {lb &&
        current &&
        createPortal(
          <div className="mn-tt">
            <div
              className="tg-lb"
              role="dialog"
              aria-modal="true"
              aria-label={`Photo ${lb.index + 1} of ${items.length}`}
              onClick={(e) => {
                // Close when clicking the dimmed backdrop (anywhere outside the
                // image card / buttons). Using currentTarget avoids the old bug
                // where clicks on inner wrappers never matched '.tg-lb'.
                if (e.target === e.currentTarget) setLb(null);
              }}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 100000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1.25rem',
                background: 'rgba(4,12,22,.92)',
                backdropFilter: 'blur(5px)',
                WebkitBackdropFilter: 'blur(5px)',
              }}
            >
              <button
                type="button"
                className="tg-lb__x"
                onClick={() => setLb(null)}
                aria-label="Close"
                style={{
                  position: 'fixed',
                  top: 18,
                  right: 18,
                  width: 44,
                  height: 44,
                  fontSize: '1.6rem',
                  lineHeight: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 0,
                  cursor: 'pointer',
                  color: '#fff',
                  background: 'rgba(255,255,255,.18)',
                  borderRadius: 999,
                  zIndex: 2,
                }}
              >
                &times;
              </button>
              <button
                type="button"
                className="tg-lb__nav tg-lb__prev"
                onClick={(e) => {
                  e.stopPropagation();
                  step(-1);
                }}
                aria-label="Previous"
                disabled={lb.index === 0}
                style={{
                  position: 'fixed',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 46,
                  height: 46,
                  fontSize: '1.7rem',
                  lineHeight: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 0,
                  cursor: lb.index === 0 ? 'default' : 'pointer',
                  color: '#fff',
                  background: 'rgba(255,255,255,.18)',
                  borderRadius: 999,
                  opacity: lb.index === 0 ? 0.35 : 1,
                  zIndex: 2,
                }}
              >
                &#8249;
              </button>
              <div
                className={`tg-lb__inner${review ? ' is-review' : ''}`}
                onClick={(e) => e.stopPropagation()}
                style={{ position: 'relative', zIndex: 1 }}
              >
                <div className="tg-lb__media">
                  {imgOk ? (
                    <img
                      key={current.src}
                      className="tg-lb__img"
                      src={current.src}
                      alt={
                        lb.list === 'our'
                          ? 'Annapurna Base Camp trek photo'
                          : 'Traveller photo of Annapurna Base Camp Trek'
                      }
                      referrerPolicy="no-referrer"
                      onError={() => setImgOk(false)}
                      style={{ maxWidth: 'min(1000px,88vw)', maxHeight: '78vh' }}
                    />
                  ) : (
                    <div
                      style={{
                        color: '#fff',
                        textAlign: 'center',
                        padding: '3rem 2rem',
                        maxWidth: 420,
                      }}
                    >
                      <p style={{ fontSize: '2rem', margin: 0 }}>🖼️</p>
                      <p style={{ fontWeight: 700 }}>This photo failed to load.</p>
                      <p style={{ opacity: 0.75, fontSize: '.9rem' }}>
                        Please check your connection and try the next photo.
                      </p>
                    </div>
                  )}
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
                onClick={(e) => {
                  e.stopPropagation();
                  step(1);
                }}
                aria-label="Next"
                disabled={lb.index >= items.length - 1}
                style={{
                  position: 'fixed',
                  right: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 46,
                  height: 46,
                  fontSize: '1.7rem',
                  lineHeight: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 0,
                  cursor: lb.index >= items.length - 1 ? 'default' : 'pointer',
                  color: '#fff',
                  background: 'rgba(255,255,255,.18)',
                  borderRadius: 999,
                  opacity: lb.index >= items.length - 1 ? 0.35 : 1,
                  zIndex: 2,
                }}
              >
                &#8250;
              </button>
              <div
                className="tg-lb__mnav"
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: 'fixed',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '.75rem',
                  padding: '.55rem 1rem calc(env(safe-area-inset-bottom,0px) + .55rem)',
                  background: 'rgba(255,255,255,.97)',
                  borderTop: '1px solid #e5e7eb',
                }}
              >
                <button
                  type="button"
                  onClick={() => step(-1)}
                  disabled={lb.index === 0}
                  style={{
                    border: 0,
                    cursor: 'pointer',
                    background: '#0f172a',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '.9rem',
                    borderRadius: 999,
                    padding: '.55rem 1.2rem',
                    opacity: lb.index === 0 ? 0.4 : 1,
                  }}
                >
                  &#8249; Prev
                </button>
                <span
                  className="tg-lb__count"
                  style={{ color: '#64748b', fontSize: '.82rem', fontWeight: 600 }}
                >
                  {lb.index + 1} / {items.length}
                </span>
                <button
                  type="button"
                  onClick={() => step(1)}
                  disabled={lb.index >= items.length - 1}
                  style={{
                    border: 0,
                    cursor: 'pointer',
                    background: '#0f172a',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '.9rem',
                    borderRadius: 999,
                    padding: '.55rem 1.2rem',
                    opacity: lb.index >= items.length - 1 ? 0.4 : 1,
                  }}
                >
                  Next &#8250;
                </button>
              </div>
            </div>
          </div>,
          document.body
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

    // Strip outbound links from the ported reference content, EXCEPT the ones the
    // site owner chose to keep (original reference URLs): Pokhara, Kathmandu,
    // the Immigration Department online-visa site and the Nepal Tourism Board.
    // Everything else (Annapurna region/circuit, Dhaulagiri, Thorong La Pass,
    // Machhapuchhre, Ghandruk, Poon Hill, trek maps, TripAdvisor, …) is
    // unwrapped: inner content (e.g. <strong>) is kept so text still reads
    // naturally without redirecting visitors away. In-page anchors (#...) and
    // the share-menu links (Facebook/X/Email, wired at runtime in ABCHeading)
    // are always kept.
    const KEPT_OUTBOUND = new Set([
      'https://www.magicalnepal.com/travel-guide/kathmandu/go-kathmandu-pokhara/',
      'https://www.magicalnepal.com/nepal/kathmandu/tour/kathmandu-day-tour/',
      'https://nepaliport.immigration.gov.np/onlinevisa-mission/application',
      'https://ntb.gov.np/',
    ]);
    root.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((a) => {
      if (a.closest('.th-share__menu')) return; // share menu — wired intentionally
      const href = a.getAttribute('href') || '';
      if (href.startsWith('#')) return; // in-page tabs / review jumps
      if (KEPT_OUTBOUND.has(href)) {
        // Keep the chosen links, but open externals in a new tab safely.
        if (/^https?:\/\//.test(href)) {
          a.setAttribute('target', '_blank');
          a.setAttribute('rel', 'noopener noreferrer');
        }
        return;
      }
      const frag = document.createElement('span');
      frag.innerHTML = a.innerHTML;
      a.replaceWith(frag);
    });

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
        // [0] = "Show all", [1] = "Hide all" — hide the former whenever days are expanded.
        toggles[0]?.classList.toggle('hidden', show);
        toggles[1]?.classList.toggle('hidden', !show);
        // Keep aria-expanded on both swap-in buttons in sync with the real state.
        toggles.forEach((tb) => tb.setAttribute('aria-expanded', String(show)));
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
