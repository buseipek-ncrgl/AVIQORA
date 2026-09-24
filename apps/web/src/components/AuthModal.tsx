import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { VerificationModal } from '@/components/VerificationModal';
import { AviqoraLogo } from '@/components/AviqoraLogo';
import { LogIn, UserPlus, AlertCircle, X, Lock, Mail, User, Sparkles, Award, ShieldCheck, CheckCircle2, ArrowLeft, Phone } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Master registered accounts list for validation
const REGISTERED_ACCOUNTS = [
  { email: 'ahmet.yilmaz@aviqora.com', phone: '+90 532 111 2233', phoneClean: '05321112233', name: 'Ahmet Yılmaz' },
  { email: 'ayse.kaya@aviqora.com', phone: '+90 535 222 3344', phoneClean: '05352223344', name: 'Ayşe Kaya' },
  { email: 'mehmet.demir@gmail.com', phone: '+90 542 333 4455', phoneClean: '05423334455', name: 'Mehmet Demir' },
  { email: 'zeynep.sahin@hotmail.com', phone: '+90 555 444 5566', phoneClean: '05554445566', name: 'Zeynep Şahin' },
  { email: 'can.yildiz@outlook.com', phone: '+90 505 555 6677', phoneClean: '05055556677', name: 'Can Yıldız' },
  { email: 'admin@aviqora.com', phone: '+90 500 000 0000', phoneClean: '05000000000', name: 'Admin Control' },
];

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>('login');
  
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const [otpTarget, setOtpTarget] = useState<string>('');
  const [otpMode, setOtpMode] = useState<'register' | 'forgot'>('register');

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Forgot password form state
  const [forgotInput, setForgotInput] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    // MODE 1: FORGOT PASSWORD
    if (activeTab === 'forgot') {
      const q = forgotInput.trim().toLowerCase();
      if (!q) {
        setError('Lütfen kayıtlı e-posta adresinizi veya telefon numaranızı giriniz.');
        return;
      }

      const qCleanPhone = q.replace(/\D/g, '');
      const foundAccount = REGISTERED_ACCOUNTS.find(acc => 
        acc.email.toLowerCase() === q ||
        acc.phone.replace(/\D/g, '') === qCleanPhone ||
        (qCleanPhone.length >= 10 && acc.phoneClean.includes(qCleanPhone))
      );

      if (!foundAccount) {
        setError(`Kayıt Bulunamadı: "${forgotInput}" bilgisi ile sistemimizde kayıtlı bir müşteri bulunamadı. Lütfen e-posta veya telefon numaranızı kontrol edin.`);
        return;
      }

      // Found registered account! Open OTP Verification
      setOtpTarget(foundAccount.email);
      setOtpMode('forgot');
      setIsOtpOpen(true);
      return;
    }

    // MODE 2: REGISTER
    if (activeTab === 'register') {
      if (password.length < 8) {
        setError('Şifreniz en az 8 karakter uzunluğunda olmalıdır.');
        return;
      }
      if (!/[A-Z]/.test(password)) {
        setError('Şifreniz en az 1 büyük harf (A-Z) içermelidir.');
        return;
      }
      if (!/[a-z]/.test(password)) {
        setError('Şifreniz en az 1 küçük harf (a-z) içermelidir.');
        return;
      }
      if (!/[0-9]/.test(password)) {
        setError('Şifreniz en az 1 rakam (0-9) içermelidir.');
        return;
      }
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        setError('Şifreniz en az 1 özel sembol (!@#$%^&*) içermelidir.');
        return;
      }

      // Trigger E-Mail OTP Verification for registration
      setOtpTarget(email);
      setOtpMode('register');
      setIsOtpOpen(true);
      return;
    }

    // MODE 3: LOGIN
    setIsLoading(true);
    try {
      await login({ email, password });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Giriş yapılırken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerified = async () => {
    if (otpMode === 'forgot') {
      setSuccessMsg(`Doğrulama Başarılı! Şifre sıfırlama talebiniz onaylandı. Yeni şifreniz varsayılan olarak "Aviqora2026!" belirlenmiştir. Giriş yapabilirsiniz.`);
      setEmail(otpTarget);
      setPassword('Aviqora2026!');
      setActiveTab('login');
      return;
    }

    setIsLoading(true);
    try {
      await register({ fullName, email, password });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Kayıt yapılırken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="corporate-card"
        style={{
          width: '100%',
          maxWidth: '820px',
          padding: '0',
          backgroundColor: 'var(--bg-surface-elevated)',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: '1fr 1.2fr',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="btn-outline"
          style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10, padding: '6px 10px', borderRadius: '50%' }}
        >
          <X size={16} />
        </button>

        {/* Left Side: Pegasus & THY Style Member Benefits Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0A192F 0%, #152A4A 100%)',
            color: '#FFFFFF',
            padding: '40px 32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderRight: '1px solid var(--border-color)',
          }}
        >
          <div>
            <div style={{ marginBottom: '24px' }}>
              <AviqoraLogo size={32} showText={true} showTagline={true} />
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, lineHeight: 1.3, marginBottom: '16px' }}>
              AVIQORA'yla Ayrıcalıkların Tadını Çıkarın
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.5, marginBottom: '28px' }}>
              Uçuşlarınızdan Mil kazanın, statü milleriyle bilet yükseltin ve üyelere özel fiyatlarla seyahat edin.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ backgroundColor: 'rgba(0, 82, 204, 0.25)', padding: '6px', borderRadius: '6px', color: 'var(--brand-accent)' }}>
                  <Sparkles size={16} />
                </div>
                <div>
                  <h5 style={{ fontSize: '0.9rem', fontWeight: 800 }}>Uçtukça Mil Kazanın</h5>
                  <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)' }}>Her biletinizde Mil biriktirin, ödül bilet alın.</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ backgroundColor: 'rgba(197, 155, 39, 0.25)', padding: '6px', borderRadius: '6px', color: 'var(--brand-gold)' }}>
                  <Award size={16} />
                </div>
                <div>
                  <h5 style={{ fontSize: '0.9rem', fontWeight: 800 }}>Business Bilet Yükseltme</h5>
                  <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)' }}>Millerinizle Business Class süit konforuna geçin.</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ backgroundColor: 'rgba(5, 150, 105, 0.25)', padding: '6px', borderRadius: '6px', color: '#34d399' }}>
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <h5 style={{ fontSize: '0.9rem', fontWeight: 800 }}>Öncelikli Hizmetler</h5>
                  <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)' }}>Hızlı check-in, ekstra bagaj ve lounge erişimi.</p>
                </div>
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '24px' }}>
            🔒 256-Bit SSL Secure AVIQORA Authentication
          </div>
        </div>

        {/* Right Side: Tabbed Login / Register / Forgot Form */}
        <div style={{ padding: '40px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          
          {/* Header Navigation Tabs */}
          {activeTab !== 'forgot' ? (
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '24px' }}>
              <button
                style={{
                  flex: 1,
                  padding: '10px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === 'login' ? '2px solid var(--brand-accent)' : '2px solid transparent',
                  color: activeTab === 'login' ? 'var(--brand-accent)' : 'var(--text-muted)',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
                onClick={() => {
                  setActiveTab('login');
                  setError(null);
                  setSuccessMsg(null);
                }}
              >
                <LogIn size={16} /> Üye Girişi
              </button>
              <button
                style={{
                  flex: 1,
                  padding: '10px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === 'register' ? '2px solid var(--brand-accent)' : '2px solid transparent',
                  color: activeTab === 'register' ? 'var(--brand-accent)' : 'var(--text-muted)',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
                onClick={() => {
                  setActiveTab('register');
                  setError(null);
                  setSuccessMsg(null);
                }}
              >
                <UserPlus size={16} /> Üye Ol
              </button>
            </div>
          ) : (
            <div style={{ marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
              <button
                onClick={() => {
                  setActiveTab('login');
                  setError(null);
                  setSuccessMsg(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--brand-accent)',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '10px',
                }}
              >
                <ArrowLeft size={16} /> Üye Girişine Dön
              </button>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                Şifre Sıfırlama & Güvenli Doğrulama
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Sistemde kayıtlı e-posta adresinizi veya cep telefonu numaranızı girerek şifrenizi yenileyin.
              </p>
            </div>
          )}

          {/* Success Message Banner */}
          {successMsg && (
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#10b981',
                padding: '10px 14px',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 700,
              }}
            >
              <CheckCircle2 size={16} /> {successMsg}
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: 'var(--brand-red)',
                padding: '10px 14px',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {/* Quick Demo Test Users Bar */}
          {activeTab === 'login' && (
            <div style={{ marginBottom: '16px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--brand-gold)', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={12} /> Hızlı Demo Test Kullanıcısı Seçin:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {[
                  { name: 'Ahmet (VIP)', email: 'ahmet.yilmaz@aviqora.com', pass: 'Ahmet123!' },
                  { name: 'Ayşe (Elite+)', email: 'ayse.kaya@aviqora.com', pass: 'Ayse123!' },
                  { name: 'Mehmet (Classic+)', email: 'mehmet.demir@gmail.com', pass: 'Mehmet123!' },
                  { name: 'Zeynep (Elite)', email: 'zeynep.sahin@hotmail.com', pass: 'Zeynep123!' },
                  { name: 'Can (Classic)', email: 'can.yildiz@outlook.com', pass: 'Can123!' },
                ].map((u) => (
                  <button
                    key={u.email}
                    type="button"
                    onClick={() => {
                      setEmail(u.email);
                      setPassword(u.pass);
                      setError(null);
                    }}
                    style={{
                      padding: '4px 8px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: email === u.email ? 'var(--brand-accent)' : 'var(--bg-surface)',
                      color: email === u.email ? '#ffffff' : 'var(--text-primary)',
                      border: '1px solid var(--border-color)',
                      cursor: 'pointer',
                    }}
                  >
                    ● {u.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* VIEW 1: FORGOT PASSWORD */}
            {activeTab === 'forgot' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Kayıtlı E-posta veya Telefon Numarası
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    required
                    className="input-corporate"
                    placeholder="ahmet.yilmaz@aviqora.com veya +90 532 111 2233"
                    style={{ paddingLeft: '38px', height: '46px' }}
                    value={forgotInput}
                    onChange={(e) => setForgotInput(e.target.value)}
                  />
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                  Sistemimiz kayıtlı hesabı kontrol edecek ve SMS/E-posta ile 6 haneli OTP doğrulama kodu gönderecektir.
                </div>
              </div>
            )}

            {/* VIEW 2 & 3: LOGIN / REGISTER */}
            {activeTab !== 'forgot' && (
              <>
                {activeTab === 'register' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Ad Soyad
                    </label>
                    <div style={{ position: 'relative' }}>
                      <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        required
                        className="input-corporate"
                        placeholder="Ahmet Yılmaz"
                        style={{ paddingLeft: '38px', height: '46px' }}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    E-posta Adresi
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="email"
                      required
                      className="input-corporate"
                      placeholder="ornek@aviqora.com"
                      style={{ paddingLeft: '38px', height: '46px' }}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Şifre
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      className="input-corporate"
                      placeholder="••••••••"
                      style={{ paddingLeft: '38px', paddingRight: '40px', height: '46px' }}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                {activeTab === 'login' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      Beni Hatırla
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('forgot');
                        setError(null);
                        setSuccessMsg(null);
                      }}
                      style={{ background: 'none', border: 'none', color: 'var(--brand-accent)', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}
                    >
                      Şifremi Unuttum?
                    </button>
                  </div>
                )}
              </>
            )}

            <button type="submit" className="btn-brand" style={{ width: '100%', marginTop: '8px', height: '48px', fontSize: '0.95rem' }} disabled={isLoading}>
              {isLoading
                ? 'İşleniyor...'
                : activeTab === 'forgot'
                ? 'Şifre Sıfırlama Kodu (OTP) Gönder'
                : activeTab === 'login'
                ? 'Giriş Yapın'
                : 'Hemen Üye Olun'}
            </button>
          </form>
        </div>
      </div>

      {/* OTP Verification Modal for Registration & Password Reset */}
      <VerificationModal
        type="email"
        targetValue={otpTarget || email || 'ornek@aviqora.com'}
        isOpen={isOtpOpen}
        onClose={() => setIsOtpOpen(false)}
        onVerified={handleOtpVerified}
      />
    </div>
  );
};
