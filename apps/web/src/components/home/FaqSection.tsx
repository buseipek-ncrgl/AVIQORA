'use client';

import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface FaqItem {
  id: string;
  qTr: string;
  qEn: string;
  aTr: string;
  aEn: string;
  linkTextTr?: string;
  linkTextEn?: string;
  linkHref?: string;
}

export const FaqSection: React.FC = () => {
  const { language } = useLanguage();
  const isTr = language === 'tr';
  const [openId, setOpenId] = useState<string | null>('q1');

  const faqList: FaqItem[] = [
    {
      id: 'q1',
      qTr: 'Uçuş rezervasyonumu nasıl değiştirebilirim?',
      qEn: 'How can I modify my flight booking?',
      aTr: 'Rezervasyonunuzu ana sayfamızdaki "Uçuşunu Yönet" sekmesinden veya mobil uygulamamızdan PNR kodunuz ve soyadınız ile sorgulayarak kolayca değiştirebilirsiniz. Bilet sınıfınıza bağlı olarak değişiklik ücreti veya bilet farkı uygulanabilir.',
      aEn: 'You can easily change your flight booking under the "Manage Booking" tab or via our mobile app using your PNR code and passenger surname.',
      linkTextTr: 'Rezervasyonumu Yönet →',
      linkTextEn: 'Manage My Booking →',
    },
    {
      id: 'q2',
      qTr: 'Biletimi iptal edersem ücret iadesi alabilir miyim?',
      qEn: 'Can I get a refund if I cancel my ticket?',
      aTr: 'İptal ve iade koşulları satın aldığınız biletin esneklik sınıfına (Eco, Extra, Flex, Business) göre değişiklik gösterir. Flex ve Business biletlerde kesintisiz veya minimum kesintiyle iade sağlanırken, bilet detaylarınızı PNR sorgulama ekranında inceleyebilirsiniz.',
      aEn: 'Refund policies depend on your ticket class (Eco, Extra, Flex, Business). Flex and Business fares allow full or minimal fee refunds.',
      linkTextTr: 'İptal ve İade Koşulları →',
      linkTextEn: 'Refund & Cancellation Rules →',
    },
    {
      id: 'q3',
      qTr: 'Bagaj hakkımı nereden görebilirim?',
      qEn: 'Where can I check my baggage allowance?',
      aTr: 'Satın aldığınız bilet sınıfına ait kabin ve kayıtlı bagaj hakkı bilgileriniz e-posta ile gönderilen biniş özetinizde ve PNR sorgulama ekranında yer alır. Ekstra bagaj ihtiyacınız durumunda uçuş öncesinde %30\'a varan indirimle online bagaj hakkı satın alabilirsiniz.',
      aEn: 'Your checked and cabin baggage allowance is displayed on your e-ticket summary email and under PNR booking lookup.',
      linkTextTr: 'Bagaj Kurallarını Gör →',
      linkTextEn: 'View Baggage Allowance →',
    },
    {
      id: 'q4',
      qTr: 'Online check-in ne zaman açılır?',
      qEn: 'When does online check-in open?',
      aTr: 'Online check-in işlemi uçuşunuzun kalkış saatinden 24 saat önce açılır ve kalkışa 90 dakika kala kapanır. Web sitemizden veya mobil uygulamamızdan 30 saniyede ücretsiz koltuk seçimi yapabilir ve dijital biniş kartınızı oluşturabilirsiniz.',
      aEn: 'Online check-in opens 24 hours prior to departure and closes 90 minutes before flight takeoff.',
      linkTextTr: 'Check-in Bilgilerini Gör →',
      linkTextEn: 'Check-in Guidelines →',
    },
    {
      id: 'q5',
      qTr: 'Uçuş tarihimi değiştirebilir miyim?',
      qEn: 'Can I change my flight date?',
      aTr: 'Evet, biletinizin kural ve koşullarına uygun olarak uçuş tarih ve saatini değiştirebilirsiniz. Değişiklik işlemlerinizi kalkışa 2 saat kalana kadar dijital kanallarımızdan veya 7/24 çağrı merkezimizden gerçekleştirebilirsiniz.',
      aEn: 'Yes, flight dates can be modified up to 2 hours before departure online or via our 24/7 customer care center.',
    },
    {
      id: 'q6',
      qTr: 'Rezervasyon bilgilerime nasıl ulaşabilirim?',
      qEn: 'How can I access my booking details?',
      aTr: 'E-posta adresinize gönderilen rezervasyon onay mesajından veya AVIQORA üye hesabınızdaki "Seyahatlerim" bölümünden tüm uçuş detaylarınıza, biniş kartlarınıza ve faturalarınıza dilediğiniz an erişebilirsiniz.',
      aEn: 'All your flight itineraries, boarding passes, and invoices are accessible anytime under your AVIQORA account or via confirmation email.',
    },
    {
      id: 'q7',
      qTr: 'Uçuşum iptal edilirse ne yapmalıyım?',
      qEn: 'What happens if my flight gets cancelled?',
      aTr: 'Uçuşunuzda herhangi bir iptal veya rötar yaşanması durumunda tarafınıza SMS ve e-posta ile anında bilgilendirme yapılır. Kesintisiz tam ücret iadesi alma, bir sonraki uygun uçuşa ücretsiz bilet değiştirme veya açığa alma hakkınız mevcuttur.',
      aEn: 'In case of flight cancellation, you will receive instant SMS & email alerts with options for full refunds or free rebooking.',
    },
  ];

  const toggleAccordion = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      style={{
        padding: 'clamp(64px, 8vw, 110px) clamp(16px, 4vw, 40px)',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <style jsx global>{`
          .faq-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 40px;
            align-items: start;
          }

          @media (min-width: 1024px) {
            .faq-grid {
              grid-template-columns: 38% calc(62% - 48px);
              gap: 48px;
            }
            .faq-sticky-left {
              position: sticky;
              top: 120px;
              align-self: start;
            }
          }

          .faq-item-row {
            transition: background-color 200ms ease, border-color 200ms ease;
          }
          .faq-item-row:hover {
            background-color: rgba(37, 99, 235, 0.015);
          }
          .faq-item-row:hover .faq-question-text {
            color: var(--brand-accent);
          }
          .faq-item-row:hover .faq-toggle-btn {
            background-color: rgba(37, 99, 235, 0.12);
            color: var(--brand-accent);
          }

          @media (max-width: 767px) {
            .flight-journey-wrapper {
              display: none !important;
            }
          }

          @keyframes faqFadeIn {
            from {
              opacity: 0;
              transform: translateY(-4px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>

        <div className="faq-grid">
          {/* Left Sticky Header */}
          <div className="faq-sticky-left" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div>
              <span
                style={{
                  display: 'inline-block',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: 'var(--brand-accent)',
                  marginBottom: '10px',
                }}
              >
                {isTr ? 'YARDIM MERKEZİ' : 'HELP CENTER'}
              </span>

              <h2
                style={{
                  fontSize: 'clamp(2rem, 3.5vw, 2.5rem)',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.18,
                  marginBottom: '14px',
                }}
              >
                {isTr ? 'Aklında bir soru mu var?' : 'Have a Question?'}
              </h2>

              <p
                style={{
                  fontSize: '0.98rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.65,
                  maxWidth: '380px',
                }}
              >
                {isTr
                  ? 'Rezervasyon, bagaj, check-in ve uçuş işlemleriyle ilgili merak ettiklerinin yanıtlarını burada bulabilirsin.'
                  : 'Find instant answers regarding flight bookings, baggage rules, online check-in, and ticket management.'}
              </p>
            </div>
          </div>

          {/* Right Accordion List */}
          <div>
            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: '18px',
                boxShadow: '0 4px 20px rgba(16, 24, 40, 0.04)',
                overflow: 'hidden',
              }}
            >
              {faqList.map((item, index) => {
                const isOpen = openId === item.id;
                const isLast = index === faqList.length - 1;
                const questionText = isTr ? item.qTr : item.qEn;
                const answerText = isTr ? item.aTr : item.aEn;
                const linkLabel = isTr ? item.linkTextTr : item.linkTextEn;

                return (
                  <div
                    key={item.id}
                    className="faq-item-row"
                    style={{
                      borderBottom: isLast ? 'none' : '1px solid var(--border-color)',
                      backgroundColor: isOpen ? 'rgba(37, 99, 235, 0.025)' : 'transparent',
                      borderLeft: isOpen ? '3px solid var(--brand-accent)' : '3px solid transparent',
                      transition: 'all 220ms ease',
                    }}
                  >
                    <button
                      onClick={() => toggleAccordion(item.id)}
                      style={{
                        width: '100%',
                        minHeight: '72px',
                        padding: '20px 24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '16px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <span
                        className="faq-question-text"
                        style={{
                          fontSize: '1rem',
                          fontWeight: isOpen ? 700 : 600,
                          color: isOpen ? 'var(--brand-accent)' : 'var(--text-primary)',
                          transition: 'color 180ms ease',
                          lineHeight: 1.4,
                        }}
                      >
                        {questionText}
                      </span>

                      <div
                        className="faq-toggle-btn"
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: isOpen ? 'rgba(37, 99, 235, 0.12)' : 'rgba(37, 99, 235, 0.06)',
                          color: isOpen ? 'var(--brand-accent)' : 'var(--text-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          transition: 'all 200ms ease',
                        }}
                      >
                        {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                      </div>
                    </button>

                    {isOpen && (
                      <div
                        style={{
                          padding: '0 24px 22px 24px',
                          color: 'var(--text-secondary)',
                          fontSize: '0.94rem',
                          lineHeight: 1.68,
                          animation: 'faqFadeIn 250ms ease-out',
                        }}
                      >
                        <p style={{ margin: 0 }}>{answerText}</p>

                        {linkLabel && (
                          <div style={{ marginTop: '12px' }}>
                            <a
                              href={item.linkHref || '#manage'}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                color: 'var(--brand-accent)',
                                fontWeight: 700,
                                fontSize: '0.88rem',
                                textDecoration: 'none',
                              }}
                            >
                              {linkLabel}
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
