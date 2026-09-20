using Aviqora.Domain.Entities;
using Aviqora.Domain.Enums;
using Aviqora.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Aviqora.Infrastructure.Persistence;

/// <summary>
/// Geliştirme (Development) ortamında veritabanını test edilebilir gerçekçi verilerle dolduran Data Seeder.
/// </summary>
public static class DataSeeder
{
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AviqoraDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<AviqoraDbContext>>();

        try
        {
            // Şemayı oluştur (SQLite veya PostgreSQL için)
            await dbContext.Database.EnsureCreatedAsync();

            // Eğer havalimanları daha önce eklenmişse tekrar ekleme yapma!
            if (await dbContext.Airports.AnyAsync())
            {
                logger.LogInformation("Veritabanında mevcut veriler bulundu, seeding adımı atlanıyor.");
                return;
            }

            logger.LogInformation("Veritabanı boş, örnek havalimanları, uçuşlar ve koltuklar ekleniyor...");

            // 1. Örnek Havalimanları
            var ist = new Airport("IST", "İstanbul Havalimanı", "İstanbul", "Türkiye");
            var saw = new Airport("SAW", "Sabiha Gökçen Havalimanı", "İstanbul", "Türkiye");
            var ber = new Airport("BER", "Berlin Brandenburg Havalimanı", "Berlin", "Almanya");
            var lhr = new Airport("LHR", "London Heathrow Havalimanı", "Londra", "İngiltere");

            await dbContext.Airports.AddRangeAsync(ist, saw, ber, lhr);
            await dbContext.SaveChangesAsync();

            // 2. Örnek Uçuşlar
            var today = DateTime.UtcNow.Date;

            // Uçuş 1: IST -> BER (Yarın sabah)
            var flight1 = new Flight(
                flightNumber: "TK1984",
                originAirportId: ist.Id,
                destinationAirportId: ber.Id,
                departureTime: today.AddDays(1).AddHours(8).AddMinutes(30),
                arrivalTime: today.AddDays(1).AddHours(11).AddMinutes(15),
                basePrice: new Money(3500m, "TRY"),
                aircraftType: "Airbus A320"
            );

            // Uçuş 2: SAW -> LHR (Yarın öğleden sonra)
            var flight2 = new Flight(
                flightNumber: "VF2026",
                originAirportId: saw.Id,
                destinationAirportId: lhr.Id,
                departureTime: today.AddDays(1).AddHours(14).AddMinutes(00),
                arrivalTime: today.AddDays(1).AddHours(17).AddMinutes(45),
                basePrice: new Money(4200m, "TRY"),
                aircraftType: "Boeing 737-800"
            );

            // 3. Koltuk Haritası Oluşturma
            GenerateSeatsForFlight(flight1);
            GenerateSeatsForFlight(flight2);

            await dbContext.Flights.AddRangeAsync(flight1, flight2);
            await dbContext.SaveChangesAsync();

            logger.LogInformation("Veritabanı başarıyla tohumlandı (Seeded)! 4 Havalimanı, 2 Uçuş ve Koltuklar eklendi.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Veritabanı tohumlanırken (Seeding) bir hata oluştu: {Message}", ex.Message);
        }
    }

    private static void GenerateSeatsForFlight(Flight flight)
    {
        // Business Class Koltuklar (Sıra 1-2)
        for (int row = 1; row <= 2; row++)
        {
            foreach (var letter in new[] { "A", "B", "C", "D" })
            {
                var seatCode = $"{row}{letter}";
                var businessPrice = flight.BasePrice.Add(new Money(1500m, flight.BasePrice.Currency));
                flight.AddSeat(new Seat(flight.Id, seatCode, SeatClass.Business, businessPrice));
            }
        }

        // Economy Class Koltuklar (Sıra 10-15)
        for (int row = 10; row <= 15; row++)
        {
            foreach (var letter in new[] { "A", "B", "C", "D", "E", "F" })
            {
                var seatCode = $"{row}{letter}";
                flight.AddSeat(new Seat(flight.Id, seatCode, SeatClass.Economy, flight.BasePrice));
            }
        }
    }
}
