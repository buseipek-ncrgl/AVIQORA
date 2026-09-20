using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;

namespace Aviqora.IntegrationTests;

public class AviqoraApiFactory : WebApplicationFactory<Program>
{
    public AviqoraApiFactory()
    {
        // Program.cs başlamadan önce UseInMemoryDatabase ortam değişkenini ayarla
        Environment.SetEnvironmentVariable("UseInMemoryDatabase", "true");
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");
    }
}
