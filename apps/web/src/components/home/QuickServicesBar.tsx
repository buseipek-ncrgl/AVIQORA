'use client';

import React from 'react';
import { Luggage, Search, Clock, Radar, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';

interface QuickServicesBarProps {
  onOpenBaggageCalc: () => void;
  onOpenPnrLookup: () => void;
  onOpenTracker: () => void;
}

export const QuickServicesBar: React.FC<QuickServicesBarProps> = ({
  onOpenBaggageCalc,
  onOpenPnrLookup,
  onOpenTracker,
}) => {
  const { language } = useLanguage();
  const isTr = language === 'tr';

  const services = [
    {
      id: 'baggage',
      icon: Luggage,
      title: isTr ? 'Bagaj Hesaplama' : 'Baggage Calculator',
      description: isTr
        ? 'Serbest bagaj hakkınızı ve ek kilo ücretlerini saniyeler içinde hesaplayın.'
        : 'Calculate your free baggage allowance and excess weight fees in seconds.',
      action: onOpenBaggageCalc,
      badge: isTr ? 'Hesapla' : 'Calculate',
    },
    {
      id: 'pnr',
      icon: Search,
      title: isTr ? 'PNR / Bilet Sorgula' : 'PNR / Manage Booking',
      description: isTr
        ? 'Biletinizi ve rezervasyon detaylarınızı PNR ve soyisminizle görüntüleyin.'
        : 'Lookup your booking details and e-tickets using PNR and passenger surname.',
      action: onOpenPnrLookup,
      badge: isTr ? 'Sorgula' : 'Find Ticket',
    },
    {
      id: 'checkin',
      icon: Clock,
      title: isTr ? 'Online Check-in' : 'Online Check-in',
      description: isTr
        ? 'Koltuk seçiminizi yapın ve dijital biniş kartınızı anında oluşturun.'
        : 'Select your preferred seats and instantly generate your digital boarding pass.',
      link: '/profile',
      badge: isTr ? 'Check-in Yap' : 'Check-in',
    },
    {
      id: 'tracker',
      icon: Radar,
      title: isTr ? 'Canlı Uçuş Takibi' : 'Live Flight Tracker',
      description: isTr
        ? 'Uçuş rötar durumlarını, kalkış kapılarını ve canlı radarı takip edin.'
        : 'Track real-time flight delays, gate numbers, and live aviation radar.',
      action: onOpenTracker,
      badge: isTr ? 'Canlı İzle' : 'Track Live',
    },
  ];

  return (
    <section style={{ padding: 'clamp(56px, 8vw, 96px) clamp(16px, 4vw, 32px)', backgroundColor: 'var(--bg-primary)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        
        {/* Standard Homepage Section Header */}
        <div style={{ marginBottom: '40px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--brand-accent)' }}>
            {isTr ? 'DİJİTAL ARAÇLAR' : 'DIGITAL TOOLS'}
          </span>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, color: 'var(--text-primary)', marginTop: '4px' }}>
            {isTr ? 'Hızlı İşlemler & Dijital Hizmetler' : 'Quick Operations & Digital Tools'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', marginTop: '4px', maxWidth: '640px' }}>
            {isTr
              ? 'Uçuşunuz öncesinde ve sonrasında ihtiyacınız olan tüm dijital seyahat araçları.'
              : 'Essential digital tools for your journey before and after your flight.'}
          </p>
        </div>

        {/* 4-Column Responsive Grid matching WhyChooseUs & Destinations */}
        <div className="responsive-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
          {services.map((item) => {
            const IconComponent = item.icon;
            
            const cardContent = (
              <>
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

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                      {item.title}
                    </h3>
                    <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
                      {item.description}
                    </p>
                  </div>

                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.88rem',
                      fontWeight: 800,
                      color: 'var(--brand-accent)',
                      marginTop: '20px',
                    }}
                  >
                    <span>{item.badge}</span>
                    <ArrowRight size={15} />
                  </div>
                </div>
              </>
            );

            const cardStyle: React.CSSProperties = {
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '28px 24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '16px',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: 'var(--shadow-sm)',
              cursor: 'pointer',
              textDecoration: 'none',
            };

            const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = 'var(--brand-accent)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            };

            const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            };

            if (item.link) {
              return (
                <Link
                  key={item.id}
                  href={item.link}
                  className="corporate-card"
                  style={cardStyle}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  {cardContent}
                </Link>
              );
            }

            return (
              <div
                key={item.id}
                onClick={item.action}
                className="corporate-card"
                style={cardStyle}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {cardContent}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
