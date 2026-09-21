using Aviqora.Application.Common.Interfaces;
using Aviqora.Application.DTOs;
using Aviqora.Domain.Entities;
using Aviqora.Domain.Enums;

namespace Aviqora.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;

    public AuthService(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        IJwtTokenGenerator jwtTokenGenerator)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _jwtTokenGenerator = jwtTokenGenerator;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || !request.Email.Contains('@'))
        {
            throw new ArgumentException("Geçerli bir e-posta adresi girilmelidir.");
        }

        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 6)
        {
            throw new ArgumentException("Şifre en az 6 karakter olmalıdır.");
        }

        var normalizedEmail = request.Email.ToLowerInvariant();
        if (await _userRepository.ExistsByEmailAsync(normalizedEmail, cancellationToken))
        {
            throw new InvalidOperationException($"'{request.Email}' adresi ile zaten kayıtlı bir kullanıcı var.");
        }

        var passwordHash = _passwordHasher.HashPassword(request.Password);
        var user = new User(normalizedEmail, passwordHash, request.FirstName, request.LastName, UserRole.Passenger);

        await _userRepository.AddAsync(user, cancellationToken);
        var token = _jwtTokenGenerator.GenerateToken(user);

        return new AuthResponseDto(
            user.Id,
            user.Email,
            user.FirstName,
            user.LastName,
            user.Role.ToString(),
            token);
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request, CancellationToken cancellationToken = default)
    {
        var normalizedEmail = request.Email.ToLowerInvariant();
        var user = await _userRepository.GetByEmailAsync(normalizedEmail, cancellationToken);

        if (user == null || !_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("E-posta adresi veya şifre hatalı.");
        }

        var token = _jwtTokenGenerator.GenerateToken(user);

        return new AuthResponseDto(
            user.Id,
            user.Email,
            user.FirstName,
            user.LastName,
            user.Role.ToString(),
            token);
    }
}
