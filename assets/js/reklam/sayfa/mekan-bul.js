/* Mekân Bul reklam çizicileri (reklam-liste, 11 Kas · AŞAMA 2). Yalnız reklam önizlemesi açıkken yüklenir.
   REKLAM-YERLESIM: alanlar yalnız SONUÇ ekranında; sihirbaz adımlarında gövde reklamı yok (yalnız standart katman). İşaretler
   _src/sayfalar/mekan-bul/index.html: MB-HERO (h1'in ardı), MB-FILTER (seçim özeti "Düzenle" çubuğunun altı), MB-T1 (sonuç üstü, boş
   sonuçta da), MB-FEED (#mbGruplar'ın önünde, liste ilk dolu grup). MB-FILTER ve MB-T1 #mbSonuc içinde: sihirbazda zaten görünmez.
   - MB-HERO: rozet ve hero perdesi yalnız #mbSonuc görünürken.
   - MB-FEED: sonuç grupları her aramada yeniden çizilir (#mbGruplar innerHTML); yerleşim çekirdeğin liste kökü seçeneğiyle
     (`data-rk-liste-kok`, reklam-duzeltici 11 Kas; önceki kopya kural kaldırıldı). Sonuç kartı = organik sonuç kartı (`_sonuc-karti`: mekân kartı, uyum gerekçeleri, eylem satırı);
     sponsorluda uyum yüzdesi YOK (eşleşme iddiası yok), gerekçe listesinin yerinde sponsor teklifleri. */
(function () {
  'use strict';
  var R = window.dgReklam, B = window.dgReklamBilesen;
  if (!R || !B) { return; }
  var KOK = document.documentElement.dataset.kok || './';
  var url = function (p) { return /^(https?:|data:|\/)/.test(p) ? p : KOK + p; };
  var kac = B.kac;
  var ik = function (i) { return '<i class="fa-solid ' + i + '" aria-hidden="true"></i>'; };
  var bag = B.bag;
  if (!document.querySelector('link[data-rk-ek="liste"]')) {
    var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = KOK + 'assets/css/reklam/ek/liste.css'; l.setAttribute('data-rk-ek', 'liste'); document.head.appendChild(l);
  }
  var sonuc = document.getElementById('mbSonuc');

  /* ── MB-HERO: yalnız sonuç ekranında ── */
  R.ciz('MB-HERO', function (k, o) {
    var t = document.createElement('template');
    t.innerHTML = B.eslik(k, o);
    var el = t.content.firstElementChild;
    if (!sonuc) { return el; }
    var hero = o.isaret.closest('.below-header');
    var esle = function () {
      var gor = !sonuc.hidden;
      el.hidden = !gor;
      var p = hero && hero.querySelector('.rk-hero-perde');
      if (p) { p.hidden = !gor; }
    };
    var g = new MutationObserver(esle);
    g.observe(sonuc, { attributes: true, attributeFilter: ['hidden'] });
    o.temizle(function () { g.disconnect(); });
    requestAnimationFrame(esle);
    esle();
    return el;
  });

  /* ── MB-FILTER: seçim özetinin ("Düzenle") altında tek satırlık sponsorlu öneri (Gurme Lezzetler LL-FILTER ile aynı kalıp, ek/liste.css) ── */
  R.ciz('MB-FILTER', function (k, o) {
    var m = B.marka(k);
    return '<aside class="rk-slot rk-oneri ' + m.renkSinif + '" data-rk-slot="' + kac(o.kod) + '" data-rk-kod="' + kac(o.kod) + '" data-rk-marka="' + kac(k.marka) + '" aria-label="Sponsorlu içerik · ' + kac(m.ad) + '">' +
      '<a class="rk-oneri-bag" ' + bag(k) + '>' + (k.gorsel ? '<span class="rk-oneri-foto" style="background-image:url(\'' + url(k.gorsel) + '\')" aria-hidden="true"></span>' : '') +
      '<span class="rk-oneri-logo">' + B.logo(k) + '</span><span class="rk-oneri-metin"><span class="rk-etiket">Sponsorlu · ' + kac(m.ad) + '</span><b>' + kac(k.baslik) + '</b><span>' + kac(k.metin || '') + '</span></span>' +
      '<span class="rk-oneri-cta">' + kac(k.cta || 'Keşfet') + ' ' + ik('fa-arrow-right') + '</span></a></aside>';
  });

  /* ── Sonuç kartı ── */
  function eylem(k) {
    var tek = (k.teklifler || []).map(function (x) { return '<li class="rk-mb-teklif">' + ik('fa-gift') + ' ' + kac(x) + '</li>'; }).join('');
    return (tek ? '<ul class="mb-reasons">' + tek + '</ul>' : '') + '<div class="mb-card-actions"><a class="btn btn-primary" ' + bag(k) + '>' + kac(k.cta || 'Detay') + ' ' + ik('fa-arrow-right') + '</a></div>';
  }
  function kart(k, o) {
    var L = window.DG_LISTE, h = L && L.kartlar && k.mekan ? L.kartlar[k.mekan] : '';
    if (h) {
      h = h.split('{{kok}}').join(KOK).replace(/<p>[\s\S]*?<\/p>/, '').replace(/<div class="disc-status">[\s\S]*?<\/div>/, '');
      h = h.replace(/<\/article>\s*$/, eylem(k) + '</article>');
      if (k.hedef) { h = h.replace('<article ', '<article data-git="' + url(k.hedef) + '" '); }
    } else {
      h = '<article class="disc-card mkl-card"' + (k.hedef ? ' data-git="' + url(k.hedef) + '"' : '') + '><div class="disc-fig"><div class="bg"' + (k.gorsel ? ' style="background-image:url(\'' + url(k.gorsel) + '\')"' : '') + ' role="img" aria-label="' + kac(k.baslik) + '"></div></div>' +
        '<span class="disc-cat">' + kac(k.kategori || '') + '</span><h3>' + kac(k.baslik) + '</h3>' +
        '<div class="disc-meta"><span class="disc-loc" title="' + kac(k.konum || '') + '">' + ik('fa-location-dot') + '<span class="disc-ilce">' + kac(k.konum || '') + '</span></span></div>' + eylem(k) + '</article>';
    }
    return B.susle(h, k, o, '.mb-card-actions');
  }
  /* ── MB-FEED: liste çizicisi. Yerleşim çekirdekte (reklam-duzeltici, 11 Kas): işaret `data-rk-liste-kok="#mbGruplar"` +
     `data-rk-liste=".mb-res-group .mkl-grid"`; çekirdek her yeniden çizimde ilk dolu grubun ızgarasını bulur ve native yer kuralını
     (G1, tekrar, kısa liste) uygular. Burada yalnız sonuç kartının DOM'u ── */
  R.ciz('MB-FEED', function (k, o) { return kart(k, { kod: o.kod }); });
})();
