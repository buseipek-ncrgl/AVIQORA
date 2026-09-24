'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Currency = 'TRY' | 'EUR' | 'USD' | 'GBP' | 'AED';

export interface CurrencyDetails {
  code: Currency;
  symbol: string;
  rateToTRY: number; // 1 Unit = X TRY
  name: string;
}

export const RATES: Record<Currency, CurrencyDetails> = {
  TRY: { code: 'TRY', symbol: '₺', rateToTRY: 1.0, name: 'Türk Lirası (TRY)' },
  EUR: { code: 'EUR', symbol: '€', rateToTRY: 38.5, name: 'Euro (EUR)' },
  USD: { code: 'USD', symbol: '$', rateToTRY: 35.2, name: 'US Dollar (USD)' },
  GBP: { code: 'GBP', symbol: '£', rateToTRY: 46.8, name: 'British Pound (GBP)' },
  AED: { code: 'AED', symbol: 'د.إ', rateToTRY: 9.58, name: 'UAE Dirham (AED)' },
};

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (amountInTRY: number) => string;
  convertPrice: (amountInTRY: number) => number;
  symbol: string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>('TRY');
  const [rates, setRates] = useState<Record<Currency, CurrencyDetails>>(RATES);

  useEffect(() => {
    const savedCurrency = localStorage.getItem('aviqora_currency') as Currency | null;
    if (savedCurrency && RATES[savedCurrency]) {
      setCurrencyState(savedCurrency);
    }

    // Fetch live daily exchange rates (Central Bank / Live Forex API)
    const fetchLiveDailyRates = async () => {
      try {
        const res = await fetch('https://open.er-api.com/v6/latest/TRY');
        if (res.ok) {
          const data = await res.json();
          if (data && data.rates) {
            const liveRates = { ...RATES };
            if (data.rates.USD) liveRates.USD.rateToTRY = Math.round((1 / data.rates.USD) * 100) / 100;
            if (data.rates.EUR) liveRates.EUR.rateToTRY = Math.round((1 / data.rates.EUR) * 100) / 100;
            if (data.rates.GBP) liveRates.GBP.rateToTRY = Math.round((1 / data.rates.GBP) * 100) / 100;
            if (data.rates.AED) liveRates.AED.rateToTRY = Math.round((1 / data.rates.AED) * 100) / 100;
            setRates(liveRates);
          }
        }
      } catch {
        // Fallback to initial rates
      }
    };

    fetchLiveDailyRates();
  }, []);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem('aviqora_currency', c);
  };

  const convertPrice = (amountInTRY: number): number => {
    const rate = rates[currency]?.rateToTRY || 1;
    return Math.round((amountInTRY / rate) * 100) / 100;
  };

  const formatPrice = (amountInTRY: number): string => {
    const details = rates[currency] || rates.TRY;
    const converted = convertPrice(amountInTRY);
    return `${details.symbol}${converted.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatPrice,
        convertPrice,
        symbol: rates[currency]?.symbol || '₺',
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
