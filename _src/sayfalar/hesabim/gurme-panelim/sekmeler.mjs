// Gurme Panelim (K3): Hesabım'dan ayrı alan, şartnamedeki 6 sekme (W2.5). Kabuk ve satır DOM'u donör go-mekanlarim render'ı.
// Puan Durumu: şartname değerleri; puan önce bekleyen görünür, onayda kesinleşir (§8 kararı). Tutar örnekleri etiketli.
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
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
  'gurme-favorilerim': satir('fa-utensils', 'Mikla', 'Mekân · Beyoğlu, İstanbul', 'Mekân') + satir('fa-bowl-food', 'Örnek imza tabak', 'Tabak · Mikla', 'Tabak'),
  'ziyaret-gecmisim': satir('fa-circle-check', 'Mikla', 'Beyoğlu, İstanbul · Örnek tarih', 'Ziyaret edildi'),
  'degerlendirmelerim': bos('fa-star', 'Henüz değerlendirmen yok', 'Ziyaret ettiğin bir mekânı değerlendirdiğinde burada görünür.'),
  'topluluk-katkilarim': bos('fa-location-dot', 'Henüz önerin yok', 'Mekân Öner ya da Etkinlik Öner ile gönderdiğin öneriler burada İnceleniyor olarak görünür.'),
  'puan-durumu': `<div class="puan-yapi"><div class="sayac"><i class="fa-solid fa-award" aria-hidden="true"></i><div><span>Kesinleşen puan</span><b data-puan="kesin">—</b></div></div><div class="sayac"><i class="fa-solid fa-clock-rotate-left" aria-hidden="true"></i><div><span>Bekleyen puan</span><b data-puan="bekleyen">—</b></div></div><div class="sayac"><i class="fa-solid fa-medal" aria-hidden="true"></i><div><span>Rütbe</span><b data-puan="rutbe">—</b></div></div></div><div class="puan-bolum"><h3>Puan nasıl kazanılır?</h3>${satir('fa-comment-dots', 'Yorum veya fotoğraf', 'Moderasyon onayında kesinleşir', '+15')}${satir('fa-location-dot', 'Mekân veya etkinlik önerisi', 'Editör onayında kesinleşir', '+50')}${satir('fa-star', 'Puanlama', 'Moderasyon onayında kesinleşir', '+2')}${satir('fa-calendar-check', 'Gerçekleşen rezervasyon', 'Mekân sahibi onayı ve ziyaretten sonra kesinleşir', '+25')}</div><div class="puan-bolum"><h3>Rozetler ${et}</h3><div id="rozetListe"></div></div><div class="puan-bolum"><h3>Rütbe basamakları ${et}</h3><div id="rutbeListe"></div></div><div class="puan-bolum"><h3>Puan hareketleri</h3><div id="puanDefter"></div></div>`,
};
const bas = (a, b, c, ek) => `<div class="bolum-bas"><div><span class="ust-etiket">${a}</span><h2>${b}</h2><p class="giris-metni">${c}</p></div><div class="bolum-araclar">${ek}</div></div>`;
export default function () {
  return SEKME.map(([yol, ikon, ad, ust, baslik, alt]) => {
    const nav = `<nav class="sekmeler ortali" aria-label="Gurme Panelim bölümleri" data-scroll-fade="">${SEKME.map(([y, i, a]) => `<a class="sekme${y === yol ? ' aktif' : ''}" href="{{kok}}hesabim/gurme-panelim/${y === 'rezervasyonlarim' ? '' : y + '/'}"${y === yol ? ' aria-current="page"' : ''}><i class="fa-solid ${i}" aria-hidden="true"></i> ${a}</a>`).join('')}</nav>`;
    const govde = `<div class="zebra">${s.bant}<div class="pf-tabbar sekme-ray"><div class="wrap kap">${nav}</div></div><div class="modul-govde"><div class="fit-pane aktif"><div class="bolum kap">${bas(ust, baslik, alt, et)}<div class="kart"><div class="kart-govde"><div class="fp-list">${ICERIK[yol]}</div></div></div></div></div></div></div>`;
    return { yol: 'hesabim/gurme-panelim' + (yol === 'rezervasyonlarim' ? '' : '/' + yol), meta: { baslik: `${ad} · Gurme Panelim`, duzen: 'uye', zincir: 'hesabim', css: ['gourmet-sapma'], js: ['assets/o/assets/gourmet-public/js/shared/scroll-affordance.js', 'assets/js/sayfa/panel.js'], donor: 'https://gaviaworks-dev.github.io/DadaMentor/Gourmet/go-mekanlarim.html?auth=1' }, govde };
  });
}
