'use client';

import React, { useState } from 'react';

interface FlightSearchProps {
  onSearch: (from: string, to: string, date: string) => void;
  isLoading: boolean;
}

export const FlightSearch: React.FC<FlightSearchProps> = ({ onSearch, isLoading }) => {
  const [fromCode, setFromCode] = useState('');
  const [toCode, setToCode] = useState('');
  const [departureDate, setDepartureDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(fromCode, toCode, departureDate);
  };

  return (
    <div className="glass-panel" style={{ padding: '32px', marginBottom: '32px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '6px' }}>
          ✈️ <span className="gradient-text">Uçuş Ara & Bilet Al</span>
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Gerçek zamanlı koltuk haritası ve anında PNR onayı ile seyahatinizi planlayın.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'end' }}>
        {/* Nereden */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>
            🛫 Nereden (Kalkış)
          </label>
          <select
            className="input-field"
            value={fromCode}
            onChange={(e) => setFromCode(e.target.value)}
          >
            <option value="">Tüm Havalimanları</option>
            <option value="IST">IST - İstanbul Havalimanı</option>
            <option value="SAW">SAW - Sabiha Gökçen Havalimanı</option>
            <option value="BER">BER - Berlin Brandenburg</option>
            <option value="LHR">LHR - Londra Heathrow</option>
          </select>
        </div>

        {/* Nereye */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>
            🛬 Nereye (Varış)
          </label>
          <select
            className="input-field"
            value={toCode}
            onChange={(e) => setToCode(e.target.value)}
          >
            <option value="">Tüm Havalimanları</option>
            <option value="BER">BER - Berlin Brandenburg</option>
            <option value="LHR">LHR - Londra Heathrow</option>
            <option value="IST">IST - İstanbul Havalimanı</option>
            <option value="SAW">SAW - Sabiha Gökçen Havalimanı</option>
          </select>
        </div>

        {/* Tarih */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>
            📅 Tarih
          </label>
          <input
            type="date"
            className="input-field"
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
          />
        </div>

        {/* Ara Butonu */}
        <div>
          <button type="submit" className="btn-primary" style={{ width: '100%', height: '46px' }} disabled={isLoading}>
            {isLoading ? '⏳ Aranıyor...' : '🔍 Uçuşları Listele'}
          </button>
        </div>
      </form>
    </div>
  );
};
