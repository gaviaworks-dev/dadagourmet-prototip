// Paketlerim: canlı /hesabim/paketlerim (DadaGourmet-acil resources/views/hesap/ticaret.blade.php). Üç sekme;
// canlıda aynı sayfanın panoları, prototipte her sekme ayrı adres. Kademe ve özellik verisi canlının TEK kaynağından
// birebir: app/Ticaret/Enums/PaketKademesi.php (ad, ikon, kart sınıfı, özet, tutar, fiyat notu) ve
// app/Ticaret/Servisler/PaketOzellikMatrisi.php (8 kategori × 34 satır). Örnek üye Ücretsiz kademede.
// "Pro'a Yükselt": canlıda satış defterinde Pro satırı varsa gerçek alım formu (hesap.ticaret.store); prototipte
// aynı yerde onay penceresi açılır, ödeme bağlı değildir, yalnız bu tarayıcıya not düşer.
import { bant, gourmetSayac, ray, panelDugme, altNot, sayfa } from './_kalip.mjs';

// PaketKademesi::merdiven()
const KADEME = [
  { k: 'ucretsiz', ad: 'Ücretsiz', ikon: 'user', sinif: 't0', tutar: 0, not: null, ozet: 'Gourmet\'i keşfetmeye bugün başlamak için yeterli. Süresi dolmaz, tahsilat alınmaz.' },
  { k: 'pro', ad: 'Pro', ikon: 'bolt', sinif: 't2', tutar: 9900, not: 'Fiyat onay bekliyor', one: true, ozet: 'Mekân keşfinin, listelerin ve Dada Route\'un tamamı — düzenli dışarıda yiyen biri için.' },
  { k: 'pro-max', ad: 'Pro Max', ikon: 'gem', sinif: 't3', tutar: null, not: 'Fiyat onay bekliyor', ozet: 'Pro\'nun tamamı, üstüne sınırsız liste, sınırsız rota ve rotanı herkese açık yayınlama.' },
];
const AKTIF = 0; // örnek üye: Ücretsiz ({{uye.paket}})
const SATISTA = new Set(['pro']); // satış defteri (ticaret_paketleri): bugün yalnız Pro satın alınabilir

// PaketOzellikMatrisi::gruplar() — [ad, ücretsiz, pro, proMax]
const G = [
  ['Mekân keşfi', 'location-dot', [
    ['Mekân dizini ve detay sayfaları', true, true, true],
    ['Mutfak, semt, fiyat ve konsept süzgeçleri', true, true, true],
    ['Harita görünümü, mesafe yarıçapı ve yakınımdakiler', true, true, true],
    ['Mekân Bul sihirbazı', 'Günde 3 tur', 'Günde 25 tur', 'Sınırsız'],
    ['Şube, menü ve çalışma saati bilgisi', true, true, true],
  ]],
  ['Kaydedilenler ve listeler', 'bookmark', [
    ['Mekân, etkinlik ve gurme lezzet kaydetme', true, true, true],
    ['Listelerim', '3 liste', '25 liste', 'Sınırsız'],
    ['Ziyaret Ettiklerim defteri', 'Son 30 gün', 'Son 12 ay', 'Sınırsız'],
    ['Keşif tercihleri', 'Temel', 'Gelişmiş', 'Gelişmiş'],
  ]],
  ['Değerlendirme ve katkı', 'star', [
    ['Değerlendirme yazma ve puanlama', true, true, true],
    ['Değerlendirmeye fotoğraf ekleme', true, true, true],
    ['Mekân önerme ve bilgi hatası bildirme', true, true, true],
    ['Rozetler', 'Temel', 'Gelişmiş', 'Gelişmiş'],
  ]],
  ['Gurme Lezzetler ve şehir rehberleri', 'book-open', [
    ['Gurme Lezzetler yazıları', true, true, true],
    ['Gurme lezzet kaydetme ve kategori süzgeçleri', true, true, true],
    ['Şehir rehberleri', true, true, true],
  ]],
  ['Etkinlikler ve rezervasyon', 'calendar-days', [
    ['Etkinlik takvimi, haritası ve süzgeçleri', true, true, true],
    ['Etkinliğe kayıt ve katılım işareti', true, true, true],
    ['Etkinlik değerlendirme', true, true, true],
    ['Etkinlik önerme', true, true, true],
    ['Masa rezervasyonu', true, true, true],
  ]],
  ['Dada Route', 'route', [
    ['Hazır rotalar ve durak listeleri', true, true, true],
    ['En yakın rota', true, true, true],
    ['Kendi rotanı oluşturma', false, '5 rota', 'Sınırsız'],
    ['Durak ziyaret işaretleme ve ilerleme', false, true, true],
    ['Rotanı bağlantıyla paylaşma', false, true, true],
    ['Rotanı herkese açık yayınlama', false, false, true],
  ]],
  ['Bağlantılar', 'arrows-rotate', [
    ['DadaGastro tarif bağlantıları', true, true, true],
    ['DadaDiet ve DadaFit geçişi', true, true, true],
    ['Hesap verilerini dışa aktarma', true, true, true],
  ]],
  ['Deneyim ve destek', 'headset', [
    ['Reklam', 'Reklam var', 'Reklamsız', 'Reklamsız'],
    ['Destek', 'Standart', 'Öncelikli', 'Öncelikli'],
    ['Çözüm merkezi talepleri', true, true, true],
    ['İki adımlı doğrulama ve oturum yönetimi', true, true, true],
  ]],
];
const SATIRLAR = G.flatMap(([, , s]) => s);
const etiket = (s, d) => (typeof d === 'string' ? `${s[0]} — ${d}` : s[0]);
const acik = (i) => SATIRLAR.filter((s) => s[i + 1] !== false).map((s) => etiket(s, s[i + 1]));
const kapali = (i) => SATIRLAR.filter((s) => s[i + 1] === false).map((s) => s[0]);
const kazanim = (i) => (i === 0 ? acik(0) : SATIRLAR.filter((s) => s[i + 1] !== false && s[i + 1] !== s[i]).map((s) => etiket(s, s[i + 1])));
const para = (kurus) => '₺' + (kurus / 100).toLocaleString('tr-TR', { minimumFractionDigits: kurus % 100 ? 2 : 0, maximumFractionDigits: 2 });

const A = KADEME[AKTIF];
const SONRAKI = KADEME[AKTIF + 1];
const aktifAcik = acik(AKTIF);
const P = 'hesabim/paketlerim/';

const yukselt = (k) => panelDugme('pkYukseltPnl', 'fa-solid fa-arrow-up', `${k.ad}'a Yükselt`);

const paketim = `<div class="pk-sec" id="pkAktifSec">
            <div class="sec-head"><div>
              <span class="ust-etiket"><i class="fa-solid fa-crown" aria-hidden="true"></i> Aktif kademe</span>
              <h2>Bugün hangi paketteysen</h2>
              <p class="lead">Kademen, dönem tarihlerin ve yenileme durumun. Yükseltme buradan başlar.</p>
            </div></div>
            <div id="pkAktif">
              <div class="paket-karti">
                <div class="paket-bas">
                  <span class="paket-rozet"><i class="fa-solid fa-${A.ikon}" aria-hidden="true"></i> ${A.ad}</span>
                  <div class="paket-bilgi">
                    <b>Dada Gourmet Ücretsiz <span class="durum-hapi kapali"><i class="fa-solid fa-infinity" aria-hidden="true"></i> Süresiz</span></b>
                    <span class="paket-yenileme"><i class="fa-solid fa-infinity" aria-hidden="true"></i> Süresi dolmaz, tahsilat yapılmaz, iptal edilecek bir abonelik yok.</span>
                  </div>
                  <div class="paket-fiyat"><b>₺0</b><span>/ ay</span></div>
                </div>
                <div class="paket-govde">
                  <p class="durum-satir"><i class="fa-solid fa-infinity" aria-hidden="true"></i> <span>Ücretsiz kademede abonelik kaydı tutulmaz: dönem tarihi, yenileme ve iptal yoktur. Açık olan ${aktifAcik.length} özelliği aşağıda görürsün.</span></p>
                  <div class="paket-ozellikler">
${aktifAcik.slice(0, 8).map((o) => `                    <span><i class="fa-solid fa-check" aria-hidden="true"></i> ${o}</span>`).join('\n')}
                  </div>
                  <p class="durum-satir"><i class="fa-solid fa-list" aria-hidden="true"></i> <span>Bu kademede toplam <b>${aktifAcik.length} özellik</b> açık. Tam döküm <a href="{{kok}}${P}karsilastir/">Karşılaştırma</a> sekmesinde.</span></p>
                </div>
                <div class="paket-eylemler">
                  ${SATISTA.has(SONRAKI.k) ? yukselt(SONRAKI) : `<a class="dugme birincil" href="{{kok}}${P}kademeler/"><i class="fa-solid fa-arrow-up" aria-hidden="true"></i> ${SONRAKI.ad}'a Yükselt</a>`}
                  <a class="dugme hayalet" href="{{kok}}${P}karsilastir/"><i class="fa-solid fa-table-list" aria-hidden="true"></i> Kademeleri Karşılaştır</a>
                </div>
              </div>
            </div>
            <div class="alt-not">
              <i class="fa-solid fa-circle-info" aria-hidden="true"></i>
              <span>Tahsilatların, faturaların ve kayıtlı kartların <a href="{{kok}}hesabim/odemelerim/">Ödemelerim</a> sayfasında. Üyelik ve iptal koşullarının tamamı <a href="{{kok}}yasal/kullanim-kosullari/">Kullanım Koşulları</a>'nda; bir sorun için <a href="{{kok}}hesabim/cozum-merkezi/#taleplerim">destek talebi</a> açabilirsin.</span>
            </div>
          </div>`;

const kademeKart = (k, i) => {
  const kaz = kazanim(i), gos = kaz.slice(0, 8), kalan = kaz.length - gos.length, kap = kapali(i);
  const aktif = i === AKTIF;
  let dugme;
  if (aktif) dugme = '<button class="dugme hayalet" type="button" disabled="">Mevcut paketin</button>';
  else if (SATISTA.has(k.k)) dugme = yukselt(k);
  else if (i < AKTIF) dugme = '<button class="dugme hayalet" type="button" disabled=""><i class="fa-solid fa-circle-check" aria-hidden="true"></i> Kademen bunun üstünde</button>';
  else dugme = `<button class="dugme hayalet" type="button" disabled=""><i class="fa-solid fa-clock" aria-hidden="true"></i> ${k.not ?? 'Yakında'}</button>`;
  return `<div class="pro-card kademe-karti ${k.sinif}${aktif ? ' is-aktif aktif' : k.one ? ' featured one-cikan' : ''}">
                  ${aktif ? '<span class="pro-flag kademe-bayrak simdi"><i class="fa-solid fa-circle-check" aria-hidden="true"></i> Mevcut paketin</span>' : k.one ? '<span class="pro-flag kademe-bayrak">En popüler</span>' : ''}
                  <div class="kademe-bas"><i class="fa-solid fa-${k.ikon}" aria-hidden="true"></i><b>${k.ad}</b></div>
                  <p class="kademe-ozet">${k.ozet}</p>
                  <div class="kademe-fiyat">
                    ${k.tutar !== null ? `<b>${para(k.tutar)}</b><span>/ ay</span>` : `<b aria-hidden="true">—</b><span>${k.not}</span>`}${k.tutar !== null && k.not ? `\n                    <span class="fiyat-bayrak"><i class="fa-solid fa-clock" aria-hidden="true"></i> ${k.not}</span>` : ''}
                  </div>
                  <ul class="kademe-ozellikler">
${i > 0 ? `                    <li><i class="fa-solid fa-check" aria-hidden="true"></i> <b>${KADEME[i - 1].ad}'in tamamı</b></li>\n` : ''}${gos.map((o) => `                    <li><i class="fa-solid fa-check" aria-hidden="true"></i> ${o}</li>`).join('\n')}
                  </ul>
                  ${kalan > 0 ? `<a class="pro-daha" href="{{kok}}${P}karsilastir/">ve ${kalan} özellik daha <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>` : ''}
                  ${kap.length ? `<details class="kademe-kapali">
                    <summary>${kap.length} özellik bu kademede kapalı</summary>
                    <ul class="kademe-ozellikler">
${kap.map((o) => `                      <li class="no"><i class="fa-solid fa-xmark" aria-hidden="true"></i> ${o}</li>`).join('\n')}
                    </ul>
                  </details>` : ''}
                  ${dugme}
                </div>`;
};

const kademeler = `<div class="pk-sec">
            <div class="sec-head"><div>
              <span class="ust-etiket"><i class="fa-solid fa-layer-group" aria-hidden="true"></i> Üç kademe</span>
              <h2>Ücretsiz, Pro ve Pro Max</h2>
              <p class="lead">Ücretsiz kalıcıdır, süresi dolmaz. Pro ve Pro Max aylık aboneliktir; istediğin an yükseltir ya da bırakırsın.</p>
            </div></div>
            <div class="kademe-izgara" id="pkKartlar">
                ${KADEME.map(kademeKart).join('\n                ')}
            </div>
            <div class="alt-not">
              <i class="fa-solid fa-clock" aria-hidden="true"></i>
              <span><b>Fiyatlar onay bekliyor.</b> Buradaki tutarlar temsilîdir ve tek bir yerden (kademe verisi) okunur; ekrana sabit metin olarak yazılmaz. Pro Max için bir tutar henüz belirlenmedi, o yüzden sayı yerine durumu yazıyor.</span>
            </div>
          </div>`;

const hucre = (k, d) => `<td${k.one ? ' class="one-cikan"' : ''}>${typeof d === 'string' ? d : d ? '<i class="fa-solid fa-check var" aria-hidden="true"></i><span class="sr-only">var</span>' : '<i class="fa-solid fa-xmark yok" aria-hidden="true"></i><span class="sr-only">yok</span>'}</td>`;
const karsilastir = `<div class="pk-sec">
            <div class="sec-head"><div>
              <span class="ust-etiket"><i class="fa-solid fa-table-list" aria-hidden="true"></i> Satır satır</span>
              <h2>Hangi modül hangi kademede açık</h2>
              <p class="lead">Tablo, kademe kartlarıyla aynı veriden üretilir — iki yerde iki farklı liste olmaz.</p>
            </div></div>
            <div class="tablo-kap cerceveli" role="region" aria-label="Paket karşılaştırma tablosu" tabindex="0" id="pkTablo">
              <table class="tablo karsilastirma">
                <caption class="sr-only">Ücretsiz, Pro ve Pro Max kademelerinin özellik karşılaştırması</caption>
                <thead>
                  <tr>
                    <th scope="col">Özellik</th>
${KADEME.map((k) => `                    <th scope="col"${k.one ? ' class="one-cikan"' : ''}><span class="kademe-ad"><i class="fa-solid fa-${k.ikon}" aria-hidden="true"></i> ${k.ad}</span><span class="kademe-fiyat-not">${k.tutar !== null ? para(k.tutar) + ' / ay' : k.not}</span></th>`).join('\n')}
                  </tr>
                </thead>
                <tbody>
${G.map(([b, i, s]) => `                  <tr class="tablo-grup"><th colspan="${KADEME.length + 1}" scope="colgroup"><i class="fa-solid fa-${i}" aria-hidden="true"></i> ${b}</th></tr>\n` + s.map((r) => `                  <tr><th scope="row">${r[0]}</th>${KADEME.map((k, j) => hucre(k, r[j + 1])).join('')}</tr>`).join('\n')).join('\n')}
                </tbody>
              </table>
            </div>
            <p class="tablo-ipucu"><i class="fa-solid fa-arrows-left-right" aria-hidden="true"></i> Dar ekranda tabloyu yana kaydırarak üç kademeyi karşılaştırabilirsin.</p>
          </div>`;

const RAY = [
  ['paketim', P, 'fa-solid fa-crown', 'Mevcut Paketim'],
  ['kademeler', P + 'kademeler/', 'fa-solid fa-layer-group', 'Paket Kademeleri'],
  ['karsilastir', P + 'karsilastir/', 'fa-solid fa-table-list', 'Paket Karşılaştırma'],
];
const SEKME = { paketim: [P.slice(0, -1), paketim], kademeler: [P + 'kademeler', kademeler], karsilastir: [P + 'karsilastir', karsilastir] };

// Kart durum sınıfları canlının (`is-aktif`, `featured`) + prototip kanonundaki karşılıkları (`aktif`, `one-cikan`,
// bayrak için `kademe-bayrak`): prototipte `.pro-card`/`.pro-flag` kuralı yok, kanon aynı rolü bu sınıflarla çiziyor.
// Canlıda satış defterinde satırı olan kademe gerçek alım formunu basar; prototipte onay penceresi. Kart bilgisi istenmez.
const p = KADEME.find((k) => SATISTA.has(k.k));
// Pencere: `_kalip.pencere`in kabuğu (fb-modal · data-dm-form · data-dm-kapat, uye-alan.js sürer), ama alan ve
// düğmeleri kanonun form sınıflarıyla (alan · alan-girdi · onay-eylemler · dugme): kalıbın `mo-*` sınıflarının üye
// sayfalarında kuralı yüklü değil, o form çıplak tarayıcı denetimleriyle çiziliyor.
const formPencere = (id, baslik, alt, alanlar, ikon, gonder, formEk = '') => `<div class="fb-modal" id="${id}" role="dialog" aria-modal="true" aria-labelledby="${id}-bas" inert="">
  <div class="fb-panel">
    <div class="fb-head">
      <div>
        <h3 id="${id}-bas">${baslik}</h3>
        <p>${alt}</p>
      </div>
      <button class="fb-close" type="button" data-dm-kapat="" aria-label="Kapat"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
    </div>
    <div class="fb-body">
      <form data-dm-form="${id}"${formEk ? ' ' + formEk : ''}>
${alanlar}
        <div class="onay-eylemler ustlu">
          <button class="dugme birincil" type="submit"><i class="${ikon}" aria-hidden="true"></i> ${gonder}</button>
          <button class="dugme hayalet" type="button" data-dm-kapat="">Vazgeç</button>
        </div>
      </form>
    </div>
  </div>
</div>`;
const yukseltPnl = formPencere('pkYukseltPnl', `${p.ad}'a yükselt`, `Dada Gourmet ${p.ad} · ${para(p.tutar)} / ay. ${p.ozet}`, `        <div class="alan">
          <label class="alan-etiket" for="pkYukselt-kademe">Seçtiğin kademe</label>
          <input class="alan-girdi" type="text" id="pkYukselt-kademe" name="ad" value="Dada Gourmet ${p.ad} — ${para(p.tutar)} / ay" readonly>
        </div>
        <div class="alan">
          <label class="alan-etiket" for="pkYukselt-kod">Kampanya kodu <span class="istege-bagli">(varsa)</span></label>
          <input class="alan-girdi" type="text" id="pkYukselt-kod" name="kampanya_kodu" maxlength="64" placeholder="Örneğin: KESIF25" spellcheck="false">
        </div>
        <label class="onay-kutusu" for="pkYukselt-onay">
          <input type="checkbox" id="pkYukselt-onay" name="onay" value="1" required>
          <span><a href="{{kok}}yasal/on-bilgilendirme/">Ön bilgilendirme</a> ve <a href="{{kok}}yasal/mesafeli-satis/">mesafeli satış</a> metinlerini okudum.</span>
        </label>
        ${altNot('<b>Prototip: ödeme bağlı değil.</b> Kart bilgisi istenmez, tahsilat yapılmaz; isteğin yalnız bu tarayıcıda not edilir, kademen Ücretsiz kalır.')}`, 'fa-solid fa-arrow-up', 'Yükseltmeyi onayla', `data-dm-mesaj="${p.ad}'a yükseltme isteğin bu tarayıcıda not edildi. Prototipte ödeme bağlı değil; kademen değişmez."`);

export default function () {
  return RAY.map(([k]) => {
    const [yol, icerik] = SEKME[k];
    const govde = bant({ cur: 'Paketlerim', ikon: 'fa-solid fa-utensils', giris: 'Hangi kademedesin, üç kademe neyi açıyor, nasıl yükseltirsin. Sekme değişir, kimlik kartın yerinde kalır.', serit: gourmetSayac() })
      // canlıda kimlik rozetinin ikonu kademenin ikonu (PaketKademesi::ikonAdi)
      .replace('<i class="fa-solid fa-crown" aria-hidden="true"></i> {{uye.paket}}', `<i class="fa-solid fa-${A.ikon}" aria-hidden="true"></i> {{uye.paket}}`)
      + ray('Paketlerim bölümleri', RAY, k, 'pk')
      + `<div class="modul-govde">
  <div class="fit-pane aktif" data-pane="${k}" id="pk-pane-${k}" role="region" aria-labelledby="pk-tab-${k}" tabindex="0">
    <section class="bolum">
      <div class="wrap kap">
        <div class="okuma-kolonu">
          ${icerik}
        </div>
      </div>
    </section>
  </div>
</div>`;
    return sayfa(yol, 'Paketlerim', govde, { disi: yukseltPnl, donor: 'canlı dadagourmet.com/hesabim/paketlerim, DadaGourmet-acil 4eb638c resources/views/hesap/ticaret.blade.php · app/Ticaret/Enums/PaketKademesi.php · app/Ticaret/Servisler/PaketOzellikMatrisi.php' });
  });
}
