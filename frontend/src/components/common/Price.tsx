import React from 'react';
import { useCurrency } from '../../contexts/CurrencyContext';

interface PriceProps {
  /** Amount in the listing currency (defaults to EUR for catalog data) */
  amount: number;
  /** Currency the amount is listed in */
  fromCurrency?: string;
  /** Optional prefix like "From" */
  prefix?: string;
  /** Optional suffix like "pp" / "per person" */
  suffix?: string;
  className?: string;
}

/**
 * Site-wide price display. Renders the amount converted into the visitor's
 * saved currency (chosen via the header "Choose your currency" picker).
 */
export const Price: React.FC<PriceProps> = ({
  amount,
  fromCurrency = 'EUR',
  prefix,
  suffix,
  className,
}) => {
  const { formatPrice } = useCurrency();
  const text = `${prefix ? `${prefix} ` : ''}${formatPrice(amount, fromCurrency)}${suffix ? ` ${suffix}` : ''}`;
  return <span className={className}>{text}</span>;
};

export default Price;
