/* Hesabım sekmeleri: `nav.sekmeler [data-tab]` donör davranışı; hash ile derin bağ */
(function () {
  'use strict';
  document.querySelectorAll('nav.sekmeler').forEach(function (nav) {
    var dugmeler = [].slice.call(nav.querySelectorAll('[data-tab]')); if (!dugmeler.length) { return; }
    var pane = function (b) { return document.getElementById(b.getAttribute('aria-controls')); };
    var goster = function (hedef) {
      dugmeler.forEach(function (b) {
        var on = b === hedef; b.classList.toggle('aktif', on); b.setAttribute('aria-selected', on ? 'true' : 'false');
        var p = pane(b); if (p) { p.hidden = !on; p.classList.toggle('aktif', on); p.style.display = on ? '' : 'none'; }
      });
    };
    dugmeler.forEach(function (b) { b.addEventListener('click', function () { goster(b); }); });
    var hash = location.hash.replace('#', ''); var ilk = dugmeler.filter(function (b) { return b.dataset.tab === hash; })[0] || dugmeler.filter(function (b) { return b.classList.contains('aktif'); })[0] || dugmeler[0];
    goster(ilk);
    /* Aynı sayfadaki zil ve menü bağı yalnız hash değiştirir, sayfa yenilenmez */
    window.addEventListener('hashchange', function () { var b = dugmeler.filter(function (x) { return x.dataset.tab === location.hash.replace('#', ''); })[0]; if (b) { goster(b); } });
  });
})();
