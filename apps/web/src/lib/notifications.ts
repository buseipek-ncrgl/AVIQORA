export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'checkin' | 'booking' | 'system' | 'miles';
  read: boolean;
  actionUrl?: string;
  pnrCode?: string;
}

const STORAGE_KEY = 'aviqora_notifications';

const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Online Check-in Hatırlatması',
    message: '25 Eylül TK-2104 Istanbul (IST) - Izmir (ADB) uçuşunuz için online check-in 24 Eylül saat 08:30 itibarıyla açılacaktır.',
    timestamp: new Date().toISOString(),
    type: 'checkin',
    read: false,
    pnrCode: 'AQ892K',
    actionUrl: '/profile',
  },
  {
    id: 'notif-2',
    title: 'Bilet Satın Alındı (PNR: AQ892K)',
    message: 'Istanbul (IST) -> Izmir (ADB) seferli uçuş biletiniz başarıyla oluşturuldu. E-faturanız hazır.',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    type: 'booking',
    read: false,
    pnrCode: 'AQ892K',
    actionUrl: '/profile',
  },
  {
    id: 'notif-3',
    title: 'Aviqora Club Mil Bonusu',
    message: 'Hoş geldiniz hediyesi olarak hesabınıza 500 Statü Mili eklendi.',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    type: 'miles',
    read: true,
  },
];

export function getNotifications(): AppNotification[] {
  if (typeof window === 'undefined') return DEFAULT_NOTIFICATIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_NOTIFICATIONS));
      return DEFAULT_NOTIFICATIONS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.error('Failed to parse notifications:', err);
  }
  return DEFAULT_NOTIFICATIONS;
}

export function saveNotifications(notifications: AppNotification[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  } catch (err) {
    console.error('Failed to save notifications:', err);
  }
}

export function addNotification(notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>): AppNotification[] {
  const current = getNotifications();
  const newNotif: AppNotification = {
    ...notification,
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    read: false,
  };
  const updated = [newNotif, ...current];
  saveNotifications(updated);
  return updated;
}

export function markAsRead(id: string): AppNotification[] {
  const current = getNotifications();
  const updated = current.map((n) => (n.id === id ? { ...n, read: true } : n));
  saveNotifications(updated);
  return updated;
}

export function markAllAsRead(): AppNotification[] {
  const current = getNotifications();
  const updated = current.map((n) => ({ ...n, read: true }));
  saveNotifications(updated);
  return updated;
}

export function deleteNotification(id: string): AppNotification[] {
  const current = getNotifications();
  const updated = current.filter((n) => n.id !== id);
  saveNotifications(updated);
  return updated;
}
