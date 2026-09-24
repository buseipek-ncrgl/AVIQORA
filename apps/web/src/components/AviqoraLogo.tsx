'use client';

import React, { useId } from 'react';

interface AviqoraLogoProps {
  size?: number;
  showText?: boolean;
  showTagline?: boolean;
  variant?: 'cyan' | 'gold' | 'white' | 'luxury';
  textColor?: string;
}

export const AviqoraLogo: React.FC<AviqoraLogoProps> = ({
  size = 40,
  showText = true,
  showTagline = true,
  variant = 'cyan',
  textColor,
}) => {
  const baseId = useId();
  const cleanId = baseId.replace(/:/g, '');
  const gradId = `aviqora-plane-grad-${variant}-${cleanId}`;
  const glowId = `aviqora-glow-${variant}-${cleanId}`;

  const resolvedTextColor = textColor || 'var(--text-primary, #ffffff)';

  const badgeBackground =
    variant === 'gold' || variant === 'luxury'
      ? 'linear-gradient(135deg, #d97706 0%, #f59e0b 50%, #fbbf24 100%)'
      : variant === 'white'
      ? 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)'
      : 'linear-gradient(135deg, #1d4ed8 0%, #0284c7 50%, #00f2fe 100%)';

  const planePathColor = variant === 'white' ? '#0f172a' : '#ffffff';

  const shadowGlow =
    variant === 'gold' || variant === 'luxury'
      ? '0 4px 16px rgba(245, 158, 11, 0.35)'
      : '0 4px 16px rgba(37, 99, 235, 0.35)';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', userSelect: 'none' }}>
      {/* Dynamic Supersonic Jet Emblem Badge */}
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: `${Math.round(size * 0.28)}px`,
          background: badgeBackground,
          border: '1px solid rgba(255, 255, 255, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: shadowGlow,
          flexShrink: 0,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <svg
          width={Math.round(size * 0.68)}
          height={Math.round(size * 0.68)}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Curved Orbital Jet Trail */}
          <path
            d="M 12 78 C 30 78, 55 68, 78 35 L 72 32 C 52 62, 30 70, 12 70 Z"
            fill={planePathColor}
            opacity="0.45"
          />

          {/* Modern Passenger Jet Silhouette (Fuselage, Swept Wings & Tail Fin) */}
          <g filter={`url(#${glowId})`}>
            {/* Fuselage Nose to Tail */}
            <path
              d="M 78 22 C 72 20, 60 26, 48 38 C 36 50, 24 64, 18 72 C 16 75, 17 78, 20 78 C 24 78, 30 74, 40 64 C 54 50, 68 36, 78 26 C 82 22, 82 22, 78 22 Z"
              fill={planePathColor}
            />

            {/* Main Port Wing */}
            <path
              d="M 50 36 L 24 20 C 20 18, 18 20, 22 24 L 42 45 Z"
              fill={planePathColor}
              opacity="0.9"
            />

            {/* Main Starboard Wing */}
            <path
              d="M 44 48 L 26 78 C 24 82, 28 84, 32 80 L 52 56 Z"
              fill={planePathColor}
              opacity="0.85"
            />

            {/* Vertical Tail Stabilizer */}
            <path
              d="M 22 68 L 10 58 C 8 56, 7 58, 10 62 L 18 72 Z"
              fill={planePathColor}
              opacity="0.75"
            />
          </g>

          {/* Supersonic Flight Sparkle */}
          <circle cx="80" cy="20" r="4.5" fill="#ffffff" />
        </svg>
      </div>

      {/* Brand Name & Luxury Subtitle */}
      {showText && (
        <div>
          <span
            style={{
              fontSize: `${Math.max(1.15, size * 0.036)}rem`,
              fontWeight: 900,
              letterSpacing: '0.08em',
              color: resolvedTextColor,
              fontFamily: 'Outfit, Inter, sans-serif',
              lineHeight: 1.1,
              display: 'block',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
            }}
          >
            AVIQORA
          </span>
          {showTagline && (
            <span
              style={{
                fontSize: `${Math.max(0.62, size * 0.019)}rem`,
                color: 'var(--brand-gold, #fbbf24)',
                letterSpacing: '0.22em',
                fontWeight: 800,
                textTransform: 'uppercase',
                display: 'block',
                marginTop: '1px',
              }}
            >
              LUXURY AIRWAYS
            </span>
          )}
        </div>
      )}
    </div>
  );
};
