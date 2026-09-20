namespace Aviqora.Domain.Entities;

public class BookingPassenger
{
    public Guid Id { get; private set; }
    public Guid BookingId { get; private set; }
    public Guid PassengerId { get; private set; }
    public Guid? SeatId { get; private set; }

    public Booking? Booking { get; private set; }
    public Passenger? Passenger { get; private set; }
    public Seat? Seat { get; private set; }

    private BookingPassenger() { }

    public BookingPassenger(Guid bookingId, Guid passengerId, Guid? seatId = null)
    {
        Id = Guid.NewGuid();
        BookingId = bookingId;
        PassengerId = passengerId;
        SeatId = seatId;
    }

    public void AssignSeat(Guid seatId)
    {
        SeatId = seatId;
    }
}
