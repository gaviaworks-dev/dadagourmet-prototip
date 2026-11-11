/* Ana sayfa reklam çizicileri (reklam-detay, 11 Kas): AS-T1, AS-M1, AS-B1 zengin şerit (`sablon: zengin`). İşaretler
   _src/sayfalar/index.html, panel resources/views/site/anasayfa.blade.php sırasıyla, hepsi kendi bandında (data-rk-sar):
   AS-T1 ilk bölümden (Mekân Konseptleri) sonra (hero'nun hemen altına konmaz: hero'yu izleyen öğe -22 px ile hero'ya biner),
   AS-M1 Keşfet modüllerinden sonra, AS-INT Yaklaşan Etkinlikler'den sonra (çizicisi reklam-rota'da), AS-B1 sayfa sonu.
   Ana sayfanın yerleşim satırındaki betik reklam-rota'nın `sayfa/anasayfa.js`idir (AS-INT); bu dosyayı o betik yükler, yani
   çizim çekirdeğin ilk yerleştirmesinden SONRA gelir: kayıttan sonra alanlar basılmışsa `yenile()` bir kez yeniden yerleştirir.
   Bu dosya yüklenmezse üç şerit kanon varsayılanıyla (bicim: serit) basılır. Standart katman çekirdekte. */
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
  var KODLAR = ['AS-T1', 'AS-M1', 'AS-B1'];
  KODLAR.forEach(function (kod) {
    R.ciz(kod, function (k, o) {
      var kap = document.createElement('aside');
      kap.className = 'rk-slot';
      hazir.then(function () {
        var D = window.dgReklamDetay, B = window.dgReklamBilesen;
        if (!(D && D.doldur(kap, k, o)) && B && B[k.bicim]) { yedek(kap, B[k.bicim](k, o)); }
        var sar = kap.parentElement && kap.parentElement.classList.contains('rk-sar') ? kap.parentElement : null;
        if (sar && o.isaret && o.isaret.hasAttribute('data-rk-son')) { sar.classList.add('rk-sar-son'); }
        R.yogunluk();
      });
      return kap;
    });
  });
  var d = R.durum && R.durum();
  if (d && d.acik && d.basilan.some(function (k) { return KODLAR.indexOf(k) >= 0; })) { R.yenile(); }
})();
