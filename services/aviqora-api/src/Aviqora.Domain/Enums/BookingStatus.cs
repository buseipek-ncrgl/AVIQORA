namespace Aviqora.Domain.Enums;

public enum BookingStatus
{
    Draft = 1,       // Rezervasyon oluşturuldu
    Held = 2,        // Koltuk geçici olarak tutuldu (TTL)
    Confirmed = 3,   // Ödeme alındı, bilet kesildi
    Cancelled = 4,   // Kullanıcı veya sistem tarafından iptal edildi
    Expired = 5      // Ödeme yapılmadığı için süresi doldu
}
