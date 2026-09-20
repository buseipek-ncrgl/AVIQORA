namespace Aviqora.Application.DTOs;

public record FlightSearchRequestDto(
    string OriginCode,
    string DestinationCode,
    DateTime DepartureDate
);

public record PassengerRequestDto(
    string FirstName,
    string LastName,
    string IdentityNumber,
    string Email,
    string PhoneNumber,
    Guid? SelectedSeatId
);

public record CreateBookingRequestDto(
    Guid FlightId,
    List<PassengerRequestDto> Passengers
);

public record BookingPassengerDto(
    Guid PassengerId,
    string FullName,
    string IdentityNumber,
    string? SeatCode
);

public record BookingResponseDto(
    Guid BookingId,
    string PNR,
    string Status,
    Guid FlightId,
    string FlightNumber,
    DateTime CreatedAt,
    DateTime ExpiresAt,
    decimal TotalAmount,
    string Currency,
    List<BookingPassengerDto> Passengers
);
