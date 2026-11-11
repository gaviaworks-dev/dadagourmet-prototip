/* Gurme Lezzetler reklam çizicileri (reklam-liste, 11 Kas · AŞAMA 2). Yalnız reklam önizlemesi açıkken yüklenir.
   İşaretler _src/sayfalar/gurme-lezzetler/index.html: LL-HERO (h1'in ardı), LL-FILTER (çip filtre şeridinin altı), LL-T1 ve LL-FEED
   (Tüm İçerikler başlığının altı; FEED `data-rk-liste="#lzGrid"`). HERO, FILTER, T1 bileşen kütüphanesinin varsayılanı.
   LL-FEED: `kart: lezzet` organik lezzet kartı (`disc-card ke-stop`) + kanon sponsor işaretleri; `bicim: nokta` kreatifi NOKTALI ÜRÜN
   GÖRSELİ olarak listede bir tam satır kaplar (satır sınırında basıldığı için organik 3'lü ızgara bozulmaz):
     solda çekirdeğin hotspot motoru (assets/js/reklam/nokta.js: binde konum, cover kırpımı, 44 px düğme, nabız, Escape), sağda ürün
     rafı: her ürün görselin o noktasından kırpılmış küçük resmiyle bir düğme; rafa dokunmak noktayı açar, nokta açılınca raf satırı
     işaretlenir. Bir tık fazlası: ikinci gecikmeli nabız halkası, açık noktanın çevresi aydınlık kalan odak perdesi (spot), raf ve nokta
     arasında karşılıklı vurgu, kart içinde ürün kırpımı. Gerçek hayatta: Pinterest Product Pins, Instagram Shopping etiketleri. */
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

  /* Ürün kırpımı: görselin (4:3) binde (x, y) noktası kare kutunun ortasına gelecek biçimde z kat büyütülmüş arka plan */
  function kirp(src, x, y, z) {
    var fx = x / 1000, fy = y / 1000, sinir = function (v) { return Math.max(0, Math.min(100, v * 100)); };
    var px = (fx * z - 0.5) / (z - 1), py = (fy * z * 0.75 - 0.5) / (z * 0.75 - 1);
    return 'background-image:url(\'' + src + '\');background-size:' + (z * 100) + '% auto;background-position:' + sinir(px).toFixed(1) + '% ' + sinir(py).toFixed(1) + '%';
  }

  function alis(k, o) {
    var N = window.dgReklamNokta;
    if (!N) { return null; }
    var src = url(k.gorsel), m = B.marka(k);
    var t = document.createElement('template');
    t.innerHTML = N.ciz(k, { kod: o.kod });
    var sahne = t.content.firstElementChild;
    /* Kartın küçük resmi bütün sahne yerine ürünün kendisi */
    [].forEach.call(sahne.querySelectorAll('.rk-nk-nokta'), function (n, i) {
      var p = k.noktalar[i], govde = n.querySelector('.rk-nk-kart-govde');
      n.style.setProperty('--rk-nk-gecikme', (i * 0.45).toFixed(2) + 's');
      if (govde) { govde.insertAdjacentHTML('afterbegin', '<span class="rk-nk-urun rk-lz-kirp" aria-hidden="true" style="' + kirp(src, p.x, p.y, 3.4) + '"></span>'); }
    });
    var raf = k.noktalar.map(function (p, i) {
      return '<li><button type="button" class="rk-lz-urun" data-rk-nokta="' + i + '" aria-expanded="false">' +
        '<span class="rk-lz-kirp" aria-hidden="true" style="' + kirp(src, p.x, p.y, 3.4) + '"></span>' +
        '<span class="rk-lz-urun-ad"><b>' + kac(p.urun) + '</b>' + (p.teklif ? '<small>' + ik('fa-gift') + ' ' + kac(p.teklif) + '</small>' : '') + '</span>' +
        '<span class="rk-lz-arti" aria-hidden="true">' + ik('fa-plus') + '</span><span class="sr-only">: ürün kartını aç</span></button></li>';
    }).join('');
    var h = '<article class="rk-lz-alis">' +
      '<div class="rk-lz-sahne-kap"></div>' +
      '<div class="rk-lz-alis-govde"><span class="disc-cat">' + kac(k.kategori || '') + '</span><h3>' + kac(k.baslik) + '</h3><p>' + kac(k.metin) + '</p>' +
      '<p class="rk-lz-raf-bas">' + ik('fa-bag-shopping') + ' Bu sofrada · ' + k.noktalar.length + ' ürün</p><ul class="rk-lz-raf" aria-label="' + kac(m.ad) + ' ürünleri">' + raf + '</ul>' +
      '<a class="btn btn-sm btn-primary rk-lz-cta" ' + bag(k) + '>' + kac(k.cta || 'Keşfet') + ' ' + ik('fa-arrow-right') + '</a><span class="rk-lz-kimlik-yer"></span></div></article>';
    var t2 = document.createElement('template');
    t2.innerHTML = B.susle(h, k, o, '.rk-lz-kimlik-yer');
    var el = t2.content.firstElementChild;
    el.querySelector('.rk-lz-kimlik-yer').remove();
    el.querySelector('.rk-lz-sahne-kap').appendChild(sahne);
    /* Nokta kartının kimliği görselde var: çekirdeğin ızgara kuralı (disc-grid > disc-card) bu satıra değmez */
    N.kur(sahne);
    var dugmeler = [].slice.call(sahne.querySelectorAll('.rk-nk-dugme')), raflar = [].slice.call(el.querySelectorAll('.rk-lz-urun'));
    /* Nokta durumu → raf ve odak perdesi */
    var esle = function () {
      var acikN = null;
      dugmeler.forEach(function (d, i) {
        var on = d.getAttribute('aria-expanded') === 'true';
        if (raflar[i]) { raflar[i].setAttribute('aria-expanded', on ? 'true' : 'false'); raflar[i].classList.toggle('rk-lz-acik', on); }
        if (on) { acikN = d.closest('.rk-nk-nokta'); }
      });
      if (acikN) { sahne.style.setProperty('--rk-spot-x', acikN.style.left); sahne.style.setProperty('--rk-spot-y', acikN.style.top); }
      el.classList.toggle('rk-lz-spot', !!acikN);
    };
    var g = new MutationObserver(esle);
    dugmeler.forEach(function (d) { g.observe(d, { attributes: true, attributeFilter: ['aria-expanded'] }); });
    /* Raf → nokta: tıklama belgeye ulaşmasın (motorun "dışarı tık kapatır" dinleyicisi yeni açılan kartı kapatmasın) */
    el.addEventListener('click', function (e) {
      var r = e.target.closest('.rk-lz-urun');
      if (!r) { return; }
      e.stopPropagation();
      var d = dugmeler[+r.getAttribute('data-rk-nokta')];
      if (!d) { return; }
      var n = d.closest('.rk-nk-nokta');
      if (n.hidden) { return; }
      d.click();
      /* Telefonda görsel ekranın üstündeyse görünür alana getir */
      var kutu = sahne.getBoundingClientRect();
      if (kutu.top < 72 || kutu.bottom > window.innerHeight) { sahne.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
    });
    /* Karşılıklı vurgu: raf satırına gelince nokta büyür ve adını açar */
    var vurgu = function (i, on) { var d = dugmeler[i]; if (d) { d.closest('.rk-nk-nokta').classList.toggle('rk-lz-vurgu', on); } };
    raflar.forEach(function (r, i) {
      ['mouseenter', 'focus'].forEach(function (t) { r.addEventListener(t, function () { vurgu(i, true); }); });
      ['mouseleave', 'blur'].forEach(function (t) { r.addEventListener(t, function () { vurgu(i, false); }); });
    });
    return el;
  }

  /* ── LL-FILTER: çip şeridinin altında tek satır (fotoğraf, logo, "Sponsorlu", başlık, metin, çağrı) ── */
  R.ciz('LL-FILTER', function (k, o) {
    var m = B.marka(k);
    return '<aside class="rk-slot rk-oneri ' + m.renkSinif + '" data-rk-slot="' + kac(o.kod) + '" data-rk-kod="' + kac(o.kod) + '" data-rk-marka="' + kac(k.marka) + '" aria-label="Sponsorlu içerik · ' + kac(m.ad) + '">' +
      '<a class="rk-oneri-bag" ' + bag(k) + '>' + (k.gorsel ? '<span class="rk-oneri-foto" style="background-image:url(\'' + url(k.gorsel) + '\')" aria-hidden="true"></span>' : '') +
      '<span class="rk-oneri-logo">' + B.logo(k) + '</span><span class="rk-oneri-metin"><span class="rk-etiket">Sponsorlu · ' + kac(m.ad) + '</span><b>' + kac(k.baslik) + '</b><span>' + kac(k.metin || '') + '</span></span>' +
      '<span class="rk-oneri-cta">' + kac(k.cta || 'Keşfet') + ' ' + ik('fa-arrow-right') + '</span></a></aside>';
  });

  R.ciz('LL-FEED', function (k, o) {
    if (k.bicim === 'nokta') { return alis(k, o); }
    return B.native(k, o);
  });
})();
