'use client';

import React, { useState } from 'react';

interface HeroSearchProps {
  onSearch: (from: string, to: string, date: string) => void;
  onExploreRoute: (from: string, to: string) => void;
  isLoading: boolean;
}

export const HeroSearch: React.FC<HeroSearchProps> = ({ onSearch, onExploreRoute, isLoading }) => {
  const [tripType, setTripType] = useState<'round' | 'oneWay'>('round');
  const [fromCode, setFromCode] = useState('IST');
  const [toCode, setToCode] = useState('BER');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [passengerCount, setPassengerCount] = useState(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromCode === toCode) {
      setErrorMsg('Kalkış ve Varış havalimanları aynı olamaz.');
      return;
    }
    setErrorMsg(null);
    onSearch(fromCode, toCode, departureDate);
  };

  const handleExplore = () => {
    if (fromCode === toCode) {
      setErrorMsg('Kalkış ve Varış havalimanları aynı olamaz.');
      return;
    }
    setErrorMsg(null);
    onExploreRoute(fromCode, toCode);
  };

  return (
    <div
      style={{
        background: 'rgba(11, 30, 51, 0.75)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '24px',
        padding: '28px 36px',
        boxShadow: '0 30px 80px rgba(0, 0, 0, 0.5)',
        width: '100%',
        maxWidth: '1100px',
        margin: '0 auto',
      }}
    >
      {/* Top Controls: Trip Type Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(0, 0, 0, 0.3)', padding: '4px', borderRadius: '12px' }}>
          <button
            type="button"
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              border: 'none',
              background: tripType === 'round' ? 'rgba(0, 242, 254, 0.2)' : 'transparent',
              color: tripType === 'round' ? '#00f2fe' : '#94a3b8',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onClick={() => setTripType('round')}
          >
            ⇄ Gidiş - Dönüş
          </button>
          <button
            type="button"
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              border: 'none',
              background: tripType === 'oneWay' ? 'rgba(0, 242, 254, 0.2)' : 'transparent',
              color: tripType === 'oneWay' ? '#00f2fe' : '#94a3b8',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onClick={() => setTripType('oneWay')}
          >
            ➔ Tek Yön
          </button>
        </div>
      </div>

      {/* Main Search Form Grid */}
      <form onSubmit={handleSubmit}>
        {errorMsg && (
          <div style={{ padding: '10px 16px', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: '10px', color: '#ef4444', fontSize: '0.85rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>⚠️ {errorMsg}</span>
            <button type="button" onClick={() => setErrorMsg(null)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 900 }}>✕</button>
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '16px', alignItems: 'end' }}>
          {/* Nereden */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '6px', letterSpacing: '0.5px' }}>
              🛫 NEREDEN
            </label>
            <select
              className="input-field"
              value={fromCode}
              onChange={(e) => setFromCode(e.target.value)}
              style={{ fontWeight: 700, fontSize: '0.95rem' }}
            >
              <option value="IST">IST - İstanbul (İGA)</option>
              <option value="SAW">SAW - İstanbul (Sabiha Gökçen)</option>
              <option value="BER">BER - Berlin Brandenburg</option>
              <option value="LHR">LHR - Londra Heathrow</option>
              <option value="CDG">CDG - Paris Charles de Gaulle</option>
              <option value="JFK">JFK - New York</option>
            </select>
          </div>

          {/* Nereye */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '6px', letterSpacing: '0.5px' }}>
              🛬 NEREYE
            </label>
            <select
              className="input-field"
              value={toCode}
              onChange={(e) => setToCode(e.target.value)}
              style={{ fontWeight: 700, fontSize: '0.95rem' }}
            >
              <option value="BER">BER - Berlin Brandenburg</option>
              <option value="LHR">LHR - Londra Heathrow</option>
              <option value="CDG">CDG - Paris Charles de Gaulle</option>
              <option value="JFK">JFK - New York</option>
              <option value="IST">IST - İstanbul (İGA)</option>
              <option value="SAW">SAW - İstanbul (Sabiha Gökçen)</option>
            </select>
          </div>

          {/* Gidiş Tarihi */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '6px', letterSpacing: '0.5px' }}>
              📅 GİDİŞ TARİHİ
            </label>
            <input
              type="date"
              className="input-field"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
            />
          </div>

          {/* Dönüş Tarihi */}
          {tripType === 'round' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '6px', letterSpacing: '0.5px' }}>
                📅 DÖNÜŞ TARİHİ
              </label>
              <input
                type="date"
                className="input-field"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
              />
            </div>
          )}

          {/* Yolcu Sayısı */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '6px', letterSpacing: '0.5px' }}>
              👤 YOLCU SAYISI
            </label>
            <select
              className="input-field"
              value={passengerCount}
              onChange={(e) => setPassengerCount(parseInt(e.target.value))}
            >
              <option value={1}>1 Yetişkin</option>
              <option value={2}>2 Yetişkin</option>
              <option value={3}>3 Yetişkin</option>
              <option value={4}>4+ Yetişkin</option>
            </select>
          </div>

          {/* Uçuş Ara CTA Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                height: '46px',
                background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
                color: '#040914',
                fontWeight: 800,
                fontSize: '0.95rem',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                boxShadow: '0 6px 25px rgba(0, 242, 254, 0.4)',
                letterSpacing: '0.5px',
              }}
            >
              {isLoading ? '⏳ Uçuşlar Aranıyor...' : '✈ UÇUŞ ARA'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
