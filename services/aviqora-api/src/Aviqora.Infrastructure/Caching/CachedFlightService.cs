using Aviqora.Application.Common.Interfaces;
using Aviqora.Application.DTOs;
using Aviqora.Application.Services;
using Microsoft.Extensions.Logging;

namespace Aviqora.Infrastructure.Caching;

/// <summary>
/// Uçuş Arama Önbellek Sarmalayıcısı (Decorator Pattern - Open-Closed Principle).
/// PDF Dokümanı "8.4 Cache-Aside Flight Search" kuralı gereği FlightService koduna hiç dokunmadan önbellekleme yeteneği kazandırır.
/// </summary>
public class CachedFlightService : IFlightService
{
    private readonly IFlightService _inner;
    private readonly ICacheService _cacheService;
    private readonly ILogger<CachedFlightService> _logger;

    public CachedFlightService(IFlightService inner, ICacheService cacheService, ILogger<CachedFlightService> logger)
    {
        _inner = inner;
        _cacheService = cacheService;
        _logger = logger;
    }

    public async Task<List<FlightDto>> SearchFlightsAsync(FlightSearchRequestDto request, CancellationToken cancellationToken = default)
    {
        var formattedDate = request.DepartureDate != default ? request.DepartureDate.ToString("yyyy-MM-dd") : "all";
        var cacheKey = $"flights:search:{request.OriginCode ?? "any"}:{request.DestinationCode ?? "any"}:{formattedDate}";

        // 1. Step: Check Cache (Cache-Aside Pattern)
        var cachedFlights = await _cacheService.GetAsync<List<FlightDto>>(cacheKey, cancellationToken);
        if (cachedFlights != null)
        {
            _logger.LogInformation("⚡ [Cache Hit] Uçuş araması Redis önbelleğinden 2ms'de getirildi. Key: {CacheKey}", cacheKey);
            return cachedFlights;
        }

        _logger.LogInformation("🔍 [Cache Miss] Redis önbelleğinde bulunamadı. PostgreSQL veritabanından çekiliyor... Key: {CacheKey}", cacheKey);

        // 2. Step: Fetch from Database
        var dbFlights = await _inner.SearchFlightsAsync(request, cancellationToken);

        // 3. Step: Save to Cache with 5 minutes TTL
        await _cacheService.SetAsync(cacheKey, dbFlights, TimeSpan.FromMinutes(5), cancellationToken);

        return dbFlights;
    }

    public Task<List<SeatDto>> GetSeatsByFlightIdAsync(Guid flightId, CancellationToken cancellationToken = default)
        => _inner.GetSeatsByFlightIdAsync(flightId, cancellationToken);

    public Task<FlightDto> CreateFlightAsync(FlightDto flightDto, CancellationToken cancellationToken = default)
        => _inner.CreateFlightAsync(flightDto, cancellationToken);
}
