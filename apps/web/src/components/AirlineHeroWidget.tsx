'use client';

import React, { useState } from 'react';
import { AlertTriangle, Search } from 'lucide-react';

interface AirlineHeroWidgetProps {
  onSearch: (from: string, to: string, date: string) => void;
  onPnrLookup: (pnr: string) => void;
  isLoading: boolean;
}

export const AirlineHeroWidget: React.FC<AirlineHeroWidgetProps> = ({
  onSearch,
  onPnrLookup,
  isLoading,
}) => {
  const [activeTab, setActiveTab] = useState<'search' | 'pnr' | 'checkin'>('search');
  const [tripType, setTripType] = useState<'round' | 'oneWay'>('round');
  const [seatClass, setSeatClass] = useState<'Economy' | 'Business'>('Economy');

  // Search form fields
  const [fromCode, setFromCode] = useState('IST');
  const [toCode, setToCode] = useState('BER');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [passengerCount, setPassengerCount] = useState(1);

  // PNR lookup form field
  const [pnrCodeInput, setPnrCodeInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromCode === toCode) {
      setErrorMsg('Kalkış ve Varış havalimanı aynı olamaz.');
      return;
    }
    setErrorMsg(null);
    onSearch(fromCode, toCode, departureDate);
  };

  const handlePnrSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pnrCodeInput.trim()) return;
    onPnrLookup(pnrCodeInput.trim().toUpperCase());
  };

  return (
    <section
      id="booking-widget"
      style={{
        position: 'relative',
        padding: '80px 24px 60px 24px',
        background: 'linear-gradient(180deg, #071326 0%, #050c1a 100%)',
        overflow: 'hidden',
      }}
    >
      {/* Hero Atmosphere Decorative Glow */}
      <div
        style={{
          position: 'absolute',
          top: '-100px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '800px',
          height: '400px',
          background: 'radial-gradient(ellipse, rgba(0, 242, 254, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
        {/* Hero Headlines */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span
            style={{
              background: 'rgba(0, 242, 254, 0.12)',
              border: '1px solid rgba(0, 242, 254, 0.3)',
              color: '#00f2fe',
              padding: '6px 20px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 800,
              letterSpacing: '1.5px',
              display: 'inline-block',
              marginBottom: '16px',
            }}
          >
            KÜRESEL SEYAHAT DÜNYASI
          </span>
          <h1
            style={{
              fontSize: 'clamp(2.4rem, 4.5vw, 4rem)',
              fontWeight: 900,
              lineHeight: '1.15',
              letterSpacing: '-1px',
              color: '#ffffff',
            }}
          >
            Keşfedilmeyi Bekleyen Şehirler, <br />
            <span className="gradient-text">Sizinle Gökyüzüne.</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.05rem', marginTop: '12px', maxWidth: '650px', margin: '12px auto 0 auto' }}>
            Dünyanın en prestijli noktalarına direkt uçuşlar, esnek biletleme ve interaktif koltuk seçimi ile mükemmel yolculuk.
          </p>
        </div>

        {/* Real Airline Booking Widget Box */}
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
          {/* Main Widget Tabs Header */}
          <div style={{ display: 'flex', background: 'rgba(4, 9, 20, 0.7)', borderBottom: '1px solid var(--border-glass)' }}>
            <button
              style={{
                flex: 1,
                padding: '18px 24px',
                background: activeTab === 'search' ? 'rgba(0, 242, 254, 0.12)' : 'transparent',
                border: 'none',
                borderBottom: activeTab === 'search' ? '3px solid #00f2fe' : '3px solid transparent',
                color: activeTab === 'search' ? '#00f2fe' : '#94a3b8',
                fontWeight: 800,
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
              }}
              onClick={() => setActiveTab('search')}
            >
              <span>✈</span> Uçuş Ara
            </button>

            <button
              style={{
                flex: 1,
                padding: '18px 24px',
                background: activeTab === 'pnr' ? 'rgba(0, 242, 254, 0.12)' : 'transparent',
                border: 'none',
                borderBottom: activeTab === 'pnr' ? '3px solid #00f2fe' : '3px solid transparent',
                color: activeTab === 'pnr' ? '#00f2fe' : '#94a3b8',
                fontWeight: 800,
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
              }}
              onClick={() => setActiveTab('pnr')}
            >
              <span>📋</span> PNR / Biletim
            </button>

            <button
              style={{
                flex: 1,
                padding: '18px 24px',
                background: activeTab === 'checkin' ? 'rgba(0, 242, 254, 0.12)' : 'transparent',
                border: 'none',
                borderBottom: activeTab === 'checkin' ? '3px solid #00f2fe' : '3px solid transparent',
                color: activeTab === 'checkin' ? '#00f2fe' : '#94a3b8',
                fontWeight: 800,
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
              }}
              onClick={() => setActiveTab('checkin')}
            >
              <span>🎫</span> Online Check-in
            </button>
          </div>

          {/* Tab 1: Flight Search Form */}
          {activeTab === 'search' && (
            <div style={{ padding: '32px' }}>
              {/* Radio Controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                    <input
                      type="radio"
                      name="tripType"
                      checked={tripType === 'round'}
                      onChange={() => setTripType('round')}
                    />
                    Gidiş - Dönüş
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700, color: '#94a3b8' }}>
                    <input
                      type="radio"
                      name="tripType"
                      checked={tripType === 'oneWay'}
                      onChange={() => setTripType('oneWay')}
                    />
                    Tek Yön
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <select
                    className="input-field"
                    style={{ width: 'auto', padding: '8px 16px', fontSize: '0.85rem' }}
                    value={seatClass}
                    onChange={(e) => setSeatClass(e.target.value as 'Economy' | 'Business')}
                  >
                    <option value="Economy">Ekonomi Sınıfı</option>
                    <option value="Business">Business Class</option>
                  </select>
                </div>
              </div>

              {/* Form Grid */}
              <form onSubmit={handleSearchSubmit}>
                {errorMsg && (
                  <div style={{ padding: '10px 16px', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: '10px', color: '#ef4444', fontSize: '0.85rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><AlertTriangle size={14} /> {errorMsg}</span>
                    <button type="button" onClick={() => setErrorMsg(null)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 900 }}>✕</button>
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', alignItems: 'end' }}>
                  {/* Nereden */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '8px' }}>
                      🛫 NEREDEN
                    </label>
                    <select
                      className="input-field"
                      style={{ fontWeight: 800 }}
                      value={fromCode}
                      onChange={(e) => setFromCode(e.target.value)}
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
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '8px' }}>
                      🛬 NEREYE
                    </label>
                    <select
                      className="input-field"
                      style={{ fontWeight: 800 }}
                      value={toCode}
                      onChange={(e) => setToCode(e.target.value)}
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
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '8px' }}>
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
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '8px' }}>
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
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '8px' }}>
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
                      <option value={4}>4 Yetişkin</option>
                    </select>
                  </div>

                  {/* Search Button */}
                  <div>
                    <button
                      type="submit"
                      className="btn-primary"
                      style={{ width: '100%', height: '46px', fontSize: '1rem' }}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Search size={16} className="animate-spin" /> Uçuşlar Aranıyor...</span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Search size={16} /> UÇUŞ ARA</span>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Tab 2 & 3: PNR Lookup Form */}
          {(activeTab === 'pnr' || activeTab === 'checkin') && (
            <div style={{ padding: '32px' }}>
              <form onSubmit={handlePnrSubmit} style={{ display: 'flex', gap: '16px', maxWidth: '600px', margin: '0 auto', alignItems: 'end' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '8px' }}>
                    PNR KODU VE SOYADI
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    className="input-field"
                    placeholder="Örn: AVQ198"
                    style={{ textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 800, fontSize: '1.1rem' }}
                    value={pnrCodeInput}
                    onChange={(e) => setPnrCodeInput(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn-primary" style={{ height: '46px' }}>
                  {activeTab === 'checkin' ? '🎫 Check-in Başlat' : '🔍 Biletimi Getir'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
