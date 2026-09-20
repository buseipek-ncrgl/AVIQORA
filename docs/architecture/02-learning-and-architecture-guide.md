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
2. **`Aviqora.Application` (Şef):** İşi kimin yapacağını (Repository) çağırır, Domain kurallarını çalıştırır, istemciye DTO döner.
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

### 4. `Booking.cs` (Aggregate Root - Bilet Rezervasyonu)
* **Bilet Yaşam Döngüsü:** `Draft` -> `Held` (Koltuk tutuldu) -> `Confirmed` (Ödeme alındı) -> `Expired` (Süre doldu) / `Cancelled` (İptal edildi).

---

## 💾 BÖLÜM 4: Veritabanı ve Persistence Katmanı (`Aviqora.Infrastructure`)

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

---

## ⚙️ BÖLÜM 5: Application ve API Katmanı (`Aviqora.Application` & `Aviqora.Api`)

### 1. DTO (Data Transfer Object) Katmanı
* **Neden Entity'ler dışarı açılmaz?**
  1. **Circular Reference Crash:** `Flight -> Seats -> Flight -> Seats...` sonsuz JSON serileştirme döngüsünü engellemek için.
  2. **Veri Gizliliği:** İç veritabanı sütunlarını gizlemek için.
  3. **Esneklik:** DB modeli değiştiğinde API sözleşmesini korumak için.

### 2. Repository Pattern & Dependency Inversion Principle
* `IFlightRepository` ve `IBookingRepository` arayüzleri `Aviqora.Application` katmanında tanımlanır.
* Implementasyonları (`FlightRepository`, `BookingRepository`) `Aviqora.Infrastructure` katmanında EF Core ile yazılır.

### 3. Service Akışları (`FlightService.cs` & `BookingService.cs`)
* Uçuş arama, koltuk haritası getirme, PNR üretme, koltuk tutma (`seat.Hold()`) ve bilet oluşturma akışları yürütülür.

### 4. Controllers (`FlightsController.cs` & `BookingsController.cs`)
* `GET /api/flights/search`: Şehir ve tarihe göre uçuş arar.
* `GET /api/flights/{id}/seats`: Koltuk haritasını döner.
* `POST /api/bookings`: Bilet rezervasyonu oluşturur.
* `GET /api/bookings/{pnr}`: PNR ile bilet detaylarını getirir.

---

## 📈 BÖLÜM 6: Git ve Sürüm Disiplini

Projede yapılan her geliştirme Conventional Commits standartlarına uygun olarak committen geçirilir:
* `feat(domain)`: Core varlıklar ve bilet yaşam döngüsü.
* `docs(architecture)`: Mimari dokümanlar ve güvenlik kuralları.
* `feat(api)`: EF Core, DbContext, Migrations, Application DTO/Services ve Controllers.
