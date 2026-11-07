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

  var YERLER = [[34, 'İstanbul', 'Marmara', 41.0112, 28.9781], [35, 'İzmir', 'Ege', 38.429, 27.1342], [6, 'Ankara', 'İç Anadolu', 39.9255, 32.8378], [7, 'Antalya', 'Akdeniz', 36.8969, 30.7133], [16, 'Bursa', 'Marmara', 40.1885, 29.061], [10, 'Balıkesir', 'Marmara', 39.6484, 27.8826], [45, 'Manisa', 'Ege', 38.6191, 27.4289], [48, 'Muğla', 'Ege', 37.2153, 28.3636], [50, 'Nevşehir', 'İç Anadolu', 38.6244, 34.7239], [41, 'Kocaeli', 'Marmara', 40.7654, 29.9408], [26, 'Eskişehir', 'İç Anadolu', 39.7767, 30.5206], [3, 'Afyonkarahisar', 'Ege', 38.7507, 30.5567], [42, 'Konya', 'İç Anadolu', 37.8746, 32.4932]]
    .map(function (y) { return { id: y[0], ad: y[1], alt: y[2], lat: y[3], lng: y[4], tur: 'city' }; });
  var tr = function (s) { return String(s).toLocaleLowerCase('tr'); };
  var km = function (a, b, c, d) { var r = Math.PI / 180, x = (d - b) * r * Math.cos((a + c) * r / 2), y = (c - a) * r; return Math.sqrt(x * x + y * y) * 6371; };
  var hat = [];
  function rotaKur(duraklar) {
    var ilk = duraklar[0], son = duraklar[duraklar.length - 1], o = R.cizgi, p = [];
    var ornekHat = duraklar.length === 2 && km(ilk.lat, ilk.lng, o[0][1], o[0][0]) < 40 && km(son.lat, son.lng, o[o.length - 1][1], o[o.length - 1][0]) < 40;
    if (ornekHat) { p = o.map(function (c) { return [c[0], c[1]]; }); } else {
      for (var i = 0; i < duraklar.length - 1; i++) { var a = duraklar[i], b = duraklar[i + 1]; for (var t = 0; t <= 12; t++) { var u = t / 12, k = Math.sin(u * Math.PI) * 0.06; p.push([a.lng + (b.lng - a.lng) * u + (b.lat - a.lat) * k, a.lat + (b.lat - a.lat) * u - (b.lng - a.lng) * k]); } }
    }
    var top = 0; for (var j = 1; j < p.length; j++) { top += km(p[j - 1][1], p[j - 1][0], p[j][1], p[j][0]); }
    hat = p; var metre = Math.round(top * 1.08 * 1000);
    window.dispatchEvent(new Event('dg-rota'));
    return { rotalar: [{ geometry: { coordinates: p }, distance: metre, duration: Math.round(metre / 1000 / 85 * 3600), tahmini: false }], token: 'prototip-' + Date.now(), saglayici: { ad: 'Prototip örneği' } };
  }
  function hataUzak(m) {
    var en = 1e9, sira = 0; for (var i = 0; i < hat.length - 1; i++) { var a = hat[i], b = hat[i + 1]; for (var t = 0; t <= 6; t++) { var u = t / 6, d = km(m.lat, m.lng, a[1] + (b[1] - a[1]) * u, a[0] + (b[0] - a[0]) * u); if (d < en) { en = d; sira = i + u; } } }
    return { d: en, sira: sira };
  }
  window.dgRotaUzak = function (lat, lng) { return hat.length ? hataUzak({ lat: lat, lng: lng }).d : 1e9; };
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
  /* Şarj: yalnız rotaya 20 km içindeki örnek noktalar; eşleşen mekân gerçek konumdan, 1 km yürüme mesafesi (§8 #10) */
  function sarj(q) {
    var tur = q.get('tur') || 'tum', min = +q.get('min_kw') || 0;
    var l = R.katman.sarj.map(function (n, i) {
      var u = hataUzak({ lat: n[1], lng: n[0] }), dc = /DC/.test(n[2]);
      var yakin = M.map(function (m) { return { id: m.slug, slug: m.slug, ad: m.name, mesafe_m: Math.round(km(n[1], n[0], m.lat, m.lng) * 1000), url: kok + 'mekan/mikla/' }; }).filter(function (m) { return m.mesafe_m <= 1000; }).sort(function (a, b) { return a.mesafe_m - b.mesafe_m; });
      return { id: 'ornek-' + i, ad: n[2] + ' (prototip örneği)', tur: dc ? 'DC' : 'AC', kw: dc ? 120 : 22, lat: n[1], lng: n[0], rotadan_km: Math.round(u.d * 10) / 10, sahiplik: null, operator: null, veri_saglayici: 'Prototip örneği', lisans: 'örnek veri', mekanlar: yakin };
    }).filter(function (s) { return s.rotadan_km <= 20 && (tur === 'tum' || s.tur === tur) && s.kw >= min; });
    return { istasyonlar: l, veri_hazir: true, toplam: l.length };
  }
  var yanit = function (v) { return Promise.resolve(new Response(JSON.stringify(v), { status: 200, headers: { 'Content-Type': 'application/json' } })); };
  var once = window.fetch;
  window.fetch = function (girdi, ayar) {
    var adres = typeof girdi === 'string' ? girdi : girdi.url, m = /dada-route\/api\/([a-z-]+)(.*)$/.exec(adres);
    if (!m) { return once(girdi, ayar); }
    var q = new URLSearchParams(m[2].split('?')[1] || ''), uc = m[1], yontem = ((ayar && ayar.method) || 'GET').toUpperCase();
    if (uc === 'yerler') { var a = tr(q.get('q') || ''); return yanit({ yerler: YERLER.filter(function (y) { return tr(y.ad).indexOf(a) === 0; }) }); }
    if (uc === 'en-yakin') { var la = +q.get('lat'), ln = +q.get('lng'), s = YERLER.slice().sort(function (x, y) { return km(la, ln, x.lat, x.lng) - km(la, ln, y.lat, y.lng); })[0]; return yanit({ yer: s, uzaklikKm: Math.round(km(la, ln, s.lat, s.lng)) }); }
    if (uc === 'rota') { return yanit(rotaKur(JSON.parse(ayar.body).duraklar)); }
    if (uc === 'mekanlar' && yontem === 'GET') { return yanit(mekanlar(q)); }
    if (uc === 'sarj') { return yanit(sarj(q)); }
    if (uc === 'guzergahlarim' && yontem === 'GET') { return yanit({ guzergahlar: [] }); }
    return yanit({ ok: true, prototip: true });
  };
})();
