'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Award, ArrowRight } from 'lucide-react';

interface LoyaltySectionProps {
  onOpenAuth: () => void;
}

export const LoyaltySection: React.FC<LoyaltySectionProps> = ({ onOpenAuth }) => {
  const { t } = useLanguage();

  return (
    <section style={{ padding: 'clamp(32px, 6vw, 72px) clamp(16px, 4vw, 32px)', backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)' }}>
      <div
        className="corporate-card loyalty-card-flex"
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: 'clamp(20px, 4vw, 48px)',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-xl)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '32px',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div style={{ maxWidth: '640px', flex: 1 }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--brand-gold)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Award size={16} /> {t('loyalty.badge')}
          </span>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 900, color: 'var(--text-primary)', margin: '8px 0 16px 0' }}>
            {t('loyalty.title')}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '24px' }}>
            {t('loyalty.subtitle')}
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button onClick={onOpenAuth} className="btn-brand">
              {t('loyalty.joinBtn')} <ArrowRight size={16} />
            </button>
            <button onClick={onOpenAuth} className="btn-outline">
              {t('loyalty.loginBtn')}
            </button>
          </div>
        </div>

        {/* Tier Card Graphic */}
        <div
          className="loyalty-card-graphic"
          style={{
            width: '320px',
            maxWidth: '100%',
            height: '200px',
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, #0A192F 0%, #1E3A5F 100%)',
            padding: '24px',
            color: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 900, fontSize: '1.1rem', letterSpacing: '0.1em' }}>AVIQORA</span>
            <span style={{ color: 'var(--brand-gold)', fontWeight: 800, fontSize: '0.85rem' }}>PLATINUM TIER</span>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>MEMBER ID</div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '0.1em' }}>AQ 8920 4401</div>
          </div>
        </div>
      </div>
    </section>
  );
};
