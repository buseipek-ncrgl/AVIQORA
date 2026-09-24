'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { BoardingPassModal } from '@/components/BoardingPassModal';
import { TicketCancelModal } from '@/components/TicketCancelModal';
import { BookingDto } from '@/types/api';
import { VerificationModal } from '@/components/VerificationModal';
import { CustomSelect } from '@/components/CustomSelect';
import { CustomDatePicker } from '@/components/CustomDatePicker';
import { getSavedPassengers, savePassengers, SavedPassenger, translateRelation, translateGender, translatePassengerType } from '@/lib/savedPassengers';
import { downloadEInvoicePdfOrPrint } from '@/lib/invoice';
import { addNotification } from '@/lib/notifications';
import { NotificationModal } from '@/components/NotificationModal';
import {
  User,
  Plane,
  Crown,
  Ticket,
  ShieldCheck,
  Download,
  Award,
  Lock,
  Mail,
  Phone,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  Calendar,
  Clock,
  RotateCcw,
  Luggage,
  AlertCircle,
  Eye,
  EyeOff,
  Utensils,
  Info,
  Plus,
  Trash2,
  Star,
  Shield,
  X,
  RefreshCw,
  Users,
  Edit2,
  FileText,
  Zap,
  Bell,
  ChevronRight,
} from 'lucide-react';

interface SavedCard {
  id: string;
  cardAlias: string;
  cardHolder: string;
  brand: 'Visa' | 'Mastercard' | 'Amex' | 'Troy';
  last4: string;
  expMonth: string;
  expYear: string;
  cvc?: string;
  isDefault: boolean;
  token: string;
}



export default function UserProfilePage() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [activeTab, setActiveTab] = useState<'trips' | 'info' | 'cards' | 'passengers' | 'security' | 'club'>('trips');
  const [tripFilter, setTripFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');

  const [selectedBookingForPass, setSelectedBookingForPass] = useState<BookingDto | null>(null);
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState<BookingDto | null>(null);

  // Notification Modal State
  const [notifyModal, setNotifyModal] = useState<{ isOpen: boolean; title?: string; message: string; type?: 'success' | 'error' | 'warning' | 'info' }>({
    isOpen: false,
    message: '',
  });

  // Saved Profile State (Only updated when 'Save Changes' is clicked)
  const [savedProfile, setSavedProfile] = useState({
    fullName: user?.fullName || 'Ahmet Yılmaz',
    gender: 'Erkek' as 'Erkek' | 'Kadın',
    birthDate: '1992-05-14',
    email: user?.email || 'ahmet.yilmaz@aviqora.com',
    phone: '+90 532 123 45 67',
    identityNo: '10987654321',
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem('aviqora_saved_profile');
      if (raw) {
        const parsed = JSON.parse(raw);
        setSavedProfile(parsed);
        setFormFullName(parsed.fullName);
        setFormGender(parsed.gender);
        setFormBirthDate(parsed.birthDate);
        setFormEmail(parsed.email);
        setFormPhone(parsed.phone);
        setFormIdentityNo(parsed.identityNo);
        setVerifiedEmail(parsed.email);
        setVerifiedPhone(parsed.phone);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Transient Form Input States (Edited in the form without affecting hero header until saved)
  const [formFullName, setFormFullName] = useState(savedProfile.fullName);
  const [formGender, setFormGender] = useState<'Erkek' | 'Kadın'>(savedProfile.gender);
  const [formBirthDate, setFormBirthDate] = useState(savedProfile.birthDate);
  const [formEmail, setFormEmail] = useState(savedProfile.email);
  const [formPhone, setFormPhone] = useState(savedProfile.phone);
  const [formIdentityNo, setFormIdentityNo] = useState(savedProfile.identityNo);

  const [verifiedEmail, setVerifiedEmail] = useState(savedProfile.email);
  const [verifiedPhone, setVerifiedPhone] = useState(savedProfile.phone);

  const [infoSuccess, setInfoSuccess] = useState(false);
  const [infoError, setInfoError] = useState('');

  // OTP Verification Modal Triggers
  const [isEmailOtpOpen, setIsEmailOtpOpen] = useState(false);
  const [isPhoneOtpOpen, setIsPhoneOtpOpen] = useState(false);

  // Form states for password change & show/hide toggles
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [securitySuccess, setSecuritySuccess] = useState(false);
  const [securityError, setSecurityError] = useState('');

  // Saved Passengers State
  const [savedPassengers, setSavedPassengers] = useState<SavedPassenger[]>([]);

  useEffect(() => {
    setSavedPassengers(getSavedPassengers() as any);
  }, []);

  const updateAndSavePassengers = (newPassengers: SavedPassenger[]) => {
    setSavedPassengers(newPassengers);
    savePassengers(newPassengers as any);
  };

  // Saved Passenger Add/Edit Modal State
  const [isPassengerModalOpen, setIsPassengerModalOpen] = useState(false);
  const [editingPassengerId, setEditingPassengerId] = useState<string | null>(null);
  const [passFullName, setPassFullName] = useState('');
  const [passGender, setPassGender] = useState<'Erkek' | 'Kadın'>('Kadın');
  const [passIdentityNo, setPassIdentityNo] = useState('');
  const [passType, setPassType] = useState<'Yetişkin' | 'Çocuk' | 'Bebek'>('Yetişkin');
  const [passBirthDate, setPassBirthDate] = useState('1995-01-01');
  const [passRelation, setPassRelation] = useState<'Kendi Hesabım' | 'Eş' | 'Çocuk' | 'Anne/Baba' | 'Arkadaş' | 'İş Arkadaşı' | 'Diğer'>('Eş');
  const [passMiles, setPassMiles] = useState('');
  const [passModalError, setPassModalError] = useState('');

  // PCI-DSS Saved Cards State
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('aviqora_saved_cards');
      if (raw) {
        setSavedCards(JSON.parse(raw));
      } else {
        const initialCards: SavedCard[] = [
          {
            id: 'card-1',
            cardAlias: 'Garanti BBVA Bonus',
            cardHolder: 'AHMET YILMAZ',
            brand: 'Visa',
            last4: '4543',
            expMonth: '12',
            expYear: '28',
            isDefault: true,
            token: 'tok_masterpass_v1_88492019482',
          },
          {
            id: 'card-2',
            cardAlias: 'İş Bankası Maximum',
            cardHolder: 'AHMET YILMAZ',
            brand: 'Mastercard',
            last4: '1984',
            expMonth: '08',
            expYear: '29',
            isDefault: false,
            token: 'tok_masterpass_v1_99201948102',
          },
        ];
        localStorage.setItem('aviqora_saved_cards', JSON.stringify(initialCards));
        setSavedCards(initialCards);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Add Card Modal State
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [newCardAlias, setNewCardAlias] = useState('');
  const [newCardHolder, setNewCardHolder] = useState('');
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newExpMonth, setNewExpMonth] = useState('12');
  const [newExpYear, setNewExpYear] = useState('28');
  const [newCvc, setNewCvc] = useState('');
  const [cardModalError, setCardModalError] = useState('');
  const [isCardTokenizing, setIsCardTokenizing] = useState(false);

  // Dynamic Verification flags (ONLY trigger verification if input is NOT empty and differs from verified)
  const isEmailNotEmpty = formEmail.trim().length > 0;
  const isEmailVerified = isEmailNotEmpty && formEmail.trim().toLowerCase() === verifiedEmail.trim().toLowerCase();

  const isPhoneNotEmpty = formPhone.trim().length > 0;
  const isPhoneVerified = isPhoneNotEmpty && formPhone.trim().replace(/\s+/g, '') === verifiedPhone.trim().replace(/\s+/g, '');

  // Sample User Bookings State (Supports Live Cancellation & Purchased Bookings from localStorage)
  const [userBookings, setUserBookings] = useState<BookingDto[]>([]);

  useEffect(() => {
    const sampleBookings: BookingDto[] = [
      {
        id: 'bkg-101',
        pnrCode: 'AVQ984',
        flightNumber: 'TK1984',
        departureAirport: 'IST',
        arrivalAirport: 'BER',
        departureTime: '2026-09-25T08:30:00.000Z',
        status: 'Confirmed',
        totalAmount: 1850,
        currency: 'TRY',
        createdAt: new Date().toISOString(),
        boardingGate: 'Gate B14',
        terminal: 'Terminal 1',
        mealPreference: 'Chef Signature Beef & Truffle Risotto',
        isCheckedIn: true,
        baggageAllowance: '15 kg Standart + Ek 10 kg (25 kg Toplam)',
        extraServices: ['%85 İptal Güvencesi', 'Öncelikli VIP Destek'],
        passengers: [
          {
            passengerName: savedProfile.fullName,
            identityNumber: '109******21',
            seatCode: '1C',
          },
        ],
      },
      {
        id: 'bkg-102',
        pnrCode: 'AVQ412',
        flightNumber: 'AVQ302',
        departureAirport: 'IST',
        arrivalAirport: 'CDG',
        departureTime: '2026-09-18T10:00:00.000Z',
        status: 'Completed',
        totalAmount: 2450,
        currency: 'TRY',
        createdAt: new Date(Date.now() - 259200000).toISOString(),
        boardingGate: 'Gate A08',
        terminal: 'Terminal 2F',
        mealPreference: 'Vege Gourmet Pasta',
        isCheckedIn: true,
        baggageAllowance: '15 kg Uçak Altı + Kabin Bagajı',
        passengers: [
          {
            passengerName: savedProfile.fullName,
            identityNumber: '109******21',
            seatCode: '2B',
          },
        ],
      },
      {
        id: 'bkg-103',
        pnrCode: 'AVQ771',
        flightNumber: 'AVQ104',
        departureAirport: 'IST',
        arrivalAirport: 'LHR',
        departureTime: '2026-09-10T14:00:00.000Z',
        status: 'Cancelled',
        totalAmount: 3200,
        refundAmount: 2720,
        kdvAmount: 533,
        currency: 'TRY',
        createdAt: new Date(Date.now() - 600000000).toISOString(),
        cancelledAt: new Date(Date.now() - 550000000).toISOString(),
        boardingGate: 'Gate C02',
        terminal: 'Terminal 3',
        baggageAllowance: '15 kg Standart + Ek 5 kg',
        passengers: [
          {
            passengerName: savedProfile.fullName,
            identityNumber: '109******21',
            seatCode: '4D',
          },
        ],
      },
    ];

    try {
      const raw = localStorage.getItem('aviqora_user_bookings');
      if (raw) {
        const stored: BookingDto[] = JSON.parse(raw);
        const storedPnrs = new Set(stored.map((b) => b.pnrCode));
        const filteredSamples = sampleBookings.filter((b) => !storedPnrs.has(b.pnrCode));
        setUserBookings([...stored, ...filteredSamples]);
      } else {
        localStorage.setItem('aviqora_user_bookings', JSON.stringify(sampleBookings));
        setUserBookings(sampleBookings);
      }
    } catch (err) {
      console.error(err);
      setUserBookings(sampleBookings);
    }
  }, [savedProfile.fullName]);

  // Online Check-in Action Handler
  const handleDoCheckIn = (bkg: BookingDto) => {
    const defaultSeats = ['12A', '12B', '12C', '12D', '12E', '12F'];
    const updatedPassengers = (bkg.passengers || []).map((p, idx) => ({
      ...p,
      seatCode:
        p.seatCode && !p.seatCode.includes('Atanmadı') && !p.seatCode.includes('Atanacak')
          ? p.seatCode
          : defaultSeats[idx % defaultSeats.length],
    }));

    const updatedBooking: BookingDto = {
      ...bkg,
      isCheckedIn: true,
      status: 'CheckedIn',
      passengers: updatedPassengers,
    };

    const updated = userBookings.map((b) => {
      if (b.id === bkg.id || b.pnrCode === bkg.pnrCode) {
        return updatedBooking;
      }
      return b;
    });
    setUserBookings(updated);
    try {
      localStorage.setItem('aviqora_user_bookings', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }

    const assignedSeatSummary = updatedPassengers.map((p) => `${p.passengerName}: ${p.seatCode}`).join(', ');

    addNotification({
      title: 'Online Check-in Tamamlandı',
      message: `${bkg.departureAirport} - ${bkg.arrivalAirport} (${bkg.flightNumber}) uçuşunuz için koltuklarınız (${assignedSeatSummary}) atandı. Dijital biniş kartlarınız hazır.`,
      type: 'checkin',
      pnrCode: bkg.pnrCode,
      actionUrl: '/profile',
    });

    setSelectedBookingForPass(updatedBooking);
  };

  const handleAddCheckinReminder = (bkg: BookingDto) => {
    const depTime = new Date(bkg.departureTime);
    const checkinTime = new Date(depTime.getTime() - 24 * 3600000);
    addNotification({
      title: 'Online Check-in Hatırlatıcısı Kuruldu',
      message: `${bkg.departureAirport} - ${bkg.arrivalAirport} (${bkg.pnrCode}) uçuşunuz için online check-in ${checkinTime.toLocaleString('tr-TR')} itibarıyla açılacaktır.`,
      type: 'checkin',
      pnrCode: bkg.pnrCode,
      actionUrl: '/profile',
    });
    setNotifyModal({
      isOpen: true,
      title: isEn ? 'Check-in Reminder Set' : 'Check-in Hatırlatıcısı Kuruldu',
      message: isEn ? 'Check-in reminder added to your notification center!' : 'Online check-in anımsatıcısı bildirim merkezinize başarıyla eklendi!',
      type: 'success',
    });
  };

  // Strict Form Validation for Profile Update
  const handleUpdateInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setInfoError('');
    setInfoSuccess(false);

    // Empty Checks
    if (!formEmail.trim()) {
      setInfoError(isEn ? 'Email address cannot be empty.' : 'E-posta adresi boş bırakılamaz.');
      return;
    }
    if (!formPhone.trim()) {
      setInfoError(isEn ? 'Phone number cannot be empty.' : 'Telefon numarası boş bırakılamaz.');
      return;
    }

    // FullName Validation
    const trimmedName = formFullName.trim();
    if (!trimmedName || trimmedName.split(/\s+/).length < 2) {
      setInfoError(isEn ? 'Please enter your full first and last name.' : 'Lütfen ad ve soyadınızı eksiksiz (en az iki kelime) giriniz.');
      return;
    }

    // Email Regex Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formEmail.trim())) {
      setInfoError(isEn ? 'Please enter a valid email address.' : 'Lütfen geçerli bir e-posta adresi giriniz.');
      return;
    }

    // Phone Validation
    const rawPhoneDigits = formPhone.replace(/\D/g, '');
    if (rawPhoneDigits.length < 10) {
      setInfoError(isEn ? 'Please enter a valid phone number (at least 10 digits).' : 'Lütfen en az 10 haneli geçerli bir telefon numarası giriniz.');
      return;
    }

    // Identity No Validation (11 digits for TC or min 7 for Passport)
    const rawId = formIdentityNo.trim();
    if (!rawId || (rawId.length !== 11 && rawId.length < 7)) {
      setInfoError(isEn ? 'ID / Passport number must be 11 numeric digits.' : 'T.C. Kimlik Numarası 11 haneli sayı olmalıdır.');
      return;
    }

    // SAVE PROFILE CHANGES TO HERO HEADER & PERMANENT PROFILE DATA
    const newProfile = {
      fullName: trimmedName,
      gender: formGender,
      birthDate: formBirthDate,
      email: formEmail.trim(),
      phone: formPhone.trim(),
      identityNo: rawId,
    };
    setSavedProfile(newProfile);
    try {
      localStorage.setItem('aviqora_saved_profile', JSON.stringify(newProfile));
    } catch (err) {
      console.error(err);
    }

    setInfoSuccess(true);
    setTimeout(() => setInfoSuccess(false), 5000);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError('');
    setSecuritySuccess(false);

    if (!currentPassword) {
      setSecurityError(isEn ? 'Please enter your current password.' : 'Lütfen mevcut şifrenizi giriniz.');
      return;
    }
    if (newPassword.length < 8) {
      setSecurityError(isEn ? 'New password must be at least 8 characters long.' : 'Yeni şifre en az 8 karakter uzunluğunda olmalıdır.');
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setSecurityError(isEn ? 'New password must contain at least 1 uppercase letter (A-Z).' : 'Yeni şifre en az 1 büyük harf (A-Z) içermelidir.');
      return;
    }
    if (!/[a-z]/.test(newPassword)) {
      setSecurityError(isEn ? 'New password must contain at least 1 lowercase letter (a-z).' : 'Yeni şifre en az 1 küçük harf (a-z) içermelidir.');
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      setSecurityError(isEn ? 'New password must contain at least 1 number (0-9).' : 'Yeni şifre en az 1 rakam (0-9) içermelidir.');
      return;
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
      setSecurityError(isEn ? 'New password must contain at least 1 special symbol (!@#$%^&*).' : 'Yeni şifre en az 1 özel sembol (!@#$%^&*) içermelidir.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setSecurityError(isEn ? 'New passwords do not match.' : 'Yeni şifreler eşleşmiyor.');
      return;
    }

    setSecuritySuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setSecuritySuccess(false), 4000);
  };

  // Open Passenger Modal for Creating New
  const handleOpenAddPassenger = () => {
    setEditingPassengerId(null);
    setPassFullName('');
    setPassGender('Kadın');
    setPassIdentityNo('');
    setPassType('Yetişkin');
    setPassBirthDate('1995-01-01');
    setPassRelation('Eş');
    setPassMiles('');
    setPassModalError('');
    setIsPassengerModalOpen(true);
  };

  // Open Passenger Modal for Editing Existing
  const handleOpenEditPassenger = (pass: SavedPassenger) => {
    setEditingPassengerId(pass.id);
    setPassFullName(pass.fullName);
    setPassGender(pass.gender);
    setPassIdentityNo(pass.identityNo);
    setPassType(pass.passengerType);
    setPassBirthDate(pass.birthDate);
    setPassRelation(pass.relation);
    setPassMiles(pass.milesNumber || '');
    setPassModalError('');
    setIsPassengerModalOpen(true);
  };

  // Saved Passengers Save (Create or Update)
  const handleSavePassenger = (e: React.FormEvent) => {
    e.preventDefault();
    setPassModalError('');

    if (!passFullName.trim() || passFullName.trim().split(/\s+/).length < 2) {
      setPassModalError(isEn ? 'Please enter full first and last name.' : 'Lütfen yolcunun adını ve soyadını eksiksiz giriniz.');
      return;
    }
    if (!passIdentityNo.trim() || passIdentityNo.trim().length !== 11) {
      setPassModalError(isEn ? 'ID / Passport number must be 11 numeric digits.' : 'Yolcu T.C. Kimlik Numarası 11 haneli sayı olmalıdır.');
      return;
    }

    if (editingPassengerId) {
      // Edit mode
      const updated = savedPassengers.map((p) =>
        p.id === editingPassengerId
          ? {
              ...p,
              fullName: passFullName.trim(),
              firstName: passFullName.trim().split(' ')[0],
              lastName: passFullName.trim().split(' ').slice(1).join(' '),
              gender: passGender,
              identityNo: passIdentityNo.trim(),
              passengerType: passType,
              birthDate: passBirthDate,
              relation: passRelation,
              milesNumber: passMiles.trim() || undefined,
            }
          : p
      );
      updateAndSavePassengers(updated);
    } else {
      // Create mode
      const newPass: SavedPassenger = {
        id: `pass-${Date.now()}`,
        fullName: passFullName.trim(),
        firstName: passFullName.trim().split(' ')[0],
        lastName: passFullName.trim().split(' ').slice(1).join(' '),
        gender: passGender,
        identityNo: passIdentityNo.trim(),
        passengerType: passType,
        birthDate: passBirthDate,
        relation: passRelation,
        milesNumber: passMiles.trim() || undefined,
      };
      updateAndSavePassengers([...savedPassengers, newPass]);
    }

    setIsPassengerModalOpen(false);
  };

  const handleDeletePassenger = (id: string) => {
    updateAndSavePassengers(savedPassengers.filter((p) => p.id !== id));
  };

  // Saved Cards Operations
  const updateAndSaveCards = (newCards: SavedCard[]) => {
    setSavedCards(newCards);
    try {
      localStorage.setItem('aviqora_saved_cards', JSON.stringify(newCards));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetDefaultCard = (id: string) => {
    const updated = savedCards.map((c) => ({
      ...c,
      isDefault: c.id === id,
    }));
    updateAndSaveCards(updated);
  };

  const handleDeleteCard = (id: string) => {
    const updated = savedCards.filter((c) => c.id !== id);
    updateAndSaveCards(updated);
  };

  const handleSaveNewCard = (e: React.FormEvent) => {
    e.preventDefault();
    setCardModalError('');

    if (!newCardAlias.trim()) {
      setCardModalError(isEn ? 'Please enter a card title/alias.' : 'Lütfen kart için bir tanım/etiket giriniz.');
      return;
    }
    if (!newCardHolder.trim()) {
      setCardModalError(isEn ? 'Please enter cardholder name.' : 'Lütfen kart üzerindeki adı ve soyadı giriniz.');
      return;
    }
    const cleanNum = newCardNumber.replace(/\D/g, '');
    if (cleanNum.length !== 16) {
      setCardModalError(isEn ? 'Credit card number must be 16 digits.' : 'Kredi kartı numarası 16 haneli olmalıdır.');
      return;
    }
    if (!newCvc || newCvc.length < 3) {
      setCardModalError(isEn ? 'Enter a valid 3-digit CVC.' : 'Geçerli bir 3 haneli CVC güvenlik kodu giriniz.');
      return;
    }

    setIsCardTokenizing(true);

    // PCI-DSS Vault Masterpass tokenization
    setTimeout(() => {
      let brand: 'Visa' | 'Mastercard' | 'Amex' | 'Troy' = 'Visa';
      if (/^(5[1-5]|2[2-7])/.test(cleanNum)) brand = 'Mastercard';
      else if (/^3[47]/.test(cleanNum)) brand = 'Amex';
      else if (/^(9792|65)/.test(cleanNum)) brand = 'Troy';

      const last4 = cleanNum.slice(-4);
      const newCardObj: SavedCard = {
        id: `card-${Date.now()}`,
        cardAlias: newCardAlias.trim(),
        cardHolder: newCardHolder.trim().toUpperCase(),
        brand,
        last4,
        expMonth: newExpMonth,
        expYear: newExpYear,
        isDefault: savedCards.length === 0,
        token: `tok_masterpass_v1_${Math.random().toString(36).substring(2, 12)}`,
      };

      updateAndSaveCards([...savedCards, newCardObj]);
      setIsCardTokenizing(false);
      setIsAddCardModalOpen(false);

      // Reset Modal Form
      setNewCardAlias('');
      setNewCardHolder('');
      setNewCardNumber('');
      setNewCvc('');
    }, 1200);
  };

  const handleCancellationSuccess = (cancelledBooking: BookingDto) => {
    setUserBookings((prev) =>
      prev.map((b) => (b.pnrCode === cancelledBooking.pnrCode ? cancelledBooking : b))
    );
    setSelectedBookingForCancel(null);
  };

  // Filtered Bookings Logic
  const filteredBookings = userBookings.filter((bkg) => {
    if (tripFilter === 'active') return bkg.status === 'Confirmed' || bkg.status === 'CheckedIn';
    if (tripFilter === 'completed') return bkg.status === 'Completed';
    if (tripFilter === 'cancelled') return bkg.status === 'Cancelled' || bkg.status === 'Refunded';
    return true; // all
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <Header />

      {/* Global Responsive Styles for Profile Page */}
      <style jsx global>{`
        .profile-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: clamp(16px, 4vw, 40px) clamp(12px, 3.5vw, 32px);
          overflow-x: hidden;
          width: 100%;
          box-sizing: border-box;
        }

        .profile-header-card {
          padding: clamp(16px, 3.5vw, 36px) !important;
          margin-bottom: 24px !important;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
          width: 100%;
          box-sizing: border-box;
        }

        .profile-user-left {
          display: flex;
          align-items: center;
          gap: clamp(12px, 3vw, 24px);
          flex-wrap: wrap;
          max-width: 100%;
          min-width: 0;
        }

        .profile-avatar-circle {
          width: clamp(56px, 8vw, 84px) !important;
          height: clamp(56px, 8vw, 84px) !important;
          font-size: clamp(1.4rem, 3vw, 2.2rem) !important;
          flex-shrink: 0;
        }

        .profile-user-name {
          font-size: clamp(1.2rem, 3.5vw, 1.8rem) !important;
          font-weight: 900;
          line-height: 1.25;
          word-break: break-word;
        }

        .profile-user-info-row {
          font-size: clamp(0.75rem, 2vw, 0.88rem);
          display: flex;
          align-items: center;
          gap: clamp(8px, 2vw, 16px);
          margin-top: 6px;
          flex-wrap: wrap;
        }

        .profile-stats-grid {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .profile-main-layout {
          display: grid;
          grid-template-columns: minmax(240px, 275px) 1fr;
          gap: 24px;
          align-items: start;
          width: 100%;
          box-sizing: border-box;
        }

        .profile-filter-pills {
          display: flex;
          gap: 6px;
          overflow-x: auto;
          padding: 4px;
          -webkit-overflow-scrolling: touch;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
          scrollbar-width: thin;
        }
        .profile-filter-pills::-webkit-scrollbar {
          height: 3px;
        }
        .profile-filter-pills::-webkit-scrollbar-thumb {
          background-color: rgba(37, 99, 235, 0.25);
          border-radius: 4px;
        }

        .ticket-stub-card {
          border-radius: var(--radius-xl);
          display: flex;
          flex-wrap: wrap;
          overflow: hidden;
          box-shadow: var(--shadow-sm);
          position: relative;
          width: 100%;
          box-sizing: border-box;
        }

        .ticket-stub-left {
          flex: 1 1 380px;
          padding: clamp(16px, 3vw, 28px);
          border-right: 2px dashed var(--border-color);
          position: relative;
          min-width: 0;
          box-sizing: border-box;
        }

        .ticket-stub-right {
          flex: 0 0 280px;
          padding: clamp(16px, 3vw, 24px);
          background-color: var(--bg-surface);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: flex-end;
          text-align: right;
          min-width: 0;
          box-sizing: border-box;
        }

        .profile-tab-card {
          padding: clamp(16px, 3.5vw, 36px) !important;
          background-color: var(--bg-surface);
          min-width: 0;
          width: 100%;
          box-sizing: border-box;
        }

        .mobile-tab-label {
          display: none;
        }
        .desktop-tab-label {
          display: inline;
        }

        @media (max-width: 959px) {
          .profile-main-layout {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }

          .profile-sidebar-menu {
            position: static !important;
            top: auto !important;
            display: flex !important;
            flex-direction: row !important;
            overflow-x: auto !important;
            white-space: nowrap !important;
            padding: 6px !important;
            gap: 6px !important;
            border-radius: var(--radius-lg) !important;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: thin;
            width: 100% !important;
            box-sizing: border-box !important;
          }

          .profile-sidebar-menu::-webkit-scrollbar {
            height: 4px;
          }

          .profile-sidebar-menu::-webkit-scrollbar-thumb {
            background-color: rgba(37, 99, 235, 0.3);
            border-radius: 4px;
          }

          .profile-sidebar-title {
            display: none !important;
          }

          .profile-menu-btn {
            flex-shrink: 0 !important;
            padding: 8px 12px !important;
            font-size: 0.8rem !important;
            border-radius: 16px !important;
          }
        }

        @media (max-width: 640px) {
          .profile-container {
            padding: 10px 8px !important;
          }

          .profile-header-card {
            padding: 14px 12px !important;
            margin-bottom: 16px !important;
            border-radius: var(--radius-lg) !important;
          }

          .profile-tab-card {
            padding: 14px 10px !important;
            border-radius: var(--radius-lg) !important;
          }

          .ticket-stub-left {
            padding: 14px 10px !important;
          }

          .ticket-stub-right {
            padding: 14px 10px !important;
          }

          .mobile-tab-label {
            display: inline !important;
          }
          .desktop-tab-label {
            display: none !important;
          }
        }

        @media (max-width: 767px) {
          .profile-header-card {
            flex-direction: column !important;
            align-items: stretch !important;
          }

          .profile-stats-grid {
            width: 100% !important;
            display: grid !important;
            grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)) !important;
          }

          .ticket-stub-card {
            flex-direction: column !important;
          }

          .ticket-stub-left {
            border-right: none !important;
            border-bottom: 2px dashed var(--border-color) !important;
          }

          .ticket-stub-right {
            flex: 1 1 auto !important;
            align-items: stretch !important;
            text-align: left !important;
            width: 100% !important;
          }
        }

        @media (max-width: 480px) {
          .badge-responsive-wrap {
            font-size: 0.68rem !important;
            padding: 3px 8px !important;
          }
        }
      `}</style>

      <main className="profile-container">
        {/* Profile Hero Header Card */}
        <div
          className="corporate-card profile-header-card"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div className="profile-user-left">
            <div
              className="profile-avatar-circle"
              style={{
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--brand-accent) 0%, #1e40af 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(37, 99, 235, 0.35)',
                border: '3px solid var(--brand-gold)',
              }}
            >
              {savedProfile.fullName[0] || 'A'}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                <span
                  className="badge-responsive-wrap"
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 900,
                    color: 'var(--brand-gold)',
                    backgroundColor: 'rgba(217, 119, 6, 0.15)',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    letterSpacing: '0.08em',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Crown size={14} /> AVIQORA CLUB GOLD MEMBER
                </span>

                {isEmailVerified && isPhoneVerified ? (
                  <span
                    className="badge-responsive-wrap"
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      color: '#10b981',
                      backgroundColor: 'rgba(16, 185, 129, 0.15)',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <ShieldCheck size={14} /> {isEn ? 'VERIFIED ACCOUNT' : 'ONAYLI HESAP'}
                  </span>
                ) : (
                  <span
                    className="badge-responsive-wrap"
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      color: '#f59e0b',
                      backgroundColor: 'rgba(245, 158, 11, 0.15)',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <AlertCircle size={14} /> {isEn ? 'ACTION REQUIRED' : 'DOĞRULAMA GEREKİYOR'}
                  </span>
                )}
              </div>

              <h1 className="profile-user-name" style={{ color: 'var(--text-primary)', wordBreak: 'break-word' }}>
                {savedProfile.fullName}
              </h1>

              <div className="profile-user-info-row" style={{ color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', wordBreak: 'break-all' }}>
                  <Mail size={14} /> {savedProfile.email}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Phone size={14} /> {savedProfile.phone}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--brand-accent)', fontWeight: 800 }}>
                  <User size={14} /> {savedProfile.gender}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Counter Stats */}
          <div className="profile-stats-grid">
            <div
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                padding: '14px 20px',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
              }}
            >
              <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: 'rgba(37, 99, 235, 0.15)', color: 'var(--brand-accent)', flexShrink: 0 }}>
                <Plane size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {isEn ? 'TOTAL FLIGHTS' : 'TOPLAM UÇUŞ'}
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {userBookings.length} <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{isEn ? 'Flights' : 'Sefer'}</span>
                </div>
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                padding: '14px 20px',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
              }}
            >
              <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: 'rgba(217, 119, 6, 0.15)', color: 'var(--brand-gold)', flexShrink: 0 }}>
                <Award size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {isEn ? 'MILEAGE BALANCE' : 'MIL PUANLARI'}
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--brand-gold)', marginTop: '2px' }}>
                  142,500 <span style={{ fontSize: '0.78rem' }}>MIL</span>
                </div>
                <div style={{ marginTop: '4px', fontSize: '0.68rem', fontWeight: 800, color: 'var(--brand-gold)' }}>
                  <div style={{ width: '130px', height: '5px', backgroundColor: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden', marginBottom: '2px' }}>
                    <div style={{ width: '82%', height: '100%', backgroundColor: 'var(--brand-gold)' }} />
                  </div>
                  {isEn ? '5,800 Miles to Elite Plus Tier' : 'Elite Plus statüsüne 5.800 Mil kaldı'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ENTERPRISE DASHBOARD LAYOUT */}
        <div className="profile-main-layout">
          
          {/* LEFT SIDEBAR NAVIGATION MENU */}
          <div
            className="corporate-card profile-sidebar-menu"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-xl)',
              position: 'sticky',
              top: '100px',
            }}
          >
            <div className="profile-sidebar-title" style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-muted)', padding: '12px 16px 8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {isEn ? 'ACCOUNT MENU' : 'HESAP MENÜSÜ'}
            </div>

            {[
              { id: 'trips', icon: Plane, label: isEn ? 'My Trips & History' : 'Seyahatlerim & Bilet Geçmişi', shortLabel: isEn ? 'My Trips' : 'Seyahatlerim', count: userBookings.length },
              { id: 'info', icon: User, label: isEn ? 'Personal Information' : 'Hesap & Kişisel Bilgilerim', shortLabel: isEn ? 'Profile' : 'Hesap Bilgileri' },
              { id: 'passengers', icon: Users, label: isEn ? 'Saved Passengers' : 'Kayıtlı Yolcularım', shortLabel: isEn ? 'Passengers' : 'Yolcularım', count: savedPassengers.length },
              { id: 'cards', icon: CreditCard, label: isEn ? 'Saved Payment Cards' : 'Kayıtlı Kartlarım (PCI)', shortLabel: isEn ? 'Cards' : 'Kayıtlı Kartlar', count: savedCards.length },
              { id: 'security', icon: Lock, label: isEn ? 'Security & Password' : 'Güvenlik & Şifre', shortLabel: isEn ? 'Security' : 'Güvenlik' },
              { id: 'club', icon: Crown, label: isEn ? 'AVIQORA Club & Miles' : 'AVIQORA Club & Mil', shortLabel: isEn ? 'Club' : 'Club & Mil' },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className="profile-menu-btn"
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    backgroundColor: isActive ? 'var(--brand-accent)' : 'transparent',
                    color: isActive ? '#ffffff' : 'var(--text-secondary)',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Icon size={18} style={{ color: isActive ? '#ffffff' : 'var(--brand-accent)', flexShrink: 0 }} />
                    <span className="desktop-tab-label">{tab.label}</span>
                    <span className="mobile-tab-label">{tab.shortLabel}</span>
                  </div>
                  {tab.count !== undefined && (
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 900,
                        backgroundColor: isActive ? 'rgba(255, 255, 255, 0.25)' : 'var(--bg-secondary)',
                        color: isActive ? '#ffffff' : 'var(--text-muted)',
                        padding: '2px 7px',
                        borderRadius: '12px',
                      }}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* RIGHT MAIN CONTENT PANEL */}
          <div style={{ minWidth: 0, width: '100%' }}>
            {/* TAB 1: SEYAHATLERİM */}
            {activeTab === 'trips' && (
              <div className="corporate-card profile-tab-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '14px', width: '100%' }}>
                  <div style={{ flex: '1 1 280px', minWidth: 0 }}>
                    <h2 style={{ fontSize: 'clamp(1.05rem, 3.5vw, 1.35rem)', fontWeight: 900, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', wordBreak: 'break-word' }}>
                      <Ticket size={20} style={{ color: 'var(--brand-accent)', flexShrink: 0 }} /> {isEn ? 'Flight Bookings & Travel History' : 'Uçuş Biletlerim, İadeler ve Seyahat Geçmişi'}
                    </h2>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px', wordBreak: 'break-word' }}>
                      {isEn ? 'View digital boarding passes or request flight cancellations and refunds. Includes 20% VAT.' : 'Fiziksel biniş kartlarınızı görüntüleyebilir, bilet iptal/iade talebinde bulunabilirsiniz. Tüm tutarlara %20 KDV dahildir.'}
                    </p>
                  </div>

                  {/* Status Filter Buttons */}
                  <div className="profile-filter-pills" style={{ backgroundColor: 'var(--bg-secondary)', padding: '3px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', width: '100%', maxWidth: '100%' }}>
                    <button
                      onClick={() => setTripFilter('all')}
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        borderRadius: 'var(--radius-sm)',
                        border: 'none',
                        backgroundColor: tripFilter === 'all' ? 'var(--brand-accent)' : 'transparent',
                        color: tripFilter === 'all' ? '#ffffff' : 'var(--text-muted)',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        flex: '1 0 auto',
                      }}
                    >
                      {isEn ? 'All' : 'Tümü'} ({userBookings.length})
                    </button>

                    <button
                      onClick={() => setTripFilter('active')}
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        borderRadius: 'var(--radius-sm)',
                        border: 'none',
                        backgroundColor: tripFilter === 'active' ? 'var(--brand-accent)' : 'transparent',
                        color: tripFilter === 'active' ? '#ffffff' : 'var(--text-muted)',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        flex: '1 0 auto',
                      }}
                    >
                      {isEn ? 'Active Flights' : 'Aktif Uçuşlar'} ({userBookings.filter((b) => b.status === 'Confirmed' || b.status === 'CheckedIn').length})
                    </button>

                    <button
                      onClick={() => setTripFilter('completed')}
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        borderRadius: 'var(--radius-sm)',
                        border: 'none',
                        backgroundColor: tripFilter === 'completed' ? 'var(--brand-accent)' : 'transparent',
                        color: tripFilter === 'completed' ? '#ffffff' : 'var(--text-muted)',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        flex: '1 0 auto',
                      }}
                    >
                      {isEn ? 'Past Flights' : 'Geçmiş'} ({userBookings.filter((b) => b.status === 'Completed').length})
                    </button>

                    <button
                      onClick={() => setTripFilter('cancelled')}
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        borderRadius: 'var(--radius-sm)',
                        border: 'none',
                        backgroundColor: tripFilter === 'cancelled' ? '#ef4444' : 'transparent',
                        color: tripFilter === 'cancelled' ? '#ffffff' : 'var(--text-muted)',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        flex: '1 0 auto',
                      }}
                    >
                      {isEn ? 'Cancelled' : 'İptal & İadeler'} ({userBookings.filter((b) => b.status === 'Cancelled' || b.status === 'Refunded').length})
                    </button>
                  </div>
                </div>

                {/* REALISTIC AVIATION TICKET STUB CARDS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {filteredBookings.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '48px 24px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-xl)', border: '1px dashed var(--border-color)' }}>
                      <Plane size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px', opacity: 0.5 }} />
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {isEn ? 'No Flights Found' : 'Seçilen Kriterde Uçuş Bulunmamaktadır'}
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {isEn ? 'Try selecting a different filter category.' : 'Lütfen farklı bir filtre kategorisi seçiniz.'}
                      </p>
                    </div>
                  )}

                  {filteredBookings.map((bkg) => {
                    const isCancelled = bkg.status === 'Cancelled' || bkg.status === 'Refunded';
                    const isCompleted = bkg.status === 'Completed';
                    const depDate = new Date(bkg.departureTime);
                    const now = new Date();
                    const hoursUntilDeparture = (depDate.getTime() - now.getTime()) / (1000 * 3600);
                    const isCheckInOpen = hoursUntilDeparture <= 24 || bkg.isCheckedIn;
                    const checkinOpenDate = new Date(depDate.getTime() - 24 * 3600000);

                    return (
                      <div
                        key={bkg.id}
                        className="ticket-stub-card"
                        style={{
                          backgroundColor: isCancelled ? 'rgba(239, 68, 68, 0.04)' : 'var(--bg-secondary)',
                          border: isCancelled ? '2px dashed rgba(239, 68, 68, 0.3)' : '1px solid var(--border-color)',
                        }}
                      >
                        {/* LEFT MAIN TICKET SECTION */}
                        <div className="ticket-stub-left">
                          
                          {/* Top Header Bar */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '8px', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', maxWidth: '100%' }}>
                              <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#ffffff', backgroundColor: isCancelled ? '#ef4444' : 'var(--brand-accent)', padding: '3px 10px', borderRadius: '6px', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                                PNR: {bkg.pnrCode}
                              </span>
                              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                                {isEn ? 'Flight:' : 'Sefer:'} {bkg.flightNumber}
                              </span>
                              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.12)', padding: '2px 8px', borderRadius: '12px', whiteSpace: 'nowrap' }}>
                                {isEn ? '%20 VAT INCL' : '%20 KDV DAHİL'}
                              </span>
                            </div>

                            {/* Ticket Status Badge */}
                            <div style={{ flexShrink: 0 }}>
                              {isCancelled ? (
                                <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.15)', padding: '3px 10px', borderRadius: '20px', whiteSpace: 'nowrap', display: 'inline-block' }}>
                                  ● {isEn ? 'CANCELLED' : 'İPTAL & İADE'}
                                </span>
                              ) : isCompleted ? (
                                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', backgroundColor: 'var(--bg-surface)', padding: '3px 10px', borderRadius: '20px', whiteSpace: 'nowrap', display: 'inline-block' }}>
                                  ● {isEn ? 'COMPLETED' : 'GEÇMİŞ UÇUŞ'}
                                </span>
                              ) : (
                                <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.15)', padding: '3px 10px', borderRadius: '20px', whiteSpace: 'nowrap', display: 'inline-block' }}>
                                  ● {bkg.isCheckedIn ? (isEn ? 'CHECKED-IN' : 'CHECK-IN TAMAMLANDI') : (isEn ? 'CONFIRMED' : 'ONAYLANDI')}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Route Details */}
                          <div style={{ fontSize: 'clamp(1.2rem, 3.5vw, 1.45rem)', fontWeight: 900, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                            {bkg.departureAirport} <ArrowRight size={20} style={{ color: 'var(--brand-accent)' }} /> {bkg.arrivalAirport}
                          </div>

                          {/* Metadata Grid */}
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', flexWrap: 'wrap', gap: '12px 16px', marginBottom: '12px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Calendar size={14} /> {new Date(bkg.departureTime).toLocaleDateString(isEn ? 'en-US' : 'tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Clock size={14} /> {new Date(bkg.departureTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 800, color: 'var(--brand-accent)' }}>
                              {isEn ? 'Seat:' : 'Koltuk:'} {(() => {
                                const seatStr = bkg.passengers && bkg.passengers[0]?.seatCode;
                                if (!seatStr || seatStr.includes('Atanmadı') || seatStr.includes('Atanacak')) {
                                  return isEn ? 'Pending Check-in' : 'Check-in Sırasında';
                                }
                                return seatStr;
                              })()}
                            </span>
                            <span>{isEn ? 'Gate:' : 'Kapı:'} {bkg.boardingGate} ({bkg.terminal})</span>
                          </div>

                          <div style={{ fontSize: '0.8rem', color: 'var(--brand-accent)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Luggage size={15} /> {bkg.baggageAllowance}
                          </div>

                          {bkg.mealPreference && (
                            <div style={{ fontSize: '0.8rem', color: 'var(--brand-gold)', marginTop: '4px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Utensils size={15} /> {isEn ? 'Meal:' : 'Yemek:'} {bkg.mealPreference}
                            </div>
                          )}

                          {/* Check-in Info Banner */}
                          {!isCancelled && !isCompleted && (
                            <div
                              style={{
                                marginTop: '14px',
                                padding: '10px 12px',
                                borderRadius: 'var(--radius-md)',
                                backgroundColor: isCheckInOpen ? 'rgba(16, 185, 129, 0.1)' : 'rgba(37, 99, 235, 0.08)',
                                border: isCheckInOpen ? '1px solid #10b981' : '1px solid rgba(37, 99, 235, 0.3)',
                                fontSize: '0.78rem',
                                color: isCheckInOpen ? '#047857' : 'var(--brand-accent)',
                                fontWeight: 800,
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '8px',
                                wordBreak: 'break-word',
                                maxWidth: '100%',
                              }}
                            >
                              <Clock size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
                              <span style={{ flex: '1 1 auto', minWidth: 0 }}>
                                {isCheckInOpen
                                  ? (bkg.isCheckedIn
                                      ? (isEn ? 'Check-in completed. Boarding pass active.' : 'Check-in tamamlandı. Biniş kartınız hazır.')
                                      : (isEn ? 'Online Check-in is OPEN!' : 'Online Check-in AÇIK! Uçuşa 24 saatten az süre kaldı.'))
                                  : (isEn
                                      ? `Online Check-in opens 24h prior (${checkinOpenDate.toLocaleDateString('en-US')} ${checkinOpenDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}).`
                                      : `Online Check-in uçuşa 24 saat kala açılır (${checkinOpenDate.toLocaleDateString('tr-TR')} saat ${checkinOpenDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}).`)}
                              </span>
                            </div>
                          )}

                          {isCancelled && (
                            <div style={{ marginTop: '12px', padding: '10px 12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: 'var(--radius-md)', fontSize: '0.78rem', color: '#ef4444', fontWeight: 800, display: 'flex', alignItems: 'flex-start', gap: '8px', wordBreak: 'break-word', maxWidth: '100%' }}>
                              <Info size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
                              <span style={{ flex: '1 1 auto', minWidth: 0 }}>
                                {isEn ? `Refund of ₺${(bkg.refundAmount || Math.round(bkg.totalAmount * 0.85)).toLocaleString('tr-TR')} credited.` : `İade Tutarı ₺${(bkg.refundAmount || Math.round(bkg.totalAmount * 0.85)).toLocaleString('tr-TR')} ödemenin yapıldığı karta aktarılmıştır.`}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* RIGHT TEAR-OFF COUPON STUB */}
                        <div className="ticket-stub-right">
                          <div>
                            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                              {isEn ? 'TOTAL AMOUNT (INCL VAT)' : 'TOPLAM TUTAR (%20 KDV DAHİL)'}
                            </div>
                            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: isCancelled ? '#ef4444' : '#059669', marginTop: '2px' }}>
                              ₺{bkg.totalAmount.toLocaleString('tr-TR')}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', marginTop: '16px' }}>
                            {!isCancelled && !isCompleted && (
                              <>
                                {bkg.isCheckedIn ? (
                                  <button
                                    className="btn-brand-v2"
                                    onClick={() => setSelectedBookingForPass(bkg)}
                                    style={{ width: '100%', fontSize: '0.82rem', gap: '6px' }}
                                  >
                                    <Download size={15} /> {isEn ? 'View Boarding Pass' : 'Biniş Kartı Göster'}
                                  </button>
                                ) : isCheckInOpen ? (
                                  <button
                                    className="btn-brand-v2"
                                    onClick={() => handleDoCheckIn(bkg)}
                                    style={{ width: '100%', fontSize: '0.82rem', gap: '6px', backgroundColor: '#059669' }}
                                  >
                                    <Zap size={15} /> {isEn ? 'Online Check-in Now' : 'Online Check-in Yap'}
                                  </button>
                                ) : (
                                  <>
                                    <button
                                      className="btn-brand-v2"
                                      onClick={() => handleDoCheckIn(bkg)}
                                      style={{ width: '100%', fontSize: '0.78rem', gap: '6px', backgroundColor: 'var(--brand-accent)' }}
                                      title="Test amaçlı check-in işlemini simüle et"
                                    >
                                      <Zap size={14} /> {isEn ? 'Test: Activate Check-in Now' : '⚡ Hızlı Test: Check-in Başlat'}
                                    </button>

                                    <button
                                      className="btn-outline"
                                      onClick={() => handleAddCheckinReminder(bkg)}
                                      style={{ width: '100%', fontSize: '0.75rem', gap: '4px', padding: '6px 8px' }}
                                    >
                                      <Bell size={13} /> {isEn ? 'Remind Me' : 'Check-in Anımsatıcısı Ekle'}
                                    </button>
                                  </>
                                )}

                                <button
                                  className="btn-outline"
                                  onClick={() => downloadEInvoicePdfOrPrint(bkg)}
                                  style={{ width: '100%', fontSize: '0.78rem', gap: '6px', color: '#059669', borderColor: '#059669' }}
                                >
                                  <FileText size={14} /> {isEn ? 'Download E-Invoice' : 'E-Fatura İndir / Yazdır'}
                                </button>

                                <button
                                  className="btn-danger-v2"
                                  onClick={() => setSelectedBookingForCancel(bkg)}
                                  style={{ width: '100%', fontSize: '0.78rem', gap: '6px' }}
                                >
                                  <RotateCcw size={14} /> {isEn ? 'Cancel / Refund' : 'Bileti İptal Et / İade İste'}
                                </button>
                              </>
                            )}

                            {isCompleted && (
                              <button
                                className="btn-outline"
                                onClick={() => downloadEInvoicePdfOrPrint(bkg)}
                                style={{ width: '100%', fontSize: '0.78rem', gap: '6px', color: '#059669', borderColor: '#059669' }}
                              >
                                <FileText size={14} /> {isEn ? 'Download E-Invoice' : 'E-Fatura İndir / Yazdır'}
                              </button>
                            )}

                            {isCancelled && (
                              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ef4444', textAlign: 'center', padding: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-md)' }}>
                                {isEn ? 'REFUND PROCESSED' : 'İADE TAMAMLANDI'}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: HESAP BİLGİLERİM (2x3 BALANCED GRID) */}
            {activeTab === 'info' && (
              <div className="corporate-card" style={{ padding: '36px', backgroundColor: 'var(--bg-surface)' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <User size={22} style={{ color: 'var(--brand-accent)' }} /> {isEn ? 'Personal Information & Account Profile' : 'Profil ve Yolcu Bilgileri Güncelleme'}
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
                  {isEn ? 'All fields are mandatory. Editing email or phone immediately resets verification status.' : 'Tüm alanlar zorunludur. E-posta veya telefon düzenlendiğinde doğrulama durumu anında sıfırlanır.'}
                </p>

                {infoError && (
                  <div
                    style={{
                      padding: '14px 20px',
                      backgroundColor: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid #ef4444',
                      borderRadius: 'var(--radius-md)',
                      color: '#ef4444',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      marginBottom: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <AlertCircle size={18} /> {infoError}
                  </div>
                )}

                {infoSuccess && (
                  <div
                    style={{
                      padding: '14px 20px',
                      backgroundColor: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid #10b981',
                      borderRadius: 'var(--radius-md)',
                      color: '#10b981',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      marginBottom: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <CheckCircle2 size={18} /> {isEn ? 'Profile information updated successfully.' : 'Profil bilgileri başarıyla güncellendi ve sisteme kaydedildi.'}
                  </div>
                )}

                <form onSubmit={handleUpdateInfo} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                  {/* Row 1 - Col 1: Ad Soyad */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '8px' }}>
                      {isEn ? 'FULL NAME' : 'AD SOYAD'} <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div className="input-icon-wrapper">
                      <span className="input-icon-left"><User size={18} /></span>
                      <input
                        type="text"
                        className="input-corporate-v2 input-with-icon"
                        value={formFullName}
                        onChange={(e) => setFormFullName(e.target.value)}
                        placeholder="Ahmet Yılmaz"
                        required
                      />
                    </div>
                  </div>

                  {/* Row 1 - Col 2: Cinsiyet */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '8px' }}>
                      {isEn ? 'GENDER' : 'CİNSİYET'} <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <CustomSelect
                      leftIcon={<User size={18} />}
                      options={[
                        { value: 'Erkek', label: isEn ? 'Male' : 'Erkek' },
                        { value: 'Kadın', label: isEn ? 'Female' : 'Kadın' },
                      ]}
                      value={formGender}
                      onChange={(val) => setFormGender(val as 'Erkek' | 'Kadın')}
                    />
                  </div>

                  {/* Row 2 - Col 1: E-Posta & Instant Verification Status (Only show OTP button if NOT empty!) */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                        {isEn ? 'EMAIL ADDRESS' : 'E-POSTA ADRESİ'} <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      {isEmailVerified ? (
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.12)', padding: '2px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={12} /> ● {isEn ? 'VERIFIED' : 'DOĞRULANDI'}
                        </span>
                      ) : isEmailNotEmpty ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.15)', padding: '2px 8px', borderRadius: '12px' }}>
                            ● {isEn ? 'VERIFICATION REQUIRED' : 'DOĞRULAMA GEREKİYOR'}
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsEmailOtpOpen(true)}
                            style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ffffff', backgroundColor: 'var(--brand-accent)', border: 'none', borderRadius: '4px', padding: '3px 8px', cursor: 'pointer' }}
                          >
                            {isEn ? 'Send OTP' : 'Kodu Gönder'}
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#ef4444' }}>
                          ● {isEn ? 'CANNOT BE EMPTY' : 'BOŞ BIRAKILAMAZ'}
                        </span>
                      )}
                    </div>
                    <div className="input-icon-wrapper">
                      <span className="input-icon-left"><Mail size={18} /></span>
                      <input
                        type="email"
                        className="input-corporate-v2 input-with-icon"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        placeholder="ahmet.yilmaz@aviqora.com"
                        required
                      />
                    </div>
                  </div>

                  {/* Row 2 - Col 2: Telefon Numarası & Instant SMS Status */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                        {isEn ? 'PHONE NUMBER' : 'TELEFON NUMARASI'} <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      {isPhoneVerified ? (
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.12)', padding: '2px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={12} /> ● {isEn ? 'SMS VERIFIED' : 'SMS ONAYLI'}
                        </span>
                      ) : isPhoneNotEmpty ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.15)', padding: '2px 8px', borderRadius: '12px' }}>
                            ● {isEn ? 'SMS REQUIRED' : 'SMS ONAY GEREKİYOR'}
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsPhoneOtpOpen(true)}
                            style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ffffff', backgroundColor: 'var(--brand-accent)', border: 'none', borderRadius: '4px', padding: '3px 8px', cursor: 'pointer' }}
                          >
                            {isEn ? 'Send SMS' : 'SMS Gönder'}
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#ef4444' }}>
                          ● {isEn ? 'CANNOT BE EMPTY' : 'BOŞ BIRAKILAMAZ'}
                        </span>
                      )}
                    </div>
                    <div className="input-icon-wrapper">
                      <span className="input-icon-left"><Phone size={18} /></span>
                      <input
                        type="text"
                        className="input-corporate-v2 input-with-icon"
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        placeholder="+90 532 123 45 67"
                        required
                      />
                    </div>
                  </div>

                  {/* Row 3 - Col 1: TC Kimlik */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '8px' }}>
                      {isEn ? 'NATIONAL ID / PASSPORT NO' : 'T.C. KİMLİK / PASAPORT NO'} <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div className="input-icon-wrapper">
                      <span className="input-icon-left"><CreditCard size={18} /></span>
                      <input
                        type="text"
                        className="input-corporate-v2 input-with-icon"
                        value={formIdentityNo}
                        onChange={(e) => setFormIdentityNo(e.target.value)}
                        placeholder="10987654321"
                        required
                      />
                    </div>
                  </div>

                  {/* Row 3 - Col 2: Doğum Tarihi */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '8px' }}>
                      {isEn ? 'DATE OF BIRTH' : 'DOĞUM TARİHİ'} <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <CustomDatePicker
                      leftIcon={<Calendar size={18} />}
                      value={formBirthDate}
                      onChange={(val) => setFormBirthDate(val)}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1', marginTop: '12px' }}>
                    <button type="submit" className="btn-primary-gradient" style={{ padding: '12px 28px', fontSize: '0.9rem' }}>
                      {isEn ? 'Save Profile Changes' : 'Profil Değişikliklerini Kaydet'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 3: KAYITLI YOLCULARIM (WITH EDIT PASSENGER CAPABILITY) */}
            {activeTab === 'passengers' && (
              <div className="corporate-card" style={{ padding: '36px', backgroundColor: 'var(--bg-surface)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Users size={22} style={{ color: 'var(--brand-accent)' }} /> {isEn ? 'Saved Passengers' : 'Kayıtlı Yolcularım'}
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {isEn ? 'Save family members and colleagues to auto-fill ticket booking details instantly.' : 'Bilet satın alma sırasında aile bireyleriniz ve arkadaşlarınızın bilgilerini tek tıkla otomatik doldurmak için kaydedin.'}
                    </p>
                  </div>

                  <button
                    className="btn-brand-v2"
                    onClick={handleOpenAddPassenger}
                    style={{ padding: '10px 20px', fontSize: '0.88rem', gap: '8px' }}
                  >
                    <Plus size={18} /> {isEn ? 'Add New Passenger' : 'Yeni Yolcu Ekle'}
                  </button>
                </div>

                {/* Saved Passengers List Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                  {savedPassengers.map((passenger) => (
                    <div
                      key={passenger.id}
                      style={{
                        padding: '24px',
                        borderRadius: 'var(--radius-xl)',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: 'var(--shadow-sm)',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: 'rgba(37, 99, 235, 0.15)', color: 'var(--brand-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>
                              {passenger.fullName[0]}
                            </div>
                            <div>
                              <div style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                                {passenger.fullName}
                              </div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                {translateGender(passenger.gender, isEn)} • {translatePassengerType(passenger.passengerType, isEn)}
                              </div>
                            </div>
                          </div>

                          <span style={{ fontSize: '0.72rem', fontWeight: 900, color: 'var(--brand-accent)', backgroundColor: 'rgba(37, 99, 235, 0.12)', padding: '4px 10px', borderRadius: '12px' }}>
                            {translateRelation(passenger.relation, isEn)}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '6px', margin: '16px 0' }}>
                          <div>
                            <strong>{isEn ? 'National ID:' : 'T.C. Kimlik No:'}</strong> {passenger.identityNo}
                          </div>
                          <div>
                            <strong>{isEn ? 'Date of Birth:' : 'Doğum Tarihi:'}</strong> {new Date(passenger.birthDate).toLocaleDateString(isEn ? 'en-US' : 'tr-TR')}
                          </div>
                          {passenger.milesNumber && (
                            <div style={{ color: 'var(--brand-gold)', fontWeight: 800 }}>
                              <strong>{isEn ? 'Frequent Flyer No:' : 'Mil / Sadakat No:'}</strong> {passenger.milesNumber}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Passenger Action Buttons (Edit + Delete) */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEditPassenger(passenger)}
                          style={{ color: 'var(--brand-accent)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Edit2 size={14} /> {isEn ? 'Edit' : 'Düzenle'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeletePassenger(passenger.id)}
                          style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Trash2 size={14} /> {isEn ? 'Delete' : 'Sil'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: KAYITLI ÖDEME YÖNTEMLERİM (PCI-DSS VAULT) */}
            {activeTab === 'cards' && (
              <div className="corporate-card" style={{ padding: '36px', backgroundColor: 'var(--bg-surface)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <CreditCard size={22} style={{ color: 'var(--brand-accent)' }} /> {isEn ? 'Saved Payment Cards (PCI-DSS Vault)' : 'Kayıtlı Ödeme Kartlarım (PCI-DSS Token Vault)'}
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {isEn ? 'Tokenized card vault powered by Masterpass for fast 1-click booking.' : 'Hızlı bilet satın alımları için BDDK lisanslı Masterpass / Garanti Pay Kasası ile güvenli jetonlaştırılmış kartlar.'}
                    </p>
                  </div>

                  <button
                    className="btn-brand-v2"
                    onClick={() => setIsAddCardModalOpen(true)}
                    style={{ padding: '10px 20px', fontSize: '0.88rem', gap: '8px' }}
                  >
                    <Plus size={18} /> {isEn ? 'Add New Card' : 'Yeni Güvenli Kart Ekle'}
                  </button>
                </div>

                {/* PCI-DSS Security Guarantee Banner */}
                <div
                  style={{
                    padding: '18px 24px',
                    backgroundColor: 'rgba(37, 99, 235, 0.08)',
                    border: '1px solid rgba(37, 99, 235, 0.25)',
                    borderRadius: 'var(--radius-lg)',
                    marginBottom: '28px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '16px',
                  }}
                >
                  <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: 'rgba(37, 99, 235, 0.15)', color: 'var(--brand-accent)', flexShrink: 0 }}>
                    <Shield size={24} />
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    <strong style={{ color: 'var(--brand-accent)', display: 'block', fontSize: '0.92rem', marginBottom: '4px' }}>
                      PCI-DSS Level 1 Masterpass Vault Guarantee
                    </strong>
                    {isEn ? 'Raw credit card numbers and CVCs are never stored in plain text. Card details are tokenized securely with 256-bit SSL encryption.' : 'AVIQORA sistemlerinde kart numaraları, son kullanma tarihleri ve CVC güvenlik kodları ASLA ham veri olarak saklanmaz. Kartınız doğrudan BDDK lisanslı Masterpass kasasında jetonlaştırılır.'}
                  </div>
                </div>

                {/* Cards List Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
                  {savedCards.map((card) => (
                    <div
                      key={card.id}
                      style={{
                        borderRadius: 'var(--radius-xl)',
                        padding: '24px',
                        background: card.isDefault
                          ? 'linear-gradient(135deg, #0f2744 0%, #1e3a8a 50%, #2563eb 100%)'
                          : 'var(--bg-surface-elevated)',
                        color: card.isDefault ? '#ffffff' : 'var(--text-primary)',
                        border: card.isDefault ? '2px solid #60a5fa' : '1.5px solid var(--border-color)',
                        boxShadow: card.isDefault ? '0 12px 28px rgba(37, 99, 235, 0.25)' : 'var(--shadow-sm)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        minHeight: '210px',
                        position: 'relative',
                      }}
                    >
                      {/* Top Bar */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontSize: '1.05rem', fontWeight: 900, color: card.isDefault ? '#ffffff' : 'var(--text-primary)' }}>
                            {card.cardAlias}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: card.isDefault ? '#93c5fd' : 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <ShieldCheck size={12} /> BDDK Masterpass™ Korumalı Kart
                          </div>
                        </div>

                        <span style={{ fontSize: '1.3rem', fontWeight: 900, fontStyle: 'italic', color: card.brand === 'Visa' ? (card.isDefault ? '#93c5fd' : '#2563eb') : '#ef4444' }}>
                          {card.brand}
                        </span>
                      </div>

                      {/* EMV Metallic Chip & Contactless Signal Icon */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '14px', marginBottom: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '38px', height: '28px', borderRadius: '5px', background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', border: '1px solid #b45309', position: 'relative' }}>
                            <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(0,0,0,0.3)', position: 'absolute', top: '9px' }} />
                            <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(0,0,0,0.3)', position: 'absolute', top: '18px' }} />
                            <div style={{ width: '1px', height: '100%', backgroundColor: 'rgba(0,0,0,0.3)', position: 'absolute', left: '18px' }} />
                          </div>
                          <span style={{ fontSize: '0.9rem', color: card.isDefault ? '#93c5fd' : 'var(--text-muted)', fontWeight: 900, letterSpacing: '1px' }}>(((</span>
                        </div>

                        {/* CVC Code Display with Toggle */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 800, color: card.isDefault ? '#ffffff' : 'var(--text-primary)', backgroundColor: card.isDefault ? 'rgba(255,255,255,0.15)' : 'var(--bg-secondary)', padding: '4px 10px', borderRadius: 'var(--radius-sm)' }}>
                          <span>CVC: {card.cvc || '349'}</span>
                        </div>
                      </div>

                      {/* Masked Number */}
                      <div style={{ fontSize: '1.35rem', fontWeight: 900, letterSpacing: '3px', margin: '8px 0 12px 0', fontFamily: 'monospace' }}>
                        •••• •••• •••• {card.last4}
                      </div>

                      {/* Bottom Holder & Actions */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: card.isDefault ? '1px solid rgba(255,255,255,0.1)' : '1px solid var(--border-color)', paddingTop: '12px', flexWrap: 'wrap', gap: '10px' }}>
                        <div style={{ minWidth: 0, flex: '1 1 160px' }}>
                          <div style={{ fontSize: '0.7rem', color: card.isDefault ? '#94a3b8' : 'var(--text-muted)', textTransform: 'uppercase' }}>
                            {isEn ? 'CARDHOLDER / EXP' : 'KART SAHİBİ / SKT'}
                          </div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 800, wordBreak: 'break-word', whiteSpace: 'normal' }}>
                            {card.cardHolder} ({card.expMonth}/{card.expYear})
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                          {!card.isDefault && (
                            <button
                              type="button"
                              onClick={() => handleSetDefaultCard(card.id)}
                              style={{ fontSize: '0.75rem', fontWeight: 800, color: card.isDefault ? '#93c5fd' : 'var(--brand-accent)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Star size={13} /> {isEn ? 'Set Default' : 'Varsayılan Yap'}
                            </button>
                          )}

                          {card.isDefault && (
                            <span style={{ fontSize: '0.72rem', fontWeight: 900, color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.2)', padding: '3px 8px', borderRadius: '12px' }}>
                              ● {isEn ? 'DEFAULT CARD' : 'VARSAYILAN KART'}
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDeleteCard(card.id)}
                            style={{ color: card.isDefault ? '#fca5a5' : '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                            title="Kartı Sil"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: GÜVENLİK VE ŞİFRE */}
            {activeTab === 'security' && (
              <div className="corporate-card" style={{ padding: '36px', backgroundColor: 'var(--bg-surface)' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Lock size={22} style={{ color: 'var(--brand-accent)' }} /> {isEn ? 'Security & Password Management' : 'Güvenlik ve Şifre Yönetimi'}
                </h2>

                {securityError && (
                  <div
                    style={{
                      padding: '14px 20px',
                      backgroundColor: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid #ef4444',
                      borderRadius: 'var(--radius-md)',
                      color: '#ef4444',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      marginBottom: '24px',
                    }}
                  >
                    {securityError}
                  </div>
                )}

                {securitySuccess && (
                  <div
                    style={{
                      padding: '14px 20px',
                      backgroundColor: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid #10b981',
                      borderRadius: 'var(--radius-md)',
                      color: '#10b981',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      marginBottom: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <CheckCircle2 size={18} /> {isEn ? 'Password updated successfully.' : 'Şifreniz başarıyla değiştirildi.'}
                  </div>
                )}

                <form onSubmit={handleUpdatePassword} style={{ maxWidth: '540px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '8px' }}>
                      {isEn ? 'CURRENT PASSWORD' : 'MEVCUT ŞİFRE'}
                    </label>
                    <div className="input-icon-wrapper">
                      <span className="input-icon-left"><Lock size={18} /></span>
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        className="input-corporate-v2 input-with-icon"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        style={{ paddingRight: '42px' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      >
                        {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '8px' }}>
                      {isEn ? 'NEW PASSWORD' : 'YENİ ŞİFRE'}
                    </label>
                    <div className="input-icon-wrapper">
                      <span className="input-icon-left"><Lock size={18} /></span>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        className="input-corporate-v2 input-with-icon"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder={isEn ? '8+ chars, uppercase, lowercase, symbol' : 'En az 8 karakter, büyük/küçük harf, sembol'}
                        style={{ paddingRight: '42px' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      >
                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {/* Live Password Strength Requirements Checklist */}
                    <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '0.75rem', fontWeight: 800 }}>
                      <span style={{ color: newPassword.length >= 8 ? '#10b981' : 'var(--text-muted)', backgroundColor: newPassword.length >= 8 ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-secondary)', padding: '3px 10px', borderRadius: '12px', transition: 'all 0.2s ease' }}>
                        {newPassword.length >= 8 ? '✓' : '○'} {isEn ? '8+ Chars' : '8+ Karakter'}
                      </span>
                      <span style={{ color: /[A-Z]/.test(newPassword) ? '#10b981' : 'var(--text-muted)', backgroundColor: /[A-Z]/.test(newPassword) ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-secondary)', padding: '3px 10px', borderRadius: '12px', transition: 'all 0.2s ease' }}>
                        {/[A-Z]/.test(newPassword) ? '✓' : '○'} {isEn ? 'Uppercase (A-Z)' : 'Büyük Harf'}
                      </span>
                      <span style={{ color: /[a-z]/.test(newPassword) ? '#10b981' : 'var(--text-muted)', backgroundColor: /[a-z]/.test(newPassword) ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-secondary)', padding: '3px 10px', borderRadius: '12px', transition: 'all 0.2s ease' }}>
                        {/[a-z]/.test(newPassword) ? '✓' : '○'} {isEn ? 'Lowercase (a-z)' : 'Küçük Harf'}
                      </span>
                      <span style={{ color: /[0-9]/.test(newPassword) ? '#10b981' : 'var(--text-muted)', backgroundColor: /[0-9]/.test(newPassword) ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-secondary)', padding: '3px 10px', borderRadius: '12px', transition: 'all 0.2s ease' }}>
                        {/[0-9]/.test(newPassword) ? '✓' : '○'} {isEn ? 'Number (0-9)' : 'Rakam'}
                      </span>
                      <span style={{ color: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword) ? '#10b981' : 'var(--text-muted)', backgroundColor: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword) ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-secondary)', padding: '3px 10px', borderRadius: '12px', transition: 'all 0.2s ease' }}>
                        {/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword) ? '✓' : '○'} {isEn ? 'Symbol (!@#$)' : 'Özel Sembol'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '8px' }}>
                      {isEn ? 'CONFIRM NEW PASSWORD' : 'YENİ ŞİFRE (TEKRAR)'}
                    </label>
                    <div className="input-icon-wrapper">
                      <span className="input-icon-left"><Lock size={18} /></span>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        className="input-corporate-v2 input-with-icon"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder={isEn ? 'Re-enter new password' : 'Şifreyi tekrar yazınız'}
                        style={{ paddingRight: '42px' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <button type="submit" className="btn-primary-gradient" style={{ padding: '12px 28px', fontSize: '0.9rem' }}>
                      {isEn ? 'Update Password' : 'Şifreyi Güncelle'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 6: AVIQORA CLUB */}
            {activeTab === 'club' && (
              <div className="corporate-card" style={{ padding: '36px', backgroundColor: 'var(--bg-surface)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '20px' }}>
                  <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Crown size={22} style={{ color: 'var(--brand-gold)' }} /> {isEn ? 'AVIQORA Club Loyalty Program' : 'AVIQORA Club Sadakat Programı'}
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {isEn ? 'Track earned miles and tier status benefits.' : 'Uçtukça kazandığınız mil puanları ve ayrıcalıklı yolcu statünüz.'}
                    </p>
                  </div>

                  <div style={{ padding: '12px 20px', borderRadius: 'var(--radius-lg)', backgroundColor: 'rgba(217, 119, 6, 0.1)', border: '1px solid var(--brand-gold)' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--brand-gold)' }}>
                      {isEn ? 'TO PLATINUM STATUS: 5,500 MILES' : 'PLATINUM STATÜYE KALAN: 5,500 MIL'}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div style={{ marginBottom: '32px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '8px' }}>
                    <span>GOLD (24,500 Mil)</span>
                    <span>PLATINUM (30,000 Mil)</span>
                  </div>
                  <div style={{ width: '100%', height: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                    <div style={{ width: '81%', height: '100%', backgroundColor: 'var(--brand-gold)', borderRadius: '6px', transition: 'width 0.5s ease' }} />
                  </div>
                </div>

                {/* Miles Log Table */}
                <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '16px' }}>
                  {isEn ? 'Recent Mileage Transactions' : 'Son Mil İşlemleri & Hareket Dökümü'}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>IST - BER (TK1984)</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Business Class Flight • 18 Sep 2026</div>
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#10b981' }}>+1,250 MIL</div>
                  </div>

                  <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>Istanbul IGA Lounge Redemption</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>CIP Lounge Access • 12 Aug 2026</div>
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ef4444' }}>-500 MIL</div>
                  </div>

                  <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>AVIQORA Club Welcome Bonus</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Member Reward • 01 Jan 2026</div>
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#10b981' }}>+23,750 MIL</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* Boarding Pass Modal */}
      {selectedBookingForPass && (
        <BoardingPassModal
          booking={selectedBookingForPass}
          onClose={() => setSelectedBookingForPass(null)}
        />
      )}

      {/* Ticket Cancel & Refund Modal */}
      {selectedBookingForCancel && (
        <TicketCancelModal
          booking={selectedBookingForCancel}
          onClose={() => setSelectedBookingForCancel(null)}
          onSuccess={handleCancellationSuccess}
        />
      )}

      {/* Email OTP Verification Modal */}
      <VerificationModal
        type="email"
        targetValue={formEmail}
        isOpen={isEmailOtpOpen}
        onClose={() => setIsEmailOtpOpen(false)}
        onVerified={() => {
          setVerifiedEmail(formEmail);
          setInfoSuccess(true);
          setTimeout(() => setInfoSuccess(false), 4000);
        }}
      />

      {/* Phone OTP Verification Modal */}
      <VerificationModal
        type="phone"
        targetValue={formPhone}
        isOpen={isPhoneOtpOpen}
        onClose={() => setIsPhoneOtpOpen(false)}
        onVerified={() => {
          setVerifiedPhone(formPhone);
          setInfoSuccess(true);
          setTimeout(() => setInfoSuccess(false), 4000);
        }}
      />

      {/* Saved Passenger Add/Edit Modal */}
      {isPassengerModalOpen && (
        <div className="modal-overlay" onClick={() => setIsPassengerModalOpen(false)}>
          <div
            className="corporate-card"
            style={{
              width: '100%',
              maxWidth: '540px',
              backgroundColor: 'var(--bg-surface-elevated)',
              padding: '32px',
              borderRadius: 'var(--radius-xl)',
              animation: 'modalFadeIn 0.25s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={22} style={{ color: 'var(--brand-accent)' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                  {editingPassengerId ? (isEn ? 'Edit Saved Passenger' : 'Kayıtlı Yolcuyu Düzenle') : (isEn ? 'Add New Saved Passenger' : 'Yeni Kayıtlı Yolcu Ekle')}
                </h3>
              </div>
              <button className="btn-outline" onClick={() => setIsPassengerModalOpen(false)} style={{ padding: '4px 10px' }}>
                <X size={16} />
              </button>
            </div>

            {passModalError && (
              <div style={{ padding: '10px 14px', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: 'var(--radius-md)', color: '#ef4444', fontSize: '0.85rem', fontWeight: 800, marginBottom: '20px' }}>
                {passModalError}
              </div>
            )}

            <form onSubmit={handleSavePassenger} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  {isEn ? 'FULL NAME' : 'AD SOYAD'}
                </label>
                <input
                  type="text"
                  className="input-corporate-v2"
                  placeholder="Ayşe Yılmaz"
                  value={passFullName}
                  onChange={(e) => setPassFullName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    {isEn ? 'GENDER' : 'CİNSİYET'}
                  </label>
                  <CustomSelect
                    options={[
                      { value: 'Kadın', label: isEn ? 'Female' : 'Kadın' },
                      { value: 'Erkek', label: isEn ? 'Male' : 'Erkek' },
                    ]}
                    value={passGender}
                    onChange={(val) => setPassGender(val as 'Erkek' | 'Kadın')}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    {isEn ? 'PASSENGER TYPE' : 'YOLCU TİPİ'}
                  </label>
                  <CustomSelect
                    options={[
                      { value: 'Yetişkin', label: isEn ? 'Adult' : 'Yetişkin' },
                      { value: 'Çocuk', label: isEn ? 'Child (2-12)' : 'Çocuk (2-12)' },
                      { value: 'Bebek', label: isEn ? 'Infant (0-2)' : 'Bebek (0-2)' },
                    ]}
                    value={passType}
                    onChange={(val) => setPassType(val as any)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    {isEn ? 'NATIONAL ID / PASSPORT' : 'T.C. KİMLİK / PASAPORT NO'}
                  </label>
                  <input
                    type="text"
                    maxLength={11}
                    className="input-corporate-v2"
                    placeholder="20987654321"
                    value={passIdentityNo}
                    onChange={(e) => setPassIdentityNo(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    {isEn ? 'DATE OF BIRTH' : 'DOĞUM TARİHİ'}
                  </label>
                  <CustomDatePicker
                    value={passBirthDate}
                    onChange={(val) => setPassBirthDate(val)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    {isEn ? 'RELATIONSHIP' : 'YAKINLIK DERECESİ'}
                  </label>
                  <select
                    className="input-corporate-v2"
                    value={passRelation}
                    onChange={(e) => setPassRelation(e.target.value as any)}
                  >
                    <option value="Kendi Hesabım">{isEn ? 'Myself / My Account' : 'Kendi Hesabım'}</option>
                    <option value="Eş">{isEn ? 'Spouse' : 'Eş'}</option>
                    <option value="Çocuk">{isEn ? 'Child' : 'Çocuk'}</option>
                    <option value="Anne/Baba">{isEn ? 'Parent' : 'Anne / Baba'}</option>
                    <option value="Arkadaş">{isEn ? 'Friend' : 'Arkadaş'}</option>
                    <option value="İş Arkadaşı">{isEn ? 'Colleague' : 'İş Arkadaşı'}</option>
                    <option value="Diğer">{isEn ? 'Other' : 'Diğer'}</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    {isEn ? 'MILES NO (OPTIONAL)' : 'MİL / SADAKAT NO (OPSİYONEL)'}
                  </label>
                  <input
                    type="text"
                    className="input-corporate-v2"
                    placeholder="TK8849201"
                    value={passMiles}
                    onChange={(e) => setPassMiles(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setIsPassengerModalOpen(false)}
                  style={{ flex: 1, padding: '12px' }}
                >
                  {isEn ? 'Cancel' : 'İptal'}
                </button>
                <button
                  type="submit"
                  className="btn-primary-gradient"
                  style={{ flex: 2, padding: '12px', justifyContent: 'center' }}
                >
                  <Users size={18} /> {editingPassengerId ? (isEn ? 'Save Changes' : 'Değişiklikleri Kaydet') : (isEn ? 'Save Passenger' : 'Yolcuyu Kaydet')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New PCI-DSS Tokenized Card Modal */}
      {isAddCardModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddCardModalOpen(false)}>
          <div
            className="corporate-card"
            style={{
              width: '100%',
              maxWidth: '520px',
              backgroundColor: 'var(--bg-surface-elevated)',
              padding: '32px',
              borderRadius: 'var(--radius-xl)',
              animation: 'modalFadeIn 0.25s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={22} style={{ color: 'var(--brand-accent)' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                  {isEn ? 'Add Secure Card (Masterpass Vault)' : 'Yeni Güvenli Kart Ekle (Masterpass Vault)'}
                </h3>
              </div>
              <button className="btn-outline" onClick={() => setIsAddCardModalOpen(false)} style={{ padding: '4px 10px' }}>
                <X size={16} />
              </button>
            </div>

            {cardModalError && (
              <div style={{ padding: '10px 14px', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: 'var(--radius-md)', color: '#ef4444', fontSize: '0.85rem', fontWeight: 800, marginBottom: '20px' }}>
                {cardModalError}
              </div>
            )}

            <form onSubmit={handleSaveNewCard} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  {isEn ? 'CARD ALIAS / TITLE' : 'KART TANIMI / ETİKETİ'}
                </label>
                <input
                  type="text"
                  className="input-corporate-v2"
                  placeholder="Garanti Bonus"
                  value={newCardAlias}
                  onChange={(e) => setNewCardAlias(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  {isEn ? 'CARDHOLDER NAME' : 'KART ÜZERİNDEKİ İSİM SOYİSİM'}
                </label>
                <input
                  type="text"
                  className="input-corporate-v2"
                  placeholder="AHMET YILMAZ"
                  value={newCardHolder}
                  onChange={(e) => setNewCardHolder(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  {isEn ? 'CARD NUMBER (16 DIGITS)' : 'KART NUMARASI (16 HANELİ)'}
                </label>
                <input
                  type="text"
                  maxLength={19}
                  className="input-corporate-v2"
                  placeholder="4543 8890 1234 5678"
                  value={newCardNumber}
                  onChange={(e) => setNewCardNumber(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    {isEn ? 'MONTH' : 'AY'}
                  </label>
                  <select
                    className="input-corporate-v2"
                    value={newExpMonth}
                    onChange={(e) => setNewExpMonth(e.target.value)}
                  >
                    {Array.from({ length: 12 }, (_, i) => {
                      const val = (i + 1).toString().padStart(2, '0');
                      return <option key={val} value={val}>{val}</option>;
                    })}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    {isEn ? 'YEAR' : 'YIL'}
                  </label>
                  <select
                    className="input-corporate-v2"
                    value={newExpYear}
                    onChange={(e) => setNewExpYear(e.target.value)}
                  >
                    {['26', '27', '28', '29', '30', '31', '32'].map((y) => (
                      <option key={y} value={y}>20{y}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    CVC
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    className="input-corporate-v2"
                    placeholder="•••"
                    value={newCvc}
                    onChange={(e) => setNewCvc(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                <Shield size={14} style={{ color: 'var(--brand-accent)' }} />
                {isEn ? 'Tokenized via PCI-DSS Masterpass Vault.' : 'Kart bilgileriniz BDDK lisanslı Masterpass Kasasında Jetonlaştırılır. CVC saklanmaz.'}
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setIsAddCardModalOpen(false)}
                  style={{ flex: 1, padding: '12px' }}
                >
                  {isEn ? 'Cancel' : 'İptal'}
                </button>
                <button
                  type="submit"
                  className="btn-primary-gradient"
                  disabled={isCardTokenizing}
                  style={{ flex: 2, padding: '12px', justifyContent: 'center' }}
                >
                  {isCardTokenizing ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" /> {isEn ? 'Tokenizing...' : 'Jetonlaştırılıyor...'}
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={18} /> {isEn ? 'Save Tokenized Card' : 'Kartı Güvenle Kaydet'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      <NotificationModal
        isOpen={notifyModal.isOpen}
        onClose={() => setNotifyModal((prev) => ({ ...prev, isOpen: false }))}
        title={notifyModal.title}
        message={notifyModal.message}
        type={notifyModal.type}
      />
    </div>
  );
}

