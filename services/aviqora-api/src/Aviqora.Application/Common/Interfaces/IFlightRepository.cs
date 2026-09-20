using Aviqora.Domain.Entities;

namespace Aviqora.Application.Common.Interfaces;

public interface IFlightRepository
{
    Task<Flight?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Flight?> GetByIdWithSeatsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<Flight>> SearchFlightsAsync(string originCode, string destinationCode, DateTime departureDate, CancellationToken cancellationToken = default);
    Task AddAsync(Flight flight, CancellationToken cancellationToken = default);
}
