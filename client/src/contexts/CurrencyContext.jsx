import { createContext, useContext, useState } from 'react';

const CURRENCIES = {
  EUR: { symbol: '€', label: 'EUR', rate: 1 },
  GBP: { symbol: '£', label: 'GBP', rate: 0.86 },
  USD: { symbol: '$', label: 'USD', rate: 1.08 },
};

const CurrencyContext = createContext();

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('gkr-currency') || 'EUR';
  });

  const changeCurrency = (code) => {
    setCurrency(code);
    localStorage.setItem('gkr-currency', code);
  };

  const formatPrice = (eurAmount) => {
    const curr = CURRENCIES[currency] || CURRENCIES.EUR;
    const converted = eurAmount * curr.rate;
    return `${curr.symbol}${Number(converted).toLocaleString('en-MT', { maximumFractionDigits: 0 })}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, changeCurrency, formatPrice, currencies: CURRENCIES }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
