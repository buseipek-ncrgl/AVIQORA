import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { ArrowRight } from 'lucide-react';

interface FeaturedOffersProps {
  onSelectOffer: (from: string, to: string) => void;
}

export const FeaturedOffers: React.FC<FeaturedOffersProps> = ({ onSelectOffer }) => {
  const { t } = useLanguage();
  const { theme } = useTheme();

  return (
    <section id="offers" style={{ padding: 'clamp(56px, 8vw, 96px) clamp(16px, 4vw, 32px)', backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ marginBottom: '36px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--brand-accent)' }}>
            {t('offers.badge')}
          </span>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, color: 'var(--text-primary)', marginTop: '4px' }}>
            {t('offers.title')}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', marginTop: '4px' }}>
            {t('offers.subtitle')}
          </p>
        </div>

        {/* Editorial Layout: 1 Large Feature + 2 Small Features */}
        <div className="featured-offers-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px' }}>
          {/* Large Feature Card */}
          <div
            className="corporate-card featured-offer-large"
            style={{
              position: 'relative',
              minHeight: '400px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '40px',
              backgroundImage: 'url(/images/destination_paris.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              color: '#FFFFFF',
              overflow: 'hidden',
              borderRadius: '20px',
              cursor: 'pointer',
            }}
            onClick={() => onSelectOffer('IST', 'CDG')}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: theme === 'light'
                  ? 'linear-gradient(180deg, rgba(37, 99, 235, 0.12) 0%, rgba(15, 61, 138, 0.58) 100%)'
                  : 'linear-gradient(180deg, rgba(15, 61, 138, 0.22) 0%, rgba(10, 25, 47, 0.65) 100%)',
                zIndex: 1,
              }}
            />
            
            <div style={{ position: 'relative', zIndex: 2 }}>
              <span style={{ backgroundColor: 'var(--brand-accent)', padding: '4px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>
                {t('offers.card1Tag')}
              </span>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 900, margin: '12px 0 8px 0', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>{t('offers.card1Title')}</h3>
              <p style={{ fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.95)', marginBottom: '20px', maxWidth: '480px', lineHeight: 1.5, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                {t('offers.card1Desc')}
              </p>
              <button className="btn-brand" style={{ width: 'fit-content', borderRadius: '10px' }}>
                {t('offers.detailsBtn')} <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* 2 Small Feature Cards */}
          <div className="featured-offers-stack" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Card 2 */}
            <div
              className="corporate-card"
              style={{
                flex: 1,
                position: 'relative',
                minHeight: '188px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                backgroundImage: 'url(/images/cabin_business.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: '#FFFFFF',
                overflow: 'hidden',
                borderRadius: '16px',
                cursor: 'pointer',
              }}
              onClick={() => onSelectOffer('IST', 'LHR')}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: theme === 'light'
                    ? 'linear-gradient(135deg, rgba(15, 61, 138, 0.35) 0%, rgba(11, 31, 58, 0.55) 100%)'
                    : 'linear-gradient(135deg, rgba(15, 61, 138, 0.30) 0%, rgba(10, 25, 47, 0.55) 100%)',
                  zIndex: 1,
                }}
              />
              <div style={{ position: 'relative', zIndex: 2 }}>
                <span style={{ color: 'var(--brand-gold)', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  {t('offers.card2Tag')}
                </span>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 900, marginTop: '4px', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>{t('offers.card2Title')}</h4>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.92)', marginTop: '4px', textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>{t('offers.card2Desc')}</p>
              </div>
              <button className="btn-outline" style={{ position: 'relative', zIndex: 2, width: 'fit-content', color: '#FFF', borderColor: 'rgba(255,255,255,0.4)', padding: '6px 14px', fontSize: '0.82rem', borderRadius: '8px' }}>
                {t('offers.detailsBtn')} <ArrowRight size={14} />
              </button>
            </div>

            {/* Card 3 */}
            <div
              className="corporate-card"
              style={{
                flex: 1,
                position: 'relative',
                minHeight: '188px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                backgroundImage: 'url(/images/hero_aviation.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: '#FFFFFF',
                overflow: 'hidden',
                borderRadius: '16px',
                cursor: 'pointer',
              }}
              onClick={() => onSelectOffer('IST', 'JFK')}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: theme === 'light'
                    ? 'linear-gradient(135deg, rgba(5, 150, 105, 0.30) 0%, rgba(15, 61, 138, 0.52) 100%)'
                    : 'linear-gradient(135deg, rgba(5, 150, 105, 0.32) 0%, rgba(10, 25, 47, 0.55) 100%)',
                  zIndex: 1,
                }}
              />
              <div style={{ position: 'relative', zIndex: 2 }}>
                <span style={{ color: '#34d399', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase' }}>{t('offers.card3Tag')}</span>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 900, marginTop: '4px', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>{t('offers.card3Title')}</h4>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.92)', marginTop: '4px', textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>{t('offers.card3Desc')}</p>
              </div>
              <button className="btn-outline" style={{ position: 'relative', zIndex: 2, width: 'fit-content', color: '#FFF', borderColor: 'rgba(255,255,255,0.4)', padding: '6px 14px', fontSize: '0.82rem', borderRadius: '8px' }}>
                {t('offers.detailsBtn')} <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
