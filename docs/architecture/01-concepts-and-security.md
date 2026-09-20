# AVIQORA — Temel Mimari Kavramlar, Güvenlik ve Sıfırdan Rehber

Bu doküman, projede kullanılan tüm mimari desenlerin, güvenlik standartlarının ve dosya yapılarının **hiç bilmeyen bir mühendise anlatır gibi** detaylı açıklamasıdır.

---

## 🔒 1. Güvenlik Mimarısı ve F12 (Geliştirici Araçları) Politikası

### A. F12 (İstemci) Katmanında Asla Görünmemesi Gerekenler
1. **Veritabanı ve Gizli Anahtarlar (Secrets):** PostgreSQL bağlantı cümlesi (Connection string), JWT imzalama anahtarları, Redis ve RabbitMQ şifreleri, OpenAI API anahtarları.
2. **Kritik İş Mantığı & Algoritmalar:** Dinamik bilet fiyatlandırma algoritmaları, indirim hesaplama mantığı (tamamı backend'de çalışır).
3. **Hassas Yolcu Verileri (PII):** Yolcunun TCKN / Pasaport numarası istemciye tam açık olarak gönderilmez (Örn: `123*****89` şeklinde maskelenir).
4. **Detaylı Sistem Hataları (Stack Trace):** Sunucu hatası durumunda veritabanı tablo adları veya C# satır numaraları F12 Network sekmesinde görünmez. Bunun yerine standart **RFC 7807 ProblemDetails** hata nesnesi dönülür.

### B. Zero Trust (Sıfır Güven) ve Güvenlik Prensipleri
- **Prensip 1: İstemciye (F12) Asla Güvenme!**
  * Kullanıcı F12 Console üzerinden JavaScript ile isteği değiştirebilir veya tarayıcıdaki değişkenleri editleyebilir.
  * Bu yüzden kullanıcı mobilden de girse, web'den de girse backend (`ASP.NET Core`) gelen HER isteği sıfırdan doğrular (Authorization & Validation).
- **Prensip 2: Kaynak Sahipliği Kontrolü (Resource Ownership)**
  * Kullanıcı A, F12 veya URL adresi üzerinden bilet ID'sini `101` yerine `102` yaparak başkasının biletini göremez (`/api/bookings/102`). Backend `Booking.UserId == CurrentUserId` kontrolü yapar.
- **Prensip 3: Ödeme Kartı Verisi Saklamama**
  * Gerçek veya simüle edilmiş kart numaraları veritabanında SAKLANMAZ. Tokenization (Jetonlaştırma) mimarisi kullanılır.

---

## 🏛️ 2. Temel Mimari Kavramlar (Sıfırdan Anlatım)

### Monolith vs Microservices vs Modular Monolith
- **Monolith (Monolit):** Tüm uygulamanın (bilet arama, ödeme, e-posta) tek bir büyük çuvalın içinde olmasıdır. Karmaşıklaştıkça yönetmesi imkansızlaşır.
- **Microservices (Mikroservisler):** Tüm modüllerin ayrı ayrı sunucularda çalışmasıdır. Başlangıçta aşırı ağ karmaşıklığı ve yüksek RAM/maliyet getirir.
- **Modular Monolith (Bizim Seçimimiz):** Kod tek bir projede derlenir (12 GB RAM dostudur), ancak projenin içi aşılmaz duvarlarla (`Domain`, `Application`, `Infrastructure`, `Api`) modüllere bölünmüştür. Temizdir, hızlıdır, gelecekte istenirse mikroservislere kolayca ayrılabilir.

### Clean Architecture (Temiz Mimari) Bağımlılık Kuralı
- Elektrik prizi (PostgreSQL) değişse bile evin içindeki lambalar (İş Mantığı / Domain) çalışmaya devam etmelidir.
- `Aviqora.Domain` katmanı tamamen bağımsızdır. `EF Core`, `PostgreSQL`, `HTTP` veya `Next.js` kelimelerini dahi bilmez!

---

## 📦 3. Dosya Dosya Detaylı İnceleme ve "Must-Know" Kurallar

### 1. `Seat.cs` (Koltuk Entity'si)
- **`private set`:** Dışarıdan kimse `seat.Status = SeatStatus.Occupied` yazarak koltuk durumunu kafasına göre değiştiremez.
- **`Hold()`, `Occupy()`, `Release()` Metotları:** Durum değişimi sadece bu metotlar üzerinden yapılabilir (Encapsulation). Metot önce koltuğun müsait olup olmadığını kontrol eder.
- **`Guid` (Eşsiz Kimlik):** Otomatik artan `1, 2, 3` ID'ler yerine `Guid` kullanılır. Böylece F12 veya URL'den tahmin edilerek veri sızdırılamaz.

### 2. `Money.cs` (Value Object - Para)
- **Neden Struct/Record?** C# `record struct` bellekte ışık hızında çalışır ve iki para nesnesinin değerleri aynıysa eşit (`==`) kabul edilmesini sağlar.
- **Neden sadece `decimal` değil?** 100 TL ile 100 USD'nin yanlışlıkla toplanmasını engellemek için miktar + para birimi ikilisi birlikte tutulur.

### 3. `PNRCode.cs` (Value Object - Rezervasyon Kodu)
- **Regex Koruması:** PNR kodunun tam olarak 6 haneli, büyük harf ve rakamlardan oluşmasını garanti eder.

### 4. `Booking.cs` (Aggregate Root - Rezervasyon)
- **Bilet Yaşam Döngüsü:** Bilet `Draft` olarak doğar, koltuk tutulduğunda `Held` olur, ödeme yapılınca `Confirmed` olur. Süresi dolarsa `Expired`, kullanıcı vazgeçerse `Cancelled` olur.
- **Invariant Protection:** İptal edilmiş bir bilet onaylanamaz, süresi dolmuş bir bilet için ödeme kabul edilemez.
