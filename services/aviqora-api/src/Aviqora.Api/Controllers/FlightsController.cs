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
    /// Uçuş arama endpoint'i. Origin, Destination ve DepartureDate parametrelerini alır.
    /// </summary>
    [HttpGet("search")]
    public async Task<ActionResult<List<FlightDto>>> SearchFlights(
        [FromQuery] string origin,
        [FromQuery] string destination,
        [FromQuery] DateTime date,
        CancellationToken cancellationToken)
    {
        var request = new FlightSearchRequestDto(origin, destination, date);
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
}
