# AVIQORA — Uçtan Uca Detaylı Mimari, Öğrenme ve Mühendislik Kitabı

Bu doküman, **AVIQORA Flight Booking System** projesinde kullanılan tüm mimari desenlerin, güvenlik standartlarının, veritabanı kararlarının ve yazılan tüm kodların **hiç yazılım bilmeyen birine sıfırdan ve eksiksiz anlatır gibi** yazılmış ana rehberidir.

---

# 🧠 BÖLÜM 1: Büyük Resim — Mimarimiz ve İstek Yolculuğu

Bir kullanıcı tarayıcısını (Next.js) veya mobil uygulamasını açıp **"İstanbul -> Berlin uçuşu ara, koltuk seç ve bilet al"** butonuna bastığında sistemimizde istek sırasıyla aşağıdaki katmanlardan geçer:

```
[🌐 İstemci: Next.js Web UI / Mobil Uygulama]
           │
           │ 1. HTTP POST /api/bookings (JSON İstek Nesnesi)
           ▼
[🎮 Aviqora.Api Katmanı] 
   ├── Controllers (HTTP Kapısı: İstekleri karşılar, DTO alır, Status Code döner)
   └── GlobalExceptionHandlerMiddleware (Tüm hataları yakalar, RFC 7807 formatına çevirir)
           │
           │ 2. C# Request DTO / Command
           ▼
[⚙️ Aviqora.Application Katmanı]
   ├── DTO'lar (Sonsuz döngüyü ve veri sızıntısını engelleyen veri taşıyıcılar)
   ├── Service'ler (Orkestra Şefleri: İş akış sırasını yönetir)
   └── Repository Arayüzleri (IFlightRepository, IBookingRepository - Bağımlılık Tersine Çevirme)
           │
           │ 3. Saf İş Kuralları (Invariants)
           ▼
[❤️ Aviqora.Domain Katmanı]
   ├── Entities (Flight, Seat, Passenger, Booking - Durumu kapsüllenmiş varlıklar)
   ├── Value Objects (Money, PNRCode - Değişmez değer nesneleri)
   └── Enums (BookingStatus, SeatStatus, SeatClass)
           │
           │ 4. Veritabanına Okuma / Yazma
           ▼
[💾 Aviqora.Infrastructure Katmanı]
   ├── AviqoraDbContext (PostgreSQL / SQLite ORM Veritabanı Nesnesi)
   ├── Fluent API Configurations (ComplexProperty, HasConversion, Unique Index)
   ├── DataSeeder (Otomatik başlangıç verisi yükleyici)
   └── Repository Impl (FlightRepository, BookingRepository - SQL çalıştırıcılar)
```

---

# 🔒 BÖLÜM 2: Güvenlik Mimarisi ve F12 (Geliştirici Araçları) Yasaları

### 1. F12 (İstemci) Katmanında Asla Görünmemesi Gerekenler
* **Veritabanı ve Gizli Anahtarlar (Secrets):** PostgreSQL bağlantı cümlesi (`ConnectionStrings`), JWT imzalama şifreleri, Redis ve RabbitMQ şifreleri istemciye asla gönderilmez.
* **Kritik İş Mantığı ve Algoritmalar:** Dinamik bilet fiyatlandırma algoritmaları, indirim ve ceza hesaplama kuralları tamamen backend (`ASP.NET Core`) tarafında çalışır.
* **Hassas Yolcu Verileri (PII - Personally Identifiable Information):** Yolcunun TCKN / Pasaport numarası veya telefon bilgisi istemciye tam açık olarak gönderilmez (Örn: `123*****89` şeklinde maskelenir veya yetkisiz kullanıcılara verilmez).
* **Detaylı Sistem Hataları (Stack Trace):** Sunucuda bir çökme oluştuğunda veritabanı tablo adları veya C# kod satır numaraları F12 Network sekmesinde görünmez. Bunun yerine standart **RFC 7807 ProblemDetails** hata nesnesi dönülür.

### 2. Zero Trust (Sıfır Güven) Prensipleri
* **Prensip 1: İstemciye (F12) Asla Güvenme!** Kullanıcı F12 Console üzerinden JavaScript ile isteği değiştirebilir veya tarayıcı değişkenlerini editleyebilir. Bu yüzden backend gelen HER isteği sıfırdan doğrular (Validation & Authorization).
* **Prensip 2: Kaynak Sahipliği Kontrolü (Resource Ownership):** Kullanıcı A, F12 veya URL adresi üzerinden bilet ID'sini `101` yerine `102` yaparak başkasının biletini göremez (`/api/bookings/102`). Backend `Booking.UserId == CurrentUserId` kontrolü yapar.

---

# 📦 BÖLÜM 3: Domain Katmanı Tasarımı ve İş Kuralları (`Aviqora.Domain`)

### 1. `Seat.cs` (Koltuk Varlığı - Entity)
📌 **Konum:** [`Aviqora.Domain/Entities/Seat.cs`](file:///c:/Users/Dell/Documents/PROJECT/Flight%20Booking%20System/services/aviqora-api/src/Aviqora.Domain/Entities/Seat.cs)

```csharp
public class Seat
{
    public Guid Id { get; private set; }
    public Guid FlightId { get; private set; }
    public string SeatCode { get; private set; } = null!; // Örn: "12A", "14F"
    public SeatClass SeatClass { get; private set; }
    public SeatStatus Status { get; private set; }
    public Money Price { get; private set; }

    public void Hold()
    {
        if (Status != SeatStatus.Available)
            throw new InvalidOperationException($"Seat {SeatCode} is not available to hold. Current status: {Status}");

        Status = SeatStatus.Held;
    }
}
```
* **Neden `private set` Kullandık?** Dışarıdan kimse `seat.Status = SeatStatus.Occupied;` yazarak koltuğu kafasına göre kapatamasın diye. Durum değişimi sadece `Hold()`, `Occupy()`, `Release()` metotları ile yapılabilir (Encapsulation / Kapselleme).
* **Neden `Guid` ID Kullandık?** Otomatik artan `1, 2, 3` ID'ler kullanılırsa, bir saldırgan F12 Network sekmesinde `/api/seats/101` görüp adresi `/api/seats/102` yaparak başkasının koltuğunu tahmin edebilir (ID Enumeration saldırısı). `Guid` (`c9bf9e57-1685-4c89-bafb...`) tahmin edilemezdir.

### 2. `Money.cs` (Para Değer Nesnesi - Value Object)
📌 **Konum:** [`Aviqora.Domain/ValueObjects/Money.cs`](file:///c:/Users/Dell/Documents/PROJECT/Flight%20Booking%20System/services/aviqora-api/src/Aviqora.Domain/ValueObjects/Money.cs)

```csharp
public readonly record struct Money
{
    public decimal Amount { get; }
    public string Currency { get; }

    public Money(decimal amount, string currency = "TRY")
    {
        if (amount < 0) throw new ArgumentException("Amount cannot be negative.", nameof(amount));
        if (string.IsNullOrWhiteSpace(currency)) throw new ArgumentException("Currency cannot be empty.", nameof(currency));

        Amount = decimal.Round(amount, 2);
        Currency = currency.ToUpperInvariant();
    }
}
```
* **Neden `record struct`?** C# `record struct` bellekte ışık hızında çalışır ve iki para nesnesinin değerleri aynıysa eşit (`==`) kabul edilmesini sağlar.
* **Neden düz `decimal` değil?** 100 TL ile 100 USD'nin yanlışlıkla toplanmasını engellemek için miktar (`Amount`) + para birimi (`Currency`) birlikte tutulur.

### 3. `PNRCode.cs` (Rezervasyon Kodu - Value Object)
📌 **Konum:** [`Aviqora.Domain/ValueObjects/PNRCode.cs`](file:///c:/Users/Dell/Documents/PROJECT/Flight%20Booking%20System/services/aviqora-api/src/Aviqora.Domain/ValueObjects/PNRCode.cs)

```csharp
public readonly record struct PNRCode
{
    private static readonly Regex PnrRegex = new("^[A-Z0-9]{6}$", RegexOptions.Compiled);
    public string Value { get; }
}
```
* **Regex Koruması:** `^[A-Z0-9]{6}$` kuralı ile PNR kodunun tam olarak 6 haneli, büyük harf ve rakamlardan oluşmasını garanti eder.

### 4. `Booking.cs` & `BookingPassenger.cs` (Bilet Rezervasyonu ve Cascade Insert)
📌 **Konum:** [`Aviqora.Domain/Entities/Booking.cs`](file:///c:/Users/Dell/Documents/PROJECT/Flight%20Booking%20System/services/aviqora-api/src/Aviqora.Domain/Entities/Booking.cs)

* **Bilet Yaşam Döngüsü:** `Draft` -> `Held` (Koltuk tutuldu) -> `Confirmed` (Ödeme alındı) -> `Expired` (Süre doldu) / `Cancelled` (İptal edildi).
* **Cascade Insertion İlişkisi:**
  `BookingPassenger` oluşturulurken `Passenger` entity nesnesinin kendisi atanır:
  ```csharp
  _bookingPassengers.Add(new BookingPassenger(Id, passenger, seatId));
  ```
  Bu sayede EF Core `Bookings.AddAsync(booking)` çalıştığında ilişkili yolcuyu da PostgreSQL veritabanına otomatik ekler.

---

# 💾 BÖLÜM 4: Veritabanı ve Persistence Katmanı (`Aviqora.Infrastructure`)

### 1. `AviqoraDbContext.cs`
PostgreSQL veritabanımız ile C# varlıklarımız arasındaki ana köprüdür. `OnModelCreating` içerisinde `ApplyConfigurationsFromAssembly` kullanılarak Fluent API ayarları otomatik yüklenir.

### 2. Fluent API Konfigürasyonları ve Eşzamanlılık Koruması
* **[`SeatConfiguration.cs`](file:///c:/Users/Dell/Documents/PROJECT/Flight%20Booking%20System/services/aviqora-api/src/Aviqora.Infrastructure/Persistence/Configurations/SeatConfiguration.cs): Veritabanı Seviyesinde Son Savunma Hattı**
  ```csharp
  builder.HasIndex(s => new { s.FlightId, s.SeatCode }).IsUnique();
  ```
  Aynı uçuşta iki tane "12A" koltuğunun oluşmasını engellemek için veritabanında **Unique Index (Benzersiz İndeks)** tanımlanmıştır. İki istek aynı anda gelse bile PostgreSQL veritabanı seviyesinde 2. isteği reddeder (`Unique Constraint Violation`).
* **Value Object Dönüşümleri (.NET 9 Complex Property):**
  * **`Money`:** `.ComplexProperty(f => f.BasePrice)` kullanılarak SQL tablosunda iki ayrı sütuna (`base_price_amount` decimal ve `base_price_currency` varchar(3)) dönüştürülür.
  * **`PNRCode`:** `HasConversion(pnr => pnr.Value, str => new PNRCode(str))` ile SQL'de 6 haneli `pnr` varchar(6) olarak saklanır.

### 3. `DataSeeder.cs` (Otomatik Tohumlayıcı)
📌 **Konum:** [`Aviqora.Infrastructure/Persistence/DataSeeder.cs`](file:///c:/Users/Dell/Documents/PROJECT/Flight%20Booking%20System/services/aviqora-api/src/Aviqora.Infrastructure/Persistence/DataSeeder.cs)

Uygulama `Development` ortamında kalktığında veritabanında havalimanı ve uçuş var mı kontrol eder. Boş ise IST, SAW, BER, LHR havalimanlarını, TK1984 & VF2026 uçuşlarını ve Business/Economy koltuk haritalarını otomatik doldurur.

---

# ⚙️ BÖLÜM 5: Application ve API Katmanı (`Aviqora.Application` & `Aviqora.Api`)

### 1. DTO (Data Transfer Object) Katmanı
📌 **Konum:** [`Aviqora.Application/DTOs/`](file:///c:/Users/Dell/Documents/PROJECT/Flight%20Booking%20System/services/aviqora-api/src/Aviqora.Application/DTOs/FlightDto.cs)

Neden Entity'ler dışarı açılmaz?
1. **Circular Reference Crash:** `Flight -> Seats -> Flight -> Seats...` sonsuz JSON serileştirme döngüsünü engellemek için.
2. **Veri Gizliliği:** İç veritabanı sütunlarını gizlemek için.
3. **Esneklik:** DB modeli değiştiğinde API sözleşmesini korumak için `FlightDto`, `SeatDto`, `BookingResponseDto` kullanılır.

### 2. Controller vs Service vs Repository Sorumluluk Tablosu

| Katman | Dosya Örneği | Sorumluluğu | İzin Verilmeyen Şey |
| :--- | :--- | :--- | :--- |
| **Controller** | `BookingsController.cs` | HTTP isteğini almak, HTTP 201 Created veya 400 Bad Request status kodu dönmek | SQL sorgusu yazmak, `seat.Status = Occupied` yapmak |
| **Service** | `BookingService.cs` | Adımları sırayla çağırır (Önce uçuşu bul -> Koltuğu tut -> Bilet oluştur -> DB'ye kaydet) | HTTP Header okumak, HTML üretmek |
| **Domain** | `Booking.cs`, `Seat.cs` | "Koltuk boş mu?" kontrolü yapmak, durum geçişini yönetmek | Veritabanı kütüphanesi (`EF Core`) kullanmak |
| **Repository** | `BookingRepository.cs` | Veritabanına SQL ile okuma/yazma yapmak | Bilet fiyatı hesaplama algoritması çalıştırmak |

---

# 🧪 BÖLÜM 6: Entegrasyon Testleri ve Çözülen Derin Problemler

📌 **Konum:** [`Aviqora.IntegrationTests/`](file:///c:/Users/Dell/Documents/PROJECT/Flight%20Booking%20System/services/aviqora-api/tests/Aviqora.IntegrationTests/)

### 1. SQLite In-Memory Seçimi
.NET 9 ile gelen `ComplexProperty` (`Money` Value Object) özelliği standart `Microsoft.EntityFrameworkCore.InMemory` kütüphanesi tarafından desteklenmediği için testlerimizde %100 ilişkisel destek sunan **`Microsoft.EntityFrameworkCore.Sqlite` (In-Memory)** kullanılmıştır.

### 2. UTC Saat Dilimi Probleminin Çözümü
`FlightRepository` içerisinde uçuş ararken local bilgisayar saat diliminin tarihi kaydırmasını engellemek için:
```csharp
var startOfDay = DateTime.SpecifyKind(departureDate.Date, DateTimeKind.Utc);
var endOfDay = startOfDay.AddDays(1).AddTicks(-1);
```
kullanılarak saat dilimi bağımsız deterministik tarih aralığı filtrelenmiştir.

---

# 📈 BÖLÜM 7: Test Doğrulama ve Git Sürüm Disiplini

### 1. Test Sonuçları (18/18 Passed)
* **`Aviqora.UnitTests` (14 Test):** MoneyTests, PNRCodeTests, BookingLifecycleTests (%100 Başarılı).
* **`Aviqora.IntegrationTests` (4 Entegrasyon Testi):** HealthApiTests, FlightsApiTests (Search & Seats), BookingsApiTests (Create & GetByPNR) (%100 Başarılı).

### 2. Git Commit Tarihçemiz
* `feat(testing)`: add DataSeeder, SQLite In-Memory setup and end-to-end integration tests
* `docs(architecture)`: add comprehensive master learning and architecture guide
* `feat(api)`: implement db context, ef core migrations, application services, dtos, repositories and controllers
* `docs(architecture)`: add zero-trust security policy, F12 exposure rules and beginner conceptual breakdown guide
* `feat(domain)`: implement core entities, value objects (PNRCode, Money), enums and domain unit tests
* `feat(setup)`: initialize aviqora solution structure, git, .gitignore and adr-001
