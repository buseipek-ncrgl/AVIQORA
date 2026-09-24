'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PaymentModal } from '@/components/PaymentModal';
import { SeatMap } from '@/components/SeatMap';
import { BoardingPassModal } from '@/components/BoardingPassModal';
import { Cabin3DModal } from '@/components/Cabin3DModal';
import { FlightDto, SeatDto, BookingDto } from '@/types/api';
import { api, MOCK_FLIGHTS } from '@/lib/api';
import { useCurrency } from '@/context/CurrencyContext';
import { getSavedPassengers, upsertSavedPassenger, SavedPassenger } from '@/lib/savedPassengers';
import { CustomSelect } from '@/components/CustomSelect';
import { ArrowLeft, CheckCircle2, Plane, ShieldCheck, User, CreditCard, ChevronRight, Armchair, Sparkles, Luggage, AlertTriangle, Users, Check } from 'lucide-react';

function isValidTCKN(tc: string): boolean {
  if (!tc) return false;
  const clean = tc.trim();
  if (clean.length !== 11 || !/^\d{11}$/.test(clean) || clean[0] === '0') return false;
  const digits = clean.split('').map(Number);
  const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const evenSum = digits[1] + digits[3] + digits[5] + digits[7];
  const calcD10 = (oddSum * 7 - evenSum) % 10;
  const expectedD10 = calcD10 < 0 ? calcD10 + 10 : calcD10;
  if (expectedD10 !== digits[9]) return false;
  const sumFirst10 = digits.slice(0, 10).reduce((a, b) => a + b, 0);
  if (sumFirst10 % 10 !== digits[10]) return false;
  return true;
}

const DEFAULT_SAVED_CARDS = [
  {
    id: 'card-default-1',
    cardAlias: 'Garanti BBVA Bonus',
    cardHolder: 'AHMET YILMAZ',
    brand: 'Mastercard',
    last4: '4543',
    expMonth: '12',
    expYear: '28',
    cvc: '342',
  },
  {
    id: 'card-default-2',
    cardAlias: 'İş Bankası Maximum',
    cardHolder: 'AHMET YILMAZ',
    brand: 'Visa',
    last4: '8821',
    expMonth: '09',
    expYear: '27',
    cvc: '519',
  },
];

export default function CheckoutClient() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { formatPrice } = useCurrency();
  const flightId = (params?.flightId as string) || 'f-dom-1';
  const fareTierParam = searchParams.get('fare') || 'eco';

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  const [flight, setFlight] = useState<FlightDto | null>(null);
  const [seats, setSeats] = useState<SeatDto[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<SeatDto | null>(null);
  const [isLoadingSeats, setIsLoadingSeats] = useState(false);

  // Passenger form state
  const [savedPassengersList, setSavedPassengersList] = useState<SavedPassenger[]>([]);
  const [selectedSavedPassId, setSelectedSavedPassId] = useState<string>('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [identityNumber, setIdentityNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isForeignPassport, setIsForeignPassport] = useState(false);
  const [saveToMyPassengers, setSaveToMyPassengers] = useState(true);
  const [tcError, setTcError] = useState<string | null>(null);
  const [extraBaggage, setExtraBaggage] = useState<'none' | '10kg' | '20kg'>('none');

  // Extra Services & Guarantee Packages
  const [isRefundGuaranteeSelected, setIsRefundGuaranteeSelected] = useState(true);
  const [isFastTrackSelected, setIsFastTrackSelected] = useState(false);
  const [isSmsTrackingSelected, setIsSmsTrackingSelected] = useState(false);

  // Inline Payment State
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'miles'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');
  const [installment, setInstallment] = useState('1');
  const [saveToMyCards, setSaveToMyCards] = useState(false);
  const [savedCardsList, setSavedCardsList] = useState<Array<{ id: string; cardAlias: string; cardHolder: string; brand: string; last4: string; expMonth: string; expYear: string; cvc?: string }>>([]);
  const [selectedSavedCardId, setSelectedSavedCardId] = useState<string>('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Miles Engine
  const [userAvailableMiles] = useState(45000);
  const [milesMode, setMilesMode] = useState<'full' | 'hybrid'>('full');
  const [hybridMilesInput, setHybridMilesInput] = useState<number>(5000);

  // Modal states
  const [is3DCabinOpen, setIs3DCabinOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [activeBoardingPass, setActiveBoardingPass] = useState<BookingDto | null>(null);

  useEffect(() => {
    // Load saved passengers
    const passList = getSavedPassengers();
    setSavedPassengersList(passList);

    // Load saved cards
    try {
      const rawCards = localStorage.getItem('aviqora_saved_cards');
      if (rawCards) {
        const parsed = JSON.parse(rawCards);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSavedCardsList(parsed);
        } else {
          setSavedCardsList(DEFAULT_SAVED_CARDS);
          localStorage.setItem('aviqora_saved_cards', JSON.stringify(DEFAULT_SAVED_CARDS));
        }
      } else {
        setSavedCardsList(DEFAULT_SAVED_CARDS);
        localStorage.setItem('aviqora_saved_cards', JSON.stringify(DEFAULT_SAVED_CARDS));
      }
    } catch {
      setSavedCardsList(DEFAULT_SAVED_CARDS);
    }

    // Auto-fill logged-in or saved profile info
    try {
      const rawProf = localStorage.getItem('aviqora_saved_profile');
      if (rawProf) {
        const parsed = JSON.parse(rawProf);
        if (parsed.fullName) {
          const parts = parsed.fullName.split(' ');
          setFirstName(parts[0] || '');
          setLastName(parts.slice(1).join(' ') || '');
        }
        if (parsed.identityNo) setIdentityNumber(parsed.identityNo);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.phone) setPhone(parsed.phone);
      } else if (passList.length > 0) {
        const selfPass = passList.find(p => p.relation === 'Kendi Hesabım') || passList[0];
        setFirstName(selfPass.firstName);
        setLastName(selfPass.lastName);
        setIdentityNumber(selfPass.identityNo);
      }
    } catch {
      // Ignore fallback
    }

    // Find flight by ID or fallback
    const foundFlight = MOCK_FLIGHTS.find((f) => f.id === flightId) || MOCK_FLIGHTS[0];
    setFlight(foundFlight);

    // Fetch seats
    const fetchSeats = async () => {
      setIsLoadingSeats(true);
      try {
        const fetchedSeats = await api.flights.getSeats(foundFlight.id);
        setSeats(fetchedSeats);
        const freeSeat = fetchedSeats.find((s) => s.isAvailable);
        if (freeSeat) setSelectedSeat(freeSeat);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingSeats(false);
      }
    };

    fetchSeats();
  }, [flightId]);

  if (!flight) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  // Handle selecting a saved passenger
  const handleSelectSavedPassenger = (id: string) => {
    setSelectedSavedPassId(id);
    setTcError(null);
    if (!id) return;
    const found = savedPassengersList.find(p => p.id === id);
    if (found) {
      setFirstName(found.firstName);
      setLastName(found.lastName);
      setIdentityNumber(found.identityNo);
    }
  };

  // Helper to validate step 1 passenger fields
  const validateStep1Info = (): { isValid: boolean; errorMsg?: string } => {
    setTcError(null);
    if (!firstName.trim()) {
      return { isValid: false, errorMsg: 'Lütfen Yolcu Adı (Ad) alanını doldurunuz.' };
    }
    if (!lastName.trim()) {
      return { isValid: false, errorMsg: 'Lütfen Yolcu Soyadı (Soyad) alanını doldurunuz.' };
    }
    if (!identityNumber.trim()) {
      return { isValid: false, errorMsg: `Lütfen ${isForeignPassport ? 'Pasaport' : 'T.C. Kimlik'} Numarası alanını doldurunuz.` };
    }
    if (!email.trim()) {
      return { isValid: false, errorMsg: 'Lütfen E-Posta Adresi alanını doldurunuz.' };
    }
    if (!isForeignPassport && !isValidTCKN(identityNumber)) {
      const msg = 'Geçersiz T.C. Kimlik Numarası. Lütfen 11 haneli geçerli T.C. Kimlik numaranızı doğrulayınız.';
      setTcError(msg);
      return { isValid: false, errorMsg: msg };
    }
    return { isValid: true };
  };

  // Handle Step 1 submit
  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    const val = validateStep1Info();
    if (!val.isValid) {
      alert(val.errorMsg);
      return;
    }

    // Upsert to saved passengers if checked
    if (saveToMyPassengers) {
      upsertSavedPassenger({
        fullName: `${firstName.trim()} ${lastName.trim()}`,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        identityNo: identityNumber.trim(),
        gender: 'Erkek',
        birthDate: '1992-05-14',
        relation: 'Kendi Hesabım'
      });
    }

    setCurrentStep(2);
  };

  // Handle Step 2 submit
  const handleStep2Next = () => {
    if (!selectedSeat) {
      handleSkipSeatSelection();
    } else {
      setCurrentStep(3);
    }
  };

  // Skip Seat selection (Auto-assign at check-in for 0 TL)
  const handleSkipSeatSelection = () => {
    const autoSeat: SeatDto = {
      id: 'seat-auto',
      seatCode: 'Otomatik Atanacak (₺0)',
      seatClass: 'Economy',
      isAvailable: true,
      status: 'Available',
      priceAmount: 0,
      priceCurrency: 'TRY',
    };
    setSelectedSeat(autoSeat);
    setCurrentStep(3);
  };

  const handleSelectSavedCardInline = (cardId: string) => {
    setSelectedSavedCardId(cardId);
    if (!cardId) return;
    const found = savedCardsList.find((c) => c.id === cardId);
    if (found) {
      setCardHolder(found.cardHolder || `${firstName} ${lastName}`);
      setCardNumber(`4543 0000 0000 ${found.last4 || '4543'}`);
      setExpiryDate(`${found.expMonth || '12'}/${found.expYear || '28'}`);
      setCvc(found.cvc || '342');
    }
  };

  const handleInlinePayAndBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError(null);

    // Enforce passenger info validation at payment time
    const val = validateStep1Info();
    if (!val.isValid) {
      setPaymentError(`Ödeme Yapılamadı: ${val.errorMsg}`);
      setCurrentStep(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!cardHolder.trim() || !cardNumber.trim() || !expiryDate.trim() || !cvc.trim()) {
      setPaymentError('Lütfen kart üzerindeki isim, kart numarası, son kullanma tarihi ve CVC alanlarını eksiksiz doldurunuz.');
      return;
    }

    setIsProcessingPayment(true);

    const activeSeat = selectedSeat || {
      id: 'seat-auto',
      seatCode: 'Otomatik Atanacak (₺0)',
      seatClass: 'Economy',
      isAvailable: true,
      status: 'Available',
      priceAmount: 0,
      priceCurrency: 'TRY',
    };

    try {
      if (saveToMyCards && cardNumber) {
        const last4 = cardNumber.replace(/\s/g, '').slice(-4) || '4543';
        const parts = expiryDate.split('/');
        const expMonth = parts[0] || '12';
        const expYear = parts[1] || '28';
        const newCardObj = {
          id: `card-${Date.now()}`,
          cardAlias: 'Yeni Eklenen Kart',
          cardHolder: (cardHolder || `${firstName} ${lastName}`).toUpperCase(),
          brand: 'Mastercard',
          last4,
          expMonth,
          expYear,
          cvc: cvc || '342',
          isDefault: false,
          token: `tok_masterpass_${Date.now()}`,
        };
        const updatedCards = [...savedCardsList, newCardObj];
        localStorage.setItem('aviqora_saved_cards', JSON.stringify(updatedCards));
        setSavedCardsList(updatedCards);
      }

      const newBooking = await api.bookings.create({
        flightId: flight.id,
        passengers: [
          {
            firstName: firstName || 'Ahmet',
            lastName: lastName || 'Yılmaz',
            identityNumber: identityNumber || '10987654321',
            seatId: activeSeat.id,
            seatCode: activeSeat.seatCode,
          },
        ],
      });

      setIsProcessingPayment(false);
      setActiveBoardingPass(newBooking);
    } catch (err: unknown) {
      setIsProcessingPayment(false);
      setPaymentError(err instanceof Error ? err.message : 'Ödeme sırasında bir hata oluştu.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <Header />

      <main style={{ flex: 1, padding: '32px 24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        {/* Top Navigation & Back Button */}
        <button onClick={() => router.back()} className="btn-outline" style={{ marginBottom: '24px', gap: '8px', display: 'inline-flex', alignItems: 'center' }}>
          <ArrowLeft size={16} /> Arama Sonuçlarına Dön
        </button>

        {/* 3-STEP VISUAL PROGRESS STEPPER WIZARD */}
        <div
          className="corporate-card"
          style={{
            padding: '16px 24px',
            marginBottom: '32px',
            borderRadius: 'var(--radius-lg)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            backgroundColor: 'var(--bg-secondary)',
          }}
        >
          {/* Step 1 Indicator */}
          <div
            onClick={() => setCurrentStep(1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: currentStep === 1 ? 'var(--brand-accent)' : currentStep > 1 ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
              color: currentStep === 1 ? '#ffffff' : currentStep > 1 ? '#10b981' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.88rem',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: currentStep === 1 ? '#ffffff' : currentStep > 1 ? '#10b981' : 'var(--bg-surface)',
                color: currentStep === 1 ? 'var(--brand-accent)' : currentStep > 1 ? '#ffffff' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '0.85rem',
              }}
            >
              {currentStep > 1 ? <CheckCircle2 size={18} /> : '1'}
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', opacity: 0.8, textTransform: 'uppercase' }}>1. ADIM</div>
              <div>Yolcu Bilgileri</div>
            </div>
          </div>

          {/* Step 2 Indicator */}
          <div
            onClick={() => {
              const val = validateStep1Info();
              if (val.isValid) {
                setCurrentStep(2);
              } else {
                setCurrentStep(1);
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: currentStep === 2 ? 'var(--brand-accent)' : currentStep > 2 ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
              color: currentStep === 2 ? '#ffffff' : currentStep > 2 ? '#10b981' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.88rem',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: currentStep === 2 ? '#ffffff' : currentStep > 2 ? '#10b981' : 'var(--bg-surface)',
                color: currentStep === 2 ? 'var(--brand-accent)' : currentStep > 2 ? '#ffffff' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '0.85rem',
              }}
            >
              {currentStep > 2 ? <CheckCircle2 size={18} /> : '2'}
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', opacity: 0.8, textTransform: 'uppercase' }}>2. ADIM</div>
              <div>Koltuk Seçimi</div>
            </div>
          </div>

          {/* Step 3 Indicator */}
          <div
            onClick={() => {
              const val = validateStep1Info();
              if (val.isValid) {
                if (!selectedSeat) {
                  handleSkipSeatSelection();
                } else {
                  setCurrentStep(3);
                }
              } else {
                setCurrentStep(1);
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: currentStep === 3 ? 'var(--brand-accent)' : 'transparent',
              color: currentStep === 3 ? '#ffffff' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.88rem',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: currentStep === 3 ? '#ffffff' : 'var(--bg-surface)',
                color: currentStep === 3 ? 'var(--brand-accent)' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '0.85rem',
              }}
            >
              3
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', opacity: 0.8, textTransform: 'uppercase' }}>3. ADIM</div>
              <div>Ödeme & Onay</div>
            </div>
          </div>
        </div>

        {/* 2-COLUMN LAYOUT: MAIN CONTENT LEFT | FLIGHT SUMMARY RIGHT */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', alignItems: 'start' }}>
          
          {/* LEFT: STEP CONTENT */}
          <div>
            {/* ----------------- STEP 1: PASSENGER DETAILS FORM ----------------- */}
            {currentStep === 1 && (
              <form onSubmit={handleStep1Next} className="corporate-card" style={{ padding: '32px', borderRadius: 'var(--radius-xl)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--brand-accent)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={16} /> ADIM 1: YOLCU & İLETİŞİM BİLGİLERİ
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '16px' }}>
                  1. Yolcu Bilgilerini Giriniz
                </h3>

                {/* Saved Passengers Auto-Fill Selector */}
                {savedPassengersList.length > 0 && (
                  <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '14px 16px', borderRadius: 'var(--radius-md)', marginBottom: '20px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Users size={18} style={{ color: 'var(--brand-accent)', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>
                        Kayıtlı Yolcularımdan Hızlı Doldur
                      </label>
                      <CustomSelect
                        value={selectedSavedPassId}
                        onChange={(val) => handleSelectSavedPassenger(val)}
                        options={[
                          { value: '', label: '-- Kayıtlı Yolcu Seçiniz veya Yeni Giriniz --' },
                          ...savedPassengersList.map((p) => ({
                            value: p.id,
                            label: `${p.fullName} (${p.relation} - ${p.identityNo})`,
                          })),
                        ]}
                        placeholder="-- Kayıtlı Yolcu Seçiniz veya Yeni Giriniz --"
                        style={{ height: '42px' }}
                      />
                    </div>
                  </div>
                )}

                {/* TCKN Invalid Error Alert Banner */}
                {tcError && (
                  <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--brand-red)', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', fontWeight: 700 }}>
                    <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                    <span>{tcError}</span>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px' }}>
                      Ad (Pasaport / Kimlikteki Gibi) <span style={{ color: 'var(--brand-red)' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ahmet"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="input-corporate"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px' }}>
                      Soyad <span style={{ color: 'var(--brand-red)' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Yılmaz"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="input-corporate"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, margin: 0 }}>
                        {isForeignPassport ? 'Pasaport Numarası' : 'T.C. Kimlik Numarası'} <span style={{ color: 'var(--brand-red)' }}>*</span>
                      </label>
                      <label style={{ fontSize: '0.72rem', cursor: 'pointer', color: 'var(--brand-accent)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="checkbox"
                          checked={isForeignPassport}
                          onChange={(e) => {
                            setIsForeignPassport(e.target.checked);
                            setTcError(null);
                          }}
                        />
                        Yabancı Pasaport
                      </label>
                    </div>
                    <input
                      type="text"
                      required
                      maxLength={isForeignPassport ? 20 : 11}
                      placeholder={isForeignPassport ? 'A12345678' : '10987654321'}
                      value={identityNumber}
                      onChange={(e) => {
                        setIdentityNumber(e.target.value);
                        setTcError(null);
                      }}
                      className="input-corporate"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px' }}>
                      E-Posta Adresi (E-Fatura & Bilet İçin) <span style={{ color: 'var(--brand-red)' }}>*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="ahmet@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-corporate"
                    />
                  </div>
                </div>

                {/* Save Passenger Checkbox */}
                <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="savePassengerCb"
                    checked={saveToMyPassengers}
                    onChange={(e) => setSaveToMyPassengers(e.target.checked)}
                    style={{ accentColor: 'var(--brand-accent)', width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <label htmlFor="savePassengerCb" style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', cursor: 'pointer' }}>
                    Bu yolcu bilgilerini sonraki uçuşlarım için Kayıtlı Yolcularıma Ekle
                  </label>
                </div>

                {/* Extra Baggage Option */}
                <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '24px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Luggage size={16} style={{ color: 'var(--brand-accent)' }} /> Ek Bagaj Seçeneği
                  </div>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {[
                      { id: 'none', label: 'Standart (15 kg Dahil)', price: '₺0' },
                      { id: '10kg', label: '+10 kg Ek Bagaj', price: '₺180' },
                      { id: '20kg', label: '+20 kg Ek Bagaj', price: '₺320' },
                    ].map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setExtraBaggage(b.id as any)}
                        style={{
                          flex: '1 1 120px',
                          padding: '10px',
                          borderRadius: 'var(--radius-sm)',
                          border: extraBaggage === b.id ? '2px solid var(--brand-accent)' : '1px solid var(--border-color)',
                          backgroundColor: extraBaggage === b.id ? 'rgba(37, 99, 235, 0.08)' : 'var(--bg-surface)',
                          color: extraBaggage === b.id ? 'var(--brand-accent)' : 'var(--text-secondary)',
                          fontWeight: 800,
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          textAlign: 'center',
                        }}
                      >
                        <div>{b.label}</div>
                        <div style={{ fontSize: '0.72rem', opacity: 0.8 }}>{b.price}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Extra Services & Guarantee Packages */}
                <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '24px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={16} style={{ color: '#059669' }} /> Ek Hizmetler & Bilet İade Güvence Paketleri
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: isRefundGuaranteeSelected ? '2px solid #059669' : '1px solid var(--border-color)', backgroundColor: isRefundGuaranteeSelected ? 'rgba(5, 150, 105, 0.08)' : 'var(--bg-surface)', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                        <input type="checkbox" checked={isRefundGuaranteeSelected} onChange={(e) => setIsRefundGuaranteeSelected(e.target.checked)} style={{ accentColor: '#059669', width: '16px', height: '16px', flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>%85 Kesintisiz İade & Değişiklik Garantisi</div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Uçuşa 2 saat kalaya kadar koşulsuz bilet ücretinin %85'ini anında iade alın</div>
                        </div>
                      </div>
                      <span style={{ fontWeight: 900, fontSize: '0.88rem', color: '#059669', flexShrink: 0, whiteSpace: 'nowrap' }}>+₺180</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: isFastTrackSelected ? '2px solid var(--brand-accent)' : '1px solid var(--border-color)', backgroundColor: isFastTrackSelected ? 'rgba(37, 99, 235, 0.08)' : 'var(--bg-surface)', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                        <input type="checkbox" checked={isFastTrackSelected} onChange={(e) => setIsFastTrackSelected(e.target.checked)} style={{ accentColor: 'var(--brand-accent)', width: '16px', height: '16px', flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>Fast Track & Öncelikli VIP Biniş</div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Havalimanında sıra beklemeden hızlı güvenlik geçişi & öncelikli kapı binişi</div>
                        </div>
                      </div>
                      <span style={{ fontWeight: 900, fontSize: '0.88rem', color: 'var(--brand-accent)', flexShrink: 0, whiteSpace: 'nowrap' }}>+₺120</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: isSmsTrackingSelected ? '2px solid var(--brand-accent)' : '1px solid var(--border-color)', backgroundColor: isSmsTrackingSelected ? 'rgba(37, 99, 235, 0.08)' : 'var(--bg-surface)', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                        <input type="checkbox" checked={isSmsTrackingSelected} onChange={(e) => setIsSmsTrackingSelected(e.target.checked)} style={{ accentColor: 'var(--brand-accent)', width: '16px', height: '16px', flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>Anlık SMS & WhatsApp Uçuş Bildirimi</div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Kapı numarası, rötar ve bagaj bandı güncellemeleri anında SMS ile cebinizde</div>
                        </div>
                      </div>
                      <span style={{ fontWeight: 900, fontSize: '0.88rem', color: 'var(--brand-accent)', flexShrink: 0, whiteSpace: 'nowrap' }}>+₺35</span>
                    </label>
                  </div>
                </div>

                <button type="submit" className="btn-brand" style={{ width: '100%', height: '52px', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  Devam Et: Koltuk Seçimine Geç <ChevronRight size={18} />
                </button>
              </form>
            )}

            {/* ----------------- STEP 2: SEAT MAP & 3D CABIN VIEW ----------------- */}
            {currentStep === 2 && (
              <div className="corporate-card" style={{ padding: '32px', borderRadius: 'var(--radius-xl)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--brand-accent)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Armchair size={16} /> ADIM 2: İNTERAKTİF KABİN & KOLTUK SEÇİMİ
                    </div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 900, marginTop: '2px' }}>
                      Koltuk Seçimi Yapınız
                    </h3>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={handleSkipSeatSelection}
                      className="btn-outline"
                      style={{ padding: '8px 14px', fontSize: '0.82rem', gap: '6px', color: 'var(--text-secondary)' }}
                    >
                      Koltuk Seçmeden İlerle (Check-in Sırasında Otomatik - ₺0)
                    </button>
                    <button
                      type="button"
                      onClick={() => setIs3DCabinOpen(true)}
                      className="btn-outline"
                      style={{ padding: '8px 14px', fontSize: '0.82rem', gap: '6px', color: 'var(--brand-gold)', borderColor: 'var(--brand-gold)' }}
                    >
                      <Sparkles size={14} /> 3D Kabin Görünümü
                    </button>
                  </div>
                </div>

                {isLoadingSeats ? (
                  <div style={{ textAlign: 'center', padding: '40px' }} className="spinner" />
                ) : (
                  <SeatMap
                    seats={seats}
                    selectedSeatId={selectedSeat?.id || null}
                    onSelectSeat={(seat) => {
                      if (seat.id === 'unselect' || selectedSeat?.id === seat.id) {
                        setSelectedSeat(null);
                      } else {
                        setSelectedSeat(seat);
                      }
                    }}
                    aircraftModel={flight.aircraftModel}
                    flightNumber={flight.flightNumber}
                  />
                )}

                <div style={{ display: 'flex', gap: '16px', marginTop: '24px', flexWrap: 'wrap' }}>
                  <button type="button" onClick={() => setCurrentStep(1)} className="btn-outline" style={{ flex: '1 1 180px', height: '48px' }}>
                    ← Yolcu Bilgilerine Dön
                  </button>
                  <button type="button" onClick={handleStep2Next} className="btn-brand" style={{ flex: '2 1 240px', height: '48px', fontSize: '0.98rem' }}>
                    Devam Et: Güvenli Ödemeye Geç ➔
                  </button>
                </div>
              </div>
            )}

            {/* ----------------- STEP 3: INLINE PAYMENT & CONFIRMATION ----------------- */}
            {currentStep === 3 && (
              <div className="corporate-card" style={{ padding: '32px', borderRadius: 'var(--radius-xl)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={16} /> ADIM 3: GÜVENLİ ÖDEME & BİLET ONAYI
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '16px' }}>
                  Ödeme İşlemini Tamamlayınız
                </h3>

                <div style={{ backgroundColor: 'rgba(5, 150, 105, 0.08)', border: '1px solid rgba(5, 150, 105, 0.2)', padding: '14px', borderRadius: 'var(--radius-md)', marginBottom: '20px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  <div style={{ fontWeight: 800, color: '#047857', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={16} /> VIQORA Güvenlik Protokolü & Masterpass Güvencesi
                  </div>
                  <div>
                    Kart numaraları, son kullanma tarihleri ve CVC kodları sistemlerimizde ASLA ham veri olarak saklanmaz. Tüm ödeme işlemleri BDDK lisanslı altyapı ile koruma altındadır.
                  </div>
                </div>

                {paymentError && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--brand-red)', padding: '12px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 700 }}>
                    <AlertTriangle size={16} style={{ flexShrink: 0 }} /> {paymentError}
                  </div>
                )}

                {/* Saved Cards Selector */}
                {savedCardsList.length > 0 && (
                  <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '14px 16px', borderRadius: 'var(--radius-md)', marginBottom: '20px', border: '1px solid var(--border-color)' }}>
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
                            onClick={() => handleSelectSavedCardInline(card.id)}
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
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

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '0.8rem', gap: '12px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.6 }}>KART SAHİBİ</div>
                      <div style={{ fontWeight: 800, textTransform: 'uppercase', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {cardHolder || `${firstName} ${lastName}`.trim() || 'KART SAHİBİ'}
                      </div>
                    </div>

                    <div style={{ flexShrink: 0 }}>
                      <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.6 }}>SON KULLANMA</div>
                      <div style={{ fontWeight: 800 }}>{expiryDate || 'MM/YY'}</div>
                    </div>

                    <div style={{ flexShrink: 0 }}>
                      <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.6 }}>CVC</div>
                      <div style={{ fontWeight: 800, fontFamily: 'monospace' }}>{cvc || '•••'}</div>
                    </div>
                  </div>
                </div>

                {/* Inline Payment Form */}
                <form onSubmit={handleInlinePayAndBook} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
                        setCardNumber(raw.replace(/(.{4})/g, '$1 ').trim());
                      }}
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
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
                          if (raw.length >= 3) setExpiryDate(`${raw.slice(0, 2)}/${raw.slice(2)}`);
                          else setExpiryDate(raw);
                        }}
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

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>Taksit Seçeneği</label>
                    <select
                      value={installment}
                      onChange={(e) => setInstallment(e.target.value)}
                      className="input-corporate"
                      style={{ height: '48px' }}
                    >
                      <option value="1">Tek Çekim — {formatPrice(flight.priceAmount + (selectedSeat?.priceAmount || 0) + (extraBaggage === '10kg' ? 180 : extraBaggage === '20kg' ? 320 : 0) + (isRefundGuaranteeSelected ? 180 : 0) + (isFastTrackSelected ? 120 : 0) + (isSmsTrackingSelected ? 35 : 0))}</option>
                      <option value="3">3 Taksit — {formatPrice(Math.round((flight.priceAmount + (selectedSeat?.priceAmount || 0) + (extraBaggage === '10kg' ? 180 : extraBaggage === '20kg' ? 320 : 0) + (isRefundGuaranteeSelected ? 180 : 0) + (isFastTrackSelected ? 120 : 0) + (isSmsTrackingSelected ? 35 : 0)) / 3))} x 3 Ay</option>
                      <option value="6">6 Taksit — {formatPrice(Math.round((flight.priceAmount + (selectedSeat?.priceAmount || 0) + (extraBaggage === '10kg' ? 180 : extraBaggage === '20kg' ? 320 : 0) + (isRefundGuaranteeSelected ? 180 : 0) + (isFastTrackSelected ? 120 : 0) + (isSmsTrackingSelected ? 35 : 0)) / 6))} x 6 Ay</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <input
                      type="checkbox"
                      id="saveCardInlineCb"
                      checked={saveToMyCards}
                      onChange={(e) => setSaveToMyCards(e.target.checked)}
                      style={{ accentColor: 'var(--brand-accent)', width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <label htmlFor="saveCardInlineCb" style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', cursor: 'pointer' }}>
                      Bu kartı sonraki ödemelerim için Kayıtlı Kartlarıma Ekle
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="btn-brand"
                    disabled={isProcessingPayment}
                    style={{ width: '100%', height: '52px', marginTop: '12px', fontSize: '1.05rem', backgroundColor: '#059669', borderColor: '#059669' }}
                  >
                    {isProcessingPayment
                      ? 'Ödeme İletiliyor & Bilet Üretiliyor...'
                      : `${formatPrice(flight.priceAmount + (selectedSeat?.priceAmount || 0) + (extraBaggage === '10kg' ? 180 : extraBaggage === '20kg' ? 320 : 0) + (isRefundGuaranteeSelected ? 180 : 0) + (isFastTrackSelected ? 120 : 0) + (isSmsTrackingSelected ? 35 : 0))} Öde ve Bilet Al`}
                  </button>

                  <button type="button" onClick={() => setCurrentStep(2)} className="btn-outline" style={{ width: '100%', height: '44px', marginTop: '8px' }}>
                    ← Koltuk Seçimine Dön
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* RIGHT: FLIGHT ORDER SUMMARY CARD */}
          <div className="corporate-card" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--bg-secondary)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--brand-accent)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plane size={14} /> SEÇİLEN UÇUŞ ÖZETİ
            </div>

            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '12px' }}>
              {flight.departureAirportCode} ➔ {flight.arrivalAirportCode} ({flight.flightNumber})
            </h2>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Uçak: <strong>{flight.aircraftModel}</strong> • Tarife: <strong>{fareTierParam.toUpperCase()}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '14px', fontSize: '0.88rem', marginBottom: '16px' }}>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Kalkış</div>
                <div style={{ fontWeight: 800 }}>{new Date(flight.departureTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{flight.departureAirportName}</div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Varış</div>
                <div style={{ fontWeight: 800 }}>{new Date(flight.arrivalTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{flight.arrivalAirportName}</div>
              </div>
            </div>

            {selectedSeat && (
              <div style={{ backgroundColor: 'var(--bg-surface)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '16px' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 800 }}>SEÇİLEN KOLTUK</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--brand-accent)' }}>
                  Koltuk {selectedSeat.seatCode} ({selectedSeat.seatClass})
                </div>
              </div>
            )}

            {/* Extra Services Breakdown List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
              {extraBaggage !== 'none' && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Ek Bagaj ({extraBaggage === '10kg' ? '+10 kg' : '+20 kg'})</span>
                  <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>₺{extraBaggage === '10kg' ? 180 : 320}</span>
                </div>
              )}
              {isRefundGuaranteeSelected && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>%85 İade Güvencesi</span>
                  <span style={{ fontWeight: 800, color: '#059669' }}>₺180</span>
                </div>
              )}
              {isFastTrackSelected && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Fast Track & VIP Biniş</span>
                  <span style={{ fontWeight: 800, color: 'var(--brand-accent)' }}>₺120</span>
                </div>
              )}
              {isSmsTrackingSelected && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>SMS & WhatsApp Bildirimi</span>
                  <span style={{ fontWeight: 800, color: 'var(--brand-accent)' }}>₺35</span>
                </div>
              )}
            </div>

            <div style={{ borderTop: '2px dashed var(--border-color)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)' }}>TOPLAM TUTAR</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#059669' }}>
                {formatPrice(
                  flight.priceAmount +
                    (selectedSeat?.priceAmount || 0) +
                    (extraBaggage === '10kg' ? 180 : extraBaggage === '20kg' ? 320 : 0) +
                    (isRefundGuaranteeSelected ? 180 : 0) +
                    (isFastTrackSelected ? 120 : 0) +
                    (isSmsTrackingSelected ? 35 : 0)
                )}
              </span>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* 3D Cabin Modal */}
      {is3DCabinOpen && selectedSeat && (
        <Cabin3DModal
          isOpen={is3DCabinOpen}
          onClose={() => setIs3DCabinOpen(false)}
          seatCode={selectedSeat.seatCode}
          seatClass={selectedSeat.seatClass === 'Business' ? 'Business' : 'Economy'}
          flightNumber={flight.flightNumber}
          aircraftModel={flight.aircraftModel}
        />
      )}

      {/* Payment Modal */}
      {isPaymentOpen && selectedSeat && (
        <PaymentModal
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          flight={flight}
          seat={selectedSeat}
          passengerInfo={{ firstName, lastName, identityNumber, email }}
          onSuccess={(booking) => {
            setIsPaymentOpen(false);
            setActiveBoardingPass(booking);
          }}
        />
      )}

      {/* Boarding Pass Modal */}
      {activeBoardingPass && (
        <BoardingPassModal
          booking={activeBoardingPass}
          onClose={() => setActiveBoardingPass(null)}
        />
      )}
    </div>
  );
}
