using Aviqora.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Aviqora.Infrastructure.Persistence;

/// <summary>
/// PostgreSQL veritabanı ile C# domain varlıklarımız arasındaki köprü (Source of Truth DbContext).
/// EF Core ORM mekanizmasını kullanarak sorguları SQL'e dönüştürür.
/// </summary>
public class AviqoraDbContext : DbContext
{
    public AviqoraDbContext(DbContextOptions<AviqoraDbContext> options) : base(options)
    {
    }

    public DbSet<Airport> Airports => Set<Airport>();
    public DbSet<Flight> Flights => Set<Flight>();
    public DbSet<Seat> Seats => Set<Seat>();
    public DbSet<Passenger> Passengers => Set<Passenger>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<BookingPassenger> BookingPassengers => Set<BookingPassenger>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Aviqora.Infrastructure assembly'si altındaki tüm IEntityTypeConfiguration sınıflarını otomatik bulur ve uygular!
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AviqoraDbContext).Assembly);
    }
}
