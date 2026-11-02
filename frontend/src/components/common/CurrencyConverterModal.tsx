import React, { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Calculator, ArrowRight, RefreshCw, DollarSign } from 'lucide-react';
import { useCurrency } from '../../contexts/CurrencyContext';
import { convertCurrency, formatCurrency } from '../../utils/currencyConverter';

interface CurrencyConverterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAmount?: number;
  defaultFromCurrency?: string;
  defaultToCurrency?: string;
}

export const CurrencyConverterModal: React.FC<CurrencyConverterModalProps> = ({
  isOpen,
  onClose,
  initialAmount = 0,
  defaultFromCurrency = 'USD',
  defaultToCurrency = 'EUR'
}) => {
  const { availableCurrencies } = useCurrency();
  const [amount, setAmount] = useState<string>(initialAmount.toString());
  const [fromCurrency, setFromCurrency] = useState<string>(defaultFromCurrency);
  const [toCurrency, setToCurrency] = useState<string>(defaultToCurrency);
  const [convertedAmount, setConvertedAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleConvert = useCallback(async () => {
    if (!amount || isNaN(Number(amount))) {
      setConvertedAmount('Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    try {
      const result = convertCurrency(Number(amount), fromCurrency, toCurrency);
      const formattedResult = formatCurrency(result, toCurrency);
      setConvertedAmount(formattedResult);
    } catch {
      setConvertedAmount('Conversion failed');
    } finally {
      setIsLoading(false);
    }
  }, [amount, fromCurrency, toCurrency]);

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConvert();
    }
  };

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-gray-800">Currency Converter</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter amount"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-lg"
            />
          </div>

          {/* Quick Amount Buttons */}
          <div className="flex gap-2 flex-wrap">
            {[10, 50, 100, 500, 1000].map((value) => (
              <button
                key={value}
                onClick={() => handleQuickAmount(value)}
                className="px-3 py-2 text-sm bg-gray-100 hover:bg-primary hover:text-white rounded-lg transition-colors"
              >
                {value}
              </button>
            ))}
          </div>

          {/* Quick Currency Pairs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quick Conversions</label>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => {
                  setFromCurrency('USD');
                  setToCurrency('EUR');
                  if (amount) handleConvert();
                }}
                className="px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors border border-blue-200"
              >
                USD → EUR
              </button>
              <button
                onClick={() => {
                  setFromCurrency('EUR');
                  setToCurrency('USD');
                  if (amount) handleConvert();
                }}
                className="px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors border border-blue-200"
              >
                EUR → USD
              </button>
              <button
                onClick={() => {
                  setFromCurrency('USD');
                  setToCurrency('GBP');
                  if (amount) handleConvert();
                }}
                className="px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors border border-blue-200"
              >
                USD → GBP
              </button>
              <button
                onClick={() => {
                  setFromCurrency('GBP');
                  setToCurrency('USD');
                  if (amount) handleConvert();
                }}
                className="px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors border border-blue-200"
              >
                GBP → USD
              </button>
            </div>
          </div>

          {/* Currency Selection */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {availableCurrencies.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              onClick={handleSwapCurrencies}
              className="mt-6 p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
              title="Swap currencies"
            >
              <ArrowRight className="w-5 h-5 rotate-90" />
            </button>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {availableCurrencies.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Result */}
          {convertedAmount && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-sm text-green-700 mb-1">
                {amount} {fromCurrency} equals
              </div>
              <div className="text-2xl font-bold text-green-800">
                {convertedAmount}
              </div>
              <div className="text-xs text-green-600 mt-1">
                Exchange rates updated daily
              </div>
            </div>
          )}

          {/* Popular Currencies Reference */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Popular Currencies
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-blue-700">1 USD</span>
                <span className="text-blue-600">≈ 0.85 EUR</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">1 USD</span>
                <span className="text-blue-600">≈ 0.73 GBP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">1 EUR</span>
                <span className="text-blue-600">≈ 1.18 USD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">1 GBP</span>
                <span className="text-blue-600">≈ 1.37 USD</span>
              </div>
            </div>
          </div>

          {/* Reference Information */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Reference</h3>
            <div className="text-xs text-gray-600 space-y-1">
              <p>• Exchange rates are updated daily at 00:00 UTC</p>
              <p>• Rates are provided by leading financial institutions</p>
              <p>• Conversion includes a small processing fee</p>
              <p>• For exact rates, please check with your bank</p>
            </div>
          </div>

          {/* Convert Button */}
          <button
            onClick={handleConvert}
            disabled={isLoading}
            className="w-full bg-primary text-white py-3 px-6 rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-lg font-semibold"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Converting...
              </>
            ) : (
              <>
                <Calculator className="w-5 h-5" />
                Convert
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};