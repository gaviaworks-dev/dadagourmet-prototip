/* İnteraktif reklam araçları · ortak kabuk (reklam-interaktif, 11 Kas; Reklam turu 2, AŞAMA 2/C).
   Kanon davranış: panel public/reklam/interaktif.js + Gastro kapatılabilir şerit (`.rk-pisirme`) + açılır pano; mobil alt pencere
   Gastro/Diet foto-etiket kalıbı (`dialog.rk-foto-mobil` + `html.rk-sheet-lock`, dadadiet-prototip assets/js/reklam/reklam.js
   rkTakipliPencere). Bu kabuk kanonun `[data-rk-interaktif]` sürücüsünün (assets/js/reklam/interaktif.js) yerine, kreatif içi ARAÇ taşıyan
   interaktif kreatifler (`arac` alanı) için çalışır; aynı sözleşme: kapalı şerit → açılır pano, açma etkileşim sayılır, kapatma bu
   oturumda hatırlanır (aynı anahtar `dg-rk-int-kapali-<kod>`; canlıda `reklam.kapali.<kod>`), kapatılınca birim yer tutmaz.
   Ek olarak: pano yüksekliği akıcı açılır/kapanır (hareket azaltma tercihinde anında), açılınca odak panonun başlığına gider, Escape
   kapatır ve odağı açan düğmeye döndürür, 640 px ve altında pano alttan açılan pencere olur (kaydırma kilitli, arka plana dokununca
   kapanır), bütün denetimler en az 44 px.
   Ölçüm: prototipte istek gitmez. Olaylar panel sözlüğünün adlarıyla (`OlayTuru`: pano_acma, secici_secimi, oneri_araci, etkilesim,
   tiklama) `dg-reklam-olay` belge olayı olarak yayılır ve `dgReklamArac.olaylar` dizisinde tutulur (canlıda `POST /reklam/e`).
   Araç kaydı: `dgReklamArac[ad] = { ciz(k, o) → HTML, kur(el, k, o) }`; çekirdek (reklam.js) kreatifin `arac` alanına göre
   assets/js/reklam/interaktif/<ad>.js dosyasını yükler, `ciz` ile basar, yerleşince `kur` çağırır. Araçlar bu dosyadaki
   `dgReklamIA.kabuk` (DOM) ve `dgReklamIA.bagla` (davranış) yardımcılarını kullanır. */
(function () {
  'use strict';
  var R = window.dgReklam, B = window.dgReklamBilesen;
  if (!R || !B) { return; }
  var KOK = document.documentElement.dataset.kok || './';
  var kac = B.kac, sayac = 0;
  var MOBIL = '(max-width: 640px)';
  var mobil = function () { return window.matchMedia(MOBIL).matches; };
  var azHareket = function () { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; };
  var url = function (p) { return /^(https?:|data:|\/)/.test(p) ? p : KOK + p; };
  var anahtar = function (kod) { return 'dg-rk-int-kapali-' + kod; };
  var A = window.dgReklamArac = window.dgReklamArac || {};
  A.olaylar = A.olaylar || [];

  function olay(kok, ad, detay) {
    var e = { kod: kok.getAttribute('data-rk-kod'), kreatif: kok.getAttribute('data-rk-kreatif'), olay: ad, detay: detay || null, zaman: Date.now() };
    A.olaylar.push(e);
    document.dispatchEvent(new CustomEvent('dg-reklam-olay', { detail: e }));
  }
  /* Kreatif içi bağ: iç hedef prototipte gezer; hedefsiz bağ sayfada kalır ve çekirdeğin "Örnek yerleşim" bildirimini verir
     (reklam.js `[data-rk-ornek]`); `dis` yalnız Dada ekosistemi içi gerçek adres için (Dada Gastro tarifi), yeni sekmede */
  function bag(hedef, dis, x) {
    if (dis) { return 'href="' + kac(dis) + '" target="_blank" rel="noopener" data-rk-bag'; }
    /* reklam-duzeltici (11 Kas): hedefsiz bağ markanın gerçek sitesine (bilesen.js B.bag; `x` kreatif ya da seçeneğin markası) */
    if (!hedef && x && x.marka && window.dgReklamBilesen) { return window.dgReklamBilesen.bag({ marka: x.marka }); }
    return hedef ? 'href="' + url(hedef) + '" rel="sponsored" data-rk-bag' : 'href="#" rel="sponsored nofollow noopener" data-rk-bag data-rk-ornek';
  }
  var ik = function (i) { return '<i class="fa-solid ' + i + '" aria-hidden="true"></i>'; };
  var KAPAT_SVG = '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';

  /* ── DOM: şerit (logo · Sponsorlu · başlık düğmesi · [ek] · çağrı · kapat) + pano (başlık satırı + araç gövdesi) ──
     p = { arac, logolar?, seritEk?, govde, icSinif? } */
  function kabuk(k, o, p) {
    var m = B.marka(k), id = 'rkIa' + (++sayac), ad = (k.markaAdi || m.ad);
    var logo = p.logolar || B.logo(k);
    return '<section class="rk-slot rk-ia rk-ia-' + p.arac + ' ' + m.renkSinif + '" data-rk-slot="' + kac(o.kod) + '" data-rk-kod="' + kac(o.kod) + '" data-rk-marka="' + kac(k.marka) + '"' +
      (k.id ? ' data-rk-kreatif="' + kac(k.id) + '"' : '') + ' data-rk-arac="' + kac(p.arac) + '" data-rk-etkilesim="' + kac(k.etkilesim || '') + '" aria-label="Sponsorlu · ' + kac(ad) + '">' +
      '<div class="rk-ia-serit">' +
        '<span class="rk-ia-logo' + (p.logolar ? ' rk-ia-logolar' : '') + '">' + logo + '</span>' +
        '<span class="rk-ia-kimlik">' +
          '<button type="button" class="rk-ia-ac" data-ia-ac aria-expanded="false" aria-controls="' + id + '"><span class="rk-etiket">Sponsorlu</span>' +
          '<span class="rk-ia-ac-baslik"><b>' + kac(k.baslik) + '</b>' + ik('fa-chevron-down rk-ia-ok') + '</span></button></span>' +
        (k.metin && !p.seritEk ? '<span class="rk-ia-serit-metin">' + kac(k.metin) + '</span>' : '') +
        (p.seritEk || '') +
        '<button type="button" class="rk-ia-cta" data-ia-ac aria-expanded="false" aria-controls="' + id + '"><span>' + kac(k.cta || 'Keşfet') + '</span>' + ik('fa-chevron-down rk-ia-ok') + '</button>' +
        '<button type="button" class="rk-ia-kapat" data-ia-kapat aria-label="Reklamı kapat">' + KAPAT_SVG + '</button>' +
      '</div>' +
      '<div class="rk-ia-pano" id="' + id + '" role="region" aria-label="' + kac(k.baslik) + ' · Sponsorlu" hidden>' +
        '<div class="rk-ia-ic' + (p.icSinif ? ' ' + p.icSinif : '') + '" data-ia-ic>' +
          '<div class="rk-ia-sayfa-bas"><span class="rk-ia-logo' + (p.logolar ? ' rk-ia-logolar' : '') + '">' + logo + '</span>' +
            '<span class="rk-ia-sayfa-ad"><span class="rk-etiket">Sponsorlu</span><b>' + kac(k.baslik) + '</b></span>' +
            '<button type="button" class="rk-ia-daralt" data-ia-daralt aria-label="Paneli kapat">' + KAPAT_SVG + '</button></div>' +
          p.govde +
          '<p class="rk-ia-canli" aria-live="polite"></p>' +
        '</div></div></section>';
  }

  /* Odaklanabilir sonraki öğe (birim kapatılınca odak kaybolmasın) */
  function sonrakiOdak(el) {
    var hepsi = [].slice.call(document.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'));
    for (var i = 0; i < hepsi.length; i++) {
      var h = hepsi[i];
      if (!el.contains(h) && (el.compareDocumentPosition(h) & Node.DOCUMENT_POSITION_FOLLOWING) && h.offsetParent !== null) { return h; }
    }
    return null;
  }

  /* ── Davranış. h = { acildi(neden), kapandi() }. Döner: api { kok, ic, ac(neden), kapat(odak), olay(ad, detay), odakla(el), duyur(metin), acik() } ── */
  function bagla(el, k, o, h) {
    h = h || {};
    var kok = el.matches && el.matches('.rk-ia') ? el : el.querySelector('.rk-ia');
    if (!kok) { return null; }
    var dis = el, kod = kok.getAttribute('data-rk-kod');
    try { if (sessionStorage.getItem(anahtar(kod))) { dis.hidden = true; dis.setAttribute('data-rk-kapatildi', ''); return null; } } catch (e) { /* depo kapalı */ }
    var pano = kok.querySelector('.rk-ia-pano'), ic = pano.querySelector('[data-ia-ic]'), canli = ic.querySelector('.rk-ia-canli');
    var acicilar = [].slice.call(kok.querySelectorAll('[data-ia-ac]'));
    var acik = false, sayfa = null, sonTetik = null, sayildi = false, zaman = 0, tostYer = null;
    var tostGeri = function () { if (tostYer) { tostYer[1].insertBefore(tostYer[0], tostYer[2] && tostYer[2].parentNode === tostYer[1] ? tostYer[2] : null); tostYer = null; } };

    var api = {
      kok: kok, ic: ic,
      acik: function () { return acik; },
      olay: function (ad, detay) { olay(kok, ad, detay); },
      duyur: function (metin) { canli.textContent = ''; setTimeout(function () { canli.textContent = metin; }, 30); },
      /* Adım değişince odak yeni adımın başlığına (tabindex=-1); görünür alanda değilse en yakın kenara kaydırılır */
      odakla: function (hedef) {
        var x = typeof hedef === 'string' ? ic.querySelector(hedef) : hedef;
        if (!x) { return; }
        if (!x.hasAttribute('tabindex')) { x.setAttribute('tabindex', '-1'); }
        x.focus({ preventScroll: true });
        var r = x.getBoundingClientRect();
        if (!sayfa && (r.top < 80 || r.bottom > window.innerHeight)) { x.scrollIntoView({ block: 'nearest', behavior: azHareket() ? 'auto' : 'smooth' }); }
        if (sayfa) { x.scrollIntoView({ block: 'nearest' }); }
      },
      ac: function (neden, tetik) { ac(neden, tetik); },
      kapat: function (odak) { kapat(odak); },
      /* İçerik değişince (adım geçişi) masaüstü pano yüksekliği akıcı uyum sağlar */
      yeniden: function (fn) {
        if (sayfa || pano.hidden || azHareket()) { fn(); R.yogunluk && R.yogunluk(); return; }
        var once = pano.offsetHeight;
        fn();
        var sonra = pano.scrollHeight;
        if (Math.abs(sonra - once) < 2) { return; }
        pano.style.height = once + 'px';
        pano.offsetHeight; // eslint-disable-line no-unused-expressions
        pano.style.height = sonra + 'px';
        clearTimeout(zaman);
        zaman = setTimeout(function () { if (acik) { pano.style.height = ''; } R.yogunluk && R.yogunluk(); }, 320);
      }
    };

    function durumYaz(v) {
      acicilar.forEach(function (b) { b.setAttribute('aria-expanded', v ? 'true' : 'false'); });
      kok.classList.toggle('rk-ia-acik', v);
    }
    function ac(neden, tetik) {
      if (acik) { if (h.acildi) { h.acildi(neden, true); } return; }
      acik = true;
      sonTetik = tetik || acicilar[0];
      olay(kok, 'pano_acma', sayildi ? { tekrar: true } : null);
      if (!sayildi) { olay(kok, 'etkilesim', { tur: 'acma' }); sayildi = true; }
      if (h.acildi) { h.acildi(neden, false); }
      durumYaz(true);
      if (mobil()) { sayfaAc(); } else { satirAc(); }
    }
    function satirAc() {
      clearTimeout(zaman);
      pano.hidden = false;
      if (!azHareket()) {
        var y = pano.scrollHeight;
        pano.style.height = '0px';
        pano.offsetHeight; // eslint-disable-line no-unused-expressions
        pano.classList.add('rk-ia-pano-gecis');
        pano.style.height = y + 'px';
        zaman = setTimeout(function () { if (acik) { pano.style.height = ''; } pano.classList.remove('rk-ia-pano-gecis'); R.yogunluk && R.yogunluk(); }, 320);
      } else if (R.yogunluk) { R.yogunluk(); }
      api.odakla(ic.querySelector('[data-ia-baslik]') || ic);
    }
    function satirKapat(sonra) {
      clearTimeout(zaman);
      if (azHareket()) { pano.hidden = true; pano.style.height = ''; sonra(); return; }
      pano.style.height = pano.offsetHeight + 'px';
      pano.offsetHeight; // eslint-disable-line no-unused-expressions
      pano.classList.add('rk-ia-pano-gecis');
      pano.style.height = '0px';
      zaman = setTimeout(function () { pano.hidden = true; pano.style.height = ''; pano.classList.remove('rk-ia-pano-gecis'); sonra(); }, 320);
    }
    function sayfaAc() {
      sayfa = document.createElement('dialog');
      sayfa.className = 'rk-foto-mobil rk-ia-sayfa ' + B.marka(k).renkSinif;
      sayfa.setAttribute('aria-label', (k.baslik || '') + ' · Sponsorlu');
      var kart = document.createElement('div');
      kart.className = 'rk-ia-sayfa-kart';
      kart.appendChild(ic);
      sayfa.appendChild(kart);
      document.body.appendChild(sayfa);
      /* Çekirdeğin "Örnek yerleşim" bildirimi (#keToast) modal pencerenin altında kalmasın: pencere açıkken onun içine taşınır */
      var tost = document.getElementById('keToast');
      if (tost) { tostYer = [tost, tost.parentNode, tost.nextSibling]; sayfa.appendChild(tost); }
      sayfa.addEventListener('cancel', function (e) { e.preventDefault(); kapat(true); });
      sayfa.addEventListener('click', function (e) { if (e.target === sayfa) { kapat(true); } });
      document.documentElement.classList.add('rk-sheet-lock');
      sayfa.showModal();
      requestAnimationFrame(function () { if (sayfa) { sayfa.classList.add('rk-ia-sayfa-acik'); } });
      api.odakla(ic.querySelector('[data-ia-baslik]') || ic);
    }
    function sayfaKapat(sonra) {
      var s = sayfa;
      sayfa = null;
      var bitir = function () {
        pano.appendChild(ic);
        tostGeri();
        if (s.open) { s.close(); }
        s.remove();
        if (!document.querySelector('dialog.rk-ia-sayfa')) { document.documentElement.classList.remove('rk-sheet-lock'); }
        sonra();
      };
      if (azHareket()) { bitir(); return; }
      s.classList.remove('rk-ia-sayfa-acik');
      s.classList.add('rk-ia-sayfa-kapaniyor');
      setTimeout(bitir, 220);
    }
    function kapat(odak) {
      if (!acik) { return; }
      acik = false;
      durumYaz(false);
      olay(kok, 'etkilesim', { tur: 'pano_kapatma' });
      var mobilKapanis = !!sayfa;
      if (odak && sonTetik && !mobilKapanis) { sonTetik.focus({ preventScroll: true }); }
      var bitti = function () {
        if (odak && sonTetik && mobilKapanis) { sonTetik.focus({ preventScroll: true }); }
        if (R.yogunluk) { R.yogunluk(); }
        if (h.kapandi) { h.kapandi(); }
      };
      if (sayfa) { sayfaKapat(bitti); } else { satirKapat(bitti); }
    }

    acicilar.forEach(function (b) { b.addEventListener('click', function () { if (acik) { kapat(false); } else { ac('serit', b); } }); });
    ic.querySelector('[data-ia-daralt]').addEventListener('click', function () { kapat(true); });
    var tus = function (e) {
      if (e.key !== 'Escape' || !acik || sayfa || e.defaultPrevented) { return; }
      if (document.querySelector('dialog[open]')) { return; }
      /* Odak birimin içindeyse açan düğmeye döner; dışarıdaysa olduğu yerde kalır */
      kapat(kok.contains(document.activeElement));
    };
    document.addEventListener('keydown', tus);
    var olcek = function () { if (acik && !!sayfa !== mobil()) { kapat(false); } };
    window.addEventListener('resize', olcek);
    /* Kreatif bağına tıklama (çağrı) */
    ic.addEventListener('click', function (e) {
      var a = e.target.closest('a[data-rk-bag]');
      if (a) { olay(kok, 'tiklama', { cta: (a.textContent || '').trim() }); }
    });
    kok.querySelector('.rk-ia-serit').addEventListener('click', function (e) {
      var a = e.target.closest('a[data-rk-bag]');
      if (a) { olay(kok, 'tiklama', { cta: (a.textContent || '').trim() }); }
    });

    /* Reklamı kapat: oturum boyunca gelmez; birim akıcı biçimde çekilir ve yer tutmaz (margin dahil) */
    kok.querySelector('[data-ia-kapat]').addEventListener('click', function () {
      try { sessionStorage.setItem(anahtar(kod), '1'); } catch (e) { /* depo kapalı */ }
      olay(kok, 'etkilesim', { tur: 'kapatma' });
      var sonraki = sonrakiOdak(dis);
      var bitir = function () {
        dis.hidden = true;
        dis.setAttribute('data-rk-kapatildi', '');
        dis.classList.remove('rk-ia-gidiyor');
        dis.style.height = ''; dis.style.marginTop = ''; dis.style.marginBottom = '';
        if (sonraki) { sonraki.focus({ preventScroll: true }); }
        if (R.yogunluk) { R.yogunluk(); }
      };
      var cek = function () {
        if (azHareket()) { bitir(); return; }
        dis.style.height = dis.offsetHeight + 'px';
        dis.offsetHeight; // eslint-disable-line no-unused-expressions
        dis.classList.add('rk-ia-gidiyor');
        dis.style.height = '0px'; dis.style.marginTop = '0px'; dis.style.marginBottom = '0px';
        setTimeout(bitir, 300);
      };
      if (acik) {
        acik = false; durumYaz(false);
        if (sayfa) { sayfaKapat(cek); } else { pano.hidden = true; pano.style.height = ''; cek(); }
      } else { cek(); }
    });

    if (o && o.temizle) {
      o.temizle(function () {
        document.removeEventListener('keydown', tus);
        window.removeEventListener('resize', olcek);
        clearTimeout(zaman);
        if (sayfa) { var s = sayfa; sayfa = null; tostGeri(); if (s.open) { s.close(); } s.remove(); document.documentElement.classList.remove('rk-sheet-lock'); }
      });
    }
    return api;
  }

  window.dgReklamIA = { kabuk: kabuk, bagla: bagla, bag: bag, url: url, ik: ik, kac: kac, mobil: mobil, azHareket: azHareket };
})();
