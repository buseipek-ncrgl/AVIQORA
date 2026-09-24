using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Aviqora.Application.Common.Interfaces;
using Aviqora.Application.DTOs;
using Aviqora.Domain.Enums;
using Microsoft.Extensions.Configuration;

namespace Aviqora.Application.Services;

public class FlightService : IFlightService
{
    private readonly IFlightRepository _flightRepository;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;

    public FlightService(
        IFlightRepository flightRepository,
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration)
    {
        _flightRepository = flightRepository;
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
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

        var targetReqDate = request.DepartureDate.Date;
        var resultList = flights.Select(f =>
        {
            var depTimeOfDay = f.DepartureTime.TimeOfDay;
            var adjustedDepTime = targetReqDate.Add(depTimeOfDay);
            var duration = f.ArrivalTime - f.DepartureTime;
            var adjustedArrTime = adjustedDepTime.Add(duration > TimeSpan.Zero ? duration : TimeSpan.FromHours(2));

            return new FlightDto(
                Id: f.Id,
                FlightNumber: f.FlightNumber,
                DepartureAirportCode: f.OriginAirport?.Code ?? request.OriginCode,
                DepartureAirportName: f.OriginAirport?.Name ?? f.OriginAirport?.City ?? request.OriginCode,
                ArrivalAirportCode: f.DestinationAirport?.Code ?? request.DestinationCode,
                ArrivalAirportName: f.DestinationAirport?.Name ?? f.DestinationAirport?.City ?? request.DestinationCode,
                DepartureTime: adjustedDepTime,
                ArrivalTime: adjustedArrTime,
                PriceAmount: f.BasePrice.Amount,
                PriceCurrency: f.BasePrice.Currency,
                AircraftModel: f.AircraftType,
                AvailableSeatsCount: f.Seats.Count(s => s.Status == SeatStatus.Available),
                AirlineName: f.AirlineName,
                OriginAirportCode: f.OriginAirport?.Code ?? request.OriginCode,
                DestinationAirportCode: f.DestinationAirport?.Code ?? request.DestinationCode
            );
        }).ToList();

        // RapidAPI Google Flights Live API Entegrasyonu
        var apiKey = _configuration["ExternalApis:FlightData:ApiKey"];
        var apiHost = _configuration["ExternalApis:FlightData:ApiHost"] ?? "google-flights2.p.rapidapi.com";
        var baseUrl = _configuration["ExternalApis:FlightData:BaseUrl"] ?? "https://google-flights2.p.rapidapi.com";

        if (!string.IsNullOrWhiteSpace(apiKey) && apiKey.Length > 10)
        {
            try
            {
                var client = _httpClientFactory.CreateClient();
                client.DefaultRequestHeaders.Add("X-RapidAPI-Key", apiKey);
                client.DefaultRequestHeaders.Add("X-RapidAPI-Host", apiHost);

                var searchUrl = $"{baseUrl}/api/v1/searchFlights?departure_id={Uri.EscapeDataString(request.OriginCode)}&arrival_id={Uri.EscapeDataString(request.DestinationCode)}&outbound_date={request.DepartureDate:yyyy-MM-dd}&currency=TRY&search_type=cheap";
                var response = await client.GetAsync(searchUrl, cancellationToken);

                if (response.IsSuccessStatusCode)
                {
                    var jsonStr = await response.Content.ReadAsStringAsync(cancellationToken);
                    using var doc = JsonDocument.Parse(jsonStr);
                    var root = doc.RootElement;

                    if (root.TryGetProperty("data", out var dataProp) &&
                        dataProp.TryGetProperty("itineraries", out var itinProp))
                    {
                        var itineraries = new List<JsonElement>();

                        if (itinProp.TryGetProperty("topFlights", out var topFl) && topFl.ValueKind == JsonValueKind.Array)
                        {
                            itineraries.AddRange(topFl.EnumerateArray());
                        }
                        if (itinProp.TryGetProperty("otherFlights", out var otherFl) && otherFl.ValueKind == JsonValueKind.Array)
                        {
                            itineraries.AddRange(otherFl.EnumerateArray());
                        }

                        if (itineraries.Count > 0)
                        {
                            var liveFlightDtos = new List<FlightDto>();

                            foreach (var itin in itineraries)
                            {
                                var price = itin.TryGetProperty("price", out var pProp) && pProp.TryGetDecimal(out var pVal) ? pVal : 1850m;
                                
                                string flightNumber = "GF-101";
                                string airlineName = "Google Flights Partner";
                                string aircraftModel = "Boeing 737 / Airbus A320";
                                
                                string depAirportCode = request.OriginCode;
                                string depAirportName = $"{request.OriginCode} Havalimanı";
                                string arrAirportCode = request.DestinationCode;
                                string arrAirportName = $"{request.DestinationCode} Havalimanı";

                                DateTime depTime = request.DepartureDate.AddHours(10);
                                DateTime arrTime = request.DepartureDate.AddHours(12);

                                string airlineLogo = "";
                                if (itin.TryGetProperty("airline_logo", out var topLogoProp))
                                    airlineLogo = topLogoProp.GetString() ?? "";

                                if (itin.TryGetProperty("flights", out var flightsArr) && flightsArr.ValueKind == JsonValueKind.Array && flightsArr.GetArrayLength() > 0)
                                {
                                    var firstLeg = flightsArr[0];
                                    var lastLeg = flightsArr[flightsArr.GetArrayLength() - 1];

                                    if (firstLeg.TryGetProperty("airline_logo", out var legLogoProp))
                                        airlineLogo = legLogoProp.GetString() ?? airlineLogo;

                                    if (firstLeg.TryGetProperty("flight_number", out var fnProp))
                                        flightNumber = fnProp.GetString() ?? flightNumber;
                                    
                                    if (firstLeg.TryGetProperty("airline", out var alProp))
                                        airlineName = alProp.GetString() ?? airlineName;
                                    
                                    if (firstLeg.TryGetProperty("aircraft", out var acProp))
                                        aircraftModel = acProp.GetString() ?? aircraftModel;

                                    if (firstLeg.TryGetProperty("departure_airport", out var depAp))
                                    {
                                        if (depAp.TryGetProperty("airport_code", out var dCode)) depAirportCode = dCode.GetString() ?? depAirportCode;
                                        if (depAp.TryGetProperty("airport_name", out var dName)) depAirportName = dName.GetString() ?? depAirportName;
                                        if (depAp.TryGetProperty("time", out var dTime)) depTime = ParseFlightTime(dTime.GetString(), depTime);
                                    }

                                    if (lastLeg.TryGetProperty("arrival_airport", out var arrAp))
                                    {
                                        if (arrAp.TryGetProperty("airport_code", out var aCode)) arrAirportCode = aCode.GetString() ?? arrAirportCode;
                                        if (arrAp.TryGetProperty("airport_name", out var aName)) arrAirportName = aName.GetString() ?? arrAirportName;
                                        if (arrAp.TryGetProperty("time", out var aTime)) arrTime = ParseFlightTime(aTime.GetString(), arrTime);
                                    }
                                }

                                liveFlightDtos.Add(new FlightDto(
                                    Id: Guid.NewGuid(),
                                    FlightNumber: flightNumber,
                                    DepartureAirportCode: depAirportCode,
                                    DepartureAirportName: depAirportName,
                                    ArrivalAirportCode: arrAirportCode,
                                    ArrivalAirportName: arrAirportName,
                                    DepartureTime: depTime,
                                    ArrivalTime: arrTime,
                                    PriceAmount: price,
                                    PriceCurrency: "TRY",
                                    AircraftModel: aircraftModel,
                                    AvailableSeatsCount: 30,
                                    AirlineName: airlineName,
                                    OriginAirportCode: depAirportCode,
                                    DestinationAirportCode: arrAirportCode,
                                    AirlineLogoUrl: airlineLogo
                                ));
                            }

                            if (liveFlightDtos.Count > 0)
                            {
                                resultList.InsertRange(0, liveFlightDtos);
                            }
                        }
                    }
                }
            }
            catch
            {
                // Canlı RapidAPI çağrısında sorun olsa da veritabanı uçuşlarını sunmaya devam et
            }
        }

        return resultList;
    }

    private static DateTime ParseFlightTime(string? timeStr, DateTime fallback)
    {
        if (string.IsNullOrWhiteSpace(timeStr)) return fallback;
        if (DateTime.TryParse(timeStr, System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.None, out var dt))
        {
            return dt;
        }
        string[] formats = { "yyyy-M-d HH:mm", "yyyy-MM-dd HH:mm", "dd-MM-yyyy hh:mm tt", "dd-MM-yyyy HH:mm" };
        if (DateTime.TryParseExact(timeStr, formats, System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.None, out var exactDt))
        {
            return exactDt;
        }
        return fallback;
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

    public async Task<FlightDto> CreateFlightAsync(FlightDto flightDto, CancellationToken cancellationToken = default)
    {
        await Task.CompletedTask;
        return flightDto;
    }
}

