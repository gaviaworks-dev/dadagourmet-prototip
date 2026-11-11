// Gurme Panelim (K3): Hesabım'dan ayrı alan, şartnamedeki 6 sekme (W2.5). Kabuk ve satır DOM'u donör go-mekanlarim render'ı.
// Puan Durumu: şartname değerleri (`dgPuan.KURAL`), kural satırları ile rozet ve rütbe kümesi `assets/js/rozet-veri.js` (K3 tek kaynak); puan önce bekleyen görünür, onayda kesinleşir (§8 kararı). Tutar örnekleri etiketli.
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { ROZET, KURAL } from '../_rozet.mjs';
import { hsIsaret } from '../_kalip.mjs'; // reklam HS-SB1 işareti (reklam-detay)
const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const s = JSON.parse(fs.readFileSync(path.join(SRC, 'parcalar/gurme-panel-iskelet.json'), 'utf8'));
const et = '<span class="ornek-etiket">prototip örneği</span>';
const SEKME = [
  ['rezervasyonlarim', 'fa-calendar-check', 'Rezervasyonlarım', 'Rezervasyon', 'Rezervasyon taleplerin', 'Gönderdiğin talepler ve mekân sahibinin yanıtları burada görünür.'],
  ['gurme-favorilerim', 'fa-heart', 'Gurme Favorilerim', 'Favori', 'Favori mekân ve tabakların', 'Kaydettiğin mekânlar ve favoriye aldığın tabaklar.'],
  ['ziyaret-gecmisim', 'fa-circle-check', 'Ziyaret Geçmişim', 'Ziyaret', 'Ziyaret geçmişin', 'İşaretlediğin ziyaretler tarih sırasıyla.'],
  ['degerlendirmelerim', 'fa-star', 'Değerlendirmelerim', 'Değerlendirme', 'Değerlendirmelerin', 'Yazdığın değerlendirmeler ve durumları.'],
  ['topluluk-katkilarim', 'fa-location-dot', 'Topluluk Katkılarım', 'Katkı', 'Mekân ve etkinlik önerilerin', 'Önerilerin ve inceleme durumları.'],
  ['puan-durumu', 'fa-award', 'Puan Durumu', 'Puan', 'Dada Puan durumun', 'Bekleyen puanın onaydan sonra kesinleşir.'],
];
const satir = (ikon, ad, alt, rozet) => `<div class="kalem-satiri"><span class="ks-ikon"><i class="fa-solid ${ikon}" aria-hidden="true"></i></span><span class="ks-metin"><b>${ad}</b><small>${alt}</small></span><span class="ks-uc"><span class="rozet pasif">${rozet}</span></span></div>`;
const bos = (ikon, b, m) => `<div class="bos-durum"><span class="bos-ikon"><i class="fa-regular ${ikon}" aria-hidden="true"></i></span><h4>${b}</h4><p>${m}</p></div>`;
const ICERIK = {
  'rezervasyonlarim': bos('fa-calendar-check', 'Henüz rezervasyon talebin yok', 'Bir mekânın sayfasından talep gönderdiğinde burada görünür; mekân sahibinin kararı da buraya düşer.'),
  'gurme-favorilerim': null, // aşağıda FAVORI: süzgeç çipleri + liste; satırları `favori.js` bu tarayıcının deposundan çizer
  'ziyaret-gecmisim': satir('fa-circle-check', 'Mikla', 'Beyoğlu, İstanbul · Örnek tarih', 'Ziyaret edildi'),
  'degerlendirmelerim': bos('fa-star', 'Henüz değerlendirmen yok', 'Ziyaret ettiğin bir mekânı değerlendirdiğinde burada görünür.'),
  'topluluk-katkilarim': bos('fa-location-dot', 'Henüz önerin yok', 'Mekân Öner ya da Etkinlik Öner ile gönderdiğin öneriler burada İnceleniyor olarak görünür.'),
  'puan-durumu': `<div class="puan-yapi"><div class="sayac"><i class="fa-solid fa-award" aria-hidden="true"></i><div><span>Kesinleşen puan</span><b data-puan="kesin">—</b></div></div><div class="sayac"><i class="fa-solid fa-clock-rotate-left" aria-hidden="true"></i><div><span>Bekleyen puan</span><b data-puan="bekleyen">—</b></div></div><div class="sayac"><i class="fa-solid fa-medal" aria-hidden="true"></i><div><span>Rütbe</span><b data-puan="rutbe">—</b></div></div></div><div class="puan-bolum"><h3>Puan nasıl kazanılır?</h3>${ROZET.puanKurallari.map((k) => satir(k.ikon, k.ad, k.onay, '+' + KURAL[k.k])).join('')}</div><div class="puan-bolum"><h3>Rozetler ${et}</h3><div id="rozetListe"></div></div><div class="puan-bolum"><h3>Rütbe basamakları ${et}</h3><div id="rutbeListe"></div></div><div class="puan-bolum"><h3>Puan hareketleri</h3><div id="puanDefter"></div></div>`,
};
// Gurme Favorilerim (favori ajanı, 11 Kas; Beyar: "buradan ekleyip çıkarabilelim"). Tek depo `dgKayit('favori')`: mekân kartındaki
// kaydet, mekân detayındaki kaydet ve Ne Yenir tabak favorisi aynı kayıtları yazar. Betiksiz görünüm iki örnek tohum kaydıdır
// (`prototip.js` aynı iki kaydı `ornek` işaretiyle bir kez yazar; tabak adı Mikla Ne Yenir örneğinden). Satır ucu kanon `.satir-dugme` "Çıkar"
// (Etkinliklerim "Kaldır" kalıbı); satırın tamamı detaya açılır (`.tiklanir`, Listelerim kalıbı). Süzgeç kanon `.kart-suzgec > .cip.suzgec`.
const FAV_ORNEK = [['mekan-mikla', 'fa-utensils', 'Mikla', 'Mekân · Beyoğlu, İstanbul', 'Mekân', 'mekan/mikla/'], ['tabak-otlu-kuzu', 'fa-bowl-food', 'Otlu kuzu', 'Tabak · Mikla', 'Tabak', 'mekan/mikla/?tab=ne-yenir']];
const favSatir = ([id, ikon, ad, alt, tur, href]) => `<div class="kalem-satiri tiklanir" data-favori="${id}"><span class="ks-ikon"><i class="fa-solid ${ikon}" aria-hidden="true"></i></span><span class="ks-metin"><b>${et} <a href="{{kok}}${href}">${ad}</a></b><small>${alt}</small></span><span class="ks-uc"><span class="rozet pasif">${tur}</span><button class="satir-dugme" type="button" data-favori-cikar="${id}" aria-label="${ad}: favorilerden çıkar"><i class="fa-solid fa-xmark" aria-hidden="true"></i> Çıkar</button></span></div>`;
const FAV_CIP = [['tumu', 'Tümü', 2], ['mekan', 'Mekânlar', 1], ['tabak', 'Tabaklar', 1]];
// Listenin başlığı: solda tür çipleri, sağda "Favori ekle" (pencereyi `favori.js` kurar)
const FAVORI = `<div class="kart favori-kart"><div class="kart-suzgec favori-suzgec"><div class="cipler" role="group" aria-label="Favori türüne göre süz">${FAV_CIP.map(([k, a, n], i) => `<button type="button" class="cip suzgec${i ? '' : ' on'}" data-favori-suzgec="${k}" aria-pressed="${i ? 'false' : 'true'}">${a} <span class="cip-sayi" data-favori-cip-sayi="${k}">${n}</span></button>`).join('')}</div><button class="dugme birincil kucuk" type="button" data-favori-ekle="" aria-haspopup="dialog"><i class="fa-solid fa-plus" aria-hidden="true"></i> Favori ekle</button></div><div class="kart-govde"><div class="fp-list favori-liste" id="favoriListe" data-favori-liste="">${FAV_ORNEK.map(favSatir).join('')}</div></div></div>`;
const FAV_ARAC = `<span class="rozet pasif" data-favori-sayac="">2 favori</span> ${et}`;
// Kimlik kartı özeti: favori sayısı (canlı Mekânlarım bandındaki "Favori mekân" sayacının karşılığı, `hesap/_parcalar/mekanlarim-bant`); `favori.js` günceller
const BANT = s.bant.replace('<span data-rozet-sayi="">', '<span data-favori-sayi=""><i class="fa-solid fa-heart" aria-hidden="true"></i> Favori 2</span>\n          <span data-rozet-sayi="">');
const bas = (a, b, c, ek) => `<div class="bolum-bas"><div><span class="ust-etiket">${a}</span><h2>${b}</h2><p class="giris-metni">${c}</p></div><div class="bolum-araclar">${ek}</div></div>`;
// Sekme bağı yalnız rayın altındaki içeriği değiştirir (H8): ray `data-sekme-gecis`, betik `sekme-gecis.js` (en sonda eklenir)
const sayfalar = function () {
  return SEKME.map(([yol, ikon, ad, ust, baslik, alt]) => {
    const nav = `<nav class="sekmeler ortali" aria-label="Gurme Panelim bölümleri" data-scroll-fade="" data-sekme-gecis="">${SEKME.map(([y, i, a]) => `<a class="sekme${y === yol ? ' aktif' : ''}" href="{{kok}}hesabim/gurme-panelim/${y === 'rezervasyonlarim' ? '' : y + '/'}"${y === yol ? ' aria-current="page"' : ''}><i class="fa-solid ${i}" aria-hidden="true"></i> ${a}</a>`).join('')}</nav>`;
    const fav = yol === 'gurme-favorilerim';
    const govde = `<div class="zebra">${BANT}<div class="pf-tabbar sekme-ray"><div class="wrap kap">${nav}</div></div><div class="modul-govde"><div class="fit-pane aktif"><div class="bolum kap">${bas(ust, baslik, alt, fav ? FAV_ARAC : et)}${fav ? FAVORI : `<div class="kart"><div class="kart-govde"><div class="fp-list">${ICERIK[yol]}</div></div></div>`}</div></div></div>${hsIsaret('hesabim/gurme-panelim')}</div>`;
    return { yol: 'hesabim/gurme-panelim' + (yol === 'rezervasyonlarim' ? '' : '/' + yol), meta: { baslik: `${ad} · Gurme Panelim`, duzen: 'uye', zincir: 'hesabim', css: ['gourmet-sapma'], js: ['assets/o/assets/gourmet-public/js/shared/scroll-affordance.js', 'assets/js/rozet-veri.js', 'assets/js/sayfa/panel.js', 'assets/js/sayfa/favori.js'], donor: 'https://gaviaworks-dev.github.io/DadaMentor/Gourmet/go-mekanlarim.html?auth=1' }, govde };
  });
}
export default () => sayfalar().map((p) => ({ ...p, meta: { ...p.meta, js: [...p.meta.js, 'assets/js/sayfa/sekme-gecis.js'] } }));
