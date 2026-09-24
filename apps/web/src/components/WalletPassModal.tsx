'use client';

import React, { useState } from 'react';
import { X, QrCode, Download, CheckCircle2, Smartphone, ShieldCheck, Sparkles } from 'lucide-react';

interface WalletPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  pnrCode: string;
  passengerName: string;
  flightNumber: string;
  route: string;
  seatCode: string;
  boardingTime: string;
  gate: string;
}

export const WalletPassModal: React.FC<WalletPassModalProps> = ({
  isOpen,
  onClose,
  pnrCode,
  passengerName,
  flightNumber,
  route,
  seatCode,
  boardingTime,
  gate,
}) => {
  const [downloadedFormat, setDownloadedFormat] = useState<'apple' | 'google' | null>(null);

  if (!isOpen) return null;

  const handleDownload = (format: 'apple' | 'google') => {
    setDownloadedFormat(format);

    // Create synthetic wallet pass blob download simulation (.pkpass)
    const passData = JSON.stringify({
      formatVersion: 1,
      passTypeIdentifier: 'pass.com.aviqora.boardingpass',
      serialNumber: pnrCode,
      teamIdentifier: 'AVIQORA',
      organizationName: 'AVIQORA Airways',
      description: `AVIQORA Boarding Pass - ${pnrCode}`,
      logoText: 'AVIQORA AIRWAYS',
      boardingPass: {
        transitType: 'PKTransitTypeAir',
        primaryFields: [{ key: 'route', label: 'UÇUŞ ROTASI', value: route }],
        secondaryFields: [
          { key: 'passenger', label: 'YOLCU', value: passengerName },
          { key: 'flight', label: 'SEFER NO', value: flightNumber },
        ],
        auxiliaryFields: [
          { key: 'seat', label: 'KOLTUK', value: seatCode },
          { key: 'gate', label: 'KAPI', value: gate },
          { key: 'time', label: 'BİNİŞ SAATİ', value: boardingTime },
        ],
      },
    }, null, 2);

    const blob = new Blob([passData], { type: format === 'apple' ? 'application/vnd.apple.pkpass' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pnrCode}_BoardingPass.${format === 'apple' ? 'pkpass' : 'json'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="corporate-card"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '28px',
          backgroundColor: 'var(--bg-surface-elevated)',
          borderRadius: 'var(--radius-xl)',
          textAlign: 'center',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--brand-gold)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={14} /> DIGITAL MOBILE WALLET BOARDING PASS
          </div>

          <button onClick={onClose} className="btn-outline" style={{ padding: '4px 8px' }}>
            <X size={16} />
          </button>
        </div>

        {/* Digital Boarding Card Pass Preview */}
        <div
          style={{
            backgroundColor: '#0a1128',
            color: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4)',
            marginBottom: '20px',
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed rgba(255,255,255,0.2)', paddingBottom: '12px', marginBottom: '14px' }}>
            <div style={{ fontWeight: 900, fontSize: '1rem', letterSpacing: '0.1em' }}>AVIQORA AIRWAYS</div>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--brand-gold)', backgroundColor: 'rgba(245, 158, 11, 0.15)', padding: '2px 8px', borderRadius: '4px' }}>
              PASS: {pnrCode}
            </span>
          </div>

          <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--brand-accent)', marginBottom: '12px' }}>
            {route}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.78rem', marginBottom: '16px' }}>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.6)' }}>Yolcu</div>
              <div style={{ fontWeight: 800, color: '#ffffff' }}>{passengerName}</div>
            </div>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.6)' }}>Uçuş Seferi</div>
              <div style={{ fontWeight: 800, color: '#ffffff' }}>{flightNumber}</div>
            </div>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.6)' }}>Koltuk</div>
              <div style={{ fontWeight: 800, color: 'var(--brand-gold)', fontSize: '0.95rem' }}>{seatCode}</div>
            </div>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.6)' }}>Biniş Kapısı & Saat</div>
              <div style={{ fontWeight: 800, color: '#10b981' }}>{gate} • {boardingTime}</div>
            </div>
          </div>

          {/* QR Barcode */}
          <div style={{ backgroundColor: '#ffffff', padding: '12px', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <QrCode size={110} style={{ color: '#000000' }} />
          </div>
        </div>

        {downloadedFormat && (
          <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981', padding: '10px', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} /> Dijital Biniş Kartı {downloadedFormat === 'apple' ? 'Apple Wallet (.pkpass)' : 'Google Wallet'} Formatında İndirildi!
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={() => handleDownload('apple')}
            style={{
              width: '100%',
              height: '46px',
              backgroundColor: '#000000',
              color: '#ffffff',
              borderRadius: 'var(--radius-md)',
              fontWeight: 800,
              fontSize: '0.88rem',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
            }}
          >
            <Smartphone size={18} /> Apple Wallet'a Ekle (.pkpass)
          </button>

          <button
            onClick={() => handleDownload('google')}
            style={{
              width: '100%',
              height: '46px',
              backgroundColor: '#ffffff',
              color: '#000000',
              borderRadius: 'var(--radius-md)',
              fontWeight: 800,
              fontSize: '0.88rem',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
            }}
          >
            <Smartphone size={18} style={{ color: '#ea4335' }} /> Google Wallet'a Ekle (Pass)
          </button>
        </div>
      </div>
    </div>
  );
};
