/* Reklam önizlemesi · örnek içerik (reklam-onizleme, 11 Kas). TEK KAYNAK: kreatifler, çizimler ve sayfa yerleşimleri burada.
   Gerçek marka, logo ya da sponsorluk yok: her kreatif açıkça "Örnek … Markası" ve her yerleşim "Sponsorlu · prototip örneği" taşır.
   Görseller SVG ile üretilir; renkler yalnız kanon tokenları (marka mor, koyu marka zemini, krem, altın çizgi), yeni renk yok.
   Yerleşim kuralları G1–G10 (panel oturumunun REKLAM-YERLESIM.md'si gelene kadar): ayrıntı tasks/rapor-reklam-onizleme.md.
   Bu dosya yalnız önizleme açıkken yüklenir (assets/js/reklam/reklam.js). */
(function () {
  'use strict';
  var KREATIF = [
    { id: 'sofra', marka: 'Örnek Restoran Markası', baslik: 'Şefin tadım menüsü bu ay yeni sofrada', metin: 'Mevsimin ürünleriyle yedi tabaklık akşam menüsü.', cta: 'Menüyü incele', cizim: 'sofra', ikon: 'fa-utensils' },
    { id: 'kahve', marka: 'Örnek Kahve Markası', baslik: 'Tek kökenli çekirdek, haftalık taze kavrum', metin: 'Filtre ve espresso için kavrum takvimi.', cta: 'Keşfet', cizim: 'kahve', ikon: 'fa-mug-hot' },
    { id: 'zeytin', marka: 'Örnek Zeytinyağı Markası', baslik: 'Erken hasat, soğuk sıkım', metin: 'Ege bahçelerinden sınırlı üretim natürel sızma.', cta: 'İncele', cizim: 'zeytin', ikon: 'fa-bottle-droplet' },
    { id: 'mutfak', marka: 'Örnek Mutfak Ekipmanı Markası', baslik: 'Profesyonel mutfak, şimdi evde', metin: 'Döküm tava ve şef bıçaklarında sezon seçkisi.', cta: 'Seçkiye bak', cizim: 'tava', ikon: 'fa-kitchen-set' },
    { id: 'seyahat', marka: 'Örnek Seyahat Markası', baslik: 'Lezzet rotaları için hafta sonu', metin: 'Gastronomi rotalarına yakın konaklama seçenekleri.', cta: 'Rotaları gör', cizim: 'yol', ikon: 'fa-route' }
  ];

  /* SVG çizimler (400×240 tuval, `slice` ile her orana kırpılır). Renkler CSS değişkeniyle: satır içi SVG kanon tokenlarını okur */
  var n = 0;
  var r = function (v) { return 'style="fill:var(' + v + ')"'; };
  var CIZIM = {
    sofra: function () {
      return '<circle cx="200" cy="122" r="86" ' + r('--krem-2') + ' opacity=".18"/>' +
        '<circle cx="200" cy="122" r="74" ' + r('--krem-2') + '/><circle cx="200" cy="122" r="56" ' + r('--kagit') + '/>' +
        '<ellipse cx="214" cy="132" rx="26" ry="15" ' + r('--altin-cizgi') + '/><circle cx="184" cy="110" r="17" ' + r('--marka-parlak') + '/>' +
        '<circle cx="182" cy="142" r="9" ' + r('--marka') + '/><circle cx="222" cy="104" r="6" ' + r('--uyari') + '/><circle cx="198" cy="96" r="3.5" ' + r('--marka-koyu-2') + '/>' +
        '<rect x="96" y="58" width="9" height="128" rx="4.5" ' + r('--krem-2') + ' opacity=".9"/><rect x="88" y="58" width="5" height="40" rx="2.5" ' + r('--krem-2') + ' opacity=".9"/><rect x="108" y="58" width="5" height="40" rx="2.5" ' + r('--krem-2') + ' opacity=".9"/>' +
        '<path d="M300 58c14 6 16 40 8 60v68h-10V58z" ' + r('--krem-2') + ' opacity=".9"/>' +
        '<circle cx="338" cy="58" r="24" fill="none" stroke-width="3" style="stroke:var(--krem-2)" opacity=".55"/><circle cx="338" cy="58" r="15" ' + r('--marka-parlak') + ' opacity=".35"/>';
    },
    kahve: function () {
      var cekirdek = function (x, y, a) { return '<g transform="translate(' + x + ' ' + y + ') rotate(' + a + ')"><ellipse rx="11" ry="7" ' + r('--uyari') + '/><path d="M-9 0q9-3 18 0" fill="none" stroke-width="1.6" style="stroke:var(--marka-koyu-zemin-2)" opacity=".55"/></g>'; };
      return '<circle cx="196" cy="124" r="80" ' + r('--krem-2') + ' opacity=".2"/><circle cx="196" cy="124" r="66" ' + r('--krem-2') + '/>' +
        '<circle cx="196" cy="124" r="44" ' + r('--kagit') + '/><circle cx="196" cy="124" r="34" ' + r('--uyari') + '/>' +
        '<circle cx="196" cy="124" r="26" fill="none" stroke-width="3" style="stroke:var(--altin-cizgi)" opacity=".75"/><path d="M188 118c6-6 14-2 16 4" fill="none" stroke-width="3" stroke-linecap="round" style="stroke:var(--krem-2)" opacity=".7"/>' +
        '<rect x="240" y="116" width="34" height="14" rx="7" ' + r('--krem-2') + '/>' +
        cekirdek(92, 70, 30) + cekirdek(112, 178, -20) + cekirdek(312, 72, 60) + cekirdek(330, 176, 10) + cekirdek(80, 128, 80);
    },
    zeytin: function () {
      var zeytin = function (x, y, a, v) { return '<ellipse cx="' + x + '" cy="' + y + '" rx="13" ry="9" transform="rotate(' + a + ' ' + x + ' ' + y + ')" ' + r(v) + '/>'; };
      return '<path d="M178 40h28v26c18 8 26 22 26 40v96c0 8-6 14-14 14h-52c-8 0-14-6-14-14v-96c0-18 8-32 26-40z" ' + r('--krem-2') + '/>' +
        '<rect x="176" y="30" width="32" height="14" rx="4" ' + r('--marka-koyu-2') + '/><rect x="152" y="120" width="80" height="46" rx="6" ' + r('--kagit') + '/>' +
        '<rect x="166" y="134" width="52" height="5" rx="2.5" ' + r('--marka') + '/><rect x="174" y="146" width="36" height="4" rx="2" ' + r('--altin-cizgi') + '/>' +
        '<path d="M262 170c30-30 70-36 96-30" fill="none" stroke-width="4" stroke-linecap="round" style="stroke:var(--altin-cizgi)" opacity=".8"/>' +
        zeytin(290, 150, -20, '--marka-parlak') + zeytin(322, 132, 10, '--marka-koyu-2') + zeytin(344, 152, -30, '--marka-parlak') +
        '<path d="M120 190c-26-20-40-50-30-80" fill="none" stroke-width="4" stroke-linecap="round" style="stroke:var(--altin-cizgi)" opacity=".7"/>' +
        zeytin(98, 120, 60, '--marka-koyu-2') + zeytin(110, 158, 40, '--marka-parlak');
    },
    tava: function () {
      return '<circle cx="176" cy="124" r="78" ' + r('--marka-koyu-zemin-2') + '/><circle cx="176" cy="124" r="64" fill="none" stroke-width="5" style="stroke:var(--krem-2)" opacity=".18"/>' +
        '<rect x="248" y="114" width="118" height="20" rx="10" ' + r('--marka-koyu-zemin-2') + '/><rect x="330" y="119" width="28" height="10" rx="5" ' + r('--krem-2') + ' opacity=".35"/>' +
        '<ellipse cx="152" cy="110" rx="30" ry="24" ' + r('--kagit') + '/><circle cx="154" cy="112" r="11" ' + r('--altin-cizgi') + '/>' +
        '<ellipse cx="200" cy="146" rx="26" ry="20" ' + r('--kagit') + '/><circle cx="202" cy="146" r="9.5" ' + r('--altin-cizgi') + '/>' +
        '<circle cx="196" cy="98" r="5" ' + r('--marka-parlak') + '/><circle cx="140" cy="148" r="4" ' + r('--marka-parlak') + '/><circle cx="224" cy="118" r="3" ' + r('--krem-2') + '/>';
    },
    yol: function () {
      return '<path d="M-10 210C70 200 90 140 160 132s110 30 160-8 60-80 100-90" fill="none" stroke-width="22" stroke-linecap="round" style="stroke:var(--krem-2)" opacity=".9"/>' +
        '<path d="M-10 210C70 200 90 140 160 132s110 30 160-8 60-80 100-90" fill="none" stroke-width="3" stroke-dasharray="12 12" style="stroke:var(--marka-koyu-2)" opacity=".6"/>' +
        '<g transform="translate(160 132)"><path d="M0 0c-14-16-22-26-22-38a22 22 0 0144 0c0 12-8 22-22 38z" ' + r('--marka-parlak') + '/><circle cy="-38" r="8" ' + r('--kagit') + '/></g>' +
        '<g transform="translate(318 122)"><path d="M0 0c-14-16-22-26-22-38a22 22 0 0144 0c0 12-8 22-22 38z" ' + r('--altin-cizgi') + '/><circle cy="-38" r="8" ' + r('--kagit') + '/></g>' +
        '<circle cx="86" cy="70" r="26" ' + r('--krem-2') + ' opacity=".9"/><circle cx="86" cy="70" r="17" ' + r('--kagit') + '/><circle cx="82" cy="66" r="6" ' + r('--marka-parlak') + '/><circle cx="92" cy="76" r="5" ' + r('--altin-cizgi') + '/>';
    }
  };
  function svg(ad) {
    var id = 'rkg' + (++n);
    return '<svg class="rk-svg" viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">' +
      '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--marka-koyu-zemin-2)"/><stop offset=".55" style="stop-color:var(--marka-koyu-2)"/><stop offset="1" style="stop-color:var(--marka)"/></linearGradient>' +
      '<radialGradient id="' + id + 'p" cx=".78" cy=".18" r=".7"><stop offset="0" style="stop-color:var(--kagit)" stop-opacity=".16"/><stop offset="1" style="stop-color:var(--kagit)" stop-opacity="0"/></radialGradient></defs>' +
      '<rect width="400" height="240" fill="url(#' + id + ')"/><rect width="400" height="240" fill="url(#' + id + 'p)"/>' + (CIZIM[ad] || CIZIM.sofra)() + '</svg>';
  }

  /* Sayfa yerleşimleri. Yol: `<html data-yol>`. Biçimler: banner (ince banner), native (listenin kendi kartı), kare (300×250, yalnız detay),
     yan (160×600 yapışkan dikey, geniş ekran), hero (hero sponsorluğu). Sıra: ilk eşleşen kural; son kural genel (sayfa sonunda tek banner).
     yon: once | sonra | basa | sona. her: N kartta bir native (liste N'den kısaysa listenin sonunda bir tane). sira: raydaki konum.
     alt: liste altı bannerı; listede 4'ten az kart kalırsa gizlenir (liste üstü bannerla art arda gelmesin, G1). bolum: kendi bandında. */
  var YERLESIM = [
    { y: /^$/, l: [
      { b: 'hero', h: '#keBrowse > .ke-top' },
      { b: 'banner', h: '#gmModules', yon: 'sonra', bolum: true },
      { b: 'native', kap: '#evTrack', kart: 'ev', sira: 3 },
      { b: 'native', kap: '#glTrack', kart: 'lezzet', sira: 3 }
    ] },
    { y: /^mekanlar$/, yan: true, l: [
      { b: 'hero', h: '#pageMain > .ke-top' },
      { b: 'banner', h: '#mklGrid', yon: 'once' },
      { b: 'native', kap: '#mklGrid', kart: 'mekan', her: 8 },
      { b: 'banner', h: '#mklGrid ~ #pagi', yon: 'sonra', alt: '#mklGrid' }
    ] },
    { y: /^etkinlikler$/, yan: true, l: [
      { b: 'hero', h: '#pageMain > .ke-top' },
      { b: 'banner', h: '#evGrid', yon: 'once' },
      { b: 'native', kap: '#evGrid', kart: 'ev', her: 6 },
      { b: 'banner', h: '#evGrid ~ #pagi', yon: 'sonra', alt: '#evGrid' }
    ] },
    { y: /^gurme-lezzetler$/, yan: true, l: [
      { b: 'hero', h: '.ke-grid-view > .ke-top' },
      { b: 'banner', h: '#lzGrid', yon: 'once' },
      { b: 'native', kap: '#lzGrid', kart: 'lezzet', her: 8 },
      { b: 'banner', h: '#lzGrid ~ #pagi', yon: 'sonra', alt: '#lzGrid' }
    ] },
    { y: /^sehir-rehberleri$/, l: [
      { b: 'hero', h: '#pageMain > .lst-top' },
      { b: 'native', kap: '#sehirler .val-grid', kart: 'rehber', her: 6 },
      { b: 'banner', h: '#nasil', yon: 'sonra', bolum: true }
    ] },
    { y: /^mekan\//, yan: true, l: [
      { b: 'kare', h: '#bilgi', yon: 'sona' },
      { b: 'banner', h: '#pageMain > .md-similar', yon: 'sonra', bolum: true }
    ] },
    { y: /^etkinlik-detay$/, yan: true, l: [
      { b: 'kare', h: '.evd-side', yon: 'sona' },
      { b: 'banner', h: '#pageMain .evd-others', yon: 'sonra', bolum: true }
    ] },
    { y: /^gurme-lezzet-detay$/, yan: true, l: [
      { b: 'kare', h: '.art-col > h2', yon: 'sonra', yuzen: true },
      { b: 'banner', h: '.art-related', yon: 'sonra', bolum: true }
    ] },
    { y: /^sehir-rehberi-detay$/, l: [
      { b: 'kare', h: '.about-sec > .wrap', yon: 'basa', yuzen: true }
    ] },
    { y: /.*/, l: [
      { b: 'banner', h: '#pageMain', yon: 'sona', bolum: true }
    ] }
  ];

  window.DG_REKLAM_ORNEK = { kreatif: KREATIF, svg: svg, yerlesim: YERLESIM };
})();
