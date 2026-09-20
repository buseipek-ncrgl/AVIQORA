using Microsoft.AspNetCore.Mvc;

namespace Aviqora.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private static readonly DateTime StartTime = DateTime.UtcNow;

    /// <summary>
    /// Servis sağlık durumunu ve çalışma süresini dönen endpoint.
    /// Docker, Kubernetes ve Frontend liveness/readiness probe'ları tarafından kullanılır.
    /// </summary>
    [HttpGet]
    public IActionResult GetHealthStatus()
    {
        var healthInfo = new
        {
            Status = "Healthy",
            Service = "AVIQORA Core Business API",
            Version = "1.0.0",
            Timestamp = DateTime.UtcNow,
            Uptime = DateTime.UtcNow - StartTime
        };

        return Ok(healthInfo);
    }
}
