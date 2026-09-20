using Aviqora.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Aviqora.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection") 
            ?? "Host=localhost;Database=aviqora_db;Username=postgres;Password=postgres";

        services.AddDbContext<AviqoraDbContext>(options =>
        {
            options.UseNpgsql(connectionString, npgsqlOptions =>
            {
                npgsqlOptions.MigrationsAssembly(typeof(AviqoraDbContext).Assembly.FullName);
            });
        });

        services.AddScoped<Application.Common.Interfaces.IFlightRepository, Persistence.Repositories.FlightRepository>();
        services.AddScoped<Application.Common.Interfaces.IBookingRepository, Persistence.Repositories.BookingRepository>();

        return services;
    }
}
