/* Prototip çalışma katmanı: hiçbir yere veri gönderilmez, canlı uç çağrılmaz. */
(function () {
  'use strict';
  var yerel = function (u) { try { return new URL(u, location.href).origin === location.origin; } catch (e) { return false; } };
  var yanit = function () { return new Response('{"ok":true,"prototip":true}', { status: 200, headers: { 'Content-Type': 'application/json' } }); };
  var ozFetch = window.fetch.bind(window);
  window.fetch = function (girdi, ayar) {
    var yontem = ((ayar && ayar.method) || (girdi && girdi.method) || 'GET').toUpperCase();
    var adres = typeof girdi === 'string' ? girdi : (girdi && girdi.url) || '';
    if (yontem !== 'GET') { return Promise.resolve(yanit()); }
    if (yerel(adres) && !/\/assets\//.test(adres)) { return Promise.resolve(yanit()); }
    return ozFetch(girdi, ayar);
  };
  var bildir = function (metin) {
    var t = document.getElementById('keToast'), m = document.getElementById('keToastMsg');
    if (!t || !m) { return; }
    m.textContent = metin; t.classList.add('show', 'on');
    clearTimeout(bildir.z); bildir.z = setTimeout(function () { t.classList.remove('show', 'on'); }, 2800);
  };
  /* Altbilgi perdesi: portal betiği yüklenmeyen üye zincirinde de ana içeriğin alt boşluğu altbilgi boyuna eşitlenir,
     yoksa sabit altbilgi ana içeriğin altında kalır ve hiç açılmaz (ölçüldü: 7 üye sayfası, margin-bottom 0). */
  var perdeAyarla = function () {
    var f = document.querySelector('.footer.orange'), m = document.getElementById('pageMain'); if (!f || !m) { return; }
    var sigmaz = window.matchMedia('(min-width:641px)').matches && f.offsetHeight > window.innerHeight;
    document.documentElement.classList.toggle('altbilgi-akista', sigmaz);
    m.style.marginBottom = !sigmaz && getComputedStyle(f).position === 'fixed' ? f.offsetHeight + 'px' : '';
  };
  window.addEventListener('load', perdeAyarla); window.addEventListener('resize', perdeAyarla); document.addEventListener('DOMContentLoaded', perdeAyarla);
  window.prototipBildir = bildir;
  document.addEventListener('submit', function (e) {
    e.preventDefault();
    bildir('Prototip: form gönderilmedi.');
  }, true);
  document.addEventListener('click', function (e) {
    var yakinda = e.target.closest && e.target.closest('[data-yakinda]');
    if (yakinda) { e.preventDefault(); bildir('Bu ekran sonraki turda: /' + yakinda.getAttribute('data-yakinda')); return; }
    var konum = e.target.closest && e.target.closest('[data-location-trigger]');
    if (konum) { e.preventDefault(); bildir('Konum seçimi sonraki turda.'); return; }
    var oner = e.target.closest && e.target.closest('[data-mo-open],#mekanOnerBtn');
    var mo = document.getElementById('moModal'), moO = document.getElementById('moOverlay');
    if (oner && mo) { e.preventDefault(); mo.classList.add('show', 'open'); moO.classList.add('show', 'open'); return; }
    if (mo && (e.target === moO || (e.target.closest && e.target.closest('#moModal .fb-close')))) { mo.classList.remove('show', 'open'); moO.classList.remove('show', 'open'); return; }
    var git = e.target.closest && e.target.closest('[data-git]');
    if (git) { location.href = git.getAttribute('data-git'); }
  }, true);
})();
