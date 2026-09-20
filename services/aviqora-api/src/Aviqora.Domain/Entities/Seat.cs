using Aviqora.Domain.Enums;
using Aviqora.Domain.ValueObjects;

namespace Aviqora.Domain.Entities;

public class Seat
{
    public Guid Id { get; private set; }
    public Guid FlightId { get; private set; }
    public string SeatCode { get; private set; } = null!; // e.g., "12A", "14F"
    public SeatClass SeatClass { get; private set; }
    public SeatStatus Status { get; private set; }
    public Money Price { get; private set; }

    public Flight? Flight { get; private set; }

    private Seat() { }

    public Seat(Guid flightId, string seatCode, SeatClass seatClass, Money price)
    {
        if (string.IsNullOrWhiteSpace(seatCode))
            throw new ArgumentException("Seat code cannot be empty.", nameof(seatCode));

        Id = Guid.NewGuid();
        FlightId = flightId;
        SeatCode = seatCode.ToUpperInvariant();
        SeatClass = seatClass;
        Status = SeatStatus.Available;
        Price = price;
    }

    public void Hold()
    {
        if (Status != SeatStatus.Available)
        {
            throw new InvalidOperationException($"Seat {SeatCode} is not available to hold. Current status: {Status}");
        }

        Status = SeatStatus.Held;
    }

    public void Occupy()
    {
        if (Status == SeatStatus.Occupied)
        {
            throw new InvalidOperationException($"Seat {SeatCode} is already occupied.");
        }

        Status = SeatStatus.Occupied;
    }

    public void Release()
    {
        Status = SeatStatus.Available;
    }
}
