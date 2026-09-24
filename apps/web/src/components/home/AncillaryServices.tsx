'use client';

import React, { useState } from 'react';
import { Briefcase, Utensils, Zap, Coffee, Armchair, Car, Check, Plus, ShieldCheck, Sparkles } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export const AncillaryServices: React.FC = () => {
  const { language } = useLanguage();
  const isTr = language === 'tr';
  const [activeCategory, setActiveCategory] = useState<'all' | 'baggage' | 'dining' | 'lounge'>('all');
  const [addedServices, setAddedServices] = useState<string[]>([]);

  const services = [
    {
      id: 'baggage-10',
      category: 'baggage',
      icon: Briefcase,
      title: isTr ? 'Ekstra 10 kg Bagaj Hakkı' : 'Extra 10 kg Baggage Allowance',
      tag: isTr ? 'Avantajlı Paket' : 'Value Pack',
      desc: isTr
        ? 'Uçuş öncesi ek bagajınızı uygun fiyata satın alın, havalimanında sıra beklemeyin.'
        : 'Pre-purchase extra baggage allowance at discounted rates before your flight.',
      features: isTr
        ? ['+10 kg Ekstra Taşınabilir Bagaj', 'Tüm Uçuş Segmentlerinde Geçerli', 'Anında PNR İşleme']
        : ['+10 kg Extra Checked Baggage', 'Valid Across All Flight Legs', 'Instant PNR Confirmation'],
      priceTr: '₺180',
      priceEn: '$6',
      color: '#2563eb',
    },
    {
      id: 'dining-gourmet',
      category: 'dining',
      icon: Utensils,
      title: isTr ? 'Şefin Özel Uçak İçi Yemeği' : 'Chef’s Special Inflight Meal',
      tag: isTr ? 'Gurme Seçim' : 'Gourmet Selection',
      desc: isTr
        ? 'Sıcak ızgara bonfile, fırınlanmış sebzeler ve şef tatlısından oluşan özel menü.'
        : 'Custom multi-course hot meal featuring grilled tenderloin and chef dessert.',
      features: isTr
        ? ['Sıcak Servis Garantisi', 'Vejetaryen / Helal Seçeneği', 'Özel İçecek İkramı']
        : ['Hot Meal Guarantee', 'Vegetarian & Halal Options', 'Premium Beverage Selection'],
      priceTr: '₺240',
      priceEn: '$8',
      color: '#d97706',
    },
    {
      id: 'fast-track',
      category: 'lounge',
      icon: Zap,
      title: isTr ? 'Fast Track (Öncelikli Geçiş)' : 'Fast Track Priority Security',
      tag: isTr ? 'Zamandan Tasarruf' : 'Time Saver',
      desc: isTr
        ? 'Güvenlik ve pasaport kontrollerinden kuyruğa girmeden özel turnikelerle geçin.'
        : 'Bypass security and passport queues via dedicated fast-track lanes.',
      features: isTr
        ? ['Özel Hızlı Geçiş Kapısı', 'Tüm Aile İçin Uyumlu', 'IST & SAW Havalimanı']
        : ['Dedicated Fast Lane', 'Family Friendly Access', 'Valid at IST & SAW Airports'],
      priceTr: '₺150',
      priceEn: '$5',
      color: '#10b981',
    },
    {
      id: 'lounge-vip',
      category: 'lounge',
      icon: Coffee,
      title: isTr ? 'AVIQORA CIP Lounge Erişimi' : 'AVIQORA CIP Lounge Access',
      tag: isTr ? 'VIP Konfor' : 'VIP Comfort',
      desc: isTr
        ? 'Uçuş saatinize kadar açık büfe lezzetler, duş kabinleri ve sessiz çalışma alanları.'
        : 'Unwind before departure with gourmet buffets, shower suites, and quiet pods.',
      features: isTr
        ? ['Sınırsız İkram & İçecek', 'Yüksek Hızlı Özel Wi-Fi', 'Masaj Koltukları & Dinlenme']
        : ['Unlimited Food & Drinks', 'High-Speed Private Wi-Fi', 'Massage Chairs & Quiet Zones'],
      priceTr: '₺450',
      priceEn: '$15',
      color: '#8b5cf6',
    },
    {
      id: 'seat-extra-leg',
      category: 'baggage',
      icon: Armchair,
      title: isTr ? 'Ekstra Diz Mesafeli Koltuk' : 'Extra Legroom Seat Selection',
      tag: isTr ? 'Maksimum Rahatlık' : 'Max Comfort',
      desc: isTr
        ? 'Ön sıra veya acil çıkış koltuklarında 20 cm ekstra bacak mesafesi keyfi.'
        : 'Enjoy up to 20 cm extra pitch in front row or exit row seating.',
      features: isTr
        ? ['Ön Sıra / Acil Çıkış', 'Öncelikli Biniş / İniş', 'Servis Başlangıç Noktası']
        : ['Front Row / Exit Row', 'Priority Boarding & Deboarding', 'First Meal Service'],
      priceTr: '₺220',
      priceEn: '$7',
      color: '#ec4899',
    },
    {
      id: 'vip-transfer',
      category: 'lounge',
      icon: Car,
      title: isTr ? 'Özel Şoförlü VIP Transfer' : 'Chauffeur VIP Chauffeur Transfer',
      tag: isTr ? 'Kapıdan Kapıya' : 'Door-to-Door',
      desc: isTr
        ? 'Havalimanından otelinize veya adresinize Mercedes Maybach / Vito VIP araçla ulaşım.'
        : 'Private luxury transfer between airport and hotel in premium Mercedes vans.',
      features: isTr
        ? ['Kişiye Özel Lüks Araç', '7/24 Şoförlü Karşılama', 'Uçuş Rötarlarında Esneklik']
        : ['Private Luxury Vehicle', '24/7 Chauffeur Meet & Greet', 'Flight Delay Guarantee'],
      priceTr: '₺650',
      priceEn: '$21',
      color: '#06b6d4',
    },
  ];

  const filteredServices = activeCategory === 'all' ? services : services.filter((s) => s.category === activeCategory);

  const toggleService = (id: string) => {
    if (addedServices.includes(id)) {
      setAddedServices(addedServices.filter((item) => item !== id));
    } else {
      setAddedServices([...addedServices, id]);
    }
  };

  return (
    <section style={{ padding: '80px 32px', backgroundColor: 'var(--bg-primary)', borderTop: '1px solid var(--border-color)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Header Title */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--brand-accent)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={16} /> ANCILLARY TRAVEL SERVICES
          </span>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '4px' }}>
            {isTr ? 'Uçuşa Ek Hizmetler ile Seyahatinizi Özelleştirin' : 'Customize Your Flight with Extra Services'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginTop: '6px', maxWidth: '640px', margin: '6px auto 0 auto' }}>
            {isTr
              ? 'Ekstra bagajdan gurme menülere ve VIP Lounge erişimine kadar seyahatinize özel ayrıcalıkları tek tıkla ekleyin.'
              : 'Add extra baggage, gourmet dining, and CIP Lounge privileges to your journey with a single click.'}
          </p>
        </div>

        {/* Category Filter Pills */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '40px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: isTr ? 'Tüm Hizmetler' : 'All Services' },
            { id: 'baggage', label: isTr ? '🧳 Bagaj & Koltuk' : '🧳 Baggage & Seats' },
            { id: 'dining', label: isTr ? '🍽️ Uçak İçi Yemek' : '🍽️ Inflight Meals' },
            { id: 'lounge', label: isTr ? '🛋️ Lounge & VIP Hizmetler' : '🛋️ Lounge & VIP' },
          ].map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                style={{
                  padding: '10px 22px',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  backgroundColor: isActive ? 'var(--brand-accent)' : 'var(--bg-surface)',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  border: isActive ? '1px solid var(--brand-accent)' : '1px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? 'var(--shadow-md)' : 'none',
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Interactive Services Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
          {filteredServices.map((srv) => {
            const isAdded = addedServices.includes(srv.id);
            const IconComponent = srv.icon;

            return (
              <div
                key={srv.id}
                className="corporate-card"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: isAdded ? `2px solid ${srv.color}` : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '28px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.25s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: isAdded ? `0 10px 25px ${srv.color}25` : 'var(--shadow-sm)',
                }}
              >
                {/* Background Accent Gradient Overlay */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '140px',
                    height: '140px',
                    background: `radial-gradient(circle, ${srv.color}15 0%, transparent 70%)`,
                    pointerEvents: 'none',
                  }}
                />

                <div>
                  {/* Top Bar: Icon & Tag */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div
                      style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: `${srv.color}15`,
                        border: `1px solid ${srv.color}30`,
                        color: srv.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconComponent size={26} />
                    </div>

                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      {srv.tag}
                    </span>
                  </div>

                  {/* Title & Desc */}
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '8px' }}>
                    {srv.title}
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
                    {srv.desc}
                  </p>

                  {/* Features Bullet List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                    {srv.features.map((feat, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                        <ShieldCheck size={14} style={{ color: srv.color, flexShrink: 0 }} />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid var(--border-color)',
                    paddingTop: '20px',
                    marginTop: '12px',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                      {isTr ? 'BAŞLANGIÇ FİYATI' : 'STARTING FROM'}
                    </div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                      {isTr ? srv.priceTr : srv.priceEn}
                    </div>
                  </div>

                  <button
                    onClick={() => toggleService(srv.id)}
                    style={{
                      height: '42px',
                      padding: '0 20px',
                      borderRadius: 'var(--radius-md)',
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      backgroundColor: isAdded ? '#10b981' : 'var(--bg-secondary)',
                      color: isAdded ? '#ffffff' : 'var(--text-primary)',
                      border: isAdded ? '1px solid #10b981' : '1px solid var(--border-color)',
                    }}
                  >
                    {isAdded ? (
                      <>
                        <Check size={16} /> {isTr ? 'Eklendi' : 'Added'}
                      </>
                    ) : (
                      <>
                        <Plus size={16} style={{ color: srv.color }} /> {isTr ? 'Uçuşa Ekle' : 'Add to Flight'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
