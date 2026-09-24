'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useCurrency, RATES, Currency } from '@/context/CurrencyContext';
import { MegaMenu } from './layout/MegaMenu';
import { CustomSelect } from './CustomSelect';
import { AviqoraLogo } from './AviqoraLogo';
import { Phone, Star, Globe, Moon, Sun, Search, User, ChevronDown, LogOut, Bell, CheckCheck, ArrowRight, Check, Trash2, Ticket, Clock, ShieldCheck, Menu, X, Plane, Sparkles, DollarSign } from 'lucide-react';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification, AppNotification } from '@/lib/notifications';

interface HeaderProps {
  onOpenAuth?: () => void;
  onOpenPnrLookup?: () => void;
  onSelectSearchRoute?: (from?: string, to?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAuth = () => {}, onOpenPnrLookup = () => {}, onSelectSearchRoute }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const { currency, setCurrency } = useCurrency();
  const [activeMegaCategory, setActiveMegaCategory] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  useEffect(() => {
    setNotifications(getNotifications());
    const interval = setInterval(() => {
      setNotifications(getNotifications());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications(markAllAsRead());
  };

  const handleNotificationClick = (notif: AppNotification) => {
    setNotifications(markAsRead(notif.id));
    if (notif.actionUrl) {
      window.location.href = notif.actionUrl;
    }
  };

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: theme === 'dark' ? 'rgba(11, 31, 58, 0.94)' : 'rgba(255, 255, 255, 0.94)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border-color)', transition: 'all 0.25s ease' }}>
      {/* Top Corporate Utility Bar */}
      <div
        className="top-corporate-bar"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          padding: '6px 32px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.78rem',
          color: 'var(--text-secondary)',
        }}
      >
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Phone size={14} style={{ color: 'var(--brand-accent)' }} />
            {language === 'tr' ? '7/24 Destek:' : '24/7 Support:'} <strong style={{ color: 'var(--text-primary)' }}>444 0 849</strong>
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--brand-gold)', fontWeight: 600 }}>
            <Star size={14} style={{ color: 'var(--brand-gold)' }} />
            AVIQORA Club
          </span>
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {/* Multi-Currency Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Globe size={13} style={{ color: 'var(--brand-accent)' }} />
            <CustomSelect
              value={currency}
              onChange={(val) => setCurrency(val as Currency)}
              options={[
                { value: 'TRY', label: '₺ TRY' },
                { value: 'USD', label: '$ USD' },
                { value: 'EUR', label: '€ EUR' },
                { value: 'GBP', label: '£ GBP' },
                { value: 'AED', label: 'د.إ AED' },
              ]}
              style={{ width: '115px', height: '30px', fontSize: '0.78rem', padding: '0 8px' }}
            />
          </div>

          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-primary)',
              fontWeight: 700,
              fontSize: '0.78rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
            }}
          >
            {language === 'tr' ? '🇹🇷 TR' : '🇬🇧 EN'}
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Light / Dark theme"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              padding: '4px 8px',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
          </button>

          <a href="#help" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 600 }}>
            {language === 'tr' ? 'Yardım' : 'Help'}
          </a>
        </div>
      </div>

      {/* Main Navigation Header */}
      <div
        className="main-nav-header"
        style={{
          padding: '0 32px',
          height: '76px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '1340px',
          margin: '0 auto',
          position: 'relative',
        }}
      >
        {/* Brand Wordmark Logo */}
        <Link href="/" style={{ textDecoration: 'none' }}>
          <AviqoraLogo size={38} showText={true} showTagline={true} />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="mega-menu-nav-links" style={{ display: 'flex', gap: '32px', height: '100%', alignItems: 'center' }}>
          <Link
            href="/flights"
            style={{
              color: 'var(--brand-accent)',
              fontWeight: 800,
              fontSize: '0.94rem',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              borderBottom: '2.5px solid var(--brand-accent)',
              padding: '0 4px',
            }}
          >
            {t('nav.flights')}
          </Link>

          <a
            href="#hotels"
            style={{
              color: 'var(--text-primary)',
              fontWeight: 600,
              fontSize: '0.94rem',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              padding: '0 4px',
            }}
          >
            {language === 'tr' ? 'Otel' : 'Hotels'}
          </a>

          <a
            href="#car-rental"
            style={{
              color: 'var(--text-primary)',
              fontWeight: 600,
              fontSize: '0.94rem',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              padding: '0 4px',
            }}
          >
            {language === 'tr' ? 'Araç Kiralama' : 'Car Rental'}
          </a>

          <a
            href="#offers"
            style={{
              color: 'var(--text-primary)',
              fontWeight: 600,
              fontSize: '0.94rem',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              padding: '0 4px',
            }}
          >
            {t('nav.offers')}
          </a>
        </nav>

        {/* Right CTA Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative' }}>
          
          {/* Notification Bell Dropdown Button */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                position: 'relative',
                transition: 'var(--transition-fast)',
              }}
              title="Bildirimler"
            >
              <Bell size={18} className={unreadCount > 0 ? 'bell-swing-anim' : ''} style={{ color: unreadCount > 0 ? 'var(--brand-accent)' : 'inherit' }} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-3px',
                    right: '-3px',
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    fontSize: '0.7rem',
                    fontWeight: 900,
                    borderRadius: '10px',
                    minWidth: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 4px',
                    boxShadow: '0 2px 4px rgba(239, 68, 68, 0.4)',
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown Menu Panel */}
            {isNotifOpen && (
              <>
                <style jsx global>{`
                  .header-notif-panel {
                    position: absolute;
                    top: 50px;
                    right: 0;
                    width: 360px;
                    max-width: calc(100vw - 24px);
                    background-color: var(--bg-surface-elevated);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-lg);
                    box-shadow: 0 12px 32px rgba(0,0,0,0.2);
                    z-index: 200;
                    padding: 14px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    box-sizing: border-box;
                  }

                  @media (max-width: 520px) {
                    .header-notif-panel {
                      position: fixed !important;
                      top: 65px !important;
                      left: 12px !important;
                      right: 12px !important;
                      width: calc(100vw - 24px) !important;
                      max-width: calc(100vw - 24px) !important;
                      box-shadow: 0 16px 40px rgba(0,0,0,0.35) !important;
                    }
                  }
                `}</style>

                <div className="header-notif-panel">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                    <div style={{ fontWeight: 900, fontSize: '0.92rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Bell size={16} style={{ color: 'var(--brand-accent)' }} /> Bildirimler Paneli
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        style={{ background: 'none', border: 'none', color: 'var(--brand-accent)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <CheckCheck size={14} /> Tümünü Okundu İşaretle
                      </button>
                    )}
                  </div>

                  <div style={{ maxHeight: '320px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {notifications.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        Henüz bildiriminiz yok.
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((n) => {
                        const Icon = n.type === 'checkin' ? Clock : n.type === 'booking' ? Ticket : n.type === 'miles' ? Star : ShieldCheck;
                        return (
                          <div
                            key={n.id}
                            onClick={() => handleNotificationClick(n)}
                            style={{
                              padding: '10px 12px',
                              borderRadius: 'var(--radius-md)',
                              backgroundColor: n.read ? 'var(--bg-secondary)' : 'rgba(37, 99, 235, 0.08)',
                              borderLeft: n.read ? '3px solid transparent' : '3px solid var(--brand-accent)',
                              cursor: 'pointer',
                              transition: 'var(--transition-fast)',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              gap: '8px',
                            }}
                          >
                            <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px', flexWrap: 'wrap' }}>
                                <Icon size={14} style={{ color: 'var(--brand-accent)', flexShrink: 0 }} />
                                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)', wordBreak: 'break-word' }}>{n.title}</span>
                              </div>
                              <p style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.35, wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                                {n.message}
                              </p>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0, marginTop: '2px' }}>
                              {!n.read && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setNotifications(markAsRead(n.id));
                                  }}
                                  style={{ background: 'none', border: 'none', color: '#059669', cursor: 'pointer', padding: '4px' }}
                                  title="Okundu olarak işaretle"
                                >
                                  <Check size={14} />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setNotifications(deleteNotification(n.id));
                                }}
                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                                title="Bildirimi sil"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <Link
                    href="/notifications"
                    onClick={() => setIsNotifOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      color: 'var(--brand-accent)',
                      textDecoration: 'none',
                      borderTop: '1px solid var(--border-color)',
                      paddingTop: '8px',
                      marginTop: '2px',
                    }}
                  >
                    Tüm Bildirimleri Gör ({notifications.length}) <ArrowRight size={14} />
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Mobile Header Auth Button (Always visible on small screens <= 900px) */}
          <div className="mobile-header-auth-btn">
            {isAuthenticated ? (
              <Link
                href="/profile"
                className="btn-brand"
                style={{
                  padding: '6px 12px',
                  fontSize: '0.78rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  borderRadius: 'var(--radius-md)',
                  whiteSpace: 'nowrap',
                }}
              >
                <User size={14} />
                <span>Hesabım</span>
              </Link>
            ) : (
              <button
                onClick={onOpenAuth}
                className="btn-brand"
                style={{
                  padding: '6px 12px',
                  fontSize: '0.78rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  borderRadius: 'var(--radius-md)',
                  whiteSpace: 'nowrap',
                }}
              >
                <User size={14} />
                <span>Giriş Yap</span>
              </button>
            )}
          </div>

          {/* Desktop-Only Action Buttons */}
          <div className="desktop-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={onOpenPnrLookup}
              className="btn-outline"
              style={{ padding: '8px 14px', fontSize: '0.85rem' }}
            >
              <Search size={14} /> {t('nav.myBookings')}
            </button>

            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Link
                  href="/profile"
                  className="btn-brand"
                  style={{ padding: '8px 14px', fontSize: '0.85rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <User size={14} /> {t('nav.myAccount')}
                </Link>

                <button
                  onClick={() => logout()}
                  className="btn-outline"
                  title="Oturumu Kapat"
                  style={{ padding: '8px 10px', fontSize: '0.85rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="btn-brand"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                <User size={14} /> {t('nav.signIn')}
              </button>
            )}
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="mobile-hamburger-btn"
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              width: '40px',
              height: '40px',
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)',
              cursor: 'pointer',
            }}
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Slide-over Mobile Navigation Drawer Overlay */}
      {isMobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: '64px',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'var(--bg-surface-elevated)',
            zIndex: 999,
            padding: '24px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            overflowY: 'auto',
            animation: 'modalFadeIn 0.2s ease-out',
            borderTop: '1px solid var(--border-color)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* User Account Bar */}
            <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {isAuthenticated ? (
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>{t('nav.welcome')}</div>
                  <div style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)' }}>{user?.fullName || t('nav.valuedCustomer')}</div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>AVIQORA Privileges</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 900, color: 'var(--text-primary)' }}>{t('nav.flyWithPrivileges')}</div>
                </div>
              )}

              {isAuthenticated ? (
                <Link
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="btn-brand"
                  style={{ padding: '8px 16px', fontSize: '0.82rem' }}
                >
                  <User size={14} /> {t('nav.myAccount')}
                </Link>
              ) : (
                <button
                  onClick={() => { setIsMobileMenuOpen(false); onOpenAuth(); }}
                  className="btn-brand"
                  style={{ padding: '8px 16px', fontSize: '0.82rem' }}
                >
                  <User size={14} /> {t('nav.signIn')}
                </button>
              )}
            </div>

            {/* Quick Actions Links */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                onClick={() => { setIsMobileMenuOpen(false); onOpenPnrLookup(); }}
                className="btn-outline"
                style={{ width: '100%', justifyContent: 'center', height: '46px', fontSize: '0.82rem', fontWeight: 800 }}
              >
                <Search size={14} /> {t('nav.myBookings')}
              </button>
              <Link
                href="/flights"
                onClick={() => setIsMobileMenuOpen(false)}
                className="btn-outline"
                style={{ width: '100%', justifyContent: 'center', height: '46px', fontSize: '0.82rem', fontWeight: 800, textDecoration: 'none' }}
              >
                <Ticket size={14} /> {t('booking.searchTab')}
              </Link>
            </div>

            {/* Nav Categories */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <Link
                href="/flights"
                onClick={() => setIsMobileMenuOpen(false)}
                style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', padding: '10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Plane size={18} style={{ color: 'var(--brand-accent)' }} /> {t('nav.flights')}
                </span>
                <ArrowRight size={16} style={{ color: 'var(--brand-accent)' }} />
              </Link>
              <Link
                href="/notifications"
                onClick={() => setIsMobileMenuOpen(false)}
                style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', padding: '10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bell size={18} style={{ color: 'var(--brand-accent)' }} /> {t('nav.notifications')} ({unreadCount})
                </span>
                <ArrowRight size={16} style={{ color: 'var(--brand-accent)' }} />
              </Link>
              <a
                href="#destinations"
                onClick={() => setIsMobileMenuOpen(false)}
                style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', padding: '10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Globe size={18} style={{ color: 'var(--brand-accent)' }} /> {t('nav.destinations')}
                </span>
                <ArrowRight size={16} style={{ color: 'var(--brand-accent)' }} />
              </a>
              <a
                href="#experience"
                onClick={() => setIsMobileMenuOpen(false)}
                style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', padding: '10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={18} style={{ color: 'var(--brand-accent)' }} /> {t('nav.experience')}
                </span>
                <ArrowRight size={16} style={{ color: 'var(--brand-accent)' }} />
              </a>
            </div>
          </div>

          {/* Bottom Utility Controls */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={toggleLanguage}
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '8px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Globe size={15} /> {language === 'tr' ? 'Türkçe (₺)' : 'English ($)'}
              </button>

              <button
                onClick={toggleTheme}
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '8px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
                {theme === 'light' ? 'Karanlık Mod' : 'Aydınlık Mod'}
              </button>
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '8px' }}>
              <Phone size={13} style={{ display: 'inline', marginRight: '4px', color: 'var(--brand-accent)' }} />
              Müşteri Hizmetleri: <strong style={{ color: 'var(--text-primary)' }}>444 0 849</strong>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Mega Menu */}
      <MegaMenu
        activeCategory={activeMegaCategory}
        onClose={() => setActiveMegaCategory(null)}
        onSelectSearch={(from?: string, to?: string) => {
          if (onSelectSearchRoute) onSelectSearchRoute(from, to);
        }}
      />
    </header>
  );
};
