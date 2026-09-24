export interface Destination {
  id: string;
  city: string;
  country: string;
  code: string;
  image: string;
}

export const DESTINATIONS: Destination[] = [
  {
    id: 'paris',
    city: 'Paris',
    country: 'Fransa',
    code: 'CDG',
    image: '/images/destination_paris.jpg',
  },
  {
    id: 'london',
    city: 'Londra',
    country: 'Birleşik Krallık',
    code: 'LHR',
    image: '/images/destination_london.jpg',
  },
  {
    id: 'amsterdam',
    city: 'Amsterdam',
    country: 'Hollanda',
    code: 'AMS',
    image: '/images/destination_amsterdam.jpg',
  },
  {
    id: 'dubai',
    city: 'Dubai',
    country: 'Birleşik Arap Emirlikleri',
    code: 'DXB',
    image: '/images/cabin_business.jpg',
  },
  {
    id: 'tokyo',
    city: 'Tokyo',
    country: 'Japonya',
    code: 'HND',
    image: '/images/destination_tokyo.jpg',
  },
  {
    id: 'newyork',
    city: 'New York',
    country: 'Amerika Birleşik Devletleri',
    code: 'JFK',
    image: '/images/destination_newyork.jpg',
  },
];
