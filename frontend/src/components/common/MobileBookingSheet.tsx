import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CalendarDays, Check, Clock3, Star, Users, X } from 'lucide-react';
import { BookingCalendar } from './BookingCalendar';
import { GuestPicker } from './GuestPicker';
import { TimePicker } from './TimePicker';
import { Price } from './Price';
import { useUIStore } from '../../store/uiStore';

export interface SheetGuide {
  id: number | string;
  name: string;
  role?: string;
  image: string;
  rating?: number;
  reviews?: number;
}

export interface MobileBookingSheetProps<TGuide extends SheetGuide = SheetGuide> {
  open: boolean;
  onClose: () => void;
  pricePerPerson: number;
  rating?: number;
  reviews?: number | string;
  accentClass?: string;
  checkIn: string;
  checkOut: string;
  /** Single-day experiences commit one date instead of a check-in/check-out range. */
  singleDate?: boolean;
  onDateChange: (checkIn: string, checkOut: string) => void;
  guests: number;
  onGuestsChange: (total: number) => void;
  maxGuests?: number;
  bookingTime: string;
  onTimeChange: (value: string) => void;
  guides: TGuide[];
  selectedGuide: TGuide | null;
  onSelectGuide: (guide: TGuide) => void;
  onConfirm: () => void;
  confirmLabel?: string;
  /** Inline validation message shown above the confirm CTA (sheet-scoped). */
  error?: string | null;
  /** When true, the sheet shows a booking-confirmed summary instead of the form. */
  confirmed?: boolean;
  confirmedSummary?: React.ReactNode;
}
/**
 * Mobile/tablet Configure booking bottom sheet.
 * The fixed bottom bar only shows price + Book Now, so the whole session -
 * check-in/check-out calendar, guests, start time and guide selection -
 * lives here. Locks body scroll, closes on Escape/backdrop/X.
 */
export function MobileBookingSheet<TGuide extends SheetGuide = SheetGuide>({
  open,
  onClose,
  pricePerPerson,
  rating,
  reviews,
  accentClass = 'bg-primary hover:bg-primary-hover',
  checkIn,
  checkOut,
  singleDate = false,
  onDateChange,
  guests,
  onGuestsChange,
  maxGuests = 6,
  bookingTime,
  onTimeChange,
  guides,
  selectedGuide,
  onSelectGuide,
  onConfirm,
  confirmLabel = 'Book Now',
  error,
  confirmed = false,
  confirmedSummary,
}: MobileBookingSheetProps<TGuide>) {
  // Let the global support widget know a sheet overlay is up so its
  // floating bubble doesn't sit on top of the sheet (z-index 1000 > 90).
  // Keyed only on `open` so parent re-renders (inline onClose) can't flicker it.
  useEffect(() => {
    useUIStore.getState().setBookingSheetOpen(open);
    return () => useUIStore.getState().setBookingSheetOpen(false);
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);
  if (!open) return null;
  return createPortal(
    <div
      className="fixed inset-0 z-[90] lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Configure booking"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px] animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className="absolute inset-x-0 bottom-0 max-h-[92dvh] flex flex-col rounded-t-3xl bg-white shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="pt-3 pb-1 shrink-0">
          <div className="mx-auto h-1.5 w-12 rounded-full bg-gray-200" />
        </div>
        <div className="relative shrink-0 px-5 pb-3 pt-2 text-center">
          <h2 className="text-lg font-extrabold text-gray-900">Configure booking</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close booking sheet"
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-gray-100 p-1.5 text-gray-600 transition-colors hover:bg-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 pt-1">
          {confirmed ? (
            <div className="flex flex-col items-center text-center py-8 animate-in fade-in zoom-in duration-300">
              <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                <Check className="h-7 w-7 text-green-600" />
              </span>
              <h3 className="text-xl font-extrabold text-gray-900">Booking requested!</h3>
              <p className="mt-2 text-sm text-gray-500">
                We've received your request and will confirm your spot shortly.
              </p>
              {confirmedSummary && (
                <div className="mt-5 w-full rounded-xl border border-gray-200 bg-gray-50 p-4 text-left text-sm text-gray-700">
                  {confirmedSummary}
                </div>
              )}
              <button
                type="button"
                onClick={onClose}
                className={`mt-6 w-full rounded-xl py-3.5 text-base font-bold text-white transition-all active:scale-[0.98] ${accentClass}`}
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <p className="text-2xl font-extrabold text-gray-900">
                <Price amount={pricePerPerson} />{' '}
                <span className="text-sm font-medium text-gray-500">per person</span>
              </p>
              {rating !== undefined && (
                <p className="mt-0.5 text-sm font-bold text-gray-900">
                  {rating} <Star className="inline h-4 w-4 -mt-0.5 fill-amber-400 text-amber-400" />{' '}
                  <span className="font-medium text-gray-500 underline underline-offset-2">
                    {reviews} reviews
                  </span>
                </p>
              )}
              <div className="mt-4 space-y-3">
                <section aria-label="Select dates">
                  <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500">
                    <CalendarDays className="h-4 w-4" /> Dates
                  </p>
                  <BookingCalendar
                    checkIn={checkIn}
                    checkOut={checkOut}
                    onChange={onDateChange}
                    idPrefix="sheet"
                    single={singleDate}
                  />
                </section>
                <section aria-label="Select start time">
                  <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500">
                    <Clock3 className="h-4 w-4" /> Start time
                  </p>
                  <TimePicker value={bookingTime} onChange={onTimeChange} idPrefix="sheet" />
                </section>
                <section aria-label="Select guests">
                  <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500">
                    <Users className="h-4 w-4" /> Guests
                  </p>
                  <GuestPicker
                    value={guests}
                    onChange={onGuestsChange}
                    maxGuests={maxGuests}
                    idPrefix="sheet"
                  />
                </section>
                <section aria-label="Select guide">
                  <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-gray-500">
                    Select guide
                  </p>
                  {guides.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2">
                      {guides.map((guide) => {
                        const active = selectedGuide?.id === guide.id;
                        return (
                          <button
                            key={guide.id}
                            type="button"
                            onClick={() => onSelectGuide(guide)}
                            aria-pressed={active}
                            className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${active ? 'border-gray-900 bg-gray-50 ring-1 ring-gray-900' : 'border-gray-200 bg-white hover:border-gray-400'}`}
                          >
                            <img
                              src={guide.image}
                              alt={guide.name}
                              className="h-11 w-11 rounded-full object-cover"
                            />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-bold text-gray-900">
                                {guide.name}
                              </span>
                              {guide.role && (
                                <span className="block truncate text-xs text-gray-500">
                                  {guide.role}
                                </span>
                              )}
                              {guide.rating !== undefined && (
                                <span className="mt-0.5 flex items-center gap-1 text-xs font-medium text-gray-900">
                                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                  {guide.rating}
                                  {guide.reviews !== undefined && (
                                    <span className="text-gray-400">({guide.reviews})</span>
                                  )}
                                </span>
                              )}
                            </span>
                            {active && (
                              <span className="rounded-full bg-gray-900 p-1 text-white">
                                <Check className="h-3 w-3" />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-500">
                      All guides for this experience are currently booked.
                    </p>
                  )}
                </section>
              </div>
            </>
          )}
        </div>
        <div className="shrink-0 border-t border-gray-100 bg-white px-5 py-4">
          {error && <p className="mb-2 text-center text-sm font-medium text-red-500">{error}</p>}
          {!confirmed && (
            <button
              type="button"
              onClick={onConfirm}
              className={`w-full rounded-xl py-3.5 text-base font-bold text-white transition-all active:scale-[0.98] ${accentClass}`}
            >
              {confirmLabel}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default MobileBookingSheet;
