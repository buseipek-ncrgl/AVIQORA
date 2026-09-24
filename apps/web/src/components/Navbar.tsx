'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCurrency, Currency, RATES } from '@/context/CurrencyContext';
import { useLanguage } from '@/context/LanguageContext';
import { CustomSelect } from '@/components/CustomSelect';
import { AviqoraLogo } from '@/components/AviqoraLogo';
import { Bot, Sparkles, Globe, DollarSign, Search, User, LogOut, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  onOpenAuth: () => void;
  onOpenPnrLookup: () => void;
  onOpenAiAssistant?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth, onOpenPnrLookup, onOpenAiAssistant }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const { language, toggleLanguage, t } = useLanguage();
  
  const [scrolled, setScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: '16px 32px',
        transition: 'all 0.35s ease',
      }}
    >
      <nav
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '12px 24px',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: scrolled ? 'rgba(7, 17, 31, 0.88)' : 'rgba(10, 25, 47, 0.75)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
          transition: 'all 0.35s ease',
        }}
      >
        {/* Left: Brand Logo */}
        <div style={{ cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <AviqoraLogo size={38} showText={true} showTagline={true} />
        </div>

        {/* Center: Menu Items & AI Assistant Trigger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }} className="desktop-only">
          <a href="#search" style={{ color: '#f8fafc', textDecoration: 'none', fontSize: '0.86rem', fontWeight: 700, opacity: 0.9 }}>
            {t('nav.flights') || 'Uçuşlar'}
          </a>
          <a href="#destinations" style={{ color: '#f8fafc', textDecoration: 'none', fontSize: '0.86rem', fontWeight: 700, opacity: 0.9 }}>
            {t('nav.destinations') || 'Destinasyonlar'}
          </a>
          <a href="#showcase" style={{ color: '#f8fafc', textDecoration: 'none', fontSize: '0.86rem', fontWeight: 700, opacity: 0.9 }}>
            {t('nav.fleet') || 'Filomuz'}
          </a>

          {/* AQ AI Assistant Button */}
          {onOpenAiAssistant && (
            <button
              onClick={onOpenAiAssistant}
              style={{
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                color: 'var(--brand-gold)',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Bot size={15} /> AQ AI Asistan <Sparkles size={12} />
            </button>
          )}
        </div>

        {/* Right: Currency, Language & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          
          {/* Currency Switcher */}
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
            style={{ width: '115px', height: '32px', fontSize: '0.78rem', padding: '0 8px' }}
          />

          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              padding: '6px 10px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            title="Dil Değiştir (Language)"
          >
            <Globe size={14} /> {language.toUpperCase()}
          </button>

          <button
            onClick={onOpenPnrLookup}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#f8fafc',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            🔍 PNR Sorgula
          </button>

          {isAuthenticated ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                style={{
                  background: 'rgba(0, 242, 254, 0.12)',
                  border: '1px solid #00f2fe',
                  color: '#ffffff',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                👤 {user?.fullName}
              </button>

              {showDropdown && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '115%',
                    width: '210px',
                    background: '#0b1e33',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '12px',
                    padding: '8px',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
                  }}
                >
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ffffff' }}>{user?.fullName}</div>
                    <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>{user?.email}</div>
                  </div>

                  <button
                    onClick={() => {
                      logout();
                      setShowDropdown(false);
                    }}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      color: '#ef4444',
                      padding: '10px 12px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      marginTop: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <LogOut size={16} /> Oturumu Kapat
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              style={{
                background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
                color: '#040914',
                border: 'none',
                padding: '8px 18px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(0, 242, 254, 0.3)',
              }}
            >
              Giriş Yap / Kayıt Ol
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};
