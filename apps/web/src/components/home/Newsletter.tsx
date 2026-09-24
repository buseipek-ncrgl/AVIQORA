'use client';

import React, { useState } from 'react';
import { Mail, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export const Newsletter: React.FC = () => {
  const { language } = useLanguage();
  const isTr = language === 'tr';
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubscribed(true);
    setEmail('');
  };

  return (
    <section style={{ padding: 'clamp(48px, 6vw, 80px) clamp(16px, 4vw, 32px)', backgroundColor: 'var(--bg-primary)', borderTop: '1px solid var(--border-color)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div
          className="corporate-card"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: '24px',
            padding: 'clamp(32px, 5vw, 56px) clamp(24px, 4vw, 48px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '32px',
            flexWrap: 'wrap',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div style={{ maxWidth: '580px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--brand-accent)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={16} /> {isTr ? 'BÜLTEN ABONELİĞİ' : 'NEWSLETTER SUBSCRIPTION'}
            </span>
            <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 900, color: 'var(--text-primary)', margin: '8px 0 12px 0' }}>
              {isTr ? 'Fırsatları Kaçırma' : 'Never Miss a Flight Deal'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', lineHeight: 1.6 }}>
              {isTr
                ? 'Özel uçuş indirimleri, erken rezervasyon kampanyaları ve gizli seyahat fırsatlarından ilk sen haberdar ol.'
                : 'Be the first to receive exclusive flight discounts, early bird fare drops, and secret travel offers.'}
            </p>
          </div>

          <div style={{ flex: '1 1 380px', maxWidth: '480px' }}>
            {isSubscribed ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#10b981', fontWeight: 800, fontSize: '1rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '16px 20px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <CheckCircle2 size={20} />
                <span>{isTr ? 'Bültenimize başarıyla kaydolundunuz! Teşekkür ederiz.' : 'Successfully subscribed to our newsletter! Thank you.'}</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    placeholder={isTr ? 'E-posta adresini gir' : 'Enter your email address'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      height: '52px',
                      paddingLeft: '46px',
                      paddingRight: '16px',
                      borderRadius: '12px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      fontSize: '0.95rem',
                      outline: 'none',
                    }}
                  />
                </div>
                <button type="submit" className="btn-brand" style={{ height: '52px', padding: '0 28px', fontSize: '0.95rem', fontWeight: 800, whiteSpace: 'nowrap', borderRadius: '12px' }}>
                  {isTr ? 'Abone Ol' : 'Subscribe'}
                </button>
              </form>
            )}
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '10px' }}>
              {isTr
                ? 'İstediğin zaman tek tıkla abonelikten çıkabilirsin. Gizliliğin bizim için önemlidir.'
                : 'Unsubscribe at any time with one click. We respect your privacy.'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
