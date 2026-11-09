// İşletme portalı: canlı /isletme (DadaGourmet-acil resources/views/isletme). Metin, alan, durum ve sıra canlıdan;
// görünüm prototipin kanon bileşenleri. Rezervasyon talepleri bölümü prototipin kendi İşletme Paneli'nden aynen (karar.js).
// Örnek sahip Mikla'yı yönetir; bütün örnekler `prototip örneği` etiketli. Formlar yalnız bu tarayıcıya yazar (isletme-portal.js).
import { ray, bolumBas, kartBas, kart, satir, rozet, bos, sayfa, et, kac } from '../hesabim/_kalip.mjs';

const JS = ['assets/js/sayfa/isletme-portal.js'];
const DONOR = 'canlı dadagourmet.com/isletme, DadaGourmet-acil resources/views/isletme (index, basvurular/form, degisiklik-talepleri, degerlendirmeler)';

// Canlı enum değerleri (app/Isletme/Enums, app/Degerlendirme/Enums) → prototipte görünen Türkçe ad ve rozet türü
export const BASVURU_DURUM = { taslak: ['Taslak', 'pasif'], gonderildi: ['Gönderildi', 'bekleme'], incelemede: ['İncelemede', 'bekleme'], bilgi_istendi: ['Bilgi istendi', 'bekleme'], onaylandi: ['Onaylandı', 'olumlu'], reddedildi: ['Reddedildi', 'durdu'] };
export const TALEP_DURUM = { taslak: ['Taslak', 'pasif'], gonderildi: ['Gönderildi', 'bekleme'], incelemede: ['İncelemede', 'bekleme'], onaylandi: ['Onaylandı', 'olumlu'], reddedildi: ['Reddedildi', 'durdu'], uygulandi: ['Uygulandı', 'olumlu'] };
// Değerlendirme durumu prototipin moderasyon adlarıyla (karar.js): beklemede → İnceleniyor, onaylandi → Yayında
const DEG_DURUM = { inceleniyor: ['İnceleniyor', 'bekleme'], yayinda: ['Yayında', 'olumlu'], reddedildi: ['Yayınlanmadı', 'durdu'] };

// IsletmeBasvuruKaydetIstegi seçenekleri
const MEKAN_TURU = { restoran: 'Restoran', kafe: 'Kafe', kahvalti_mekani: 'Kahvaltı Mekanı', kahve_dukkani: 'Kahve Dükkanı', pastane_tatlici: 'Pastane & Tatlıcı', sokak_lezzeti: 'Sokak Lezzeti', fine_dining: 'Fine Dining', firin_unlu_mamuller: 'Fırın & Unlu Mamuller' };
const FIYAT = { economy: '₺ · Ekonomik', mid: '₺₺ · Orta', upper: '₺₺₺ · Üst Segment' };
const HIZMET = { masada_servis: 'Masada Servis', rezervasyon: 'Rezervasyon', kahvalti_servisi: 'Kahvaltı Servisi', bahce_teras: 'Bahçe / Teras', aile_dostu: 'Aile Dostu', otopark: 'Otopark', kart_gecerli: 'Kart Geçerli', engelli_erisimi: 'Engelli Erişimi', paket_servis: 'Paket Servis', ucretsiz_wifi: 'Ücretsiz Wi-Fi', canli_muzik: 'Canlı Müzik' };
const HIZMET_TURU = { masada_servis: 'Masada Servis', paket_gel_al: 'Paket / Gel-Al' };
// DogrulamaBelgesiTuru: canlı ham değeri basıyor ("Vergi levhasi"); prototip Türkçe yazımla
const BELGE_TURU = { vergi_levhasi: 'Vergi levhası', faaliyet_belgesi: 'Faaliyet belgesi', isletme_ruhsati: 'İşletme ruhsatı', diger: 'Diğer' };

// ---- Örnek veri ----
const BASVURULAR = [
  { no: 1042, durum: 'incelemede', gorunen_ad: 'Nalia Karadeniz Mutfağı', ticari_unvan: 'Nalia Gıda Turizm Ltd. Şti.', mekan_turu: 'restoran', fiyat_seviyesi: 'mid', il: 'İstanbul', ilce: 'Kadıköy', acik_adres: 'Caferağa Mah. Moda Cad. No:42', yetkili_ad: '{{uye.ad}}', yetkili_telefon: '0532 000 00 00', isletme_eposta: 'rezervasyon@ornek-isletme.com', isletme_telefon: '0216 000 00 00', web_sitesi: 'ornek-isletme.com', instagram: '@ornekisletme', hizmetler: ['masada_servis', 'rezervasyon', 'kahvalti_servisi', 'aile_dostu'], hizmet_turleri: ['masada_servis', 'paket_gel_al'], calisma_saatleri_ozeti: 'Her gün 09.00 – 22.00', tanitim: 'Karadeniz yayla mutfağını Moda\'ya taşıyan aile işletmesi: kuymak, hamsili pilav ve taş fırında mısır ekmeği.', rezervasyon_araliklari: 'Öğle 12.00–15.00, Akşam 18.30–22.00', rezervasyon_notu: '8 kişiden büyük gruplar için bir gün önceden haber verilmesini rica ediyoruz.', notlar: '', belgeler: [['vergi_levhasi', 'nalia-vergi-levhasi.pdf', 312], ['isletme_ruhsati', 'nalia-isletme-ruhsati.jpg', 1204]] },
  { no: 987, durum: 'onaylandi', gorunen_ad: 'Mikla', ticari_unvan: 'Örnek Gıda ve Turizm A.Ş.', mekan_turu: 'fine_dining', fiyat_seviyesi: 'upper', il: 'İstanbul', ilce: 'Beyoğlu', acik_adres: 'Meşrutiyet Caddesi No:15, 34430', yetkili_ad: '{{uye.ad}}', yetkili_telefon: '0532 000 00 01', isletme_eposta: 'rezervasyon@ornek-isletme.com', isletme_telefon: '0212 000 00 01', web_sitesi: '', instagram: '', hizmetler: ['masada_servis', 'rezervasyon', 'bahce_teras', 'kart_gecerli', 'engelli_erisimi'], hizmet_turleri: ['masada_servis'], calisma_saatleri_ozeti: 'Her gün 18.00 – 00.00', tanitim: 'Anadolu\'nun mevsim ürünlerini çağdaş tekniklerle yorumlayan tadım menüsü; Beyoğlu çatısında şehir manzarası eşliğinde.', rezervasyon_araliklari: 'Akşam 18.00–22.30', rezervasyon_notu: 'Teras masaları hava durumuna göre açılır.', notlar: '', belgeler: [['vergi_levhasi', 'mikla-vergi-levhasi.pdf', 286], ['faaliyet_belgesi', 'mikla-faaliyet-belgesi.pdf', 431]] },
];
const ISLETMELER = [{ ad: 'Mikla', mekan: 1, yol: 'mekan/mikla/' }];
const TALEPLER = [
  { no: 347, durum: 'onaylandi', gonderildi: '30.10.2026', saat: '14:12', degisiklikler: { ad: 'Mikla', adres: 'The Marmara Pera, Meşrutiyet Caddesi No:15, Beyoğlu', not: 'Misafirler girişi bulmakta zorlanıyor; otel adının adres satırında görünmesini istiyoruz.' }, karar_notu: 'Adres güncellemesi onaylandı; mekân sayfasına bu hafta içinde yansır.' },
  { no: 331, durum: 'reddedildi', gonderildi: '02.10.2026', saat: '11:40', degisiklikler: { ad: 'Mikla', telefon: '0212 000 00 02' }, karar_notu: 'Numara işletme ruhsatındaki telefonla eşleşmedi. Ruhsattaki numarayla yeni talep açabilirsin.' },
  { no: 318, durum: 'uygulandi', gonderildi: '14.09.2026', saat: '09:05', degisiklikler: { ad: 'Mikla', calisma_saatleri: 'Her gün 18.00 – 00.00' }, karar_notu: '' },
];
const TALEP_ALAN = { ad: 'İşletme adı', adres: 'Adres', telefon: 'Telefon', calisma_saatleri: 'Çalışma saatleri', not: 'Not' };
const DEGERLENDIRMELER = [
  { id: 'ornek-deg-4', durum: 'inceleniyor', lezzet: 3, servis: 4, ambiyans: 4, tarih: '07.11.2026', metin: 'Porsiyonlar fiyatına göre küçük geldi; tatlı ise çok başarılıydı.' },
  { id: 'ornek-deg-1', durum: 'yayinda', lezzet: 5, servis: 5, ambiyans: 5, tarih: '03.11.2026', metin: 'Tadım menüsündeki hamsi ve kuzu tabağı unutulmazdı. Servis ekibi her tabağı anlatarak getirdi; manzarayla birlikte özel bir akşam oldu.', yanit: 'Güzel sözlerin için teşekkür ederiz. Tadım menüsünü mevsime göre yeniliyoruz; bir sonraki ziyaretinde yeni tabaklarımızı da tatmanı isteriz.' },
  { id: 'ornek-deg-2', durum: 'yayinda', lezzet: 4, servis: 3, ambiyans: 5, tarih: '28.10.2026', metin: 'Yemekler iddialı ve lezzetliydi ama ana yemek için epey bekledik. Rezervasyonda teras istememize rağmen içeride oturduk.' },
  { id: 'ornek-deg-3', durum: 'yayinda', lezzet: 5, servis: 4, ambiyans: 4, tarih: '19.10.2026', metin: 'Ekşi mayalı ekmek ve tereyağı servisi başlı başına gitme sebebi. Şarap eşleştirmesinde yapılan öneriler isabetliydi.' },
];

// ---- Kalıp parçaları ----
const kirinti = (adimlar) => `<section class="bolum kimlik-bant kabuk-alti">
  <div class="wrap kap">
    <nav class="kirinti pf-crumb" aria-label="Sayfa yolu">
      <a href="{{kok}}" class="crumb-home"><i class="fa-solid fa-house" aria-hidden="true"></i><span class="sr-only">Dada Gourmet ana sayfa</span></a>
${adimlar.map(([ad, yol], i) => `      <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>\n      ${i === adimlar.length - 1 ? `<span class="cur">${ad}</span>` : `<a href="{{kok}}${yol}">${ad}</a>`}`).join('\n')}
    </nav>
  </div>
</section>`;
const PANEL = ['İşletme Paneli', 'isletme/'];
const RAY = [
  ['yonet', 'isletme/', 'fa-solid fa-store', 'İşletmeni yönet'],
  ['degerlendirme', 'isletme/degerlendirmeler/', 'fa-solid fa-star-half-stroke', 'Değerlendirmeler'],
  ['degisiklik', 'isletme/degisiklik-talepleri/', 'fa-solid fa-pen-to-square', 'Değişiklik talepleri'],
  ['basvuru', 'isletme/basvurular/yeni/', 'fa-solid fa-plus', 'İşletme ekle'],
];
const rayi = (aktif) => ray('İşletme portalı bölümleri', RAY, aktif, 'isletme');
const rolNotu = '<div class="bilgi-notu" data-rol-notu hidden><i class="fa-solid fa-circle-info" aria-hidden="true"></i><p>Bu ekran mekân sahibi hesabına açıktır. Demo için Giriş Yap ekranında İşletme\'yi seç.</p></div>';
const bolum = (ic, ek = '') => `<div class="bolum kap"${ek}>\n  ${ic}\n</div>`;
const bag = (yol, metin, sinif = 'dugme hayalet kucuk', ikon = '') => `<a class="${sinif}" href="{{kok}}${yol}">${ikon ? `<i class="${ikon}" aria-hidden="true"></i> ` : ''}${metin}</a>`;
const durumRozet = (tablo, d) => rozet(tablo[d][0], tablo[d][1]);
const secenek = (tablo, secili, bosMetin) => (bosMetin ? `<option value="" disabled${secili ? '' : ' selected'}>${bosMetin}</option>` : '') + Object.entries(tablo).map(([k, v]) => `<option value="${k}"${k === secili ? ' selected' : ''}>${v}</option>`).join('');
const etiket = (id, ad, zorunlu, ek = '') => `<label class="alan-etiket" for="${id}">${ad} ${zorunlu === true ? '<span class="zorunlu">*</span>' : `<span class="istege-bagli">(${zorunlu || 'opsiyonel'})</span>`}${ek}</label>`;
// `sabit`: sabit hat. Prototipin telefon maskesi (assets/g/f6/telefon-maskesi.js) her type=tel alana biner ve yalnız 5'le başlayan cep
// numarası kabul eder; canlı bu alanlarda sabit hat bekliyor (0(2__) …), o yüzden girdi metin + inputmode=tel
const girdi = (id, ad, ad2, { zorunlu = false, tur = 'text', max, yer = '', deger = '', gerekli = false, sabit = false } = {}) => `<div class="alan">
          ${etiket(id, ad, zorunlu)}
          <input class="alan-girdi" type="${sabit ? 'text' : tur}"${sabit ? ' inputmode="tel" autocomplete="tel"' : ''} id="${id}" name="${ad2}" maxlength="${max}"${yer ? ` placeholder="${yer}"` : ''} value="${kac(deger)}"${gerekli ? ' required' : ''}>
        </div>`;
const kbl = (b) => `${b[1]} · ${b[2].toLocaleString('tr-TR')} KB`;

// ---- 1 · İşletmeni yönet (portal ana sayfası) + Rezervasyon talepleri ----
function anaSayfa() {
  const basvuruSatir = (b) => satir('fa-solid fa-file-signature', `${b.gorunen_ad} ${durumRozet(BASVURU_DURUM, b.durum)}`, `Başvuru #${b.no} · ${b.ticari_unvan}`, `${bag(`isletme/basvurular/${b.no}/duzenle/`, 'Başvuruyu görüntüle')}`);
  const isletmeSatir = (i) => satir('fa-solid fa-store', i.ad, 'Sahiplik', rozet(`${i.mekan} mekân`, 'olumlu'), i.yol);
  const yonet = bolum(`${bolumBas({ ikon: 'fa-solid fa-store', etiket: 'İşletme portalı', baslik: 'İşletmeni yönet', giris: 'Başvurularını, doğrulama belgelerini ve onaylanmış mekânlarını tek yerden takip et.', arac: et })}
  ${rolNotu}
  ${kart({ bas: kartBas('fa-solid fa-file-signature', 'Başvurular', 'İşletme bilgilerini gönder; ekibimiz inceleyip onayladığında mekân yönetimi açılır.'), liste: BASVURULAR.map(basvuruSatir).join(''), alt: bag('isletme/basvurular/yeni/', 'İşletme ekle', 'dugme birincil', 'fa-solid fa-plus') }).replace('<div class="fp-list">', '<div class="fp-list" data-basvuru-liste>')}
  ${kart({ bas: kartBas('fa-solid fa-circle-check', 'Onaylanmış işletmeler'), liste: ISLETMELER.map(isletmeSatir).join(''), alt: bag('isletme/degisiklik-talepleri/', 'Değişiklik talepleri', 'dugme hayalet', 'fa-solid fa-pen-to-square') })}`);
  // Rezervasyon bölümü prototipin İşletme Paneli'nden aynen; rol notu sayfa başına taşındı
  const rezervasyon = `<div class="bolum kap" data-karar-ekrani="isletme">
    <div class="bolum-bas">
        <div>
            <span class="ust-etiket"><i class="fa-solid fa-store" aria-hidden="true"></i> İşletme Paneli · Mikla</span>
            <h2>Rezervasyon talepleri</h2>
            <p class="giris-metni">Mekânına gelen masa talepleri. Onayladığın talep misafirin Rezervasyonlarım ekranına düşer; ziyaret gerçekleşince işaretle, misafirin +25 puanı kesinleşir.</p>
        </div>
        <div class="bolum-araclar"><span class="ornek-etiket">prototip örneği</span></div>
    </div>
    <div class="kart"><div class="kart-bas"><div><h3 class="kart-baslik"><i class="fa-solid fa-calendar-check" aria-hidden="true"></i> Talepler</h3><p>Bekleyenler üstte; misafir notu ve alerjen bilgisi satırda.</p></div></div><div class="fp-list" data-liste="rezervasyon"></div></div>
</div>`;
  return sayfa('isletme', 'İşletme Paneli', kirinti([['İşletme Paneli']]) + rayi('yonet') + yonet + rezervasyon, { js: ['assets/js/sayfa/karar.js', ...JS], donor: DONOR + '; rezervasyon bölümü kalıbı DadaGourmet-panel isletme/rezervasyonlar' });
}

// ---- 2 · Değerlendirmeler + yanıt ----
function degerlendirmeler() {
  const yanitFormu = (id) => `<form data-yanit-form="${id}">
      <div class="alan">
        <label class="alan-etiket" for="yanit-metin-${id}">Cevap metni</label>
        <textarea class="alan-metin" id="yanit-metin-${id}" name="metin" minlength="5" maxlength="2000" placeholder="Kısa, somut ve nazik yaz." required></textarea>
      </div>
      <button class="dugme birincil" type="submit"><i class="fa-solid fa-paper-plane" aria-hidden="true"></i> Yanıtla</button>
    </form>`;
  const yanitNotu = (metin) => `<div class="bilgi-notu"><i class="fa-solid fa-reply" aria-hidden="true"></i><p><b>İşletme yanıtın:</b> ${metin}</p></div>`;
  const kartD = (d) => `<article class="kart panel" id="${d.id}" data-degerlendirme="${d.id}">
    ${kartBas('fa-solid fa-star', 'Mikla', `Lezzet ${d.lezzet} · Servis ${d.servis} · Ambiyans ${d.ambiyans} · ${d.tarih}`, `<div class="bolum-araclar">${durumRozet(DEG_DURUM, d.durum)} ${et}</div>`)}
    <div class="kart-govde">
      <p class="okuma-notu">${d.metin}</p>
      ${d.yanit ? yanitNotu(d.yanit) : d.durum === 'yayinda' ? yanitFormu(d.id) : '<p class="alan-yardim"><i class="fa-solid fa-circle-info" aria-hidden="true"></i> <span>Yalnızca yayınlanmış (onaylanmış) değerlendirmelere yanıt yazılabilir.</span></p>'}
    </div>
  </article>`;
  const n = DEGERLENDIRMELER.length;
  const govde = bolum(`${bolumBas({ ikon: 'fa-solid fa-star-half-stroke', etiket: 'Geri bildirim', baslik: 'İşletmene gelen değerlendirmeler', giris: 'Misafirlerin yazdıkları. Cevap verebilirsin ama yazıyı değiştiremezsin.', arac: `<span class="rozet pasif" data-deg-sayi>${n} değerlendirme</span>` })}
  ${rolNotu}
  <p class="okuma-notu" role="status">Rehberde şu an <b data-deg-sayi>${n} değerlendirme</b> var.</p>
  <div data-deg-liste>
  ${DEGERLENDIRMELER.map(kartD).join('\n  ')}
  </div>`);
  return sayfa('isletme/degerlendirmeler', 'İşletmene gelen değerlendirmeler', kirinti([PANEL, ['Değerlendirmeler']]) + rayi('degerlendirme') + govde, { js: JS, donor: DONOR });
}

// ---- 3 · Değişiklik talepleri: liste, oluştur, talep ----
const DT_BAS = (baslik, giris, arac = '') => bolumBas({ ikon: 'fa-solid fa-pen-to-square', etiket: 'İşletme', baslik, giris, arac });
function talepListesi() {
  const sat = (t) => satir('fa-solid fa-pen-to-square', `Mikla ${durumRozet(TALEP_DURUM, t.durum)}`, `Gönderildi ${t.gonderildi}`, `${bag(`isletme/degisiklik-talepleri/${t.no}/`, 'Talebi gör')}`);
  const govde = bolum(`${DT_BAS('Değişiklik taleplerim', 'Mekânının adres, telefon ya da çalışma saatleri gibi bilgilerinde düzeltme istediğinde buradan talep açarsın; ekibimiz inceleyip karar verir.', `<span class="rozet pasif" data-talep-sayi>${TALEPLER.length} talep</span> ${et}`)}
  ${rolNotu}
  ${kart({ bas: kartBas('fa-solid fa-pen-to-square', 'Gönderdiklerin', 'Bir talep incelemeye alınana kadar aynı mekân için yeni talep açamazsın.'), liste: TALEPLER.map(sat).join(''), listeId: 'islDegTalep', alt: bag('isletme/degisiklik-talepleri/yeni/', 'Yeni Talep Oluştur', 'dugme birincil', 'fa-solid fa-plus') }).replace('id="islDegTalep"', 'id="islDegTalep" data-talep-liste')}`);
  return sayfa('isletme/degisiklik-talepleri', 'Değişiklik taleplerim', kirinti([PANEL, ['Değişiklik talepleri']]) + rayi('degisiklik') + govde, { js: JS, donor: DONOR });
}
function talepOlustur() {
  const alanlar = `<div class="alan">
          ${etiket('dt-mekan', 'Mekân', true)}
          <select class="alan-secim" id="dt-mekan" name="mekan_id" required>${ISLETMELER.map((i) => `<option value="${i.ad}">${i.ad}</option>`).join('')}</select>
        </div>
        ${girdi('dt-ad', 'İşletme adı', 'ad', { zorunlu: true, max: 160, yer: 'Örn. Çınaraltı Esnaf Lokantası', gerekli: true })}
        ${girdi('dt-adres', 'Adres', 'adres', { max: 255, yer: 'Örn. Moda Cad. No:12, Kadıköy' })}
        ${girdi('dt-telefon', 'Telefon', 'telefon', { sabit: true, max: 32, yer: 'Örn. 0216 000 00 00' })}
        ${girdi('dt-saat', 'Çalışma saatleri', 'calisma_saatleri', { max: 255, yer: 'Örn. Her gün 09:00–22:00' })}
        <div class="alan">
          ${etiket('dt-not', 'Not', false)}
          <textarea class="alan-metin" id="dt-not" name="not" maxlength="2000"></textarea>
        </div>`;
  const govde = bolum(`${DT_BAS('Değişiklik talebi oluştur', 'Adres, telefon ve çalışma saatleri değiştiğinde buradan talep aç; ekibimiz inceleyip uygular.')}
  ${rolNotu}
  <form class="kart panel" data-talep-form novalidate>
    ${kartBas('fa-solid fa-pen-to-square', 'İşletme bilgilerini güncelle', 'Adres, telefon ve çalışma saatleri değiştiğinde buradan güncelle.')}
    <div class="kart-govde">
        ${alanlar}
    </div>
    <div class="kart-alt form-eylem">
      ${bag('isletme/degisiklik-talepleri/', 'Vazgeç', 'dugme hayalet')}
      <button class="dugme birincil" type="submit"><i class="fa-solid fa-pen-to-square" aria-hidden="true"></i> Talebi gönder</button>
    </div>
  </form>
  <div class="alt-not"><i class="fa-solid fa-circle-info" aria-hidden="true"></i> <span>Talep gönderdikten sonra durumunu "Değişiklik taleplerim" listesinden takip edebilirsin.</span></div>`);
  return sayfa('isletme/degisiklik-talepleri/yeni', 'Değişiklik talebi oluştur', kirinti([PANEL, ['Değişiklik talepleri', 'isletme/degisiklik-talepleri/'], ['Yeni talep']]) + rayi('degisiklik') + govde, { js: JS, donor: DONOR });
}
// Talep ekranı: örnekler derlemede, bu tarayıcıda gönderilen talep `gonderilen/?t=` ile aynı kalıba betikle dolar
const talepGovde = ({ baslik, giris, durum, tarih, satirlar, not }) => bolum(`${DT_BAS(baslik, giris, durum)}
  ${rolNotu}
  <div class="kart">
    ${kartBas('fa-solid fa-pen-to-square', 'Talep ettiğin değişiklikler', tarih)}
    <div class="fp-list" data-talep-alanlar>${satirlar}</div>
    <div class="kart-govde" data-talep-not${not ? '' : ' hidden'}><p class="kart-metin">${not ? `<b>Karar notu:</b> ${not}` : ''}</p></div>
    <div class="kart-alt">${bag('isletme/degisiklik-talepleri/', 'Listeye dön', 'dugme hayalet')}</div>
  </div>`);
const alanSatir = (k, v) => satir('fa-solid fa-circle-dot', TALEP_ALAN[k] ?? k, v);
function talepGoster(t) {
  const govde = talepGovde({ baslik: `Değişiklik talebi #${t.no}`, giris: 'Mikla için gönderdiğin talebin durumu.', durum: `${durumRozet(TALEP_DURUM, t.durum)} ${et}`, tarih: `Gönderildi ${t.gonderildi} ${t.saat}`, satirlar: Object.entries(t.degisiklikler).map(([k, v]) => alanSatir(k, v)).join(''), not: t.karar_notu });
  return sayfa(`isletme/degisiklik-talepleri/${t.no}`, 'Değişiklik talebi', kirinti([PANEL, ['Değişiklik talepleri', 'isletme/degisiklik-talepleri/'], [`Talep #${t.no}`]]) + rayi('degisiklik') + govde, { js: JS, donor: DONOR });
}
function talepGonderilen() {
  const govde = talepGovde({ baslik: 'Değişiklik talebi', giris: 'Gönderdiğin talebin durumu.', durum: '<span class="rozet bekleme" data-talep-durum>Gönderildi</span>', tarih: '<span data-talep-tarih>Gönderildi</span>', satirlar: `<div class="bos-durum">
          <span class="bos-ikon"><i class="fa-solid fa-circle-dot" aria-hidden="true"></i></span>
          <h4>Bu talebe eklenmiş bir değişiklik yok</h4>
        </div>`, not: '' }).replace('<div class="bolum kap">', '<div class="bolum kap" data-talep-goster>');
  return sayfa('isletme/degisiklik-talepleri/gonderilen', 'Değişiklik talebi', kirinti([PANEL, ['Değişiklik talepleri', 'isletme/degisiklik-talepleri/'], ['Talep']]) + rayi('degisiklik') + govde, { js: JS, donor: DONOR });
}

// ---- 4 · İşletme ekle: başvuru formu (yeni ve düzenle) + doğrulama belgesi ----
function basvuruFormu(b) {
  const d = b ?? {};
  const v = (k) => d[k] ?? '';
  const kutu = (ad, tablo, secili = []) => Object.entries(tablo).map(([k, e]) => `<label class="onay-kutusu"><input type="checkbox" name="${ad}" value="${k}"${secili.includes(k) ? ' checked' : ''}> <span>${e}</span></label>`).join('\n            ');
  const duzenle = Boolean(b);
  const durumTablo = b ? BASVURU_DURUM[b.durum] : null;
  const gonderilebilir = !b || ['taslak', 'bilgi_istendi'].includes(b.durum);
  const form = `<form class="kart panel" data-basvuru-form${b ? ` data-basvuru-no="${b.no}" data-basvuru-durum="${b.durum}"` : ''} novalidate>
    <div class="form-bolum">
      <h3 class="form-bolum-bas"><i class="fa-solid fa-store" aria-hidden="true"></i> İşletme Bilgileri</h3>
      ${girdi('vaGorunenAd', 'İşletme Adı', 'gorunen_ad', { zorunlu: true, max: 160, yer: 'Örn. Nalia Karadeniz Mutfağı', deger: v('gorunen_ad'), gerekli: true })}
      ${girdi('vaTicariUnvan', 'Ticari Unvan', 'ticari_unvan', { zorunlu: true, max: 200, deger: v('ticari_unvan'), gerekli: true })}
      <div class="alan-izgara c2">
        <div class="alan">
          ${etiket('vaMekanTuru', 'İşletme Türü', true)}
          <select class="alan-secim" id="vaMekanTuru" name="mekan_turu">${secenek(MEKAN_TURU, v('mekan_turu'), 'İşletme türü seç')}</select>
        </div>
        <div class="alan">
          ${etiket('vaFiyatSeviyesi', 'Fiyat Aralığı', true)}
          <select class="alan-secim" id="vaFiyatSeviyesi" name="fiyat_seviyesi">${secenek(FIYAT, v('fiyat_seviyesi'), 'Seç')}</select>
        </div>
      </div>
      <div class="alan-izgara c2">
        ${girdi('vaIl', 'İl', 'il', { zorunlu: true, max: 80, yer: 'Örn. İstanbul', deger: v('il') })}
        ${girdi('vaIlce', 'İlçe', 'ilce', { zorunlu: true, max: 80, yer: 'Örn. Kadıköy', deger: v('ilce') })}
      </div>
      ${girdi('vaAcikAdres', 'Açık Adres', 'acik_adres', { zorunlu: true, max: 500, yer: 'Mahalle, cadde, no', deger: v('acik_adres') })}
    </div>
    <div class="form-bolum">
      <h3 class="form-bolum-bas"><i class="fa-solid fa-address-card" aria-hidden="true"></i> İletişim &amp; Yetkili</h3>
      <div class="alan-izgara c2">
        ${girdi('vaYetkiliAd', 'Yetkili Ad Soyad', 'yetkili_ad', { zorunlu: true, max: 160, yer: 'İşletme yetkilisi', deger: v('yetkili_ad') })}
        ${girdi('vaYetkiliTelefon', 'Yetkili Telefon', 'yetkili_telefon', { zorunlu: true, tur: 'tel', max: 40, yer: '0(5__) ___ __ __', deger: v('yetkili_telefon') })}
      </div>
      <div class="alan-izgara c2">
        ${girdi('vaIsletmeEposta', 'E-posta', 'isletme_eposta', { zorunlu: true, tur: 'email', max: 255, yer: 'rezervasyon@isletmen.com', deger: v('isletme_eposta') })}
        ${girdi('vaIsletmeTelefon', 'İşletme Telefonu', 'isletme_telefon', { zorunlu: true, sabit: true, max: 40, yer: '0(2__) ___ __ __', deger: v('isletme_telefon') })}
      </div>
      <div class="alan-izgara c2">
        ${girdi('vaWebSitesi', 'Web Sitesi', 'web_sitesi', { max: 255, yer: 'ornek.com', deger: v('web_sitesi') })}
        ${girdi('vaInstagram', 'Instagram', 'instagram', { max: 120, yer: '@isletmen', deger: v('instagram') })}
      </div>
      <div class="alan">
        ${etiket('vaVergiNo', 'Vergi No / İşletme Belgesi No', true)}
        <input class="alan-girdi" type="text" id="vaVergiNo" name="vergi_veya_ruhsat_no" maxlength="50" placeholder="Vergi numaran veya işletme ruhsat no" value="" aria-describedby="vaVergiNoYardim">
        <span class="alan-yardim tamam" id="vaVergiNoYardim"><i class="fa-solid fa-shield-halved" aria-hidden="true"></i> <span>Bu bilgi yalnızca işletme doğrulaması için kullanılır, profilinde gösterilmez.</span></span>
      </div>
    </div>
    <div class="form-bolum">
      <h3 class="form-bolum-bas"><i class="fa-solid fa-list-check" aria-hidden="true"></i> Hizmetler &amp; Saatler</h3>
      <div class="alan">
        <span class="alan-etiket" id="vaHizmetEtiket">Sunulan Hizmetler <span class="zorunlu">*</span> <span class="alan-sayac" data-hizmet-sayac aria-live="polite">${(d.hizmetler ?? []).length}/5 seçildi</span></span>
        <div class="alan-izgara c2" role="group" aria-labelledby="vaHizmetEtiket" data-hizmetler>
            ${kutu('hizmetler', HIZMET, d.hizmetler)}
        </div>
        <span class="alan-yardim"><i class="fa-solid fa-circle-info" aria-hidden="true"></i> <span>En fazla 5 hizmet seç — profilinde özellik etiketi olarak görünür.</span></span>
      </div>
      ${girdi('vaCalismaSaatleri', 'Çalışma Saatleri Özeti', 'calisma_saatleri_ozeti', { max: 255, yer: 'Örn. Her gün 12.00 – 23.00, Pazar kapalı', deger: v('calisma_saatleri_ozeti') })}
    </div>
    <div class="form-bolum">
      <h3 class="form-bolum-bas"><i class="fa-solid fa-bullhorn" aria-hidden="true"></i> Tanıtım &amp; Rezervasyon</h3>
      <div class="alan">
        ${etiket('vaTanitim', 'Kısa Tanıtım', true, ` <span class="alan-sayac" data-sayac-icin="vaTanitim" aria-live="polite">${v('tanitim').length}/600</span>`)}
        <textarea class="alan-metin" id="vaTanitim" name="tanitim" maxlength="600" placeholder="Mekânını, mutfağını ve atmosferini anlat — profilinde gösterilir.">${kac(v('tanitim'))}</textarea>
      </div>
      <div class="alan">
        <span class="alan-etiket" id="vaServisEtiket">Servis Türü <span class="zorunlu">*</span></span>
        <div class="alan-izgara c2" role="group" aria-labelledby="vaServisEtiket">
            ${kutu('hizmet_turleri', HIZMET_TURU, d.hizmet_turleri)}
        </div>
      </div>
      ${girdi('vaRezervasyonAraliklari', 'Rezervasyon kabul edeceğin saat dilimleri', 'rezervasyon_araliklari', { max: 255, yer: 'Örn. Öğle 12.00–15.00, Akşam 18.30–22.30', deger: v('rezervasyon_araliklari') })}
      <div class="alan">
        ${etiket('vaRezervasyonNotu', 'Rezervasyon Notu', false)}
        <textarea class="alan-metin" id="vaRezervasyonNotu" name="rezervasyon_notu" maxlength="2000" placeholder="Maks. kişi sayısı, grup kabulü, çocuk sandalyesi gibi bilgileri kısaca belirt.">${kac(v('rezervasyon_notu'))}</textarea>
      </div>
      <div class="alan">
        ${etiket('vaNotlar', 'Notlar', 'opsiyonel, ekibimize iç not')}
        <textarea class="alan-metin" id="vaNotlar" name="notlar" maxlength="5000">${kac(v('notlar'))}</textarea>
      </div>
      <div class="onay-satirlari">
        <label class="onay-kutusu" for="vaDogrulamaOnayi"><input type="checkbox" name="dogrulama_onayi" id="vaDogrulamaOnayi" value="1"${b ? ' checked' : ''}> <span>Verdiğim işletme ve belge bilgilerinin <a href="{{kok}}yasal/kvkk/" target="_blank" rel="noopener">doğrulanması</a> amacıyla işlenmesine açık rıza veriyorum.</span></label>
        <label class="onay-kutusu" for="vaKosullarOnayi"><input type="checkbox" name="kosullar_onayi" id="vaKosullarOnayi" value="1"${b ? ' checked' : ''}> <span><a href="{{kok}}yasal/kvkk/" target="_blank" rel="noopener">Aydınlatma Metni</a> ve KVKK Metni'ni okudum, onaylıyorum.</span></label>
      </div>
    </div>
    <div class="kart-alt form-eylem"><button class="dugme birincil" type="submit"><i class="fa-solid fa-floppy-disk" aria-hidden="true"></i> Taslağı kaydet</button></div>
  </form>`;
  const belgeSatir = (x) => satir('fa-solid fa-file-lines', BELGE_TURU[x[0]], `${kbl(x)} · bağlantı 5 dk geçerli`);
  const belge = `<div class="kart" data-belge-kart${duzenle ? '' : ' hidden'}>
    ${kartBas('fa-solid fa-file-shield', 'Doğrulama belgesi', 'PDF, JPG veya PNG olarak yükle; en fazla 10 MB.')}
    <div class="fp-list" data-belge-liste>${(d.belgeler ?? []).map(belgeSatir).join('')}</div>
    <form class="kart-govde" data-belge-form novalidate>
      <div class="alan-izgara c2">
        <div class="alan">
          <label class="alan-etiket" for="belgeTur">Tür</label>
          <select class="alan-secim" id="belgeTur" name="tur" required>${secenek(BELGE_TURU, 'vergi_levhasi')}</select>
        </div>
        <div class="alan">
          <span class="alan-etiket" id="belgeDosyaEtiket">Belge dosyası</span>
          <div class="alan-dosya">
            <input class="yalniz-okuyucu" type="file" id="belgeDosya" name="dosya" accept="application/pdf,image/jpeg,image/png" aria-labelledby="belgeDosyaEtiket" required>
            <label class="alan-dosya-dugme" for="belgeDosya"><i class="fa-solid fa-file-arrow-up" aria-hidden="true"></i> Belge seç</label>
            <span class="alan-dosya-ad" data-dosya-ad>PDF, JPG veya PNG — en fazla 10 MB</span>
          </div>
        </div>
      </div>
      <button class="dugme ikincil" type="submit"><i class="fa-solid fa-upload" aria-hidden="true"></i> Belgeyi yükle</button>
    </form>
    <div class="kart-alt"><button class="dugme birincil" type="button" data-basvuru-gonder${gonderilebilir ? '' : ' disabled'}><i class="fa-solid fa-paper-plane" aria-hidden="true"></i> İncelemeye gönder</button></div>
  </div>`;
  const baslik = duzenle ? 'Başvuruyu düzenle' : 'İşletmeni ekle';
  const govde = bolum(`${bolumBas({ ikon: 'fa-solid fa-store', etiket: 'İşletme portalı', baslik: `<span data-basvuru-baslik>${baslik}</span>`, giris: 'Ticari bilgileri doğru ve güncel paylaş. Taslak kaydedebilir, hazır olduğunda incelemeye gönderebilirsin.', arac: `<span data-basvuru-durum-rozet>${durumTablo ? rozet(durumTablo[0], durumTablo[1]) : ''}</span>${b ? ' ' + et : ''}` })}
  ${rolNotu}
  <div class="alan-ozet" role="alert" data-basvuru-hata><i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i><span></span></div>
  ${form}
  ${belge}`);
  const yol = b ? `isletme/basvurular/${b.no}/duzenle` : 'isletme/basvurular/yeni';
  const kir = kirinti([PANEL, [b ? `Başvuru #${b.no}` : 'İşletme ekle']]);
  return sayfa(yol, b ? 'Başvuruyu düzenle' : 'İşletme ekle', kir + rayi('basvuru') + govde, { js: JS, donor: DONOR });
}

export default function () {
  return [
    anaSayfa(),
    degerlendirmeler(),
    talepListesi(),
    talepOlustur(),
    ...TALEPLER.map(talepGoster),
    talepGonderilen(),
    basvuruFormu(null),
    ...BASVURULAR.map(basvuruFormu),
  ];
}
