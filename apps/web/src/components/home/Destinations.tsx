import React from 'react';
import { DESTINATIONS } from '@/data/destinations';
import { useLanguage } from '@/context/LanguageContext';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

interface DestinationsProps {
  onSelectDestination: (from: string, to: string) => void;
}

const DESTINATION_PRICES_TR: Record<string, string> = {
  PAR: '₺3.450',
  LON: '₺3.890',
  TYO: '₺14.500',
  NYC: '₺16.200',
  AMS: '₺3.250',
  BER: '₺2.980',
};

const DESTINATION_PRICES_EN: Record<string, string> = {
  PAR: '$110',
  LON: '$125',
  TYO: '$460',
  NYC: '$515',
  AMS: '$105',
  BER: '$95',
};

export const Destinations: React.FC<DestinationsProps> = ({ onSelectDestination }) => {
  const { language, t } = useLanguage();
  const isTr = language === 'tr';
  const priceMap = isTr ? DESTINATION_PRICES_TR : DESTINATION_PRICES_EN;

  return (
    <section id="destinations" style={{ padding: 'clamp(56px, 8vw, 96px) clamp(16px, 4vw, 32px)', backgroundColor: 'var(--bg-primary)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Header with Title + Right Link */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '36px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--brand-accent)' }}>
              {t('destinations.badge')}
            </span>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, color: 'var(--text-primary)', marginTop: '4px' }}>
              {t('destinations.title')}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', marginTop: '4px' }}>
              {t('destinations.subtitle')}
            </p>
          </div>

          <a
            href="/flights"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 800,
              fontSize: '0.92rem',
              color: 'var(--brand-accent)',
              textDecoration: 'none',
              transition: 'var(--transition-fast)',
            }}
          >
            {t('destinations.viewFlights')} <ArrowRight size={16} />
          </a>
        </div>

        {/* 4-Column Desktop Grid (Responsive 2-col tablet, 1-col mobile) */}
        <div className="responsive-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
          {DESTINATIONS.map((dest) => {
            const price = priceMap[dest.code] || (isTr ? '₺3.200' : '$100');
            return (
              <div
                key={dest.id}
                onClick={() => onSelectDestination('IST', dest.code)}
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '340px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: 'var(--shadow-sm)',
                }}
                className="corporate-card"
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  e.currentTarget.style.borderColor = 'var(--brand-accent)';
                  const img = e.currentTarget.querySelector('img');
                  if (img) img.style.transform = 'scale(1.04)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  const img = e.currentTarget.querySelector('img');
                  if (img) img.style.transform = 'scale(1)';
                }}
              >
                {/* 65% Height Image Area */}
                <div style={{ position: 'relative', height: '65%', overflow: 'hidden' }}>
                  <img
                    src={dest.image}
                    alt={dest.city}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.35s ease',
                    }}
                  />
                  <div style={{ position: 'absolute', top: '12px', right: '12px', width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(15, 23, 42, 0.6)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                    <ArrowUpRight size={16} />
                  </div>
                </div>

                {/* Content Details Area */}
                <div style={{ padding: '16px 18px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--brand-accent)', textTransform: 'uppercase' }}>
                      Istanbul ➔ {dest.city}
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {dest.city}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px dashed var(--border-color)', paddingTop: '10px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {t('destinations.roundTrip')}
                    </span>
                    <span style={{ fontSize: '0.92rem', fontWeight: 900, color: 'var(--brand-accent)' }}>
                      {isTr ? `${price}'den başlayan` : `From ${price}`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
