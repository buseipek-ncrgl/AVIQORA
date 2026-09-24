'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  Bot,
  User,
  Sparkles,
  Plane,
  CloudSun,
  Sun,
  CloudRain,
  Snowflake,
  CloudLightning,
  CloudFog,
  MapPin,
  CheckCircle2,
  RefreshCw,
  Zap,
  Maximize2,
  Minimize2,
  Hotel,
  Car,
  ShieldCheck,
  AlertTriangle,
  Briefcase,
  ExternalLink,
  Luggage,
  Calendar,
  CheckSquare,
  Square,
  Compass,
  History,
  Plus,
  Trash2,
  MessageSquare
} from 'lucide-react';
import { api, MOCK_FLIGHTS } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface WeatherData {
  airport: string;
  city: string;
  country: string;
  temp: string;
  condition: string;
  wind: string;
  humidity?: string;
  visibility?: string;
  clothingAdvisory?: string;
}

interface DelayData {
  flightNumber: string;
  delayProbabilityPercentage: number;
  estimatedDelayMinutes: number;
  riskLevel: string;
  predictionReason: string;
}

interface HotelData {
  id: string;
  name: string;
  city: string;
  rating: number;
  pricePerNight: number;
  distanceFromAirport: string;
  amenities: string;
}

interface CarData {
  id: string;
  company: string;
  carModel: string;
  category: string;
  dailyPrice: number;
  fuelType: string;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  flights?: typeof MOCK_FLIGHTS;
  weather?: WeatherData;
  delay?: DelayData;
  hotels?: HotelData[];
  carRentals?: CarData[];
  packingList?: string[];
  time: string;
}

interface ChatSession {
  id: string;
  title: string;
  updatedAt: string;
  messages: Message[];
  activeWeather: WeatherData;
  activeDelay: DelayData;
  activeHotels: HotelData[];
  activeCars: CarData[];
  hasQueriedDestination: boolean;
}

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFlight?: (flightId: string) => void;
  fromCode?: string;
  toCode?: string;
}

const STORAGE_KEY = 'aviqora_ai_chat_sessions_v2';

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  onSelectFlight,
  fromCode = 'IST',
  toCode = 'BER',
}) => {
  const { user, isAuthenticated } = useAuth();
  const userStorageKey = isAuthenticated && user?.email
    ? `aviqora_ai_sessions_${user.email}`
    : 'aviqora_ai_sessions_guest';

  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Chat Sessions State
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('default-session');

  // Active Session State
  const [hasQueriedDestination, setHasQueriedDestination] = useState(false);

  const [activeWeather, setActiveWeather] = useState<WeatherData>({
    airport: `${toCode} Hub`,
    city: toCode === 'BER' ? 'Berlin' : toCode === 'LHR' ? 'Londra' : toCode === 'CDG' ? 'Paris' : 'Gaziantep',
    country: toCode === 'BER' ? 'Almanya' : toCode === 'LHR' ? 'İngiltere' : toCode === 'CDG' ? 'Fransa' : 'Türkiye',
    temp: '24°C',
    condition: 'Açık & Güneşli',
    wind: '12 knot Kuzeydoğu',
    humidity: '%48',
    visibility: '10 km (Görüş İdeal)',
    clothingAdvisory: 'Hafif seyahat kıyafetleri ve güneş gözlüğü önerilir.'
  });

  const [activeDelay, setActiveDelay] = useState<DelayData>({
    flightNumber: 'AVQ204',
    delayProbabilityPercentage: 11.5,
    estimatedDelayMinutes: 0,
    riskLevel: 'Düşük Risk (Zamanında Kalkış)',
    predictionReason: 'Kule pist trafiği ve METAR rüzgar limitleri uçuşa elverişli.'
  });

  const [activeHotels, setActiveHotels] = useState<HotelData[]>([
    { id: 'h1', name: `The Grand Palace Hotel`, city: 'Varış Şehri', rating: 4.9, pricePerNight: 3200, distanceFromAirport: '8 km', amenities: 'Spa • Panoramik Manzara • Kahvaltı' },
    { id: 'h2', name: `Central Boutique Hotel`, city: 'Varış Şehri', rating: 4.7, pricePerNight: 2400, distanceFromAirport: '12 km', amenities: 'Metro Yakını • Ücretsiz Wi-Fi • Gym' }
  ]);

  const [activeCars, setActiveCars] = useState<CarData[]>([
    { id: 'c1', company: 'AVIS VIP', carModel: 'BMW 320i Sedan', category: 'Lüks Otomatik', dailyPrice: 1450, fuelType: 'Benzin / Hibrit' },
    { id: 'c2', company: 'HERTZ Express', carModel: 'Volkswagen Tiguan SUV', category: 'Aile SUV', dailyPrice: 1290, fuelType: 'Dizel Otomatik' }
  ]);

  const [packingChecklist, setPackingChecklist] = useState<Array<{ id: string; text: string; checked: boolean }>>([
    { id: 'p1', text: 'Elektronik Biniş Kartı & Pasaport / Kimlik', checked: true },
    { id: 'p2', text: 'Mevsimlik hafif ceket ve konforlu ayakkabı', checked: false },
    { id: 'p3', text: 'Universal priz dönüştürücü ve powerbank', checked: false },
    { id: 'p4', text: 'Kişisel seyahat kiti & kulaklık', checked: false }
  ]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: `Merhaba! Ben AVIQORA AI Akıllı Seyahat Danışmanınız. Nereye seyahat etmek istiyorsunuz? Uçuş aramak, varış şehrinizin canlı hava durumunu öğrenmek veya otel/araç kiralama önerisi almak için sorunuzu yazabilirsiniz.`,
      time: 'Şimdi',
    },
  ]);

  // Load chat sessions for the current user & start fresh conversation when modal opens
  useEffect(() => {
    if (typeof window !== 'undefined' && isOpen) {
      try {
        const saved = localStorage.getItem(userStorageKey);
        if (saved) {
          const parsed = JSON.parse(saved) as ChatSession[];
          if (parsed && parsed.length > 0) {
            setSessions(parsed);
          }
        } else {
          setSessions([]);
        }
      } catch (e) {
        console.error('Failed to load chat sessions:', e);
      }

      // DO NOT AUTO-OPEN OLD CHAT. ALWAYS START WITH A FRESH CLEAN CHAT!
      const newId = 'session-' + Date.now();
      setActiveSessionId(newId);
      setMessages([
        {
          id: Date.now().toString(),
          sender: 'ai',
          text: `Merhaba! Ben AVIQORA AI Akıllı Seyahat Danışmanınız. Nereye seyahat etmek istiyorsunuz? Uçuşlar, canlı hava durumu ve konaklama önerileri için sorunuzu yazabilirsiniz.`,
          time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
      setHasQueriedDestination(false);
      setShowHistoryPanel(false);
    }
  }, [isOpen, userStorageKey]);

  // Save current active state to active session and persist in user's localStorage
  const updateCurrentSession = (
    newMessages: Message[],
    newWeather?: WeatherData,
    newDelay?: DelayData,
    newHotels?: HotelData[],
    newCars?: CarData[],
    hasQueried?: boolean
  ) => {
    const updatedMessages = newMessages;
    const updatedWeather = newWeather || activeWeather;
    const updatedDelay = newDelay || activeDelay;
    const updatedHotels = newHotels || activeHotels;
    const updatedCars = newCars || activeCars;
    const updatedHasQueried = hasQueried !== undefined ? hasQueried : hasQueriedDestination;

    const firstUserMsg = updatedMessages.find(m => m.sender === 'user');
    const sessionTitle = firstUserMsg
      ? (firstUserMsg.text.length > 30 ? firstUserMsg.text.slice(0, 30) + '...' : firstUserMsg.text)
      : 'Yeni Seyahat Danışmanlığı';

    const nowStr = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });

    setSessions(prevSessions => {
      const existingIdx = prevSessions.findIndex(s => s.id === activeSessionId);
      const sessionObj: ChatSession = {
        id: activeSessionId,
        title: sessionTitle,
        updatedAt: nowStr,
        messages: updatedMessages,
        activeWeather: updatedWeather,
        activeDelay: updatedDelay,
        activeHotels: updatedHotels,
        activeCars: updatedCars,
        hasQueriedDestination: updatedHasQueried,
      };

      let newSessions: ChatSession[];
      if (existingIdx >= 0) {
        newSessions = [...prevSessions];
        newSessions[existingIdx] = sessionObj;
      } else {
        newSessions = [sessionObj, ...prevSessions];
      }

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(userStorageKey, JSON.stringify(newSessions));
        } catch {}
      }
      return newSessions;
    });
  };

  const loadSession = (session: ChatSession) => {
    setActiveSessionId(session.id);
    setMessages(session.messages);
    setActiveWeather(session.activeWeather);
    setActiveDelay(session.activeDelay);
    setActiveHotels(session.activeHotels);
    setActiveCars(session.activeCars);
    setHasQueriedDestination(session.hasQueriedDestination);
    setShowHistoryPanel(false);
  };

  const handleStartNewChat = () => {
    const newId = 'session-' + Date.now();
    const initialMsg: Message = {
      id: Date.now().toString(),
      sender: 'ai',
      text: `Merhaba! Yeni bir sohbet başlattınız. Nereye seyahat etmek istiyorsunuz? Uçuşlar, canlı hava durumu ve konaklama önerileri için sorunuzu yazabilirsiniz.`,
      time: 'Şimdi',
    };

    setActiveSessionId(newId);
    setMessages([initialMsg]);
    setHasQueriedDestination(false);
    setShowHistoryPanel(false);
  };

  const renderFormattedMessageText = (text: string, isUser: boolean) => {
    if (!text) return null;

    // Preprocess text: Auto-insert double newlines before inline section headers (e.g. **Title:** or ✈️ **Title:**)
    let normalized = text
      .replace(/([^\n])\s*(([✈️🌤️🏨🏛️📍🌊☕🛍️🍽️🇹🇷🗼🎨⛵🏰🕌🛗💡⚡]\s*)?\*\*[^*]+:\*\*)/g, '$1\n\n$2')
      .replace(/([.!?])\s*([•\-*])\s+/g, '$1\n$2 ');

    const paragraphs = normalized.split(/\n\s*\n/);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', whiteSpace: 'pre-wrap', lineHeight: 1.65 }}>
        {paragraphs.map((para, pIdx) => {
          const trimmedPara = para.trim();
          if (!trimmedPara) return null;

          const lines = trimmedPara.split('\n');
          const isSectionBlock = !isUser && (
            trimmedPara.includes('**') ||
            trimmedPara.includes('•') ||
            trimmedPara.includes('- ') ||
            /^[✈️🌤️🏨🏛️📍🌊☕🛍️🍽️🇹🇷🗼🎨⛵🏰🕌🛗💡⚡]/.test(trimmedPara)
          );

          return (
            <div
              key={pIdx}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                backgroundColor: isSectionBlock ? 'rgba(37, 99, 235, 0.04)' : 'transparent',
                padding: isSectionBlock ? '8px 12px' : '0px',
                borderRadius: '8px',
                borderLeft: isSectionBlock ? '3px solid var(--brand-accent)' : 'none',
              }}
            >
              {lines.map((line, lineIdx) => {
                const trimmedLine = line.trim();
                if (!trimmedLine) return null;

                // Process bold tags **text**
                const parts = line.split(/(\*\*[^*]+\*\*)/g);
                const formattedLine = parts.map((part, partIdx) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    const inner = part.slice(2, -2);
                    return (
                      <strong
                        key={partIdx}
                        style={{
                          color: isUser ? '#ffffff' : 'var(--brand-accent)',
                          fontWeight: 800,
                        }}
                      >
                        {inner}
                      </strong>
                    );
                  }
                  return part;
                });

                const isBullet = trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ') || trimmedLine.startsWith('• ') || /^\d+\.\s/.test(trimmedLine);
                const isHeader = (trimmedLine.startsWith('**') && trimmedLine.includes(':**')) ||
                                 /^[✈️🌤️🏨🏛️📍🌊☕🛍️🍽️🇹🇷🗼🎨⛵🏰🕌🛗💡⚡]/.test(trimmedLine);

                return (
                  <div
                    key={lineIdx}
                    style={{
                      paddingLeft: isBullet ? '8px' : '0px',
                      fontWeight: isHeader ? 800 : 400,
                      fontSize: isHeader ? '0.93rem' : '0.87rem',
                      color: isHeader ? (isUser ? '#ffffff' : 'var(--text-primary)') : undefined,
                      marginTop: isHeader && lineIdx > 0 ? '4px' : '0px',
                      display: isBullet ? 'flex' : 'block',
                      alignItems: isBullet ? 'flex-start' : 'initial',
                      gap: isBullet ? '6px' : '0px',
                    }}
                  >
                    {isBullet ? (
                      <>
                        <span style={{ color: isUser ? '#ffffff' : 'var(--brand-accent)', fontWeight: 900, flexShrink: 0 }}>•</span>
                        <span>{line.replace(/^[-*•]\s*/, '').replace(/^\d+\.\s*/, '')}</span>
                      </>
                    ) : (
                      formattedLine
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  const handleDeleteSession = (sessionIdToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = sessions.filter(s => s.id !== sessionIdToDelete);
    setSessions(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(userStorageKey, JSON.stringify(updated));
      } catch {}
    }

    if (activeSessionId === sessionIdToDelete) {
      if (updated.length > 0) {
        loadSession(updated[0]);
      } else {
        handleStartNewChat();
      }
    }
  };

  if (!isOpen) return null;

  // Weather Icon & Style Helper based on condition string
  const getWeatherVisuals = (conditionStr: string) => {
    const c = (conditionStr || '').toLowerCase();
    
    if (c.includes('güneş') || c.includes('açık') || c.includes('clear') || c.includes('sun')) {
      return {
        icon: <Sun size={32} style={{ color: '#f59e0b' }} />,
        smallIcon: <Sun size={18} style={{ color: '#f59e0b' }} />,
        bg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(251, 191, 36, 0.05) 100%)',
        borderColor: 'rgba(245, 158, 11, 0.3)',
        badgeColor: '#d97706',
        badgeBg: 'rgba(245, 158, 11, 0.2)',
        label: 'Güneşli / Açık'
      };
    }
    if (c.includes('yağmur') || c.includes('çisinti') || c.includes('rain') || c.includes('shower') || c.includes('drizzle')) {
      return {
        icon: <CloudRain size={32} style={{ color: '#2563eb' }} />,
        smallIcon: <CloudRain size={18} style={{ color: '#2563eb' }} />,
        bg: 'linear-gradient(135deg, rgba(37, 99, 235, 0.15) 0%, rgba(96, 165, 250, 0.05) 100%)',
        borderColor: 'rgba(37, 99, 235, 0.3)',
        badgeColor: '#1d4ed8',
        badgeBg: 'rgba(37, 99, 235, 0.2)',
        label: 'Yağmurlu'
      };
    }
    if (c.includes('kar') || c.includes('snow') || c.includes('buz')) {
      return {
        icon: <Snowflake size={32} style={{ color: '#0284c7' }} />,
        smallIcon: <Snowflake size={18} style={{ color: '#0284c7' }} />,
        bg: 'linear-gradient(135deg, rgba(56, 189, 248, 0.18) 0%, rgba(186, 230, 253, 0.05) 100%)',
        borderColor: 'rgba(56, 189, 248, 0.35)',
        badgeColor: '#0369a1',
        badgeBg: 'rgba(56, 189, 248, 0.25)',
        label: 'Karlı'
      };
    }
    if (c.includes('fırtına') || c.includes('thunder') || c.includes('şimşek')) {
      return {
        icon: <CloudLightning size={32} style={{ color: '#9333ea' }} />,
        smallIcon: <CloudLightning size={18} style={{ color: '#9333ea' }} />,
        bg: 'linear-gradient(135deg, rgba(147, 51, 234, 0.15) 0%, rgba(216, 180, 254, 0.05) 100%)',
        borderColor: 'rgba(147, 51, 234, 0.3)',
        badgeColor: '#7e22ce',
        badgeBg: 'rgba(147, 51, 234, 0.2)',
        label: 'Fırtınalı'
      };
    }
    if (c.includes('sis') || c.includes('pus') || c.includes('fog') || c.includes('mist')) {
      return {
        icon: <CloudFog size={32} style={{ color: '#64748b' }} />,
        smallIcon: <CloudFog size={18} style={{ color: '#64748b' }} />,
        bg: 'linear-gradient(135deg, rgba(100, 116, 139, 0.15) 0%, rgba(203, 213, 225, 0.05) 100%)',
        borderColor: 'rgba(100, 116, 139, 0.3)',
        badgeColor: '#334155',
        badgeBg: 'rgba(100, 116, 139, 0.2)',
        label: 'Sisli / Puslu'
      };
    }
    return {
      icon: <CloudSun size={32} style={{ color: '#3b82f6' }} />,
      smallIcon: <CloudSun size={18} style={{ color: '#3b82f6' }} />,
      bg: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(147, 197, 253, 0.05) 100%)',
      borderColor: 'rgba(59, 130, 246, 0.25)',
      badgeColor: '#2563eb',
      badgeBg: 'rgba(59, 130, 246, 0.15)',
      label: 'Bulutlu / Parçalı Bulutlu'
    };
  };

  // City & Destination Resolver (Includes Gaziantep, İzmir, Ankara, Antalya, etc. with past context memory)
  const resolveCityData = (qLower: string, pastMessages?: Message[]) => {
    const checkString = (str: string) => {
      const s = str.toLowerCase();
      if (s.includes('gaziantep') || s.includes('gzt')) return { city: 'Gaziantep', country: 'Türkiye', code: 'GZT', temp: '26°C', weather: 'Güneşli' };
      if (s.includes('izmir') || s.includes('adb')) return { city: 'İzmir', country: 'Türkiye', code: 'ADB', temp: '27°C', weather: 'Güneşli & Ilık' };
      if (s.includes('ankara') || s.includes('esb')) return { city: 'Ankara', country: 'Türkiye', code: 'ESB', temp: '22°C', weather: 'Parçalı Bulutlu' };
      if (s.includes('antalya') || s.includes('ayt')) return { city: 'Antalya', country: 'Türkiye', code: 'AYT', temp: '29°C', weather: 'Sıcak & Güneşli' };
      if (s.includes('trabzon') || s.includes('tzx')) return { city: 'Trabzon', country: 'Türkiye', code: 'TZX', temp: '20°C', weather: 'Yağmurlu' };
      if (s.includes('bodrum') || s.includes('bjv')) return { city: 'Bodrum', country: 'Türkiye', code: 'BJV', temp: '28°C', weather: 'Güneşli' };
      if (s.includes('paris') || s.includes('cdg')) return { city: 'Paris', country: 'Fransa', code: 'CDG', temp: '19°C', weather: 'Açık & Bulutlu' };
      if (s.includes('londra') || s.includes('london') || s.includes('lhr')) return { city: 'Londra', country: 'Birleşik Krallık', code: 'LHR', temp: '17°C', weather: 'Yağmurlu & Çisintili' };
      if (s.includes('new york') || s.includes('jfk')) return { city: 'New York', country: 'ABD', code: 'JFK', temp: '22°C', weather: 'Açık & Güneşli' };
      if (s.includes('roma') || s.includes('rome') || s.includes('fco')) return { city: 'Roma', country: 'İtalya', code: 'FCO', temp: '25°C', weather: 'Güneşli' };
      if (s.includes('dubai') || s.includes('dxb')) return { city: 'Dubai', country: 'BAE', code: 'DXB', temp: '34°C', weather: 'Sıcak & Güneşli' };
      if (s.includes('amsterdam') || s.includes('ams')) return { city: 'Amsterdam', country: 'Hollanda', code: 'AMS', temp: '18°C', weather: 'Sisli & Bulutlu' };
      if (s.includes('berlin') || s.includes('ber')) return { city: 'Berlin', country: 'Almanya', code: 'BER', temp: '21°C', weather: 'Parçalı Bulutlu' };
      return null;
    };

    const direct = checkString(qLower);
    if (direct) return direct;

    // Check past history in reverse order if current query does not explicitly specify a city
    if (pastMessages && pastMessages.length > 0) {
      for (let i = pastMessages.length - 1; i >= 0; i--) {
        const histMatch = checkString(pastMessages[i].text);
        if (histMatch) return histMatch;
      }
    }

    return { city: 'Gaziantep', country: 'Türkiye', code: 'GZT', temp: '26°C', weather: 'Güneşli' };
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputQuery;
    if (!textToSend.trim()) return;

    const userText = textToSend.trim();
    const nowTime = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      time: nowTime,
    };

    const newMessagesList = [...messages, userMsg];
    setMessages(newMessagesList);
    if (!customText) setInputQuery('');
    setIsTyping(true);
    setHasQueriedDestination(true);

    const qLower = userText.toLowerCase();
    const resolved = resolveCityData(qLower, messages);

    // Optimistically update dashboard widgets immediately so target city is shown during analysis
    setActiveWeather({
      airport: `${resolved.code} Hub`,
      city: resolved.city,
      country: resolved.country,
      temp: resolved.temp,
      condition: resolved.weather,
      wind: '12 knot Kuzeydoğu',
      humidity: '%50',
      visibility: '10 km (Canlı Sorgulanıyor)',
      clothingAdvisory: `${resolved.city} için canlı METAR verileri ve hava durumu analiz ediliyor...`
    });

    setActiveHotels([
      { id: 'h1', name: `${resolved.city} Lüks Otelleri Yükleniyor...`, city: resolved.city, rating: 4.9, pricePerNight: 2800, distanceFromAirport: '8 km', amenities: 'Google Places Canlı Arama...' },
      { id: 'h2', name: `${resolved.city} Merkez Butik Otel`, city: resolved.city, rating: 4.7, pricePerNight: 2200, distanceFromAirport: '12 km', amenities: 'Lokasyon Analizi Yapılıyor...' }
    ]);

    try {
      // Build conversation history payload for multi-turn chat context
      const chatHistoryPayload = messages
        .filter(m => m.text)
        .slice(-8)
        .map(m => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text
        }));

      // Call C# Backend API copilot endpoint with history context
      const backendRes = await api.ai.copilotQuery(userText, fromCode, resolved.code, chatHistoryPayload);

      let matchedFlights = (backendRes?.flights && backendRes.flights.length > 0)
        ? (backendRes.flights as any)
        : MOCK_FLIGHTS.filter(f => f.arrivalAirportCode === resolved.code || f.departureAirportCode === fromCode);
      if (matchedFlights.length === 0) matchedFlights = MOCK_FLIGHTS.slice(0, 3);

      let weatherInfo: WeatherData = {
        airport: backendRes?.weather?.airport || `${resolved.code} Hub`,
        city: backendRes?.weather?.city || resolved.city,
        country: resolved.country,
        temp: backendRes?.weather?.temp || resolved.temp,
        condition: backendRes?.weather?.condition || resolved.weather,
        wind: backendRes?.weather?.wind || '12 knot Kuzeydoğu',
        humidity: backendRes?.weather?.humidity || '%55',
        visibility: backendRes?.weather?.visibility || '10 km (Görüş İdeal)',
        clothingAdvisory: backendRes?.weather?.clothingAdvisory || `${resolved.city} iklimi için rahat seyahat giysileri ve mevsimlik kombinler önerilir.`
      };

      let delayInfo: DelayData = backendRes?.delayPrediction || {
        flightNumber: matchedFlights[0]?.flightNumber || 'AVQ204',
        delayProbabilityPercentage: 11.5,
        estimatedDelayMinutes: 0,
        riskLevel: 'Düşük Risk (Zamanında Kalkış)',
        predictionReason: 'Kule pist trafiği ve METAR rüzgar limitleri uçuşa elverişli.'
      };

      let hotelList: HotelData[] = (backendRes?.hotels && backendRes.hotels.length > 0)
        ? backendRes.hotels
        : [
            { id: 'h1', name: `The Grand ${resolved.city} Executive Hotel`, city: resolved.city, rating: 4.9, pricePerNight: 3100, distanceFromAirport: '8 km', amenities: 'Spa • Panoramik Manzara • Kahvaltı' },
            { id: 'h2', name: `${resolved.city} Boutique Resort`, city: resolved.city, rating: 4.7, pricePerNight: 2200, distanceFromAirport: '11 km', amenities: 'Merkez Yakını • Ücretsiz Wi-Fi • Gym' }
          ];

      let carList: CarData[] = (backendRes?.carRentals && backendRes.carRentals.length > 0)
        ? backendRes.carRentals
        : [
            { id: 'c1', company: 'AVIS VIP', carModel: 'BMW 320i Sedan', category: 'Lüks Otomatik', dailyPrice: 1450, fuelType: 'Benzin / Hibrit' },
            { id: 'c2', company: 'HERTZ Express', carModel: 'Volkswagen Tiguan SUV', category: 'Aile SUV', dailyPrice: 1290, fuelType: 'Dizel Otomatik' }
          ];

      // Update Live Right Dashboard
      setActiveWeather(weatherInfo);
      setActiveDelay(delayInfo);
      setActiveHotels(hotelList);
      setActiveCars(carList);

      let responseText = backendRes?.responseText || '';
      if (!responseText) {
        if (qLower.includes('uçuş') || qLower.includes('bilet') || qLower.includes('fiyat') || qLower.includes('arama')) {
          responseText = `${resolved.city} (${resolved.code}) rotası için en uygun bilet fiyatları ve zamanında kalkış analizleri listelendi:`;
        } else if (qLower.includes('hava') || qLower.includes('durum') || qLower.includes('metar')) {
          responseText = `${resolved.city} (${resolved.country}) için canlı METAR hava durumu raporu ve giyim tavsiyesi güncellendi.`;
        } else if (qLower.includes('rötar') || qLower.includes('gecikme') || qLower.includes('tahmin')) {
          responseText = `Akıllı Tahmin Motoru uçuşunuz için zamanında kalkış olasılığını %${Math.round(100 - delayInfo.delayProbabilityPercentage)} (${delayInfo.riskLevel}) olarak hesapladı.`;
        } else if (qLower.includes('otel') || qLower.includes('konaklama')) {
          responseText = `${resolved.city} merkezinde ve havalimanına yakın seçkin otel alternatifleri listelendi.`;
        } else if (qLower.includes('araba') || qLower.includes('araç') || qLower.includes('kiralama')) {
          responseText = `${resolved.city} Havalimanı teslimatlı VIP sedan ve SUV araç kiralama fırsatları görüntülendi.`;
        } else {
          responseText = `${resolved.city} seyahatiniz için tarifeli biletler, varış hava durumu ve konaklama önerileri hazırlandı.`;
        }
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: responseText,
        flights: (qLower.includes('uçuş') || qLower.includes('bilet') || qLower.includes('fiyat') || qLower.includes('arama')) ? matchedFlights : undefined,
        weather: qLower.includes('hava') ? weatherInfo : undefined,
        delay: (qLower.includes('rötar') || qLower.includes('tahmin')) ? delayInfo : undefined,
        hotels: qLower.includes('otel') ? hotelList : undefined,
        carRentals: (qLower.includes('araba') || qLower.includes('araç')) ? carList : undefined,
        time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      };

      const finalMessages = [...newMessagesList, aiMsg];
      setMessages(finalMessages);
      setIsTyping(false);

      // Save to chat session history
      updateCurrentSession(finalMessages, weatherInfo, delayInfo, hotelList, carList, true);
    } catch {
      setIsTyping(false);
    }
  };

  const toggleChecklistItem = (id: string) => {
    setPackingChecklist(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const weatherVisuals = getWeatherVisuals(activeWeather.condition);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isFullScreen ? '0' : 'clamp(8px, 2vw, 20px)',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        className="corporate-card"
        style={{
          width: isFullScreen ? '100vw' : '100%',
          maxWidth: isFullScreen ? '100vw' : '880px',
          height: isFullScreen ? '100vh' : 'min(88vh, 760px)',
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
        <div
          style={{
            padding: '10px 16px',
            backgroundColor: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            minHeight: '56px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: 'var(--brand-accent)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Bot size={18} />
            </div>

            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontWeight: 900,
                  fontSize: 'clamp(0.82rem, 3.5vw, 0.92rem)',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                <span>AVIQORA AI Asistanı</span>
                <Sparkles size={13} style={{ color: 'var(--brand-gold)', flexShrink: 0 }} />
              </div>

              <div
                style={{
                  fontSize: 'clamp(0.62rem, 2.5vw, 0.68rem)',
                  color: '#10b981',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                <span>● Akıllı Danışman</span>
                <span style={{ opacity: 0.5 }}>•</span>
                <span>Canlı Analiz</span>
              </div>
            </div>
          </div>

          {/* Action Buttons Header Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            {/* History Panel Toggle Button */}
            <button
              type="button"
              onClick={() => setShowHistoryPanel(!showHistoryPanel)}
              className="btn-outline"
              style={{
                padding: '6px 12px',
                fontSize: '0.75rem',
                fontWeight: 800,
                height: '34px',
                backgroundColor: showHistoryPanel ? 'var(--brand-accent)' : 'var(--bg-surface)',
                color: showHistoryPanel ? '#ffffff' : 'var(--text-primary)',
                border: showHistoryPanel ? '1px solid var(--brand-accent)' : '1px solid var(--border-color)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
              title="Geçmiş Sohbetler"
            >
              <History size={14} />
              <span>Geçmiş</span>
              {sessions.length > 0 && (
                <span style={{ backgroundColor: showHistoryPanel ? '#fff' : 'var(--brand-accent)', color: showHistoryPanel ? 'var(--brand-accent)' : '#fff', padding: '1px 6px', borderRadius: '10px', fontSize: '0.65rem' }}>
                  {sessions.length}
                </span>
              )}
            </button>

            {/* New Chat Button */}
            <button
              type="button"
              onClick={handleStartNewChat}
              className="btn-outline"
              style={{
                padding: '6px 10px',
                fontSize: '0.75rem',
                fontWeight: 800,
                height: '34px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
              title="Yeni Sohbet Başlat"
            >
              <Plus size={14} style={{ color: 'var(--brand-accent)' }} />
              <span>Yeni</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="btn-outline"
              style={{
                padding: '6px 10px',
                fontSize: '0.75rem',
                fontWeight: 800,
                height: '34px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
              title={isFullScreen ? 'Pencere Moduna Geç' : 'Tam Ekran Moduna Geç'}
            >
              {isFullScreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="btn-outline"
              style={{ padding: '6px', height: '34px', width: '34px', justifyContent: 'center' }}
              title="Kapat"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* MAIN BODY: History Panel Drawer + Chat Stream + Right Live Dashboard */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: showHistoryPanel ? '240px 1fr' : isFullScreen ? '1fr 380px' : '1fr', overflow: 'hidden', transition: 'all 0.2s ease' }}>
          
          {/* HISTORY PANEL DRAWER */}
          {showHistoryPanel && (
            <div
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderRight: '1px solid var(--border-color)',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                overflowY: 'auto',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <History size={14} style={{ color: 'var(--brand-accent)' }} /> Geçmiş Sohbetler
                </span>

                <button
                  type="button"
                  onClick={handleStartNewChat}
                  style={{ background: 'none', border: 'none', color: 'var(--brand-accent)', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
                >
                  + Yeni
                </button>
              </div>

              {sessions.length === 0 ? (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 8px' }}>
                  Henüz kaydedilmiş geçmiş sohbet bulunmuyor.
                </div>
              ) : (
                sessions.map((s) => {
                  const isActive = s.id === activeSessionId;
                  return (
                    <div
                      key={s.id}
                      onClick={() => loadSession(s)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: isActive ? 'rgba(37, 99, 235, 0.12)' : 'var(--bg-surface)',
                        border: isActive ? '1px solid var(--brand-accent)' : '1px solid var(--border-color)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        position: 'relative',
                      }}
                    >
                      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: isActive ? 'var(--brand-accent)' : 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '20px' }}>
                        {s.title}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        <span>{s.updatedAt}</span>
                        <span>{s.messages.length} mesaj</span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteSession(s.id, e)}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '2px',
                        }}
                        title="Sohbeti Sil"
                      >
                        <Trash2 size={13} hover-color="var(--brand-red)" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* LEFT COLUMN: CHAT STREAM & INPUT */}
          <div style={{ display: 'flex', flexDirection: 'column', borderRight: isFullScreen && !showHistoryPanel ? '1px solid var(--border-color)' : 'none', overflow: 'hidden' }}>
            {/* Quick Prompt Pills */}
            <div style={{ padding: '10px 16px', backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '8px', overflowX: 'auto' }}>
              {[
                { label: '🕌 Gaziantep Seyahati', prompt: 'Gaziantep uçuş biletleri ve canlı hava durumu' },
                { label: '✈️ Paris Uçuşları', prompt: 'İstanbul - Paris uçuş biletlerini ara' },
                { label: '🌤️ Londra Hava Durumu', prompt: 'Londra canlı METAR hava durumu ve tavsiyesi' },
                { label: '🏨 Roma Otelleri', prompt: 'Roma merkeze yakın seçkin otel önerileri' },
                { label: '🚗 Antalya Araç Kiralama', prompt: 'Antalya Havalimanı teslimatlı SUV araçlar' },
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
                    transition: 'all 0.15s ease',
                  }}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Chat Stream Messages Log */}
            <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: 'var(--bg-primary)' }}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '88%',
                    display: 'flex',
                    gap: '10px',
                    flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
                  }}
                >
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: msg.sender === 'user' ? 'var(--brand-gold)' : 'var(--brand-accent)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.75rem', fontWeight: 900 }}>
                    {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>

                  <div
                    style={{
                      backgroundColor: msg.sender === 'user' ? 'var(--brand-accent)' : 'var(--bg-secondary)',
                      color: msg.sender === 'user' ? '#ffffff' : 'var(--text-primary)',
                      padding: '14px 18px',
                      borderRadius: 'var(--radius-lg)',
                      fontSize: '0.88rem',
                      lineHeight: 1.6,
                      border: msg.sender === 'user' ? 'none' : '1px solid var(--border-color)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    }}
                  >
                    {renderFormattedMessageText(msg.text, msg.sender === 'user')}

                    {/* Inline Weather Card with Dynamic Weather Icon & Style */}
                    {msg.weather && (
                      <div
                        style={{
                          marginTop: '10px',
                          background: getWeatherVisuals(msg.weather.condition).bg,
                          padding: '12px 14px',
                          borderRadius: 'var(--radius-md)',
                          border: `1px solid ${getWeatherVisuals(msg.weather.condition).borderColor}`,
                          display: 'flex',
                          gap: '12px',
                          alignItems: 'center'
                        }}
                      >
                        <div style={{ padding: '6px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.8)', flexShrink: 0 }}>
                          {getWeatherVisuals(msg.weather.condition).icon}
                        </div>
                        <div>
                          <div style={{ fontWeight: 900, color: 'var(--text-primary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>{msg.weather.city}, {msg.weather.country}</span>
                            <span style={{ fontSize: '1.1rem', color: 'var(--brand-accent)' }}>{msg.weather.temp}</span>
                          </div>
                          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontWeight: 800, color: getWeatherVisuals(msg.weather.condition).badgeColor }}>
                              {msg.weather.condition}
                            </span>
                            <span>• Rüzgar: {msg.weather.wind}</span>
                          </div>
                          {msg.weather.clothingAdvisory && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--brand-accent)', fontWeight: 800, marginTop: '4px' }}>💡 {msg.weather.clothingAdvisory}</div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Inline On-Time Delay Prediction Output */}
                    {msg.delay && (
                      <div style={{ marginTop: '10px', backgroundColor: 'rgba(16, 185, 129, 0.08)', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <Zap size={22} style={{ color: '#10b981', flexShrink: 0 }} />
                        <div>
                          <div style={{ fontWeight: 900, color: '#047857', fontSize: '0.85rem' }}>Zamanında Kalkış Tahmini: {msg.delay.riskLevel}</div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{msg.delay.predictionReason}</div>
                        </div>
                      </div>
                    )}

                    {/* Inline SearchFlightsTool Cards */}
                    {msg.flights && (
                      <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {msg.flights.map((f) => (
                          <div key={f.id} style={{ padding: '8px 12px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontWeight: 800, color: 'var(--brand-accent)', fontSize: '0.82rem' }}>{f.flightNumber} ({f.departureAirportCode} ➔ {f.arrivalAirportCode})</div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{f.aircraftModel} • ₺{f.priceAmount}</div>
                            </div>
                            <button
                              onClick={() => {
                                if (onSelectFlight) onSelectFlight(f.id);
                                onClose();
                              }}
                              className="btn-brand"
                              style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                            >
                              Seç
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={{ fontSize: '0.68rem', color: msg.sender === 'user' ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)', marginTop: '4px', textAlign: 'right' }}>
                      {msg.time}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--brand-accent)', fontSize: '0.8rem', fontWeight: 800 }}>
                  <RefreshCw size={14} className="animate-spin" /> Yapay Zeka Seyahat Analizlerini İşliyor...
                </div>
              )}
            </div>

            {/* Bottom Input Box */}
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} style={{ padding: '12px 16px', backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="input-corporate"
                placeholder="Nereye seyahat etmek istiyorsunuz? Sorunuzu yazın..."
                style={{ flex: 1, height: '44px', fontSize: '0.88rem' }}
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
              />
              <button type="submit" className="btn-brand" style={{ height: '44px', padding: '0 18px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Send size={16} />
              </button>
            </form>
          </div>

          {/* RIGHT COLUMN: LIVE TRAVEL HUB DASHBOARD (Visible in Fullscreen Mode) */}
          {isFullScreen && !showHistoryPanel && (
            <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {!hasQueriedDestination ? (
                /* Initial Welcome Card */
                <div className="corporate-card" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', textAlign: 'center', backgroundColor: 'var(--bg-surface)' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: 'var(--brand-accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                    <Compass size={24} />
                  </div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: '6px' }}>Canlı Seyahat Rehberi</h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Gitmek istediğiniz şehri veya uçuş rotanızı sorduğunuzda; varış hava durumu, konaklama önerileri, araç kiralama ve zamanında kalkış analizi burada canlı görüntülenecektir.
                  </p>
                </div>
              ) : (
                /* Dynamic Widgets when city is queried */
                <>
                  {isTyping && (
                    <div
                      style={{
                        padding: '10px 14px',
                        backgroundColor: 'rgba(37, 99, 235, 0.12)',
                        border: '1px solid var(--brand-accent)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--brand-accent)',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15)',
                      }}
                    >
                      <RefreshCw size={15} className="animate-spin" />
                      <span>{activeWeather.city.toUpperCase()} CANLI SEYAHAT VERİLERİ ANALİZ EDİLİYOR...</span>
                    </div>
                  )}

                  {/* Widget 1: Weather Report with Dynamic Weather Icon & Illustrations */}
                  <div
                    className="corporate-card"
                    style={{
                      padding: '16px',
                      borderRadius: 'var(--radius-lg)',
                      background: weatherVisuals.bg,
                      border: `1.5px solid ${weatherVisuals.borderColor}`,
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: weatherVisuals.badgeColor, textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {weatherVisuals.smallIcon} VARIŞ HAVA DURUMU & METAR
                      </span>
                      <span style={{ backgroundColor: weatherVisuals.badgeBg, color: weatherVisuals.badgeColor, padding: '2px 8px', borderRadius: '10px', fontSize: '0.68rem' }}>
                        {weatherVisuals.label}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ padding: '8px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.85)', boxShadow: '0 4px 10px rgba(0,0,0,0.06)' }}>
                          {weatherVisuals.icon}
                        </div>
                        <div>
                          <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                            {activeWeather.city}, {activeWeather.country}
                          </div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--brand-accent)' }}>
                            {activeWeather.temp}
                          </div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: weatherVisuals.badgeColor }}>
                            {activeWeather.condition}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <div>Rüzgar: <strong>{activeWeather.wind}</strong></div>
                        <div>Nem: <strong>{activeWeather.humidity || '%50'}</strong></div>
                        <div>Görüş: <strong>{activeWeather.visibility}</strong></div>
                      </div>
                    </div>

                    <div style={{ marginTop: '12px', padding: '8px 10px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)', fontSize: '0.75rem', color: 'var(--text-primary)', fontWeight: 700, border: '1px solid var(--border-color)' }}>
                      💡 {activeWeather.clothingAdvisory}
                    </div>
                  </div>

                  {/* Widget 2: On-Time Delay Risk Score */}
                  <div className="corporate-card" style={{ padding: '16px', borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Zap size={16} /> ZAMANINDA KALKIŞ TAHMİNİ
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>Uçuş Seferi: {activeDelay.flightNumber}</span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 900, color: '#047857', backgroundColor: 'rgba(16, 185, 129, 0.15)', padding: '2px 8px', borderRadius: '4px' }}>
                        {activeDelay.riskLevel}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {activeDelay.predictionReason}
                    </div>
                  </div>

                  {/* Widget 3: Hotel Recommendations */}
                  <div className="corporate-card" style={{ padding: '16px', borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--brand-accent)', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Hotel size={16} /> {activeWeather.city.toUpperCase()} OTEL ÖNERİLERİ
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {activeHotels.map(h => (
                        <div key={h.id} style={{ padding: '10px 12px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '0.82rem', color: 'var(--text-primary)' }}>{h.name}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>⭐ {h.rating} • {h.distanceFromAirport} • {h.amenities}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 900, fontSize: '0.88rem', color: 'var(--brand-accent)' }}>₺{h.pricePerNight}</div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>/gece</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Widget 4: Car Rental Deals */}
                  <div className="corporate-card" style={{ padding: '16px', borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--brand-gold)', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Car size={16} /> HAVALİMANI ARAÇ KİRALAMA
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {activeCars.map(c => (
                        <div key={c.id} style={{ padding: '10px 12px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '0.82rem', color: 'var(--text-primary)' }}>{c.carModel}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{c.company} • {c.category} ({c.fuelType})</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 900, fontSize: '0.88rem', color: '#059669' }}>₺{c.dailyPrice}</div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>/gün</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Widget 5: Smart Packing Checklist */}
                  <div className="corporate-card" style={{ padding: '16px', borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Luggage size={16} style={{ color: 'var(--brand-accent)' }} /> VALİZ HAZIRLAMA KONTROL LİSTESİ
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {packingChecklist.map(item => (
                        <div
                          key={item.id}
                          onClick={() => toggleChecklistItem(item.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '8px 10px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--bg-surface)',
                            cursor: 'pointer',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            color: item.checked ? 'var(--text-muted)' : 'var(--text-primary)',
                            textDecoration: item.checked ? 'line-through' : 'none',
                          }}
                        >
                          {item.checked ? <CheckSquare size={16} style={{ color: '#10b981' }} /> : <Square size={16} style={{ color: 'var(--text-muted)' }} />}
                          <span>{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
