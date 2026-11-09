/* Yüzen Mentör düğmesi. Donör: dadagastro.com /kabuk/mentor.js (release 20261107-mentor); kapatma davranışı Diet prototipi
   (`dadadiet-prototip/assets/js/mentor.js`): dış tıklama ve odak panelden çıkınca küçülür. Markup `_src/parcalar/mentor.html`.
   Panel sohbet değildir: Mentör'ün ne yaptığını anlatır, misafiri kayda, üyeyi Paketlerim'e götürür. Durum tutulmaz, her sayfa kapalı başlar.
   Alt yüzeyler (çerez bandı, alt çubuk, eylem çubukları) düğmeyle aynı sütundaysa ekranın dibinden kapladıkları yükseklik
   `--mentor-engel` olur; düğme onların üstüne oturur. */
(function () {
  'use strict';
  var kok = document.getElementById('dadaMentor');
  if (!kok) return;
  var ac = kok.querySelector('.mp-mini-overlay');
  var kucult = kok.querySelector('.mp-toggle');
  var ust = kok.querySelector('.mp-top');
  var govde = kok.querySelector('.mp-chat');
  var video = kok.querySelector('video');
  var cagri = kok.querySelector('.mp-opt');
  var ana = document.getElementById('pageMain');
  var hareketsiz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var acik = false;
  var ENGEL = '#cookieBanner,.bottom-nav,.rd-actbar,.vd-actbar,.evd-actbar,.actbar,[data-rk-bicim=altbar],[data-bc-bar]';

  /* Demo oturum `prototip.js`in bastığı `dada-kimlik` meta'sından okunur (canlıda sunucu basar) */
  try {
    var kimlik = JSON.parse((document.querySelector('meta[name="dada-kimlik"]') || {}).content || '{}');
    if (kimlik.auth && cagri.dataset.uyeHref) { cagri.href = cagri.dataset.uyeHref; cagri.textContent = cagri.dataset.uyeMetin; }
  } catch (e) { /* misafir çağrısı kalır */ }

  function gorunur(o) {
    if (o.hidden) return false;
    if (o.checkVisibility) return o.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true });
    return o.getClientRects().length > 0;
  }

  function olc() {
    var sol = kok.offsetLeft;
    var sag = sol + (acik ? Math.min(360, innerWidth - 32) : (innerWidth > 640 ? 148 : 56));
    var engel = 0;
    document.querySelectorAll(ENGEL).forEach(function (o) {
      if (!gorunur(o) || getComputedStyle(o).position !== 'fixed') return;
      var r = o.getBoundingClientRect();
      if (r.height > 0 && r.top < innerHeight && r.bottom > innerHeight / 2 && r.left < sag && r.right > sol) engel = Math.max(engel, Math.round(innerHeight - r.top));
    });
    kok.style.setProperty('--mentor-engel', engel + 'px');
    /* Altbilgi perdesi: içeriğin alt kenarı düğmenin dibine gelince kenara çekilir. Açık panel kullanıcının elinde, çekilmez */
    var en = document.documentElement.scrollHeight - innerHeight;
    kok.classList.toggle('foot-hide', !acik && en > 320 && !!ana && ana.getBoundingClientRect().bottom < innerHeight - 8);
  }

  var bekleyen = false;
  function olcSonra() {
    if (bekleyen) return;
    bekleyen = true;
    requestAnimationFrame(function () { bekleyen = false; olc(); });
  }

  /* Geçiş ortasında okunan değer ara değerdir ve iptal olan geçiş `transitionend` vermez: engel oynadıktan sonra son bir ölçüm */
  var dingin = null;
  function olcDingin() {
    olcSonra();
    clearTimeout(dingin);
    dingin = setTimeout(olc, 500);
  }

  function durum(yeni, odakDon) {
    acik = yeni;
    kok.classList.toggle('mini', !acik);
    kok.setAttribute('data-state', acik ? 'full' : 'mini');
    ac.setAttribute('aria-expanded', acik ? 'true' : 'false');
    ac.inert = acik;
    ust.inert = !acik;
    govde.inert = !acik;
    if (acik) {
      if (!video.getAttribute('src')) video.setAttribute('src', video.getAttribute('data-mentor-video'));
      if (!hareketsiz) { var oynat = video.play(); if (oynat) oynat.catch(function () {}); }
      kucult.focus({ preventScroll: true });
    } else {
      video.pause();
      if (odakDon) ac.focus({ preventScroll: true });
    }
    olcSonra();
  }

  ac.addEventListener('click', function () { durum(true); });
  kucult.addEventListener('click', function () { durum(false, true); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && acik) durum(false, true); });
  document.addEventListener('click', function (e) { if (acik && !kok.contains(e.target)) durum(false); });
  kok.addEventListener('focusout', function (e) { if (acik && e.relatedTarget && !kok.contains(e.relatedTarget)) durum(false); });

  window.addEventListener('scroll', olcSonra, { passive: true });
  window.addEventListener('resize', olcSonra, { passive: true });
  window.addEventListener('load', olcSonra);
  ['transitionend', 'transitioncancel', 'animationend'].forEach(function (olay) {
    document.addEventListener(olay, function (e) { if (e.target.matches && e.target.matches(ENGEL)) olcDingin(); }, true);
  });
  new MutationObserver(function (kayitlar) {
    for (var i = 0; i < kayitlar.length; i++) {
      if (kayitlar[i].target.matches && kayitlar[i].target.matches(ENGEL)) { olcDingin(); return; }
    }
  }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class', 'hidden', 'style'] });
  new MutationObserver(olcDingin).observe(document.body, { childList: true });
  olc();
})();
