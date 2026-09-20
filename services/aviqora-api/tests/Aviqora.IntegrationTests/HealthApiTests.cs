using System.Net;
using System.Net.Http.Json;
using System.Text.Json;

namespace Aviqora.IntegrationTests;

public class HealthApiTests : IClassFixture<AviqoraApiFactory>
{
    private readonly HttpClient _client;

    public HealthApiTests(AviqoraApiFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetHealthStatus_ReturnsOkAndHealthyStatus()
    {
        // Act
        var response = await _client.GetAsync("/api/health");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var content = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal("Healthy", content.GetProperty("status").GetString());
        Assert.Equal("AVIQORA Core Business API", content.GetProperty("service").GetString());
    }
}
