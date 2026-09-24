'use client';

import React, { useState } from 'react';
import { BookingDto } from '@/types/api';
import { useLanguage } from '@/context/LanguageContext';
import { Plane, ShieldCheck, CheckCircle, X, Printer, Utensils, Luggage, FileText } from 'lucide-react';
import { downloadEInvoicePdfOrPrint } from '@/lib/invoice';

interface BoardingPassModalProps {
  booking: BookingDto | null;
  onClose: () => void;
}

export const BoardingPassModal: React.FC<BoardingPassModalProps> = ({ booking, onClose }) => {
  const { language } = useLanguage();
  const isTr = language === 'tr';
  const [activePassengerIndex, setActivePassengerIndex] = useState(0);

  if (!booking || !booking.passengers || booking.passengers.length === 0) return null;

  const passengersList = booking.passengers;
  const currentPassengerIndex = Math.min(activePassengerIndex, passengersList.length - 1);
  const passenger = passengersList[currentPassengerIndex];
  const depTime = new Date(booking.departureTime);
  const boardingTime = new Date(depTime.getTime() - 45 * 60000); // 45 mins before flight

  // Ensure passenger has a valid seat code displayed
  const getSeatCode = (pass: { seatCode?: string }, idx: number) => {
    if (
      pass &&
      pass.seatCode &&
      !pass.seatCode.includes('Atanmadı') &&
      !pass.seatCode.includes('Atanacak')
    ) {
      return pass.seatCode;
    }
    const defaultSeats = ['12A', '12B', '12C', '12D', '12E', '12F'];
    return defaultSeats[idx % defaultSeats.length];
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=900,height=800,scrollbars=yes');
    if (!printWindow) {
      window.print();
      return;
    }

    const passesHtml = passengersList
      .map((pass, pIdx) => {
        const seatCode = getSeatCode(pass, pIdx);
        return `
        <div class="pass-card" style="page-break-after: always; break-after: page; padding: 30px; margin-bottom: 20px; border: 2px solid #2563eb; border-radius: 16px; background-color: #ffffff; color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="display: flex; justify-content: space-between; border-bottom: 2px dashed #2563eb; padding-bottom: 16px; margin-bottom: 20px;">
            <div>
              <h1 style="margin: 0; color: #2563eb; font-size: 22px; font-weight: 900; letter-spacing: 1px;">AVIQORA AIRWAYS ${isTr ? 'BİNİŞ KARTI' : 'BOARDING PASS'}</h1>
              <span style="font-size: 12px; color: #64748b; font-weight: 700;">IATA / BCBP ${isTr ? 'ELEKTRONİK BİNİŞ KARTI' : 'ELECTRONIC BOARDING PASS'}</span>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 20px; font-weight: 900; color: #2563eb;">PNR: ${booking.pnrCode}</div>
              <div style="font-size: 12px; color: #64748b; font-weight: 700;">${isTr ? 'Yolcu' : 'Passenger'} ${pIdx + 1} / ${passengersList.length}</div>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; background-color: #f8fafc; padding: 16px 24px; border-radius: 12px; margin-bottom: 20px; border: 1px solid #e2e8f0;">
            <div>
              <div style="font-size: 28px; font-weight: 900; color: #2563eb;">${booking.departureAirport}</div>
              <div style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase;">${isTr ? 'Kalkış Havalimanı' : 'Departure Airport'}</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 16px; font-weight: 900; color: #0f172a;">✈ ${booking.flightNumber}</div>
              <div style="font-size: 12px; color: #64748b;">${depTime.toLocaleString(isTr ? 'tr-TR' : 'en-US')}</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 28px; font-weight: 900; color: #2563eb;">${booking.arrivalAirport}</div>
              <div style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase;">${isTr ? 'Varış Havalimanı' : 'Arrival Airport'}</div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;">
            <div>
              <div style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase;">${isTr ? 'YOLCU ADI' : 'PASSENGER NAME'}</div>
              <div style="font-size: 16px; font-weight: 900; color: #0f172a; margin-top: 4px;">${pass.passengerName}</div>
            </div>
            <div>
              <div style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase;">${isTr ? 'KOLTUK NO' : 'SEAT NO'}</div>
              <div style="font-size: 22px; font-weight: 900; color: #059669; margin-top: 2px;">${seatCode}</div>
            </div>
            <div>
              <div style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase;">${isTr ? 'GATE / KAPINI' : 'BOARDING GATE'}</div>
              <div style="font-size: 18px; font-weight: 900; color: #2563eb; margin-top: 2px;">${booking.boardingGate || 'B14'}</div>
            </div>
            <div>
              <div style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase;">${isTr ? 'BİNİŞ SAATİ' : 'BOARDING TIME'}</div>
              <div style="font-size: 18px; font-weight: 900; color: #10b981; margin-top: 2px;">${boardingTime.toLocaleTimeString(isTr ? 'tr-TR' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </div>

          <div style="border-top: 2px dashed #cbd5e1; padding-top: 16px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 12px; color: #0f172a; font-weight: 800;">${isTr ? 'Bagaj' : 'Baggage'}: ${booking.baggageAllowance || (isTr ? '15 kg Uçak Altı + Kabin Bagajı' : '15 kg Checked + Cabin Baggage')}</div>
              <div style="font-size: 11px; color: #64748b; font-family: monospace; margin-top: 4px;">M1${pass.passengerName.toUpperCase()} E${booking.pnrCode} ${booking.departureAirport}${booking.arrivalAirport}</div>
            </div>
            <div style="font-size: 11px; font-weight: 900; color: #059669; border: 2px solid #059669; padding: 6px 12px; border-radius: 6px; letter-spacing: 1px;">
              ✓ GATE SECURITY VERIFIED
            </div>
          </div>
        </div>`;
      })
      .join('');

    const fullDoc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${isTr ? 'Biniş Kartları' : 'Boarding Passes'} - PNR: ${booking.pnrCode}</title>
  <style>
    body { margin: 0; padding: 20px; background-color: #ffffff; }
    @media print {
      body { padding: 0; }
      .pass-card { page-break-after: always; break-after: page; }
    }
  </style>
</head>
<body>
  ${passesHtml}
  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 400);
    };
  </script>
</body>
</html>`;

    printWindow.document.write(fullDoc);
    printWindow.document.close();
  };

  const handleDownloadInvoice = () => {
    downloadEInvoicePdfOrPrint(booking);
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 10050, padding: '8px' }} onClick={onClose}>
      <style jsx global>{`
        .boarding-pass-card {
          padding: clamp(14px, 4vw, 24px) !important;
          max-width: 100%;
          box-sizing: border-box;
        }
        .boarding-pass-badges {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
          margin-bottom: 16px;
        }
        .boarding-pass-details {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
          margin-bottom: 16px;
        }
        .boarding-pass-security {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .boarding-pass-actions {
          display: grid;
          grid-template-columns: 1.2fr 1.2fr 0.8fr;
          gap: 8px;
          margin-top: 14px;
        }

        @media (max-width: 560px) {
          .boarding-pass-card {
            padding: 12px 10px !important;
          }
          .boarding-pass-badges {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 6px;
          }
          .boarding-pass-details {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 6px;
          }
          .boarding-pass-security {
            flex-direction: column;
            align-items: stretch;
            text-align: center;
          }
          .boarding-pass-security-text {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .boarding-pass-actions {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div
        style={{ width: '100%', maxWidth: '600px', maxHeight: '92vh', overflowY: 'auto', padding: '2px', boxSizing: 'border-box' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="corporate-card boarding-pass-card"
          style={{
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '2px dashed var(--brand-accent)',
            borderRadius: 'var(--radius-xl)',
            position: 'relative',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plane size={18} style={{ color: 'var(--brand-accent)' }} />
              <span style={{ fontSize: 'clamp(0.85rem, 2.5vw, 1.05rem)', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
                {isTr ? 'AVIQORA DİJİTAL BİNİŞ KARTI' : 'AVIQORA DIGITAL BOARDING PASS'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div
                style={{
                  backgroundColor: 'var(--brand-accent)',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  letterSpacing: '0.5px',
                }}
              >
                PNR: {booking.pnrCode}
              </div>
              <button
                type="button"
                onClick={onClose}
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid var(--brand-red)',
                  color: 'var(--brand-red)',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
                title={isTr ? 'Kapat' : 'Close'}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Multi-Passenger Selector Tab Bar */}
          {passengersList.length > 1 && (
            <div style={{ marginBottom: '14px', display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', WebkitOverflowScrolling: 'touch' }}>
              {passengersList.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActivePassengerIndex(idx)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '14px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    border: idx === currentPassengerIndex ? '2px solid var(--brand-accent)' : '1px solid var(--border-color)',
                    backgroundColor: idx === currentPassengerIndex ? 'rgba(37, 99, 235, 0.12)' : 'var(--bg-secondary)',
                    color: idx === currentPassengerIndex ? 'var(--brand-accent)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  <span>{idx + 1}. {p.passengerName}</span>
                  <span style={{ fontSize: '0.7rem', opacity: 0.85 }}>({getSeatCode(p, idx)})</span>
                </button>
              ))}
            </div>
          )}

          {/* Route Section */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', backgroundColor: 'var(--bg-secondary)', padding: '12px 14px', borderRadius: 'var(--radius-md)', gap: '10px' }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', fontWeight: 900, color: 'var(--brand-accent)' }}>
                {booking.departureAirport}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{isTr ? 'Kalkış' : 'Departure'}</div>
            </div>

            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                <div style={{ height: '2px', width: '16px', backgroundColor: 'var(--brand-accent)', opacity: 0.5 }} />
                <Plane size={15} style={{ color: 'var(--brand-accent)', transform: 'rotate(90deg)' }} />
                <div style={{ height: '2px', width: '16px', backgroundColor: 'var(--brand-accent)', opacity: 0.5 }} />
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                {booking.flightNumber}
              </div>
            </div>

            <div style={{ textAlign: 'right', minWidth: 0 }}>
              <div style={{ fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', fontWeight: 900, color: 'var(--brand-accent)' }}>
                {booking.arrivalAirport}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{isTr ? 'Varış' : 'Arrival'}</div>
            </div>
          </div>

          {/* Gate, Terminal, Boarding Time Badges */}
          <div className="boarding-pass-badges">
            <div style={{ backgroundColor: 'rgba(37, 99, 235, 0.08)', border: '1px solid var(--brand-accent)', padding: '8px 4px', borderRadius: 'var(--radius-md)', textAlign: 'center', minWidth: 0 }}>
              <div style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{isTr ? 'KAPINI (GATE)' : 'BOARDING GATE'}</div>
              <div style={{ fontSize: 'clamp(0.82rem, 2.5vw, 1.15rem)', fontWeight: 900, color: 'var(--brand-accent)', marginTop: '2px', wordBreak: 'break-word' }}>
                {booking.boardingGate || 'Gate B14'}
              </div>
            </div>

            <div style={{ backgroundColor: 'rgba(37, 99, 235, 0.08)', border: '1px solid var(--brand-accent)', padding: '8px 4px', borderRadius: 'var(--radius-md)', textAlign: 'center', minWidth: 0 }}>
              <div style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>TERMINAL</div>
              <div style={{ fontSize: 'clamp(0.82rem, 2.5vw, 1.15rem)', fontWeight: 900, color: 'var(--text-primary)', marginTop: '2px', wordBreak: 'break-word' }}>
                {booking.terminal || 'Terminal 1'}
              </div>
            </div>

            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid #10b981', padding: '8px 4px', borderRadius: 'var(--radius-md)', textAlign: 'center', minWidth: 0 }}>
              <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase' }}>{isTr ? 'BİNİŞ SAATİ' : 'BOARDING TIME'}</div>
              <div style={{ fontSize: 'clamp(0.82rem, 2.5vw, 1.1rem)', fontWeight: 900, color: '#10b981', marginTop: '2px' }}>
                {boardingTime.toLocaleTimeString(isTr ? 'tr-TR' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="boarding-pass-details">
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{isTr ? 'Yolcu Adı' : 'Passenger Name'}</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px', wordBreak: 'break-word' }}>
                {passenger?.passengerName || (isTr ? 'Belirtilmedi' : 'N/A')}
              </div>
            </div>

            <div style={{ minWidth: 0, textAlign: 'center' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{isTr ? 'Koltuk No' : 'Seat No'}</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#059669', marginTop: '2px' }}>
                {getSeatCode(passenger, currentPassengerIndex)}
              </div>
            </div>

            <div style={{ minWidth: 0, textAlign: 'right' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{isTr ? 'Uçuş Zamanı' : 'Flight Time'}</div>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px', whiteSpace: 'nowrap' }}>
                {depTime.toLocaleDateString(isTr ? 'tr-TR' : 'en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })} <br/>
                {depTime.toLocaleTimeString(isTr ? 'tr-TR' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>

          {/* Gourmet Meal & Baggage Badge */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '18px' }}>
            <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '10px 14px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Luggage size={16} style={{ color: 'var(--brand-accent)', flexShrink: 0 }} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{isTr ? 'BAGAJ HAKKI' : 'BAGGAGE ALLOWANCE'}</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {booking.baggageAllowance || (isTr ? '15 kg Uçak Altı + Kabin' : '15 kg Checked + Cabin Baggage')}
                </div>
              </div>
            </div>

            {booking.mealPreference && (
              <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '10px 14px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Utensils size={16} style={{ color: 'var(--brand-accent)', flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{isTr ? 'GURME İKRAM' : 'GOURMET MEAL'}</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {booking.mealPreference}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Barcode & 2D Aztec QR Gate Scanner Section */}
          <div className="boarding-pass-security" style={{ borderTop: '2px dashed var(--border-color)', paddingTop: '16px', backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '14px 16px', borderRadius: 'var(--radius-lg)' }}>
            <div className="boarding-pass-security-text" style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <ShieldCheck size={15} style={{ color: '#059669', flexShrink: 0 }} /> IATA / BCBP GATE SECURITY VERIFIED
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1.35 }}>
                {isTr
                  ? 'Bu 2D barkodu güvenlik kontrolü ve elektronik kapı okuyucularına okutun.'
                  : 'Scan this 2D barcode at security checkpoints and electronic gate scanners.'}
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.68rem', color: 'var(--brand-accent)', fontWeight: 800, marginTop: '4px', wordBreak: 'break-all' }}>
                M1{passenger?.passengerName?.toUpperCase() || 'PASSENGER'} E{booking.pnrCode} {booking.departureAirport}{booking.arrivalAirport} {booking.flightNumber}
              </div>
            </div>

            {/* Realistic High-Density Vector 2D QR Code Container */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                padding: '6px',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                flexShrink: 0,
                alignSelf: 'center',
              }}
            >
              <svg width="72" height="72" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="5" y="5" width="28" height="28" fill="#0f172a" rx="3" />
                <rect x="10" y="10" width="18" height="18" fill="#ffffff" rx="2" />
                <rect x="14" y="14" width="10" height="10" fill="#0f172a" rx="1" />
                <rect x="67" y="5" width="28" height="28" fill="#0f172a" rx="3" />
                <rect x="72" y="10" width="18" height="18" fill="#ffffff" rx="2" />
                <rect x="76" y="14" width="10" height="10" fill="#0f172a" rx="1" />
                <rect x="5" y="67" width="28" height="28" fill="#0f172a" rx="3" />
                <rect x="10" y="72" width="18" height="18" fill="#ffffff" rx="2" />
                <rect x="14" y="76" width="10" height="10" fill="#0f172a" rx="1" />
                <rect x="40" y="8" width="6" height="6" fill="#0f172a" />
                <rect x="52" y="8" width="8" height="6" fill="#0f172a" />
                <rect x="40" y="20" width="12" height="6" fill="#0f172a" />
                <rect x="58" y="20" width="4" height="6" fill="#0f172a" />
                <rect x="8" y="40" width="6" height="12" fill="#0f172a" />
                <rect x="20" y="40" width="14" height="6" fill="#0f172a" />
                <rect x="40" y="40" width="20" height="20" fill="#0f172a" rx="2" />
                <rect x="45" y="45" width="10" height="10" fill="#ffffff" rx="1" />
                <rect x="48" y="48" width="4" height="4" fill="#0f172a" />
                <rect x="66" y="40" width="12" height="6" fill="#0f172a" />
                <rect x="84" y="40" width="8" height="12" fill="#0f172a" />
                <rect x="40" y="66" width="8" height="8" fill="#0f172a" />
                <rect x="54" y="66" width="12" height="6" fill="#0f172a" />
                <rect x="72" y="66" width="8" height="8" fill="#0f172a" />
                <rect x="66" y="80" width="14" height="8" fill="#0f172a" />
                <rect x="86" y="80" width="6" height="12" fill="#0f172a" />
                <rect x="40" y="82" width="18" height="6" fill="#0f172a" />
              </svg>
              <span style={{ fontSize: '0.6rem', fontWeight: 900, color: '#0f172a', letterSpacing: '0.5px' }}>
                PNR: {booking.pnrCode}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="boarding-pass-actions">
          <button
            onClick={handlePrint}
            className="btn-brand-v2"
            style={{ height: '44px', fontSize: '0.86rem' }}
          >
            <Printer size={16} /> {isTr ? `Biniş Kartını Yazdır (${passengersList.length} Yolcu)` : `Print Boarding Pass (${passengersList.length} Passenger${passengersList.length > 1 ? 's' : ''})`}
          </button>

          <button
            onClick={handleDownloadInvoice}
            className="btn-brand-v2"
            style={{ height: '44px', fontSize: '0.86rem', backgroundColor: '#059669', background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}
          >
            <FileText size={16} /> {isTr ? 'E-Fatura İndir / Yazdır' : 'Download / Print E-Invoice'}
          </button>
          
          <button
            onClick={onClose}
            className="btn-brand"
            style={{ height: '44px', fontSize: '0.86rem', backgroundColor: '#dc2626', borderColor: '#dc2626', color: '#ffffff', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <X size={16} /> {isTr ? 'Kapat' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

