namespace Aviqora.Application.Common.Events;

/// <summary>
/// Bilet rezervasyonu ve ödemesi başarıyla tamamlandığında RabbitMQ mesaj kuyruğuna fırlatılan Olay (Event Payload).
/// Olay Odaklı Mimari (Event-Driven Architecture) prensipleri gereği immutable (değiştirilemez) record yapısındadır.
/// </summary>
public record BookingConfirmedEvent(
    Guid BookingId,
    string PnrCode,
    string PassengerName,
    string PassengerEmail,
    string FlightNumber,
    string SeatCode,
    decimal TotalAmount,
    string Currency,
    DateTime ConfirmedAt
);
