// Keşif Tercihlerim: canlı /hesabim/kesif-tercihleri (DadaGourmet-acil resources/views/hesap/kesif-tercihleri.blade.php,
// seçenekler App\Http\Istekler\Kesif\KesifTercihiKaydetIstegi). Canlıdaki gibi TEK belge, sekiz sayfa içi sekme; panel
// geçişi prototipin `sekmeler.js` sürücüsüyle (`data-tab`, `#kt-…` derin bağ). Seçimler örnek; kaydet/temizle yalnız bu
// tarayıcıya yazar (`kesif-tercihleri.js`). Kt-süzgeç ve kaydırıcı biçimi canlının kendi `shared/t5b-d.css`'inden.
import { bant, sayac, sayfa, kac, et } from './_kalip.mjs';

const MUTFAK = ['Kahvaltı', 'Kebap ve Izgara', 'Balık ve Deniz Ürünleri', 'Ev Yemekleri'];
const MEKAN = ['Aile Restoranı', 'Bahçeli Restoran', 'Brunch Mekânı', 'Butik Restoran', 'Casual Dining Restoranı', 'Çay Evi', 'Çiftlikten Sofraya Restoran', 'Dondurmacı', 'Esnaf Lokantası', 'Fast Casual Restoranı', 'Fine Dining Restoranı', 'Fırın ve Unlu Mamuller', 'Hızlı Servis Restoranı', 'Kafe', 'Kahvaltı Mekânı', 'Kahve Dükkânı', 'Lokanta', 'Pastane', 'Restoran', 'Sağlıklı Beslenme Mekânı', 'Şef Restoranı', 'Sokak Lezzetleri Noktası', 'Tatlıcı', 'Tematik Restoran', 'Üçüncü Nesil Kahveci', 'Vegan Restoran', 'Vejetaryen Restoran', 'Yöresel Lezzet Noktası'];
const ETKINLIK = ['Gastronomi Festivalleri', 'Tadım Etkinlikleri', 'Mutfak Atölyeleri', 'Şef Buluşmaları ve Söyleşiler', 'Özel Menü ve Gastronomi Geceleri', 'Pop-up ve Konuk Şef Etkinlikleri', 'Üretim, Hasat ve Bağ Deneyimleri', 'Gastronomi Eğitimleri', 'Yarışmalar ve Profesyonel Etkinlikler', 'Çocuk ve Aile Etkinlikleri'];
const SEHIR = ['İstanbul', 'Ankara', 'İzmir', 'Antalya', 'Bursa', 'Konya', 'Gaziantep', 'Bolu', 'Karabük', 'Muğla', 'Trabzon', 'Hatay', 'Şanlıurfa', 'Adana', 'Eskişehir', 'Diyarbakır', 'Mardin', 'Nevşehir', 'Çanakkale', 'Kayseri'];
const FIYAT = ['₺ · Ekonomik', '₺₺ · Orta', '₺₺₺ · Üst Segment'];
const BESLENME = ['Vegan', 'Vejetaryen', 'Glutensiz', 'Laktozsuz', 'Helal', 'Şekersiz', 'Düşük karbonhidrat', 'Fark etmez'];
const ALERJEN = ['Gluten', 'Süt ve süt ürünleri', 'Yumurta', 'Fındık ve sert kabuklu yemişler', 'Yer fıstığı', 'Susam', 'Soya', 'Balık', 'Kabuklu deniz ürünleri', 'Hardal', 'Kereviz', 'Sülfit'];
const ORTAM = ['Masada Servis', 'Rezervasyon', 'Kahvaltı Servisi', 'Bahçe / Teras', 'Aile Dostu', 'Otopark', 'Kart Geçerli', 'Engelli Erişimi', 'Paket Servis', 'Ücretsiz Wi-Fi', 'Canlı Müzik'];

const MEKAN_GRUP = { 'Aile Restoranı': 'restoran', 'Bahçeli Restoran': 'restoran', 'Brunch Mekânı': 'kahvalti', 'Butik Restoran': 'restoran', 'Casual Dining Restoranı': 'restoran', 'Çay Evi': 'kahve-cay', 'Çiftlikten Sofraya Restoran': 'restoran', 'Dondurmacı': 'firin-tatli', 'Esnaf Lokantası': 'restoran', 'Fast Casual Restoranı': 'restoran', 'Fine Dining Restoranı': 'restoran', 'Fırın ve Unlu Mamuller': 'firin-tatli', 'Hızlı Servis Restoranı': 'restoran', 'Kafe': 'kahve-cay', 'Kahvaltı Mekânı': 'kahvalti', 'Kahve Dükkânı': 'kahve-cay', 'Lokanta': 'restoran', 'Pastane': 'firin-tatli', 'Restoran': 'restoran', 'Sağlıklı Beslenme Mekânı': 'bitkisel', 'Şef Restoranı': 'restoran', 'Sokak Lezzetleri Noktası': 'sokak', 'Tatlıcı': 'firin-tatli', 'Tematik Restoran': 'restoran', 'Üçüncü Nesil Kahveci': 'kahve-cay', 'Vegan Restoran': 'bitkisel', 'Vejetaryen Restoran': 'bitkisel', 'Yöresel Lezzet Noktası': 'sokak' };
const SEHIR_GRUP = { 'İstanbul': 'marmara', 'Ankara': 'ic-anadolu', 'İzmir': 'ege', 'Antalya': 'akdeniz', 'Bursa': 'marmara', 'Konya': 'ic-anadolu', 'Gaziantep': 'guneydogu', 'Bolu': 'karadeniz', 'Karabük': 'karadeniz', 'Muğla': 'ege', 'Trabzon': 'karadeniz', 'Hatay': 'akdeniz', 'Şanlıurfa': 'guneydogu', 'Adana': 'akdeniz', 'Eskişehir': 'ic-anadolu', 'Diyarbakır': 'guneydogu', 'Mardin': 'guneydogu', 'Nevşehir': 'ic-anadolu', 'Çanakkale': 'marmara', 'Kayseri': 'ic-anadolu' };

// Örnek üyenin yanıtları (prototip örneği). Canlıda yanıtsız alan "Boş" / "Henüz yanıtlamadın" gösterir.
const ORNEK = {
  mutfak: ['Kebap ve Izgara', 'Balık ve Deniz Ürünleri'],
  mekan: ['Esnaf Lokantası', 'Fine Dining Restoranı', 'Şef Restoranı', 'Üçüncü Nesil Kahveci'],
  etkinlik: ['Tadım Etkinlikleri', 'Şef Buluşmaları ve Söyleşiler', 'Üretim, Hasat ve Bağ Deneyimleri'],
  sehir: ['İstanbul', 'İzmir', 'Muğla'],
  fiyat: '₺₺ · Orta',
  beslenme: ['Laktozsuz'],
  alerjen: ['Süt ve süt ürünleri', 'Susam'],
  ortam: ['Rezervasyon', 'Bahçe / Teras', 'Kart Geçerli'],
};
// Canlı alt notundaki sayı sitenin şehir rehberi sayısı; prototipte Şehir Rehberleri ekranıyla aynı (1).
const REHBERLI_SEHIR = 1;

const SEKMELER = [
  { a: 'mutfak', ikon: 'fa-utensils', ust: 'Mutfak', baslik: 'Sevdiğim Mutfaklar', giris: 'Hangi mutfakları öne çıkaracağımızı bu belirler. Mekân ve rota önerileri buna göre sıralanır.', kart: 'Sevdiğin mutfaklar', kartAc: 'Rehberde şu an yayında olan mutfak süzgeçleri.', ayar: 'Sevdiğin mutfaklar', cipler: 'Sevdiğin mutfaklar', sec: MUTFAK, not: 'Listede yalnız <b>yayında mekânı olan</b> mutfaklar var; yeni mutfak eklendikçe burada belirir.' },
  { a: 'mekan', ikon: 'fa-location-dot', ust: 'Konsept', baslik: 'Mekân Tercihlerim', giris: 'Ne aradığına göre mekân öneririz — manzaralı sofradan saklı esnaf lokantasına.', kart: 'Tercih ettiğin konseptler', kartAc: 'Mekânlar sayfasındaki konsept şeridinin tamamı.', ayar: 'Mekân konseptlerin', cipler: 'Mekân konseptlerin', sec: MEKAN, grup: MEKAN_GRUP, not: 'Seçim, Mekânlar sayfasındaki soldaki filtrelerle birlikte çalışır.' },
  { a: 'etkinlik', ikon: 'fa-calendar-days', ust: 'İlgi', baslik: 'Etkinlik İlgi Alanlarım', giris: 'Lezzet Takvimi\'nde hangi tür etkinlikleri öne çıkaralım?', kart: 'İlgilendiğin etkinlik türleri', kartAc: 'Takvimin kendi tür süzgeçleri.', ayar: 'Etkinlik türlerin', cipler: 'İlgilendiğin etkinlik türleri', sec: ETKINLIK, not: 'Seçtiğin türlerde yeni etkinlik açıldığında <b>Bildirimler</b>den haber alabilirsin.' },
  { a: 'sehir', ikon: 'fa-city', ust: 'Bölge', baslik: 'Şehir ve Bölge Tercihlerim', giris: 'Hangi şehirlerde arama yaptığını biliyorsak öneriler oraya yaklaşır.', kart: 'Takip ettiğin şehirler', kartAc: 'Rehber 81 şehir kapsar; en çok baktığın şehirleri seç.', ayar: 'Şehir tercihlerin', cipler: 'Şehir tercihlerin', sec: SEHIR, grup: SEHIR_GRUP, not: `Şehir rehberi yalnız yayında mekânı olan şehirde açılır — şu an <b>${REHBERLI_SEHIR} rehberi olan şehir</b>.` },
  { a: 'fiyat', ikon: 'fa-coins', ust: 'Bütçe', baslik: 'Fiyat Aralığım', giris: 'Bütçe aralığın öneri sıralamasını belirler. Tek seçim.', kart: 'Bütçe aralığın', kartAc: 'İşletme başvurusundaki fiyat aralığı ölçeğiyle aynı.', ayar: 'Fiyat aralığın', cipler: 'Fiyat aralığın', sec: FIYAT, tek: true, not: 'Fiyat aralığı bir söz değil bir sıralama ipucudur; mekân sayfasında güncel fiyat gösterilmez.' },
  { a: 'beslenme', ikon: 'fa-seedling', ust: 'Beslenme', baslik: 'Beslenme Tercihlerim', giris: 'Beslenme tercihin, önerdiğimiz mekân ve menüleri eler.', kart: 'Beslenme tercihlerin', kartAc: 'Rehberdeki vegan ve vejetaryen konseptleriyle eşleşir.', ayar: 'Beslenme tercihlerin', cipler: 'Beslenme tercihlerin', sec: BESLENME, not: 'Bu bir sağlık tavsiyesi değildir. Alerjin varsa <b>Alerjen Tercihlerim</b> sekmesini de doldur.' },
  { a: 'alerjen', ikon: 'fa-wheat-awn', ust: 'Alerjen', baslik: 'Alerjen Tercihlerim', giris: 'Kaçındığın alerjenleri işaretle; bu bilgi önerilerden eleme yapar.', kart: 'Kaçındığın alerjenler', kartAc: 'İşaretlediklerini içeren menüleri öne çıkarmayız.', ayar: 'Alerjenlerin', cipler: 'Alerjenlerin', sec: ALERJEN, not: 'Eleme kesin bir güvence değildir — mekânın kendi beyanına dayanır. Ciddi alerjide mekâna doğrudan sor.' },
  { a: 'ortam', ikon: 'fa-list-check', ust: 'Ortam', baslik: 'Ortam ve Kullanım Tercihlerim', giris: 'Senin için önemli olan hizmet ve ortam özellikleri. Mekân kartlarında etiket olarak görünür.', kart: 'Aradığın özellikler', kartAc: 'İşletme başvurusundaki <b>Sunulan Hizmetler</b> listesiyle birebir.', ayar: 'Ortam tercihlerin', cipler: 'Ortam tercihlerin', sec: ORTAM, not: 'İşletmeler profilinde en fazla 5 hizmet etiketi gösterebilir; seçimin sıralamayı etkiler.' },
];

const dolu = (d) => !(d == null || d === '' || (Array.isArray(d) && !d.length));
const ozet = (d) => (dolu(d) ? (Array.isArray(d) ? d.join(', ') : d) : 'Seçim yok');
const durum = (d) => (dolu(d) ? '<span class="rozet dolu">Dolu</span>' : '<span class="rozet pasif">Boş</span>');

// Canlıdaki süzgeç seçimi: grup başına sayı seçeneklerden hesaplanır
const suzgec = (alan, id, etiket, gruplar, harita) => {
  const say = (g) => Object.values(harita).filter((x) => x === g).length;
  const n = Object.keys(harita).length;
  return `<div class="alan kt-suzgec">
                  <label class="alan-etiket" for="${id}">${etiket}</label>
                  <select class="alan-secim" id="${id}" data-cip-suzgec="${alan}" aria-describedby="${id}Not">
                    <option value="" selected>Tümü (${n})</option>
${gruplar.map(([g, ad]) => `                    <option value="${g}">${ad} (${say(g)})</option>`).join('\n')}
                  </select>
                  <p class="kart-sayac" id="${id}Not" role="status" aria-live="polite">Listede görünen: <span data-suzgec-sayac>${n} / ${n}</span></p>
                </div>`;
};
const ARALIK = ['Seçim yok', '₺', '₺₺', '₺₺₺'];
const aralik = (d) => {
  const v = FIYAT.indexOf(d) + 1;
  return `<div class="alan kt-aralik">
                  <label class="alan-etiket" for="ktFiyatAralik">Bütçe kaydırıcısı</label>
                  <input class="aralik-girdi" id="ktFiyatAralik" type="range" min="0" max="3" step="1" value="${v}" data-cip-aralik="fiyat" list="ktFiyatUclar" aria-describedby="ktFiyatAralikNot" aria-valuetext="${kac(ozet(d))}">
                  <datalist id="ktFiyatUclar">
${ARALIK.map((l, i) => `                    <option value="${i}" label="${l}"></option>`).join('\n')}
                  </datalist>
                  <p class="kart-sayac" id="ktFiyatAralikNot" role="status" aria-live="polite">Kaydırıcı: <span data-aralik-etiket>${kac(ozet(d))}</span></p>
                </div>`;
};
const ek = (a) => {
  if (a === 'mekan') return suzgec('mekan', 'ktMekanSuzgec', 'Türe göre daralt', [['restoran', 'Restoran'], ['kahve-cay', 'Kahve ve çay'], ['firin-tatli', 'Fırın ve tatlı'], ['kahvalti', 'Kahvaltı ve brunch'], ['bitkisel', 'Bitkisel ve sağlıklı'], ['sokak', 'Sokak ve yöresel']], MEKAN_GRUP);
  if (a === 'sehir') return suzgec('sehir', 'ktSehirSuzgec', 'Bölgeye göre daralt', [['marmara', 'Marmara'], ['ic-anadolu', 'İç Anadolu'], ['ege', 'Ege'], ['akdeniz', 'Akdeniz'], ['karadeniz', 'Karadeniz'], ['guneydogu', 'Güneydoğu Anadolu']], SEHIR_GRUP);
  if (a === 'fiyat') return aralik(ORNEK.fiyat);
  return '';
};

const cip = (s, secenek, d) => {
  const isaretli = s.tek ? d === secenek : (d || []).includes(secenek);
  const grup = s.grup && s.grup[secenek] ? ` data-grup="${s.grup[secenek]}"` : '';
  const girdi = s.tek
    ? `<input type="radio" name="${s.a}" value="${kac(secenek)}"${isaretli ? ' checked' : ''}>`
    : `<input type="checkbox" name="${s.a}[]" value="${kac(secenek)}"${isaretli ? ' checked' : ''}>`;
  return `                  <label class="cip suzgec"${grup}>
                    ${girdi}
                    ${secenek}
                  </label>`;
};

const pane = (s, i) => {
  const d = ORNEK[s.a];
  return `      <div class="fit-pane${i === 0 ? ' aktif' : ''}" data-pane="kt-${s.a}" id="kesiftercihlerim-pane-kt-${s.a}" role="tabpanel" aria-labelledby="kesiftercihlerim-tab-kt-${s.a}" tabindex="${i === 0 ? 0 : -1}"${i === 0 ? '' : ' hidden'}>
        <div class="bolum kap">
          <div class="bolum-bas">
            <div>
              <span class="ust-etiket"><i class="fa-solid ${s.ikon}" aria-hidden="true"></i> ${s.ust}</span>
              <h2>${s.baslik}</h2>
              <p class="giris-metni">${s.giris}</p>
            </div>
          </div>
          <div class="kart form" data-alan-kart="${s.a}">
            <div class="kart-bas">
              <div>
                <h3 class="kart-baslik">${s.kart}</h3>
                <p>${s.kartAc}</p>
              </div>
              ${durum(d).replace('class="rozet', 'data-alan-rozet class="rozet')}
            </div>
            <div class="kart-govde">
              <div class="ayar-satir" data-alan="${s.a}">
                <span class="as-ikon"><i class="fa-solid ${s.ikon}" aria-hidden="true"></i></span>
                <span class="as-metin">
                  <b>${s.ayar}</b>
                  <span data-alan-satir>${dolu(d) ? kac(ozet(d)) : 'Henüz yanıtlamadın'}</span>
                </span>
                <span class="as-eylem">${durum(d).replace('class="rozet', 'data-alan-durum class="rozet')}</span>
              </div>
              ${ek(s.a)}
              <div class="cipler" role="group" aria-label="${s.cipler}" data-alan="${s.a}"${s.tek ? ' data-tip="tek"' : ''}>
                <span class="cipler-basligi">${s.tek ? 'Bir tane seç' : 'Birden fazla seçebilirsin'}</span>
${s.sec.map((x) => cip(s, x, d)).join('\n')}
              </div>
              <p class="kart-sayac">Şu anki yanıtın: <span data-alan-ozet>${kac(ozet(d))}</span> <span data-alan-ornek>${et}</span></p>
            </div>
            <div class="kart-alt">
              <button class="dugme birincil" type="submit" name="kaydet_alan" value="${s.a}"><i class="fa-solid fa-check" aria-hidden="true"></i> Yanıtı kaydet</button>
              <button class="dugme hayalet" type="submit" name="temizle_alan" value="${s.a}">Yanıtı temizle</button>
            </div>
          </div>
          <div class="alt-not"><i class="fa-solid fa-shield-halved" aria-hidden="true"></i> <span>${s.not} <span data-t5d-oneri-motoru>Bu bir <b>hesap ayarı değil</b>: yanıtın Gourmet'in <b>öneri motorunu</b> besler. Bildirim, güvenlik ve veri hakların <a href="{{kok}}hesabim/ayarlar/">Hesap Ayarları</a>'nda.</span></span></div>
        </div>
      </div>`;
};

const rayHtml = `<div class="pf-tabbar sekme-ray">
  <div class="wrap kap">
    <nav class="sekmeler ortali" role="tablist" data-fit-tabs="kesiftercihlerim" aria-label="Keşif Tercihlerim bölümleri">
${SEKMELER.map((s, i) => `      <button class="sekme${i === 0 ? ' aktif' : ''}" type="button" role="tab" id="kesiftercihlerim-tab-kt-${s.a}" data-tab="kt-${s.a}" aria-controls="kesiftercihlerim-pane-kt-${s.a}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}"><i class="fa-solid ${s.ikon}" aria-hidden="true"></i> ${s.baslik}</button>`).join('\n')}
    </nav>
  </div>
</div>`;

export default function () {
  const serit = sayac('Keşif Tercihlerim özeti', [
    ['fa-solid fa-utensils', 'Mutfak', MUTFAK.length],
    ['fa-solid fa-location-dot', 'Konsept', MEKAN.length],
    ['fa-solid fa-calendar-days', 'Etkinlik türü', ETKINLIK.length],
    ['fa-solid fa-city', 'Şehir', 81],
    ['fa-solid fa-list-check', 'Ortam özelliği', ORTAM.length],
  ]);
  const govde = bant({ cur: 'Keşif Tercihlerim', ikon: 'fa-solid fa-compass', giris: 'Sana ne önereceğimizi bu sekmeler belirler. Her yanıtı ayrı ayrı kaydeder ya da temizlersin.', serit })
    + '\n' + rayHtml + `
<form method="post" data-yerel data-kesif-tercihleri>
  <div class="modul-govde">
${SEKMELER.map(pane).join('\n')}
  </div>
</form>`;
  const s = sayfa('hesabim/kesif-tercihleri', 'Keşif Tercihlerim', govde, { js: ['assets/js/sayfa/sekmeler.js', 'assets/js/sayfa/kesif-tercihleri.js'], donor: 'canlı dadagourmet.com /hesabim/kesif-tercihleri, DadaGourmet-acil 4eb638c resources/views/hesap/kesif-tercihleri.blade.php' });
  s.meta.css = [...s.meta.css, 'shared/t5b-d.css'];
  return [s];
}
