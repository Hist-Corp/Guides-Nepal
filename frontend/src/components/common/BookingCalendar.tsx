import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BookingCalendarProps {
  checkIn: string;
  checkOut: string;
  onChange: (checkIn: string, checkOut: string) => void;
  idPrefix?: string;
  /** Single-date mode (e.g. one-day tours): hides checkout, selects one date */
  single?: boolean;
  /** Earliest selectable date (inclusive), yyyy-mm-dd; defaults to today */
  minDate?: string;
  /** Latest selectable date (inclusive), yyyy-mm-dd */
  maxDate?: string;
  /** Accessible label announced for the trigger buttons */
  ariaLabel?: string;
}

const toKey = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const parseKey = (key: string): Date | null => {
  if (!key) return null;
  const [y, m, d] = key.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};

/** Formats a yyyy-mm-dd key as the DD/MM/YYYY text shown in the inputs. */
const formatFromKey = (key: string): string => {
  const d = parseKey(key);
  if (!d) return '';
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
};

/** Formats consecutive typed digits as DD/MM/YYYY (05102026 -> 05/10/2026). */
const formatAsTyped = (digits: string): string => {
  const d = digits.slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
};

/**
 * Normalizes raw input while typing. Only the digits are kept and the
 * separators are re-derived, so appending to a value the formatter has
 * already punctuated (e.g. "05/10" + "2") keeps every keystroke instead of
 * dropping the overflow.
 */
const normalizeTyped = (raw: string): string => formatAsTyped(raw.replace(/\D/g, ''));

/**
 * Parses user-typed date text. Accepts DD/MM/YYYY (the order the inputs
 * display and auto-format into), MM/DD/YYYY when the trailing value cannot
 * be a month, a bare DD/MM (current year), YYYY-MM-DD, YYYYMMDD and textual
 * dates like "5 Oct 2026".
 */
const parseTyped = (text: string): Date | null => {
  const t = text.trim();
  if (!t) return null;

  const build = (y: number, m: number, day: number): Date | null => {
    if (!y || !m || !day) return null;
    const date = new Date(y, m - 1, day);
    // Reject impossible dates such as 02/30/2026.
    if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== day) {
      return null;
    }
    return date;
  };

  const parts = t.split(/[/\-.]/).map((p) => p.trim());
  const currentYear = new Date().getFullYear();
  const fromDayMonth = (a: number, b: number, year: number): Date | null => {
    // Day-first is the displayed order, so it is also the default. When the
    // trailing value cannot be a month the user must have typed MM/DD.
    if (b > 12 && a <= 12) return build(year, a, b);
    return build(year, b, a);
  };

  if (parts.length === 3 && parts.every((p) => /^\d{1,4}$/.test(p))) {
    const [a, b, c] = parts.map(Number);
    if (a >= 1000) return build(a, b, c);
    return fromDayMonth(a, b, c < 100 ? 2000 + c : c);
  }
  if (parts.length === 2 && parts.every((p) => /^\d{1,2}$/.test(p))) {
    const [a, b] = parts.map(Number);
    return fromDayMonth(a, b, currentYear);
  }
  if (parts.length === 1 && /^\d{8}$/.test(t)) {
    return build(Number(t.slice(0, 4)), Number(t.slice(4, 6)), Number(t.slice(6, 8)));
  }
  // Lenient fallback for textual dates like "5 Oct 2026".
  if (/[a-z]/i.test(t)) {
    const d = new Date(t);
    if (!Number.isNaN(d.getTime())) return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
  return null;
};

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/**
 * Smallest height the popup is allowed to shrink to when the space beneath
 * the date fields is tight, so it never collapses into an unusable sliver.
 */
const MIN_PANEL_HEIGHT = 220;

/**
 * Airbnb-style date-range picker used on experience booking cards.
 * The popup is portaled to document.body and fixed-positioned from the
 * trigger's bounding rect, so it is never clipped by a card's
 * overflow-hidden container. Shows a two-month grid with prev/next
 * month navigation; the previous button is disabled at the current
 * month so the calendar never shows past months. Check-in and
 * check-out fields are real inputs — users can type DD/MM/YYYY
 * directly (or pick from the grid), and the panel stays docked under
 * the fields as the page scrolls. The card and the popup both show the
 * check-in and check-out fields together; the field being edited is
 * outlined and the other is dimmed, mirroring Airbnb's date picker.
 */
export const BookingCalendar: React.FC<BookingCalendarProps> = ({
  checkIn,
  checkOut,
  onChange,
  idPrefix = 'booking',
  single = false,
  minDate,
  maxDate,
  ariaLabel,
}) => {
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const anchor = parseKey(checkIn) ?? today;
    return new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  });
  const [isOpen, setIsOpen] = useState(false);
  const [hoverKey, setHoverKey] = useState<string | null>(null);
  /** Which field the next grid click fills; null = derive from the current range. */
  const [focusOverride, setFocusOverride] = useState<'checkin' | 'checkout' | null>(null);
  /** Typed DD/MM/YYYY text shown in the check-in / check-out inputs. */
  const [ciText, setCiText] = useState(() => formatFromKey(checkIn));
  const [coText, setCoText] = useState(() => formatFromKey(checkOut));
  /** Validation error for a typed date (field + message), if any. */
  const [typeErr, setTypeErr] = useState<{ field: 'checkin' | 'checkout'; msg: string } | null>(
    null
  );
  /** Focus target after a typed commit (moves the user on to check-out). */
  const [pendingFocus, setPendingFocus] = useState<'checkin' | 'checkout' | null>(null);
  const [popupPos, setPopupPos] = useState<{
    top: number;
    left: number;
    maxHeight: number | null;
  } | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const activeField: 'checkin' | 'checkout' = single
    ? 'checkin'
    : (focusOverride ?? (!checkIn || (checkIn && checkOut) ? 'checkin' : 'checkout'));

  const minKey = minDate || toKey(today);
  const isDisabled = (key: string): boolean => {
    if (key < minKey) return true;
    if (maxDate && key > maxDate) return true;
    return false;
  };

  const pickDate = (key: string) => {
    if (isDisabled(key)) return;
    // A grid pick supersedes anything half-typed, so drop stale errors.
    setTypeErr(null);
    if (single) {
      onChange(key === checkIn ? '' : key, '');
      return;
    }

    if (activeField === 'checkout' && checkIn) {
      if (key === checkIn) {
        onChange('', '');
        setFocusOverride('checkin');
        return;
      }
      if (key > checkIn) {
        onChange(checkIn, key);
        // Range complete — keep the check-out field on screen showing it.
        setFocusOverride('checkout');
        return;
      }
      // Earlier than check-in: restart the range from this date.
      onChange(key, '');
      setFocusOverride('checkout');
      return;
    }

    // Choosing check-in (first click, or explicitly focused field).
    if (key === checkIn) {
      onChange('', '');
      setFocusOverride('checkin');
      return;
    }
    onChange(key, checkOut && key < checkOut ? checkOut : '');
    setFocusOverride('checkout');
    const anchor = parseKey(key);
    if (anchor) setVisibleMonth(new Date(anchor.getFullYear(), anchor.getMonth(), 1));
  };

  const openCalendar = (field?: 'checkin' | 'checkout') => {
    // Check-out is meaningless without a check-in, so fall back to check-in.
    const next = field === 'checkout' && !checkIn ? 'checkin' : field;
    setFocusOverride(next ?? null);
    setIsOpen(true);
  };

  const closeCalendar = () => setIsOpen(false);

  /** Keeps the input text as the user types (digits + slashes only). */
  const handleType = (field: 'checkin' | 'checkout', raw: string) => {
    const next = normalizeTyped(raw);
    if (field === 'checkin') setCiText(next);
    else setCoText(next);
    if (typeErr?.field === field) setTypeErr(null);
  };

  /**
   * Commits a typed date on blur/Enter. Returns true when accepted.
   * Empty input reverts to the last committed date; invalid or
   * unavailable dates keep the text and raise an inline error instead.
   */
  const commitTyped = (field: 'checkin' | 'checkout', text: string, advance = false): boolean => {
    const trimmed = text.trim();
    if (!trimmed) {
      if (field === 'checkin') setCiText(formatFromKey(checkIn));
      else setCoText(formatFromKey(checkOut));
      if (typeErr?.field === field) setTypeErr(null);
      return true;
    }

    const parsed = parseTyped(trimmed);
    const key = parsed ? toKey(parsed) : '';
    if (!parsed || isDisabled(key)) {
      // With the popup already closed there is nowhere to show an error,
      // so fall back to the last committed date instead.
      if (!isOpen) {
        if (field === 'checkin') setCiText(formatFromKey(checkIn));
        else setCoText(formatFromKey(checkOut));
        if (typeErr?.field === field) setTypeErr(null);
        return false;
      }
      setTypeErr({
        field,
        msg: parsed ? 'This date is not available.' : 'Enter a valid date as DD/MM/YYYY.',
      });
      return false;
    }

    if (single) {
      onChange(key, '');
      setTypeErr(null);
      return true;
    }

    if (field === 'checkin') {
      onChange(key, checkOut && checkOut > key ? checkOut : '');
      setTypeErr(null);
      // The committed check-in makes check-out the active field, so focus
      // (and the text selection) moves on to it.
      if (advance) setPendingFocus('checkout');
      return true;
    }

    if (!checkIn) {
      // No check-in yet — the typed date becomes the check-in.
      onChange(key, '');
      setCiText(formatFromKey(key));
      setCoText('');
      setTypeErr(null);
      if (advance) setPendingFocus('checkout');
      return true;
    }
    if (key <= checkIn) {
      setTypeErr({ field, msg: 'Check-out must be after check-in.' });
      return false;
    }
    onChange(checkIn, key);
    setTypeErr(null);
    return true;
  };

  /** Range end while hovering a start date (Airbnb-style preview). */
  const hoverRange = useMemo(() => {
    if (single || !checkIn || checkOut) return null;
    if (!hoverKey || hoverKey <= checkIn) return null;
    return { from: checkIn, to: hoverKey };
  }, [single, checkIn, checkOut, hoverKey]);

  const inRange = (key: string): boolean => {
    if (single) return false;
    if (checkIn && checkOut) return key > checkIn && key < checkOut;
    if (hoverRange) return key > hoverRange.from && key < hoverRange.to;
    return false;
  };

  const nights = useMemo(() => {
    if (single || !checkIn || !checkOut) return 0;
    const a = parseKey(checkIn);
    const b = parseKey(checkOut);
    if (!a || !b) return 0;
    return Math.round((b.getTime() - a.getTime()) / 86_400_000);
  }, [single, checkIn, checkOut]);

  const formatDayMonth = (key: string): string => {
    const d = parseKey(key);
    return d ? d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '';
  };

  /** Airbnb-style hint shown under "Select dates" in the popup header. */
  const panelSubtitle = single
    ? checkIn
      ? 'One day selected'
      : 'Select a date'
    : nights > 0
      ? `${formatDayMonth(checkIn)} – ${formatDayMonth(checkOut)} · ${nights} night${nights === 1 ? '' : 's'}`
      : activeField === 'checkout'
        ? 'Now select your check-out date'
        : checkIn
          ? 'Update your check-in date'
          : 'Select check-in, then check-out';

  /**
   * Places the portaled popup as a dropdown docked under the check-in /
   * check-out fields. The panel always hangs below the fields — it never
   * flips above them — and sits exactly 8px under them.
   *
   * While scrolling only `top`/`left` are recomputed, so the panel tracks the
   * fields one-to-one and its height never changes (that resizing is what
   * made it jitter). The height cap is only recomputed on open, on window
   * resize, and when the content itself changes.
   */
  const placePanel = (rect: DOMRect, recalcHeight: boolean) => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const panelWidth = single ? 340 : Math.min(680, vw - 16);
    const gap = 8;
    // Dropdown alignment: start at the fields' left edge, then keep the whole
    // panel on screen.
    const left = Math.max(8, Math.min(rect.left, vw - panelWidth - 8));

    // Always below the fields, whatever the scroll position.
    const top = rect.bottom + gap;

    setPopupPos((prev) => {
      let maxHeight = prev?.maxHeight ?? null;
      if (recalcHeight) {
        // scrollHeight is the natural height even while a cap is applied,
        // so this cannot oscillate.
        const natural = panelRef.current?.scrollHeight ?? 0;
        const spaceBelow = vh - top - 8;
        maxHeight =
          natural > 0 && spaceBelow < natural ? Math.max(spaceBelow, MIN_PANEL_HEIGHT) : null;
      }
      return prev && prev.top === top && prev.left === left && prev.maxHeight === maxHeight
        ? prev
        : { top, left, maxHeight };
    });
  };

  useEffect(() => {
    if (!isOpen) {
      setPopupPos(null);
      return;
    }
    const el = wrapperRef.current;
    if (el) placePanel(el.getBoundingClientRect(), true);

    // Re-dock the panel whenever the card moves, so the calendar stays
    // directly under the check-in / check-out fields while scrolling.
    // Throttled to one measurement per frame to keep scrolling smooth, and
    // height is left untouched so the panel only ever translates.
    let frame = 0;
    const redock = (recalcHeight: boolean) => () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const node = wrapperRef.current;
        if (node) placePanel(node.getBoundingClientRect(), recalcHeight);
      });
    };
    const onScroll = redock(false);
    const onResize = redock(true);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (wrapperRef.current?.contains(target)) return;
      setIsOpen(false);
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onPointerDown);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onPointerDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, single]);

  // Keep the typed input text aligned with the committed dates and drop
  // stale validation errors when a matching date changes or the popup closes.
  useEffect(() => {
    setCiText(formatFromKey(checkIn));
    setTypeErr((prev) => (prev?.field === 'checkin' ? null : prev));
  }, [checkIn]);
  useEffect(() => {
    setCoText(formatFromKey(checkOut));
    setTypeErr((prev) => (prev?.field === 'checkout' ? null : prev));
  }, [checkOut]);
  useEffect(() => {
    if (!isOpen) {
      // Never leave a rejected or half-typed date sitting in the card fields.
      setCiText(formatFromKey(checkIn));
      setCoText(formatFromKey(checkOut));
      setTypeErr(null);
    }
  }, [isOpen, checkIn, checkOut]);

  // True only while the portaled panel is actually in the DOM. Depending on
  // this instead of `popupPos` keeps the effect below from re-running on every
  // scroll frame, since `popupPos.top` changes each frame.
  const panelMounted = Boolean(isOpen && popupPos);

  // Watch the popup's own box rather than re-measuring on every `popupPos`
  // change. Recomputing the cap on each scroll frame made the panel visibly
  // shrink and grow as it moved; the observer only fires when the panel is
  // genuinely resized — opening, switching months, or showing an error.
  useLayoutEffect(() => {
    const panel = panelRef.current;
    const el = wrapperRef.current;
    if (!panelMounted || !panel || !el) return;
    const recapture = () => placePanel(el.getBoundingClientRect(), true);
    const observer = new ResizeObserver(recapture);
    observer.observe(panel);
    // The panel has just mounted, so cap it against the space below.
    recapture();
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panelMounted, visibleMonth, checkIn, checkOut, typeErr, focusOverride]);

  // After a typed check-in commits, move focus (and select the text) of the
  // next check-out input — panel when open, otherwise the visible card field.
  useEffect(() => {
    if (!pendingFocus) return;
    const root = isOpen && panelRef.current ? panelRef.current : wrapperRef.current;
    if (root) {
      const inputs = root.querySelectorAll<HTMLInputElement>(`input[data-field="${pendingFocus}"]`);
      for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];
        if (input.getBoundingClientRect().width > 0) {
          input.focus();
          input.select();
          break;
        }
      }
    }
    setPendingFocus(null);
  }, [pendingFocus, isOpen]);

  const monthLabel = (d: Date) => d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  /** Earliest browsable month (derived from minDate, defaulting to today). */
  const minMonth = useMemo(() => {
    const m = parseKey(minKey);
    const base = m ?? today;
    return new Date(base.getFullYear(), base.getMonth(), 1);
  }, [minKey, today]);

  /** True while the grid shows the current month — previous stays inactive. */
  const atMinMonth = visibleMonth.getTime() <= minMonth.getTime();

  const shiftMonth = (delta: number) =>
    setVisibleMonth((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1));

  const renderMonth = (monthStart: Date, label: string) => {
    const year = monthStart.getFullYear();
    const month = monthStart.getMonth();
    const startPad = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (string | null)[] = [
      ...Array.from({ length: startPad }, () => null),
      ...Array.from({ length: daysInMonth }, (_, i) => toKey(new Date(year, month, i + 1))),
    ];

    return (
      <div className="min-w-0 flex-1">
        {/* Month caption — prev/next chevrons sit at the panel edges */}
        <div className="mb-2 flex h-8 items-center justify-center px-8 text-center text-sm font-bold text-gray-900">
          {label}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {WEEKDAYS.map((w) => (
            <span key={w} className="text-[11px] font-semibold text-gray-400 py-1">
              {w}
            </span>
          ))}
          {cells.map((key, i) => {
            if (!key) return <span key={`pad-${i}`} />;
            const disabled = isDisabled(key);
            const selected = key === checkIn || key === checkOut;
            const range = inRange(key);
            const isHover = hoverRange && key === hoverRange.to && !checkOut;
            return (
              <button
                key={key}
                type="button"
                disabled={disabled}
                aria-pressed={selected}
                onClick={() => pickDate(key)}
                onMouseEnter={() => setHoverKey(key)}
                className={`
                  h-9 w-9 mx-auto rounded-full text-sm flex items-center justify-center
                  transition-colors duration-100
                  ${disabled ? 'text-gray-300 cursor-not-allowed line-through' : ''}
                  ${
                    selected
                      ? 'bg-gray-900 text-white font-bold hover:bg-gray-700'
                      : range
                        ? 'bg-gray-100 text-gray-900'
                        : !disabled
                          ? 'text-gray-700 hover:bg-gray-100'
                          : ''
                  }
                  ${range && !selected ? 'rounded-none' : ''}
                  ${isHover ? 'ring-2 ring-gray-900 ring-inset' : ''}
                `}
              >
                {Number(key.slice(8, 10))}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const secondMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1);

  /**
   * One Airbnb-style date field: a small uppercase label over a real input
   * the user can type DD/MM/YYYY into (or just focus to open the calendar).
   * Used for the card's check-in/check-out boxes and the popup header.
   */
  const renderInputBox = (
    field: 'checkin' | 'checkout',
    variant: 'mobile' | 'desktop' | 'panel'
  ) => {
    const isCheckin = field === 'checkin';
    const text = isCheckin ? ciText : coText;
    const hasErr = typeErr?.field === field;
    const active = activeField === field;
    // The format hint only appears on the field being edited; untouched card
    // fields keep the "Add date" prompt.
    const isBlank = isCheckin ? !checkIn && !text : !checkOut && !text;
    const placeholder = isBlank && !(isOpen && active) ? 'Add date' : 'DD/MM/YYYY';

    const stateCls = hasErr
      ? 'border-red-500 ring-1 ring-red-400'
      : variant === 'panel'
        ? active
          ? 'border-gray-900 ring-1 ring-gray-900'
          : 'border-gray-300 hover:border-gray-500'
        : isOpen && active
          ? 'border-gray-900 ring-1 ring-gray-900 bg-gray-50'
          : 'border-gray-300 hover:border-gray-500';

    const boxCls =
      variant === 'panel'
        ? `block min-w-[124px] flex-1 cursor-text rounded-lg border px-3 py-2 text-left transition-colors ${stateCls}`
        : variant === 'desktop'
          ? `block flex-1 cursor-text rounded-xl border px-4 py-3 text-left transition-colors ${stateCls}`
          : `block cursor-text rounded-xl border px-3 py-2.5 text-left transition-colors ${stateCls}`;

    const labelCls = `block text-[11px] font-bold uppercase tracking-wider ${
      hasErr
        ? 'text-red-500'
        : active
          ? 'text-gray-900'
          : variant === 'panel'
            ? 'text-gray-400'
            : 'text-gray-500'
    }`;

    return (
      <label className={boxCls}>
        <span className={labelCls}>{isCheckin ? (single ? 'Date' : 'Check-in') : 'Check-out'}</span>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          spellCheck={false}
          data-field={field}
          id={`${idPrefix}-${variant}-${field}`}
          placeholder={placeholder}
          value={text}
          aria-invalid={hasErr || undefined}
          aria-label={
            isCheckin
              ? (ariaLabel ?? 'Check-in date, format DD/MM/YYYY')
              : 'Check-out date, format DD/MM/YYYY'
          }
          onChange={(e) => handleType(field, e.target.value)}
          onFocus={() => openCalendar(field)}
          onBlur={() => commitTyped(field, text)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              commitTyped(field, text, true);
            }
          }}
          className={`mt-0.5 w-full min-w-0 border-0 bg-transparent p-0 text-base text-gray-900 outline-none placeholder:text-gray-400 ${
            hasErr ? 'text-red-600' : ''
          }`}
        />
      </label>
    );
  };

  return (
    <div ref={wrapperRef} className="space-y-2">
      {/* Initial state: the check-in and check-out fields sit side by side.
          They are typed DD/MM/YYYY inputs that also open the calendar — a
          complete date commits on blur or Enter. */}
      <div className="flex items-stretch gap-2 md:gap-3">
        {/* Mobile: stacked fields */}
        <div className="flex-1 md:hidden grid grid-cols-2 gap-2">
          {renderInputBox('checkin', 'mobile')}
          {!single && renderInputBox('checkout', 'mobile')}
        </div>
        {/* Desktop: side-by-side fields */}
        <div className="hidden md:flex flex-1 gap-3">
          {renderInputBox('checkin', 'desktop')}
          {!single && renderInputBox('checkout', 'desktop')}
        </div>
      </div>

      {/* Nights / one-day summary */}
      <p className="text-xs text-gray-400">
        {nights > 0 ? `${nights} night${nights === 1 ? '' : 's'}` : single ? 'One day' : ''}
      </p>

      {/* Popup portaled to document.body so no card can clip it */}
      {isOpen &&
        popupPos &&
        createPortal(
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="false"
            aria-label="Choose dates"
            onMouseLeave={() => setHoverKey(null)}
            style={{
              position: 'fixed',
              top: popupPos.top,
              left: popupPos.left,
              maxHeight: popupPos.maxHeight ?? undefined,
              zIndex: 9999,
            }}
            className={`${
              single ? 'w-[340px]' : 'w-[680px] max-w-[calc(100vw-16px)]'
            } rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-y-auto`}
          >
            {/* Popup header — Airbnb-style "Select dates" with typed
                check-in / check-out boxes the user can write into */}
            <div className="px-5 pt-5 pb-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-bold text-gray-900">Select dates</p>
                  <p className="text-sm text-gray-500 mt-0.5">{panelSubtitle}</p>
                </div>
                {/* Both fields stay in the popup; the active one gets the
                    black outline and the other is dimmed. */}
                <div className="flex gap-2">
                  {renderInputBox('checkin', 'panel')}
                  {!single && renderInputBox('checkout', 'panel')}
                </div>
              </div>
              {typeErr && <p className="mt-1.5 text-xs font-medium text-red-600">{typeErr.msg}</p>}
            </div>
            <div className="p-4">
              {/* Month navigation: chevrons are pinned to the panel edges and
                  each month caption is centred over its own grid, so the
                  calendar never needs scrolling. Previous stays disabled at
                  the current month and re-enables in future months. */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => shiftMonth(-1)}
                  disabled={atMinMonth}
                  aria-label="Previous month"
                  className="absolute left-0 top-0 z-10 rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => shiftMonth(1)}
                  aria-label="Next month"
                  className="absolute right-0 top-0 z-10 rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                {/* Two-month grid */}
                <div className="flex gap-8">
                  {renderMonth(visibleMonth, monthLabel(visibleMonth))}
                  {!single && (
                    <div className="hidden min-w-0 flex-1 md:block">
                      {renderMonth(secondMonth, monthLabel(secondMonth))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer: clear + close */}
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  onChange('', '');
                  setCiText('');
                  setCoText('');
                  setTypeErr(null);
                  setHoverKey(null);
                  setFocusOverride(null);
                }}
                className="text-sm font-bold underline underline-offset-2 text-gray-700 hover:text-gray-900"
              >
                Clear dates
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={closeCalendar}
                  className="px-5 py-2 text-sm font-bold bg-gray-900 text-white rounded-lg hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default BookingCalendar;
