namespace Aviqora.Application.Common.Interfaces;

/// <summary>
/// Olay Odaklı Mimari (Event-Driven Architecture) için Mesaj Otobüsü (EventBus) Soyutlama Kontratı.
/// ASP.NET Core API katmanı bu kontratı kullanarak RabbitMQ veya bellek içi bus servislerine mesaj yayınlar.
/// </summary>
public interface IEventBus
{
    Task PublishAsync<TEvent>(TEvent @event, CancellationToken cancellationToken = default) where TEvent : class;
}
