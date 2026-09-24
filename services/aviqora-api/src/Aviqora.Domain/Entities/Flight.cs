using Aviqora.Domain.ValueObjects;

namespace Aviqora.Domain.Entities;

public class Flight
{
    public Guid Id { get; private set; }
    public string FlightNumber { get; private set; } = null!; // e.g., "TK1984"
    public Guid OriginAirportId { get; private set; }
    public Guid DestinationAirportId { get; private set; }
    public DateTime DepartureTime { get; private set; }
    public DateTime ArrivalTime { get; private set; }
    public Money BasePrice { get; private set; }
    public string AircraftType { get; private set; } = null!; // e.g., "Airbus A320"
    public string AirlineName { get; private set; } = "Aviqora Airways";

    // Navigation Properties
    public Airport? OriginAirport { get; private set; }
    public Airport? DestinationAirport { get; private set; }
    private readonly List<Seat> _seats = new();
    public IReadOnlyCollection<Seat> Seats => _seats.AsReadOnly();

    private Flight() { }

    public Flight(
        string flightNumber,
        Guid originAirportId,
        Guid destinationAirportId,
        DateTime departureTime,
        DateTime arrivalTime,
        Money basePrice,
        string aircraftType,
        string airlineName = "Aviqora Airways")
    {
        if (string.IsNullOrWhiteSpace(flightNumber))
            throw new ArgumentException("Flight number cannot be empty.", nameof(flightNumber));

        if (originAirportId == destinationAirportId)
            throw new ArgumentException("Origin and Destination airports cannot be the same.", nameof(destinationAirportId));

        if (arrivalTime <= departureTime)
            throw new ArgumentException("Arrival time must be after departure time.", nameof(arrivalTime));

        Id = Guid.NewGuid();
        FlightNumber = flightNumber.ToUpperInvariant();
        OriginAirportId = originAirportId;
        DestinationAirportId = destinationAirportId;
        DepartureTime = departureTime;
        ArrivalTime = arrivalTime;
        BasePrice = basePrice;
        AircraftType = aircraftType;
        AirlineName = string.IsNullOrWhiteSpace(airlineName) ? "Aviqora Airways" : airlineName;
    }

    public void AddSeat(Seat seat)
    {
        if (_seats.Contains(seat))
            return;

        if (_seats.Any(s => s.SeatCode.Equals(seat.SeatCode, StringComparison.OrdinalIgnoreCase)))
        {
            throw new InvalidOperationException($"Seat {seat.SeatCode} already exists on flight {FlightNumber}.");
        }

        _seats.Add(seat);
    }
}
