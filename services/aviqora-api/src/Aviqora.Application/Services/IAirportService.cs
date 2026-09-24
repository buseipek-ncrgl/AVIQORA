using Aviqora.Application.DTOs;

namespace Aviqora.Application.Services;

public interface IAirportService
{
    Task<List<AirportDto>> GetAllAirportsAsync(CancellationToken cancellationToken = default);
    Task<AirportDto?> GetAirportByCodeAsync(string code, CancellationToken cancellationToken = default);
    Task<AirportDto> CreateAirportAsync(CreateAirportDto dto, CancellationToken cancellationToken = default);
}
