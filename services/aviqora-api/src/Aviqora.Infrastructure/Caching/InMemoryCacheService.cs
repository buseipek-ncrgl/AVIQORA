using System.Collections.Concurrent;
using System.Text.Json;
using Aviqora.Application.Common.Interfaces;

namespace Aviqora.Infrastructure.Caching;

/// <summary>
/// Bellek İçi Redis Simülatörü Önbellek Servisi (In-Memory Cache-Aside Implementation).
/// TTL (Time-To-Live) süresi dolan verileri otomatik temizler ve prefix bazlı invalidation destekler.
/// </summary>
public class InMemoryCacheService : ICacheService
{
    private readonly ConcurrentDictionary<string, (string Value, DateTime ExpiresAt)> _store = new();

    public Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default)
    {
        if (_store.TryGetValue(key, out var item))
        {
            if (DateTime.UtcNow < item.ExpiresAt)
            {
                var obj = JsonSerializer.Deserialize<T>(item.Value);
                return Task.FromResult(obj);
            }

            // TTL süresi dolmuşsa temizle (Expired Cache Eviction)
            _store.TryRemove(key, out _);
        }
        return Task.FromResult<T?>(default);
    }

    public Task SetAsync<T>(string key, T value, TimeSpan expiration, CancellationToken cancellationToken = default)
    {
        var json = JsonSerializer.Serialize(value);
        _store[key] = (json, DateTime.UtcNow.Add(expiration));
        return Task.CompletedTask;
    }

    public Task RemoveByPrefixAsync(string prefixKey, CancellationToken cancellationToken = default)
    {
        var keysToRemove = _store.Keys.Where(k => k.StartsWith(prefixKey, StringComparison.OrdinalIgnoreCase)).ToList();
        foreach (var key in keysToRemove)
        {
            _store.TryRemove(key, out _);
        }
        return Task.CompletedTask;
    }
}
