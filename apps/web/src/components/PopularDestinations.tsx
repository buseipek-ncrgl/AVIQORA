'use client';

import React from 'react';

interface PopularDestinationsProps {
  onSelectRoute: (from: string, to: string) => void;
}

export const PopularDestinations: React.FC<PopularDestinationsProps> = ({ onSelectRoute }) => {
  const routes = [
    { from: 'IST', to: 'LHR', city: 'Londra', country: 'İngiltere', price: '₺2,200', tag: 'En Popüler', duration: '3s 50dk' },
    { from: 'IST', to: 'CDG', city: 'Paris', country: 'Fransa', price: '₺2,850', tag: 'Romantik Rota', duration: '3s 35dk' },
    { from: 'IST', to: 'BER', city: 'Berlin', country: 'Almanya', price: '₺1,450', tag: 'Fırsat Uçuşu', duration: '2s 55dk' },
    { from: 'IST', to: 'JFK', city: 'New York', country: 'ABD', price: '₺18,900', tag: 'Kıtalararası', duration: '11s 30dk' },
  ];

  return (
    <section id="offers" style={{ padding: '80px 24px', maxWidth: '1280px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <span style={{ color: '#00f2fe', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '1.5px' }}>
          ÖZEL UÇUŞ ROTALARI
        </span>
        <h2 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#ffffff', marginTop: '8px' }}>
          Dünyanın En Prestijli Şehirleri
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '8px' }}>
          AVIQORA kalitesiyle direkt uçabileceğiniz popüler lokasyonlar ve fırsat fiyatları.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
        {routes.map((r, idx) => (
          <div
            key={idx}
            className="glass-card"
            style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ background: 'rgba(0, 242, 254, 0.15)', color: '#00f2fe', fontSize: '0.75rem', fontWeight: 800, padding: '4px 10px', borderRadius: '8px' }}>
                  {r.tag}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700 }}>{r.from} ➔ {r.to}</span>
              </div>

              <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff' }}>{r.city}</h3>
              <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>{r.country} • Direkt Uçuş ({r.duration})</div>
            </div>

            <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-glass)', paddingTop: '16px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Tek Yön Başlangıç</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#10b981' }}>{r.price}</div>
              </div>

              <button
                className="btn-primary"
                style={{ fontSize: '0.8rem', padding: '10px 16px' }}
                onClick={() => onSelectRoute(r.from, r.to)}
              >
                Uçuşları Gör
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
