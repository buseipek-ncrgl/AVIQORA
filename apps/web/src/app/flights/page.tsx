'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SeatMap } from '@/components/SeatMap';
import { AuthModal } from '@/components/AuthModal';
import { PaymentModal } from '@/components/PaymentModal';
import { BoardingPassModal } from '@/components/BoardingPassModal';
import { PnrLookupModal } from '@/components/PnrLookupModal';
import { AirportSelect } from '@/components/booking/AirportSelect';
import { DateRangePicker } from '@/components/booking/DateRangePicker';
import { PassengerSelector, PassengersState } from '@/components/booking/PassengerSelector';
import { CabinSelector } from '@/components/booking/CabinSelector';
import { CustomSelect } from '@/components/CustomSelect';
import { FlightDto, SeatDto, BookingDto } from '@/types/api';
import { api, getAirlineLogoUrl } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useCurrency } from '@/context/CurrencyContext';
import {
  Plane,
  Filter,
  ArrowRightLeft,
  Search,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  CreditCard,
  X,
  SlidersHorizontal,
  Sun,
  Moon,
  Sunrise,
  Luggage,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  MapPin,
  Zap,
  Check,
  RotateCcw,
  PlaneTakeoff,
  PlaneLanding,
  ArrowRight,
  Calendar,
  Crown,
  Building2,
} from 'lucide-react';

function FlightSearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { t, language } = useLanguage();
  const { formatPrice } = useCurrency();

  // Read URL query parameters
  const initialFrom = searchParams.get('from') || 'IST';
  const initialTo = searchParams.get('to') || 'BER';
  const initialDate = searchParams.get('date') || '';
  const initialReturnDate = searchParams.get('returnDate') || '';
  const initialTripType = (searchParams.get('tripType') as 'oneWay' | 'round' | 'multi') || 'oneWay';

  // Search Refinement Form State
  const [tripType, setTripType] = useState<'oneWay' | 'round' | 'multi'>(initialTripType);
  const [fromCode, setFromCode] = useState(initialFrom);
  const [toCode, setToCode] = useState(initialTo);
  const [departureDate, setDepartureDate] = useState(
    initialDate || new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [returnDate, setReturnDate] = useState(
    initialReturnDate || new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0]
  );
  const [passengers, setPassengers] = useState<PassengersState>({ adults: 1, children: 0, infants: 0 });
  const [cabinClass, setCabinClass] = useState('Economy');

  // Flight Data State
  const [flights, setFlights] = useState<FlightDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sidebar Filters State
  const [stopsFilter, setStopsFilter] = useState<'all' | 'direct' | 'connecting'>('all');
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(20000);
  const [timeFilter, setTimeFilter] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all');
  const [sortBy, setSortBy] = useState<'price' | 'duration' | 'departure' | 'business'>('price');

  // Fare Packages Drawer State (per flight card)
  const [expandedFareFlightId, setExpandedFareFlightId] = useState<string | null>(null);
  const [selectedFareTier, setSelectedFareTier] = useState<Record<string, 'eco' | 'extra' | 'business'>>({});

  // Modals & Booking Flow State
  const [selectedFlight, setSelectedFlight] = useState<FlightDto | null>(null);
  const [seats, setSeats] = useState<SeatDto[]>([]);
  const [isLoadingSeats, setIsLoadingSeats] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState<SeatDto | null>(null);

  // Passenger Detail Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [identityNumber, setIdentityNumber] = useState('');
  const [email, setEmail] = useState('');

  // Modals & Mobile Drawers
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isPnrLookupOpen, setIsPnrLookupOpen] = useState(false);
  const [activeBoardingPass, setActiveBoardingPass] = useState<BookingDto | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isMobileSearchEditOpen, setIsMobileSearchEditOpen] = useState(false);

  // Fetch flights from API
  const fetchFlights = async (from: string, to: string, date: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.flights.search(from, to, date);
      const targetDateStr = date || departureDate;
      const adjustedData = data.map((f) => {
        if (!targetDateStr) return f;
        const depTime = new Date(f.departureTime);
        const parts = targetDateStr.split('-').map(Number);
        if (parts.length === 3 && !parts.some(isNaN)) {
          const [targetY, targetM, targetD] = parts;
          const newDep = new Date(depTime);
          newDep.setFullYear(targetY, targetM - 1, targetD);
          const durMs = new Date(f.arrivalTime).getTime() - depTime.getTime();
          const newArr = new Date(newDep.getTime() + (durMs > 0 ? durMs : 7200000));
          return {
            ...f,
            departureTime: newDep.toISOString(),
            arrivalTime: newArr.toISOString(),
          };
        }
        return f;
      });
      setFlights(adjustedData);
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem('aviqora_last_search_flights', JSON.stringify(adjustedData));
        } catch {}
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Uçuşlar yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights(initialFrom, initialTo, departureDate);
  }, []);

  const handleRefineSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/flights?from=${fromCode}&to=${toCode}&date=${departureDate}&tripType=${tripType}`);
    fetchFlights(fromCode, toCode, departureDate);
  };

  const handleSwap = () => {
    const temp = fromCode;
    setFromCode(toCode);
    setToCode(temp);
  };

  // Helper to calculate or format duration
  const getFlightDurationStr = (flight: FlightDto) => {
    return flight.totalDuration || '3s 00dk';
  };

  const [airlineFilter, setAirlineFilter] = useState<string>('all');

  // Filtering & Sorting Logic
  const filteredFlights = flights
    .filter((f) => f.priceAmount <= maxPriceFilter)
    .filter((f) => {
      // Stops Filter
      if (stopsFilter === 'direct') return f.isDirect !== false;
      if (stopsFilter === 'connecting') return f.isDirect === false;
      return true;
    })
    .filter((f) => {
      // Airline Filter
      if (airlineFilter === 'all') return true;
      const name = (f.airlineName || 'Aviqora Express').toLowerCase();
      return name.includes(airlineFilter.toLowerCase());
    })
    .filter((f) => {
      // Time Filter
      if (timeFilter === 'all') return true;
      const hour = new Date(f.departureTime).getHours();
      if (timeFilter === 'morning') return hour >= 6 && hour < 12;
      if (timeFilter === 'afternoon') return hour >= 12 && hour < 18;
      if (timeFilter === 'evening') return hour >= 18 || hour < 6;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price') return a.priceAmount - b.priceAmount;
      if (sortBy === 'departure') return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
      if (sortBy === 'duration') {
        const durA = new Date(a.arrivalTime).getTime() - new Date(a.departureTime).getTime();
        const durB = new Date(b.arrivalTime).getTime() - new Date(b.departureTime).getTime();
        return durA - durB;
      }
      if (sortBy === 'business') {
        return b.availableSeatsCount - a.availableSeatsCount;
      }
      return 0;
    });

  const resetFilters = () => {
    setStopsFilter('all');
    setMaxPriceFilter(25000);
    setTimeFilter('all');
    setAirlineFilter('all');
    setSortBy('price');
  };

  // Generate 7-day price matrix checking real flight availability for route
  const generateDateMatrix = (baseDateStr: string) => {
    const todayIso = new Date().toISOString().split('T')[0];
    const startIso = !baseDateStr || baseDateStr < todayIso ? todayIso : baseDateStr;
    const base = new Date(startIso);
    const validBase = isNaN(base.getTime()) ? new Date() : base;

    const dayItems = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(validBase);
      d.setDate(d.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { weekday: 'short', day: 'numeric', month: 'short' });

      // Match exact departure ISO date in current loaded flights
      const flightsOnThisDate = flights.filter((f) => {
        if (!f.departureTime) return false;
        return f.departureTime.split('T')[0] === iso;
      });

      let price = 0;
      if (flightsOnThisDate.length > 0) {
        price = Math.min(...flightsOnThisDate.map((f) => f.priceAmount));
      } else {
        let hash = 0;
        const str = `${iso}-${fromCode}-${toCode}`;
        for (let k = 0; k < str.length; k++) {
          hash = str.charCodeAt(k) + ((hash << 5) - hash);
        }
        const baseRoutePrice = (fromCode === 'ESB' || toCode === 'ESB') ? 2364 : 1850;
        price = baseRoutePrice + ((Math.abs(hash) % 10) * 75);
      }

      dayItems.push({
        dateIso: iso,
        dayLabel: dayName,
        price,
        hasFlight: true,
      });
    }

    const validPrices = dayItems.map((item) => item.price);
    const minPrice = Math.min(...validPrices);
    const maxPrice = Math.max(...validPrices);

    return dayItems.map((item) => ({
      ...item,
      isLowest: item.price === minPrice,
      isHighest: item.price === maxPrice && maxPrice > minPrice * 1.1,
    }));
  };

  const dateMatrix = generateDateMatrix(departureDate);

  // Navigate to Checkout or Seat Map Selection
  const handleSelectFlightPackage = (flight: FlightDto, fareTier: 'eco' | 'extra' | 'business' = 'eco') => {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('aviqora_selected_flight', JSON.stringify(flight));
      } catch {}
    }

    if (!isAuthenticated) {
      setIsAuthOpen(true);
    } else {
      router.push(`/checkout/${flight.id}?fare=${fareTier}&date=${departureDate}&from=${fromCode}&to=${toCode}`);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* 1. Corporate Header */}
      <Header
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenPnrLookup={() => setIsPnrLookupOpen(true)}
      />

      {/* 2. Sleek Modern Search Refinement Bar */}
      <div
        className="search-refinement-container"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-color)',
          padding: '20px 32px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          {/* Mobile THY Route Summary Card */}
          <div
            className="mobile-thy-route-header"
            style={{
              display: 'none',
              padding: '12px 16px',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-lg)',
              marginBottom: '12px',
              justifyContent: 'space-between',
              alignItems: 'center',
              border: '1px solid var(--border-color)',
            }}
          >
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--brand-red)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                GİDİŞ UÇUŞU
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '2px' }}>
                {fromCode} ➔ {toCode}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
                {new Date(departureDate).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'long', weekday: 'short' })}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsMobileSearchEditOpen(!isMobileSearchEditOpen)}
              className="btn-brand"
              style={{ padding: '6px 14px', fontSize: '0.78rem', borderRadius: '20px' }}
            >
              {isMobileSearchEditOpen ? 'Gizle' : 'Düzenle ✎'}
            </button>
          </div>

          {/* Collapsible Search Form Wrapper */}
          <div className={`search-form-wrapper ${isMobileSearchEditOpen ? 'mobile-show' : 'mobile-hide'}`}>
            {/* Trip Type Selector Tabs */}
            <div className="trip-type-tabs" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setTripType('oneWay')}
                className={`trip-type-tab-btn ${tripType === 'oneWay' ? 'active' : ''}`}
                style={{
                  padding: '8px 18px',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: tripType === 'oneWay' ? 'var(--brand-accent)' : 'var(--bg-secondary)',
                  color: tripType === 'oneWay' ? '#ffffff' : 'var(--text-secondary)',
                  border: tripType === 'oneWay' ? '1px solid var(--brand-accent)' : '1px solid var(--border-color)',
                  transition: 'var(--transition-fast)',
                }}
              >
                <PlaneTakeoff size={15} />
                <span>{language === 'tr' ? 'Tek Yön' : 'One Way'}</span>
              </button>

              <button
                type="button"
                onClick={() => setTripType('round')}
                className={`trip-type-tab-btn ${tripType === 'round' ? 'active' : ''}`}
                style={{
                  padding: '8px 18px',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: tripType === 'round' ? 'var(--brand-accent)' : 'var(--bg-secondary)',
                  color: tripType === 'round' ? '#ffffff' : 'var(--text-secondary)',
                  border: tripType === 'round' ? '1px solid var(--brand-accent)' : '1px solid var(--border-color)',
                  transition: 'var(--transition-fast)',
                }}
              >
                <ArrowRightLeft size={15} />
                <span>{language === 'tr' ? 'Gidiş - Dönüş' : 'Round Trip'}</span>
              </button>

              <button
                type="button"
                onClick={() => setTripType('multi')}
                className={`trip-type-tab-btn ${tripType === 'multi' ? 'active' : ''}`}
                style={{
                  padding: '8px 18px',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: tripType === 'multi' ? 'var(--brand-accent)' : 'var(--bg-secondary)',
                  color: tripType === 'multi' ? '#ffffff' : 'var(--text-secondary)',
                  border: tripType === 'multi' ? '1px solid var(--brand-accent)' : '1px solid var(--border-color)',
                  transition: 'var(--transition-fast)',
                }}
              >
                <MapPin size={15} />
                <span>{language === 'tr' ? 'Çoklu Uçuş' : 'Multi-City'}</span>
              </button>
            </div>

            {/* Form Inputs Grid */}
            <form onSubmit={handleRefineSearch}>
              <div className="booking-widget-grid" style={{ display: 'grid', gridTemplateColumns: tripType === 'round' ? '3.8fr 1.6fr 1.2fr 1.4fr auto' : '3.8fr 1.3fr 1.2fr 1.4fr auto', gap: '12px', alignItems: 'end' }}>
                <div className="airports-group-container">
                  <AirportSelect label={language === 'tr' ? 'Nereden (Kalkış)' : 'From (Origin)'} value={fromCode} onChange={setFromCode} isOrigin={true} />
                  
                  <button
                    type="button"
                    onClick={handleSwap}
                    className="btn-outline airport-swap-btn"
                    title={language === 'tr' ? 'Kalkış ve Varışı Değiştir' : 'Swap Airports'}
                  >
                    <ArrowRightLeft size={16} />
                  </button>

                  <AirportSelect label={language === 'tr' ? 'Nereye (Varış)' : 'To (Destination)'} value={toCode} onChange={setToCode} isOrigin={false} />
                </div>
                
                <DateRangePicker
                  departureDate={departureDate}
                  returnDate={returnDate}
                  onDepartureChange={setDepartureDate}
                  onReturnChange={setReturnDate}
                  isRoundTrip={tripType === 'round'}
                  fromCode={fromCode}
                  toCode={toCode}
                />

                <PassengerSelector passengers={passengers} onChange={setPassengers} />
                <CabinSelector value={cabinClass} onChange={setCabinClass} />
                
                <button type="submit" className="btn-brand search-submit-btn" style={{ height: '52px', padding: '0 24px', fontSize: '0.92rem', whiteSpace: 'nowrap' }}>
                  <Search size={16} /> {language === 'tr' ? 'Uçuş Ara' : 'Search Flights'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* 3. Main Search Results & Filter Layout */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '36px 32px 60px' }}>
        
        {/* Mobile Filter & Sort Toolbar Bar */}
        <div
          className="mobile-thy-toolbar"
          style={{
            display: 'none',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px',
            width: '100%',
          }}
        >
          <button
            type="button"
            onClick={() => setIsMobileFilterOpen(true)}
            className="btn-outline"
            style={{ flex: 1, height: '44px', fontSize: '0.82rem', fontWeight: 800, justifyContent: 'center', backgroundColor: 'var(--bg-surface)', padding: '0 12px' }}
          >
            <SlidersHorizontal size={16} style={{ color: 'var(--brand-accent)' }} /> {language === 'tr' ? 'Filtreleri Düzenle' : 'Filters'}
          </button>

          <CustomSelect
            value={sortBy}
            onChange={(val) => setSortBy(val as any)}
            options={[
              { value: 'price', label: language === 'tr' ? 'En Uygun Fiyat' : 'Cheapest Price', icon: <Zap size={14} style={{ color: 'var(--brand-accent)' }} /> },
              { value: 'duration', label: language === 'tr' ? 'En Hızlı Sefer' : 'Fastest Flight', icon: <Clock size={14} style={{ color: 'var(--brand-accent)' }} /> },
              { value: 'departure', label: language === 'tr' ? 'Kalkış Saati' : 'Departure Time', icon: <Sunrise size={14} style={{ color: 'var(--brand-accent)' }} /> },
              { value: 'business', label: language === 'tr' ? 'Koltuk / VIP' : 'VIP Seats', icon: <ShieldCheck size={14} style={{ color: 'var(--brand-accent)' }} /> },
            ]}
            style={{ flex: 1, height: '44px' }}
          />
        </div>

        {/* Desktop Header Info Bar */}
        <div className="desktop-search-header-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--brand-accent)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={14} /> {language === 'tr' ? 'AVIQORA PREMİUM UÇUŞ ARAMA' : 'AVIQORA EXECUTIVE FLIGHT SEARCH'}
            </div>
            <h1 style={{ fontSize: '1.9rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>{fromCode}</span>
              <ArrowRight size={20} style={{ color: 'var(--brand-accent)' }} />
              <span>{toCode}</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-muted)', marginLeft: '8px' }}>
                ({filteredFlights.length} {language === 'tr' ? 'Sefer Bulundu' : 'Flights Found'})
              </span>
            </h1>
          </div>

          {/* Sort By Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--bg-surface)', padding: '4px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
            {[
              { id: 'price', label: language === 'tr' ? 'En Uygun Fiyat' : 'Cheapest', icon: Zap },
              { id: 'duration', label: language === 'tr' ? 'En Hızlı' : 'Fastest', icon: Clock },
              { id: 'departure', label: language === 'tr' ? 'Kalkış Saati' : 'Departure', icon: Sunrise },
              { id: 'business', label: language === 'tr' ? 'Koltuk / VIP' : 'Seats / VIP', icon: ShieldCheck },
            ].map((tab) => {
              const isActive = sortBy === tab.id;
              const IconComp = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSortBy(tab.id as any)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    backgroundColor: isActive ? 'var(--brand-accent)' : 'transparent',
                    color: isActive ? '#ffffff' : 'var(--text-secondary)',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'var(--transition-fast)',
                  }}
                >
                  <IconComp size={14} /> {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 7-DAY PRICE MATRIX & DATE SLIDER BAR */}
        <div
          className="corporate-card"
          style={{
            marginBottom: '28px',
            padding: '16px 20px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-xl)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 900, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={16} style={{ color: 'var(--brand-accent)' }} />
              {language === 'tr' ? '7 Günlük Fiyat Takvimi & Esnek Tarih Seçimi' : '7-Day Price Matrix & Flexible Date Search'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', padding: '4px 2px 8px' }}>
            {dateMatrix.map((item) => {
              const isSelected = item.dateIso === departureDate;
              const todayStr = new Date().toISOString().split('T')[0];
              const isPast = item.dateIso < todayStr;
              const isDisabled = isPast;

              return (
                <button
                  key={item.dateIso}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => {
                    if (isDisabled) return;
                    setDepartureDate(item.dateIso);
                    router.push(`/flights?from=${fromCode}&to=${toCode}&date=${item.dateIso}&tripType=${tripType}`);
                    fetchFlights(fromCode, toCode, item.dateIso);
                  }}
                  style={{
                    flex: '1 0 135px',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-lg)',
                    border: isSelected 
                      ? '2px solid var(--brand-accent)' 
                      : item.isLowest && !isDisabled 
                      ? '1.5px solid #10b981' 
                      : item.isHighest && !isDisabled
                      ? '1.5px solid #f87171'
                      : '1px solid var(--border-color)',
                    backgroundColor: isDisabled 
                      ? 'var(--bg-secondary)' 
                      : isSelected 
                      ? 'rgba(37, 99, 235, 0.12)' 
                      : item.isLowest 
                      ? 'rgba(16, 185, 129, 0.08)' 
                      : item.isHighest
                      ? 'rgba(239, 68, 68, 0.06)'
                      : 'var(--bg-surface)',
                    opacity: isDisabled ? 0.45 : 1,
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.18s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '76px',
                  }}
                >
                  {isPast ? (
                    <span style={{ backgroundColor: 'var(--border-color)', color: 'var(--text-muted)', fontSize: '0.6rem', fontWeight: 800, padding: '2px 6px', borderRadius: '6px', marginBottom: '4px' }}>
                      GEÇMİŞ
                    </span>
                  ) : item.isLowest ? (
                    <span style={{ backgroundColor: '#059669', color: '#ffffff', fontSize: '0.62rem', fontWeight: 900, padding: '2px 8px', borderRadius: '8px', whiteSpace: 'nowrap', marginBottom: '4px', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <Sparkles size={10} /> EN UCUZ
                    </span>
                  ) : item.isHighest ? (
                    <span style={{ backgroundColor: '#dc2626', color: '#ffffff', fontSize: '0.62rem', fontWeight: 900, padding: '2px 8px', borderRadius: '8px', whiteSpace: 'nowrap', marginBottom: '4px', textTransform: 'uppercase' }}>
                      YÜKSEK
                    </span>
                  ) : (
                    <div style={{ height: '18px' }} />
                  )}
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: isDisabled ? 'var(--text-muted)' : isSelected ? 'var(--brand-accent)' : 'var(--text-secondary)', marginBottom: '2px' }}>
                    {item.dayLabel}
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 900, color: isDisabled ? 'var(--text-muted)' : item.isLowest ? '#047857' : item.isHighest ? '#dc2626' : isSelected ? 'var(--brand-accent)' : 'var(--text-primary)' }}>
                    ₺{item.price.toLocaleString('tr-TR')}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2-Column Split: Left Filter Sidebar | Right Flight Cards Stream */}
        <div className="flight-search-layout" style={{ display: 'grid', gridTemplateColumns: '290px 1fr', gap: '32px', alignItems: 'start' }}>
          
          {/* LEFT SIDEBAR: Executive Filters */}
          <div
            className="corporate-card desktop-filters-sidebar"
            style={{
              padding: '24px',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
              position: 'sticky',
              top: '90px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <SlidersHorizontal size={18} style={{ color: 'var(--brand-accent)' }} />
                {language === 'tr' ? 'Uçuş Filtreleri' : 'Flight Filters'}
              </h3>
              
              <button
                type="button"
                onClick={resetFilters}
                style={{ background: 'none', border: 'none', color: 'var(--brand-accent)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <RotateCcw size={12} /> {language === 'tr' ? 'Sıfırla' : 'Reset'}
              </button>
            </div>

            {/* 1. STOPS FILTER (Direkt Uçuş / Aktarmalı) */}
            <div style={{ marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Plane size={15} style={{ color: 'var(--brand-accent)' }} />
                {language === 'tr' ? 'Aktarma Durumu' : 'Stops Preference'}
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { id: 'all', icon: null, label: language === 'tr' ? 'Tüm Uçuşlar' : 'All Flights', count: flights.length },
                  { id: 'direct', icon: <Zap size={14} style={{ color: '#059669' }} />, label: language === 'tr' ? 'Sadece Direkt Uçuşlar' : 'Direct Flights Only', count: flights.filter(f => f.isDirect !== false).length },
                  { id: 'connecting', icon: <ArrowRightLeft size={14} style={{ color: '#d97706' }} />, label: language === 'tr' ? 'Aktarmalı Uçuşlar' : 'Connecting Flights', count: flights.filter(f => f.isDirect === false).length },
                ].map((item) => {
                  const isActive = stopsFilter === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setStopsFilter(item.id as any)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        textAlign: 'left',
                        backgroundColor: isActive ? 'rgba(37, 99, 235, 0.08)' : 'var(--bg-secondary)',
                        color: isActive ? 'var(--brand-accent)' : 'var(--text-secondary)',
                        border: isActive ? '1px solid var(--brand-accent)' : '1px solid var(--border-color)',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'var(--transition-fast)',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {item.icon}
                        {item.label}
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '2px 8px', borderRadius: '10px', backgroundColor: isActive ? 'var(--brand-accent)' : 'var(--bg-surface)', color: isActive ? '#fff' : 'var(--text-muted)' }}>
                        {item.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. PRICE RANGE FILTER */}
            <div style={{ marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                <span>{language === 'tr' ? 'Maksimum Bilet Fiyatı' : 'Max Ticket Price'}</span>
                <span style={{ color: 'var(--brand-accent)', fontWeight: 900 }}>₺{maxPriceFilter.toLocaleString('tr-TR')}</span>
              </div>
              <input
                type="range"
                min="1000"
                max="25000"
                step="250"
                value={maxPriceFilter}
                onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
                style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--brand-accent)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                <span>₺1.000</span>
                <span>₺25.000+</span>
              </div>
            </div>

            {/* 3. DEPARTURE TIME WINDOW FILTER */}
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>
                {language === 'tr' ? 'Kalkış Saati Aralığı' : 'Departure Time Window'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { id: 'all', label: language === 'tr' ? 'Tüm Saatler' : 'All Times', icon: Clock },
                  { id: 'morning', label: language === 'tr' ? 'Sabah (06:00 - 12:00)' : 'Morning (06:00 - 12:00)', icon: Sunrise },
                  { id: 'afternoon', label: language === 'tr' ? 'Öğle (12:00 - 18:00)' : 'Afternoon (12:00 - 18:00)', icon: Sun },
                  { id: 'evening', label: language === 'tr' ? 'Akşam / Gece (18:00 - 06:00)' : 'Evening / Night (18:00 - 06:00)', icon: Moon },
                ].map((item) => {
                  const isActive = timeFilter === item.id;
                  const IconComp = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTimeFilter(item.id as any)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        textAlign: 'left',
                        backgroundColor: isActive ? 'rgba(37, 99, 235, 0.08)' : 'var(--bg-secondary)',
                        color: isActive ? 'var(--brand-accent)' : 'var(--text-secondary)',
                        border: isActive ? '1px solid var(--brand-accent)' : '1px solid var(--border-color)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <IconComp size={16} /> {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. AIRLINES FILTER */}
            <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Crown size={15} style={{ color: 'var(--brand-accent)' }} />
                {language === 'tr' ? 'Havayolu Şirketleri' : 'Airlines'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { id: 'all', label: language === 'tr' ? 'Tüm Havayolları' : 'All Airlines', logo: null, count: flights.length },
                  { id: 'turkish', label: 'Turkish Airlines (THY)', logo: 'https://www.gstatic.com/flights/airline_logos/70px/TK.png', count: flights.filter(f => (f.airlineName || '').toLowerCase().includes('turkish')).length },
                  { id: 'sunexpress', label: 'SunExpress', logo: 'https://www.gstatic.com/flights/airline_logos/70px/XQ.png', count: flights.filter(f => (f.airlineName || '').toLowerCase().includes('sunexpress')).length },
                  { id: 'lufthansa', label: 'Lufthansa', logo: 'https://www.gstatic.com/flights/airline_logos/70px/LH.png', count: flights.filter(f => (f.airlineName || '').toLowerCase().includes('lufthansa')).length },
                  { id: 'pegasus', label: 'Pegasus Airlines', logo: 'https://www.gstatic.com/flights/airline_logos/70px/PC.png', count: flights.filter(f => (f.airlineName || '').toLowerCase().includes('pegasus')).length },
                  { id: 'aviqora', label: 'Aviqora Airways', logo: 'https://www.gstatic.com/flights/airline_logos/70px/TK.png', count: flights.filter(f => (f.airlineName || 'Aviqora').toLowerCase().includes('aviqora')).length },
                ].map((item) => {
                  const isActive = airlineFilter === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setAirlineFilter(item.id)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        textAlign: 'left',
                        backgroundColor: isActive ? 'rgba(37, 99, 235, 0.08)' : 'var(--bg-secondary)',
                        color: isActive ? 'var(--brand-accent)' : 'var(--text-secondary)',
                        border: isActive ? '1px solid var(--brand-accent)' : '1px solid var(--border-color)',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'var(--transition-fast)',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {item.logo ? (
                          <img
                            src={item.logo}
                            alt={item.label}
                            style={{
                              width: '22px',
                              height: '22px',
                              objectFit: 'contain',
                              borderRadius: '4px',
                              backgroundColor: '#ffffff',
                              padding: '2px',
                              border: '1px solid var(--border-color)',
                            }}
                          />
                        ) : (
                          <Crown size={15} style={{ color: 'var(--brand-accent)' }} />
                        )}
                        {item.label}
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '2px 8px', borderRadius: '10px', backgroundColor: isActive ? 'var(--brand-accent)' : 'var(--bg-surface)', color: isActive ? '#fff' : 'var(--text-muted)' }}>
                        {item.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Executive Flight Stream */}
          <div>
            {isLoading ? (
              <div className="corporate-card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <Plane size={32} className="animate-spin" style={{ color: 'var(--brand-accent)', marginBottom: '16px' }} />
                <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{language === 'tr' ? 'En Uygun Uçuş Seferleri Listeleniyor...' : 'Searching Best Flight Schedules...'}</div>
              </div>
            ) : error ? (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--brand-red)', padding: '20px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <AlertTriangle size={24} /> <div><strong>{language === 'tr' ? 'Arama Hatası:' : 'Search Error:'}</strong> {error}</div>
              </div>
            ) : filteredFlights.length === 0 ? (
              <div className="corporate-card" style={{ padding: '48px 32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <AlertTriangle size={36} style={{ color: 'var(--brand-gold)', marginBottom: '12px', margin: '0 auto' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                  {language === 'tr' ? 'Seçilen Kriterlerde Uçuş Bulunamadı' : 'No Flights Found for Selected Criteria'}
                </h3>
                <p style={{ fontSize: '0.88rem', marginTop: '8px', maxWidth: '520px', margin: '8px auto 0', color: 'var(--text-secondary)' }}>
                  {language === 'tr'
                    ? 'Aradığınız tarihte tarifeli sefer bulunmamaktadır. Yukarıdaki tarih takviminden farklı bir gün seçebilirsiniz.'
                    : 'No scheduled flights found for this date. You can select another date from the calendar above.'}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {filteredFlights.map((flight) => {
                  const isExpanded = expandedFareFlightId === flight.id;
                  const durationStr = getFlightDurationStr(flight);
                  const isDirect = flight.isDirect !== false;
                  const airlineName = flight.airlineName || 'Aviqora Airways';
                  const selectedTier = selectedFareTier[flight.id] || 'eco';
                  const logoUrl = getAirlineLogoUrl(airlineName, flight.airlineLogoUrl);

                  // Calculate tier prices
                  const basePrice = flight.priceAmount;
                  const extraPrice = basePrice + 450;
                  const businessPrice = basePrice + 1250;

                  const currentPrice = selectedTier === 'eco' ? basePrice : selectedTier === 'extra' ? extraPrice : businessPrice;

                  return (
                    <div
                      key={flight.id}
                      className="corporate-card"
                      style={{
                        backgroundColor: 'var(--bg-surface)',
                        borderRadius: 'var(--radius-lg)',
                        border: isExpanded ? '2px solid var(--brand-accent)' : '1px solid var(--border-color)',
                        overflow: 'hidden',
                        transition: 'var(--transition-fast)',
                        boxShadow: 'var(--shadow-sm)',
                      }}
                    >
                      {/* CARD TOP HEADER: Slim Airline Brand & Badge */}
                      <div
                        className="flight-card-header"
                        style={{
                          padding: '8px 20px',
                          backgroundColor: 'var(--bg-secondary)',
                          borderBottom: '1px solid var(--border-color)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '0.78rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img
                            src={logoUrl}
                            alt={airlineName}
                            style={{
                              width: '26px',
                              height: '26px',
                              objectFit: 'contain',
                              borderRadius: '6px',
                              backgroundColor: '#ffffff',
                              padding: '2px',
                              border: '1px solid var(--border-color)',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                            }}
                          />

                          <div
                            style={{
                              backgroundColor: 'var(--brand-accent)',
                              color: '#fff',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontWeight: 900,
                              fontSize: '0.78rem',
                              letterSpacing: '0.05em',
                            }}
                          >
                            {flight.flightNumber}
                          </div>

                          <span style={{ fontSize: '0.88rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                            {airlineName}
                          </span>

                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            • {flight.aircraftModel}
                          </span>
                        </div>

                        {/* Direct vs Connecting Badge */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {isDirect ? (
                            <span
                              style={{
                                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                                color: '#059669',
                                border: '1px solid rgba(16, 185, 129, 0.25)',
                                padding: '2px 10px',
                                borderRadius: '16px',
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <Zap size={12} style={{ color: '#059669' }} />
                              {language === 'tr' ? 'Direkt Uçuş' : 'Direct Flight'}
                            </span>
                          ) : (
                            <span
                              className="badge-responsive-wrap"
                              style={{
                                backgroundColor: 'rgba(245, 158, 11, 0.12)',
                                color: '#d97706',
                                border: '1px solid rgba(245, 158, 11, 0.25)',
                                padding: '2px 8px',
                                borderRadius: '16px',
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <ArrowRightLeft size={12} style={{ color: '#d97706' }} />
                              {language === 'tr'
                                ? `1 Aktarma (${flight.layoverAirportCode || 'MUC'})`
                                : `1 Layover (${flight.layoverAirportCode || 'MUC'})`}
                            </span>
                          )}

                          {flight.co2SavingsPercent && (
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#059669', backgroundColor: 'rgba(5, 150, 105, 0.08)', padding: '2px 6px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <Sparkles size={11} style={{ color: '#059669' }} /> -{flight.co2SavingsPercent}% CO₂
                            </span>
                          )}
                        </div>
                      </div>

                      {/* MAIN ROUTE SLIM TIMELINE CONTENT */}
                      <div
                        className="flight-card-content"
                        style={{
                          padding: '16px 20px',
                          display: 'grid',
                          gridTemplateColumns: '1.1fr 1.8fr 1.1fr 1.4fr',
                          gap: '16px',
                          alignItems: 'center',
                        }}
                      >
                        {/* ROUTE WRAPPER FOR MOBILE SIDE-BY-SIDE TIMELINE */}
                        <div className="flight-card-route-row" style={{ display: 'contents' }}>
                          {/* 1. DEPARTURE INFO */}
                          <div className="departure-col" style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
                              {new Date(flight.departureTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--brand-accent)', margin: '3px 0 2px', display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: 'rgba(37, 99, 235, 0.08)', padding: '2px 6px', borderRadius: '6px', whiteSpace: 'nowrap' }}>
                              <Calendar size={11} style={{ color: 'var(--brand-accent)' }} />
                              {new Date(flight.departureTime).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'short', weekday: 'short' })}
                            </div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                              {flight.departureAirportCode} <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>• {flight.departureAirportName.split(' ')[0]}</span>
                            </div>
                          </div>

                          {/* 2. ROUTE GRAPHIC TIMELINE */}
                          <div className="timeline-col" style={{ textAlign: 'center', padding: '0 4px' }}>
                            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', whiteSpace: 'nowrap' }}>
                              <Clock size={12} style={{ color: 'var(--brand-accent)' }} />
                              <span>{durationStr}</span>
                            </div>

                            {/* Graphic Line with Plane Icon */}
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '4px 0' }}>
                              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1.5px', backgroundColor: 'var(--border-color)', zIndex: 1 }} />
                              
                              {!isDirect && (
                                <div
                                  style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    width: '7px',
                                    height: '7px',
                                    borderRadius: '50%',
                                    backgroundColor: '#d97706',
                                    border: '2px solid var(--bg-surface)',
                                    zIndex: 2,
                                  }}
                                  title={`${flight.layoverCityName || 'Aktarma'} (${flight.layoverDuration || '1s 35dk'})`}
                                />
                              )}

                              <div
                                style={{
                                  backgroundColor: 'var(--bg-surface)',
                                  border: '1px solid var(--brand-accent)',
                                  color: 'var(--brand-accent)',
                                  borderRadius: '50%',
                                  width: '24px',
                                  height: '24px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  zIndex: 3,
                                  boxShadow: 'var(--shadow-sm)',
                                }}
                              >
                                <Plane size={12} style={{ transform: 'rotate(0deg)' }} />
                              </div>
                            </div>

                            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: isDirect ? '#059669' : '#d97706', whiteSpace: 'nowrap' }}>
                              {isDirect
                                ? (language === 'tr' ? 'Direkt Uçuş' : 'Non-Stop')
                                : (language === 'tr'
                                    ? `1 Aktarma • ${flight.layoverAirportCode || 'MUC'}`
                                    : `1 Layover • ${flight.layoverAirportCode || 'MUC'}`)}
                            </div>
                          </div>

                          {/* 3. ARRIVAL INFO */}
                          <div className="arrival-col" style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
                              {new Date(flight.arrivalTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-secondary)', margin: '3px 0 2px', display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '6px', whiteSpace: 'nowrap' }}>
                              <Calendar size={11} style={{ color: 'var(--text-muted)' }} />
                              {new Date(flight.arrivalTime).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'short', weekday: 'short' })}
                            </div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                              {flight.arrivalAirportCode} <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>• {flight.arrivalAirportName.split(' ')[0]}</span>
                            </div>
                          </div>
                        </div>

                        {/* 4. SLIM PRICE & CTA BOX */}
                        <div className="flight-card-price-cta" style={{ textAlign: 'right', borderLeft: '1px solid var(--border-color)', paddingLeft: '16px' }}>
                          <div className="flight-card-price-info-row">
                            <div>
                              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)' }}>
                                {language === 'tr' ? 'Net Fiyat' : 'Net Price'}
                              </div>
                              <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--brand-accent)', margin: '1px 0' }}>
                                {formatPrice(currentPrice)}
                              </div>
                              <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <CheckCircle size={11} style={{ color: '#059669' }} /> {language === 'tr' ? 'KDV Dahil' : 'Taxes Inc.'}
                              </div>
                            </div>

                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textAlign: 'right' }}>
                              {flight.availableSeatsCount} {language === 'tr' ? 'Boş Koltuk' : 'Seats Left'}
                            </div>
                          </div>

                          <div className="flight-card-cta-btn-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                            <button
                              className="btn-brand"
                              style={{ width: '100%', height: '38px', fontSize: '0.82rem', justifyContent: 'center', padding: '0 16px' }}
                              onClick={() => handleSelectFlightPackage(flight, selectedTier)}
                            >
                              <Plane size={14} /> {language === 'tr' ? 'Bileti Seç' : 'Select Flight'}
                            </button>

                            <button
                              type="button"
                              onClick={() => setExpandedFareFlightId(isExpanded ? null : flight.id)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--brand-accent)',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '3px',
                                marginTop: '2px',
                              }}
                            >
                              {isExpanded ? (
                                <>
                                  {language === 'tr' ? 'Gizle' : 'Hide'} <ChevronUp size={13} />
                                </>
                              ) : (
                                <>
                                  {language === 'tr' ? 'Tarifeler' : 'Fare Tiers'} <ChevronDown size={13} />
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* EXPANDABLE FARE PACKAGES DRAWER */}
                      {isExpanded && (
                        <div
                          style={{
                            padding: '20px 28px 24px',
                            backgroundColor: 'var(--bg-secondary)',
                            borderTop: '1px solid var(--border-color)',
                            animation: 'modalFadeIn 0.2s ease-out',
                          }}
                        >
                          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Sparkles size={16} style={{ color: 'var(--brand-accent)' }} />
                            {language === 'tr' ? 'Kabin & Tarife Paketleri' : 'Fare Package Comparison'}
                          </div>

                          <div className="fare-packages-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                            {/* 1. Eco Fly Package */}
                            <div
                              onClick={() => setSelectedFareTier((prev) => ({ ...prev, [flight.id]: 'eco' }))}
                              style={{
                                border: selectedTier === 'eco' ? '2px solid var(--brand-accent)' : '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-md)',
                                backgroundColor: 'var(--bg-surface)',
                                padding: '16px',
                                cursor: 'pointer',
                                transition: 'var(--transition-fast)',
                                position: 'relative',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontWeight: 900, fontSize: '0.95rem', color: 'var(--text-primary)' }}>Eco Fly</span>
                                {selectedTier === 'eco' && <CheckCircle size={18} style={{ color: 'var(--brand-accent)' }} />}
                              </div>
                              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--brand-accent)', marginBottom: '12px' }}>
                                ₺{basePrice.toLocaleString('tr-TR')}
                              </div>
                              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <Luggage size={14} style={{ color: '#059669' }} /> 15 kg Uçak Altı + 8 kg Kabin Bagajı
                                </li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <Check size={14} style={{ color: '#059669' }} /> Standart Koltuk Seçimi
                                </li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                                  <X size={14} /> Değişiklik Cezalı
                                </li>
                              </ul>
                            </div>

                            {/* 2. Extra Fly Package */}
                            <div
                              onClick={() => setSelectedFareTier((prev) => ({ ...prev, [flight.id]: 'extra' }))}
                              style={{
                                border: selectedTier === 'extra' ? '2px solid var(--brand-accent)' : '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-md)',
                                backgroundColor: 'var(--bg-surface)',
                                padding: '16px',
                                cursor: 'pointer',
                                transition: 'var(--transition-fast)',
                                position: 'relative',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontWeight: 900, fontSize: '0.95rem', color: 'var(--text-primary)' }}>Extra Fly</span>
                                {selectedTier === 'extra' && <CheckCircle size={18} style={{ color: 'var(--brand-accent)' }} />}
                              </div>
                              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--brand-accent)', marginBottom: '12px' }}>
                                ₺{extraPrice.toLocaleString('tr-TR')}
                              </div>
                              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <Luggage size={14} style={{ color: '#059669' }} /> 20 kg Uçak Altı + 8 kg Kabin Bagajı
                                </li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <Check size={14} style={{ color: '#059669' }} /> Standart & Ücretsiz Koltuk Seçimi
                                </li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <Check size={14} style={{ color: '#059669' }} /> 12 Saat Öncesine Kadar Ücretsiz Değişiklik
                                </li>
                              </ul>
                            </div>

                            {/* 3. Business Flex Package */}
                            <div
                              onClick={() => setSelectedFareTier((prev) => ({ ...prev, [flight.id]: 'business' }))}
                              style={{
                                border: selectedTier === 'business' ? '2px solid var(--brand-accent)' : '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-md)',
                                backgroundColor: 'var(--bg-surface)',
                                padding: '16px',
                                cursor: 'pointer',
                                transition: 'var(--transition-fast)',
                                position: 'relative',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontWeight: 900, fontSize: '0.95rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <ShieldCheck size={16} style={{ color: 'var(--brand-accent)' }} /> Business Flex
                                </span>
                                {selectedTier === 'business' && <CheckCircle size={18} style={{ color: 'var(--brand-accent)' }} />}
                              </div>
                              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--brand-accent)', marginBottom: '12px' }}>
                                ₺{businessPrice.toLocaleString('tr-TR')}
                              </div>
                              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <Luggage size={14} style={{ color: '#059669' }} /> 30 kg Uçak Altı + 2 Adet Kabin Bagajı
                                </li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <Check size={14} style={{ color: '#059669' }} /> VIP Ön Sıra / Geniş Diz Mesafesi
                                </li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <Check size={14} style={{ color: '#059669' }} /> VIP Lounge & Gurme İkram Servisi
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 4. Seat Map Modal & Passenger Detail Form */}
      {selectedFlight && (
        <div className="modal-overlay" onClick={() => setSelectedFlight(null)}>
          <div
            className="corporate-card"
            style={{ width: '100%', maxWidth: '980px', maxHeight: '90vh', overflowY: 'auto', padding: '32px', backgroundColor: 'var(--bg-surface)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Plane size={20} style={{ color: 'var(--brand-accent)' }} /> {language === 'tr' ? 'Uçuş Seferi:' : 'Flight:'} <span style={{ color: 'var(--brand-accent)' }}>{selectedFlight.flightNumber}</span> ({selectedFlight.departureAirportCode} ➔ {selectedFlight.arrivalAirportCode})
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {language === 'tr' ? 'Kabin planı üzerinden yerinizi seçin ve rezervasyonunuzu tamamlayın.' : 'Select your preferred seat on the cabin map and complete checkout.'}
                </p>
              </div>
              <button className="btn-outline" onClick={() => setSelectedFlight(null)} style={{ padding: '6px 12px' }}>
                <X size={16} /> {language === 'tr' ? 'Kapat' : 'Close'}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '32px', alignItems: 'start' }}>
              <div>
                {isLoadingSeats ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    {language === 'tr' ? 'Koltuk haritası yükleniyor...' : 'Loading seat map...'}
                  </div>
                ) : (
                  <SeatMap
                    seats={seats}
                    selectedSeatId={selectedSeat?.id || null}
                    onSelectSeat={(seat) => setSelectedSeat(seat)}
                    flightNumber={selectedFlight.flightNumber}
                    aircraftModel={selectedFlight.aircraftModel}
                  />
                )}
              </div>

              <div className="corporate-card" style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={18} /> {language === 'tr' ? 'Yolcu Bilgileri' : 'Passenger Details'}
                </h4>

                {selectedSeat ? (
                  <div
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-color)',
                      padding: '14px 16px',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '20px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{language === 'tr' ? 'Seçilen Koltuk' : 'Selected Seat'}</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--brand-accent)' }}>
                        {selectedSeat.seatCode} ({selectedSeat.seatClass})
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{language === 'tr' ? 'Koltuk Tutarı' : 'Seat Price'}</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#059669' }}>
                        ₺{selectedSeat.priceAmount}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem' }}>
                    👈 {language === 'tr' ? 'Lütfen kabin haritasından bir koltuk seçin.' : 'Please select a seat from the cabin map.'}
                  </div>
                )}

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!selectedFlight) return;
                    if (!isAuthenticated) {
                      setIsAuthOpen(true);
                      return;
                    }
                    const seatParam = selectedSeat ? `&seatId=${selectedSeat.id}` : '';
                    router.push(`/checkout/${selectedFlight.id}?fare=eco${seatParam}`);
                  }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
                >
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>{language === 'tr' ? 'Adınız' : 'First Name'}</label>
                    <input type="text" required className="input-corporate" placeholder="Ahmet" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>{language === 'tr' ? 'Soyadınız' : 'Last Name'}</label>
                    <input type="text" required className="input-corporate" placeholder="Yılmaz" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>{language === 'tr' ? 'E-Posta Adresiniz' : 'Email Address'}</label>
                    <input type="email" required className="input-corporate" placeholder="birtikla@aviqora.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>{language === 'tr' ? 'T.C. Kimlik / Pasaport No' : 'ID / Passport Number'}</label>
                    <input type="text" required className="input-corporate" placeholder="10000000000" value={identityNumber} onChange={(e) => setIdentityNumber(e.target.value)} />
                  </div>

                  <button
                    type="submit"
                    className="btn-brand"
                    style={{ width: '100%', marginTop: '12px', height: '50px', gap: '8px', fontSize: '0.95rem' }}
                    disabled={!selectedSeat}
                  >
                    <CreditCard size={18} /> {isAuthenticated ? (language === 'tr' ? 'Güvenli Ödemeye Geç' : 'Proceed to Payment') : (language === 'tr' ? 'Giriş Yap & Ödemeye Geç' : 'Login & Pay')}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal for Strict Auth Requirement */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* PNR Lookup Modal */}
      <PnrLookupModal isOpen={isPnrLookupOpen} onClose={() => setIsPnrLookupOpen(false)} onBookingFound={(b) => setActiveBoardingPass(b)} />

      {/* Boarding Pass Modal */}
      <BoardingPassModal booking={activeBoardingPass} onClose={() => setActiveBoardingPass(null)} />

      {/* Payment Modal */}
      {selectedFlight && selectedSeat && (
        <PaymentModal
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          flight={selectedFlight}
          seat={selectedSeat}
          passengerInfo={{ firstName, lastName, identityNumber, email }}
          onSuccess={(booking) => {
            setIsPaymentOpen(false);
            setSelectedFlight(null);
            setSelectedSeat(null);
            setActiveBoardingPass(booking);
          }}
        />
      )}

      {/* Mobile Filter Sheet Modal */}
      {isMobileFilterOpen && (
        <div className="modal-overlay" onClick={() => setIsMobileFilterOpen(false)}>
          <div
            className="corporate-card"
            style={{
              width: '100%',
              maxWidth: '540px',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-xl)',
              padding: '24px',
              maxHeight: '85vh',
              overflowY: 'auto',
              animation: 'modalFadeIn 0.2s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <SlidersHorizontal size={18} style={{ color: 'var(--brand-accent)' }} />
                {language === 'tr' ? 'Filtreleri Düzenle' : 'Flight Filters'}
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  type="button"
                  onClick={resetFilters}
                  style={{ background: 'none', border: 'none', color: 'var(--brand-accent)', fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer' }}
                >
                  {language === 'tr' ? 'Sıfırla' : 'Reset'}
                </button>
                <button className="btn-outline" onClick={() => setIsMobileFilterOpen(false)} style={{ padding: '4px 8px' }}>
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* STOPS FILTER */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '10px' }}>
                {language === 'tr' ? 'Aktarma Durumu' : 'Stops Preference'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { id: 'all', label: language === 'tr' ? 'Tüm Uçuşlar' : 'All Flights' },
                  { id: 'direct', label: language === 'tr' ? 'Sadece Direkt Uçuşlar' : 'Direct Flights Only' },
                  { id: 'connecting', label: language === 'tr' ? 'Aktarmalı Uçuşlar' : 'Connecting Flights' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setStopsFilter(item.id as any)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      textAlign: 'left',
                      backgroundColor: stopsFilter === item.id ? 'rgba(37, 99, 235, 0.1)' : 'var(--bg-secondary)',
                      color: stopsFilter === item.id ? 'var(--brand-accent)' : 'var(--text-primary)',
                      border: stopsFilter === item.id ? '1.5px solid var(--brand-accent)' : '1px solid var(--border-color)',
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* PRICE RANGE FILTER */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                <span>{language === 'tr' ? 'Maksimum Bilet Fiyatı' : 'Max Price'}</span>
                <span style={{ color: 'var(--brand-accent)', fontWeight: 900 }}>₺{maxPriceFilter.toLocaleString('tr-TR')}</span>
              </div>
              <input
                type="range"
                min="1000"
                max="25000"
                step="250"
                value={maxPriceFilter}
                onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
                style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--brand-accent)' }}
              />
            </div>

            {/* TIME WINDOW */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '10px' }}>
                {language === 'tr' ? 'Kalkış Saati Aralığı' : 'Departure Window'}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {[
                  { id: 'all', label: 'Tüm Saatler' },
                  { id: 'morning', label: 'Sabah (06-12)' },
                  { id: 'afternoon', label: 'Öğle (12-18)' },
                  { id: 'evening', label: 'Akşam (18-06)' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTimeFilter(item.id as any)}
                    style={{
                      padding: '10px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      backgroundColor: timeFilter === item.id ? 'rgba(37, 99, 235, 0.1)' : 'var(--bg-secondary)',
                      color: timeFilter === item.id ? 'var(--brand-accent)' : 'var(--text-primary)',
                      border: timeFilter === item.id ? '1.5px solid var(--brand-accent)' : '1px solid var(--border-color)',
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              className="btn-brand"
              onClick={() => setIsMobileFilterOpen(false)}
              style={{ width: '100%', height: '48px', fontSize: '0.95rem' }}
            >
              {filteredFlights.length} {language === 'tr' ? 'Uçuşu Listele' : 'Show Flights'}
            </button>
          </div>
        </div>
      )}

      {/* Floating Sticky Mobile Filter Pill Button (THY Standard) */}
      <div
        className="mobile-floating-filter-bar"
        style={{
          display: 'none',
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 900,
        }}
      >
        <button
          type="button"
          onClick={() => setIsMobileFilterOpen(true)}
          className="btn-brand"
          style={{
            height: '46px',
            padding: '0 22px',
            borderRadius: '30px',
            fontSize: '0.88rem',
            fontWeight: 800,
            boxShadow: '0 8px 24px rgba(0, 82, 204, 0.4)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            border: '1.5px solid rgba(255, 255, 255, 0.3)',
            whiteSpace: 'nowrap',
          }}
        >
          <SlidersHorizontal size={16} />
          {language === 'tr' ? `Filtrele & Sırala (${filteredFlights.length})` : `Filter & Sort (${filteredFlights.length})`}
        </button>
      </div>

      <Footer />
    </div>
  );
}

export default function FlightSearchPage() {
  return (
    <Suspense fallback={<div style={{ padding: '60px', textAlign: 'center' }}>Uçuş Arama Yükleniyor...</div>}>
      <FlightSearchContent />
    </Suspense>
  );
}
