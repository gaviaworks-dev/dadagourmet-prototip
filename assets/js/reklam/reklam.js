/* Reklam önizlemesi (reklam-onizleme, Beyar 11 Kas). Prototipte reklam alanlarını göster/gizle.
   Durum `assets/js/prototip.js` "Reklam önizlemesi" bloğunda (window.dgReklam: localStorage `dg-reklam`, `?reklam=1|0`); bu betik
   başlıktaki ve çekmecedeki anahtarı bağlar, açıkken bilgi şeridini ve yerleşimleri basar, kapanınca hepsini söker.
   Kapalıyken sayfaya tek düğüm eklenmez, tek sınıf yazılmaz: içerik dosyası (ornek.js) bile yüklenmez.
   Yalnız public ve üye kabuğunda yüklenir (kabuk.mjs); İşletme Paneli ve tam ekran (Dada Route) kabuğunda yok.
   Yönetim ve ekran haritası public kabuğu kullanır: anahtar orada da durur, yerleşim basılmaz (karar notu).
   Kreatif tıklaması dışarı gitmez: prototip bildirimi verir. Gösterim ya da tıklama sayılmaz, istek gitmez. */
(function () {
  'use strict';
  var R = window.dgReklam;
  if (!R) { return; }
  var kok = document.documentElement, yol = kok.dataset.yol || '';
  var KOK = kok.dataset.kok || './';
  var YERLESIMSIZ = /^(yonetim|ekranlar|isletme|dada-route)(\/|$)/;
  var anahtarlar = [].slice.call(document.querySelectorAll('input[data-rk-anahtar]'));
  var acik = false, sokulecek = [], gozculer = [], dinleyici = [], yanEl = null, sayac = 0;

  function senkron(on) { anahtarlar.forEach(function (i) { i.checked = on; }); }
  anahtarlar.forEach(function (i) { i.addEventListener('change', function () { R.ayarla(i.checked); }); });

  var kac = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); };
  var dinle = function (h, t, f, o) { h.addEventListener(t, f, o); dinleyici.push([h, t, f, o]); };

  /* İçerik dosyası yalnız ilk açılışta yüklenir */
  function icerik(tamam) {
    if (window.DG_REKLAM_ORNEK) { tamam(); return; }
    var s = document.createElement('script');
    s.src = KOK + 'assets/js/reklam/ornek.js';
    s.onload = tamam;
    document.head.appendChild(s);
  }

  /* ── Bilgi şeridi: sayfanın en üstünde, akışta. Sabit başlık ve üst bant şeridin yüksekliği kadar aşağıda başlar, kaydırdıkça
     yukarı kayar (şerit akışla gider, başlık tepeye oturur); şerit başlığın, yapışkan öğelerin ve altbilgi perdesinin altına girmez. */
  function serit() {
    var s = document.createElement('div');
    s.className = 'rk-serit';
    s.setAttribute('data-rk-serit', '');
    s.setAttribute('role', 'region');
    s.setAttribute('aria-label', 'Reklam önizlemesi');
    var yok = YERLESIMSIZ.test(yol) ? '<span class="rk-serit-not">Bu sayfada reklam yerleşimi yok.</span>' : '';
    s.innerHTML = '<div class="rk-serit-kap"><i class="fa-solid fa-rectangle-ad" aria-hidden="true"></i><span class="rk-serit-metin">Reklam önizlemesi açık · yerleşimler örnektir</span>' + yok +
      '<button type="button" class="rk-serit-kapat" data-rk-kapat>Kapat</button></div>';
    document.body.insertBefore(s, document.body.firstChild);
    s.querySelector('[data-rk-kapat]').addEventListener('click', function () { R.ayarla(false); var a = document.querySelector('.head-actions input[data-rk-anahtar]'); if (a && a.offsetParent) { a.focus(); } });
    kok.classList.add('rk-serit-var');
    var h = 0, kare = 0;
    var olc = function () { h = s.offsetHeight; konum(); };
    var konum = function () { kare = 0; kok.style.setProperty('--rk-ust', Math.max(0, h - window.scrollY) + 'px'); };
    olc();
    dinle(window, 'scroll', function () { if (!kare) { kare = requestAnimationFrame(konum); } }, { passive: true });
    dinle(window, 'resize', olc);
  }

  /* ── Bileşenler ─────────────────────────────────────────────────────── */
  var ORNEK = '<span class="rk-ornek">· prototip örneği</span>';
  var etiket = function (ek) { return '<span class="rk-etiket' + (ek || '') + '">Sponsorlu' + ORNEK + '</span>'; };
  var ad = function (k) { return 'Sponsorlu içerik: ' + kac(k.marka); };
  var BAG = 'href="#" data-rk-ornek rel="sponsored nofollow"';
  var kok_ = function (bicim, sinif, k) { return 'class="rk-reklam ' + sinif + '" data-rk="' + bicim + '" data-rk-bicim="' + bicim + '" data-rk-kreatif="' + k.id + '"'; };
  var S = function (k) { return window.DG_REKLAM_ORNEK.svg(k.cizim); };

  var BILESEN = {
    banner: function (k) {
      return '<aside ' + kok_('banner', 'rk-banner', k) + ' aria-label="' + ad(k) + '"><a class="rk-banner-bag" ' + BAG + '>' +
        '<span class="rk-banner-gorsel">' + S(k) + '</span>' +
        '<span class="rk-banner-metin">' + etiket() + '<b>' + kac(k.baslik) + '</b><span class="rk-banner-alt">' + kac(k.metin) + '</span><span class="rk-banner-marka">' + kac(k.marka) + '</span></span>' +
        '<span class="rk-banner-cta">' + kac(k.cta) + ' <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></span></a></aside>';
    },
    kare: function (k) {
      return '<aside ' + kok_('kare', 'rk-kare', k) + ' aria-label="' + ad(k) + '"><a class="rk-kare-bag" ' + BAG + '>' +
        '<span class="rk-kare-gorsel">' + S(k) + etiket(' rk-etiket-ust') + '</span>' +
        '<span class="rk-kare-govde"><b>' + kac(k.baslik) + '</b><span class="rk-kare-alt"><span class="rk-kare-marka">' + kac(k.marka) + '</span><span class="rk-kare-cta">' + kac(k.cta) + ' <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></span></span></span></a></aside>';
    },
    yan: function (k) {
      return '<aside ' + kok_('yan', 'rk-yan', k) + ' aria-label="' + ad(k) + '"><a class="rk-yan-bag" ' + BAG + '>' + etiket(' rk-etiket-ust') +
        '<span class="rk-yan-gorsel">' + S(k) + '</span><span class="rk-yan-govde"><b>' + kac(k.baslik) + '</b><span>' + kac(k.metin) + '</span>' +
        '<span class="rk-yan-marka">' + kac(k.marka) + '</span><span class="rk-yan-cta">' + kac(k.cta) + '</span></span></a></aside>';
    },
    /* Native: listenin kendi kart anatomisi (sınıflar organik kartla aynı) + görselde ve kategori satırında "Sponsorlu" (G7) */
    native: {
      mekan: function (k) {
        return '<article ' + kok_('native', 'rk-native disc-card mkl-card', k) + ' aria-label="' + ad(k) + '"><div class="disc-fig"><div class="bg rk-gorsel">' + S(k) + '</div><span class="rk-hap">Sponsorlu</span></div>' +
          '<div class="kart-ust"><span class="disc-cat">Sponsorlu</span></div><h3>' + kac(k.baslik) + '</h3><p>' + kac(k.metin) + '</p>' +
          '<div class="disc-meta"><span class="disc-loc"><i class="fa-solid ' + k.ikon + '" aria-hidden="true"></i><span class="disc-ilce">' + kac(k.marka) + '</span></span><span class="rk-ornek-not">prototip örneği</span></div>' +
          '<div class="mkl-kart-eylem"><a class="mke-birincil" ' + BAG + '>' + kac(k.cta) + '</a></div></article>';
      },
      ev: function (k) {
        return '<article ' + kok_('native', 'rk-native disc-card ev-card', k) + ' aria-label="' + ad(k) + '"><a class="disc-card-link" ' + BAG + '><div class="disc-fig"><div class="bg rk-gorsel">' + S(k) + '</div><span class="rk-hap">Sponsorlu</span></div>' +
          '<span class="disc-cat">Sponsorlu</span><h3>' + kac(k.baslik) + '</h3><p>' + kac(k.metin) + '</p>' +
          '<div class="disc-meta ev-meta"><span class="disc-where"><i class="fa-solid ' + k.ikon + '" aria-hidden="true"></i> <span class="dw-txt">' + kac(k.marka) + '</span></span><span class="rk-ornek-not">prototip örneği</span></div></a>' +
          '<div class="disc-card-foot"><a class="btn btn-sm btn-ghost" ' + BAG + '>' + kac(k.cta) + '</a></div></article>';
      },
      lezzet: function (k) {
        return '<article ' + kok_('native', 'rk-native disc-card ke-stop', k) + ' aria-label="' + ad(k) + '"><a class="disc-card-link" ' + BAG + '><div class="disc-fig"><div class="bg rk-gorsel">' + S(k) + '</div><span class="rk-hap">Sponsorlu</span></div>' +
          '<span class="disc-cat">Sponsorlu</span><h3>' + kac(k.baslik) + '</h3><p>' + kac(k.metin) + '</p>' +
          '<div class="disc-meta"><span class="disc-author"><i class="fa-solid ' + k.ikon + '" aria-hidden="true"></i> ' + kac(k.marka) + '</span><span class="rk-ornek-not">prototip örneği</span></div></a></article>';
      },
      rehber: function (k) {
        return '<a ' + kok_('native', 'rk-native bridge-card', k) + ' ' + BAG + ' aria-label="' + ad(k) + '"><span class="bi"><i class="fa-solid ' + k.ikon + '" aria-hidden="true"></i></span>' +
          '<span class="rk-hap rk-hap-satir">Sponsorlu</span><h3>' + kac(k.baslik) + '</h3><p>' + kac(k.metin) + ' ' + kac(k.marka) + ' · prototip örneği.</p>' +
          '<span class="bgo">' + kac(k.cta) + ' <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></span></a>';
      }
    },
    /* G10 hazırlığı (bu tur basılmaz): Dada Route haritasında sponsorlu pinin mini kartı ve yol üstü fırsat kartı */
    rotaPin: function (k) {
      return '<div ' + kok_('rota-pin', 'rk-rota-pin', k) + ' role="group" aria-label="' + ad(k) + '"><span class="rk-rota-pin-gorsel">' + S(k) + '</span><span class="rk-rota-pin-govde">' + etiket() +
        '<b>' + kac(k.marka) + '</b><span>' + kac(k.metin) + '</span><button type="button" class="rk-rota-ekle" data-rk-ornek><i class="fa-solid fa-plus" aria-hidden="true"></i> Rotaya ekle</button></span></div>';
    },
    rotaFirsat: function (k, sapma) {
      return '<article ' + kok_('rota-firsat', 'rk-rota-firsat', k) + ' aria-label="' + ad(k) + '"><span class="rk-rota-firsat-gorsel">' + S(k) + '</span><span class="rk-rota-firsat-govde">' + etiket() +
        '<b>Yol üstü fırsat · ' + kac(k.marka) + '</b><span>' + kac(k.baslik) + '</span><span class="rk-rota-firsat-sapma"><i class="fa-solid fa-route" aria-hidden="true"></i> ' + kac(sapma || 'Rotadan 600 m sapma · +4 dk') + '</span>' +
        '<button type="button" class="rk-rota-ekle" data-rk-ornek><i class="fa-solid fa-plus" aria-hidden="true"></i> Rotaya ekle</button></span></article>';
    }
  };
  window.dgReklamBilesen = BILESEN;

  var dugum = function (html) { var t = document.createElement('template'); t.innerHTML = html; return t.content.firstChild; };
  var kreatif = function () { var l = window.DG_REKLAM_ORNEK.kreatif; return l[(sayac++) % l.length]; };
  var koy = function (el, hedef, yon) {
    if (yon === 'once') { hedef.before(el); } else if (yon === 'basa') { hedef.prepend(el); } else if (yon === 'sona') { hedef.append(el); } else { hedef.after(el); }
    sokulecek.push(el);
  };
  var sinifla = function (el, s) { el.classList.add(s); sokulecek.push(function () { el.classList.remove(s); }); };

  function bannerKur(y) {
    var h = document.querySelector(y.h); if (!h) { return; }
    var b = dugum(BILESEN.banner(kreatif()));
    var el = b;
    if (y.bolum) { el = document.createElement('section'); el.className = 'rk-bolum'; el.setAttribute('data-rk', 'bolum'); var k = document.createElement('div'); k.className = 'rk-kap'; k.appendChild(b); el.appendChild(k); }
    koy(el, h, y.yon);
    if (y.alt) { b.setAttribute('data-rk-alt', y.alt); }
  }
  function kareKur(y) {
    var h = document.querySelector(y.h); if (!h) { return; }
    var el = dugum(BILESEN.kare(kreatif()));
    if (y.yuzen) { el.classList.add('rk-yuzen'); sinifla(y.yon === 'basa' ? h : h.parentElement, 'rk-akis'); }
    koy(el, h, y.yon);
  }
  function heroKur(y) {
    var h = document.querySelector(y.h); if (!h) { return; }
    /* G8 rozet metni görev tanımındaki gibi: "Sponsorlu · Örnek Marka" (telefonda hero'nun üst satırına sığar) */
    var k = { marka: 'Örnek Marka' };
    sinifla(h, 'rk-hero');
    var perde = dugum('<span class="rk-hero-perde" data-rk="hero-perde" aria-hidden="true"></span>');
    var medya = h.querySelector(':scope > .ke-hero-media');
    if (medya) { koy(perde, medya, 'sonra'); } else { koy(perde, h, 'basa'); }
    var rozet = dugum('<a class="rk-hero-rozet rk-reklam" data-rk="hero" data-rk-bicim="hero" ' + BAG + ' aria-label="' + ad(k) + '"><i class="fa-solid fa-rectangle-ad" aria-hidden="true"></i><span>Sponsorlu · ' + kac(k.marka) + '</span>' + ORNEK + '</a>');
    koy(rozet, h, 'sona');
  }
  /* Native: liste her yeniden çizildiğinde (süzgeç, sayfa, görünüm) yeniden yerleşir; yalnız yabancı değişiklikte çalışır, kendi eklediği
     düğüm gözcüyü tetiklemez. Liste altı bannerı listede 4'ten az kart varken gizlenir (G1) */
  function nativeKur(y) {
    var kap = document.querySelector(y.kap); if (!kap) { return; }
    var yap = BILESEN.native[y.kart];
    var duzen = function () {
      [].slice.call(kap.querySelectorAll(':scope > [data-rk]')).forEach(function (e) { e.remove(); });
      var ogeler = [].slice.call(kap.children).filter(function (c) { return c.tagName !== 'TEMPLATE'; });
      var n = ogeler.length, yer = [];
      if (n) {
        if (y.sira) { yer.push(Math.min(y.sira - 1, n)); } else { for (var i = y.her; i <= n; i += y.her) { yer.push(i); } if (!yer.length) { yer.push(n); } }
      }
      yer.forEach(function (i) { var el = dugum(yap(kreatif())); if (i === 0) { kap.prepend(el); } else { ogeler[i - 1].after(el); } });
      [].slice.call(document.querySelectorAll('[data-rk-alt="' + y.kap + '"]')).forEach(function (b) { b.hidden = n < 4 || !kap.offsetParent; });
    };
    var yabanci = function (d) { return d.nodeType === 1 ? !d.hasAttribute('data-rk') : d.nodeType === 3 && d.textContent.trim() !== ''; };
    var g = new MutationObserver(function (kayit) {
      if (kayit.some(function (r) { return [].some.call(r.addedNodes, yabanci) || [].some.call(r.removedNodes, yabanci); })) { duzen(); }
    });
    g.observe(kap, { childList: true });
    gozculer.push(g);
    duzen();
    sokulecek.push(function () { [].slice.call(kap.querySelectorAll(':scope > [data-rk]')).forEach(function (e) { e.remove(); }); });
  }
  /* Yapışkan dikey (G4): içerik kabının dışındaki kenar boşluğu 160 px + iki yanda 24 px'e yetiyorsa (≥ ~1624 px) sol kenarda; başlığın
     altında başlar, hero ya da altbilgi o banda girince görünmez; Mentör düğmesi ve alt köşelerle çakışmaması için yükseklik yetmezse basılmaz */
  function yanKur() {
    yanEl = dugum(BILESEN.yan(kreatif()));
    document.body.appendChild(yanEl);
    sokulecek.push(yanEl);
    var kare = 0;
    var konum = function () {
      kare = 0;
      var W = document.documentElement.clientWidth, H = window.innerHeight;
      var kapG = parseFloat(getComputedStyle(kok).getPropertyValue('--kap-genislik')) || 1240;
      var bos = (W - kapG) / 2, w = 160, yuk = 600, pay = 24;
      var bas = document.querySelector('header.header'), ust = bas ? bas.getBoundingClientRect().bottom + pay : 137;
      var gorunur = bos >= w + 2 * pay && H >= ust + yuk + 120;
      if (gorunur) {
        var hero = document.querySelector('#pageMain .below-header, #pageMain .ke-top, #pageMain .lst-top, #pageMain .art-hero');
        if (hero && hero.getBoundingClientRect().bottom > ust - pay) { gorunur = false; }
        var ana = document.getElementById('pageMain');
        if (ana && ana.getBoundingClientRect().bottom < ust + yuk + pay) { gorunur = false; }
      }
      yanEl.style.left = Math.round((bos - w) / 2) + 'px';
      yanEl.style.top = Math.round(ust) + 'px';
      yanEl.classList.toggle('rk-yan-gorunur', gorunur);
      yanEl.setAttribute('aria-hidden', gorunur ? 'false' : 'true');
      if (gorunur) { yanEl.removeAttribute('inert'); } else { yanEl.setAttribute('inert', ''); }
    };
    dinle(window, 'scroll', function () { if (!kare) { kare = requestAnimationFrame(konum); } }, { passive: true });
    dinle(window, 'resize', konum);
    konum();
  }

  function yerlestir() {
    var Y = window.DG_REKLAM_ORNEK.yerlesim, kural = null;
    for (var i = 0; i < Y.length; i++) { if (Y[i].y.test(yol)) { kural = Y[i]; break; } }
    if (!kural) { return; }
    kural.l.forEach(function (y) {
      if (y.b === 'banner') { bannerKur(y); } else if (y.b === 'kare') { kareKur(y); } else if (y.b === 'hero') { heroKur(y); } else if (y.b === 'native') { nativeKur(y); }
    });
    if (kural.yan) { yanKur(); }
  }

  function ac() {
    if (acik) { return; }
    acik = true;
    serit();
    if (YERLESIMSIZ.test(yol)) { return; }
    icerik(function () { if (acik) { sayac = 0; yerlestir(); } });
  }
  function kapat() {
    acik = false;
    gozculer.forEach(function (g) { g.disconnect(); }); gozculer = [];
    dinleyici.forEach(function (d) { d[0].removeEventListener(d[1], d[2], d[3]); }); dinleyici = [];
    sokulecek.reverse().forEach(function (s) { if (typeof s === 'function') { s(); } else if (s.remove) { s.remove(); } }); sokulecek = [];
    var s = document.querySelector('[data-rk-serit]'); if (s) { s.remove(); }
    kok.classList.remove('rk-serit-var'); kok.style.removeProperty('--rk-ust');
    yanEl = null;
  }

  /* Kreatif bağları dışarı gitmez */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-rk-ornek]');
    if (!a) { return; }
    e.preventDefault();
    var t = document.getElementById('keToast'), m = document.getElementById('keToastMsg');
    var metin = 'Prototip örneği: canlıda bu bağlantı reklam verenin sayfasını açar.';
    if (!t || !m) { return; }
    m.textContent = metin; t.classList.add('show', 'on');
    clearTimeout(ac.z); ac.z = setTimeout(function () { t.classList.remove('show', 'on'); }, 2600);
  });

  document.addEventListener('dg-reklam', function (e) { senkron(e.detail); if (e.detail) { ac(); } else { kapat(); } });
  senkron(R.acik());
  if (R.acik()) {
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', ac); } else { ac(); }
  }
})();
