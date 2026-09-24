'use client';

import React, { useState } from 'react';
import { SeatDto } from '@/types/api';
import { useLanguage } from '@/context/LanguageContext';
import { Check, X, User, Sparkles } from 'lucide-react';

export interface PassengerInfo {
  id: string;
  name: string;
  assignedSeat?: SeatDto | null;
}

interface SeatMapProps {
  seats: SeatDto[];
  selectedSeatId: string | null;
  onSelectSeat: (seat: SeatDto, passengerIndex?: number) => void;
  flightNumber: string;
  aircraftModel: string;
  passengers?: PassengerInfo[];
  activePassengerIndex?: number;
  onSelectPassenger?: (index: number) => void;
}

export const SeatMap: React.FC<SeatMapProps> = ({
  seats,
  selectedSeatId,
  onSelectSeat,
  flightNumber,
  aircraftModel,
  passengers = [{ id: 'p1', name: 'Passenger 1' }],
  activePassengerIndex = 0,
  onSelectPassenger,
}) => {
  const { language } = useLanguage();
  const isTr = language === 'tr';
  const [internalActivePassenger, setInternalActivePassenger] = useState(0);
  const currentPassengerIdx = onSelectPassenger ? activePassengerIndex : internalActivePassenger;

  const handlePassengerClick = (idx: number) => {
    if (onSelectPassenger) {
      onSelectPassenger(idx);
    } else {
      setInternalActivePassenger(idx);
    }
  };

  // Group Economy seats (Rows 1+) and guarantee 3x3 symmetric layout
  // Generate authentic rows: Row 1 is Premium Front Row, Row 2-3 Front Row, Row 4-10 Standard
  const mockSymmetricGrid = () => {
    // Separate by row
    const rowsMap: Record<number, SeatDto[]> = {};
    seats.forEach((seat) => {
      const rowNum = parseInt(seat.seatCode.replace(/\D/g, ''), 10) || 1;
      if (!rowsMap[rowNum]) rowsMap[rowNum] = [];
      rowsMap[rowNum].push(seat);
    });

    // Ensure we have rows 1 to 8 for a complete airliner feel
    const allRowNumbers = [1, 2, 3, 4, 5, 6, 7, 8];

    return allRowNumbers.map((rowNum) => {
      // Columns A, B, C on Left | D, E, F on Right
      const colsLeft = ['A', 'B', 'C'];
      const colsRight = ['D', 'E', 'F'];

      const leftSeats = colsLeft.map((col) => {
        const code = `${rowNum}${col}`;
        const found = seats.find((s) => s.seatCode === code);
        return (
          found || {
            id: `seat-${code}`,
            flightId: 'f1',
            seatCode: code,
            seatClass: rowNum === 1 ? 'Business' : 'Economy',
            status: 'Available',
            isAvailable: true,
            priceAmount: rowNum === 1 ? 760 : rowNum <= 3 ? 532 : 350,
            priceCurrency: 'TRY',
          }
        );
      });

      const rightSeats = colsRight.map((col) => {
        const code = `${rowNum}${col}`;
        const found = seats.find((s) => s.seatCode === code);
        return (
          found || {
            id: `seat-${code}`,
            flightId: 'f1',
            seatCode: code,
            seatClass: rowNum === 1 ? 'Business' : 'Economy',
            status: 'Available',
            isAvailable: true,
            priceAmount: rowNum === 1 ? 760 : rowNum <= 3 ? 532 : 350,
            priceCurrency: 'TRY',
          }
        );
      });

      return { rowNum, leftSeats, rightSeats };
    });
  };

  const gridRows = mockSymmetricGrid();

  const renderSeatButton = (seat: SeatDto) => {
    const isSelected = seat.id === selectedSeatId || passengers.some((p) => p.assignedSeat?.id === seat.id);
    const isCurrentPassengerSeat = selectedSeatId === seat.id || passengers[currentPassengerIdx]?.assignedSeat?.id === seat.id;
    const isOccupied = seat.status === 'Occupied' || (!seat.isAvailable && !isSelected);

    const rowNum = parseInt(seat.seatCode.replace(/\D/g, ''), 10) || 1;
    const isPremium = rowNum === 1;

    let buttonBg = 'rgba(16, 185, 129, 0.12)';
    let borderCol = 'rgba(16, 185, 129, 0.4)';
    let textCol = '#059669';

    if (isPremium) {
      buttonBg = 'rgba(147, 51, 234, 0.12)';
      borderCol = 'rgba(147, 51, 234, 0.5)';
      textCol = '#9333ea';
    }

    if (isOccupied) {
      buttonBg = 'var(--bg-secondary)';
      borderCol = 'var(--border-color)';
      textCol = 'var(--text-muted)';
    }

    if (isCurrentPassengerSeat) {
      buttonBg = 'var(--brand-accent)';
      borderCol = 'var(--brand-accent)';
      textCol = '#ffffff';
    }

    return (
      <button
        key={seat.id}
        disabled={isOccupied}
        onClick={() => {
          if (isCurrentPassengerSeat) {
            onSelectSeat({ ...seat, id: 'unselect' }, currentPassengerIdx);
          } else {
            onSelectSeat(seat, currentPassengerIdx);
          }
        }}
        style={{
          width: 'clamp(28px, 7vw, 36px)',
          height: 'clamp(28px, 7vw, 36px)',
          borderRadius: '6px',
          backgroundColor: buttonBg,
          border: `1.5px solid ${borderCol}`,
          color: textCol,
          fontWeight: 800,
          fontSize: 'clamp(0.64rem, 2.2vw, 0.78rem)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: isOccupied ? 'not-allowed' : 'pointer',
          transition: 'all 0.15s ease',
          boxShadow: isCurrentPassengerSeat ? '0 0 12px rgba(37, 99, 235, 0.4)' : 'none',
          opacity: isOccupied ? 0.5 : 1,
          flexShrink: 0,
        }}
        title={`${seat.seatCode} — ₺${seat.priceAmount}`}
      >
        {isCurrentPassengerSeat ? (
          <Check size={16} strokeWidth={3} />
        ) : isOccupied ? (
          <X size={14} style={{ opacity: 0.6 }} />
        ) : (
          <span>{seat.seatCode}</span>
        )}
      </button>
    );
  };

  // 10-Minute Redis Seat Hold Countdown Timer State
  const [timeLeft, setTimeLeft] = useState<number>(600);
  const [seatHoldExpired, setSeatHoldExpired] = useState(false);

  React.useEffect(() => {
    if (!selectedSeatId) {
      setTimeLeft(600);
      setSeatHoldExpired(false);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setSeatHoldExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedSeatId]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ width: '100%', maxWidth: '540px', margin: '0 auto' }}>
      
      {/* 10-Minute Redis Hold Live Banner */}
      {selectedSeatId && (
        <div
          style={{
            backgroundColor: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid #f59e0b',
            borderRadius: 'var(--radius-md)',
            padding: '14px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 900, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              ⏱️ {isTr ? 'GEÇİCİ KOLTUK KİLİDİ (REDIS TTL)' : 'TEMPORARY SEAT HOLD (REDIS TTL)'}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {isTr ? 'Seçilen koltuk başka yolcuların almasına karşı kilitlendi.' : 'Your seat choice is reserved exclusively for you.'}
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#f59e0b',
              color: '#000000',
              fontWeight: 900,
              fontSize: '1.2rem',
              padding: '6px 14px',
              borderRadius: '8px',
              fontFamily: 'monospace',
              letterSpacing: '1px',
            }}
          >
            {formatTimer(timeLeft)}
          </div>
        </div>
      )}

      {/* 1. Multi-Passenger Selection Bar */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
          {isTr
            ? `YOLCU İÇİN KOLTUK SEÇİNİZ (${passengers.length} Yolcu)`
            : `SELECT SEAT FOR PASSENGER (${passengers.length} Passenger${passengers.length > 1 ? 's' : ''})`}
        </div>
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
          {passengers.map((p, idx) => {
            const isActive = idx === currentPassengerIdx;
            const hasSeat = !!p.assignedSeat;

            return (
              <button
                key={p.id || idx}
                type="button"
                onClick={() => handlePassengerClick(idx)}
                style={{
                  flex: '1 1 110px',
                  minWidth: '110px',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isActive ? 'rgba(37, 99, 235, 0.08)' : 'var(--bg-surface)',
                  border: isActive ? '2px solid var(--brand-accent)' : '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: isActive ? 'var(--brand-accent)' : 'var(--bg-secondary)',
                    color: isActive ? '#ffffff' : 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <User size={15} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.82rem', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                    {p.name}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: hasSeat ? '#059669' : 'var(--brand-accent)', fontWeight: 700 }}>
                    {hasSeat ? `${isTr ? 'Koltuk' : 'Seat'}: ${p.assignedSeat?.seatCode}` : isTr ? 'Seçiniz' : 'Select'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Seat Status Legend */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '6px 12px',
          marginBottom: '18px',
          backgroundColor: 'var(--bg-secondary)',
          padding: '8px 12px',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.72rem',
          fontWeight: 700,
          border: '1px solid var(--border-color)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: 'rgba(147, 51, 234, 0.3)', border: '1px solid #9333ea', flexShrink: 0 }} />
          <span>{isTr ? 'Ön Sıra Premium' : 'Front Row Premium'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: 'rgba(16, 185, 129, 0.3)', border: '1px solid #10b981', flexShrink: 0 }} />
          <span>{isTr ? 'Standart' : 'Standard'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: 'var(--brand-accent)', flexShrink: 0 }} />
          <span>{isTr ? 'Seçili' : 'Selected'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', flexShrink: 0 }} />
          <span>{isTr ? 'Dolu' : 'Occupied'}</span>
        </div>
      </div>

      {/* 3. Authentic Fuselage Frame Scroll Wrapper (Prevents Horizontal Overflow) */}
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: '6px' }}>
        <div
          style={{
            position: 'relative',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '2px solid var(--border-color)',
            borderRadius: '80px 80px 24px 24px',
            padding: '32px 10px 24px 10px',
            boxShadow: 'var(--shadow-md)',
            minWidth: '280px',
          }}
        >
          {/* Cockpit Label */}
          <div style={{ textAlign: 'center', marginBottom: '18px' }}>
            <span style={{ fontSize: '0.64rem', fontWeight: 900, letterSpacing: '0.12em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              ✈️ {isTr ? 'KOKPİT' : 'COCKPIT'} ({aircraftModel} - {flightNumber})
            </span>
          </div>

          {/* Seat Column Header Letters (A B C | D E F) */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(6px, 2vw, 14px)', marginBottom: '14px', fontSize: '0.82rem', fontWeight: 900, color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', gap: 'clamp(3px, 1.2vw, 7px)', width: 'auto', justifyContent: 'space-around' }}>
              <span style={{ width: 'clamp(28px, 7vw, 36px)', textAlign: 'center' }}>A</span>
              <span style={{ width: 'clamp(28px, 7vw, 36px)', textAlign: 'center' }}>B</span>
              <span style={{ width: 'clamp(28px, 7vw, 36px)', textAlign: 'center' }}>C</span>
            </div>
            <div style={{ width: 'clamp(22px, 5vw, 28px)', flexShrink: 0 }} />
            <div style={{ display: 'flex', gap: 'clamp(3px, 1.2vw, 7px)', width: 'auto', justifyContent: 'space-around' }}>
              <span style={{ width: 'clamp(28px, 7vw, 36px)', textAlign: 'center' }}>D</span>
              <span style={{ width: 'clamp(28px, 7vw, 36px)', textAlign: 'center' }}>E</span>
              <span style={{ width: 'clamp(28px, 7vw, 36px)', textAlign: 'center' }}>F</span>
            </div>
          </div>

          {/* --- CATEGORY 1: Ön Sıra Premium (Row 1) --- */}
          <div
            style={{
              backgroundColor: 'rgba(147, 51, 234, 0.04)',
              border: '1px solid rgba(147, 51, 234, 0.2)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 8px',
              marginBottom: '14px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '4px' }}>
              <h4 style={{ fontSize: '0.82rem', fontWeight: 900, color: '#9333ea', display: 'flex', alignItems: 'center', gap: '4px', margin: 0 }}>
                <Sparkles size={13} /> {isTr ? 'Ön Sıra Premium (1. Sıra)' : 'Front Row Premium (Row 1)'}
              </h4>
              <div style={{ fontSize: '0.82rem', fontWeight: 900, color: '#9333ea', whiteSpace: 'nowrap' }}>₺760</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'clamp(6px, 2vw, 14px)' }}>
              <div style={{ display: 'flex', gap: 'clamp(3px, 1.2vw, 7px)' }}>
                {gridRows[0].leftSeats.map((seat) => renderSeatButton(seat))}
              </div>
              <div style={{ width: 'clamp(22px, 5vw, 28px)', height: 'clamp(22px, 5vw, 28px)', borderRadius: '50%', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 900, color: 'var(--text-muted)', flexShrink: 0 }}>
                1
              </div>
              <div style={{ display: 'flex', gap: 'clamp(3px, 1.2vw, 7px)' }}>
                {gridRows[0].rightSeats.map((seat) => renderSeatButton(seat))}
              </div>
            </div>
          </div>

          {/* --- CATEGORY 2: Ön Sıra (Row 2-3) --- */}
          <div
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.04)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 8px',
              marginBottom: '14px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '4px' }}>
              <h4 style={{ fontSize: '0.82rem', fontWeight: 900, color: '#059669', margin: 0 }}>
                {isTr ? 'Ön Sıra (2-3. Sıra)' : 'Front Row (Rows 2-3)'}
              </h4>
              <div style={{ fontSize: '0.82rem', fontWeight: 900, color: '#059669', whiteSpace: 'nowrap' }}>₺532</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {gridRows.slice(1, 3).map((row) => (
                <div key={row.rowNum} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'clamp(6px, 2vw, 14px)' }}>
                  <div style={{ display: 'flex', gap: 'clamp(3px, 1.2vw, 7px)' }}>
                    {row.leftSeats.map((seat) => renderSeatButton(seat))}
                  </div>
                  <div style={{ width: 'clamp(22px, 5vw, 28px)', height: 'clamp(22px, 5vw, 28px)', borderRadius: '50%', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 900, color: 'var(--text-muted)', flexShrink: 0 }}>
                    {row.rowNum}
                  </div>
                  <div style={{ display: 'flex', gap: 'clamp(3px, 1.2vw, 7px)' }}>
                    {row.rightSeats.map((seat) => renderSeatButton(seat))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* --- CATEGORY 3: Standart Koltuklar (Row 4-8) --- */}
          <div style={{ padding: '2px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '4px' }}>
              <h4 style={{ fontSize: '0.82rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
                {isTr ? 'Standart Koltuklar (4-8. Sıra)' : 'Standard Seats (Rows 4-8)'}
              </h4>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>{isTr ? 'Dahil / ₺0' : 'Included / ₺0'}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {gridRows.slice(3).map((row) => (
                <div key={row.rowNum} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'clamp(6px, 2vw, 14px)' }}>
                  <div style={{ display: 'flex', gap: 'clamp(3px, 1.2vw, 7px)' }}>
                    {row.leftSeats.map((seat) => renderSeatButton(seat))}
                  </div>
                  <div style={{ width: 'clamp(22px, 5vw, 28px)', height: 'clamp(22px, 5vw, 28px)', borderRadius: '50%', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 900, color: 'var(--text-muted)', flexShrink: 0 }}>
                    {row.rowNum}
                  </div>
                  <div style={{ display: 'flex', gap: 'clamp(3px, 1.2vw, 7px)' }}>
                    {row.rightSeats.map((seat) => renderSeatButton(seat))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
