import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, X } from 'lucide-react';
import { useCurrency } from '../../contexts/CurrencyContext';

interface CurrencyPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Withlocals-style "Choose your currency" picker.
 * Grid of currency cards (name + CODE - symbol). Pick one, press
 * "Save Currency" — persisted via CurrencyContext so every price
 * rendered with formatPrice()/convertPrice() follows the saved currency.
 */
export const CurrencyPickerModal: React.FC<CurrencyPickerModalProps> = ({ isOpen, onClose }) => {
  const { currentCurrency, setCurrentCurrency, currencyList } = useCurrency();
  const [selected, setSelected] = useState<string>(currentCurrency);
  const [query, setQuery] = useState('');
  const [showAll, setShowAll] = useState(false);

  // Most-used currencies shown first; "Show all" reveals the full grid
  const popularCodes = useMemo(
    () => ['EUR', 'USD', 'GBP', 'AUD', 'CAD', 'NPR', 'INR', 'JPY', 'CHF', 'CNY'],
    []
  );

  useEffect(() => {
    if (isOpen) {
      setSelected(currentCurrency);
      setQuery('');
      setShowAll(false);
    }
  }, [isOpen, currentCurrency]);

  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = showAll ? currencyList : currencyList.filter((c) => popularCodes.includes(c.code));
    if (!q) return base;
    return base.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.label.toLowerCase().includes(q)
    );
  }, [currencyList, query, showAll, popularCodes]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleSave = () => {
    setCurrentCurrency(selected);
    onClose();
  };

  if (!isOpen) return null;
  const selectedInfo = currencyList.find((c) => c.code === selected);
  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Choose your currency"
      data-testid="currency-picker-modal"
    >
      <div className="w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between px-6 pt-6 sm:px-8">
          <h2 className="text-2xl font-extrabold text-[#3f3f46]">Choose your currency</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close currency picker"
            className="rounded-full p-2 text-[#3f3f46] transition-colors hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 pt-4 sm:px-8">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search currencies..."
              aria-label="Search currencies"
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-3 text-sm text-gray-800 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
        <div className="max-h-[55vh] overflow-y-auto px-6 py-5 sm:px-8">
          {filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-500">
              No currencies match your search.
            </p>
          ) : (
            <div
              className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
              role="radiogroup"
              aria-label="Available currencies"
            >
              {filtered.map((currency) => {
                const isActive = currency.code === selected;
                return (
                  <button
                    key={currency.code}
                    type="button"
                    role="radio"
                    aria-checked={isActive}
                    onClick={() => setSelected(currency.code)}
                    className={
                      isActive
                        ? 'rounded-lg border p-3 text-left transition-all border-sky-500 bg-sky-50 text-sky-700'
                        : 'rounded-lg border p-3 text-left transition-all border-gray-300 bg-white text-[#52525b] hover:border-gray-400'
                    }
                  >
                    <span
                      className={
                        isActive
                          ? 'block truncate text-[15px] font-bold text-sky-700'
                          : 'block truncate text-[15px] font-bold text-[#52525b]'
                      }
                    >
                      {currency.name}
                    </span>
                    <span className="mt-0.5 block truncate text-[15px] text-[#71717a]">
                      {currency.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <div className="flex flex-col items-stretch justify-center gap-3 border-t border-gray-200 bg-white px-6 py-4 sm:flex-row sm:items-center sm:px-8">
          {!showAll ? (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="w-full rounded-lg border border-gray-300 px-6 py-3 text-[15px] font-bold text-[#52525b] transition-colors hover:bg-gray-50 sm:max-w-xs"
            >
              Show all
            </button>
          ) : (
            <p className="w-full text-sm text-gray-500 sm:max-w-xs">
              Showing all {currencyList.length} currencies
            </p>
          )}
          <span className="hidden flex-1 sm:block" />
          <button
            type="button"
            onClick={handleSave}
            disabled={!selectedInfo}
            className="w-full rounded-lg bg-sky-500 px-6 py-3 text-[15px] font-bold text-white transition-colors hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50 sm:max-w-xs"
          >
            Save Currency
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CurrencyPickerModal;
