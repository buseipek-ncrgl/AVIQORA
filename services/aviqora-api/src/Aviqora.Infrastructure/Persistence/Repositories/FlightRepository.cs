using Aviqora.Application.Common.Interfaces;
using Aviqora.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Aviqora.Infrastructure.Persistence.Repositories;

public class FlightRepository : IFlightRepository
{
    private readonly AviqoraDbContext _dbContext;

    public FlightRepository(AviqoraDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Flight?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Flights
            .Include(f => f.OriginAirport)
            .Include(f => f.DestinationAirport)
            .FirstOrDefaultAsync(f => f.Id == id, cancellationToken);
    }

    public async Task<Flight?> GetByIdWithSeatsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Flights
            .Include(f => f.OriginAirport)
            .Include(f => f.DestinationAirport)
            .Include(f => f.Seats)
            .FirstOrDefaultAsync(f => f.Id == id, cancellationToken);
    }

    public async Task<List<Flight>> SearchFlightsAsync(
        string originCode,
        string destinationCode,
        DateTime departureDate,
        CancellationToken cancellationToken = default)
    {
        var startOfDay = departureDate.Date.ToUniversalTime();
        var endOfDay = startOfDay.AddDays(1).AddTicks(-1);

        return await _dbContext.Flights
            .Include(f => f.OriginAirport)
            .Include(f => f.DestinationAirport)
            .Include(f => f.Seats)
            .Where(f => f.OriginAirport != null && f.OriginAirport.Code == originCode.ToUpper() &&
                        f.DestinationAirport != null && f.DestinationAirport.Code == destinationCode.ToUpper() &&
                        f.DepartureTime >= startOfDay && f.DepartureTime <= endOfDay)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Flight flight, CancellationToken cancellationToken = default)
    {
        await _dbContext.Flights.AddAsync(flight, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
