using System.Net;
using System.Net.Http.Json;
using Aviqora.Application.DTOs;

namespace Aviqora.IntegrationTests;

public class FlightsApiTests : IClassFixture<AviqoraApiFactory>
{
    private readonly HttpClient _client;

    public FlightsApiTests(AviqoraApiFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task SearchFlights_ReturnsSeededFlights()
    {
        // Arrange (DataSeeder IST -> BER yarın uçuşu ekledi)
        var tomorrow = DateTime.UtcNow.Date.AddDays(1).ToString("yyyy-MM-dd");

        // Act
        var response = await _client.GetAsync($"/api/flights/search?origin=IST&destination=BER&date={tomorrow}");

        // Assert
        if (response.StatusCode != HttpStatusCode.OK)
        {
            var err = await response.Content.ReadAsStringAsync();
            Assert.Fail($"API returned status {response.StatusCode} with body: {err}");
        }

        var flights = await response.Content.ReadFromJsonAsync<List<FlightDto>>();
        Assert.NotNull(flights);
        Assert.NotEmpty(flights);

        var flight = flights.First();
        Assert.Equal("TK1984", flight.FlightNumber);
        Assert.Equal("IST", flight.OriginAirportCode);
        Assert.Equal("BER", flight.DestinationAirportCode);
    }

    [Fact]
    public async Task GetSeats_ReturnsSeatMapForFlight()
    {
        // Arrange
        var tomorrow = DateTime.UtcNow.Date.AddDays(1).ToString("yyyy-MM-dd");
        var searchResponse = await _client.GetAsync($"/api/flights/search?origin=IST&destination=BER&date={tomorrow}");
        var flights = await searchResponse.Content.ReadFromJsonAsync<List<FlightDto>>();
        var flightId = flights!.First().Id;

        // Act
        var seatResponse = await _client.GetAsync($"/api/flights/{flightId}/seats");

        // Assert
        Assert.Equal(HttpStatusCode.OK, seatResponse.StatusCode);

        var seats = await seatResponse.Content.ReadFromJsonAsync<List<SeatDto>>();
        Assert.NotNull(seats);
        Assert.NotEmpty(seats);
        Assert.Contains(seats, s => s.SeatCode == "10A");
    }
}
