using Aviqora.Application.DTOs;
using Aviqora.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace Aviqora.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FlightsController : ControllerBase
{
    private readonly IFlightService _flightService;

    public FlightsController(IFlightService flightService)
    {
        _flightService = flightService;
    }

    /// <summary>
    /// Uçuş arama endpoint'i. Origin/FromCode, Destination/ToCode ve DepartureDate/Date parametrelerini alır.
    /// </summary>
    [HttpGet("search")]
    public async Task<ActionResult<List<FlightDto>>> SearchFlights(
        [FromQuery] string? origin,
        [FromQuery] string? destination,
        [FromQuery] DateTime? date,
        [FromQuery] string? fromCode,
        [FromQuery] string? toCode,
        [FromQuery] DateTime? departureDate,
        CancellationToken cancellationToken)
    {
        var finalOrigin = !string.IsNullOrWhiteSpace(fromCode) ? fromCode : origin ?? "IST";
        var finalDest = !string.IsNullOrWhiteSpace(toCode) ? toCode : destination ?? "BER";
        var finalDate = departureDate ?? date ?? DateTime.Today.AddDays(1);

        var request = new FlightSearchRequestDto(finalOrigin, finalDest, finalDate);
        var result = await _flightService.SearchFlightsAsync(request, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Seçilen uçuşa ait koltuk haritasını ve durumlarını dönen endpoint.
    /// </summary>
    [HttpGet("{id:guid}/seats")]
    public async Task<ActionResult<List<SeatDto>>> GetFlightSeats(Guid id, CancellationToken cancellationToken)
    {
        var seats = await _flightService.GetSeatsByFlightIdAsync(id, cancellationToken);
        return Ok(seats);
    }

    /// <summary>
    /// Yeni uçuş seferi ekleme (Admin).
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<FlightDto>> CreateFlight([FromBody] FlightDto flightDto, CancellationToken cancellationToken)
    {
        var created = await _flightService.CreateFlightAsync(flightDto, cancellationToken);
        return Ok(created);
    }
}
