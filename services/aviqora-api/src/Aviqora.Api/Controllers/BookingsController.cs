using Aviqora.Application.DTOs;
using Aviqora.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace Aviqora.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookingsController : ControllerBase
{
    private readonly IBookingService _bookingService;

    public BookingsController(IBookingService bookingService)
    {
        _bookingService = bookingService;
    }

    /// <summary>
    /// Yeni rezervasyon oluşturma endpoint'i. Uçuş ID, Yolcu ve Koltuk seçimlerini alır, PNR üretir.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<BookingResponseDto>> CreateBooking(
        [FromBody] CreateBookingRequestDto request,
        CancellationToken cancellationToken)
    {
        var result = await _bookingService.CreateBookingAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetBookingByPnr), new { pnr = result.PNR }, result);
    }

    /// <summary>
    /// PNR kodu ile bilet rezervasyon detaylarını getiren endpoint.
    /// </summary>
    [HttpGet("{pnr}")]
    public async Task<ActionResult<BookingResponseDto>> GetBookingByPnr(string pnr, CancellationToken cancellationToken)
    {
        var booking = await _bookingService.GetBookingByPnrAsync(pnr, cancellationToken);
        if (booking == null)
        {
            return NotFound(new { Message = $"PNR: '{pnr}' ile eşleşen rezervasyon bulunamadı." });
        }

        return Ok(booking);
    }
}
