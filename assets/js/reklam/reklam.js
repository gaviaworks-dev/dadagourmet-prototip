/* Reklam çekirdeği (reklam-cekirdek, 11 Kas; önceki tur reklam-onizleme'nin anahtarı korunur; bilgi şeridi Beyar kararıyla kalktı).
   Durum `assets/js/prototip.js` "Reklam önizlemesi" bloğunda (window.dgReklam: localStorage `dg-reklam`, `?reklam=1|0`, olay `dg-reklam`).
   Bu betik başlıktaki ve çekmecedeki anahtarı bağlar; açıkken reklam varlıklarını yükler ve sayfadaki
   `<template data-rk-yer="KOD">` işaretlerini kayıtlı çizicilerle doldurur; kapanınca hepsini söker.
   Kapalıyken sayfaya tek düğüm eklenmez, tek sınıf yazılmaz, reklam dosyası yüklenmez (işaretler <template>: boyanmaz, yer tutmaz).
   Kurallar DadaGourmet-panel tasks/REKLAM-YERLESIM.md'den (veri: _src/veri/reklam-yerlesim.json): sayfa bütçesi ve öncelik (FEED tek
   birim), farklı marka tavanı 3, native listenin üstünde + her N satırda + altında (aynı reklam tekrarlanmaz), 767 px altında reklam
   yüksekliği içeriğin %30'unu geçmez (sondan başa gizlenir), yapışkan sınırı 1 (side çifti ya da alt bar), pop-up ilk sayfada yok.
   Kreatif bağları: iç hedef prototipte gezer; hedefsiz bağ markanın resmi sitesini yeni sekmede açar (bilesen.js B.bag, reklam-duzeltici).
   Gösterim ya da tıklama sayılmaz, istek gitmez.
   Sözleşme (AŞAMA 2): assets/js/reklam/README.md. */
(function () {
  'use strict';
  var R = window.dgReklam;
  if (!R) { return; }
  var kok = document.documentElement, yol = kok.dataset.yol || '';
  var KOK = kok.dataset.kok || './';
  var anahtarlar = [].slice.call(document.querySelectorAll('input[data-rk-anahtar]'));
  var acik = false, kusak = 0, sokulecek = [], gozculer = [], dinleyici = [], zamanlar = [];
  var CIZ = {};
  var durum = { acik: false, sayfa: null, butce: 0, basilan: [], markalar: [], dusen: [], gizlenen: [], yapiskan: null };

  function senkron(on) { anahtarlar.forEach(function (i) { i.checked = on; }); }
  anahtarlar.forEach(function (i) { i.addEventListener('change', function () { R.ayarla(i.checked); }); });
  var dinle = function (h, t, f, o) { h.addEventListener(t, f, o); dinleyici.push([h, t, f, o]); };
  var sonra = function (f, ms) { var z = setTimeout(f, ms); zamanlar.push(z); return z; };
  var depoOku = function (a) { try { return localStorage.getItem(a); } catch (e) { return null; } };
  var depoYaz = function (a, v) { try { localStorage.setItem(a, v); } catch (e) { /* depo kapalı */ } };
  var oturumOku = function (a) { try { return sessionStorage.getItem(a); } catch (e) { return null; } };
  var oturumYaz = function (a, v) { try { sessionStorage.setItem(a, v); } catch (e) { /* depo kapalı */ } };

  /* ── Genel API (AŞAMA 2 sözleşmesi) ─────────────────────────────────── */
  R.ciz = function (kod, fn) { CIZ[kod] = fn; };
  R.veri = function () { return window.DG_REKLAM_VERI || null; };
  R.kreatif = function (kod) { return R.veri() ? alan(kod, sayfaBul()) : null; };
  R.durum = function () { return durum; };
  R.yenile = function () { if (acik && window.DG_REKLAM_VERI) { sok(false); yerlestir(); } };
  R.yogunluk = function () { yogunlukSonra(); };
  /* reklam-interaktif (11 Kas): kreatif içi araç (kreatifin `arac` alanı; assets/js/reklam/interaktif/<arac>.js) ya da null.
     Sayfa çizicisi (R.ciz) interaktif varyantı taşıyan bir havuzda bunu sorup aracın `ciz`ini kullanır (örnek: sayfa/mekanlar.js ML-T1) */
  R.arac = function (k) { var A = window.dgReklamArac; return k && k.arac && A && A[k.arac] && A[k.arac].ciz ? A[k.arac] : null; };

  /* ── Rakip restoran yok (reklam-son-duzelt, Beyar kararı 11 Kas): sayfa satırında `rakipRestoranYok` varsa (mekân detayı) restoran
     kreatifi basılmaz. Restoran kreatifi: markası restoran (`reklam-markalar.json` `restoran: true`; çok markalı birimde `markalar`ın
     herhangi biri) ya da bir mekânı hedefliyor (`mekan`). Kreatifte `restoran: true|false` açıkça verilirse o geçer. Süzgeç tek yerde:
     alan havuzu (yerleştirme, rotasyon), standart katman (yan, alt bar, pop-up), araç yüklemesi ve `R.kreatif` aynı `alan()`ı kullanır.
     Süzülen havuz boşsa alan düşer (`durum().dusen`: "rakip restoran yok"). Kural REKLAM-YERLESIM'de yok: README "Beyar kararı" ── */
  function restoranMi(x) {
    if (typeof x.restoran === 'boolean') { return x.restoran; }
    var M = window.DG_REKLAM_VERI.markalar;
    return !!x.mekan || [x.marka].concat(x.markalar || []).some(function (m) { return !!(M[m] && M[m].restoran); });
  }
  function alan(kod, s) {
    var k = window.DG_REKLAM_VERI.alanlar[kod];
    if (!k || !s || !s.rakipRestoranYok) { return k || null; }
    if (!Array.isArray(k)) { return restoranMi(k) ? null : k; }
    var h = k.filter(function (x) { return !restoranMi(x); });
    return h.length ? h : null;
  }

  /* ── Varlık yükleme (yalnız ilk açılışta) ── */
  var sozler = {};
  function betik(ad) {
    if (sozler[ad]) { return sozler[ad]; }
    sozler[ad] = new Promise(function (tamam) {
      var s = document.createElement('script');
      s.src = KOK + 'assets/js/reklam/' + ad + '.js';
      s.onload = s.onerror = function () { tamam(); };
      document.body.appendChild(s);
    });
    return sozler[ad];
  }
  function stil(ad) {
    if (sozler[ad]) { return sozler[ad]; }
    sozler[ad] = new Promise(function (tamam) {
      var l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = KOK + 'assets/css/reklam/' + ad + '.css';
      l.setAttribute('data-rk-stil', '');
      l.onload = l.onerror = function () { tamam(); };
      document.head.appendChild(l);
    });
    return sozler[ad];
  }
  /* Kanon stil zinciri: tokenlar → reklam → standart; Gourmet uyarlamaları (assets/css/reklam.css) kabukta zaten yüklü ama kanondan
     SONRA uygulanmalı: kanon bağları reklam.css bağından önce konur */
  /* reklam-son-duzelt (11 Kas): belirteç köprüsü (`gourmet-tokenlar.css`, panel kopyası, `:root`ta --header-offset 112px, --sp-*, --font…)
     yalnız sayfada TANIMSIZ adları doldurmalı. Sayfa CSS'inden sonra bağlanınca sayfanın kendi değerini eziyordu: Mikla'da `.below-header`
     üst boşluğu (`var(--header-offset)`, prototip.css'te `--kabuk-h`) 390'da 63 → 112 px, 1440'ta 113 → 112 px; reklam açıkken hero
     49 px uzuyor, canlı kapatınca da (bağ yüklü kaldığı için) öyle kalıyordu. Köprü <head>'in BAŞINA konur (sayfa belirteçleri kazanır);
     kanon reklam.css ve standart.css eskisi gibi Gourmet uyarlamasından (assets/css/reklam.css) önce */
  function yukle() {
    var ilk = document.querySelector('link[href*="assets/css/reklam.css"]');
    ['gourmet-tokenlar', 'reklam', 'standart'].forEach(function (ad) { stil(ad); });
    var linkler = [].slice.call(document.querySelectorAll('link[data-rk-stil]'));
    if (ilk) { linkler.forEach(function (l) { ilk.parentNode.insertBefore(l, ilk); }); }
    var kopru = document.querySelector('link[data-rk-stil][href*="reklam/gourmet-tokenlar.css"]'), bas = document.head.querySelector('link[rel="stylesheet"], style');
    if (kopru && bas && bas !== kopru) { document.head.insertBefore(kopru, bas); }
    return Promise.all([betik('veri'), sozler['gourmet-tokenlar'], sozler.reklam, sozler.standart]).then(function () {
      if (!window.DG_REKLAM_VERI) { return; }
      if (!document.getElementById('rkRenk')) {
        var st = document.createElement('style');
        st.id = 'rkRenk';
        st.textContent = window.DG_REKLAM_VERI.renkCss;
        document.head.appendChild(st);
      }
      return betik('bilesen');
    }).then(function () {
      var s = sayfaBul();
      return Promise.all([betik('interaktif'), betik('nokta'), s && s.betik ? betik('sayfa/' + s.betik) : null, araclar(s)]);
    });
  }
  /* reklam-interaktif (11 Kas): sayfadaki işaretlerin kreatiflerinde (havuz dahil) `arac` varsa ortak kabuk + araç betikleri ve ek stil
     (assets/css/reklam/ek/interaktif.css; kanon dosyalarına dokunmaz) yüklenir. Araçsız sayfada hiçbiri yüklenmez */
  function araclar(s) {
    var adlar = [];
    if (!s) { return null; }
    [].slice.call(document.querySelectorAll('template[data-rk-yer]')).forEach(function (t) {
      [].concat(alan(t.dataset.rkYer, s) || []).forEach(function (k) { if (k.arac && adlar.indexOf(k.arac) < 0) { adlar.push(k.arac); } });
    });
    if (!adlar.length) { return null; }
    return Promise.all([stil('ek/interaktif'), betik('interaktif/ortak')]).then(function () {
      return Promise.all(adlar.map(function (a) { return betik('interaktif/' + a); }));
    });
  }

  function sayfaBul() {
    var V = window.DG_REKLAM_VERI;
    if (!V) { return null; }
    for (var i = 0; i < V.sayfalar.length; i++) { if (new RegExp(V.sayfalar[i].yol).test(yol)) { return V.sayfalar[i]; } }
    return null;
  }

  var dugum = function (html) {
    if (html && html.nodeType) { return html; }
    var t = document.createElement('template'); t.innerHTML = String(html || '').trim(); return t.content.firstElementChild;
  };
  function birim(el, kod) { el.setAttribute('data-rk-birim', kod); sokulecek.push(el); return el; }

  /* Varsayılan çiziciler: kreatifin biçimine göre bileşen kütüphanesi (bilesen.js) */
  function varsayilan(k) {
    var B = window.dgReklamBilesen, A = R.arac(k);
    if (A) { return A.ciz; }
    return B && k && B[k.bicim] ? B[k.bicim] : null;
  }

  /* Bir işaretin yerine birimi koyar. İşaret <template> olarak yerinde kalır (kapat/aç döngüsünde yeniden kullanılır) */
  function isaretiDoldur(t, kod, havuz, s) {
    if (t.dataset.rkListe) { liste(t, kod, havuz); return; }
    var k = havuz[0], fn = CIZ[kod] || varsayilan(k);
    if (!fn) { return; }
    var o = { kod: kod, isaret: t, sayfa: s, temizle: function (f) { sokulecek.push(f); } };
    var el = dugum(fn(k, o));
    if (!el) { return; }
    if (t.hasAttribute('data-rk-sar')) {
      var sar = document.createElement('div');
      sar.className = 'wrap rk-sar';
      sar.setAttribute('data-rk-yer', kod);
      sar.appendChild(el);
      el = sar;
    }
    birim(el, kod);
    /* reklam-yapiskan: kreatifin markası birimde (çizici logosunu geç basabilir); yapışkan seçimi bunu hariç tutar */
    el.setAttribute('data-rk-govde-marka', [k.marka].concat(k.markalar || []).filter(Boolean).join(' '));
    t.before(el);
    /* Hero sponsorluğu: rozetin bulunduğu hero'ya marka perdesi (hero'nun ilk çocuğu) */
    if (k.bicim === 'eslik') {
      var hero = t.closest('.below-header, [data-rk-hero-kap]');
      var B = window.dgReklamBilesen;
      if (hero && B) { var p = dugum(B.heroPerde(k)); hero.insertBefore(p, hero.firstChild); sokulecek.push(p); hero.classList.add('rk-hero'); sokulecek.push(function () { hero.classList.remove('rk-hero'); }); }
    }
    if (k.bicim === 'interaktif' && window.dgReklamInteraktif) { window.dgReklamInteraktif(el); }
    if (R.arac(k) && R.arac(k).kur) { R.arac(k).kur(el, k, o); }
    if (k.bicim === 'nokta' && window.dgReklamNokta) { window.dgReklamNokta.kur(el); }
  }

  /* ── Native liste (FEED): organik kartların arasına ara öğe; en üst, her N satırda bir (N × sütun kart), en alt. Organik sıra,
     sayı ve sayfalama değişmez; aynı reklam listede tekrarlanmaz (havuz bitince kalan yerler boş). Liste yeniden çizilince
     (süzgeç, sayfa, görünüm) yeniden yerleşir: yalnız yabancı değişiklik gözcüyü tetikler. YerlesimKurali::yerler birebir ── */
  /* reklam-duzeltici (11 Kas; REKLAM-YERLESIM "Native liste yeri", "Tekrar kuralı"):
     - G1: sayfada görünür bir liste üstü şerit (*-T1, ML-T1 interaktif dahil) varsa en üst native ilk satırın SONUNA kayar (gerçek sütun
       sayısı ızgaradan okunur; tek sütunda ilk organik karttan sonra). Tam satır kaplayan native (noktalı görsel) satır sınırına oturur.
     - Tekrar: organik kartın kaydı (`data-slug` / `data-kayit`) kreatifin kaydıyla (`kayit` ya da `mekan`) aynıysa o kreatif basılmaz,
       sıradaki havuz öğesine geçilir.
     - Kısa liste: en alt yer yalnız bir önceki yerden en az bir tam satır (sütun sayısı kadar organik) sonra; native sayısı organik kart
       sayısını geçmez.
     - Liste kökü: `data-rk-liste-kok` verilirse liste kabı her çizimde kökün içinde `data-rk-liste` seçicisiyle yeniden bulunur (Mekân Bul:
       sonuç grupları her aramada yeniden basılır); gözcü kökü alt ağacıyla izler. */
  var listeler = [];
  /* Liste yeniden yerleşince (Mekân Bul sonuçları sihirbazdan sonra gelir) yapışkanın markası yeniden seçilir: akıştaki markalar değişti */
  var stdKur = null, stdKare = 0;
  var stdSonra = function () { if (stdKur && !stdKare) { stdKare = requestAnimationFrame(function () { stdKare = 0; if (stdKur) { stdKur(); } }); } };
  function kolonSay(kap, yedek) {
    var s = getComputedStyle(kap);
    var n = kap.getClientRects().length && /grid/.test(s.display) ? s.gridTemplateColumns.split(' ').filter(function (x) { return x && x !== 'none'; }).length : 0;
    return n || yedek;
  }
  function ustSerit() {
    return [].some.call(document.querySelectorAll('[data-rk-birim]'), function (e) {
      /* Kabın kendisi gizliyse (Mekân Bul sonuç bölümü sihirbazda gizli) şerit yine basılı sayılır; şeridin kendisi gizli ya da kapatılmışsa değil */
      var ic = e.classList.contains('rk-sar') ? e.firstElementChild : e;
      return /-T1$/.test(e.getAttribute('data-rk-birim')) && !e.hidden && !(ic && ic.hidden) && !e.hasAttribute('data-rk-kapatildi') && !(ic && ic.hasAttribute('data-rk-kapatildi'));
    });
  }
  var kayitKimligi = function (x) { return x && (x.kayit || x.mekan) || null; };
  function liste(t, kod, havuz) {
    var V = window.DG_REKLAM_VERI, kok0 = t.dataset.rkListeKok ? document.querySelector(t.dataset.rkListeKok) : null;
    var bul = function () { return (kok0 || document).querySelector(t.dataset.rkListe); };
    if (!kok0 && !bul()) { return; }
    var sutun = +(t.dataset.rkSutun || V.kurallar.sutun), N = +(t.dataset.rkSatir || V.kurallar.nativeSatir);
    var fn = CIZ[kod] || window.dgReklamBilesen.native;
    var bizim = function (d) { return d.nodeType === 1 && d.hasAttribute('data-rk-birim'); };
    var sok1 = function () { [].slice.call((kok0 || bul() || document).querySelectorAll('[data-rk-birim="' + kod + '"]')).forEach(function (e) { e.remove(); }); };
    var sonKolon = 0;
    var tamSatir = function (e, kap, kolon) { return kolon > 1 && e.getBoundingClientRect().width > kap.clientWidth * 0.9; };
    var duzen = function () {
      sok1();
      var kap = bul();
      if (!kap) { return; }
      var org = [].slice.call(kap.children).filter(function (c) { return c.tagName !== 'TEMPLATE' && !bizim(c); });
      var n = org.length, kolon = sonKolon = kolonSay(kap, sutun);
      if (!n) { yogunlukSonra(); return; }
      var adim = N * sutun, yer = [0];
      for (var i = adim; i < n; i += adim) { yer.push(i); }
      if (n - yer[yer.length - 1] >= sutun) { yer.push(n); }
      if (ustSerit()) { yer[0] = Math.min(n, Math.max(1, kolon - 1)); }
      yer = yer.filter(function (y, j, d) { return d.indexOf(y) === j; }).sort(function (a, b) { return a - b; });
      var orgKayit = org.map(function (c) { return c.getAttribute('data-kayit') || c.getAttribute('data-slug'); }).filter(Boolean);
      var uygun = havuz.filter(function (x) { var k = kayitKimligi(x); return !k || orgKayit.indexOf(k) < 0; });
      var not = kod + ': tekrar kuralı (' + (havuz.length - uygun.length) + ' kreatif organikte var)';
      if (uygun.length < havuz.length && durum.dusen.indexOf(not) < 0) { durum.dusen.push(not); }
      /* reklam-marka (11 Kas): tekrar kuralıyla düşen kreatif `organikEk` taşıyorsa ve sayfa çizicisi `KOD:organik` kayıtlıysa sponsorluk
         organik kartın İÇİNE ince şerit olarak eklenir (Etkinlikler: "Biletler Biletix ile" bilet sponsoru). Kayıt yine bir kez görünür;
         organik sıra, sayı ve kart gövdesi değişmez. Şerit `data-rk-birim` + `data-rk-organik-ek` taşır, kapanınca ve her yerleşimde söker */
      var ekFn = CIZ[kod + ':organik'];
      if (ekFn) {
        havuz.forEach(function (x) {
          var kid = kayitKimligi(x);
          if (!x.organikEk || !kid) { return; }
          var kart = org.filter(function (c) { return (c.getAttribute('data-kayit') || c.getAttribute('data-slug')) === kid; })[0];
          var el = kart && ekFn(x, { kod: kod, isaret: t, kart: kart, liste: kap });
          if (el) { el.setAttribute('data-rk-birim', kod); el.setAttribute('data-rk-organik-ek', ''); }
        });
      }
      yer.slice(0, Math.min(uygun.length, n)).forEach(function (y, i) {
        var el = dugum(fn(uygun[i], { kod: kod, isaret: t, sira: y, liste: kap }));
        if (!el) { return; }
        el.setAttribute('data-rk-birim', kod);
        el.setAttribute('data-rk-liste-yer', y);
        if (y === 0) { org[0].before(el); } else { org[y - 1].after(el); }
      });
      hizala(kap, kolon);
      stdSonra();
      yogunlukSonra();
    };
    /* Tam satır native satır sınırına: önündeki kart sayısı sütun sayısının katı değilse kat olana dek sonraki organiklerin ardına.
       Ek stil (tam satır kuralı) çizimden sonra yüklenebilir: kap boyu değişince (ResizeObserver) yeniden bakılır */
    var hizala = function (kap, kolon) {
      [].slice.call(kap.children).filter(bizim).forEach(function (el) {
        if (!tamSatir(el, kap, kolon)) { return; }
        var poz = 0;
        for (var s = el.previousElementSibling; s; s = s.previousElementSibling) {
          if (s.tagName === 'TEMPLATE' || !s.getClientRects().length) { continue; }
          if (tamSatir(s, kap, kolon)) { break; }
          poz++;
        }
        var eksik = poz % kolon ? kolon - poz % kolon : 0, son = el;
        for (var j = el.nextElementSibling; j && eksik > 0; j = j.nextElementSibling) { if (!bizim(j) && j.tagName !== 'TEMPLATE') { son = j; eksik--; } }
        if (son !== el) { son.after(el); }
      });
    };
    var yabanci = function (d) { return d.nodeType === 1 ? !d.hasAttribute('data-rk-birim') : d.nodeType === 3 && d.textContent.trim() !== ''; };
    var g = new MutationObserver(function (kayit) {
      var kap = bul();
      if (kayit.some(function (r) { return (!kok0 || r.target === kok0 || r.target === kap) && ([].some.call(r.addedNodes, yabanci) || [].some.call(r.removedNodes, yabanci)); })) { duzen(); }
    });
    g.observe(kok0 || bul(), { childList: true, subtree: !!kok0 });
    gozculer.push(g);
    duzen();
    var kayit = { duzen: duzen, kolon: function () { var kap = bul(); return kap ? kolonSay(kap, sutun) : sonKolon; }, son: function () { return sonKolon; } };
    listeler.push(kayit);
    /* Kap görünür olunca ya da kırılımda sütun sayısı değişince yeniden kur (gizliyken ölçülen sütun sayısı yedek değerdir) */
    var ro = 'ResizeObserver' in window ? new ResizeObserver(function () { if (kayit.kolon() !== sonKolon) { duzen(); } else { var kap = bul(); if (kap) { hizala(kap, sonKolon); } } }) : null;
    if (ro) { ro.observe(kok0 || bul()); }
    sokulecek.push(function () { if (ro) { ro.disconnect(); } sok1(); listeler.splice(listeler.indexOf(kayit), 1); });
  }

  /* ── Yerleştirme: öncelik → bütçe → marka tavanı ── */
  function yerlestir() {
    var V = window.DG_REKLAM_VERI, s = sayfaBul();
    durum = { acik: true, sayfa: s ? s.ad : null, butce: s ? s.butce : 0, basilan: [], markalar: [], dusen: [], gizlenen: [], yapiskan: null };
    var isaretler = [].slice.call(document.querySelectorAll('template[data-rk-yer]'));
    if (!s) { bildir(); return; }
    var kodlar = [];
    isaretler.forEach(function (t) { var kod = t.dataset.rkYer; if (kodlar.indexOf(kod) < 0) { kodlar.push(kod); } });
    var sira = s.oncelik && s.oncelik.length ? s.oncelik.filter(function (k) { return kodlar.indexOf(k) >= 0; }) : kodlar;
    kodlar.forEach(function (k) { if (sira.indexOf(k) < 0) { durum.dusen.push(k + ': öncelik listesinde yok'); } });
    var tavan = V.kurallar.markaTavani, markalar = durum.markalar;
    var sigar = function (x) { if (markalar.indexOf(x.marka) >= 0) { return true; } if (markalar.length < tavan) { markalar.push(x.marka); return true; } return false; };
    /* reklam-duzeltici (11 Kas): (1) aynı görünüm grubu (`ardArda`, sayfa satırı): gruptaki kodlardan yalnız önceliği yüksek olan basılır
       (Mekân Bul: MB-FILTER ile MB-T1 ilk sonuçtan önce art arda düşer; G1'in genellemesi). (2) Aynı kayıt bir kez: liste dışı alanlarda
       basılan kreatifin kaydı (`kayit` / `mekan`) sayfadaki başka alanda tekrar basılmaz (havuzda sıradakine geçilir, tek kreatifse alan düşer;
       Mikla: MD-INT tadım menüsü Maromi'yi bastıysa MD-END Maromi düşer). (3) Rotasyon sayfada henüz basılmamış markayı önceler */
    var gruplar = s.ardArda || [], kayitlar = [], basilanMarka = [];
    var serbest = function (x) { var i = kayitKimligi(x); return !i || kayitlar.indexOf(i) < 0; };
    sira.forEach(function (kod) {
      var k = alan(kod, s);
      if (!k) { durum.dusen.push(kod + (V.alanlar[kod] ? ': rakip restoran yok (rakipRestoranYok)' : ': kreatif yok')); return; }
      if (durum.basilan.length >= s.butce) { durum.dusen.push(kod + ': sayfa bütçesi'); return; }
      if (gruplar.some(function (g) { return g.indexOf(kod) >= 0 && g.some(function (c) { return c !== kod && durum.basilan.indexOf(c) >= 0; }); })) { durum.dusen.push(kod + ': aynı görünümde art arda (ardArda)'); return; }
      var listeMi = isaretler.some(function (t) { return t.dataset.rkYer === kod && t.dataset.rkListe; });
      var adaylar = listeMi ? [].concat(k) : [].concat(k).filter(serbest);
      if (!adaylar.length) { durum.dusen.push(kod + ': aynı kayıt sayfada basılı'); return; }
      var havuz = Array.isArray(k) && !listeMi ? rotasyon(kod, k, sigar, serbest, basilanMarka) : adaylar.filter(sigar);
      if (!havuz.length) { durum.dusen.push(kod + ': marka tavanı'); return; }
      durum.basilan.push(kod);
      havuz.forEach(function (x) { if (!listeMi && kayitKimligi(x)) { kayitlar.push(kayitKimligi(x)); } if (!listeMi && basilanMarka.indexOf(x.marka) < 0) { basilanMarka.push(x.marka); } });
      isaretler.filter(function (t) { return t.dataset.rkYer === kod; }).forEach(function (t) { isaretiDoldur(t, kod, havuz, s); });
    });
    /* G1: liste üstü şerit listeden SONRA basıldığı için (öncelik: FEED önce) native yerleri şeritler yerleşince yeniden kurulur */
    listeler.forEach(function (l) { l.duzen(); });
    if (s.standart) { standart(s); }
    yogunlukSonra();
    bildir();
  }
  /* ── Havuz rotasyonu (reklam-interaktif, 11 Kas; REKLAM-YERLESIM "Rotasyon"): liste DIŞI bir alanın kreatifi dizi (havuz) ise
     tek kreatif basılır. Seçim: önizleme seçimi `?rk-kreatif=<id>[,<id>]` (REKLAM-YERLESIM "Hedefleme: önizleme seçimi") → yoksa
     her sayfa açılışında sıradaki (oturum sayacı `dg-rk-rot-<kod>`; canlıda gösterim payına göre ağırlıklı rastgele, RezervasyonSecimi).
     Seçim sayfa ömrü boyunca sabittir (anahtar aç/kapa ve yenile aynı kreatifi basar). Marka tavanına sığmayan atlanır; marka tavanına
     yalnız basılan kreatifin markası yazılır ── */
  var rotSecim = {};
  /* reklam-marka (11 Kas): gösterim payı (kreatif `pay`, %25–100, yoksa 100; REKLAM-YERLESIM "Rotasyon"). Oturum sayacı pürüzsüz ağırlıklı
     sıraya çevrilir (smooth weighted round-robin): ilk açılış en yüksek paylı kreatif (ana marka), payı 25 olan 100'lük bir kreatifin
     yanında beş açılışta bir. Paylar eşitse sıra eskisi gibi düz döner */
  function payliSira(havuz, say) {
    var w = havuz.map(function (x) { return Math.max(1, Math.round(+x.pay || 100)); });
    var ebob = function (a, b) { return b ? ebob(b, a % b) : a; }, g = w.reduce(ebob);
    w = w.map(function (v) { return v / g; });
    var top = w.reduce(function (a, b) { return a + b; }, 0), c = w.map(function () { return 0; }), sec = 0;
    for (var s = 0; s <= say % top; s++) {
      sec = 0;
      for (var j = 0; j < w.length; j++) { c[j] += w[j]; if (c[j] > c[sec]) { sec = j; } }
      c[sec] -= top;
    }
    return sec;
  }
  function rotasyon(kod, havuz, sigar, serbest, basilanMarka) {
    var n = havuz.length, bas = rotSecim[kod];
    if (bas == null) {
      var iste = (new URLSearchParams(location.search).get('rk-kreatif') || '').split(','), i = -1;
      havuz.forEach(function (x, j) { if (x.id && iste.indexOf(x.id) >= 0) { i = j; } });
      if (i < 0) { var a = 'dg-rk-rot-' + kod, say = +oturumOku(a) || 0; i = payliSira(havuz, say); oturumYaz(a, String(say + 1)); }
      bas = rotSecim[kod] = i;
    }
    /* Çok markalı kreatif (`markalar`: sponsorlu sonuç birimi) tavana bütün markalarıyla sığmalı */
    var M = durum.markalar, tavan = window.DG_REKLAM_VERI.kurallar.markaTavani;
    /* reklam-duzeltici: önce sayfada basılmamış marka ve kayıt (1. tur), yoksa yalnız basılmamış kayıt (2. tur) */
    for (var tur = 0; tur < 2; tur++) {
      for (var j = 0; j < n; j++) {
        var x = havuz[(bas + j) % n], ek = [].concat(x.markalar || []).filter(function (m, i, d) { return m !== x.marka && M.indexOf(m) < 0 && d.indexOf(m) === i; });
        if (serbest && !serbest(x)) { continue; }
        if (tur === 0 && basilanMarka && basilanMarka.indexOf(x.marka) >= 0) { continue; }
        if (M.length + ek.length + (M.indexOf(x.marka) < 0 ? 1 : 0) > tavan) { continue; }
        if (sigar(x)) { ek.forEach(function (m) { M.push(m); }); return [x]; }
      }
    }
    return [];
  }
  function bildir() { document.dispatchEvent(new CustomEvent('dg-reklam-degisti', { detail: { acik: acik, durum: durum } })); }

  /* ── Mobil yoğunluk (SunumKurallari yogunluk.mobil_yuzde; panel reklam.js "%30 YOĞUNLUK" bloğu): 767 px ve altında görünür reklam
     birimlerinin toplam yüksekliği içeriğin yüzdesini geçerse sondan başa birim gizlenir (`data-rk-yogunluk-gizli`, kanon kuralı).
     Pop-up sayılmaz ── */
  var yKare = 0;
  function yogunlukSonra() { if (!yKare) { yKare = requestAnimationFrame(function () { yKare = 0; yogunluk(); }); } }
  function yogunluk() {
    var V = window.DG_REKLAM_VERI;
    if (!acik || !V) { return; }
    var gizli = [].slice.call(document.querySelectorAll('[data-rk-yogunluk-gizli]'));
    gizli.forEach(function (n) { n.removeAttribute('data-rk-yogunluk-gizli'); });
    durum.gizlenen = [];
    if (!window.matchMedia('(max-width: ' + V.kurallar.mobilEsik + 'px)').matches) { return; }
    var ana = document.getElementById('pageMain') || document.querySelector('main') || document.body;
    var gorunur = function (n) { return n.checkVisibility ? n.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }) : n.offsetHeight > 0; };
    var birimler = [].slice.call(document.querySelectorAll('[data-rk-birim]')).filter(function (n) {
      return !n.parentElement.closest('[data-rk-birim]') && !n.querySelector('[data-rk-bicim="popup"]') && n.getAttribute('data-rk-bicim') !== 'popup' && gorunur(n);
    });
    var yuk = function (n) { return n.getBoundingClientRect().height; };
    var toplam = birimler.reduce(function (t, n) { return t + yuk(n); }, 0), sinir = ana.scrollHeight * V.kurallar.mobilYuzde / 100;
    for (var i = birimler.length - 1; i >= 0 && toplam > sinir; i--) {
      toplam -= yuk(birimler[i]);
      birimler[i].setAttribute('data-rk-yogunluk-gizli', '');
      durum.gizlenen.push(birimler[i].getAttribute('data-rk-birim'));
    }
  }

  /* ── Standart katman (bütçe dışı; REKLAM-YERLESIM "Standart katmanın uygulandığı yollar"): yapışkan side çifti (Gastro geometrisi, aşağıda reklam-yapiskan; hero ve
     altbilgide görünmez) ya da alt bar; sayfada en çok bir yapışkan. Pop-up ilk sayfada yok, oturumda bir, 10 dakikada bir.
     Kreatif, sayfada zaten görünen markadan seçilir (marka tavanı korunur). Kapatılan yapışkan 24 saat görünmez ── */
  /* reklam-yapiskan (12 Kas, lider): yapışkan (STD-SIDE, STD-SIDE-LEFT, STD-ALTBAR, STD-POPUP) sayfadaki gövde birimlerinin (hero dahil)
     markasını ASLA tekrar etmez; iki yan da birbirinden farklı. Aday sırası: kendi havuzu + aynı biçimin öbür havuzu (yanlar), önce ana
     markalar sonra benzer markalar; restoran ve alkol süzgeci `alan()`dan. Uygun aday yoksa o yapışkan basılmaz (yalnız öbür yan kalabilir).
     Yapışkan marka tavanına (3) bağlı değil: tekrar yasağı tavandan önce gelir. Gövde geç basılırsa `stdSonra` seçimi yeniler. */
  function govdeMarkalari() {
    var m = [];
    [].forEach.call(document.querySelectorAll('[data-rk-birim]'), function (e) {
      if (/^STD-/.test(e.getAttribute('data-rk-birim')) || e.closest('.rk-std, [data-rk-side-pair]')) { return; }
      var ek = (e.getAttribute('data-rk-govde-marka') || '').split(' ');
      [e].concat([].slice.call(e.querySelectorAll('[data-rk-marka]'))).map(function (x) { return x.getAttribute('data-rk-marka'); }).concat(ek).forEach(function (k) { if (k && m.indexOf(k) < 0) { m.push(k); } });
    });
    return m;
  }
  function secStd(kod, haric) {
    var V = window.DG_REKLAM_VERI, s = sayfaBul(), es = { 'STD-SIDE': 'STD-SIDE-LEFT', 'STD-SIDE-LEFT': 'STD-SIDE' }[kod];
    var yasak = govdeMarkalari().concat([].concat(haric || []));
    var h = [].concat(alan(kod, s) || [], es ? alan(es, s) || [] : []).filter(function (x) { return yasak.indexOf(x.marka) < 0; });
    var ana = function (x) { var m = V.markalar[x.marka]; return m && m.grup === 'ana' ? 0 : 1; };
    var sira = h.map(function (x, i) { return { x: x, i: i, a: ana(x) }; }).sort(function (a, c) { return a.a - c.a || a.i - c.i; });
    return sira.length ? sira[0].x : null;
  }
  var kapaliMi = function (kod) { var t = +depoOku('dg-rk-kapali-' + kod) || 0; return Date.now() - t < window.DG_REKLAM_VERI.kurallar.kapatmaSaat * 3600 * 1000; };
  var kapatKaydet = function (kod) { depoYaz('dg-rk-kapali-' + kod, String(Date.now())); };
  var stdKatman = [];
  function standart(s) {
    var V = window.DG_REKLAM_VERI, B = window.dgReklamBilesen;
    /* ==== reklam-yapiskan (12 Kas) · yan ve alt yapışkan, Gastro `public/reklam/standart.js` birebir ====
       Yan (sidePairGeometry + sideLayout): 1280 altında yok; 1366 üstünde iki taraf, arada yalnız sağ; 120 px, ekran kenarından 8 px;
       üst = başlık altı + 24; yükseklik = başlık altındaki alanda ortalanmış 600'lük kutunun altına kadar (360 altında yok).
       Görünürlük kapısı (sideContentVisible): hero varken sayfanın en üstünde yok, hero (ya da üstüne binen sonraki bölüm) başlık
       çizgisinin altına inince çıkar, altbilgi ekrana girince çekilir. Gourmet farkı (Beyar 12 Kas, REKLAM-YERLESIM "içerikle arasında
       pay"): yan, içerik kolonunun iç kenarına `sideIcerikPay` (4 px, Gastro'nun 1440'taki kendi payı) kadar yaklaşamıyorsa basılmaz
       (Gastro 1280-1439'da içeriğin üstüne biniyordu); alt köşedeki yüzen düğmelerin (Route, başa dön, Mentör) 12 px üstünde biter.
       "Görüş Bildir" sekmesiyle kesişme Gastro ve Diet'teki gibi kabul (kart üstte, kanon z 73 > 72).
       Alt bar (alignAltbar): başlık kolonunun iç kenarları (`header .h-top .wrap`), alt çubuk varsa onun 12 px üstü, yoksa 12 px;
       ölçü kanon `standart.css` (masaüstü 80, ≤600 64 px, 12 px kenar). Kapatma 24 saat (StandartSiklik `sunum_kapatma`, en az 24). */
    var K = V.kurallar;
    var kolon = function () {
      var L = Infinity, R = 0;
      [].forEach.call(document.querySelectorAll('main .wrap, main .kap, main > .container'), function (n) {
        var r = n.getBoundingClientRect(), s = getComputedStyle(n);
        if (r.width > 600) { L = Math.min(L, r.left + parseFloat(s.paddingLeft || 0)); R = Math.max(R, r.right - parseFloat(s.paddingRight || 0)); }
      });
      return R ? { L: L, R: R } : null;
    };
    /* Yan yer: yatay (Gastro sideLayout + içerik payı). null = yan basılmaz, alt bar adayı */
    var yanYer = function () {
      var W = document.documentElement.clientWidth, k = kolon();
      if (W < K.sideEsik || !k) { return null; }
      var gen = K.sideGenislik, ic = K.sideKenar, n = W > K.sideIkiTaraf ? 2 : 1;
      var pay = Math.min(W - ic - gen - k.R, n === 2 ? k.L - ic - gen : Infinity);
      return pay >= K.sideIcerikPay ? { n: n, pay: Math.round(pay), gen: gen, ic: ic } : null;
    };
    var genis = function () { return !!yanYer(); };
    /* Gastro cookieBannerVisible: çerez bandı görünürken yapışkan yok; bant kapanınca (sınıf/hidden/stil değişimi) yeniden bakılır */
    var CEREZ = '#cookieBanner, .cookie-banner';
    var cerezVar = function () {
      return [].some.call(document.querySelectorAll(CEREZ), function (n) { var r = n.getBoundingClientRect(), st = getComputedStyle(n); return !n.hidden && st.display !== 'none' && st.visibility !== 'hidden' && +st.opacity > 0 && r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < window.innerHeight; });
    };
    var cerezIzle = function (f) {
      if (!window.MutationObserver) { return null; }
      var o = new MutationObserver(function () { f(); setTimeout(f, 600); });
      [].forEach.call(document.querySelectorAll(CEREZ), function (n) { o.observe(n, { attributes: true, attributeFilter: ['class', 'hidden', 'style', 'aria-hidden'] }); });
      return o;
    };
    /* Gastro setStandardVisible: giriş 200 ms, çıkış 120 ms; azaltılmış hareket tercihinde anında */
    var hareket = typeof WeakMap === 'function' ? new WeakMap() : null;
    var gorunsun = function (n, ac) {
      var eski = hareket && hareket.get(n);
      if (eski && eski.ac === ac) { return; }
      if (eski && eski.a) { eski.a.cancel(); }
      var d = { ac: ac, a: null }; if (hareket) { hareket.set(n, d); }
      if (!n.animate || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { n.hidden = !ac; return; }
      if (!ac && n.hidden) { return; }
      n.hidden = false;
      var k = ac ? [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }] : [{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(8px)' }];
      d.a = n.animate(k, { duration: ac ? 200 : 120, easing: 'ease-out', fill: 'both' });
      d.a.finished.then(function () { if (hareket && hareket.get(n) !== d) { return; } n.hidden = !ac; d.a.cancel(); d.a = null; }, function () {});
    };
    var kur = function () {
      stdKatman.forEach(function (f) { f(); }); stdKatman = [];
      durum.yapiskan = null;
      /* Alt bar: eylem çubuğu olan sayfada yok (REKLAM-YERLESIM; Gastro `.rd-actbar`). Telefonun alt çubuğu engel değil: bar onun üstünde */
      if (genis() && !kapaliMi('STD-SIDE')) { sideKur(); } else if (!genis() && !kapaliMi('STD-ALTBAR') && !document.querySelector('.vd-actbar, .rd-actbar, .evd-actbar, .actbar, .tercih-kaydet')) { altbarKur(); }
    };
    function sideKur() {
      var sag = secStd('STD-SIDE');
      if (sag && durum.markalar.indexOf(sag.marka) < 0) { durum.markalar.push(sag.marka); }
      var sol = secStd('STD-SIDE-LEFT', sag && sag.marka);
      if (!sag && !sol) { return; }
      var cift = document.createElement('div');
      cift.setAttribute('data-rk-side-pair', '');
      cift.setAttribute('data-rk-birim', 'STD-SIDE');
      if (sol) { cift.insertAdjacentHTML('beforeend', B.standart('side', sol, { kod: 'STD-SIDE-LEFT' })); }
      if (sag) { cift.insertAdjacentHTML('beforeend', B.standart('side', sag, { kod: 'STD-SIDE' })); }
      document.body.appendChild(cift);
      durum.yapiskan = 'STD-SIDE';
      [sol, sag].forEach(function (x) { if (x && durum.markalar.indexOf(x.marka) < 0) { durum.markalar.push(x.marka); } });
      var yanlar = [].slice.call(cift.children), kare = 0;
      yanlar.forEach(function (y) { y.hidden = true; });
      var hero = document.querySelector('#pageMain .below-header, #pageMain > .ke-top, main [data-rk-hero], .below-header');
      var altbilgi = document.querySelector('footer.footer, body > footer');
      var red = function (neden) { cift.setAttribute('data-rk-side-reason', neden); yanlar.forEach(function (y) { gorunsun(y, false); }); };
      var konum = function () {
        kare = 0;
        var H = window.innerHeight, yer = yanYer();
        if (!yer) { return red('içerikle arasında pay yok'); }
        if (cerezVar()) { return red('çerez bandı'); }
        var bas = 0;
        [].forEach.call(document.querySelectorAll('header, .header, .topbar'), function (n) { var r = n.getBoundingClientRect(); if (r.height && r.top < 160) { bas = Math.max(bas, r.bottom); } });
        /* Gastro sideHeroBottom: hero'nun üstüne yuvarlak kenarıyla binen sonraki bölüm hero'nun sonu sayılır */
        var heroAlt = null;
        if (hero) { heroAlt = hero.getBoundingClientRect().bottom; var sonra = hero.nextElementSibling; if (sonra && sonra.tagName === 'SECTION') { heroAlt = Math.min(heroAlt, sonra.getBoundingClientRect().top); } }
        /* Gastro visibleFooterTop (Diet prototipi gibi `sticky` de): içeriğin altından açılan altbilgide sınır içeriğin sonu */
        var altUst = altbilgi ? altbilgi.getBoundingClientRect().top : Infinity;
        if (altbilgi && /^(fixed|sticky)$/.test(getComputedStyle(altbilgi).position)) { var ic = document.querySelector('main'); altUst = Math.max(altUst, ic ? ic.getBoundingClientRect().bottom : Infinity); }
        if (heroAlt !== null && window.scrollY === 0) { return red('hero görünür'); }
        if (altUst < H) { return red('altbilgi görünür'); }
        if (heroAlt !== null && heroAlt > bas) { return red('hero başlık çizgisini geçmedi'); }
        var ust = bas + 24, alt = bas + (H - bas - 600) / 2 + 600;
        /* Gourmet: köşedeki yüzen düğmeler (Route, başa dön, Mentör) yanın kutusuna giriyorsa yan onların 12 px üstünde biter */
        var W = document.documentElement.clientWidth;
        var kutu = [[W - yer.ic - yer.gen, W - yer.ic]].concat(yer.n === 2 && yanlar.length === 2 ? [[yer.ic, yer.ic + yer.gen]] : []);
        [].forEach.call(document.querySelectorAll('.to-top, .yg-fab, #dadaMentor'), function (d) {
          var r = d.getBoundingClientRect();
          if (r.width && r.top < H && kutu.some(function (x) { return r.left < x[1] && r.right > x[0]; })) { alt = Math.min(alt, r.top - 12); }
        });
        var yuk = Math.round(alt - ust);
        if (yuk < 360) { return red('yan için dikey alan yok'); }
        cift.style.setProperty('--rk-side-inset', yer.ic + 'px');
        cift.style.setProperty('--rk-side-top', Math.round(ust) + 'px');
        cift.style.setProperty('--rk-side-width', yer.gen + 'px');
        cift.style.setProperty('--rk-side-height', yuk + 'px');
        var n = yanlar.length === 1 ? 1 : yer.n;
        cift.setAttribute('data-rk-side-count', String(n));
        cift.setAttribute('data-rk-side-gap', String(yer.pay));
        cift.setAttribute('data-rk-side-reason', n === 2 ? 'iki taraf ' + yer.gen + '×' + yuk : 'sağ ' + yer.gen + '×' + yuk);
        yanlar.forEach(function (y, i) { gorunsun(y, n === 2 || i === yanlar.length - 1); });
      };
      var kaydir = function () { if (!kare) { kare = requestAnimationFrame(konum); } };
      window.addEventListener('scroll', kaydir, { passive: true });
      window.addEventListener('resize', kaydir);
      /* Gastro observeSideVisibility: hero ve altbilgi kesişimi kaydırmasız değişimde de kapıyı yeniden değerlendirir */
      var gozcu = window.IntersectionObserver ? new IntersectionObserver(kaydir, { threshold: 0 }) : null;
      if (gozcu) { if (hero) { gozcu.observe(hero); } if (altbilgi) { gozcu.observe(altbilgi); } }
      var cerezG = cerezIzle(kaydir);
      var bitir = function () { window.removeEventListener('scroll', kaydir); window.removeEventListener('resize', kaydir); if (gozcu) { gozcu.disconnect(); } if (cerezG) { cerezG.disconnect(); } if (kare) { cancelAnimationFrame(kare); kare = 0; } cift.remove(); };
      /* Kapat (×): iki yan birlikte kapanır (Gastro dismiss('side')), 24 saat gelmez */
      cift.addEventListener('click', function (e) {
        if (!e.target.closest('.rk-std-kapat')) { return; }
        kapatKaydet('STD-SIDE'); bitir(); durum.yapiskan = null;
      });
      konum();
      stdKatman.push(bitir);
    }
    function altbarKur() {
      var k = secStd('STD-ALTBAR');
      if (!k) { return; }
      var el = dugum(B.standart('altbar', k, { kod: 'STD-ALTBAR' }));
      el.setAttribute('data-rk-birim', 'STD-ALTBAR');
      el.setAttribute('data-bc-bar', '');
      el.hidden = true;
      document.body.appendChild(el);
      durum.yapiskan = 'STD-ALTBAR';
      if (durum.markalar.indexOf(k.marka) < 0) { durum.markalar.push(k.marka); }
      /* Hero geçilince belirir, altbilgide çekilir; görünürken yüzen düğmeler (data-bc-clear) üstüne kalkar */
      var kare = 0;
      /* Gastro alignAltbar: başlık kolonunun iç kenarları; telefonun alt çubuğu görünürse onun 12 px üstü, yoksa 12 px */
      var hizala = function () {
        var w = document.querySelector('header .h-top .wrap') || [].slice.call(document.querySelectorAll('main .wrap')).filter(function (n) { return n.getBoundingClientRect().width > 250; }).sort(function (a, c) { return c.getBoundingClientRect().width - a.getBoundingClientRect().width; })[0];
        if (w) { var r = w.getBoundingClientRect(), s = getComputedStyle(w), sol = parseFloat(s.paddingLeft) || 0; el.style.setProperty('--rk-alt-left', Math.round(r.left + sol) + 'px'); el.style.setProperty('--rk-alt-width', Math.round(r.width - sol - (parseFloat(s.paddingRight) || 0)) + 'px'); }
        var H = window.innerHeight, nav = document.querySelector('.bottom-nav'), pay = 12;
        if (nav && getComputedStyle(nav).display !== 'none') {
          var ustler = [nav].concat([].slice.call(nav.querySelectorAll('*'))).map(function (n) { return n.getBoundingClientRect(); }).filter(function (r) { return r.width && r.height; }).map(function (r) { return r.top; });
          if (ustler.length) { pay = Math.max(12, H - Math.min.apply(null, ustler) + 12); }
        }
        el.style.bottom = Math.round(pay) + 'px';
      };
      var konum = function () {
        kare = 0;
        hizala();
        var hero = document.querySelector('.below-header'), ana = document.getElementById('pageMain');
        var goster = !cerezVar() && !(hero && hero.getBoundingClientRect().bottom > window.innerHeight * 0.5) && !(ana && ana.getBoundingClientRect().bottom < window.innerHeight - 40);
        if (el.hidden === goster) { el.hidden = !goster; el.classList.toggle('show', goster); if (window.BottomClearance) { window.BottomClearance.apply(); } }
      };
      var kaydir = function () { if (!kare) { kare = requestAnimationFrame(konum); } };
      window.addEventListener('scroll', kaydir, { passive: true });
      window.addEventListener('resize', kaydir);
      /* Alt çubuk kaydırınca gizlenip geri gelir (geçiş): bitince bar yeniden hizalanır */
      document.addEventListener('transitionend', kaydir);
      var cerezG = cerezIzle(kaydir);
      var bitir = function () { window.removeEventListener('scroll', kaydir); window.removeEventListener('resize', kaydir); document.removeEventListener('transitionend', kaydir); if (cerezG) { cerezG.disconnect(); } if (kare) { cancelAnimationFrame(kare); kare = 0; } el.remove(); if (window.BottomClearance) { window.BottomClearance.apply(); } };
      el.addEventListener('click', function (e) {
        if (!e.target.closest('.rk-std-kapat')) { return; }
        kapatKaydet('STD-ALTBAR'); bitir(); durum.yapiskan = null;
      });
      konum();
      stdKatman.push(bitir);
    }
    /* Pop-up: oturumun ilk reklamlı sayfasında yok; oturumda bir kez ve 10 dakikada en çok bir (SunumKurallari popup.*) */
    function popup() {
      var say = (+oturumOku('dg-rk-sayfa') || 0) + 1;
      oturumYaz('dg-rk-sayfa', String(say));
      var son = +depoOku('dg-rk-popup') || 0;
      if (say < 2 || oturumOku('dg-rk-popup-oturum') || Date.now() - son < V.kurallar.popupAralikDk * 60000) { return; }
      sonra(function () {
        if (!acik || document.querySelector('.rk-std-popup')) { return; }
        var k = secStd('STD-POPUP', [].map.call(document.querySelectorAll('.rk-std[data-rk-marka]'), function (e) { return e.getAttribute('data-rk-marka'); }));
        if (!k) { return; }
        var el = dugum(B.standart('popup', k, { kod: 'STD-POPUP' }));
        el.setAttribute('data-rk-birim', 'STD-POPUP');
        var once = document.activeElement;
        document.body.appendChild(el);
        sokulecek.push(el);
        oturumYaz('dg-rk-popup-oturum', '1'); depoYaz('dg-rk-popup', String(Date.now()));
        var kart = el.querySelector('.rk-std-kart');
        var kapat = function () { el.remove(); document.removeEventListener('keydown', tus); if (once && once.focus) { once.focus({ preventScroll: true }); } };
        var tus = function (e) { if (e.key === 'Escape') { kapat(); } };
        document.addEventListener('keydown', tus);
        el.addEventListener('click', function (e) { if (e.target === el || e.target.closest('.rk-std-kapat')) { kapat(); } });
        kart.focus({ preventScroll: true });
      }, V.kurallar.popupGecikmeSn * 1000);
    }
    kur();
    stdKur = kur;
    sokulecek.push(function () { stdKur = null; });
    var gen0 = genis();
    dinle(window, 'resize', function () { if (genis() !== gen0) { gen0 = genis(); kur(); yogunlukSonra(); } });
    sokulecek.push(function () { stdKatman.forEach(function (f) { f(); }); stdKatman = []; });
    popup();
  }

  function sok(hepsi) {
    gozculer.forEach(function (g) { g.disconnect(); }); gozculer = [];
    zamanlar.forEach(clearTimeout); zamanlar = [];
    sokulecek.reverse().forEach(function (s) { if (typeof s === 'function') { s(); } else if (s && s.remove) { s.remove(); } }); sokulecek = [];
    [].slice.call(document.querySelectorAll('[data-rk-yogunluk-gizli]')).forEach(function (n) { n.removeAttribute('data-rk-yogunluk-gizli'); });
    if (hepsi) { dinleyici.forEach(function (d) { d[0].removeEventListener(d[1], d[2], d[3]); }); dinleyici = []; }
  }

  /* reklam-son-duzelt (11 Kas, Beyar: reklam kapalıyken sayfa reklamsız hâlle birebir): canlı kapatmada reklam stilleri (kanon, köprü ve
     ek/*) devre dışı kalır, açınca geri gelir. İlk yüklemede kapalıysa zaten hiçbiri bağlanmaz */
  function stillerAcik(on) { [].forEach.call(document.querySelectorAll('link[rel="stylesheet"][href*="assets/css/reklam/"]'), function (l) { l.disabled = !on; }); }
  function ac() {
    if (acik) { return; }
    acik = true;
    stillerAcik(true);
    var bu = ++kusak;
    yukle().then(function () {
      if (!acik || bu !== kusak) { return; }
      dinle(window, 'resize', yogunlukSonra);
      /* reklam-duzeltici: ızgaranın sütun sayısı değişince (kırılım) native yerleri (G1, tam satır) yeniden kurulur */
      var kKare = 0;
      dinle(window, 'resize', function () { if (!kKare) { kKare = requestAnimationFrame(function () { kKare = 0; listeler.forEach(function (l) { if (l.kolon() !== l.son()) { l.duzen(); } }); }); } });
      dinle(window, 'load', yogunlukSonra);
      yerlestir();
    });
  }
  function kapat() {
    if (!acik) { return; }
    acik = false;
    kusak++;
    sok(true);
    stillerAcik(false);
    durum = { acik: false, sayfa: null, butce: 0, basilan: [], markalar: [], dusen: [], gizlenen: [], yapiskan: null };
    bildir();
  }

  /* Yedek: hedefi ve marka sitesi olmayan bağ sayfada kalır ve bildirim verir (veride kalmadı; bilesen.js B.bag) */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-rk-ornek]');
    if (!a) { return; }
    e.preventDefault();
    e.stopPropagation();
    var t = document.getElementById('keToast'), m = document.getElementById('keToastMsg');
    if (!t || !m) { return; }
    m.textContent = 'Örnek yerleşim: canlıda bu bağlantı reklam verenin sayfasını açar.';
    t.classList.add('show', 'on');
    clearTimeout(ac.z); ac.z = setTimeout(function () { t.classList.remove('show', 'on'); }, 2600);
  }, true);

  document.addEventListener('dg-reklam', function (e) { senkron(e.detail); if (e.detail) { ac(); } else { kapat(); } });
  senkron(R.acik());
  if (R.acik()) {
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', ac); } else { ac(); }
  }
})();
