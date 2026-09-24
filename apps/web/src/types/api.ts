export interface AuthResponseDto {
  token: string;
  email: string;
  fullName: string;
  role: string;
}

export interface RegisterRequestDto {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface FlightDto {
  id: string;
  flightNumber: string;
  departureAirportCode: string;
  departureAirportName: string;
  arrivalAirportCode: string;
  arrivalAirportName: string;
  departureTime: string;
  arrivalTime: string;
  priceAmount: number;
  priceCurrency: string;
  aircraftModel: string;
  availableSeatsCount: number;
  airlineName?: string;
  airlineLogoUrl?: string;
  isDirect?: boolean;
  stopsCount?: number;
  layoverAirportCode?: string;
  layoverCityName?: string;
  layoverDuration?: string;
  totalDuration?: string;
  co2SavingsPercent?: number;
  status?: 'Scheduled' | 'Boarding' | 'GateClosed' | 'Taxi' | 'InAir' | 'Landed' | 'Delayed' | 'Cancelled';
  delayMinutes?: number;
  delayReason?: string;
  gate?: string;
  runway?: string;
  altitudeFt?: number;
  speedKnots?: number;
}

export interface SeatDto {
  id: string;
  seatCode: string;
  seatClass: string; // 'Business' | 'Economy'
  isAvailable: boolean;
  status: string; // 'Available' | 'Held' | 'Occupied'
  priceAmount: number;
  priceCurrency: string;
}

export interface BookingPassengerDto {
  passengerName: string;
  identityNumber: string;
  seatCode: string;
}

export interface BookingDto {
  id: string;
  pnrCode: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string;
  status: string; // 'Draft' | 'Held' | 'Confirmed' | 'CheckedIn' | 'Completed' | 'Cancelled' | 'Refunded'
  totalAmount: number;
  currency: string;
  createdAt: string;
  passengers: BookingPassengerDto[];
  boardingGate?: string;
  terminal?: string;
  mealPreference?: string;
  isCheckedIn?: boolean;
  baggageAllowance?: string;
  extraServices?: string[];
  kdvAmount?: number;
  refundAmount?: number;
  cancelledAt?: string;
}

export interface CreateBookingPassengerRequest {
  firstName: string;
  lastName: string;
  identityNumber: string;
  seatId: string;
  seatCode?: string;
  baggageAllowance?: string;
}

export interface CreateBookingRequest {
  flightId: string;
  passengers: CreateBookingPassengerRequest[];
  extraServices?: string[];
  baggageAllowance?: string;
  totalAmount?: number;
}

export interface ApiErrorResponse {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  errors?: Record<string, string[]>;
}
