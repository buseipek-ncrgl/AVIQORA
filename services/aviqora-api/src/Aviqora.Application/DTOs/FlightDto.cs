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
    string DepartureAirportCode,
    string DepartureAirportName,
    string ArrivalAirportCode,
    string ArrivalAirportName,
    DateTime DepartureTime,
    DateTime ArrivalTime,
    decimal PriceAmount,
    string PriceCurrency,
    string AircraftModel,
    int AvailableSeatsCount,
    string AirlineName = "Aviqora Airways",
    string OriginAirportCode = "",
    string DestinationAirportCode = "",
    string AirlineLogoUrl = ""
);
