using Aviqora.Infrastructure.Persistence;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Aviqora.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var useInMemory = string.Equals(configuration["UseInMemoryDatabase"], "true", StringComparison.OrdinalIgnoreCase);

        if (useInMemory)
        {
            // SQLite In-Memory Connection (EF Core 9 ComplexProperty destekleyen ilişkisel test veritabanı)
            var connection = new SqliteConnection("DataSource=:memory:");
            connection.Open();

            services.AddDbContext<AviqoraDbContext>(options =>
            {
                options.UseSqlite(connection);
            });
        }
        else
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
        }

        services.AddScoped<Application.Common.Interfaces.IFlightRepository, Persistence.Repositories.FlightRepository>();
        services.AddScoped<Application.Common.Interfaces.IBookingRepository, Persistence.Repositories.BookingRepository>();

        return services;
    }
}
