using Aviqora.Application.Common.Events;
using Aviqora.Application.Common.Interfaces;
using Aviqora.Application.DTOs;
using Aviqora.Domain.Entities;
using Aviqora.Domain.ValueObjects;

namespace Aviqora.Application.Services;

public class BookingService : IBookingService
{
    private readonly IBookingRepository _bookingRepository;
    private readonly IFlightRepository _flightRepository;
    private readonly IEventBus _eventBus;

    public BookingService(IBookingRepository bookingRepository, IFlightRepository flightRepository, IEventBus eventBus)
    {
        _bookingRepository = bookingRepository;
        _flightRepository = flightRepository;
        _eventBus = eventBus;
    }

    public async Task<BookingResponseDto> CreateBookingAsync(CreateBookingRequestDto request, CancellationToken cancellationToken = default)
    {
        if (request.Passengers == null || request.Passengers.Count == 0)
        {
            throw new ArgumentException("En az bir yolcu bilgisi girilmelidir.");
        }

        var flight = await _flightRepository.GetByIdWithSeatsAsync(request.FlightId, cancellationToken);
        if (flight == null)
        {
            throw new KeyNotFoundException($"ID: {request.FlightId} olan uçuş bulunamadı.");
        }

        Money totalAmount = Money.Zero(flight.BasePrice.Currency);

        foreach (var passengerReq in request.Passengers)
        {
            Money passengerPrice = flight.BasePrice;

            if (passengerReq.SelectedSeatId.HasValue)
            {
                var seat = flight.Seats.FirstOrDefault(s => s.Id == passengerReq.SelectedSeatId.Value);
                if (seat == null)
                {
                    throw new KeyNotFoundException($"ID: {passengerReq.SelectedSeatId} olan koltuk bulunamadı.");
                }

                // Koltuğu tut (Hold status) - Domain kuralı kontrolü!
                seat.Hold();
                passengerPrice = seat.Price;
            }

            totalAmount = totalAmount.Add(passengerPrice);
        }

        var booking = new Booking(flight.Id, totalAmount, holdDurationMinutes: 10);

        foreach (var passengerReq in request.Passengers)
        {
            var passenger = new Passenger(
                passengerReq.FirstName,
                passengerReq.LastName,
                passengerReq.IdentityNumber,
                passengerReq.Email,
                passengerReq.PhoneNumber);

            booking.AddPassenger(passenger, passengerReq.SelectedSeatId);
        }

        booking.Hold(); // Bilet 10 dakikalığına tutuldu (Initial state)!

        await _bookingRepository.AddAsync(booking, cancellationToken);

        // Olay Odaklı Mimari (Event-Driven): RabbitMQ Mesaj Kuyruğuna Olay Fırlatma (Publish)
        var firstPassenger = request.Passengers.First();
        var confirmedEvent = new BookingConfirmedEvent(
            BookingId: booking.Id,
            PnrCode: booking.PNR.Value,
            PassengerName: $"{firstPassenger.FirstName} {firstPassenger.LastName}",
            PassengerEmail: firstPassenger.Email,
            FlightNumber: flight.FlightNumber,
            SeatCode: "1A",
            TotalAmount: booking.TotalAmount.Amount,
            Currency: booking.TotalAmount.Currency,
            ConfirmedAt: DateTime.UtcNow
        );

        await _eventBus.PublishAsync(confirmedEvent, cancellationToken);

        return MapToBookingResponseDto(booking, flight);
    }

    public async Task<BookingResponseDto?> GetBookingByPnrAsync(string pnr, CancellationToken cancellationToken = default)
    {
        var booking = await _bookingRepository.GetByPnrAsync(pnr, cancellationToken);
        if (booking == null) return null;

        var flight = await _flightRepository.GetByIdAsync(booking.FlightId, cancellationToken);
        return MapToBookingResponseDto(booking, flight);
    }

    private static BookingResponseDto MapToBookingResponseDto(Booking booking, Flight? flight)
    {
        var passengers = booking.BookingPassengers.Select(bp => new BookingPassengerDto(
            PassengerId: bp.PassengerId,
            FullName: bp.Passenger != null ? $"{bp.Passenger.FirstName} {bp.Passenger.LastName}" : "Yolcu Bilgisi",
            IdentityNumber: bp.Passenger?.IdentityNumber ?? string.Empty,
            SeatCode: bp.Seat?.SeatCode
        )).ToList();

        return new BookingResponseDto(
            BookingId: booking.Id,
            PNR: booking.PNR.Value,
            Status: booking.Status.ToString(),
            FlightId: booking.FlightId,
            FlightNumber: flight?.FlightNumber ?? string.Empty,
            CreatedAt: booking.CreatedAt,
            ExpiresAt: booking.ExpiresAt,
            TotalAmount: booking.TotalAmount.Amount,
            Currency: booking.TotalAmount.Currency,
            Passengers: passengers
        );
    }
}
