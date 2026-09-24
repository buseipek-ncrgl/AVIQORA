using Aviqora.Application.DTOs;
using Aviqora.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace Aviqora.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AirportsController : ControllerBase
{
    private readonly IAirportService _airportService;

    public AirportsController(IAirportService airportService)
    {
        _airportService = airportService;
    }

    /// <summary>
    /// Veritabanındaki tüm aktif havalimanlarını listeleyen API endpoint'i.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<AirportDto>>> GetAllAirports(CancellationToken cancellationToken)
    {
        var airports = await _airportService.GetAllAirportsAsync(cancellationToken);
        return Ok(airports);
    }

    /// <summary>
    /// Koda göre havalimanı arama (ör. IST, SAW, BER).
    /// </summary>
    [HttpGet("{code}")]
    public async Task<ActionResult<AirportDto>> GetAirportByCode(string code, CancellationToken cancellationToken)
    {
        var airport = await _airportService.GetAirportByCodeAsync(code, cancellationToken);
        if (airport == null) return NotFound(new { message = $"{code} kodlu havalimanı bulunamadı." });
        return Ok(airport);
    }

    /// <summary>
    /// Admin paneli üzerinden yeni havalimanı ekleme endpoint'i.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<AirportDto>> CreateAirport([FromBody] CreateAirportDto dto, CancellationToken cancellationToken)
    {
        var created = await _airportService.CreateAirportAsync(dto, cancellationToken);
        return Ok(created);
    }
}
