/* Dada Route prototipi. Canlı `dada-route.js` sunucu uçlarına bağlı; burada aynı DOM statik veriyle çalışır. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var R = window.DG_ROTA, M = window.DG_MEKANLAR || [];
  var h = window.dgHarita.kur($('routeMap'), { center: [28.4, 39.7], zoom: 6 });
  var renk = { gastronomi: '#742982', sarj: '#0a7d5a', ibadet: '#2f6fb0', dinlenme: '#8a6410', neyenir: '#c2410c', nealinir: '#b8860b' };
  var pinler = { gastronomi: [], sarj: [], ibadet: [], dinlenme: [], neyenir: [], nealinir: [] };
  /* Rotaya yakın gerçek mekân kayıtları: çizgi köşelerine 18 km içinde */
  var km = function (a, b, c, d) { var x = (c - a) * Math.cos((b + d) * Math.PI / 360) * 111.3, y = (d - b) * 111.3; return Math.sqrt(x * x + y * y); };
  var yakin = M.filter(function (m) { return R.cizgi.some(function (c) { return km(c[0], c[1], m.lng, m.lat) < 18; }); });
  function katmanYaz(k, acik) { pinler[k].forEach(function (p) { p.getElement().style.display = acik ? '' : 'none'; }); }
  function rotaCiz() {
    if (h.getSource('rota')) { return; }
    h.addSource('rota', { type: 'geojson', data: { type: 'Feature', geometry: { type: 'LineString', coordinates: R.cizgi } } });
    h.addLayer({ id: 'rota-zemin', type: 'line', source: 'rota', paint: { 'line-color': '#fff', 'line-width': 7 }, layout: { 'line-cap': 'round', 'line-join': 'round' } });
    h.addLayer({ id: 'rota-cizgi', type: 'line', source: 'rota', paint: { 'line-color': '#742982', 'line-width': 4 }, layout: { 'line-cap': 'round', 'line-join': 'round' } });
    yakin.forEach(function (m) { pinler.gastronomi.push(window.dgHarita.pin(h, m.lng, m.lat, renk.gastronomi, m.name + ' · ' + m.district)); });
    ['sarj', 'ibadet', 'dinlenme'].forEach(function (k) { R.katman[k].forEach(function (n) { pinler[k].push(window.dgHarita.pin(h, n[0], n[1], renk[k], n[2] + ' (prototip örneği)', 'kare')); }); });
    R.iller.forEach(function (i) {
      pinler.neyenir.push(window.dgHarita.pin(h, i.lng - 0.08, i.lat + 0.05, renk.neyenir, i.il + ' · Ne Yenir: ' + i.neYenir.join(', '), 'kare'));
      pinler.nealinir.push(window.dgHarita.pin(h, i.lng + 0.08, i.lat - 0.05, renk.nealinir, i.il + ' · Ne Alınır: ' + i.neAlinir.join(', '), 'kare'));
    });
    document.querySelectorAll('.yg-katman-dugme').forEach(function (b) { katmanYaz(b.dataset.katman, b.getAttribute('aria-pressed') === 'true'); });
    var s = new maplibregl.LngLatBounds(); R.cizgi.forEach(function (c) { s.extend(c); }); h.fitBounds(s, { padding: { top: 110, bottom: 70, left: 60, right: 60 }, duration: 0 });
  }
  function ozet() {
    var girdi = document.querySelectorAll('#ygStopList input[type="text"]');
    if (girdi[0]) { girdi[0].value = R.kalkis; } if (girdi[1]) { girdi[1].value = R.varis; }
    $('ygKm').textContent = R.km; $('ygSumGrid').innerHTML = '<div class="yg-sum-row"><span class="yg-sum-k"><i class="fa-solid fa-clock"></i> Tahmini süre</span><span class="yg-sum-v">' + R.sure + '</span></div><div class="yg-sum-row"><span class="yg-sum-k"><i class="fa-solid fa-utensils"></i> Yol üstü mekân</span><span class="yg-sum-v">' + yakin.length + '</span></div>';
    $('ygNote').innerHTML = '<span class="ornek-etiket">prototip örneği</span> Süre ve mesafe yaklaşık değerdir.';
    $('ygSummary').hidden = false; if ($('ygStart')) { $('ygStart').hidden = true; }
    var ad = encodeURIComponent; var a = R.kalkis, b = R.varis;
    $('ygGoogle').href = 'https://www.google.com/maps/dir/?api=1&origin=' + ad(a) + '&destination=' + ad(b);
    $('ygApple').href = 'https://maps.apple.com/?saddr=' + ad(a) + '&daddr=' + ad(b);
    $('ygYandex').href = 'https://yandex.com/maps/?rtext=' + ad(a) + '~' + ad(b) + '&rtt=auto';
    $('ygAktarim').hidden = false;
    $('ygIlKart').innerHTML = R.iller.map(function (i) { return '<article class="yg-il-kart"><b>' + i.il + '</b><p><span>Ne Yenir?</span> ' + i.neYenir.join(', ') + '</p><p><span>Ne Alınır?</span> ' + i.neAlinir.join(', ') + '</p></article>'; }).join('');
  }
  h.on('load', function () { if (!/[?&]bos=1/.test(location.search)) { rotaCiz(); ozet(); } });
  h.on('styledata', function () { if (h.isStyleLoaded() && !h.getSource('rota') && pinler.gastronomi.length) { pinler.gastronomi.length = 0; } });
  document.addEventListener('click', function (e) {
    var k = e.target.closest('.yg-katman-dugme');
    if (k) { var on = k.getAttribute('aria-pressed') !== 'true'; k.setAttribute('aria-pressed', on ? 'true' : 'false'); katmanYaz(k.dataset.katman, on); return; }
    var pilot = e.target.closest('#ygPilots button, #ygPilots a');
    if (pilot) { e.preventDefault(); rotaCiz(); ozet(); return; }
    var sekme = e.target.closest('.yg-tab');
    if (sekme) {
      document.querySelectorAll('.yg-tab').forEach(function (t) { t.classList.toggle('is-active', t === sekme); });
      var hedef = sekme.id === 'tabSaved' ? 'viewSaved' : 'viewRoute';
      document.querySelectorAll('.yg-view').forEach(function (v) { var on = v.id === hedef; v.classList.toggle('is-active', on); v.hidden = !on; });
    }
    var st = e.target.closest('#ygSarjToggle');
    if (st) { var ac = st.getAttribute('aria-pressed') !== 'true'; st.setAttribute('aria-pressed', ac ? 'true' : 'false'); $('ygSarjBody').hidden = !ac; $('ygSarjToggleText').textContent = ac ? 'Gizle' : 'Göster'; $('ygSarjStatus').textContent = R.katman.sarj.length + ' örnek durak (prototip örneği)'; }
  });
})();
