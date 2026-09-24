using Aviqora.Application.Common.Interfaces;
using Aviqora.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Aviqora.Infrastructure.Persistence.Repositories;

public class AirportRepository : IAirportRepository
{
    private readonly AviqoraDbContext _dbContext;

    public AirportRepository(AviqoraDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Airport?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Airports
            .FirstOrDefaultAsync(a => a.Code == code.ToUpperInvariant(), cancellationToken);
    }

    public async Task<List<Airport>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.Airports
            .OrderBy(a => a.City)
            .ThenBy(a => a.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Airport airport, CancellationToken cancellationToken = default)
    {
        await _dbContext.Airports.AddAsync(airport, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
