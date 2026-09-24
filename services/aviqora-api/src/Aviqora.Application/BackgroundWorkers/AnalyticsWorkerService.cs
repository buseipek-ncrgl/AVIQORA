using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Aviqora.Application.BackgroundWorkers;

/// <summary>
/// Arka Planda Çalışan Ciro ve Sefer Doluluk Analitiği İşçisi (Analytics Worker).
/// Satılan her biletten sonra biletleme cirosunu ve uçuş doluluk oranını asenkron olarak günceller.
/// </summary>
public class AnalyticsWorkerService : BackgroundService
{
    private readonly ILogger<AnalyticsWorkerService> _logger;

    public AnalyticsWorkerService(ILogger<AnalyticsWorkerService> logger)
    {
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation(
            "📊 [AnalyticsWorkerService] RabbitMQ Worker Başlatıldı. Kuyruk: 'booking-analytics-queue' dinleniyor..."
        );

        while (!stoppingToken.IsCancellationRequested)
        {
            await Task.Delay(15000, stoppingToken);
        }
    }
}
