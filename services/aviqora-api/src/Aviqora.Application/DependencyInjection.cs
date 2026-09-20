using Aviqora.Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Aviqora.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IFlightService, FlightService>();
        services.AddScoped<IBookingService, BookingService>();

        return services;
    }
}
