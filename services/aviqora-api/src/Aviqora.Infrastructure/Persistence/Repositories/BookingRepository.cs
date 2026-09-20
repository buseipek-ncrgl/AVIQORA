using Aviqora.Application.Common.Interfaces;
using Aviqora.Domain.Entities;
using Aviqora.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;

namespace Aviqora.Infrastructure.Persistence.Repositories;

public class BookingRepository : IBookingRepository
{
    private readonly AviqoraDbContext _dbContext;

    public BookingRepository(AviqoraDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Booking?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Bookings
            .Include(b => b.Flight)
            .Include(b => b.BookingPassengers)
                .ThenInclude(bp => bp.Passenger)
            .Include(b => b.BookingPassengers)
                .ThenInclude(bp => bp.Seat)
            .FirstOrDefaultAsync(b => b.Id == id, cancellationToken);
    }

    public async Task<Booking?> GetByPnrAsync(string pnr, CancellationToken cancellationToken = default)
    {
        var pnrVo = new PNRCode(pnr);

        return await _dbContext.Bookings
            .Include(b => b.Flight)
            .Include(b => b.BookingPassengers)
                .ThenInclude(bp => bp.Passenger)
            .Include(b => b.BookingPassengers)
                .ThenInclude(bp => bp.Seat)
            .FirstOrDefaultAsync(b => b.PNR == pnrVo, cancellationToken);
    }

    public async Task AddAsync(Booking booking, CancellationToken cancellationToken = default)
    {
        await _dbContext.Bookings.AddAsync(booking, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(Booking booking, CancellationToken cancellationToken = default)
    {
        _dbContext.Bookings.Update(booking);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
