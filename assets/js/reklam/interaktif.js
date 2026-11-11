/* İnteraktif reklam kabuğu (reklam-cekirdek, 11 Kas). Kaynak: DadaGourmet-panel public/reklam/interaktif.js + reklam.js
   `[data-rk-kapatilabilir]` sürücüsü (Gastro pişirme şeridi + açılır pano). Uyarlama: prototipte sayım isteği yok (sendBeacon / POST
   kaldırıldı); kapatma bu oturumda hatırlanır (canlıda oturum kaydı `reklam.kapali.<kod>`), yeniden açılışta şerit basılmaz.
   Çekirdek her interaktif birimi yerleştirdikten sonra `dgReklamInteraktif(kap)` çağırır. Kancalar öznitelik: data-rk-ac, data-rk-panel,
   data-rk-kapat. Klavye: açma düğmesi gerçek <button>, aria-expanded ve aria-controls taşır; Escape açık panoyu kapatır. */
(function () {
  'use strict';
  var anahtar = function (kod) { return 'dg-rk-int-kapali-' + kod; };
  window.dgReklamInteraktif = function (kap) {
    var blok = kap.matches('[data-rk-interaktif]') ? kap : kap.querySelector('[data-rk-interaktif]');
    if (!blok) { return; }
    var serit = blok.querySelector('[data-rk-slot]'), ac = blok.querySelector('[data-rk-ac]'), panel = blok.querySelector('[data-rk-panel]');
    if (!serit || !ac || !panel) { return; }
    var kod = serit.getAttribute('data-rk-slot');
    try { if (sessionStorage.getItem(anahtar(kod))) { kap.hidden = true; kap.setAttribute('data-rk-kapatildi', ''); return; } } catch (e) { /* depo kapalı */ }
    var degis = function (acilsin) {
      panel.hidden = !acilsin;
      ac.setAttribute('aria-expanded', acilsin ? 'true' : 'false');
      blok.classList.toggle('rk-int-acik', acilsin);
      if (window.dgReklam && window.dgReklam.yogunluk) { window.dgReklam.yogunluk(); }
    };
    ac.addEventListener('click', function () { degis(panel.hidden); });
    blok.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) { degis(false); ac.focus(); } });
    var kapat = serit.querySelector('[data-rk-kapat]');
    if (kapat) {
      kapat.addEventListener('click', function () {
        try { sessionStorage.setItem(anahtar(kod), '1'); } catch (e) { /* depo kapalı */ }
        degis(false);
        kap.hidden = true;
        if (window.dgReklam && window.dgReklam.yogunluk) { window.dgReklam.yogunluk(); }
      });
    }
  };
})();
