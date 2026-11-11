/* Mekânlar reklam çizicileri (reklam-cekirdek, 11 Kas) · AŞAMA 2 için REFERANS UYGULAMA.
   İşaretler _src/sayfalar/mekanlar/index.html: ML-HERO (h1'in ardı), ML-FILTER (filtre panelinde ilk grubun ardı), ML-T1 ve ML-FEED
   (liste çubuğunun altı; FEED `data-rk-liste="#mklGrid"`). Panel karşılığı resources/views/site/mekanlar/index.blade.php
   (x-reklam.slot kod="ML-HERO" bicim="eslik" · "ML-FILTER" bicim="filtre" · "ML-T1" bicim="leaderboard" · x-reklam.liste-araya).
   HERO, FILTER ve FEED bileşen kütüphanesinin varsayılan çizicisiyle basılır (kreatif biçimi: eslik, filtre, native/mekan|konsept|secki).
   Burada yalnız sayfaya özgü davranış var: ML-T1 harita görünümünde basılmaz (panel Blade'de harita dalı T1 taşımaz), liste ve boş
   durumda görünür. */
(function () {
  'use strict';
  var R = window.dgReklam, B = window.dgReklamBilesen;
  if (!R || !B) { return; }
  R.ciz('ML-T1', function (k, o) {
    var t = document.createElement('template'), arac = R.arac && R.arac(k);
    /* ML-T1 havuzu (reklam-interaktif): interaktif varyant ("Bu akşam ne yesek?" aracı) kendi çizicisiyle, standart T1 kütüphaneden */
    t.innerHTML = arac ? arac.ciz(k, o) : B.t1(k, o);
    var el = t.content.firstElementChild, harita = document.getElementById('mklMapWrap');
    if (!harita) { return el; }
    /* Görünüm değişince (#mklMapWrap hidden) T1 de saklanır; sarmalayan .rk-sar yoksa doğrudan birim. Kullanıcının kapattığı
       interaktif birim (data-rk-kapatildi) listeye dönünce geri gelmez */
    var esle = function () { el.hidden = !harita.hidden || el.hasAttribute('data-rk-kapatildi'); };
    var g = new MutationObserver(esle);
    g.observe(harita, { attributes: true, attributeFilter: ['hidden'] });
    o.temizle(function () { g.disconnect(); });
    esle();
    return el;
  });
})();
