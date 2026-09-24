using Aviqora.Application.Common.Interfaces;
using Aviqora.Application.DTOs;
using Aviqora.Domain.Entities;

namespace Aviqora.Application.Services;

public class AirportService : IAirportService
{
    private readonly IAirportRepository _airportRepository;

    public AirportService(IAirportRepository airportRepository)
    {
        _airportRepository = airportRepository;
    }

    public async Task<List<AirportDto>> GetAllAirportsAsync(CancellationToken cancellationToken = default)
    {
        var airports = await _airportRepository.GetAllAsync(cancellationToken);
        return airports.Select(a => new AirportDto(a.Id, a.Code, a.Name, a.City, a.Country)).ToList();
    }

    public async Task<AirportDto?> GetAirportByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        var airport = await _airportRepository.GetByCodeAsync(code, cancellationToken);
        if (airport == null) return null;
        return new AirportDto(airport.Id, airport.Code, airport.Name, airport.City, airport.Country);
    }

    public async Task<AirportDto> CreateAirportAsync(CreateAirportDto dto, CancellationToken cancellationToken = default)
    {
        var existing = await _airportRepository.GetByCodeAsync(dto.Code, cancellationToken);
        if (existing != null)
        {
            return new AirportDto(existing.Id, existing.Code, existing.Name, existing.City, existing.Country);
        }

        var airport = new Airport(dto.Code, dto.Name, dto.City, dto.Country);
        await _airportRepository.AddAsync(airport, cancellationToken);

        return new AirportDto(airport.Id, airport.Code, airport.Name, airport.City, airport.Country);
    }
}
