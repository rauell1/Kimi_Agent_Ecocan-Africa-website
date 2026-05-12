'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Exchange rate: 1 USD = ~155 KES (approximate current rate)
// In production, this would be fetched from an API
const EXCHANGE_RATE = 155.5;

type Currency = 'USD' | 'KES';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (priceInUSD: number) => string;
  formatPriceDual: (priceInUSD: number) => { usd: string; kes: string };
  convertPrice: (priceInUSD: number) => number;
  exchangeRate: number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>('KES'); // Default to KES for Kenya
  const [exchangeRate, setExchangeRate] = useState(EXCHANGE_RATE);

  // In production, fetch real exchange rate
  useEffect(() => {
    // Simulated exchange rate update
    const updateRate = () => {
      // In real app: fetch from API like exchangerate-api.com
      // For now, use static rate with small variation for demo
      const variation = (Math.random() - 0.5) * 2; // ±1 KES variation
      setExchangeRate(EXCHANGE_RATE + variation);
    };
    
    // Update rate every hour in production
    const interval = setInterval(updateRate, 3600000);
    return () => clearInterval(interval);
  }, []);

  const convertPrice = (priceInUSD: number): number => {
    return currency === 'USD' ? priceInUSD : priceInUSD * exchangeRate;
  };

  const formatPrice = (priceInUSD: number): string => {
    const converted = convertPrice(priceInUSD);
    if (currency === 'USD') {
      return `$${converted.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
    return `KES ${converted.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const formatPriceDual = (priceInUSD: number): { usd: string; kes: string } => {
    const kesPrice = priceInUSD * exchangeRate;
    return {
      usd: `$${priceInUSD.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      kes: `KES ${kesPrice.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
    };
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, formatPriceDual, convertPrice, exchangeRate }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}

// Currency toggle component
export function CurrencyToggle() {
  const { currency, setCurrency, exchangeRate } = useCurrency();
  
  return (
    <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => setCurrency('USD')}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
          currency === 'USD' 
            ? 'bg-white text-gray-900 shadow-sm' 
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        USD
      </button>
      <button
        onClick={() => setCurrency('KES')}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
          currency === 'KES' 
            ? 'bg-white text-gray-900 shadow-sm' 
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        KES
      </button>
    </div>
  );
}

// Dual price display component - shows both USD and KES
export function PriceDisplay({ priceInUSD, className = '' }: { priceInUSD: number; className?: string }) {
  const { formatPriceDual, exchangeRate } = useCurrency();
  const prices = formatPriceDual(priceInUSD);
  
  return (
    <div className={`flex flex-col ${className}`}>
      <span className="text-lg font-bold text-[#051F20]">{prices.kes}</span>
      <span className="text-sm text-[#235347]/70">{prices.usd}</span>
    </div>
  );
}

// Compact dual price display
export function PriceDisplayCompact({ priceInUSD, className = '' }: { priceInUSD: number; className?: string }) {
  const { formatPriceDual } = useCurrency();
  const prices = formatPriceDual(priceInUSD);
  
  return (
    <div className={`flex items-baseline gap-2 ${className}`}>
      <span className="font-semibold text-[#051F20]">{prices.kes}</span>
      <span className="text-xs text-[#235347]/60">({prices.usd})</span>
    </div>
  );
}
