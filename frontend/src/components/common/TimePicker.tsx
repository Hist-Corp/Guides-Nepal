import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronRight } from 'lucide-react';

export interface TimeOption {
  value: string;
  label: string;
}

/** Default slot list shared by every booking card (09:00–17:00). */
const DEFAULT_TIME_OPTIONS: TimeOption[] = [
  { value: '09:00', label: '09:00 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '12:00', label: '12:00 PM' },
  { value: '13:00', label: '01:00 PM' },
  { value: '14:00', label: '02:00 PM' },
  { value: '15:00', label: '03:00 PM' },
  { value: '16:00', label: '04:00 PM' },
  { value: '17:00', label: '05:00 PM' },
];

export interface TimePickerProps {
  /** Selected option value, e.g. '09:00'. */
  value: string;
  /** Called with the new value when an option is picked. */
  onChange: (value: string) => void;
  /** Options shown in the dropdown. Defaults to DEFAULT_TIME_OPTIONS. */
  options?: TimeOption[];
  /** Field label shown above the value. Defaults to "Start Time". */
  label?: string;
  /** Unique prefix for generated element ids. */
  idPrefix?: string;
  /** Extra classes appended to the trigger's outer wrapper. */
  className?: string;
  /** Accessible label announced for the trigger button. */
  ariaLabel?: string;
}

const clamp = (n: number, min: number, max: number): number => Math.min(Math.max(n, min), max);

/**
 * Airbnb-style time-slot dropdown used on experience booking cards.
 *
 * The trigger mirrors the BookingCalendar/GuestPicker card triggers
 * (uppercase label + value + chevron). The panel is portaled to
 * document.body and fixed-positioned from the trigger's bounding rect,
 * so it is never clipped by a card's overflow-hidden container. Picking
 * a slot closes the panel; Escape / outside click also close it.
 */
export const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  options = DEFAULT_TIME_OPTIONS,
  label = 'Start Time',
  idPrefix = 'time',
  className,
  ariaLabel,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [pos, setPos] = useState<{
    top: number;
    left: number;
    width: number;
    maxHeight: number;
  } | null>(null);

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const selected = options.find((o) => o.value === value);
  const displayValue = selected?.label ?? value;

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
    const width = Math.min(Math.max(rect.width, 260), vw - 16);
    const left = clamp(rect.left, 8, Math.max(8, vw - width - 8));
    // Classic dropdown: always drop straight below the trigger (never flip
    // above), and grow no taller than the space left on screen — the list
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
  // panel is genuinely resized — e.g. the option list changing.
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panelMounted || !panel) return;
    const recapture = () => reposition(true);
    const observer = new ResizeObserver(recapture);
    observer.observe(panel);
    // The panel has just mounted, so cap it against the space below.
    recapture();
    return () => observer.disconnect();
  }, [panelMounted, options.length, reposition]);

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

  const select = (v: string) => {
    onChange(v);
    setIsOpen(false);
  };

  return (
    <div className={className}>
      <button
        ref={triggerRef}
        type="button"
        id={`${idPrefix}-trigger`}
        onClick={() => setIsOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel ?? `${label}. ${displayValue}`}
        className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
          isOpen ? 'border-gray-900 ring-1 ring-gray-900' : 'border-gray-200 hover:border-gray-400'
        }`}
      >
        <span className="flex w-full items-center justify-between gap-3">
          <span className="min-w-0">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">
              {label}
            </span>
            <span className="mt-0.5 block truncate text-sm font-semibold text-gray-900">
              {displayValue}
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
            role="listbox"
            aria-label={label}
            className="fixed overflow-y-auto rounded-2xl border border-gray-200 bg-white p-2 shadow-2xl"
            style={{
              top: pos.top,
              left: pos.left,
              width: pos.width,
              maxHeight: pos.maxHeight,
              zIndex: 9999,
            }}
          >
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => select(option.value)}
                  className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-sm transition-colors hover:bg-gray-50 ${
                    isSelected ? 'font-bold text-gray-900' : 'text-gray-600'
                  }`}
                >
                  {option.label}
                  {isSelected && <Check className="h-4 w-4 shrink-0 text-gray-900" />}
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
};

export default TimePicker;
