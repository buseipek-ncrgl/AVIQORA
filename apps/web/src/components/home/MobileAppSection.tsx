import React from 'react';
import { Smartphone, QrCode, CheckCircle, BellRing, Download } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export const MobileAppSection: React.FC = () => {
  const { language } = useLanguage();
  const isTr = language === 'tr';

  return (
    <section style={{ padding: 'clamp(56px, 8vw, 96px) clamp(16px, 4vw, 32px)', backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)' }}>
      <div
        className="corporate-card"
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: 'clamp(32px, 5vw, 56px) clamp(24px, 4vw, 48px)',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: '24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '48px',
          alignItems: 'center',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--brand-accent)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Smartphone size={16} /> {isTr ? 'AVIQORA MOBİL UYGULAMA' : 'AVIQORA MOBILE APP'}
          </span>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, color: 'var(--text-primary)', margin: '8px 0 16px 0' }}>
            {isTr ? 'Yolculuğun Her Anında Yanında.' : 'With You Every Step of the Journey.'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', lineHeight: 1.6, marginBottom: '24px' }}>
            {isTr
              ? 'AVIQORA mobil uygulaması ile biletini saniyeler içinde rezerve et, hızlı check-in yap ve kapı (gate) değişikliklerini anlık bildirimlerle takip et.'
              : 'Book tickets in seconds, check in on the go, and track live gate changes with instant notifications using the AVIQORA app.'}
          </p>

          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.94rem', color: 'var(--text-primary)', fontWeight: 700 }}>
              <CheckCircle size={18} style={{ color: '#059669', flexShrink: 0 }} />
              {isTr ? 'Dijital Biniş Kartı & Mobil Check-in' : 'Digital Boarding Pass & Mobile Check-in'}
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.94rem', color: 'var(--text-primary)', fontWeight: 700 }}>
              <BellRing size={18} style={{ color: 'var(--brand-accent)', flexShrink: 0 }} />
              {isTr ? 'Anlık Uçuş Statüsü & Kapı Değişikliği Bildirimleri' : 'Instant Flight Status & Gate Change Alerts'}
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.94rem', color: 'var(--text-primary)', fontWeight: 700 }}>
              <CheckCircle size={18} style={{ color: '#059669', flexShrink: 0 }} />
              {isTr ? 'Mobil Uygulamaya Özel Ekstra Mil Puanı' : 'App-Exclusive Bonus Miles Points'}
            </li>
          </ul>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <button className="btn-brand" style={{ padding: '12px 20px', borderRadius: '12px', fontSize: '0.88rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <Download size={16} /> {isTr ? "App Store'dan İndir" : 'Download on App Store'}
            </button>
            <button className="btn-outline" style={{ padding: '12px 20px', borderRadius: '12px', fontSize: '0.88rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <Download size={16} /> {isTr ? "Google Play'den İndir" : 'Get it on Google Play'}
            </button>
          </div>
        </div>

        {/* QR Code & Phone Mockup Box */}
        <div
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '20px',
            padding: '36px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '16px', boxShadow: 'var(--shadow-md)', color: '#000000' }}>
            <QrCode size={120} />
          </div>
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {isTr ? 'Uygulamayı İndirmek İçin Okutun' : 'Scan to Download the App'}
            </h4>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {isTr
                ? 'Kameranızı QR koda tutarak iOS & Android uygulamasını ücretsiz indirin.'
                : 'Point your camera at the QR code to download the free iOS & Android app.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
