'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface MegaMenuProps {
  activeCategory: string | null;
  onClose: () => void;
  onSelectSearch: (from?: string, to?: string) => void;
}

export const MegaMenu: React.FC<MegaMenuProps> = ({ activeCategory, onClose, onSelectSearch }) => {
  const { t } = useLanguage();

  if (!activeCategory) return null;

  return (
    <div
      onMouseLeave={onClose}
      style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: 'var(--bg-surface-elevated)',
        borderBottom: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-lg)',
        zIndex: 90,
        padding: '36px 48px',
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {activeCategory === 'flights' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' }}>
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--brand-accent)', marginBottom: '16px' }}>
                {t('megaMenu.flightsTitle')}
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li>
                  <button onClick={() => { onSelectSearch('IST', 'BER'); onClose(); }} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 600, textAlign: 'left' }}>
                    ✈️ {t('megaMenu.bookFlight')}
                  </button>
                </li>
                <li>
                  <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'left' }}>
                    {t('megaMenu.manageBooking')}
                  </button>
                </li>
                <li>
                  <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'left' }}>
                    {t('megaMenu.checkIn')}
                  </button>
                </li>
                <li>
                  <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'left' }}>
                    {t('megaMenu.flightStatus')}
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '16px' }}>
                {t('megaMenu.planTitle')}
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li><a href="#baggage" onClick={onClose} style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t('megaMenu.baggage')}</a></li>
                <li><a href="#seats" onClick={onClose} style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t('megaMenu.seatSelection')}</a></li>
                <li><a href="#travel-reqs" onClick={onClose} style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t('megaMenu.travelReqs')}</a></li>
                <li><a href="#airports" onClick={onClose} style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t('megaMenu.airportInfo')}</a></li>
              </ul>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-gold)', textTransform: 'uppercase' }}>AVIQORA Privileges</span>
              <h5 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '8px 0', color: 'var(--text-primary)' }}>{t('offers.card2Title')}</h5>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>{t('offers.card2Desc')}</p>
              <button onClick={() => { onSelectSearch('IST', 'LHR'); onClose(); }} className="btn-brand" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                {t('offers.detailsBtn')} ➔
              </button>
            </div>
          </div>
        )}

        {activeCategory === 'destinations' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '32px' }}>
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--brand-accent)', marginBottom: '12px' }}>
                {t('megaMenu.destinationsTitle')}
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li><button onClick={() => { onSelectSearch('IST', 'CDG'); onClose(); }} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '0.9rem' }}>Paris (CDG)</button></li>
                <li><button onClick={() => { onSelectSearch('IST', 'LHR'); onClose(); }} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '0.9rem' }}>Londra (LHR)</button></li>
                <li><button onClick={() => { onSelectSearch('IST', 'AMS'); onClose(); }} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '0.9rem' }}>Amsterdam (AMS)</button></li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>{t('megaMenu.middleEast')}</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li><button onClick={() => { onSelectSearch('IST', 'DXB'); onClose(); }} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '0.9rem' }}>Dubai (DXB)</button></li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>{t('megaMenu.americas')}</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li><button onClick={() => { onSelectSearch('IST', 'JFK'); onClose(); }} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '0.9rem' }}>New York (JFK)</button></li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>{t('megaMenu.asia')}</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li><button onClick={() => { onSelectSearch('IST', 'HND'); onClose(); }} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '0.9rem' }}>Tokyo (HND)</button></li>
              </ul>
            </div>
          </div>
        )}

        {activeCategory === 'experience' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--brand-accent)', marginBottom: '12px' }}>
                {t('megaMenu.experienceTitle')}
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li><a href="#business" onClick={onClose} style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>{t('megaMenu.businessClass')}</a></li>
                <li><a href="#economy" onClick={onClose} style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t('megaMenu.economyClass')}</a></li>
                <li><a href="#dining" onClick={onClose} style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t('megaMenu.dining')}</a></li>
              </ul>
            </div>
            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '20px', alignItems: 'center', background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-md)' }}>
              <img src="/images/cabin_business.jpg" alt="Business Suite" style={{ width: '160px', height: '100px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
              <div>
                <h5 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{t('experience.businessTitle')}</h5>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{t('experience.b1')}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
