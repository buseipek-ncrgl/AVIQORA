'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Armchair, ChevronDown, Check, Sparkles, Crown } from 'lucide-react';

interface CabinSelectorProps {
  value: string;
  onChange: (cabin: string) => void;
}

export const CabinSelector: React.FC<CabinSelectorProps> = ({ value, onChange }) => {
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

  const cabinOptions = [
    {
      id: 'Economy',
      label: t('booking.economy'),
      sub: 'En uygun fiyat, standart uçuş konforu',
      badge: 'Ekonomik',
      icon: Armchair,
    },
    {
      id: 'PremiumEconomy',
      label: t('booking.premiumEconomy'),
      sub: 'Ekstra diz mesafesi & öncelikli bagaj',
      badge: 'Popüler',
      icon: Sparkles,
    },
    {
      id: 'Business',
      label: t('booking.business'),
      sub: 'Yataklı koltuk, VIP Lounge & gurme menü',
      badge: 'Lüks',
      icon: Crown,
    },
    {
      id: 'First',
      label: t('booking.first'),
      sub: 'Özel kapalı süit & kişiye özel servis',
      badge: 'Prestij',
      icon: Crown,
    },
  ];

  const currentOption = cabinOptions.find((c) => c.id === value) || cabinOptions[0];

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '4px' }}>
        {t('booking.cabinClass')}
      </label>

      {/* Trigger Button matching Date and Passenger Selectors */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
          <Armchair size={16} style={{ color: 'var(--brand-accent)', flexShrink: 0 }} />
          <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
            {currentOption.label}
          </span>
        </div>
        <ChevronDown size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
      </div>

      {/* Popover Card */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 160,
            width: '320px',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            animation: 'modalFadeIn 0.2s ease-out',
          }}
        >
          {cabinOptions.map((option) => {
            const isSelected = option.id === value;
            const IconComponent = option.icon;

            return (
              <div
                key={option.id}
                onClick={() => {
                  onChange(option.id);
                  setIsOpen(false);
                }}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                  border: isSelected ? '1px solid var(--brand-accent)' : '1px solid transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'var(--transition-smooth)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <IconComponent size={18} style={{ color: isSelected ? 'var(--brand-accent)' : 'var(--text-muted)', marginTop: '2px' }} />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: isSelected ? 'var(--brand-accent)' : 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {option.label}
                      {option.badge && (
                        <span
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: isSelected ? 'var(--brand-accent)' : 'var(--bg-secondary)',
                            color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                          }}
                        >
                          {option.badge}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.3 }}>
                      {option.sub}
                    </div>
                  </div>
                </div>

                {isSelected && <Check size={16} style={{ color: 'var(--brand-accent)', flexShrink: 0 }} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
