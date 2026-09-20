using System.Net;
using System.Net.Http.Json;
using Aviqora.Application.DTOs;

namespace Aviqora.IntegrationTests;

public class BookingsApiTests : IClassFixture<AviqoraApiFactory>
{
    private readonly HttpClient _client;

    public BookingsApiTests(AviqoraApiFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task CreateBookingAndGetByPnr_ReturnsValidBooking()
    {
        // 1. Uçuş ve Koltuk id'sini al
        var tomorrow = DateTime.UtcNow.Date.AddDays(1).ToString("yyyy-MM-dd");
        var searchResponse = await _client.GetAsync($"/api/flights/search?origin=IST&destination=BER&date={tomorrow}");
        var flights = await searchResponse.Content.ReadFromJsonAsync<List<FlightDto>>();
        var flight = flights!.First();

        var seatResponse = await _client.GetAsync($"/api/flights/{flight.Id}/seats");
        var seats = await seatResponse.Content.ReadFromJsonAsync<List<SeatDto>>();
        var selectedSeat = seats!.First(s => s.Status == "Available");

        // 2. Booking Oluşturma İsteği Gönder (POST /api/bookings)
        var createRequest = new CreateBookingRequestDto(
            FlightId: flight.Id,
            Passengers: new List<PassengerRequestDto>
            {
                new PassengerRequestDto(
                    FirstName: "Ahmet",
                    LastName: "Yılmaz",
                    IdentityNumber: "12345678901",
                    Email: "ahmet@example.com",
                    PhoneNumber: "+905551112233",
                    SelectedSeatId: selectedSeat.Id
                )
            }
        );

        var bookingResponse = await _client.PostAsJsonAsync("/api/bookings", createRequest);

        // Assert - 201 Created
        if (bookingResponse.StatusCode != HttpStatusCode.Created)
        {
            var err = await bookingResponse.Content.ReadAsStringAsync();
            Assert.Fail($"API returned status {bookingResponse.StatusCode} with body: {err}");
        }

        var bookingResult = await bookingResponse.Content.ReadFromJsonAsync<BookingResponseDto>();
        Assert.NotNull(bookingResult);
        Assert.Equal(6, bookingResult.PNR.Length); // 6 Haneli PNR kuralı!
        Assert.Equal("Held", bookingResult.Status);
        Assert.Single(bookingResult.Passengers);

        // 3. PNR ile Sorgula (GET /api/bookings/{pnr})
        var pnrResponse = await _client.GetAsync($"/api/bookings/{bookingResult.PNR}");
        Assert.Equal(HttpStatusCode.OK, pnrResponse.StatusCode);

        var pnrResult = await pnrResponse.Content.ReadFromJsonAsync<BookingResponseDto>();
        Assert.NotNull(pnrResult);
        Assert.Equal(bookingResult.PNR, pnrResult.PNR);
    }
}
