using Aviqora.Application.DTOs;

namespace Aviqora.Application.Services;

public interface IFlightService
{
    Task<List<FlightDto>> SearchFlightsAsync(FlightSearchRequestDto request, CancellationToken cancellationToken = default);
    Task<List<SeatDto>> GetSeatsByFlightIdAsync(Guid flightId, CancellationToken cancellationToken = default);
    Task<FlightDto> CreateFlightAsync(FlightDto flightDto, CancellationToken cancellationToken = default);
}
