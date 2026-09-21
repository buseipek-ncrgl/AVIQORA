using Aviqora.Application.DTOs;
using Aviqora.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace Aviqora.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    /// <summary>
    /// Yeni kullanıcı kayıt (Register) endpoint'i. E-posta, şifre ve ad-soyad bilgilerini alır, JWT token üretir.
    /// </summary>
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register(
        [FromBody] RegisterRequestDto request,
        CancellationToken cancellationToken)
    {
        var result = await _authService.RegisterAsync(request, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Kullanıcı giriş (Login) endpoint'i. E-posta ve şifreyi doğrular, geçerli JWT token döner.
    /// </summary>
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(
        [FromBody] LoginRequestDto request,
        CancellationToken cancellationToken)
    {
        var result = await _authService.LoginAsync(request, cancellationToken);
        return Ok(result);
    }
}
