/* Canlı Dada Route üstüne eklenen katmanlar ve il kartları. Canlı betiğe dokunmaz. Rota Faz 4'e kadar Leaflet'tedir (K7). */
(function () {
  'use strict';
  var R = window.DG_ROTA, L = window.L, h = window.dgRotaHarita; if (!R || !h) { return; }
  var $ = function (s) { return document.querySelector(s); };
  var kac = function (t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;'); };
  var ikon = { ibadet: 'fa-mosque', dinlenme: 'fa-bed', neyenir: 'fa-bowl-food', nealinir: 'fa-basket-shopping' };
  var grup = { ibadet: L.layerGroup(), dinlenme: L.layerGroup(), neyenir: L.layerGroup(), nealinir: L.layerGroup() };
  var pin = function (k, lat, lng, baslik) {
    var i = L.divIcon({ className: 'yg-katman-pin yg-katman-pin--' + k, html: '<i class="fa-solid ' + ikon[k] + '" aria-hidden="true"></i>', iconSize: [30, 30], iconAnchor: [15, 15] });
    return L.marker([lat, lng], { icon: i, title: baslik }).bindPopup(kac(baslik));
  };
  R.katman.ibadet.forEach(function (n) { grup.ibadet.addLayer(pin('ibadet', n[1], n[0], n[2] + ' (prototip örneği)')); });
  R.katman.dinlenme.forEach(function (n) { grup.dinlenme.addLayer(pin('dinlenme', n[1], n[0], n[2] + ' (prototip örneği)')); });
  R.iller.forEach(function (i) {
    grup.neyenir.addLayer(pin('neyenir', i.lat + 0.06, i.lng - 0.1, i.il + ' · Ne Yenir: ' + i.neYenir.join(', ')));
    grup.nealinir.addLayer(pin('nealinir', i.lat - 0.06, i.lng + 0.1, i.il + ' · Ne Alınır: ' + i.neAlinir.join(', ')));
  });
  var bolum = function (sinif, ik, ad, liste) {
    return '<div class="yg-il-bolum ' + sinif + '"><div class="yg-il-bolum-bas"><span class="yg-il-ikon"><i class="fa-solid ' + ik + '" aria-hidden="true"></i></span><b>' + ad + '</b></div><div class="yg-il-cipler">' + liste.map(function (x) { return '<span class="yg-il-cip">' + kac(x) + '</span>'; }).join('') + '</div></div>';
  };
  $('#ygIlKart').innerHTML = R.iller.map(function (i) {
    return '<article class="yg-il-kart" data-il="' + kac(i.il) + '"><header class="yg-il-kart-bas"><i class="fa-solid fa-location-dot" aria-hidden="true"></i><h4>' + kac(i.il) + '</h4></header>' + bolum('yg-il-yenir', 'fa-bowl-food', 'Ne Yenir?', i.neYenir) + bolum('yg-il-alinir', 'fa-basket-shopping', 'Ne Alınır?', i.neAlinir) + '</article>';
  }).join('');
  var demoBas = $('#ygDemo .yg-demo-h'); if (demoBas) { demoBas.innerHTML = '<span class="ornek-etiket">prototip örneği</span>'; }
  /* İl kartları yalnız örnek güzergâh çizilince görünür */
  var ozet = $('#ygSummary'), iller = $('#ygIller');
  var esle = function () { iller.hidden = ozet.hidden || !/İzmir|Bursa|Balıkesir|Manisa/.test(($('#ygStopList') || {}).textContent + [].map.call(document.querySelectorAll('#ygStopList input'), function (i) { return i.value; }).join(' ')); };
  new MutationObserver(esle).observe(ozet, { attributes: true, attributeFilter: ['hidden'] }); esle();
  document.addEventListener('click', function (e) {
    var k = e.target.closest('.yg-katman-dugme'); if (!k) { return; }
    var on = k.getAttribute('aria-pressed') !== 'true', ad = k.dataset.katman; k.setAttribute('aria-pressed', on ? 'true' : 'false');
    if (ad === 'gastronomi') { $('#routeMap').classList.toggle('gastronomi-kapali', !on); return; }
    if (ad === 'sarj') { var t = $('#ygSarjToggle'); if (t && (t.getAttribute('aria-pressed') === 'true') !== on) { t.click(); } return; }
    if (on) { grup[ad].addTo(h); } else { h.removeLayer(grup[ad]); }
  });
  /* İnceleme kolaylığı: açılışta örnek güzergâh yüklenir. `?bos=1` canlının boş hâli */
  if (!/[?&]bos=1/.test(location.search)) { setTimeout(function () { var p = $('#ygPilots button, #ygPilots a'); if (p) { p.click(); } }, 300); }
})();
