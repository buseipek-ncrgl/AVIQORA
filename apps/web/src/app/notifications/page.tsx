'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AuthModal } from '@/components/AuthModal';
import { PnrLookupModal } from '@/components/PnrLookupModal';
import { BaggageCalculatorModal } from '@/components/BaggageCalculatorModal';
import {
  Bell,
  CheckCheck,
  Trash2,
  ArrowRight,
  Plane,
  ShieldCheck,
  Ticket,
  Star,
  Check,
  Clock,
  Inbox,
  Sparkles,
  Luggage,
  Zap,
  Search,
  FileText,
} from 'lucide-react';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  AppNotification,
} from '@/lib/notifications';
import Link from 'next/link';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'checkin' | 'booking' | 'miles'>('all');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isPnrOpen, setIsPnrOpen] = useState(false);
  const [isBaggageOpen, setIsBaggageOpen] = useState(false);

  useEffect(() => {
    setNotifications(getNotifications());
  }, []);

  const handleMarkAllRead = () => {
    setNotifications(markAllAsRead());
  };

  const handleSingleRead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setNotifications(markAsRead(id));
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(deleteNotification(id));
  };

  const filtered = notifications.filter((n) => {
    if (activeFilter === 'all') return true;
    return n.type === activeFilter;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;
  const readCount = notifications.length - unreadCount;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column' }}>
      <Header
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenPnrLookup={() => setIsPnrOpen(true)}
      />

      <main style={{ flex: 1, maxWidth: '1280px', width: '100%', margin: '40px auto', padding: '0 24px 60px' }}>
        
        {/* Modern Glassmorphism Header Hero Banner */}
        <div
          className="corporate-card"
          style={{
            padding: '32px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-xl)',
            marginBottom: '32px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 900, color: 'var(--brand-accent)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                <Sparkles size={14} /> AVIQORA BİLDİRİM MERKEZİ
              </div>
              <h1 style={{ fontSize: '1.9rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
                Uçuş & Dijital Hizmet Bildirimleri
              </h1>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: '6px 0 0' }}>
                Online check-in anımsatıcıları, bilet ve e-fatura onayları, mil güncellemeleri.
              </p>
            </div>

            {/* Quick Summary Stat Counters */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ backgroundColor: 'rgba(37, 99, 235, 0.08)', border: '1px solid rgba(37, 99, 235, 0.2)', padding: '12px 20px', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--brand-accent)' }}>{notifications.length}</div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>TOPLAM</div>
              </div>

              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '12px 20px', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ef4444' }}>{unreadCount}</div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#ef4444', textTransform: 'uppercase' }}>OKUNMAMIŞ</div>
              </div>

              <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '12px 20px', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#059669' }}>{readCount}</div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase' }}>OKUNDU</div>
              </div>
            </div>
          </div>
        </div>

        {/* Responsive CSS styles for Notification Center */}
        <style>{`
          .notif-filter-wrapper {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            margin-bottom: 24px;
          }

          .notif-pills-scroll {
            display: flex;
            align-items: center;
            gap: 8px;
            overflow-x: auto;
            padding: 4px 2px 8px 2px;
            scrollbar-width: none;
            -ms-overflow-style: none;
            max-width: 100%;
          }

          .notif-pills-scroll::-webkit-scrollbar {
            display: none;
          }

          .notif-pill-btn {
            flex-shrink: 0;
            white-space: nowrap;
            padding: 8px 16px;
            border-radius: 24px;
            font-size: 0.82rem;
            font-weight: 800;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 6px;
            transition: var(--transition-fast);
          }

          @media (max-width: 640px) {
            .notif-filter-wrapper {
              flex-direction: column;
              align-items: stretch;
              gap: 10px;
            }
            .notif-mark-read-btn {
              align-self: flex-end;
            }
            .notif-item-card {
              flex-direction: column !important;
              align-items: stretch !important;
              gap: 14px !important;
              padding: 16px 18px !important;
            }
            .notif-item-actions {
              width: 100% !important;
              justify-content: flex-end !important;
              border-top: 1px dashed var(--border-color) !important;
              padding-top: 12px !important;
              margin-top: 4px !important;
              flex-wrap: wrap !important;
            }
          }
        `}</style>

        {/* Filter Navigation Bar & Mark All Read Action */}
        <div className="notif-filter-wrapper">
          
          {/* Scrollable Pill Tabs */}
          <div className="notif-pills-scroll">
            <button
              onClick={() => setActiveFilter('all')}
              className="notif-pill-btn"
              style={{
                border: activeFilter === 'all' ? '2px solid var(--brand-accent)' : '1px solid var(--border-color)',
                backgroundColor: activeFilter === 'all' ? 'rgba(37, 99, 235, 0.12)' : 'var(--bg-surface)',
                color: activeFilter === 'all' ? 'var(--brand-accent)' : 'var(--text-secondary)',
              }}
            >
              <Bell size={15} /> Tüm Bildirimler ({notifications.length})
            </button>

            <button
              onClick={() => setActiveFilter('checkin')}
              className="notif-pill-btn"
              style={{
                border: activeFilter === 'checkin' ? '2px solid #059669' : '1px solid var(--border-color)',
                backgroundColor: activeFilter === 'checkin' ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-surface)',
                color: activeFilter === 'checkin' ? '#059669' : 'var(--text-secondary)',
              }}
            >
              <Clock size={15} /> Check-in & Uçuş ({notifications.filter((n) => n.type === 'checkin').length})
            </button>

            <button
              onClick={() => setActiveFilter('booking')}
              className="notif-pill-btn"
              style={{
                border: activeFilter === 'booking' ? '2px solid var(--brand-accent)' : '1px solid var(--border-color)',
                backgroundColor: activeFilter === 'booking' ? 'rgba(37, 99, 235, 0.12)' : 'var(--bg-surface)',
                color: activeFilter === 'booking' ? 'var(--brand-accent)' : 'var(--text-secondary)',
              }}
            >
              <Ticket size={15} /> Bilet & Fatura ({notifications.filter((n) => n.type === 'booking').length})
            </button>

            <button
              onClick={() => setActiveFilter('miles')}
              className="notif-pill-btn"
              style={{
                border: activeFilter === 'miles' ? '2px solid var(--brand-gold)' : '1px solid var(--border-color)',
                backgroundColor: activeFilter === 'miles' ? 'rgba(217, 119, 6, 0.12)' : 'var(--bg-surface)',
                color: activeFilter === 'miles' ? 'var(--brand-gold)' : 'var(--text-secondary)',
              }}
            >
              <Star size={15} /> Mil & Kampanya ({notifications.filter((n) => n.type === 'miles').length})
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="btn-outline notif-mark-read-btn"
              style={{ padding: '8px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
            >
              <CheckCheck size={15} /> Tümünü Okundu İşaretle ({unreadCount})
            </button>
          )}
        </div>

        {/* Notifications List Container */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filtered.length === 0 ? (
            <div className="corporate-card" style={{ padding: '48px 24px', textAlign: 'center', backgroundColor: 'var(--bg-surface)' }}>
              <Inbox size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px', opacity: 0.5 }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Bu kategoride henüz bildirim yok.
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Yeni uçuş rezervasyonlarınız ve check-in güncellemeleriniz burada listelenecektir.
              </p>
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.type === 'checkin' ? Clock : item.type === 'booking' ? Ticket : item.type === 'miles' ? Star : ShieldCheck;
              const iconColor = item.type === 'checkin' ? '#059669' : item.type === 'booking' ? 'var(--brand-accent)' : item.type === 'miles' ? 'var(--brand-gold)' : 'var(--text-primary)';

              return (
                <div
                  key={item.id}
                  onClick={() => handleSingleRead(item.id)}
                  className="corporate-card notif-item-card"
                  style={{
                    padding: '22px 26px',
                    backgroundColor: item.read ? 'var(--bg-surface)' : 'rgba(37, 99, 235, 0.05)',
                    borderLeft: item.read ? '4px solid var(--border-color)' : '4px solid var(--brand-accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '20px',
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flex: 1 }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: iconColor,
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={20} />
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)' }}>{item.title}</span>
                        {!item.read && (
                          <span style={{ backgroundColor: 'var(--brand-accent)', color: '#ffffff', fontSize: '0.68rem', fontWeight: 900, padding: '2px 8px', borderRadius: '10px' }}>
                            YENİ
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '0 0 8px', lineHeight: 1.5 }}>
                        {item.message}
                      </p>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span>{new Date(item.timestamp).toLocaleString('tr-TR')}</span>
                        {item.pnrCode && (
                          <span style={{ fontWeight: 800, color: 'var(--brand-accent)' }}>PNR: {item.pnrCode}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Individual Action Buttons */}
                  <div className="notif-item-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                    {item.actionUrl && (
                      <Link
                        href={item.actionUrl}
                        className="btn-brand"
                        style={{ padding: '8px 14px', fontSize: '0.78rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        Detayı Gör <ArrowRight size={14} />
                      </Link>
                    )}

                    {!item.read && (
                      <button
                        onClick={(e) => handleSingleRead(item.id, e)}
                        className="btn-outline"
                        style={{ padding: '8px 12px', fontSize: '0.78rem', color: '#059669', borderColor: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}
                        title="Okundu olarak işaretle"
                      >
                        <Check size={14} /> Okundu
                      </button>
                    )}

                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      className="btn-outline"
                      style={{ padding: '8px 12px', fontSize: '0.78rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)', display: 'flex', alignItems: 'center', gap: '4px' }}
                      title="Bildirimi sil"
                    >
                      <Trash2 size={14} /> Sil
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      <Footer />

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <PnrLookupModal
        isOpen={isPnrOpen}
        onClose={() => setIsPnrOpen(false)}
        onBookingFound={() => {
          setIsPnrOpen(false);
          window.location.href = '/profile';
        }}
      />
      <BaggageCalculatorModal
        isOpen={isBaggageOpen}
        onClose={() => setIsBaggageOpen(false)}
        onOpenPnrLookup={() => {
          setIsBaggageOpen(false);
          setIsPnrOpen(true);
        }}
      />
    </div>
  );
}
