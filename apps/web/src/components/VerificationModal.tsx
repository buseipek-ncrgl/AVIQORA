'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Mail, Phone, X, CheckCircle2, RefreshCw, Lock } from 'lucide-react';

interface VerificationModalProps {
  type: 'email' | 'phone';
  targetValue: string;
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  type,
  targetValue,
  isOpen,
  onClose,
  onVerified,
}) => {
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [timer, setTimer] = useState<number>(120);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    setTimer(120);
    setIsSuccess(false);
    setError(null);

    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const code = otp.join('');
    if (code.length < 6) {
      setError('Lütfen 6 haneli doğrulama kodunun tamamını giriniz.');
      return;
    }

    setIsSuccess(true);
    setTimeout(() => {
      onVerified();
      onClose();
    }, 1500);
  };

  const handleResendCode = () => {
    setTimer(120);
    setOtp(['', '', '', '', '', '']);
    setError(null);
  };

  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;
  const formattedTimer = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="corporate-card"
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: 'var(--bg-surface-elevated)',
          padding: '32px',
          borderRadius: 'var(--radius-xl)',
          animation: 'modalFadeIn 0.25s ease-out',
          textAlign: 'center',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'rgba(37, 99, 235, 0.12)', color: 'var(--brand-accent)' }}>
              {type === 'email' ? <Mail size={20} /> : <Phone size={20} />}
            </div>
            <span style={{ fontSize: '0.82rem', fontWeight: 900, color: 'var(--brand-accent)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {type === 'email' ? 'E-POSTA GÜVENLİK DOĞRULAMASI' : 'SMS TELEFON DOĞRULAMASI'}
            </span>
          </div>
          <button className="btn-outline" onClick={onClose} style={{ padding: '4px 10px' }}>
            <X size={16} />
          </button>
        </div>

        {/* Success State */}
        {isSuccess ? (
          <div style={{ padding: '32px 0' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <CheckCircle2 size={36} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#10b981' }}>
              Doğrulama Başarılı!
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {type === 'email' ? 'E-posta adresiniz' : 'Telefon numaranız'} sistemde onaylandı.
            </p>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Doğrulama Kodunu Giriniz
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
              <strong style={{ color: 'var(--text-primary)' }}>{targetValue}</strong> adresine/numarasına gönderilen 6 haneli güvenlik kodunu yazınız.
            </p>

            {error && (
              <div style={{ padding: '10px', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: 'var(--radius-md)', color: '#ef4444', fontSize: '0.82rem', fontWeight: 800, marginBottom: '20px' }}>
                {error}
              </div>
            )}

            {/* 6 OTP Boxes */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '24px' }}>
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => { inputRefs.current[idx] = el; }}
                  type="text"
                  maxLength={1}
                  className="otp-box"
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                />
              ))}
            </div>

            {/* Timer & Resend */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '24px', padding: '0 8px' }}>
              <span>Kalan Süre: <strong style={{ color: 'var(--brand-accent)' }}>{formattedTimer}</strong></span>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={timer > 0}
                style={{
                  background: 'none',
                  border: 'none',
                  color: timer === 0 ? 'var(--brand-accent)' : 'var(--text-muted)',
                  cursor: timer === 0 ? 'pointer' : 'not-allowed',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <RefreshCw size={13} /> Kodu Tekrar Gönder
              </button>
            </div>

            {/* Action Buttons */}
            <button
              onClick={handleVerify}
              className="btn-primary-gradient"
              style={{ width: '100%', padding: '14px', fontSize: '0.95rem', justifyContent: 'center' }}
            >
              <ShieldCheck size={18} /> Doğrula ve Devam Et
            </button>
          </>
        )}
      </div>
    </div>
  );
};
