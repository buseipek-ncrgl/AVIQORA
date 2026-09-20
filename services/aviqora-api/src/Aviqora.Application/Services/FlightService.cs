using Aviqora.Application.Common.Interfaces;
using Aviqora.Application.DTOs;
using Aviqora.Domain.Enums;

namespace Aviqora.Application.Services;

public class FlightService : IFlightService
{
    private readonly IFlightRepository _flightRepository;

    public FlightService(IFlightRepository flightRepository)
    {
        _flightRepository = flightRepository;
    }

    public async Task<List<FlightDto>> SearchFlightsAsync(FlightSearchRequestDto request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.OriginCode) || string.IsNullOrWhiteSpace(request.DestinationCode))
        {
            throw new ArgumentException("Kalkış ve varış havalimanı kodları boş olamaz.");
        }

        var flights = await _flightRepository.SearchFlightsAsync(
            request.OriginCode,
            request.DestinationCode,
            request.DepartureDate,
            cancellationToken);

        return flights.Select(f => new FlightDto(
            Id: f.Id,
            FlightNumber: f.FlightNumber,
            OriginAirportCode: f.OriginAirport?.Code ?? request.OriginCode,
            OriginAirportCity: f.OriginAirport?.City ?? string.Empty,
            DestinationAirportCode: f.DestinationAirport?.Code ?? request.DestinationCode,
            DestinationAirportCity: f.DestinationAirport?.City ?? string.Empty,
            DepartureTime: f.DepartureTime,
            ArrivalTime: f.ArrivalTime,
            BasePriceAmount: f.BasePrice.Amount,
            Currency: f.BasePrice.Currency,
            AircraftType: f.AircraftType,
            AvailableSeatCount: f.Seats.Count(s => s.Status == SeatStatus.Available)
        )).ToList();
    }

    public async Task<List<SeatDto>> GetSeatsByFlightIdAsync(Guid flightId, CancellationToken cancellationToken = default)
    {
        var flight = await _flightRepository.GetByIdWithSeatsAsync(flightId, cancellationToken);
        if (flight == null)
        {
            throw new KeyNotFoundException($"ID: {flightId} olan uçuş bulunamadı.");
        }

        return flight.Seats.Select(s => new SeatDto(
            Id: s.Id,
            SeatCode: s.SeatCode,
            SeatClass: s.SeatClass.ToString(),
            Status: s.Status.ToString(),
            PriceAmount: s.Price.Amount,
            Currency: s.Price.Currency
        )).ToList();
    }
}
