'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sparkles, Bot, Shield } from 'lucide-react';
import { AiAssistantModal } from '@/components/AiAssistantModal';
import { AdminAiModal } from '@/components/AdminAiModal';

export const FloatingAiChatTrigger: React.FC = () => {
  const [activeModal, setActiveModal] = useState<'customer' | 'admin' | null>(null);
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');

  return (
    <>
      {isAdminPage ? (
        /* Admin Panel Dual Agent Floating Container */
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            padding: '8px 12px',
            borderRadius: '35px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
          }}
        >
          {/* Button 1: Customer AI Agent (Müşteri Asistanı) */}
          <button
            onClick={() => setActiveModal('customer')}
            aria-label="Müşteri AI Seyahat Asistanı"
            style={{
              padding: '10px 16px',
              borderRadius: '25px',
              backgroundColor: 'rgba(37, 99, 235, 0.2)',
              color: '#60a5fa',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              boxShadow: '0 4px 15px rgba(37, 99, 235, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.82rem',
              transition: 'all 0.25s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.backgroundColor = 'rgba(37, 99, 235, 0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.backgroundColor = 'rgba(37, 99, 235, 0.2)';
            }}
          >
            <Bot size={18} />
            <span>Müşteri AI Agent</span>
          </button>

          <div style={{ width: '1px', height: '20px', backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />

          {/* Button 2: Admin Executive Copilot Agent (Admin Asistanı) */}
          <button
            onClick={() => setActiveModal('admin')}
            aria-label="Admin Executive AI Copilot"
            style={{
              padding: '10px 18px',
              borderRadius: '25px',
              backgroundColor: 'var(--brand-gold)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 25px rgba(217, 119, 6, 0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontWeight: 900,
              fontSize: '0.82rem',
              transition: 'all 0.25s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <Shield size={16} />
            <span>Admin Executive Copilot</span>
            <Sparkles size={14} />
          </button>
        </div>
      ) : (
        /* Customer AI Seyahat Asistanı Trigger */
        <button
          onClick={() => setActiveModal('customer')}
          aria-label="AVIQORA AI Seyahat Asistanı"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            padding: '12px 20px',
            borderRadius: '30px',
            backgroundColor: 'var(--brand-accent)',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 10px 30px rgba(37, 99, 235, 0.45)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            fontWeight: 800,
            fontSize: '0.88rem',
            transition: 'all 0.25s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1) translateY(0)';
          }}
        >
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bot size={20} />
            <span
              style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                border: '2px solid #ffffff',
              }}
            />
          </div>
          <span>AI Seyahat Asistanı</span>
          <Sparkles size={14} style={{ color: 'var(--brand-gold)' }} />
        </button>
      )}

      {/* Render matching Modal */}
      {activeModal === 'customer' && (
        <AiAssistantModal isOpen={true} onClose={() => setActiveModal(null)} />
      )}

      {activeModal === 'admin' && (
        <AdminAiModal isOpen={true} onClose={() => setActiveModal(null)} />
      )}
    </>
  );
};

