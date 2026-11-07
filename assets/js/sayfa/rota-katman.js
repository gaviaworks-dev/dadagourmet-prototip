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
        return '<div class="yg-kl-satir"><span class="yg-il-ikon"><i class="fa-solid ' + ikon[k] + '" aria-hidden="true"></i></span><span class="yg-kl-metin"><b>' + kac(x.n.ad) + '</b><small>' + kac(x.n.alt) + ' · yoldan ' + Math.max(1, Math.round(x.d)) + ' km</small></span></div>';
      }).join('') : '<p class="yg-kl-bos">Bu güzergâhta örnek nokta yok.</p>') + '</div>';
    });
    satirlar.innerHTML = html; liste.hidden = !Object.keys(grup).some(function (k) { return acik[k]; });
    $('#ygKatmanSayi').textContent = adet;
  };

  var bolum = function (sinif, ik, ad, l) {
    return '<div class="yg-il-bolum ' + sinif + '"><div class="yg-il-bolum-bas"><span class="yg-il-ikon"><i class="fa-solid ' + ik + '" aria-hidden="true"></i></span><b>' + ad + '</b></div><div class="yg-il-cipler">' + l.map(function (x) { return '<span class="yg-il-cip">' + kac(x) + '</span>'; }).join('') + '</div></div>';
  };
  $('#ygIlKart').innerHTML = R.iller.map(function (i) {
    return '<article class="yg-il-kart" data-il="' + kac(i.il) + '"><header class="yg-il-kart-bas"><i class="fa-solid fa-location-dot" aria-hidden="true"></i><h4>' + kac(i.il) + '</h4></header>' + bolum('yg-il-yenir', 'fa-bowl-food', 'Ne Yenir?', i.neYenir) + bolum('yg-il-alinir', 'fa-basket-shopping', 'Ne Alınır?', i.neAlinir) + '</article>';
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
  var hepsi = function () { ilEsle(); yenile(); };
  window.addEventListener('dg-rota', function () { setTimeout(hepsi, 0); });
  new MutationObserver(hepsi).observe(ozet, { attributes: true, attributeFilter: ['hidden'] }); hepsi();

  document.addEventListener('click', function (e) {
    var k = e.target.closest('.yg-katman-dugme'); if (!k) { return; }
    var on = k.getAttribute('aria-pressed') !== 'true', ad = k.dataset.katman; k.setAttribute('aria-pressed', on ? 'true' : 'false');
    if (ad === 'gastronomi') { document.body.classList.toggle('gastronomi-kapali', !on); return; }
    if (ad === 'sarj') { var t = $('#ygSarjToggle'); if (t && (t.getAttribute('aria-pressed') === 'true') !== on) { t.click(); } return; }
    acik[ad] = on; if (on) { grup[ad].addTo(h); } else { h.removeLayer(grup[ad]); } yenile();
  });
  /* İnceleme kolaylığı: açılışta örnek güzergâh yüklenir. `?bos=1` canlının boş hâli */
  if (!/[?&]bos=1/.test(location.search)) { setTimeout(function () { var p = $('#ygPilots button, #ygPilots a'); if (p) { p.click(); } }, 300); }
})();
