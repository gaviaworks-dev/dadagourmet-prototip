/* ANALİTİK YARDIMCISI — GA4 · dört markada aynı dosya deseni.
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
 * Onayın kaynağı SUNUCU ÇEREZİDİR (`POST /cerez-tercihi`), bandın kendi
 * `localStorage['dm-cookie-consent']` anahtarı değil: o anahtar bu özellikten
 * ÖNCE, "isteğe bağlı çerez yok" diyen metne basılmış olabilir ve analitik
 * onayı sayılamaz. Sunucu çerezi yokken o anahtar silinir ki bant yeniden sorsun.
 *
 * 🔴 E-POSTA VE TELEFON GA'YA GİTMEZ (sözleşme §2). Kullanıcının yazdığı metin
 * üç yoldan Google'a düşüyordu (ölçüldü): olay parametresi (`search_term`),
 * sayfa adresi (`/ara?q=…` → `page_location`, sonraki sayfada `page_referrer`)
 * ve başlık ("Arama: …" → `page_title`). Üçü de TEK fonksiyondan, `ayikla()`dan
 * geçer: e-posta `[e-posta]`, telefon `[telefon]` olur. Ayıklanmış biçim YALNIZ
 * GA'ya gider — adres çubuğu, başlık ve sayfa aynı kalır. Ayıklama bir şey
 * değiştirmiyorsa gtag'a adres/başlık alanı hiç verilmez (bugünkü davranış).
 *
 * EKİP TRAFİĞİ (soru 16): `data-ekip-trafigi="1"` yalnız panele girebilen
 * hesapta basılır (`AnalitikKabugu`); `config`e `traffic_type: 'internal'`
 * girer ve GA'nın iç trafik süzgeci onu okur. Onay yoksa gtag hiç yüklenmez,
 * bu ayar da gitmez.
 *
 * Dışa açılan yüzey:
 *   window.dmAnalitik.olay(ad, parametreler)   olay gönder
 *   window.dmAnalitik.onay()                   'kabul' | 'ret' | 'yok'
 *   window.dmAnalitik.onayiSifirla()           tercihi unut (bant yeniden sorar)
 *   window.dmAnalitik.ayikla(metin)            e-posta/telefonu yer tutucuyla değiştir
 * Bildirimsel biçim — markup'a betik yazmadan:
 *   <… data-analitik-olay="chef_followed" data-analitik-parametreler='{"chef_id":"7"}'>
 */
(function () {
  'use strict';

  var dugum = document.currentScript || document.getElementById('dmAnalitikEtiketi');
  /* 🔴 Düğümün id'si `dmAnalitik` OLAMAZ: id'li düğüm `window.<id>` diye de okunur ve
     aşağıdaki "zaten kuruldum" koruması onu görüp betiği hiç çalıştırmaz (ölçüldü). */
  if (!dugum || !dugum.dataset.olcumKimligi || (window.dmAnalitik && typeof window.dmAnalitik.olay === 'function')) return;

  var veri = dugum.dataset;
  var KIMLIK = veri.olcumKimligi;
  var onay = veri.onay === 'kabul' || veri.onay === 'ret' ? veri.onay : 'yok';
  var yuklendi = false;
  var bekleyen = [];
  var BEKLEYEN_SINIRI = 20;
  var BANT_ANAHTARI = 'dm-cookie-consent';

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

  /* ── KİŞİSEL VERİ AYIKLAMA ─────────────────────────────────────────────────
     E-posta: yerel kısım @ alan adı . en az iki harfli uç (Türkçe harfler dahil).
     Telefon: yalnız ayraçla (boşluk - . / parantez) bölünmüş rakam dizisi; en az
     10 rakam, başında `+` varsa en az 8. Tarif aramasındaki sayılar ("180 derece",
     "1 su bardağı 200 ml", "2024 bayram menüsü") kelimeyle bölündüğü ya da kısa
     kaldığı için telefon sayılmaz. 10+ rakamlı her dizi (TC kimlik no, kart no)
     aynı kuralla gider. */
  var EPOSTA = /[A-Za-z0-9\u00C0-\u024F._%+\-]+@(?:[A-Za-z0-9\u00C0-\u024F\-]+\.)+[A-Za-z\u00C0-\u024F]{2,}/g;
  var RAKAM_DIZISI = /\+?\(?\d(?:[\s().\/\-]*\d)+/g;
  var AYIKLAMA_SINIRI = 2000;

  function ayikla(metin) {
    if (typeof metin !== 'string' || metin === '') return metin;
    /* Çok uzun girdi kısaltılır; sınırda yarım kalan son sözcük de atılır ki kesilmiş
       bir e-posta ya da numara parçası desene uymadan geçmesin. */
    if (metin.length > AYIKLAMA_SINIRI) metin = metin.slice(0, AYIKLAMA_SINIRI).replace(/\S*$/, '');
    return metin.replace(EPOSTA, '[e-posta]').replace(RAKAM_DIZISI, function (parca) {
      var rakam = parca.replace(/\D/g, '').length;
      return rakam >= 10 || (parca.charAt(0) === '+' && rakam >= 8) ? '[telefon]' : parca;
    });
  }

  /* Adresin yolu, sorgusu ve `#` kısmı parça parça çözülüp ayıklanır. Değişmeyen parça
     BAYT BAYT aynı kalır, değişen yeniden kodlanır; hiçbir parça değişmezse adres
     olduğu gibi döner. `+` yalnız sorgu ve `#` kısmında boşluktur (form kodlaması).
     Çift kodlanmış değer (`%2540`) de açılsın diye üç kata kadar çözülür; bozuk
     %-dizisi olduğu gibi kalır. */
  function parcayiAyikla(ham, form) {
    if (!ham) return ham;
    var acik = form ? ham.replace(/\+/g, ' ') : ham;
    for (var i = 0; i < 3; i++) {
      var cozulen = acik.replace(/(?:%[0-9A-Fa-f]{2})+/g, function (k) {
        try { return decodeURIComponent(k); } catch (hata) { return k; }
      });
      if (cozulen === acik) break;
      acik = cozulen;
    }
    var temiz = ayikla(acik);
    if (temiz === acik) return ham;
    var kod = encodeURIComponent(temiz);
    return form ? kod.replace(/%20/g, '+') : kod;
  }

  function ciftleriAyikla(dizi) {
    return dizi.split('&').map(function (cift) {
      var esit = cift.indexOf('=');
      return esit < 0
        ? parcayiAyikla(cift, true)
        : parcayiAyikla(cift.slice(0, esit), true) + '=' + parcayiAyikla(cift.slice(esit + 1), true);
    }).join('&');
  }

  function adresiAyikla(adres) {
    if (typeof adres !== 'string' || adres === '') return adres;
    var m = /^([a-z][a-z0-9+.\-]*:\/\/[^\/?#]*)?([^?#]*)(\?[^#]*)?(#[\s\S]*)?$/i.exec(adres);
    if (!m) return ayikla(adres);
    return (m[1] || '')
      + m[2].split('/').map(function (s) { return parcayiAyikla(s, false); }).join('/')
      + (m[3] ? '?' + ciftleriAyikla(m[3].slice(1)) : '')
      + (m[4] ? '#' + ciftleriAyikla(m[4].slice(1)) : '');
  }

  /* (b) (c) GA'ya giden adres, önceki adres ve başlık — YALNIZ ayıklama bir şey
     değiştirdiyse, ayıklanmış biçimiyle. */
  function sayfaAlanlari() {
    var a = {};
    var adres = adresiAyikla(location.href);
    if (adres !== location.href) a.page_location = adres;
    if (document.referrer) {
      var onceki = adresiAyikla(document.referrer);
      if (onceki !== document.referrer) a.page_referrer = onceki;
    }
    var baslik = ayikla(document.title);
    if (baslik !== document.title) a.page_title = baslik;
    return a;
  }

  /* Adres sayfa yenilenmeden de değişir: sözlüğün canlı süzgeci `?q=`yu her tuşta
     `history.replaceState` ile yazıyor ve gtag o andan sonraki her olayda adresi
     yeniden okuyor (ölçüldü). Bu yüzden ayıklanmış alanlar `gtag('set')` ile gtag'ın
     elinde tutulur ve her değişimde yenilenir. Bir kez verilen alan artık hep verilir
     (adres temizlense bile gerçeğiyle): verilmezse eski, ayıklanmış değer yapışık
     kalırdı. Hiç kişisel veri görmemiş alan hiç verilmez — gtag onu kendisi okur.
     🔴 GA'nın KENDİ "tarayıcı geçmişi" page_view'u ve site araması
     (`view_search_results`) adresi doğrudan `location`dan okuyor, bu değeri
     görmüyor (ölçüldü): o iki kanal GA ayarıyla kapanır (rapor/ARAMA-KVKK.md). */
  var verilenAlanlar = {};

  function sayfayiEsitle() {
    if (!yuklendi) return;
    var ayiklanan = sayfaAlanlari();
    var gercek = { page_location: location.href, page_referrer: document.referrer, page_title: document.title };
    var yeni = {};
    var degisti = false;
    Object.keys(gercek).forEach(function (ad) {
      if (!(ad in ayiklanan) && !(ad in verilenAlanlar)) return;
      var deger = ad in ayiklanan ? ayiklanan[ad] : gercek[ad];
      if (verilenAlanlar[ad] === deger) return;
      verilenAlanlar[ad] = deger;
      yeni[ad] = deger;
      degisti = true;
    });
    if (degisti) gtag('set', yeni);
  }

  function gecmisiIzle() {
    ['pushState', 'replaceState'].forEach(function (ad) {
      var asil = history[ad];
      if (typeof asil !== 'function') return;
      history[ad] = function () {
        var sonuc = asil.apply(this, arguments);
        try { sayfayiEsitle(); } catch (hata) { /* ölçüm, gezinmeyi bozmaz */ }
        return sonuc;
      };
    });
    window.addEventListener('popstate', sayfayiEsitle);
    window.addEventListener('hashchange', sayfayiEsitle);
  }

  /* (a) Olayın her metin parametresi ayıklanır. GA4 sınırı: değer en çok 100 karakter.
     Kırpma ayıklamadan SONRA: önce kırpılsaydı yarım kalan e-posta ya da numara desene
     uymaz ve ham giderdi. Adres biçimli değer adres gibi ayıklanır (`%40` de yakalanır). */
  var DEGER_SINIRI = 100;

  function parametreleriAyikla(p) {
    var temiz = {};
    Object.keys(p || {}).forEach(function (ad) {
      var d = p[ad];
      if (typeof d === 'string') d = (/^https?:\/\//i.test(d) ? adresiAyikla(d) : ayikla(d)).slice(0, DEGER_SINIRI);
      temiz[ad] = d;
    });
    return temiz;
  }

  function yukle() {
    if (yuklendi) return;
    yuklendi = true;

    var ayar = ortakParametreler();
    if (veri.uyeKimligi) ayar.user_id = veri.uyeKimligi;
    if (veri.ekipTrafigi === '1') ayar.traffic_type = 'internal';

    gtag('js', new Date());
    sayfayiEsitle();
    gtag('config', KIMLIK, Object.assign(ayar, sayfaAlanlari()));
    gecmisiIzle();

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

    var kayit = { ad: ad, parametreler: parametreleriAyikla(parametreler) };
    if (onay === 'kabul') {
      yukle();
      sayfayiEsitle();
      gtag('event', kayit.ad, kayit.parametreler);
      return true;
    }
    if (bekleyen.length < BEKLEYEN_SINIRI) bekleyen.push(kayit);
    return false;
  }

  function xsrf() {
    var m = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
    return m ? decodeURIComponent(m[1]) : '';
  }

  function sunucuyaYaz(yontem, govde) {
    return fetch('/cerez-tercihi', {
      method: yontem,
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-XSRF-TOKEN': xsrf()
      },
      body: govde ? JSON.stringify(govde) : undefined
    }).catch(function () { /* ağ hatası onayı geri almaz; sonraki sayfada bant yeniden sorar */ });
  }

  function karar(yeni) {
    onay = yeni;
    sunucuyaYaz('POST', { tercih: yeni });
    gtag('consent', 'update', onayDurumu(yeni === 'kabul'));
    if (yeni === 'kabul') {
      yukle();
      gtag('event', 'consent_updated', { analytics_storage: 'granted' });
    } else {
      bekleyen = [];
    }
  }

  function onayiSifirla() {
    onay = 'yok';
    bekleyen = [];
    gtag('consent', 'update', onayDurumu(false));
    try { localStorage.removeItem(BANT_ANAHTARI); } catch (e) {}
    return sunucuyaYaz('DELETE');
  }

  window.dmAnalitik = {
    olay: olay,
    onay: function () { return onay; },
    onayiSifirla: onayiSifirla,
    ayikla: ayikla
  };

  /* Karar sunucuda yoksa bant yeniden sormalı — bkz. dosya başı. Bandın kendi
     betiği görünürlüğe 700 ms sonra karar verir; anahtar ondan ÖNCE silinir. */
  if (onay === 'yok') {
    try { localStorage.removeItem(BANT_ANAHTARI); } catch (e) {}
  }

  document.addEventListener('click', function (e) {
    var hedef = e.target instanceof Element ? e.target : null;
    if (!hedef) return;

    if (hedef.closest('#cookieAccept, [data-cookie-accept]')) { karar('kabul'); return; }
    if (hedef.closest('#cookieReject, [data-cookie-reject]')) { karar('ret'); return; }
    if (hedef.closest('[data-cerez-sifirla]')) { onayiSifirla().then(function () { location.reload(); }); return; }

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
