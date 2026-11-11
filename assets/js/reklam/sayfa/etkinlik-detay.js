/* Etkinlik detayı reklam çizicisi (reklam-detay, 11 Kas). İşaret _src/sayfalar/etkinlik-detay/index.html: ED-SB1 kenar sütununun
   (evd-side) sonu, eylem kartının (Randevu Oluştur / Bilet) altı; panel resources/views/site/etkinlikler/show.blade.php:344.
   Kahve Dünyası tadım atölyesi kutusu (`sablon: kare`, 4:3 medya). Standart katman yok (REKLAM-YERLESIM yol listesinde değil).
   Biçim assets/js/reklam/sayfa/detay-ortak.js. */
(function () {
  'use strict';
  var R = window.dgReklam;
  if (!R || !R.ciz) { return; }
  var KOK = document.documentElement.dataset.kok || './';
  var hazir = window.dgReklamDetayHazir || (window.dgReklamDetayHazir = new Promise(function (tamam) {
    if (window.dgReklamDetay) { tamam(); return; }
    var s = document.createElement('script');
    s.src = KOK + 'assets/js/reklam/sayfa/detay-ortak.js';
    s.onload = s.onerror = function () { tamam(); };
    document.body.appendChild(s);
  }));
  /* Ortak biçim dosyası yüklenemezse kanon varsayılanı aynı kabın içine (kap çekirdeğin söküm listesinde) */
  var yedek = function (kap, html) {
    var t = document.createElement('template'); t.innerHTML = String(html || '').trim();
    var n = t.content.firstElementChild; if (!n) { return; }
    [].slice.call(n.attributes).forEach(function (a) { kap.setAttribute(a.name, a.value); });
    kap.innerHTML = n.innerHTML;
  };
  var KODLAR = ['ED-SB1'];
  KODLAR.forEach(function (kod) {
    R.ciz(kod, function (k, o) {
      var kap = document.createElement('aside');
      kap.className = 'rk-slot';
      hazir.then(function () {
        var D = window.dgReklamDetay, B = window.dgReklamBilesen;
        if (!(D && D.doldur(kap, k, o)) && B && B[k.bicim]) { yedek(kap, B[k.bicim](k, o)); }
        R.yogunluk();
      });
      return kap;
    });
  });
})();
