using Aviqora.Domain.Entities;
using Aviqora.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Aviqora.Infrastructure.Persistence.Configurations;

public class BookingConfiguration : IEntityTypeConfiguration<Booking>
{
    public void Configure(EntityTypeBuilder<Booking> builder)
    {
        builder.ToTable("bookings");

        builder.HasKey(b => b.Id);

        // PNRCode Value Object conversion & unique constraint
        builder.Property(b => b.PNR)
            .HasConversion(
                pnr => pnr.Value,
                value => new PNRCode(value))
            .HasColumnName("pnr")
            .HasMaxLength(6)
            .IsRequired();

        builder.HasIndex(b => b.PNR)
            .IsUnique();

        builder.Property(b => b.Status)
            .HasConversion<string>()
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(b => b.CreatedAt)
            .IsRequired();

        builder.Property(b => b.ExpiresAt)
            .IsRequired();

        // Money Value Object configuration
        builder.ComplexProperty(b => b.TotalAmount, priceBuilder =>
        {
            priceBuilder.Property(m => m.Amount)
                .HasColumnName("total_amount")
                .HasPrecision(18, 2)
                .IsRequired();

            priceBuilder.Property(m => m.Currency)
                .HasColumnName("total_currency")
                .HasMaxLength(3)
                .IsRequired();
        });

        // Relationships
        builder.HasOne(b => b.Flight)
            .WithMany()
            .HasForeignKey(b => b.FlightId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(b => b.BookingPassengers)
            .WithOne(bp => bp.Booking)
            .HasForeignKey(bp => bp.BookingId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
