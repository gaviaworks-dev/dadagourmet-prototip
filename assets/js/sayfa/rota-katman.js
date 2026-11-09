/* Canlı Dada Route üstüne eklenen katmanlar ve il kartları. Rota Faz 4'e kadar Leaflet'tedir (K7).
   Katman noktaları güzergâha göre süzülür: yalnız çizili rotaya KORIDOR_KM içindekiler pin ve liste olur. */
(function () {
  'use strict';
  var R = window.DG_ROTA, L = window.L, h = window.dgRotaHarita; if (!R || !h) { return; }
  var $ = function (s) { return document.querySelector(s); }, $$ = function (s) { return [].slice.call(document.querySelectorAll(s)); };
  var kac = function (t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); };
  var KORIDOR_KM = 15, IL_KM = 30, KORIDOR = { tarihi: 25 };
  var ikon = { ibadet: 'fa-mosque', tarihi: 'fa-landmark', dinlenme: 'fa-bed', neyenir: 'fa-bowl-food', nealinir: 'fa-basket-shopping' };
  var baslik = { ibadet: 'İbadethane', tarihi: 'Tarihi inanç yapıları', dinlenme: 'Dinlenme alanı', neyenir: 'Ne Yenir?', nealinir: 'Ne Alınır?' };
  var grup = { ibadet: L.layerGroup(), tarihi: L.layerGroup(), dinlenme: L.layerGroup(), neyenir: L.layerGroup(), nealinir: L.layerGroup() };
  var acik = {};

  /* İl/Bölge Kimlik Motoru (R2.2, akış 2): il merkezleri `rota-yerler.js`, tescilli ürünler `rota-veri.js` `kimlik`.
     Ürünün ilçesi biliniyorsa durak o ilçe merkezine, bilinmiyorsa il merkezinin yakınına düşer (örnek konum) */
  var Y = window.DG_YERLER || { il: [], ilce: [] }, K = R.kimlik || {};
  var IL = Y.il.map(function (y) { return { il: y[1], lat: y[3], lng: y[4] }; });
  var ilce = {}; Y.ilce.forEach(function (y) { ilce[y[1] + '|' + y[0]] = { lat: y[2], lng: y[3] }; });
  var urunKonum = function (il, u, tip) { var c = u[1] && ilce[il.il + '|' + u[1]]; return c ? { lat: c.lat, lng: c.lng } : { lat: il.lat + (tip === 'yenir' ? 0.05 : -0.05), lng: il.lng + (tip === 'yenir' ? -0.07 : 0.07) }; };

  /* Nokta havuzu: katman başına tek biçim */
  var noktalar = {
    ibadet: R.katman.ibadet.map(function (n) { return { ad: n[2], lat: n[1], lng: n[0], alt: n[3] }; }),
    tarihi: R.katman.tarihi.map(function (n) { return { ad: n[2], lat: n[1], lng: n[0], alt: n[3] + ' · Ziyaret saatleri: örnek' }; }),
    dinlenme: R.katman.dinlenme.map(function (n) { return { ad: n[2], lat: n[1], lng: n[0], alt: n[3] + ' · Kaynak: örnek · Doğrulama: örnek tarih' }; }),
    neyenir: [], nealinir: []
  };
  IL.forEach(function (i) {
    var k = K[i.il]; if (!k) { return; }
    (k.yenir || []).forEach(function (u) { var c = urunKonum(i, u, 'yenir'); noktalar.neyenir.push({ ad: u[0] + ' · ' + i.il, lat: c.lat, lng: c.lng, alt: 'Coğrafi işaretli · imza lezzet' + (u[1] ? ' · ' + u[1] : ''), il: i.il }); });
    (k.alinir || []).forEach(function (u) { var c = urunKonum(i, u, 'alinir'); noktalar.nealinir.push({ ad: u[0] + ' · ' + i.il, lat: c.lat, lng: c.lng, alt: 'Coğrafi işaretli · örnek üretici ve kooperatif satış noktası' + (u[1] ? ' · ' + u[1] : ''), il: i.il }); });
  });
  var uzak = function (n) { return window.dgRotaUzak ? window.dgRotaUzak(n.lat, n.lng) : 1e9; };
  var pin = function (k, n) {
    var i = L.divIcon({ className: 'yg-katman-pin yg-katman-pin--' + k, html: '<i class="fa-solid ' + ikon[k] + '" aria-hidden="true"></i>', iconSize: [30, 30], iconAnchor: [15, 15] });
    return L.marker([n.lat, n.lng], { icon: i, title: n.ad }).bindPopup(kac(n.ad + ' (prototip örneği)'));
  };

  /* Şarj ve yemek eşleşmesi (R2.5b, akış 5): rotadaki her örnek şarj noktası, 1 km yürüme mesafesindeki Dada mekânıyla ya da
     örnek yemek noktasıyla eşleşir; şarj süresi tahmini 60 kWh batarya %20→%80 (DC ~26 dk, AC ~100 dk), yürüme 80 m/dk */
  var mesafe = function (a, b, c, d) { var r = Math.PI / 180, x = (d - b) * r * Math.cos((a + c) * r / 2), y = (c - a) * r; return Math.sqrt(x * x + y * y) * 6371000; };
  var sarjYemek = function () {
    var M = window.DG_MEKANLAR || [];
    return (window.dgRotaSarjNoktalari ? window.dgRotaSarjNoktalari() : R.katman.sarj).map(function (n) { var dc = /DC/.test(n[2]); return { s: { ad: n[2], lat: n[1], lng: n[0], tur: dc ? 'DC' : 'AC', dk: dc ? 26 : 100 }, ornek: n[3], d: uzak({ lat: n[1], lng: n[0] }) }; })
      .filter(function (x) { return x.d <= 20; }).sort(function (a, b) { return (window.dgRotaSira ? window.dgRotaSira(a.s.lat, a.s.lng) - window.dgRotaSira(b.s.lat, b.s.lng) : 0); })
      .map(function (x) {
        var en = M.map(function (m) { return { ad: m.name, m: mesafe(x.s.lat, x.s.lng, m.lat, m.lng) }; }).filter(function (m) { return m.m <= 1000; }).sort(function (a, b) { return a.m - b.m; })[0];
        var y = en || (x.ornek ? { ad: x.ornek[0], m: x.ornek[1] } : null);
        return y ? { s: x.s, y: { ad: y.ad, dk: Math.max(1, Math.round(y.m / 80)) } } : null;
      }).filter(Boolean);
  };

  /* Güzergâhta sabit örnek nokta yoksa çizgi boyunca üretilen örnekler (Beyar, 9 Kas: açılan katman haritada görünsün) */
  var URET = {
    ibadet: [90, 1.2, function (i) { return i % 2 ? { ad: 'Örnek mescit', alt: 'Mescit · akaryakıt istasyonu içi' } : { ad: 'Örnek cami', alt: 'Cami · abdesthane' }; }],
    tarihi: [220, 6, function (i) { return [{ ad: 'Örnek tarihi kilise', alt: 'Kilise · ziyaret saatleri: örnek' }, { ad: 'Örnek tarihi sinagog', alt: 'Sinagog · ziyaret saatleri: örnek' }, { ad: 'Örnek manastır kalıntısı', alt: 'Manastır · ören yeri' }][i % 3]; }],
    dinlenme: [110, 2, function (i) { return i % 2 ? { ad: 'Örnek bağ evi', alt: 'Konaklamalı · bağ evi lokantası · Kaynak: örnek' } : { ad: 'Örnek dinlenme cebi', alt: 'Aydınlatma, tuvalet · araç içi kısa mola · Kaynak: örnek' }; }]
  };
  var katmanNoktalari = function (k) {
    var l = noktalar[k].map(function (n) { return { n: n, d: uzak(n) }; }).filter(function (x) { return x.d <= (KORIDOR[k] || KORIDOR_KM); });
    if (!l.length && URET[k] && window.dgRotaOrnek) { l = window.dgRotaOrnek(URET[k][0], URET[k][1]).map(function (o, i) { var t = URET[k][2](i); return { n: { ad: t.ad, alt: t.alt, lat: o.lat, lng: o.lng }, d: uzak(o) }; }); }
    var sira = function (x) { return window.dgRotaSira ? window.dgRotaSira(x.n.lat, x.n.lng) : 0; };
    return l.sort(function (a, b) { return sira(a) - sira(b); });
  };

  /* Katman süzgeci: pin ve liste aynı kaynaktan */
  var liste = $('#ygKatmanListe'), satirlar = $('#ygKatmanSatir');
  var yenile = function () {
    var html = '', adet = 0, veri = {};
    Object.keys(grup).forEach(function (k) {
      grup[k].clearLayers();
      if (!acik[k]) { return; }
      var yakin = katmanNoktalari(k);
      yakin.forEach(function (x) { grup[k].addLayer(pin(k, x.n)); }); veri[k] = yakin;
      adet += yakin.length;
      html += '<div class="yg-kl-grup"><b>' + baslik[k] + ' <span>' + yakin.length + '</span></b>' + (yakin.length ? yakin.map(function (x) {
        return '<div class="yg-kl-satir"><span class="yg-il-ikon"><i class="fa-solid ' + ikon[k] + '" aria-hidden="true"></i></span><span class="yg-kl-metin"><b>' + kac(x.n.ad) + '</b><small>' + kac(x.n.alt) + ' · ' + (k === 'tarihi' ? 'yol ayrımından ' : 'yoldan ') + Math.max(1, Math.round(x.d)) + ' km</small></span><button type="button" class="yg-kl-durak" data-durak="' + kac(x.n.ad) + '" data-lat="' + x.n.lat + '" data-lng="' + x.n.lng + '" aria-pressed="false">Durak Yap</button></div>';
      }).join('') : '<p class="yg-kl-bos">Bu güzergâhta örnek nokta yok.</p>') + '</div>';
    });
    if (acik.sarj) { var e = sarjYemek(); adet += e.length; veri.sarj = e.map(function (x) { return { n: { ad: x.s.ad, alt: x.s.tur + ' · %20→%80 ~' + x.s.dk + ' dk · yürüyerek ' + x.y.dk + ' dk: ' + x.y.ad, lat: x.s.lat, lng: x.s.lng, durak: 'Şarj + yemek · ' + x.y.ad }, d: uzak(x.s) }; }); html = '<div class="yg-kl-grup"><b>Şarj + yemek molası <span>' + e.length + '</span></b>' + (e.length ? e.map(function (x) {
      return '<div class="yg-kl-satir"><span class="yg-il-ikon"><i class="fa-solid fa-charging-station" aria-hidden="true"></i></span><span class="yg-kl-metin"><b>' + kac(x.s.ad) + '</b><small>' + kac(x.s.tur + ' · %20→%80 ~' + x.s.dk + ' dk · yürüyerek ' + x.y.dk + ' dk: ' + x.y.ad) + '</small></span><button type="button" class="yg-kl-durak" data-durak="' + kac('Şarj + yemek · ' + x.y.ad) + '" data-lat="' + x.s.lat + '" data-lng="' + x.s.lng + '" aria-pressed="false">Durak Yap</button></div>';
    }).join('') : '<p class="yg-kl-bos">Bu güzergâhta örnek şarj noktası yok.</p>') + '</div>' + html; }
    satirlar.innerHTML = html; liste.hidden = !acik.sarj && !Object.keys(grup).some(function (k) { return acik[k]; });
    $('#ygKatmanSayi').textContent = adet; seritYenile(veri); durakBoya();
  };
  /* Yol üstü şeridi (Beyar, 9 Kas): açık her katman alt şeritte sekme olur; "Mekânlar" sekmesi canlı kadranın kendisi */
  var dash = $('#ygDash'), seritAktif = 'mekan', seritVeri = {};
  if (dash) {
    dash.querySelector('.yg-dash-head').insertAdjacentHTML('afterend', '<div class="yg-dash-sekmeler" id="ygSerit" role="tablist" aria-label="Yol üstü şeridi" hidden></div>');
    $('#ygDashScroll').insertAdjacentHTML('afterend', '<div class="yg-dash-scroll yg-dash-katman" id="ygDashKatman" role="tabpanel" hidden></div>');
  }
  var ikonS = function (k) { return k === 'sarj' ? 'fa-charging-station' : ikon[k]; }, adS = function (k) { return k === 'sarj' ? 'Şarj + yemek' : baslik[k]; };
  var seritYenile = function (veri) {
    if (!dash) { return; }
    seritVeri = veri;
    var gastro = !document.body.classList.contains('gastronomi-kapali'), kl = Object.keys(veri);
    var sekme = (gastro ? [['mekan', 'fa-utensils', 'Mekânlar', ($('#ygDashCount') || {}).textContent || '']] : []).concat(kl.map(function (k) { return [k, ikonS(k), adS(k), veri[k].length]; }));
    if (!sekme.some(function (t) { return t[0] === seritAktif; })) { seritAktif = sekme.length ? sekme[0][0] : 'mekan'; }
    $('#ygSerit').innerHTML = sekme.map(function (t) { return '<button type="button" role="tab" class="yg-serit-sekme" data-serit="' + t[0] + '" aria-selected="false"><i class="fa-solid ' + t[1] + '" aria-hidden="true"></i>' + t[2] + ' <span class="yg-dash-cnt">' + t[3] + '</span></button>'; }).join('');
    $('#ygSerit').hidden = !kl.length; dash.classList.toggle('yg-dash--katmanli', kl.length > 0);
    seritSec(seritAktif);
  };
  var seritSec = function (k) {
    if (!dash) { return; }
    seritAktif = k; $$('#ygSerit [data-serit]').forEach(function (b) { b.setAttribute('aria-selected', b.dataset.serit === k ? 'true' : 'false'); });
    var m = k === 'mekan', kap = $('#ygDashKatman'); $('#ygDashScroll').hidden = !m; kap.hidden = m; dash.classList.toggle('yg-dash--katman-sekme', !m);
    var bt = $('#ygDashTitleTxt'); if (bt) { bt.textContent = m ? 'Yol üstü mekânlar' : 'Yol üstü · ' + adS(k); }
    if (m) { return; }
    kap.innerHTML = (seritVeri[k] || []).map(function (x) {
      var tam = x.d <= 1, durak = x.n.durak || x.n.ad;
      return '<article class="yg-dcard yg-dcard--katman" data-kart-lat="' + x.n.lat + '" data-kart-lng="' + x.n.lng + '"><span class="yd-media yg-katman-pin--' + k + '"><i class="fa-solid ' + ikonS(k) + '" aria-hidden="true"></i></span><span class="yd-body"><span class="yd-name">' + kac(x.n.ad) + '</span><span class="yd-loc">' + kac(x.n.alt) + '</span><span class="yd-tag ' + (tam ? 'on' : 'near') + '">' + (tam ? 'Tam yol üstü' : 'Yola yakın · ' + Math.max(1, Math.round(x.d)) + ' km') + '</span><button type="button" class="yg-kl-durak" data-durak="' + kac(durak) + '" data-lat="' + x.n.lat + '" data-lng="' + x.n.lng + '" aria-pressed="false">Durak Yap</button></span></article>';
    }).join('') || '<p class="yg-kl-bos">Bu güzergâhta örnek nokta yok.</p>';
    durakBoya();
  };
  /* Rotadaki durakla eşleşen çip ve düğme basılı görünür */
  var durakBoya = function () {
    var api = window.dgRotaApi, adlar = api ? api.duraklar().map(function (d) { return d.ad; }) : [];
    $$('[data-durak]').forEach(function (b) { var on = adlar.indexOf(b.dataset.durak) >= 0; b.setAttribute('aria-pressed', on ? 'true' : 'false'); if (b.classList.contains('yg-kl-durak')) { b.textContent = on ? 'Durakta' : 'Durak Yap'; } else if (b.lastElementChild) { b.lastElementChild.textContent = on ? 'Durakta' : 'Ara durak ekle'; } });
  };

  /* Coğrafi İşaret ve Kültür Kartı (R2.1, R2.2, akış 2 ve 4): rotanın geçtiği her il için "{İl}'in meşhurları".
     İki dikey ayrım: Ne Yenir? (masada) ve Ne Alınır? (paketli); her ürün tek tıkla ara durak olur */
  var ekAl = function (ad) {
    var sesli = (ad.toLocaleLowerCase('tr').match(/[aeıioöuü]/g) || ['e']).pop(), son = /[aeıioöuü]$/.test(ad.toLocaleLowerCase('tr'));
    var ek = { a: 'ın', 'ı': 'ın', e: 'in', i: 'in', o: 'un', u: 'un', 'ö': 'ün', 'ü': 'ün' }[sesli];
    return ad + '\u2019' + (son ? 'n' : '') + ek;
  };
  var urunSatir = function (il, u, tip) {
    var c = urunKonum(il, u, tip);
    return '<li class="yg-il-urun"><span class="yg-il-urun-ad">' + kac(u[0]) + '<small>' + kac((u[1] ? u[1] + ' · ' : '') + 'Tescil ' + u[2]) + '</small></span><button type="button" class="yg-il-cip" data-durak="' + kac(u[0] + ' · ' + il.il) + '" data-lat="' + c.lat + '" data-lng="' + c.lng + '" aria-pressed="false"><i class="fa-solid fa-plus" aria-hidden="true"></i> <span>Ara durak ekle</span></button></li>';
  };
  var bolum = function (sinif, ik, ad, il, l, tip) {
    return '<div class="yg-il-bolum ' + sinif + '"><div class="yg-il-bolum-bas"><span class="yg-il-ikon"><i class="fa-solid ' + ik + '" aria-hidden="true"></i></span><b>' + ad + '</b></div>' + (l.length ? '<ul class="yg-il-urunler">' + l.map(function (u) { return urunSatir(il, u, tip); }).join('') + '</ul>' : '<p class="yg-kl-bos">Bu ilde ' + (tip === 'yenir' ? 'yemek' : 'paketli ürün') + ' tescili yok.</p>') + '</div>';
  };
  var ilKart = function (il) {
    var k = K[il.il];
    var bas = '<header class="yg-il-kart-bas"><i class="fa-solid fa-location-dot" aria-hidden="true"></i><h4>' + kac(ekAl(il.il)) + ' meşhurları</h4>' + (k ? '<span class="yg-il-rozet"><i class="fa-solid fa-certificate" aria-hidden="true"></i> Coğrafi işaretli</span>' : '') + '</header>';
    if (!k) { return '<article class="yg-il-kart yg-il-kart--bos" data-il="' + kac(il.il) + '">' + bas + '<p class="yg-il-dip">Tescilli ürün verisi prototipte henüz yok; canlıda TÜRKPATENT sicilinden gelir.</p></article>'; }
    return '<article class="yg-il-kart" data-il="' + kac(il.il) + '">' + bas + bolum('yg-il-yenir', 'fa-bowl-food', 'Ne Yenir?', il, k.yenir || [], 'yenir') + bolum('yg-il-alinir', 'fa-basket-shopping', 'Ne Alınır?', il, k.alinir || [], 'alinir') +
      '<p class="yg-il-dip"><span class="ornek-etiket">prototip örneği</span> Adlar TÜRKPATENT coğrafi işaret sicilinden; durak konumu il ya da ilçe merkezi.</p></article>';
  };
  /* Noktalar örnek olduğu için canlı Open Charge Map atfı yerine örnek kaynağı yazılır */
  var atif = $('.yg-sarj-credit'); if (atif) { atif.textContent = 'Kaynak: prototip örneği. Canlıda Open Charge Map verisi kullanılır.'; }
  var demoBas = $('#ygDemo .yg-demo-h'); if (demoBas) { demoBas.innerHTML = '<span class="ornek-etiket">prototip örneği</span>'; }

  /* İl kartları yalnız güzergâhın geçtiği iller için, yolculuk sırasıyla */
  var ozet = $('#ygSummary'), iller = $('#ygIller'), ilAnahtar = '';
  var ilEsle = function () {
    /* Çizgi ve kart aynı kaynaktan (Beyar, 9 Kas): çizginin geçtiği iller `dgRotaIller` sırasıyla; çizginin geçmediği ile kart yok */
    var adlar = ozet.hidden || !window.dgRotaIller ? [] : window.dgRotaIller();
    var l = adlar.map(function (a) { return IL.filter(function (i) { return i.il === a; })[0]; }).filter(Boolean);
    var anahtar = l.map(function (i) { return i.il; }).join('|');
    if (anahtar !== ilAnahtar) { $('#ygIlKart').innerHTML = l.map(ilKart).join(''); ilAnahtar = anahtar; ilRozet(l); }
    iller.hidden = !l.length; durakBoya();
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
  var hepsi = function () { ilEsle(); yenile(); aktar(); koridorEtiket(); };
  window.addEventListener('dg-rota', function () { setTimeout(hepsi, 0); });
  new MutationObserver(hepsi).observe(ozet, { attributes: true, attributeFilter: ['hidden'] }); hepsi();

  new MutationObserver(function () { durakBoya(); aktar(); }).observe($('#ygStopList'), { childList: true, subtree: true });
  var plan = $('#ygPlanList'); if (plan) { new MutationObserver(aktar).observe(plan, { childList: true, subtree: true }); }
  document.addEventListener('click', function (e) {
    /* Araç türü (R3.3a): Elektrikli, Enerji ve şarj katmanını ve DC hızlı süzgecini açar; Yakıtlı kapatır */
    var ar = e.target.closest('[data-arac]');
    if (ar) {
      $$('[data-arac]').forEach(function (b) { b.setAttribute('aria-pressed', b === ar ? 'true' : 'false'); });
      var ev = ar.dataset.arac === 'elektrikli', sk = $('[data-katman="sarj"]');
      if (sk && (sk.getAttribute('aria-pressed') === 'true') !== ev) { sk.click(); }
      if (ev) { setTimeout(function () { var dc = $$('#ygSarjBody button').filter(function (b) { return /DC/.test(b.textContent); })[0]; if (dc) { dc.click(); } }, 50); }
      return;
    }
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
    if (ad === 'gastronomi') { document.body.classList.toggle('gastronomi-kapali', !on); seritYenile(seritVeri); return; }
    /* Enerji ve şarj katmanı canlı şarj panelini açar; ayrı "Şarj istasyonları / Göster" kartı kalktı (Beyar, 9 Kas) */
    if (ad === 'sarj') { var t = $('#ygSarjToggle'), sb = $('section.yg-sarj'); if (t && (t.getAttribute('aria-pressed') === 'true') !== on) { t.click(); } if (sb) { sb.hidden = !on; } acik.sarj = on; yenile(); return; }
    acik[ad] = on; if (on) { grup[ad].addTo(h); } else { h.removeLayer(grup[ad]); } yenile();
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
