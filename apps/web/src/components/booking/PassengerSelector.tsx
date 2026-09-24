'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Users, ChevronDown, Plus, Minus } from 'lucide-react';

export interface PassengersState {
  adults: number;
  children: number;
  infants: number;
}

interface PassengerSelectorProps {
  passengers: PassengersState;
  onChange: (passengers: PassengersState) => void;
}

export const PassengerSelector: React.FC<PassengerSelectorProps> = ({ passengers, onChange }) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalPassengers = passengers.adults + passengers.children + passengers.infants;

  const updateCount = (key: keyof PassengersState, delta: number) => {
    const newCount = Math.max(0, passengers[key] + delta);
    if (key === 'adults' && newCount < 1) return;
    if (key === 'infants' && newCount > passengers.adults) return;

    onChange({ ...passengers, [key]: newCount });
  };

  const getSummaryText = () => {
    const parts: string[] = [];
    if (passengers.adults > 0) parts.push(`${passengers.adults} Yetişkin`);
    if (passengers.children > 0) parts.push(`${passengers.children} Çocuk`);
    if (passengers.infants > 0) parts.push(`${passengers.infants} Bebek`);

    return `${totalPassengers} Yolcu (${parts.join(', ')})`;
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '4px' }}>
        {t('booking.passengers')}
      </label>

      {/* Trigger Box with Fixed 52px Height */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '0 12px',
          height: '52px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={16} style={{ color: 'var(--brand-accent)', flexShrink: 0 }} />
          <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
            {totalPassengers} {t('booking.passengers')}
          </span>
        </div>
        <ChevronDown size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
      </div>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            right: 0,
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 160,
            width: '280px',
            padding: '18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            animation: 'modalFadeIn 0.2s ease-out',
          }}
        >
          {/* Adults */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{t('booking.adults')}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('booking.adultsSub')}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                disabled={passengers.adults <= 1}
                onClick={() => updateCount('adults', -1)}
                className="btn-outline"
                style={{ width: '32px', height: '32px', padding: 0, borderRadius: '6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Minus size={14} style={{ color: 'var(--text-primary)' }} />
              </button>
              <span style={{ fontWeight: 900, width: '24px', textAlign: 'center', fontSize: '1rem', color: 'var(--text-primary)' }}>
                {passengers.adults}
              </span>
              <button
                type="button"
                onClick={() => updateCount('adults', 1)}
                className="btn-outline"
                style={{ width: '32px', height: '32px', padding: 0, borderRadius: '6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Plus size={14} style={{ color: 'var(--text-primary)' }} />
              </button>
            </div>
          </div>

          {/* Children */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{t('booking.children')}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('booking.childrenSub')}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                disabled={passengers.children <= 0}
                onClick={() => updateCount('children', -1)}
                className="btn-outline"
                style={{ width: '32px', height: '32px', padding: 0, borderRadius: '6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Minus size={14} style={{ color: 'var(--text-primary)' }} />
              </button>
              <span style={{ fontWeight: 900, width: '24px', textAlign: 'center', fontSize: '1rem', color: 'var(--text-primary)' }}>
                {passengers.children}
              </span>
              <button
                type="button"
                onClick={() => updateCount('children', 1)}
                className="btn-outline"
                style={{ width: '32px', height: '32px', padding: 0, borderRadius: '6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Plus size={14} style={{ color: 'var(--text-primary)' }} />
              </button>
            </div>
          </div>

          {/* Infants */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{t('booking.infants')}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('booking.infantsSub')}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                disabled={passengers.infants <= 0}
                onClick={() => updateCount('infants', -1)}
                className="btn-outline"
                style={{ width: '32px', height: '32px', padding: 0, borderRadius: '6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Minus size={14} style={{ color: 'var(--text-primary)' }} />
              </button>
              <span style={{ fontWeight: 900, width: '24px', textAlign: 'center', fontSize: '1rem', color: 'var(--text-primary)' }}>
                {passengers.infants}
              </span>
              <button
                type="button"
                disabled={passengers.infants >= passengers.adults}
                onClick={() => updateCount('infants', 1)}
                className="btn-outline"
                style={{ width: '32px', height: '32px', padding: 0, borderRadius: '6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Plus size={14} style={{ color: 'var(--text-primary)' }} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
