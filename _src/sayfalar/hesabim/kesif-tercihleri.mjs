// Keşif Tercihlerim: canlı /hesabim/kesif-tercihleri (DadaGourmet-acil resources/views/hesap/kesif-tercihleri.blade.php,
// seçenekler App\Http\Istekler\Kesif\KesifTercihiKaydetIstegi). Alan kümesi canlıdaki sekiz alan; uydurma alan yok.
// Profil turu H6 (Beyar 10 Kas): kullanım baştan kuruldu.
//  - Checkbox duvarı ve ham select yerine gruplu, ikonlu, seçilebilir çipler (`button.cip.suzgec[aria-pressed]`, kanon §43).
//  - Uzun listede arama ve grup başına "daha fazla göster"; seçili çip daraltılmış grupta da görünür kalır.
//  - Fiyat aralığı tek seçimli segment (`role=radiogroup`, kanon `.sekmeler.esit`).
//  - Sekme başına tek başlık (bölüm başı) ve seçim özeti; çift başlık ve iki "Dolu" rozeti kalktı. Sekmede seçim sayısı.
//  - Tek kaydet akışı: bütün sekmelerdeki değişiklik alttaki yapışkan çubuktan bir kez kaydedilir ya da geri alınır.
// Gruplama ve ikonlar Mekân Bul sihirbazıyla aynı (mekan-bul ajanı, 10 Kas: mutfak üç aile, ortam konsept ikonları).
// Mutfak seçenekleri: canlı /mekanlar mutfak süzgecinin 18 kalemi (Mekân Bul ile aynı) + canlı tercih listesindeki "Ev Yemekleri".
import { bant, sayac, sayfa, kac, et } from './_kalip.mjs';

// [ad, ikon]
const ALANLAR = [
  { a: 'mutfak', ikon: 'fa-utensils', ust: 'Mutfak', baslik: 'Sevdiğim Mutfaklar', kisa: 'Mutfak', giris: 'Hangi mutfakları öne çıkaracağımızı bu belirler. Mekân ve rota önerileri buna göre sıralanır.', ara: 'Mutfak ara', not: 'Listede rehberde <b>yayında mekânı olan</b> mutfaklar var; yeni mutfak eklendikçe burada belirir.',
    gruplar: [
      ['Öğün ve Lezzet', 'fa-mug-saucer', [['Kahvaltı / Serpme', 'fa-egg'], ['Kebap / Ocakbaşı', 'fa-fire'], ['Deniz Ürünleri', 'fa-fish'], ['Ev Yemekleri', 'fa-bowl-food']]],
      ['Türk ve Yöresel', 'fa-map-location-dot', [['Türk Mutfağı', 'fa-utensils'], ['Anadolu Mutfağı', 'fa-wheat-awn'], ['Ege Mutfağı', 'fa-leaf'], ['Akdeniz Mutfağı', 'fa-lemon'], ['Karadeniz Mutfağı', 'fa-fish-fins'], ['Güneydoğu Mutfağı', 'fa-mug-hot'], ['Doğu Anadolu Mutfağı', 'fa-cheese'], ['İç Anadolu Mutfağı', 'fa-bread-slice']]],
      ['Dünya Mutfakları', 'fa-earth-americas', [['İtalyan Mutfağı', 'fa-pizza-slice'], ['Fransız Mutfağı', 'fa-wine-glass'], ['Japon Mutfağı', 'fa-bowl-rice'], ['Çin Mutfağı', 'fa-bowl-food'], ['Kore Mutfağı', 'fa-fire-burner'], ['Hint Mutfağı', 'fa-mortar-pestle'], ['Meksika Mutfağı', 'fa-pepper-hot']]],
    ] },
  { a: 'konsept', ikon: 'fa-store', ust: 'Konsept', baslik: 'Mekân Tercihlerim', kisa: 'Konsept', giris: 'Ne aradığına göre mekân öneririz: manzaralı sofradan saklı esnaf lokantasına.', ara: 'Konsept ara', not: 'Seçim, Mekânlar sayfasındaki soldaki filtrelerle birlikte çalışır.',
    gruplar: [
      ['Restoran', 'fa-utensils', [['Fine Dining Restoranı', 'fa-champagne-glasses'], ['Şef Restoranı', 'fa-star'], ['Butik Restoran', 'fa-gem'], ['Bahçeli Restoran', 'fa-tree'], ['Çiftlikten Sofraya Restoran', 'fa-tractor'], ['Esnaf Lokantası', 'fa-bowl-food'], ['Lokanta', 'fa-plate-wheat'], ['Aile Restoranı', 'fa-people-roof'], ['Casual Dining Restoranı', 'fa-utensils'], ['Fast Casual Restoranı', 'fa-burger'], ['Hızlı Servis Restoranı', 'fa-bolt'], ['Tematik Restoran', 'fa-masks-theater'], ['Restoran', 'fa-kitchen-set']]],
      ['Kahve ve çay', 'fa-mug-hot', [['Üçüncü Nesil Kahveci', 'fa-flask'], ['Kahve Dükkânı', 'fa-shop'], ['Kafe', 'fa-mug-saucer'], ['Çay Evi', 'fa-mug-hot']]],
      ['Kahvaltı ve brunch', 'fa-egg', [['Kahvaltı Mekânı', 'fa-egg'], ['Brunch Mekânı', 'fa-bacon']]],
      ['Fırın ve tatlı', 'fa-cake-candles', [['Fırın ve Unlu Mamuller', 'fa-bread-slice'], ['Pastane', 'fa-cake-candles'], ['Tatlıcı', 'fa-cookie-bite'], ['Dondurmacı', 'fa-ice-cream']]],
      ['Bitkisel ve sağlıklı', 'fa-seedling', [['Vegan Restoran', 'fa-seedling'], ['Vejetaryen Restoran', 'fa-carrot'], ['Sağlıklı Beslenme Mekânı', 'fa-apple-whole']]],
      ['Sokak ve yöresel', 'fa-store', [['Yöresel Lezzet Noktası', 'fa-store'], ['Sokak Lezzetleri Noktası', 'fa-hotdog']]],
    ] },
  { a: 'etkinlik', ikon: 'fa-calendar-days', ust: 'İlgi', baslik: 'Etkinlik İlgi Alanlarım', kisa: 'Etkinlik', giris: 'Lezzet Takvimi’nde hangi tür etkinlikleri öne çıkaralım?', not: 'Seçtiğin türlerde yeni etkinlik açıldığında <b>Bildirimler</b>den haber alabilirsin.',
    gruplar: [
      ['Deneyim', 'fa-wine-glass', [['Tadım Etkinlikleri', 'fa-wine-glass'], ['Üretim, Hasat ve Bağ Deneyimleri', 'fa-wheat-awn'], ['Özel Menü ve Gastronomi Geceleri', 'fa-moon'], ['Pop-up ve Konuk Şef Etkinlikleri', 'fa-user-tie'], ['Gastronomi Festivalleri', 'fa-tents']]],
      ['Öğrenme ve buluşma', 'fa-chalkboard-user', [['Şef Buluşmaları ve Söyleşiler', 'fa-microphone'], ['Mutfak Atölyeleri', 'fa-kitchen-set'], ['Gastronomi Eğitimleri', 'fa-graduation-cap'], ['Yarışmalar ve Profesyonel Etkinlikler', 'fa-trophy'], ['Çocuk ve Aile Etkinlikleri', 'fa-children']]],
    ] },
  { a: 'sehir', ikon: 'fa-city', ust: 'Bölge', baslik: 'Şehir ve Bölge Tercihlerim', kisa: 'Şehir', giris: 'Hangi şehirlerde arama yaptığını biliyorsak öneriler oraya yaklaşır.', ara: 'Şehir ara', not: 'Şehir rehberi yalnız yayında mekânı olan şehirde açılır; şu an <b>1 rehberi olan şehir</b> var.',
    gruplar: [
      ['Marmara', 'fa-location-dot', [['İstanbul'], ['Bursa'], ['Çanakkale']]],
      ['Ege', 'fa-location-dot', [['İzmir'], ['Muğla']]],
      ['Akdeniz', 'fa-location-dot', [['Antalya'], ['Adana'], ['Hatay']]],
      ['İç Anadolu', 'fa-location-dot', [['Ankara'], ['Konya'], ['Eskişehir'], ['Nevşehir'], ['Kayseri']]],
      ['Karadeniz', 'fa-location-dot', [['Trabzon'], ['Bolu'], ['Karabük']]],
      ['Güneydoğu Anadolu', 'fa-location-dot', [['Gaziantep'], ['Şanlıurfa'], ['Diyarbakır'], ['Mardin']]],
    ] },
  { a: 'fiyat', ikon: 'fa-coins', ust: 'Bütçe', baslik: 'Fiyat Aralığım', kisa: 'Bütçe', tek: true, giris: 'Bütçe aralığın öneri sıralamasını belirler. Tek seçim.', not: 'Fiyat aralığı bir söz değil bir sıralama ipucudur; mekân sayfasında güncel fiyat gösterilmez.',
    gruplar: [['Bütçe aralığı', 'fa-coins', [['₺ · Ekonomik'], ['₺₺ · Orta'], ['₺₺₺ · Üst Segment']]]] },
  { a: 'beslenme', ikon: 'fa-seedling', ust: 'Beslenme', baslik: 'Beslenme Tercihlerim', kisa: 'Beslenme', giris: 'Beslenme tercihin, önerdiğimiz mekân ve menüleri eler. “Fark etmez” tek başına seçilir.', not: 'Bu bir sağlık tavsiyesi değildir. Alerjin varsa <b>Alerjen Tercihlerim</b> sekmesini de doldur.', tekil: 'Fark etmez',
    gruplar: [['Beslenme şekli', 'fa-seedling', [['Vegan', 'fa-seedling'], ['Vejetaryen', 'fa-carrot'], ['Glutensiz', 'fa-wheat-awn-circle-exclamation'], ['Laktozsuz', 'fa-glass-water'], ['Helal', 'fa-certificate'], ['Şekersiz', 'fa-cubes-stacked'], ['Düşük karbonhidrat', 'fa-scale-balanced'], ['Fark etmez', 'fa-utensils']]]] },
  { a: 'alerjen', ikon: 'fa-triangle-exclamation', ust: 'Alerjen', baslik: 'Alerjen Tercihlerim', kisa: 'Alerjen', giris: 'Kaçındığın alerjenleri işaretle; işaretlediklerini içeren menüleri öne çıkarmayız.', not: 'Eleme kesin bir güvence değildir; mekânın kendi beyanına dayanır. Ciddi alerjide mekâna doğrudan sor.',
    gruplar: [['Kaçındığın alerjenler', 'fa-triangle-exclamation', [['Gluten', 'fa-wheat-awn'], ['Süt ve süt ürünleri', 'fa-cow'], ['Yumurta', 'fa-egg'], ['Fındık ve sert kabuklu yemişler', 'fa-tree'], ['Yer fıstığı', 'fa-seedling'], ['Susam', 'fa-circle-dot'], ['Soya', 'fa-leaf'], ['Balık', 'fa-fish'], ['Kabuklu deniz ürünleri', 'fa-shrimp'], ['Hardal', 'fa-jar'], ['Kereviz', 'fa-carrot'], ['Sülfit', 'fa-wine-bottle']]]] },
  { a: 'ortam', ikon: 'fa-list-check', ust: 'Ortam', baslik: 'Ortam ve Kullanım Tercihlerim', kisa: 'Ortam', giris: 'Senin için önemli olan hizmet ve ortam özellikleri. Mekân kartlarında etiket olarak görünür.', not: 'İşletmeler profilinde en fazla 5 hizmet etiketi gösterebilir; seçimin sıralamayı etkiler.',
    gruplar: [
      ['Hizmet', 'fa-bell-concierge', [['Rezervasyon', 'fa-calendar-check'], ['Masada Servis', 'fa-bell-concierge'], ['Kahvaltı Servisi', 'fa-egg'], ['Paket Servis', 'fa-bag-shopping'], ['Kart Geçerli', 'fa-credit-card']]],
      ['Ortam ve erişim', 'fa-umbrella-beach', [['Bahçe / Teras', 'fa-umbrella-beach'], ['Aile Dostu', 'fa-children'], ['Canlı Müzik', 'fa-music'], ['Ücretsiz Wi-Fi', 'fa-wifi'], ['Otopark', 'fa-square-parking'], ['Engelli Erişimi', 'fa-wheelchair-move']]],
    ] },
];
// Örnek üyenin yanıtları (prototip örneği)
const ORNEK = {
  mutfak: ['Kebap / Ocakbaşı', 'Deniz Ürünleri', 'Ege Mutfağı'],
  konsept: ['Esnaf Lokantası', 'Fine Dining Restoranı', 'Şef Restoranı', 'Üçüncü Nesil Kahveci'],
  etkinlik: ['Tadım Etkinlikleri', 'Şef Buluşmaları ve Söyleşiler', 'Üretim, Hasat ve Bağ Deneyimleri'],
  sehir: ['İstanbul', 'İzmir', 'Muğla'],
  fiyat: ['₺₺ · Orta'],
  beslenme: ['Laktozsuz'],
  alerjen: ['Süt ve süt ürünleri', 'Susam'],
  ortam: ['Rezervasyon', 'Bahçe / Teras', 'Kart Geçerli'],
};
const GOSTER = 6; // uzun (aramalı) listede grup başına daraltılmış hâlde görünen çip; kısa listeler hep açık

const cip = (s, [ad, ikon], secili, gizli) => `<button class="cip suzgec tercih-cip" type="button" aria-pressed="${secili}" data-deger="${kac(ad)}"${s.tekil === ad ? ' data-tekil=""' : ''}${gizli ? ' data-fazla="" hidden' : ''}>${ikon ? `<i class="fa-solid ${ikon}" aria-hidden="true"></i>` : ''}<span>${ad}</span><i class="fa-solid fa-check tercih-isaret" aria-hidden="true"></i></button>`;

const grupHtml = (s, [ad, ikon, kalemler], gi) => {
  const d = ORNEK[s.a];
  const secSay = kalemler.filter(([x]) => d.includes(x)).length;
  // Daraltılmış grupta seçililer önde değil, kendi yerinde ama görünür; görünmeyen seçilmemişler `data-fazla`
  let gorunen = 0; const daralt = !!s.ara && kalemler.length - GOSTER >= 3; // bir iki kalem için "daha fazla" düğmesi açılmaz
  const cipler = kalemler.map((k) => { const sec = d.includes(k[0]); const gizli = daralt && !sec && gorunen >= GOSTER; if (!gizli) gorunen++; return cip(s, k, sec, gizli); }).join('');
  const fazla = kalemler.length - gorunen;
  const id = `kt-${s.a}-g${gi}`;
  return `<section class="tercih-grup" aria-labelledby="${id}" data-grup="">
            <h3 class="tercih-grup-bas" id="${id}"><i class="fa-solid ${ikon}" aria-hidden="true"></i> ${ad} <span class="tercih-grup-sayi" data-grup-sayi="">${secSay ? `${secSay} seçili` : ''}</span></h3>
            <div class="tercih-cipler" role="group" aria-labelledby="${id}">${cipler}</div>${fazla > 0 ? `
            <button class="tercih-fazla" type="button" data-fazla-ac="" aria-expanded="false"><i class="fa-solid fa-chevron-down" aria-hidden="true"></i> <span>${fazla} seçenek daha göster</span></button>` : ''}
          </section>`;
};

// Fiyat: tek seçimli segment; değer canlı seçenek metni
const segment = (s) => {
  const d = ORNEK[s.a];
  const [, , kalemler] = s.gruplar[0];
  return `<div class="sekmeler esit tercih-segment" role="radiogroup" aria-label="Bütçe aralığı" data-segment="">
${kalemler.map(([ad]) => { const [isaret, adi] = ad.split(' · '); const sec = d.includes(ad); return `            <button class="sekme tercih-segment-kalem${sec ? ' aktif' : ''}" type="button" role="radio" aria-checked="${sec}" tabindex="${sec || (!d.length && ad === kalemler[0][0]) ? 0 : -1}" data-deger="${kac(ad)}"><b>${isaret}</b><span>${adi}</span></button>`; }).join('\n')}
          </div>
          <p class="alan-yardim tercih-segment-not">Seçili olana yeniden dokunursan seçim kalkar; bütçe tercihi olmadan da öneri alırsın.</p>`;
};

const toplam = (s) => s.gruplar.reduce((t, g) => t + g[2].length, 0);
const pane = (s, i) => {
  const d = ORNEK[s.a];
  const uzun = !!s.ara;
  return `      <div class="fit-pane${i === 0 ? ' aktif' : ''}" data-pane="kt-${s.a}" id="kesiftercihlerim-pane-kt-${s.a}" role="tabpanel" aria-labelledby="kesiftercihlerim-tab-kt-${s.a}" tabindex="0"${i === 0 ? '' : ' hidden'}>
        <div class="bolum kap">
          <div class="bolum-bas">
            <div>
              <span class="ust-etiket"><i class="fa-solid ${s.ikon}" aria-hidden="true"></i> ${s.ust}</span>
              <h2>${s.baslik}</h2>
              <p class="giris-metni">${s.giris}</p>
            </div>
            <div class="bolum-araclar">${et}</div>
          </div>
          <div class="kart tercih-kart" data-tercih="${s.a}"${s.tek ? ' data-tek=""' : ''}>
            <div class="tercih-ozet" aria-live="polite">
              <div class="tercih-ozet-metin"><b data-ozet-sayi="">${d.length ? `${d.length} seçim` : 'Seçim yok'}</b><span>${s.tek ? 'Bir aralık seçebilirsin' : `${toplam(s)} seçenekten istediğin kadarını seç`}</span></div>
              <div class="tercih-ozet-cipler" data-ozet-cipler="">${d.map((x) => `<button class="cip hap tercih-secili" type="button" data-kaldir="${kac(x)}" aria-label="${kac(x)}: seçimi kaldır">${x} <i class="fa-solid fa-xmark" aria-hidden="true"></i></button>`).join('')}</div>
              <button class="dugme hayalet kucuk tercih-temizle" type="button" data-temizle=""${d.length ? '' : ' hidden'}><i class="fa-solid fa-rotate-left" aria-hidden="true"></i> Temizle</button>
            </div>
            <div class="kart-govde">
${uzun ? `              <div class="tercih-ara">
                <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
                <input class="alan-girdi" type="search" placeholder="${s.ara}…" aria-label="${s.ara}" data-ara="" autocomplete="off">
              </div>
              <p class="tercih-sonuc-yok" data-sonuc-yok="" hidden>Aramana uyan seçenek yok.</p>
` : ''}${s.tek ? segment(s) : s.gruplar.map((g, gi) => grupHtml(s, g, gi)).join('\n')}
            </div>
          </div>
          <div class="alt-not"><i class="fa-solid fa-shield-halved" aria-hidden="true"></i> <span>${s.not} Bu bir <b>hesap ayarı değil</b>: yanıtın Gourmet’in <b>öneri motorunu</b> besler. Bildirim, güvenlik ve veri hakların <a href="{{kok}}hesabim/ayarlar/">Hesap Ayarları</a>’nda.</span></div>
        </div>
      </div>`;
};

const rayHtml = `<div class="pf-tabbar sekme-ray">
  <div class="wrap kap">
    <nav class="sekmeler ortali" role="tablist" aria-label="Keşif Tercihlerim bölümleri" data-scroll-fade="">
${ALANLAR.map((s, i) => `      <button class="sekme${i === 0 ? ' aktif' : ''}" type="button" role="tab" id="kesiftercihlerim-tab-kt-${s.a}" data-tab="kt-${s.a}" aria-controls="kesiftercihlerim-pane-kt-${s.a}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}"><i class="fa-solid ${s.ikon}" aria-hidden="true"></i> ${s.baslik} <span class="sekme-sayi" data-sekme-sayi="${s.a}">${ORNEK[s.a].length || ''}</span></button>`).join('\n')}
    </nav>
  </div>
</div>`;

// Tek kaydet çubuğu: değişiklik yokken sakin, değişiklikte birincil
const kaydetCubugu = `<div class="tercih-kaydet" data-kaydet-cubugu="" data-bc-bar="" role="region" aria-label="Kaydedilmemiş tercihler">
  <div class="tercih-kaydet-ic">
    <p class="tercih-kaydet-durum" data-kaydet-durum="" aria-live="polite"><i class="fa-solid fa-circle-check" aria-hidden="true"></i> <span>Tercihlerin kayıtlı</span></p>
    <div class="tercih-kaydet-eylem">
      <button class="dugme hayalet kucuk" type="button" data-vazgec="" disabled>Geri al</button>
      <button class="dugme birincil" type="submit" data-kaydet="" disabled><i class="fa-solid fa-check" aria-hidden="true"></i> Tercihlerimi kaydet</button>
    </div>
  </div>
</div>`;

export default function () {
  const serit = sayac('Keşif Tercihlerim özeti', [
    ['fa-solid fa-utensils', 'Mutfak', ORNEK.mutfak.length],
    ['fa-solid fa-store', 'Konsept', ORNEK.konsept.length],
    ['fa-solid fa-calendar-days', 'Etkinlik türü', ORNEK.etkinlik.length],
    ['fa-solid fa-city', 'Şehir', ORNEK.sehir.length],
    ['fa-solid fa-list-check', 'Doldurulan alan', `${Object.values(ORNEK).filter((v) => v.length).length}/${ALANLAR.length}`],
  ]).replace(/<span>(Mutfak|Konsept|Etkinlik türü|Şehir|Doldurulan alan)<\/span><b>/g, (m, e) => `<span>${e}</span><b data-serit="${{ Mutfak: 'mutfak', Konsept: 'konsept', 'Etkinlik türü': 'etkinlik', Şehir: 'sehir', 'Doldurulan alan': 'dolu' }[e]}">`);
  const govde = bant({ cur: 'Keşif Tercihlerim', ikon: 'fa-solid fa-compass', giris: 'Sana ne önereceğimizi bu tercihler belirler. Sekmeler arasında seç; en altta bir kez kaydet.', serit })
    + '\n' + rayHtml + `
<form method="post" data-yerel data-kesif-tercihleri>
  <div class="modul-govde">
${ALANLAR.map(pane).join('\n')}
  </div>
  ${kaydetCubugu}
</form>
<script type="application/json" id="ktOrnek">${JSON.stringify(ORNEK)}</script>`;
  const s = sayfa('hesabim/kesif-tercihleri', 'Keşif Tercihlerim', govde, { js: ['assets/js/sayfa/kesif-tercihleri.js'], donor: 'canlı dadagourmet.com /hesabim/kesif-tercihleri, DadaGourmet-acil 4eb638c resources/views/hesap/kesif-tercihleri.blade.php; çip ve sekme kanon §43, §11; gruplar Mekân Bul (10 Kas)' });
  return [s];
}
