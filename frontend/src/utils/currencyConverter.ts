// Currency converter utility with live exchange rates

export interface ExchangeRates {
  [key: string]: number;
}

export interface CurrencyInfo {
  code: string;
  name: string;
  label: string;
}

/**
 * Curated currency list shown in the "Choose your currency" picker
 * (Withlocals-style). Labels follow the "CODE - symbol" convention.
 */
export const CURRENCY_LIST: CurrencyInfo[] = [
  { code: 'EUR', name: 'Euro', label: 'EUR - €' },
  { code: 'USD', name: 'US Dollar', label: 'USD - $' },
  { code: 'GBP', name: 'British Pound', label: 'GBP - £' },
  { code: 'AUD', name: 'Australian Dollar', label: 'AUD - $' },
  { code: 'BRL', name: 'Brazilian Real', label: 'BRL - R$' },
  { code: 'CAD', name: 'Canadian Dollar', label: 'CAD - $' },
  { code: 'CLP', name: 'Chilean Peso', label: 'CLP - $' },
  { code: 'CNY', name: 'Chinese Yuan', label: 'CNY - ¥' },
  { code: 'COP', name: 'Colombian Peso', label: 'COP - $' },
  { code: 'CRC', name: 'Costa Rican Colón', label: 'CRC - ₡' },
  { code: 'CZK', name: 'Czech Koruna', label: 'CZK - Kč' },
  { code: 'DKK', name: 'Danish Krone', label: 'DKK - kr' },
  { code: 'HKD', name: 'Hong Kong Dollar', label: 'HKD - HK$' },
  { code: 'HUF', name: 'Hungarian Forint', label: 'HUF - Ft' },
  { code: 'ILS', name: 'Israeli New Shekel', label: 'ILS - ₪' },
  { code: 'INR', name: 'Indian Rupee', label: 'INR - ₹' },
  { code: 'JPY', name: 'Japanese Yen', label: 'JPY - ¥' },
  { code: 'MYR', name: 'Malaysian Ringgit', label: 'MYR - RM' },
  { code: 'MXN', name: 'Mexican Peso', label: 'MXN - $' },
  { code: 'MAD', name: 'Moroccan Dirham', label: 'MAD - .د.م' },
  { code: 'TWD', name: 'New Taiwan Dollar', label: 'TWD - $' },
  { code: 'NOK', name: 'Norwegian Krone', label: 'NOK - kr' },
  { code: 'NPR', name: 'Nepalese Rupee', label: 'NPR - ₨' },
  { code: 'PEN', name: 'Peruvian Sol', label: 'PEN - S/' },
  { code: 'PLN', name: 'Polish Zloty', label: 'PLN - zł' },
  { code: 'RON', name: 'Romanian Leu', label: 'RON - RON' },
  { code: 'SAR', name: 'Saudi Riyal', label: 'SAR - ر.س' },
  { code: 'SGD', name: 'Singapore Dollar', label: 'SGD - $' },
  { code: 'ZAR', name: 'South African Rand', label: 'ZAR - R' },
  { code: 'KRW', name: 'South Korean Won', label: 'KRW - ₩' },
  { code: 'SEK', name: 'Swedish Krona', label: 'SEK - kr' },
  { code: 'CHF', name: 'Swiss Franc', label: 'CHF - CHF' },
  { code: 'TRY', name: 'Turkish Lira', label: 'TRY - ₺' },
  { code: 'AED', name: 'UAE Dirham', label: 'AED - د.إ' },
];

// Fallback exchange rates (USD base) used until live rates load.
// Live rates from the API overwrite these whenever the fetch succeeds.
const FALLBACK_RATES: ExchangeRates = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  AUD: 1.52,
  BRL: 5.7,
  CAD: 1.4,
  CLP: 950,
  CNY: 7.25,
  COP: 4400,
  CRC: 520,
  CZK: 23.3,
  DKK: 6.86,
  HKD: 7.78,
  HUF: 390,
  ILS: 3.7,
  INR: 83.5,
  JPY: 155,
  MAD: 10,
  MXN: 20.3,
  MYR: 4.45,
  NOK: 11,
  NPR: 133,
  PEN: 3.75,
  PLN: 4.05,
  RON: 4.58,
  SAR: 3.75,
  SEK: 10.9,
  SGD: 1.35,
  CHF: 0.89,
  ZAR: 18.1,
  KRW: 1390,
  TRY: 34.5,
  TWD: 32.4,
  AED: 3.67,
};

// Default exchange rates (USD base) - will be updated with live data
let exchangeRates: ExchangeRates = { ...FALLBACK_RATES };

let lastUpdateTime: Date | null = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Fetch live exchange rates from a free API
 * Falls back to default rates if API fails
 */
export async function fetchLiveExchangeRates(): Promise<ExchangeRates> {
  try {
    // Using a free exchange rate API
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }
    
    const data = await response.json();
    
    if (data && data.rates) {
      exchangeRates = data.rates;
      lastUpdateTime = new Date();
      
      // Store in localStorage for offline use
      localStorage.setItem('exchangeRates', JSON.stringify(exchangeRates));
      localStorage.setItem('lastUpdateTime', lastUpdateTime.toISOString());
      
      console.log('Exchange rates updated successfully');
    }
  } catch (error) {
    console.warn('Failed to fetch live exchange rates:', error);
    
    // Try to load from localStorage
    const storedRates = localStorage.getItem('exchangeRates');
    const storedTime = localStorage.getItem('lastUpdateTime');
    
    if (storedRates && storedTime) {
      const storedDate = new Date(storedTime);
      const now = new Date();
      
      // Use stored data if it's less than 24 hours old
      if (now.getTime() - storedDate.getTime() < CACHE_DURATION) {
        exchangeRates = JSON.parse(storedRates);
        lastUpdateTime = storedDate;
        console.log('Using cached exchange rates');
      }
    }
  }
  
  return exchangeRates;
}

/**
 * Convert amount from one currency to another
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number {
  // If same currency, return original amount
  if (fromCurrency === toCurrency) {
    return amount;
  }

  const fromRate = exchangeRates[fromCurrency];
  const toRate = exchangeRates[toCurrency];

  // Unknown currencies: leave the amount untouched rather than producing NaN
  if (fromRate === undefined || toRate === undefined) {
    console.warn(
      `Missing exchange rate for ${fromRate === undefined ? fromCurrency : toCurrency}; skipping conversion`
    );
    return amount;
  }

  // Convert to USD first (base currency)
  const amountInUSD = fromCurrency === 'USD' ? amount : amount / fromRate;

  // Convert from USD to target currency
  const amountInTarget = toCurrency === 'USD' ? amountInUSD : amountInUSD * toRate;

  return Math.round(amountInTarget * 100) / 100; // Round to 2 decimal places
}

/**
 * Format currency with proper symbol and formatting
 */
export function formatCurrency(
  amount: number,
  currency: string,
  locale: string = 'en-US'
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    // Fallback for unsupported currencies
    const symbols: { [key: string]: string } = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      CAD: 'C$',
      AUD: 'A$',
      JPY: '¥',
      CHF: 'CHF',
      CNY: '¥',
      INR: '₹',
      NPR: '₨',
    };
    
    const symbol = symbols[currency] || currency;
    return `${symbol}${amount.toFixed(2)}`;
  }
}

/**
 * Get all available currencies (curated picker list first, then any extra
 * codes that arrived with live rates).
 */
export function getAvailableCurrencies(): string[] {
  const curated = CURRENCY_LIST.map((c) => c.code);
  const extras = Object.keys(exchangeRates).filter((code) => !curated.includes(code));
  return [...curated, ...extras];
}

/**
 * Get the curated picker list (name + code + label for every currency).
 */
export function getCurrencyList(): CurrencyInfo[] {
  return CURRENCY_LIST;
}

/**
 * Look up a currency's display info by code. Unknown codes fall back to
 * showing the raw code as both name and label.
 */
export function getCurrencyInfo(code: string): CurrencyInfo {
  return (
    CURRENCY_LIST.find((c) => c.code === code) ?? {
      code,
      name: code,
      label: code,
    }
  );
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: string): string {
  const symbols: { [key: string]: string } = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    CAD: 'C$',
    AUD: 'A$',
    JPY: '¥',
    CHF: 'CHF',
    CNY: '¥',
    INR: '₹',
    NPR: '₨',
    BRL: 'R$',
    HKD: 'HK$',
    KRW: '₩',
    MXN: '$',
    SGD: '$',
    NZD: 'NZ$',
    SEK: 'kr',
    NOK: 'kr',
    DKK: 'kr',
    ZAR: 'R',
    AED: 'د.إ',
    SAR: 'ر.س',
    ILS: '₪',
    TRY: '₺',
    PLN: 'zł',
    CZK: 'Kč',
    HUF: 'Ft',
    RON: 'RON',
    MYR: 'RM',
    TWD: '$',
    CLP: '$',
    COP: '$',
    PEN: 'S/',
    CRC: '₡',
    MAD: '.د.م',
  };

  return symbols[currency] || currency;
}

/**
 * Check if rates need updating
 */
export function shouldUpdateRates(): boolean {
  if (!lastUpdateTime) return true;
  
  const now = new Date();
  const timeDiff = now.getTime() - lastUpdateTime.getTime();
  
  return timeDiff > CACHE_DURATION;
}

/**
 * Initialize the currency converter
 * Call this when the app starts
 */
export async function initializeCurrencyConverter(): Promise<void> {
  if (shouldUpdateRates()) {
    await fetchLiveExchangeRates();
  }
}

/**
 * Get current exchange rates
 */
export function getCurrentRates(): ExchangeRates {
  return { ...exchangeRates };
}

/**
 * Get last update time
 */
export function getLastUpdateTime(): Date | null {
  return lastUpdateTime;
}

// Auto-update rates every 24 hours
if (typeof window !== 'undefined') {
  setInterval(() => {
    fetchLiveExchangeRates();
  }, 24 * 60 * 60 * 1000); // 24 hours
}