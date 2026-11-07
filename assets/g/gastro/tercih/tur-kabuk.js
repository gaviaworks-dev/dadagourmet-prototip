/* Dada Gastro · Tanıtım turu + "Eğitim sihirbazı" paneli — TAM YAPI (F5, 5 Kas). Kaynak: onaylı taslak `tur.js` (revize 5 Kas, Beyar).
 *
 * · Pencere: İleri/Geri, noktalar, Atla, X, arka plana tıklama, klavye (← → Esc), odak tuzağı, son slaytta "Bitir".
 * · "…'e git" turu KAPATMAZ: modüle gidilir, tur sağ altta yüzen panel olarak sürer (390'da alt şerit); sayfa değişince panel aynı adımda.
 * · Atla / X / Bitir sonrası kendiliğinden açılmaz; altbilgideki "Site turu" (K12) ve Çözüm Merkezi'ndeki bağ yeniden başlatır.
 * · DURUM SUNUCUDA (taslaktaki sessionStorage kalktı): kök `data-tur` sunucunun bastığı durumu taşır; her değişiklik `PUT /tanitim/durum`
 *   (sonuç → `TanitimServisi`: misafirde oturum, üyede hesap · akış → sunucu oturumu). Tarayıcı deposuna hiçbir şey yazılmaz.
 *   Sayfa değiştiren eylemlerde (…'e git, son slaydın bağı) önce yazım biter, sonra gidilir — yoksa sonraki sayfa eski durumu basardı.
 * · Slaytlar, noktalar, sayaç ve bağlar sunucunun tek listesinden (`config('tercih.tanitim.slaytlar')`) gelir; burada liste yok.
 * · ALT SAYFALAR (tur revizesi 5 Kas): sunucu alt sayfalı slaytı alt sayfası kadar ADIMA açar (`ana` · `alt` · `alt_adet`). İleri/Geri
 *   adım adım gider: alt sayfalar kendi içinde, son alt sayfadan sonra bir sonraki ana slayt. Ana nokta slaydın ilk alt sayfasına,
 *   alt nokta o alt sayfaya götürür; sayaç ana slaydı sayar ("2/7"), alt sayaç alt sayfayı ("1/2").
 */
(function () {
  'use strict';
  var kok = document.getElementById('tercihTur');
  if (!kok) return;
  var veri;
  try { veri = JSON.parse(kok.getAttribute('data-tur')); } catch (e) { return; }
  var S = veri.slaytlar || [], SON = S.length - 1, M = veri.metin || {};
  if (!S.length) return;
  var sinirla = function (n) { n = parseInt(n, 10) || 0; return Math.max(0, Math.min(SON, n)); };
  var ANA = S[SON].ana + 1;
  var anaBasi = function (a) { for (var k = 0; k < S.length; k++) if (S[k].ana === a) return k; return 0; };
  var altSayac = function (s) { return (M.alt_sayac || ':n/:adet').replace(':n', s.alt + 1).replace(':adet', s.alt_adet); };

  /* ---------- sunucu durumu: sıralı yazım kuyruğu (adım değişimi kısa gecikmeyle birleşir; son durum kazanır) ---------- */
  var kuyruk = Promise.resolve(), gecikme = null;
  function gonder(govde) {
    kuyruk = kuyruk.then(function () {
      return fetch(veri.uc, {
        method: 'PUT', credentials: 'same-origin', keepalive: true,
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': veri.csrf, 'X-Requested-With': 'XMLHttpRequest' },
        body: JSON.stringify(govde)
      }).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); }).catch(function (h) {
        // yazılamadıysa tur bu sayfada sürer; bir sonraki sayfa sunucudaki son kaydı basar (sahte "kaydedildi" yok — tur bir şey söylemiyor)
        if (window.console && console.warn) console.warn('Tanıtım durumu yazılamadı:', h && h.message ? h.message : h);
      });
    });
    return kuyruk;
  }
  function akisYaz(kip, n, hemen) {
    clearTimeout(gecikme);
    var govde = { akis: kip ? { kip: kip, adim: n } : null };
    if (hemen) return gonder(govde);
    gecikme = setTimeout(function () { gonder(govde); }, 250);
    return kuyruk;
  }
  function sonucYaz(durum) {
    clearTimeout(gecikme);
    var govde = { akis: null, durumlar: {} };
    govde.durumlar[veri.anahtar] = durum;
    return gonder(govde);
  }
  // yazım bitince (en çok 1,5 sn bekleyerek) adrese git; yeni sekmede açma tıklamaları tarayıcıya bırakılır
  function yazVeGit(e, soz, href) {
    if (e && (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button > 0)) return;
    if (e) e.preventDefault();
    var gitti = false, git = function () { if (!gitti) { gitti = true; location.href = href; } };
    setTimeout(git, 1500);
    soz.then(git, git);
  }

  var $ = function (s, k) { return (k || kok).querySelector(s); };
  var ortu = $('[data-tur-ortu]'), pencere = $('[data-tur-pencere]'), panel = $('[data-tur-panel]');
  var govdeEl = $('[data-tur-govde]');
  var noktalar = [].slice.call(kok.querySelectorAll('[data-tur-nokta]'));
  var altGruplar = [].slice.call(kok.querySelectorAll('[data-tur-alt-grup]'));
  var altNoktalar = [].slice.call(kok.querySelectorAll('[data-tur-alt-nokta]'));
  var pencereVideo = $('[data-tur-video]'), panelVideo = $('[data-panel-video]');
  var sonEl = $('[data-tur-son]');
  var azHareket = window.matchMedia('(prefers-reduced-motion: reduce)');
  var dar = window.matchMedia('(max-width: 640px)');
  var adim = 0, acik = false, oncekiOdak = null;
  var durduruldu = false; // kullanıcı animasyonu durdurdu (bu sayfada, iki yüzeyde de)

  /* ---------- Medya: modülün gerçek sayfa kaydı (1440 yatay · ≤640 dikey), sessiz döngü ----------
     reduced-motion açıkken kaynak HİÇ yüklenmez, yalnız poster (ilk kare) görünür; kaydı olmayan slayt durağandır. */
  /* Yüzen panel (masaüstü) kendi sıkı kadrajlı kaydını (`-panel`) oynatır: pencerenin tam sayfa kaydı 370 px'e küçülünce okunmuyordu
     (Beyar 5 Kas). Pencere ve 390 alt şeridi bugünkü kayıtlarıyla. */
  function medyaKur(v, s) {
    var yon = dar.matches ? 'dikey' : (v === panelVideo && s.panel_medya ? 'panel' : 'yatay');
    var anahtar = (s.medya || s.anahtar) + '|' + yon + '|' + (azHareket.matches ? 'az' : 'tam');
    if (v.dataset.anahtar === anahtar) { oynat(v); return; }
    v.dataset.anahtar = anahtar;
    v.pause();
    v.textContent = '';
    v.removeAttribute('src');
    var ek = s.surum ? '?v=' + s.surum : '';
    if (s.medya) v.poster = s.medya + '-' + yon + '.jpg' + ek; else v.removeAttribute('poster');
    var hareketli = !!s.medya && !azHareket.matches;
    var kap = v.closest('[data-tur-gorsel], [data-panel-oynat]');
    kap.classList.toggle('tercih-tur-duragan', !hareketli);
    if (kap.hasAttribute('data-panel-oynat')) kap.disabled = !hareketli; // durağanda durdurulacak bir şey yok
    if (hareketli) {
      [['webm', 'video/webm; codecs=vp9'], ['mp4', 'video/mp4']].forEach(function (k) {
        var src = document.createElement('source'); src.src = s.medya + '-' + yon + '.' + k[0] + ek; src.type = k[1]; v.appendChild(src);
      });
    }
    v.load(); // kaynaksız load() öğeyi sıfırlar: önceki kaydın son karesi değil yeni poster görünür (taslakta ölçüldü)
    oynat(v);
  }
  function oynat(v) {
    if (!v.querySelector('source')) return;
    if (durduruldu) { v.pause(); return; }
    var p = v.play(); if (p && p.catch) p.catch(function () { /* otomatik oynatma engellendiyse poster kalır */ });
  }
  function dugmeKur(d) {
    d.setAttribute('aria-pressed', durduruldu ? 'true' : 'false');
    d.setAttribute('aria-label', durduruldu ? M.oynat : M.durdur);
    var ik = d.querySelector('i'); if (ik) ik.className = 'fa-solid ' + (durduruldu ? 'fa-play' : 'fa-pause');
  }
  function durdurCevir() {
    durduruldu = !durduruldu;
    [[pencereVideo, $('[data-tur-oynat]')], [panelVideo, $('[data-panel-oynat]')]].forEach(function (c) {
      if (durduruldu) c[0].pause(); else oynat(c[0]);
      dugmeKur(c[1]);
    });
  }

  /* ---------- Pencere ---------- */
  function ciz(n, canlandir) {
    var s = S[n];
    adim = n;
    medyaKur(pencereVideo, s);
    $('[data-tur-ikon]').className = 'fa-solid ' + s.ikon;
    $('[data-tur-eyebrow]').textContent = s.eyebrow;
    $('#turBaslik').textContent = s.baslik;
    $('#turMetin').textContent = s.metin;
    var git = $('[data-tur-git]');
    git.href = s.href;
    git.firstChild.nodeValue = s.bag + ' ';
    if (sonEl) sonEl.hidden = n !== SON;
    noktalar.forEach(function (d) {
      var bu = +d.getAttribute('data-tur-nokta') === s.ana;
      d.classList.toggle('aktif', bu);
      if (bu) d.setAttribute('aria-current', 'step'); else d.removeAttribute('aria-current');
    });
    altGruplar.forEach(function (g) {
      g.hidden = +g.getAttribute('data-tur-alt-grup') !== s.ana;
      if (!g.hidden) g.querySelector('[data-tur-alt-sayac]').textContent = altSayac(s);
    });
    altNoktalar.forEach(function (d) {
      var bu = +d.getAttribute('data-tur-alt-nokta') === n;
      d.classList.toggle('aktif', bu);
      if (bu) d.setAttribute('aria-current', 'step'); else d.removeAttribute('aria-current');
    });
    $('[data-tur-geri]').hidden = n === 0;
    $('[data-tur-atla]').hidden = n === SON;
    $('[data-tur-ileri-metin]').textContent = n === SON ? M.bitir : M.ileri;
    $('[data-tur-ileri] i').className = 'fa-solid ' + (n === SON ? 'fa-check' : 'fa-chevron-right');
    if (canlandir && !azHareket.matches) { govdeEl.classList.remove('tercih-tur-gecis'); void govdeEl.offsetWidth; govdeEl.classList.add('tercih-tur-gecis'); }
  }

  function ac(n, yazma) {
    panelKapat();
    oncekiOdak = document.activeElement;
    ciz(sinirla(n), false);
    ortu.classList.add('show'); pencere.classList.add('show');
    pencere.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('tercih-tur-acik');
    acik = true;
    if (!yazma) akisYaz('acik', adim, true);
    odakla(0);
  }
  // pencere görünürlük geçişindeyken focus() tutmaz (ölçüldü: sayfa açılışında odak body'de kalıyordu) — tutana kadar birkaç kez dene
  function odakla(deneme) {
    setTimeout(function () {
      var d = $('[data-tur-ileri]');
      if (!acik || pencere.contains(document.activeElement)) return;
      d.focus({ preventScroll: true });
      if (document.activeElement !== d && deneme < 8) odakla(deneme + 1);
    }, deneme === 0 ? 30 : 120);
  }

  // sonuc: 'atlandi' | 'goruldu' → tur biter (sunucuya yazılır) · 'panel' → panel olarak sürer (yazımı çağıran yapar)
  function kapat(sonuc) {
    pencereVideo.pause();
    ortu.classList.remove('show'); pencere.classList.remove('show');
    pencere.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('tercih-tur-acik');
    acik = false;
    var soz = sonuc === 'panel' ? kuyruk : sonucYaz(sonuc);
    if (oncekiOdak && oncekiOdak.focus && sonuc !== 'panel') oncekiOdak.focus({ preventScroll: true });
    return soz;
  }

  function adimaGec(n) { ciz(n, true); akisYaz('acik', n, false); }
  function ileri() { if (adim < SON) adimaGec(adim + 1); else kapat('goruldu'); }
  function geri() { if (adim > 0) adimaGec(adim - 1); }

  $('[data-tur-ileri]').addEventListener('click', ileri);
  $('[data-tur-geri]').addEventListener('click', geri);
  $('[data-tur-atla]').addEventListener('click', function () { kapat('atlandi'); });
  $('[data-tur-kapat]').addEventListener('click', function () { kapat('atlandi'); });
  // ana nokta: o slaydın ilk alt sayfası · alt nokta: o alt sayfa
  noktalar.forEach(function (d) { d.addEventListener('click', function () { var k = anaBasi(+d.getAttribute('data-tur-nokta')); if (S[adim].ana !== S[k].ana) adimaGec(k); }); });
  altNoktalar.forEach(function (d) { d.addEventListener('click', function () { var k = sinirla(d.getAttribute('data-tur-alt-nokta')); if (k !== adim) adimaGec(k); }); });
  // arka plan: .fb-modal tüm ekranı kaplar (örtünün üstünde) — panelin dışına inen tıklama arka plandır
  pencere.addEventListener('click', function (e) { if (e.target === pencere) kapat('atlandi'); });
  ortu.addEventListener('click', function () { kapat('atlandi'); });

  // "…'e git": tur kapanmaz, panel olarak sürer (bu sayfa o modülse gidilmez, panel burada açılır)
  $('[data-tur-git]').addEventListener('click', function (e) {
    var n = adim;
    if (S[n].burada) { e.preventDefault(); kapat('panel'); panelAc(n); return; }
    var soz = akisYaz('panel', n, true);
    kapat('panel');
    yazVeGit(e, soz, S[n].href);
  });
  // son slaydın bağı (Üye ol · Tercihlerini belirle): tur görülmüş sayılır
  var sonBag = $('[data-tur-son-bag]');
  if (sonBag) sonBag.addEventListener('click', function (e) { yazVeGit(e, kapat('goruldu'), sonBag.href); });

  document.addEventListener('keydown', function (e) {
    if (!acik) return;
    if (e.key === 'Escape') { e.preventDefault(); kapat('atlandi'); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); if (adim < SON) ileri(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); geri(); }
    else if (e.key === 'Tab') { // odak pencerede kalır
      var od = [].filter.call(pencere.querySelectorAll('a[href], button:not([disabled])'), function (x) {
        return !x.closest('[hidden]') && (x.checkVisibility ? x.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }) : x.getClientRects().length > 0);
      });
      if (!od.length) return;
      var ilk = od[0], son = od[od.length - 1];
      if (!pencere.contains(document.activeElement)) { e.preventDefault(); ilk.focus(); }
      else if (e.shiftKey && document.activeElement === ilk) { e.preventDefault(); son.focus(); }
      else if (!e.shiftKey && document.activeElement === son) { e.preventDefault(); ilk.focus(); }
    }
  });

  /* ---------- Panel ("Eğitim sihirbazı") ---------- */
  var panelAciliyor = false;
  function panelCiz(n) {
    var s = S[n];
    adim = n;
    $('[data-panel-sayac]', panel).textContent = (s.ana + 1) + '/' + ANA;
    var alt = $('[data-panel-alt]', panel);
    alt.hidden = s.alt_adet < 2; alt.textContent = altSayac(s);
    $('[data-panel-baslik]', panel).textContent = s.eyebrow;
    $('[data-panel-metin]', panel).textContent = s.panel;
    var git = $('[data-panel-git]', panel);
    git.hidden = !!s.burada; git.href = s.href; git.firstChild.nodeValue = s.bag + ' ';
    $('[data-panel-burada]', panel).hidden = !s.burada;
    $('[data-panel-geri]', panel).disabled = n === 0;
    $('[data-panel-ileri-metin]', panel).textContent = n === SON ? M.bitir : M.ileri;
    $('[data-panel-ileri] i', panel).className = 'fa-solid ' + (n === SON ? 'fa-check' : 'fa-chevron-right');
    if (!panel.hidden || panelAciliyor) medyaKur(panelVideo, s);
  }
  function panelAc(n, yazma) {
    panelAciliyor = true; panel.hidden = false;
    panelCiz(sinirla(n));
    panelAciliyor = false;
    document.documentElement.classList.add('tercih-tur-panel-acik');
    if (!yazma) akisYaz('panel', adim, true);
  }
  function panelKapat() {
    panelVideo.pause();
    panel.hidden = true;
    document.documentElement.classList.remove('tercih-tur-panel-acik');
  }
  $('[data-panel-ileri]', panel).addEventListener('click', function () {
    if (adim < SON) { panelCiz(adim + 1); akisYaz('panel', adim, false); }
    else { panelKapat(); sonucYaz('goruldu'); }
  });
  $('[data-panel-geri]', panel).addEventListener('click', function () { if (adim > 0) { panelCiz(adim - 1); akisYaz('panel', adim, false); } });
  $('[data-panel-kapat]', panel).addEventListener('click', function () { panelKapat(); sonucYaz('atlandi'); });
  $('[data-panel-git]', panel).addEventListener('click', function (e) { yazVeGit(e, akisYaz('panel', adim, true), S[adim].href); });

  $('[data-tur-oynat]').addEventListener('click', durdurCevir);
  $('[data-panel-oynat]').addEventListener('click', durdurCevir);
  // genişlik ya da hareket tercihi değişince aynı slaydın doğru kaydı yüklenir
  var yenidenKur = function () { if (acik) medyaKur(pencereVideo, S[adim]); if (!panel.hidden) medyaKur(panelVideo, S[adim]); };
  [dar, azHareket].forEach(function (m) { if (m.addEventListener) m.addEventListener('change', yenidenKur); });

  /* ---------- Yardımdan yeniden başlat (altbilgi "Site turu", Çözüm Merkezi "Tanıtımı yeniden izle" — K12) ---------- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-tur-baslat]');
    if (!b || e.metaKey || e.ctrlKey || e.shiftKey || e.button > 0) return;
    e.preventDefault();
    ac(0);
  });

  /* ---------- Sunucu durumuyla eşitle: geri/ileri önbelleğinden dönen sayfa eski durumu taşır ---------- */
  function uygula(akis) {
    if (akis && akis.kip === 'panel') { if (acik) kapat('panel'); panelAc(akis.adim, true); }
    else if (akis && akis.kip === 'acik') { if (!acik) ac(akis.adim, true); }
    else { if (acik) { pencereVideo.pause(); ortu.classList.remove('show'); pencere.classList.remove('show'); pencere.setAttribute('aria-hidden', 'true'); document.documentElement.classList.remove('tercih-tur-acik'); acik = false; } panelKapat(); }
  }
  window.addEventListener('pageshow', function (e) {
    if (!e.persisted) return;
    fetch(veri.uc, { credentials: 'same-origin', headers: { 'Accept': 'application/json' }, cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { if (j && j.data) uygula(j.data.akis); })
      .catch(function () { /* eşitlenemedi: sayfa olduğu gibi kalır */ });
  });

  /* ---------- Çerez bandı (kanonun #cookieBanner'ı, `.show` sınıfıyla girer/çıkar; yeni durum yok, yalnız DOM okunur) ----------
     · Kendiliğinden açılış bant kapanana (Reddet / Kabul) kadar bekler. Bant onay yoksa sayfa betiğinden ~700 ms sonra gelir;
       `load`dan sonra 900 ms içinde gelmediyse onay zaten verilmiştir ve tur açılır. Bandın onay anahtarı OKUNMAZ (analitik
       kabuğu sunucu çerezi yokken onu siler — anahtar "var" derken bant yine gelebilir); karar bandın kendisinden.
     · Bant görünürken yüzen panel bandın ÜSTÜNE oturur: bandın ekranın dibinden kapladığı yükseklik `--tercih-tur-alt-engel`.
       Geçiş (translateY/opacity) ortasında okunan değer ara değerdir — geçiş bitince yeniden ölçülür. "Site turu" beklemez. */
  var bant = document.getElementById('cookieBanner');
  function bantGorunur() {
    if (!bant || !bant.classList.contains('show')) return false;
    return bant.checkVisibility ? bant.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }) : bant.getClientRects().length > 0;
  }
  function engelOlc() {
    var e = 0;
    if (bantGorunur() && getComputedStyle(bant).position === 'fixed') {
      var r = bant.getBoundingClientRect();
      if (r.height > 0 && r.top < innerHeight) e = Math.round(innerHeight - r.top);
    }
    kok.style.setProperty('--tercih-tur-alt-engel', e + 'px');
  }
  if (bant) {
    new MutationObserver(engelOlc).observe(bant, { attributes: true, attributeFilter: ['class', 'style', 'hidden'] });
    bant.addEventListener('transitionend', engelOlc);
    window.addEventListener('resize', engelOlc, { passive: true });
  }
  engelOlc();
  function cerezBandiniBekle(fn) {
    if (!bant) { fn(); return; }
    var goruldu = false, bitti = false, zaman = null, gozcu = null;
    var tamam = function () { if (bitti) return; bitti = true; if (gozcu) gozcu.disconnect(); clearTimeout(zaman); fn(); };
    var bak = function () {
      if (bant.classList.contains('show')) { goruldu = true; clearTimeout(zaman); }
      else if (goruldu) tamam();
    };
    gozcu = new MutationObserver(bak);
    gozcu.observe(bant, { attributes: true, attributeFilter: ['class'] });
    bak();
    if (goruldu) return;
    var sure = function () { zaman = setTimeout(function () { if (!goruldu) tamam(); }, 900); };
    if (document.readyState === 'complete') sure(); else window.addEventListener('load', sure, { once: true });
  }

  /* ---------- Açılış ---------- */
  var arama = new URLSearchParams(location.search);
  if (arama.get('tur') === '1') { // "Site turu" bağının JS'siz adresi ve doğrudan adres
    arama.delete('tur');
    history.replaceState(history.state, '', location.pathname + (arama.toString() ? '?' + arama : '') + location.hash);
    ac(0);
  } else if (veri.akis) {
    uygula(veri.akis); // sunucudaki akış: panel aynı adımda sürer, pencere açıksa aynı slaytta açılır
  } else if (kok.dataset.ac === 'otomatik') {
    // ilk ziyaret (ana sayfa): bir kez; Atla/X/Bitir sonrası sunucu "otomatik" basmaz. Çerez bandıyla iki diyalog üst üste binmez.
    cerezBandiniBekle(function () { if (!acik && panel.hidden) ac(0); });
  }
})();
