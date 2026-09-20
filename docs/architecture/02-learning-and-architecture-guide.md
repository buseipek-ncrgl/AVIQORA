# AVIQORA — Uçtan Uca Mimari, Katmanlar ve Öğrenme Rehberi

> Bu doküman, **AVIQORA Havayolu Rezervasyon ve Operasyon Platformu** geliştirilirken kullanılan tüm mimari kararları, tasarım kalıplarını (Design Patterns), katmanlar arası ilişkiyi ve yazılan kritik dosyaları **hiç bilmeyen bir mühendise anlatır gibi** detaylandırır. Unutulduğunda başvuru rehberi olarak tasarlanmıştır.

---

## 🏛️ 1. Büyük Mimari Resim ve Katman Sorumlulukları

Projemiz **Clean Architecture** (Temiz Mimari) prensiplerine göre yapılandırılmış bir **Modular Monolith** mimarisidir.

```
[🌐 İstemci: Next.js Web UI / Mobil Uygulama / PWA]
                     │
                     │ 1. HTTP Request (JSON Data)
                     ▼
┌──────────────────────────────────────────────────────────┐
│ 1. Aviqora.Api (Web API & Middleware)                    │
│ - Dış dünyaya kapıyı açan HTTP resepsiyon görevlisidir. │
│ - Validation, Authorization ve Global Error Handling.   │
└──────────────────────────┬───────────────────────────────┘
                           │ C# DTO / Request
                           ▼
┌──────────────────────────────────────────────────────────┐
│ 2. Aviqora.Application (İş Akışları / Use Cases)        │
│ - Orkestra Şefidir. DB'den veri çeker, Domain'i çalıştırır│
│ - DTO dönüşümlerini yapar, kararları yönetir.           │
└──────────────────────────┬───────────────────────────────┘
                           │ İş Kuralları & Invariants
                           ▼
┌──────────────────────────────────────────────────────────┐
│ 3. Aviqora.Domain (Çekirdek Varlıklar & Anayasa)         │
│ - Kalp/Çekirdek. Tamamen saf C#'tır (Pure C#).           │
│ - Veritabanını, HTTP'yi veya JSON'u bilmez!              │
└──────────────────────────┬───────────────────────────────┘
                           │ Veri Saklama / Okuma
                           ▼
┌──────────────────────────────────────────────────────────┐
│ 4. Aviqora.Infrastructure (PostgreSQL / EF Core)         │
│ - Ambar Görevlisi. EF Core DbContext, Repositories,       │
│ - Redis ve RabbitMQ altyapılarını içerir.               │
└──────────────────────────────────────────────────────────┘
```

---

## 📱 2. Mobil Uyum & Veritabanı Stratejisi

### A. Mobil Uygulama Desteği
* Backend `ASP.NET Core Web API` olarak tasarlandığı için geriye HTML değil, saf **JSON verisi** döner.
* Bu sayede yazılan API'ye **Next.js Web**, **Flutter/React Native Mobil App** veya **iOS/Android Native App** aynı adres üzerinden bağlanabilir. Backend tarafında hiçbir kod değişimi gerekmez.

### B. Veritabanı Rol Dağılımı (PostgreSQL vs MongoDB)
1. **PostgreSQL (Ana Veritabanı - Source of Truth):** Bilet, Koltuk, Uçuş, Yolcu ve Ödeme verilerinde kullanılır. Neden? %100 ACID Transaction garantisi ve veritabanı seviyesinde tutarlılık için.
2. **MongoDB (Doküman & AI Veritabanı - V3 Aşamasında):** AI Seyahat Asistanı (Chatbot) sohbet geçmişi ve esnek JSON transkript logları için kullanılacaktır.

---

## 🔍 3. Katmanlar ve Kritik Dosyaların Satır Satır Analizi

### Katman 1: `Aviqora.Domain` (Saf İş Kuralları)

* **[`Seat.cs`](file:///c:/Users/Dell/Documents/PROJECT/Flight%20Booking%20System/services/aviqora-api/src/Aviqora.Domain/Entities/Seat.cs):**
  * `private set` kullanılarak kapselleme (Encapsulation) sağlandı. Dışarıdan yetkisiz `seat.Status = Occupied` yapılması engellendi. Durum değişimi sadece `Hold()`, `Occupy()`, `Release()` metotları ile yapılır.
  * Otomatik artan `1, 2, 3` ID'ler yerine `Guid` kullanıldı (Tahmin edilerek veri sızdırılmasını engellemek için - ID Enumeration Defense).
* **[`Money.cs`](file:///c:/Users/Dell/Documents/PROJECT/Flight%20Booking%20System/services/aviqora-api/src/Aviqora.Domain/ValueObjects/Money.cs):**
  * `readonly record struct` olarak tasarlandı. Miktar + Para Birimi ikilisini birlikte tutar. 100 TL ile 100 USD'nin yanlışlıkla toplanmasını engelleyen iş kuralına sahiptir.
* **[`PNRCode.cs`](file:///c:/Users/Dell/Documents/PROJECT/Flight%20Booking%20System/services/aviqora-api/src/Aviqora.Domain/ValueObjects/PNRCode.cs):**
  * Regex (`^[A-Z0-9]{6}$`) ile istisnasız 6 haneli, büyük harf ve rakamdan oluşan bilet kodu garantisi verir.
* **[`Booking.cs`](file:///c:/Users/Dell/Documents/PROJECT/Flight%20Booking%20System/services/aviqora-api/src/Aviqora.Domain/Entities/Booking.cs):**
  * Bilet yaşam döngüsünü (`Draft` -> `Held` -> `Confirmed` -> `Expired` / `Cancelled`) yöneten Aggregate Root'tur. Süresi dolmuş biletin onaylanmasını engeller.

---

### Katman 2: `Aviqora.Infrastructure` (Veritabanı & EF Core)

* **[`AviqoraDbContext.cs`](file:///c:/Users/Dell/Documents/PROJECT/Flight%20Booking%20System/services/aviqora-api/src/Aviqora.Infrastructure/Persistence/AviqoraDbContext.cs):**
  * EF Core 9 ORM köprümüzdür. `DbSet<T>` özellikleri ile C# nesnelerini SQL tablolarına bağlar. `ApplyConfigurationsFromAssembly` ile Fluent API konfigürasyonlarını otomatik yükler.
* **[`SeatConfiguration.cs`](file:///c:/Users/Dell/Documents/PROJECT/Flight%20Booking%20System/services/aviqora-api/src/Aviqora.Infrastructure/Persistence/Configurations/SeatConfiguration.cs):**
  * `builder.HasIndex(s => new { s.FlightId, s.SeatCode }).IsUnique();`
  * **Eşzamanlılık Koruması (Race Condition Defense):** Aynı uçuşta aynı seat code'un ikincil olarak eklenmesini veritabanı seviyesinde engeller.
* **Value Object Veritabanı Haritalaması:**
  * `Money` nesnesi `.ComplexProperty()` ile SQL'de `base_price_amount` (decimal) ve `base_price_currency` (varchar) sütunlarına ayrılır.
  * `PNRCode` nesnesi `.HasConversion()` ile SQL'de `pnr` (varchar(6)) sütununa dönüştürülür.
* **[`FlightRepository.cs`](file:///c:/Users/Dell/Documents/PROJECT/Flight%20Booking%20System/services/aviqora-api/src/Aviqora.Infrastructure/Persistence/Repositories/FlightRepository.cs) & [`BookingRepository.cs`](file:///c:/Users/Dell/Documents/PROJECT/Flight%20Booking%20System/services/aviqora-api/src/Aviqora.Infrastructure/Persistence/Repositories/BookingRepository.cs):**
  * Application katmanındaki arayüzleri uygulayarak veritabanı `Include` ve `LINQ` sorgularını çalıştırır.

---

### Katman 3: `Aviqora.Application` (DTO'lar & Servisler)

* **DTO (Data Transfer Object) Zorunluluğu:**
  * Domain nesneleri (`Flight`, `Booking`) asla doğrudan F12/API yanıtı olarak dönülmez!
  * **Sebep:** Sonsuz döngü çökmesi (`Flight -> Seats -> Flight`), hassas veri gizliliği (TCKN maskeleme) ve veritabanı bağımsızlığı.
  * [`FlightDto`](file:///c:/Users/Dell/Documents/PROJECT/Flight%20Booking%20System/services/aviqora-api/src/Aviqora.Application/DTOs/FlightDto.cs) ve [`BookingResponseDto`](file:///c:/Users/Dell/Documents/PROJECT/Flight%20Booking%20System/services/aviqora-api/src/Aviqora.Application/DTOs/BookingDto.cs) bu amaçla yazılmıştır.
* **[`BookingService.cs`](file:///c:/Users/Dell/Documents/PROJECT/Flight%20Booking%20System/services/aviqora-api/src/Aviqora.Application/Services/BookingService.cs):**
  * Bilet oluşturma adımlarını sırayla yönetir: Uçuşu çeker -> Koltuğu kontrol edip tutar (`seat.Hold()`) -> PNR üretir -> DB'ye kaydeder -> DTO döner.

---

### Katman 4: `Aviqora.Api` (HTTPREST Endpoints & Middleware)

* **[`GlobalExceptionHandlerMiddleware.cs`](file:///c:/Users/Dell/Documents/PROJECT/Flight%20Booking%20System/services/aviqora-api/src/Aviqora.Api/Middleware/GlobalExceptionHandlerMiddleware.cs):**
  * HTTP istek boru hattının (Request Pipeline) en tepesinde durur. Oluşan tüm sistem hatalarını yakalar.
  * **F12 Zero-Trust Güvenlik Kuralı:** 500 hatalarında hassas veritabanı ve C# stack trace bilgilerini istemciye sızdırmaz, standart **RFC 7807 ProblemDetails** hatası döner.
* **[`FlightsController.cs`](file:///c:/Users/Dell/Documents/PROJECT/Flight%20Booking%20System/services/aviqora-api/src/Aviqora.Api/Controllers/FlightsController.cs) & [`BookingsController.cs`](file:///c:/Users/Dell/Documents/PROJECT/Flight%20Booking%20System/services/aviqora-api/src/Aviqora.Api/Controllers/BookingsController.cs):**
  * HTTP GET/POST isteklerini karşılar, DTO alır ve Service katmanını tetikler.

---

## 📊 4. Sorumluluk Karşılaştırma Özeti

| Katman | Dosya Örneği | Görevi | Asla Yapmaması Gereken Şey |
| :--- | :--- | :--- | :--- |
| **Controller** | `BookingsController.cs` | HTTP isteğini karşılamak, Status Code dönmek (201 Created) | SQL yazmak, bilet fiyatı hesaplamak |
| **Service** | `BookingService.cs` | Akışı yönetmek (Önce koltuk tut -> Sonra bilet üret -> Kaydet) | HTTP Header okumak, HTML üretmek |
| **Domain** | `Booking.cs`, `Seat.cs` | "Geçersiz durumda bilet onaylanamaz!" kuralını çalıştırmak | Veritabanı kütüphanesi (`EF Core`) kullanmak |
| **Repository** | `BookingRepository.cs` | Veritabanına SQL ile okuma/yazma yapmak | İstemci DTO'su üretmek |

---

## 🛠️ 5. Git Commit & Sürüm Disiplini

Projede atılan tüm commit'ler **Conventional Commits** standartlarına göre kategorize edilir:
* `feat(domain)`: İş kuralları ve domain nesneleri.
* `feat(api)`: Web API, DB Context, Repository ve Controller eklemeleri.
* `docs(architecture)`: Mimari ve rehber doküman güncellemeleri.
