using System.Collections.Concurrent;
using Aviqora.Application.Common.Interfaces;

namespace Aviqora.Infrastructure.Audit;

public class MongoAuditLogService : IAuditLogService
{
    private readonly ConcurrentBag<AuditLogEntry> _inMemoryAuditLogs = new();

    public Task LogAsync(string userId, string action, string entityName, string entityId, string details, CancellationToken cancellationToken = default)
    {
        var entry = new AuditLogEntry(
            Id: Guid.NewGuid().ToString("N"),
            UserId: userId,
            Action: action,
            EntityName: entityName,
            EntityId: entityId,
            Details: details,
            TimestampUtc: DateTime.UtcNow
        );

        _inMemoryAuditLogs.Add(entry);
        return Task.CompletedTask;
    }

    public Task<IEnumerable<AuditLogEntry>> GetLogsAsync(string userId, int maxCount = 50, CancellationToken cancellationToken = default)
    {
        var logs = _inMemoryAuditLogs
            .Where(x => string.IsNullOrEmpty(userId) || x.UserId == userId)
            .OrderByDescending(x => x.TimestampUtc)
            .Take(maxCount);

        return Task.FromResult<IEnumerable<AuditLogEntry>>(logs);
    }
}
