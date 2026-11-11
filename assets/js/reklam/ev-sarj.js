/* EV şarj planlayıcı motoru (reklam-rota, 11 Kas). Yalnız reklam önizlemesi açıkken yüklenir: Dada Route (RT-SARJ, RT-OZET,
   `sayfa/rota.js`) ve ana sayfa AS-INT (`sayfa/anasayfa.js`) aynı motoru kullanır. Gerçek hayattaki karşılığı: Google Maps EV şarj
   planlayıcısı (menzile göre şarj durakları) + sponsorlu şarj ağı listelemesi + otomotiv markası rich media.
   Veri: şarj noktaları `ev-sarj-veri.js` (OpenStreetMap, ODbL), mekânlar `mekan-veri.js` (DG_MEKANLAR, prototipteki gerçek kayıtlar).
   Araç menzilleri markaların kamuya açık teknik sayfalarından (WLTP, aşağıda `kaynak`); yol tüketimi tahmindir:
   otoyolda kullanılabilir menzil WLTP'nin %80'i (OTOYOL), yola %90 dolu çıkılır, her şarj %10 → %80, %10 yedek kalır.
   Sapma Dada Route'un kendi hesabı: rotaya uzaklık d km → gidiş-dönüş 2d, `sapmaHiziKmS` (55 km/sa) ile dakika.
   Saf işlevler; DOM yok. `window.dgEvSarj`. */
(function () {
  'use strict';
  var OTOYOL = 0.8, CIKIS = 0.8, SARJ = 0.7, YURU_M = 1000, YURU_HIZ = 80;
  /* Menzil ve şarj süresi kaynakları (11 Kas 2026 okundu). Tesla Türkiye sayfası doğrudan açılamadı (403); değer sayfanın arama özetinden */
  var ARACLAR = [
    { id: 'togg-t10x', marka: 'togg', ad: 'Togg T10X', surum: 'Uzun Menzil · arkadan itiş', wltp: 523, sarjDk: 26.5, sarjNot: '%20 → %80, 180 kW DC', ag: 'trugo', kaynak: 'togg.com.tr/t10x' },
    { id: 'togg-t10f', marka: 'togg', ad: 'Togg T10F', surum: 'Uzun Menzil', wltp: 623, sarjDk: 26.5, sarjNot: '%20 → %80, 180 kW DC', ag: 'trugo', kaynak: 'togg.com.tr/t10f' },
    { id: 'tesla-model-y', marka: 'tesla', ad: 'Tesla Model Y', surum: 'Premium · arkadan itiş', wltp: 600, sarjDk: 25, sarjNot: 'Supercharger, süre tahmini', ag: 'tesla-supercharger', kaynak: 'tesla.com/tr_TR/modely' },
    { id: 'diger', marka: null, ad: 'Başka bir elektrikli araç', surum: 'varsayılan menzil', wltp: 400, sarjDk: 30, sarjNot: 'DC, süre tahmini', ag: null, kaynak: 'varsayım (WLTP 400 km)' }
  ];
  var aracBul = function (id) { return ARACLAR.filter(function (a) { return a.id === id; })[0] || null; };

  var rad = Math.PI / 180;
  var km = function (a, b, c, d) { var x = (c - a) * rad, y = (d - b) * rad, h = Math.sin(x / 2) * Math.sin(x / 2) + Math.cos(a * rad) * Math.cos(c * rad) * Math.sin(y / 2) * Math.sin(y / 2); return 12742 * Math.asin(Math.sqrt(h)); };

  /* Rota geometrisi ([[enlem, boylam], …]) km düzlemine izdüşer; 10 km ızgarayla nokta → {d: rotaya km, s: rota başından km} */
  function hat(geo) {
    if (!geo || geo.length < 2) { return null; }
    var lat0 = 0; geo.forEach(function (c) { lat0 += +c[0]; }); lat0 /= geo.length;
    var kx = 111.32 * Math.cos(lat0 * rad), ky = 110.57, H = 10, P = geo.map(function (c) { return [+c[1] * kx, +c[0] * ky]; });
    var seg = [], izg = {}, top = 0, kutu = [90, 180, -90, -180];
    geo.forEach(function (c) { kutu = [Math.min(kutu[0], c[0]), Math.min(kutu[1], c[1]), Math.max(kutu[2], c[0]), Math.max(kutu[3], c[1])]; });
    for (var i = 1; i < P.length; i++) {
      var a = P[i - 1], b = P[i], u = Math.sqrt((b[0] - a[0]) * (b[0] - a[0]) + (b[1] - a[1]) * (b[1] - a[1]));
      seg.push({ a: a, b: b, u: u, s: top }); top += u;
      for (var x = Math.floor(Math.min(a[0], b[0]) / H); x <= Math.floor(Math.max(a[0], b[0]) / H); x++) {
        for (var y = Math.floor(Math.min(a[1], b[1]) / H); y <= Math.floor(Math.max(a[1], b[1]) / H); y++) { (izg[x + ':' + y] = izg[x + ':' + y] || []).push(seg.length - 1); }
      }
    }
    var olc = function (lat, lng, sinir) {
      var px = lng * kx, py = lat * ky, r = Math.ceil((sinir || 30) / H), cx = Math.floor(px / H), cy = Math.floor(py / H), en = { d: 1e9, s: 0 }, gor = {};
      for (var dx = -r; dx <= r; dx++) {
        for (var dy = -r; dy <= r; dy++) {
          var l = izg[(cx + dx) + ':' + (cy + dy)]; if (!l) { continue; }
          for (var k = 0; k < l.length; k++) {
            var j = l[k]; if (gor[j]) { continue; } gor[j] = 1;
            var q = seg[j], vx = q.b[0] - q.a[0], vy = q.b[1] - q.a[1], t = q.u ? Math.max(0, Math.min(1, ((px - q.a[0]) * vx + (py - q.a[1]) * vy) / (q.u * q.u))) : 0;
            var ex = q.a[0] + vx * t - px, ey = q.a[1] + vy * t - py, d = Math.sqrt(ex * ex + ey * ey);
            if (d < en.d) { en = { d: d, s: q.s + q.u * t }; }
          }
        }
      }
      return en;
    };
    /* Rota üstünde s km'deki nokta (şematik önizleme için) */
    var nokta = function (s) {
      for (var i = 0; i < seg.length; i++) { if (seg[i].s + seg[i].u >= s) { var q = seg[i], t = q.u ? (s - q.s) / q.u : 0; return [(q.a[1] + (q.b[1] - q.a[1]) * t) / ky, (q.a[0] + (q.b[0] - q.a[0]) * t) / kx]; } }
      return geo[geo.length - 1];
    };
    return { olc: olc, toplam: top, kutu: kutu, nokta: nokta };
  }
  var icinde = function (H, lat, lng, m) { return lat >= H.kutu[0] - m && lat <= H.kutu[2] + m && lng >= H.kutu[1] - m * 1.4 && lng <= H.kutu[3] + m * 1.4; };

  /* Koridordaki şarj noktaları: yalnız sapma toleransı içindekiler (yarıçap km) */
  function koridor(H, yaricap, arac) {
    var V = window.DG_EV_SARJ || [], m = (yaricap + 1) / 100;
    var l = [];
    V.forEach(function (v, i) {
      if (!icinde(H, v[3], v[4], m)) { return; }
      /* Tesla Supercharger'ın başka markalara açıklığı istasyon istasyon doğrulanamadı: yalnız Tesla aracına aday */
      if (v[1] === 'tesla-supercharger' && arac && arac.marka !== 'tesla') { return; }
      var o = H.olc(v[3], v[4], yaricap + 1); if (o.d > yaricap) { return; }
      l.push({ id: 'ev' + i, ad: v[0], ag: v[1], agAd: v[2], lat: v[3], lng: v[4], kw: v[5], dc: v[6] == null ? null : !!v[6], ulke: v[7] || null, bolge: v[8] || null, d: o.d, s: o.s });
    });
    return l.sort(function (a, b) { return a.s - b.s; });
  }
  /* Bir noktaya yakın Dada mekânları: yürüme mesafesindekiler (1 km; Dada Route dokümanı §8 #10, şarj mock'uyla aynı); yoksa en yakın (25 km içinde) */
  /* Yayın politikası, panel modeli (YayinPolitikasi; rota-global 11 Kas, Beyar onaylı): `reklam-yerlesim.json` `politika.alkol` ülke →
     serbest | kapali; TR kilitli kapali, öbür ülkeler varsayılan kapali ('*'). Mekânın alkol servisi yayını ENGELLEMEZ. Kapalı ülkede
     engellenen kreatifin alkol içeriğidir: sponsorlu kartta adı ya da türü alkol servisini öne çıkaran mekân (bar, lounge, meyhane,
     kokteyl, şarap, vino, bira…) kreatife kadeh/bar göstermek demektir, o kart basılmaz. Serbest ülkede bu süzgeç yok. Organik liste
     etkilenmez. Domuz bayrağı (gelirse) önceki gibi sponsorlu yüzeye girmez */
  var ALKOL = /(^|[^a-zçğıöşü])(bar|pub|lounge|meyhane(si)?|cocktail|kokteyl|vino|brasserie|wine|şarap[a-zçğıöşü]*|sarap[a-z]*|teruar|bira|brew[a-z]*|rakı|hookah)([^a-zçğıöşü]|$)/i;
  var alkolDurumu = function (ulke) { var P = ((window.DG_REKLAM_VERI || {}).politika || {}), A = P.alkol || {}; if ((P.kilitli || []).indexOf(ulke) >= 0) { return 'kapali'; } return A[ulke] || A['*'] || 'kapali'; };
  var uygun = function (m, ulke) { if (!m || m.domuz) { return false; } return alkolDurumu(ulke) === 'serbest' || !ALKOL.test((m.name || m.ad || '') + ' ' + (m.type || m.tur || '')); };
  /* Bir noktaya yakın Dada mekânları: yalnız yürüme mesafesindekiler (1 km; Dada Route dokümanı §8 #10). Doğrulayıcı bulgu #9: koridor
     dışındaki uzak mekân "şarj + yemek" diye önerilmez; yürüme mesafesinde yoksa boş liste (dürüst boş durum) */
  function yakinMekan(lat, lng, ulke) {
    var M = (window.DG_MEKANLAR || []).filter(function (m) { return uygun(m, ulke); });
    var l = M.map(function (m) { return { m: m, km: km(lat, lng, m.lat, m.lng) }; }).sort(function (a, b) { return a.km - b.km; });
    var yuru = l.filter(function (x) { return x.km * 1000 <= YURU_M; }).slice(0, 3).map(function (x) { return { m: x.m, km: x.km, yuruDk: Math.max(1, Math.round(x.km * 1000 / YURU_HIZ)), yuru: true }; });
    if (yuru.length) { return yuru; }
    return [];
  }
  var sapmaDk = function (d, hiz) { return Math.max(0, Math.round(d * 2 / (hiz || 55) * 60)); };

  /* Plan: menzile göre şarj durakları. Aday penceresi (önceki duraktan sonra, menzil içinde); puan: ileride olması (daha az durak),
     yürüme mesafesinde mekân, sponsor ağ, DC; sapma cezası. Sponsor ağ: aracın ağı; "başka araç" için koridorda daha çok noktası olan
     ZES ya da Eşarj (sponsorlu şarj ağı listelemesi). En çok 3 durak sponsorlu işaretlenir (REKLAM-YERLESIM "rotada en çok N").
     Ülke (rota-global, 11 Kas): `o.aglar` = rotanın ülkelerini hedefleyen sponsor ağ kreatifleri [{ marka, herAraca }] (sırası kreatif
     sırası). Aracın ağı bu listede yoksa (Fransa'da Trugo) ya da araç "başka araç"sa, herAraca ağlardan koridorda en çok noktası olan;
     eşitlikte listede önce gelen (Türkiye: ZES, Eşarj; eski kuralın aynısı). `o.aglar` verilmezse aracın ağı olduğu gibi (AS-INT) */
  function planla(o) {
    var H = o.hat, arac = o.arac, r = o.yaricap, hiz = o.hiz || 55;
    if (!H || !arac) { return null; }
    var aday = koridor(H, r, arac), toplam = H.toplam;
    var ag = arac.ag, AG = o.aglar;
    if (AG && !AG.some(function (x) { return x.marka === ag; })) { ag = null; }
    if (!ag) {
      var acik = AG ? AG.filter(function (x) { return x.herAraca; }).map(function (x) { return x.marka; }) : ['zes', 'esarj'], say = {};
      acik.forEach(function (k) { say[k] = 0; }); aday.forEach(function (x) { if (say[x.ag] != null) { say[x.ag]++; } });
      ag = acik.reduce(function (en, k) { return en === null || say[k] > say[en] ? k : en; }, null); /* hiç aday ağ yoksa null: sponsorlu durak yok */
    }
    var Ru = arac.wltp * OTOYOL, ilk = Ru * CIKIS, sonra = Ru * SARJ;
    var p = { arac: arac, ag: ag, toplam: toplam, yaricap: r, duraklar: [], aday: aday.length, agAday: aday.filter(function (x) { return (!!ag && x.ag === ag); }).length, yeter: toplam <= ilk, sorun: null, menzil: Math.round(Ru) };
    var poz = 0, erim = ilk, guv = 0;
    while (toplam - poz > erim && guv++ < 12) {
      var alt = poz + erim * 0.3, ust = poz + erim;
      var pen = aday.filter(function (x) { return x.s > alt && x.s <= ust; });
      /* Az durak: menzilin ikinci yarısında AC olmayan aday varsa yalnız onlar (erken duran açgözlü seçim durak sayısını artırıyordu) */
      /* Doğrulayıcı bulgu #9: menzil penceresinde yürüme mesafesinde Dada mekânı olan (AC olmayan) şarj noktası varsa yalnız onlar
         ("şarj olurken burada ye" vaadi); yoksa eski kural */
      var yemekli = pen.filter(function (x) { if (x.dc === false) { return false; } x.mekan = yakinMekan(x.lat, x.lng, x.ulke); return x.mekan.length > 0; });
      var gec = pen.filter(function (x) { return x.s >= poz + erim * 0.55 && x.dc !== false; });
      if (yemekli.length) { pen = yemekli; } else if (gec.length) { pen = gec; }
      if (!pen.length) { p.sorun = 'Bu sapma toleransında ' + Math.round(poz) + '–' + Math.round(ust) + '. km arasında şarj noktası yok.'; break; }
      var en = null, enP = -1e9;
      pen.forEach(function (x) {
        var yk = yakinMekan(x.lat, x.lng, x.ulke), yuru = yk.length && yk[0].yuru;
        var puan = (x.s - poz) / erim + (yuru ? 0.6 : 0) + ((!!ag && x.ag === ag) ? 0.4 : 0) + (x.dc ? 0.3 : x.dc === false ? -0.8 : 0) - (r ? x.d / r * 0.3 : 0);
        if (puan > enP) { enP = puan; en = x; en.mekan = yk; }
      });
      p.duraklar.push(en); poz = en.s; erim = sonra;
    }
    var spon = 0;
    p.duraklar.forEach(function (x, i) {
      x.no = i + 1; x.sapmaDk = sapmaDk(x.d, hiz);
      x.sarjDk = x.dc === false ? null : arac.sarjDk;
      x.sponsor = (!!ag && x.ag === ag) && spon < 3; if (x.sponsor) { spon++; }
    });
    /* Sponsorlu ağ listelemesi: plan durakları sponsor ağdan değilse planı bozmadan, koridordaki sponsor ağ noktası ayrı ve etiketli
       "alternatif durak" olur (organik sıralamaya girmez; §25 organik/ticari ayrımı). İlk plan durağına rota üstünde en yakın olan */
    if (!spon) {
      var hedef = p.duraklar.length ? p.duraklar[0].s : toplam / 2;
      var alt2 = aday.filter(function (x) { return (!!ag && x.ag === ag) && x.s > 20 && x.s < toplam - 20; }).sort(function (a, b) { return Math.abs(a.s - hedef) - Math.abs(b.s - hedef); })[0];
      if (alt2) { alt2.mekan = yakinMekan(alt2.lat, alt2.lng, alt2.ulke); alt2.no = 0; alt2.sapmaDk = sapmaDk(alt2.d, hiz); alt2.sarjDk = alt2.dc === false ? null : arac.sarjDk; alt2.sponsor = true; alt2.alternatif = true; p.alternatif = alt2; }
    }
    return p;
  }
  var mesafe = function (k) { return k < 1 ? Math.round(k * 100) * 10 + ' m' : (Math.round(k * 10) / 10).toString().replace('.', ',') + ' km'; };

  window.dgEvSarj = { uygun: uygun, ARACLAR: ARACLAR, aracBul: aracBul, hat: hat, koridor: koridor, planla: planla, yakinMekan: yakinMekan, sapmaDk: sapmaDk, km: km, mesafe: mesafe };
})();
