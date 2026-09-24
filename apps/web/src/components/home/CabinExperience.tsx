'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Check, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';

export const CabinExperience: React.FC = () => {
  const { language, t } = useLanguage();
  const isTr = language === 'tr';
  const [activeCabin, setActiveCabin] = useState<'business' | 'economy'>('business');

  const cabinDetails = {
    business: {
      tag: 'BOEING 787 DREAMLINER',
      title: 'Business Class Private Suites',
      subTitle: isTr ? 'Gökyüzündeki 5 Yıldızlı Konforunuz' : 'Your 5-Star Sanctuary in the Sky',
      image: '/images/cabin_business.jpg',
      features: isTr ? [
        'Özel süit alanı ve 180° tam yatar yataklı koltuklar',
        'Uçak içi ödüllü şef menüleri ve fine dining sunumu',
        'Öncelikli check-in, hızlı geçiş ve havalimanı lounge erişimi',
        'Yüksek hızlı Wi-Fi ve 4K kişisel eğlence ekranı',
      ] : [
        'Private suite space with 180° lie-flat bed seats',
        'Award-winning chef menus & fine dining service',
        'Priority check-in, fast-track security & lounge access',
        'High-speed Wi-Fi and 4K personal screen entertainment',
      ],
      btnText: isTr ? 'Business Class\'ı Keşfet' : 'Explore Business Class',
    },
    economy: {
      tag: 'AIRBUS A350-900',
      title: 'Economy Class Comfort Extra',
      subTitle: isTr ? 'Geniş Diz Mesafesi ve Zengin Uçuş İçi İkramlar' : 'Generous Legroom & Premium Inflight Amenities',
      image: '/images/hero_aviation.jpg',
      features: isTr ? [
        '79 cm geniş diz mesafesi ve ergonomik 4 yönlü baş desteği',
        'Zengin sıcak yemek seçenekleri ve ücretsiz içecek ikramı',
        '13.3 inç dokunmatik HD ekran ve 1.500+ film/dizi seçeneği',
        'USB-C şarj soketleri ve gürültü engelleyici kulaklıklar',
      ] : [
        '79 cm generous legroom & ergonomic 4-way headrest',
        'Gourmet hot meals & complimentary drink service',
        '13.3-inch touch HD screens & 1,500+ entertainment titles',
        'USB-C charging ports & noise-cancelling headphones',
      ],
      btnText: isTr ? 'Economy Class Özellikleri' : 'Explore Economy Class',
    },
  };

  const current = cabinDetails[activeCabin];

  return (
    <section id="experience" style={{ padding: 'clamp(48px, 6vw, 80px) clamp(16px, 4vw, 32px)', backgroundColor: 'var(--bg-primary)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--brand-gold)' }}>
            {t('experience.badge')}
          </span>
          <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 900, color: 'var(--text-primary)', marginTop: '6px' }}>
            {t('experience.title')}
          </h2>
        </div>

        {/* Cabin Switcher Pills */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '40px' }}>
          <button
            onClick={() => setActiveCabin('business')}
            className={activeCabin === 'business' ? 'btn-brand' : 'btn-outline'}
            style={{ padding: '10px 24px', fontSize: '0.9rem', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Sparkles size={16} /> Business Class
          </button>
          <button
            onClick={() => setActiveCabin('economy')}
            className={activeCabin === 'economy' ? 'btn-brand' : 'btn-outline'}
            style={{ padding: '10px 24px', fontSize: '0.9rem', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <ShieldCheck size={16} /> Economy Class
          </button>
        </div>

        {/* Split Layout: Photo (Left) + Editorial Specs (Right) */}
        <div className="cabin-experience-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center' }}>
          {/* Photo Left */}
          <div style={{ position: 'relative', borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-color)' }}>
            <img src={current.image} alt={current.title} style={{ width: '100%', height: '440px', objectFit: 'cover', display: 'block', transition: 'all 0.3s ease' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px', background: 'linear-gradient(180deg, transparent 0%, rgba(5, 12, 26, 0.9) 100%)', color: '#FFF' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--brand-gold)' }}>{current.tag}</span>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 900, marginTop: '2px' }}>{current.title}</h4>
            </div>
          </div>

          {/* Specs Right */}
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--brand-accent)' }}>
              AVIQORA CABIN PRIVILEGES
            </span>
            <h3 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', margin: '8px 0 16px 0' }}>
              {current.subTitle}
            </h3>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
              {current.features.map((ft, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <Check size={18} style={{ color: 'var(--brand-accent)', flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.5, fontWeight: 600 }}>{ft}</span>
                </li>
              ))}
            </ul>

            <button className="btn-brand">
              {current.btnText} <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
