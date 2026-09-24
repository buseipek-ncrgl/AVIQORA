namespace Aviqora.Application.DTOs;

public record AirportDto(
    Guid Id,
    string Code,
    string Name,
    string City,
    string Country
);

public record CreateAirportDto(
    string Code,
    string Name,
    string City,
    string Country
);
