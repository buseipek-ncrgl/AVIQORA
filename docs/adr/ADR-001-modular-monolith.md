# ADR-001: Neden Modular Monolith İle Başlıyoruz?

- **Tarih:** 2026-09-20
- **Durum:** Kabul Edildi (Accepted)
- **Yazarlar:** AVIQORA Mühendislik Ekibi

---

## 1. Bağlam (Context)

AVIQORA projesi, uçuş arama, rezervasyon, koltuk tutma, ödeme simülasyonu ve asenkron arka plan işleri gibi karmaşık iş süreçlerini içerir. Erken aşamada doğrudan mikroservis mimarisine geçmek; dağıtık işlem yönetimi (distributed transactions / Saga pattern), ağ gecikmeleri (network latency), servis arası iletişim karmaşıklığı ve altyapı maliyeti getirecektir.

## 2. Karar (Decision)

V1 ve V2 sürümlerinde mimariyi **Modular Monolith** olarak tasarlama kararı alınmıştır.
- Tüm iş mantığı ve API'ler tek bir ASP.NET Core projesi altında toplanır.
- Temel veri katmanı (Source of Truth) olarak **PostgreSQL** kullanılır.
- Kod iç yapısı **Clean Architecture** (Domain -> Application -> Infrastructure -> Api) prensiplerine göre katmanlara ayrılır.
- İleride mikroservislere bölünebilecek biçimde domain sınırlan (Bounded Contexts) mantıksal olarak izole edilir.

## 3. Sonuçlar (Consequences)

### Olumlu:
- **Hızlı Geliştirme:** Dağıtık ağ karmaşıklığı olmadan lokal ortamda hızlı iteration imkanı.
- **ACID Garantisi:** Rezervasyon ve koltuk işlemlerinde PostgreSQL veritabanı seviyesinde %100 transaction güvenliği.
- **Kolay Test Edilebilirlik:** In-memory veya tek bir test veritabanı ile uçtan uca test yazabilme.
- **Düşük Kaynak Tüketimi:** 12 GB RAM sınırında rahat çalışabilme.

### Olumsuz / Dikkat Edilmesi Gerekenler:
- Katman bağımlılıklarına dikkat edilmezse monolit spaghetti koda dönüşebilir. Bu durum Clean Architecture bağımlılık kuralları (Dependency Rule) ile sıkı bir şekilde engellenecektir.
