'use client';

import React from 'react';

export const MilesClubSection: React.FC = () => {
  return (
    <section id="fleet" style={{ padding: '80px 24px', background: 'rgba(7, 16, 33, 0.5)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Miles Club Banner */}
        <div
          className="glass-panel"
          style={{
            padding: '48px',
            marginBottom: '60px',
            background: 'linear-gradient(135deg, rgba(14, 30, 56, 0.9) 0%, rgba(6, 17, 36, 0.9) 100%)',
            border: '1px solid rgba(0, 242, 254, 0.3)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '32px',
          }}
        >
          <div style={{ maxWidth: '650px' }}>
            <span style={{ color: '#f59e0b', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '1.5px' }}>
              ⭐ AVIQORA MILES CLUB
            </span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#ffffff', marginTop: '8px' }}>
              Uçtukça Kazanın, Ayrıcalıklarla Seyahat Edin
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '12px', lineHeight: '1.6' }}>
              Her milinizde ödül bilet kazanın, havalimanı özel yolcu salonlarına (Lounge) ücretsiz erişin ve Business Class yükseltme avantajlarından yararlanın.
            </p>
          </div>

          <div>
            <button className="btn-primary" style={{ padding: '14px 28px', fontSize: '0.95rem' }}>
              ⭐ Miles Club'a Ücretsiz Katıl
            </button>
          </div>
        </div>

        {/* Fleet Features Grid */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{ color: '#00f2fe', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '1.5px' }}>
            DÜNYA STANDARTLARINDA KONFOR
          </span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#ffffff', marginTop: '8px' }}>
            Modern Uçak Filomuz
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
          {[
            { title: 'Boeing 787-9 Dreamliner', desc: 'Sessiz kabin teknolojisi, panoramik pencereler ve tam yatar Business koltuklar.' },
            { title: 'Airbus A350-900', desc: 'Geniş gövdeli çift koridorlu konfor, HEPA hava filtreleri ve yüksek tavan ferahlığı.' },
            { title: 'Yüksek Hızlı Wi-Fi', desc: '10.000 metre yükseklikte kesintisiz internet bağlantısı ve canlı TV yayını.' },
            { title: 'Gourmet Ikramlar', desc: 'Dünyaca ünlü şefler tarafından taze hazırlanan sıcak gurme menüler.' },
          ].map((item, idx) => (
            <div key={idx} className="glass-card" style={{ padding: '28px' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#00f2fe', marginBottom: '8px' }}>{item.title}</div>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.6' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
