/* Reklam bileşen kütüphanesi (reklam-cekirdek, 11 Kas). Yalnız reklam önizlemesi açıkken yüklenir (reklam.js).
   Kanon: DadaGourmet-panel resources/views/components/reklam/* (Gastro donörü DadaGastro@1ffcfda79b) ve Diet prototipinin
   _src/parcalar/reklam.mjs üreticisi. DOM ve sınıf adları Blade'den birebir: slot.blade (serit, pano, filtre, eslik, interaktif,
   native_rectangle), standart.blade (side, altbar, popup), native-hap, native-kimlik, logo, etiket. Stil kanonun kendisi:
   assets/css/reklam/{gourmet-tokenlar,reklam,standart}.css (panel public/reklam/ kopyası); Gourmet uyarlamaları assets/css/reklam.css.
   Gourmet'e özgü tek ek biçim t1 (ML-T1 1200×240, öbür listeler 728×90): canlıda görsel kreatiftir (`rk-bant rk-leaderboard`,
   tek <img>); prototipte aynı kabın içinde fotoğraf + marka rengi + teklif + çağrıdan oluşan HTML sahnesi olarak çizilir.
   Her çizici HTML dizgisi döndürür; çekirdek düğüme çevirir, işaretin yerine koyar ve kapanınca söker.
   Sözleşme: assets/js/reklam/README.md. */
(function () {
  'use strict';
  var V = window.DG_REKLAM_VERI;
  if (!V) { return; }
  var KOK = document.documentElement.dataset.kok || './';
  var kac = function (s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
  var ik = function (i) { return '<i class="fa-solid ' + i + '" aria-hidden="true"></i>'; };
  var url = function (p) { return /^(https?:|data:|\/)/.test(p) ? p : KOK + p; };

  function marka(k) { return V.markalar[k.marka] || { ad: k.marka, renkSinif: 'rk-renk-yok' }; }
  /* x-reklam.logo: logo varsa <img class="rk-logo">, yoksa yazı markası (tipografik kimlik; logo taklidi değil) */
  function logo(k, alt) {
    var m = marka(k);
    /* reklam-duzeltici: kare logo (logoOran ≤ 1,15: Kahve Dünyası, BP, Tesla Supercharger) `rk-logo-kare` alır; plakalar ona göre kare olur (reklam.css) */
    if (m.logo) { return '<img class="rk-logo' + (m.logoZemin === 'koyu' ? ' rk-logo-koyu' : '') + (m.logoOran && m.logoOran <= 1.15 ? ' rk-logo-kare' : '') + '" src="' + url(m.logo) + '" alt="' + kac(alt == null ? m.ad : alt) + '" loading="lazy" decoding="async">'; }
    return '<span class="rk-wordmark rk-kimlik-yazi">' + kac(m.kisaAd || m.ad) + '</span>';
  }
  var etiket = function () { return '<span class="rk-etiket">Sponsorlu</span>'; };
  /* Hedef bağ (reklam-duzeltici, 11 Kas; TEK KAYNAK, sayfa betikleri ve araçlar B.bag'i kullanır): `hedef` kökten göreli iç bağsa prototipte
     gezer (ilgili mekân, seçki, etkinlik sayfası); tam adresse (Dada Gastro tarifi) ya da hedef yoksa markanın gerçek sitesi
     (`reklam-markalar.json` `site`) yeni sekmede açılır (`rel="sponsored noopener"`). İkisi de yoksa sayfada kalır ve bildirim verir
     (reklam.js, [data-rk-ornek]; yedek, veride kullanılmıyor) */
  function bag(k) {
    var h = k && k.hedef, s = !h && k && k.marka ? marka(k).site : '';
    if (h && !/^https?:/.test(h)) { return 'href="' + url(h) + '" rel="sponsored" data-rk-bag'; }
    if (h || s) { return 'href="' + kac(h || s) + '" target="_blank" rel="sponsored noopener" data-rk-bag data-rk-dis'; }
    return 'href="#" rel="sponsored nofollow noopener" data-rk-bag data-rk-ornek';
  }
  function kok(kod, k, sinif, ek) {
    return 'class="' + sinif + '" data-rk-slot="' + kac(kod) + '" data-rk-kod="' + kac(kod) + '" data-rk-marka="' + kac(k.marka) + '"' + (ek || '');
  }
  var ad = function (k) { return ' aria-label="Sponsorlu içerik · ' + kac(marka(k).ad) + '"'; };
  var gorsel = function (k) { return k.gorsel ? url(k.gorsel) : ''; };
  var tur = function (k) { return 'rk-gorsel-' + (k.gorselTuru || 'sahne'); };

  var B = {};
  B.marka = marka;
  B.logo = logo;
  B.kac = kac;
  B.bag = bag;

  /* ── HERO · x-reklam.slot bicim=eslik ("X sponsorluğunda", Gastro TL-HERO) ── */
  B.eslik = function (k, o) {
    var m = marka(k);
    return '<a ' + kok(o.kod, k, 'rk-slot rk-eslik ' + m.renkSinif + ' ' + tur(k)) + ' ' + bag(k) + ' aria-label="' + kac(m.ad) + ' sponsorluğunda · Sponsorlu"><span class="rk-eslik-logo">' + logo(k, '') + '</span>' +
      '<span>' + etiket() + '<span>' + kac(m.ad) + ' sponsorluğunda</span></span></a>';
  };
  /* Hero perdesi: sponsor rengi hero görselinin üstünde soldan sağa söner (metin okunurluğu artar). Hero'nun ilk çocuğu olur */
  B.heroPerde = function (k) { return '<span class="rk-hero-perde ' + marka(k).renkSinif + '" data-rk-hero-perde aria-hidden="true"></span>'; };

  /* ── T1 · liste üstü görsel kreatif (canlı: x-reklam.slot bicim=leaderboard → `rk-bant rk-leaderboard` + <picture>) ── */
  B.t1 = function (k, o) {
    var m = marka(k), boyut = k.boyut || '728x90';
    var foto = gorsel(k) ? '<span class="rk-t1-sahne"><img class="rk-t1-foto" src="' + gorsel(k) + '" alt="" loading="lazy" decoding="async" width="400" height="300"></span>' : '';
    return '<aside ' + kok(o.kod, k, 'rk-slot rk-bant rk-leaderboard rk-t1 rk-t1-' + boyut + ' ' + m.renkSinif) + ad(k) + '>' + etiket() +
      '<a class="rk-gorsel-bag rk-t1-bag" ' + bag(k) + '>' + foto +
      '<span class="rk-t1-panel"><span class="rk-t1-logo">' + logo(k) + '</span>' +
      '<span class="rk-t1-metin"><b>' + kac(k.baslik) + '</b>' + (k.metin ? '<span class="rk-t1-alt">' + kac(k.metin) + '</span>' : '') +
      (k.teklif ? '<span class="rk-t1-teklif">' + ik('fa-gift') + ' ' + kac(k.teklif) + '</span>' : '') + '</span>' +
      '<span class="rk-t1-cta">' + kac(k.cta || 'Keşfet') + ' ' + ik('fa-arrow-right') + '</span></span></a></aside>';
  };

  /* ── FILTER · x-reklam.slot bicim=filtre (Gastro TL-FILTER, `.fct .rk-filtre`) ── */
  B.filtre = function (k, o) {
    var m = marka(k);
    return '<aside ' + kok(o.kod, k, 'fct rk-slot rk-filtre ' + m.renkSinif + ' ' + tur(k)) + ad(k) + '>' + etiket() +
      '<a class="rk-serit-bag" ' + bag(k) + '>' + (gorsel(k) ? '<img class="rk-serit-urun" src="' + gorsel(k) + '" alt="" loading="lazy" decoding="async">' : '') +
      '<span class="rk-zemin-perde" aria-hidden="true"></span><span class="rk-serit-kimlik">' + logo(k) + '</span>' +
      '<span class="rk-serit-metin"><b>' + kac(k.baslik || m.ad) + '</b>' + (k.metin ? '<span>' + kac(k.metin) + '</span>' : '') + '</span>' +
      '<span class="rk-serit-cta">' + kac(k.cta || 'Keşfet') + ' ' + ik('fa-arrow-right') + '</span></a></aside>';
  };

  /* ── Şerit · x-reklam.slot bicim=serit (ince banner, kolon × 120 / 96 px; M1, B1, gövde sütunu SB1) ── */
  B.serit = function (k, o) {
    var m = marka(k);
    return '<aside ' + kok(o.kod, k, 'rk-slot rk-serit rk-ince-banner ' + m.renkSinif + ' ' + tur(k)) + ad(k) + '>' + etiket() +
      '<a class="rk-serit-bag" ' + bag(k) + '>' + (gorsel(k) ? '<img class="rk-serit-urun" src="' + gorsel(k) + '" alt="" loading="lazy" decoding="async">' : '<span class="rk-serit-desen" aria-hidden="true"></span>') +
      '<span class="rk-zemin-perde" aria-hidden="true"></span><span class="rk-serit-kimlik">' + logo(k) + '</span>' +
      '<span class="rk-serit-metin"><b>' + kac(k.baslik || m.ad) + '</b>' + (k.metin ? '<span>' + kac(k.metin) + '</span>' : '') + '</span>' +
      (k.cta ? '<span class="rk-serit-cta">' + kac(k.cta) + ' ' + ik('fa-arrow-right') + '</span>' : '') + '</a></aside>';
  };

  /* ── Pano · x-reklam.slot bicim=pano (rk-format-native_showcase; içerik sonu MD-END) ── */
  B.pano = function (k, o) {
    var m = marka(k), ince = o && o.ince;
    return '<aside ' + kok(o.kod, k, 'rk-slot rk-pano ' + (ince ? 'rk-ince-banner ' : '') + 'rk-format-native_showcase ' + m.renkSinif + ' ' + tur(k)) + ad(k) + '>' + etiket() +
      '<a class="rk-pano-bag" ' + bag(k) + '>' + (gorsel(k) ? '<img class="rk-pano-gorsel" src="' + gorsel(k) + '" alt="" width="400" height="300" loading="lazy" decoding="async">' : '') +
      '<span class="rk-zemin-perde" aria-hidden="true"></span><span class="rk-pano-logo">' + logo(k) + '</span>' +
      '<span class="rk-pano-metin"><b>' + kac(k.baslik || m.ad) + '</b>' + (k.metin ? '<span>' + kac(k.metin) + '</span>' : '') + '</span>' +
      '<span class="rk-pano-cta">' + kac(k.cta || 'Keşfet') + ' ' + ik('fa-arrow-right') + '</span></a></aside>';
  };

  /* ── SB1 · x-reklam.slot native_rectangle + bicim=dikdortgen (kenar sütunu, 4:3 medya) ── */
  B.rectangle = function (k, o) {
    var m = marka(k), sahne = (k.gorselTuru || 'sahne') === 'sahne';
    var vitrin = sahne
      ? '<img class="rk-rectangle-sahne" src="' + gorsel(k) + '" alt="" loading="lazy" decoding="async"><span class="rk-rectangle-marka-perde" aria-hidden="true"></span><span class="rk-rectangle-buyuk-logo">' + logo(k) + '</span>'
      : (gorsel(k) ? '<img class="rk-rectangle-urun" src="' + gorsel(k) + '" alt="" loading="lazy" decoding="async">' : '') + '<span class="rk-rectangle-logo">' + logo(k) + '</span>';
    return '<aside ' + kok(o.kod, k, 'rk-slot rk-rectangle rk-rectangle-tip-' + (sahne ? 'sahne' : 'urun') + ' ' + m.renkSinif) + ad(k) + '>' +
      '<a class="rk-rectangle-bag" ' + bag(k) + '><span class="rk-rectangle-vitrin">' + vitrin + '<span class="rk-rectangle-etiket">Sponsorlu</span></span>' +
      '<span class="rk-rectangle-icerik"><span class="rk-rectangle-marka">' + kac(m.ad) + '</span><b class="rk-rectangle-baslik">' + kac(k.baslik || m.ad) + '</b>' +
      (k.metin ? '<span class="rk-rectangle-metin">' + kac(k.metin) + '</span>' : '') +
      (k.teklif ? '<span class="rk-rectangle-teklif">' + ik('fa-gift') + ' ' + kac(k.teklif) + '</span>' : '') +
      '<span class="rk-rectangle-cta">' + kac(k.cta || 'Keşfet') + ' ' + ik('fa-arrow-right') + '</span></span></a></aside>';
  };

  /* ── İnteraktif · x-reklam.slot bicim=interaktif: Gastro kapatılabilir şeridi `.rk-pisirme` + açılınca pano `.rk-pano`.
     Davranış assets/js/reklam/interaktif.js (panel public/reklam/interaktif.js uyarlaması; sayım isteği yok) ── */
  B.interaktif = function (k, o) {
    var m = marka(k), id = 'rk-panel-' + kac(o.kod);
    return '<div data-rk-interaktif><aside ' + kok(o.kod, k, 'rk-slot rk-pisirme ' + m.renkSinif) + ' data-rk-kapatilabilir>' +
      '<span class="rk-pisirme-logo">' + logo(k) + '</span><span class="rk-pisirme-metin">' + etiket() + '<b><button type="button" data-rk-ac aria-expanded="false" aria-controls="' + id + '">' + kac(k.baslik || m.ad) + ' <span aria-hidden="true">▾</span></button></b></span>' +
      '<a ' + bag(k) + '>' + kac(k.cta || 'Keşfet') + ' →</a><button type="button" aria-label="Reklamı kapat" data-rk-kapat>×</button></aside>' +
      '<div class="rk-pano rk-format-native_showcase ' + m.renkSinif + ' ' + tur(k) + '" id="' + id + '" data-rk-panel hidden><a class="rk-pano-bag" ' + bag(k) + '>' +
      (gorsel(k) ? '<img class="rk-pano-gorsel" src="' + gorsel(k) + '" alt="" width="400" height="300" loading="lazy" decoding="async">' : '') +
      '<span class="rk-zemin-perde" aria-hidden="true"></span><span class="rk-pano-logo">' + logo(k) + '</span>' +
      '<span class="rk-pano-metin"><b>' + kac(k.baslik || m.ad) + '</b>' + (k.metin ? '<span>' + kac(k.metin) + '</span>' : '') + '</span>' +
      '<span class="rk-pano-cta">' + kac(k.cta || 'Keşfet') + ' ' + ik('fa-arrow-right') + '</span></a></div></div>';
  };

  /* ── Native kartlar: listenin KENDİ kart anatomisi + Gastro sponsor işaretleri (x-reklam.native, native-hap, native-kimlik):
     kök `data-native-sponsor` + marka renk sınıfı (sol 4 px marka şeridi, kanon `[data-native-sponsor]::before`), görselin köşesinde
     "Sponsorlu" hapı, kartın SONUNDA kimlik satırı (logo · "Sponsorlu · Marka →", sondaki ok). Kart gövdesi sponsorun kendi mekânı,
     etkinliği ya da içeriğidir. ── */
  function kimlik(k) {
    var m = marka(k);
    return '<span class="rk-native-kimlik"><span class="rk-native-wordmark">' + logo(k) + '</span><span class="rk-native-kesfet"><span class="rk-native-prefix">Sponsorlu · </span>' + kac(m.kisaAd || m.ad) + ' <span class="rk-native-ok" aria-hidden="true">→</span></span></span>';
  }
  var hap = '<span class="rk-native-hap">Sponsorlu</span>';
  B.kimlik = kimlik;
  B.hap = hap;
  /* Organik kart HTML'ini sponsorlu native'e çevirir: kök özniteliği, hap (kartın ilk çocuğu) ve kimlik satırı (`kimlikOnce` seçicisinden önce,
     yoksa kartın sonuna). Organik gövde değişmez */
  B.susle = function (html, k, o, kimlikOnce) {
    var m = marka(k);
    var t = document.createElement('template');
    t.innerHTML = html.trim();
    var el = t.content.firstElementChild;
    if (!el) { return ''; }
    el.classList.add(m.renkSinif, 'rk-native');
    el.setAttribute('data-rk-slot', o.kod);
    el.setAttribute('data-rk-kod', o.kod);
    el.setAttribute('data-rk-marka', k.marka);
    if (k.id) { el.setAttribute('data-rk-kreatif', k.id); }
    el.setAttribute('data-native-sponsor', '');
    el.setAttribute('data-native-gorsel', 'sahne');
    el.setAttribute('aria-label', 'Sponsorlu · ' + m.ad);
    el.insertAdjacentHTML('afterbegin', hap);
    var once = kimlikOnce && el.querySelector(kimlikOnce);
    if (once) { once.insertAdjacentHTML('beforebegin', kimlik(k)); } else { el.insertAdjacentHTML('beforeend', kimlik(k)); }
    return el.outerHTML;
  };
  var arkaplan = function (k) { return gorsel(k) ? ' style="background-image:url(\'' + gorsel(k) + '\')"' : ''; };

  /* Mekân kartı (`site/mekanlar/_kart`, Mekânlar ve Benzer mekânlar): mekân veride varsa organik kartın kendisi (DG_LISTE.kartlar) */
  function eylem(k) {
    return '<div class="mkl-kart-eylem"><a class="mke-birincil" ' + bag(k) + '>' + kac(k.cta || 'Detayları Gör') + '</a></div>';
  }
  function mekanKarti(k, o) {
    var L = window.DG_LISTE, h = L && L.kartlar && k.mekan ? L.kartlar[k.mekan] : '';
    if (h) {
      h = h.split('{{kok}}').join(KOK).replace(/<\/article>\s*$/, eylem(k) + '</article>');
      if (k.hedef) { h = h.replace('<article ', '<article data-git="' + url(k.hedef) + '" '); }
      return B.susle(h, k, o, '.mkl-kart-eylem');
    }
    return konseptKarti(k, o);
  }
  /* Konsept ve seçki kartı: mekân kartının anatomisi (veride mekânı olmayan marka: kafe zinciri, gastronomi seçkisi) */
  function konseptKarti(k, o) {
    var h = '<article class="disc-card mkl-card"' + (k.hedef ? ' data-git="' + url(k.hedef) + '"' : '') + '><div class="disc-fig"><div class="bg"' + arkaplan(k) + ' role="img" aria-label="' + kac(k.baslik) + '"></div></div>' +
      '<span class="disc-cat">' + kac(k.kategori || '') + '</span><h3>' + kac(k.baslik) + '</h3><p>' + kac(k.metin) + '</p>' +
      '<div class="disc-meta"><span class="disc-loc" title="' + kac(k.konum || '') + '">' + ik('fa-location-dot') + '<span class="disc-ilce">' + kac(k.konum || '') + '</span></span></div>' + eylem(k) + '</article>';
    return B.susle(h, k, o, '.mkl-kart-eylem');
  }
  /* Etkinlik kartı (`site/etkinlikler/_kart`, `disc-card ev-card`) */
  function etkinlikKarti(k, o) {
    var h = '<article class="disc-card ev-card"><a class="disc-card-link" ' + bag(k) + '><div class="disc-fig"><div class="bg"' + arkaplan(k) + '></div>' +
      (k.kategori ? '<div class="disc-badges"><span class="disc-badge">' + ik('fa-star') + ' ' + kac(k.kategori) + '</span></div>' : '') + '</div>' +
      '<span class="disc-cat">' + kac(k.kategori || '') + '</span><h3>' + kac(k.baslik) + '</h3><p>' + kac(k.metin) + '</p>' +
      '<div class="disc-meta ev-meta"><span class="disc-when ev-when">' + ik('fa-calendar') + ' <span class="dw-txt">' + kac(k.tarih || '') + '</span></span><span class="ev-meta-sep" aria-hidden="true">·</span>' +
      '<span class="disc-where">' + ik('fa-location-dot') + ' <span class="dw-txt">' + kac(k.konum || '') + '</span></span></div></a>' +
      '<div class="disc-card-foot"><a class="btn btn-sm btn-primary" ' + bag(k) + '>' + kac(k.cta || 'İncele') + '</a></div></article>';
    return B.susle(h, k, o, '.disc-card-foot');
  }
  /* Lezzet kartı (`site/lezzetler/_kart`, `disc-card ke-stop`; kalıp _src/parcalar/lezzet-kart.html) */
  function lezzetKarti(k, o) {
    var h = '<article class="disc-card ke-stop"><a class="disc-card-link" ' + bag(k) + '><div class="disc-fig"><div class="bg"' + arkaplan(k) + '></div>' +
      (k.sure ? '<div class="m-types"><span class="mt">' + ik('fa-clock') + ' ' + kac(k.sure) + '</span></div>' : '') + '</div>' +
      '<span class="disc-cat">' + kac(k.kategori || '') + '</span><h3>' + kac(k.baslik) + '</h3><p>' + kac(k.metin) + '</p></a></article>';
    return B.susle(h, k, o);
  }
  /* Rehber kartı (`site/sehir-rehberleri/_kart`, `bridge-card`): ikon kutusunda marka logosu */
  function rehberKarti(k, o) {
    var h = '<a class="bridge-card" ' + bag(k) + '><span class="bi rk-bi-logo">' + logo(k, '') + '</span><h3>' + kac(k.baslik) + '</h3><p>' + kac(k.metin) + '</p>' +
      '<span class="bgo">' + kac(k.cta || 'Keşfet') + ' ' + ik('fa-arrow-right') + '</span></a>';
    return B.susle(h, k, o);
  }
  B.native = function (k, o) {
    switch (k.kart) {
      case 'konsept': case 'secki': return konseptKarti(k, o);
      case 'etkinlik': return etkinlikKarti(k, o);
      case 'lezzet': return lezzetKarti(k, o);
      case 'rehber': return rehberKarti(k, o);
      default: return mekanKarti(k, o); /* mekan; sonuc ve arama kartları sayfa çizicisi verene kadar mekân kartıyla */
    }
  };
  B.kart = { mekan: mekanKarti, konsept: konseptKarti, secki: konseptKarti, etkinlik: etkinlikKarti, lezzet: lezzetKarti, rehber: rehberKarti };

  /* ── Standart katman · x-reklam.standart (side, popup, altbar). Görünürlük, sıklık ve kapatma reklam.js'te ── */
  var KAPAT = '<button type="button" class="rk-std-kapat" aria-label="Reklamı kapat"><svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></button>';
  B.standart = function (bicim, k, o) {
    var m = marka(k), sahne = (k.gorselTuru || 'sahne') === 'sahne';
    var medya = (bicim === 'side' || bicim === 'popup') && gorsel(k)
      ? '<div class="rk-std-medya' + (sahne ? ' rk-std-sahne' : '') + '">' + (bicim === 'side' ? '<span class="rk-side-image">' : '') + '<img src="' + gorsel(k) + '" alt="" loading="lazy" width="640" height="480">' + (bicim === 'side' ? '</span>' : '') + '</div>' : '';
    var urun = bicim === 'altbar' && gorsel(k) ? '<span class="rk-altbar-urun"><img src="' + gorsel(k) + '" alt="" width="40" height="40" loading="lazy" decoding="async"></span>' : '';
    return '<aside class="rk-std rk-std-' + bicim + ' ' + m.renkSinif + '" data-rk-bicim="' + bicim + '" data-rk-slot="' + kac(o.kod) + '" data-rk-kod="' + kac(o.kod) + '" data-rk-marka="' + kac(k.marka) + '" aria-label="Sponsorlu · ' + kac(m.ad) + '">' +
      '<div class="rk-std-kart"' + (bicim === 'popup' ? ' role="dialog" aria-modal="true" aria-label="' + kac(k.baslik || m.ad) + ' · Sponsorlu" tabindex="-1"' : '') + '>' + KAPAT + medya +
      '<div class="rk-std-mesaj"><span class="rk-std-logo">' + logo(k) + '</span>' + urun +
      '<div class="rk-std-yazi"><span class="rk-std-etiket">' + (bicim === 'altbar' ? '<strong>' + kac(m.ad) + '</strong> · ' : '') + 'Sponsorlu</span><b>' + kac(k.baslik || m.ad) + '</b><p>' + kac(k.metin || '') + '</p></div>' +
      '<a class="rk-std-cta" ' + bag(k) + '>' + kac(k.cta || 'Keşfet') + ' <span aria-hidden="true">→</span></a></div></div></aside>';
  };

  window.dgReklamBilesen = B;
})();
