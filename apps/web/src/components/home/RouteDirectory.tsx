'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { MapPin } from 'lucide-react';

interface RouteDirectoryProps {
  onSelectRoute: (from: string, to: string) => void;
}

interface RouteItem {
  nameTr: string;
  nameEn: string;
  from: string;
  to: string;
  priceTr: string;
  priceEn: string;
}

const REGION_ROUTES: Record<string, RouteItem[]> = {
  turkiye: [
    { nameTr: 'İstanbul — İzmir', nameEn: 'Istanbul — Izmir', from: 'IST', to: 'ADB', priceTr: '₺1.120', priceEn: '$38' },
    { nameTr: 'İstanbul — Ankara', nameEn: 'Istanbul — Ankara', from: 'IST', to: 'ESB', priceTr: '₺980', priceEn: '$32' },
    { nameTr: 'İstanbul — Antalya', nameEn: 'Istanbul — Antalya', from: 'IST', to: 'AYT', priceTr: '₺1.350', priceEn: '$45' },
    { nameTr: 'Ankara — İzmir', nameEn: 'Ankara — Izmir', from: 'ESB', to: 'ADB', priceTr: '₺890', priceEn: '$29' },
    { nameTr: 'İzmir — Antalya', nameEn: 'Izmir — Antalya', from: 'ADB', to: 'AYT', priceTr: '₺1.050', priceEn: '$34' },
    { nameTr: 'İstanbul — Adana', nameEn: 'Istanbul — Adana', from: 'IST', to: 'ADA', priceTr: '₺1.240', priceEn: '$40' },
    { nameTr: 'Sabiha Gökçen — Trabzon', nameEn: 'Sabiha Gokcen — Trabzon', from: 'SAW', to: 'TZX', priceTr: '₺1.490', priceEn: '$48' },
    { nameTr: 'Ankara — Antalya', nameEn: 'Ankara — Antalya', from: 'ESB', to: 'AYT', priceTr: '₺1.180', priceEn: '$39' },
  ],
  avrupa: [
    { nameTr: 'İstanbul — Paris (CDG)', nameEn: 'Istanbul — Paris (CDG)', from: 'IST', to: 'CDG', priceTr: '₺3.450', priceEn: '$110' },
    { nameTr: 'İstanbul — Londra (LHR)', nameEn: 'Istanbul — London (LHR)', from: 'IST', to: 'LHR', priceTr: '₺3.890', priceEn: '$125' },
    { nameTr: 'İstanbul — Berlin (BER)', nameEn: 'Istanbul — Berlin (BER)', from: 'IST', to: 'BER', priceTr: '₺2.980', priceEn: '$95' },
    { nameTr: 'İstanbul — Amsterdam (AMS)', nameEn: 'Istanbul — Amsterdam (AMS)', from: 'IST', to: 'AMS', priceTr: '₺3.250', priceEn: '$105' },
    { nameTr: 'İstanbul — Frankfurt (FRA)', nameEn: 'Istanbul — Frankfurt (FRA)', from: 'IST', to: 'FRA', priceTr: '₺2.850', priceEn: '$90' },
    { nameTr: 'Sabiha Gökçen — Roma (FCO)', nameEn: 'Sabiha Gokcen — Rome (FCO)', from: 'SAW', to: 'FCO', priceTr: '₺3.100', priceEn: '$98' },
    { nameTr: 'İstanbul — Viyana (VIE)', nameEn: 'Istanbul — Vienna (VIE)', from: 'IST', to: 'VIE', priceTr: '₺2.750', priceEn: '$88' },
    { nameTr: 'İstanbul — Zürih (ZRH)', nameEn: 'Istanbul — Zurich (ZRH)', from: 'IST', to: 'ZRH', priceTr: '₺3.600', priceEn: '$115' },
  ],
  asya: [
    { nameTr: 'İstanbul — Tokyo (HND)', nameEn: 'Istanbul — Tokyo (HND)', from: 'IST', to: 'HND', priceTr: '₺14.500', priceEn: '$460' },
    { nameTr: 'İstanbul — Singapur (SIN)', nameEn: 'Istanbul — Singapore (SIN)', from: 'IST', to: 'SIN', priceTr: '₺12.800', priceEn: '$410' },
    { nameTr: 'İstanbul — Seul (ICN)', nameEn: 'Istanbul — Seoul (ICN)', from: 'IST', to: 'ICN', priceTr: '₺13.900', priceEn: '$445' },
    { nameTr: 'İstanbul — Bangkok (BKK)', nameEn: 'Istanbul — Bangkok (BKK)', from: 'IST', to: 'BKK', priceTr: '₺11.400', priceEn: '$365' },
  ],
  amerika: [
    { nameTr: 'İstanbul — New York (JFK)', nameEn: 'Istanbul — New York (JFK)', from: 'IST', to: 'JFK', priceTr: '₺16.200', priceEn: '$515' },
    { nameTr: 'İstanbul — Los Angeles (LAX)', nameEn: 'Istanbul — Los Angeles (LAX)', from: 'IST', to: 'LAX', priceTr: '₺18.500', priceEn: '$590' },
    { nameTr: 'İstanbul — Miami (MIA)', nameEn: 'Istanbul — Miami (MIA)', from: 'IST', to: 'MIA', priceTr: '₺17.400', priceEn: '$555' },
    { nameTr: 'İstanbul — Chicago (ORD)', nameEn: 'Istanbul — Chicago (ORD)', from: 'IST', to: 'ORD', priceTr: '₺15.900', priceEn: '$505' },
  ],
};

export const RouteDirectory: React.FC<RouteDirectoryProps> = ({ onSelectRoute }) => {
  const { language } = useLanguage();
  const isTr = language === 'tr';
  const [activeRegion, setActiveRegion] = useState<'turkiye' | 'avrupa' | 'asya' | 'amerika'>('avrupa');

  const routes = REGION_ROUTES[activeRegion] || [];

  return (
    <section style={{ padding: 'clamp(48px, 6vw, 80px) clamp(16px, 4vw, 32px)', backgroundColor: 'var(--bg-primary)', borderTop: '1px solid var(--border-color)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--brand-accent)' }}>
            AVIQORA GLOBAL ROUTE NETWORK
          </span>
          <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 900, color: 'var(--text-primary)', marginTop: '6px' }}>
            {isTr ? 'Popüler Uçuş Rotaları & Destinasyonlar' : 'Popular Flight Routes & Destinations'}
          </h2>
        </div>

        {/* Region Tabs */}
        <div
          className="route-region-tabs"
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '36px',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            paddingBottom: '6px',
          }}
        >
          <button
            onClick={() => setActiveRegion('turkiye')}
            className={activeRegion === 'turkiye' ? 'btn-brand' : 'btn-outline'}
            style={{ padding: '9px 24px', fontSize: '0.88rem', flexShrink: 0, whiteSpace: 'nowrap', borderRadius: 'var(--radius-full)' }}
          >
            {isTr ? 'TÜRKİYE' : 'TÜRKIYE'}
          </button>
          <button
            onClick={() => setActiveRegion('avrupa')}
            className={activeRegion === 'avrupa' ? 'btn-brand' : 'btn-outline'}
            style={{ padding: '9px 24px', fontSize: '0.88rem', flexShrink: 0, whiteSpace: 'nowrap', borderRadius: 'var(--radius-full)' }}
          >
            {isTr ? 'AVRUPA' : 'EUROPE'}
          </button>
          <button
            onClick={() => setActiveRegion('asya')}
            className={activeRegion === 'asya' ? 'btn-brand' : 'btn-outline'}
            style={{ padding: '9px 24px', fontSize: '0.88rem', flexShrink: 0, whiteSpace: 'nowrap', borderRadius: 'var(--radius-full)' }}
          >
            {isTr ? 'ASYA & PASİFİK' : 'ASIA & PACIFIC'}
          </button>
          <button
            onClick={() => setActiveRegion('amerika')}
            className={activeRegion === 'amerika' ? 'btn-brand' : 'btn-outline'}
            style={{ padding: '9px 24px', fontSize: '0.88rem', flexShrink: 0, whiteSpace: 'nowrap', borderRadius: 'var(--radius-full)' }}
          >
            {isTr ? 'AMERİKA' : 'AMERICAS'}
          </button>
        </div>

        {/* Multi-Column Pin Route Directory with Starting Price Badges */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {routes.map((rt, idx) => (
            <div
              key={idx}
              onClick={() => onSelectRoute(rt.from, rt.to)}
              className="corporate-card"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--brand-accent)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <MapPin size={18} style={{ color: 'var(--brand-accent)', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                    {isTr ? rt.nameTr : rt.nameEn}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{rt.from} ➔ {rt.to}</div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {isTr ? 'BAŞLANGIÇ' : 'FROM'}
                </div>
                <div style={{ fontWeight: 900, fontSize: '1.05rem', color: 'var(--brand-accent)' }}>
                  {isTr ? rt.priceTr : rt.priceEn}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
