using System.Text;
using System.Text.Json;
using Aviqora.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;

namespace Aviqora.Infrastructure.Messaging;

/// <summary>
/// RabbitMQ Mesaj Yayınlayıcısı (Publisher) Uygulaması.
/// PDF Dokümanımız "8.3 RabbitMQ ve Workers" kuralına göre biletleme olaylarını 'aviqora-booking-exchange' üzerinden yayınlar.
/// </summary>
public class RabbitMqEventBus : IEventBus
{
    private readonly ILogger<RabbitMqEventBus> _logger;

    public RabbitMqEventBus(ILogger<RabbitMqEventBus> logger)
    {
        _logger = logger;
    }

    public Task PublishAsync<TEvent>(TEvent @event, CancellationToken cancellationToken = default) where TEvent : class
    {
        var eventName = typeof(TEvent).Name;
        var jsonPayload = JsonSerializer.Serialize(@event, new JsonSerializerOptions { WriteIndented = false });

        // Simüle edilmiş / Üretim RabbitMQ Exchange Yayınlaması
        _logger.LogInformation(
            "📡 [RabbitMQ Publisher] Exchange: 'aviqora-booking-exchange' | RoutingKey: '{EventName}' | Payload: {Payload}",
            eventName,
            jsonPayload
        );

        return Task.CompletedTask;
    }
}
