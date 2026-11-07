/* Yüzen Mentör düğmesi — donör: anasayfa-portal-v3a.html (aç/küçült, altbilgide çekilme). Durum tutulmaz: her sayfa kapalı başlar.
   Alt yüzeyler (çerez bandı, reklam alt barı, eylem çubukları, alt navigasyon, tur paneli) düğmeyle aynı sütundaysa
   ekranın dibinden kapladıkları yükseklik `--mentor-engel` olur; düğme onların üstüne oturur. */
(function () {
  var kok = document.getElementById('dadaMentor');
  if (!kok) return;
  var ac = kok.querySelector('.mp-mini-overlay');
  var kucult = kok.querySelector('.mp-toggle');
  var ust = kok.querySelector('.mp-top');
  var govde = kok.querySelector('.mp-chat');
  var video = kok.querySelector('video');
  var hareketsiz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var acik = false;
  var ENGEL = '#cookieBanner,[data-rk-bicim=altbar],.rd-actbar,.actbar,.bottom-nav,.tercih-tur-panel';

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
      if (r.height > 0 && r.top < innerHeight && r.left < sag && r.right > sol) engel = Math.max(engel, Math.round(innerHeight - r.top));
    });
    kok.style.setProperty('--mentor-engel', engel + 'px');
    var en = document.documentElement.scrollHeight - innerHeight;
    var y = window.scrollY || document.documentElement.scrollTop;
    kok.classList.toggle('foot-hide', en > 320 && en - y < 260);
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

  function durum(yeni) {
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
      ac.focus({ preventScroll: true });
    }
    olcSonra();
  }

  ac.addEventListener('click', function () { durum(true); });
  kucult.addEventListener('click', function () { durum(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && acik) durum(false); });

  window.addEventListener('scroll', olcSonra, { passive: true });
  window.addEventListener('resize', olcSonra, { passive: true });
  window.addEventListener('load', olcSonra);
  ['transitionend', 'transitioncancel', 'animationend'].forEach(function (olay) {
    document.addEventListener(olay, function (e) { if (e.target.matches && e.target.matches(ENGEL)) olcDingin(); }, true);
  });
  new MutationObserver(function (kayitlar) {
    for (var i = 0; i < kayitlar.length; i++) {
      if (kayitlar[i].target.matches(ENGEL)) { olcDingin(); return; }
    }
  }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class', 'hidden', 'style'] });
  new MutationObserver(olcDingin).observe(document.body, { childList: true });
  olc();
})();
