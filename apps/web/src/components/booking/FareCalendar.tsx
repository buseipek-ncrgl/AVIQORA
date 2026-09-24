'use client';

import React from 'react';
import { Calendar, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import { useCurrency } from '@/context/CurrencyContext';

interface FareCalendarProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  fromCode?: string;
  toCode?: string;
}

export const FareCalendar: React.FC<FareCalendarProps> = ({
  selectedDate,
  onSelectDate,
  fromCode = 'IST',
  toCode = 'ADB',
}) => {
  const { formatPrice } = useCurrency();
  const allFlights = api.flights.getAllStoredFlights();
  const routeFlights = allFlights.filter(
    (f) => f.departureAirportCode === fromCode && f.arrivalAirportCode === toCode
  );

  const getDeterministicPrice = (dateStr: string, from: string, to: string) => {
    let hash = 0;
    const str = `${dateStr}-${from}-${to}`;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const base = (from === 'ESB' || to === 'ESB') ? 2150 : 1650;
    const offset = (Math.abs(hash) % 15) * 60;
    return base + offset;
  };

  // Generate 7 consecutive days starting from today
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('tr-TR', { weekday: 'short' });
    const dayNum = d.getDate();
    const monthName = d.toLocaleDateString('tr-TR', { month: 'short' });

    // Find real flights on this date for this route
    const flightsOnDate = routeFlights.filter((f) => f.departureTime?.startsWith(dateStr));
    const price = flightsOnDate.length > 0 
      ? Math.min(...flightsOnDate.map((f) => f.priceAmount))
      : getDeterministicPrice(dateStr, fromCode, toCode);

    return {
      dateStr,
      display: `${dayName} ${dayNum} ${monthName}`,
      price,
      hasFlight: true,
    };
  });

  const availablePrices = dates.map((d) => d.price);
  const lowestPrice = Math.min(...availablePrices);
  const highestPrice = Math.max(...availablePrices);

  return (
    <div style={{ marginBottom: '16px', overflowX: 'auto', paddingBottom: '6px', maxWidth: '100%', WebkitOverflowScrolling: 'touch' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
        <Calendar size={14} style={{ color: 'var(--brand-accent)' }} />
        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          7 GÜNLÜK FİYAT MATRİSİ ({fromCode} ➔ {toCode})
        </span>
      </div>

      <div style={{ display: 'flex', gap: '8px', minWidth: 'max-content' }}>
        {dates.map((item) => {
          const isSelected = item.dateStr === selectedDate;
          const isLowest = item.price === lowestPrice;
          const isHighest = item.price === highestPrice && highestPrice > lowestPrice * 1.1;

          let badgeBg = 'transparent';
          let badgeColor = 'transparent';
          let badgeText = '';

          if (isLowest) {
            badgeBg = '#10b981';
            badgeColor = '#ffffff';
            badgeText = 'EN UCUZ';
          } else if (isHighest) {
            badgeBg = '#ef4444';
            badgeColor = '#ffffff';
            badgeText = 'YÜKSEK';
          }

          let priceColor = isSelected
            ? '#ffffff'
            : isLowest
            ? '#059669'
            : isHighest
            ? '#dc2626'
            : 'var(--text-primary)';

          return (
            <button
              key={item.dateStr}
              type="button"
              onClick={() => onSelectDate(item.dateStr)}
              style={{
                flex: 1,
                minWidth: '105px',
                padding: '8px 8px 10px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isSelected ? 'var(--brand-accent)' : 'var(--bg-surface)',
                border: isSelected
                  ? '1.5px solid var(--brand-accent)'
                  : isLowest
                  ? '1.5px solid #10b981'
                  : isHighest
                  ? '1.5px solid #f87171'
                  : '1px solid var(--border-color)',
                color: isSelected ? '#ffffff' : 'var(--text-primary)',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {badgeText ? (
                <span
                  style={{
                    backgroundColor: badgeBg,
                    color: badgeColor,
                    fontSize: '0.6rem',
                    fontWeight: 900,
                    padding: '1px 6px',
                    borderRadius: '4px',
                    whiteSpace: 'nowrap',
                    marginBottom: '2px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '2px',
                  }}
                >
                  {isLowest && <Sparkles size={9} />} {badgeText}
                </span>
              ) : (
                <div style={{ height: '16px' }} />
              )}

              <div style={{ fontSize: '0.78rem', fontWeight: 700, opacity: isSelected ? 0.9 : 0.7 }}>
                {item.display}
              </div>

              <div style={{ fontSize: '0.92rem', fontWeight: 900, marginTop: '2px', color: priceColor }}>
                {formatPrice(item.price)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

