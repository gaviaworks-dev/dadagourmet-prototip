/* Mekânlar: sol filtre + liste + harita. Pinler statik kopya; liste ile harita eşlenir (FH.1, FH.6). */
(function () {
  'use strict';
  var kap = document.getElementById('mklMapKolon'); if (!kap) { return; }
  var veri = window.DG_MEKANLAR || []; var kartlar = [].slice.call(document.querySelectorAll('article.mkl-card'));
  var h = window.dgHarita.kur(kap, { center: [32.5, 39.2], zoom: 4.6 }); var isaret = {};
  h.on('load', function () {
    veri.forEach(function (m) { isaret[m.slug] = window.dgHarita.pin(h, m.lng, m.lat, null, m.name + ' · ' + m.district); });
  });
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-haritada]'); if (!b) { return; }
    e.preventDefault(); e.stopPropagation();
    var m = veri.filter(function (x) { return x.slug === b.getAttribute('data-haritada'); })[0]; if (!m) { return; }
    h.flyTo({ center: [m.lng, m.lat], zoom: 13 }); if (isaret[m.slug]) { isaret[m.slug].togglePopup(); }
    kap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, true);
  kartlar.forEach(function (k) {
    k.addEventListener('mouseenter', function () { var p = isaret[k.dataset.slug]; if (p) { p.getElement().classList.add('vurgulu'); } });
    k.addEventListener('mouseleave', function () { var p = isaret[k.dataset.slug]; if (p) { p.getElement().classList.remove('vurgulu'); } });
  });
  /* Filtre: prototipte liste süzülmez; akordeon, sayaç, Ülke → Şehir → İlçe → Semt açılımı ve mobil sayfa çalışır */
  document.querySelectorAll('.fct-head').forEach(function (b) { b.addEventListener('click', function (e) { e.preventDefault(); b.parentElement.classList.toggle('open'); }); });
  var yan = document.getElementById('lstSide'), ort = document.getElementById('sheetOverlay');
  var ac = function (on) { yan.classList.toggle('open', on); ort.classList.toggle('open', on); document.documentElement.style.overflow = on ? 'hidden' : ''; };
  document.addEventListener('click', function (e) { if (e.target.closest('#btnFilter')) { ac(true); } else if (e.target.closest('#sheetClose') || e.target === ort) { ac(false); } });
  var konum = function (ad) { return document.querySelector('[data-konum="' + ad + '"]'); };
  var secili = function (s) { return document.querySelectorAll(s + ':checked').length; };
  document.addEventListener('change', function (e) {
    if (!e.target.closest('.sheet-body')) { return; }
    var ilce = konum('ilce'), semt = konum('semt');
    if (ilce) { ilce.hidden = !document.querySelector('input[name="il[]"][value="istanbul"]:checked'); ilce.classList.toggle('open', !ilce.hidden); }
    if (semt) { semt.hidden = !secili('input[name="ilce[]"]'); semt.classList.toggle('open', !semt.hidden); }
    var toplam = 0;
    document.querySelectorAll('.sheet-body > .fct').forEach(function (g) { var n = g.querySelectorAll('input:checked').length; toplam += n; var d = g.querySelector('.fct-dot'); if (d) { d.textContent = n; d.classList.toggle('on', n > 0); } });
    var f = document.getElementById('filCount'); if (f) { f.textContent = toplam; f.hidden = !toplam; }
  });
  document.querySelectorAll('a.fil-clear').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); document.querySelectorAll('.sheet-body input:checked').forEach(function (i) { i.checked = false; }); document.querySelector('.sheet-body').dispatchEvent(new Event('change', { bubbles: true })); }); });
  document.querySelectorAll('#mklViewSeg .vs-btn').forEach(function (b) { b.addEventListener('click', function () { if (b.dataset.view === 'harita') { kap.scrollIntoView({ behavior: 'smooth', block: 'center' }); } }); });
})();
