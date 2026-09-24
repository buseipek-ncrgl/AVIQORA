using Aviqora.Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Aviqora.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IFlightService, FlightService>();
        services.AddScoped<IAirportService, AirportService>();
        services.AddScoped<IBookingService, BookingService>();
        services.AddScoped<IAuthService, AuthService>();

        // Register RabbitMQ Background Workers
        services.AddHostedService<BackgroundWorkers.EmailWorkerService>();
        services.AddHostedService<BackgroundWorkers.AnalyticsWorkerService>();

        return services;
    }
}
