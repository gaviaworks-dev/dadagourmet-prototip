// Listelerim: canlı /hesabim/listeler (DadaGourmet-acil resources/views/hesap/listeler.blade.php). Dört sekme;
// Gastronomi Rotalarım canlıda da ayrı ekrana (Dada Route) gider. Satırlar örnek; Yeni Liste penceresi bu tarayıcıya yazar.
import { bant, sayac, ray, bolumBas, kartBas, kart, pano, satir, rozet, bos, pencere, panelDugme, sayfa, et } from './_kalip.mjs';

const GORUNUR = { ozel: 'Gizli', paylasilabilir: 'Bağlantısı olan görebilir' };
const L = [
  { ad: 'Boğaz\'da akşam yemeği', kalem: 5, aciklama: 'Mikla, Lacivert, Azur Yeniköy…', g: 'paylasilabilir', taslak: false },
  { ad: 'Urla bağ rotası', kalem: 3, aciklama: 'Levan, Narımor Urla', g: 'paylasilabilir', taslak: false },
  { ad: 'Tek başıma gidebileceğim yerler', kalem: 4, aciklama: '', g: 'ozel', taslak: false },
  { ad: 'Fethiye tatili', kalem: 2, aciklama: 'Kassandra, Mori', g: 'ozel', taslak: true },
];
const sat = (l) => satir('fa-solid fa-list', `${l.ad}`, `${l.kalem} kalem${l.aciklama ? ' · ' + l.aciklama : ''}`, rozet(GORUNUR[l.g]));

const PANO = {
  mekan: { yol: 'hesabim/listeler', pano: 'lst-mekan', ikon: 'fa-solid fa-list-ul', etiket: 'Liste', baslik: 'Mekân listelerin', giris: 'Kendi temanla mekân listeleri kur: “Kadıköy kahvaltıcıları”, “Tek başıma gidebileceğim yerler”…', birim: 'liste', kartBaslik: 'Listelerin', kartGiris: 'Bir listeye mekân eklemek ve sıralamayı değiştirmek listenin kendi ekranından yapılır.', bos: ['Henüz liste kurmadın', 'Kendi listeni kur ve paylaş — bir liste, bir şehirde ne yiyeceğini bilmeyen birine yol gösterir.', ['mekanlar/', 'Mekânlara göz at', 'fa-solid fa-location-dot']], not: 'Listelerin hesabına bağlıdır; görünürlüğü <b>Gizli</b> olan liste aramada çıkmaz.', sec: (l) => !l.taslak },
  paylasilan: { yol: 'hesabim/listeler/paylasilan', pano: 'lst-paylasilan', ikon: 'fa-solid fa-share-nodes', etiket: 'Paylaşım', baslik: 'Paylaştığın listeler', giris: 'Bağlantısı olanın görebildiği listelerin. Paylaşımı listenin kendi ekranından geri alabilirsin.', birim: 'liste', kartBaslik: 'Paylaşımların', kartGiris: 'Görünürlüğü <b>Gizli</b>ye çeken bir liste bu sekmeden düşer.', bos: ['Henüz liste paylaşmadın', 'Bir listeyi bağlantısı olanın görebileceği hâle getirdiğinde burada görünür.', ['', 'Keşfet', 'fa-solid fa-compass']], not: 'Paylaşılan listelerde kişisel veri, reklam ve alakasız içerik yayımlanmaz.', sec: (l) => !l.taslak && l.g === 'paylasilabilir' },
  taslak: { yol: 'hesabim/listeler/taslak', pano: 'lst-taslak', ikon: 'fa-regular fa-pen-to-square', etiket: 'Taslak', baslik: 'Taslak listelerin', giris: 'Kurduğun ama henüz paylaşmadığın listeler. Paylaşıma açmadan önce burada dururlar.', birim: 'taslak', kartBaslik: 'Taslakların', kartGiris: 'Taslaklar yalnız sana görünür ve aramada çıkmaz.', bos: ['Taslağın yok', 'Yeni bir liste kurduğunda ilk hâli taslak olarak burada bekler.', ['mekanlar/', 'Mekânlara göz at', 'fa-solid fa-location-dot']], not: 'Taslağı paylaşıma açmak listenin kendi ekranından yapılır.', sec: (l) => l.taslak },
};
const RAY = [
  ['lst-mekan', 'hesabim/listeler/', 'fa-solid fa-list-ul', 'Mekân Listelerim'],
  ['lst-gastro', 'dada-route/', 'fa-solid fa-route', 'Gastronomi Rotalarım'],
  ['lst-paylasilan', 'hesabim/listeler/paylasilan/', 'fa-solid fa-share-nodes', 'Paylaştığım Listeler'],
  ['lst-taslak', 'hesabim/listeler/taslak/', 'fa-regular fa-pen-to-square', 'Taslak Listeler'],
];
const serit = sayac('Listelerim özeti', [
  ['fa-solid fa-list-ul', 'Liste', L.filter(PANO.mekan.sec).length],
  ['fa-solid fa-route', 'Rota', 2],
  ['fa-solid fa-share-nodes', 'Paylaşılan', L.filter(PANO.paylasilan.sec).length],
  ['fa-regular fa-pen-to-square', 'Taslak', L.filter(PANO.taslak.sec).length],
]);
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
        </div>`, 'Listeyi oluştur', 'data-dm-ikon="fa-solid fa-list" data-dm-alt="0 kalem · {gorunurluk}" data-dm-rozet="{gorunurluk}" data-dm-mesaj="Liste oluşturuldu. Prototipte yalnız bu tarayıcıda tutulur."');

export default function () {
  return Object.values(PANO).map((p) => {
    const l = L.filter(p.sec);
    const govde = bant({ cur: 'Listelerim', ikon: 'fa-solid fa-list-ul', giris: 'Kendi listelerin ve rotaların tek yerde. Sekme değişir, kimlik kartın yerinde kalır.', serit })
      + ray('Listelerim bölümleri', RAY, p.pano, 'listelerim')
      + `<div class="modul-govde">${pano({
        id: p.pano,
        bas: bolumBas({ ikon: p.ikon, etiket: p.etiket, baslik: p.baslik, giris: p.giris, arac: `${rozet(`${l.length} ${p.birim}`)} ${et}` }),
        kart: kart({ bas: kartBas(p.ikon, p.kartBaslik, p.kartGiris), liste: l.length ? l.map(sat).join('') : bos(p.ikon, ...p.bos), listeId: '', alt: panelDugme('lstYeniPnl', 'fa-solid fa-plus', 'Yeni Liste Oluştur') }).replace('<div class="fp-list">', `<div class="fp-list"${p.pano === 'lst-mekan' ? ' data-dm-hedef="lstYeniPnl"' : ''}>`),
        not: p.not,
      })}</div>`;
    return sayfa(p.yol, 'Listelerim', govde, { disi: yeni });
  });
}
