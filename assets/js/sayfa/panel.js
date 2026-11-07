/* Gurme Panelim: bu tarayıcıdaki demo kayıtlarını ilgili sekmenin başına ekler. */
(function () {
  'use strict';
  var K = window.dgKayit, liste = document.querySelector('.fp-list'), sekme = document.documentElement.dataset.yol.split('/').pop(); if (!K || !liste) { return; }
  var kac = function (t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); };
  var satir = function (ikon, ad, alt, rozet) { return '<div class="kalem-satiri"><span class="ks-ikon"><i class="fa-solid ' + ikon + '" aria-hidden="true"></i></span><span class="ks-metin"><b>' + kac(ad) + '</b><small>' + kac(alt) + '</small></span><span class="ks-uc"><span class="rozet pasif">' + kac(rozet) + '</span></span></div>'; };
  var ekle = function (html) { if (!html) { return; } var b = liste.querySelector('.bos-durum'); if (b) { b.parentNode.removeChild(b); } liste.insertAdjacentHTML('afterbegin', html); };
  var yazicilar = {
    'gurme-favorilerim': function () { return K.oku('favori').map(function (k) { return satir('fa-bowl-food', k.ad, k.tur + ' · ' + k.mekan + ' · bu tarayıcıda', k.tur); }).join(''); }
  };
  if (yazicilar[sekme]) { ekle(yazicilar[sekme]()); }
})();
