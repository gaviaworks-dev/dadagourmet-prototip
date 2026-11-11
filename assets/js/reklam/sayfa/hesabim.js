/* Hesabım içerik sayfaları reklam çizicisi (reklam-detay, 11 Kas). REKLAM-YERLESIM "Hesabım, Kaydedilenler" HS-SB1: içerik sonunda
   şerit (panel resources/views/hesap/kaydedilenler.blade.php:219, Gastro Mutfak Defterim kalıbı). Yollar reklam-yerlesim.json
   `hesap` satırı: Gurme Panelim (Kaydedilenler = Gurme Favorilerim), Listelerim, Etkinliklerim, Rozetlerim. Ayarlar, bildirimler,
   çözüm merkezi, ödemeler, paketler ve keşif tercihleri reklamsız (işaret yok). İşaret sekme gövdesinin (.modul-govde) DIŞINDA:
   sekme geçişi (sekme-gecis.js) gövdeyi değiştirse de şerit yerinde kalır. Bant `.wrap.rk-sar` hesabın `.kap` kolonuna oturur.
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
  var KODLAR = ['HS-SB1'];
  KODLAR.forEach(function (kod) {
    R.ciz(kod, function (k, o) {
      var kap = document.createElement('aside');
      kap.className = 'rk-slot';
      hazir.then(function () {
        var D = window.dgReklamDetay, B = window.dgReklamBilesen;
        if (!(D && D.doldur(kap, k, o)) && B && B[k.bicim]) { yedek(kap, B[k.bicim](k, o)); }
        var sar = kap.parentElement && kap.parentElement.classList.contains('rk-sar') ? kap.parentElement : null;
        if (sar) { sar.classList.add('kap', 'rk-hs-sar'); }
        R.yogunluk();
      });
      return kap;
    });
  });
})();
