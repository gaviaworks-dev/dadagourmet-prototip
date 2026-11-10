// İşletme Paneli kabuğu (`duzen: "panel"`). Yapı Gastro/Diet panel kanonundan AYNEN: marka rayı, sol modül menüsü, üst çubuk, gövde.
// Kaynak: dadadiet-prototip `_src/kabuk/kabuk.mjs` panelKabuk ve DadaGastro `resources/views/turetilmis/admin/admin-*.blade.php`
// (panel-ray · panel-menu · panel-ust · panel-govde). CSS zinciri Gastro admin'in sırası: tokenlar → markalar/gourmet → bilesenler → admin.
const K = '{{kok}}';

// Menü tek kaynak: [kimlik, ikon, ad, yol, sayaç anahtarı]. Sayaç değeri derlemede örnek veriden, açılışta betik bu tarayıcıdaki duruma göre tazeler
export const panelMenu = [
  { bolum: 'Mekânım', kalemler: [
    ['genel-bakis', 'fa-gauge-high', 'Genel Bakış', 'isletme/'],
    ['profil', 'fa-store', 'Mekân Profili', 'isletme/profil/'],
    ['menu', 'fa-utensils', 'Menü', 'isletme/menu/'],
    ['fotograflar', 'fa-images', 'Fotoğraflar', 'isletme/fotograflar/'],
    ['saatler', 'fa-clock', 'Çalışma Saatleri', 'isletme/calisma-saatleri/'],
  ] },
  { bolum: 'Misafirler', kalemler: [
    ['rezervasyonlar', 'fa-calendar-check', 'Rezervasyonlar', 'isletme/rezervasyonlar/', 'rez'],
    ['etkinlikler', 'fa-calendar-days', 'Etkinlikler', 'isletme/etkinlikler/'],
    ['degerlendirmeler', 'fa-star-half-stroke', 'Değerlendirmeler', 'isletme/degerlendirmeler/', 'yanit'],
    ['istatistikler', 'fa-chart-line', 'İstatistikler', 'isletme/istatistikler/'],
  ] },
  { bolum: 'İşletme', kalemler: [
    ['basvurular', 'fa-file-signature', 'Başvurular', 'isletme/basvurular/'],
    ['talepler', 'fa-pen-to-square', 'Değişiklik Talepleri', 'isletme/degisiklik-talepleri/'],
    ['ayarlar', 'fa-sliders', 'Ayarlar', 'isletme/ayarlar/'],
  ] },
];

// Dada ekosistemi rayı (kanon K27): bulunulan marka en üstte. Kardeş markaların paneli bu prototipte yok, ikon pasif
const EKO = [['fit', 'fa-dumbbell', 'DadaFit'], ['gastro', 'fa-utensils', 'DadaGastro'], ['diet', 'fa-heart-pulse', 'DadaDiet'], ['gourmet', 'fa-map-location-dot', 'DadaGourmet']];

export function panelKabuk(meta, govde, sayaclar = {}) {
  const ray = EKO.map(([e, i, a]) => (e === 'gourmet'
    ? `<a class="panel-ray-ikon" href="${K}isletme/" data-eko="${e}" title="${a}" aria-label="${a} İşletme Paneli" aria-current="true"><i class="fa-solid ${i}" aria-hidden="true"></i></a>`
    : `<span class="panel-ray-ikon" data-eko="${e}" title="${a} paneli bu prototipte yok" aria-label="${a} paneli bu prototipte yok" aria-disabled="true"><i class="fa-solid ${i}" aria-hidden="true"></i></span>`)).join('');
  const menu = panelMenu.map((g) => `<div class="panel-menu-bolum">${g.bolum}</div>` + g.kalemler.map(([id, i, a, h, s]) => {
    const aktif = meta.aktif === id;
    const n = s ? sayaclar[s] ?? 0 : 0;
    return `<a class="panel-menu-link${aktif ? ' aktif' : ''}"${aktif ? ' aria-current="page"' : ''} href="${K}${h}"><i class="fa-solid ${i}" aria-hidden="true"></i>${a}${s ? `<span class="sayac" data-menu-sayac="${s}"${n ? '' : ' hidden'}>${n}</span>` : ''}</a>`;
  }).join('')).join('');
  return `<aside class="panel-ray" aria-label="Marka rayı">${ray}<div class="panel-ray-alt"></div></aside>
<nav class="panel-menu" id="panelMenu" aria-label="Modüller"><div class="panel-menu-bas"><a class="panel-marka" href="${K}isletme/" aria-label="Dada Gourmet İşletme Paneli"><span class="yalniz-okuyucu">Dada Gourmet · İşletme Paneli</span></a></div><button type="button" class="panel-katla" aria-pressed="false" aria-label="Menüyü daralt"><i class="fa-solid fa-chevron-left" aria-hidden="true"></i></button><div class="panel-menu-govde">${menu}</div><div class="panel-menu-alt"><a class="panel-menu-link" href="${K}mekan/mikla/"><i class="fa-solid fa-eye" aria-hidden="true"></i>Mekânımı görüntüle</a><a class="panel-menu-link" href="${K}"><i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>Siteyi gör</a></div></nav>
<header class="panel-ust"><button class="panel-ust-dugme panel-ac" type="button" aria-expanded="false" aria-controls="panelMenu" aria-label="Modül menüsünü aç"><i class="fa-solid fa-bars" aria-hidden="true"></i></button><div class="panel-arama" role="search"><i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i><input type="search" class="panel-arama-girdi" id="panelAra" placeholder="Misafir, tarih ya da alerjen notu ara" autocomplete="off" aria-label="Rezervasyonlarda ara"></div><div class="panel-ust-sag"><a class="panel-ust-dugme" href="${K}isletme/rezervasyonlar/" aria-label="Bekleyen rezervasyon talepleri" data-zil><i class="fa-solid fa-bell" aria-hidden="true"></i><span class="benek" aria-hidden="true"${sayaclar.rez ? '' : ' hidden'}></span></a><div class="acilir-kap"><button class="panel-ust-ben" type="button" aria-expanded="false" aria-controls="hesapAcilir"><span class="kisi-avatar" aria-hidden="true">{{uye.harf}}</span><span><span class="ad">{{uye.ad}}</span><span class="rol">Mekân sahibi · Mikla</span></span><i class="fa-solid fa-chevron-down" aria-hidden="true"></i></button><div class="acilir-yuzey saga" id="hesapAcilir" role="menu" aria-label="Hesap" hidden><div class="acilir-bas">{{uye.ad}}</div><a class="acilir-kalem" href="${K}isletme/profil/" role="menuitem"><i class="fa-solid fa-store" aria-hidden="true"></i>Mekân Profili</a><a class="acilir-kalem" href="${K}isletme/ayarlar/" role="menuitem"><i class="fa-solid fa-sliders" aria-hidden="true"></i>Ayarlar</a><a class="acilir-kalem" href="${K}hesabim/gurme-panelim/" role="menuitem"><i class="fa-solid fa-utensils" aria-hidden="true"></i>Gurme Panelim</a><a class="acilir-kalem" href="${K}" role="menuitem" data-cikis><i class="fa-solid fa-right-from-bracket" aria-hidden="true"></i>Çıkış yap</a></div></div></div></header>
<main class="panel-govde" id="pageMain"><div class="panel-sayfa">${govde}</div></main>`;
}

// Zincir: Gastro admin sırası + Diet panelinin ek bileşenleri (grafik, yan panel, sayaç kartı) + Gourmet panel eki
export const PANEL_CSS = ['assets/g/varliklar/fontawesome/css/all.min.css', 'assets/panel/taban.css', 'assets/g/kanon/tokenlar.css', 'assets/g/kanon/markalar/gourmet.css', 'assets/g/kanon/bilesenler.css', 'assets/g/kanon/admin.css', 'assets/panel/ek-bilesenler.css', 'assets/css/isletme-panel.css'];
export const PANEL_JS = ['assets/js/prototip.js', 'assets/g/panel/panel.js', 'assets/g/kanon/admin-kit.js'];
