'use client';

import React from 'react';
import { Search, ShieldCheck, Headphones, TicketCheck } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export const WhyChooseUs: React.FC = () => {
  const { t } = useLanguage();

  const benefits = [
    {
      icon: Search,
      title: t('whyChooseUs.b1Title'),
      description: t('whyChooseUs.b1Desc'),
    },
    {
      icon: ShieldCheck,
      title: t('whyChooseUs.b2Title'),
      description: t('whyChooseUs.b2Desc'),
    },
    {
      icon: Headphones,
      title: t('whyChooseUs.b3Title'),
      description: t('whyChooseUs.b3Desc'),
    },
    {
      icon: TicketCheck,
      title: t('whyChooseUs.b4Title'),
      description: t('whyChooseUs.b4Desc'),
    },
  ];

  return (
    <section style={{ padding: 'clamp(56px, 8vw, 96px) clamp(16px, 4vw, 32px)', backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--brand-accent)' }}>
            {t('whyChooseUs.badge')}
          </span>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, color: 'var(--text-primary)', marginTop: '8px' }}>
            {t('whyChooseUs.title')}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '8px', maxWidth: '600px', margin: '8px auto 0 auto' }}>
            {t('whyChooseUs.subtitle')}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '32px' }}>
          {benefits.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div
                key={idx}
                className="corporate-card"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '16px',
                  padding: '28px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: 'var(--shadow-sm)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = 'var(--brand-accent)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    color: 'var(--brand-accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <IconComponent size={24} strokeWidth={1.8} />
                </div>

                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
