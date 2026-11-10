// Rozetlerim: Dada Gastro /hesabim/rozetlerim karşılığı (yerel Gastro, resources/views/turetilmis/uye/g-rozetlerim.blade.php,
// RozetlerimDenetleyicisi; demo tohum üyeyle render edildi, render edilmiş DOM birebir). Dört sekme aynı sayfada:
// Koleksiyon · Kademem · Puan Defteri · Liderlik; açılış sekmesi Gastro'daki gibi Kademem. Sınıflar Gastro'nun kanon adları
// (`rozet-karti`, `merdiven`/`basamak`, `puan-karti`, `siralama-satir`); bu zincirde kuralı olmayan tek sınıf `pd-grid`,
// o da Gastro sayfa paketinden aynen `assets/g/kanon/gomulu/rozetlerim-fark.css`'te.
// Gourmet uyarlaması: puan Gastro'daki gibi rozet toplamı değil, şartnamenin Dada Puan kuralıdır (değerler `prototip.js`
// `dgPuan.KURAL`; gönderimde bekler, onayda kesinleşir). Rozet, rütbe ve kural kümesi tek kaynaktan, `assets/js/rozet-veri.js`
// (K3; Gurme Panelim de oradan okur, Beyar onaylı örnek set). Kademe tek ölçütlüdür: kesinleşen puan. Sayılar bu
// tarayıcıdaki demo kayıtlarından `assets/js/sayfa/rozetlerim.js` ile dolar. Liderlik tablosu yalnız seni gösterir:
// canlıda üyeler arası sıralama verisi yok, başka üye uydurulmaz.
import { bant, gourmetSayac, sayfa, et } from './_kalip.mjs';
import { ROZET, KURAL, yerles } from './_rozet.mjs';
import { gastroKimlik } from './_gastro-sekme.mjs';

// Aile → rozetler, onaylı sıra korunarak aileye göre gruplanır
const AILE = ROZET.aileler.map((a) => ({ ...a, rozet: ROZET.rozetler.filter((r) => r.aile === a.k) }));
const TOPLAM_ROZET = ROZET.rozetler.length;
const RUTBE = ROZET.rutbeler;
const binlik = (n) => n.toLocaleString('tr-TR');

const secHead = (ikon, etiket, baslik, lead) => `    <div class="sec-head">
      <div>
        <span class="ust-etiket"><i class="fa-solid ${ikon}" aria-hidden="true"></i> ${etiket}</span>
        <h2>${baslik}</h2>
        <p class="lead">${lead}</p>
      </div>
    </div>`;

// Gastro kilitli kartı; durum ve ilerleme rozetlerim.js'te kayıtlardan güncellenir
const kart = (a, { k, ikon, ad, nasil: aciklama, esik }) => `<button type="button" class="rozet-karti kilitli" data-rozet="${k}" data-aile="${a.k}" data-esik="${esik}"><span class="rozet-puan"><i class="fa-solid fa-lock" aria-hidden="true"></i> 0/${esik}</span><span class="rozet-ikon"><i class="fa-solid ${ikon}" aria-hidden="true"></i></span><div><b>${ad}</b><span>Yolda</span></div><span class="rozet-not kilitli"><i class="fa-solid fa-hourglass-half" aria-hidden="true"></i><span class="rozet-cubuk"><span style="width:0%"></span></span><span class="rozet-sol">0 / ${esik}</span></span><span class="rozet-ipucu"><b>${ad} · ${a.ad}</b><p>${aciklama}</p><span class="nasil"><i class="fa-solid fa-hourglass-half" aria-hidden="true"></i> <span data-nasil>0 / ${esik}</span></span></span></button>`;

const koleksiyon = `<div class="fit-pane" data-pane="koleksiyon" id="rozetlerim-pane-koleksiyon" role="tabpanel" aria-labelledby="rozetlerim-tab-koleksiyon" tabindex="-1" hidden="">
<section id="koleksiyon">
  <div class="wrap kap">
${secHead('fa-medal', 'Kazandıkların', 'Rozet koleksiyonun', 'Her rozet tek bir ölçülebilir kayıttan doğar: yayına giren değerlendirmen, editörün onayladığı önerin, gerçekleşen rezervasyonun, işaretlediğin ziyaret. Kazandığın rozet geri alınmaz.')}
    <div class="galeri-ozet" id="rzStat"><span class="galeri-hap"><i class="fa-solid fa-circle-check hap-kazanildi" aria-hidden="true"></i> <b data-rz="kazanildi">0</b> kazanıldı</span><span class="galeri-hap"><i class="fa-solid fa-hourglass-half hap-yolda" aria-hidden="true"></i> <b data-rz="yolda">${TOPLAM_ROZET}</b> yolda</span><span class="galeri-hap"><i class="fa-solid fa-coins hap-kazanildi" aria-hidden="true"></i> <b data-puan="kesin">0</b> kesinleşen puan</span> ${et}</div>
    <p class="galeri-not" id="rzNot">Sayılar bu tarayıcıdaki kayıtlarından okunur: <b data-rz="degerlendirme">0</b> yayındaki değerlendirme, <b data-rz="oneri">0</b> yayındaki öneri, <b data-rz="rezervasyon">0</b> gerçekleşen rezervasyon, <b data-rz="ziyaret">0</b> ziyaret.</p>
  </div>
</section>
<section>
  <div class="wrap kap">
${secHead('fa-filter', 'Süzgeç', 'Aileye göre', 'Bir aileyi seç; galeri ona süzülür.')}
    <div class="galeri-cipler" id="rzCips" role="group" aria-label="Aileye göre süz"><button type="button" class="cip suzgec on" data-aile="" aria-pressed="true">Tümü</button>${AILE.map((a) => `<button type="button" class="cip suzgec" data-aile="${a.k}" data-ad="${a.ad}" aria-pressed="false"><i class="fa-solid ${a.ikon}" aria-hidden="true"></i> ${a.ad} <span data-aile-sayi="${a.k}">0/${a.rozet.length}</span></button>`).join('')}</div>
    <div class="galeri-suzgec" id="rzFiltre" role="status" aria-live="polite">
      <span class="suzgec-ikon"><i class="fa-solid fa-medal" aria-hidden="true"></i></span>
      <span class="suzgec-metin"><b id="rzFiltreAd">Tümü</b><small id="rzFiltreMeta">${AILE.length} aile · ${TOPLAM_ROZET} rozet · 0 kazanıldı</small></span>
      <button type="button" class="galeri-temizle" id="rzFiltreSil" hidden><i class="fa-solid fa-xmark" aria-hidden="true"></i> Süzgeci temizle</button>
    </div>
    <div id="rzGaleri">
${AILE.map((a) => `<div class="rozet-ailesi" data-aile="${a.k}"><div class="rozet-aile-bas"><h3><i class="fa-solid ${a.ikon}" aria-hidden="true"></i> ${a.ad}</h3><span class="rozet-aile-sayi" data-aile-oran="${a.k}">0 / ${a.rozet.length}</span></div><p class="rozet-aile-not">${a.not}</p><div class="rozet-izgara">
${a.rozet.map((r) => kart(a, r)).join('')}</div></div>`).join('\n')}
    </div>
  </div>
</section>
</div>`;

const kademe = `<div class="fit-pane" data-pane="kademe" id="rozetlerim-pane-kademe" role="tabpanel" aria-labelledby="rozetlerim-tab-kademe" tabindex="0">
<section id="kademe">
  <div class="wrap kap">
${secHead('fa-ranking-star', 'Kademen', 'Merdivende neredesin?', 'Kademe tek ölçütle atlanır: <b>kesinleşen Dada Puan</b>. Bekleyen puan onaydan sonra sayılır. <b>Kademe satın alınmaz, kazanılır</b>; Pro paketin ayrı bir şeydir ve yanında durur.')}
    <div class="fp-card ozet-karti" id="rzRank"><div class="ozet-bas"><h3><i class="fa-solid ${RUTBE[0].ikon}" aria-hidden="true" data-rz-ikon></i> <span data-puan="rutbe">${RUTBE[0].ad}</span></h3><span class="rozet olumlu"><i class="fa-solid fa-medal" aria-hidden="true"></i> <span data-rz="kazanildi">0</span> rozet</span></div><b style="font-size:32px;letter-spacing:-.02em"><span data-rz="sira">1</span>. kademe</b><p style="margin-top:6px" data-rz="sonraki">${RUTBE[0].ad} kademesi 0 puan istiyor. Sıradaki kademe <b>${RUTBE[1].ad}</b>: ${RUTBE[1].esik} puan.</p><div class="ozet-kunye"><span>Kesinleşen puan: <b data-puan="kesin">0</b></span><span>Bekleyen puan: <b data-puan="bekleyen">0</b></span><span>Kazanılan rozet: <b data-rz="kazanildi">0</b></span></div></div>
  </div>
</section>
<section>
  <div class="wrap kap">
${secHead('fa-stairs', 'Beş kademe', `${RUTBE[0].ad}'dan ${RUTBE[RUTBE.length - 1].ad}'na`, 'Her kademenin bir kesinleşen puan eşiği var; geçtiğin en yüksek eşik senin kademendir.')}
    <div class="merdiven" id="rzLadder" role="list" aria-label="Gurme yolculuğu basamakları">
${RUTBE.map(({ k, ikon, ad, esik }, i) => `<div class="basamak${i === 0 ? ' simdiki' : ' kilitli'}" role="listitem" data-basamak="${k}" data-esik="${esik}"><i class="fa-solid ${i === 0 ? 'fa-location-dot' : 'fa-lock'} basamak-kilit" aria-hidden="true"></i><div class="basamak-ikon"><i class="fa-solid ${ikon}" aria-hidden="true"></i></div><b>${ad}</b><span>${binlik(esik)} puan</span><span class="basamak-sayi">${i === 0 ? 'Şu anki kademen' : `${binlik(esik)} puan kaldı`}</span></div>`).join('\n')}
</div>
  </div>
</section>
<section>
  <div class="wrap kap">
${secHead('fa-ruler', 'Ölçüler', 'Kademeyi besleyen sayılar', 'Aşağıdaki her sayı bu tarayıcıdaki Gurme Panelim kayıtlarından okunur.')}
    <div class="pd-grid" id="rzOlcu">${[
    ['fa-coins', 'Kesinleşen puan', 'data-puan="kesin"', 'kademenin tek ölçütü'],
    ['fa-clock-rotate-left', 'Bekleyen puan', 'data-puan="bekleyen"', 'onayda kesinleşir'],
    ['fa-star', 'Yayındaki değerlendirme', 'data-rz="degerlendirme"', 'moderasyondan geçen'],
    ['fa-camera', 'Fotoğraflı değerlendirme', 'data-rz="foto"', 'tabak fotoğrafıyla'],
    ['fa-location-dot', 'Yayındaki öneri', 'data-rz="oneri"', 'mekân ve etkinlik'],
    ['fa-calendar-check', 'Gerçekleşen rezervasyon', 'data-rz="rezervasyon"', 'mekân sahibi onaylı'],
    ['fa-circle-check', 'Ziyaret', 'data-rz="ziyaret"', 'Ziyaret Ettim ile işaretlenen'],
    ['fa-ticket', 'Etkinlik randevusu', 'data-rz="randevu"', 'Lezzet Takvimi\'nden'],
  ].map(([i, b, d, alt]) => `<div class="puan-karti"><span class="puan-bas"><i class="fa-solid ${i}" aria-hidden="true"></i> ${b}</span><b class="puan-sayi" ${d}>0</b><span class="puan-alt">${alt}</span></div>`).join('')}</div>
  </div>
</section>
</div>`;

const puan = `<div class="fit-pane" data-pane="puan" hidden="" id="rozetlerim-pane-puan" role="tabpanel" aria-labelledby="rozetlerim-tab-puan" tabindex="-1">
<section id="puan">
  <div class="wrap kap">
${secHead('fa-coins', 'Puan', 'Puanın nereden geliyor?', `Dada Puan katkılarından gelir: yorum veya fotoğraf +${KURAL.yorum}, mekân ya da etkinlik önerisi +${KURAL.oneri}, puanlama +${KURAL.puanlama}, gerçekleşen rezervasyon +${KURAL.rezervasyon}. Gönderdiğin an bekleyen olarak yazılır, onaydan sonra kesinleşir; onaylanmayan katkının puanı düşer.`)}
    <div class="fp-card ozet-karti" id="rzPuanKart"><div class="ozet-bas"><h3><i class="fa-solid fa-coins" aria-hidden="true"></i> Toplam puanın</h3><span class="rozet olumlu"><i class="fa-solid fa-medal" aria-hidden="true"></i> <span data-rz="kazanildi">0</span> rozet</span></div><b style="font-size:32px;letter-spacing:-.02em" data-puan="kesin">0</b><p style="margin-top:6px">Kesinleşen puanın. Onay bekleyen <b data-puan="bekleyen">0</b> puan onaydan sonra buraya eklenir.</p><div class="ozet-kunye"><span>Kademe: <b data-puan="rutbe">${RUTBE[0].ad}</b></span><span>Bekleyen puan: <b data-puan="bekleyen">0</b></span><span>Kazanılan rozet: <b data-rz="kazanildi">0</b> / ${TOPLAM_ROZET}</span></div></div>
  </div>
</section>
<section>
  <div class="wrap kap">
${secHead('fa-layer-group', 'Kurallara göre', 'Hangi katkıdan ne kadar', 'Her kart o katkıdan gelen kesinleşen puanı gösterir; çubuk, toplam puanının ne kadarının o katkıdan geldiğini.')}
    <div class="pd-grid" id="rzPuanAile">
${ROZET.puanAileleri.map(({ k, ikon: i, ad, alt }) => `<div class="puan-karti" data-kural="${k}"><span class="puan-bas"><i class="fa-solid ${i}" aria-hidden="true"></i> ${ad}</span><b class="puan-sayi">0</b><span class="puan-alt">${yerles(alt)}</span><div class="olcer hap"><span style="width:0%"></span></div></div>`).join('\n')}
</div>
  </div>
</section>
<section>
  <div class="wrap kap">
${secHead('fa-clock-rotate-left', 'Puan defteri', 'Ne zaman ne kazandın', 'En yeni üstte. Bekleyen satır onaydan sonra kesinleşir; onaylanmayan katkının satırı düşer.')}
    <div id="rzDefter">
<div class="fp-card bos-durum"><span class="bos-ikon"><i class="fa-solid fa-lock" aria-hidden="true"></i></span><h4>Henüz puan hareketin yok</h4><p>İlk değerlendirmeni ya da önerini gönderdiğinde tarihi, kuralı ve puanı burada birikmeye başlar.</p><a class="dugme birincil" href="{{kok}}mekanlar/"><i class="fa-solid fa-location-dot" aria-hidden="true"></i> Mekânlara göz at</a></div>
</div>
  </div>
</section>
</div>`;

const liderlik = `<div class="fit-pane" data-pane="liderlik" hidden="" id="rozetlerim-pane-liderlik" role="tabpanel" aria-labelledby="rozetlerim-tab-liderlik" tabindex="-1">
<section id="liderlik">
  <div class="wrap kap">
${secHead('fa-ranking-star', 'Liderlik', 'Tek tablo, herkes aynı yerde', 'Sıralama kesinleşen Dada Puan\'a göre kurulur, takipçi ya da değerlendirme sayısına göre değil. Rozetlerinin profilinde görünüp görünmeyeceğine <a href="{{kok}}hesabim/ayarlar/#profil">Hesap Ayarları</a>\'ndan sen karar verirsin.')}
    <div class="bilgi-notu" id="rzLdNot">
      <i class="fa-solid fa-circle-info" aria-hidden="true"></i>
      <p><b>Tablo topluluğun tamamını değil, çevreni gösterir:</b> senin üstünde beş, altında iki sıra. Prototipte üyeler arası sıralama verisi olmadığı için tabloda yalnız sen varsın; başka üye gösterilmez.</p>
    </div>
  </div>
</section>
<section>
  <div class="wrap kap">
    <div class="kart tasma-kapali" id="rzLdTablo">
<div class="siralama-satir ben" aria-current="true"><span class="siralama-sira">1</span><span class="siralama-kim"><b>{{uye.ad}} <span class="rozet olumlu">Sen</span></b><small>@{{uye.kullanici}} · <span data-rz="kazanildi">0</span> rozet · <span data-rz="degerlendirme">0</span> değerlendirme</small></span><span class="siralama-puan"><b data-puan="kesin">0</b><small>puan</small></span></div>
</div>
  </div>
</section>
</div><!-- /.fit-pane[data-pane=liderlik] -->`;

// Gastro'da Kademem ve Liderlik aynı ikonu (ranking-star) taşır
const SEKME = [['koleksiyon', 'fa-medal', 'Koleksiyon'], ['kademe', 'fa-ranking-star', 'Kademem'], ['puan', 'fa-coins', 'Puan Defteri'], ['liderlik', 'fa-ranking-star', 'Liderlik']];
const rayHtml = `<div class="pf-tabbar sekme-ray">
  <div class="wrap kap">
    <nav class="sekmeler ortali" data-fit-tabs="rozetlerim" data-scroll-fade="" aria-label="Rozetlerim bölümleri" role="tablist">
${SEKME.map(([k, i, ad]) => `      <button class="sekme${k === 'kademe' ? ' aktif' : ''}" type="button" data-tab="${k}" aria-selected="${k === 'kademe'}" role="tab" id="rozetlerim-tab-${k}" aria-controls="rozetlerim-pane-${k}" tabindex="${k === 'kademe' ? 0 : -1}"><i class="fa-solid ${i}" aria-hidden="true"></i> ${ad}</button>`).join('\n')}
    </nav>
  </div>
</div>`;

export default function () {
  // Gastro kimlik kartında paket rozetinin yanında kademe rozeti durur (h1)
  // Kapak mührü ve paket rozeti ikonu Gastro'daki gibi (utensils; Ücretsiz user), "Üyelik başlangıcı" iki noktasız
  const ust = gastroKimlik(bant({ cur: 'Rozetlerim', ikon: 'fa-solid fa-utensils', giris: 'Kazandığın rozetler, topladığın Dada Puan, gurme merdivenindeki kademen ve liderlik tablosundaki sıran.', serit: gourmetSayac() })
    .replace('{{uye.paket}}</span></h1>', `{{uye.paket}}</span> <span class="rozet dolu" data-kademe=""><i class="fa-solid ${RUTBE[0].ikon}" aria-hidden="true" data-rz-ikon></i> <span data-puan="rutbe">${RUTBE[0].ad}</span></span></h1>`));
  const govde = ust + '\n' + rayHtml + `\n<div class="modul-govde">\n${koleksiyon}\n${kademe}\n${puan}\n${liderlik}\n</div><!-- /.modul-govde -->`;
  const s = sayfa('hesabim/rozetlerim', 'Rozetlerim', govde, {
    js: ['assets/o/assets/gourmet-public/js/shared/scroll-affordance.js', 'assets/js/sayfa/sekmeler.js', 'assets/js/rozet-veri.js', 'assets/js/sayfa/rozetlerim.js'],
    donor: 'yerel Gastro /hesabim/rozetlerim (resources/views/turetilmis/uye/g-rozetlerim.blade.php, demo tohum render), Gourmet Dada Puan kuralı',
  });
  s.meta.css = ['assets/g/kanon/gomulu/rozetlerim-fark.css', 'shared/scroll-affordance.css', ...s.meta.css];
  return [s];
}
