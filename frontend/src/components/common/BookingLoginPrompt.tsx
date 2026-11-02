import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface BookingLoginPromptProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BookingLoginPrompt: React.FC<BookingLoginPromptProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

      {/* Card */}
      <div
        className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
            <svg className="h-7 w-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900">Please log in to book</h2>
          <p className="mt-2 text-sm text-gray-600">
            You need to be signed in to book this experience. Please log in or create an account to continue.
          </p>
          <button
            onClick={onClose}
            className="mt-6 w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-primary/90 active:scale-[0.98]"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingLoginPrompt;
