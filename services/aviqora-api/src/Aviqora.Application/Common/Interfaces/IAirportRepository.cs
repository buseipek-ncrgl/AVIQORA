using Aviqora.Domain.Entities;

namespace Aviqora.Application.Common.Interfaces;

public interface IAirportRepository
{
    Task<Airport?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);
    Task<List<Airport>> GetAllAsync(CancellationToken cancellationToken = default);
    Task AddAsync(Airport airport, CancellationToken cancellationToken = default);
}
