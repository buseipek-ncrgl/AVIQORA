'use client';

import React, { useState } from 'react';
import {
  X,
  Send,
  Bot,
  User,
  Sparkles,
  Plane,
  DollarSign,
  TrendingUp,
  Activity,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Maximize2,
  Minimize2,
  ShieldCheck,
  Building2,
  Ticket,
  BarChart3
} from 'lucide-react';
import { api } from '@/lib/api';

interface AdminAiMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

interface AdminAiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminAiModal: React.FC<AdminAiModalProps> = ({ isOpen, onClose }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Executive Dashboard State for Admin
  const [execMetrics, setExecMetrics] = useState({
    dailyRevenue: '₺485,200',
    totalBookingsToday: 142,
    fleetOccupancy: '%87.4',
    activeAircraftCount: 5,
    delayedFlightsCount: 1,
    pendingRefundsCount: 2,
    recommendedExtraFlights: 'İzmir (ADB) - İstanbul (IST) +2 Sefer Tavsiyesi'
  });

  const [messages, setMessages] = useState<AdminAiMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Merhaba Kaptan! Ben AVIQORA Operasyonel Yönetim Yapay Zekası. Bugünkü bilet ciroları, filo doluluk oranları, rötarlı seferler ve iade talepleri hakkında analiz veya tahmin raporu isteyebilirsiniz.',
      time: 'Şimdi',
    },
  ]);

  if (!isOpen) return null;

  const handleSendMessage = (customText?: string) => {
    const textToSend = customText || inputQuery;
    if (!textToSend.trim()) return;

    const userText = textToSend.trim();
    const nowTime = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    const userMsg: AdminAiMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      time: nowTime,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputQuery('');
    setIsTyping(true);

    setTimeout(() => {
      const q = userText.toLowerCase();
      let responseText = '';

      if (q.includes('ciro') || q.includes('satış') || q.includes('gelir') || q.includes('hasılat')) {
        responseText = `Bugünkü toplam bilet satış cirosu ₺485,200 olarak gerçekleşti. Geçen haftanın aynı gününe göre +%18.4 artış sağlandı.`;
      } else if (q.includes('filo') || q.includes('uçak') || q.includes('doluluk')) {
        responseText = `Filodaki 5 uçağımızın ortalama doluluk oranı %87.4 seviyesindedir. En yüksek doluluk %94 ile IST ➔ JFK hattındadır.`;
      } else if (q.includes('rötar') || q.includes('gecikme') || q.includes('kule')) {
        responseText = `Şu an 1 rötarlı sefer bulunmaktadır: TK1984 (15 dk kule kalkış yoğunluğu). Diğer 4 sefer tam zamanında seyir halindedir.`;
      } else if (q.includes('iade') || q.includes('iptal') || q.includes('talep')) {
        responseText = `Sistemde onay bekleyen 2 müşteri iade talebi bulunmaktadır. Toplam talep edilen iade tutarı: ₺4,980.`;
      } else if (q.includes('sefer') || q.includes('tavsiye') || q.includes('ekstra')) {
        responseText = `Yapay zeka talep tahmin modelimiz önümüzdeki Cuma günü İzmir (ADB) - İstanbul (IST) hattına +2 ek sefer konulmasını önermektedir.`;
      } else {
        responseText = `Operasyonel veri tabanı tarandı. Bilet satışları, filo uçuş süreleri ve operasyon riski stabil durumdadır.`;
      }

      const aiMsg: AdminAiMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: responseText,
        time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isFullScreen ? '0' : '20px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        className="corporate-card"
        style={{
          width: isFullScreen ? '100vw' : '100%',
          maxWidth: isFullScreen ? '100vw' : '640px',
          height: isFullScreen ? '100vh' : '700px',
          padding: '0',
          backgroundColor: 'var(--bg-surface-elevated)',
          borderRadius: isFullScreen ? '0' : 'var(--radius-xl)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div style={{ padding: '16px 24px', backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--brand-gold)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarChart3 size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: '1.05rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                AVIQORA Executive Operations & Fleet AI <Sparkles size={16} style={{ color: 'var(--brand-gold)' }} />
              </div>
              <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 800 }}>
                ● Yönetimsel Analiz & Talep Tahmin Motoru
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="btn-outline"
              style={{ padding: '6px 12px', fontSize: '0.78rem', gap: '6px', fontWeight: 800 }}
              title={isFullScreen ? 'Pencere Moduna Geç' : 'Tam Ekran Workspace Moduna Geç'}
            >
              {isFullScreen ? <><Minimize2 size={14} /> Pencere Modu</> : <><Maximize2 size={14} /> Tam Ekran Workspace</>}
            </button>
            <button onClick={onClose} className="btn-outline" style={{ padding: '6px 10px' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* MAIN BODY: 1 Column in Drawer | 2 Columns in Full-Screen Workspace */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: isFullScreen ? '1fr 420px' : '1fr', overflow: 'hidden' }}>
          
          {/* LEFT COLUMN: CHAT STREAM & INPUT */}
          <div style={{ display: 'flex', flexDirection: 'column', borderRight: isFullScreen ? '1px solid var(--border-color)' : 'none', overflow: 'hidden' }}>
            {/* Quick Admin Action Pills */}
            <div style={{ padding: '12px 20px', backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '8px', overflowX: 'auto' }}>
              {[
                { label: '💰 Günlük Ciro & Hasılat', prompt: 'Bugünkü toplam bilet cirosu ve finansal özet' },
                { label: '✈️ Filo Doluluk Analizi', prompt: 'Filodaki uçakların ortalama doluluk oranları' },
                { label: '⏰ Rötar & Kule Raporu', prompt: 'Şu anki rötarlı seferlerin durumu' },
                { label: '💳 Bekleyen İade Talepleri', prompt: 'Bekleyen iade taleplerini özetle' },
                { label: '🔮 Ek Sefer Öneri Tahmini', prompt: 'Gelecek hafta için ek sefer tavsiyesi' },
              ].map((pill, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(pill.prompt)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                  }}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Messages Stream */}
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: 'var(--bg-primary)' }}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '88%',
                    display: 'flex',
                    gap: '12px',
                    flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
                  }}
                >
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: msg.sender === 'user' ? 'var(--brand-accent)' : 'var(--brand-gold)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.75rem', fontWeight: 900 }}>
                    {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>

                  <div
                    style={{
                      backgroundColor: msg.sender === 'user' ? 'var(--brand-accent)' : 'var(--bg-secondary)',
                      color: msg.sender === 'user' ? '#ffffff' : 'var(--text-primary)',
                      padding: '14px 18px',
                      borderRadius: 'var(--radius-lg)',
                      fontSize: '0.88rem',
                      lineHeight: 1.5,
                      border: msg.sender === 'user' ? 'none' : '1px solid var(--border-color)',
                    }}
                  >
                    <div>{msg.text}</div>
                    <div style={{ fontSize: '0.68rem', color: msg.sender === 'user' ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)', marginTop: '6px', textAlign: 'right' }}>
                      {msg.time}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--brand-gold)', fontSize: '0.8rem', fontWeight: 800 }}>
                  <RefreshCw size={14} className="animate-spin" /> Operasyonel Veriler Analiz Ediliyor...
                </div>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} style={{ padding: '16px 20px', backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '10px' }}>
              <input
                type="text"
                className="input-corporate"
                placeholder="Yönetimsel soru veya analiz isteyin..."
                style={{ flex: 1, height: '46px', fontSize: '0.88rem' }}
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
              />
              <button type="submit" className="btn-brand" style={{ height: '46px', padding: '0 20px', display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--brand-gold)', borderColor: 'var(--brand-gold)' }}>
                <Send size={16} />
              </button>
            </form>
          </div>

          {/* RIGHT COLUMN: EXECUTIVE OPERATIONAL DASHBOARD (Visible in Fullscreen) */}
          {isFullScreen && (
            <div style={{ padding: '20px', backgroundColor: 'var(--bg-secondary)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Executive Summary Card */}
              <div className="corporate-card" style={{ padding: '16px', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--brand-gold)', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <DollarSign size={16} /> GÜNLÜK HÂSILAT & FİNANSAL ÖZET
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#10b981', marginBottom: '4px' }}>
                  {execMetrics.dailyRevenue}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Bugün Toplam <strong>{execMetrics.totalBookingsToday} bilet</strong> kesildi. Geçen haftaya göre +%18.4 artış.
                </div>
              </div>

              {/* Fleet & Occupancy Card */}
              <div className="corporate-card" style={{ padding: '16px', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--brand-accent)', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Plane size={16} /> FİLO VE KAPASİTE DURUMU
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 800 }}>
                  <span>Ortalama Filo Doluluğu:</span>
                  <span style={{ color: 'var(--brand-accent)' }}>{execMetrics.fleetOccupancy}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  <span>Aktif Seyirdeki Uçaklar:</span>
                  <strong>{execMetrics.activeAircraftCount} / 5 Uçak</strong>
                </div>
              </div>

              {/* Disruption & Delay Card */}
              <div className="corporate-card" style={{ padding: '16px', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle size={16} /> RÖTAR VE UÇUŞ AKSAMASI
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#d97706', marginBottom: '4px' }}>
                  1 Seferde Kule Kaynaklı Rötar Var (TK1984)
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Kule kalkış yoğunluğu nedeniyle 15 dk esneme yaşanıyor. Diğer tüm seferler zamanında kalkmıştır.
                </div>
              </div>

              {/* Smart AI Route Suggestion Card */}
              <div className="corporate-card" style={{ padding: '16px', borderRadius: 'var(--radius-lg)', backgroundColor: 'rgba(37, 99, 235, 0.08)', border: '1px solid rgba(37, 99, 235, 0.25)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--brand-accent)', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={16} /> YAPAY ZEKA SEFER OPTİMİZASYON TAVSİYESİ
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {execMetrics.recommendedExtraFlights}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Talep artış analitiği önümüzdeki Cuma günü İzmir-İstanbul rotasına ilave 2 frekans eklenmesi halinde +₺64,000 ek ciro öngörmektedir.
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
