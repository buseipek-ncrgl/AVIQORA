# AVIQORA — Intelligent Airline Reservation & Operations Platform

> **AVIQORA**; uçuş arama, rezervasyon, yolcu, koltuk, PNR, ödeme simülasyonu ve check-in süreçlerini; güvenli transaction/concurrency mekanizmaları, Redis tabanlı geçici koltuk tutma, RabbitMQ tabanlı asenkron işler, ML tahminleri ve tool-calling destekli AI seyahat asistanı ile birleştiren cloud-ready havayolu rezervasyon ve operasyon platformudur.

---

## 🏗️ Mimari Özeti

- **Web Application (`apps/web`):** Next.js (React + TypeScript) - Mobile-First Responsive Passenger & Admin Web UI.
- **Core API (`services/aviqora-api`):** ASP.NET Core 9.0 Web API (Clean Architecture / Modular Monolith).
  - `Aviqora.Domain`: İş kuralları, Entity'ler, Value Object'ler ve Invariant'lar (Bağımsız Çekirdek).
  - `Aviqora.Application`: Kullanım senaryoları (Use Cases), DTO'lar, Kontratlar ve Servis Arayüzleri.
  - `Aviqora.Infrastructure`: PostgreSQL (EF Core), Redis, RabbitMQ ve Dış Servis Entegrasyonları.
  - `Aviqora.Api`: REST Endpoint'leri, Middleware, Güvenlik ve Dependency Injection.
- **Databases & Cache:** PostgreSQL (Transactional Source of Truth), Redis (Seat hold & Cache), MongoDB (AI sohbet transcript'leri).

---

## 🚀 Hızlı Başlangıç (Quick Start)

### Gereksinimler
- .NET 9 SDK
- Node.js (v20+)
- Docker Desktop

---

## 📄 Dokümantasyon & ADR

- Mimari Karar Kayıtları: `docs/adr/`
- API Dokümantasyonu: `docs/api/`
