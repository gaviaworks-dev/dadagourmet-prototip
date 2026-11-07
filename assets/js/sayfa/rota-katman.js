/* Canlı Dada Route üstüne eklenen katmanlar ve il kartları. Rota Faz 4'e kadar Leaflet'tedir (K7).
   Katman noktaları güzergâha göre süzülür: yalnız çizili rotaya KORIDOR_KM içindekiler pin ve liste olur. */
(function () {
  'use strict';
  var R = window.DG_ROTA, L = window.L, h = window.dgRotaHarita; if (!R || !h) { return; }
  var $ = function (s) { return document.querySelector(s); }, $$ = function (s) { return [].slice.call(document.querySelectorAll(s)); };
  var kac = function (t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); };
  var KORIDOR_KM = 15, IL_KM = 30;
  var ikon = { ibadet: 'fa-mosque', dinlenme: 'fa-bed', neyenir: 'fa-bowl-food', nealinir: 'fa-basket-shopping' };
  var baslik = { ibadet: 'İbadethane', dinlenme: 'Dinlenme alanı', neyenir: 'Ne Yenir?', nealinir: 'Ne Alınır?' };
  var grup = { ibadet: L.layerGroup(), dinlenme: L.layerGroup(), neyenir: L.layerGroup(), nealinir: L.layerGroup() };
  var acik = {};

  /* Nokta havuzu: katman başına tek biçim */
  var noktalar = {
    ibadet: R.katman.ibadet.map(function (n) { return { ad: n[2], lat: n[1], lng: n[0], alt: n[3] }; }),
    dinlenme: R.katman.dinlenme.map(function (n) { return { ad: n[2], lat: n[1], lng: n[0], alt: n[3] + ' · Kaynak: örnek · Doğrulama: örnek tarih' }; }),
    neyenir: [], nealinir: []
  };
  R.iller.forEach(function (i) {
    i.neYenir.forEach(function (x) { noktalar.neyenir.push({ ad: x + ' · ' + i.il, lat: i.lat + 0.06, lng: i.lng - 0.1, alt: 'İmza lezzet', il: i.il }); });
    i.neAlinir.forEach(function (x) { noktalar.nealinir.push({ ad: x + ' · ' + i.il, lat: i.lat - 0.06, lng: i.lng + 0.1, alt: 'Paketli yerel ürün', il: i.il }); });
  });
  var uzak = function (n) { return window.dgRotaUzak ? window.dgRotaUzak(n.lat, n.lng) : 1e9; };
  var pin = function (k, n) {
    var i = L.divIcon({ className: 'yg-katman-pin yg-katman-pin--' + k, html: '<i class="fa-solid ' + ikon[k] + '" aria-hidden="true"></i>', iconSize: [30, 30], iconAnchor: [15, 15] });
    return L.marker([n.lat, n.lng], { icon: i, title: n.ad }).bindPopup(kac(n.ad + ' (prototip örneği)'));
  };

  /* Katman süzgeci: pin ve liste aynı kaynaktan */
  var liste = $('#ygKatmanListe'), satirlar = $('#ygKatmanSatir');
  var yenile = function () {
    var html = '', adet = 0;
    Object.keys(grup).forEach(function (k) {
      grup[k].clearLayers();
      if (!acik[k]) { return; }
      var yakin = noktalar[k].map(function (n) { return { n: n, d: uzak(n) }; }).filter(function (x) { return x.d <= KORIDOR_KM; }).sort(function (a, b) { return a.d - b.d; });
      yakin.forEach(function (x) { grup[k].addLayer(pin(k, x.n)); });
      adet += yakin.length;
      html += '<div class="yg-kl-grup"><b>' + baslik[k] + ' <span>' + yakin.length + '</span></b>' + (yakin.length ? yakin.map(function (x) {
        return '<div class="yg-kl-satir"><span class="yg-il-ikon"><i class="fa-solid ' + ikon[k] + '" aria-hidden="true"></i></span><span class="yg-kl-metin"><b>' + kac(x.n.ad) + '</b><small>' + kac(x.n.alt) + ' · yoldan ' + Math.max(1, Math.round(x.d)) + ' km</small></span><button type="button" class="yg-kl-durak" data-durak="' + kac(x.n.ad) + '" data-lat="' + x.n.lat + '" data-lng="' + x.n.lng + '" aria-pressed="false">Durak Yap</button></div>';
      }).join('') : '<p class="yg-kl-bos">Bu güzergâhta örnek nokta yok.</p>') + '</div>';
    });
    satirlar.innerHTML = html; liste.hidden = !Object.keys(grup).some(function (k) { return acik[k]; });
    $('#ygKatmanSayi').textContent = adet; durakBoya();
  };
  /* Rotadaki durakla eşleşen çip ve düğme basılı görünür */
  var durakBoya = function () {
    var api = window.dgRotaApi, adlar = api ? api.duraklar().map(function (d) { return d.ad; }) : [];
    $$('[data-durak]').forEach(function (b) { var on = adlar.indexOf(b.dataset.durak) >= 0; b.setAttribute('aria-pressed', on ? 'true' : 'false'); if (b.classList.contains('yg-kl-durak')) { b.textContent = on ? 'Durakta' : 'Durak Yap'; } });
  };

  var bolum = function (sinif, ik, ad, l, il, dLat, dLng) {
    return '<div class="yg-il-bolum ' + sinif + '"><div class="yg-il-bolum-bas"><span class="yg-il-ikon"><i class="fa-solid ' + ik + '" aria-hidden="true"></i></span><b>' + ad + '</b></div><div class="yg-il-cipler">' + l.map(function (x) { return '<button type="button" class="yg-il-cip" data-durak="' + kac(x + ' · ' + il.il) + '" data-lat="' + (il.lat + dLat) + '" data-lng="' + (il.lng + dLng) + '" aria-pressed="false" title="Ara durak olarak ekle"><i class="fa-solid fa-plus" aria-hidden="true"></i> ' + kac(x) + '</button>'; }).join('') + '</div></div>';
  };
  $('#ygIlKart').innerHTML = R.iller.map(function (i) {
    return '<article class="yg-il-kart" data-il="' + kac(i.il) + '"><header class="yg-il-kart-bas"><i class="fa-solid fa-location-dot" aria-hidden="true"></i><h4>' + kac(i.il) + '</h4></header>' + bolum('yg-il-yenir', 'fa-bowl-food', 'Ne Yenir?', i.neYenir, i, 0.06, -0.1) + bolum('yg-il-alinir', 'fa-basket-shopping', 'Ne Alınır?', i.neAlinir, i, -0.06, 0.1) + '</article>';
  }).join('');
  /* Noktalar örnek olduğu için canlı Open Charge Map atfı yerine örnek kaynağı yazılır */
  var atif = $('.yg-sarj-credit'); if (atif) { atif.textContent = 'Kaynak: prototip örneği. Canlıda Open Charge Map verisi kullanılır.'; }
  var demoBas = $('#ygDemo .yg-demo-h'); if (demoBas) { demoBas.innerHTML = '<span class="ornek-etiket">prototip örneği</span>'; }

  /* İl kartları yalnız güzergâhın geçtiği iller için görünür */
  var ozet = $('#ygSummary'), iller = $('#ygIller');
  var ilEsle = function () {
    var gor = 0;
    R.iller.forEach(function (i) { var k = $('.yg-il-kart[data-il="' + i.il + '"]'), on = !ozet.hidden && uzak(i) <= IL_KM; k.hidden = !on; if (on) { gor++; } });
    iller.hidden = !gor;
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
  };
  var hepsi = function () { ilEsle(); yenile(); aktar(); };
  window.addEventListener('dg-rota', function () { setTimeout(hepsi, 0); });
  new MutationObserver(hepsi).observe(ozet, { attributes: true, attributeFilter: ['hidden'] }); hepsi();

  new MutationObserver(function () { durakBoya(); aktar(); }).observe($('#ygStopList'), { childList: true, subtree: true });
  var plan = $('#ygPlanList'); if (plan) { new MutationObserver(aktar).observe(plan, { childList: true, subtree: true }); }
  document.addEventListener('click', function (e) {
    var d = e.target.closest('[data-durak]');
    if (d && window.dgRotaApi) { if (d.getAttribute('aria-pressed') !== 'true') { window.dgRotaApi.durakYap({ ad: d.dataset.durak, lat: +d.dataset.lat, lng: +d.dataset.lng }); } durakBoya(); return; }
    var k = e.target.closest('.yg-katman-dugme'); if (!k) { return; }
    var on = k.getAttribute('aria-pressed') !== 'true', ad = k.dataset.katman; k.setAttribute('aria-pressed', on ? 'true' : 'false');
    if (ad === 'gastronomi') { document.body.classList.toggle('gastronomi-kapali', !on); return; }
    if (ad === 'sarj') { var t = $('#ygSarjToggle'); if (t && (t.getAttribute('aria-pressed') === 'true') !== on) { t.click(); } return; }
    acik[ad] = on; if (on) { grup[ad].addTo(h); } else { h.removeLayer(grup[ad]); } yenile();
  });
  /* İnceleme kolaylığı: açılışta örnek güzergâh yüklenir. `?bos=1` canlının boş hâli */
  if (!/[?&]bos=1/.test(location.search)) { setTimeout(function () { var p = $('#ygPilots button, #ygPilots a'); if (p) { p.click(); } }, 300); }
})();
