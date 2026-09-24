'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

import { api } from '@/lib/api';

interface DateRangePickerProps {
  departureDate: string;
  returnDate: string;
  onDepartureChange: (date: string) => void;
  onReturnChange: (date: string) => void;
  isRoundTrip: boolean;
  error?: string;
  fromCode?: string;
  toCode?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  departureDate,
  returnDate,
  onDepartureChange,
  onReturnChange,
  isRoundTrip,
  error,
  fromCode = 'IST',
  toCode = 'BER',
}) => {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'short' });
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { month: 'long', year: 'numeric' });
  };

  const generateMonthDays = (baseDate: Date) => {
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const adjustedFirstDay = (firstDay + 6) % 7;

    const days = [];
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  };

  const nextMonthDate = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1);

  const toLocalDateStr = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const handleDateClick = (date: Date) => {
    const dateStr = toLocalDateStr(date);
    if (!isRoundTrip) {
      onDepartureChange(dateStr);
      setIsOpen(false);
    } else {
      if (!departureDate || (departureDate && returnDate) || new Date(dateStr) < new Date(departureDate)) {
        onDepartureChange(dateStr);
        onReturnChange('');
      } else if (new Date(dateStr) >= new Date(departureDate)) {
        onReturnChange(dateStr);
        setIsOpen(false);
      }
    }
  };

  // Get real flight prices from stored DB flights to highlight lowest price dates accurately
  const allFlights = api.flights.getAllStoredFlights();
  const routeFlights = allFlights.filter(
    (f) => f.departureAirportCode === fromCode && f.arrivalAirportCode === toCode
  );

  const getDayPriceStatus = (dateStr: string) => {
    const flightsOnDate = routeFlights.filter((f) => f.departureTime?.startsWith(dateStr));
    if (flightsOnDate.length > 0) {
      const minP = Math.min(...flightsOnDate.map((f) => f.priceAmount));
      if (minP < 2000) return { type: 'cheap', price: minP };
      if (minP > 2800) return { type: 'expensive', price: minP };
      return { type: 'normal', price: minP };
    }

    let hash = 0;
    const key = `${dateStr}-${fromCode}-${toCode}`;
    for (let i = 0; i < key.length; i++) {
      hash = key.charCodeAt(i) + ((hash << 5) - hash);
    }
    const val = Math.abs(hash) % 100;
    const basePrice = (fromCode === 'ESB' || toCode === 'ESB') ? 2364 : 1850;
    const estimatedPrice = basePrice + (val * 15);

    if (val < 35) {
      return { type: 'cheap', price: estimatedPrice };
    } else if (val > 65) {
      return { type: 'expensive', price: estimatedPrice };
    }
    return { type: 'normal', price: estimatedPrice };
  };

  const dayNames = language === 'tr' ? ['Pz', 'Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct'] : ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  const renderMonthGrid = (baseDate: Date) => {
    return generateMonthDays(baseDate).map((d, idx) => {
      if (!d) return <div key={idx} />;
      const isPast = d < today;
      const dateStr = toLocalDateStr(d);
      const isSelected = dateStr === departureDate || dateStr === returnDate;
      const isInRange = departureDate && returnDate && dateStr > departureDate && dateStr < returnDate;

      const priceStatus = getDayPriceStatus(dateStr);

      let bgColor = 'transparent';
      let textColor = 'var(--text-primary)';
      let borderColor = 'transparent';

      if (isSelected) {
        bgColor = 'var(--brand-accent)';
        textColor = '#ffffff';
        borderColor = 'var(--brand-accent)';
      } else if (isInRange) {
        bgColor = 'rgba(37, 99, 235, 0.15)';
        textColor = 'var(--brand-accent)';
      } else if (!isPast) {
        if (priceStatus.type === 'cheap') {
          bgColor = 'rgba(16, 185, 129, 0.12)';
          textColor = '#047857';
          borderColor = 'rgba(16, 185, 129, 0.4)';
        } else if (priceStatus.type === 'expensive') {
          bgColor = 'rgba(239, 68, 68, 0.1)';
          textColor = '#dc2626';
          borderColor = 'rgba(239, 68, 68, 0.35)';
        }
      }

      return (
        <button
          key={idx}
          type="button"
          disabled={isPast}
          onClick={() => handleDateClick(d)}
          title={!isPast ? `Tahmini Fiyat: ₺${priceStatus.price.toLocaleString('tr-TR')} (${priceStatus.type === 'cheap' ? 'Ucuz / Avantajlı Gün' : priceStatus.type === 'expensive' ? 'Yoğun / Pahalı Gün' : 'Standart Tarife'})` : 'Geçmiş Tarih'}
          style={{
            height: '36px',
            fontSize: '0.8rem',
            fontWeight: isSelected ? 900 : 700,
            borderRadius: '8px',
            border: `1.5px solid ${borderColor}`,
            backgroundColor: bgColor,
            color: textColor,
            opacity: isPast ? 0.35 : 1,
            cursor: isPast ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <span>{d.getDate()}</span>
          {!isPast && !isSelected && (
            <span
              style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                backgroundColor: priceStatus.type === 'cheap' ? '#10b981' : priceStatus.type === 'expensive' ? '#ef4444' : 'transparent',
                marginTop: '1px',
              }}
            />
          )}
        </button>
      );
    });
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%', overflow: 'visible' }}>
      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '4px' }}>
        {isRoundTrip ? `${t('booking.departure')} - ${t('booking.return')}` : t('booking.departure')}
      </label>

      {/* Trigger Box */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: error ? '1px solid var(--brand-red)' : '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '0 14px',
          height: '52px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'var(--transition-fast)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
          <CalendarIcon size={16} style={{ color: 'var(--brand-accent)', flexShrink: 0 }} />
          <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
            {departureDate ? formatDate(departureDate) : t('booking.departure')}
            {isRoundTrip && (
              <span style={{ color: returnDate ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                {' — '}{returnDate ? formatDate(returnDate) : t('booking.return')}
              </span>
            )}
          </span>
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', flexShrink: 0 }}>▾</span>
      </div>

      {error && <span style={{ color: 'var(--brand-red)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{error}</span>}

      {/* Floating Popover Responsive Fit */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.35)',
            zIndex: 99999,
            padding: '20px',
            width: '580px',
            maxWidth: '92vw',
            animation: 'modalFadeIn 0.2s ease-out',
          }}
        >
          {/* Header Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <button
              type="button"
              onClick={() => setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1))}
              className="btn-outline"
              style={{ width: '32px', height: '32px', padding: 0 }}
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
              {getMonthName(currentMonthDate)} — {getMonthName(nextMonthDate)}
            </span>
            <button
              type="button"
              onClick={() => setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1))}
              className="btn-outline"
              style={{ width: '32px', height: '32px', padding: 0 }}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Dual Month Calendar View */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            {/* Month 1 */}
            <div>
              <h5 style={{ textAlign: 'center', fontWeight: 700, fontSize: '0.85rem', marginBottom: '10px', color: 'var(--brand-accent)' }}>
                {getMonthName(currentMonthDate)}
              </h5>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', textAlign: 'center', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                {dayNames.map(d => <span key={d}>{d}</span>)}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                {renderMonthGrid(currentMonthDate)}
              </div>
            </div>

            {/* Month 2 */}
            <div>
              <h5 style={{ textAlign: 'center', fontWeight: 700, fontSize: '0.85rem', marginBottom: '10px', color: 'var(--brand-accent)' }}>
                {getMonthName(nextMonthDate)}
              </h5>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', textAlign: 'center', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                {dayNames.map(d => <span key={d}>{d}</span>)}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                {renderMonthGrid(nextMonthDate)}
              </div>
            </div>
          </div>

          {/* Price Heatmap Color Legend Footer */}
          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', fontWeight: 800 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#047857' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: 'rgba(16, 185, 129, 0.25)', border: '1px solid #10b981', display: 'inline-block' }} />
              <span>Ucuz / Avantajlı Günler</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#b91c1c' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', display: 'inline-block' }} />
              <span>Yoğun / Pahalı Günler</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
