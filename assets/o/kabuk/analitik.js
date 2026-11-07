/* ANALİTİK YARDIMCISI — GA4 · dört markada aynı dosya deseni (kaynak: DadaGastro
 * `public/kabuk/analitik.js`; Gourmet farkları aşağıda "GOURMET" diye işaretli).
 *
 * Bu betik YALNIZ `GA4_MEASUREMENT_ID` tanımlıysa sayfaya girer
 * (`resources/views/parcalar/analitik.blade.php`); beyanlarını kendi
 * `<script id="dmAnalitikEtiketi">` düğümünün `data-*` özniteliklerinden okur.
 *
 * 🔴 ONAYSIZ HİÇBİR ŞEY GOOGLE'A GİTMEZ (Consent Mode v2 · TEMEL kip).
 * `gtag.js` onay verilmeden YÜKLENMEZ — "yüklenir ama çerezsiz ping atar"
 * (gelişmiş kip) değil. Karar verilmemişken olaylar bellekte bekler (en çok
 * 20); "Tümünü Kabul Et" ile gider, "Reddet" ile atılır.
 *
 * GOURMET — onayın kaynağı zaten şifreli SUNUCU ÇEREZİDİR ve onu `site.js` yazar
 * (`#cookieBanner[data-kaydet-url]` → `CerezTercihiDenetleyicisi`). Bu betik tercihi
 * İKİNCİ KEZ POST ETMEZ (her tıklamada iki POST olurdu); aynı tıklamayı yalnız DİNLER
 * ve sayfadaki onay durumunu günceller. Sunucu `data-onay`ı yalnız analitik cümlesi
 * görülerek verilmiş kabulde `kabul` basar.
 *
 * Dışa açılan yüzey:
 *   window.dmAnalitik.olay(ad, parametreler)   olay gönder
 *   window.dmAnalitik.onay()                   'kabul' | 'ret' | 'yok'
 *   window.dmAnalitik.onayiSifirla()           tercihi unut (bant yeniden sorar)
 * Bildirimsel biçim — markup'a betik yazmadan:
 *   <… data-analitik-olay="place_shared" data-analitik-parametreler='{"item_id":"7"}'>
 */
(function () {
  'use strict';

  var dugum = document.currentScript || document.getElementById('dmAnalitikEtiketi');
  /* 🔴 Düğümün id'si `dmAnalitik` OLAMAZ: id'li düğüm `window.<id>` diye de okunur ve
     aşağıdaki "zaten kuruldum" koruması onu görüp betiği hiç çalıştırmaz (Gastro'da ölçüldü). */
  if (!dugum || !dugum.dataset.olcumKimligi || (window.dmAnalitik && typeof window.dmAnalitik.olay === 'function')) return;

  var veri = dugum.dataset;
  var KIMLIK = veri.olcumKimligi;
  var onay = veri.onay === 'kabul' || veri.onay === 'ret' ? veri.onay : 'yok';
  var yuklendi = false;
  var bekleyen = [];
  var BEKLEYEN_SINIRI = 20;

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }

  /* Reklam sinyalleri HER DURUMDA kapalı: bu sitede reklam çerezi yok. */
  function onayDurumu(analitik) {
    return {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: analitik ? 'granted' : 'denied'
    };
  }

  gtag('consent', 'default', onayDurumu(onay === 'kabul'));

  function ortakParametreler() {
    var p = {
      brand: veri.marka || '',
      login_state: veri.girisDurumu || 'guest',
      membership_tier: veri.kademe || 'none'
    };
    if (veri.hataAyiklama === '1') p.debug_mode = true;
    return p;
  }

  function yukle() {
    if (yuklendi) return;
    yuklendi = true;

    var ayar = ortakParametreler();
    if (veri.uyeKimligi) ayar.user_id = veri.uyeKimligi;

    gtag('js', new Date());
    gtag('config', KIMLIK, ayar);

    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(KIMLIK);
    document.head.appendChild(s);

    var kuyruk = bekleyen;
    bekleyen = [];
    kuyruk.forEach(function (o) { gtag('event', o.ad, o.parametreler); });
  }

  /* GA4 sınırları: ad ≤ 40 karakter, harfle başlar, [a-zA-Z0-9_]. Uymayan ad
     sessizce düşmez — konsola yazar, çünkü GA4 onu sessizce YUTAR. */
  var AD_DESENI = /^[a-zA-Z][a-zA-Z0-9_]{0,39}$/;

  function olay(ad, parametreler) {
    if (typeof ad !== 'string' || !AD_DESENI.test(ad)) {
      if (window.console) console.warn('[dmAnalitik] geçersiz olay adı:', ad);
      return false;
    }
    if (onay === 'ret') return false;

    var kayit = { ad: ad, parametreler: Object.assign({}, parametreler || {}) };
    if (onay === 'kabul') {
      yukle();
      gtag('event', kayit.ad, kayit.parametreler);
      return true;
    }
    if (bekleyen.length < BEKLEYEN_SINIRI) bekleyen.push(kayit);
    return false;
  }

  function karar(yeni) {
    onay = yeni;
    gtag('consent', 'update', onayDurumu(yeni === 'kabul'));
    if (yeni === 'kabul') {
      yukle();
      gtag('event', 'consent_updated', { analytics_storage: 'granted' });
    } else {
      bekleyen = [];
    }
  }

  /* GOURMET — sıfırlama ucu `POST /cerez-tercihi/sifirla` (Çerez Politikası sayfasındaki
     formun aynı ucu); adres ve CSRF kabuktan okunur, uydurulmaz. */
  function onayiSifirla() {
    onay = 'yok';
    bekleyen = [];
    gtag('consent', 'update', onayDurumu(false));
    if (!veri.sifirlaUrl) return Promise.resolve(false);

    var meta = document.querySelector('meta[name="csrf-token"]');
    return fetch(veri.sifirlaUrl, {
      method: 'POST',
      credentials: 'same-origin',
      redirect: 'manual',
      headers: { 'X-CSRF-TOKEN': meta ? meta.getAttribute('content') : '', 'Accept': 'application/json' }
    }).then(function (yanit) { return yanit.type === 'opaqueredirect' || yanit.ok; })
      .catch(function () { return false; });
  }

  window.dmAnalitik = {
    olay: olay,
    onay: function () { return onay; },
    onayiSifirla: onayiSifirla
  };

  document.addEventListener('click', function (e) {
    var hedef = e.target instanceof Element ? e.target : null;
    if (!hedef) return;

    if (hedef.closest('#cookieAccept')) { karar('kabul'); return; }
    if (hedef.closest('#cookieReject')) { karar('ret'); return; }

    var isaretli = hedef.closest('[data-analitik-olay]');
    if (isaretli) {
      var p = {};
      try { p = JSON.parse(isaretli.getAttribute('data-analitik-parametreler') || '{}'); } catch (hata) {}
      olay(isaretli.getAttribute('data-analitik-olay'), p);
    }
  }, true);

  if (onay === 'kabul') yukle();

  if (veri.sayfaOlayi) {
    try {
      var so = JSON.parse(veri.sayfaOlayi);
      if (so && so.ad) olay(so.ad, so.parametreler || {});
    } catch (hata) {}
  }
})();
