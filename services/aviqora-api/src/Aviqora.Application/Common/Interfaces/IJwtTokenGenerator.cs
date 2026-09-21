using Aviqora.Domain.Entities;

namespace Aviqora.Application.Common.Interfaces;

public interface IJwtTokenGenerator
{
    string GenerateToken(User user);
}
