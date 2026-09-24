'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FlightDto, BookingDto } from '@/types/api';
import { api } from '@/lib/api';
import { useTheme } from '@/context/ThemeContext';
import {
  Plane,
  Plus,
  Users,
  DollarSign,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Shield,
  RefreshCw,
  LayoutDashboard,
  ClipboardList,
  UserCheck,
  Settings,
  ArrowLeft,
  Search,
  ChevronRight,
  TrendingUp,
  Sun,
  Moon,
  Trash2,
  AlertCircle,
  ShieldCheck,
  Ticket,
  Building2,
  History,
  Check,
  X,
  Filter,
  BarChart3,
  PanelLeftClose,
  PanelLeftOpen,
  Radio,
  Compass,
  Zap,
  Luggage,
  Utensils,
  Wrench,
  Fuel,
  Activity,
  Gauge,
  Navigation,
  Headphones,
  RotateCcw,
  Sparkles,
  CreditCard,
  Receipt,
  Eye,
  Inbox,
  CheckCheck,
  FileSpreadsheet,
  Printer,
  FileText,
  Armchair
} from 'lucide-react';
import { downloadEInvoicePdfOrPrint } from '@/lib/invoice';
import { NotificationModal } from '@/components/NotificationModal';

interface FleetAircraft {
  id: string;
  tailNumber: string;
  model: string;
  businessSeats: number;
  economySeats: number;
  year: number;
  status: 'Aktif Seyirde' | 'Hangarda Hazır' | 'Periyodik Bakımda';
  flightHours: number;
  nextCheck: string;
}

interface PendingRefundRequest {
  id: string;
  pnrCode: string;
  passengerName: string;
  flightNumber: string;
  route: string;
  totalAmount: number;
  requestedRefundAmount: number;
  reason: string;
  requestDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

import { AIRPORTS } from '@/data/airports';

// Master Airports Registry synced with global database
const AIRPORTS_REGISTRY = AIRPORTS;

interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone: string;
  tier: 'VIP Diamond' | 'Elite Plus' | 'Elite' | 'Classic Plus' | 'Classic';
  frequentFlyerNo: string;
  totalBookings: number;
  totalMiles: number;
  status: 'Aktif' | 'Askıda' | 'Doğrulanmış';
  registrationDate: string;
}

export default function AdminDashboard() {
  const { theme, toggleTheme } = useTheme();
  
  // Navigation & Layout States
  const [activeTab, setActiveTab] = useState<'overview' | 'flights' | 'manifest' | 'agent' | 'users' | 'telemetry' | 'fleet' | 'audit'>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Data States
  const [flights, setFlights] = useState<FlightDto[]>([]);
  const [bookings, setBookings] = useState<BookingDto[]>([]);
  const [fleetList, setFleetList] = useState<FleetAircraft[]>([
    { id: '1', tailNumber: 'TC-AQA', model: 'Boeing 787-9 Dreamliner', businessSeats: 30, economySeats: 270, year: 2024, status: 'Aktif Seyirde', flightHours: 1420, nextCheck: '14 Gün Sonra (A-Check)' },
    { id: '2', tailNumber: 'TC-AQB', model: 'Airbus A350-900', businessSeats: 32, economySeats: 293, year: 2023, status: 'Aktif Seyirde', flightHours: 980, nextCheck: '45 Gün Sonra (A-Check)' },
    { id: '3', tailNumber: 'TC-AQC', model: 'Airbus A321neo', businessSeats: 16, economySeats: 174, year: 2024, status: 'Hangarda Hazır', flightHours: 2100, nextCheck: 'Gözden Geçirildi' },
    { id: '4', tailNumber: 'TC-AQD', model: 'Boeing 777-300ER', businessSeats: 49, economySeats: 300, year: 2022, status: 'Periyodik Bakımda', flightHours: 4850, nextCheck: 'Bakım Devam Ediyor' },
  ]);

  // User-Initiated Pending Refunds Queue (Web/App İade Talepleri)
  const [pendingRefunds, setPendingRefunds] = useState<PendingRefundRequest[]>([
    {
      id: 'ref-101',
      pnrCode: 'AVQ-7721',
      passengerName: 'Mehmet Demir',
      flightNumber: 'VF2026',
      route: 'SAW ➔ LHR',
      totalAmount: 2200,
      requestedRefundAmount: 1870,
      reason: 'Sağlık mazeret belgesi ile web üzerinden uçuş iptal talebi',
      requestDate: 'Bugün 10:15',
      status: 'Pending',
    },
    {
      id: 'ref-102',
      pnrCode: 'AVQ-3340',
      passengerName: 'Elif Şahin',
      flightNumber: 'TK1984',
      route: 'IST ➔ BER',
      totalAmount: 1450,
      requestedRefundAmount: 1230,
      reason: 'Vize işlemlerindeki gecikme mazereti',
      requestDate: 'Dün 18:40',
      status: 'Pending',
    }
  ]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentTime, setCurrentTime] = useState<string>('');

  // Add Flight Form State (Auto-Fill Airport Selectors & Real DateTime Picker)
  const [flightNumber, setFlightNumber] = useState('AVQ-308');
  const [depAirportCode, setDepAirportCode] = useState('IST');
  const [arrAirportCode, setArrAirportCode] = useState('JFK');
  const [priceAmount, setPriceAmount] = useState(14500);
  const [aircraftModel, setAircraftModel] = useState('Boeing 787-9 Dreamliner');
  const [airlineNameInput, setAirlineNameInput] = useState('Aviqora Airways');
  const [departureDateTimeInput, setDepartureDateTimeInput] = useState(() => {
    const d = new Date(Date.now() + 86400000);
    return `${d.toISOString().split('T')[0]}T10:00`;
  });
  const [arrivalDateTimeInput, setArrivalDateTimeInput] = useState(() => {
    const d = new Date(Date.now() + 86400000);
    return `${d.toISOString().split('T')[0]}T13:30`;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Add Aircraft Modal State
  const [isAddAircraftOpen, setIsAddAircraftOpen] = useState(false);
  const [newTailReg, setNewTailReg] = useState('TC-AQE');
  const [newAircraftModel, setNewAircraftModel] = useState('Airbus A350-900');
  const [newBizSeats, setNewBizSeats] = useState(32);
  const [newEcoSeats, setNewEcoSeats] = useState(270);
  const [newMfgYear, setNewMfgYear] = useState(2025);

  // Flight Status Update Modal State
  const [selectedFlightForStatus, setSelectedFlightForStatus] = useState<FlightDto | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<string>('Scheduled');
  const [delayMinutes, setDelayMinutes] = useState<number>(15);
  const [delayReason, setDelayReason] = useState<string>('Kule Trafik Yoğunluğu');

  // Call Center / Agent Refund & Modification State
  const [selectedBookingForAction, setSelectedBookingForAction] = useState<BookingDto | null>(null);
  const [selectedBookingForModify, setSelectedBookingForModify] = useState<BookingDto | null>(null);
  const [newSeatCode, setNewSeatCode] = useState('2A');
  const [newMealChoice, setNewMealChoice] = useState('Vejetaryen Menü (Gurme)');
  const [actionModalType, setActionModalType] = useState<'refund' | 'modify' | 'notes' | null>(null);
  const [refundReason, setRefundReason] = useState('Müşteri Hizmetleri İptal Talebi');
  const [pnrSearchQuery, setPnrSearchQuery] = useState('');

  // AOCC Security Gate & 404 Masking State
  const [isAdminAuth, setIsAdminAuth] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const urlParams = new URLSearchParams(window.location.search);
    const key = urlParams.get('key');
    if (key === '2026' || key === 'aocc' || key === 'admin') {
      sessionStorage.setItem('aviqora_admin_auth', 'true');
      return true;
    }
    return sessionStorage.getItem('aviqora_admin_auth') === 'true';
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toUpperCase() === 'A') {
        setIsAdminAuth(true);
        sessionStorage.setItem('aviqora_admin_auth', 'true');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Notification Modal State
  const [notifyModal, setNotifyModal] = useState<{ isOpen: boolean; title?: string; message: string; type?: 'success' | 'error' | 'warning' | 'info' }>({
    isOpen: false,
    message: '',
  });

  const showAlert = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', title?: string) => {
    setNotifyModal({ isOpen: true, message, type, title });
  };

  // Map View Mode State (OpenStreetMap vs Visual Canvas)
  const [mapViewMode, setMapViewMode] = useState<'openstreetmap' | 'canvas'>('openstreetmap');

  // Radar Interactive Selected Flight
  const [radarSelectedFlight, setRadarSelectedFlight] = useState<{ flight: string; route: string; aircraft: string; alt: string; speed: string; captain: string; lat: number; lng: number } | null>({
    flight: 'AVQ204', route: 'IST ➔ JFK', aircraft: 'Boeing 787-9 (TC-AQA)', alt: '36,000 ft', speed: '485 kts (Mach 0.82)', captain: 'Kpt. Ahmet Yılmaz', lat: 41.0, lng: 28.9
  });

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<Array<{ id: string; time: string; user: string; action: string; category: string; ip: string }>>([
    { id: '1', time: '10:42', user: 'Baş Kaptan Pilot', action: 'TK1984 sefer durumunu [HAVADA] olarak güncelledi', category: 'Telemetri', ip: '192.168.1.104' },
    { id: '2', time: '09:15', user: 'Çağrı Merkezi Temsilcisi', action: 'AVQ-9842 PNR biletine ₺1,230 iade işlemi uyguladı', category: 'İade & Çağrı Merkezi', ip: '192.168.1.112' },
    { id: '3', time: '08:30', user: 'Teknik Filo Amiri', action: 'TC-AQE tescilli yeni Boeing 787-9 uçağı filoya katıldı', category: 'Filo Yönetimi', ip: '10.0.0.1' },
  ]);

  // Registered System Users State (5 Initial Users)
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([
    { id: 'usr-1', name: 'Ahmet Yılmaz', email: 'ahmet.yilmaz@aviqora.com', password: 'Ahmet123!', phone: '+90 532 111 2233', tier: 'VIP Diamond', frequentFlyerNo: 'TK9910482', totalBookings: 14, totalMiles: 142500, status: 'Aktif', registrationDate: '15.01.2024' },
    { id: 'usr-2', name: 'Ayşe Kaya', email: 'ayse.kaya@aviqora.com', password: 'Ayse123!', phone: '+90 535 222 3344', tier: 'Elite Plus', frequentFlyerNo: 'TK8849201', totalBookings: 8, totalMiles: 64200, status: 'Aktif', registrationDate: '22.03.2024' },
    { id: 'usr-3', name: 'Mehmet Demir', email: 'mehmet.demir@gmail.com', password: 'Mehmet123!', phone: '+90 542 333 4455', tier: 'Classic Plus', frequentFlyerNo: 'TK7720491', totalBookings: 5, totalMiles: 28100, status: 'Aktif', registrationDate: '10.05.2024' },
    { id: 'usr-4', name: 'Zeynep Şahin', email: 'zeynep.sahin@hotmail.com', password: 'Zeynep123!', phone: '+90 555 444 5566', tier: 'Elite', frequentFlyerNo: 'TK6610382', totalBookings: 7, totalMiles: 45800, status: 'Aktif', registrationDate: '04.07.2024' },
    { id: 'usr-5', name: 'Can Yıldız', email: 'can.yildiz@outlook.com', password: 'Can123!', phone: '+90 505 555 6677', tier: 'Classic', frequentFlyerNo: 'TK5501928', totalBookings: 2, totalMiles: 12400, status: 'Aktif', registrationDate: '01.09.2024' },
  ]);

  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserTier, setNewUserTier] = useState<'VIP Diamond' | 'Elite Plus' | 'Elite' | 'Classic Plus' | 'Classic'>('Classic');

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    const newUser: RegisteredUser = {
      id: `usr-${Date.now()}`,
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      phone: newUserPhone.trim() || '+90 500 000 0000',
      tier: newUserTier,
      frequentFlyerNo: `TK${Math.floor(1000000 + Math.random() * 9000000)}`,
      totalBookings: 0,
      totalMiles: 500,
      status: 'Aktif',
      registrationDate: new Date().toLocaleDateString('tr-TR'),
    };

    setRegisteredUsers([newUser, ...registeredUsers]);
    
    const newLog = {
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      user: 'Baş Kaptan Pilot',
      action: `Yeni müşteri üye kaydı oluşturuldu: ${newUser.name} (${newUser.email}) - ${newUser.tier}`,
      category: 'Kullanıcı Yönetimi',
      ip: '192.168.1.104'
    };
    setAuditLogs([newLog, ...auditLogs]);

    setNewUserName('');
    setNewUserEmail('');
    setNewUserPhone('');
    setNewUserTier('Classic');
    setIsAddUserOpen(false);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    setCurrentTime(new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    return () => clearInterval(timer);
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [flightsData, bookingsData] = await Promise.all([
        api.flights.search(),
        api.bookings.getAll().catch(() => []),
      ]);
      setFlights(flightsData);
      setBookings(bookingsData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Operasyonel veriler yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleAddFlight = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMsg(null);
    setError(null);

    const depAp = AIRPORTS_REGISTRY.find(a => a.code === depAirportCode) || AIRPORTS_REGISTRY[0];
    const arrAp = AIRPORTS_REGISTRY.find(a => a.code === arrAirportCode) || AIRPORTS_REGISTRY[7];

    try {
      const depDate = new Date(departureDateTimeInput);
      const arrDate = new Date(arrivalDateTimeInput);

      const newFlightData: Partial<FlightDto> = {
        id: `flight-${Date.now()}`,
        flightNumber: flightNumber.trim().toUpperCase(),
        departureAirportCode: depAp.code,
        departureAirportName: depAp.name,
        arrivalAirportCode: arrAp.code,
        arrivalAirportName: arrAp.name,
        departureTime: depDate.toISOString(),
        arrivalTime: arrDate.toISOString(),
        priceAmount: Number(priceAmount),
        priceCurrency: 'TRY',
        aircraftModel,
        availableSeatsCount: 180,
        airlineName: airlineNameInput || 'Aviqora Airways',
        isDirect: true,
        status: 'Scheduled',
        gate: 'Gate B14',
      };

      const created = await api.flights.create(newFlightData);
      setFlights([created, ...flights]);
      
      const newLog = {
        id: Date.now().toString(),
        time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        user: 'Baş Kaptan Pilot',
        action: `${created.flightNumber} (${created.departureAirportCode} ➔ ${created.arrivalAirportCode}) seferi ₺${created.priceAmount} fiyatla yayınlandı`,
        category: 'Yeni Sefer',
        ip: '192.168.1.104'
      };
      setAuditLogs([newLog, ...auditLogs]);

      setSuccessMsg(`Yeni uçuş seferi (${created.flightNumber}) başarıyla yayınlandı. Kullanıcı arama ekranında anında görüntülenecektir.`);
      setFlightNumber(`AVQ-${Math.floor(100 + Math.random() * 900)}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Uçuş eklenirken hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddAircraftToFleet = (e: React.FormEvent) => {
    e.preventDefault();
    const newAc: FleetAircraft = {
      id: `ac-${Date.now()}`,
      tailNumber: newTailReg.trim().toUpperCase(),
      model: newAircraftModel,
      businessSeats: newBizSeats,
      economySeats: newEcoSeats,
      year: newMfgYear,
      status: 'Hangarda Hazır',
      flightHours: 0,
      nextCheck: 'Sertifikalı Hazır',
    };
    setFleetList([newAc, ...fleetList]);
    setIsAddAircraftOpen(false);

    const newLog = {
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      user: 'Filo Teknik Yöneticisi',
      action: `${newAc.tailNumber} tescilli yeni ${newAc.model} uçağı filoya başarıyla katıldı`,
      category: 'Filo Varlık Tanımlama',
      ip: '192.168.1.104'
    };
    setAuditLogs([newLog, ...auditLogs]);
  };

  const handleApprovePendingRefund = async (req: PendingRefundRequest) => {
    try {
      await api.bookings.refund(req.pnrCode, req.requestedRefundAmount, req.reason);
      setPendingRefunds(pendingRefunds.map(r => r.id === req.id ? { ...r, status: 'Approved' } : r));

      setBookings(bookings.map((b) => {
        if (b.pnrCode === req.pnrCode) {
          return { ...b, status: 'Refunded', refundAmount: req.requestedRefundAmount };
        }
        return b;
      }));

      const newLog = {
        id: Date.now().toString(),
        time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        user: 'Çağrı Merkezi Amiri',
        action: `Müşteri talepli ${req.pnrCode} PNR bilet iadesi (₺${req.requestedRefundAmount}) onaylandı ve kart hesabına aktarıldı`,
        category: 'Web İade Onayı',
        ip: '192.168.1.112'
      };
      setAuditLogs([newLog, ...auditLogs]);
    } catch {
      showAlert('İade onaylanamadı.', 'error');
    }
  };

  const handleRejectPendingRefund = (reqId: string) => {
    setPendingRefunds(pendingRefunds.map(r => r.id === reqId ? { ...r, status: 'Rejected' } : r));
  };

  const handlePerformStatusUpdate = async () => {
    if (!selectedFlightForStatus) return;
    try {
      await api.flights.updateStatus(
        selectedFlightForStatus.id,
        selectedMilestone,
        selectedMilestone === 'Delayed' ? delayMinutes : 0,
        selectedMilestone === 'Delayed' ? delayReason : undefined
      );

      setFlights(flights.map((f) => {
        if (f.id === selectedFlightForStatus.id) {
          return {
            ...f,
            status: selectedMilestone as any,
            delayMinutes: selectedMilestone === 'Delayed' ? delayMinutes : undefined,
            delayReason: selectedMilestone === 'Delayed' ? delayReason : undefined,
          };
        }
        return f;
      }));

      const newLog = {
        id: Date.now().toString(),
        time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        user: 'Baş Kaptan Pilot',
        action: `${selectedFlightForStatus.flightNumber} sefer durumu [${selectedMilestone}] olarak güncellendi`,
        category: 'Durum Güncelleme',
        ip: '192.168.1.104'
      };
      setAuditLogs([newLog, ...auditLogs]);
      setSelectedFlightForStatus(null);
    } catch {
      showAlert('Durum güncellenirken bir hata oluştu.', 'error');
    }
  };

  const handlePerformRefund = async () => {
    if (!selectedBookingForAction) return;
    try {
      const refundAmt = Math.round(selectedBookingForAction.totalAmount * 0.85);
      await api.bookings.refund(selectedBookingForAction.pnrCode, refundAmt, refundReason);
      
      setBookings(bookings.map((b) => {
        if (b.pnrCode === selectedBookingForAction.pnrCode) {
          return { ...b, status: 'Refunded', refundAmount: refundAmt };
        }
        return b;
      }));

      const newLog = {
        id: Date.now().toString(),
        time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        user: 'Çağrı Merkezi Temsilcisi',
        action: `${selectedBookingForAction.pnrCode} PNR biletine ₺${refundAmt} iade onaylandı (${refundReason})`,
        category: 'Müşteri Hizmetleri İade',
        ip: '192.168.1.112'
      };
      setAuditLogs([newLog, ...auditLogs]);

      setSelectedBookingForAction(null);
      setActionModalType(null);
    } catch {
      showAlert('İade işlemi tamamlanamadı.', 'error');
    }
  };

  const handleSaveSeatAndMeal = () => {
    if (!selectedBookingForModify) return;
    const updated: BookingDto[] = bookings.map((b) => {
      if (b.pnrCode === selectedBookingForModify.pnrCode) {
        const passengers = b.passengers && b.passengers.length > 0
          ? b.passengers.map((p, idx) => idx === 0 ? { ...p, seatCode: newSeatCode.toUpperCase() } : p)
          : [{ passengerName: 'Değerli Müşterimiz', seatCode: newSeatCode.toUpperCase(), identityNumber: '11111111111' }];
        return { ...b, passengers, mealPreference: newMealChoice };
      }
      return b;
    });

    setBookings(updated);
    try {
      localStorage.setItem('aviqora_bookings', JSON.stringify(updated));
    } catch {}

    const newLog = {
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      user: 'Çağrı Merkezi Temsilcisi',
      action: `${selectedBookingForModify.pnrCode} PNR koltuk [${newSeatCode.toUpperCase()}] ve ikram [${newMealChoice}] olarak güncellendi`,
      category: 'Bilet Değişikliği',
      ip: '192.168.1.112'
    };
    setAuditLogs([newLog, ...auditLogs]);
    setSelectedBookingForModify(null);
  };

  const handleDeleteFlight = async (flightId: string, flightNum: string) => {
    if (!confirm(`${flightNum} numaralı uçuş seferini silmek ve sistemden kaldırmak istediğinize emin misiniz?`)) return;
    try {
      await api.flights.delete(flightId);
      setFlights(flights.filter((f) => f.id !== flightId));
      
      const newLog = {
        id: Date.now().toString(),
        time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        user: 'Baş Kaptan Pilot',
        action: `${flightNum} seferi sistemden silindi`,
        category: 'Sefer Silme',
        ip: '192.168.1.104'
      };
      setAuditLogs([newLog, ...auditLogs]);
    } catch {
      showAlert('Uçuş silinemedi.', 'error');
    }
  };

  // Filtered flights
  const filteredFlights = flights.filter((f) => {
    const matchesSearch =
      f.flightNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.departureAirportCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.arrivalAirportCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.departureAirportName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.arrivalAirportName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' ? true : (f.status || 'Scheduled').toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  // Filtered Bookings for PNR Search
  const filteredBookings = bookings.filter((b) => {
    if (!pnrSearchQuery.trim()) return true;
    const q = pnrSearchQuery.toLowerCase().trim();
    const pnrMatch = b.pnrCode?.toLowerCase().includes(q);
    const nameMatch = b.passengers?.some((p) => p.passengerName?.toLowerCase().includes(q));
    const flightMatch = b.flightNumber?.toLowerCase().includes(q);
    const routeMatch = `${b.departureAirport} ${b.arrivalAirport}`.toLowerCase().includes(q);
    return pnrMatch || nameMatch || flightMatch || routeMatch;
  });

  // Calculate Metrics
  const totalSeats = flights.reduce((sum, f) => sum + f.availableSeatsCount, 0);
  const totalRevenue = flights.reduce((sum, f) => sum + (f.priceAmount * (180 - f.availableSeatsCount)), 0) + 98500;
  const refundedTotal = bookings.filter(b => b.status === 'Refunded').reduce((sum, b) => sum + (b.refundAmount || b.totalAmount * 0.85), 0) + 1230;
  const netRevenue = totalRevenue - refundedTotal;
  const occupancyRate = flights.length > 0 ? Math.round((1 - totalSeats / (flights.length * 180)) * 100) || 76 : 78;

  if (!isAdminAuth) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center' }}>
        <div style={{ fontSize: '6rem', fontWeight: 900, color: 'var(--brand-accent)', lineHeight: 1 }}>404</div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '12px' }}>
          Aradığınız Sayfa Bulunamadı
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: '460px', margin: '10px 0 24px' }}>
          Ulaşmaya çalıştığınız web adresi silinmiş, ismi değiştirilmiş veya geçici olarak erişilemiyor olabilir.
        </p>
        <Link href="/" className="btn-brand" style={{ padding: '12px 28px', fontSize: '0.9rem', textDecoration: 'none' }}>
          ← Anasayfaya Dön
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', transition: 'var(--transition-smooth)' }}>
      
      {/* 1. COLLAPSIBLE FIXED SIDEBAR */}
      <aside
        style={{
          width: isSidebarCollapsed ? '80px' : '260px',
          backgroundColor: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: isSidebarCollapsed ? '20px 12px' : '24px 18px',
          flexShrink: 0,
          transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 90,
        }}
      >
        <div>
          {/* Logo & Toggle Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: isSidebarCollapsed ? 'center' : 'space-between', marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--brand-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontWeight: 900, boxShadow: 'var(--shadow-sm)', flexShrink: 0 }}>
                AQ
              </div>
              {!isSidebarCollapsed && (
                <div>
                  <div style={{ fontWeight: 900, fontSize: '1.1rem', letterSpacing: '0.05em', color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                    AVIQORA
                  </div>
                  <div style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--brand-gold)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                    AOCC CONTROL
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
              }}
              title={isSidebarCollapsed ? 'Sidebar Genişlet' : 'Sidebar Daralt'}
            >
              {isSidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              { id: 'overview', label: 'Genel Bakış & Ciro', icon: LayoutDashboard },
              { id: 'flights', label: 'Uçuş Sefer Yönetimi', icon: Plane },
              { id: 'manifest', label: 'PNR Yolcu Manifestosu', icon: ClipboardList },
              { id: 'agent', label: 'Müşteri Destek & İade', icon: Headphones },
              { id: 'users', label: 'Kayıtlı Müşteri & Üyeler (5)', icon: Users },
              { id: 'telemetry', label: 'Canlı Radar & Telemetri', icon: Navigation },
              { id: 'fleet', label: 'Filo Varlık & Bakım', icon: Wrench },
              { id: 'audit', label: 'Operasyonel Denetim', icon: History },
            ].map((item) => {
              const isActive = activeTab === item.id;
              const IconComp = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  title={isSidebarCollapsed ? item.label : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
                    padding: isSidebarCollapsed ? '12px 0' : '11px 14px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    color: isActive ? 'var(--brand-accent)' : 'var(--text-secondary)',
                    backgroundColor: isActive ? 'var(--bg-surface)' : 'transparent',
                    border: isActive ? '1px solid var(--border-color)' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)',
                    width: '100%',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <IconComp size={18} style={{ color: isActive ? 'var(--brand-accent)' : 'var(--text-muted)', flexShrink: 0 }} />
                    {!isSidebarCollapsed && <span>{item.label}</span>}
                  </div>
                  {!isSidebarCollapsed && isActive && <ChevronRight size={14} style={{ color: 'var(--brand-accent)' }} />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          
          <button
            onClick={toggleTheme}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
              padding: isSidebarCollapsed ? '10px 0' : '8px 12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
            title="Tema Değiştir"
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
              {!isSidebarCollapsed && 'Tema'}
            </span>
            {!isSidebarCollapsed && (
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>
                {theme === 'light' ? 'Aydınlık' : 'Karanlık'}
              </span>
            )}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: isSidebarCollapsed ? '8px 0' : '10px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', justifyContent: isSidebarCollapsed ? 'center' : 'flex-start' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: 'var(--brand-accent)', color: '#ffffff', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', flexShrink: 0 }}>
              ADM
            </div>
            {!isSidebarCollapsed && (
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)' }}>Baş Kaptan Pilot</div>
                <div style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 700 }}>● AOCC SuperAdmin</div>
              </div>
            )}
          </div>

          <Link
            href="/"
            className="btn-outline"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: isSidebarCollapsed ? '8px 0' : '8px',
              fontSize: '0.78rem',
              textDecoration: 'none',
              width: '100%',
            }}
            title="Müşteri Web Sitesine Dön"
          >
            <ArrowLeft size={15} /> {!isSidebarCollapsed && 'Müşteri Sitesi'}
          </Link>
        </div>
      </aside>

      {/* 2. MAIN OPERATIONAL CONTENT AREA */}
      <main style={{ flex: 1, padding: '32px 36px', overflowY: 'auto' }}>
        
        {/* Top Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', borderBottom: '1px solid var(--border-color)', paddingBottom: '18px' }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--brand-accent)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Shield size={14} /> AVIQORA AIRLINES OPERATIONS CONTROL CENTER (AOCC)
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '4px' }}>
              {activeTab === 'overview' && 'Operasyonel Genel Bakış & Finansal Ciro'}
              {activeTab === 'flights' && 'Uçuş Sefer Yönetimi & Kapı Kontrolü'}
              {activeTab === 'manifest' && 'PNR Bilet Kayıtları & Yolcu Manifestosu'}
              {activeTab === 'agent' && 'Müşteri Hizmetleri & İade Konsolu'}
              {activeTab === 'users' && 'Kayıtlı Müşteriler & Miles Programı Üyeleri'}
              {activeTab === 'telemetry' && 'Görsel Canlı Uçuş Radar Haritası & Telemetri'}
              {activeTab === 'fleet' && 'Filo Varlık Tanımlama & Bakım Yönetimi'}
              {activeTab === 'audit' && 'Operasyonel Denetim & Sistem Günlükleri'}
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 800, color: 'var(--brand-gold)', backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
              <Clock size={14} /> Canlı Saat: <strong style={{ color: 'var(--text-primary)' }}>{currentTime} TRT</strong>
            </div>

            <button
              onClick={loadAllData}
              className="btn-outline"
              style={{ padding: '8px 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} style={{ color: 'var(--brand-accent)' }} /> Yenile
            </button>
          </div>
        </div>

        {/* ------------------- MODULE 1: OVERVIEW & REVENUE ------------------- */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '18px', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Brüt Bilet Ciro</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--brand-gold)', marginTop: '2px' }}>₺{totalRevenue.toLocaleString('tr-TR')}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--brand-gold)', fontWeight: 700, marginTop: '4px' }}>Satılan Bilet Hacmi</div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '18px', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>İade Edilen Tutar</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ef4444', marginTop: '2px' }}>₺{refundedTotal.toLocaleString('tr-TR')}</div>
                <div style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 700, marginTop: '4px' }}>Manüel Müşteri İadeleri</div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '18px', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Net Faaliyet Geliri</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#10b981', marginTop: '2px' }}>₺{netRevenue.toLocaleString('tr-TR')}</div>
                <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700, marginTop: '4px' }}>Net Banka Hesabı Hacmi</div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '18px', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Ekstra İkram & Bagaj Geliri</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--brand-accent)', marginTop: '2px' }}>₺18,450</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--brand-accent)', fontWeight: 700, marginTop: '4px' }}>Ancillary Revenue</div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '18px', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Filo Doluluk Oranı</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#a855f7', marginTop: '2px' }}>%{occupancyRate}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700, marginTop: '4px' }}>Koltuk Kapasitesi {totalSeats}</div>
              </div>
            </div>

            {/* Quick Operational Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '24px', borderRadius: 'var(--radius-xl)' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building2 size={18} style={{ color: 'var(--brand-accent)' }} /> Operasyonel Havalimanı Durumları
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { hub: 'İstanbul Havalimanı (IST Hub)', flights: `${flights.length} Aktif Sefer`, status: 'Açık / Pürüzsüz', color: '#10b981' },
                    { hub: 'London Heathrow (LHR Hub)', flights: '8 Aktif Sefer', status: 'Yoğun Kule Trafiği', color: '#f59e0b' },
                    { hub: 'New York JFK (JFK Hub)', flights: '4 Aktif Sefer', status: 'Açık / Pürüzsüz', color: '#10b981' },
                  ].map((h) => (
                    <div key={h.hub} style={{ padding: '12px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>{h.hub}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>{h.flights}</div>
                      </div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: h.color, backgroundColor: 'rgba(37, 99, 235, 0.08)', padding: '3px 8px', borderRadius: '4px' }}>
                        ● {h.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '24px', borderRadius: 'var(--radius-xl)' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Wrench size={18} style={{ color: 'var(--brand-gold)' }} /> Filo Varlık Hazırlık Durumu
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {fleetList.map((ac) => (
                    <div key={ac.id} style={{ padding: '12px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--brand-accent)' }}>{ac.tailNumber} ({ac.model})</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Kapasite: {ac.businessSeats} Biz / {ac.economySeats} Eco</div>
                      </div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: ac.status === 'Aktif Seyirde' ? '#10b981' : ac.status === 'Hangarda Hazır' ? 'var(--brand-accent)' : '#f59e0b' }}>
                        ● {ac.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ------------------- MODULE 2: FLIGHT OPERATIONS ------------------- */}
        {activeTab === 'flights' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '28px', alignItems: 'start' }}>
              
              {/* Form with Auto-Fill Airports Registry */}
              <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '28px', borderRadius: 'var(--radius-xl)' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Plus size={18} style={{ color: 'var(--brand-accent)' }} /> Yeni Uçuş Seferi Yayınla
                </h3>

                {successMsg && (
                  <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981', padding: '12px', borderRadius: 'var(--radius-md)', marginBottom: '18px', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle size={16} /> {successMsg}
                  </div>
                )}

                <form onSubmit={handleAddFlight} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Uçuş Kodu (Flight Number)
                    </label>
                    <input
                      type="text"
                      required
                      className="input-corporate"
                      placeholder="AVQ-204"
                      style={{ textTransform: 'uppercase', fontWeight: 800, height: '42px' }}
                      value={flightNumber}
                      onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>Kalkış Havalimanı (Auto-Fill)</label>
                      <select
                        className="input-corporate"
                        style={{ height: '40px', fontWeight: 700 }}
                        value={depAirportCode}
                        onChange={(e) => setDepAirportCode(e.target.value)}
                      >
                        {AIRPORTS_REGISTRY.map((a) => (
                          <option key={a.code} value={a.code}>{a.code} - {a.city} ({a.country})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>Varış Havalimanı (Auto-Fill)</label>
                      <select
                        className="input-corporate"
                        style={{ height: '40px', fontWeight: 700 }}
                        value={arrAirportCode}
                        onChange={(e) => setArrAirportCode(e.target.value)}
                      >
                        {AIRPORTS_REGISTRY.map((a) => (
                          <option key={a.code} value={a.code}>{a.code} - {a.city} ({a.country})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>Kalkış Tarihi & Saati</label>
                      <input
                        type="datetime-local"
                        required
                        className="input-corporate"
                        style={{ height: '40px', fontWeight: 700 }}
                        value={departureDateTimeInput}
                        onChange={(e) => setDepartureDateTimeInput(e.target.value)}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>Varış Tarihi & Saati</label>
                      <input
                        type="datetime-local"
                        required
                        className="input-corporate"
                        style={{ height: '40px', fontWeight: 700 }}
                        value={arrivalDateTimeInput}
                        onChange={(e) => setArrivalDateTimeInput(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>Havayolu Şirketi</label>
                      <select
                        className="input-corporate"
                        style={{ height: '40px', fontWeight: 700 }}
                        value={airlineNameInput}
                        onChange={(e) => setAirlineNameInput(e.target.value)}
                      >
                        <option value="Aviqora Airways">Aviqora Airways</option>
                        <option value="Aviqora Express">Aviqora Express</option>
                        <option value="Turkish Airlines (THY)">Turkish Airlines (THY)</option>
                        <option value="Pegasus Airlines">Pegasus Airlines</option>
                        <option value="Emirates Partner">Emirates Partner</option>
                        <option value="Lufthansa Alliance">Lufthansa Alliance</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>Uçak Tipi / Filo</label>
                      <select
                        className="input-corporate"
                        style={{ height: '40px', fontWeight: 600 }}
                        value={aircraftModel}
                        onChange={(e) => setAircraftModel(e.target.value)}
                      >
                        {fleetList.map((f) => (
                          <option key={f.id} value={`${f.model} (${f.tailNumber})`}>{f.model} ({f.tailNumber})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>Taban Bilet Fiyatı (₺)</label>
                      <input type="number" required min={500} className="input-corporate" style={{ fontWeight: 800, height: '40px' }} value={priceAmount} onChange={(e) => setPriceAmount(Number(e.target.value))} />
                    </div>
                  </div>

                  <button type="submit" disabled={isSubmitting} className="btn-brand" style={{ width: '100%', height: '44px', marginTop: '6px' }}>
                    {isSubmitting ? 'Uçuş Yayınlanıyor...' : 'Uçuş Seferini Sisteme Ekle & Yayınla'}
                  </button>
                </form>
              </div>

              {/* List with Professional Empty State */}
              <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '28px', borderRadius: 'var(--radius-xl)' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Plane size={18} style={{ color: 'var(--brand-accent)' }} /> Sefer Kontrol Listesi ({filteredFlights.length})
                </h3>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      placeholder="Uçuş kodu veya havalimanı ara..."
                      className="input-corporate"
                      style={{ paddingLeft: '36px', height: '38px', fontSize: '0.82rem' }}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <select
                    className="input-corporate"
                    style={{ width: '130px', height: '38px', fontSize: '0.8rem', fontWeight: 700 }}
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">Tüm Durumlar</option>
                    <option value="scheduled">Planlandı</option>
                    <option value="boarding">Kapı Açık</option>
                    <option value="inair">Havada</option>
                    <option value="landed">İndi</option>
                    <option value="delayed">Rötar</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto' }}>
                  {filteredFlights.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: 'var(--bg-surface)', border: '1px border-color', borderRadius: 'var(--radius-lg)' }}>
                      <Inbox size={32} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
                      <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>Arama Kriterlerine Uygun Uçuş Bulunamadı</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Farklı bir arama terimi veya durum filtresi deneyebilirsiniz.</div>
                    </div>
                  ) : (
                    filteredFlights.map((f) => (
                      <div key={f.id} style={{ padding: '14px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 900, color: 'var(--brand-accent)', fontSize: '0.9rem' }}>{f.flightNumber}</div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)' }}>{f.departureAirportCode} ➔ {f.arrivalAirportCode} ({f.aircraftModel})</div>
                        </div>
                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                          <div style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--text-primary)' }}>₺{f.priceAmount.toLocaleString('tr-TR')}</div>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button onClick={() => setSelectedFlightForStatus(f)} className="btn-outline" style={{ padding: '4px 8px', fontSize: '0.72rem', color: 'var(--brand-accent)' }}>
                              Durum Değiştir
                            </button>
                            <button onClick={() => handleDeleteFlight(f.id, f.flightNumber)} className="btn-outline" style={{ padding: '4px 8px', fontSize: '0.72rem', color: '#ef4444' }}>
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ------------------- MODULE 3: MANIFEST & BOOKINGS ------------------- */}
        {activeTab === 'manifest' && (
          <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '28px', borderRadius: 'var(--radius-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ClipboardList size={18} style={{ color: 'var(--brand-accent)' }} /> PNR Yolcu Kayıtları & Yolcu Manifestosu
              </h3>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                Sistemdeki Toplam Bilet: <strong>{bookings.length} Kayıt</strong>
              </span>
            </div>

            {/* PNR Manuel Search Bar */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="input-corporate"
                  placeholder="PNR Kodu (Örn: AVQ-7721), Yolcu Adı veya Sefer No ile Manuel Arama Yapın..."
                  value={pnrSearchQuery}
                  onChange={(e) => setPnrSearchQuery(e.target.value)}
                  style={{ paddingLeft: '42px', height: '44px', fontSize: '0.88rem', fontWeight: 700 }}
                />
              </div>
              {pnrSearchQuery && (
                <button
                  onClick={() => setPnrSearchQuery('')}
                  className="btn-outline"
                  style={{ height: '44px', padding: '0 16px', fontSize: '0.8rem' }}
                >
                  Temizle
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredBookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                  <Inbox size={32} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>Arama Kriterlerine Uygun PNR Bilet Kaydı Bulunamadı</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>PNR kodunu veya yolcu adını doğru yazdığınızdan emin olun.</div>
                </div>
              ) : (
                filteredBookings.map((b) => (
                  <div key={b.id} style={{ padding: '16px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.88rem', fontWeight: 900, color: 'var(--brand-accent)' }}>PNR: {b.pnrCode}</span>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: 'var(--radius-sm)', backgroundColor: b.status === 'Refunded' ? 'rgba(239, 68, 68, 0.15)' : b.status === 'CheckedIn' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)', color: b.status === 'Refunded' ? '#ef4444' : b.status === 'CheckedIn' ? '#10b981' : '#f59e0b' }}>
                          ● {b.status === 'Refunded' ? 'İADE EDİLDİ' : b.status === 'CheckedIn' ? 'CHECK-IN TAMAMLANDI' : 'ONAYLI'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {b.departureAirport} ➔ {b.arrivalAirport} ({b.flightNumber})
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        Yolcu: <strong>{b.passengers[0]?.passengerName || 'Ahmet Yılmaz'}</strong> • Koltuk: <strong style={{ color: 'var(--brand-accent)' }}>{b.passengers[0]?.seatCode || '1C'}</strong> • Menü: {b.mealPreference || 'Standart'}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                      <div style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--text-primary)' }}>₺{b.totalAmount}</div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => downloadEInvoicePdfOrPrint(b)}
                          className="btn-outline"
                          style={{ padding: '4px 8px', fontSize: '0.72rem', color: 'var(--brand-accent)', display: 'flex', alignItems: 'center', gap: '4px' }}
                          title="E-Bilet Faturasını PDF Olarak Yazdır / İndir"
                        >
                          <Printer size={13} /> Fatura PDF
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBookingForModify(b);
                            setNewSeatCode(b.passengers[0]?.seatCode || '2B');
                            setNewMealChoice(b.mealPreference || 'Vejetaryen Menü (Gurme)');
                          }}
                          className="btn-outline"
                          style={{ padding: '4px 8px', fontSize: '0.72rem', color: 'var(--brand-gold)', display: 'flex', alignItems: 'center', gap: '4px' }}
                          title="Koltuk Numarası ve İkram Menüsünü Güncelle"
                        >
                          <Armchair size={13} /> Koltuk/Menü
                        </button>
                        {b.status !== 'Refunded' && (
                          <button
                            onClick={() => {
                              setSelectedBookingForAction(b);
                              setActionModalType('refund');
                            }}
                            className="btn-outline"
                            style={{ padding: '4px 8px', fontSize: '0.72rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                          >
                            İade Et
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ------------------- MODULE 4: CALL CENTER / AGENT DESK (PENDING REFUNDS WORKFLOW) ------------------- */}
        {activeTab === 'agent' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* User-Initiated Pending Refund Requests Card */}
            <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '28px', borderRadius: 'var(--radius-xl)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Inbox size={18} style={{ color: 'var(--brand-gold)' }} /> Müşteri Web İade Talepleri (Onay Bekleyenler)
                </h3>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--brand-gold)', backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '4px 10px', borderRadius: '4px' }}>
                  {pendingRefunds.filter(r => r.status === 'Pending').length} Bekleyen Talep
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {pendingRefunds.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Onay bekleyen müşteri iade talebi bulunmamaktadır.
                  </div>
                ) : (
                  pendingRefunds.map((req) => (
                    <div key={req.id} style={{ padding: '16px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--brand-accent)' }}>PNR: {req.pnrCode}</span>
                          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)' }}>{req.passengerName}</span>
                          <span style={{ fontSize: '0.68rem', fontWeight: 800, color: req.status === 'Approved' ? '#10b981' : req.status === 'Rejected' ? '#ef4444' : 'var(--brand-gold)' }}>
                            ● {req.status === 'Approved' ? 'İADE ONAYLANDI' : req.status === 'Rejected' ? 'REDDEDİLDİ' : 'ONAY BEKLİYOR'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          Sefer: {req.flightNumber} ({req.route}) • Talep Edilen İade: <strong style={{ color: '#10b981' }}>₺{req.requestedRefundAmount}</strong>
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          Nedeni: {req.reason} ({req.requestDate})
                        </div>
                      </div>

                      {req.status === 'Pending' && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleApprovePendingRefund(req)}
                            className="btn-brand"
                            style={{ padding: '6px 12px', fontSize: '0.76rem', backgroundColor: '#10b981' }}
                          >
                            ✅ İadeyi Onayla
                          </button>
                          <button
                            onClick={() => handleRejectPendingRefund(req.id)}
                            className="btn-outline"
                            style={{ padding: '6px 12px', fontSize: '0.76rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                          >
                            ❌ Reddet
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Direct PNR Action Console */}
            <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '28px', borderRadius: 'var(--radius-xl)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Headphones size={18} style={{ color: 'var(--brand-accent)' }} /> Çağrı Merkezi Temsilci Müdahale Konsolu
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Telefondaki yolcunun PNR'ını aratıp koltuk değişikliği veya manüel iade başlatabilirsiniz.
                  </p>
                </div>
              </div>

              {/* PNR Search Bar inside Agent Desk */}
              <div style={{ position: 'relative', marginBottom: '18px' }}>
                <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="input-corporate"
                  placeholder="Canlı PNR Sorgula: PNR Kodu veya Yolcu İsmi Yazın..."
                  value={pnrSearchQuery}
                  onChange={(e) => setPnrSearchQuery(e.target.value)}
                  style={{ paddingLeft: '42px', height: '44px', fontSize: '0.88rem', fontWeight: 700 }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filteredBookings.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Aramanıza uygun PNR kaydı bulunamadı.
                  </div>
                ) : (
                  filteredBookings.map((b) => (
                    <div key={b.id} style={{ padding: '14px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 900, color: 'var(--brand-accent)' }}>PNR: {b.pnrCode} ({b.passengers[0]?.passengerName})</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Sefer: {b.flightNumber} • Koltuk: {b.passengers[0]?.seatCode || '1C'} • Statü: <strong>{b.status}</strong></div>
                      </div>

                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <button
                          onClick={() => downloadEInvoicePdfOrPrint(b)}
                          className="btn-outline"
                          style={{ padding: '6px 10px', fontSize: '0.74rem', color: 'var(--brand-accent)', display: 'flex', alignItems: 'center', gap: '4px' }}
                          title="E-Bilet Faturasını PDF Yazdır / İndir"
                        >
                          <Printer size={13} /> Fatura PDF
                        </button>

                        <button
                          onClick={() => {
                            setSelectedBookingForModify(b);
                            setNewSeatCode(b.passengers[0]?.seatCode || '2B');
                            setNewMealChoice(b.mealPreference || 'Vejetaryen Menü (Gurme)');
                          }}
                          className="btn-outline"
                          style={{ padding: '6px 10px', fontSize: '0.74rem', color: 'var(--brand-gold)', display: 'flex', alignItems: 'center', gap: '4px' }}
                          title="Koltuk Numarası ve İkram Menüsünü Güncelle"
                        >
                          <Armchair size={13} /> Koltuk/Menü
                        </button>

                        {b.status !== 'Refunded' ? (
                          <button
                            onClick={() => {
                              setSelectedBookingForAction(b);
                              setActionModalType('refund');
                            }}
                            className="btn-outline"
                            style={{ padding: '6px 12px', fontSize: '0.76rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                          >
                            Manüel İade Başlat
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '4px 10px', borderRadius: '4px' }}>
                            ● İADE EDİLDİ
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* ------------------- MODULE 5: INTERACTIVE RADAR & TELEMETRY ------------------- */}
        {activeTab === 'telemetry' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '24px', borderRadius: 'var(--radius-xl)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Compass size={18} style={{ color: 'var(--brand-accent)' }} /> Canlı Uçuş Takip Haritası & Telemetri
                  </h3>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                    Uçakların anlık enlem, boylam, irtifa (altitude) ve hız (knots) bilgilerini takip edin.
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {/* Map Mode Switcher */}
                  <div style={{ display: 'flex', backgroundColor: 'var(--bg-surface)', padding: '3px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <button
                      onClick={() => setMapViewMode('openstreetmap')}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: mapViewMode === 'openstreetmap' ? 'var(--brand-accent)' : 'transparent',
                        color: mapViewMode === 'openstreetmap' ? '#ffffff' : 'var(--text-secondary)',
                      }}
                    >
                      🗺️ OpenStreetMap Haritası
                    </button>
                    <button
                      onClick={() => setMapViewMode('canvas')}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: mapViewMode === 'canvas' ? 'var(--brand-accent)' : 'transparent',
                        color: mapViewMode === 'canvas' ? '#ffffff' : 'var(--text-secondary)',
                      }}
                    >
                      📡 Aero-Radar Canvas
                    </button>
                  </div>

                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>
                    ● CANLI VERİ AKIŞI
                  </span>
                </div>
              </div>

              {/* MAP DISPLAY: OPENSTREETMAP OR CANVAS */}
              {mapViewMode === 'openstreetmap' ? (
                <div style={{ position: 'relative', width: '100%', height: '360px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                  <iframe
                    title="OpenStreetMap Live Flight Tracker"
                    width="100%"
                    height="100%"
                    style={{ border: 'none' }}
                    src="https://www.openstreetmap.org/export/embed.html?bbox=20.0%2C35.0%2C45.0%2C55.0&amp;layer=mapnik&amp;marker=41.261%2C28.742"
                  />
                  <div style={{ position: 'absolute', bottom: '12px', left: '12px', backgroundColor: 'rgba(15, 23, 42, 0.88)', backdropFilter: 'blur(8px)', color: '#ffffff', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.15)', fontSize: '0.78rem', zIndex: 10 }}>
                    <div style={{ fontWeight: 900, color: 'var(--brand-gold)' }}>● OpenStreetMap ADS-B Radar Katmanı</div>
                    <div>IST Hub (İstanbul), LHR (Londra) & JFK (New York) Seyir Uçuşları</div>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '320px',
                    backgroundColor: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-color)',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
                    <circle cx="50%" cy="50%" r="80" stroke="var(--border-color)" strokeWidth="1" fill="none" strokeDasharray="4,4" />
                    <circle cx="50%" cy="50%" r="140" stroke="var(--border-color)" strokeWidth="1" fill="none" strokeDasharray="4,4" />
                    <path d="M 180 160 Q 320 80 460 160" stroke="var(--brand-accent)" strokeWidth="2" fill="none" strokeDasharray="6,6" opacity="0.6" />
                    <path d="M 460 160 Q 600 220 740 140" stroke="var(--brand-gold)" strokeWidth="2" fill="none" strokeDasharray="6,6" opacity="0.6" />
                  </svg>

                  {[
                    { code: 'IST (Hub)', left: '22%', top: '48%' },
                    { code: 'LHR (London)', left: '46%', top: '38%' },
                    { code: 'JFK (New York)', left: '74%', top: '42%' },
                  ].map((node) => (
                    <div key={node.code} style={{ position: 'absolute', left: node.left, top: node.top, transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--brand-accent)', border: '2px solid #ffffff', boxShadow: '0 0 10px var(--brand-accent)' }} />
                      <span style={{ fontSize: '0.72rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '4px', backgroundColor: 'var(--bg-surface-elevated)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                        {node.code}
                      </span>
                    </div>
                  ))}

                  {[
                    { flight: 'AVQ204', route: 'IST ➔ JFK', aircraft: 'Boeing 787-9 (TC-AQA)', alt: '36,000 ft', speed: '485 kts (Mach 0.82)', captain: 'Kpt. Ahmet Yılmaz', left: '35%', top: '34%' },
                    { flight: 'TK1984', route: 'IST ➔ BER', aircraft: 'Airbus A321neo (TC-AQB)', alt: '32,000 ft', speed: '440 kts', captain: 'Kpt. Mehmet Sever', left: '60%', top: '56%' },
                  ].map((acPin) => (
                    <button
                      key={acPin.flight}
                      onClick={() => setRadarSelectedFlight(acPin as any)}
                      style={{ position: 'absolute', left: acPin.left, top: acPin.top, transform: 'translate(-50%, -50%)', background: 'none', border: 'none', cursor: 'pointer', zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                    >
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--brand-accent)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)' }}>
                        <Plane size={18} style={{ transform: 'rotate(45deg)' }} />
                      </div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#ffffff', backgroundColor: '#2563eb', padding: '2px 6px', borderRadius: '4px', marginTop: '2px' }}>
                        {acPin.flight}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {radarSelectedFlight && (
                <div style={{ marginTop: '16px', padding: '16px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--brand-accent)' }}>
                      Seçili Uçuş Telemetrisi: {radarSelectedFlight.flight} ({radarSelectedFlight.route})
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Uçak: <strong>{radarSelectedFlight.aircraft}</strong> • Kaptan: <strong>{radarSelectedFlight.captain}</strong>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                    <div>İrtifa: <strong style={{ color: 'var(--brand-accent)' }}>{radarSelectedFlight.alt}</strong></div>
                    <div>Seyir Hızı: <strong style={{ color: '#10b981' }}>{radarSelectedFlight.speed}</strong></div>
                  </div>
                </div>
              )}

              {/* ML.NET AI Prediction & Dynamic Pricing Dashboard Panel */}
              <div style={{ marginTop: '24px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--brand-gold)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Sparkles size={14} /> ML.NET MACHINE LEARNING AI ENGINE & TELEMETRY
                    </span>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '2px' }}>
                      Canlı Yapay Zeka Dinamik Fiyatlandırma & Rötar Tahmin Paneli
                    </h4>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.15)', padding: '4px 12px', borderRadius: '20px' }}>
                    C# ML.NET 9 MODELİ AKTİF
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  <div style={{ backgroundColor: 'var(--bg-surface)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>AVQ204 (IST ➔ JFK) Dinamik Fiyat Çarpanı</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--brand-accent)', marginTop: '4px' }}>1.45x <span style={{ fontSize: '0.85rem', color: '#ef4444' }}>(Surge Tarife - %85 Doluluk)</span></div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>ML Hesabı: ₺14.500 Taban ➔ ₺21.025 Dinamik Fiyat</div>
                  </div>

                  <div style={{ backgroundColor: 'var(--bg-surface)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>TK1984 (IST ➔ BER) AI Rötar Riski</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#f59e0b', marginTop: '4px' }}>%18 Risk <span style={{ fontSize: '0.85rem', color: '#10b981' }}>(Düşük Risk - Zamanında)</span></div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>METAR: 12 kts Rüzgar, 10 km Görüş (İdeal Şartlar)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------- MODULE 6: FLEET & MAINTENANCE ------------------- */}
        {activeTab === 'fleet' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '20px 28px', borderRadius: 'var(--radius-xl)' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Wrench size={18} style={{ color: 'var(--brand-accent)' }} /> AVIQORA Uçak Filosu & Varlık Yönetimi
                </h3>
              </div>

              <button onClick={() => setIsAddAircraftOpen(true)} className="btn-brand" style={{ padding: '10px 18px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={16} /> Filoya Yeni Uçak Ekle
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              {fleetList.map((ac) => (
                <div key={ac.id} style={{ padding: '18px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--brand-accent)' }}>{ac.tailNumber}</span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: ac.status === 'Aktif Seyirde' ? '#10b981' : ac.status === 'Hangarda Hazır' ? 'var(--brand-accent)' : '#f59e0b', backgroundColor: 'rgba(37, 99, 235, 0.08)', padding: '2px 6px', borderRadius: '4px' }}>
                      ● {ac.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)' }}>{ac.model}</div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '6px' }}>Kapasite: {ac.businessSeats} Biz / {ac.economySeats} Eco</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Toplam Uçuş: {ac.flightHours} Saat</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ------------------- MODULE 7: AUDIT LOGS ------------------- */}
        {activeTab === 'audit' && (
          <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '28px', borderRadius: 'var(--radius-xl)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <History size={18} style={{ color: 'var(--brand-accent)' }} /> Operasyonel Denetim & Sistem Günlükleri (Audit Trail)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {auditLogs.map((log) => (
                <div key={log.id} style={{ padding: '12px 16px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 900, color: 'var(--brand-accent)', backgroundColor: 'rgba(37, 99, 235, 0.1)', padding: '3px 8px', borderRadius: '4px' }}>
                      {log.time}
                    </span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {log.action}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                    [{log.category}] • {log.user} ({log.ip})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ------------------- MODULE 5: REGISTERED USERS MANAGEMENT ------------------- */}
        {activeTab === 'users' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '20px 28px', borderRadius: 'var(--radius-xl)' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={18} style={{ color: 'var(--brand-accent)' }} /> AVIQORA Üyelik & Yolcu Yönetim Paneli
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Sistemde kayıtlı toplam <strong>{registeredUsers.length} Müşteri Üyesi</strong> listelenmektedir.
                </p>
              </div>

              <button onClick={() => setIsAddUserOpen(true)} className="btn-brand" style={{ padding: '10px 18px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={16} /> Yeni Müşteri Üyesi Ekle
              </button>
            </div>

            {/* Registered Users Table */}
            <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <th style={{ padding: '14px 18px' }}>Müşteri Ad Soyad</th>
                      <th style={{ padding: '14px 18px' }}>E-Posta & İletişim</th>
                      <th style={{ padding: '14px 18px' }}>Giriş Şifresi</th>
                      <th style={{ padding: '14px 18px' }}>Üyelik Statüsü (Tier)</th>
                      <th style={{ padding: '14px 18px' }}>Miles No</th>
                      <th style={{ padding: '14px 18px' }}>Toplam Uçuş</th>
                      <th style={{ padding: '14px 18px' }}>Kazanılan Mil</th>
                      <th style={{ padding: '14px 18px' }}>Kayıt Tarihi</th>
                      <th style={{ padding: '14px 18px' }}>Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registeredUsers.map((usr) => (
                      <tr key={usr.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.15s' }}>
                        <td style={{ padding: '16px 18px', fontWeight: 800, color: 'var(--text-primary)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--brand-accent)', color: '#ffffff', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem' }}>
                              {usr.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <div>{usr.name}</div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>ID: {usr.id}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px 18px', color: 'var(--text-secondary)' }}>
                          <div>{usr.email}</div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{usr.phone}</div>
                        </td>
                        <td style={{ padding: '16px 18px' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 800, fontFamily: 'monospace', color: 'var(--brand-gold)', backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
                            {usr.password || 'Aviqora2026!'}
                          </span>
                        </td>
                        <td style={{ padding: '16px 18px' }}>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-sm)',
                            fontWeight: 800,
                            fontSize: '0.75rem',
                            backgroundColor: usr.tier === 'VIP Diamond' ? 'rgba(245, 158, 11, 0.15)' : usr.tier === 'Elite Plus' || usr.tier === 'Elite' ? 'rgba(37, 99, 235, 0.15)' : 'rgba(100, 116, 139, 0.15)',
                            color: usr.tier === 'VIP Diamond' ? 'var(--brand-gold)' : usr.tier === 'Elite Plus' || usr.tier === 'Elite' ? 'var(--brand-accent)' : 'var(--text-secondary)',
                            border: `1px solid ${usr.tier === 'VIP Diamond' ? 'rgba(245, 158, 11, 0.3)' : 'var(--border-color)'}`
                          }}>
                            {usr.tier}
                          </span>
                        </td>
                        <td style={{ padding: '16px 18px', fontWeight: 700, fontFamily: 'monospace', color: 'var(--brand-accent)' }}>
                          {usr.frequentFlyerNo}
                        </td>
                        <td style={{ padding: '16px 18px', fontWeight: 800, color: 'var(--text-primary)' }}>
                          {usr.totalBookings} Bilet
                        </td>
                        <td style={{ padding: '16px 18px', fontWeight: 800, color: '#10b981' }}>
                          {usr.totalMiles.toLocaleString('tr-TR')} Mil
                        </td>
                        <td style={{ padding: '16px 18px', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                          {usr.registrationDate}
                        </td>
                        <td style={{ padding: '16px 18px' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '3px 8px', borderRadius: '4px' }}>
                            ● {usr.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ------------------- ADD USER MODAL ------------------- */}
      {isAddUserOpen && (
        <div className="modal-overlay" onClick={() => setIsAddUserOpen(false)}>
          <div className="corporate-card" style={{ width: '100%', maxWidth: '480px', padding: '28px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-xl)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-primary)' }}>Yeni Müşteri / Yolcu Tanımla</h3>
              <button onClick={() => setIsAddUserOpen(false)} className="btn-outline" style={{ padding: '4px 8px' }}><X size={16} /></button>
            </div>

            <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>Ad Soyad</label>
                <input type="text" required className="input-corporate" placeholder="Örn: Selin Karaca" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>E-Posta Adresi</label>
                <input type="email" required className="input-corporate" placeholder="selin.karaca@aviqora.com" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>Telefon Numarası</label>
                <input type="tel" className="input-corporate" placeholder="+90 532 999 8877" value={newUserPhone} onChange={(e) => setNewUserPhone(e.target.value)} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>Miles & Smiles Üyelik Tier</label>
                <select className="input-corporate" style={{ height: '40px', fontWeight: 700 }} value={newUserTier} onChange={(e) => setNewUserTier(e.target.value as any)}>
                  <option value="Classic">Classic</option>
                  <option value="Classic Plus">Classic Plus</option>
                  <option value="Elite">Elite</option>
                  <option value="Elite Plus">Elite Plus</option>
                  <option value="VIP Diamond">VIP Diamond</option>
                </select>
              </div>

              <button type="submit" className="btn-brand" style={{ width: '100%', height: '44px', marginTop: '6px' }}>
                Kullanıcıyı Kaydet & Aktivasyonu Tamamla
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ------------------- ADD AIRCRAFT TO FLEET MODAL ------------------- */}
      {isAddAircraftOpen && (
        <div className="modal-overlay" onClick={() => setIsAddAircraftOpen(false)}>
          <div className="corporate-card" style={{ width: '100%', maxWidth: '480px', padding: '28px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-xl)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-primary)' }}>Filoya Yeni Uçak Ekle / Tanımla</h3>
              <button onClick={() => setIsAddAircraftOpen(false)} className="btn-outline" style={{ padding: '4px 8px' }}><X size={16} /></button>
            </div>

            <form onSubmit={handleAddAircraftToFleet} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>Tescil Kodu (Tail Registration Number)</label>
                <input type="text" required className="input-corporate" placeholder="TC-AQE" style={{ textTransform: 'uppercase', fontWeight: 800 }} value={newTailReg} onChange={(e) => setNewTailReg(e.target.value.toUpperCase())} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>Uçak Modeli</label>
                <select className="input-corporate" style={{ height: '40px', fontWeight: 600 }} value={newAircraftModel} onChange={(e) => setNewAircraftModel(e.target.value)}>
                  <option value="Boeing 787-9 Dreamliner">Boeing 787-9 Dreamliner</option>
                  <option value="Airbus A350-900">Airbus A350-900</option>
                  <option value="Airbus A321neo">Airbus A321neo</option>
                  <option value="Boeing 777-300ER">Boeing 777-300ER</option>
                  <option value="Airbus A330-300">Airbus A330-300</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>Business Koltuk</label>
                  <input type="number" required min={0} className="input-corporate" value={newBizSeats} onChange={(e) => setNewBizSeats(Number(e.target.value))} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>Economy Koltuk</label>
                  <input type="number" required min={50} className="input-corporate" value={newEcoSeats} onChange={(e) => setNewEcoSeats(Number(e.target.value))} />
                </div>
              </div>

              <button type="submit" className="btn-brand" style={{ width: '100%', height: '44px', marginTop: '6px' }}>
                Uçağı Filoya Kaydet
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ------------------- AGENT REFUND MODAL ------------------- */}
      {selectedBookingForAction && actionModalType === 'refund' && (
        <div className="modal-overlay" onClick={() => setSelectedBookingForAction(null)}>
          <div className="corporate-card" style={{ width: '100%', maxWidth: '480px', padding: '28px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-xl)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ef4444' }}>Manüel Bilet İade İşlemi (PNR: {selectedBookingForAction.pnrCode})</h3>
              <button onClick={() => setSelectedBookingForAction(null)} className="btn-outline" style={{ padding: '4px 8px' }}><X size={16} /></button>
            </div>

            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '14px', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: '0.82rem' }}>
              <div>Ödenen Bilet Tutar: <strong>₺{selectedBookingForAction.totalAmount}</strong></div>
              <div style={{ color: '#10b981', fontWeight: 800, marginTop: '4px' }}>Hesaplanan İade Tutarı (%85 Kesintisiz): <strong>₺{Math.round(selectedBookingForAction.totalAmount * 0.85)}</strong></div>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>İade Sebebi</label>
              <select className="input-corporate" style={{ height: '40px', fontSize: '0.8rem', fontWeight: 600 }} value={refundReason} onChange={(e) => setRefundReason(e.target.value)}>
                <option value="Müşteri Hizmetleri İptal Talebi">Müşteri Hizmetleri İptal Talebi</option>
                <option value="Sağlık Mazereti Belgesi">Sağlık Mazereti Belgesi Sunuldu</option>
                <option value="Operasyonel Sefer Değişikliği">Operasyonel Sefer Değişikliği</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handlePerformRefund} className="btn-brand" style={{ flex: 1, height: '42px', backgroundColor: '#ef4444' }}>İadeyi Onayla & Karta Aktar</button>
              <button onClick={() => setSelectedBookingForAction(null)} className="btn-outline" style={{ height: '42px', padding: '0 16px' }}>Vazgeç</button>
            </div>
          </div>
        </div>
      )}
      {/* ------------------- SEAT & MEAL MODIFICATION MODAL ------------------- */}
      {selectedBookingForModify && (
        <div className="modal-overlay" onClick={() => setSelectedBookingForModify(null)}>
          <div className="corporate-card" style={{ width: '100%', maxWidth: '480px', padding: '28px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-xl)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--brand-accent)' }}>Koltuk & İkram Menüsü Değiştir (PNR: {selectedBookingForModify.pnrCode})</h3>
              <button onClick={() => setSelectedBookingForModify(null)} className="btn-outline" style={{ padding: '4px 8px' }}><X size={16} /></button>
            </div>

            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '12px 14px', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: '0.8rem' }}>
              <div>Yolcu: <strong>{selectedBookingForModify.passengers[0]?.passengerName || 'Değerli Müşterimiz'}</strong></div>
              <div>Uçuş Seferi: <strong>{selectedBookingForModify.flightNumber} ({selectedBookingForModify.departureAirport} ➔ {selectedBookingForModify.arrivalAirport})</strong></div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSaveSeatAndMeal(); }} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>Yeni Koltuk Numarası</label>
                <input
                  type="text"
                  required
                  className="input-corporate"
                  placeholder="Örn: 2B, 14F, 1A"
                  style={{ textTransform: 'uppercase', fontWeight: 800, height: '42px' }}
                  value={newSeatCode}
                  onChange={(e) => setNewSeatCode(e.target.value.toUpperCase())}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>İkram & Yemek Tercihi</label>
                <select
                  className="input-corporate"
                  style={{ height: '42px', fontWeight: 700, fontSize: '0.85rem' }}
                  value={newMealChoice}
                  onChange={(e) => setNewMealChoice(e.target.value)}
                >
                  <option value="Standart Şef Menüsü">Standart Şef Menüsü</option>
                  <option value="Vejetaryen Menü (Gurme)">Vejetaryen Menü (Gurme)</option>
                  <option value="Glutensiz Özel Menü">Glutensiz Özel Menü</option>
                  <option value="Diyabetik Özel Menü">Diyabetik Özel Menü</option>
                  <option value="Helal Çocuk Menüsü">Helal Çocuk Menüsü</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button type="submit" className="btn-brand" style={{ flex: 1, height: '44px', fontSize: '0.85rem' }}>Değişiklikleri Onayla & Kaydet</button>
                <button type="button" onClick={() => setSelectedBookingForModify(null)} className="btn-outline" style={{ height: '44px', padding: '0 16px' }}>Vazgeç</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------- FLIGHT STATUS UPDATE MODAL ------------------- */}
      {selectedFlightForStatus && (
        <div className="modal-overlay" onClick={() => setSelectedFlightForStatus(null)}>
          <div className="corporate-card" style={{ width: '100%', maxWidth: '500px', padding: '28px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-xl)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-primary)' }}>Sefer Evresi & Durumu Güncelle ({selectedFlightForStatus.flightNumber})</h3>
              <button onClick={() => setSelectedFlightForStatus(null)} className="btn-outline" style={{ padding: '4px 8px' }}><X size={16} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
              {[
                { id: 'Scheduled', label: 'Planlandı (Zamanında)' },
                { id: 'Boarding', label: 'Kapı Açık (Boarding)' },
                { id: 'GateClosed', label: 'Kapı Kapandı' },
                { id: 'Taxi', label: 'Taksi / Kalkış' },
                { id: 'InAir', label: 'Havada (FL360)' },
                { id: 'Landed', label: 'İndi (Tamamlandı)' },
                { id: 'Delayed', label: 'Rötar Ver' },
                { id: 'Cancelled', label: 'İptal Et' },
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setSelectedMilestone(st.id)}
                  style={{
                    padding: '10px',
                    textAlign: 'left',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: selectedMilestone === st.id ? 'rgba(37, 99, 235, 0.12)' : 'var(--bg-secondary)',
                    border: selectedMilestone === st.id ? '2px solid var(--brand-accent)' : '1px solid var(--border-color)',
                    color: selectedMilestone === st.id ? 'var(--brand-accent)' : 'var(--text-primary)',
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                  }}
                >
                  ● {st.label}
                </button>
              ))}
            </div>

            {selectedMilestone === 'Delayed' && (
              <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', padding: '14px', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--brand-gold)', marginBottom: '6px' }}>Gecikme Süresi (Dakika) & Rötar Sebebi</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="number" min={5} max={360} className="input-corporate" style={{ width: '90px', height: '38px', fontWeight: 800 }} value={delayMinutes} onChange={(e) => setDelayMinutes(Number(e.target.value))} />
                  <select className="input-corporate" style={{ flex: 1, height: '38px', fontSize: '0.78rem', fontWeight: 700 }} value={delayReason} onChange={(e) => setDelayReason(e.target.value)}>
                    <option value="Kule Trafik Yoğunluğu">Kule Trafik Yoğunluğu (ATC)</option>
                    <option value="Olumsuz Hava Şartları">Olumsuz Hava Şartları (Metar)</option>
                    <option value="Teknik Gözden Geçirme">Teknik Gözden Geçirme</option>
                  </select>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" onClick={handlePerformStatusUpdate} className="btn-brand" style={{ flex: 1, height: '42px', fontSize: '0.85rem' }}>Durumu Onayla & Yayınla</button>
              <button type="button" onClick={() => setSelectedFlightForStatus(null)} className="btn-outline" style={{ height: '42px', padding: '0 16px', fontSize: '0.85rem' }}>Vazgeç</button>
            </div>
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
