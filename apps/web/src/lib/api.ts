import {
  AuthResponseDto,
  BookingDto,
  CreateBookingRequest,
  FlightDto,
  LoginRequestDto,
  RegisterRequestDto,
  SeatDto,
  ApiErrorResponse
} from '@/types/api';
import { AIRPORTS } from '@/data/airports';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Realistic Fallback Data when C# API is unreachable
export const MOCK_FLIGHTS: FlightDto[] = [
  // --- YURT İÇİ UÇUŞLAR (DOMESTIC FLIGHTS) ---
  {
    id: 'f-dom-1',
    flightNumber: 'TK2108',
    airlineName: 'Aviqora Express',
    departureAirportCode: 'IST',
    departureAirportName: 'İstanbul Havalimanı',
    arrivalAirportCode: 'ESB',
    arrivalAirportName: 'Ankara Esenboğa Havalimanı',
    departureTime: '2026-09-25T07:15:00.000Z',
    arrivalTime: '2026-09-25T08:25:00.000Z',
    priceAmount: 850,
    priceCurrency: 'TRY',
    aircraftModel: 'Airbus A320neo',
    availableSeatsCount: 48,
    isDirect: true,
    stopsCount: 0,
    totalDuration: '1s 10dk',
    co2SavingsPercent: 15,
  },
  {
    id: 'f-dom-2',
    flightNumber: 'TK2112',
    airlineName: 'Aviqora Shuttle',
    departureAirportCode: 'SAW',
    departureAirportName: 'Sabiha Gökçen Havalimanı',
    arrivalAirportCode: 'ESB',
    arrivalAirportName: 'Ankara Esenboğa Havalimanı',
    departureTime: '2026-09-25T11:00:00.000Z',
    arrivalTime: '2026-09-25T12:05:00.000Z',
    priceAmount: 780,
    priceCurrency: 'TRY',
    aircraftModel: 'Boeing 737-800',
    availableSeatsCount: 32,
    isDirect: true,
    stopsCount: 0,
    totalDuration: '1s 05dk',
    co2SavingsPercent: 10,
  },
  {
    id: 'f-dom-3',
    flightNumber: 'TK2314',
    airlineName: 'Aviqora Coastal',
    departureAirportCode: 'SAW',
    departureAirportName: 'Sabiha Gökçen Havalimanı',
    arrivalAirportCode: 'ADB',
    arrivalAirportName: 'İzmir Adnan Menderes Havalimanı',
    departureTime: '2026-09-25T09:30:00.000Z',
    arrivalTime: '2026-09-25T10:40:00.000Z',
    priceAmount: 920,
    priceCurrency: 'TRY',
    aircraftModel: 'Airbus A321neo',
    availableSeatsCount: 54,
    isDirect: true,
    stopsCount: 0,
    totalDuration: '1s 10dk',
    co2SavingsPercent: 18,
  },
  {
    id: 'f-dom-4',
    flightNumber: 'TK2320',
    airlineName: 'Aviqora Flagship',
    departureAirportCode: 'IST',
    departureAirportName: 'İstanbul Havalimanı',
    arrivalAirportCode: 'ADB',
    arrivalAirportName: 'İzmir Adnan Menderes Havalimanı',
    departureTime: '2026-09-25T16:45:00.000Z',
    arrivalTime: '2026-09-25T17:55:00.000Z',
    priceAmount: 980,
    priceCurrency: 'TRY',
    aircraftModel: 'Boeing 787-9 Dreamliner',
    availableSeatsCount: 62,
    isDirect: true,
    stopsCount: 0,
    totalDuration: '1s 10dk',
    co2SavingsPercent: 20,
  },
  {
    id: 'f-dom-5',
    flightNumber: 'TK2602',
    airlineName: 'Aviqora Anatolia',
    departureAirportCode: 'IST',
    departureAirportName: 'İstanbul Havalimanı',
    arrivalAirportCode: 'GZT',
    arrivalAirportName: 'Gaziantep Havalimanı',
    departureTime: '2026-09-25T08:00:00.000Z',
    arrivalTime: '2026-09-25T09:40:00.000Z',
    priceAmount: 1250,
    priceCurrency: 'TRY',
    aircraftModel: 'Airbus A320neo',
    availableSeatsCount: 29,
    isDirect: true,
    stopsCount: 0,
    totalDuration: '1s 40dk',
    co2SavingsPercent: 14,
  },
  {
    id: 'f-dom-6',
    flightNumber: 'VF3040',
    airlineName: 'Aviqora Express',
    departureAirportCode: 'SAW',
    departureAirportName: 'Sabiha Gökçen Havalimanı',
    arrivalAirportCode: 'GZT',
    arrivalAirportName: 'Gaziantep Havalimanı',
    departureTime: '2026-09-25T14:20:00.000Z',
    arrivalTime: '2026-09-25T16:00:00.000Z',
    priceAmount: 1150,
    priceCurrency: 'TRY',
    aircraftModel: 'Boeing 737 MAX 8',
    availableSeatsCount: 40,
    isDirect: true,
    stopsCount: 0,
    totalDuration: '1s 40dk',
    co2SavingsPercent: 16,
  },
  {
    id: 'f-dom-7',
    flightNumber: 'TK2410',
    airlineName: 'Aviqora Sun',
    departureAirportCode: 'IST',
    departureAirportName: 'İstanbul Havalimanı',
    arrivalAirportCode: 'AYT',
    arrivalAirportName: 'Antalya Havalimanı',
    departureTime: '2026-09-25T10:15:00.000Z',
    arrivalTime: '2026-09-25T11:35:00.000Z',
    priceAmount: 1100,
    priceCurrency: 'TRY',
    aircraftModel: 'Airbus A330-300',
    availableSeatsCount: 75,
    isDirect: true,
    stopsCount: 0,
    totalDuration: '1s 20dk',
    co2SavingsPercent: 12,
  },
  {
    id: 'f-dom-8',
    flightNumber: 'TK2832',
    airlineName: 'Aviqora BlackSea',
    departureAirportCode: 'SAW',
    departureAirportName: 'Sabiha Gökçen Havalimanı',
    arrivalAirportCode: 'TZX',
    arrivalAirportName: 'Trabzon Havalimanı',
    departureTime: '2026-09-25T12:30:00.000Z',
    arrivalTime: '2026-09-25T14:15:00.000Z',
    priceAmount: 1320,
    priceCurrency: 'TRY',
    aircraftModel: 'Boeing 737-800',
    availableSeatsCount: 22,
    isDirect: true,
    stopsCount: 0,
    totalDuration: '1s 45dk',
    co2SavingsPercent: 11,
  },
  {
    id: 'f-dom-9',
    flightNumber: 'TK2516',
    airlineName: 'Aviqora Riviera',
    departureAirportCode: 'IST',
    departureAirportName: 'İstanbul Havalimanı',
    arrivalAirportCode: 'BJV',
    arrivalAirportName: 'Milas-Bodrum Havalimanı',
    departureTime: '2026-09-25T15:00:00.000Z',
    arrivalTime: '2026-09-25T16:15:00.000Z',
    priceAmount: 1450,
    priceCurrency: 'TRY',
    aircraftModel: 'Airbus A321neo',
    availableSeatsCount: 36,
    isDirect: true,
    stopsCount: 0,
    totalDuration: '1s 15dk',
    co2SavingsPercent: 19,
  },
  {
    id: 'f-dom-10',
    flightNumber: 'TK2460',
    airlineName: 'Aviqora South',
    departureAirportCode: 'SAW',
    departureAirportName: 'Sabiha Gökçen Havalimanı',
    arrivalAirportCode: 'ADA',
    arrivalAirportName: 'Adana Şakirpaşa Havalimanı',
    departureTime: '2026-09-25T17:30:00.000Z',
    arrivalTime: '2026-09-25T19:05:00.000Z',
    priceAmount: 1050,
    priceCurrency: 'TRY',
    aircraftModel: 'Boeing 737 MAX 8',
    availableSeatsCount: 50,
    isDirect: true,
    stopsCount: 0,
    totalDuration: '1s 35dk',
    co2SavingsPercent: 15,
  },
  {
    id: 'f-dom-11',
    flightNumber: 'TK2562',
    airlineName: 'Aviqora Coast',
    departureAirportCode: 'IST',
    departureAirportName: 'İstanbul Havalimanı',
    arrivalAirportCode: 'DLM',
    arrivalAirportName: 'Dalaman Havalimanı',
    departureTime: '2026-09-25T19:15:00.000Z',
    arrivalTime: '2026-09-25T20:35:00.000Z',
    priceAmount: 1380,
    priceCurrency: 'TRY',
    aircraftModel: 'Airbus A320',
    availableSeatsCount: 31,
    isDirect: true,
    stopsCount: 0,
    totalDuration: '1s 20dk',
    co2SavingsPercent: 13,
  },
  {
    id: 'f-dom-12',
    flightNumber: 'VF4010',
    airlineName: 'Aviqora Capital',
    departureAirportCode: 'ESB',
    departureAirportName: 'Ankara Esenboğa Havalimanı',
    arrivalAirportCode: 'ADB',
    arrivalAirportName: 'İzmir Adnan Menderes Havalimanı',
    departureTime: '2026-09-25T08:45:00.000Z',
    arrivalTime: '2026-09-25T10:00:00.000Z',
    priceAmount: 820,
    priceCurrency: 'TRY',
    aircraftModel: 'Boeing 737-800',
    availableSeatsCount: 44,
    isDirect: true,
    stopsCount: 0,
    totalDuration: '1s 15dk',
    co2SavingsPercent: 12,
  },
  {
    id: 'f-dom-13',
    flightNumber: 'VF4025',
    airlineName: 'Aviqora Capital',
    departureAirportCode: 'ADB',
    departureAirportName: 'İzmir Adnan Menderes Havalimanı',
    arrivalAirportCode: 'ESB',
    arrivalAirportName: 'Ankara Esenboğa Havalimanı',
    departureTime: '2026-09-25T18:30:00.000Z',
    arrivalTime: '2026-09-25T19:45:00.000Z',
    priceAmount: 820,
    priceCurrency: 'TRY',
    aircraftModel: 'Boeing 737-800',
    availableSeatsCount: 38,
    isDirect: true,
    stopsCount: 0,
    totalDuration: '1s 15dk',
    co2SavingsPercent: 12,
  },
  {
    id: 'f-dom-14',
    flightNumber: 'TK2115',
    airlineName: 'Aviqora Shuttle',
    departureAirportCode: 'ESB',
    departureAirportName: 'Ankara Esenboğa Havalimanı',
    arrivalAirportCode: 'IST',
    arrivalAirportName: 'İstanbul Havalimanı',
    departureTime: '2026-09-25T20:15:00.000Z',
    arrivalTime: '2026-09-25T21:25:00.000Z',
    priceAmount: 890,
    priceCurrency: 'TRY',
    aircraftModel: 'Airbus A321neo',
    availableSeatsCount: 52,
    isDirect: true,
    stopsCount: 0,
    totalDuration: '1s 10dk',
    co2SavingsPercent: 16,
  },
  {
    id: 'f-dom-15',
    flightNumber: 'TK2605',
    airlineName: 'Aviqora Anatolia',
    departureAirportCode: 'GZT',
    departureAirportName: 'Gaziantep Havalimanı',
    arrivalAirportCode: 'IST',
    arrivalAirportName: 'İstanbul Havalimanı',
    departureTime: '2026-09-25T21:00:00.000Z',
    arrivalTime: '2026-09-25T22:45:00.000Z',
    priceAmount: 1250,
    priceCurrency: 'TRY',
    aircraftModel: 'Airbus A320neo',
    availableSeatsCount: 26,
    isDirect: true,
    stopsCount: 0,
    totalDuration: '1s 45dk',
    co2SavingsPercent: 14,
  },

  // --- YURT DIŞI UÇUŞLAR (INTERNATIONAL FLIGHTS) ---
  {
    id: '11111111-1111-1111-1111-111111111111',
    flightNumber: 'TK1984',
    airlineName: 'Aviqora Express',
    departureAirportCode: 'IST',
    departureAirportName: 'İstanbul Havalimanı',
    arrivalAirportCode: 'BER',
    arrivalAirportName: 'Berlin Brandenburg Airport',
    departureTime: '2026-09-25T08:30:00.000Z',
    arrivalTime: '2026-09-25T11:30:00.000Z',
    priceAmount: 3450,
    priceCurrency: 'TRY',
    aircraftModel: 'Boeing 787-9 Dreamliner',
    availableSeatsCount: 42,
    isDirect: true,
    stopsCount: 0,
    totalDuration: '3s 00dk',
    co2SavingsPercent: 18,
  },
  {
    id: '11111111-2222-1111-1111-111111111111',
    flightNumber: 'LH2045',
    airlineName: 'Star Partner Airways',
    departureAirportCode: 'IST',
    departureAirportName: 'İstanbul Havalimanı',
    arrivalAirportCode: 'BER',
    arrivalAirportName: 'Berlin Brandenburg Airport',
    departureTime: '2026-09-25T13:15:00.000Z',
    arrivalTime: '2026-09-25T18:45:00.000Z',
    priceAmount: 2980,
    priceCurrency: 'TRY',
    aircraftModel: 'Airbus A321neo',
    availableSeatsCount: 14,
    isDirect: false,
    stopsCount: 1,
    layoverAirportCode: 'MUC',
    layoverCityName: 'Münih',
    layoverDuration: '1s 35dk',
    totalDuration: '5s 30dk',
    co2SavingsPercent: 12,
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    flightNumber: 'VF2026',
    airlineName: 'Aviqora Premium',
    departureAirportCode: 'SAW',
    departureAirportName: 'Sabiha Gökçen Havalimanı',
    arrivalAirportCode: 'LHR',
    arrivalAirportName: 'London Heathrow Airport',
    departureTime: '2026-09-26T10:00:00.000Z',
    arrivalTime: '2026-09-26T14:00:00.000Z',
    priceAmount: 4200,
    priceCurrency: 'TRY',
    aircraftModel: 'Airbus A350-900',
    availableSeatsCount: 38,
    isDirect: true,
    stopsCount: 0,
    totalDuration: '4s 00dk',
    co2SavingsPercent: 22,
  },
  {
    id: '22222222-3333-2222-2222-222222222222',
    flightNumber: 'AF1420',
    airlineName: 'GlobalConnect',
    departureAirportCode: 'SAW',
    departureAirportName: 'Sabiha Gökçen Havalimanı',
    arrivalAirportCode: 'LHR',
    arrivalAirportName: 'London Heathrow Airport',
    departureTime: '2026-09-26T15:00:00.000Z',
    arrivalTime: '2026-09-26T21:00:00.000Z',
    priceAmount: 3850,
    priceCurrency: 'TRY',
    aircraftModel: 'Boeing 737 MAX 8',
    availableSeatsCount: 9,
    isDirect: false,
    stopsCount: 1,
    layoverAirportCode: 'CDG',
    layoverCityName: 'Paris',
    layoverDuration: '1s 50dk',
    totalDuration: '6s 00dk',
    co2SavingsPercent: 8,
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    flightNumber: 'TK1821',
    airlineName: 'Aviqora Flagship',
    departureAirportCode: 'IST',
    departureAirportName: 'İstanbul Havalimanı',
    arrivalAirportCode: 'CDG',
    arrivalAirportName: 'Paris Charles de Gaulle Airport',
    departureTime: '2026-09-27T09:00:00.000Z',
    arrivalTime: '2026-09-27T12:45:00.000Z',
    priceAmount: 4850,
    priceCurrency: 'TRY',
    aircraftModel: 'Boeing 777-300ER',
    availableSeatsCount: 40,
    isDirect: true,
    stopsCount: 0,
    totalDuration: '3s 45dk',
    co2SavingsPercent: 15,
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    flightNumber: 'TK0001',
    airlineName: 'Aviqora Transatlantic',
    departureAirportCode: 'IST',
    departureAirportName: 'İstanbul Havalimanı',
    arrivalAirportCode: 'JFK',
    arrivalAirportName: 'New York John F. Kennedy Int.',
    departureTime: '2026-09-28T14:00:00.000Z',
    arrivalTime: '2026-09-28T23:30:00.000Z',
    priceAmount: 18900,
    priceCurrency: 'TRY',
    aircraftModel: 'Airbus A350-1000',
    availableSeatsCount: 28,
    isDirect: true,
    stopsCount: 0,
    totalDuration: '11s 30dk',
    co2SavingsPercent: 20,
  },
  {
    id: 'f-int-7',
    flightNumber: 'EK0122',
    airlineName: 'Emirates Partner',
    departureAirportCode: 'SAW',
    departureAirportName: 'Sabiha Gökçen Havalimanı',
    arrivalAirportCode: 'DXB',
    arrivalAirportName: 'Dubai International Airport',
    departureTime: '2026-09-27T19:30:00.000Z',
    arrivalTime: '2026-09-28T01:10:00.000Z',
    priceAmount: 7800,
    priceCurrency: 'TRY',
    aircraftModel: 'Boeing 777-300ER',
    availableSeatsCount: 35,
    isDirect: true,
    stopsCount: 0,
    totalDuration: '4s 40dk',
    co2SavingsPercent: 16,
  },
  {
    id: 'f-int-8',
    flightNumber: 'KL1604',
    airlineName: 'Aviqora Global',
    departureAirportCode: 'IST',
    departureAirportName: 'İstanbul Havalimanı',
    arrivalAirportCode: 'AMS',
    arrivalAirportName: 'Amsterdam Airport Schiphol',
    departureTime: '2026-09-27T11:15:00.000Z',
    arrivalTime: '2026-09-27T14:50:00.000Z',
    priceAmount: 5120,
    priceCurrency: 'TRY',
    aircraftModel: 'Airbus A321neo',
    availableSeatsCount: 44,
    isDirect: true,
    stopsCount: 0,
    totalDuration: '3s 35dk',
    co2SavingsPercent: 17,
  },
  {
    id: 'f-int-9',
    flightNumber: 'TK0198',
    airlineName: 'Aviqora Pacific',
    departureAirportCode: 'IST',
    departureAirportName: 'İstanbul Havalimanı',
    arrivalAirportCode: 'HND',
    arrivalAirportName: 'Tokyo Haneda Airport',
    departureTime: '2026-09-28T02:20:00.000Z',
    arrivalTime: '2026-09-28T19:50:00.000Z',
    priceAmount: 24500,
    priceCurrency: 'TRY',
    aircraftModel: 'Boeing 787-9 Dreamliner',
    availableSeatsCount: 22,
    isDirect: true,
    stopsCount: 0,
    totalDuration: '11s 30dk',
    co2SavingsPercent: 24,
  },
  {
    id: 'f-int-10',
    flightNumber: 'LH1302',
    airlineName: 'Star Partner Airways',
    departureAirportCode: 'IST',
    departureAirportName: 'İstanbul Havalimanı',
    arrivalAirportCode: 'FRA',
    arrivalAirportName: 'Frankfurt Airport',
    departureTime: '2026-09-27T16:00:00.000Z',
    arrivalTime: '2026-09-27T18:15:00.000Z',
    priceAmount: 4150,
    priceCurrency: 'TRY',
    aircraftModel: 'Airbus A320neo',
    availableSeatsCount: 30,
    isDirect: true,
    stopsCount: 0,
    totalDuration: '3s 15dk',
    co2SavingsPercent: 14,
  },
  {
    id: 'f-int-11',
    flightNumber: 'AZ0704',
    airlineName: 'Aviqora Europe',
    departureAirportCode: 'SAW',
    departureAirportName: 'Sabiha Gökçen Havalimanı',
    arrivalAirportCode: 'FCO',
    arrivalAirportName: 'Rome Leonardo da Vinci Fiumicino',
    departureTime: '2026-09-27T08:30:00.000Z',
    arrivalTime: '2026-09-27T10:15:00.000Z',
    priceAmount: 3950,
    priceCurrency: 'TRY',
    aircraftModel: 'Airbus A320',
    availableSeatsCount: 48,
    isDirect: true,
    stopsCount: 0,
    totalDuration: '2s 45dk',
    co2SavingsPercent: 15,
  },
  {
    id: 'f-int-12',
    flightNumber: 'LX2100',
    airlineName: 'Swiss Partner',
    departureAirportCode: 'IST',
    departureAirportName: 'İstanbul Havalimanı',
    arrivalAirportCode: 'ZRH',
    arrivalAirportName: 'Zurich Airport',
    departureTime: '2026-09-27T14:40:00.000Z',
    arrivalTime: '2026-09-27T16:35:00.000Z',
    priceAmount: 5600,
    priceCurrency: 'TRY',
    aircraftModel: 'Airbus A330-300',
    availableSeatsCount: 33,
    isDirect: true,
    stopsCount: 0,
    totalDuration: '2s 55dk',
    co2SavingsPercent: 18,
  },
  {
    id: 'f-int-13',
    flightNumber: 'OS0842',
    airlineName: 'Austrian Partner',
    departureAirportCode: 'IST',
    departureAirportName: 'İstanbul Havalimanı',
    arrivalAirportCode: 'VIE',
    arrivalAirportName: 'Vienna International Airport',
    departureTime: '2026-09-27T18:00:00.000Z',
    arrivalTime: '2026-09-27T19:25:00.000Z',
    priceAmount: 3780,
    priceCurrency: 'TRY',
    aircraftModel: 'Boeing 737 MAX 8',
    availableSeatsCount: 55,
    isDirect: true,
    stopsCount: 0,
    totalDuration: '2s 25dk',
    co2SavingsPercent: 16,
  },
  {
    id: 'f-int-14',
    flightNumber: 'QR0240',
    airlineName: 'Qatar Partner',
    departureAirportCode: 'SAW',
    departureAirportName: 'Sabiha Gökçen Havalimanı',
    arrivalAirportCode: 'DOH',
    arrivalAirportName: 'Doha Hamad International',
    departureTime: '2026-09-28T13:30:00.000Z',
    arrivalTime: '2026-09-28T17:45:00.000Z',
    priceAmount: 8400,
    priceCurrency: 'TRY',
    aircraftModel: 'Airbus A350-900',
    availableSeatsCount: 40,
    isDirect: true,
    stopsCount: 0,
    totalDuration: '4s 15dk',
    co2SavingsPercent: 21,
  },
  {
    id: 'f-int-15',
    flightNumber: 'IB3190',
    airlineName: 'Aviqora Europe',
    departureAirportCode: 'IST',
    departureAirportName: 'İstanbul Havalimanı',
    arrivalAirportCode: 'MAD',
    arrivalAirportName: 'Adolfo Suárez Madrid-Barajas',
    departureTime: '2026-09-28T10:00:00.000Z',
    arrivalTime: '2026-09-28T13:20:00.000Z',
    priceAmount: 6200,
    priceCurrency: 'TRY',
    aircraftModel: 'Airbus A321neo',
    availableSeatsCount: 37,
    isDirect: true,
    stopsCount: 0,
    totalDuration: '4s 20dk',
    co2SavingsPercent: 19,
  }
];

const generateMockSeats = (flightId: string): SeatDto[] => {
  const seats: SeatDto[] = [];
  const rows = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
  const cols = ['A', 'B', 'C', 'D'];

  rows.forEach((row, idx) => {
    cols.forEach((col) => {
      const code = `${row}${col}`;
      const isBusiness = idx < 2;
      const isOcc = (parseInt(row) + col.charCodeAt(0)) % 5 === 0;
      seats.push({
        id: `${flightId}-${code}`,
        seatCode: code,
        seatClass: isBusiness ? 'Business' : 'Economy',
        isAvailable: !isOcc,
        status: isOcc ? 'Occupied' : 'Available',
        priceAmount: isBusiness ? 4500 : 1450,
        priceCurrency: 'TRY',
      });
    });
  });
  return seats;
};

const getStoredFlights = (): FlightDto[] => {
  if (typeof window === 'undefined') return [...MOCK_FLIGHTS];
  try {
    const raw = localStorage.getItem('aviqora_flights_store');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // Fallback
  }
  return [...MOCK_FLIGHTS];
};

const saveStoredFlights = (flights: FlightDto[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('aviqora_flights_store', JSON.stringify(flights));
  } catch {
    // Fallback
  }
};

// In-memory cache for mock bookings and check-in status persistence
const MOCK_BOOKINGS_CACHE = new Map<string, BookingDto>();

export function getAirlineLogoUrl(airlineName?: string, logoUrlFromApi?: string): string {
  if (logoUrlFromApi && logoUrlFromApi.startsWith('http')) {
    return logoUrlFromApi;
  }
  const name = (airlineName || '').toLowerCase();
  if (name.includes('turkish') || name.includes('thy') || name.includes('türk hava')) {
    return 'https://www.gstatic.com/flights/airline_logos/70px/TK.png';
  }
  if (name.includes('sunexpress') || name.includes('sun express')) {
    return 'https://www.gstatic.com/flights/airline_logos/70px/XQ.png';
  }
  if (name.includes('lufthansa')) {
    return 'https://www.gstatic.com/flights/airline_logos/70px/LH.png';
  }
  if (name.includes('pegasus')) {
    return 'https://www.gstatic.com/flights/airline_logos/70px/PC.png';
  }
  if (name.includes('ajet') || name.includes('anadolu')) {
    return 'https://www.gstatic.com/flights/airline_logos/70px/VF.png';
  }
  if (name.includes('emirates')) {
    return 'https://www.gstatic.com/flights/airline_logos/70px/EK.png';
  }
  if (name.includes('qatar')) {
    return 'https://www.gstatic.com/flights/airline_logos/70px/QR.png';
  }
  if (name.includes('air france') || name.includes('globalconnect')) {
    return 'https://www.gstatic.com/flights/airline_logos/70px/AF.png';
  }
  if (name.includes('swiss')) {
    return 'https://www.gstatic.com/flights/airline_logos/70px/LX.png';
  }
  if (name.includes('austrian')) {
    return 'https://www.gstatic.com/flights/airline_logos/70px/OS.png';
  }
  if (name.includes('klm')) {
    return 'https://www.gstatic.com/flights/airline_logos/70px/KL.png';
  }
  return 'https://www.gstatic.com/flights/airline_logos/70px/TK.png';
}

class ApiClient {
  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('aviqora_token');
    }
    return null;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        let errorMessage = `HTTP Hata: ${response.status} ${response.statusText}`;
        try {
          const errorData: ApiErrorResponse = await response.json();
          if (errorData.detail) errorMessage = errorData.detail;
          else if (errorData.title) errorMessage = errorData.title;
        } catch {
          // Fallback
        }
        throw new Error(errorMessage);
      }

      if (response.status === 204) return {} as T;
      return await response.json();
    } catch (err: unknown) {
      // If server is not responding or network error occurred, fallback gracefully
      console.warn(`[AVIQORA API] Connection fallback triggered for ${endpoint}:`, err);
      return this.handleFallback<T>(endpoint, options);
    }
  }

  private handleFallback<T>(endpoint: string, options: RequestInit): T {
    if (endpoint.startsWith('/flights/search') || endpoint === '/flights') {
      const url = new URL(`http://dummy${endpoint}`);
      const from = url.searchParams.get('fromCode')?.toUpperCase();
      const to = url.searchParams.get('toCode')?.toUpperCase();
      const date = url.searchParams.get('departureDate');

      let currentFlights = getStoredFlights();
      let filtered = [...currentFlights];
      if (from) filtered = filtered.filter((f) => f.departureAirportCode === from);
      if (to) filtered = filtered.filter((f) => f.arrivalAirportCode === to);

      if (date) {
        const searchDateStr = date.split('T')[0];
        const searchDate = new Date(searchDateStr);
        if (!isNaN(searchDate.getTime())) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          if (searchDate < today) {
            return [] as unknown as T;
          }

          // Exact date matching: filter flights scheduled for searchDateStr (or mock flights shifted to searchDateStr)
          filtered = filtered.filter((flight) => {
            const flightDateStr = flight.departureTime.split('T')[0];
            return flightDateStr === searchDateStr;
          });
        }
      }

      return filtered as unknown as T;
    }

    if (endpoint.includes('/seats')) {
      const flightId = endpoint.split('/')[2];
      return generateMockSeats(flightId) as unknown as T;
    }

    if (endpoint === '/auth/login') {
      const body = JSON.parse((options.body as string) || '{}');
      return {
        token: 'mock-jwt-token-aviqora-secure',
        email: body.email || 'demo@aviqora.com',
        fullName: 'Kaptan Pilot Ahmet',
        role: 'Passenger',
      } as unknown as T;
    }

    if (endpoint === '/auth/register') {
      const body = JSON.parse((options.body as string) || '{}');
      return {
        token: 'mock-jwt-token-aviqora-secure',
        email: body.email,
        fullName: body.fullName || 'Sayın Yolcu',
        role: 'Passenger',
      } as unknown as T;
    }

    if (endpoint === '/bookings' && options.method === 'POST') {
      const body = JSON.parse((options.body as string) || '{}');
      const flight = MOCK_FLIGHTS.find((f) => f.id === body.flightId) || MOCK_FLIGHTS[0];
      const pnr = `AVQ${Math.floor(100 + Math.random() * 899)}`;
      const rawPassengers = body.passengers && body.passengers.length > 0
        ? body.passengers
        : [{ firstName: 'Ahmet', lastName: 'Yılmaz', identityNumber: '10000000000', seatCode: 'Atanmadı (Check-in Sırasında ₺0 Otomatik Atanacak)' }];

      const mappedPassengers = rawPassengers.map((px: { firstName?: string; lastName?: string; identityNumber?: string; seatCode?: string }) => ({
        passengerName: `${px.firstName || ''} ${px.lastName || ''}`.trim() || 'Misafir Yolcu',
        identityNumber: px.identityNumber && px.identityNumber.length >= 5
          ? px.identityNumber.substring(0, 3) + '******' + px.identityNumber.slice(-2)
          : '100******00',
        seatCode: px.seatCode || 'Atanmadı (Check-in Sırasında ₺0 Otomatik Atanacak)',
      }));

      return {
        id: `bkg-${Date.now()}`,
        pnrCode: pnr,
        flightNumber: flight.flightNumber,
        departureAirport: flight.departureAirportCode,
        arrivalAirport: flight.arrivalAirportCode,
        departureTime: flight.departureTime,
        status: 'Confirmed',
        totalAmount: body.totalAmount || flight.priceAmount,
        currency: flight.priceCurrency,
        createdAt: new Date().toISOString(),
        boardingGate: 'Gate B14',
        terminal: 'Terminal 1',
        baggageAllowance: body.baggageAllowance || '15 kg Uçak Altı + Kabin Bagajı',
        extraServices: body.extraServices || [],
        passengers: mappedPassengers,
      } as unknown as T;
    }

    if (endpoint.includes('/check-in')) {
      const pnrKey = endpoint.split('/')[2].toUpperCase();
      const body = JSON.parse((options.body as string) || '{}');
      const existing = MOCK_BOOKINGS_CACHE.get(pnrKey);

      const checkedInBooking: BookingDto = {
        id: existing?.id || `bkg-${pnrKey}`,
        pnrCode: pnrKey,
        flightNumber: existing?.flightNumber || 'TK1984',
        departureAirport: existing?.departureAirport || 'IST',
        arrivalAirport: existing?.arrivalAirport || 'BER',
        departureTime: existing?.departureTime || new Date(Date.now() + 86400000).toISOString(),
        status: 'CheckedIn',
        totalAmount: existing?.totalAmount || 1450,
        currency: existing?.currency || 'TRY',
        createdAt: existing?.createdAt || new Date().toISOString(),
        boardingGate: existing?.boardingGate || 'Gate B14',
        terminal: existing?.terminal || 'Terminal 1',
        mealPreference: body.mealPreference || 'Standart Uçuş İkramı (Ücretsiz)',
        isCheckedIn: true,
        passengers: existing?.passengers && existing.passengers.length > 0 ? existing.passengers : [
          {
            passengerName: 'Ahmet Yılmaz',
            identityNumber: '123******89',
            seatCode: '1C',
          },
        ],
      };
      MOCK_BOOKINGS_CACHE.set(pnrKey, checkedInBooking);
      return checkedInBooking as unknown as T;
    }

    if (endpoint.includes('/cancel')) {
      const pnrKey = endpoint.split('/')[2].toUpperCase();
      const cancelledBooking: BookingDto = {
        id: `bkg-${pnrKey}`,
        pnrCode: pnrKey,
        flightNumber: 'TK1984',
        departureAirport: 'IST',
        arrivalAirport: 'BER',
        departureTime: new Date(Date.now() + 86400000).toISOString(),
        status: 'Cancelled',
        totalAmount: 1850,
        refundAmount: 1572,
        kdvAmount: 308,
        currency: 'TRY',
        createdAt: new Date().toISOString(),
        cancelledAt: new Date().toISOString(),
        boardingGate: 'Gate B14',
        terminal: 'Terminal 1',
        passengers: [
          {
            passengerName: 'Ahmet Yılmaz',
            identityNumber: '123******89',
            seatCode: '1C',
          },
        ],
      };
      MOCK_BOOKINGS_CACHE.set(pnrKey, cancelledBooking);
      return cancelledBooking as unknown as T;
    }

    if (endpoint.startsWith('/bookings/')) {
      const pnrKey = endpoint.split('/')[2].toUpperCase();
      if (MOCK_BOOKINGS_CACHE.has(pnrKey)) {
        return MOCK_BOOKINGS_CACHE.get(pnrKey) as unknown as T;
      }

      const defaultBooking: BookingDto = {
        id: `bkg-${pnrKey}`,
        pnrCode: pnrKey,
        flightNumber: 'TK1984',
        departureAirport: 'IST',
        arrivalAirport: 'BER',
        departureTime: new Date(Date.now() + 86400000).toISOString(),
        status: 'Confirmed',
        totalAmount: 1450,
        currency: 'TRY',
        createdAt: new Date().toISOString(),
        boardingGate: 'Gate B14',
        terminal: 'Terminal 1',
        passengers: [
          {
            passengerName: 'Ahmet Yılmaz',
            identityNumber: '123******89',
            seatCode: '1C',
          },
        ],
      };
      MOCK_BOOKINGS_CACHE.set(pnrKey, defaultBooking);
      return defaultBooking as unknown as T;
    }

    if (endpoint === '/flights' && options.method === 'POST') {
      const body = JSON.parse((options.body as string) || '{}');
      const flights = getStoredFlights();
      const newFlight: FlightDto = {
        id: body.id || `flight-${Date.now()}`,
        flightNumber: body.flightNumber || 'AVQ-999',
        departureAirportCode: body.departureAirportCode || 'IST',
        departureAirportName: body.departureAirportName || 'İstanbul Havalimanı',
        arrivalAirportCode: body.arrivalAirportCode || 'BER',
        arrivalAirportName: body.arrivalAirportName || 'Berlin Brandenburg',
        departureTime: body.departureTime || new Date(Date.now() + 172800000).toISOString(),
        arrivalTime: body.arrivalTime || new Date(Date.now() + 183600000).toISOString(),
        priceAmount: body.priceAmount || 1450,
        priceCurrency: body.priceCurrency || 'TRY',
        aircraftModel: body.aircraftModel || 'Boeing 787-9 Dreamliner',
        availableSeatsCount: body.availableSeatsCount || 180,
        airlineName: body.airlineName || 'Aviqora Flagship',
        isDirect: body.isDirect ?? true,
        status: body.status || 'Scheduled',
      };
      const updatedList = [newFlight, ...flights];
      saveStoredFlights(updatedList);
      return newFlight as unknown as T;
    }

    if (endpoint.startsWith('/flights/') && options.method === 'PUT') {
      const flightId = endpoint.split('/')[2];
      const body = JSON.parse((options.body as string) || '{}');
      const flights = getStoredFlights();
      const updatedList = flights.map((f) => {
        if (f.id === flightId) {
          return {
            ...f,
            status: body.status || f.status,
            delayMinutes: body.delayMinutes ?? f.delayMinutes,
            delayReason: body.delayReason || f.delayReason,
            gate: body.gate || f.gate,
          };
        }
        return f;
      });
      saveStoredFlights(updatedList);
      return (updatedList.find((f) => f.id === flightId) || {}) as unknown as T;
    }

    if (endpoint.startsWith('/flights/') && options.method === 'DELETE') {
      const flightId = endpoint.split('/')[2];
      const flights = getStoredFlights();
      const updatedList = flights.filter((f) => f.id !== flightId);
      saveStoredFlights(updatedList);
      return { success: true } as unknown as T;
    }

    if (endpoint === '/bookings' && options.method === 'GET') {
      const cachedBookings = Array.from(MOCK_BOOKINGS_CACHE.values());
      if (cachedBookings.length > 0) return cachedBookings as unknown as T;
      return [
        {
          id: 'bkg-AVQ9842',
          pnrCode: 'AVQ9842',
          flightNumber: 'TK1984',
          departureAirport: 'IST',
          arrivalAirport: 'BER',
          departureTime: new Date(Date.now() + 86400000).toISOString(),
          status: 'CheckedIn',
          totalAmount: 1450,
          currency: 'TRY',
          createdAt: new Date().toISOString(),
          boardingGate: 'Gate B14',
          terminal: 'Terminal 1',
          mealPreference: 'Standart Uçuş İkramı (Ücretsiz)',
          isCheckedIn: true,
          passengers: [{ passengerName: 'Ahmet Yılmaz', identityNumber: '123******89', seatCode: '1C' }],
        },
        {
          id: 'bkg-AVQ5521',
          pnrCode: 'AVQ5521',
          flightNumber: 'VF2026',
          departureAirport: 'SAW',
          arrivalAirport: 'LHR',
          departureTime: new Date(Date.now() + 172800000).toISOString(),
          status: 'Confirmed',
          totalAmount: 2200,
          currency: 'TRY',
          createdAt: new Date().toISOString(),
          boardingGate: 'Gate A04',
          terminal: 'Terminal 2',
          isCheckedIn: false,
          passengers: [{ passengerName: 'Zeynep Kaya', identityNumber: '456******12', seatCode: '4F' }],
        }
      ] as unknown as T;
    }

    if (endpoint.includes('/refund')) {
      const pnrKey = endpoint.split('/')[2].toUpperCase();
      const body = JSON.parse((options.body as string) || '{}');
      const existing = MOCK_BOOKINGS_CACHE.get(pnrKey);
      const refundedBooking: BookingDto = {
        id: existing?.id || `bkg-${pnrKey}`,
        pnrCode: pnrKey,
        flightNumber: existing?.flightNumber || 'TK1984',
        departureAirport: existing?.departureAirport || 'IST',
        arrivalAirport: existing?.arrivalAirport || 'BER',
        departureTime: existing?.departureTime || new Date(Date.now() + 86400000).toISOString(),
        status: 'Refunded',
        totalAmount: existing?.totalAmount || 1450,
        refundAmount: body.refundAmount || 1230,
        kdvAmount: body.kdvAmount || 220,
        cancelledAt: new Date().toISOString(),
        currency: existing?.currency || 'TRY',
        createdAt: existing?.createdAt || new Date().toISOString(),
        passengers: existing?.passengers || [{ passengerName: 'Ahmet Yılmaz', identityNumber: '123******89', seatCode: '1C' }],
      };
      MOCK_BOOKINGS_CACHE.set(pnrKey, refundedBooking);
      return refundedBooking as unknown as T;
    }

    if (endpoint === '/fleet' && options.method === 'POST') {
      const body = JSON.parse((options.body as string) || '{}');
      return body as unknown as T;
    }

    throw new Error('API bağlantısı kurulamadı ve fallback bulunamadı.');
  }

  public auth = {
    register: (data: RegisterRequestDto) =>
      this.request<AuthResponseDto>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    login: (data: LoginRequestDto) =>
      this.request<AuthResponseDto>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  };

  public flights = {
    getAllStoredFlights: () => getStoredFlights(),

    search: async (fromCode?: string, toCode?: string, date?: string) => {
      const params = new URLSearchParams();
      if (fromCode) params.append('fromCode', fromCode);
      if (toCode) params.append('toCode', toCode);
      if (date) params.append('departureDate', date);
      const queryString = params.toString();
      const raw = await this.request<any[]>(`/flights/search${queryString ? `?${queryString}` : ''}`);

      if (Array.isArray(raw)) {
        return raw.map((f: any) => {
          const aName = String(f.airlineName || f.AirlineName || 'Aviqora Airways');
          const logo = String(f.airlineLogoUrl || f.AirlineLogoUrl || f.airline_logo || getAirlineLogoUrl(aName));

          return {
            id: String(f.id || f.Id || `f-${Math.random()}`),
            flightNumber: String(f.flightNumber || f.FlightNumber || 'AVQ101'),
            departureAirportCode: String(f.departureAirportCode || f.originAirportCode || fromCode || 'IST'),
            departureAirportName: String(f.departureAirportName || f.originAirportCity || `${fromCode || 'IST'} Havalimanı`),
            arrivalAirportCode: String(f.arrivalAirportCode || f.destinationAirportCode || toCode || 'BER'),
            arrivalAirportName: String(f.arrivalAirportName || f.destinationAirportCity || `${toCode || 'BER'} Havalimanı`),
            departureTime: String(f.departureTime || f.DepartureTime || new Date().toISOString()),
            arrivalTime: String(f.arrivalTime || f.ArrivalTime || new Date().toISOString()),
            priceAmount: Number(f.priceAmount ?? f.basePriceAmount ?? 1450),
            priceCurrency: String(f.priceCurrency || f.currency || 'TRY'),
            aircraftModel: String(f.aircraftModel || f.aircraftType || 'Airbus A320neo'),
            availableSeatsCount: Number(f.availableSeatsCount ?? f.availableSeatCount ?? 42),
            airlineName: aName,
            airlineLogoUrl: logo,
            isDirect: f.isDirect ?? true,
            stopsCount: f.stopsCount ?? 0,
            totalDuration: f.totalDuration || '2s 15dk',
            co2SavingsPercent: f.co2SavingsPercent || 15,
          };
        }) as FlightDto[];
      }
      return raw as unknown as FlightDto[];
    },

    getSeats: (flightId: string) =>
      this.request<SeatDto[]>(`/flights/${flightId}/seats`),

    create: (data: Partial<FlightDto>) =>
      this.request<FlightDto>('/flights', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    updateStatus: (flightId: string, status: string, delayMinutes?: number, delayReason?: string, gate?: string) =>
      this.request<FlightDto>(`/flights/${flightId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, delayMinutes, delayReason, gate }),
      }),

    delete: (flightId: string) =>
      this.request<{ success: boolean }>(`/flights/${flightId}`, {
        method: 'DELETE',
      }),
  };

  public bookings = {
    getAll: () =>
      this.request<BookingDto[]>('/bookings'),

    create: (data: CreateBookingRequest) =>
      this.request<BookingDto>('/bookings', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getByPnr: (pnrCode: string) =>
      this.request<BookingDto>(`/bookings/${pnrCode}`),

    checkIn: (pnrCode: string, mealPreference: string) =>
      this.request<BookingDto>(`/bookings/${pnrCode}/check-in`, {
        method: 'POST',
        body: JSON.stringify({ mealPreference }),
      }),

    cancel: (pnrCode: string) =>
      this.request<BookingDto>(`/bookings/${pnrCode}/cancel`, {
        method: 'POST',
      }),

    refund: (pnrCode: string, refundAmount: number, reason: string) =>
      this.request<BookingDto>(`/bookings/${pnrCode}/refund`, {
        method: 'POST',
        body: JSON.stringify({ refundAmount, reason }),
      }),
  };

  public fleet = {
    create: (data: any) =>
      this.request<any>('/fleet', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  };

  public airports = {
    getAll: async () => {
      try {
        const result = await this.request<Array<{ code: string; name: string; city: string; country: string }>>('/airports');
        if (result && result.length > 0) return result;
      } catch {
        // Fallback to local AIRPORTS registry if C# API is unreachable
      }
      return AIRPORTS;
    },

    create: (data: { code: string; name: string; city: string; country: string }) =>
      this.request<{ id: string; code: string; name: string; city: string; country: string }>('/airports', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  };

  public ai = {
    copilotQuery: async (
      query: string,
      fromCode: string = 'IST',
      toCode: string = 'BER',
      history?: Array<{ role: string; content: string }>
    ) => {
      try {
        const res = await this.request<any>('/ai/copilot', {
          method: 'POST',
          body: JSON.stringify({ query, fromCode, toCode, history }),
        });
        if (res) return res;
      } catch {
        // Fallback handled in component
      }
      return null;
    },

    predictDelay: async (flightNumber: string = 'AVQ204', origin: string = 'IST', destination: string = 'BER') => {
      try {
        const res = await this.request<any>(`/ai/predict-delay?flightNumber=${flightNumber}&origin=${origin}&destination=${destination}`);
        if (res) return res;
      } catch {
        // Fallback
      }
      return null;
    },
  };
}

export const api = new ApiClient();


