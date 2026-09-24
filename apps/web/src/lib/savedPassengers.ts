export interface SavedPassenger {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  gender: 'Erkek' | 'Kadın';
  identityNo: string;
  passengerType: 'Yetişkin' | 'Çocuk' | 'Bebek';
  birthDate: string;
  relation: 'Kendi Hesabım' | 'Eş' | 'Çocuk' | 'Anne/Baba' | 'Arkadaş' | 'İş Arkadaşı' | 'Diğer';
  milesNumber?: string;
}

const STORAGE_KEY = 'aviqora_saved_passengers';

const DEFAULT_SAVED_PASSENGERS: SavedPassenger[] = [
  {
    id: 'pass-default-1',
    fullName: 'Ahmet Yılmaz',
    firstName: 'Ahmet',
    lastName: 'Yılmaz',
    gender: 'Erkek',
    identityNo: '12345678950',
    passengerType: 'Yetişkin',
    birthDate: '1992-05-14',
    relation: 'Kendi Hesabım',
    milesNumber: 'TK9910482',
  },
  {
    id: 'pass-default-2',
    fullName: 'Ayşe Yılmaz',
    firstName: 'Ayşe',
    lastName: 'Yılmaz',
    gender: 'Kadın',
    identityNo: '54321678950',
    passengerType: 'Yetişkin',
    birthDate: '1994-08-12',
    relation: 'Eş',
    milesNumber: 'TK8849201',
  },
  {
    id: 'pass-default-3',
    fullName: 'Can Yılmaz',
    firstName: 'Can',
    lastName: 'Yılmaz',
    gender: 'Erkek',
    identityNo: '98765432584',
    passengerType: 'Çocuk',
    birthDate: '2018-03-24',
    relation: 'Çocuk',
  },
];

export function getSavedPassengers(): SavedPassenger[] {
  if (typeof window === 'undefined') return DEFAULT_SAVED_PASSENGERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SAVED_PASSENGERS));
      return DEFAULT_SAVED_PASSENGERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.error('Failed to parse saved passengers:', err);
  }
  return DEFAULT_SAVED_PASSENGERS;
}

export function savePassengers(passengers: SavedPassenger[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(passengers));
  } catch (err) {
    console.error('Failed to save passengers to localStorage:', err);
  }
}

export function upsertSavedPassenger(
  passenger: Omit<SavedPassenger, 'id' | 'relation' | 'passengerType'> & {
    id?: string;
    relation?: SavedPassenger['relation'];
    passengerType?: SavedPassenger['passengerType'];
  }
): SavedPassenger[] {
  const current = getSavedPassengers();
  const cleanId = passenger.identityNo?.trim();
  const existingIdx = current.findIndex(
    (p) =>
      (passenger.id && p.id === passenger.id) ||
      (cleanId && p.identityNo?.trim() === cleanId)
  );

  let updated: SavedPassenger[];
  if (existingIdx >= 0) {
    const existingPass = current[existingIdx];
    const targetId = existingPass.id;
    const targetRelation = passenger.relation || existingPass.relation || 'Eş';
    const targetType = passenger.passengerType || existingPass.passengerType || 'Yetişkin';
    updated = [...current];
    updated[existingIdx] = {
      ...existingPass,
      ...passenger,
      id: targetId,
      relation: targetRelation,
      passengerType: targetType,
      fullName: `${passenger.firstName} ${passenger.lastName}`.trim(),
    };
  } else {
    const newPassenger: SavedPassenger = {
      ...passenger,
      id: passenger.id || `pass-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      relation: passenger.relation || 'Eş',
      passengerType: passenger.passengerType || 'Yetişkin',
      fullName: `${passenger.firstName} ${passenger.lastName}`.trim(),
    };
    updated = [...current, newPassenger];
  }

  savePassengers(updated);
  return updated;
}

export function translateRelation(relation: SavedPassenger['relation'] | string | undefined, isEn: boolean): string {
  if (!relation) return '';
  if (!isEn) return relation;
  switch (relation) {
    case 'Kendi Hesabım': return 'Myself';
    case 'Eş': return 'Spouse';
    case 'Çocuk': return 'Child';
    case 'Anne/Baba': return 'Parent';
    case 'Arkadaş': return 'Friend';
    case 'İş Arkadaşı': return 'Colleague';
    case 'Diğer': return 'Other';
    default: return relation;
  }
}

export function translateGender(gender: SavedPassenger['gender'] | string | undefined, isEn: boolean): string {
  if (!gender) return '';
  if (!isEn) return gender;
  switch (gender) {
    case 'Erkek': return 'Male';
    case 'Kadın': return 'Female';
    default: return gender;
  }
}

export function translatePassengerType(type: SavedPassenger['passengerType'] | string | undefined, isEn: boolean): string {
  if (!type) return '';
  if (!isEn) return type;
  switch (type) {
    case 'Yetişkin': return 'Adult';
    case 'Çocuk': return 'Child';
    case 'Bebek': return 'Infant';
    default: return type;
  }
}
