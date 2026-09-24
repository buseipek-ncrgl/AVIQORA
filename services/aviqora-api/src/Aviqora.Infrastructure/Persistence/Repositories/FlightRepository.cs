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
        var originUpper = originCode.ToUpperInvariant();
        var destUpper = destinationCode.ToUpperInvariant();

        var originAirport = await _dbContext.Airports.FirstOrDefaultAsync(a => a.Code == originUpper, cancellationToken);
        var destAirport = await _dbContext.Airports.FirstOrDefaultAsync(a => a.Code == destUpper, cancellationToken);

        if (originAirport == null || destAirport == null)
        {
            return new List<Flight>();
        }

        var startOfDay = DateTime.SpecifyKind(departureDate.Date, DateTimeKind.Utc);
        var endOfDay = startOfDay.AddDays(1).AddTicks(-1);

        var flightsOnDate = await _dbContext.Flights
            .Include(f => f.OriginAirport)
            .Include(f => f.DestinationAirport)
            .Include(f => f.Seats)
            .Where(f => f.OriginAirportId == originAirport.Id &&
                        f.DestinationAirportId == destAirport.Id &&
                        f.DepartureTime >= startOfDay && f.DepartureTime <= endOfDay)
            .ToListAsync(cancellationToken);

        if (flightsOnDate.Count > 0)
        {
            return flightsOnDate;
        }

        // Fallback: Return all flights for origin -> destination regardless of exact date
        return await _dbContext.Flights
            .Include(f => f.OriginAirport)
            .Include(f => f.DestinationAirport)
            .Include(f => f.Seats)
            .Where(f => f.OriginAirportId == originAirport.Id &&
                        f.DestinationAirportId == destAirport.Id)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Flight flight, CancellationToken cancellationToken = default)
    {
        await _dbContext.Flights.AddAsync(flight, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
