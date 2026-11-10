/* Canlı Dada Route üstüne eklenen katmanlar, İhtiyaçlar sekmesi, yakıt kartı ve il kartları. Rota Faz 4'e kadar Leaflet'tedir (K7).
   Noktalar güzergâha göre süzülür: yalnız çizili rotanın koridorundakiler pin ve kart olur.
   Rota geometrisi: `window.dgRotaGeometri` ([[enlem, boylam], …]) varsa o, yoksa örnek koridor (`dgRotaHat`). Her rota hesabında
   `document` üstünde `dg:rota` olayı ya da `window` üstünde `dg-rota` olayı gelir; ikisi de yeniden hesaplatır. */
(function () {
  'use strict';
  var R = window.DG_ROTA, L = window.L, h = window.dgRotaHarita; if (!R || !h) { return; }
  var $ = function (s) { return document.querySelector(s); }, $$ = function (s) { return [].slice.call(document.querySelectorAll(s)); };
  var kac = function (t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); };
  var BOOT = {}; try { BOOT = JSON.parse($('#routeMap').getAttribute('data-boot')) || {}; } catch (e) { BOOT = {}; }
  var HIZ = BOOT.sapmaHiziKmS || 55, TAM_KM = BOOT.tamYolUstuKm || 1;
  var KORIDOR = { ibadet: 15, tarihi: 25, dinlenme: 15, karavan: 25, neyenir: 15, nealinir: 15 }, YAKIT_KM = 5, YAKIT_EN_COK = 150;

  /* ---- Rota geometrisi ve koridor uzaklığı ----
     Çizgi km düzlemine izdüşürülür, parçalar 10 km'lik ızgaraya dağıtılır; nokta yalnız komşu hücrelerdeki parçalarla ölçülür.
     Uzun gerçek yol geometrisinde (binlerce nokta) ve binlerce istasyonda da hızlı kalır. */
  var geoAl = function () {
    var g = window.dgRotaGeometri;
    if (g && g.length > 1) { return g; }
    return (window.dgRotaHat ? window.dgRotaHat() : []).map(function (c) { return [c[1], c[0]]; });
  };
  var GI = null, HUC = 10;
  var indeks = function () {
    if (GI) { return GI; }
    var g = geoAl(); if (g.length < 2) { GI = { bos: true }; return GI; }
    var lat0 = 0; g.forEach(function (c) { lat0 += +c[0]; }); lat0 /= g.length;
    var kx = 111.32 * Math.cos(lat0 * Math.PI / 180), ky = 110.57, P = g.map(function (c) { return [+c[1] * kx, +c[0] * ky]; });
    var seg = [], izgara = {}, top = 0, kutu = [90, 180, -90, -180];
    g.forEach(function (c) { kutu = [Math.min(kutu[0], c[0]), Math.min(kutu[1], c[1]), Math.max(kutu[2], c[0]), Math.max(kutu[3], c[1])]; });
    for (var i = 1; i < P.length; i++) {
      var a = P[i - 1], b = P[i], u = Math.sqrt((b[0] - a[0]) * (b[0] - a[0]) + (b[1] - a[1]) * (b[1] - a[1]));
      seg.push({ a: a, b: b, u: u, s: top }); top += u;
      for (var x = Math.floor(Math.min(a[0], b[0]) / HUC); x <= Math.floor(Math.max(a[0], b[0]) / HUC); x++) {
        for (var y = Math.floor(Math.min(a[1], b[1]) / HUC); y <= Math.floor(Math.max(a[1], b[1]) / HUC); y++) { (izgara[x + ':' + y] = izgara[x + ':' + y] || []).push(seg.length - 1); }
      }
    }
    GI = { kx: kx, ky: ky, seg: seg, izgara: izgara, kutu: kutu };
    return GI;
  };
  /* {d: rotaya km, s: rota başından km}; `sinir` km'den uzak nokta için d büyük döner */
  var olc = function (lat, lng, sinir) {
    var I = indeks(); if (I.bos) { return { d: 1e9, s: 0 }; }
    var x = lng * I.kx, y = lat * I.ky, r = Math.ceil((sinir || 30) / HUC), cx = Math.floor(x / HUC), cy = Math.floor(y / HUC), en = { d: 1e9, s: 0 }, gor = {};
    for (var dx = -r; dx <= r; dx++) {
      for (var dy = -r; dy <= r; dy++) {
        var l = I.izgara[(cx + dx) + ':' + (cy + dy)]; if (!l) { continue; }
        for (var k = 0; k < l.length; k++) {
          var j = l[k]; if (gor[j]) { continue; } gor[j] = 1;
          var q = I.seg[j], vx = q.b[0] - q.a[0], vy = q.b[1] - q.a[1], t = q.u ? Math.max(0, Math.min(1, ((x - q.a[0]) * vx + (y - q.a[1]) * vy) / (q.u * q.u))) : 0;
          var px = q.a[0] + vx * t - x, py = q.a[1] + vy * t - y, d = Math.sqrt(px * px + py * py);
          if (d < en.d) { en = { d: d, s: q.s + q.u * t }; }
        }
      }
    }
    return en;
  };
  var rotaVar = function () { return !ozet.hidden && !indeks().bos; };

  /* ---- Canlı kart dili (dada-route.js `proxLabel`, `sapmaMetni`): tüm kartlarda aynı ---- */
  var mesafeYaz = function (d) { return d < 1 ? (Math.round(d * 100) * 10) + ' m' : Math.round(d) + ' km'; };
  var yakinlik = function (d) { return d < 0.5 ? 'Tam yol üstü' : (d <= TAM_KM ? 'Yol üstü' : 'Yola yakın') + ' · ' + mesafeYaz(d); };
  var sapmaMetni = function (d, ayrim) {
    var dk = Math.max(0, Math.round(d * 2 / HIZ * 60)), km = d < 1 ? (Math.round(d * 100) * 10) + ' m' : (Math.round(d * 10) / 10).toString().replace('.', ',') + ' km';
    return (ayrim ? 'Yol ayrımından ' : 'Rotadan ') + km + (dk <= 0 ? ' · yolculuğa süre eklemez' : ' · yolculuğa yaklaşık ' + dk + ' dakika ekler');
  };
  /* Rotaya ekle düğmesi: mevcut ara durak mekanizması (`dgRotaApi.durakYap`); etiket rotadaysa değişir */
  var durakDugme = function (ad, lat, lng, etiket, sinif) {
    return '<button type="button" class="' + (sinif || 'yg-kl-durak') + '" data-durak="' + kac(ad) + '" data-lat="' + lat + '" data-lng="' + lng + '" data-etiket="' + kac(etiket.join('|')) + '" aria-pressed="false">' +
      (sinif === 'yg-il-cip' ? '<i class="fa-solid fa-plus" aria-hidden="true"></i> ' : '') + '<span>' + etiket[0] + '</span></button>';
  };

  /* İl/Bölge Kimlik Motoru (R2.2, akış 2): il merkezleri `rota-yerler.js`, tescilli ürünler `rota-veri.js` `kimlik`.
     Ürünün ilçesi biliniyorsa durak o ilçe merkezine, bilinmiyorsa il merkezinin yakınına düşer (örnek konum) */
  var Y = window.DG_YERLER || { il: [], ilce: [] }, K = R.kimlik || {};
  var IL = Y.il.map(function (y) { return { il: y[1], lat: y[3], lng: y[4] }; });
  var ilce = {}; Y.ilce.forEach(function (y) { ilce[y[1] + '|' + y[0]] = { lat: y[2], lng: y[3] }; });
  var urunKonum = function (il, u, tip) { var c = u[1] && ilce[il.il + '|' + u[1]]; return c ? { lat: c.lat, lng: c.lng } : { lat: il.lat + (tip === 'yenir' ? 0.05 : -0.05), lng: il.lng + (tip === 'yenir' ? -0.07 : 0.07) }; };

  /* ---- Nokta havuzu: [boylam, enlem, ad, nitelik] → tek biçim ---- */
  var ibadetIkon = function (t) { return /Kilise/.test(t) ? 'fa-church' : /Sinagog/.test(t) ? 'fa-synagogue' : /Cemevi|Manastır/.test(t) ? 'fa-place-of-worship' : 'fa-mosque'; };
  var ikonK = { dinlenme: 'fa-bed', karavan: 'fa-caravan', neyenir: 'fa-bowl-food', nealinir: 'fa-basket-shopping' };
  var bicim = function (k) { return function (n) { return { ad: n[2], lat: n[1], lng: n[0], alt: n[3], ikon: k === 'ibadet' || k === 'tarihi' ? ibadetIkon(n[3] + ' ' + n[2]) : ikonK[k] }; }; };
  var noktalar = { ibadet: [], tarihi: [], dinlenme: [], karavan: [], neyenir: [], nealinir: [] };
  ['ibadet', 'tarihi', 'dinlenme', 'karavan'].forEach(function (k) { noktalar[k] = (R.katman[k] || []).map(bicim(k)); });
  IL.forEach(function (i) {
    var k = K[i.il]; if (!k) { return; }
    (k.yenir || []).forEach(function (u) { var c = urunKonum(i, u, 'yenir'); noktalar.neyenir.push({ ad: u[0] + ' · ' + i.il, lat: c.lat, lng: c.lng, ikon: ikonK.neyenir }); });
    (k.alinir || []).forEach(function (u) { var c = urunKonum(i, u, 'alinir'); noktalar.nealinir.push({ ad: u[0] + ' · ' + i.il, lat: c.lat, lng: c.lng, ikon: ikonK.nealinir }); });
  });

  /* Güzergâhta sabit örnek nokta yoksa çizgi boyunca üretilen örnekler (Beyar, 9 Kas: açılan katman haritada görünsün) */
  var URET = {
    ibadet: [90, 1.2, function (i) { return [{ ad: 'Örnek cami', alt: 'Cami · abdesthane' }, { ad: 'Örnek mescit', alt: 'Mescit · akaryakıt istasyonu içi' }, { ad: 'Örnek cemevi', alt: 'Cemevi' }][i % 3]; }],
    tarihi: [220, 6, function (i) { return [{ ad: 'Örnek tarihi kilise', alt: 'Kilise · ziyaret saatleri: örnek' }, { ad: 'Örnek tarihi sinagog', alt: 'Sinagog · ziyaret saatleri: örnek' }, { ad: 'Örnek manastır kalıntısı', alt: 'Manastır · ören yeri' }][i % 3]; }],
    dinlenme: [110, 2, function (i) { return i % 2 ? { ad: 'Örnek bağ evi', alt: 'Konaklamalı · bağ evi lokantası' } : { ad: 'Örnek dinlenme cebi', alt: 'Aydınlatma, tuvalet · araç içi kısa mola' }; }],
    karavan: [170, 3, function (i) { return i % 2 ? { ad: 'Örnek karavan konaklama alanı', alt: 'Çiftlik içi · duş, elektrik' } : { ad: 'Örnek karavan parkı', alt: 'Elektrik, su, atık boşaltma' }; }]
  };
  var katmanNoktalari = function (k) {
    var l = noktalar[k].map(function (n) { var o = olc(n.lat, n.lng, 30); return { n: n, d: o.d, s: o.s }; }).filter(function (x) { return x.d <= KORIDOR[k]; });
    if (!l.length && URET[k] && window.dgRotaOrnek && rotaVar()) {
      l = window.dgRotaOrnek(URET[k][0], URET[k][1]).map(function (o, i) { var t = URET[k][2](i), n = { ad: t.ad, alt: t.alt, lat: o.lat, lng: o.lng }, m = olc(o.lat, o.lng, 30); n.ikon = k === 'ibadet' || k === 'tarihi' ? ibadetIkon(t.alt) : ikonK[k]; return { n: n, d: m.d, s: m.s }; })
        .filter(function (x) { return x.d <= KORIDOR[k] + 5; });
    }
    return l.sort(function (a, b) { return a.s - b.s; });
  };

  /* ---- İhtiyaçlar (Beyar 10 Kas D8): Mekânlar sekmesinin yanında tek sekme, alt başlıklı üç grup.
     İbadethane ana dinler (cami, mescit, kilise, sinagog, cemevi, manastır; doküman R2.3 "yol ayrım mesafesiyle"),
     Dinlenme alanı (R2.4: dinlenme cebi, konaklamalı yeme-içme), Karavan parkları (Beyar eki) ---- */
  var IHT = [
    { id: 'ibadet', ad: 'İbadethane', ikon: 'fa-place-of-worship', kat: ['ibadet', 'tarihi'], ayrim: true },
    { id: 'dinlenme', ad: 'Dinlenme alanı', ikon: 'fa-bed', kat: ['dinlenme'] },
    { id: 'karavan', ad: 'Karavan parkları', ikon: 'fa-caravan', kat: ['karavan'] }
  ];
  var ihtVeri = {}, ihtSayi = 0;
  var ihtiyacHesap = function () {
    ihtVeri = {}; ihtSayi = 0;
    if (!rotaVar()) { return; }
    IHT.forEach(function (g) {
      var l = []; g.kat.forEach(function (k) { l = l.concat(katmanNoktalari(k)); });
      ihtVeri[g.id] = l.sort(function (a, b) { return a.s - b.s; }); ihtSayi += l.length;
    });
  };

  /* ---- Haritada göster/gizle (Katmanlar): yalnız pin; liste İhtiyaçlar sekmesinde ve il kartlarında ---- */
  var grup = { ibadet: L.layerGroup(), dinlenme: L.layerGroup(), karavan: L.layerGroup(), neyenir: L.layerGroup(), nealinir: L.layerGroup() };
  var acik = {};
  var pin = function (k, n) {
    var i = L.divIcon({ className: 'yg-katman-pin yg-katman-pin--' + k, html: '<i class="fa-solid ' + n.ikon + '" aria-hidden="true"></i>', iconSize: [30, 30], iconAnchor: [15, 15] });
    return L.marker([n.lat, n.lng], { icon: i, title: n.ad }).bindPopup(kac(n.ad + (n.alt ? ' · ' + n.alt : '') + ' (prototip örneği)'));
  };
  var pinleriCiz = function () {
    Object.keys(grup).forEach(function (k) {
      grup[k].clearLayers(); if (!acik[k]) { return; }
      var l = ihtVeri[k] || (k === 'neyenir' || k === 'nealinir' ? (rotaVar() ? katmanNoktalari(k) : []) : []);
      l.forEach(function (x) { grup[k].addLayer(pin(k, x.n)); });
    });
  };
  var yenile = function () { ihtiyacHesap(); pinleriCiz(); seritYenile(); yakitYenile(); durakBoya(); };

  /* ---- Alt şerit: Mekânlar | İhtiyaçlar. "Mekânlar" canlı kadranın kendisi ---- */
  var dash = $('#ygDash'), seritAktif = 'mekan';
  if (dash) {
    dash.querySelector('.yg-dash-head').insertAdjacentHTML('afterend', '<div class="yg-dash-sekmeler" id="ygSerit" role="tablist" aria-label="Yol üstü şeridi" hidden></div>');
    $('#ygDashScroll').insertAdjacentHTML('afterend', '<div class="yg-dash-scroll yg-dash-katman" id="ygDashKatman" role="tabpanel" aria-label="İhtiyaçlar" data-scroll-fade hidden></div>');
    if (window.ScrollAffordance) { window.ScrollAffordance.wire($('#ygDashKatman')); }
    $('.yg-dash-title').insertAdjacentHTML('beforeend', '<span class="ornek-etiket yg-dash-ornek" hidden>prototip örneği</span>');
  }
  /* Kart: canlı alt kadran kartı (`.yg-dcard`: görsel, ad, konum, yakınlık etiketi, sapma metni). Görsel yerine tür ikonu;
     kart içinde eylem düğmesi olduğu için kök `article` (canlıda `button`) */
  var ihtKart = function (g, x) {
    var tam = x.d <= TAM_KM;
    return '<article class="yg-dcard yg-dcard--katman" data-kart-lat="' + x.n.lat + '" data-kart-lng="' + x.n.lng + '"><span class="yd-media yg-katman-pin--' + g.id + '"><i class="fa-solid ' + x.n.ikon + '" aria-hidden="true"></i></span>' +
      '<span class="yd-body"><span class="yd-name" title="' + kac(x.n.ad) + '">' + kac(x.n.ad) + '</span><span class="yd-loc" title="' + kac(x.n.alt || '') + '">' + kac(x.n.alt || g.ad) + '</span>' +
      '<span class="yg-ih-satir"><span class="yd-tag ' + (tam ? 'on' : 'near') + '">' + yakinlik(x.d) + '</span>' + durakDugme(x.n.ad, x.n.lat, x.n.lng, ['Rotaya ekle', 'Rotada']) + '</span>' +
      '<span class="yd-detour">' + sapmaMetni(x.d, g.ayrim) + '</span></span></article>';
  };
  var seritYenile = function () {
    if (!dash) { return; }
    var gastro = !document.body.classList.contains('gastronomi-kapali'), rota = rotaVar();
    var sekme = (gastro ? [['mekan', 'fa-utensils', 'Mekânlar', ($('#ygDashCount') || {}).textContent || '']] : []).concat(rota ? [['ihtiyac', 'fa-hand-holding-heart', 'İhtiyaçlar', ihtSayi]] : []);
    if (!sekme.some(function (t) { return t[0] === seritAktif; })) { seritAktif = sekme.length ? sekme[0][0] : 'mekan'; }
    $('#ygSerit').innerHTML = sekme.map(function (t) { return '<button type="button" role="tab" class="yg-serit-sekme" data-serit="' + t[0] + '" aria-selected="false" aria-controls="' + (t[0] === 'mekan' ? 'ygDashScroll' : 'ygDashKatman') + '"><i class="fa-solid ' + t[1] + '" aria-hidden="true"></i>' + t[2] + ' <span class="yg-dash-cnt">' + t[3] + '</span></button>'; }).join('');
    $('#ygSerit').hidden = !rota; dash.classList.toggle('yg-dash--katmanli', rota);
    $('#ygDashKatman').innerHTML = IHT.map(function (g) {
      var l = ihtVeri[g.id] || [];
      return '<section class="yg-ih-grup" aria-label="' + g.ad + '"><h5 class="yg-ih-bas"><span class="yg-il-ikon"><i class="fa-solid ' + g.ikon + '" aria-hidden="true"></i></span>' + g.ad + ' <span class="yg-ih-sayi">' + l.length + '</span></h5>' +
        '<div class="yg-ih-kartlar">' + (l.length ? l.map(function (x) { return ihtKart(g, x); }).join('') : '<p class="yg-kl-bos">Bu güzergâhta örnek nokta yok.</p>') + '</div></section>';
    }).join('');
    seritSec(seritAktif);
  };
  var seritSec = function (k) {
    if (!dash) { return; }
    seritAktif = k; $$('#ygSerit [data-serit]').forEach(function (b) { b.setAttribute('aria-selected', b.dataset.serit === k ? 'true' : 'false'); });
    var m = k === 'mekan', kap = $('#ygDashKatman'); $('#ygDashScroll').hidden = !m; kap.hidden = m; dash.classList.toggle('yg-dash--katman-sekme', !m);
    var bt = $('#ygDashTitleTxt'); if (bt) { bt.textContent = m ? 'Yol üstü mekânlar' : 'Yol üstü · İhtiyaçlar'; }
    var oe = $('.yg-dash-ornek'); if (oe) { oe.hidden = m; }
    if (!m && window.ScrollAffordance) { window.ScrollAffordance.sync(kap); }
    durakBoya();
  };
  /* Rotadaki durakla eşleşen düğme basılı görünür: ad ve konum aynı olmalı (aynı adlı örnek noktalar karışmasın) */
  var durakBoya = function () {
    var api = window.dgRotaApi, l = api ? api.duraklar() : [];
    $$('[data-durak]').forEach(function (b) {
      var la = +b.dataset.lat, ln = +b.dataset.lng;
      var on = l.some(function (d) { return d && d.ad === b.dataset.durak && (d.lat == null || Math.abs(d.lat - la) + Math.abs(d.lng - ln) < 0.002); });
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      var e = (b.dataset.etiket || 'Ara durak ekle|Durakta').split('|'), s = b.querySelector('span'); if (s) { s.textContent = on ? e[1] : e[0]; }
    });
  };

  /* ---- Yakıt istasyonları (Beyar 10 Kas D3): canlı "Şarj istasyonları" kartıyla aynı kalıp ve sınıflar.
     Veri `window.DG_YAKIT` [{ad, marka, lat, lng, ulke}]; ülkeden bağımsız, metinde ülke yok. Yalnız rota koridorundakiler ---- */
  var yakitAcik = false, yakitSecili = null, yakitSonuc = [], yakitPinler = L.layerGroup();
  var yakitKaynak = function () { var k = window.DG_YAKIT_KAYNAK; $('#ygYakitKaynak').textContent = 'Kaynak: ' + (typeof k === 'string' && k ? k : 'prototip örneği'); };
  var yakitHesap = function () {
    var V = window.DG_YAKIT || [];
    if (!V.length || !rotaVar()) { return []; }
    var I = indeks(), m = YAKIT_KM / 100;
    return V.map(function (v, i) {
      if (v.lat < I.kutu[0] - m || v.lat > I.kutu[2] + m || v.lng < I.kutu[1] - m * 1.6 || v.lng > I.kutu[3] + m * 1.6) { return null; }
      var o = olc(+v.lat, +v.lng, YAKIT_KM + 1); return o.d <= YAKIT_KM ? { id: 'y' + i, v: v, d: o.d, s: o.s } : null;
    }).filter(Boolean).sort(function (a, b) { return a.s - b.s; });
  };
  var yakitAd = function (x) { return x.v.ad || x.v.marka || 'Yakıt istasyonu'; };
  var yakitRotada = function (x) { var l = window.dgRotaApi ? window.dgRotaApi.duraklar() : []; return l.some(function (d) { return d && d.ad === yakitAd(x) && Math.abs(d.lat - x.v.lat) + Math.abs(d.lng - x.v.lng) < 0.002; }); };
  var yakitCiz = function () {
    var V = window.DG_YAKIT || [], st = $('#ygYakitStatus'), gor = yakitSonuc.slice(0, YAKIT_EN_COK);
    st.textContent = !V.length ? 'Yakıt istasyonu verisi henüz yok. Veri eklenince rotana yakın istasyonlar burada görünür.' : !rotaVar() ? 'Rotanı çizince yakıt istasyonları burada görünecek.'
      : !yakitSonuc.length ? 'Bu güzergâhta rotaya ' + YAKIT_KM + ' km içinde yakıt istasyonu yok.' : yakitSonuc.length + ' istasyon · rotaya ' + YAKIT_KM + ' km içinde' + (yakitSonuc.length > gor.length ? ' · ilk ' + gor.length + ' gösteriliyor' : '');
    $('#ygYakitList').innerHTML = gor.map(function (x) {
      var on = yakitRotada(x);
      return '<li><button type="button" class="yg-sarj-row" data-yakit="' + x.id + '" data-active="' + (yakitSecili === x.id) + '" data-added="' + on + '" aria-label="' + kac(yakitAd(x) + ', rotadan ' + mesafeYaz(x.d) + (on ? ', rotaya eklendi' : '')) + '"' + (yakitSecili === x.id ? ' aria-current="true"' : '') + '>' +
        '<i class="fa-solid fa-gas-pump" aria-hidden="true"></i><span><b>' + kac(yakitAd(x)) + '</b><small>' + kac((x.v.marka && x.v.marka !== x.v.ad ? x.v.marka + ' · ' : '') + 'rotadan ' + mesafeYaz(x.d)) + '</small>' + (on ? '<em class="yg-sarj-added">✓ Rotada</em>' : '') + '</span></button></li>';
    }).join('');
    var s = gor.filter(function (x) { return x.id === yakitSecili; })[0], dt = $('#ygYakitDetail');
    dt.hidden = !s;
    dt.innerHTML = s ? '<h3>' + kac(yakitAd(s)) + '</h3>' + (s.v.marka ? '<p class="yg-sarj-meta">' + kac(s.v.marka) + '</p>' : '') + '<p>' + yakinlik(s.d) + '</p><p>' + sapmaMetni(s.d) + '</p>' +
      '<p class="yg-sarj-source">' + kac($('#ygYakitKaynak').textContent) + '</p><div class="yg-sarj-actions">' + durakDugme(yakitAd(s), s.v.lat, s.v.lng, ['Rotaya ekle', 'Rotada'], 'yg-yakit-ekle') + '</div>' : '';
    yakitPinler.clearLayers();
    if (yakitAcik) {
      gor.forEach(function (x) {
        var a = yakitSecili === x.id, ik = L.divIcon({ className: '', html: '<span class="yg-sarj-pin yg-yakit-pin" data-active="' + a + '" data-added="' + yakitRotada(x) + '" aria-hidden="true"><i class="fa-solid fa-gas-pump"></i></span>', iconSize: [42, 42], iconAnchor: [21, 21] });
        yakitPinler.addLayer(L.marker([x.v.lat, x.v.lng], { icon: ik, title: yakitAd(x) + ' · yakıt istasyonu', zIndexOffset: a ? 800 : 0 }).on('click', function () { yakitAc(x.id); }));
      });
    }
    durakBoya();
  };
  var yakitYenile = function () { yakitKaynak(); yakitSonuc = yakitHesap(); if (!yakitSonuc.some(function (x) { return x.id === yakitSecili; })) { yakitSecili = null; } yakitCiz(); };
  var yakitAc = function (id) {
    if (!yakitAcik) { yakitDegis(true); }
    yakitSecili = id; yakitCiz();
    var dt = $('#ygYakitDetail'); if (dt && !dt.hidden) { dt.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
  };
  var yakitDegis = function (on) {
    yakitAcik = on; var t = $('#ygYakitToggle'); t.setAttribute('aria-pressed', String(on)); $('#ygYakitToggleText').textContent = on ? 'Gizle' : 'Göster'; $('#ygYakitBody').hidden = !on;
    if (on) { yakitPinler.addTo(h); } else { h.removeLayer(yakitPinler); yakitSecili = null; }
    yakitYenile();
  };
  /* Araç türü (R3.3a, Beyar 10 Kas D3): Yakıtlı yakıt kartını, Elektrikli canlı şarj kartını gösterir; gizlenen kartın pinleri kalkar */
  var aracSec = function (tur) {
    $$('[data-arac]').forEach(function (b) { var on = b.dataset.arac === tur; b.classList.toggle('aktif', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    var ev = tur === 'elektrikli', sk = $('#ygSarjKart'), st = $('#ygSarjToggle');
    if (sk) { sk.hidden = !ev; }
    $('#ygYakit').hidden = ev;
    if (!ev && st && st.getAttribute('aria-pressed') === 'true') { st.click(); }
    if (ev && yakitAcik) { yakitDegis(false); }
  };

  /* ---- Coğrafi İşaret ve Kültür Kartı (R2.1, R2.2, akış 2 ve 4): rotanın geçtiği her il için "{İl}'in meşhurları".
     Ne Yenir? ve Ne Alınır? alt alta, ayrı başlık bandıyla; en çok 5 ürün satırı görünür, fazlası kart içinde kayar (Beyar 10 Kas D4) ---- */
  var ekAl = function (ad) {
    var sesli = (ad.toLocaleLowerCase('tr').match(/[aeıioöuü]/g) || ['e']).pop(), son = /[aeıioöuü]$/.test(ad.toLocaleLowerCase('tr'));
    var ek = { a: 'ın', 'ı': 'ın', e: 'in', i: 'in', o: 'un', u: 'un', 'ö': 'ün', 'ü': 'ün' }[sesli];
    return ad + '’' + (son ? 'n' : '') + ek;
  };
  var urunSatir = function (il, u, tip) {
    var c = urunKonum(il, u, tip);
    return '<li class="yg-il-urun"><span class="yg-il-urun-ad">' + kac(u[0]) + '<small>' + kac((u[1] ? u[1] + ' · ' : '') + 'Tescil ' + u[2]) + '</small></span>' + durakDugme(u[0] + ' · ' + il.il, c.lat, c.lng, ['Ara durak ekle', 'Durakta'], 'yg-il-cip') + '</li>';
  };
  var bolum = function (sinif, ik, ad, il, l, tip) {
    return '<section class="yg-il-bolum ' + sinif + '"><div class="yg-il-bolum-bas"><span class="yg-il-ikon"><i class="fa-solid ' + ik + '" aria-hidden="true"></i></span><b>' + ad + '</b><span class="yg-il-bolum-sayi">' + l.length + '</span></div>' + (l.length ? '<ul class="yg-il-urunler">' + l.map(function (u) { return urunSatir(il, u, tip); }).join('') + '</ul>' : '<p class="yg-kl-bos">Bu ilde ' + (tip === 'yenir' ? 'yemek' : 'paketli ürün') + ' tescili yok.</p>') + '</section>';
  };
  var ilKart = function (il) {
    var k = K[il.il];
    var bas = '<header class="yg-il-kart-bas"><i class="fa-solid fa-location-dot" aria-hidden="true"></i><h4>' + kac(ekAl(il.il)) + ' meşhurları</h4>' + (k ? '<span class="yg-il-rozet"><i class="fa-solid fa-certificate" aria-hidden="true"></i> Coğrafi işaretli</span>' : '') + '</header>';
    if (!k) { return '<article class="yg-il-kart yg-il-kart--bos" data-il="' + kac(il.il) + '">' + bas + '<p class="yg-il-dip">Tescilli ürün verisi prototipte henüz yok; canlıda TÜRKPATENT sicilinden gelir.</p></article>'; }
    return '<article class="yg-il-kart" data-il="' + kac(il.il) + '">' + bas + '<div class="yg-il-kayar"><div class="yg-il-govde" tabindex="0" aria-label="' + kac(ekAl(il.il)) + ' meşhurları listesi">' + bolum('yg-il-yenir', 'fa-bowl-food', 'Ne Yenir?', il, k.yenir || [], 'yenir') + bolum('yg-il-alinir', 'fa-basket-shopping', 'Ne Alınır?', il, k.alinir || [], 'alinir') + '</div></div>' + ((k.yenir || []).length + (k.alinir || []).length > SINIR ? '<p class="yg-il-kaydir"><i class="fa-solid fa-arrows-up-down" aria-hidden="true"></i> ' + ((k.yenir || []).length + (k.alinir || []).length) + ' ürünün ' + SINIR + '’i görünüyor; listeyi kaydır</p>' : '') +
      '<p class="yg-il-dip"><span class="ornek-etiket">prototip örneği</span> Adlar TÜRKPATENT coğrafi işaret sicilinden; durak konumu il ya da ilçe merkezi.</p></article>';
  };
  /* 5 satır sınırı ölçülerek kurulur (ad iki satıra inebilir): 6. satırın üst kenarı kabın yüksekliği olur.
     Altta kalan içerik varsa kabın altında solgunluk ve "Kaydır" ipucu (ortak `scroll-affordance` deseninin dikey karşılığı) */
  var SINIR = 5;
  var govdeOlc = function (g) {
    var r = g.querySelectorAll('.yg-il-urun'); g.style.maxHeight = '';
    if (r.length > SINIR && g.offsetParent) { g.style.maxHeight = Math.round(r[SINIR].getBoundingClientRect().top - g.getBoundingClientRect().top + g.scrollTop) + 'px'; }
    govdeIz(g);
  };
  var govdeIz = function (g) { var k = g.parentNode, alt = g.scrollHeight - g.clientHeight - g.scrollTop > 4; k.classList.toggle('has-scroll-b', alt); k.classList.toggle('has-scroll-t', g.scrollTop > 4); };
  var govdeRO = window.ResizeObserver ? new ResizeObserver(function (e) { e.forEach(function (x) { if (x.contentRect.width) { govdeOlc(x.target); } }); }) : null;
  var govdeKur = function () {
    $$('.yg-il-govde').forEach(function (g) {
      if (g.dataset.kur) { return; } g.dataset.kur = '1';
      g.addEventListener('scroll', function () { govdeIz(g); }, { passive: true });
      if (govdeRO) { govdeRO.observe(g); } govdeOlc(g);
    });
  };
  /* Noktalar örnek olduğu için canlı Open Charge Map atfı yerine örnek kaynağı yazılır */
  var atif = $('.yg-sarj-credit:not(#ygYakitKaynak)'); if (atif) { atif.textContent = 'Kaynak: prototip örneği. Canlıda Open Charge Map verisi kullanılır.'; }
  var demoBas = $('#ygDemo .yg-demo-h'); if (demoBas) { demoBas.innerHTML = '<span class="ornek-etiket">prototip örneği</span>'; }

  /* İl kartları yalnız güzergâhın geçtiği iller için, yolculuk sırasıyla */
  var ozet = $('#ygSummary'), iller = $('#ygIller'), ilAnahtar = '';
  var ilEsle = function () {
    /* Çizgi ve kart aynı kaynaktan (Beyar, 9 Kas): çizginin geçtiği iller `dgRotaIller` sırasıyla; çizginin geçmediği ile kart yok */
    var adlar = ozet.hidden || !window.dgRotaIller ? [] : window.dgRotaIller();
    var l = adlar.map(function (a) { return IL.filter(function (i) { return i.il === a; })[0]; }).filter(Boolean);
    var anahtar = l.map(function (i) { return i.il; }).join('|');
    if (anahtar !== ilAnahtar) { $('#ygIlKart').innerHTML = l.map(ilKart).join(''); ilAnahtar = anahtar; ilRozet(l); }
    iller.hidden = !l.length; govdeKur(); durakBoya();
  };
  /* Haritada il rozeti: rotanın geçtiği her ile küçük ad rozeti; tıklanınca ilin kartı öne gelir (Beyar, 9 Kas) */
  var rozetler = L.layerGroup().addTo(h);
  var ilRozet = function (l) {
    rozetler.clearLayers();
    l.forEach(function (i) {
      var ik = L.divIcon({ className: 'yg-il-harita', html: '<button type="button" class="yg-il-harita-rozet" data-il-on="' + kac(i.il) + '"><i class="fa-solid fa-certificate" aria-hidden="true"></i>' + kac(i.il) + '</button>', iconSize: [0, 0] });
      rozetler.addLayer(L.marker([i.lat, i.lng], { icon: ik, keyboard: false, zIndexOffset: 900 }));
    });
  };
  var ilOne = function (ad) {
    var k = ad ? $('.yg-il-kart[data-il="' + ad + '"]') : iller; if (!k || iller.hidden) { return; }
    var gor = $('#ygViewToggle [data-v="list"]'); if (gor && window.matchMedia('(max-width:860px)').matches && !$('.yg-panel').classList.contains('sheet-full')) { gor.click(); }
    if ($('#viewRoute').hidden && $('#tabRoute')) { $('#tabRoute').click(); }
    setTimeout(function () {
      var v = $('#viewRoute'); v.scrollTo({ top: v.scrollTop + k.getBoundingClientRect().top - v.getBoundingClientRect().top - 12, behavior: 'smooth' });
      $$('.yg-il-kart.is-one').forEach(function (x) { x.classList.remove('is-one'); }); if (ad) { k.classList.add('is-one'); setTimeout(function () { k.classList.remove('is-one'); }, 2200); }
    }, 260);
  };
  /* Koridor etiketi: çizilen hat örnek koridordur, haritada ortasına "prototip örneği" yazılır */
  var etiket = null;
  var koridorEtiket = function () {
    var p = window.dgRotaHat ? window.dgRotaHat() : []; if (etiket) { h.removeLayer(etiket); etiket = null; }
    if (p.length < 2 || ozet.hidden) { return; }
    var o = p[Math.floor(p.length / 2)];
    etiket = L.marker([o[1], o[0]], { interactive: false, keyboard: false, icon: L.divIcon({ className: 'yg-koridor-etiket', html: '<span class="ornek-etiket">Örnek koridor · prototip örneği</span>', iconSize: [0, 0] }) }).addTo(h);
  };
  /* Sapma toleransı kanon segmentinde (Beyar 10 Kas D9): canlı çip adı uzun ("En Fazla 10 Dakika Sapma"); segmentte kısa ad,
     tam ad `title` ve `aria-label`da. Canlı betik çipleri her değişimde yeniden yazar, kısaltma her seferinde uygulanır */
  var tolKisa = function () {
    var tanim = {}; (BOOT.tolerans || []).forEach(function (t) { tanim[t.id] = t; });
    $$('#ygTolChips .yg-tol-chip').forEach(function (b) {
      if (b.dataset.kisa) { return; } var t = tanim[b.dataset.tol]; if (!t) { return; }
      var tam = b.textContent.trim(); b.dataset.kisa = '1'; b.title = tam; b.setAttribute('aria-label', tam);
      b.textContent = t.dk === 0 ? 'Tam yol üstü' : t.dk ? t.dk + ' dk' : 'Özel km';
    });
  };
  var tc = $('#ygTolChips'); if (tc) { new MutationObserver(tolKisa).observe(tc, { childList: true }); tolKisa(); }
  /* Navigasyona aktarım. Sınırlar `mobil-arastirma.md` §4.1: Google 9 ara durak, mobil tarayıcıda 3; Apple iOS 18.4 ve macOS 15.4 sonrası çok durak;
     Yandex web `rtext` çok durak taşır, uygulamada yalnız kalkış ve varış belgeli. Sınır aşılırsa rota etaplara bölünür. */
  var mobil = function () { return window.matchMedia('(max-width: 767px), (pointer: coarse)').matches; };
  var kor = function (n) { return (+n.lat).toFixed(5) + ',' + (+n.lng).toFixed(5); };
  var etaplar = function (z, sinir) { var l = [], i = 0; while (i < z.length - 1) { var son = Math.min(i + sinir + 1, z.length - 1); l.push(z.slice(i, son + 1)); i = son; } return l; };
  var googleBag = function (z) { var a = z.slice(1, -1); return 'https://www.google.com/maps/dir/?api=1&origin=' + encodeURIComponent(kor(z[0])) + '&destination=' + encodeURIComponent(kor(z[z.length - 1])) + (a.length ? '&waypoints=' + encodeURIComponent(a.map(kor).join('|')) : '') + '&travelmode=driving'; };
  var appleBag = function (z) { return 'https://maps.apple.com/directions?source=' + encodeURIComponent(kor(z[0])) + '&destination=' + encodeURIComponent(kor(z[z.length - 1])) + z.slice(1, -1).map(function (n) { return '&waypoint=' + encodeURIComponent(kor(n)); }).join('') + '&mode=driving'; };
  var yandexBag = function (z) { return 'https://yandex.com.tr/maps/?rtext=' + z.map(kor).join('~') + '&rtt=auto'; };
  var kisa = function (n) { return String(n.ad).split(',')[0]; };
  var paylasBag = function (z) { return location.origin + location.pathname + '?rota=' + encodeURIComponent(JSON.stringify(z.map(function (n) { return [String(n.ad), +(+n.lat).toFixed(5), +(+n.lng).toFixed(5)]; }))); };
  var aktarDugme = function (ikon, ad, l, bag) {
    return l.map(function (z, i) { var etap = l.length > 1 ? ' · Etap ' + (i + 1) + '/' + l.length : ''; return '<a class="yg-aktar-bag" href="' + kac(bag(z)) + '" target="_blank" rel="noopener noreferrer"><i class="' + ikon + '" aria-hidden="true"></i><span><b>' + ad + etap + '</b>' + (l.length > 1 ? '<small>' + kac(kisa(z[0]) + ' → ' + kisa(z[z.length - 1])) + '</small>' : '') + '</span><i class="fa-solid fa-arrow-up-right-from-square yg-aktar-ok" aria-hidden="true"></i></a>'; }).join('');
  };
  var aktar = function () {
    var api = window.dgRotaApi, z = api ? api.zincir() : [], kap = $('#ygAktar'); kap.hidden = z.length < 2 || ozet.hidden; if (kap.hidden) { return; }
    var ara = z.length - 2, gSinir = mobil() ? 3 : 9, gl = etaplar(z, gSinir), not = [];
    $('#ygAktarSayi').textContent = z.length + ' nokta · ' + ara + ' ara durak';
    $('#ygAktarListe').innerHTML = aktarDugme('fa-brands fa-google', 'Google Maps', gl, googleBag) + aktarDugme('fa-brands fa-apple', 'Apple Maps', [z], appleBag) + aktarDugme('fa-brands fa-yandex', 'Yandex', [z], yandexBag);
    if (gl.length > 1) { not.push('Google ' + (mobil() ? 'mobil tarayıcıda 3' : '9') + ' ara durak alır; rota ' + gl.length + ' etaba bölündü.'); }
    if (ara) { not.push('Apple Maps çok durağı iOS 18.4 ve macOS 15.4 sonrasında açar.'); not.push('Yandex uygulaması yalnız kalkış ve varışı alabilir.'); }
    $('#ygAktarNot').textContent = not.join(' ');
    /* Tek akıllı rota bağlantısı (R3.6d): bütün duraklar tek adreste; açan kişi Google, Apple ya da Yandex'i seçer */
    var tek = paylasBag(z);
    $('#ygAktarListe').insertAdjacentHTML('beforeend', '<button type="button" class="yg-aktar-bag" data-tek-bag="' + kac(tek) + '"><i class="fa-solid fa-link" aria-hidden="true"></i><span><b>Tek rota bağlantısı</b><small>' + z.length + ' nokta, üç navigasyon uygulaması</small></span></button>');
  };
  var hepsi = function () { GI = null; ilEsle(); yenile(); aktar(); koridorEtiket(); };
  window.addEventListener('dg-rota', function () { setTimeout(hepsi, 0); });
  document.addEventListener('dg:rota', function () { setTimeout(hepsi, 0); });
  new MutationObserver(hepsi).observe(ozet, { attributes: true, attributeFilter: ['hidden'] }); hepsi();
  /* Mekân sayısı canlı kadranda değişince sekme sayısı tazelenir */
  var dc = $('#ygDashCount'); if (dc) { new MutationObserver(function () { var s = $('#ygSerit [data-serit="mekan"] .yg-dash-cnt'); if (s) { s.textContent = dc.textContent; } }).observe(dc, { childList: true, characterData: true, subtree: true }); }
  /* Canlı kadran yeniden çizilince başlığı "Yol üstü mekânlar"a döndürür; İhtiyaçlar açıksa başlık geri alınır */
  var dtt = $('#ygDashTitleTxt'); if (dtt) { new MutationObserver(function () { if (seritAktif !== 'mekan' && dtt.textContent !== 'Yol üstü · İhtiyaçlar') { dtt.textContent = 'Yol üstü · İhtiyaçlar'; } }).observe(dtt, { childList: true, characterData: true, subtree: true }); }

  new MutationObserver(function () { durakBoya(); aktar(); if (yakitSonuc.length) { yakitCiz(); } }).observe($('#ygStopList'), { childList: true, subtree: true });
  var plan = $('#ygPlanList'); if (plan) { new MutationObserver(aktar).observe(plan, { childList: true, subtree: true }); }
  document.addEventListener('click', function (e) {
    var ar = e.target.closest('[data-arac]'); if (ar) { aracSec(ar.dataset.arac); return; }
    if (e.target.closest('#ygYakitToggle')) { yakitDegis(!yakitAcik); return; }
    var yr = e.target.closest('[data-yakit]'); if (yr) { yakitAc(yr.dataset.yakit); var x = yakitSonuc.filter(function (y) { return y.id === yr.dataset.yakit; })[0]; if (x) { h.flyTo([x.v.lat, x.v.lng], Math.max(h.getZoom(), 11), { duration: 0.6 }); } return; }
    var ir = e.target.closest('[data-il-on]'); if (ir) { ilOne(ir.dataset.ilOn); return; }
    if (e.target.closest('#ygIllerBas')) { ilOne(null); return; }
    var sk2 = e.target.closest('[data-serit]'); if (sk2) { seritSec(sk2.dataset.serit); return; }
    var kk = e.target.closest('[data-kart-lat]'); if (kk && !e.target.closest('[data-durak]')) { h.flyTo([+kk.dataset.kartLat, +kk.dataset.kartLng], Math.max(h.getZoom(), 10), { duration: 0.6 }); return; }
    var tb = e.target.closest('[data-tek-bag]');
    if (tb) { var bg = tb.dataset.tekBag, ok = function () { (window.prototipBildir || function () {})('Tek rota bağlantısı kopyalandı.'); }; if (navigator.clipboard) { navigator.clipboard.writeText(bg).then(ok, function () { window.prompt('Bağlantı', bg); }); } else { window.prompt('Bağlantı', bg); } return; }
    var d = e.target.closest('[data-durak]');
    if (d && window.dgRotaApi) { if (d.getAttribute('aria-pressed') !== 'true') { window.dgRotaApi.durakYap({ ad: d.dataset.durak, lat: +d.dataset.lat, lng: +d.dataset.lng }); } durakBoya(); return; }
    var k = e.target.closest('[data-katman]'); if (!k) { return; }
    var on = k.getAttribute('aria-pressed') !== 'true', ad = k.dataset.katman; k.setAttribute('aria-pressed', on ? 'true' : 'false');
    if (ad === 'gastronomi') { document.body.classList.toggle('gastronomi-kapali', !on); seritYenile(); return; }
    acik[ad] = on; if (on) { grup[ad].addTo(h); } else { h.removeLayer(grup[ad]); } pinleriCiz();
  });
  /* Paylaşılan rota (?rota=): duraklar adresten okunur, üç uygulamaya çok duraklı aktarım bağları basılır */
  (function () {
    var m = /[?&]rota=([^&]+)/.exec(location.search); if (!m) { return; }
    var z; try { z = JSON.parse(decodeURIComponent(m[1])).map(function (x) { return { ad: x[0], lat: x[1], lng: x[2] }; }); } catch (e) { return; }
    if (!z || z.length < 2) { return; }
    var gl = etaplar(z, mobil() ? 3 : 9);
    $('section.yg-katman').insertAdjacentHTML('beforebegin', '<section class="yg-aktar" id="ygPaylasilan" aria-label="Paylaşılan rota"><div class="yg-katman-bas"><span class="yg-eyebrow">Paylaşılan rota</span><span class="yg-aktar-sayi">' + z.length + ' nokta · ' + (z.length - 2) + ' ara durak</span></div><p class="yg-aktar-not">' + kac(z.map(kisa).join(' → ')) + '</p><div class="yg-aktar-liste">' + aktarDugme('fa-brands fa-google', 'Google Maps', gl, googleBag) + aktarDugme('fa-brands fa-apple', 'Apple Maps', [z], appleBag) + aktarDugme('fa-brands fa-yandex', 'Yandex', [z], yandexBag) + '</div></section>');
  })();
  /* Telefonda konum düğmesi (canlı FAB) sayfa yukarı kayınca başlığın altına girip kırpılıyordu: başlıkla çakışınca gizlenir */
  var fab = $('#ygLocate'), ust = $('.yg-top'), fabBekle = 0;
  var fabKontrol = function () { fabBekle = 0; if (!fab || !ust) { return; } fab.classList.toggle('yg-locate--ortu', fab.getBoundingClientRect().top < ust.getBoundingClientRect().bottom + 4); };
  var fabSirala = function () { if (!fabBekle) { fabBekle = requestAnimationFrame(fabKontrol); } };
  ['scroll', 'transitionend', 'touchend', 'mouseup'].forEach(function (o) { document.addEventListener(o, fabSirala, true); }); window.addEventListener('resize', fabSirala);
  new MutationObserver(fabSirala).observe($('.yg-panel'), { attributes: true, attributeFilter: ['class', 'style'] });
  /* Açılış canlıdaki gibi boş karşılama (Beyar, 9 Kas). `?ornek=1` inceleme için örnek güzergâhı yükler */
  if (/[?&]ornek=1/.test(location.search)) { setTimeout(function () { var p = $('#ygPilots button, #ygPilots a'); if (p) { p.click(); } }, 300); }
})();
