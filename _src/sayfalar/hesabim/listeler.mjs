// Listelerim: canlı /hesabim/listeler (DadaGourmet-acil resources/views/hesap/listeler.blade.php). Dört sekme.
// Liste alanları canlı modelden (app/Kesif/Modeller/KullaniciListesi, ListeKalemi; ListeServisi): ad, açıklama,
// görünürlük (ozel | paylasilabilir), paylaşım bağlantısı (paylas() belirteç üretir), sıralı mekân kalemleri (sira).
// Profil turu H5 (Beyar 10 Kas):
//  - Gastronomi Rotalarım artık Listelerim içinde bir sekme: Dada Route › Güzergâhlarım ile aynı kayıtlar (`window.dgRota`,
//    prototip.js; satırları listeler.js basar). Canlıda bu sekme Dada Route'a gidiyordu.
//  - Her liste satırı liste detayına açılır: hesabim/listeler/<liste>/ (mekânlar ve sırası, görünürlük, paylaşım bağlantısı).
//  - Örnek listeler prototipteki gerçek mekân kayıtlarından (DG_MEKANLAR); "Fethiye tatili" gibi bağlamsız kayıt kalktı.
import { bant, sayac, ray, bolumBas, kartBas, kart, pano, satir, rozet, satirDugme, bos, pencere, panelDugme, sayfa, et, kac } from './_kalip.mjs';

const GORUNUR = { ozel: 'Gizli', paylasilabilir: 'Bağlantısı olan görebilir' };
// Detay başlığındaki kısa durum (listeler.js aynı metni basar)
const KISA = { ozel: '<i class="fa-solid fa-lock" aria-hidden="true"></i> Gizli', paylasilabilir: '<i class="fa-solid fa-link" aria-hidden="true"></i> Paylaşımda' };
// Mekân kalemi: [slug, ad, ilçe, tür, fiyat] (DG_MEKANLAR'dan aynen)
const L = [
  { id: 'bogazda-aksam-yemegi', ad: 'Boğaz’da akşam yemeği', aciklama: 'Gün batımında Boğaz kıyısında, rezervasyonla gidilecek sofralar.', g: 'paylasilabilir', taslak: false, kod: 'b7k2q9', guncel: '3 Kasım 2026',
    kalem: [['mikla', 'Mikla', 'Beyoğlu', 'Şef Restoranı', '₺₺₺₺'], ['alaf-kurucesme', 'Alaf Kuruçeşme', 'Beşiktaş', 'Şef Restoranı', '₺₺₺'], ['bebek-balikci', 'Bebek Balıkçı', 'Beşiktaş', 'Lüks', '₺₺₺'], ['rumelihisari-iskele', 'Rumeli Hisarı İskele Restaurant', 'Sarıyer', 'Lüks', '₺₺₺'], ['lacivert-restaurant', 'Lacivert Restaurant', 'Beykoz', 'Lüks', '₺₺₺']] },
  { id: 'urlada-bag-ve-sofra', ad: 'Urla’da bağ ve sofra', aciklama: 'Bağ yolunda öğle ve akşam için bahçeli sofralar; Gastronomi Rotalarım’daki Urla bağ yolu ile birlikte.', g: 'paylasilabilir', taslak: false, kod: 'u4m8x1', guncel: '26 Ekim 2026',
    kalem: [['od-urla', 'OD Urla', 'Urla', 'Bahçeli', '₺₺₺₺'], ['levan-urla', 'Levan', 'Urla', 'Bahçeli', '₺₺₺'], ['hus-sarapcilik', 'HUS Şarapçılık', 'Urla', 'Lüks', '₺₺₺₺'], ['teruar-urla', 'Teruar Urla', 'Urla', 'Bahçeli', '₺₺₺₺']] },
  { id: 'kapadokyada-yoresel-sofralar', ad: 'Kapadokya’da yöresel sofralar', aciklama: 'Ürgüp’te testi kebabı ve yöresel mutfak için kendime not.', g: 'ozel', taslak: false, kod: '', guncel: '12 Ekim 2026',
    kalem: [['revithia', 'Revithia', 'Ürgüp', 'Yerel Lezzet Noktası', '₺₺₺₺'], ['prokopi-restaurant', 'Prokopi Restaurant', 'Ürgüp', 'Tarihi', '₺₺₺₺'], ['tandir-house-restaurant-cappadocia', 'Tandır House Restaurant Cappadocia', 'Ürgüp', 'Geleneksel', '₺₺₺₺']] },
  { id: 'bodrumda-sef-restoranlari', ad: 'Bodrum’da şef restoranları', aciklama: 'Yaz için hazırlanıyor; paylaşmadan önce sırayı netleştireceğim.', g: 'ozel', taslak: true, kod: '', guncel: '8 Kasım 2026',
    kalem: [['macakizi-restaurant-bodrum', 'Maçakızı Restaurant', 'Bodrum', 'Şef Restoranı', '₺₺₺₺'], ['kitchen-osman-sezener', 'KITCHEN by Osman Sezener', 'Bodrum', 'Şef Restoranı', '₺₺₺₺'], ['mezra-yalikavak', 'Mezra Yalıkavak', 'Bodrum', 'Şef Restoranı', '₺₺₺₺']] },
];
const ROTA_ORNEK_SAYI = 3; // prototip.js ROTA_ORNEK; listeler.js tarayıcıdaki gerçek sayıyla günceller
const ozetMekan = (l) => l.kalem.slice(0, 3).map((k) => k[1]).join(', ') + (l.kalem.length > 3 ? '…' : '');
// Satırın tamamı detaya açılır (başlık bağı satırı kaplar, `.tiklanir`); uçta görünürlük rozeti ve ok
const sat = (l) => satir('fa-solid fa-list', kac(l.ad), `${l.kalem.length} mekân · ${kac(ozetMekan(l))}`, `${rozet(GORUNUR[l.g])}<i class="fa-solid fa-chevron-right ks-ok" aria-hidden="true"></i>`, `hesabim/listeler/${l.id}/`).replace('class="kalem-satiri"', 'class="kalem-satiri tiklanir"');

const PANO = {
  mekan: { yol: 'hesabim/listeler', pano: 'lst-mekan', ikon: 'fa-solid fa-list-ul', etiket: 'Liste', baslik: 'Mekân listelerin', giris: 'Kendi temanla mekân listeleri kur: “Kadıköy kahvaltıcıları”, “Boğaz’da akşam yemeği”…', birim: 'liste', kartBaslik: 'Listelerin', kartGiris: 'Bir listeyi açınca mekânlarını, sırasını, görünürlüğünü ve paylaşım bağlantısını yönetirsin.', bos: ['Henüz liste kurmadın', 'Kendi listeni kur ve paylaş: bir liste, bir şehirde ne yiyeceğini bilmeyen birine yol gösterir.', ['mekanlar/', 'Mekânlara göz at', 'fa-solid fa-location-dot']], not: 'Listelerin hesabına bağlıdır; görünürlüğü <b>Gizli</b> olan liste aramada çıkmaz.', sec: (l) => !l.taslak },
  paylasilan: { yol: 'hesabim/listeler/paylasilan', pano: 'lst-paylasilan', ikon: 'fa-solid fa-share-nodes', etiket: 'Paylaşım', baslik: 'Paylaştığın listeler', giris: 'Bağlantısı olanın görebildiği listelerin. Bir listeyi açıp bağlantısını kopyalayabilir ya da paylaşımı kapatabilirsin.', birim: 'liste', kartBaslik: 'Paylaşımların', kartGiris: 'Görünürlüğü <b>Gizli</b>ye çeken bir liste bu sekmeden düşer.', bos: ['Henüz liste paylaşmadın', 'Bir listeyi bağlantısı olanın görebileceği hâle getirdiğinde burada görünür.', ['hesabim/listeler/', 'Listelerime dön', 'fa-solid fa-list-ul']], not: 'Paylaşılan listelerde kişisel veri, reklam ve alakasız içerik yayımlanmaz.', sec: (l) => !l.taslak && l.g === 'paylasilabilir' },
  taslak: { yol: 'hesabim/listeler/taslak', pano: 'lst-taslak', ikon: 'fa-solid fa-pen-to-square', etiket: 'Taslak', baslik: 'Taslak listelerin', giris: 'Kurduğun ama henüz paylaşmadığın listeler. Paylaşıma açmadan önce burada dururlar.', birim: 'taslak', kartBaslik: 'Taslakların', kartGiris: 'Taslaklar yalnız sana görünür ve aramada çıkmaz.', bos: ['Taslağın yok', 'Yeni bir liste kurduğunda ilk hâli taslak olarak burada bekler.', ['mekanlar/', 'Mekânlara göz at', 'fa-solid fa-location-dot']], not: 'Taslağı paylaşıma açmak listenin kendi ekranından yapılır.', sec: (l) => l.taslak },
};
const RAY = [
  ['lst-mekan', 'hesabim/listeler/', 'fa-solid fa-list-ul', 'Mekân Listelerim'],
  ['lst-gastro', 'hesabim/listeler/rotalar/', 'fa-solid fa-route', 'Gastronomi Rotalarım'],
  ['lst-paylasilan', 'hesabim/listeler/paylasilan/', 'fa-solid fa-share-nodes', 'Paylaştığım Listeler'],
  ['lst-taslak', 'hesabim/listeler/taslak/', 'fa-solid fa-pen-to-square', 'Taslak Listeler'],
];
const serit = sayac('Listelerim özeti', [
  ['fa-solid fa-list-ul', 'Liste', L.filter(PANO.mekan.sec).length],
  ['fa-solid fa-route', 'Rota', ROTA_ORNEK_SAYI],
  ['fa-solid fa-share-nodes', 'Paylaşılan', L.filter(PANO.paylasilan.sec).length],
  ['fa-solid fa-pen-to-square', 'Taslak', L.filter(PANO.taslak.sec).length],
]).replace(`<span>Rota</span><b>${ROTA_ORNEK_SAYI}</b>`, `<span>Rota</span><b data-rota-sayi="">${ROTA_ORNEK_SAYI}</b>`);
const giris = 'Kendi listelerin ve rotaların tek yerde. Sekme değişir, kimlik kartın yerinde kalır.';
const yeni = pencere('lstYeniPnl', 'Yeni liste oluştur', 'Listeye bir ad ve görünürlük seç.', `        <div class="alan">
          <label class="alan-etiket" for="lstYeni-ad">Liste adı <span class="zorunlu">*</span></label>
          <input class="alan-girdi" type="text" id="lstYeni-ad" name="ad" maxlength="120" placeholder="Örn. Kadıköy kahvaltıcıları" required>
        </div>
        <div class="alan">
          <label class="alan-etiket" for="lstYeni-gorunurluk">Görünürlük <span class="zorunlu">*</span></label>
          <select class="alan-secim" id="lstYeni-gorunurluk" name="gorunurluk" required>
            <option value="ozel" selected>Gizli — yalnız ben</option>
            <option value="paylasilabilir">Bağlantısı olan görebilir</option>
          </select>
        </div>
        <div class="alan">
          <label class="alan-etiket" for="lstYeni-aciklama">Açıklama <span class="istege-bagli">(opsiyonel)</span></label>
          <textarea class="alan-metin" id="lstYeni-aciklama" name="aciklama" maxlength="1000" placeholder="Bu liste kimin için, neyi topluyor?"></textarea>
        </div>`, 'Listeyi oluştur', 'data-dm-ikon="fa-solid fa-list" data-dm-alt="0 mekân · {gorunurluk}" data-dm-rozet="{gorunurluk}" data-dm-mesaj="Liste oluşturuldu. Prototipte yalnız bu tarayıcıda tutulur."');
const JS = { js: ['assets/js/sayfa/listeler.js'] };
const ust = (aktif) => bant({ cur: 'Listelerim', ikon: 'fa-solid fa-list-ul', giris, serit }) + ray('Listelerim bölümleri', RAY, aktif, 'listelerim');

// Sekme sayfaları (Mekân Listelerim, Paylaştığım, Taslak)
const sekmeSayfalari = () => Object.values(PANO).map((p) => {
  const l = L.filter(p.sec);
  const govde = ust(p.pano) + `<div class="modul-govde">${pano({
    id: p.pano,
    bas: bolumBas({ ikon: p.ikon, etiket: p.etiket, baslik: p.baslik, giris: p.giris, arac: `${rozet(`${l.length} ${p.birim}`)} ${et}` }),
    kart: kart({ bas: kartBas(p.ikon, p.kartBaslik, p.kartGiris), liste: l.length ? l.map(sat).join('') : bos(p.ikon, ...p.bos), alt: panelDugme('lstYeniPnl', 'fa-solid fa-plus', 'Yeni Liste Oluştur') }).replace('<div class="fp-list">', `<div class="fp-list"${p.pano === 'lst-mekan' ? ' data-dm-hedef="lstYeniPnl"' : ''}>`),
    not: p.not,
  })}</div>`;
  return sayfa(p.yol, 'Listelerim', govde, { disi: yeni, ...JS });
});

// Gastronomi Rotalarım: satırlar tarayıcıda `dgRota` deposundan (Dada Route › Güzergâhlarım ile aynı kayıtlar)
const rotaSayfasi = () => {
  const govde = ust('lst-gastro') + `<div class="modul-govde">${pano({
    id: 'lst-gastro',
    bas: bolumBas({ ikon: 'fa-solid fa-route', etiket: 'Rota', baslik: 'Gastronomi rotaların', giris: 'Dada Route’ta kaydettiğin güzergâhlar. Bir rotayı açınca duraklarıyla haritada yeniden kurulur.', arac: `<span class="rozet pasif" data-rota-rozet="">${ROTA_ORNEK_SAYI} rota</span> ${et}` }),
    kart: kart({ bas: kartBas('fa-solid fa-route', 'Kayıtlı güzergâhların', 'Dada Route › <b>Güzergâhlarım</b> ile aynı liste: orada kaydettiğin rota burada da görünür.'), liste: `<div class="bos-durum" data-rota-yukleniyor=""><span class="bos-ikon"><i class="fa-solid fa-route" aria-hidden="true"></i></span><h4>Rotaların yükleniyor</h4><p>Kayıtlı güzergâhlar bu tarayıcıdan okunur.</p></div>`, listeId: 'lstRotalar', alt: `<a class="dugme birincil" href="{{kok}}dada-route/"><i class="fa-solid fa-plus" aria-hidden="true"></i> Dada Route’ta rota kur</a>` }),
    not: 'Rota kurmak giriş istemez; kaydetmek hesabına bağlıdır. Prototipte kayıtlar yalnız bu tarayıcıda tutulur.',
  })}</div>`;
  return sayfa('hesabim/listeler/rotalar', 'Gastronomi Rotalarım · Listelerim', govde, JS);
};

// Liste detayı: mekânlar (sıra), görünürlük, paylaşım bağlantısı
const detaySayfasi = (l) => {
  const aktif = l.taslak ? 'lst-taslak' : l.g === 'paylasilabilir' ? 'lst-paylasilan' : 'lst-mekan';
  const kalemler = l.kalem.map(([slug, ad, ilce, tur, fiyat], i) => `<div class="kalem-satiri" data-kalem="${slug}"><span class="ks-ikon ks-sira" aria-hidden="true">${i + 1}</span><span class="ks-metin"><b><a href="{{kok}}mekan/${slug}/">${kac(ad)}</a></b><small>${[tur, ilce, fiyat].filter(Boolean).map(kac).join(' · ')}</small></span><span class="ks-uc">${satirDugme('', `data-sira="yukari" aria-label="${kac(ad)}: yukarı taşı"`, 'fa-solid fa-arrow-up')}${satirDugme('', `data-sira="asagi" aria-label="${kac(ad)}: aşağı taşı"`, 'fa-solid fa-arrow-down')}${satirDugme('Çıkar', `data-kalem-cikar="" aria-label="${kac(ad)}: listeden çıkar"`, 'fa-solid fa-xmark')}</span></div>`).join('');
  const bag = `https://dadagourmet.com/liste/${l.kod || 'yeni-baglanti'}`;
  const secim = (deger, ikon, baslik, metin) => `<label class="ayar-satir secim-satir"><span class="as-ikon"><i class="${ikon}" aria-hidden="true"></i></span><span class="as-metin"><b>${baslik}</b><span>${metin}</span></span><input class="secim-radyo" type="radio" name="gorunurluk" value="${deger}"${l.g === deger ? ' checked' : ''}></label>`;
  const paylasim = `<div class="kart" data-liste-paylasim="">
    ${kartBas('fa-solid fa-eye', 'Görünürlük ve paylaşım', 'Gizli liste yalnız sana görünür. Bağlantısı olan görebilir dediğinde bir paylaşım bağlantısı üretilir.')}
    <div class="kart-govde">
      <div class="fp-list" role="radiogroup" aria-label="Liste görünürlüğü">
        ${secim('ozel', 'fa-solid fa-lock', 'Gizli', 'Yalnız sen görürsün; aramada çıkmaz')}
        ${secim('paylasilabilir', 'fa-solid fa-link', 'Bağlantısı olan görebilir', 'Bağlantıyı gönderdiğin kişi listeyi açar')}
      </div>
      <div class="alan liste-bag" data-liste-bag=""${l.g === 'paylasilabilir' ? '' : ' hidden'}>
        <label class="alan-etiket" for="lstBag-${l.id}">Paylaşım bağlantısı ${et}</label>
        <div class="liste-bag-satir"><input class="alan-girdi" id="lstBag-${l.id}" type="text" readonly value="${bag}" data-bag-ornek="https://dadagourmet.com/liste/"><button class="dugme hayalet kucuk" type="button" data-bag-kopyala=""><i class="fa-solid fa-copy" aria-hidden="true"></i> Bağlantıyı kopyala</button></div>
        <p class="alan-yardim">Paylaşımı kapatmak için Gizli seçeneğini işaretle; eski bağlantı artık açılmaz.</p>
      </div>
    </div>
  </div>`;
  const govde = ust(aktif).replace('<span class="cur">Listelerim</span>', `<a href="{{kok}}hesabim/listeler/">Listelerim</a> <i class="fa-solid fa-chevron-right" aria-hidden="true"></i> <span class="cur">${kac(l.ad)}</span>`) + `<div class="modul-govde">${pano({
    id: 'lst-detay',
    bas: bolumBas({ ikon: 'fa-solid fa-list', etiket: l.taslak ? 'Taslak liste' : 'Liste', baslik: kac(l.ad), giris: kac(l.aciklama), arac: `${rozet(KISA[l.g]).replace('class="rozet', 'data-liste-rozet="" class="rozet ikonlu')} ${et}` }),
    kart: kart({ bas: kartBas('fa-solid fa-utensils', `Mekânlar <span class="sekme-sayi" data-kalem-sayi="">${l.kalem.length}</span>`, `Sıra, listeyi açan herkes için aynıdır. Son düzenleme: ${l.guncel}.`), liste: kalemler, listeId: `lstKalem-${l.id}`, alt: `<a class="dugme hayalet" href="{{kok}}mekanlar/"><i class="fa-solid fa-plus" aria-hidden="true"></i> Mekân ekle</a>` }),
    ek: paylasim,
    not: 'Mekân eklemek mekânın kendi sayfasındaki <b>Listeye ekle</b> ile yapılır. Prototipte sıra, çıkarma ve görünürlük yalnız bu tarayıcıda tutulur.',
  }).replace('data-pane="lst-detay"', `data-pane="lst-detay" data-liste="${l.id}"`)}</div>`;
  return sayfa(`hesabim/listeler/${l.id}`, `${l.ad} · Listelerim`, govde, JS);
};

export default function () {
  return [...sekmeSayfalari(), rotaSayfasi(), ...L.map(detaySayfasi)];
}
