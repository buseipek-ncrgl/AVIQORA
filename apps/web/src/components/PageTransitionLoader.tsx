'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Plane, Compass } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export const PageTransitionLoader: React.FC = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { language } = useLanguage();

  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Trigger smooth loading state on pathname/searchParams change
  useEffect(() => {
    setIsLoading(true);
    setProgress(25);

    const timer1 = setTimeout(() => setProgress(65), 150);
    const timer2 = setTimeout(() => setProgress(90), 300);
    const timer3 = setTimeout(() => {
      setProgress(100);
      setTimeout(() => setIsLoading(false), 200);
    }, 450);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [pathname, searchParams]);

  // Intercept link clicks to show instantaneous loading animation
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest('a');
      if (anchor && anchor.href && anchor.href.startsWith(window.location.origin)) {
        const url = new URL(anchor.href);
        if (url.pathname !== window.location.pathname || url.search !== window.location.search) {
          setIsLoading(true);
          setProgress(30);
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  if (!isLoading && progress === 0) return null;

  return (
    <>
      {/* TOP SLIM GLOWING PROGRESS BAR WITH FORWARD FLYING PLANE LEADER */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '4px',
          zIndex: 100050,
          pointerEvents: 'none',
          opacity: isLoading ? 1 : 0,
          transition: 'opacity 0.25s ease',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            backgroundColor: 'var(--brand-accent)',
            boxShadow: '0 0 12px var(--brand-accent), 0 0 24px var(--brand-accent)',
            transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
          }}
        >
          {/* Leading Flying Jetliner Icon (Forward Right Direction) */}
          <div
            style={{
              position: 'absolute',
              right: '-8px',
              top: '-7px',
              color: 'var(--brand-accent)',
              transform: 'rotate(-45deg)',
              filter: 'drop-shadow(0 0 6px var(--brand-accent))',
            }}
          >
            <Plane size={18} />
          </div>
        </div>
      </div>

      {/* FULL-SCREEN GLASSMORPHISM SEMI-TRANSPARENT FLOATING LOADER (NO OPAQUE CARD BOX) */}
      {isLoading && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100040,
            backgroundColor: 'rgba(10, 25, 47, 0.65)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeIn 0.2s ease forwards',
          }}
        >
          {/* FLOATING GLASS CONTAINER (BORDERLESS & TRANSPARENT) */}
          <div
            style={{
              padding: '24px 36px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              maxWidth: '360px',
              width: '90%',
            }}
          >
            {/* Ascending Takeoff Jetliner Canvas */}
            <div style={{ position: 'relative', width: '160px', height: '60px', marginBottom: '12px', overflow: 'hidden' }}>
              {/* Soft Compass & Clouds background float */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-around',
                  opacity: 0.25,
                  animation: 'cloudFloat 3s infinite ease-in-out',
                }}
              >
                <Compass size={32} style={{ color: 'var(--brand-accent)' }} />
                <Compass size={22} style={{ color: 'var(--brand-gold)' }} />
              </div>

              {/* Main Ascending Jetliner (Taking off Upwards to the Right) */}
              <div
                className="plane-fly-anim"
                style={{
                  position: 'absolute',
                  top: '15px',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  filter: 'drop-shadow(0 0 10px rgba(41, 121, 255, 0.8))',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent, #2979ff)',
                    borderRadius: '2px',
                  }}
                />
                <Plane size={32} style={{ transform: 'rotate(0deg)', color: '#ffffff' }} />
              </div>
            </div>

            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ffffff', letterSpacing: '0.06em', marginBottom: '4px' }}>
              AVIQORA AIRWAYS
            </div>

            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px' }}>
              {language === 'tr' ? 'Uçuş Rotası Hazırlanıyor...' : 'Preparing Flight Route...'}
            </div>

            {/* Glowing Glass Micro Progress Track */}
            <div
              style={{
                width: '100%',
                height: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                borderRadius: '10px',
                overflow: 'hidden',
                boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.3)',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${progress}%`,
                  backgroundColor: '#2979ff',
                  borderRadius: '10px',
                  boxShadow: '0 0 10px #2979ff',
                  transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
