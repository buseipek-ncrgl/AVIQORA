'use client';

import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  confirmText?: string;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  confirmText = 'Tamam',
}) => {
  if (!isOpen) return null;

  const iconMap = {
    success: <CheckCircle2 size={36} style={{ color: '#10b981' }} />,
    error: <AlertCircle size={36} style={{ color: '#ef4444' }} />,
    warning: <AlertTriangle size={36} style={{ color: '#f59e0b' }} />,
    info: <Info size={36} style={{ color: 'var(--brand-accent)' }} />,
  };

  const defaultTitleMap = {
    success: 'Başarılı İşlem',
    error: 'Uyarı / Hata',
    warning: 'Dikkat',
    info: 'Bilgilendirme',
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <div
        className="corporate-card"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '28px',
          borderRadius: 'var(--radius-xl)',
          backgroundColor: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-color)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          textAlign: 'center',
          position: 'relative',
          animation: 'modalFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={18} />
        </button>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          {iconMap[type]}
        </div>

        <h4 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '8px' }}>
          {title || defaultTitleMap[type]}
        </h4>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '24px' }}>
          {message}
        </p>

        <button
          onClick={onClose}
          className="btn-brand"
          style={{
            width: '100%',
            height: '46px',
            fontSize: '0.92rem',
            fontWeight: 800,
            borderRadius: 'var(--radius-md)',
            backgroundColor: type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : 'var(--brand-accent)',
            borderColor: type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : 'var(--brand-accent)',
          }}
        >
          {confirmText}
        </button>
      </div>
    </div>
  );
};
