/* Noktalı görsel (hotspot / shoppable image) motoru (reklam-cekirdek, 11 Kas).
   Mantık kaynağı: dadadiet-prototip assets/js/reklam/nokta.js (DadaGastro@905288b7b2 public/reklam/nokta.js) ve panel reklam.js
   foto-etiket yaşam döngüsü: konum binde (0–1000) ve GÖRSELE göredir; görsel kabı `object-fit: cover` ile doldurduğu için çizilen boy ve
   kayma hesaplanır, nokta merkezi piksele çevrilir, kap değişince (ResizeObserver) yeniden konur; 640 px ve altında ayrı mobil konum
   (mx, my) kullanılır; kırpımın dışında kalan nokta basılmaz; tek açık kart, dışarı tık ve Escape kapatır.
   Gourmet farkı: nokta 44 px dokunma alanı, marka renginde nabız halkası; üstüne gelince ya da odaklanınca ürün adı haptan açılır;
   kart noktanın yanından büyüyerek açılır (sığmadığı yöne çevrilir), telefonda görselin altında alt pencere olur. Kart: marka logosu,
   "Sponsorlu", ürün fotoğrafı, başlık, teklif, çağrı. Klavye: nokta gerçek <button> (aria-expanded, aria-controls); Escape kapatır ve
   odağı noktaya döndürür. Hareket azaltma tercihinde nabız ve büyüme yok.
   Kullanım: kreatif `bicim: "nokta"` (bilesen varsayılanı) ya da `dgReklamNokta.ciz(k, o)` → HTML; yerleşince çekirdek `kur(el)` çağırır.
   Kreatif: { marka, gorsel, alt, noktalar: [{ urun, baslik, metin, teklif, cta, gorsel, hedef, x, y, mx, my, marka? }] } */
(function () {
  'use strict';
  var B = window.dgReklamBilesen;
  if (!B) { return; }
  var KOK = document.documentElement.dataset.kok || './';
  var kac = B.kac, sayac = 0;
  var url = function (p) { return /^(https?:|data:|\/)/.test(p) ? p : KOK + p; };
  var MOBIL = '(max-width: 640px)';

  function ciz(k, o) {
    var m = B.marka(k), id = 'rkNk' + (++sayac);
    var noktalar = (k.noktalar || []).map(function (n, i) {
      var nk = { marka: n.marka || k.marka, hedef: n.hedef };
      var nm = B.marka(nk), kid = id + '-' + i;
      var bagla = B.bag(nk); /* reklam-duzeltici: tek kaynak (iç hedef ya da marka sitesi) */
      return '<div class="rk-nk-nokta ' + nm.renkSinif + '" data-rk-oge="' + kac(n.id || 'nokta-' + (i + 1)) + '" data-x="' + (n.x || 500) + '" data-y="' + (n.y || 500) + '"' + (n.mx != null ? ' data-mx="' + n.mx + '" data-my="' + n.my + '"' : '') + ' hidden>' +
        '<button type="button" class="rk-nk-dugme" aria-expanded="false" aria-controls="' + kid + '" aria-label="Sponsorlu ürün: ' + kac(n.urun || n.baslik) + ' · ' + kac(nm.ad) + '">' +
        '<span class="rk-nk-halka" aria-hidden="true"></span><span class="rk-nk-cekirdek" aria-hidden="true"><i class="fa-solid fa-plus"></i></span><span class="rk-nk-ad" aria-hidden="true">' + kac(n.urun || n.baslik) + '</span></button>' +
        '<div class="rk-nk-kart" id="' + kid + '" role="group" aria-label="' + kac(n.baslik || n.urun) + ' · Sponsorlu" hidden>' +
        '<div class="rk-nk-kart-ust"><span class="rk-nk-logo">' + B.logo(nk) + '</span><span class="rk-etiket">Sponsorlu</span>' +
        '<button type="button" class="rk-nk-kapat" aria-label="Kartı kapat"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button></div>' +
        '<div class="rk-nk-kart-govde">' + (n.gorsel ? '<span class="rk-nk-urun"><img src="' + url(n.gorsel) + '" alt="" loading="lazy" decoding="async"></span>' : '') +
        '<span class="rk-nk-metin"><b>' + kac(n.baslik || n.urun) + '</b>' + (n.metin ? '<span>' + kac(n.metin) + '</span>' : '') + '</span></div>' +
        (n.teklif ? '<span class="rk-nk-teklif"><i class="fa-solid fa-gift" aria-hidden="true"></i> ' + kac(n.teklif) + '</span>' : '') +
        '<a class="rk-nk-cta" ' + bagla + '>' + kac(n.cta || 'İncele') + ' <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a></div></div>';
    }).join('');
    return '<figure class="rk-slot rk-nk-sahne ' + m.renkSinif + '" data-rk-slot="' + kac(o.kod) + '" data-rk-kod="' + kac(o.kod) + '" data-rk-marka="' + kac(k.marka) + '" data-rk-nk aria-label="Sponsorlu görsel · ' + kac(m.ad) + '">' +
      '<img class="rk-nk-gorsel" src="' + url(k.gorsel) + '" alt="' + kac(k.alt || '') + '" decoding="async">' +
      '<span class="rk-etiket rk-nk-etiket">Sponsorlu · ' + kac(m.ad) + '</span>' + noktalar +
      (k.ipucu !== false ? '<figcaption class="rk-nk-ipucu"><i class="fa-solid fa-hand-pointer" aria-hidden="true"></i> Noktalara dokun</figcaption>' : '') + '</figure>';
  }

  /* Kabın boyu ve `cover` kırpımı (Gastro `olcu`) */
  function olcu(sahne) {
    var img = sahne.querySelector('.rk-nk-gorsel'), g = sahne.clientWidth, y = sahne.clientHeight;
    if (!img || !img.naturalWidth || !g || !y) { return null; }
    var olcek = Math.max(g / img.naturalWidth, y / img.naturalHeight), cg = img.naturalWidth * olcek, cy = img.naturalHeight * olcek;
    return { g: g, y: y, cg: cg, cy: cy, sx: (g - cg) / 2, sy: (y - cy) / 2 };
  }
  function konumla(sahne) {
    var o = olcu(sahne);
    if (!o) { return; }
    var mobil = window.matchMedia(MOBIL).matches;
    sahne.querySelectorAll('.rk-nk-nokta').forEach(function (n) {
      var mx = n.getAttribute('data-mx'), my = n.getAttribute('data-my');
      var b = mobil && mx != null ? [+mx, +my] : [+n.getAttribute('data-x'), +n.getAttribute('data-y')];
      var px = o.sx + b[0] / 1000 * o.cg, py = o.sy + b[1] / 1000 * o.cy;
      var disarida = px < 22 || px > o.g - 22 || py < 22 || py > o.y - 22;
      n.hidden = disarida;
      n.style.left = Math.round(px) + 'px';
      n.style.top = Math.round(py) + 'px';
      n.classList.toggle('rk-nk-sag', px > o.g / 2);
      n.classList.toggle('rk-nk-alt', py > o.y / 2);
    });
  }

  var acikKart = null;
  function kapat(n, odak) {
    if (!n) { return; }
    var d = n.querySelector('.rk-nk-dugme'), kart = n.querySelector('.rk-nk-kart');
    n.classList.remove('rk-nk-acik');
    d.setAttribute('aria-expanded', 'false');
    kart.hidden = true;
    n.closest('.rk-nk-sahne').classList.remove('rk-nk-kart-var');
    if (acikKart === n) { acikKart = null; }
    if (odak) { d.focus(); }
  }
  function ac(n) {
    if (acikKart && acikKart !== n) { kapat(acikKart, false); }
    var d = n.querySelector('.rk-nk-dugme'), kart = n.querySelector('.rk-nk-kart');
    var sahne = n.closest('.rk-nk-sahne');
    kart.hidden = false;
    kart.style.cssText = '';
    if (window.matchMedia(MOBIL).matches) {
      /* Alt pencere: kart noktanın içinde ama görselin alt kenarına, iki yandan 8 px içeride oturur */
      var nx = n.offsetLeft, ny = n.offsetTop;
      kart.style.width = (sahne.clientWidth - 16) + 'px';
      kart.style.left = (8 - nx) + 'px';
      kart.style.right = 'auto';
      kart.style.bottom = 'auto';
      kart.style.top = (sahne.clientHeight - 8 - kart.offsetHeight - ny) + 'px';
    }
    d.setAttribute('aria-expanded', 'true');
    sahne.classList.add('rk-nk-kart-var');
    requestAnimationFrame(function () { n.classList.add('rk-nk-acik'); });
    acikKart = n;
    olay(sahne, n);
  }
  /* Ölçüm (reklam-duzeltici, 11 Kas; REKLAM-YERLESIM "Noktalı görsel": `gorsel_nokta_tiklamasi` + `oge` = nokta kimliği). Prototipte istek
     gitmez: `dg-reklam-olay` belge olayı ve `dgReklamArac.olaylar` (interaktif/ortak.js ile aynı biçim). Aynı noktanın tekrarı `tekrar` işaretli */
  function olay(sahne, n) {
    var kok = sahne.closest('[data-rk-kod]') || sahne, oge = n.getAttribute('data-rk-oge'), A = window.dgReklamArac = window.dgReklamArac || {};
    A.olaylar = A.olaylar || [];
    var acilan = sahne.__rkOge || (sahne.__rkOge = {}), detay = { oge: oge };
    if (acilan[oge]) { detay.tekrar = true; }
    acilan[oge] = true;
    var e = { kod: kok.getAttribute('data-rk-kod'), kreatif: kok.getAttribute('data-rk-kreatif'), olay: 'gorsel_nokta_tiklamasi', detay: detay, zaman: Date.now() };
    A.olaylar.push(e);
    document.dispatchEvent(new CustomEvent('dg-reklam-olay', { detail: e }));
  }
  function kur(el) {
    var sahne = el.matches && el.matches('.rk-nk-sahne') ? el : el.querySelector && el.querySelector('.rk-nk-sahne');
    if (!sahne || sahne.hasAttribute('data-rk-nk-kurulu')) { return; }
    sahne.setAttribute('data-rk-nk-kurulu', '');
    var img = sahne.querySelector('.rk-nk-gorsel');
    var yeniden = function () { konumla(sahne); };
    if (img.complete) { yeniden(); } else { img.addEventListener('load', yeniden); }
    if ('ResizeObserver' in window) { new ResizeObserver(yeniden).observe(sahne); } else { window.addEventListener('resize', yeniden); }
    sahne.addEventListener('click', function (e) {
      var kapatD = e.target.closest('.rk-nk-kapat');
      if (kapatD) { kapat(kapatD.closest('.rk-nk-nokta'), true); return; }
      var d = e.target.closest('.rk-nk-dugme');
      if (!d) { return; }
      var n = d.closest('.rk-nk-nokta');
      if (n.classList.contains('rk-nk-acik')) { kapat(n, false); } else { ac(n); }
    });
  }
  document.addEventListener('click', function (e) { if (acikKart && !acikKart.contains(e.target)) { kapat(acikKart, false); } });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && acikKart) { kapat(acikKart, true); } });
  window.addEventListener('resize', function () { if (acikKart) { kapat(acikKart, false); } });

  window.dgReklamNokta = { ciz: ciz, kur: kur, konumla: konumla };
  B.nokta = ciz;
})();
