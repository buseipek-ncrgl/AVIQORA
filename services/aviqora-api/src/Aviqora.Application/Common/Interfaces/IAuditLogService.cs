namespace Aviqora.Application.Common.Interfaces;

public interface IAuditLogService
{
    Task LogAsync(string userId, string action, string entityName, string entityId, string details, CancellationToken cancellationToken = default);
    Task<IEnumerable<AuditLogEntry>> GetLogsAsync(string userId, int maxCount = 50, CancellationToken cancellationToken = default);
}

public record AuditLogEntry(
    string Id,
    string UserId,
    string Action,
    string EntityName,
    string EntityId,
    string Details,
    DateTime TimestampUtc
);
