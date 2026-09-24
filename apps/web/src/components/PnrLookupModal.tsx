'use client';

import React, { useState } from 'react';
import { BookingDto } from '@/types/api';
import { api } from '@/lib/api';
import { Search, AlertCircle, X, CheckCircle, Utensils, Plane, Ticket, ArrowRight, RotateCcw, ShieldCheck } from 'lucide-react';

interface PnrLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookingFound: (booking: BookingDto) => void;
}

const MEAL_OPTIONS = [
  { id: 'standard', name: 'Standart Uçuş İkramı (Ücretsiz)', icon: '🍱' },
  { id: 'beef', name: 'Chef Signature Beef & Truffle Risotto', icon: '🥩' },
  { id: 'chicken', name: 'Akdeniz Soslu Izgara Tavuk & Kuşkonmaz', icon: '🍗' },
  { id: 'vegan', name: 'Gurme Vejetaryen & Avokadolu Yeşil Bowl', icon: '🥗' },
];

export const PnrLookupModal: React.FC<PnrLookupModalProps> = ({ isOpen, onClose, onBookingFound }) => {
  const [pnrCode, setPnrCode] = useState('');
  const [surname, setSurname] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Active Lookup Result
  const [foundBooking, setFoundBooking] = useState<BookingDto | null>(null);
  const [selectedMeal, setSelectedMeal] = useState(MEAL_OPTIONS[0].name);
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  if (!isOpen) return null;

  const handleResetSearch = () => {
    setFoundBooking(null);
    setPnrCode('');
    setSurname('');
    setError(null);
  };

  const handleCloseModal = () => {
    handleResetSearch();
    onClose();
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    setFoundBooking(null);

    try {
      const booking = await api.bookings.getByPnr(pnrCode.trim().toUpperCase());
      setFoundBooking(booking);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'PNR bulunamadı.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePerformCheckIn = async () => {
    if (!foundBooking) return;
    setIsCheckingIn(true);
    setError(null);

    try {
      const updatedBooking = await api.bookings.checkIn(foundBooking.pnrCode, selectedMeal);
      setFoundBooking(updatedBooking);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Check-in yapılamadı.');
    } finally {
      setIsCheckingIn(false);
    }
  };

  const isAlreadyCheckedIn = foundBooking?.status === 'CheckedIn' || foundBooking?.isCheckedIn === true;

  return (
    <div className="modal-overlay" onClick={handleCloseModal}>
      <div
        className="corporate-card"
        style={{
          width: '100%',
          maxWidth: '520px',
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
          <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Search size={18} style={{ color: 'var(--brand-accent)' }} /> PNR Bilet & Online Check-in
          </h3>
          <button onClick={handleCloseModal} className="btn-outline" style={{ padding: '4px 8px' }}>
            <X size={16} />
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--brand-red)', padding: '10px 12px', borderRadius: '8px', marginBottom: '14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {!foundBooking ? (
          <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                PNR Kodu (Örn: AVQ-9842)
              </label>
              <input
                type="text"
                required
                className="input-corporate"
                placeholder="AVQ-9842"
                style={{ textTransform: 'uppercase', letterSpacing: '2px', textAlign: 'center', fontSize: '1.05rem', fontWeight: 800, height: '44px' }}
                value={pnrCode}
                onChange={(e) => setPnrCode(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                Yolcu Soyadı
              </label>
              <input
                type="text"
                required
                className="input-corporate"
                placeholder="YILMAZ"
                style={{ textTransform: 'uppercase', fontSize: '0.9rem', fontWeight: 700, height: '42px' }}
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-brand" style={{ width: '100%', height: '44px', marginTop: '6px' }} disabled={isLoading}>
              {isLoading ? 'Sorgulanıyor...' : 'Bileti ve Uçuşu Getir'}
            </button>
          </form>
        ) : (
          <div>
            {/* Found Booking Card */}
            <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--brand-accent)' }}>
                  PNR: {foundBooking.pnrCode}
                </span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isAlreadyCheckedIn ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: isAlreadyCheckedIn ? '#10b981' : '#f59e0b',
                  }}
                >
                  ● {isAlreadyCheckedIn ? 'CHECK-IN TAMAMLANDI' : 'ONAYLI (CHECK-IN BEKLİYOR)'}
                </span>
              </div>

              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '4px' }}>
                {foundBooking.departureAirport} ➔ {foundBooking.arrivalAirport} ({foundBooking.flightNumber})
              </div>

              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Koltuk: <strong style={{ color: 'var(--brand-accent)' }}>{foundBooking.passengers[0]?.seatCode || '1A'}</strong> • Yolcu: {foundBooking.passengers[0]?.passengerName}
              </div>

              {foundBooking.boardingGate && (
                <div style={{ display: 'flex', gap: '14px', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                  <span>Kapı: <strong style={{ color: 'var(--text-primary)' }}>{foundBooking.boardingGate}</strong></span>
                  <span>Terminal: <strong style={{ color: 'var(--text-primary)' }}>{foundBooking.terminal}</strong></span>
                </div>
              )}
            </div>

            {/* Check-in Actions or Completed Message */}
            {!isAlreadyCheckedIn ? (
              <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Utensils size={15} style={{ color: 'var(--brand-accent)' }} /> Uçuş İçi Yemek Tercihi (İsteğe Bağlı)
                </h4>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                  Uçuşunuzda özel bir menü tercih etmiyorsanız değiştirmeden direkt online check-in yapabilirsiniz.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                  {MEAL_OPTIONS.map((m) => (
                    <label
                      key={m.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: selectedMeal === m.name ? 'rgba(37, 99, 235, 0.1)' : 'var(--bg-secondary)',
                        border: selectedMeal === m.name ? '1px solid var(--brand-accent)' : '1px solid var(--border-color)',
                        cursor: 'pointer',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                      }}
                    >
                      <input
                        type="radio"
                        name="meal"
                        checked={selectedMeal === m.name}
                        onChange={() => setSelectedMeal(m.name)}
                      />
                      <span>{m.icon} {m.name}</span>
                    </label>
                  ))}
                </div>

                <button
                  type="button"
                  className="btn-brand"
                  style={{ width: '100%', height: '42px', gap: '8px', fontSize: '0.85rem' }}
                  onClick={handlePerformCheckIn}
                  disabled={isCheckingIn}
                >
                  <Plane size={15} /> {isCheckingIn ? 'Check-in Yapılıyor...' : 'Online Check-in Yap'}
                </button>
              </div>
            ) : (
              <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', color: '#10b981', padding: '14px', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: '0.82rem' }}>
                <div style={{ fontWeight: 900, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
                  <ShieldCheck size={18} /> Online Check-in Tamamlandı
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '4px', lineHeight: 1.4 }}>
                  Bu bilet için online check-in işlemi önceden başarıyla gerçekleştirilmiştir. Biniş kartınızı görüntüleyebilir veya cihazınıza indirebilirsiniz.
                </div>
                {(foundBooking.mealPreference || selectedMeal) && (
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-gold)', marginTop: '6px' }}>
                    Tanımlı Yemek Menüsü: {foundBooking.mealPreference || selectedMeal}
                  </div>
                )}
              </div>
            )}

            {/* View Boarding Pass CTA & Reset Search */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                className="btn-brand"
                style={{ width: '100%', height: '44px', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', gap: '8px', fontSize: '0.85rem' }}
                onClick={() => {
                  onBookingFound(foundBooking);
                  handleCloseModal();
                }}
              >
                <Ticket size={16} style={{ color: 'var(--brand-accent)' }} /> Biniş Kartını Görüntüle / PDF İndir <ArrowRight size={15} />
              </button>

              <button
                type="button"
                className="btn-outline"
                style={{ width: '100%', height: '38px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                onClick={handleResetSearch}
              >
                <RotateCcw size={14} /> Farklı Bir PNR / Bilet Sorgula
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
