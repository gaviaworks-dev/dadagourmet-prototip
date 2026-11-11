/* Mekân detayı reklam çizicileri (reklam-detay, 11 Kas). İşaretler _src/sayfalar/mekan/mikla/index.html, panel
   resources/views/site/mekanlar/show.blade.php sırasıyla: MD-INT içerik sütununun (md-main) sonu, MD-SB1 sağ kenar sütununda bilgi
   kartının altı, MD-END içerik bölümünden (md-sec) sonra kendi bandında (data-rk-sar).
   - MD-SB1 havuzu (reklam-marka, 11 Kas): Kahve Dünyası kenar kutusu (`sablon: kare`, pay 100) + rezervasyon/ödeme kampanya kartı
     (Mastercard, Visa; `sablon: kampanya`, pay 25): rezervasyon düğmesiyle aynı kenar sütununda; çağrısı sayfanın kendi rezervasyon
     penceresini açar (#openRsv). REKLAM-YERLESIM'de yeni alan açılmadı: MD-SB1'in kreatifleridir.
   - MD-END havuzu = içerik sonu native öneri (`sablon: son`): Türk Hava Yolları, yedek Kahve Dünyası. reklam-son-duzelt (Beyar kararı
     11 Kas): mekân detayında rakip restoran reklamı yok; süzgeç çekirdekte (`rakipRestoranYok`), Divan/Maromi ve The House Café çıktı.
   - MD-INT çizicisi reklam-interaktif ajanında (burada yalnız işaret). Standart katman (side, pop-up) çekirdekte; eylem çubuğu
     (.vd-actbar) olduğu için alt bant basılmaz. Biçimler assets/js/reklam/sayfa/detay-ortak.js. */
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
  ['MD-SB1', 'MD-END'].forEach(function (kod) {
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
