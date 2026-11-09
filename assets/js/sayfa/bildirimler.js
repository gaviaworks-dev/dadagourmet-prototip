/* Bildirimler: okundu bilgisi yalnız bu tarayıcıda (window.dgKayit 'bildirim-okundu').
   Satıra basmak o bildirimi okundu sayar ve konusuna gider; "Tümünü Okundu İşaretle" hepsini işaretler.
   Okunmamış kalmayınca rozet ve düğme kalkar (canlı: ikisi de yalnız okunmamış varken basılır). */
(function () {
  'use strict';
  var K = window.dgKayit, d = document;
  var rozet = d.getElementById('ntBadge'), hepsi = d.getElementById('ntReadAll');
  var okunduMu = function (id) { return K ? K.var('bildirim-okundu', id) : false; };
  var isaretle = function (s) {
    var id = s.getAttribute('data-nt');
    if (K && !okunduMu(id)) { K.ekle('bildirim-okundu', { id: id }); }
    s.classList.remove('okunmadi');
  };
  var say = function () {
    var n = d.querySelectorAll('.bildirim-satir.okunmadi').length;
    if (rozet) { rozet.textContent = n + ' okunmamış'; rozet.hidden = !n; }
    if (hepsi) { hepsi.hidden = !n; }
  };
  [].forEach.call(d.querySelectorAll('.bildirim-satir.okunmadi'), function (s) { if (okunduMu(s.getAttribute('data-nt'))) { s.classList.remove('okunmadi'); } });
  say();
  d.addEventListener('click', function (e) {
    var s = e.target.closest && e.target.closest('.bildirim-satir.okunmadi'); if (s) { isaretle(s); }
  });
  if (hepsi) {
    hepsi.addEventListener('click', function () {
      [].forEach.call(d.querySelectorAll('.bildirim-satir.okunmadi'), isaretle);
      say();
      if (window.prototipBildir) { window.prototipBildir('Tüm bildirimler okundu olarak işaretlendi.'); }
    });
  }
})();
