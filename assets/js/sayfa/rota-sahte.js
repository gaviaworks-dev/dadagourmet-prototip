/* Dada Route statik uçları. Canlı `dada-route.js` değişmeden çalışsın diye sunucu yanıtları burada üretilir.
   Hiçbir yere istek gitmez. Rota, süre ve şarj noktaları örnektir; mekân konumları canlı kayıtların kopyasıdır. */
(function () {
  'use strict';
  var R = window.DG_ROTA, M = window.DG_MEKANLAR || [], V = window.DG_LISTE || { mekanlar: [], kartlar: {}, secenek: {} };
  var kok = document.documentElement.dataset.kok || './';
  var harita = document.getElementById('routeMap');
  if (harita && document.querySelector('meta[name="dada-kimlik"]') && /"auth":true/.test(document.querySelector('meta[name="dada-kimlik"]').content)) { harita.setAttribute('data-auth', '1'); }
  /* Katmanların haritaya erişimi: canlı betik haritayı dışa vermez, kurulurken alınır */
  var ozMap = window.L.map; window.L.map = function () { var m = ozMap.apply(window.L, arguments); window.dgRotaHarita = m; return m; };

  /* Yer araması (Beyar, 9 Kas: "trabzon" eşleşmiyordu): 81 il ve başlıca ilçe/semt `rota-yerler.js`ten.
     Türkçe duyarlı ve büyük-küçük harften bağımsız: İ/ı/I/i, ş, ğ, ü, ö, ç katlanır; "IZMIR", "ızmir", "istanbul" eşleşir */
  var Y = window.DG_YERLER || { il: [], ilce: [] };
  var YERLER = Y.il.map(function (y) { return { id: y[0], ad: y[1], alt: y[2], lat: y[3], lng: y[4], tur: 'city' }; })
    .concat(Y.ilce.map(function (y, i) { return { id: 1000 + i, ad: y[0], alt: y[1], lat: y[2], lng: y[3], tur: 'district' }; }));
  var ILLER = YERLER.filter(function (y) { return y.tur === 'city'; });
  var katla = function (s) { return String(s).toLocaleLowerCase('tr').replace(/[ıİI]/g, 'i').replace(/i̇/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/[âà]/g, 'a').replace(/[îì]/g, 'i').replace(/[ûù]/g, 'u').replace(/\s+/g, ' ').trim(); };
  YERLER.forEach(function (y) { y.k = katla(y.ad); y.ka = katla(y.alt); });
  window.dgKatla = katla;
  function yerAra(q) {
    var a = katla(q); if (!a) { return []; }
    return YERLER.map(function (y) {
      var p = y.k === a ? 0 : y.k.indexOf(a) === 0 ? 1 : (' ' + y.k).indexOf(' ' + a) >= 0 ? 2 : (a.length > 2 && y.k.indexOf(a) > 0) ? 3 : (a.length > 2 && y.ka.indexOf(a) === 0) ? 4 : -1;
      return { y: y, p: p < 0 ? -1 : p * 2 + (y.tur === 'city' ? 0 : 1) };
    }).filter(function (x) { return x.p >= 0; }).sort(function (x, z) { return x.p - z.p || x.y.ad.localeCompare(z.y.ad, 'tr'); }).slice(0, 8)
      .map(function (x) { return { id: x.y.id, ad: x.y.ad, alt: x.y.alt, lat: x.y.lat, lng: x.y.lng, tur: x.y.tur }; });
  }
  var km = function (a, b, c, d) { var r = Math.PI / 180, x = (d - b) * r * Math.cos((a + c) * r / 2), y = (c - a) * r; return Math.sqrt(x * x + y * y) * 6371; };
  /* Örnek koridor (Beyar, 9 Kas): rota `rota-yol-agi.js` kara yolu ağı üstünden en kısa yol olarak çizilir; denizden düz geçmez.
     İl merkezi olmayan durak (ilçe, mekân, ürün durağı) en yakın iki il düğümüne bağlanır; kıyıda dolanan ilçeler ağdaki ara noktayla.
     Çizgi ve il kartı aynı kaynaktan: geçilen il düğümleri ve bağların içinden geçtiği iller (`dgRotaIller`). Hesaplanmış yol değildir */
  var AG = window.DG_YOL_AGI || { bag: [], ilce: {} }, DUGUM = {}, KOMSU = {};
  ILLER.forEach(function (y) { DUGUM[y.ad] = y; KOMSU[y.ad] = []; });
  var hatUzun = function (n) { var t = 0; for (var i = 1; i < n.length; i++) { t += km(n[i - 1][0], n[i - 1][1], n[i][0], n[i][1]); } return t; };
  var bagla = function (a, b, ara, il) {
    var A = DUGUM[a], B = DUGUM[b]; if (!A || !B) { return; }
    var n = [[A.lat, A.lng]].concat(ara || [], [[B.lat, B.lng]]), w = hatUzun(n);
    KOMSU[a].push({ b: b, n: n, w: w, il: il || [] }); KOMSU[b].push({ b: a, n: n.slice().reverse(), w: w, il: (il || []).slice().reverse() });
  };
  AG.bag.forEach(function (e) { bagla(e[0], e[1], e[2], e[3]); });
  function enKisa(bas, uclar) {
    var d = {}, onceki = {}, acik = Object.keys(bas);
    acik.forEach(function (k) { d[k] = bas[k].w; });
    var kume = {}; acik.forEach(function (k) { kume[k] = 1; });
    while (Object.keys(kume).length) {
      var u = Object.keys(kume).sort(function (x, y) { return d[x] - d[y]; })[0]; delete kume[u];
      if (uclar[u]) { /* hedefe bağlı düğüm: toplam maliyet ucun kendi bağıyla */ }
      (KOMSU[u] || []).forEach(function (e) { var nd = d[u] + e.w; if (d[e.b] === undefined || nd < d[e.b]) { d[e.b] = nd; onceki[e.b] = { u: u, e: e }; kume[e.b] = 1; } });
    }
    var en = null; Object.keys(uclar).forEach(function (k) { if (d[k] !== undefined && (!en || d[k] + uclar[k].w < en.t)) { en = { k: k, t: d[k] + uclar[k].w }; } });
    if (!en) { return null; }
    var yol = [], k = en.k; while (onceki[k]) { yol.unshift(onceki[k].e); k = onceki[k].u; }
    return { bas: bas[k], yol: yol, son: uclar[en.k] };
  }
  /* Durağın ağa bağları: il merkeziyse kendisi, değilse en yakın iki il (ilçe tablosunda ara noktalı bağ varsa o) */
  function baglar(s) {
    var o = {};
    var il = ILLER.filter(function (y) { return km(y.lat, y.lng, s.lat, s.lng) < 3; })[0];
    if (il) { o[il.ad] = { w: 0, n: [[il.lat, il.lng]] }; return o; }
    var ozel = AG.ilce[s.ad];
    if (ozel) { ozel.forEach(function (x) { var Y = DUGUM[x[0]], n = [[Y.lat, Y.lng]].concat(x[1], [[s.lat, s.lng]]); o[x[0]] = { w: hatUzun(n), n: n }; }); return o; }
    ILLER.slice().sort(function (x, y) { return km(x.lat, x.lng, s.lat, s.lng) - km(y.lat, y.lng, s.lat, s.lng); }).slice(0, 2)
      .forEach(function (Y) { var n = [[Y.lat, Y.lng], [s.lat, s.lng]]; o[Y.ad] = { w: hatUzun(n), n: n }; });
    return o;
  }
  var gecilenIller = [], hat = [];
  function koridor(a, b) {
    var ba = baglar(a), bb = baglar(b), ilA = Object.keys(ba), ilB = Object.keys(bb);
    var bas = {}; ilA.forEach(function (k) { bas[k] = { w: ba[k].w, n: ba[k].n.slice().reverse(), k: k }; });
    var r = enKisa(bas, bb); if (!r) { return { n: [[a.lat, a.lng], [b.lat, b.lng]], il: [] }; }
    var n = r.bas.n.slice(), il = [r.bas.k];
    r.yol.forEach(function (e) { n = n.concat(e.n.slice(1)); il = il.concat(e.il, [e.b]); });
    n = n.concat(r.son.n.slice(1));
    return { n: n, il: il };
  }
  window.dgRotaIller = function () { return gecilenIller.slice(); };
  function rotaKur(duraklar) {
    var p = [], il = [];
    for (var i = 0; i < duraklar.length - 1; i++) {
      var k = koridor(duraklar[i], duraklar[i + 1]);
      k.n.forEach(function (c, j) { if (p.length && !j) { return; } p.push([c[1], c[0]]); });
      il = il.concat(k.il);
      /* ilçe durağı kendi ilini de karta taşır (İzmir–Bodrum: Muğla) */
      var ilce = YERLER.filter(function (y) { return y.tur === 'district' && y.ad === duraklar[i + 1].ad; })[0]; if (ilce) { il.push(ilce.alt); }
    }
    gecilenIller = il.filter(function (x, j) { return il.indexOf(x) === j; });
    var top = 0; for (var j = 1; j < p.length; j++) { top += km(p[j - 1][1], p[j - 1][0], p[j][1], p[j][0]); }
    hat = p; var metre = Math.round(top * 1.12 * 1000);
    window.dispatchEvent(new Event('dg-rota'));
    return { rotalar: [{ geometry: { coordinates: p }, distance: metre, duration: Math.round(metre / 1000 / 85 * 3600), tahmini: false }], token: 'prototip-' + Date.now(), saglayici: { ad: 'Prototip örneği' } };
  }
  function hataUzak(m) {
    var en = 1e9, sira = 0; for (var i = 0; i < hat.length - 1; i++) { var a = hat[i], b = hat[i + 1]; for (var t = 0; t <= 6; t++) { var u = t / 6, d = km(m.lat, m.lng, a[1] + (b[1] - a[1]) * u, a[0] + (b[0] - a[0]) * u); if (d < en) { en = d; sira = i + u; } } }
    return { d: en, sira: sira };
  }
  window.dgRotaUzak = function (lat, lng) { return hat.length ? hataUzak({ lat: lat, lng: lng }).d : 1e9; };
  /* İl kartı sırası ve koridor etiketi için: noktanın rotadaki sırası ve çizginin kendisi */
  window.dgRotaSira = function (lat, lng) { return hat.length ? hataUzak({ lat: lat, lng: lng }).sira : 0; };
  window.dgRotaHat = function () { return hat.slice(); };
  /* Örnek nokta üretici (Beyar, 9 Kas: açılan katmanın noktası haritada görünsün): güzergâhta sabit örnek nokta yoksa
     çizgi boyunca her `aralik` km'de bir, yoldan `kay` km yana kaymış nokta. Tesis değildir, "prototip örneği" */
  window.dgRotaOrnek = function (aralik, kay, bas) {
    var l = [], top = 0, sonraki = bas || aralik / 2;
    for (var i = 1; i < hat.length; i++) {
      var a = hat[i - 1], b = hat[i], d = km(a[1], a[0], b[1], b[0]);
      while (d > 0 && top + d >= sonraki) {
        var u = (sonraki - top) / d, lat = a[1] + (b[1] - a[1]) * u, lng = a[0] + (b[0] - a[0]) * u, nx = -(b[1] - a[1]), ny = (b[0] - a[0]), nn = Math.sqrt(nx * nx + ny * ny) || 1;
        l.push({ lat: lat + ny / nn * kay / 111, lng: lng + nx / nn * kay / 85, sira: i - 1 + u }); sonraki += aralik;
      }
      top += d;
    }
    return l;
  };
  /* Şarj noktaları: rotaya 20 km içindeki sabit örnekler; yoksa her 150 km'de bir üretilen örnek DC nokta, yanında örnek yemek eşi */
  window.dgRotaSarjNoktalari = function () {
    var l = R.katman.sarj.filter(function (n) { return hataUzak({ lat: n[1], lng: n[0] }).d <= 20; });
    if (!l.length && hat.length) { l = window.dgRotaOrnek(150, 1.5).map(function (o, i) { return [o.lng, o.lat, i % 3 === 2 ? 'Örnek AC şarj' : 'Örnek DC hızlı şarj', [['Örnek esnaf lokantası', 'Örnek pideci', 'Örnek köfteci'][i % 3], 300 + (i % 3) * 100]]; }); }
    return l;
  };
  var detay = {}; V.mekanlar.forEach(function (m) { detay[m.slug] = m; });
  var ilAd = {}; (V.secenek.il || []).forEach(function (o) { ilAd[o.deger] = o.ad; });
  function mekanlar(q) {
    var sinir = q.get('km') ? +q.get('km') : Math.max(1, (+q.get('dk') || 0) * 55 / 60 / 2);
    var l = [];
    M.forEach(function (m, i) {
      var u = hataUzak(m); if (u.d > sinir) { return; }
      var d = detay[m.slug] || { f: {} }, k = (V.kartlar[m.slug] || ''), il = ilAd[(d.f.il || [])[0]] || '';
      var gorsel = (/url\((?:'|&#0?39;)([^'&]+)/.exec(k) || [])[1]; var ves = d.f.vesile || [];
      l.push({ id: i + 1, slug: m.slug, ad: m.name, lat: m.lat, lng: m.lng, cat: (/disc-cat">([^<]+)</.exec(k) || [])[1] || m.type || null, puan: null, konum: [m.district, il].filter(Boolean).join(' · '), sehir: il, il: il, ilce: m.district, mutfak: null, mutfakId: null, tur: m.type || null, editor: false, sponsor: false, sponsorCta: null, img: gorsel ? new URL(gorsel.split('{{kok}}').join(kok), location.href).href : null, url: kok + 'mekan/mikla/', ogunler: ves.indexOf('kahvalti') >= 0 ? ['kahvalti'] : [], aileyeUygun: false, yoresel: (d.f.konsept || []).indexOf('yerel-lezzet-noktasi') >= 0, ozellikler: [], acik: /st-closed/.test(k) ? 'closed' : 'open', acikEtiket: /st-closed/.test(k) ? 'Kapalı' : 'Açık', calismaSaatleri: null, sonDogrulama: null, fiyatSeviyesi: m.price || null, sapmaKm: Math.round(u.d * 100) / 100, sapmaDk: Math.round(u.d / 55 * 60 * 2), sira: u.sira });
    });
    l.sort(function (a, b) { return a.sira - b.sira; });
    var ust = l.filter(function (m) { return m.sapmaKm <= 1; }).length;
    return { mekanlar: l.slice(0, 60), sayac: { yolUstu: ust, yolaYakin: l.length - ust, toplam: l.length }, kirpildi: l.length > 60 };
  }
  /* Şarj: yalnız rotaya 20 km içindeki örnek noktalar; eşleşen mekân gerçek konumdan, 1 km yürüme mesafesi (§8 #10).
     Şarj süresi (R2.5b) tahmin: 60 kWh batarya %20→%80, DC 120 kW verimle ~26 dk, AC 22 kW ~100 dk; yürüme 80 m/dk */
  function sarj(q) {
    var tur = q.get('tur') || 'tum', min = +q.get('min_kw') || 0;
    var l = window.dgRotaSarjNoktalari().map(function (n, i) {
      var u = hataUzak({ lat: n[1], lng: n[0] }), dc = /DC/.test(n[2]);
      var yakin = M.map(function (m) { var mm = Math.round(km(n[1], n[0], m.lat, m.lng) * 1000); return { id: m.slug, slug: m.slug, ad: m.name + ' · yürüyerek ' + Math.max(1, Math.round(mm / 80)) + ' dk', mesafe_m: mm, url: kok + 'mekan/mikla/' }; }).filter(function (m) { return m.mesafe_m <= 1000; }).sort(function (a, b) { return a.mesafe_m - b.mesafe_m; });
      return { id: 'ornek-' + i, ad: n[2] + ' (prototip örneği)', tur: dc ? 'DC' : 'AC', kw: dc ? 120 : 22, lat: n[1], lng: n[0], rotadan_km: Math.round(u.d * 10) / 10, sahiplik: null, operator: 'Prototip örneği · %20→%80 şarj tahmini ' + (dc ? '~26' : '~100') + ' dk (60 kWh batarya)', veri_saglayici: 'Prototip örneği', lisans: 'örnek veri', mekanlar: yakin };
    }).filter(function (s) { return s.rotadan_km <= 20 && (tur === 'tum' || s.tur === tur) && s.kw >= min; });
    return { istasyonlar: l, veri_hazir: true, toplam: l.length };
  }
  var yanit = function (v) { return Promise.resolve(new Response(JSON.stringify(v), { status: 200, headers: { 'Content-Type': 'application/json' } })); };
  var once = window.fetch;
  window.fetch = function (girdi, ayar) {
    var adres = typeof girdi === 'string' ? girdi : girdi.url, m = /dada-route\/api\/([a-z-]+)(.*)$/.exec(adres);
    if (!m) { return once(girdi, ayar); }
    var q = new URLSearchParams(m[2].split('?')[1] || ''), uc = m[1], yontem = ((ayar && ayar.method) || 'GET').toUpperCase();
    if (uc === 'yerler') { return yanit({ yerler: yerAra(q.get('q') || '') }); }
    if (uc === 'en-yakin') { var la = +q.get('lat'), ln = +q.get('lng'), s = ILLER.slice().sort(function (x, y) { return km(la, ln, x.lat, x.lng) - km(la, ln, y.lat, y.lng); })[0]; return yanit({ yer: s, uzaklikKm: Math.round(km(la, ln, s.lat, s.lng)) }); }
    if (uc === 'rota') { return yanit(rotaKur(JSON.parse(ayar.body).duraklar)); }
    if (uc === 'mekanlar' && yontem === 'GET') { return yanit(mekanlar(q)); }
    if (uc === 'sarj') { return yanit(sarj(q)); }
    if (uc === 'guzergahlarim' && yontem === 'GET') { return yanit({ guzergahlar: [] }); }
    return yanit({ ok: true, prototip: true });
  };
})();
