namespace Aviqora.Application.Common.Interfaces;

/// <summary>
/// Önbellek (Caching) Servisi Kontratı.
/// PDF Dokümanı "8.4 Cache-Aside Strategy" kuralı gereğince önbellekleme, TTL yönetimi ve prefix bazlı temizleme metotlarını tanımlar.
/// </summary>
public interface ICacheService
{
    Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default);
    Task SetAsync<T>(string key, T value, TimeSpan expiration, CancellationToken cancellationToken = default);
    Task RemoveByPrefixAsync(string prefixKey, CancellationToken cancellationToken = default);
}
