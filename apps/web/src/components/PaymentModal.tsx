'use client';

import React, { useState } from 'react';
import { BookingDto, FlightDto, SeatDto } from '@/types/api';
import { api } from '@/lib/api';
import { CreditCard, Lock, ShieldCheck, AlertTriangle, X, Sparkles, Plane, Award, Coins } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  flight: FlightDto;
  seat: SeatDto;
  passengerInfo: {
    firstName: string;
    lastName: string;
    identityNumber: string;
    email: string;
  };
  onSuccess: (booking: BookingDto) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  flight,
  seat,
  passengerInfo,
  onSuccess,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'miles'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');
  const [installment, setInstallment] = useState('1');
  const [saveToMyCards, setSaveToMyCards] = useState(false);
  const [savedCardsList, setSavedCardsList] = useState<Array<{ id: string; cardAlias: string; cardHolder: string; brand: string; last4: string; expMonth: string; expYear: string; cvc?: string }>>([]);
  const [selectedSavedCardId, setSelectedSavedCardId] = useState<string>('');
  const [idempotencyKey] = useState(() => `idemp_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`);

  // Load Saved Cards from localStorage
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem('aviqora_saved_cards');
      if (raw) {
        const parsed = JSON.parse(raw);
        setSavedCardsList(parsed);
        if (parsed.length > 0) {
          const def = parsed.find((c: any) => c.isDefault) || parsed[0];
          setSelectedSavedCardId(def.id);
          setCardHolder(def.cardHolder || `${passengerInfo.firstName} ${passengerInfo.lastName}`);
          setCardNumber(`4543 0000 0000 ${def.last4 || '1984'}`);
          setExpiryDate(`${def.expMonth || '12'}/${def.expYear || '28'}`);
          setCvc(def.cvc || '342');
        }
      } else {
        // Fallback default demo cards
        const initialCards = [
          {
            id: 'card-1',
            cardAlias: 'Garanti BBVA Bonus',
            cardHolder: `${passengerInfo.firstName} ${passengerInfo.lastName}`.toUpperCase(),
            brand: 'Mastercard',
            last4: '4543',
            expMonth: '12',
            expYear: '28',
            cvc: '342',
            isDefault: true,
          },
          {
            id: 'card-2',
            cardAlias: 'İş Bankası Maximum',
            cardHolder: `${passengerInfo.firstName} ${passengerInfo.lastName}`.toUpperCase(),
            brand: 'Mastercard',
            last4: '1984',
            expMonth: '08',
            expYear: '29',
            cvc: '781',
            isDefault: false,
          },
        ];
        localStorage.setItem('aviqora_saved_cards', JSON.stringify(initialCards));
        setSavedCardsList(initialCards);
        setSelectedSavedCardId('card-1');
        setCardHolder(initialCards[0].cardHolder);
        setCardNumber('4543 0000 0000 4543');
        setExpiryDate('12/28');
        setCvc('342');
      }
    } catch {
      // Ignore
    }
  }, [passengerInfo.firstName, passengerInfo.lastName]);

  const handleSelectSavedCard = (cardId: string) => {
    setSelectedSavedCardId(cardId);
    if (!cardId) return;
    const found = savedCardsList.find((c) => c.id === cardId);
    if (found) {
      setCardHolder(found.cardHolder || `${passengerInfo.firstName} ${passengerInfo.lastName}`);
      setCardNumber(`4543 0000 0000 ${found.last4 || '4543'}`);
      setExpiryDate(`${found.expMonth || '12'}/${found.expYear || '28'}`);
      setCvc(found.cvc || '342');
    }
  };

  // Miles Engine State
  const [userAvailableMiles] = useState(45000); // User's Miles Balance (VIP Diamond)
  const [milesMode, setMilesMode] = useState<'full' | 'hybrid'>('full');
  const [hybridMilesInput, setHybridMilesInput] = useState<number>(5000); // Hybrid miles used

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Format Card Number (XXXX XXXX XXXX XXXX)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(.{4})/g, '$1 ').trim();
    setCardNumber(formatted);
  };

  // Format Expiry (MM/YY)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      setExpiryDate(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setExpiryDate(raw);
    }
  };

  // Pricing breakdown
  const basePrice = flight.priceAmount;
  const seatPrice = seat.priceAmount || 0;
  const airportTax = 145; // Fixed airport tax
  const totalAmount = basePrice + seatPrice + airportTax;

  // Miles Calculations (10 Miles = 1 ₺)
  const fullMilesRequired = totalAmount * 10;
  const hybridDiscountAmount = Math.floor(hybridMilesInput / 10);
  const hybridRemainingCash = Math.max(0, totalAmount - hybridDiscountAmount);

  const handlePayAndBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setPaymentError(null);

    // Validation for Miles payment
    if (paymentMethod === 'miles' && milesMode === 'full' && userAvailableMiles < fullMilesRequired) {
      setIsProcessing(false);
      setPaymentError(`Bilet için ${fullMilesRequired.toLocaleString('tr-TR')} Mil gereklidir. Bakiyeniz yetersiz (${userAvailableMiles.toLocaleString('tr-TR')} Mil).`);
      return;
    }

    try {
      // Send booking request to C# Backend API
      const newBooking = await api.bookings.create({
        flightId: flight.id,
        passengers: [
          {
            firstName: passengerInfo.firstName,
            lastName: passengerInfo.lastName,
            identityNumber: passengerInfo.identityNumber,
            seatId: seat.id,
            seatCode: seat.seatCode,
          },
        ],
      });

      setIsProcessing(false);
      onSuccess(newBooking);
    } catch (err: unknown) {
      setIsProcessing(false);
      setPaymentError(err instanceof Error ? err.message : 'Ödeme ve biletleme işlemi sırasında bir hata oluştu.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="corporate-card"
        style={{
          width: '100%',
          maxWidth: '920px',
          backgroundColor: 'var(--bg-surface-elevated)',
          padding: '32px',
          borderRadius: 'var(--radius-xl)',
          animation: 'modalFadeIn 0.25s ease-out',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--brand-accent)', letterSpacing: '0.1em', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Lock size={14} /> 256-BIT SSL SECURE CHECKOUT
            </span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Güvenli Ödeme & Ödül Bilet Onayı
            </h2>
          </div>
          <button className="btn-outline" onClick={onClose} style={{ padding: '6px 12px' }}>
            <X size={16} /> Kapat
          </button>
        </div>

        {/* Payment Method Selector Tabs: Credit Card vs Miles */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <button
            onClick={() => setPaymentMethod('card')}
            style={{
              flex: 1,
              padding: '14px 18px',
              borderRadius: 'var(--radius-md)',
              border: paymentMethod === 'card' ? '2px solid var(--brand-accent)' : '1px solid var(--border-color)',
              backgroundColor: paymentMethod === 'card' ? 'rgba(37, 99, 235, 0.08)' : 'var(--bg-secondary)',
              color: paymentMethod === 'card' ? 'var(--brand-accent)' : 'var(--text-secondary)',
              fontWeight: 800,
              fontSize: '0.92rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <CreditCard size={18} /> Kredi / Banka Kartı ile Öde
          </button>

          <button
            onClick={() => setPaymentMethod('miles')}
            style={{
              flex: 1,
              padding: '14px 18px',
              borderRadius: 'var(--radius-md)',
              border: paymentMethod === 'miles' ? '2px solid var(--brand-gold)' : '1px solid var(--border-color)',
              backgroundColor: paymentMethod === 'miles' ? 'rgba(245, 158, 11, 0.1)' : 'var(--bg-secondary)',
              color: paymentMethod === 'miles' ? 'var(--brand-gold)' : 'var(--text-secondary)',
              fontWeight: 800,
              fontSize: '0.92rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <Award size={18} style={{ color: 'var(--brand-gold)' }} /> Miles & Smiles ile Öde (Mil İle Öde / Karma)
          </button>
        </div>

        {paymentError && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--brand-red)', padding: '12px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} /> {paymentError}
          </div>
        )}

        {/* 2-Column Split: Payment Form Left | Order Summary Right */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '32px', alignItems: 'start' }}>
          
          {/* LEFT COLUMN: Payment Inputs (Card OR Miles Engine) */}
          <div>
            {paymentMethod === 'card' ? (
              <>
                {/* Saved Cards Selector Pills */}
                {savedCardsList.length > 0 && (
                  <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '14px 16px', borderRadius: 'var(--radius-md)', marginBottom: '18px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--brand-accent)', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CreditCard size={14} /> Kayıtlı Kartlarımdan Hızlı Seç
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {savedCardsList.map((card) => {
                        const isSelected = selectedSavedCardId === card.id;
                        return (
                          <button
                            key={card.id}
                            type="button"
                            onClick={() => handleSelectSavedCard(card.id)}
                            style={{
                              flex: '1 0 140px',
                              padding: '10px 12px',
                              borderRadius: 'var(--radius-md)',
                              border: isSelected ? '2px solid var(--brand-accent)' : '1px solid var(--border-color)',
                              backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.1)' : 'var(--bg-surface)',
                              color: isSelected ? 'var(--brand-accent)' : 'var(--text-primary)',
                              fontWeight: 800,
                              fontSize: '0.78rem',
                              cursor: 'pointer',
                              textAlign: 'left',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <div style={{ fontSize: '0.82rem', fontWeight: 900 }}>{card.cardAlias || 'Bonus Card'}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                              •••• {card.last4} ({card.expMonth}/{card.expYear})
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Visual Credit Card Preview */}
                <div
                  style={{
                    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                    color: '#ffffff',
                    padding: '24px',
                    borderRadius: 'var(--radius-lg)',
                    marginBottom: '24px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                    position: 'relative',
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 900, letterSpacing: '0.15em', color: 'var(--brand-accent)' }}>
                      AVIQORA CARD
                    </span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                      VISA / MASTERCARD
                    </span>
                  </div>

                  <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.18em', fontFamily: 'monospace', marginBottom: '24px' }}>
                    {cardNumber || '•••• •••• •••• ••••'}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '0.8rem' }}>
                    <div>
                      <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.6 }}>KART SAHİBİ</div>
                      <div style={{ fontWeight: 800, textTransform: 'uppercase' }}>
                        {cardHolder || `${passengerInfo.firstName} ${passengerInfo.lastName}`}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.6 }}>SON KULLANMA</div>
                      <div style={{ fontWeight: 800 }}>{expiryDate || 'MM/YY'}</div>
                    </div>
                  </div>
                </div>

                {/* Credit Card Input Form */}
                <form onSubmit={handlePayAndBook} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>Kart Üzerindeki İsim</label>
                    <input
                      type="text"
                      required
                      placeholder="Ahmet Yılmaz"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      className="input-corporate"
                      style={{ height: '48px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>Kart Numarası</label>
                    <input
                      type="text"
                      required
                      placeholder="4543 0000 0000 0000"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      className="input-corporate"
                      style={{ height: '48px' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>Son Kullanma (AY/YIL)</label>
                      <input
                        type="text"
                        required
                        placeholder="08/28"
                        value={expiryDate}
                        onChange={handleExpiryChange}
                        className="input-corporate"
                        style={{ height: '48px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>Güvenlik Kodu (CVC)</label>
                      <input
                        type="text"
                        required
                        maxLength={4}
                        placeholder="342"
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value.slice(0, 4))}
                        className="input-corporate"
                        style={{ height: '48px' }}
                      />
                    </div>
                  </div>

                  {/* Installment Choice */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>Taksit Seçeneği</label>
                    <select
                      value={installment}
                      onChange={(e) => setInstallment(e.target.value)}
                      className="input-corporate"
                      style={{ height: '48px' }}
                    >
                      <option value="1">Tek Çekim — ₺{totalAmount.toLocaleString('tr-TR')}</option>
                      <option value="3">3 Taksit — ₺{Math.round(totalAmount / 3).toLocaleString('tr-TR')} x 3 Ay</option>
                      <option value="6">6 Taksit — ₺{Math.round(totalAmount / 6).toLocaleString('tr-TR')} x 6 Ay</option>
                    </select>
                  </div>

                  {/* Save to My Cards Checkbox */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <input
                      type="checkbox"
                      id="saveCardCb"
                      checked={saveToMyCards}
                      onChange={(e) => setSaveToMyCards(e.target.checked)}
                      style={{ accentColor: 'var(--brand-accent)', width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <label htmlFor="saveCardCb" style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', cursor: 'pointer' }}>
                      Bu kartı sonraki ödemelerim için Kayıtlı Kartlarıma Ekle
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="btn-brand"
                    disabled={isProcessing}
                    style={{ width: '100%', height: '52px', marginTop: '12px', fontSize: '1rem' }}
                  >
                    {isProcessing ? 'Ödeme İletiliyor & Bilet Üretiliyor...' : `₺${totalAmount.toLocaleString('tr-TR')} Öde ve Bilet Al`}
                  </button>
                </form>
              </>
            ) : (
              /* MILES ENGINE PAY WITH MILES UI */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Miles Balance Header Card */}
                <div
                  style={{
                    background: 'linear-gradient(135deg, #78350f 0%, #451a03 100%)',
                    color: '#ffffff',
                    padding: '20px',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid rgba(245, 158, 11, 0.4)',
                    boxShadow: '0 10px 20px rgba(245, 158, 11, 0.15)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--brand-gold)', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Coins size={14} /> MILES & SMILES BAKİYESİ
                    </span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, backgroundColor: 'rgba(255,255,255,0.15)', padding: '3px 10px', borderRadius: '12px' }}>
                      VIP DIAMOND UYE
                    </span>
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#fbbf24', letterSpacing: '0.02em' }}>
                    {userAvailableMiles.toLocaleString('tr-TR')} <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fef3c7' }}>MIL</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#fde68a', marginTop: '4px' }}>
                    10 Mil = ₺1 Oranında Tüm İçi ve Dış Uçuşlarda Geçerli Ödül Bilet Engine
                  </div>
                </div>

                {/* Miles Mode Selector: 100% Miles vs Hybrid Para+Mil */}
                <form onSubmit={handlePayAndBook} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>Ödeme Yöntemi Modu</div>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px',
                      borderRadius: 'var(--radius-md)',
                      border: milesMode === 'full' ? '2px solid var(--brand-gold)' : '1px solid var(--border-color)',
                      backgroundColor: milesMode === 'full' ? 'rgba(245, 158, 11, 0.06)' : 'var(--bg-secondary)',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="milesMode"
                      checked={milesMode === 'full'}
                      onChange={() => setMilesMode('full')}
                    />
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                        %100 Ödül Mil İle Öde ({fullMilesRequired.toLocaleString('tr-TR')} Mil)
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                        Nakit ₺0 Ödeme — Tüm bilet tutarı Mil bakiyenizden düşülür.
                      </div>
                    </div>
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px',
                      borderRadius: 'var(--radius-md)',
                      border: milesMode === 'hybrid' ? '2px solid var(--brand-gold)' : '1px solid var(--border-color)',
                      backgroundColor: milesMode === 'hybrid' ? 'rgba(245, 158, 11, 0.06)' : 'var(--bg-secondary)',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="milesMode"
                      checked={milesMode === 'hybrid'}
                      onChange={() => setMilesMode('hybrid')}
                    />
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                        Karma Ödeme (Para + Mil)
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                        İstediğiniz kadar Mil kullanarak bilet fiyatından indirim kazanın.
                      </div>
                    </div>
                  </label>

                  {/* Hybrid Slider Input */}
                  {milesMode === 'hybrid' && (
                    <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 800 }}>
                        <span>Kullanılacak Mil Miktarı:</span>
                        <span style={{ color: 'var(--brand-gold)' }}>{hybridMilesInput.toLocaleString('tr-TR')} Mil (₺{hybridDiscountAmount} İndirim)</span>
                      </div>
                      <input
                        type="range"
                        min="1000"
                        max={Math.min(userAvailableMiles, fullMilesRequired)}
                        step="500"
                        value={hybridMilesInput}
                        onChange={(e) => setHybridMilesInput(Number(e.target.value))}
                        style={{ width: '100%', accentColor: 'var(--brand-gold)' }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        <span>Min: 1.000 Mil (₺100)</span>
                        <span>Kalan Nakit Ödeme: ₺{hybridRemainingCash.toLocaleString('tr-TR')}</span>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn-brand"
                    disabled={isProcessing}
                    style={{
                      width: '100%',
                      height: '52px',
                      marginTop: '12px',
                      fontSize: '1rem',
                      backgroundColor: 'var(--brand-gold)',
                      borderColor: 'var(--brand-gold)',
                      color: '#000000',
                      fontWeight: 900,
                    }}
                  >
                    {isProcessing
                      ? 'Mil İşleniyor & Bilet Üretiliyor...'
                      : milesMode === 'full'
                      ? `${fullMilesRequired.toLocaleString('tr-TR')} Mil İle Bilet Al`
                      : `${hybridMilesInput.toLocaleString('tr-TR')} Mil + ₺${hybridRemainingCash.toLocaleString('tr-TR')} İle Bilet Al`}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Order Summary Card */}
          <div
            className="corporate-card"
            style={{
              padding: '28px',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
            }}
          >
            <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plane size={18} style={{ color: 'var(--brand-accent)' }} /> Bilet & Uçuş Özeti
            </h3>

            {/* Flight info */}
            <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--brand-accent)' }}>
                SEFER {flight.flightNumber} ({flight.aircraftModel})
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '2px' }}>
                {flight.departureAirportCode} ➔ {flight.arrivalAirportCode}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {flight.departureAirportName} ➔ {flight.arrivalAirportName}
              </div>
            </div>

            {/* Passenger info */}
            <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Yolcu Bilgileri</div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                {passengerInfo.firstName} {passengerInfo.lastName}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                T.C./Pasaport: {passengerInfo.identityNumber}
              </div>
            </div>

            {/* Price breakdown table */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Taban Uçuş Ücreti</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>₺{basePrice.toLocaleString('tr-TR')}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Koltuk Seçim Ücreti ({seat.seatCode})</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>₺{seatPrice.toLocaleString('tr-TR')}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Havalimanı Harç & Vergiler</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>₺{airportTax.toLocaleString('tr-TR')}</span>
              </div>

              {paymentMethod === 'miles' && milesMode === 'hybrid' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--brand-gold)', fontWeight: 800 }}>
                  <span>Mil İndirimi ({hybridMilesInput.toLocaleString('tr-TR')} Mil)</span>
                  <span>-₺{hybridDiscountAmount.toLocaleString('tr-TR')}</span>
                </div>
              )}
            </div>

            {/* Total Summary */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '16px',
                borderTop: '2px dashed var(--border-color)',
                marginBottom: '16px',
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>TOPLAM ÖDENECEK</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: paymentMethod === 'miles' ? 'var(--brand-gold)' : '#059669' }}>
                  {paymentMethod === 'miles'
                    ? milesMode === 'full'
                      ? `${fullMilesRequired.toLocaleString('tr-TR')} Mil`
                      : `${hybridMilesInput.toLocaleString('tr-TR')} Mil + ₺${hybridRemainingCash.toLocaleString('tr-TR')}`
                    : `₺${totalAmount.toLocaleString('tr-TR')}`}
                </div>
              </div>

              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={16} /> 3D SECURE ONAYLI
              </span>
            </div>

            {/* Idempotency Guard Protection Badge */}
            <div
              style={{
                backgroundColor: 'rgba(37, 99, 235, 0.08)',
                border: '1px solid rgba(37, 99, 235, 0.2)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.73rem',
                color: 'var(--brand-accent)',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock size={12} /> IDEMPOTENCY GUARD
              </div>
              <span style={{ fontFamily: 'monospace', opacity: 0.8 }}>Key: {idempotencyKey.slice(0, 14)}...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
