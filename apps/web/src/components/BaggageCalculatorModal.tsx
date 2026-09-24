'use client';

import React, { useState } from 'react';
import { Luggage, X, Info, Check, Calculator, Scale, ArrowRight, Search } from 'lucide-react';

interface BaggageCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPnrLookup?: () => void;
}

export const BaggageCalculatorModal: React.FC<BaggageCalculatorModalProps> = ({ isOpen, onClose, onOpenPnrLookup }) => {
  const [flightType, setFlightType] = useState<'domestic' | 'short_int' | 'long_int'>('domestic');
  const [cabinClass, setCabinClass] = useState<'economy' | 'business'>('economy');
  const [loyaltyTier, setLoyaltyTier] = useState<'classic' | 'classic_plus' | 'elite' | 'elite_plus'>('classic');
  const [extraKg, setExtraKg] = useState<number>(5);

  if (!isOpen) return null;

  // Base baggage allowance calculations (matching major flag carriers THY/Emirates)
  let baseCheckedKg = 15;
  if (flightType === 'short_int') baseCheckedKg = cabinClass === 'economy' ? 20 : 35;
  else if (flightType === 'long_int') baseCheckedKg = cabinClass === 'economy' ? 30 : 46;
  else baseCheckedKg = cabinClass === 'economy' ? 15 : 30; // domestic

  // Loyalty Tier Extras
  let loyaltyExtraKg = 0;
  if (loyaltyTier === 'classic_plus') loyaltyExtraKg = 5;
  else if (loyaltyTier === 'elite') loyaltyExtraKg = 10;
  else if (loyaltyTier === 'elite_plus') loyaltyExtraKg = 20;

  const totalCheckedKg = baseCheckedKg + loyaltyExtraKg;

  // Cabin baggage items
  const cabinBaggageText = cabinClass === 'business'
    ? '2 adet Kabin Bagajı (her biri max 8 kg / 55x40x23 cm) + 1 adet Kişisel Eşya (40x30x15 cm)'
    : '1 adet Kabin Bagajı (max 8 kg / 55x40x23 cm) + 1 adet Kişisel Eşya (40x30x15 cm)';

  // Excess baggage per kg rate
  const ratePerKg = flightType === 'domestic' ? 60 : flightType === 'short_int' ? 180 : 350;
  const estimatedExtraPrice = extraKg * ratePerKg;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="corporate-card"
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '85vh',
          overflowY: 'auto',
          padding: '24px 28px',
          backgroundColor: 'var(--bg-surface-elevated)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Luggage size={20} style={{ color: 'var(--brand-accent)' }} /> Bagaj Hakkı & Hesaplama
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              Uçuş tipinize, kabin sınıfınıza ve üyelik statünüze göre bagaj hakkınızı hesaplayın.
            </p>
          </div>
          <button onClick={onClose} className="btn-outline" style={{ padding: '4px 8px', borderRadius: '50%' }}>
            <X size={16} />
          </button>
        </div>

        {/* Existing PNR Quick Banner Link */}
        {onOpenPnrLookup && (
          <div
            onClick={() => {
              onClose();
              onOpenPnrLookup();
            }}
            style={{
              backgroundColor: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 14px',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'var(--transition-fast)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--brand-gold)' }}>
              <Search size={15} /> Mevcut bir biletinize bagaj eklemek istiyorsanız tıklayın
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--brand-gold)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              PNR Sorgula <ArrowRight size={14} />
            </span>
          </div>
        )}

        {/* Filters Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
          
          {/* 1. Uçuş Güzergahı */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
              1. Uçuş Güzergahı
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {[
                { id: 'domestic', label: 'Yurtiçi' },
                { id: 'short_int', label: 'Kısa Mesafe Dış Hat' },
                { id: 'long_int', label: 'Uzak Mesafe Dış Hat' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFlightType(item.id as any)}
                  style={{
                    padding: '8px 6px',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    borderRadius: 'var(--radius-md)',
                    border: flightType === item.id ? '2px solid var(--brand-accent)' : '1px solid var(--border-color)',
                    backgroundColor: flightType === item.id ? 'rgba(37, 99, 235, 0.1)' : 'var(--bg-secondary)',
                    color: flightType === item.id ? 'var(--brand-accent)' : 'var(--text-primary)',
                    cursor: 'pointer',
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Kabin Sınıfı */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
              2. Kabin Sınıfı
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[
                { id: 'economy', label: 'Economy Class', sub: 'Standart Uçuş' },
                { id: 'business', label: 'Business Class', sub: 'Gurme Menü & VIP' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCabinClass(item.id as any)}
                  style={{
                    padding: '10px 12px',
                    textAlign: 'left',
                    borderRadius: 'var(--radius-md)',
                    border: cabinClass === item.id ? '2px solid var(--brand-accent)' : '1px solid var(--border-color)',
                    backgroundColor: cabinClass === item.id ? 'rgba(37, 99, 235, 0.1)' : 'var(--bg-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: cabinClass === item.id ? 'var(--brand-accent)' : 'var(--text-primary)' }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                    {item.sub}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 3. AVIQORA Club Üyelik Statüsü */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
              3. AVIQORA Club Üyelik Statüsü
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
              {[
                { id: 'classic', label: 'Classic', extra: '+0 kg' },
                { id: 'classic_plus', label: 'Classic+', extra: '+5 kg' },
                { id: 'elite', label: 'Elite', extra: '+10 kg' },
                { id: 'elite_plus', label: 'Elite+', extra: '+20 kg' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setLoyaltyTier(item.id as any)}
                  style={{
                    padding: '8px 4px',
                    textAlign: 'center',
                    borderRadius: 'var(--radius-md)',
                    border: loyaltyTier === item.id ? '2px solid var(--brand-accent)' : '1px solid var(--border-color)',
                    backgroundColor: loyaltyTier === item.id ? 'rgba(37, 99, 235, 0.1)' : 'var(--bg-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: loyaltyTier === item.id ? 'var(--brand-accent)' : 'var(--text-primary)' }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--brand-gold)', marginTop: '2px' }}>
                    {item.extra}
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Calculation Summary Card */}
        <div
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px',
            marginBottom: '18px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Scale size={16} style={{ color: 'var(--brand-accent)' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Serbest Bagaj Hakkınız
              </span>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--brand-accent)' }}>
              {totalCheckedKg} KG
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.78rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
              <Check size={15} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>Uçak Altı Bagaj:</strong> {totalCheckedKg} kg (Temel {baseCheckedKg} kg {loyaltyExtraKg > 0 ? `+ Statü Bonusu ${loyaltyExtraKg} kg` : ''})
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
              <Check size={15} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>El / Kabin Bagajı:</strong> {cabinBaggageText}
              </div>
            </div>
          </div>
        </div>

        {/* Excess Baggage Calculator Interactive Slider */}
        <div
          style={{
            backgroundColor: 'rgba(37, 99, 235, 0.04)',
            border: '1px solid rgba(37, 99, 235, 0.2)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calculator size={15} style={{ color: 'var(--brand-accent)' }} /> Ekstra Bagaj Satın Alım Tahmini
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-gold)' }}>
              Birim: {ratePerKg} ₺ / kg
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <input
              type="range"
              min={1}
              max={30}
              step={1}
              value={extraKg}
              onChange={(e) => setExtraKg(parseInt(e.target.value))}
              style={{ flex: 1, accentColor: 'var(--brand-accent)', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)', minWidth: '54px', textAlign: 'right' }}>
              +{extraKg} kg
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed var(--border-color)', paddingTop: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Online İndirimli Toplam Ekstra Ücret:
            </span>
            <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#10b981' }}>
              {estimatedExtraPrice.toLocaleString('tr-TR')} ₺
            </span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px' }}>
            <Info size={13} style={{ color: 'var(--brand-accent)', flexShrink: 0 }} />
            Havalimanında yapılan ödemelere göre online biletleme sırasında eklenen bagajlar %30 daha avantajlıdır.
          </div>
        </div>

        {/* Modal Close CTA */}
        <button
          type="button"
          onClick={onClose}
          className="btn-brand"
          style={{ width: '100%', height: '42px', marginTop: '18px', fontSize: '0.85rem' }}
        >
          Anlaşıldı, Kapat
        </button>
      </div>
    </div>
  );
};
