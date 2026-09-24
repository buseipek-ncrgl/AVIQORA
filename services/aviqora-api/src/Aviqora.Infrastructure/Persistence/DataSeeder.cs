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

            // 1. Örnek Havalimanları Registry (28 Yurt İçi + Yurt Dışı Havalimanı)
            var ist = new Airport("IST", "İstanbul Havalimanı (IST Hub)", "İstanbul", "Türkiye");
            var saw = new Airport("SAW", "Sabiha Gökçen Havalimanı", "İstanbul", "Türkiye");
            var esb = new Airport("ESB", "Ankara Esenboğa Havalimanı", "Ankara", "Türkiye");
            var adb = new Airport("ADB", "İzmir Adnan Menderes Havalimanı", "İzmir", "Türkiye");
            var gzt = new Airport("GZT", "Gaziantep Oğuzeli Havalimanı", "Gaziantep", "Türkiye");
            var ayt = new Airport("AYT", "Antalya Havalimanı", "Antalya", "Türkiye");
            var ada = new Airport("ADA", "Çukurova Uluslararası Havalimanı", "Adana", "Türkiye");
            var tzx = new Airport("TZX", "Trabzon Havalimanı", "Trabzon", "Türkiye");
            var bjv = new Airport("BJV", "Milas-Bodrum Havalimanı", "Bodrum", "Türkiye");
            var dlm = new Airport("DLM", "Dalaman Havalimanı", "Muğla", "Türkiye");
            var asr = new Airport("ASR", "Kayseri Erkilet Havalimanı", "Kayseri", "Türkiye");
            var diy = new Airport("DIY", "Diyarbakır Havalimanı", "Diyarbakır", "Türkiye");
            var szf = new Airport("SZF", "Samsun Çarşamba Havalimanı", "Samsun", "Türkiye");
            var van = new Airport("VAN", "Van Ferit Melen Havalimanı", "Van", "Türkiye");

            var ber = new Airport("BER", "Berlin Brandenburg Airport", "Berlin", "Almanya");
            var lhr = new Airport("LHR", "London Heathrow Airport", "Londra", "İngiltere");
            var cdg = new Airport("CDG", "Paris Charles de Gaulle Airport", "Paris", "Fransa");
            var jfk = new Airport("JFK", "New York John F. Kennedy Int.", "New York", "ABD");
            var dxb = new Airport("DXB", "Dubai International Airport", "Dubai", "BAE");
            var muc = new Airport("MUC", "Munich Airport", "Münih", "Almanya");
            var fra = new Airport("FRA", "Frankfurt Airport", "Frankfurt", "Almanya");
            var ams = new Airport("AMS", "Amsterdam Airport Schiphol", "Amsterdam", "Hollanda");
            var doh = new Airport("DOH", "Hamad International Airport", "Doha", "Katar");
            var cai = new Airport("CAI", "Cairo International Airport", "Kahire", "Mısır");
            var nrt = new Airport("NRT", "Tokyo Narita Airport", "Tokyo", "Japonya");
            var syd = new Airport("SYD", "Sydney Kingsford Smith", "Sidney", "Avustralya");
            var lax = new Airport("LAX", "Los Angeles International", "Los Angeles", "ABD");
            var zrh = new Airport("ZRH", "Zurich Airport", "Zürih", "İsviçre");

            await dbContext.Airports.AddRangeAsync(
                ist, saw, esb, adb, gzt, ayt, ada, tzx, bjv, dlm, asr, diy, szf, van,
                ber, lhr, cdg, jfk, dxb, muc, fra, ams, doh, cai, nrt, syd, lax, zrh
            );
            await dbContext.SaveChangesAsync();

            // 2. Örnek Uçuşlar (Zamanlanmış Gerçekçi Rotalar)
            var today = DateTime.UtcNow.Date;

            // Uçuş 1: IST -> BER (Yarın 08:30)
            var flight1 = new Flight(
                flightNumber: "TK1984",
                originAirportId: ist.Id,
                destinationAirportId: ber.Id,
                departureTime: today.AddDays(1).AddHours(8).AddMinutes(30),
                arrivalTime: today.AddDays(1).AddHours(11).AddMinutes(15),
                basePrice: new Money(3500m, "TRY"),
                aircraftType: "Airbus A321neo"
            );

            // Uçuş 2: SAW -> LHR (Yarın 14:00)
            var flight2 = new Flight(
                flightNumber: "VF2026",
                originAirportId: saw.Id,
                destinationAirportId: lhr.Id,
                departureTime: today.AddDays(1).AddHours(14).AddMinutes(00),
                arrivalTime: today.AddDays(1).AddHours(17).AddMinutes(45),
                basePrice: new Money(4200m, "TRY"),
                aircraftType: "Boeing 737-800"
            );

            // Uçuş 3: IST -> GZT (Yarın 08:00)
            var flight3 = new Flight(
                flightNumber: "TK2602",
                originAirportId: ist.Id,
                destinationAirportId: gzt.Id,
                departureTime: today.AddDays(1).AddHours(8).AddMinutes(00),
                arrivalTime: today.AddDays(1).AddHours(9).AddMinutes(40),
                basePrice: new Money(1250m, "TRY"),
                aircraftType: "Airbus A320neo"
            );

            // Uçuş 4: SAW -> GZT (Yarın 14:20)
            var flight4 = new Flight(
                flightNumber: "VF3040",
                originAirportId: saw.Id,
                destinationAirportId: gzt.Id,
                departureTime: today.AddDays(1).AddHours(14).AddMinutes(20),
                arrivalTime: today.AddDays(1).AddHours(16).AddMinutes(00),
                basePrice: new Money(1150m, "TRY"),
                aircraftType: "Boeing 737 MAX 8"
            );

            // Uçuş 5: IST -> ESB (Yarın 07:15)
            var flight5 = new Flight(
                flightNumber: "TK2108",
                originAirportId: ist.Id,
                destinationAirportId: esb.Id,
                departureTime: today.AddDays(1).AddHours(7).AddMinutes(15),
                arrivalTime: today.AddDays(1).AddHours(8).AddMinutes(25),
                basePrice: new Money(850m, "TRY"),
                aircraftType: "Airbus A320neo"
            );

            // 3. Koltuk Haritası Oluşturma
            GenerateSeatsForFlight(flight1);
            GenerateSeatsForFlight(flight2);
            GenerateSeatsForFlight(flight3);
            GenerateSeatsForFlight(flight4);
            GenerateSeatsForFlight(flight5);

            await dbContext.Flights.AddRangeAsync(flight1, flight2, flight3, flight4, flight5);
            await dbContext.SaveChangesAsync();

            logger.LogInformation("Veritabanı başarıyla tohumlandı (Seeded)! 13 Havalimanı, 5 Uçuş ve Koltuklar veritabanına eklendi.");
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
