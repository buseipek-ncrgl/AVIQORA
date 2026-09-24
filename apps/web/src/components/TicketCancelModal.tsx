'use client';

import React, { useState } from 'react';
import { BookingDto } from '@/types/api';
import { api } from '@/lib/api';
import {
  AlertTriangle,
  X,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  Receipt,
  ArrowRight,
  Info,
  Clock,
} from 'lucide-react';

interface TicketCancelModalProps {
  booking: BookingDto;
  onClose: () => void;
  onSuccess: (cancelledBooking: BookingDto) => void;
}

export const TicketCancelModal: React.FC<TicketCancelModalProps> = ({
  booking,
  onClose,
  onSuccess,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refund calculation logic
  const totalPaid = booking.totalAmount;
  const kdvAmount = Math.round((totalPaid * 20) / 120); // 20% KDV included

  const hasInsurance = booking.extraServices?.some((s) => s.includes('İptal Güvencesi'));
  const refundRate = hasInsurance ? 0.85 : 0.7; // 85% with insurance, 70% standard
  const netRefundAmount = Math.round(totalPaid * refundRate);
  const deductionAmount = totalPaid - netRefundAmount;

  const handleConfirmCancel = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const updated = await api.bookings.cancel(booking.pnrCode);
      const cancelledBooking: BookingDto = {
        ...booking,
        status: 'Cancelled',
        refundAmount: netRefundAmount,
        kdvAmount: kdvAmount,
        cancelledAt: new Date().toISOString(),
      };
      setIsProcessing(false);
      onSuccess(cancelledBooking);
    } catch (err: unknown) {
      setIsProcessing(false);
      setError(err instanceof Error ? err.message : 'Bilet iptal işlemi sırasında bir hata oluştu.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="corporate-card"
        style={{
          width: '100%',
          maxWidth: '620px',
          backgroundColor: 'var(--bg-surface-elevated)',
          padding: '32px',
          borderRadius: 'var(--radius-xl)',
          animation: 'modalFadeIn 0.25s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '10px', borderRadius: '12px', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
              <AlertTriangle size={22} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ef4444', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                BİLET İPTAL & İADE TALEBİ
              </span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '2px' }}>
                PNR: {booking.pnrCode}
              </h2>
            </div>
          </div>
          <button className="btn-outline" onClick={onClose} style={{ padding: '6px 12px' }}>
            <X size={16} /> Kapat
          </button>
        </div>

        {error && (
          <div style={{ padding: '12px', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: 'var(--radius-md)', color: '#ef4444', fontSize: '0.85rem', fontWeight: 800, marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {/* Flight summary */}
        <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)' }}>İPTAL EDİLECEK UÇUŞ</div>
          <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {booking.departureAirport} <ArrowRight size={16} style={{ color: 'var(--brand-accent)' }} /> {booking.arrivalAirport} ({booking.flightNumber})
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Yolcu: {booking.passengers[0]?.passengerName} • Koltuk: {booking.passengers[0]?.seatCode}
          </div>
        </div>

        {/* Policy Badge */}
        <div style={{ padding: '14px', backgroundColor: hasInsurance ? 'rgba(16, 185, 129, 0.1)' : 'rgba(217, 119, 6, 0.1)', border: `1px solid ${hasInsurance ? '#10b981' : 'var(--brand-gold)'}`, borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 900, color: hasInsurance ? '#10b981' : 'var(--brand-gold)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={16} />
            {hasInsurance ? '%85 Kesintisiz İptal Güvencesi Aktif' : 'Standart İptal Politikası Uygulanıyor (%70 İade)'}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {hasInsurance
              ? 'Satın aldığınız İptal Süresi Uzatma Paketi sayesinde ödemenizin %85\'i anında kredi kartınıza iade edilecektir.'
              : 'Uçuş saatinize 12 saatten fazla süre olduğu için %70 iade oranından yararlanıyorsunuz.'}
          </div>
        </div>

        {/* Refund Financial Breakdown */}
        <div style={{ padding: '20px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Receipt size={16} style={{ color: 'var(--brand-accent)' }} /> Finansal Döküm & İade Tutarı
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Ödenen Toplam Bilet Ücreti:</span>
              <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>₺{totalPaid.toLocaleString('tr-TR')}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
              <span>Dahil Olan %20 KDV Tutarı:</span>
              <span>₺{kdvAmount.toLocaleString('tr-TR')} (Dahil)</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444' }}>
              <span>Hizmet / Operasyon Kesintisi:</span>
              <span style={{ fontWeight: 800 }}>-₺{deductionAmount.toLocaleString('tr-TR')}</span>
            </div>

            <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '6px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)' }}>KARTA İADE EDİLECEK NET TUTAR:</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#10b981' }}>
                ₺{netRefundAmount.toLocaleString('tr-TR')}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button className="btn-outline" onClick={onClose} disabled={isProcessing} style={{ padding: '12px 20px', fontSize: '0.88rem' }}>
            Vazgeç
          </button>

          <button
            onClick={handleConfirmCancel}
            disabled={isProcessing}
            className="btn-primary"
            style={{
              padding: '12px 24px',
              fontSize: '0.9rem',
              fontWeight: 900,
              backgroundColor: '#ef4444',
              borderColor: '#ef4444',
              gap: '8px',
            }}
          >
            {isProcessing ? (
              <>
                <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                İptal Ediliyor...
              </>
            ) : (
              <>
                <RotateCcw size={16} /> İptali ve ₺{netRefundAmount.toLocaleString('tr-TR')} İadeyi Onayla
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
