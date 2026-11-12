/* Keşif Tercihlerim › Sevdiğim Mutfaklar: global mutfak kataloğu, TEK KAYNAK (kesif ajanı, 11 Kas; H6 Seçenek A).
   Sayfayı üreten `_src/sayfalar/hesabim/kesif-tercihleri.mjs` bu dosyayı derlemede okur (vm), tarayıcıda `window.DG_MUTFAK` olur.
   Kaynak alanları:
     katalog      canlı Gourmet `katalog_mutfaklar` (KatalogMutfaklariSeeder L28-45; /mekanlar süzgeci ve Mekân Bul bu 18 kalemi okur).
                  `kod` canlı kod. Mekân Bul ve mekân süzgeci bu turda DEĞİŞMEZ.
     gastro       canlı Gastro mutfak ekseni (dadagastro.com/tarifler "Mutfak", eksen_degerleri.mutfak, 50 kalem); `kod` Gastro slug'ı.
                  Bayrak Gastro `SunumHaritasi::BAYRAK` (assets/g/varliklar/flags/<iso>.svg); Balkan'da Gastro'da da bayrak yok.
     canliTercih  canlı KesifTercihiKaydetIstegi::MUTFAK_SECENEKLERI'deki düz ad (4 kalem; adlar katalogdan farklı).
     oneri        hiçbir canlı listede yok; prototip önerisi (şu an yok: "Marmara ve Trakya Mutfağı" Beyar kararı A1, 12 Kas ile kalktı).
   Grup adlarından ilk ikisi Mekân Bul adım 3 sekmeleriyle aynı (Öğün ve Lezzet, Türk ve Yöresel); Mekân Bul'un "Dünya Mutfakları"
   sekmesi burada yedi coğrafi gruba açılır. Kayıt değeri `kod`; `eski` eşlemesi dünkü 19 adlık kayıtları ve canlı tercih adlarını koda taşır. */
(function (kok) {
  'use strict';
  var gruplar = [
    { kod: 'ogun', ad: 'Öğün ve Lezzet', ikon: 'fa-mug-saucer', kalemler: [
      { kod: 'kahvalti-serpme', ad: 'Kahvaltı / Serpme', ikon: 'fa-egg', katalog: true, canliTercih: 'Kahvaltı' },
      { kod: 'kebap-ocakbasi', ad: 'Kebap / Ocakbaşı', ikon: 'fa-fire', katalog: true, canliTercih: 'Kebap ve Izgara' },
      { kod: 'deniz-urunleri', ad: 'Deniz Ürünleri', ikon: 'fa-fish', katalog: true, canliTercih: 'Balık ve Deniz Ürünleri' },
      { kod: 'ev-yemekleri', ad: 'Ev Yemekleri', ikon: 'fa-bowl-food', canliTercih: 'Ev Yemekleri' },
    ] },
    { kod: 'turk', ad: 'Türk ve Yöresel', ikon: 'fa-map-location-dot', kalemler: [
      { kod: 'turk-mutfagi', ad: 'Türk Mutfağı', bayrak: 'tr', katalog: true, gastro: true },
      { kod: 'anadolu-mutfagi', ad: 'Anadolu Mutfağı', ikon: 'fa-wheat-awn', katalog: true },
      { kod: 'ege-mutfagi', ad: 'Ege Mutfağı', ikon: 'fa-leaf', katalog: true },
      { kod: 'akdeniz-mutfagi', ad: 'Akdeniz Mutfağı', ikon: 'fa-lemon', katalog: true },
      { kod: 'karadeniz-mutfagi', ad: 'Karadeniz Mutfağı', ikon: 'fa-fish-fins', katalog: true },
      { kod: 'ic-anadolu-mutfagi', ad: 'İç Anadolu Mutfağı', ikon: 'fa-bread-slice', katalog: true },
      { kod: 'dogu-anadolu-mutfagi', ad: 'Doğu Anadolu Mutfağı', ikon: 'fa-cheese', katalog: true },
      { kod: 'guneydogu-mutfagi', ad: 'Güneydoğu Mutfağı', ikon: 'fa-mug-hot', katalog: true },
    ] },
    { kod: 'avrupa', ad: 'Avrupa', ikon: 'fa-earth-europe', kalemler: [
      { kod: 'italyan-mutfagi', ad: 'İtalyan Mutfağı', bayrak: 'it', katalog: true, gastro: true },
      { kod: 'fransiz-mutfagi', ad: 'Fransız Mutfağı', bayrak: 'fr', katalog: true, gastro: true },
      { kod: 'ispanyol-mutfagi', ad: 'İspanyol Mutfağı', bayrak: 'es', gastro: true },
      { kod: 'portekiz-mutfagi', ad: 'Portekiz Mutfağı', bayrak: 'pt', gastro: true },
      { kod: 'alman-mutfagi', ad: 'Alman Mutfağı', bayrak: 'de', gastro: true },
      { kod: 'avusturya-mutfagi', ad: 'Avusturya Mutfağı', bayrak: 'at', gastro: true },
      { kod: 'ingiliz-mutfagi', ad: 'İngiliz Mutfağı', bayrak: 'gb', gastro: true },
      { kod: 'irlanda-mutfagi', ad: 'İrlanda Mutfağı', bayrak: 'ie', gastro: true },
    ] },
    { kod: 'balkan', ad: 'Balkanlar ve Kafkasya', ikon: 'fa-mountain', kalemler: [
      { kod: 'yunan-mutfagi', ad: 'Yunan Mutfağı', bayrak: 'gr', gastro: true },
      { kod: 'balkan-mutfagi', ad: 'Balkan Mutfağı', ikon: 'fa-earth-europe', gastro: true },
      { kod: 'rus-mutfagi', ad: 'Rus Mutfağı', bayrak: 'ru', gastro: true },
      { kod: 'ukrayna-mutfagi', ad: 'Ukrayna Mutfağı', bayrak: 'ua', gastro: true },
      { kod: 'gurcu-mutfagi', ad: 'Gürcü Mutfağı', bayrak: 'ge', gastro: true },
      { kod: 'azerbaycan-mutfagi', ad: 'Azerbaycan Mutfağı', bayrak: 'az', gastro: true },
      { kod: 'ermeni-mutfagi', ad: 'Ermeni Mutfağı', bayrak: 'am', gastro: true },
    ] },
    { kod: 'ortadogu', ad: 'Orta Doğu', ikon: 'fa-mortar-pestle', kalemler: [
      { kod: 'iran-mutfagi', ad: 'İran Mutfağı', bayrak: 'ir', gastro: true },
      { kod: 'irak-mutfagi', ad: 'Irak Mutfağı', bayrak: 'iq', gastro: true },
      { kod: 'suriye-mutfagi', ad: 'Suriye Mutfağı', bayrak: 'sy', gastro: true },
      { kod: 'lubnan-mutfagi', ad: 'Lübnan Mutfağı', bayrak: 'lb', gastro: true },
      { kod: 'urdun-mutfagi', ad: 'Ürdün Mutfağı', bayrak: 'jo', gastro: true },
      { kod: 'suudi-arabistan-mutfagi', ad: 'Suudi Arabistan Mutfağı', bayrak: 'sa', gastro: true },
    ] },
    { kod: 'afrika', ad: 'Afrika', ikon: 'fa-earth-africa', kalemler: [
      { kod: 'misir-mutfagi', ad: 'Mısır Mutfağı', bayrak: 'eg', gastro: true },
      { kod: 'fas-mutfagi', ad: 'Fas Mutfağı', bayrak: 'ma', gastro: true },
      { kod: 'tunus-mutfagi', ad: 'Tunus Mutfağı', bayrak: 'tn', gastro: true },
      { kod: 'etiyopya-mutfagi', ad: 'Etiyopya Mutfağı', bayrak: 'et', gastro: true },
      { kod: 'guney-afrika-mutfagi', ad: 'Güney Afrika Mutfağı', bayrak: 'za', gastro: true },
    ] },
    { kod: 'asya', ad: 'Asya', ikon: 'fa-earth-asia', kalemler: [
      { kod: 'japon-mutfagi', ad: 'Japon Mutfağı', bayrak: 'jp', katalog: true, gastro: true },
      { kod: 'cin-mutfagi', ad: 'Çin Mutfağı', bayrak: 'cn', katalog: true, gastro: true },
      { kod: 'kore-mutfagi', ad: 'Kore Mutfağı', bayrak: 'kr', katalog: true, gastro: true },
      { kod: 'hint-mutfagi', ad: 'Hint Mutfağı', bayrak: 'in', katalog: true, gastro: true },
      { kod: 'pakistan-mutfagi', ad: 'Pakistan Mutfağı', bayrak: 'pk', gastro: true },
      { kod: 'tayland-mutfagi', ad: 'Tayland Mutfağı', bayrak: 'th', gastro: true },
      { kod: 'vietnam-mutfagi', ad: 'Vietnam Mutfağı', bayrak: 'vn', gastro: true },
      { kod: 'malezya-mutfagi', ad: 'Malezya Mutfağı', bayrak: 'my', gastro: true },
      { kod: 'endonezya-mutfagi', ad: 'Endonezya Mutfağı', bayrak: 'id', gastro: true },
      { kod: 'filipin-mutfagi', ad: 'Filipin Mutfağı', bayrak: 'ph', gastro: true },
      { kod: 'kazak-mutfagi', ad: 'Kazak Mutfağı', bayrak: 'kz', gastro: true },
      { kod: 'ozbek-mutfagi', ad: 'Özbek Mutfağı', bayrak: 'uz', gastro: true },
    ] },
    { kod: 'amerika', ad: 'Amerika', ikon: 'fa-earth-americas', kalemler: [
      { kod: 'meksika-mutfagi', ad: 'Meksika Mutfağı', bayrak: 'mx', katalog: true, gastro: true },
      { kod: 'amerikan-mutfagi', ad: 'Amerikan Mutfağı', bayrak: 'us', gastro: true },
      { kod: 'kanada-mutfagi', ad: 'Kanada Mutfağı', bayrak: 'ca', gastro: true },
      { kod: 'kuba-mutfagi', ad: 'Küba Mutfağı', bayrak: 'cu', gastro: true },
      { kod: 'jamaika-mutfagi', ad: 'Jamaika Mutfağı', bayrak: 'jm', gastro: true },
      { kod: 'kolombiya-mutfagi', ad: 'Kolombiya Mutfağı', bayrak: 'co', gastro: true },
      { kod: 'peru-mutfagi', ad: 'Peru Mutfağı', bayrak: 'pe', gastro: true },
      { kod: 'brezilya-mutfagi', ad: 'Brezilya Mutfağı', bayrak: 'br', gastro: true },
      { kod: 'arjantin-mutfagi', ad: 'Arjantin Mutfağı', bayrak: 'ar', gastro: true },
    ] },
    { kod: 'okyanusya', ad: 'Okyanusya', ikon: 'fa-earth-oceania', kalemler: [
      { kod: 'avustralya-mutfagi', ad: 'Avustralya Mutfağı', bayrak: 'au', gastro: true },
      { kod: 'yeni-zelanda-mutfagi', ad: 'Yeni Zelanda Mutfağı', bayrak: 'nz', gastro: true },
    ] },
  ];
  var kalemler = [], eski = {};
  gruplar.forEach(function (g) {
    g.kalemler.forEach(function (m) {
      m.grup = g.kod; kalemler.push(m);
      eski[m.ad] = m.kod; /* dünkü kayıt adla tutuluyordu (19 ad, hepsi listede aynen var) */
      if (m.canliTercih) { eski[m.canliTercih] = m.kod; } /* canlı tercih adı: "Kebap ve Izgara" → kebap-ocakbasi */
    });
  });
  kok.DG_MUTFAK = { gruplar: gruplar, kalemler: kalemler, eski: eski };
})(typeof window !== 'undefined' ? window : globalThis);
