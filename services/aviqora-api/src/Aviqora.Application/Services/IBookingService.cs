using Aviqora.Application.DTOs;

namespace Aviqora.Application.Services;

public interface IBookingService
{
    Task<BookingResponseDto> CreateBookingAsync(CreateBookingRequestDto request, CancellationToken cancellationToken = default);
    Task<BookingResponseDto?> GetBookingByPnrAsync(string pnr, CancellationToken cancellationToken = default);
}
