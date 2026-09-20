using Aviqora.Domain.Entities;
using Aviqora.Domain.Enums;
using Aviqora.Domain.ValueObjects;
using Xunit;

namespace Aviqora.UnitTests.Domain;

public class BookingLifecycleTests
{
    [Fact]
    public void NewBooking_ShouldStartInDraftStatus()
    {
        var flightId = Guid.NewGuid();
        var price = new Money(550m, "TRY");

        var booking = new Booking(flightId, price);

        Assert.Equal(BookingStatus.Draft, booking.Status);
        Assert.NotNull(booking.PNR.Value);
        Assert.Equal(6, booking.PNR.Value.Length);
    }

    [Fact]
    public void Hold_WhenDraft_ShouldTransitionToHeld()
    {
        var booking = new Booking(Guid.NewGuid(), new Money(500m, "TRY"));

        booking.Hold();

        Assert.Equal(BookingStatus.Held, booking.Status);
    }

    [Fact]
    public void Confirm_WhenHeld_ShouldTransitionToConfirmed()
    {
        var booking = new Booking(Guid.NewGuid(), new Money(500m, "TRY"));
        booking.Hold();

        booking.Confirm();

        Assert.Equal(BookingStatus.Confirmed, booking.Status);
    }

    [Fact]
    public void Confirm_WhenAlreadyCancelled_ShouldThrowInvalidOperationException()
    {
        var booking = new Booking(Guid.NewGuid(), new Money(500m, "TRY"));
        booking.Cancel();

        Assert.Throws<InvalidOperationException>(() => booking.Confirm());
    }
}
