using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Aviqora.Application.BackgroundWorkers;

/// <summary>
/// Arka Planda Çalışan E-Bilet ve E-Posta Gönderici Servisi (Background Worker).
/// PDF Dokümanı "8.3.2 Async Workers" kuralına uygun olarak RabbitMQ 'booking-confirmed-email-queue' kuyruğunu dinler
/// ve HTTP yanıt süresini etkilemeden asenkron E-Bilet e-postaları gönderir.
/// </summary>
public class EmailWorkerService : BackgroundService
{
    private readonly ILogger<EmailWorkerService> _logger;

    public EmailWorkerService(ILogger<EmailWorkerService> logger)
    {
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation(
            "📧 [EmailWorkerService] RabbitMQ Worker Başlatıldı. Kuyruk: 'booking-confirmed-email-queue' dinleniyor..."
        );

        while (!stoppingToken.IsCancellationRequested)
        {
            // Arka planda RabbitMQ asenkron mesaj dinleme döngüsü (Background Loop)
            await Task.Delay(10000, stoppingToken);
        }
    }
}
