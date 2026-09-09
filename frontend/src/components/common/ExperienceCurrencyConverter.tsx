import React, { useState } from 'react';
import { Calculator, RefreshCw } from 'lucide-react';
import { CurrencyConverterModal } from './CurrencyConverterModal';

interface ExperienceCurrencyConverterProps {
  /** Experience price used to pre-fill the converter */
  price?: number;
  /** Currency the price is listed in */
  fromCurrency?: string;
}

/**
 * Themed currency converter entry point used on experience detail pages.
 * Opens the shared CurrencyConverterModal (the original converter), which is
 * powered by live exchange rates that refresh automatically every 24 hours.
 */
export const ExperienceCurrencyConverter: React.FC<ExperienceCurrencyConverterProps> = ({
  price = 0,
  fromCurrency = 'EUR',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
            <Calculator className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-slate-900">Currency Converter</p>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <RefreshCw className="w-3 h-3" />
              Live rates, refreshed daily
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="mt-3 w-full bg-primary hover:bg-primary-hover text-white font-bold py-2.5 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
        >
          <Calculator className="w-4 h-4" />
          Convert {price > 0 ? `€${price}` : 'price'}
        </button>
      </div>

      <CurrencyConverterModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        initialAmount={price}
        defaultFromCurrency={fromCurrency}
        defaultToCurrency="USD"
      />
    </>
  );
};

export default ExperienceCurrencyConverter;
