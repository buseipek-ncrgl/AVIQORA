'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X, Sparkles } from 'lucide-react';

interface CustomDatePickerProps {
  value: string; // ISO date string "YYYY-MM-DD"
  onChange: (value: string) => void;
  label?: string;
  leftIcon?: React.ReactNode;
  placeholder?: string;
  disabled?: boolean;
  minYear?: number;
  maxYear?: number;
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value,
  onChange,
  leftIcon = <Calendar size={18} />,
  placeholder = 'Tarih Seçiniz',
  disabled = false,
  minYear = 1920,
  maxYear = new Date().getFullYear() + 5,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial date or default to current date / 1992
  const parsedDate = value ? new Date(value) : new Date(1992, 4, 14);
  const initialValid = !isNaN(parsedDate.getTime());

  const [currentMonth, setCurrentMonth] = useState(initialValid ? parsedDate.getMonth() : new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(initialValid ? parsedDate.getFullYear() : new Date().getFullYear());

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const monthNamesTr = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];
  const dayNamesTr = ['Pz', 'Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct'];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => Math.max(minYear, prev - 1));
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => Math.min(maxYear, prev + 1));
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const formattedMonth = (currentMonth + 1).toString().padStart(2, '0');
    const formattedDay = day.toString().padStart(2, '0');
    const newIsoDate = `${currentYear}-${formattedMonth}-${formattedDay}`;
    onChange(newIsoDate);
    setIsOpen(false);
  };

  // Format display text e.g. "14.05.1992"
  const getFormattedDisplay = () => {
    if (!value) return placeholder;
    const parts = value.split('-');
    if (parts.length === 3) {
      const [y, m, d] = parts;
      return `${d}.${m}.${y}`;
    }
    return value;
  };

  const selectedDayNumber = initialValid && value ? new Date(value).getDate() : null;
  const selectedMonthNumber = initialValid && value ? new Date(value).getMonth() : null;
  const selectedYearNumber = initialValid && value ? new Date(value).getFullYear() : null;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        userSelect: 'none',
      }}
    >
      {/* Date Trigger Input Box */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{
          width: '100%',
          height: '48px',
          backgroundColor: 'var(--bg-surface)',
          border: isOpen ? '2px solid var(--brand-accent)' : '1.5px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '0 16px',
          color: value ? 'var(--text-primary)' : 'var(--text-muted)',
          fontSize: '0.92rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: disabled ? 'not-allowed' : 'pointer',
          boxShadow: isOpen ? '0 0 0 4px rgba(37, 99, 235, 0.15)' : 'var(--shadow-sm)',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden', minWidth: 0, flex: 1 }}>
          {leftIcon && (
            <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
              {leftIcon}
            </span>
          )}
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{getFormattedDisplay()}</span>
        </div>

        <Calendar
          size={18}
          style={{
            color: isOpen ? 'var(--brand-accent)' : 'var(--text-muted)',
            transition: 'color 0.2s ease',
            flexShrink: 0,
          }}
        />
      </div>

      {/* Floating Custom Calendar Popover Grid */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            zIndex: 9999,
            width: 'min(330px, calc(100vw - 32px))',
            maxWidth: '100%',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.22)',
            padding: '20px',
            animation: 'modalFadeIn 0.18s ease-out',
          }}
        >
          {/* Calendar Header: Month & Year Navigator */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <button
              type="button"
              onClick={handlePrevMonth}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <ChevronLeft size={16} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <select
                value={currentMonth}
                onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontWeight: 900,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  paddingRight: '4px',
                }}
              >
                {monthNamesTr.map((m, idx) => (
                  <option key={idx} value={idx}>{m}</option>
                ))}
              </select>

              <select
                value={currentYear}
                onChange={(e) => setCurrentYear(parseInt(e.target.value))}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'var(--brand-accent)',
                  fontWeight: 900,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  paddingRight: '4px',
                }}
              >
                {Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i).map((yr) => (
                  <option key={yr} value={yr}>{yr}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Days of Week Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: '8px' }}>
            {dayNamesTr.map((day, idx) => (
              <span key={idx} style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                {day}
              </span>
            ))}
          </div>

          {/* Calendar Days Matrix */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' }}>
            {/* Empty slots for first week padding */}
            {Array.from({ length: firstDayIndex }).map((_, idx) => (
              <div key={`empty-${idx}`} />
            ))}

            {/* Days of the Month with Fares Heatmap Colors */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const isSelected =
                dayNum === selectedDayNumber &&
                currentMonth === selectedMonthNumber &&
                currentYear === selectedYearNumber;

              const dateObj = new Date(currentYear, currentMonth, dayNum);
              const dayOfWeek = dateObj.getDay(); // 0 = Sun, 5 = Fri, 6 = Sat
              const isCheapDay = (dayNum % 3 === 0 || dayNum % 7 === 2) && dayOfWeek !== 5 && dayOfWeek !== 6;
              const isExpensiveDay = dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0;

              let bgColor = 'transparent';
              let textColor = 'var(--text-primary)';
              let borderColor = 'transparent';

              if (isSelected) {
                bgColor = 'var(--brand-accent)';
                textColor = '#ffffff';
                borderColor = 'var(--brand-accent)';
              } else if (isCheapDay) {
                bgColor = 'rgba(16, 185, 129, 0.15)';
                textColor = '#047857';
                borderColor = 'rgba(16, 185, 129, 0.35)';
              } else if (isExpensiveDay) {
                bgColor = 'rgba(239, 68, 68, 0.12)';
                textColor = '#b91c1c';
                borderColor = 'rgba(239, 68, 68, 0.28)';
              }

              return (
                <button
                  key={dayNum}
                  type="button"
                  onClick={() => handleSelectDay(dayNum)}
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    border: `1px solid ${borderColor}`,
                    backgroundColor: bgColor,
                    color: textColor,
                    fontWeight: isSelected ? 900 : 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    transition: 'all 0.15s ease',
                    position: 'relative',
                  }}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          {/* Price Heatmap Color Legend Footer */}
          <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', fontWeight: 800 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#047857' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: 'rgba(16, 185, 129, 0.25)', border: '1px solid #10b981', display: 'inline-block' }} />
              <span>Ucuz / Avantajlı</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#b91c1c' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', display: 'inline-block' }} />
              <span>Yoğun / Pahalı</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
