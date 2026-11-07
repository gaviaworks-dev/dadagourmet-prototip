/* "Rotayı telefona gönder" örnek akışının metni. Gerçek gönderim, numara ve bağ yok; `.example` alan adı ayrılmıştır, hiçbir yere gitmez.
   Mobil uygulamaya taşınacak parça: metin burada, davranış `sayfa/rota-telefon.js`, kabuk `_src/parcalar/rota-telefon.html`. */
window.DG_ROTA_TELEFON = {
  dugme: { ad: 'Rotayı telefona gönder', alt: 'QR veya kısa bağ ile' },
  kisaBag: 'dadagourmet.example/r/ornek',
  qrNot: 'Örnek görünüm; okutulamaz, hiçbir yere gitmez.',
  adim: {
    hazir: { ikon: 'fa-mobile-screen', baslik: 'Rotayı telefona gönder', metin: 'QR kodu telefonla okut ya da kısa bağı aç. Rota Dada Gourmet uygulamasında açılır.', birincil: 'Uygulamaya Gönder', ikincil: 'Vazgeç' },
    gonderildi: { ikon: 'fa-circle-check', baslik: 'Uygulamaya gönderildi', metin: 'Akışın son adımı böyle görünür. Bu bir örnek; gerçek gönderim yapılmadı.', birincil: 'Tamam' }
  }
};
