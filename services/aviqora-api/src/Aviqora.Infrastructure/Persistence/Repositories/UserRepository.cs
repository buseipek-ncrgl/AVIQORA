using Aviqora.Application.Common.Interfaces;
using Aviqora.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Aviqora.Infrastructure.Persistence.Repositories;

public class UserRepository : IUserRepository
{
    private readonly AviqoraDbContext _dbContext;

    public UserRepository(AviqoraDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
    }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        var normalizedEmail = email.ToLowerInvariant();
        return await _dbContext.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail, cancellationToken);
    }

    public async Task AddAsync(User user, CancellationToken cancellationToken = default)
    {
        await _dbContext.Users.AddAsync(user, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        var normalizedEmail = email.ToLowerInvariant();
        return await _dbContext.Users.AnyAsync(u => u.Email == normalizedEmail, cancellationToken);
    }
}
