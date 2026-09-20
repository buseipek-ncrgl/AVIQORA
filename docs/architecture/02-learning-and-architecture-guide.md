# AVIQORA — Uçtan Uca Mimari, Öğrenme ve Mühendislik Rehberi

Bu doküman, **AVIQORA Flight Booking System** projesinde kullanılan tüm mimari kararların, katmanların, veritabanı stratejilerinin ve yazılan kodların **hiç bilmeyen bir mühendise sıfırdan anlatır gibi** kalıcı dokümantasyonudur. Geliştirilen her yeni özellikle birlikte güncellenir.

---

## 🏛️ BÖLÜM 1: Büyük Resim (Clean Architecture & Modular Monolith)

Bir kullanıcı tarayıcıdan (Next.js) veya mobil uygulamadan **"Uçuş Ara"** veya **"Bilet Satın Al"** dediğinde istek aşağıdaki sırayla ilerler:

```
[🌐 İstemci: Next.js / Mobil App]
           │
           │ 1. HTTP Request (JSON)
           ▼
[🎮 Aviqora.Api]  --> Controllers (HTTP Kapısı) & Global Exception Middleware
           │
           │ 2. DTO & Request
           ▼
[⚙️ Aviqora.Application]  --> Use Cases, Service'ler (Orkestra Şefleri) & DTO'lar
           │
           │ 3. İş Kuralları (Invariants)
           ▼
[❤️ Aviqora.Domain]  --> Pure C# Entities, Value Objects, Enums
           │
           │ 4. Veri Okuma / Yazma
           ▼
[💾 Aviqora.Infrastructure]  --> PostgreSQL, EF Core 9 DbContext, Repositories, Redis, RabbitMQ
```

### Katmanların Aşılmaz Kuralları:
1. **`Aviqora.Domain` (Kalp):** Tamamen bağımsızdır. `EF Core`, `PostgreSQL`, `HTTP` veya `JSON` nedir bilmez. Sadece saf C# iş kurallarını tutar.
2. **`Aviqora.Application` (Şef):** İshi kimin yapacağını (Repository) çağırır, Domain kurallarını çalıştırır, istemciye DTO döner.
3. **`Aviqora.Infrastructure` (Ambar):** Veritabanı sorgularını (`EF Core`), önbelleği (`Redis`) ve mesaj kuyruğunu (`RabbitMQ`) yönetir.
4. **`Aviqora.Api` (Resepsiyon):** HTTP isteklerini karşılar, yetki kontrolü yapar, hataları sarmalar.

---

## 🔒 BÖLÜM 2: Güvenlik Mimarısı ve F12 (Geliştirici Araçları) Kuralları

### A. F12 (İstemci) Katmanında Asla Görünmemesi Gerekenler
1. **Secrets & Connection Strings:** PostgreSQL şifreleri, JWT key'leri, Redis/RabbitMQ bağlantı cümleleri istemciye sızdırılmaz.
2. **Kritik İş Mantığı:** Bilet fiyatlandırma algoritmaları ve indirim mantığı tamamen backend'de çalışır.
3. **Hassas Yolcu Verileri (PII):** Yolcunun TCKN / Pasaport numarası maskelenir veya yetkisiz kullanıcılara açılmaz.
4. **Detaylı Stack Trace:** Sunucuda hata oluştuğunda veritabanı tablo adları veya C# satır numaraları F12'ye gönderilmez. **RFC 7807 ProblemDetails** formatında filtrelenmiş hata nesnesi dönülür.

### B. Zero Trust (Sıfır Güven)
* **Prensip 1: İstemciye (F12) Güvenme!** Kullanıcı mobilden de girse web'den de girse backend her isteği sıfırdan doğrular.
* **Prensip 2: Resource Ownership (Kaynak Sahipliği):** Kullanıcı A, URL'den bilet ID'sini `101` yerine `102` yaparak başkasının biletini göremez. Backend `Booking.UserId == CurrentUserId` kontrolü yapar.

---

## 📦 BÖLÜM 3: Domain Katmanı Tasarım Detayları (`Aviqora.Domain`)

### 1. `Seat.cs` (Koltuk Entity'si)
* **Encapsulation (`private set`):** `seat.Status = Occupied` şeklinde dışarıdan müdahaleye kapalıdır.
* **Durum Metotları (`Hold()`, `Occupy()`, `Release()`):** Koltuk durumu yalnızca bu metotlarla değiştirilebilir. Metot önce koltuğun müsait (`Available`) olup olmadığını kontrol eder.
* **`Guid` ID Kullanımı:** Otomatik artan `1, 2, 3` ID'ler yerine `Guid` kullanılır (ID Tahmin/Enumeration saldırılarını engellemek için).

### 2. `Money.cs` (Value Object - Para)
* **Neden `record struct`?** C# `record struct` bellekte ışık hızında çalışır ve değer bazlı eşitlik (`==`) sağlar.
* **Neden düz `decimal` değil?** 100 TL ile 100 USD'nin yanlışlıkla toplanmasını engellemek için miktar (`Amount`) + para birimi (`Currency`) birlikte tutulur.

### 3. `PNRCode.cs` (Value Object - Rezervasyon Kodu)
* **Regex Koruması:** `^[A-Z0-9]{6}$` kuralı ile PNR kodunun tam olarak 6 haneli, büyük harf ve rakamlardan oluşmasını garanti eder.

### 4. `Booking.cs` & `BookingPassenger.cs` (Bilet Rezervasyonu ve Cascade Insert)
* **Bilet Yaşam Döngüsü:** `Draft` -> `Held` (Koltuk tutuldu) -> `Confirmed` (Ödeme alındı) -> `Expired` (Süre doldu) / `Cancelled` (İptal edildi).
* **EF Core Cascade Navigation:** `BookingPassenger` oluşturulurken `Passenger` entity referansı verilir (`new BookingPassenger(Id, passenger, seatId)`). Böylece EF Core bileti kaydederken yolcuyu veritabanına otomatik ekler (Foreign Key Violational crash engellenir).

---

## 💾 BÖLÜM 4: Veritabanı, Persistence ve DataSeeder (`Aviqora.Infrastructure`)

### 1. `AviqoraDbContext.cs`
PostgreSQL ile C# varlıklarımız arasındaki ana köprüdür. `OnModelCreating` içerisinde `ApplyConfigurationsFromAssembly` kullanılarak Fluent API ayarları otomatik yüklenir.

### 2. Fluent API Konfigürasyonları & Eşzamanlılık Koruması
* **[`SeatConfiguration.cs`](file:///c:/Users/Dell/Documents/PROJECT/Flight%20Booking%20System/services/aviqora-api/src/Aviqora.Infrastructure/Persistence/Configurations/SeatConfiguration.cs):**
  ```csharp
  builder.HasIndex(s => new { s.FlightId, s.SeatCode }).IsUnique();
  ```
  Aynı uçuşta iki tane "12A" koltuğunun oluşmasını engellemek için veritabanında **Unique Index** tanımlanmıştır. Bu bizim veritabanındaki son savunma hattımızdır.
* **Value Object Dönüşümleri:**
  * **`Money`:** `.ComplexProperty(f => f.BasePrice)` ile SQL'de `base_price_amount` (decimal) ve `base_price_currency` (varchar) olarak saklanır.
  * **`PNRCode`:** `HasConversion(pnr => pnr.Value, str => new PNRCode(str))` ile SQL'de 6 haneli `pnr` varchar(6) olarak tutulur.

### 3. `DataSeeder.cs` (Örnek Veri Yükleyici)
📌 **Konum:** [`Aviqora.Infrastructure/Persistence/DataSeeder.cs`](file:///c:/Users/Dell/Documents/PROJECT/Flight%20Booking%20System/services/aviqora-api/src/Aviqora.Infrastructure/Persistence/DataSeeder.cs)
* Uygulama kalktığında veritabanında havalimanı ve uçuş var mı kontrol eder.
* Boş ise otomatik olarak IST, SAW, BER, LHR havalimanlarını, TK1984 & VF2026 uçuşlarını ve Business/Economy koltuk haritalarını veritabanına yükler.

---

## ⚙️ BÖLÜM 5: Application, Controllers & Integration Testing

### 1. DTO (Data Transfer Object) Katmanı
* Sonsuz döngü çökmesini (`Circular Reference Crash`) ve PII sızıntılarını engellemek için `FlightDto`, `SeatDto`, `BookingResponseDto` yazılmıştır.

### 2. Service & Repository Akışları
* `FlightService` ve `BookingService` nesneleri `IFlightRepository` ve `IBookingRepository` üzerinden veritabanı sorgularını çalıştırır.
* Uçuş arama metodunda ([`FlightRepository.cs`](file:///c:/Users/Dell/Documents/PROJECT/Flight%20Booking%20System/services/aviqora-api/src/Aviqora.Infrastructure/Persistence/Repositories/FlightRepository.cs)) SQL JOIN sorgusu performans amacıyla indeksli `OriginAirportId` üzerinden optimize edilmiştir.

### 3. Integration Testing (`Aviqora.IntegrationTests`)
📌 **Konum:** [`Aviqora.IntegrationTests/`](file:///c:/Users/Dell/Documents/PROJECT/Flight%20Booking%20System/services/aviqora-api/tests/Aviqora.IntegrationTests/)
* **`Microsoft.AspNetCore.Mvc.Testing` & `WebApplicationFactory<Program>`:** Gerçek HTTP istekleriyle API'mizi in-memory çalıştırmamızı sağlar.
* **SQLite In-Memory Provider:** EF Core 9 `ComplexProperty` özelliğini destekleyen ilişkisel test veritabanı.
* **Test Sonuçları:** 4 Entegrasyon testi + 14 Birim testi = **18/18 (%100 Başarılı Passed)**.

---

## 📈 BÖLÜM 6: Git ve Sürüm Disiplini

Projede yapılan her geliştirme Conventional Commits standartlarına uygun olarak committen geçirilir:
* `feat(domain)`: Core varlıklar ve bilet yaşam döngüsü.
* `docs(architecture)`: Mimari dokümanlar ve güvenlik kuralları.
* `feat(api)`: EF Core, DbContext, Migrations, Application DTO/Services, DataSeeder, Integration Tests ve Controllers.
