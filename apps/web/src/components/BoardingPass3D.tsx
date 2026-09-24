'use client';

import React, { useState } from 'react';

interface BoardingPass3DProps {
  scrollProgress: number; // 0 to 1
  onSelectBooking: () => void;
}

export const BoardingPass3D: React.FC<BoardingPass3DProps> = ({ scrollProgress, onSelectBooking }) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  // Compute split factor based on scroll progress near final section
  const splitProgress = Math.max(0, Math.min(1, (scrollProgress - 0.94) / 0.05));
  const splitOffset = splitProgress * 24; // Pixels ticket stub splits apart

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: x * 15, y: -y * 15 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: '1200px',
        width: '100%',
        maxWidth: '750px',
        margin: '0 auto',
      }}
    >
      <div
        style={{
          transform: `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
          transition: 'transform 0.15s ease-out',
          display: 'flex',
          gap: '4px',
          filter: 'drop-shadow(0 30px 60px rgba(0, 242, 254, 0.25))',
        }}
      >
        {/* Main Ticket Body */}
        <div
          style={{
            flex: 1.8,
            background: 'linear-gradient(135deg, #0e1e38 0%, #07111f 100%)',
            border: '1px solid rgba(0, 242, 254, 0.4)',
            borderRight: '2px dashed rgba(255, 255, 255, 0.2)',
            borderRadius: '20px 0 0 20px',
            padding: '32px',
            transform: `translateX(-${splitOffset}px)`,
            transition: 'transform 0.3s ease',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Top Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.4rem' }}>✈</span>
              <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#ffffff', letterSpacing: '1px' }}>
                AVIQORA AIRWAYS
              </span>
            </div>
            <div
              style={{
                background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
                color: '#040914',
                fontWeight: 900,
                padding: '4px 14px',
                borderRadius: '12px',
                fontSize: '0.8rem',
                letterSpacing: '1px',
              }}
            >
              BOARDING PASS
            </div>
          </div>

          {/* Route Display */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#00f2fe' }}>IST</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>İstanbul (İGA)</div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1rem', color: '#64748b' }}>──────►</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f8fafc', marginTop: '4px' }}>TK1984</div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#00f2fe' }}>LHR</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Londra Heathrow</div>
            </div>
          </div>

          {/* Info Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>YOLCU</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>YILMAZ / AHMET</div>
            </div>

            <div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>KOLTUK</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#10b981' }}>14A</div>
            </div>

            <div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>KAPI / SAAT</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>B12 • 09:45</div>
            </div>
          </div>
        </div>

        {/* Detachable Stub Section */}
        <div
          style={{
            flex: 0.9,
            background: 'linear-gradient(135deg, #112440 0%, #0a1729 100%)',
            border: '1px solid rgba(0, 242, 254, 0.4)',
            borderLeft: 'none',
            borderRadius: '0 20px 20px 0',
            padding: '32px 24px',
            transform: `translateX(${splitOffset}px)`,
            transition: 'transform 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', letterSpacing: '1px' }}>PNR KODU</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#00f2fe', letterSpacing: '2px', marginTop: '2px' }}>
              AVQ198
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>SINIF</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>BUSINESS CLASS</div>
          </div>

          <button
            onClick={onSelectBooking}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
              color: '#040914',
              fontWeight: 800,
              fontSize: '0.8rem',
              border: 'none',
              padding: '10px',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            BİLET AL ➔
          </button>
        </div>
      </div>
    </div>
  );
};
