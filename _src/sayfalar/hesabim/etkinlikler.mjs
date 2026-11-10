// Etkinliklerim: canlı /hesabim/etkinlikler (DadaGourmet-acil resources/views/hesap/etkinlikler.blade.php +
// _parcalar/etkinliklerim-bant). Yedi sekme; canlıdaki `?sekme=` burada alt yol. Gurme Panelim'le çakışan üç sekme
// (Rezervasyonlarım, Etkinlik Değerlendirmelerim, Etkinlik Önerilerim) yeniden kurulmaz, ray oradaki karşılığına gider
// (Beyar kararı). Satırlar _src/veri/etkinlik.json'daki gerçek etkinliklerden örnek; Biletlerim canlıda da her zaman boş.
import { bant, sayac, ray, bolumBas, kartBas, kart, pano, satir, rozet, satirDugme, bos, sayfa, et, kac } from './_kalip.mjs';

// Canlıdaki "Rezervasyon" sayacı Gurme Panelim > Rezervasyonlarım satırlarını sayar (örnek değer)
const REZERVASYON = 2;

export default function ({ veri }) {
  const E = veri.etkinlik.etkinlikler;
  const KAT = Object.fromEntries(veri.etkinlik.secenek.kategori.map((k) => [k.deger, k.ad]));
  const bul = (slug) => { const e = E.find((x) => x.slug === slug); if (!e) throw new Error('Etkinlik yok: ' + slug); return e; };
  // Canlı `satirAltMetni`: kategori · başlangıç – bitiş · şehir, ülke
  const tarih = (iso) => iso.split('-').reverse().join('.');
  const altMetin = (e) => [KAT[e.f.kategori[0]], e.bit && e.bit !== e.bas ? `${tarih(e.bas)} – ${tarih(e.bit)}` : tarih(e.bas), [e.sehir, e.ulke].filter(Boolean).join(', ')].filter(Boolean).join(' · ');

  // Kayıt türü → satır rozeti (canlı: gitmek_istediklerim → Katılacağım/Katıldım, favori → İlgileniyorum, takip → Takipte)
  const KAYIT = {
    'etk-katilacagim': [['alba-beyaz-truf-fuari-2026', 'Katılacağım'], ['salon-du-chocolat-istanbul-2026', 'Katılacağım']],
    'etk-katildigim': [['10-uluslararasi-safran-hasadi-festivali-2026', 'Katıldım'], ['istanbul-coffee-festival-2026', 'Katıldım']],
    'etk-ilgilendigim': [['eurochocolate-perugia-2026', 'İlgileniyorum'], ['madrid-fusion-2027', 'Takipte'], ['bocuse-dor-2027', 'İlgileniyorum']],
    'etk-bilet': [],
  };
  const TUR = { 'Katılacağım': 'gitmek_istediklerim', 'Katıldım': 'gitmek_istediklerim', 'İlgileniyorum': 'favori', 'Takipte': 'takip' };

  // Canlıda "Kaldır" gizli forma bağlı gerçek DELETE; prototipte aynı form `data-dm-form` ile yalnız bu tarayıcıya yazar
  let no = 0;
  const sat = ([slug, r]) => {
    const e = bul(slug); const id = `etk-kayit-kaldir-${++no}`;
    const uc = `${rozet(r)}${satirDugme('Kaldır', `form="${id}" aria-label="${kac(e.ad)}: kaldır"`, 'fa-solid fa-xmark', 'submit')}`;
    const form = `<form id="${id}" data-dm-form="etkKayitKaldir" data-dm-mesaj="Kaldırma isteğin bu tarayıcıya yazıldı; prototipte satır listede kalır." hidden><input type="hidden" name="etkinlik" value="${e.slug}"><input type="hidden" name="tur" value="${TUR[r]}"></form>`;
    return satir('fa-regular fa-calendar', kac(e.ad), kac(altMetin(e)), uc, `etkinlik-detay/?e=${e.slug}`).replace(/<\/div>$/, `${form}</div>`);
  };

  const PANO = {
    'etk-katilacagim': { yol: 'hesabim/etkinlikler', ikon: 'fa-solid fa-calendar-day', etiket: 'Takvim', baslik: 'Katılacağın etkinlikler', giris: 'Katılacağım dediğin etkinlikler tarih sırasıyla burada. Takvimine ekleyip hatırlatma alabilirsin.', birim: 'etkinlik', kartBaslik: 'Yaklaşan katılımların', kartGiris: `Rehberde <b>${E.length} gastronomi etkinliği</b> kayıtlı; listeden seçebilirsin.`, liste: 'etkKatilacak', bos: ['Henüz bir etkinliğe katılacağım demedin', 'Lezzet Takvimi’nden bir etkinlik seç; tarih yaklaşınca hatırlatırız.', ['etkinlikler/', 'Lezzet Takvimi', 'fa-solid fa-calendar-days']], not: 'Katılım kaydın hesabına bağlıdır: hangi cihazdan girersen gir aynı liste gelir.' },
    'etk-katildigim': { yol: 'hesabim/etkinlikler/katildigim', ikon: 'fa-solid fa-circle-check', etiket: 'Geçmiş', baslik: 'Katıldığın etkinlikler', giris: 'Gittiğin etkinlikler. Katılım kaydı, etkinlik değerlendirmesi yazabilmenin koşuludur.', birim: 'katılım', kartBaslik: 'Katılım geçmişin', kartGiris: 'Sona eren etkinlikler burada arşivlenir.', liste: 'etkKatildim', bos: ['Henüz katıldığın etkinlik yok', 'Bir etkinliğe katılacağını işaretle; etkinlik sona erdiğinde satır kendiliğinden bu panoya geçer.', ['etkinlikler/', 'Takvime bak', 'fa-solid fa-calendar-days']], not: 'Katılım kaydı yalnız sana görünür; bir satırın geçmişe düşmesi etkinliğin bitiş tarihine bağlıdır.' },
    'etk-ilgilendigim': { yol: 'hesabim/etkinlikler/ilgilendigim', ikon: 'fa-regular fa-heart', etiket: 'İlgi', baslik: 'İlgilendiğin etkinlikler', giris: 'Kararsız olduğun etkinlikler. Karar verince <b>Katılacağım</b>a taşı.', birim: 'etkinlik', kartBaslik: 'İlgi listen', kartGiris: 'Favoriye aldığın ve takip ettiğin etkinlikler tek listede; satır ucundaki rozet hangisi olduğunu söyler.', liste: 'etkIlgi', bos: ['İlgi listen boş', 'Takvimde ilgini çeken etkinliği işaretle; kararını sonra verirsin.', ['etkinlikler/', 'Etkinliklere bak', 'fa-solid fa-calendar-days']], not: 'Bu liste yalnız sana görünür.' },
    // Canlıda da her zaman boş: bilet deposu yok, satış etkinliğin dış bağından (Beyar kararı 2026-09-15)
    'etk-bilet': { yol: 'hesabim/etkinlikler/biletlerim', ikon: 'fa-solid fa-ticket', etiket: 'Bilet', baslik: 'Biletlerin', giris: 'Satın aldığın etkinlik biletleri burada toplanır.', birim: 'bilet', kartBaslik: 'Biletlerin', kartGiris: 'Biletli etkinliklerde bilet, etkinliğin kendi sayfasındaki satış bağından alınır.', liste: 'etkBilet', bos: ['Henüz biletin yok', 'Bu markada bilet satışı Dada Gourmet üzerinden yapılmıyor; biletli etkinliklerde etkinliğin sayfasındaki satış bağı seni satıcıya götürür.', ['etkinlikler/', 'Biletli etkinliklere bak', 'fa-solid fa-calendar-days']], not: 'Bilet kaydı tutulmadığı için bu pano her zaman boştur; etkinliğin satış bağı dış bir adrese gider.' },
  };

  // Ray canlı sırasıyla; çakışan üç sekme Gurme Panelim karşılığına gider
  const RAY = [
    ['etk-katilacagim', 'hesabim/etkinlikler/', 'fa-solid fa-calendar-day', 'Katılacağım Etkinlikler'],
    ['etk-katildigim', 'hesabim/etkinlikler/katildigim/', 'fa-solid fa-circle-check', 'Katıldığım Etkinlikler'],
    ['etk-ilgilendigim', 'hesabim/etkinlikler/ilgilendigim/', 'fa-regular fa-heart', 'İlgilendiğim Etkinlikler'],
    ['etk-rezervasyon', 'hesabim/gurme-panelim/', 'fa-solid fa-calendar-check', 'Rezervasyonlarım'],
    ['etk-bilet', 'hesabim/etkinlikler/biletlerim/', 'fa-solid fa-ticket', 'Biletlerim'],
    ['etk-degerlendirme', 'hesabim/gurme-panelim/degerlendirmelerim/', 'fa-solid fa-star', 'Etkinlik Değerlendirmelerim'],
    ['etk-oneri', 'hesabim/gurme-panelim/topluluk-katkilarim/', 'fa-solid fa-calendar-plus', 'Etkinlik Önerilerim'],
  ];
  const serit = sayac('Etkinliklerim özeti', [
    ['fa-solid fa-calendar-day', 'Katılacağın', KAYIT['etk-katilacagim'].length],
    ['fa-solid fa-circle-check', 'Katıldığın', KAYIT['etk-katildigim'].length],
    ['fa-solid fa-calendar-check', 'Rezervasyon', REZERVASYON],
    ['fa-solid fa-ticket', 'Bilet', 0],
    ['fa-solid fa-calendar-days', 'Takvimdeki etkinlik', E.length],
  ]);

  return Object.entries(PANO).map(([anahtar, p]) => {
    const k = KAYIT[anahtar];
    const govde = bant({ cur: 'Etkinliklerim', ikon: 'fa-solid fa-calendar-days', giris: 'Katılacakların, biletlerin ve rezervasyonların tek takvimde. Sekme değişir, kimlik kartın yerinde kalır.', serit })
      + ray('Etkinliklerim bölümleri', RAY, anahtar, 'etkinliklerim')
      + `<div class="modul-govde">${pano({
        id: anahtar,
        bas: bolumBas({ ikon: p.ikon, etiket: p.etiket, baslik: p.baslik, giris: p.giris, arac: `${rozet(`${k.length} ${p.birim}`)}${k.length ? ' ' + et : ''}` }),
        kart: kart({ bas: kartBas(p.ikon, p.kartBaslik, p.kartGiris), liste: k.length ? k.map(sat).join('') : bos(p.ikon, ...p.bos), listeId: p.liste }),
        not: p.not,
      }).replace(`data-pane="${anahtar}"`, `data-pane="${anahtar}" id="etkinliklerim-pane-${anahtar}" aria-labelledby="etkinliklerim-tab-${anahtar}"`)}</div>`;
    return sayfa(p.yol, 'Etkinliklerim', govde);
  });
}
