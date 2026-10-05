import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronRight, Minus, Plus } from 'lucide-react';

export interface GuestPickerProps {
  /**
   * Current guest total (adults + children) known by the parent.
   * Infants and pets are tracked internally and reported in the summary
   * only — they do not affect the total, price, or booking payload.
   */
  value: number;
  /** Called with the new total (adults + children) whenever a counter changes. */
  onChange: (total: number) => void;
  /** Maximum combined adults + children. Defaults to 12. */
  maxGuests?: number;
  /** Unique prefix for generated element ids. */
  idPrefix?: string;
  /** Extra classes appended to the trigger's outer wrapper. */
  className?: string;
  /** Accessible label announced for the trigger button. */
  ariaLabel?: string;
}

interface CounterRow {
  key: 'adults' | 'children' | 'infants' | 'pets';
  title: string;
  subtitle: React.ReactNode;
  count: number;
  min: number;
  max: number;
  set: (n: number) => void;
}

const clamp = (n: number, min: number, max: number): number => Math.min(Math.max(n, min), max);

/**
 * Airbnb-inspired guest selector used on experience booking cards.
 *
 * The trigger mirrors the BookingCalendar card trigger (uppercase label +
 * value + chevron). The panel is portaled to document.body and
 * fixed-positioned from the trigger's bounding rect, so it is never
 * clipped by a card's overflow-hidden container. Rows: Adults, Children,
 * Infants and Pets with circular −/+ steppers, a max-guests note and a
 * Close footer.
 */
export const GuestPicker: React.FC<GuestPickerProps> = ({
  value,
  onChange,
  maxGuests = 12,
  idPrefix = 'guest',
  className,
  ariaLabel,
}) => {
  const [adults, setAdults] = useState(() => clamp(value, 1, maxGuests));
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [pets, setPets] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [pos, setPos] = useState<{
    top: number;
    left: number;
    width: number;
    maxHeight: number;
  } | null>(null);

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const total = adults + children;

  // Keep the internal breakdown in sync when the parent resets `value`
  // externally (e.g. a form reset). No-op when value already matches.
  useEffect(() => {
    if (value !== total) {
      setAdults(clamp(value, 1, maxGuests - children));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const commit = (
    next: Partial<{ adults: number; children: number; infants: number; pets: number }>
  ) => {
    const na = next.adults ?? adults;
    const nc = next.children ?? children;
    if (next.adults !== undefined) setAdults(na);
    if (next.children !== undefined) setChildren(nc);
    if (next.infants !== undefined) setInfants(next.infants);
    if (next.pets !== undefined) setPets(next.pets);
    if (na !== adults || nc !== children) onChange(na + nc);
  };

  /**
   * Places the portaled panel as a dropdown under the trigger.
   *
   * While scrolling only `top`/`left`/`width` are recomputed, so the panel
   * tracks the trigger one-to-one and its height never changes — recomputing
   * the cap against the live space below made it visibly shrink and grow as
   * it moved. The cap is only recomputed on open, on window resize, and when
   * the panel's own content changes size.
   */
  const reposition = useCallback((recalcHeight: boolean) => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const width = Math.min(Math.max(rect.width, 300), vw - 16);
    const left = clamp(rect.left, 8, Math.max(8, vw - width - 8));
    // Classic dropdown: always drop straight below the trigger (never flip
    // above), and grow no taller than the space left on screen — the panel
    // scrolls internally instead of jumping around the card.
    const top = rect.bottom + 8;

    setPos((prev) => {
      const maxHeight = recalcHeight || !prev ? Math.max(160, vh - top - 8) : prev.maxHeight;
      return prev &&
        prev.top === top &&
        prev.left === left &&
        prev.width === width &&
        prev.maxHeight === maxHeight
        ? prev
        : { top, left, width, maxHeight };
    });
  }, []);

  // True only while the portaled panel is actually in the DOM. Depending on
  // this instead of `pos` keeps the effect below from re-running on every
  // scroll frame, since `pos.top` changes each frame.
  const panelMounted = Boolean(isOpen && pos);

  // Position (and re-position) the panel while open. Scrolling is throttled to
  // one measurement per frame, and leaves the height cap alone.
  useLayoutEffect(() => {
    if (!isOpen) return;
    reposition(true);
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        reposition(false);
      });
    };
    const onResize = () => reposition(true);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [isOpen, reposition]);

  // Watch the panel's own box rather than re-measuring on every `pos` change,
  // which would re-cap the height mid-scroll. The observer only fires when the
  // panel is genuinely resized — e.g. the summary line rewrapping as the
  // guest count grows.
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panelMounted || !panel) return;
    const recapture = () => reposition(true);
    const observer = new ResizeObserver(recapture);
    observer.observe(panel);
    // The panel has just mounted, so cap it against the space below.
    recapture();
    return () => observer.disconnect();
  }, [panelMounted, adults, children, infants, pets, maxGuests, reposition]);

  // Close on Escape.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen]);

  // Close when clicking outside the trigger or the panel.
  useEffect(() => {
    if (!isOpen) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t) || triggerRef.current?.contains(t)) return;
      setIsOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [isOpen]);

  const summaryParts: string[] = [`${total} guest${total === 1 ? '' : 's'}`];
  if (infants > 0) summaryParts.push(`${infants} infant${infants === 1 ? '' : 's'}`);
  if (pets > 0) summaryParts.push(`${pets} pet${pets === 1 ? '' : 's'}`);
  const summary = summaryParts.join(', ');

  const rows: CounterRow[] = [
    {
      key: 'adults',
      title: 'Adults',
      subtitle: 'Age 18+',
      count: adults,
      min: 1,
      max: Math.max(1, maxGuests - children),
      set: (n) => commit({ adults: n }),
    },
    {
      key: 'children',
      title: 'Children',
      subtitle: 'Ages 2–17',
      count: children,
      min: 0,
      max: Math.max(0, maxGuests - adults),
      set: (n) => commit({ children: n }),
    },
    {
      key: 'infants',
      title: 'Infants',
      subtitle: 'Under 2',
      count: infants,
      min: 0,
      max: maxGuests,
      set: (n) => commit({ infants: n }),
    },
    {
      key: 'pets',
      title: 'Pets',
      subtitle: <span className="underline underline-offset-2">Bringing a service animal?</span>,
      count: pets,
      min: 0,
      max: maxGuests,
      set: (n) => commit({ pets: n }),
    },
  ];

  return (
    <div className={className}>
      <button
        ref={triggerRef}
        type="button"
        id={`${idPrefix}-trigger`}
        onClick={() => setIsOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={ariaLabel ?? `Select guests. ${summary}`}
        className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
          isOpen ? 'border-gray-900 ring-1 ring-gray-900' : 'border-gray-200 hover:border-gray-400'
        }`}
      >
        <span className="flex w-full items-center justify-between gap-3">
          <span className="min-w-0">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">
              Guests
            </span>
            <span className="mt-0.5 block truncate text-sm font-semibold text-gray-900">
              {summary}
            </span>
          </span>
          <ChevronRight
            className={`h-4 w-4 shrink-0 text-gray-500 ${isOpen ? '-rotate-90' : 'rotate-90'}`}
          />
        </span>
      </button>

      {isOpen &&
        pos &&
        createPortal(
          <div
            ref={panelRef}
            role="dialog"
            aria-label="Select guests"
            className="fixed overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl"
            style={{
              top: pos.top,
              left: pos.left,
              width: pos.width,
              maxHeight: pos.maxHeight,
              zIndex: 9999,
            }}
          >
            {rows.map((row, i) => (
              <div
                key={row.key}
                className={`flex items-center justify-between gap-4 py-4 ${
                  i > 0 ? 'border-t border-gray-100' : ''
                }`}
              >
                <div>
                  <p className="text-base font-semibold text-gray-900">{row.title}</p>
                  <p className="text-sm text-gray-500">{row.subtitle}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <button
                    type="button"
                    aria-label={`Decrease ${row.title}`}
                    disabled={row.count <= row.min}
                    onClick={() => row.set(row.count - 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-gray-100"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-6 text-center text-sm font-semibold text-gray-900">
                    {row.count}
                  </span>
                  <button
                    type="button"
                    aria-label={`Increase ${row.title}`}
                    disabled={row.count >= row.max}
                    onClick={() => row.set(row.count + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-gray-100"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}

            <p className="border-t border-gray-100 pt-4 text-sm text-gray-500">
              A maximum of {maxGuests} guests, not including infants or pets.
            </p>

            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg px-3 py-1.5 text-sm font-bold text-gray-900 transition-colors hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default GuestPicker;
