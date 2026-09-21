using System.Net;
using System.Net.Http.Json;
using Aviqora.Application.DTOs;

namespace Aviqora.IntegrationTests;

public class AuthApiTests : IClassFixture<AviqoraApiFactory>
{
    private readonly HttpClient _client;

    public AuthApiTests(AviqoraApiFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task RegisterAndLogin_ReturnsValidJwtToken()
    {
        var registerRequest = new RegisterRequestDto(
            Email: "testuser@example.com",
            Password: "SecurePassword123!",
            FirstName: "Zeynep",
            LastName: "Kaya"
        );

        // 1. Register Request (POST /api/auth/register)
        var registerResponse = await _client.PostAsJsonAsync("/api/auth/register", registerRequest);
        Assert.Equal(HttpStatusCode.OK, registerResponse.StatusCode);

        var registerResult = await registerResponse.Content.ReadFromJsonAsync<AuthResponseDto>();
        Assert.NotNull(registerResult);
        Assert.Equal("testuser@example.com", registerResult.Email);
        Assert.Equal("Passenger", registerResult.Role);
        Assert.False(string.IsNullOrWhiteSpace(registerResult.Token));

        // 2. Login Request (POST /api/auth/login)
        var loginRequest = new LoginRequestDto(
            Email: "testuser@example.com",
            Password: "SecurePassword123!"
        );

        var loginResponse = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);
        Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);

        var loginResult = await loginResponse.Content.ReadFromJsonAsync<AuthResponseDto>();
        Assert.NotNull(loginResult);
        Assert.Equal(registerResult.UserId, loginResult.UserId);
        Assert.False(string.IsNullOrWhiteSpace(loginResult.Token));
    }
}
