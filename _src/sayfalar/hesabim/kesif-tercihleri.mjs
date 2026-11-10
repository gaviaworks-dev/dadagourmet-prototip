// Keşif Tercihlerim: canlı /hesabim/kesif-tercihleri (DadaGourmet-acil resources/views/hesap/kesif-tercihleri.blade.php,
// seçenekler App\Http\Istekler\Kesif\KesifTercihiKaydetIstegi). Alan kümesi canlıdaki sekiz alan; uydurma alan yok.
// Profil turu H6 (Beyar 10 Kas): kullanım baştan kuruldu.
//  - Checkbox duvarı ve ham select yerine gruplu, ikonlu, seçilebilir çipler (`button.cip.suzgec[aria-pressed]`, kanon §43).
//  - Uzun listede arama (H6b: "daha fazla göster" yerine akordeon).
//  - Fiyat aralığı (H6b: tek seçimli segment yerine en düşük-en yüksek aralık).
//  - Sekme başına tek başlık (bölüm başı) ve seçim özeti; çift başlık ve iki "Dolu" rozeti kalktı. Sekmede seçim sayısı.
//  - Tek kaydet akışı: bütün sekmelerdeki değişiklik alttaki yapışkan çubuktan bir kez kaydedilir ya da geri alınır.
// Gruplama ve ikonlar Mekân Bul sihirbazıyla aynı (mekan-bul ajanı, 10 Kas: mutfak üç aile, ortam konsept ikonları).
// Mutfak (kesif ajanı, 11 Kas; H6 Seçenek A, lider kararı): GLOBAL liste, 9 grup 62 mutfak, tek kaynak `assets/js/mutfak-veri.js`
// (canlı katalog 18 + Ev Yemekleri + Gastro mutfak ekseni + 1 öneri). Bölge akordeonu: kanon §21 `.akordeon` (tek açık grup) +
// Gastro "Dolabında ne var" `.mz-cat-h` başlık anatomisi (ikon, ad, "N mutfak", seçili sayısı, ok); kapalı başlıkta seçilenlerin adı.
// Çip aynı `.cip.suzgec.tercih-cip`, dünya mutfaklarında Gastro /tarifler bayrağı. Kayıt değeri mutfak KODU (dünkü ad kayıtları JS'te taşınır).
// Mekân Bul ve /mekanlar süzgeci değişmedi (canlı katalogdaki 18 kalem).
// H6b (kesif ajanı, 11 Kas, Beyar "tercihler kısımları berbat; bunlar nereden seçiliyor"): sekmeler tek bileşen ailesine çekildi.
//  - Uzun ve gruplu listeler (mutfak 62, mekân türü 28, şehir 20) aynı BÖLGE AKORDEONU: tek açık grup, kapalı başlıkta seçilenler,
//    Tümünü seç, bütün gruplarda arama. Konsept listesindeki "daha fazla göster" kalktı.
//  - Kısa listeler (etkinlik 10, beslenme 8, alerjen 12, ortam 11) eşit kolonlu ikonlu çip IZGARASI; tek gruplu sekmede sekme
//    başlığını tekrarlayan grup başlığı yok; "Fark etmez" ızgaradan ayrı satırda (Mekân Bul'un fa-shuffle ikonu).
//  - Fiyat gerçek ARALIK: sitenin tek fiyat ölçeği (canlı `katalog_mekanlar.fiyat_seviyesi` 1-4, Mekân Bul adım 1 ve /mekanlar
//    süzgeci: Ekonomik ₺, Orta ₺₺, Üst Orta ₺₺₺, Lüks ₺₺₺₺) üstünde en düşük ve en yüksek seviye; iki `role=slider` tutamak +
//    dokunulabilir kademe kartları; "Bütçe önemli değil" Mekân Bul'un canlı seçeneği. Canlı tercih alanı 3 kademe tek seçim
//    (`FIYAT_SECENEKLERI`); fark ve taşıma `kesif-tercihleri.js`'te.
//  - Seçenek listeleri canlı `KesifTercihiKaydetIstegi` sabitlerinin aynısı (alan ve seçenek eklenmedi); kaynak her alanın yanında.
import fs from 'node:fs';
import vm from 'node:vm';
import { bant, sayac, sayfa, kac, et } from './_kalip.mjs';

const MUTFAK = (() => { const k = {}; vm.runInNewContext(fs.readFileSync(new URL('../../../assets/js/mutfak-veri.js', import.meta.url), 'utf8'), { window: k, globalThis: k }); return k.DG_MUTFAK; })();
const MUTFAK_AD = Object.fromEntries(MUTFAK.kalemler.map((m) => [m.kod, m.ad]));

// [ad, ikon]
const ALANLAR = [
  { a: 'mutfak', ikon: 'fa-utensils', ust: 'Mutfak', baslik: 'Sevdiğim Mutfaklar', kisa: 'Mutfak', giris: 'Hangi mutfakları öne çıkaracağımızı bu belirler. Mekân ve rota önerileri buna göre sıralanır.', duzen: 'akordeon', birim: 'mutfak',
    not: 'Liste dünya mutfaklarını kapsar (Dada Gastro’nun mutfak listesiyle aynı). Rehberde henüz mekânı olmayan bir mutfağı da seçebilirsin; o mutfakta mekân yayına girdiğinde önerilerde öne çıkar.',
    gruplar: MUTFAK.gruplar.map((g) => [g.ad, g.ikon, g.kalemler.map((m) => [m.ad])]) },
  // Kaynak: canlı `KesifTercihiKaydetIstegi::MEKAN_SECENEKLERI` (28 mekân türü; 21'i `KatalogKategorileriSeeder` mekân kategorisi,
  // 7'si konsept: Butik, Bahçeli, Çiftlikten Sofraya, Şef Restoranı, Vegan, Vejetaryen, Yöresel). İkonlar Mekân Bul adım 2 ile ortak olanlarda aynı.
  { a: 'konsept', ikon: 'fa-store', ust: 'Mekân türü', baslik: 'Mekân Tercihlerim', kisa: 'Konsept', giris: 'Ne aradığına göre mekân öneririz: manzaralı sofradan saklı esnaf lokantasına.', duzen: 'akordeon', ara: 'Mekân türü ara', birim: 'mekân türü', not: 'Bu türlerin çoğu Mekânlar sayfasındaki <b>Mekân Kategorisi</b> süzgecinde de var.',
    gruplar: [
      ['Restoran', 'fa-utensils', [['Fine Dining Restoranı', 'fa-champagne-glasses'], ['Şef Restoranı', 'fa-star'], ['Butik Restoran', 'fa-gem'], ['Bahçeli Restoran', 'fa-tree'], ['Çiftlikten Sofraya Restoran', 'fa-tractor'], ['Esnaf Lokantası', 'fa-bowl-food'], ['Lokanta', 'fa-plate-wheat'], ['Aile Restoranı', 'fa-people-roof'], ['Casual Dining Restoranı', 'fa-utensils'], ['Fast Casual Restoranı', 'fa-burger'], ['Hızlı Servis Restoranı', 'fa-bolt'], ['Tematik Restoran', 'fa-masks-theater'], ['Restoran', 'fa-kitchen-set']]],
      ['Kahve ve çay', 'fa-mug-hot', [['Üçüncü Nesil Kahveci', 'fa-flask'], ['Kahve Dükkânı', 'fa-shop'], ['Kafe', 'fa-mug-saucer'], ['Çay Evi', 'fa-mug-hot']]],
      ['Kahvaltı ve brunch', 'fa-egg', [['Kahvaltı Mekânı', 'fa-egg'], ['Brunch Mekânı', 'fa-bacon']]],
      ['Fırın ve tatlı', 'fa-cake-candles', [['Fırın ve Unlu Mamuller', 'fa-bread-slice'], ['Pastane', 'fa-cake-candles'], ['Tatlıcı', 'fa-cookie-bite'], ['Dondurmacı', 'fa-ice-cream']]],
      ['Bitkisel ve sağlıklı', 'fa-seedling', [['Vegan Restoran', 'fa-seedling'], ['Vejetaryen Restoran', 'fa-carrot'], ['Sağlıklı Beslenme Mekânı', 'fa-apple-whole']]],
      ['Sokak ve yöresel', 'fa-store', [['Yöresel Lezzet Noktası', 'fa-store'], ['Sokak Lezzetleri Noktası', 'fa-hotdog']]],
    ] },
  // Kaynak: canlı `ETKINLIK_SECENEKLERI` (10) = `EtkinlikKategorileriSeeder` etkinlik türleri (Lezzet Takvimi tür süzgeci)
  { a: 'etkinlik', ikon: 'fa-calendar-days', ust: 'İlgi', baslik: 'Etkinlik İlgi Alanlarım', kisa: 'Etkinlik', giris: 'Lezzet Takvimi’nde hangi tür etkinlikleri öne çıkaralım?', duzen: 'izgara', birim: 'etkinlik türü', not: 'Seçtiğin türlerde yeni etkinlik açıldığında <b>Bildirimler</b>den haber alabilirsin.',
    gruplar: [
      ['Deneyim', 'fa-wine-glass', [['Tadım Etkinlikleri', 'fa-wine-glass'], ['Üretim, Hasat ve Bağ Deneyimleri', 'fa-wheat-awn'], ['Özel Menü ve Gastronomi Geceleri', 'fa-moon'], ['Pop-up ve Konuk Şef Etkinlikleri', 'fa-user-tie'], ['Gastronomi Festivalleri', 'fa-tents']]],
      ['Öğrenme ve buluşma', 'fa-chalkboard-user', [['Şef Buluşmaları ve Söyleşiler', 'fa-microphone'], ['Mutfak Atölyeleri', 'fa-kitchen-set'], ['Gastronomi Eğitimleri', 'fa-graduation-cap'], ['Yarışmalar ve Profesyonel Etkinlikler', 'fa-trophy'], ['Çocuk ve Aile Etkinlikleri', 'fa-children']]],
    ] },
  // Kaynak: canlı `SEHIR_SECENEKLERI` (20 il; rehberin 81 ili `katalog_iller`). Coğrafi bölgeye göre gruplandı.
  { a: 'sehir', ikon: 'fa-city', ust: 'Bölge', baslik: 'Şehir ve Bölge Tercihlerim', kisa: 'Şehir', giris: 'Hangi şehirlerde arama yaptığını biliyorsak öneriler oraya yaklaşır.', duzen: 'akordeon', ara: 'Şehir ara', birim: 'şehir', not: 'Şehir rehberi yalnız yayında mekânı olan şehirde açılır; şu an <b>1 rehberi olan şehir</b> var.',
    gruplar: [
      ['Marmara', 'fa-bridge', [['İstanbul'], ['Bursa'], ['Çanakkale']]],
      ['Ege', 'fa-sailboat', [['İzmir'], ['Muğla']]],
      ['Akdeniz', 'fa-sun', [['Antalya'], ['Adana'], ['Hatay']]],
      ['İç Anadolu', 'fa-wheat-awn', [['Ankara'], ['Konya'], ['Eskişehir'], ['Nevşehir'], ['Kayseri']]],
      ['Karadeniz', 'fa-mountain', [['Trabzon'], ['Bolu'], ['Karabük']]],
      ['Güneydoğu Anadolu', 'fa-landmark', [['Gaziantep'], ['Şanlıurfa'], ['Diyarbakır'], ['Mardin']]],
    ] },
  // Kaynak: sitenin fiyat ölçeği = canlı `App\Katalog\Enums\FiyatSeviyesi` (1-4, `katalog_mekanlar.fiyat_seviyesi`),
  // etiket ve ikon `MekanBulSecenekleriServisi::butceSecenekleri()` + `lang/tr/mekan-filtre.php` fiyat. Canlı tercih alanı 3 kademe tek seçim.
  { a: 'fiyat', ikon: 'fa-coins', ust: 'Bütçe', baslik: 'Fiyat Aralığım', kisa: 'Bütçe', duzen: 'aralik', giris: 'Hangi fiyat seviyeleri arasında mekân arıyorsun? En düşük ve en yüksek seviyeyi seç; tek seviye de olur.', not: 'Fiyat aralığı bir söz değil bir sıralama ipucudur; mekân sayfasında güncel fiyat gösterilmez. Ölçek Mekân Bul ve Mekânlar süzgeciyle aynı.',
    gruplar: [['Fiyat seviyesi', 'fa-coins', [['1'], ['2'], ['3'], ['4']]]] },
  // Kaynak: canlı `BESLENME_SECENEKLERI` (8, "Fark etmez" dahil; /mekanlar Beslenme süzgeci ayrı 7 kalem)
  { a: 'beslenme', ikon: 'fa-seedling', ust: 'Beslenme', baslik: 'Beslenme Tercihlerim', kisa: 'Beslenme', giris: 'Beslenme tercihin, önerdiğimiz mekân ve menüleri eler.', duzen: 'izgara', birim: 'seçenek', not: 'Bu bir sağlık tavsiyesi değildir. Alerjin varsa <b>Alerjen Tercihlerim</b> sekmesini de doldur.', tekil: 'Fark etmez',
    gruplar: [['Beslenme şekli', 'fa-seedling', [['Vegan', 'fa-seedling'], ['Vejetaryen', 'fa-carrot'], ['Glutensiz', 'fa-wheat-awn-circle-exclamation'], ['Laktozsuz', 'fa-glass-water'], ['Helal', 'fa-certificate'], ['Şekersiz', 'fa-cubes-stacked'], ['Düşük karbonhidrat', 'fa-scale-balanced'], ['Fark etmez', 'fa-shuffle']]]] },
  // Kaynak: canlı `ALERJEN_SECENEKLERI` (12)
  { a: 'alerjen', ikon: 'fa-triangle-exclamation', ust: 'Alerjen', baslik: 'Alerjen Tercihlerim', kisa: 'Alerjen', giris: 'Kaçındığın alerjenleri işaretle; işaretlediklerini içeren menüleri öne çıkarmayız.', duzen: 'izgara', birim: 'alerjen', not: 'Eleme kesin bir güvence değildir; mekânın kendi beyanına dayanır. Ciddi alerjide mekâna doğrudan sor.',
    gruplar: [['Kaçındığın alerjenler', 'fa-triangle-exclamation', [['Gluten', 'fa-wheat-awn'], ['Süt ve süt ürünleri', 'fa-cow'], ['Yumurta', 'fa-egg'], ['Fındık ve sert kabuklu yemişler', 'fa-tree'], ['Yer fıstığı', 'fa-seedling'], ['Susam', 'fa-circle-dot'], ['Soya', 'fa-leaf'], ['Balık', 'fa-fish'], ['Kabuklu deniz ürünleri', 'fa-shrimp'], ['Hardal', 'fa-jar'], ['Kereviz', 'fa-carrot'], ['Sülfit', 'fa-wine-bottle']]]] },
  // Kaynak: canlı `ORTAM_SECENEKLERI` (11) = `IsletmeBasvuruKaydetIstegi::hizmetler()` (işletme başvurusundaki Sunulan Hizmetler)
  { a: 'ortam', ikon: 'fa-list-check', ust: 'Ortam', baslik: 'Ortam ve Kullanım Tercihlerim', kisa: 'Ortam', giris: 'Senin için önemli olan hizmet ve ortam özellikleri. Mekân kartlarında etiket olarak görünür.', duzen: 'izgara', birim: 'özellik', not: 'İşletmeler profilinde en fazla 5 hizmet etiketi gösterebilir; seçimin sıralamayı etkiler.',
    gruplar: [
      ['Hizmet', 'fa-bell-concierge', [['Rezervasyon', 'fa-calendar-check'], ['Masada Servis', 'fa-bell-concierge'], ['Kahvaltı Servisi', 'fa-egg'], ['Paket Servis', 'fa-bag-shopping'], ['Kart Geçerli', 'fa-credit-card']]],
      ['Ortam ve erişim', 'fa-umbrella-beach', [['Bahçe / Teras', 'fa-umbrella-beach'], ['Aile Dostu', 'fa-children'], ['Canlı Müzik', 'fa-music'], ['Ücretsiz Wi-Fi', 'fa-wifi'], ['Otopark', 'fa-square-parking'], ['Engelli Erişimi', 'fa-wheelchair-move']]],
    ] },
];
// Örnek üyenin yanıtları (prototip örneği)
const ORNEK = {
  mutfak: ['kebap-ocakbasi', 'deniz-urunleri', 'ege-mutfagi'], // kod; ad MUTFAK_AD'dan
  konsept: ['Esnaf Lokantası', 'Fine Dining Restoranı', 'Şef Restoranı', 'Üçüncü Nesil Kahveci'],
  etkinlik: ['Tadım Etkinlikleri', 'Şef Buluşmaları ve Söyleşiler', 'Üretim, Hasat ve Bağ Deneyimleri'],
  sehir: ['İstanbul', 'İzmir', 'Muğla'],
  fiyat: ['2', '3'], // [en düşük, en yüksek] fiyat seviyesi; ['onemli-degil'] = Bütçe önemli değil
  beslenme: ['Laktozsuz'],
  alerjen: ['Süt ve süt ürünleri', 'Susam'],
  ortam: ['Rezervasyon', 'Bahçe / Teras', 'Kart Geçerli'],
};
// Fiyat ölçeği: sitenin tek ölçeği (canlı FiyatSeviyesi 1-4; etiket ve ikon Mekân Bul adım 1). Açıklama rakamsız (tutar uydurulmaz).
const FIYAT = [
  { kod: '1', ad: 'Ekonomik', isaret: '₺', ikon: 'fa-coins', aciklama: 'En uygun seviye' },
  { kod: '2', ad: 'Orta', isaret: '₺₺', ikon: 'fa-wallet', aciklama: 'Ortalama seviye' },
  { kod: '3', ad: 'Üst Orta', isaret: '₺₺₺', ikon: 'fa-gem', aciklama: 'Ortalamanın üstü' },
  { kod: '4', ad: 'Lüks', isaret: '₺₺₺₺', ikon: 'fa-crown', aciklama: 'En üst seviye' },
];
const fiyatBul = (k) => FIYAT.find((f) => f.kod === String(k));
// Özet hapı ve özet satırı metni (JS aynı kuralı `fiyatMetni` ile yazar)
const fiyatEtiket = (d) => {
  if (!d.length) { return ''; }
  if (d[0] === 'onemli-degil') { return 'Bütçe önemli değil'; }
  const [a, b] = d.map(fiyatBul);
  return a === b ? `${a.isaret} · ${a.ad}` : `${a.isaret} – ${b.isaret} · ${a.ad} – ${b.ad}`;
};
const fiyatOzet = (d) => {
  if (!d.length) { return 'Henüz aralık seçmedin.'; }
  if (d[0] === 'onemli-degil') { return '<b>Bütçe önemli değil</b> · her fiyat seviyesini görürsün'; }
  const [a, b] = d.map(fiyatBul);
  return a === b ? `<b>${a.isaret}</b> · yalnız ${a.ad}` : `<b>${a.isaret} – ${b.isaret}</b> · ${a.ad} ile ${b.ad} arası`;
};
const BIRIMDEN = { mutfak: 'mutfaktan', konsept: 'mekân türünden', etkinlik: 'etkinlik türünden', sehir: 'şehirden', beslenme: 'seçenekten', alerjen: 'alerjenden', ortam: 'özellikten' };

const toplam = (s) => s.gruplar.reduce((t, g) => t + g[2].length, 0);
const sayi = (s, d) => (s.duzen === 'aralik' ? (d.length ? 1 : 0) : d.length);
const ozetSayi = (s, d) => (s.duzen === 'aralik' ? (!d.length ? 'Seçim yok' : d[0] === 'onemli-degil' ? 'Bütçe önemli değil' : 'Aralık seçili') : d.length ? `${d.length} seçim` : 'Seçim yok');
// Özet hapları: [değer, görünen ad]; fiyatta tek hap (değer `*` = aralığı kaldır)
const hapListe = (s, d) => (s.duzen === 'aralik' ? (d.length ? [['*', fiyatEtiket(d)]] : []) : d.map((x) => [x, s.a === 'mutfak' ? MUTFAK_AD[x] || x : x]));
const slug = (t) => t.toLocaleLowerCase('tr').replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const cip = (s, [ad, ikon], secili, ek = '') => `<button class="cip suzgec tercih-cip" type="button" aria-pressed="${secili}" data-deger="${kac(ad)}"${s.tekil === ad ? ' data-tekil=""' : ''}${ek}>${ikon ? `<i class="fa-solid ${ikon}" aria-hidden="true"></i>` : ''}<span>${ad}</span><i class="fa-solid fa-check tercih-isaret" aria-hidden="true"></i></button>`;

// ---- IZGARA: kısa listeler. Eşit kolonlu çip ızgarası; tek gruplu sekmede grup başlığı yok; "Fark etmez" ayrı satırda ----
const izgara = (s) => {
  const d = ORNEK[s.a];
  const tek = s.gruplar.length === 1;
  const govde = s.gruplar.map(([ad, ikon, kalemler], gi) => {
    const id = `kt-${s.a}-g${gi}`, liste = kalemler.filter(([x]) => x !== s.tekil);
    const n = liste.filter(([x]) => d.includes(x)).length;
    return `              <section class="tercih-grup"${tek ? '' : ` aria-labelledby="${id}" data-grup=""`}>${tek ? '' : `
                <h3 class="tercih-grup-bas" id="${id}"><i class="fa-solid ${ikon}" aria-hidden="true"></i> ${ad} <span class="tercih-grup-sayi" data-grup-sayi="">${n ? `${n} seçili` : ''}</span></h3>`}
                <div class="tercih-cipler tercih-izgara" role="group" ${tek ? `aria-label="${ad}"` : `aria-labelledby="${id}"`}>${liste.map((k) => cip(s, k, d.includes(k[0]))).join('')}</div>
              </section>`;
  }).join('\n');
  const tekil = s.tekil ? s.gruplar[0][2].find(([x]) => x === s.tekil) : null;
  return govde + (tekil ? `
              <div class="tercih-tekil"><span class="tercih-tekil-veya">ya da</span>${cip(s, tekil, d.includes(s.tekil))}<span class="tercih-tekil-not">Tek başına seçilir; öbür seçimleri kaldırır.</span></div>` : '');
};

// ---- AKORDEON: uzun ve gruplu listeler (mutfak, mekân türü, şehir). Tek açık grup; ilk grup açık; kapalı gövde JS'te `inert` ----
const mutfakIkon = (m) => (m.bayrak ? `<img class="mt-bayrak" src="{{kok}}assets/g/varliklar/flags/${m.bayrak}.svg" alt="" width="17" height="12">` : `<i class="fa-solid ${m.ikon}" aria-hidden="true"></i>`);
// Mutfak grup notu: Mekân Bul'da (canlı katalog) aranabilenler ve öneri kalemi; mekân sayısı yazılmaz
const grupNotu = (g) => {
  const n = g.kalemler.filter((m) => m.katalog).length, m = g.kalemler.length, oneri = g.kalemler.filter((x) => x.oneri).map((x) => x.ad);
  const bas = n === m ? 'Hepsi Mekân Bul’da da aranabilir.' : !n ? 'Bu grubun mutfakları henüz Mekân Bul’da yok; seçimin saklanır, mekân eklendikçe önerilerde çıkar.' : n <= 3 ? `${g.kalemler.filter((x) => x.katalog).map((x) => x.ad).join(', ')} Mekân Bul’da da aranabilir.` : `Bu gruptan ${n} mutfak Mekân Bul’da da aranabilir.`;
  return bas + (oneri.length ? ` ${oneri.join(', ')} prototip önerisidir.` : '');
};
const akordeonGruplari = (s) => (s.a === 'mutfak'
  ? MUTFAK.gruplar.map((g) => ({ kod: g.kod, ad: g.ad, ikon: g.ikon, not: grupNotu(g), kalemler: g.kalemler.map((m) => ({ deger: m.kod, ad: m.ad, gorsel: mutfakIkon(m), oneri: m.oneri })) }))
  : s.gruplar.map(([ad, ikon, kalemler]) => ({ kod: slug(ad), ad, ikon, not: '', kalemler: kalemler.map(([x, ik]) => ({ deger: x, ad: x, gorsel: ik ? `<i class="fa-solid ${ik}" aria-hidden="true"></i>` : '' })) })));
const akordeon = (s) => {
  const d = ORNEK[s.a], G = akordeonGruplari(s), n = G.reduce((t, g) => t + g.kalemler.length, 0);
  const id = (t, g) => `ak-${s.a}-${t}-${g}`;
  const cipA = (m) => `<button class="cip suzgec tercih-cip" type="button" aria-pressed="${d.includes(m.deger)}" data-deger="${kac(m.deger)}" data-ad="${kac(m.ad)}"${m.oneri ? ' data-oneri=""' : ''}>${m.gorsel}<span>${m.ad}</span><i class="fa-solid fa-check tercih-isaret" aria-hidden="true"></i></button>`;
  const bos = `${G.length} grupta <b>${n} ${s.birim}</b>`;
  return `              <div class="mt-ara-satir">
                <div class="tercih-ara">
                  <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
                  <input class="alan-girdi" type="search" placeholder="${s.a === 'mutfak' ? 'Mutfak, ülke ya da bölge ara' : s.ara}…" aria-label="${s.a === 'mutfak' ? 'Mutfak, ülke ya da bölge ara' : s.ara}" aria-describedby="ak-${s.a}-say" data-akordeon-ara="" autocomplete="off">
                </div>
                <p class="mt-ara-ipucu" id="ak-${s.a}-say" data-akordeon-say="" role="status" data-bos="${kac(bos)}">${bos}</p>
              </div>
              <p class="tercih-sonuc-yok" data-akordeon-yok="" hidden>${s.a === 'mutfak' ? 'Aramana uyan mutfak yok. Ülke adıyla da arayabilirsin (ör. Japonya, Peru).' : `Aramana uyan ${s.birim} yok.`}</p>
              <div class="mt-sonuc" data-akordeon-sonuc="" hidden></div>
              <div class="akordeon mt-akordeon" data-akordeon="" data-birim="${s.birim}">
${G.map((g, gi) => `                <section class="akordeon-kalem mt-grup${gi === 0 ? ' acik' : ''}" data-mgrup="${g.kod}">
                  <h3 class="mt-grup-h"><button class="akordeon-bas mt-grup-bas" type="button" id="${id('b', g.kod)}" aria-controls="${id('g', g.kod)}" aria-expanded="${gi === 0}">
                    <span class="akordeon-ikon"><i class="fa-solid ${g.ikon}" aria-hidden="true"></i></span>
                    <span class="mt-grup-metin"><span class="mt-grup-ad">${g.ad}</span><span class="mt-grup-alt" data-mgrup-ozet="">${g.kalemler.length} ${s.birim}</span></span>
                    <span class="rozet mt-grup-sayi" data-mgrup-sayi=""></span>
                    <i class="fa-solid fa-chevron-down akordeon-ok" aria-hidden="true"></i>
                  </button></h3>
                  <div class="akordeon-govde" id="${id('g', g.kod)}" role="region" aria-labelledby="${id('b', g.kod)}">
                    <div class="mt-govde-ic">
                      <div class="mt-grup-arac">${g.not ? `<p>${g.not}</p>` : ''}<button class="tercih-fazla" type="button" data-mgrup-tumu=""><i class="fa-solid fa-check-double" aria-hidden="true"></i> <span>Tümünü seç</span></button></div>
                      <div class="tercih-cipler" role="group" aria-label="${g.ad}">${g.kalemler.map(cipA).join('')}</div>
                    </div>
                  </div>
                </section>`).join('\n')}
              </div>
`;
};

// ---- ARALIK: fiyat. Dokunulabilir 4 kademe kartı (ilk dokunuş alt uç, ikincisi üst uç) + altta iki `role=slider` tutamaklı ray ----
const aralik = (s) => {
  const d = ORNEK[s.a], ar = d.length === 2 ? d.map(Number) : null;
  const ici = (n) => !!ar && n >= ar[0] && n <= ar[1];
  const tutamak = (uc, ad, n) => `<span class="fiyat-tutamak" role="slider" tabindex="0" data-uc="${uc}" aria-label="${ad}" aria-valuemin="1" aria-valuemax="4" aria-valuenow="${n}" aria-valuetext="${ar ? `${fiyatBul(n).isaret} ${fiyatBul(n).ad}` : 'Seçilmedi'}"></span>`;
  return `              <div class="fiyat-aralik${ar ? '' : ' bos'}" data-fiyat-aralik="">
                <div class="fiyat-kademeler" role="group" aria-label="Fiyat seviyeleri" aria-describedby="kt-fiyat-ipucu">
${FIYAT.map((f) => { const n = Number(f.kod), ic = ici(n), uc = ic && (n === ar[0] || n === ar[1]); return `                  <button class="fiyat-kademe${ic ? ' arada' : ''}${uc ? ' uc' : ''}" type="button" aria-pressed="${ic}" data-kademe="${f.kod}" data-ad="${f.ad}" data-isaret="${f.isaret}"><span class="fiyat-kademe-ikon"><i class="fa-solid ${f.ikon}" aria-hidden="true"></i></span><b class="fiyat-kademe-isaret" aria-hidden="true">${f.isaret}</b><span class="fiyat-kademe-ad">${f.ad}</span><small>${f.aciklama}</small></button>`; }).join('\n')}
                </div>
                <div class="fiyat-ray" data-fiyat-ray="">
                  <span class="fiyat-ray-dolu" data-fiyat-dolu=""></span>
                  ${tutamak('alt', 'En düşük fiyat seviyesi', ar ? ar[0] : 1)}
                  ${tutamak('ust', 'En yüksek fiyat seviyesi', ar ? ar[1] : 4)}
                </div>
                <div class="fiyat-alt">
                  <p class="fiyat-ozet" data-fiyat-ozet="" aria-live="polite"><i class="fa-solid fa-coins" aria-hidden="true"></i> <span>${fiyatOzet(d)}</span></p>
                  <button class="cip suzgec fiyat-fark" type="button" aria-pressed="${d[0] === 'onemli-degil'}" data-fiyat-fark=""><i class="fa-solid fa-shuffle" aria-hidden="true"></i><span>Bütçe önemli değil</span><i class="fa-solid fa-check tercih-isaret" aria-hidden="true"></i></button>
                </div>
                <p class="alan-yardim fiyat-ipucu" id="kt-fiyat-ipucu" data-fiyat-ipucu="">İlk dokunuş en düşük, ikinci dokunuş en yüksek seviyeyi seçer; tek seviye için aynı karta iki kez dokun. Tutamakları ok tuşlarıyla da kaydırabilirsin.</p>
              </div>
`;
};

const pane = (s, i) => {
  const d = ORNEK[s.a];
  const haplar = hapListe(s, d);
  const alt = s.duzen === 'aralik' ? 'Sitedeki 4 fiyat seviyesiyle aynı ölçek' : `${toplam(s)} ${BIRIMDEN[s.a]} istediğin kadarını seç`;
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
          <div class="kart tercih-kart" data-tercih="${s.a}" data-duzen="${s.duzen}">
            <div class="tercih-ozet" aria-live="polite">
              <div class="tercih-ozet-metin"><b data-ozet-sayi="">${ozetSayi(s, d)}</b><span>${alt}</span></div>
              <div class="tercih-ozet-cipler" data-ozet-cipler="">${haplar.map(([x, ad]) => `<button class="cip hap tercih-secili" type="button" data-kaldir="${kac(x)}" aria-label="${kac(ad)}: seçimi kaldır">${ad} <i class="fa-solid fa-xmark" aria-hidden="true"></i></button>`).join('')}</div>
              <button class="dugme hayalet kucuk tercih-temizle" type="button" data-temizle=""${d.length ? '' : ' hidden'}><i class="fa-solid fa-rotate-left" aria-hidden="true"></i> Temizle</button>
            </div>
            <div class="kart-govde">
${s.duzen === 'akordeon' ? akordeon(s) : s.duzen === 'aralik' ? aralik(s) : izgara(s)}
            </div>
          </div>
          <div class="alt-not"><i class="fa-solid fa-shield-halved" aria-hidden="true"></i> <span>${s.not} Bu bir <b>hesap ayarı değil</b>: yanıtın Gourmet’in <b>öneri motorunu</b> besler. Bildirim, güvenlik ve veri hakların <a href="{{kok}}hesabim/ayarlar/">Hesap Ayarları</a>’nda.</span></div>
        </div>
      </div>`;
};

const rayHtml = `<div class="pf-tabbar sekme-ray">
  <div class="wrap kap">
    <nav class="sekmeler ortali" role="tablist" aria-label="Keşif Tercihlerim bölümleri" data-scroll-fade="">
${ALANLAR.map((s, i) => `      <button class="sekme${i === 0 ? ' aktif' : ''}" type="button" role="tab" id="kesiftercihlerim-tab-kt-${s.a}" data-tab="kt-${s.a}" aria-controls="kesiftercihlerim-pane-kt-${s.a}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}"><i class="fa-solid ${s.ikon}" aria-hidden="true"></i> ${s.baslik} <span class="sekme-sayi" data-sekme-sayi="${s.a}">${sayi(s, ORNEK[s.a]) || ''}</span></button>`).join('\n')}
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
  const s = sayfa('hesabim/kesif-tercihleri', 'Keşif Tercihlerim', govde, { js: ['assets/js/mutfak-veri.js', 'assets/js/sayfa/kesif-tercihleri.js', 'assets/g/varliklar/reference/shared/bottom-clearance.js'], donor: 'canlı dadagourmet.com /hesabim/kesif-tercihleri, DadaGourmet-acil 4eb638c resources/views/hesap/kesif-tercihleri.blade.php; çip ve sekme kanon §43, §11; gruplar Mekân Bul (10 Kas); mutfak listesi canlı katalog + dadagastro.com/tarifler mutfak ekseni, akordeon kanon §21 + Gastro dolapta-ne-var `.mz-cat` (11 Kas)' });
  return [s];
}
