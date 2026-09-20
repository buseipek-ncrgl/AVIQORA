using Aviqora.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Aviqora.Infrastructure.Persistence.Configurations;

public class BookingPassengerConfiguration : IEntityTypeConfiguration<BookingPassenger>
{
    public void Configure(EntityTypeBuilder<BookingPassenger> builder)
    {
        builder.ToTable("booking_passengers");

        builder.HasKey(bp => bp.Id);

        builder.HasOne(bp => bp.Passenger)
            .WithMany()
            .HasForeignKey(bp => bp.PassengerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(bp => bp.Seat)
            .WithMany()
            .HasForeignKey(bp => bp.SeatId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
