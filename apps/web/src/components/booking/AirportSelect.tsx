'use client';

import React, { useState, useRef, useEffect } from 'react';
import { AIRPORTS, Airport } from '@/data/airports';
import { api } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import { PlaneTakeoff, PlaneLanding, ChevronDown, Search, AlertTriangle } from 'lucide-react';

interface AirportSelectProps {
  label: string;
  value: string;
  onChange: (airportCode: string) => void;
  error?: string;
  isOrigin?: boolean;
}

export const AirportSelect: React.FC<AirportSelectProps> = ({ label, value, onChange, error, isOrigin = true }) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [airportsList, setAirportsList] = useState<Airport[]>(AIRPORTS);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    api.airports.getAll().then((data) => {
      if (isMounted && data && data.length > 0) {
        setAirportsList(data);
      }
    }).catch(() => {});
    return () => { isMounted = false; };
  }, []);

  const selectedAirport = airportsList.find(a => a.code === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredAirports = airportsList.filter(a =>
    a.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '4px' }}>
        {label}
      </label>

      {/* Trigger box with fixed 52px height */}
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
        {selectedAirport ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
            {isOrigin ? (
              <PlaneTakeoff size={18} style={{ color: 'var(--brand-accent)', flexShrink: 0 }} />
            ) : (
              <PlaneLanding size={18} style={{ color: 'var(--brand-accent)', flexShrink: 0 }} />
            )}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: 900, fontSize: '1rem', color: 'var(--brand-accent)' }}>{selectedAirport.code}</span>
                <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{selectedAirport.city}</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>
                {selectedAirport.name}
              </div>
            </div>
          </div>
        ) : (
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('booking.selectAirport')}</span>
        )}
        <ChevronDown size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
      </div>

      {error && <span style={{ color: 'var(--brand-red)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{error}</span>}

      {/* Popover */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 160,
            maxHeight: '260px',
            overflowY: 'auto',
            padding: '8px',
            animation: 'modalFadeIn 0.2s ease-out',
          }}
        >
          <div style={{ position: 'relative', marginBottom: '8px' }}>
            <input
              type="text"
              placeholder={t('booking.selectAirport')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
              style={{
                width: '100%',
                padding: '8px 12px 8px 32px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            />
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
          </div>

          {filteredAirports.length === 0 ? (
            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              <AlertTriangle size={16} style={{ color: 'var(--brand-gold)', marginBottom: '4px' }} />
              <div>Aramanıza uygun havalimanı bulunamadı.</div>
              <div style={{ fontSize: '0.72rem', opacity: 0.8, marginTop: '2px' }}>
                Lütfen havalimanı kodunu (örn: GZT, IST, ESB) veya şehir adını giriniz.
              </div>
            </div>
          ) : (
            filteredAirports.map(airport => (
              <div
                key={airport.code}
                onClick={() => {
                  onChange(airport.code);
                  setIsOpen(false);
                  setSearchTerm('');
                }}
                style={{
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'var(--transition-fast)',
                  backgroundColor: airport.code === value ? 'var(--bg-secondary)' : 'transparent',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-secondary)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = airport.code === value ? 'var(--bg-secondary)' : 'transparent')}
              >
                <div>
                  <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{airport.city} ({airport.country})</span>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{airport.name}</div>
                </div>
                <span style={{ fontWeight: 900, fontSize: '0.95rem', color: 'var(--brand-accent)' }}>{airport.code}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
