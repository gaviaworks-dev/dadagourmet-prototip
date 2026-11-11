/* Dada Route ülke kaydı (rota-global, 11 Kas; Beyar: "Gourmet global bir proje"). Rota hiçbir yerde Türkiye varsaymaz: koridorun geçtiği
   ülkeler rota geometrisinden bulunur, yalnız o ülkelerin istasyon verisi kullanılır ve yüklenir.
   - Ülke kodu ISO 3166-1 alfa-2. Koordinattan ülke: `ulke.js` `dgUlke.konumdan` (kaba sınır kutusu + en yakın şehir; ~40 ülke), yoksa aşağıdaki kutular.
   - Veri dosyaları ÜLKE BAZLI ayrı (karar notu: yük ve önbellek). Türkiye'deki kullanıcı Fransa verisini indirmez, Fransa'daki Türkiye'ninkini;
     bir ülkenin verisi tazelenince yalnız o dosyanın önbelleği bozulur. Satır biçimi her ülkede aynı ve her satır `ulke` + `bolge` taşır,
     bu yüzden yüklenen dosyalar tek diziye (DG_YAKIT, DG_EV_SARJ) eklenince de kendini anlatır. Canlıda karşılığı ülke sütunlu tek tablo
     (`rota_istasyonlari`, tasks/rota-istasyon-api-notu.md) ve rota başına sunucu sorgusu; istemci yalnız koridordaki istasyonları alır.
   - `sayfayla`: dosya sayfanın kendi betik listesinde (prototipin ilk pazarı; canlıda istek ülkeye göre). `reklam`: yalnız reklam önizlemesi
     açıkken yüklenir (Türkiye şarj verisi reklam-rota'nın EV planlayıcısına aittir). `sarjOrganik`: organik "Şarj istasyonları" kartı
     bu ülkede gerçek veriyi kullanır (Türkiye'de kart örnek verisiyle kalır: rota-istasyon-api-notu, Route sahibinin açık kararı).
   - `para`: kreatif metnindeki fiyatın para birimi (`{fiyat}`), biçim Türkçe arayüzün yerel ayarıyla (tr-TR).
   Yeni ülke = buraya bir kayıt + aynı satır biçiminde veri dosyaları. */
(function () {
  'use strict';
  var KOK = document.documentElement.dataset.kok || './';
  var ULKE = {
    TR: { ad: 'Türkiye', para: 'TRY', kutu: [[35.8, 25.6, 42.2, 44.9]], merkez: [39.0, 35.0],
      yakit: { dosya: 'assets/js/rota-yakit-veri.js', sayfayla: true }, sarj: { dosya: 'assets/js/reklam/ev-sarj-veri.js', reklam: true }, sarjOrganik: false },
    FR: { ad: 'Fransa', para: 'EUR', kutu: [[42.3, -5.2, 51.1, 8.3], [41.3, 8.5, 43.1, 9.6]], merkez: [46.6, 2.4],
      yakit: { dosya: 'assets/js/rota-yakit-veri-fr.js' }, sarj: { dosya: 'assets/js/rota-sarj-veri-fr.js' }, sarjOrganik: true }
  };
  var rad = Math.PI / 180;
  var km = function (a, b, c, d) { var x = (d - b) * rad * Math.cos((a + c) * rad / 2), y = (c - a) * rad; return Math.sqrt(x * x + y * y) * 6371; };
  /* Koordinattan ülke: `dgUlke.konumdan` varsa o; yoksa kaydın kutuları (çakışırsa merkeze yakın olan) */
  function ulkeNe(lat, lng) {
    if (window.dgUlke && window.dgUlke.konumdan) { var k = window.dgUlke.konumdan(+lat, +lng); if (k) { return k; } }
    var ad = Object.keys(ULKE).filter(function (u) { return ULKE[u].kutu.some(function (b) { return lat >= b[0] && lat <= b[2] && lng >= b[1] && lng <= b[3]; }); });
    return ad.sort(function (a, b) { return km(lat, lng, ULKE[a].merkez[0], ULKE[a].merkez[1]) - km(lat, lng, ULKE[b].merkez[0], ULKE[b].merkez[1]); })[0] || '';
  }
  /* Rotanın geçtiği ülkeler (yolculuk sırasıyla): çizgi ~10 km'de bir örneklenir, uçlar her zaman */
  var onb = { a: '', l: [] };
  function rotaUlkeleri(geo) {
    geo = geo || window.dgRotaGeometri || [];
    if (!geo.length) { return []; }
    var a = geo.length + ':' + geo[0].join(',') + ':' + geo[geo.length - 1].join(',');
    if (a === onb.a) { return onb.l.slice(); }
    var l = [], ekle = function (c) { var u = ulkeNe(+c[0], +c[1]); if (u && l.indexOf(u) < 0) { l.push(u); } }, top = 0;
    ekle(geo[0]);
    for (var i = 1; i < geo.length; i++) { top += km(geo[i - 1][0], geo[i - 1][1], geo[i][0], geo[i][1]); if (top >= 10) { ekle(geo[i]); top = 0; } }
    ekle(geo[geo.length - 1]);
    onb = { a: a, l: l }; return l.slice();
  }
  /* Dosya yükleme: aynı dosya bir kez; sayfa listesinde olan yüklü sayılır */
  var yuklu = {}, bekleyen = {};
  function yuklendi(d) { return !!yuklu[d] || !!document.querySelector('script[src$="' + d + '"]:not([data-rota-ulke])'); }
  function yukle(d) {
    if (yuklendi(d)) { return null; }
    if (bekleyen[d]) { return bekleyen[d]; }
    bekleyen[d] = new Promise(function (t) {
      var s = document.createElement('script'); s.src = KOK + d; s.setAttribute('data-rota-ulke', '');
      s.onload = s.onerror = function () { yuklu[d] = true; delete bekleyen[d]; t(); };
      document.body.appendChild(s);
    });
    return bekleyen[d];
  }
  /* Rotanın ülkelerinin verisi hazır mı; değilse yükler. Yüklenecek bir şey yoksa null (çağıran eşzamanlı sürer) */
  function hazirla(geo, o) {
    var reklam = !!(o && o.reklam), is = [];
    rotaUlkeleri(geo).forEach(function (u) {
      var K = ULKE[u]; if (!K) { return; }
      [K.yakit, K.sarj].forEach(function (v) { if (v && !v.sayfayla && (reklam || !v.reklam)) { var p = yukle(v.dosya); if (p) { is.push(p); } } });
    });
    if (!is.length) { return null; }
    return Promise.all(is).then(function () { document.dispatchEvent(new CustomEvent('dg-rota-veri', { detail: { ulkeler: rotaUlkeleri(geo) } })); });
  }
  /* Kreatif ya da marka bu ülkelerden birini hedefliyor mu (alan yoksa hepsini) */
  var hedefler = function (x, ulkeler) { return !x || !x.ulkeler || x.ulkeler.indexOf('*') >= 0 || x.ulkeler.some(function (u) { return ulkeler.indexOf(u) >= 0; }); };
  /* Fiyat: ülkenin para birimiyle, Türkçe arayüz biçimi */
  function fiyat(tutar, ulke) {
    var p = (ULKE[ulke] || {}).para; if (tutar == null || !p) { return ''; }
    try { return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: p }).format(tutar); } catch (e) { return tutar + ' ' + p; }
  }
  window.dgRotaUlke = {
    ULKE: ULKE, ulkeNe: ulkeNe, rotaUlkeleri: rotaUlkeleri, hazirla: hazirla, hedefler: hedefler, fiyat: fiyat,
    sarjOrganik: function (l) { return (l || rotaUlkeleri()).filter(function (u) { return ULKE[u] && ULKE[u].sarjOrganik; }); }
  };
})();
