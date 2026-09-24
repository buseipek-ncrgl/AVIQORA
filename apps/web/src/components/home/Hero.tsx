'use client';

import React, { useState, useEffect } from 'react';
import { BookingWidget } from '../booking/BookingWidget';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { ShieldCheck } from 'lucide-react';

interface HeroProps {
  onSearch: (from: string, to: string, departure: string, returnDate: string, tripType?: string) => void;
  onPnrSearch: (pnr: string, surname: string) => void;
}

const SLIDES = [
  {
    image: '/images/hero_aviation.jpg',
    titleKey: 'hero.slide1Title',
    subKey: 'hero.slide1Sub',
  },
  {
    image: '/images/cabin_business.jpg',
    titleKey: 'hero.slide2Title',
    subKey: 'hero.slide2Sub',
  },
  {
    image: '/images/destination_paris.jpg',
    titleKey: 'hero.slide3Title',
    subKey: 'hero.slide3Sub',
  },
];

export const Hero: React.FC<HeroProps> = ({ onSearch, onPnrSearch }) => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section
      className="hero-section-responsive"
      style={{
        position: 'relative',
        minHeight: 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 'clamp(24px, 4vw, 48px) clamp(14px, 3.5vw, 32px) clamp(32px, 5vw, 60px)',
        overflow: 'visible',
        color: '#FFFFFF',
        zIndex: 20,
      }}
    >
      {/* Background Image Slider with Crossfade Transition */}
      {SLIDES.map((slide, idx) => (
        <div
          key={idx}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${slide.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: idx === currentSlide ? 1 : 0,
            transition: 'opacity 1.2s ease-in-out',
            zIndex: 0,
          }}
        />
      ))}

      {/* Theme-Sensitive Legibility Overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: theme === 'light'
            ? 'linear-gradient(180deg, rgba(15, 61, 138, 0.16) 0%, rgba(37, 99, 235, 0.16) 50%, rgba(15, 30, 60, 0.35) 100%)'
            : 'linear-gradient(180deg, rgba(15, 61, 138, 0.28) 0%, rgba(10, 25, 47, 0.48) 100%)',
          zIndex: 1,
        }}
      />

      {/* Brand Hero Content Area */}
      <div style={{ position: 'relative', zIndex: 2, maxWidth: '1280px', margin: '0 auto', width: '100%', paddingTop: '48px', paddingBottom: '24px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <span
            style={{
              fontSize: '0.78rem',
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--brand-gold)',
              backgroundColor: 'rgba(10, 25, 47, 0.65)',
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <ShieldCheck size={14} style={{ color: 'var(--brand-gold)' }} />
            {t('hero.badge')}
          </span>
        </div>

        {/* Main Title & Subtitle */}
        <div style={{ minHeight: '140px' }}>
          <h1
            style={{
              fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
              fontWeight: 900,
              lineHeight: 1.12,
              letterSpacing: '-0.02em',
              marginBottom: '14px',
              maxWidth: '780px',
              textShadow: '0 4px 16px rgba(0,0,0,0.6)',
            }}
          >
            Dünyayı keşfetmeye buradan başla
          </h1>

          <p
            style={{
              fontSize: 'clamp(1.05rem, 2.2vw, 1.25rem)',
              color: 'rgba(255, 255, 255, 0.94)',
              maxWidth: '620px',
              lineHeight: 1.5,
              textShadow: '0 2px 8px rgba(0,0,0,0.6)',
            }}
          >
            Yüzlerce uçuş seçeneğini karşılaştır, sana uygun yolculuğu kolayca bul.
          </p>
        </div>

        {/* Slide Indicators */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              style={{
                width: idx === currentSlide ? '32px' : '10px',
                height: '8px',
                borderRadius: '4px',
                backgroundColor: idx === currentSlide ? 'var(--brand-accent)' : 'rgba(255,255,255,0.4)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>
      </div>

      {/* Floating Booking Widget Container with High Z-Index */}
      <div style={{ position: 'relative', zIndex: 100, marginTop: '48px', overflow: 'visible' }}>
        <BookingWidget onSearch={onSearch} onPnrSearch={onPnrSearch} />
      </div>
    </section>
  );
};
