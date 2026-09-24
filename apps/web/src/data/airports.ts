export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
}

export const AIRPORTS: Airport[] = [
  // Türkiye Yurt İçi Havalimanları
  { code: 'IST', name: 'İstanbul Havalimanı', city: 'İstanbul', country: 'Türkiye' },
  { code: 'SAW', name: 'Sabiha Gökçen Havalimanı', city: 'İstanbul', country: 'Türkiye' },
  { code: 'ESB', name: 'Esenboğa Havalimanı', city: 'Ankara', country: 'Türkiye' },
  { code: 'ADB', name: 'Adnan Menderes Havalimanı', city: 'İzmir', country: 'Türkiye' },
  { code: 'GZT', name: 'Gaziantep Oğuzeli Havalimanı', city: 'Gaziantep', country: 'Türkiye' },
  { code: 'AYT', name: 'Antalya Havalimanı', city: 'Antalya', country: 'Türkiye' },
  { code: 'ADA', name: 'Çukurova Uluslararası / Adana Havalimanı', city: 'Adana', country: 'Türkiye' },
  { code: 'TZX', name: 'Trabzon Havalimanı', city: 'Trabzon', country: 'Türkiye' },
  { code: 'BJV', name: 'Milas-Bodrum Havalimanı', city: 'Bodrum', country: 'Türkiye' },
  { code: 'DLM', name: 'Dalaman Havalimanı', city: 'Muğla / Dalaman', country: 'Türkiye' },
  { code: 'ASR', name: 'Kayseri Erkilet Havalimanı', city: 'Kayseri', country: 'Türkiye' },
  { code: 'DIY', name: 'Diyarbakır Havalimanı', city: 'Diyarbakır', country: 'Türkiye' },
  { code: 'SZF', name: 'Samsun Çarşamba Havalimanı', city: 'Samsun', country: 'Türkiye' },
  { code: 'VAN', name: 'Van Ferit Melen Havalimanı', city: 'Van', country: 'Türkiye' },

  // Yurt Dışı Metropol Havalimanları
  { code: 'LHR', name: 'London Heathrow Airport', city: 'Londra', country: 'Birleşik Krallık' },
  { code: 'CDG', name: 'Paris Charles de Gaulle Airport', city: 'Paris', country: 'Fransa' },
  { code: 'BER', name: 'Berlin Brandenburg Airport', city: 'Berlin', country: 'Almanya' },
  { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Almanya' },
  { code: 'MUC', name: 'Munich Airport', city: 'Münih', country: 'Almanya' },
  { code: 'AMS', name: 'Amsterdam Airport Schiphol', city: 'Amsterdam', country: 'Hollanda' },
  { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'BAE' },
  { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'ABD' },
  { code: 'FCO', name: 'Rome Fiumicino Airport', city: 'Roma', country: 'İtalya' },
  { code: 'MAD', name: 'Madrid-Barajas Airport', city: 'Madrid', country: 'İspanya' },
  { code: 'VIE', name: 'Vienna International Airport', city: 'Viyana', country: 'Avusturya' },
  { code: 'ZRH', name: 'Zurich Airport', city: 'Zürih', country: 'İsviçre' },
  { code: 'HND', name: 'Tokyo Haneda Airport', city: 'Tokyo', country: 'Japonya' },
  { code: 'SIN', name: 'Singapore Changi Airport', city: 'Singapur', country: 'Singapur' },
];
