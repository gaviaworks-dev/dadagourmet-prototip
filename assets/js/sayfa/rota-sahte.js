/* Dada Route statik uçları. Canlı `dada-route.js` değişmeden çalışsın diye sunucu yanıtları burada üretilir.
   Dışarı giden tek istek rota geometrisi: OSRM açık demo sunucusuna yalnız durak koordinatlarını taşıyan GET (aşağıda "Rota").
   Süre ve mesafe OSRM'in; şarj ve katman noktaları örnektir; mekân konumları canlı kayıtların kopyasıdır. */
(function () {
  'use strict';
  var R = window.DG_ROTA, M = window.DG_MEKANLAR || [], V = window.DG_LISTE || { mekanlar: [], kartlar: {}, secenek: {} };
  var kok = document.documentElement.dataset.kok || './';
  var harita = document.getElementById('routeMap');
  if (harita && document.querySelector('meta[name="dada-kimlik"]') && /"auth":true/.test(document.querySelector('meta[name="dada-kimlik"]').content)) { harita.setAttribute('data-auth', '1'); }
  /* Katmanların haritaya erişimi: canlı betik haritayı dışa vermez, kurulurken alınır */
  var ozMap = window.L.map; window.L.map = function () { var m = ozMap.apply(window.L, arguments); window.dgRotaHarita = m; setTimeout(function () { haritaSigdirKur(m); }, 0); return m; };

  /* K5 (Beyar, 11 Kas) · Telefonda (≤860) rota görünür harita alanına sığar. Canlı `fitPad` alt sayfa TAM açıkken görünür şeridi
     ~58px bırakır, harita zoom 3'e düşer ve merkez Afrika'da kalır; haritaya dönünce yeniden sığdırılmaz. Girdiye odaklanınca tarayıcı
     `overflow:hidden` `.yg-app` kabını kaydırır (alt sayfa yarımken 34dvh), harita kabı ekranın üstüne kayar. Burada kap kaydırması
     sıfırlanır, `invalidateSize`, rota görünür alana (başlığın altı, alt sayfa ve görünür alt şeridin üstü) sığdırılır.
     Masaüstü: yalnız `invalidateSize` ve kap kaymışsa canlı `fitPad` dolgusuyla sığdırma; canlı sığdırma aynen kalır.
     RM-11 · yeniden sığdırma (Beyar 11 Kas, tek kaynak burası; `dolgu()` bütün sığdırma ve odaklamaların dolgusu):
     - Görünür alan: başlığın altı; dikey telefonda alt sayfanın, açık şeridin ve detayın üstü; yan sütunda panelin sağı, açık şeridin üstü;
       dokunmatikte sağda +/− ve konum sütunu.
     - Ne zaman: görünüm anahtarı (düzen: telefon / yan sütun, kip: Harita / Keşif / Plan yarım / Plan tam, yan sütunda şerit açık/kapalı)
       değişince HER ZAMAN; rota değişince HER ZAMAN; yalnız ölçü değişince (pencere boyu, tarayıcı çubuğu, klavye kapanması) kullanıcı
       haritayı oynatmadıysa. Kullanıcının sürüklemesi, yakınlaştırması, mekâna ya da kümeye uçuş "elle" sayılır ve bir sonraki kip
       değişimine kadar korunur. Plan tamda ve klavye açıkken harita görünmez: sığdırılmaz, dönüşte bakılır.
     - Geçiş bitince ölçülür: alt sayfa, şerit ve detayın CSS geçişleri (`getAnimations().finished`, transitionend karşılığı) beklenir.
       Hedef görünümle şimdiki aynıysa hareket yok (titreme yok).
     - Canlı betiğin kendi rota sığdırması (`fitActive`, canlı `fitPad` dolgusuyla, kip oturmadan) telefonda/yan sütunda yapılmaz; yerine
       buradaki sığdırma kip oturunca bir kez çalışır (rota kurulunca iki ayrı kayma olmasın).
     - Mekân detayı açıkken rota sığdırılmaz; seçili mekân pini görünür alanda tutulur (detay odağı rotaya üstün). */
  function haritaSigdirKur(m) {
    var L = window.L, app = document.querySelector('.yg-app'), panel = document.querySelector('.yg-panel');
    var ust = document.querySelector('.yg-top'), serit = document.getElementById('ygDash'), detay = document.getElementById('ygDetail');
    var dar = window.matchMedia('(max-width:860px)');
    var yan = window.matchMedia('(min-width:641px) and (max-width:860px) and (max-height:500px),(min-width:700px) and (max-width:860px)');
    var kaba = window.matchMedia('(pointer:coarse)');
    if (!app || !panel || !m.getContainer) { return; }
    var elle = false, bizim = false, hareketli = false, yeniBekliyor = false, sira = 0, zaman = 0, sonAnahtar = null;
    var canliKip = function () { return ['peek', 'half', 'full'].filter(function (d) { return panel.classList.contains('sheet-' + d); })[0] || 'half'; };
    function seritAcik() { return !!serit && !serit.hidden && !serit.classList.contains('collapsed') && !serit.classList.contains('full-hidden'); }
    var detayAcik = function () { return !!detay && !detay.hidden; };
    /* Görünüm anahtarı: değişmesi kullanıcının görünümü değiştirmesidir */
    function anahtar() {
      if (!dar.matches) { return 'genis'; }
      if (yan.matches) { return 'yan:' + (seritAcik() ? 'kesif' : 'harita'); }
      var k = canliKip(); return 'tel:' + (k === 'full' ? 'tam' : k === 'half' ? 'yarim' : seritAcik() ? 'kesif' : 'harita');
    }
    /* Rota: canlının çizdiği ana rota çizgisi (`routeLine`, 5,5 px, tam opak). Temizlenince yok (eski geometriye sığdırılmaz) */
    function sinir() {
      var c = null; m.eachLayer(function (l) { if (l instanceof L.Polyline && !(l instanceof L.Polygon) && l.options && l.options.weight === 5.5 && l.options.opacity === 1) { c = l; } });
      var b = c && c.getBounds(); return b && b.isValid() ? b : null;
    }
    function kapDuzelt() { if (!app.scrollTop && !app.scrollLeft) { return false; } app.scrollTop = 0; app.scrollLeft = 0; return true; }
    /* Dolgu (harita kabına göre). `detayli`: açık detayın kapladığı yer de düşülür (pin odağı, küme) */
    function dolgu(detayli) {
      var k = m.getContainer().getBoundingClientRect(), p = panel.getBoundingClientRect(), sag = kaba.matches ? 66 : 22;
      if (!dar.matches) { return { paddingTopLeft: [Math.round(p.width) + 28, 84], paddingBottomRight: [40, 40] }; }
      var uY = ust ? ust.getBoundingClientRect().bottom : k.top, ustD = Math.max(0, Math.round(uY - k.top)) + 12, d = detayli && detayAcik() ? detay.getBoundingClientRect() : null;
      /* RM-11 · yan sütun (yatay/kısa ekran, tablet): panel solda, şerit haritanın altında (masaüstü kalıbı), detay haritanın sol üstünde */
      if (yan.matches) {
        var sol = Math.max(0, Math.round(p.right - k.left)), sAlt = 40;
        if (seritAcik()) { var ss = serit.getBoundingClientRect(); if (ss.height && ss.top < k.bottom) { sAlt = Math.round(k.bottom - ss.top) + 16; } }
        /* Detay haritanın sol üstünde: pin için detayın sağı ya da altı, hangisi genişse (dar kalırsa sağdaki denetim payı düşülmez) */
        if (d && d.height) {
          var sagG = k.width - (d.right - k.left) - 22 - sag, altG = k.height - (d.bottom - k.top) - 12 - sAlt;
          if (altG > 40 && altG * (k.width - sol - 22 - sag) > sagG * (k.height - ustD - sAlt)) { ustD = Math.round(d.bottom - k.top) + 12; }
          else { sol = Math.round(d.right - k.left); if (sagG < 40) { sag = 22; } }
        }
        return { paddingTopLeft: [sol + 22, ustD], paddingBottomRight: [sag, sAlt] };
      }
      var altY = Math.min(window.innerHeight, p.top);
      if (seritAcik()) { var s = serit.getBoundingClientRect(); if (s.height && s.top > uY && s.top < altY) { altY = s.top; } }
      if (d && d.height) { altY = Math.min(altY, d.top); }
      var altD = Math.max(0, Math.round(k.bottom - altY)) + 16;
      if (!detayli && k.height - ustD - altD < 40) { altD = Math.max(0, Math.round(k.height - ustD - 40)); }
      /* RM-11: dokunmatik telefonda +/− ve konum düğmesi sağ altta: sağ pay o sütun kadar (44 + kenar 14 + 8) */
      return { paddingTopLeft: [22, ustD], paddingBottomRight: [sag, altD] };
    }
    var ozFit = m.fitBounds;
    /* Kendi hareketimiz: `movestart` zoom animasyonunda bir kare sonra gelir; iki kare sonra hâlâ sürüyorsa `moveend` beklenir */
    function bizimle(f) {
      bizim = true; var basladi = false, bas = function () { basladi = true; }, yedek = setTimeout(function () { bizim = false; }, 1500);
      m.on('movestart', bas); f();
      requestAnimationFrame(function () { requestAnimationFrame(function () {
        m.off('movestart', bas);
        if (basladi && hareketli) { m.once('moveend', function () { clearTimeout(yedek); bizim = false; }); } else { clearTimeout(yedek); bizim = false; }
      }); });
    }
    function sigdir(b, d) {
      var h = b.pad(0.04);
      /* Hedef şimdiki görünümse hareket yok */
      if (m._getBoundsCenterZoom) { var t = m._getBoundsCenterZoom(h, d); if (t && t.zoom === m.getZoom() && m.latLngToContainerPoint(t.center).distanceTo(m.getSize().divideBy(2)) < 8) { return; } }
      bizimle(function () { ozFit.call(m, h, d); });
    }
    /* Dalga 2 mobil · rota: rota yokken canlı başlangıç merkezi (Türkiye, `L.map` `center`) haritanın geometrik ortasında, yani telefonda alt
       sayfanın arkasında kalıyordu; yarım kipte görünür alanda Karadeniz ve Kırım görünüyordu. Aynı merkez ve yakınlık görünür alanın ortasına
       alınır (yalnız ≤860, kullanıcı haritayı oynatmadıysa; kip değişince de) */
    var ilkMerkez = m.getCenter();
    function bosOrtala(d) {
      var z = m.getZoom(), k = m.getSize(), hedefY = (d.paddingTopLeft[1] + k.y - d.paddingBottomRight[1]) / 2;
      bizimle(function () { m.setView(m.unproject(m.project(ilkMerkez, z).add([0, k.y / 2 - hedefY]), z), z, { animate: false }); });
    }
    /* Bulgu #9 + RM-11: detay açıkken seçili pin görünür alanda (detayın üstü; yan sütunda detayın sağı) */
    function pinGoster() {
      var p = document.querySelector('#routeMap .yg-vpin.is-active, #routeMap .yg-vcluster.is-active');
      if (!p || !detayAcik() || !dar.matches) { return; }
      if (hareketli) { m.once('moveend', function () { setTimeout(pinGoster, 0); }); return; }
      var d = dolgu(true), k = m.getSize(), c = m.getContainer().getBoundingClientRect(), r = p.getBoundingClientRect();
      var x = r.left + r.width / 2 - c.left, y = r.top + r.height / 2 - c.top, x0 = d.paddingTopLeft[0], y0 = d.paddingTopLeft[1], x1 = k.x - d.paddingBottomRight[0], y1 = k.y - d.paddingBottomRight[1];
      if (y1 - y0 < 40 || x1 - x0 < 40) { return; }
      var dx = x < x0 || x > x1 ? Math.round(x - (x0 + x1) / 2) : 0, dy = y < y0 || y > y1 ? Math.round(y - (y0 + y1) / 2) : 0;
      if (dx || dy) { m.panBy([dx, dy], { duration: 0.4 }); }
    }
    function degerlendir() {
      if (panel.classList.contains('sheet-dragging') || (serit && serit.classList.contains('rm-surukle'))) { return; }
      var kaydi = kapDuzelt(); m.invalidateSize(false);
      var a = anahtar(), kipDegisti = a !== sonAnahtar, b = sinir();
      if (!dar.matches) { sonAnahtar = a; if (b && kaydi) { bizimle(function () { ozFit.call(m, b.pad(0.04), dolgu()); }); } return; }
      /* Klavye: alan geçici; kapanınca yeniden bakılır (anahtar güncellenmez, bekleyen rota korunur) */
      if (panel.classList.contains('yg-klavye')) { return; }
      sonAnahtar = a;
      if (detayAcik()) { pinGoster(); return; }
      if (a === 'tel:tam') { return; }
      var d = dolgu();
      if (!b) { if (!elle) { bosOrtala(d); } return; }
      if (!(kipDegisti || yeniBekliyor || kaydi) && elle) { return; }
      yeniBekliyor = false; elle = false;
      sigdir(b, d);
    }
    /* Geçişler bitince değerlendir (alt sayfa .34s, şerit, detay yüksekliği); art arda tetiklemelerden yalnız sonuncusu */
    function oturunca(f) {
      var bitti = false, son = function () { if (!bitti) { bitti = true; f(); } };
      requestAnimationFrame(function () { requestAnimationFrame(function () {
        var a = [];
        [panel, serit, detay].forEach(function (el) { if (el && el.getAnimations) { a = a.concat(el.getAnimations().filter(function (x) { return typeof x.transitionProperty === 'string'; })); } });
        if (!a.length) { son(); return; }
        Promise.all(a.map(function (x) { return x.finished.catch(function () { /* iptal: yeni geçiş */ }); })).then(function () { setTimeout(son, 0); });
        setTimeout(son, 900);
      }); });
    }
    /* Yeni rota beklerken (rota çizildi, yeni kip birazdan atanacak) araya giren tetikleme değerlendirmeyi öne çekmez: tek kayma */
    var hedef = 0;
    function sonra(yeni, ms) {
      if (yeni) { yeniBekliyor = true; }
      var t = Date.now() + (ms || 0); if (yeniBekliyor && hedef > t) { t = hedef; } hedef = t;
      var no = ++sira; clearTimeout(zaman);
      zaman = setTimeout(function () { oturunca(function () { if (no === sira) { degerlendir(); } }); }, t - Date.now());
    }
    /* Canlı `fitActive` (rota çizgisinin .04 paylı sınırı): telefonda ve yan sütunda yerine bizim sığdırmamız, kip oturunca */
    m.fitBounds = function (b, o) {
      if (!bizim && dar.matches && b && b.equals) { var r = sinir(); if (r && b.equals(r.pad(0.04), 1e-9)) { sonra(true, 200); return m; } }
      return ozFit.apply(m, arguments);
    };
    /* Elle: sürükleme her zaman; bizim olmayan her hareket (iki parmak, tekerlek, +/−, mekâna ya da kümeye uçuş) */
    m.on('movestart', function () { hareketli = true; if (!bizim) { elle = true; } });
    m.on('moveend', function () { hareketli = false; });
    m.on('dragstart', function () { elle = true; });
    /* Canlı betik rotayı `dg:rota`dan sonra çizer; yeni kip (Keşif) 150 ms'de atanır: ondan sonra, geçiş bitince */
    document.addEventListener('dg:rota', function () { sonra(true, 200); });
    var izle = function (el, at) { if (el) { new MutationObserver(function () { sonra(false, 0); }).observe(el, { attributes: true, attributeFilter: at }); } };
    izle(panel, ['class']); izle(serit, ['class', 'hidden']); izle(detay, ['class', 'hidden']);
    window.addEventListener('resize', function () { sonra(false, 120); });
    if (window.visualViewport) { window.visualViewport.addEventListener('resize', function () { sonra(false, 120); }); }
    window.dgRotaDolgu = function () { return dolgu(true); };
    sonra(false, 60);
  }

  /* Dalga 2 mobil · rota (11 Kas) · Klavye. Telefonda (≤860) yarım ya da peek alt sayfadaki girdiye dokununca klavye görüntü alanını
     küçültüyor, girdi alt kenarda, öneri listesi ekran dışında kalıyordu. Odakta panel `.yg-klavye` ile tam konuma çıkar (canlı betiğin kipi
     değişmez; harita sığdırma kip gözlemcisi tetiklenmez), girdi kaydırma alanının başına alınır, tarayıcının kaydırdığı `.yg-app` sıfırlanır;
     görüntü alanı değişince (klavye açılıp kapanınca) yeniden yerleştirilir. Odak paneldeki başka bir metin girdisine geçmediyse sınıf kalkar */
  (function klavyeKur() {
    var panel = document.querySelector('.yg-panel'), app = document.querySelector('.yg-app'), dar = window.matchMedia('(max-width:860px)');
    if (!panel) { return; }
    var metin = function (e) { return e && e.matches && e.matches('input:not([type]),input[type="text"],input[type="search"]') && panel.contains(e); };
    var kaydiran = function (e) { for (var a = e.parentElement; a && a !== panel; a = a.parentElement) { if (/auto|scroll/.test(getComputedStyle(a).overflowY)) { return a; } } return null; };
    var yerlestir = function (e) {
      if (app) { app.scrollTop = 0; } var k = kaydiran(e); if (!k) { return; }
      k.scrollTop += e.getBoundingClientRect().top - k.getBoundingClientRect().top - 8;
    };
    var zaman = 0;
    panel.addEventListener('focusin', function (e) {
      if (!dar.matches || !metin(e.target)) { return; }
      clearTimeout(zaman); panel.classList.add('yg-klavye');
      /* panel geçişi .34s; yerleştirme geçiş bitince */
      zaman = setTimeout(function () { if (metin(document.activeElement)) { yerlestir(document.activeElement); } }, 360);
    });
    panel.addEventListener('focusout', function () {
      setTimeout(function () { if (!metin(document.activeElement)) { clearTimeout(zaman); panel.classList.remove('yg-klavye'); if (app) { app.scrollTop = 0; } } }, 0);
    });
    var vv = window.visualViewport || window;
    vv.addEventListener('resize', function () { if (panel.classList.contains('yg-klavye') && metin(document.activeElement)) { clearTimeout(zaman); zaman = setTimeout(function () { yerlestir(document.activeElement); }, 120); } });
  })();

  /* RM-11 (Beyar 11 Kas) · Telefon alt sayfası dört kip: harita (yalnız özet satırı) · kesif (özet + şerit; rota kurulunca varsayılan) ·
     yarim · tam. Canlı betik değişmez: onun kipi (peek/half/full) ve şerit açık/kapalı tercihi kendi düğmeleriyle sürülür (gizli "Haritayı
     Gör / Listeyi Gör" düğmeleri, şerit tutamağı; tam kip için tutamağa canlının beklediği sürükleme dizisi). Sürükleme burada: tutamak,
     özet satırı, şerit (dikey) ve içerik en üstteyken aşağı çekme; dokunma ve fare aynı işaretçi olaylarıyla, içerik çekmesi dokunma
     olaylarıyla. `.yg-app[data-rm-kip]`, `--rm-alt` (alt yığın yüksekliği: konum ve +/− düğmesi), `--rm-serit-h` CSS'e yazılır.
     Detay alt sayfada (Keşif yüksekliği; yukarı çekince tam, aşağı çekince kapanır); listeden açılan detay kapanınca listeye dönülür.
     Yan sütunda (yatay/kısa ekran, ≥700 tablet) canlı kip peek'te tutulur, görünüm CSS'te */
  (function altSayfaKur() {
    var app = document.querySelector('.yg-app'), panel = document.querySelector('.yg-panel');
    if (!app || !panel || !window.PointerEvent) { return; }
    var TEL = window.matchMedia('(max-width:640px),(max-width:699px) and (min-height:501px)');
    var YAN = window.matchMedia('(min-width:641px) and (max-width:860px) and (max-height:500px),(min-width:700px) and (max-width:860px)');
    var $ = function (s) { return document.querySelector(s); };
    var grip = $('.yg-sheet-grip'), ctx = $('#ygSheetCtx'), serit = $('#ygDash'), detay = $('#ygDetail'), tum = $('#viewAll'), ozet = $('#ygSummary');
    var prob = document.createElement('div');
    prob.style.cssText = 'position:fixed;left:0;bottom:0;width:0;visibility:hidden;pointer-events:none;height:env(safe-area-inset-bottom,0px)';
    document.body.appendChild(prob);
    var sa = function () { return prob.offsetHeight || 0; };
    var canliKip = function () { return ['peek', 'half', 'full'].filter(function (d) { return panel.classList.contains('sheet-' + d); })[0] || 'half'; };
    var seritVar = function () { return !!serit && !serit.hidden && !serit.classList.contains('full-hidden') && getComputedStyle(serit).display !== 'none'; };
    var seritAcik = function () { return seritVar() && !serit.classList.contains('collapsed'); };
    var detayAcik = function () { return !!detay && !detay.hidden; };
    var kip = function () { var k = canliKip(); return k === 'full' ? 'tam' : k === 'half' ? 'yarim' : (seritAcik() ? 'kesif' : 'harita'); };
    var seritH = 217;
    /* Kip ve alt yığın: CSS değişkenleri */
    function yaz() {
      bekleyen = 0;
      if (!TEL.matches && !YAN.matches) { delete app.dataset.rmKip; delete app.dataset.rmKlavye; delete app.dataset.rmZoomYok; app.style.removeProperty('--rm-alt'); return; }
      var k = kip(), vh = window.innerHeight, alt = 0, kl = panel.classList.contains('yg-klavye');
      app.dataset.rmKip = k;
      if (kl) { app.dataset.rmKlavye = ''; } else { delete app.dataset.rmKlavye; }
      if (TEL.matches) {
        if (k === 'kesif' && serit.offsetHeight) { seritH = serit.offsetHeight; }
        if (kl) { alt = vh - 60; } else if (detayAcik()) { alt = detay.offsetHeight; } else { alt = k === 'tam' ? vh - 60 : k === 'yarim' ? Math.round(vh * 0.52) : k === 'kesif' ? 56 + sa() + seritH : 76 + sa(); }
      } else if (seritAcik()) { alt = serit.offsetHeight + 16; }
      /* +/− konum düğmesinin üstünde yer bulamazsa (yatay ekranda şerit açık) gizlenir; iki parmakla yakınlaştırma kalır */
      if (vh - alt - 16 - 44 - 8 - 90 < 68) { app.dataset.rmZoomYok = ''; } else { delete app.dataset.rmZoomYok; }
      app.style.setProperty('--rm-alt', alt + 'px');
      app.style.setProperty('--rm-serit-h', seritH + 'px');
    }
    var bekleyen = 0;
    var yazSonra = function () { if (!bekleyen) { bekleyen = requestAnimationFrame(yaz); } };
    var izle = function (el, at) { if (el) { new MutationObserver(yazSonra).observe(el, { attributes: true, attributeFilter: at }); } };
    izle(panel, ['class']); izle(serit, ['class', 'hidden']); izle(document.body, ['class']);
    window.addEventListener('resize', yazSonra);
    /* Canlı kipi sür */
    var gecis = false;
    var tikla = function (s) { var e = $(s); if (e) { gecis = true; try { e.click(); } finally { gecis = false; } } };
    function canliTam() {
      if (!grip) { return; }
      gecis = true;
      try {
        grip.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, clientY: 10000, pointerId: 77, pointerType: 'touch' }));
        window.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, cancelable: true, clientY: 0, pointerId: 77, pointerType: 'touch' }));
        window.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 77, pointerType: 'touch' }));
      } finally { gecis = false; }
    }
    function kipAta(h) {
      /* "Haritayı Gör" canlıda peek'e iner ve şeridi kullanıcının açık/kapalı tercihine döndürür (peek'teyken de: şerit gizliyken
         kurulan rota şeridi kapalı bırakabiliyor). Tercih ancak gerekirse şerit tutamağıyla değişir */
      if (YAN.matches) { h = h === 'kesif' ? 'kesif' : 'harita'; }
      if (h === 'tam') { if (canliKip() !== 'full') { canliTam(); } return; }
      if (h === 'yarim') { if (canliKip() !== 'half') { tikla('#ygViewToggle [data-v="list"]'); } return; }
      tikla('#ygViewToggle [data-v="map"]');
      if (!seritVar()) { return; }
      if ((h === 'kesif') === serit.classList.contains('collapsed')) { tikla('#ygDashHandle'); }
    }
    window.dgRotaKip = { ata: kipAta, oku: kip };
    /* Sürükleme: yığının üst kenarı parmağı izler, bırakınca en yakın kip (hızlı fiske ya da 40 px'ten uzun çekme bir kip ilerletir) */
    var adaylar = function () {
      var vh = window.innerHeight, s = sa(), l = [['harita', vh - 76 - s]];
      if (seritVar()) { l.push(['kesif', vh - 56 - s - seritH]); }
      l.push(['yarim', Math.round(vh * 0.48)], ['tam', 60]);
      return l;
    };
    var g = null, sonSurukle = 0;
    function basla(x, y, kaynak, id) {
      if (!TEL.matches || detayAcik() || panel.classList.contains('yg-klavye')) { return false; }
      var k = kip(), l = adaylar(), a = l.filter(function (q) { return q[0] === k; })[0];
      var T0 = panel.getBoundingClientRect().top - (window.innerHeight - panel.offsetHeight);
      g = { x0: x, y0: y, k0: k, ust0: a ? a[1] : l[0][1], T0: T0, eksen: null, kaynak: kaynak, id: id, iz: [[Date.now(), y]] };
      return true;
    }
    function hareket(x, y) {
      if (!g) { return false; }
      var dy = y - g.y0, dx = x - g.x0;
      if (!g.eksen) {
        if (Math.abs(dy) < 6 && Math.abs(dx) < 6) { return false; }
        g.eksen = Math.abs(dy) > Math.abs(dx) ? 'y' : 'x';
        if (g.eksen === 'x') { g = null; return false; }
      }
      var vh = window.innerHeight, H = panel.offsetHeight, enAlt = H - 76 - sa();
      if (g.k0 === 'kesif' && dy > 0) {
        serit.classList.add('rm-surukle'); serit.style.transform = 'translateY(' + dy + 'px)';
      } else {
        panel.classList.add('sheet-dragging');
        panel.style.transform = 'translateY(' + Math.max(0, Math.min(enAlt, g.T0 + dy)) + 'px)';
        if (g.k0 === 'kesif') { serit.classList.add('rm-surukle'); serit.style.transform = 'translateY(' + Math.max(dy, 60 - (vh - 56 - sa() - seritH)) + 'px)'; }
      }
      g.iz.push([Date.now(), y]); if (g.iz.length > 6) { g.iz.shift(); }
      return true;
    }
    function bitir(y) {
      var s = g; g = null; if (!s) { return; }
      if (!s.eksen) { if (s.kaynak === 'tutamak') { dokun(); } return; }
      var dy = y - s.y0, ilk = s.iz[0], hiz = (y - ilk[1]) / Math.max(1, Date.now() - ilk[0]);
      var l = adaylar(), sira = l.map(function (q) { return q[0]; }), i0 = sira.indexOf(s.k0), ust = s.ust0 + dy;
      var h = l.slice().sort(function (a, b) { return Math.abs(a[1] - ust) - Math.abs(b[1] - ust); })[0][0];
      var adim = function (yon) { return sira[Math.max(0, Math.min(sira.length - 1, (i0 < 0 ? 0 : i0) + yon))]; };
      if (Math.abs(hiz) > 0.6) { h = adim(hiz < 0 ? 1 : -1); } else if (h === s.k0 && Math.abs(dy) > 40) { h = adim(dy < 0 ? 1 : -1); }
      sonSurukle = Date.now();
      panel.classList.remove('sheet-dragging'); panel.style.transform = '';
      serit.classList.remove('rm-surukle'); serit.style.transform = '';
      kipAta(h); yazSonra();
    }
    function dokun() {
      var k = kip();
      kipAta(k === 'harita' ? (seritVar() ? 'kesif' : 'yarim') : k === 'yarim' ? (seritVar() ? 'kesif' : 'harita') : k === 'tam' ? 'yarim' : 'yarim');
    }
    var isaretci = function (el, kaynak, sart) {
      if (!el) { return; }
      el.addEventListener('pointerdown', function (e) {
        if (gecis || (e.pointerType === 'mouse' && e.button !== 0)) { return; }
        if (!TEL.matches || (sart && !sart(e))) { return; }
        if (kaynak === 'tutamak') { e.stopImmediatePropagation(); }
        if (basla(e.clientX, e.clientY, kaynak, e.pointerId) && kaynak !== 'serit') { try { el.setPointerCapture(e.pointerId); } catch (x) { /* yakalama yok */ } }
      }, true);
    };
    isaretci(grip, 'tutamak');
    isaretci(ctx, 'ozet');
    isaretci(serit, 'serit', function () { return kip() === 'kesif'; });
    window.addEventListener('pointermove', function (e) { if (g && g.id === e.pointerId && hareket(e.clientX, e.clientY) && e.cancelable) { e.preventDefault(); } }, { passive: false });
    window.addEventListener('pointerup', function (e) { if (g && g.id === e.pointerId) { bitir(e.clientY); } });
    window.addEventListener('pointercancel', function (e) { if (g && g.id === e.pointerId) { if (g.eksen === 'y') { bitir(g.iz[g.iz.length - 1][1]); } else { g = null; } } });
    /* Sürüklemeden sonra gelen tıklama (fare) kip değiştirmez, kart açmaz */
    [ctx, serit].forEach(function (el) { if (el) { el.addEventListener('click', function (e) { if (!gecis && Date.now() - sonSurukle < 400) { e.preventDefault(); e.stopImmediatePropagation(); } }, true); } });
    /* İçerik en üstteyken aşağı çekme alt sayfayı bir kip indirir (yarım/tam); tarayıcı kaydırması dokunma olaylarıyla durdurulur */
    var kaydiranUst = function (t) { for (var a = t; a && a !== panel; a = a.parentElement) { if (a.scrollTop > 0 && /auto|scroll/.test(getComputedStyle(a).overflowY)) { return false; } } return true; };
    var ic = null;
    panel.addEventListener('touchstart', function (e) {
      ic = null;
      if (!TEL.matches || e.touches.length !== 1 || e.target.closest('.yg-sheet-grip,#ygSheetCtx,.yg-stop .yg-grip,input,select,textarea')) { return; }
      var k = kip(); if (k !== 'yarim' && k !== 'tam') { return; }
      ic = { x: e.touches[0].clientX, y: e.touches[0].clientY, ust: kaydiranUst(e.target), surer: false };
    }, { passive: true });
    panel.addEventListener('touchmove', function (e) {
      if (!ic) { return; }
      var t = e.touches[0], dy = t.clientY - ic.y, dx = t.clientX - ic.x;
      if (!ic.surer) {
        if (Math.abs(dy) < 6 && Math.abs(dx) < 6) { return; }
        if (!ic.ust || dy <= 0 || Math.abs(dx) > Math.abs(dy) || !basla(ic.x, ic.y, 'icerik', 'dokunma')) { ic = null; return; }
        ic.surer = true;
      }
      hareket(t.clientX, t.clientY); if (e.cancelable) { e.preventDefault(); }
    }, { passive: false });
    var icBitir = function (e) { if (ic && ic.surer && g && g.id === 'dokunma') { var t = e.changedTouches[0]; bitir(t ? t.clientY : ic.y); } ic = null; };
    panel.addEventListener('touchend', icBitir); panel.addEventListener('touchcancel', icBitir);
    /* Detay alt sayfası: yukarı çekme tam, tamda en üstteyken aşağı çekme Keşif yüksekliği, kısa hâlde aşağı çekme kapatır */
    var dt = null;
    if (detay) {
      detay.addEventListener('touchstart', function (e) { dt = TEL.matches && e.touches.length === 1 ? { y: e.touches[0].clientY, x: e.touches[0].clientX, ust: detay.scrollTop <= 0, bitti: false } : null; }, { passive: true });
      detay.addEventListener('touchmove', function (e) {
        if (!dt || dt.bitti) { if (dt && dt.bitti && e.cancelable) { e.preventDefault(); } return; }
        var t = e.touches[0], dy = t.clientY - dt.y, dx = t.clientX - dt.x, tam = detay.classList.contains('rm-detay-tam');
        if (Math.abs(dx) > Math.abs(dy)) { return; }
        if (!tam && dy < -12) { detay.classList.add('rm-detay-tam'); dt.bitti = true; }
        else if (dt.ust && dy > 12 && tam) { detay.classList.remove('rm-detay-tam'); dt.bitti = true; }
        else if (dt.ust && dy > 60 && !tam) { dt.bitti = true; tikla('#ygDetailClose'); }
        else if (!dt.ust || (tam && dy < 0)) { dt = null; return; }
        if (e.cancelable) { e.preventDefault(); }
      }, { passive: false });
      new MutationObserver(function () { yazSonra(); }).observe(detay, { attributes: true, attributeFilter: ['class'] });
      detay.addEventListener('transitionend', yazSonra);
    }
    /* Detay: açılınca kısa hâl (seçili pin görünür alana: `haritaSigdirKur` `pinGoster`); listeden açıldıysa kapanınca liste (tam kip) geri gelir */
    var listeden = false;
    if (detay) {
      new MutationObserver(function () {
        if (detayAcik()) {
          listeden = !!tum && !tum.hidden; detay.classList.remove('rm-detay-tam'); detay.scrollTop = 0;
        } else if (listeden) { listeden = false; if (TEL.matches && tum && !tum.hidden) { canliTam(); } }
        yazSonra();
      }).observe(detay, { attributes: true, attributeFilter: ['hidden'] });
    }
    /* Rota kurulunca Keşif (yeni rota: pilot seçimi ya da rotasızdan rotalıya geçiş; sonraki yeniden hesaplamalar kipi değiştirmez) */
    var rotaVardi = false, pilot = false;
    document.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('.yg-pilot')) { pilot = true; } }, true);
    if (ozet) { new MutationObserver(function () { if (ozet.hidden) { rotaVardi = false; } }).observe(ozet, { attributes: true, attributeFilter: ['hidden'] }); }
    document.addEventListener('dg:rota', function () {
      var yeni = pilot || !rotaVardi; pilot = false;
      /* Yan sütunda yeni rota: kısa ekranda (≤500) Harita (şerit 330 px haritanın üçte ikisini örterdi; "Yol üstü mekânlar" tutamağı açar),
         tablette Keşif; yeniden hesaplamada kullanıcının şerit tercihi geri gelir */
      var dene = function () {
        rotaVardi = rotaVardi || !ozet.hidden;
        if (detayAcik() || panel.classList.contains('yg-klavye') || (tum && !tum.hidden)) { return; }
        if (YAN.matches) { kipAta(yeni ? (window.innerHeight <= 500 ? 'harita' : 'kesif') : kip()); } else if (yeni && TEL.matches) { kipAta('kesif'); }
      };
      setTimeout(dene, 150); setTimeout(function () { if (yeni && TEL.matches && kip() === 'harita' && seritVar()) { dene(); } }, 1100);
    });
    /* Özet satırındaki "Haritada gör" (yarım kipteki mekân sayısı) Keşif'e götürür */
    var bc = $('#ygBrowseCta'); if (bc) { bc.addEventListener('click', function () { setTimeout(function () { if (TEL.matches) { kipAta('kesif'); } }, 0); }); }
    /* Yan sütun: canlı kip peek'te kalır (şerit canlıda yalnız peek'te görünür); liste açıkken dokunulmaz */
    new MutationObserver(function () {
      if (YAN.matches && canliKip() !== 'peek' && !(tum && !tum.hidden) && !panel.classList.contains('sheet-dragging')) { setTimeout(function () { if (YAN.matches && canliKip() !== 'peek' && !(tum && !tum.hidden)) { tikla('#ygViewToggle [data-v="map"]'); } }, 0); }
    }).observe(panel, { attributes: true, attributeFilter: ['class'] });
    var mq = function () { yazSonra(); if (YAN.matches && canliKip() !== 'peek') { setTimeout(function () { tikla('#ygViewToggle [data-v="map"]'); }, 0); } };
    [TEL, YAN].forEach(function (q) { if (q.addEventListener) { q.addEventListener('change', mq); } });
    /* Bulgu #11 · Kümeye dokununca (yakınlık < 13) kümedeki mekânların sınırına, görünür harita alanına sığdırılır (canlı: hücre ortasına uçuş).
       Üyeler canlının ızgarasıyla (48 px) aynı hücrede kalan mekânlar */
    document.addEventListener('click', function (e) {
      var c = e.target.closest && e.target.closest('#routeMap .yg-vcluster'), m = window.dgRotaHarita;
      if (!c || !m || !window.matchMedia('(max-width:860px)').matches || m.getZoom() >= 13 || !sonMekan.length) { return; }
      var r = c.getBoundingClientRect(), k = m.getContainer().getBoundingClientRect(), z = m.getZoom();
      var pc = m.project(m.containerPointToLatLng([r.left + r.width / 2 - k.left, r.top + r.height / 2 - k.top]), z), col = Math.floor(pc.x / 48), row = Math.floor(pc.y / 48);
      var uye = sonMekan.filter(function (x) { var p = m.project([x.lat, x.lng], z); return Math.floor(p.x / 48) === col && Math.floor(p.y / 48) === row; });
      if (uye.length < 2) { return; }
      e.stopPropagation(); e.preventDefault();
      var d = window.dgRotaDolgu ? window.dgRotaDolgu() : {}, o = { maxZoom: 13, duration: 0.7 }; for (var a in d) { o[a] = d[a]; }
      m.flyToBounds(window.L.latLngBounds(uye.map(function (x) { return [x.lat, x.lng]; })), o);
    }, true);
    /* Bulgu #16 · Atıf telefonda (i) düğmesiyle kapalı başlar (Mekânlar/Etkinlikler MapLibre kalıbı) */
    var atifKur = function () {
      var kap = document.querySelector('#routeMap .leaflet-bottom.leaflet-right'); if (!kap || kap.querySelector('.rm-atif')) { return; }
      var b = document.createElement('button'); b.type = 'button'; b.className = 'rm-atif leaflet-control'; b.setAttribute('aria-label', 'Harita kaynaklarını göster'); b.setAttribute('aria-expanded', 'false');
      b.innerHTML = '<i class="fa-solid fa-circle-info" aria-hidden="true"></i>';
      if (window.L && window.L.DomEvent) { window.L.DomEvent.disableClickPropagation(b); }
      b.addEventListener('click', function () { var ac = kap.classList.toggle('rm-atif-acik'); b.setAttribute('aria-expanded', String(ac)); b.setAttribute('aria-label', ac ? 'Harita kaynaklarını gizle' : 'Harita kaynaklarını göster'); });
      kap.insertBefore(b, kap.firstChild);
    };
    var hazir = function () { atifKur(); yaz(); };
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', hazir); } else { setTimeout(hazir, 0); }
    window.addEventListener('load', hazir);
  })();

  /* Dalga 2 mobil · rota (11 Kas) · Dokunarak durak sıralama. Canlı liste yalnız HTML sürükle-bırak (`draggable`, `dragstart`/`drop`) dinler;
     dokunmatik tarayıcı bu olayları parmak hareketinden üretmediği için telefonda sıralama yoktu. Tutamaktan başlayan fare dışı işaretçi
     hareketi izlenir, parmağın altındaki durak vurgulanır (canlı `.dragging` / `.drop-into`), bırakınca canlının işleyicilerine aynı
     `dragstart` → `drop` → `dragend` dizisi gönderilir: sıra, harita ve rota canlı kodla yenilenir. Fare canlı davranışta kalır */
  (function durakSurukleKur() {
    var liste = document.getElementById('ygStopList');
    if (!liste || !window.PointerEvent) { return; }
    var kaynak = null, hedef = null, no = null, y0 = 0, oynadi = false;
    var ol = function (tip, el, dt) { var e; try { e = new DragEvent(tip, { bubbles: true, cancelable: true, dataTransfer: dt }); } catch (x) { e = new Event(tip, { bubbles: true, cancelable: true }); } el.dispatchEvent(e); };
    var bitir = function (iptal) {
      if (!kaynak) { return; }
      var k = kaynak, h = hedef; kaynak = hedef = null; k.classList.remove('dragging'); if (h) { h.classList.remove('drop-into'); }
      if (iptal || !oynadi || !h) { return; }
      var dt = null; try { dt = new DataTransfer(); } catch (x) { /* eski tarayıcı */ }
      ol('dragstart', k, dt); ol('drop', h, dt); ol('dragend', k, dt);
    };
    liste.addEventListener('pointerdown', function (e) {
      var g = e.pointerType !== 'mouse' && e.target.closest('.yg-grip'); if (!g) { return; }
      kaynak = g.closest('.yg-stop'); hedef = null; no = e.pointerId; y0 = e.clientY; oynadi = false;
      try { g.setPointerCapture(no); } catch (x) { /* yakalama yok */ }
      e.preventDefault();
    });
    liste.addEventListener('pointermove', function (e) {
      if (!kaynak || e.pointerId !== no) { return; }
      if (!oynadi && Math.abs(e.clientY - y0) < 6) { return; }
      if (!oynadi) { oynadi = true; kaynak.classList.add('dragging'); }
      var el = document.elementFromPoint(e.clientX, e.clientY), li = el && el.closest('#ygStopList .yg-stop');
      li = li && li !== kaynak ? li : null;
      if (li !== hedef) { if (hedef) { hedef.classList.remove('drop-into'); } hedef = li; if (hedef) { hedef.classList.add('drop-into'); } }
      e.preventDefault();
    });
    liste.addEventListener('pointerup', function (e) { if (e.pointerId === no) { bitir(false); } });
    liste.addEventListener('pointercancel', function (e) { if (e.pointerId === no) { bitir(true); } });
  })();

  /* RM-11 · Bulgu #6 (Beyar 11 Kas) · Rota varken "Nereden / Ara duraklar / Nereye" girdileri tek satıra katlanır: "İstanbul → Ankara";
     sığmazsa "İstanbul → … → Antalya · 2 ara durak". Satır akordeon başlığıdır (`button`, `aria-expanded`, `aria-controls` durak bölümü):
     dokununca girdiler, sürükle-sırala, sil, Ara Durak Ekle, Konumumu kullan, Başlangıç ve Varışı Değiştir eskisi gibi açılır; tekrar katlanır.
     Yeni rotada (rotasızdan rotalıya ya da pilot seçimi) katlı; kullanıcı açtıysa yeniden hesaplamada açık kalır; rota temizlenince ve
     Yeni Rota Oluştur'da açık (satır gizli). Görünüm ve sıra yalnız ≤860 (telefon ve yan sütun, `gourmet-sapma.css` RM-11); masaüstü aynen */
  (function durakKatlaKur() {
    var vr = document.getElementById('viewRoute'), rota = vr && vr.querySelector('.yg-route'), liste = document.getElementById('ygStopList'), ozet = document.getElementById('ygSummary');
    if (!rota || !liste || !ozet) { return; }
    if (!rota.id) { rota.id = 'ygRouteStops'; }
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'rm-durak-ozet'; b.hidden = true; b.setAttribute('aria-controls', rota.id); b.setAttribute('aria-expanded', 'true');
    b.innerHTML = '<i class="fa-solid fa-route" aria-hidden="true"></i><span class="rm-durak-metin"></span><span class="rm-durak-ek"></span><i class="fa-solid fa-chevron-down rm-durak-ok" aria-hidden="true"></i>';
    rota.parentNode.insertBefore(b, rota);
    var metin = b.querySelector('.rm-durak-metin'), ek = b.querySelector('.rm-durak-ek'), katli = false, acik = false, pilot = false;
    /* Girdide "İstanbul, Marmara" / "Kadıköy, İstanbul": özette yalnız yer adı */
    var adlar = function () { return [].map.call(liste.querySelectorAll('.yg-stop-input'), function (i) { return (i.value || '').split(',')[0].trim(); }).filter(Boolean); };
    function yaz() {
      var a = adlar(), n = a.length;
      b.setAttribute('aria-label', 'Güzergâh durakları: ' + a.join(', ') + (katli ? '. Durakları düzenlemek için aç' : ''));
      metin.textContent = a.join(' → '); ek.textContent = '';
      /* Tam zincir sığmazsa kısa biçim (görünürken ölçülür) */
      if (n > 2 && b.offsetWidth && metin.scrollWidth > metin.clientWidth + 1) {
        metin.textContent = a[0] + ' → … → ' + a[n - 1]; ek.textContent = '· ' + (n - 2) + ' ara durak';
      }
    }
    /* `acik`: kullanıcı satırı açtı. Durak düzenlerken rota bir an düşse de (bir girdi temizlendi) açık kalır; bütün girdiler boşalınca
       (rota temizlendi, Yeni Rota Oluştur) ve pilot seçiminde tercih sıfırlanır */
    function uygula() {
      var var_ = !ozet.hidden;
      if (pilot || !adlar().length) { acik = false; }
      pilot = false; katli = var_ && !acik;
      b.hidden = !var_;
      vr.classList.toggle('rm-durak-katli', katli);
      b.setAttribute('aria-expanded', String(!katli));
      if (var_) { yaz(); }
    }
    b.addEventListener('click', function () { acik = katli; uygula(); });
    document.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('.yg-pilot')) { pilot = true; } }, true);
    new MutationObserver(uygula).observe(ozet, { attributes: true, attributeFilter: ['hidden'] });
    document.addEventListener('dg:rota', function () { setTimeout(uygula, 0); });
    window.addEventListener('resize', function () { if (!b.hidden) { yaz(); } });
    uygula();
  })();

  /* Yer araması (Beyar, 9 Kas: "trabzon" eşleşmiyordu): 81 il ve başlıca ilçe/semt `rota-yerler.js`ten.
     Türkçe duyarlı ve büyük-küçük harften bağımsız: İ/ı/I/i, ş, ğ, ü, ö, ç katlanır; "IZMIR", "ızmir", "istanbul" eşleşir */
  var Y = window.DG_YERLER || { il: [], ilce: [] };
  var YERLER = Y.il.map(function (y) { return { id: y[0], ad: y[1], alt: y[2], lat: y[3], lng: y[4], tur: 'city' }; })
    .concat(Y.ilce.map(function (y, i) { return { id: 1000 + i, ad: y[0], alt: y[1], lat: y[2], lng: y[3], tur: 'district' }; }));
  var ILLER = YERLER.filter(function (y) { return y.tur === 'city'; });
  var katla = function (s) { return String(s).toLocaleLowerCase('tr').replace(/[ıİI]/g, 'i').replace(/i̇/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/[âà]/g, 'a').replace(/[îì]/g, 'i').replace(/[ûù]/g, 'u').replace(/\s+/g, ' ').trim(); };
  YERLER.forEach(function (y) { y.k = katla(y.ad); y.ka = katla(y.alt); });
  window.dgKatla = katla;
  function yerAra(q) {
    var a = katla(q); if (!a) { return []; }
    return YERLER.map(function (y) {
      var p = y.k === a ? 0 : y.k.indexOf(a) === 0 ? 1 : (' ' + y.k).indexOf(' ' + a) >= 0 ? 2 : (a.length > 2 && y.k.indexOf(a) > 0) ? 3 : (a.length > 2 && y.ka.indexOf(a) === 0) ? 4 : -1;
      return { y: y, p: p < 0 ? -1 : p * 2 + (y.tur === 'city' ? 0 : 1) };
    }).filter(function (x) { return x.p >= 0; }).sort(function (x, z) { return x.p - z.p || x.y.ad.localeCompare(z.y.ad, 'tr'); }).slice(0, 8)
      .map(function (x) { return { id: x.y.id, ad: x.y.ad, alt: x.y.alt, lat: x.y.lat, lng: x.y.lng, tur: x.y.tur }; });
  }
  var km = function (a, b, c, d) { var r = Math.PI / 180, x = (d - b) * r * Math.cos((a + c) * r / 2), y = (c - a) * r; return Math.sqrt(x * x + y * y) * 6371; };
  /* Yedek koridor (Beyar, 9 Kas; 10 Kas'tan beri yalnız OSRM'e ulaşılamazsa): rota `rota-yol-agi.js` kara yolu ağı üstünden en kısa yol; denizden düz geçmez.
     İl merkezi olmayan durak (ilçe, mekân, ürün durağı) en yakın iki il düğümüne bağlanır; kıyıda dolanan ilçeler ağdaki ara noktayla.
     Çizgi ve il kartı aynı kaynaktan: geçilen il düğümleri ve bağların içinden geçtiği iller (`dgRotaIller`). Hesaplanmış yol değildir; haritada "Örnek koridor" etiketi taşır */
  var AG = window.DG_YOL_AGI || { bag: [], ilce: {} }, DUGUM = {}, KOMSU = {};
  ILLER.forEach(function (y) { DUGUM[y.ad] = y; KOMSU[y.ad] = []; });
  var hatUzun = function (n) { var t = 0; for (var i = 1; i < n.length; i++) { t += km(n[i - 1][0], n[i - 1][1], n[i][0], n[i][1]); } return t; };
  var bagla = function (a, b, ara, il) {
    var A = DUGUM[a], B = DUGUM[b]; if (!A || !B) { return; }
    var n = [[A.lat, A.lng]].concat(ara || [], [[B.lat, B.lng]]), w = hatUzun(n);
    KOMSU[a].push({ b: b, n: n, w: w, il: il || [] }); KOMSU[b].push({ b: a, n: n.slice().reverse(), w: w, il: (il || []).slice().reverse() });
  };
  AG.bag.forEach(function (e) { bagla(e[0], e[1], e[2], e[3]); });
  function enKisa(bas, uclar) {
    var d = {}, onceki = {}, acik = Object.keys(bas);
    acik.forEach(function (k) { d[k] = bas[k].w; });
    var kume = {}; acik.forEach(function (k) { kume[k] = 1; });
    while (Object.keys(kume).length) {
      var u = Object.keys(kume).sort(function (x, y) { return d[x] - d[y]; })[0]; delete kume[u];
      if (uclar[u]) { /* hedefe bağlı düğüm: toplam maliyet ucun kendi bağıyla */ }
      (KOMSU[u] || []).forEach(function (e) { var nd = d[u] + e.w; if (d[e.b] === undefined || nd < d[e.b]) { d[e.b] = nd; onceki[e.b] = { u: u, e: e }; kume[e.b] = 1; } });
    }
    var en = null; Object.keys(uclar).forEach(function (k) { if (d[k] !== undefined && (!en || d[k] + uclar[k].w < en.t)) { en = { k: k, t: d[k] + uclar[k].w }; } });
    if (!en) { return null; }
    var yol = [], k = en.k; while (onceki[k]) { yol.unshift(onceki[k].e); k = onceki[k].u; }
    return { bas: bas[k], yol: yol, son: uclar[en.k] };
  }
  /* Durağın ağa bağları: il merkeziyse kendisi, değilse en yakın iki il (ilçe tablosunda ara noktalı bağ varsa o) */
  function baglar(s) {
    var o = {};
    var il = ILLER.filter(function (y) { return km(y.lat, y.lng, s.lat, s.lng) < 3; })[0];
    if (il) { o[il.ad] = { w: 0, n: [[il.lat, il.lng]] }; return o; }
    var ozel = AG.ilce[s.ad];
    if (ozel) { ozel.forEach(function (x) { var Y = DUGUM[x[0]], n = [[Y.lat, Y.lng]].concat(x[1], [[s.lat, s.lng]]); o[x[0]] = { w: hatUzun(n), n: n }; }); return o; }
    ILLER.slice().sort(function (x, y) { return km(x.lat, x.lng, s.lat, s.lng) - km(y.lat, y.lng, s.lat, s.lng); }).slice(0, 2)
      .forEach(function (Y) { var n = [[Y.lat, Y.lng], [s.lat, s.lng]]; o[Y.ad] = { w: hatUzun(n), n: n }; });
    return o;
  }
  var gecilenIller = [], hat = [];
  function koridor(a, b) {
    var ba = baglar(a), bb = baglar(b), ilA = Object.keys(ba), ilB = Object.keys(bb);
    var bas = {}; ilA.forEach(function (k) { bas[k] = { w: ba[k].w, n: ba[k].n.slice().reverse(), k: k }; });
    var r = enKisa(bas, bb); if (!r) { return { n: [[a.lat, a.lng], [b.lat, b.lng]], il: [] }; }
    var n = r.bas.n.slice(), il = [r.bas.k];
    r.yol.forEach(function (e) { n = n.concat(e.n.slice(1)); il = il.concat(e.il, [e.b]); });
    n = n.concat(r.son.n.slice(1));
    return { n: n, il: il };
  }
  window.dgRotaIller = function () { return gecilenIller.slice(); };
  /* Rota (10 Kas, D2): çizgi yolu izler. Sıra: (1) gömülü örnek rota (`rota-osrm-gomulu.js`: pilotlar ve Ankara – Trabzon, ağ olmadan da),
     (2) OSRM açık demo sunucusuna GET, giden yalnız durak koordinatları, (3) yanıt yoksa ya da 7 sn geçerse sessizce yol ağı koridoru (yedek).
     Canlıda bu çağrı sunucudadır (`/dada-route/rota`, `config/dadaroute.php`); demo sunucu üretim için değildir. Mesafe ve süre OSRM'in
     (trafiksiz). Geometri 25 m toleransla sadeleşir: çizilen çizgi, `dgRotaGeometri` ve uzaklık hesapları aynı dizi.
     İl kartları (`dgRotaIller`): çizgi 2 km'de bir örneklenir, her örnek en yakın il ya da ilçe merkezinin iline yazılır; 5 km'den kısa geçiş sayılmaz */
  var OSRM = 'https://router.project-osrm.org/route/v1/driving/', ZAMAN_ASIMI = 7000, once = window.fetch;
  var polyCoz = function (s) {
    var i = 0, la = 0, ln = 0, o = [];
    while (i < s.length) {
      for (var j = 0; j < 2; j++) { var sh = 0, r = 0, b; do { b = s.charCodeAt(i++) - 63; r |= (b & 31) << sh; sh += 5; } while (b >= 32); var d = r & 1 ? ~(r >> 1) : r >> 1; if (j) { ln += d; } else { la += d; } }
      o.push([la / 1e5, ln / 1e5]);
    }
    return o;
  };
  var sadele = function (p, tol) {
    if (p.length < 3) { return p; }
    var c = Math.cos(p[0][0] * Math.PI / 180), xy = p.map(function (n) { return [n[1] * 111320 * c, n[0] * 110540]; }), tut = p.map(function () { return 0; }), y = [[0, p.length - 1]];
    tut[0] = tut[p.length - 1] = 1;
    while (y.length) {
      var ab = y.pop(), a = xy[ab[0]], b = xy[ab[1]], dx = b[0] - a[0], dy = b[1] - a[1], L = dx * dx + dy * dy, en = -1, ei = -1;
      for (var i = ab[0] + 1; i < ab[1]; i++) { var q = xy[i], t = L ? Math.max(0, Math.min(1, ((q[0] - a[0]) * dx + (q[1] - a[1]) * dy) / L)) : 0, d = Math.hypot(q[0] - a[0] - t * dx, q[1] - a[1] - t * dy); if (d > en) { en = d; ei = i; } }
      if (en > tol) { tut[ei] = 1; y.push([ab[0], ei], [ei, ab[1]]); }
    }
    return p.filter(function (n, i) { return tut[i]; });
  };
  var GOMULU = window.DG_ROTA_GOMULU || [], onbellek = {};
  /* Gömülü rota: duraklar sırayla 0,5 km içinde eşleşirse. `ters` true ise ters yön de kabul (yalnız OSRM'e ulaşılamazsa) */
  function gomulu(z, ters) {
    var es = function (d) { return d.length === z.length && d.every(function (c, i) { return km(c[0], c[1], +z[i].lat, +z[i].lng) < 0.5; }); };
    for (var i = 0; i < GOMULU.length; i++) {
      var r = GOMULU[i];
      if (es(r.d)) { return { n: polyCoz(r.p), km: r.km, dk: r.dk }; }
      if (ters && es(r.d.slice().reverse())) { return { n: polyCoz(r.p).reverse(), km: r.km, dk: r.dk }; }
    }
    return null;
  }
  function osrm(z) {
    if (navigator.onLine === false) { return Promise.reject(new Error('çevrimdışı')); }
    var kes = window.AbortController ? new AbortController() : null, sayac;
    var adres = OSRM + z.map(function (d) { return (+d.lng).toFixed(5) + ',' + (+d.lat).toFixed(5); }).join(';') + '?overview=full&geometries=polyline&steps=false&alternatives=false';
    var istek = once(adres, { credentials: 'omit', signal: kes ? kes.signal : undefined }).then(function (r) { if (!r.ok) { throw new Error('OSRM ' + r.status); } return r.json(); })
      .then(function (j) { if (!j || j.code !== 'Ok' || !j.routes || !j.routes.length) { throw new Error('rota yok'); } var r = j.routes[0]; return { n: sadele(polyCoz(r.geometry), 25), km: r.distance / 1000, dk: r.duration / 60 }; });
    var sure = new Promise(function (h, red) { sayac = setTimeout(function () { if (kes) { kes.abort(); } red(new Error('zaman aşımı')); }, ZAMAN_ASIMI); });
    return Promise.race([istek, sure]).then(function (x) { clearTimeout(sayac); return x; }, function (e) { clearTimeout(sayac); throw e; });
  }
  /* Yol ağı koridoru (yedek): duraklar arası en kısa yol, iller ağdan; mesafe kuş uçuşu çizginin 1,12 katı, süre 85 km/sa */
  function yedek(z) {
    var n = [], il = [];
    for (var i = 0; i < z.length - 1; i++) {
      var k = koridor(z[i], z[i + 1]);
      k.n.forEach(function (c, j) { if (n.length && !j) { return; } n.push([c[0], c[1]]); });
      il = il.concat(k.il);
      /* ilçe durağı kendi ilini de karta taşır (İzmir–Bodrum: Muğla) */
      var ilce = YERLER.filter(function (y) { return y.tur === 'district' && y.ad === z[i + 1].ad; })[0]; if (ilce) { il.push(ilce.alt); }
    }
    var top = 0; for (var j = 1; j < n.length; j++) { top += km(n[j - 1][0], n[j - 1][1], n[j][0], n[j][1]); }
    return { n: n, km: top * 1.12, dk: top * 1.12 / 85 * 60, il: il };
  }
  /* İl ve ilçe merkezleri, iliyle etiketli: noktanın ili en yakın merkezin ili (il sınırı verisi yok; yaklaşık) */
  var TOHUM = ILLER.map(function (y) { return [y.lat, y.lng, y.ad]; }).concat(YERLER.filter(function (y) { return y.tur === 'district' && DUGUM[y.alt]; }).map(function (y) { return [y.lat, y.lng, y.alt]; }));
  var ilNe = function (la, ln) { var en = 1e9, ad = null; TOHUM.forEach(function (t) { var d = km(la, ln, t[0], t[1]); if (d < en) { en = d; ad = t[2]; } }); return ad; };
  window.dgIlNe = ilNe;
  function ilBul(n, z) {
    var uzun = {}, sira = [], ekle = function (ad, d) { if (!ad) { return; } if (!(ad in uzun)) { uzun[ad] = 0; sira.push(ad); } uzun[ad] += d; };
    ekle(ilNe(n[0][0], n[0][1]), 99);
    for (var i = 1; i < n.length; i++) {
      var a = n[i - 1], b = n[i], d = km(a[0], a[1], b[0], b[1]), adim = Math.max(1, Math.ceil(d / 2));
      for (var k = 1; k <= adim; k++) { var u = k / adim; ekle(ilNe(a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u), d / adim); }
    }
    ekle(ilNe(n[n.length - 1][0], n[n.length - 1][1]), 99);
    /* her durak kendi ilini taşır */
    z.forEach(function (s) { var ad = ilNe(+s.lat, +s.lng); if (ad) { ekle(ad, 0); uzun[ad] = Math.max(uzun[ad], 5); } });
    return sira.filter(function (ad) { return uzun[ad] >= 5; });
  }
  var rotaSayac = 0;
  function rotaKur(z) {
    var no = ++rotaSayac, anahtar = z.map(function (d) { return (+d.lat).toFixed(5) + ',' + (+d.lng).toFixed(5); }).join(';');
    var hazir = onbellek[anahtar] || gomulu(z);
    var is = hazir ? Promise.resolve(hazir) : osrm(z).then(function (x) { onbellek[anahtar] = x; return x; }, function () { return gomulu(z, true); });
    return is.then(function (x) {
      var kaynak = x ? 'osrm' : 'yedek'; x = x || yedek(z);
      var il = kaynak === 'osrm' ? ilBul(x.n, z) : x.il.filter(function (a, j) { return x.il.indexOf(a) === j; });
      var p = x.n.map(function (c) { return [c[1], c[0]]; }), metre = Math.round(x.km * 1000), saniye = Math.round(x.dk * 60);
      /* Bayat yanıt (bu arada yeni rota istendi): canlı betik `buildSeq` ile yoksayar; burada da ortak durum ezilmez */
      if (no === rotaSayac) {
        hat = p; gecilenIller = il;
        window.dgRotaGeometri = x.n.map(function (c) { return [c[0], c[1]]; }); window.dgRotaKaynak = kaynak;
        if (harita) { harita.setAttribute('data-rota-kaynak', kaynak); }
        window.dispatchEvent(new Event('dg-rota'));
        document.dispatchEvent(new CustomEvent('dg:rota', { detail: { geometri: window.dgRotaGeometri, km: Math.round(x.km * 10) / 10, dk: Math.round(x.dk), kaynak: kaynak } }));
      }
      return { rotalar: [{ geometry: { coordinates: p }, distance: metre, duration: saniye, tahmini: kaynak === 'yedek' }], token: 'prototip-' + Date.now(), saglayici: { ad: kaynak === 'osrm' ? 'OSRM · OpenStreetMap' : 'Prototip örneği' } };
    });
  }
  /* Noktanın çizgiye en kısa uzaklığı (km) ve çizgideki sırası (parça no + oran): yerel düzlemde parçaya dik izdüşüm */
  function hataUzak(m) {
    var en = 1e18, sira = 0, c = Math.cos(m.lat * Math.PI / 180);
    if (hat.length === 1) { en = Math.pow((hat[0][0] - m.lng) * c, 2) + Math.pow(hat[0][1] - m.lat, 2); }
    for (var i = 0; i < hat.length - 1; i++) {
      var a = hat[i], b = hat[i + 1], ax = (a[0] - m.lng) * c, ay = a[1] - m.lat, dx = (b[0] - a[0]) * c, dy = b[1] - a[1], L = dx * dx + dy * dy;
      var t = L ? Math.max(0, Math.min(1, -(ax * dx + ay * dy) / L)) : 0, x = ax + t * dx, y = ay + t * dy, d = x * x + y * y;
      if (d < en) { en = d; sira = i + t; }
    }
    return { d: Math.sqrt(en) * 111.195, sira: sira };
  }
  window.dgRotaUzak = function (lat, lng) { return hat.length ? hataUzak({ lat: lat, lng: lng }).d : 1e9; };
  /* İl kartı sırası ve koridor etiketi için: noktanın rotadaki sırası ve çizginin kendisi */
  window.dgRotaSira = function (lat, lng) { return hat.length ? hataUzak({ lat: lat, lng: lng }).sira : 0; };
  window.dgRotaHat = function () { return hat.slice(); };
  /* Örnek nokta üretici (Beyar, 9 Kas: açılan katmanın noktası haritada görünsün): güzergâhta sabit örnek nokta yoksa
     çizgi boyunca her `aralik` km'de bir, yoldan `kay` km yana kaymış nokta. Tesis değildir, "prototip örneği" */
  window.dgRotaOrnek = function (aralik, kay, bas) {
    var l = [], top = 0, sonraki = bas || aralik / 2;
    for (var i = 1; i < hat.length; i++) {
      var a = hat[i - 1], b = hat[i], d = km(a[1], a[0], b[1], b[0]);
      while (d > 0 && top + d >= sonraki) {
        var u = (sonraki - top) / d, lat = a[1] + (b[1] - a[1]) * u, lng = a[0] + (b[0] - a[0]) * u, nx = -(b[1] - a[1]), ny = (b[0] - a[0]), nn = Math.sqrt(nx * nx + ny * ny) || 1;
        l.push({ lat: lat + ny / nn * kay / 111, lng: lng + nx / nn * kay / 85, sira: i - 1 + u }); sonraki += aralik;
      }
      top += d;
    }
    return l;
  };
  /* Şarj noktaları: rotaya 20 km içindeki sabit örnekler; yoksa her 150 km'de bir üretilen örnek DC nokta, yanında örnek yemek eşi */
  window.dgRotaSarjNoktalari = function () {
    var l = R.katman.sarj.filter(function (n) { return hataUzak({ lat: n[1], lng: n[0] }).d <= 20; });
    if (!l.length && hat.length) { l = window.dgRotaOrnek(150, 1.5).map(function (o, i) { return [o.lng, o.lat, i % 3 === 2 ? 'Örnek AC şarj' : 'Örnek DC hızlı şarj', [['Örnek esnaf lokantası', 'Örnek pideci', 'Örnek köfteci'][i % 3], 300 + (i % 3) * 100]]; }); }
    return l;
  };
  var detay = {}, sonMekan = []; V.mekanlar.forEach(function (m) { detay[m.slug] = m; });
  var ilAd = {}; (V.secenek.il || []).forEach(function (o) { ilAd[o.deger] = o.ad; });
  function mekanlar(q) {
    var sinir = q.get('km') ? +q.get('km') : Math.max(1, (+q.get('dk') || 0) * 55 / 60 / 2);
    var l = [];
    M.forEach(function (m, i) {
      var u = hataUzak(m); if (u.d > sinir) { return; }
      var d = detay[m.slug] || { f: {} }, k = (V.kartlar[m.slug] || ''), il = ilAd[(d.f.il || [])[0]] || '';
      var gorsel = (/url\((?:'|&#0?39;)([^'&]+)/.exec(k) || [])[1]; var ves = d.f.vesile || [];
      l.push({ id: i + 1, slug: m.slug, ad: m.name, lat: m.lat, lng: m.lng, cat: (/disc-cat">([^<]+)</.exec(k) || [])[1] || m.type || null, puan: null, konum: [m.district, il].filter(Boolean).join(' · '), sehir: il, il: il, ilce: m.district, mutfak: null, mutfakId: null, tur: m.type || null, editor: false, sponsor: false, sponsorCta: null, img: gorsel ? new URL(gorsel.split('{{kok}}').join(kok), location.href).href : null, url: kok + 'mekan/mikla/', ogunler: ves.indexOf('kahvalti') >= 0 ? ['kahvalti'] : [], aileyeUygun: false, yoresel: (d.f.konsept || []).indexOf('yerel-lezzet-noktasi') >= 0, ozellikler: [], acik: /st-closed/.test(k) ? 'closed' : 'open', acikEtiket: /st-closed/.test(k) ? 'Kapalı' : 'Açık', calismaSaatleri: null, sonDogrulama: null, fiyatSeviyesi: m.price || null, sapmaKm: Math.round(u.d * 100) / 100, sapmaDk: Math.round(u.d / 55 * 60 * 2), sira: u.sira });
    });
    l.sort(function (a, b) { return a.sira - b.sira; });
    sonMekan = l.slice(0, 60);
    var ust = l.filter(function (m) { return m.sapmaKm <= 1; }).length;
    return { mekanlar: l.slice(0, 60), sayac: { yolUstu: ust, yolaYakin: l.length - ust, toplam: l.length }, kirpildi: l.length > 60 };
  }
  /* Şarj: yalnız rotaya 20 km içindeki örnek noktalar; eşleşen mekân gerçek konumdan, 1 km yürüme mesafesi (§8 #10).
     Şarj süresi (R2.5b) tahmin: 60 kWh batarya %20→%80, DC 120 kW verimle ~26 dk, AC 22 kW ~100 dk; yürüme 80 m/dk */
  function sarj(q) {
    var tur = q.get('tur') || 'tum', min = +q.get('min_kw') || 0;
    var l = window.dgRotaSarjNoktalari().map(function (n, i) {
      var u = hataUzak({ lat: n[1], lng: n[0] }), dc = /DC/.test(n[2]);
      var yakin = M.map(function (m) { var mm = Math.round(km(n[1], n[0], m.lat, m.lng) * 1000); return { id: m.slug, slug: m.slug, ad: m.name + ' · yürüyerek ' + Math.max(1, Math.round(mm / 80)) + ' dk', mesafe_m: mm, url: kok + 'mekan/mikla/' }; }).filter(function (m) { return m.mesafe_m <= 1000; }).sort(function (a, b) { return a.mesafe_m - b.mesafe_m; });
      /* Şarj + yemek molası (R2.5b) canlı şarj kartının "Yakındaki mekânlar" satırında: 1 km içinde Dada mekânı yoksa örnek yemek eşi */
      if (!yakin.length && n[3]) { yakin = [{ id: 'ornek-yemek-' + i, slug: null, ad: n[3][0] + ' (prototip örneği) · yürüyerek ' + Math.max(1, Math.round(n[3][1] / 80)) + ' dk', mesafe_m: n[3][1], url: kok + 'mekanlar/' }]; }
      return { id: 'ornek-' + i, ad: n[2] + ' (prototip örneği)', tur: dc ? 'DC' : 'AC', kw: dc ? 120 : 22, lat: n[1], lng: n[0], rotadan_km: Math.round(u.d * 10) / 10, sahiplik: null, operator: 'Prototip örneği · %20→%80 şarj tahmini ' + (dc ? '~26' : '~100') + ' dk (60 kWh batarya)', veri_saglayici: 'Prototip örneği', lisans: 'örnek veri', mekanlar: yakin };
    }).filter(function (s) { return s.rotadan_km <= 20 && (tur === 'tum' || s.tur === tur) && s.kw >= min; });
    return { istasyonlar: l, veri_hazir: true, toplam: l.length };
  }
  var yanit = function (v) { return Promise.resolve(new Response(JSON.stringify(v), { status: 200, headers: { 'Content-Type': 'application/json' } })); };
  window.fetch = function (girdi, ayar) {
    var adres = typeof girdi === 'string' ? girdi : girdi.url, m = /dada-route\/api\/([a-z-]+)(.*)$/.exec(adres);
    if (!m) { return once(girdi, ayar); }
    var q = new URLSearchParams(m[2].split('?')[1] || ''), uc = m[1], yontem = ((ayar && ayar.method) || 'GET').toUpperCase();
    if (uc === 'yerler') { return yanit({ yerler: yerAra(q.get('q') || '') }); }
    if (uc === 'en-yakin') { var la = +q.get('lat'), ln = +q.get('lng'), s = ILLER.slice().sort(function (x, y) { return km(la, ln, x.lat, x.lng) - km(la, ln, y.lat, y.lng); })[0]; return yanit({ yer: s, uzaklikKm: Math.round(km(la, ln, s.lat, s.lng)) }); }
    if (uc === 'rota') { return rotaKur(JSON.parse(ayar.body).duraklar).then(yanit); }
    if (uc === 'mekanlar' && yontem === 'GET') { return yanit(mekanlar(q)); }
    if (uc === 'sarj') { return yanit(sarj(q)); }
    /* Güzergâhlarım: Listelerim › Gastronomi Rotalarım ile TEK depo (`prototip.js` `dgRota`; H5, 10 Kas). Kayıt yalnız bu tarayıcıda */
    if (uc === 'guzergahlarim' && window.dgRota) {
      var gp = (m[2].split('?')[0] || '').split('/').filter(Boolean), gid = gp[0] ? decodeURIComponent(gp[0]) : null;
      var gbul = function () { return window.dgRota.oku().filter(function (r) { return String(r.id) === String(gid); })[0] || null; };
      var govde = {}; try { govde = ayar && ayar.body ? JSON.parse(ayar.body) : {}; } catch (e) { govde = {}; }
      if (yontem === 'GET') { return yanit({ guzergahlar: window.dgRota.oku() }); }
      if (yontem === 'DELETE' && gid) { window.dgRota.sil(gid); return yanit({ ok: true }); }
      if (gp.length > 1) { return yanit({ ok: true, prototip: true, guzergah: gbul() }); }
      if (yontem === 'POST' || yontem === 'PATCH') {
        var eski = gid ? gbul() : null, plan = {}, k;
        for (k in (eski || {})) { plan[k] = eski[k]; } for (k in govde) { plan[k] = govde[k]; }
        if (eski) { plan.id = eski.id; if (eski.ornek) { window.dgRota.sil(eski.id); plan.id = 'rota-' + Date.now(); } delete plan.ornek; }
        return yanit({ guzergah: window.dgRota.kaydet(plan) || plan });
      }
    }
    return yanit({ ok: true, prototip: true });
  };
})();
