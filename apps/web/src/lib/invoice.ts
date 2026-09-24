import { BookingDto } from '@/types/api';

export function generateEInvoiceHtml(booking: BookingDto): string {
  const invoiceDate = new Date().toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const invoiceNo = `EF2026${booking.pnrCode.toUpperCase()}99`;
  const primaryPassenger = booking.passengers?.[0]?.passengerName || 'Değerli Müşterimiz';
  const totalAmount = booking.totalAmount || 1800;
  const kdvRate = 0.20;
  const matrah = Math.round((totalAmount / (1 + kdvRate)) * 100) / 100;
  const kdvAmount = Math.round((totalAmount - matrah) * 100) / 100;

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <title>E-Fatura - AVIQORA HAVAYOLARI - ${booking.pnrCode}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 30px;
      color: #1e293b;
      background-color: #ffffff;
      font-size: 13px;
      line-height: 1.5;
    }
    .invoice-card {
      max-width: 800px;
      margin: 0 auto;
      border: 1px solid #cbd5e1;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #2563eb;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }
    .brand {
      font-size: 24px;
      font-weight: 900;
      color: #2563eb;
      letter-spacing: 1px;
    }
    .sub-brand {
      font-size: 10px;
      color: #d97706;
      font-weight: 800;
      letter-spacing: 2px;
    }
    .invoice-title {
      font-size: 18px;
      font-weight: 900;
      color: #0f172a;
      text-align: right;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 28px;
    }
    .info-box {
      background-color: #f8fafc;
      padding: 16px;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
    }
    .info-box h3 {
      margin: 0 0 8px 0;
      font-size: 11px;
      text-transform: uppercase;
      color: #64748b;
      letter-spacing: 1px;
    }
    .info-box p {
      margin: 3px 0;
      font-weight: 600;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    th {
      background-color: #f1f5f9;
      color: #334155;
      font-weight: 800;
      text-align: left;
      padding: 10px 12px;
      font-size: 11px;
      border-bottom: 2px solid #cbd5e1;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 12px;
    }
    .totals {
      width: 280px;
      margin-left: auto;
      margin-bottom: 30px;
    }
    .totals div {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      font-size: 13px;
    }
    .totals .grand-total {
      font-size: 16px;
      font-weight: 900;
      color: #059669;
      border-top: 2px solid #059669;
      padding-top: 10px;
      margin-top: 6px;
    }
    .footer-seal {
      border-top: 1px dashed #cbd5e1;
      padding-top: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: #64748b;
    }
    .stamp {
      border: 2px solid #059669;
      color: #059669;
      padding: 8px 16px;
      font-weight: 900;
      border-radius: 6px;
      text-transform: uppercase;
      letter-spacing: 1px;
      display: inline-block;
    }
    @media print {
      body { padding: 0; background: none; }
      .invoice-card { border: none; box-shadow: none; padding: 0; }
    }
  </style>
</head>
<body>
  <div class="invoice-card">
    <div class="header">
      <div>
        <div class="brand">AVIQORA AIRWAYS</div>
        <div class="sub-brand">TÜRKIYE CIVİL HAVACILIK A.Ş.</div>
        <p style="margin: 6px 0 0; color: #64748b; font-size: 11px;">
          Büyükdere Cad. No:185 Maslak / İSTANBUL<br />
          Büyük Mükellefler V.D. - 1049204910 | Mersis: 010492049100001
        </p>
      </div>
      <div style="text-align: right;">
        <div class="invoice-title">E-ARŞİV FATURA</div>
        <p style="margin: 4px 0; font-weight: 800; color: #2563eb;">Fatura No: ${invoiceNo}</p>
        <p style="margin: 2px 0; color: #64748b;">Tarih: ${invoiceDate}</p>
        <p style="margin: 2px 0; color: #64748b;">PNR Kodu: <strong>${booking.pnrCode}</strong></p>
      </div>
    </div>

    <div class="info-grid">
      <div class="info-box">
        <h3>SAYIN (MÜŞTERİ / ALICI)</h3>
        <p style="font-size: 14px; font-weight: 800; color: #0f172a;">${primaryPassenger}</p>
        <p>T.C. Kimlik / Pasaport No: 10987654321</p>
        <p>Ödeme Tipi: Kredi Kartı / 3D Secure Onaylı</p>
      </div>

      <div class="info-box">
        <h3>UÇUŞ &amp; PARKURLAR</h3>
        <p>Uçuş No: <strong>${booking.flightNumber}</strong></p>
        <p>Güzargah: <strong>${booking.departureAirport} ➔ ${booking.arrivalAirport}</strong></p>
        <p>Yolcu Sayısı: <strong>${booking.passengers?.length || 1} Yolcu</strong></p>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Hizmet / Açıklama</th>
          <th style="text-align: center;">Miktar</th>
          <th style="text-align: right;">Birim Fiyat</th>
          <th style="text-align: center;">KDV %</th>
          <th style="text-align: right;">Toplam (TL)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>Uçuş Bileti Hakediş Bedeli</strong><br />
            <span style="font-size: 11px; color: #64748b;">${booking.departureAirport} - ${booking.arrivalAirport} Uçak Bileti (${booking.flightNumber})</span>
          </td>
          <td style="text-align: center;">${booking.passengers?.length || 1}</td>
          <td style="text-align: right;">₺${(matrah).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
          <td style="text-align: center;">%20</td>
          <td style="text-align: right;">₺${(matrah).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
        </tr>
      </tbody>
    </table>

    <div class="totals">
      <div>
        <span>Ara Toplam (Matrah):</span>
        <strong>₺${matrah.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</strong>
      </div>
      <div>
        <span>Hesaplanan KDV (%20):</span>
        <strong>₺${kdvAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</strong>
      </div>
      <div class="grand-total">
        <span>ÖDENEN GENEL TOPLAM:</span>
        <span>₺${totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
      </div>
    </div>

    <div class="footer-seal">
      <div>
        <p style="margin: 0; font-weight: 700;">GİB E-Fatura Entegratörü: Aviqora Digital Hub A.Ş.</p>
        <p style="margin: 2px 0 0; font-size: 10px;">Bu belge 213 Sayılı VUK Uyarınca E-Arşiv Fatura Olarak Düzenlenmiştir.</p>
      </div>
      <div class="stamp">
        ✓ GİB ONAYLI E-FATURA
      </div>
    </div>
  </div>

  <script>
    window.onload = function() {
      // Auto trigger print dialog when opened
      setTimeout(function() { window.print(); }, 500);
    };
  </script>
</body>
</html>`;
}

export function downloadEInvoicePdfOrPrint(booking: BookingDto) {
  const htmlContent = generateEInvoiceHtml(booking);
  
  // 1. Open in new printable browser window
  const printWindow = window.open('', '_blank', 'width=900,height=800,scrollbars=yes');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }

  // 2. Also trigger direct HTML file download blob for offline saving
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `AVIQORA_E_FATURA_${booking.pnrCode}_${booking.departureAirport}_${booking.arrivalAirport}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
