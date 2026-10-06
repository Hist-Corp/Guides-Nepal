import React, { useEffect, useRef, useState } from 'react';
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

/**
 * Airbnb-style time-slot dropdown used on experience booking cards.
 *
 * The trigger mirrors the BookingCalendar/GuestPicker card triggers
 * (uppercase label + value + chevron). The panel is portaled to
 * anchored directly beneath the trigger,
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

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const selected = options.find((o) => o.value === value);
  const displayValue = selected?.label ?? value;

  // Close on open-state resize? No: the panel is anchored in normal document
  // flow directly beneath the trigger, so it scrolls one-for-one with it
  // and can never cross over it. No scroll/resize listeners needed.

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
    <div className={`relative ${className ?? ''}`}>
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

      {isOpen && (
        <div
          ref={panelRef}
          role="listbox"
          aria-label={label}
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[60vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-2 shadow-2xl"
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
        </div>
      )}
    </div>
  );
};

export default TimePicker;
