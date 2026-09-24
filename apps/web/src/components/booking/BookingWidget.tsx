'use client';

import React, { useState } from 'react';
import { AirportSelect } from './AirportSelect';
import { DateRangePicker } from './DateRangePicker';
import { PassengerSelector, PassengersState } from './PassengerSelector';
import { CabinSelector } from './CabinSelector';
import { FareCalendar } from './FareCalendar';
import { useLanguage } from '@/context/LanguageContext';
import { Plane, Search, Ticket, ArrowRightLeft, ArrowRight, Users } from 'lucide-react';

interface BookingWidgetProps {
  onSearch: (from: string, to: string, departure: string, returnDate: string, tripType?: string) => void;
  onPnrSearch: (pnr: string, surname: string) => void;
  initialFrom?: string;
  initialTo?: string;
}

export const BookingWidget: React.FC<BookingWidgetProps> = ({
  onSearch,
  onPnrSearch,
  initialFrom = 'IST',
  initialTo = 'BER',
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'search' | 'booking' | 'checkin' | 'status'>('search');
  const [tripType, setTripType] = useState<'round' | 'oneWay' | 'multi'>('round');

  const [fromCode, setFromCode] = useState(initialFrom);
  const [toCode, setToCode] = useState(initialTo);

  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const nextWeekStr = new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0];

  const [departureDate, setDepartureDate] = useState(tomorrowStr);
  const [returnDate, setReturnDate] = useState(nextWeekStr);

  const [passengers, setPassengers] = useState<PassengersState>({ adults: 1, children: 0, infants: 0 });
  const [cabinClass, setCabinClass] = useState('Economy');
  const [showPassengerModal, setShowPassengerModal] = useState(false);
  const [useMiles, setUseMiles] = useState(false);

  const totalPassengers = passengers.adults + passengers.children + passengers.infants;

  // PNR lookup form state
  const [pnrCode, setPnrCode] = useState('');
  const [surname, setSurname] = useState('');

  // Inline Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSwapAirports = () => {
    const temp = fromCode;
    setFromCode(toCode);
    setToCode(temp);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!fromCode) newErrors.from = t('booking.errors.fromRequired');
    if (!toCode) newErrors.to = t('booking.errors.toRequired');
    if (fromCode && toCode && fromCode === toCode) newErrors.to = t('booking.errors.sameAirports');
    if (!departureDate) newErrors.departure = t('booking.errors.pastDate');

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSearch(fromCode, toCode, departureDate, tripType === 'round' ? returnDate : '', tripType);
  };

  const handlePnrSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pnrCode) return;
    onPnrSearch(pnrCode, surname);
  };

  return (
    <div
      className="booking-widget-container"
      style={{
        backgroundColor: 'var(--bg-surface-elevated)',
        border: '1.5px solid var(--border-color)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.22)',
        padding: 'clamp(18px, 3vw, 24px) clamp(18px, 3.5vw, 28px)',
        width: '100%',
        maxWidth: '1320px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 100,
        overflow: 'visible',
      }}
    >
      {/* Top Tab Switcher */}
      <div className="tab-switcher-scroll" style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
        <button
          type="button"
          onClick={() => setActiveTab('search')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'search' ? '2.5px solid var(--brand-accent)' : '2.5px solid transparent',
            padding: '8px 18px',
            fontWeight: 800,
            fontSize: '0.94rem',
            color: activeTab === 'search' ? 'var(--brand-accent)' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
          }}
        >
          <Plane size={16} /> {t('booking.searchTab')}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('booking')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'booking' ? '2.5px solid var(--brand-accent)' : '2.5px solid transparent',
            padding: '8px 18px',
            fontWeight: 800,
            fontSize: '0.94rem',
            color: activeTab === 'booking' ? 'var(--brand-accent)' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
          }}
        >
          <Search size={16} /> {t('booking.myBookingTab')}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('checkin')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'checkin' ? '2.5px solid var(--brand-accent)' : '2.5px solid transparent',
            padding: '8px 18px',
            fontWeight: 800,
            fontSize: '0.94rem',
            color: activeTab === 'checkin' ? 'var(--brand-accent)' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
          }}
        >
          <Ticket size={16} /> {t('booking.checkinTab')}
        </button>
      </div>

      {activeTab === 'search' && (
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Options Bar: Trip Types + Passengers & Cabin Modal + Miles Checkbox */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div className="trip-type-tabs" style={{ display: 'flex', gap: '20px', alignItems: 'center', fontSize: '0.86rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 800, color: 'var(--text-primary)' }}>
                <input type="radio" name="trip" checked={tripType === 'round'} onChange={() => setTripType('round')} />
                {t('booking.roundTrip')}
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 800, color: 'var(--text-primary)' }}>
                <input type="radio" name="trip" checked={tripType === 'oneWay'} onChange={() => setTripType('oneWay')} />
                {t('booking.oneWay')}
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 800, color: 'var(--text-primary)' }}>
                <input type="radio" name="trip" checked={tripType === 'multi'} onChange={() => setTripType('multi')} />
                {t('booking.multiCity')}
              </label>
            </div>

            {/* Passenger & Cabin Dropdown Pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setShowPassengerModal(!showPassengerModal)}
                  className="btn-outline"
                  style={{
                    padding: '6px 14px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    borderRadius: 'var(--radius-full)',
                    borderColor: 'var(--border-color)',
                    backgroundColor: 'var(--bg-surface)',
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={15} style={{ color: 'var(--brand-accent)' }} />
                    <span>{totalPassengers} Yolcu, {cabinClass} Class ▾</span>
                  </span>
                </button>

                {showPassengerModal && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 6px)',
                      right: 0,
                      backgroundColor: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-lg)',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
                      padding: '16px',
                      zIndex: 200,
                      width: '280px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                    }}
                  >
                    <PassengerSelector passengers={passengers} onChange={setPassengers} />
                    <CabinSelector value={cabinClass} onChange={setCabinClass} />
                    <button
                      type="button"
                      onClick={() => setShowPassengerModal(false)}
                      className="btn-brand"
                      style={{ padding: '8px', fontSize: '0.82rem', textAlign: 'center' }}
                    >
                      Tamam
                    </button>
                  </div>
                )}
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--brand-gold)', cursor: 'pointer' }}>
                <input type="checkbox" checked={useMiles} onChange={(e) => setUseMiles(e.target.checked)} />
                Mil ile Uçuş Ara (AVIQORA Club)
              </label>
            </div>
          </div>

          {/* Fare Calendar (Lowest Fares Matrix) */}
          <FareCalendar
            selectedDate={departureDate}
            onSelectDate={setDepartureDate}
            fromCode={fromCode}
            toCode={toCode}
          />

          {/* Single Horizontal Search Strip Desktop Layout */}
          <div className="booking-widget-grid" style={{ display: 'grid', gridTemplateColumns: '2fr auto 2fr 2.2fr auto', gap: '12px', alignItems: 'end' }}>
            {/* From */}
            <AirportSelect label={t('booking.from')} value={fromCode} onChange={setFromCode} error={errors.from} isOrigin={true} />

            {/* Swap Button */}
            <button
              type="button"
              onClick={handleSwapAirports}
              title="Havalimanlarını Değiştir"
              className="btn-outline airport-swap-btn"
              style={{ width: '48px', height: '52px', padding: 0, borderRadius: 'var(--radius-md)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <ArrowRightLeft size={16} />
            </button>

            {/* To */}
            <AirportSelect label={t('booking.to')} value={toCode} onChange={setToCode} error={errors.to} isOrigin={false} />

            {/* Dates */}
            <DateRangePicker
              departureDate={departureDate}
              returnDate={returnDate}
              onDepartureChange={setDepartureDate}
              onReturnChange={setReturnDate}
              isRoundTrip={tripType === 'round'}
              error={errors.departure}
              fromCode={fromCode}
              toCode={toCode}
            />

            {/* Submit CTA */}
            <button type="submit" className="btn-brand search-submit-btn" style={{ height: '52px', padding: '0 28px', fontSize: '0.98rem', fontWeight: 900, whiteSpace: 'nowrap' }}>
              {t('booking.searchBtn')} <ArrowRight size={18} />
            </button>
          </div>
        </form>
      )}

      {(activeTab === 'booking' || activeTab === 'checkin') && (
        <form onSubmit={handlePnrSubmit} className="pnr-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '16px', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>
              {t('booking.pnrInput')}
            </label>
            <input
              type="text"
              placeholder="Örn: AVQ-9842"
              value={pnrCode}
              onChange={(e) => setPnrCode(e.target.value.toUpperCase())}
              className="input-corporate"
              style={{ height: '52px', width: '100%' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>
              {t('booking.surnameInput')}
            </label>
            <input
              type="text"
              placeholder="Soyadınızı Giriniz"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              className="input-corporate"
              style={{ height: '52px', width: '100%' }}
              required
            />
          </div>

          <button type="submit" className="btn-brand" style={{ height: '52px', padding: '0 28px', width: '100%' }}>
            {t('booking.lookupBtn')} <ArrowRight size={16} />
          </button>
        </form>
      )}
    </div>
  );
};
