'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Briefcase, Ticket, Radio, Luggage } from 'lucide-react';

interface QuickActionsProps {
  onOpenPnr: () => void;
  onOpenTracker?: () => void;
  onOpenBaggageCalculator?: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onOpenPnr, onOpenTracker, onOpenBaggageCalculator }) => {
  const { t } = useLanguage();

  const actions = [
    { title: t('quickActions.manage'), icon: Briefcase, action: onOpenPnr },
    { title: t('quickActions.checkin'), icon: Ticket, action: onOpenPnr },
    { title: t('quickActions.status'), icon: Radio, action: onOpenTracker || onOpenPnr },
    { title: t('quickActions.baggage'), icon: Luggage, action: onOpenBaggageCalculator || onOpenPnr },
  ];

  return (
    <section style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', padding: '20px 32px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {actions.map((act, idx) => {
          const IconComp = act.icon;
          return (
            <button
              key={idx}
              onClick={act.action}
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                transition: 'var(--transition-fast)',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--brand-accent)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
            >
              <IconComp size={20} style={{ color: 'var(--brand-accent)', flexShrink: 0 }} />
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{act.title}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
