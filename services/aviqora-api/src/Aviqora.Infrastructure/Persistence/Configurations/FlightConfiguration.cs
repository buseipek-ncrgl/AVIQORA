using Aviqora.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Aviqora.Infrastructure.Persistence.Configurations;

public class FlightConfiguration : IEntityTypeConfiguration<Flight>
{
    public void Configure(EntityTypeBuilder<Flight> builder)
    {
        builder.ToTable("flights");

        builder.HasKey(f => f.Id);

        builder.Property(f => f.FlightNumber)
            .IsRequired()
            .HasMaxLength(10);

        builder.HasIndex(f => f.FlightNumber);

        builder.Property(f => f.AircraftType)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(f => f.DepartureTime)
            .IsRequired();

        builder.Property(f => f.ArrivalTime)
            .IsRequired();

        // Money Value Object configuration (.NET 9 Complex Property)
        builder.ComplexProperty(f => f.BasePrice, priceBuilder =>
        {
            priceBuilder.Property(m => m.Amount)
                .HasColumnName("base_price_amount")
                .HasPrecision(18, 2)
                .IsRequired();

            priceBuilder.Property(m => m.Currency)
                .HasColumnName("base_price_currency")
                .HasMaxLength(3)
                .IsRequired();
        });

        // Relationships
        builder.HasOne(f => f.OriginAirport)
            .WithMany()
            .HasForeignKey(f => f.OriginAirportId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(f => f.DestinationAirport)
            .WithMany()
            .HasForeignKey(f => f.DestinationAirportId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(f => f.Seats)
            .WithOne(s => s.Flight)
            .HasForeignKey(s => s.FlightId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
