using Aviqora.Domain.Enums;
using Aviqora.Domain.ValueObjects;

namespace Aviqora.Domain.Entities;

public class Booking
{
    public Guid Id { get; private set; }
    public PNRCode PNR { get; private set; }
    public Guid FlightId { get; private set; }
    public BookingStatus Status { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime ExpiresAt { get; private set; }
    public Money TotalAmount { get; private set; }

    public Flight? Flight { get; private set; }
    private readonly List<BookingPassenger> _bookingPassengers = new();
    public IReadOnlyCollection<BookingPassenger> BookingPassengers => _bookingPassengers.AsReadOnly();

    private Booking() { }

    public Booking(Guid flightId, Money totalAmount, int holdDurationMinutes = 10)
    {
        Id = Guid.NewGuid();
        PNR = PNRCode.Generate();
        FlightId = flightId;
        Status = BookingStatus.Draft;
        CreatedAt = DateTime.UtcNow;
        ExpiresAt = CreatedAt.AddMinutes(holdDurationMinutes);
        TotalAmount = totalAmount;
    }

    public void AddPassenger(Passenger passenger, Guid? seatId = null)
    {
        if (Status != BookingStatus.Draft && Status != BookingStatus.Held)
        {
            throw new InvalidOperationException($"Cannot add passenger when booking status is {Status}.");
        }

        _bookingPassengers.Add(new BookingPassenger(Id, passenger.Id, seatId));
    }

    public void Hold()
    {
        if (Status != BookingStatus.Draft)
        {
            throw new InvalidOperationException($"Cannot hold booking from status {Status}. Must be Draft.");
        }

        Status = BookingStatus.Held;
    }

    public void Confirm()
    {
        if (Status == BookingStatus.Cancelled || Status == BookingStatus.Expired)
        {
            throw new InvalidOperationException($"Cannot confirm booking that is {Status}.");
        }

        if (DateTime.UtcNow > ExpiresAt)
        {
            Status = BookingStatus.Expired;
            throw new InvalidOperationException("Booking hold has expired.");
        }

        Status = BookingStatus.Confirmed;
    }

    public void Cancel()
    {
        if (Status == BookingStatus.Cancelled)
        {
            throw new InvalidOperationException("Booking is already cancelled.");
        }

        Status = BookingStatus.Cancelled;
    }

    public void Expire()
    {
        if (Status == BookingStatus.Confirmed)
        {
            throw new InvalidOperationException("Cannot expire a confirmed booking.");
        }

        Status = BookingStatus.Expired;
    }
}
