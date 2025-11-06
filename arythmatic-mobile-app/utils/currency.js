// utils/currency.js
// Shared currency utilities for consistent handling across screens

// Direct mapped rates for common pairs (approximate)
const directRates = {
  USD: { INR: 87.94, EUR: 0.85, USD: 1 },
  INR: { USD: 0.01137, EUR: 0.00967, INR: 1 },
  EUR: { USD: 1.18, INR: 103.46, EUR: 1 },
};

// USD per unit for supported currencies (approximate; used when no direct mapping)
const usdPerUnit = {
  USD: 1,
  EUR: 1.1765,
  GBP: 1.28,
  INR: 0.01137,
  JPY: 0.0067,
  CNY: 0.137,
  CAD: 0.73,
  AUD: 0.66,
};

export const getRate = (from, to) => {
  const f = (from || '').toUpperCase();
  const t = (to || '').toUpperCase();
  if (directRates[f]?.[t] != null) return directRates[f][t];
  if (usdPerUnit[f] && usdPerUnit[t]) return usdPerUnit[f] / usdPerUnit[t];
  return 1;
};

export const formatCurrency = (amount, curr = 'USD') => {
  const currency = (curr || 'USD').toUpperCase();
  const symbols = {
    // Major
    USD: '$', EUR: '€', GBP: '£', JPY: '¥', CNY: '¥', INR: '₹',
    CAD: '$', AUD: '$', NZD: '$', SGD: '$', HKD: '$',
    CHF: 'Fr', SEK: 'kr', NOK: 'kr', DKK: 'kr',
    RUB: '₽', TRY: '₺', KRW: '₩', TWD: 'NT$', THB: '฿',
    MYR: 'RM', IDR: 'Rp', PHP: '₱', ZAR: 'R', MXN: '$', BRL: 'R$',
    AED: 'د.إ', SAR: '﷼', PLN: 'zł', CZK: 'Kč', HUF: 'Ft', ILS: '₪',
  };
  if (typeof amount !== 'number' || isNaN(amount)) return `${symbols[currency] || currency}0`;
  const displayAmount = Math.round(amount).toLocaleString();
  return `${symbols[currency] || currency}${displayAmount}`;
};

export const symbol = (c) => {
  const cc = (c || '').toUpperCase();
  const map = {
    USD: '$', EUR: '€', GBP: '£', JPY: '¥', CNY: '¥', INR: '₹',
    CAD: '$', AUD: '$', NZD: '$', SGD: '$', HKD: '$',
    CHF: 'Fr', SEK: 'kr', NOK: 'kr', DKK: 'kr',
    RUB: '₽', TRY: '₺', KRW: '₩', TWD: 'NT$', THB: '฿',
    MYR: 'RM', IDR: 'Rp', PHP: '₱', ZAR: 'R', MXN: '$', BRL: 'R$',
    AED: 'د.إ', SAR: '﷼', PLN: 'zł', CZK: 'Kč', HUF: 'Ft', ILS: '₪',
  };
  return map[cc] || '';
};
