namespace Aviqora.Application.DTOs;

public record SeatDto(
    Guid Id,
    string SeatCode,
    string SeatClass,
    string Status,
    decimal PriceAmount,
    string Currency
);

public record FlightDto(
    Guid Id,
    string FlightNumber,
    string OriginAirportCode,
    string OriginAirportCity,
    string DestinationAirportCode,
    string DestinationAirportCity,
    DateTime DepartureTime,
    DateTime ArrivalTime,
    decimal BasePriceAmount,
    string Currency,
    string AircraftType,
    int AvailableSeatCount
);
