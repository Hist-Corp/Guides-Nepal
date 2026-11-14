import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  convertCurrency,
  formatCurrency,
  getAvailableCurrencies,
  getCurrencyInfo,
  getCurrencyList,
  initializeCurrencyConverter,
  getCurrentRates,
  shouldUpdateRates,
  fetchLiveExchangeRates,
  type CurrencyInfo,
} from '../utils/currencyConverter';

interface CurrencyContextType {
  currentCurrency: string;
  setCurrentCurrency: (currency: string) => void;
  convertPrice: (amount: number, fromCurrency?: string) => number;
  formatPrice: (amount: number, fromCurrency?: string) => string;
  availableCurrencies: string[];
  currencyList: CurrencyInfo[];
  currencyInfo: CurrencyInfo;
  exchangeRates: { [key: string]: number };
  isLoading: boolean;
  lastUpdateTime: Date | null;
  refreshRates: () => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

interface CurrencyProviderProps {
  children: ReactNode;
  defaultCurrency?: string;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ 
  children, 
  defaultCurrency = 'USD' 
}) => {
  const [currentCurrency, setCurrentCurrency] = useState<string>(defaultCurrency);
  const [exchangeRates, setExchangeRates] = useState<{ [key: string]: number }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const [availableCurrencies, setAvailableCurrencies] = useState<string[]>([]);

  // Initialize currency converter on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        
        // Initialize the converter
        await initializeCurrencyConverter();
        
        // Get current rates and currencies
        const rates = getCurrentRates();
        const currencies = getAvailableCurrencies();
        
        setExchangeRates(rates);
        setAvailableCurrencies(currencies);
        setLastUpdateTime(new Date());
        
        // Load saved currency preference
        const savedCurrency = localStorage.getItem('preferredCurrency');
        if (savedCurrency && currencies.includes(savedCurrency)) {
          setCurrentCurrency(savedCurrency);
        }
        
      } catch (error) {
        console.error('Failed to initialize currency converter:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  // Refresh exchange rates
  const refreshRates = async () => {
    try {
      setIsLoading(true);
      await fetchLiveExchangeRates();
      
      const rates = getCurrentRates();
      const currencies = getAvailableCurrencies();
      
      setExchangeRates(rates);
      setAvailableCurrencies(currencies);
      setLastUpdateTime(new Date());
    } catch (error) {
      console.error('Failed to refresh exchange rates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Save currency preference when it changes
  useEffect(() => {
    if (currentCurrency !== defaultCurrency) {
      localStorage.setItem('preferredCurrency', currentCurrency);
    }
  }, [currentCurrency, defaultCurrency]);

  // Auto-refresh rates if they're outdated
  useEffect(() => {
    const checkAndRefresh = async () => {
      if (shouldUpdateRates() && !isLoading) {
        await refreshRates();
      }
    };

    // Check immediately
    checkAndRefresh();
    
    // Set up interval to check every hour
    const interval = setInterval(checkAndRefresh, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [isLoading]);

  // Convert price from USD to current currency
  const convertPrice = (amount: number, fromCurrency: string = 'USD'): number => {
    return convertCurrency(amount, fromCurrency, currentCurrency);
  };

  // Format price with current currency
  const formatPrice = (amount: number, fromCurrency: string = 'USD'): string => {
    const convertedAmount = convertPrice(amount, fromCurrency);
    return formatCurrency(convertedAmount, currentCurrency);
  };

  const value: CurrencyContextType = {
    currentCurrency,
    setCurrentCurrency,
    convertPrice,
    formatPrice,
    availableCurrencies,
    currencyList: getCurrencyList(),
    currencyInfo: getCurrencyInfo(currentCurrency),
    exchangeRates,
    isLoading,
    lastUpdateTime,
    refreshRates,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

// Custom hook to use the currency context
export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export default CurrencyContext;