/* Şehir Rehberleri reklam çizicileri (reklam-liste, 11 Kas · AŞAMA 2). Yalnız reklam önizlemesi açıkken yüklenir.
   İşaretler _src/sayfalar/sehir-rehberleri/index.html: SR-HERO (h1'in ardı), SR-T1 ve SR-FEED (rehber listesinin üstü; FEED
   `data-rk-liste="#sehirler .val-grid"`). HERO ve T1 varsayılan. SR-FEED: SPONSORLU SEÇKİ (sponsored collection) rehber kartı olarak:
   organik rehber kartının (`bridge-card`: ikon kutusu, başlık, metin, "keşfet" bağı) anatomisi; ikon kutusunda marka logosu, üstte
   "Sponsorlu seçki · şehir" satırı, altta seçkinin duraklarından küçük resim kolajı ve durak özeti. Sponsorluk Dokümanı'nın BigChefs
   pilotu ("Şehirde özel bir sofra", tek şehirde gastronomi seçkisi). Gerçek hayatta: Google Maps / Yelp sponsorlu liste, TripAdvisor
   marka koleksiyonu. */
(function () {
  'use strict';
  var R = window.dgReklam, B = window.dgReklamBilesen;
  if (!R || !B) { return; }
  var KOK = document.documentElement.dataset.kok || './';
  var url = function (p) { return /^(https?:|data:|\/)/.test(p) ? p : KOK + p; };
  var kac = B.kac;
  var ik = function (i) { return '<i class="fa-solid ' + i + '" aria-hidden="true"></i>'; };
  var bag = B.bag; /* reklam-duzeltici: tek kaynak bilesen.js (iç hedef, tam adres ya da marka sitesi) */
  if (!document.querySelector('link[data-rk-ek="liste"]')) {
    var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = KOK + 'assets/css/reklam/ek/liste.css'; l.setAttribute('data-rk-ek', 'liste'); document.head.appendChild(l);
  }

  R.ciz('SR-FEED', function (k, o) {
    var s = k.secki;
    if (!s) { return B.native(k, o); }
    var kolaj = (s.gorseller || []).map(function (g) { return '<span class="rk-secki-foto" style="background-image:url(\'' + url(g) + '\')"></span>'; }).join('') +
      (s.kalan ? '<span class="rk-secki-foto rk-secki-kalan">+' + s.kalan + '</span>' : '');
    var h = '<a class="bridge-card rk-secki" ' + bag(k) + '>' +
      '<span class="rk-secki-bas"><span class="bi rk-bi-logo">' + B.logo(k, '') + '</span>' +
      '<span class="rk-secki-ust"><b>' + kac(s.etiket || 'Sponsorlu seçki') + '</b><span>' + ik('fa-location-dot') + ' ' + kac(s.sehir || '') + '</span></span></span>' +
      '<h3>' + kac(k.baslik) + '</h3><p>' + kac(k.metin) + '</p>' +
      '<span class="rk-secki-kolaj" aria-hidden="true">' + kolaj + '</span><span class="rk-secki-ozet">' + ik('fa-utensils') + ' ' + kac(s.ozet || '') + '</span>' +
      '<span class="bgo">' + kac(k.cta || 'Seçkiyi gör') + ' ' + ik('fa-arrow-right') + '</span></a>';
    return B.susle(h, k, o);
  });
})();
