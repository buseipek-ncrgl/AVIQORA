'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { AviqoraLogo } from './AviqoraLogo';
import { Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  const { language, toggleLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  return (
    <footer
      style={{
        backgroundColor: '#0B1F3A',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        padding: '64px 32px 32px 32px',
        color: 'rgba(255,255,255,0.72)',
        fontSize: '0.9rem',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Main Footer Navigation Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '56px' }}>
          {/* Col 1: Brand Info */}
          <div style={{ maxWidth: '300px' }}>
            <div style={{ marginBottom: '16px' }}>
              <AviqoraLogo size={36} showText={true} showTagline={true} />
            </div>
            <p style={{ fontSize: '0.86rem', color: 'rgba(255, 255, 255, 0.65)', lineHeight: 1.6, marginBottom: '20px' }}>
              {t('footer.tagline')}
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={toggleLanguage}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                }}
                title={language === 'tr' ? 'Switch to English' : 'Türkçe\'ye Geç'}
              >
                <Globe size={15} /> {language === 'tr' ? 'TR · TRY (₺)' : 'EN · USD ($)'}
              </button>
            </div>
          </div>

          {/* Col 2: Keşfet */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontWeight: 800, fontSize: '0.92rem', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t('footer.discover')}
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', padding: 0, margin: 0 }}>
              <li><a href="/flights" style={{ color: 'rgba(255,255,255,0.72)', textDecoration: 'none' }}>{t('footer.flights')}</a></li>
              <li><a href="#destinations" style={{ color: 'rgba(255,255,255,0.72)', textDecoration: 'none' }}>{t('footer.popularRoutes')}</a></li>
              <li><a href="#offers" style={{ color: 'rgba(255,255,255,0.72)', textDecoration: 'none' }}>{t('footer.offers')}</a></li>
              <li><a href="#destinations" style={{ color: 'rgba(255,255,255,0.72)', textDecoration: 'none' }}>{t('footer.destinations')}</a></li>
            </ul>
          </div>

          {/* Col 3: Destek */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontWeight: 800, fontSize: '0.92rem', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t('footer.support')}
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', padding: 0, margin: 0 }}>
              <li><a href="#help" style={{ color: 'rgba(255,255,255,0.72)', textDecoration: 'none' }}>{t('footer.helpCenter')}</a></li>
              <li><a href="#pnr" style={{ color: 'rgba(255,255,255,0.72)', textDecoration: 'none' }}>{t('footer.manageBooking')}</a></li>
              <li><a href="#contact" style={{ color: 'rgba(255,255,255,0.72)', textDecoration: 'none' }}>{t('footer.contactSupport')}</a></li>
              <li><a href="#faq" style={{ color: 'rgba(255,255,255,0.72)', textDecoration: 'none' }}>{t('footer.faq')}</a></li>
            </ul>
          </div>

          {/* Col 4: Kurumsal */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontWeight: 800, fontSize: '0.92rem', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t('footer.corporate')}
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', padding: 0, margin: 0 }}>
              <li><a href="#about" style={{ color: 'rgba(255,255,255,0.72)', textDecoration: 'none' }}>{t('footer.aboutUs')}</a></li>
              <li><a href="#careers" style={{ color: 'rgba(255,255,255,0.72)', textDecoration: 'none' }}>{t('footer.careers')}</a></li>
              <li><a href="#privacy" style={{ color: 'rgba(255,255,255,0.72)', textDecoration: 'none' }}>{t('footer.privacy')}</a></li>
              <li><a href="#terms" style={{ color: 'rgba(255,255,255,0.72)', textDecoration: 'none' }}>{t('footer.terms')}</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright + Legal Links */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '24px',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            fontSize: '0.82rem',
            color: 'rgba(255, 255, 255, 0.5)',
          }}
        >
          <div>{t('footer.copyright')}</div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <a href="#privacy" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>{t('footer.privacy')}</a>
            <a href="#cookies" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>{t('footer.cookies')}</a>
            <a href="#terms" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>{t('footer.terms')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
