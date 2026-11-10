// Çözüm Merkezi: canlı /hesabim/cozum-merkezi (DadaGourmet-acil resources/views/hesap/cozum-merkezi.blade.php +
// hesap/_parcalar/destek-talep-satiri.blade.php). Canlıda dört pano aynı sayfada (`?sekme=` / `#yeni` açılış panosunu
// seçer); prototipte her sekme ayrı adres. Talep yazışması canlıda `/hesabim/cozum-merkezi/{kayit}`: aynı ekran,
// talep kartı açık — prototipte örnek talepler için birer sayfa, bu tarayıcıda açılanlar için `?talep=`.
// Durum süzgeci canlıdaki gibi `?durum=` bağı; prototipte süzmeyi sayfa betiği yapar (assets/js/sayfa/cozum-merkezi.js).
// Etiketler, durum adları ve sınıfları: CozumMerkeziEkranServisi::durumEtiketleri(), IletisimKonusu, IletisimIlgiliAlani.
// SSS konu ve soruları canlının veritabanından render edilmiş DOM'dan birebir.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bant, gourmetSayac, sayfa, et, kac } from './_kalip.mjs';
import { gastroRay, gastroPano, SEKME_CSS, SEKME_JS } from './_gastro-sekme.mjs';

const KOK = 'hesabim/cozum-merkezi';
const DURUM = {
  acik: { etiket: 'Açık talep', ikon: 'fa-solid fa-inbox', sinif: 'wait' },
  'yanit-bekleyen': { etiket: 'Yanıt bekleyen', ikon: 'fa-solid fa-reply', sinif: 'durum-hapi bekleyen' },
  cozulen: { etiket: 'Çözülen', ikon: 'fa-solid fa-circle-check', sinif: 'ok' },
  kapatilan: { etiket: 'Kapatılan', ikon: 'fa-solid fa-lock', sinif: 'kapali' },
};
const SUZGEC = [
  ['tumu', 'fa-solid fa-layer-group', 'Tümü'],
  ['acik', 'fa-solid fa-inbox', 'Açık talep'],
  ['yanit-bekleyen', 'fa-solid fa-reply', 'Yanıt bekleyen'],
  ['cozulen', 'fa-solid fa-circle-check', 'Çözülen'],
  ['kapatilan', 'fa-solid fa-lock', 'Kapatılan'],
];
// IletisimKonusu (talep formu seçenekleri, canlı DOM sırası)
const KONU = [['genel', 'Genel soru'], ['oneri', 'Öneri'], ['sikayet', 'Şikâyet'], ['icerik-istegi', 'İçerik isteği'], ['is-birligi', 'İş birliği & proje'], ['basin', 'Basın'], ['teknik-sorun', 'Teknik sorun']];
const ALAN = [['mekanlar', 'Mekânlar'], ['rotalar', 'Rotalar'], ['etkinlikler', 'Etkinlikler'], ['rehberler', 'Rehberler'], ['degerlendirmeler', 'Değerlendirmeler'], ['diger', 'Diğer']];

const AY = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const gun = (iso) => { const [y, a, g] = iso.slice(0, 10).split('-').map(Number); return `${g} ${AY[a - 1]} ${y}`; };
const saatli = (iso) => `${gun(iso)} · ${iso.slice(11, 16)}`;

// Örnek talepler (son hareket sırasıyla, canlıda da `son_hareket_at` azalan). Yazan: 'sen' | 'ekip'
const T = [
  { ref: 'c71e04ab-6d2f-4b1e-9a3c-0f4e2d8b17a5', baslik: 'Değerlendirmemdeki fotoğraf görünmüyor', konu: 'Teknik sorun', durum: 'acik', mesajlar: [
    ['sen', '2026-11-09T09:12', 'Mikla değerlendirmeme iki fotoğraf ekledim; biri mekânın sayfasında görünüyor, diğeri görünmüyor. Telefondan, Safari ile yükledim.'],
  ] },
  { ref: '5e2b8d41-0c9a-4f7e-b2d6-81a3e5c90f12', baslik: 'Rezervasyon saatini değiştirmek istiyorum', konu: 'Genel soru', durum: 'yanit-bekleyen', mesajlar: [
    ['sen', '2026-11-07T19:42', 'Mikla’da 14 Kasım 20:30 için onaylanan iki kişilik rezervasyonumu 21:00’e almak istiyorum. Onay kodu DG-4821.'],
    ['ekip', '2026-11-08T10:15', 'Merhaba, saat değişikliği isteğini Mikla’ya ilettik; mekândan yanıt gelince bu talepten haber vereceğiz. Rezervasyonun son sözü mekânda, biz onay veremiyoruz.'],
  ] },
  { ref: '9b04d3e6-7a15-4c88-a0f1-3d6c2e9b5a47', baslik: 'Lacivert’in çalışma saatleri hatalı', konu: 'İçerik isteği', durum: 'cozulen', mesajlar: [
    ['sen', '2026-11-01T22:05', 'Lacivert’in sayfasında pazartesi kapalı yazıyor ama pazartesi de açıklar, bu akşam gittim.'],
    ['ekip', '2026-11-03T11:40', 'Teşekkürler! Mekânla doğruladık, çalışma saatleri güncellendi.'],
  ] },
  { ref: '2fa8c519-e3b0-4d27-8f64-c95a1b7d0e83', baslik: 'Rota kaydederken hata alıyorum', konu: 'Teknik sorun', durum: 'kapatilan', mesajlar: [
    ['sen', '2026-10-18T14:20', 'Dada Route’ta oluşturduğum rotayı kaydet dediğimde “Bir sorun oluştu” yazıyor, rota Listelerim’e düşmüyor.'],
    ['ekip', '2026-10-20T09:30', 'Merhaba, kayıt sırasında oluşan hatayı giderdik. Tekrar dener misin?'],
    ['sen', '2026-10-21T18:02', 'Oldu, rota listeme düştü. Teşekkürler.'],
  ] },
];
const kisa = (t) => t.ref.slice(0, 8);
const hareket = (t) => t.mesajlar[t.mesajlar.length - 1][1];
const talepYolu = (t) => `${KOK}/${kisa(t)}/`;

// hesap/_parcalar/destek-talep-satiri
const talepSatiri = (t) => {
  const d = DURUM[t.durum], h = hareket(t);
  return `<a class="ayar-satir" data-durum="${t.durum}" data-no="${t.ref}" href="{{kok}}${talepYolu(t)}" data-talep="${t.ref}">
  <span class="as-ikon"><i class="${d.ikon}" aria-hidden="true"></i></span>
  <span class="as-metin">
    <b>${t.baslik}</b>
    <span><i class="fa-solid fa-hashtag" aria-hidden="true"></i> ${kisa(t).toUpperCase()} · ${t.konu} · son hareket <time datetime="${h.slice(0, 10)}">${gun(h)}</time> · ${t.mesajlar.length} mesaj</span>
  </span>
  <span class="as-eylem"><span class="pstat ${d.sinif}">${d.etiket}</span><i class="fa-solid fa-chevron-right" aria-hidden="true"></i></span>
</a>`;
};

const sayaclar = Object.fromEntries(SUZGEC.map(([k]) => [k, k === 'tumu' ? T.length : T.filter((t) => t.durum === k).length]));
const akistakiler = T.filter((t) => t.durum === 'acik' || t.durum === 'yanit-bekleyen');

// Gastro'daki gibi dört pano aynı belgede (sayfa içi sekme); canlı Gourmet'in alt yolları o panoyu açık basar
const SEKMELER = [
  ['taleplerim', 'fa-solid fa-inbox', 'Destek Taleplerim'],
  ['yeni', 'fa-solid fa-plus', 'Yeni Destek Talebi'],
  ['cozum', 'fa-solid fa-circle-question', 'Sıkça Sorulan Sorular'],
  ['oneri', 'fa-solid fa-comment-dots', 'Öneri ve Şikâyet'],
];

const ust = bant({ cur: 'Çözüm Merkezi', ikon: 'fa-solid fa-utensils', giris: 'Destek taleplerin, yeni talep açma, sıkça sorulan sorular ve öneri/şikâyet. Sekme değişir, kimlik kartın yerinde kalır.', serit: gourmetSayac() });

const hata = (id) => `<p class="alan-hata" id="${id}" hidden=""><i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i><span></span></p>`;
const yardim = (id, metin) => `<p class="alan-yardim" id="${id}"><i class="fa-solid fa-circle-info" aria-hidden="true"></i> ${metin}</p>`;
const ekAlani = (on) => `<div class="alan">
              <label class="alan-etiket" for="${on}">Ek dosya <span class="istege-bagli">(isteğe bağlı)</span></label>
              <div class="alan-dosya">
                <input class="sr-only" type="file" id="${on}" name="ek" accept="image/jpeg,image/png,image/webp,application/pdf" aria-describedby="${on}Help ${on}Err">
                <label class="alan-dosya-dugme" for="${on}"><i class="fa-solid fa-paperclip" aria-hidden="true"></i> Dosya seç</label>
                <span class="alan-dosya-ad" id="${on}Name">Dosya seçilmedi</span>
                <button type="button" class="alan-dosya-sil" id="${on}Clear" hidden="">Kaldır</button>
              </div>
              ${yardim(`${on}Help`, 'Ekran görüntüsü ya da belge: JPG, PNG, WebP veya PDF · en çok 5 MB · mesaj başına tek dosya.')}
              ${hata(`${on}Err`)}
            </div>`;

// ══ SEKME 1 · Destek Taleplerim (+ talep kartı açık hâli) ══
const yazismaSatiri = ([kim, zaman, metin]) => `<div class="ayar-satir">
              <span class="as-ikon"><i class="${kim === 'ekip' ? 'fa-solid fa-headset' : 'fa-regular fa-user'}" aria-hidden="true"></i></span>
              <span class="as-metin"><b>${kim === 'ekip' ? 'Destek ekibi' : 'Sen'}</b><span>${metin}</span></span>
              <span class="as-eylem"><time class="pstat" datetime="${zaman}">${saatli(zaman)}</time></span>
            </div>`;

const talepKarti = (t) => {
  const d = DURUM[t.durum], kapali = t.durum === 'kapatilan', h = hareket(t);
  return `<section class="bolum">
  <div class="wrap kap">
    <div class="hesap-kolonu">
      <div class="kart panel" id="tkDetay" data-talep="${t.ref}">
        <div class="kart-bas">
          <div>
            <h2 class="kart-baslik"><i class="fa-solid fa-comments"></i> ${t.baslik}</h2>
            <p><i class="fa-solid fa-hashtag" aria-hidden="true"></i> ${kisa(t).toUpperCase()} · ${t.konu} · son hareket <time datetime="${h.slice(0, 10)}">${gun(h)}</time> · ${t.mesajlar.length} mesaj</p>
          </div>
          <span class="pstat ${d.sinif}">${d.etiket}</span>
        </div>
        <div class="kart-govde" id="tkDetayOk" hidden="">
          <p class="tk-ok" role="status"><i class="fa-solid fa-circle-check" aria-hidden="true"></i><span></span></p>
        </div>
        <div class="kart-govde bosluksuz">
          <div class="ayar-liste" role="log" aria-label="${kisa(t).toUpperCase()} yazışması" id="tkYazisma">
            ${t.mesajlar.map(yazismaSatiri).join('\n            ')}
          </div>
        </div>
        <div class="kart-govde">
          <p class="alan-yardim" id="tkKapaliNot"${kapali ? '' : ' hidden=""'}><i class="fa-solid fa-lock" aria-hidden="true"></i> <span>Bu talep kapatıldı, yazışma sürdürülemiyor. Konu yeniden açılırsa <b>Yeni Destek Talebi</b> sekmesinden yeni bir talep aç.</span></p>
          ${kapali ? '' : `<form id="tkYanitForm" novalidate="">
            <div class="alan">
              <label class="alan-etiket" for="tkYanit">Yanıtın <span class="zorunlu" aria-hidden="true">*</span></label>
              <textarea class="alan-metin" id="tkYanit" name="mesaj" minlength="2" maxlength="5000" required aria-required="true" placeholder="Destek ekibine yazmak istediğin şeyi buraya yaz." aria-describedby="tkYanitErr" data-hata="Mesaj alanı zorunludur." data-hata-kisa="Mesaj en az 2 karakter olmalıdır."></textarea>
              ${hata('tkYanitErr')}
            </div>
            ${ekAlani('tkYanitEk')}
            <div class="alan-gonder">
              <p class="not">Destek ekibi hafta içi 09:00–18:00 arasında bakıyor.</p>
              <button class="dugme btn-fit" type="submit"><i class="fa-solid fa-paper-plane"></i> Yanıtı gönder</button>
            </div>
          </form>`}
        </div>
        <div class="kart-alt">
          <a class="dugme btn-fit kucuk" href="{{kok}}${KOK}/"><i class="fa-solid fa-arrow-left"></i> Taleplerime dön</a>
          ${kapali ? '' : `<form id="tkKapatForm">
            <button class="dugme btn-fit kucuk" type="submit"><i class="fa-solid fa-lock"></i> Talebi kapat</button>
          </form>`}
        </div>
      </div>
    </div>
  </div>
</section>`;
};

const taleplerim = (acik = null) => `
<section class="bolum">
  <div class="wrap kap">
    <div class="pf-tabbar hs-rail">
      <nav class="sekmeler" id="tkFilter" aria-label="Talep durumu süzgeci">
${SUZGEC.map(([k, i, e]) => `        <a class="sekme${k === 'tumu' ? ' aktif' : ''}" href="{{kok}}${KOK}/?durum=${k}" data-f="${k}"${k === 'tumu' ? ' aria-current="page"' : ''}><i class="${i}" aria-hidden="true"></i> ${e} <span class="sekme-sayi" data-c="${k}">${sayaclar[k]}</span></a>`).join('\n')}
      </nav>
    </div>
  </div>
</section>
${acik ? talepKarti(acik) : '<div id="tkDetayYuva"></div>'}
<section class="bolum" id="tkOzetBolum"${akistakiler.length ? '' : ' hidden=""'}>
  <div class="wrap kap">
    <div class="hesap-kolonu">
      <div class="kart panel" id="tkOzet">
        <div class="kart-bas">
          <div>
            <h2 class="kart-baslik"><i class="fa-solid fa-bolt"></i> Akışta kalan talepler</h2>
            <p>Açık ve yanıt bekleyen taleplerin. Bu kart sayfalanmaz.</p>
          </div>
        </div>
        <div class="kart-govde bosluksuz">
          <div class="ayar-liste" id="tkAkis">
          ${akistakiler.map(talepSatiri).join('\n          ')}
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="bolum">
  <div class="wrap kap">
    <div class="hesap-kolonu">
      <div class="kart panel">
        <div class="kart-bas">
          <div>
            <h2 class="kart-baslik" id="talepH"><i class="fa-solid fa-inbox"></i> Destek Taleplerim</h2>
            <p id="tkCount"><b>${T.length}</b> talep gösteriliyor — süzgeç: tümü.</p>
          </div>
          ${et}
        </div>
        <div class="kart-govde bosluksuz">
          <div class="ayar-liste" id="tkList">
          ${T.map(talepSatiri).join('\n          ')}
          </div>

          <div class="pnl-empty" id="tkEmptySuzgec" hidden="">
            <div class="bos-ikon"><i class="fa-solid fa-filter-circle-xmark"></i></div>
            <h4>Bu durumda talebin yok</h4>
            <p>Seçtiğin durumda görüntülenecek bir talep bulunmuyor. Başka bir duruma bakabilirsin.</p>
            <a class="dugme btn-fit kucuk" href="{{kok}}${KOK}/?durum=tumu"><i class="fa-solid fa-layer-group"></i> Tüm talepleri göster</a>
          </div>
          <div class="pnl-empty" id="tkEmptyHic"${T.length ? ' hidden=""' : ''}>
            <div class="bos-ikon"><i class="fa-solid fa-inbox"></i></div>
            <h4>Henüz destek talebin yok</h4>
            <p>Bir sorun yaşarsan ya da bir şey sormak istersen ilk talebini buradan açabilirsin.</p>
            <a class="dugme btn-fit kucuk" href="{{kok}}${KOK}/yeni/"><i class="fa-solid fa-plus"></i> Yeni destek talebi</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`;

// ══ SEKME 2 · Yeni Destek Talebi ══
const HIZLI = [
  ['konu-uyelik', 'fa-solid fa-crown', 'Üyelik, Dada Gourmet Pro ve ödeme', 'Paketini, yenileme tarihini ve ödeme kayıtlarını <a href="{{kok}}hesabim/paketlerim/">Paketlerim</a> ekranından görürsün; geçmiş tahsilatlar <a href="{{kok}}@ODEMELER@">Ödemelerim</a>de tarih ve tutarla listelenir.', 'Pro’ya geçtiğin hâlde kilitli görünen bir bölüm varsa önce çıkış yapıp tekrar gir — üyelik durumu girişte tazelenir. Kilit sürüyorsa talebi <b>Öneri</b> ya da <b>Teknik sorun</b> konusuyla aç, hangi ekranda kilit gördüğünü yaz.'],
  ['konu-program', 'fa-solid fa-list-check', 'Rotalar, listelerim ve keşif', 'Kaydettiğin rota <a href="{{kok}}hesabim/listeler/">Listelerim</a>de durur; kaydettiğin mekânlar <a href="{{kok}}@MEKANLARIM@">Mekânlarım</a>da toplanır. Henüz bir rotan yoksa <a href="{{kok}}mekan-bul/">Mekân Bul</a> birkaç soruyla seni uygun mekâna yönlendirir.', 'Seçtiğin mekân listene düşmediyse mekânın kendi sayfasındaki kaydetme düğmesini kullandığından emin ol. Eklendiği hâlde görünmüyorsa talebi <b>Teknik sorun</b> konusuyla aç, mekânın adını yaz.'],
  ['konu-etkinlik', 'fa-solid fa-calendar-days', 'Etkinlikler, rezervasyon ve bilet', 'Katılacağın ve katıldığın etkinlikler <a href="{{kok}}hesabim/etkinlikler/">Etkinliklerim</a>de; masa rezervasyonların aynı ekranın <a href="{{kok}}hesabim/gurme-panelim/">Rezervasyonlarım</a> panosunda durur.', 'Bilet satışı Dada Gourmet üzerinden yapılmıyor; biletli etkinliklerde etkinliğin sayfasındaki satış bağı seni satıcıya götürür. Rezervasyon onayın gelmediyse talebi <b>Genel soru</b> konusuyla aç ve onay kodunu yaz.'],
  ['konu-hesap', 'fa-regular fa-user', 'Hesap, giriş ve bildirimler', 'Ad, e-posta ve şifre <a href="{{kok}}hesabim/ayarlar/">Hesap Ayarları</a>nda; uygulama içi akışın <a href="{{kok}}hesabim/bildirimler/">Bildirimler</a> ekranında. Şifreni hatırlamıyorsan <a href="{{kok}}giris/">giriş sayfasındaki</a> sıfırlama bağlantısını kullan.', 'Giriş yaptığın hâlde oturumun düşüyorsa tarayıcının site verilerini temizlemesi sebep olabilir. Temizlemeyi kapattığın hâlde sürerse talebi <b>Teknik sorun</b> konusuyla aç.'],
  ['konu-veri', 'fa-solid fa-shield-heart', 'Veri, konum ve izinler', 'Hukuki çerçeve <a href="{{kok}}yasal/kvkk/">Yasal Metinler</a> altındaki KVKK Aydınlatma Metni’nde yazılı; konum tercihini üst bardaki konum düğmesinden istediğin an değiştirirsin.', 'Bir mekânın adresi, çalışma saati ya da menüsü hatalıysa veya kapanmışsa talebi <b>İçerik isteği</b> konusuyla aç; mekân önerisi için kabuğun alt menüsündeki <b>Mekân Öner</b> penceresini kullanabilirsin.'],
];
const akordeonKalem = (on, i, ikon, baslik, govde, ek = '') => `<div class="akordeon-kalem"${ek}>
        <button class="akordeon-bas" type="button" aria-expanded="false" id="${on}Head${i}" aria-controls="${on}Body${i}">
          <span class="akordeon-ikon"><i class="${ikon}" aria-hidden="true"></i></span>
          ${baslik}
          <i class="fa-solid fa-chevron-down akordeon-ok" aria-hidden="true"></i>
        </button>
        <div class="akordeon-govde" id="${on}Body${i}" role="region" aria-labelledby="${on}Head${i}">
          ${govde}
        </div>
      </div>`;

const yeni = `
<section class="tk-form-sec" id="yeni-talep">
  <div class="wrap kap">
    <div class="okuma-kolonu">

      <form class="kart form" id="tkForm" novalidate="">
        <div class="fc-head form-bas">
          <h2 id="yeniH"><i class="fa-solid fa-pen-to-square" aria-hidden="true"></i> Yeni destek talebi</h2>
          <p>Yıldız (*) ile işaretli alanlar zorunludur. Gönderdiğinde satır <b>Destek Taleplerim</b> sekmesinin en üstüne, <b>Açık talep</b> durumuyla düşer.</p>
        </div>

        <p class="fk-summary" id="tkErrSum" role="alert" hidden="">
          <i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i>
          <span>Lütfen işaretli alanları kontrol et.</span>
        </p>

        <div class="alan">
          <label class="alan-etiket" for="tkKategori">Talebin konusu <span class="zorunlu" aria-hidden="true">*</span></label>
          <select class="alan-secim" id="tkKategori" name="konu" required="" aria-required="true" aria-describedby="tkKategoriHelp tkKategoriErr" data-hata="Bir konu seç — talebin doğru ekibe düşsün.">
            <option value="" disabled="" selected="">Konu seç</option>
${KONU.map(([d, e]) => `            <option value="${d}">${kac(e)}</option>`).join('\n')}
          </select>
          ${yardim('tkKategoriHelp', 'Konu seçimi talebi yönlendirir; yanlış seçersen destek ekibi taşır.')}
          ${hata('tkKategoriErr')}
        </div>

        <div class="alan">
          <label class="alan-etiket" for="tkBaslik">Başlık <span class="zorunlu" aria-hidden="true">*</span></label>
          <input type="text" class="alan-girdi" id="tkBaslik" name="baslik" minlength="3" maxlength="160" required="" aria-required="true" placeholder="Sorunu tek cümlede özetle" aria-describedby="tkBaslikErr" data-hata="Talebin için bir başlık yaz." data-hata-kisa="Başlık en az 3 karakter olsun — listede bu satırı sen tanıyacaksın.">
          ${hata('tkBaslikErr')}
        </div>

        <div class="alan">
          <label class="alan-etiket" for="tkMesaj">Talebin <span class="zorunlu" aria-hidden="true">*</span>
            <span class="alan-sayac"><span id="tkMsgCount">0</span>/5000</span></label>
          <textarea class="alan-metin" id="tkMesaj" name="mesaj" minlength="10" maxlength="5000" required="" aria-required="true" placeholder="Ne olduğunu, ne zaman olduğunu ve hangi ekranda gördüğünü yazabilirsin." aria-describedby="tkMesajHelp tkMesajErr" data-hata="Ne olduğunu birkaç cümleyle anlat." data-hata-kisa="Talebin en az 10 karakter olsun."></textarea>
          ${yardim('tkMesajHelp', 'Hangi mekânı, hangi tarihi ve hangi ekranı kastettiğini yazarsan talep daha hızlı çözülür.')}
          ${hata('tkMesajErr')}
        </div>

        ${ekAlani('tkEk')}

        <div class="alan-gonder">
          <p class="not">Talebini gönderdikten sonra yazışmayı talebin detay sayfasından sürdürebilir, çözüldüyse talebi kapatabilirsin.</p>
          <button class="dugme btn-fit" type="submit"><i class="fa-solid fa-paper-plane"></i> Talebi gönder</button>
        </div>
      </form>

    </div>
  </div>
</section>

<section class="ds-body">
  <div class="wrap kap">
    <p class="okuma-notu"><b id="dsBaslik">Konuya göre hızlı çözümler</b> — bir konuya dokun, adımlar açılsın. Her konu, sorun sürerse formu hangi konuyla dolduracağını da söylüyor.</p>

    <div class="ds-list" id="dsList" role="group" aria-labelledby="dsBaslik">
      ${HIZLI.map(([id, ikon, b, p1, p2], i) => akordeonKalem('ds', i, ikon, b, `<p>${p1}</p>\n          <p>${p2}</p>`, ` id="${id}"`)).join('\n      ')}
    </div>

    <aside class="ipucu-kap" aria-labelledby="yardimH">
      <div class="kart ipucu">
        <h2 class="ipucu-bas" id="yardimH"><i class="fa-solid fa-lightbulb" aria-hidden="true"></i> Yanıt buralarda da olabilir</h2>
        <p class="ipucu-metin">Aynı konuda açık bir talebin varsa yenisini açma — yazışmayı oradan sürdür. Destek ekibi hafta içi 09:00–18:00 arasında bakıyor.</p>
        <div class="ipucu-baglantilar">
          <a class="ipucu-baglanti" href="{{kok}}${KOK}/cozum/"><i class="fa-solid fa-circle-question" aria-hidden="true"></i> Sık Sorulan Sorular <i class="fa-solid fa-arrow-right ok" aria-hidden="true"></i></a>
          <a class="ipucu-baglanti" href="{{kok}}@ODEMELER@"><i class="fa-solid fa-receipt" aria-hidden="true"></i> Ödeme ve fatura kayıtların <i class="fa-solid fa-arrow-right ok" aria-hidden="true"></i></a>
          <a class="ipucu-baglanti" href="{{kok}}iletisim/"><i class="fa-solid fa-envelope" aria-hidden="true"></i> İletişim kanalları <i class="fa-solid fa-arrow-right ok" aria-hidden="true"></i></a>
        </div>
      </div>
    </aside>

    <div class="bilgi-notu">
      <i class="fa-solid fa-circle-info"></i>
      <p>Destek ekibi uygulamayla ilgili konularda yardımcı olur; <b>mekân sahibi adına rezervasyon onayı veremez ve fiyat taahhüdünde bulunamaz.</b>
      Rezervasyon, ödeme ve iptal koşulları için mekânın kendisiyle iletişime geçmen gerekir.
      Ayrıntı: <a href="{{kok}}yasal/kvkk/">Yasal Metinler</a>.</p>
    </div>
  </div>
</section>`;

// ══ SEKME 3 · Sıkça Sorulan Sorular — canlı DOM'daki yayındaki konu ve sorular ══
const SSS = [
  ['mekanlar', 'fa-store', 'Mekânlar &amp; Keşif', [
    ['fa-store', 'Bir mekân listeye nasıl giriyor?', 'Mekânı önce editör ekibimiz inceler: mutfağın tutarlılığı, ortam ve fiyat-değer dengesi değerlendirilir. Ücret karşılığı listeye giriş yoktur; sponsorlu yerleşimler ayrıca işaretlenir.'],
    ['fa-clock-rotate-left', 'Mekân bilgileri ne sıklıkla güncelleniyor?', 'Adres, çalışma saati ve iletişim bilgisi kaynağından doğrulanır. Kapanan ya da taşınan mekânları kullanıcı bildirimleri ve düzenli kontrollerle güncelliyoruz.'],
    ['fa-triangle-exclamation', 'Yanlış bilgi gördüm, nasıl bildiririm?', 'Mekân sayfasındaki bilgi bildirim bağlantısını kullanabilir ya da iletişim formundan konu olarak bilgi düzeltmeyi seçebilirsin. Bildirimler doğrulama sırasına alınır.'],
  ]],
  ['rota', 'fa-route', 'Rota &amp; Planlama', [
    ['fa-route', 'Rota nasıl oluşturuluyor?', 'Başlangıç ve varış noktanı seçtiğinde güzergâh üzerindeki mekânları koridor eşleştirmesiyle çıkarıyoruz. Rotaya durak ekleyip çıkarabilir, sıralamayı değiştirebilirsin.'],
    ['fa-location-crosshairs', 'Neden bazı mekânlar rotada çıkmıyor?', 'Rota eşleştirmesi mekânın koordinat bilgisine dayanır. Koordinatı henüz girilmemiş bir mekân güzergâha aday olamaz; bu bilgiyi tamamladıkça kapsam genişliyor.'],
  ]],
  ['degerlendirme', 'fa-comments', 'Değerlendirme &amp; Editör', [
    ['fa-comments', 'Kullanıcı yorumları ile editör notu aynı şey mi?', 'Hayır. Editör değerlendirmesi ekibimizin incelemesidir; kullanıcı yorumları ziyaretçilerden gelir ve ayrı gösterilir. İkisi birbirinin yerine geçmez.'],
    ['fa-rectangle-ad', 'Sponsorlu içerik nasıl anlaşılıyor?', 'Sponsorlu mekân, rota ve etkinlikler kullanıcıya açıkça belirtilir. Sponsorluk, editör değerlendirmesinin sonucunu değiştirmez.'],
  ]],
  ['isletme', 'fa-square-plus', 'İşletme Sahipleri', [
    ['fa-square-plus', 'İşletmemi nasıl eklerim?', 'İşletmeni Ekle sayfasından başvuru gönderebilirsin. Restoran, kafe, otel, yerel üretici ve etkinlik işletmeleri başvurabilir; başvurular editör değerlendirmesine alınır.'],
    ['fa-circle-info', 'Başvuru ücretli mi?', 'Listeye giriş ücretli değildir. Reklam ve marka iş birlikleri ayrı bir süreçtir ve editoryal listelemeden bağımsız yürütülür.'],
  ]],
];
let sira = 0;
const sssKalemleri = SSS.flatMap(([k, , , sorular], ki) => sorular.map(([ikon, s, c]) => akordeonKalem('qa', sira++, `fa-solid ${ikon}`, s, `<p>${c}</p>`, ` data-kat="${k}"${ki ? ' hidden=""' : ''}`)));

const cozum = `
<section class="bolum">
<div class="faq-searchbar">
  <div class="wrap kap">
    <form class="arama faq-search" role="search" data-gonderme-yok="" aria-label="Soru ara">
      <i class="fa-solid fa-magnifying-glass"></i>
      <input id="faqSearch" type="text" placeholder="Soru ara: örn. program, rehber, Pro, izin…" aria-label="Soru ara" autocomplete="off">
      <button class="sx arama-temizle" id="faqClear" type="button" aria-label="Aramayı temizle"><i class="fa-solid fa-xmark"></i></button>
    </form>
  </div>
</div>

<div class="pf-tabbar">
  <div class="wrap kap">
    <div class="sekmeler" id="faqTabs" role="group" aria-label="Soru kategorileri">
${SSS.map(([k, ikon, ad, s], i) => `      <button class="sekme${i ? '' : ' aktif'}" type="button" data-kat="${k}" aria-pressed="${i ? 'false' : 'true'}"><i class="fa-solid ${ikon}"></i> ${ad} <span class="cnt">${s.length}</span></button>`).join('\n')}
    </div>
  </div>
</div>

</section>

<section class="faq-sec">
  <div class="wrap kap">
    <p class="okuma-notu" id="faqNote"><b>${SSS[0][2]}</b> — ${SSS[0][3].length} soru</p>
    <div class="akordeon" id="faqList">
      ${sssKalemleri.join('\n      ')}
    </div>

    <div class="faq-none" id="faqNone" role="status" hidden="">
      <span class="bos-ikon"><i class="fa-solid fa-magnifying-glass"></i></span>
      <h3>Bu aramayla eşleşen soru yok</h3>
      <p>Farklı bir kelime dene — ya da sorunu doğrudan bize ilet, cevabı SSS'ye de ekleyelim.</p>
      <button class="dugme btn-fit" type="button" data-feedback-open=""><i class="fa-solid fa-comment-dots"></i> Soru Sor</button>
    </div>
  </div>
</section>

<section class="faq-cta-sec">
  <div class="wrap kap">
    <div class="kapanis">
      <span class="kapanis-ikon"><i class="fa-solid fa-headset"></i></span>
      <h3>Cevap bulamadın mı?</h3>
      <p>Ekibimiz hafta içi 09:00–18:00 arasında yanında. Soru, öneri ya da sorun — hangisi olursa olsun bize yaz.</p>
      <div class="cc-btns">
        <a class="dugme btn-fit" href="{{kok}}iletisim/"><i class="fa-solid fa-envelope"></i> İletişime Geç</a>
        <button class="dugme hayalet" type="button" data-feedback-open=""><i class="fa-solid fa-comment-dots"></i> Görüş Bildir</button>
      </div>
    </div>
  </div>
</section>`;

// ══ SEKME 4 · Öneri ve Şikâyet ══ (canlıda onay metni sürümü yayında değilse form kapalı basılır; prototipte açık)
const oneri = `
<section class="tk-form-sec" id="oneri-sikayet">
  <div class="wrap kap">
    <div class="okuma-kolonu">
      <div class="tk-ok" id="conOk" role="status" hidden="">
        <i class="fa-solid fa-circle-check" aria-hidden="true"></i>
        <div><b>Mesajın alındı.</b> <span></span></div>
      </div>

      <form class="kart form" id="conForm" novalidate="">
        <div class="fc-head form-bas">
          <div>
            <h2 id="oneriH"><i class="fa-solid fa-comment-dots" aria-hidden="true"></i> Öneri ve Şikâyet</h2>
            <p>Yıldız (*) ile işaretli alanlar zorunludur. Cevabımız e-posta adresine gelir.</p>
          </div>
        </div>

        <!-- Kanonun .kart > .alan-izgara girintisi panel kartı içindir; form kartında alanlar kartın kendi dolgusunda kalsın diye ızgaralar sınıfsız bir kapta -->
        <div>
        <p class="fk-summary" id="conErrSum" role="alert" hidden=""><i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i><span>Lütfen işaretli alanları kontrol et.</span></p>

        <div class="alan-izgara c2">
          <div class="alan">
            <label class="alan-etiket" for="fAd">Ad <span class="zorunlu" aria-hidden="true">*</span></label>
            <input type="text" id="fAd" name="ad" class="alan-girdi" placeholder="Adın" autocomplete="given-name" maxlength="80" required="" aria-required="true" aria-describedby="eAd" value="{{uye.isim}}" data-hata="Ad alanı zorunludur.">
            ${hata('eAd')}
          </div>
          <div class="alan">
            <label class="alan-etiket" for="fSoyad">Soyad <span class="zorunlu" aria-hidden="true">*</span></label>
            <input type="text" id="fSoyad" name="soyad" class="alan-girdi" placeholder="Soyadın" autocomplete="family-name" maxlength="80" required="" aria-required="true" aria-describedby="eSoyad" value="{{uye.soyad}}" data-hata="Soyad alanı zorunludur.">
            ${hata('eSoyad')}
          </div>
        </div>

        <div class="alan-izgara c2">
          <div class="alan">
            <label class="alan-etiket" for="fMail">E-posta <span class="zorunlu" aria-hidden="true">*</span></label>
            <input type="email" id="fMail" name="eposta" class="alan-girdi" placeholder="ornek@eposta.com" autocomplete="email" maxlength="254" required="" aria-required="true" aria-describedby="eMail" value="{{uye.eposta}}" data-hata="E-posta alanı zorunludur." data-hata-bicim="E-posta geçerli bir e-posta adresi olmalıdır.">
            ${hata('eMail')}
          </div>
          <div class="alan">
            <label class="alan-etiket" for="fTel">Telefon <span class="istege-bagli">(opsiyonel)</span></label>
            <div class="alan-telefon" data-cc-kok="" data-ulke-kok="">
              <button class="alan-ulke" type="button" id="conCc" aria-haspopup="listbox" aria-expanded="false" aria-label="Ülke kodu — şu an Türkiye +90">
                <span class="alan-ulke-bayrak" aria-hidden="true">🇹🇷</span><span class="alan-ulke-kod">+90</span><i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
              </button>
              <input class="alan-girdi" id="fTel" name="telefon" type="tel" inputmode="numeric" autocomplete="tel-national" maxlength="30" placeholder="5__ ___ __ __" data-tel-mask="" aria-describedby="eTel">
              <input type="hidden" name="telefon_ulke" value="TR">
              <div class="alan-ulke-katman" role="dialog" aria-label="Ülke seç" hidden="">
                <div class="alan-ulke-arama">
                  <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
                  <input type="text" placeholder="Ülke veya kod ara" aria-label="Ülke veya kod ara" autocomplete="off">
                </div>
                <ul class="alan-ulke-liste" role="listbox" aria-label="Ülkeler" tabindex="-1"><li role="option" data-iso="TR" data-kod="+90" aria-selected="true" class="secili" tabindex="-1"><span class="bayrak" aria-hidden="true">🇹🇷</span><span class="ad">Türkiye</span><span class="kod">+90</span></li></ul>
                <p class="alan-ulke-bos" hidden="">Eşleşen ülke yok.</p>
              </div>
            </div>
            ${hata('eTel')}
          </div>
        </div>

        <div class="alan-izgara c2">
          <div class="alan">
            <label class="alan-etiket" for="conTur">Türü <span class="zorunlu" aria-hidden="true">*</span></label>
            <select class="alan-secim" id="conTur" name="konu" required="" aria-required="true" aria-describedby="eTur" data-hata="Öneri mi şikâyet mi — birini seç.">
              <option value="" disabled="" selected="">Seç</option>
              <option value="oneri">Öneri</option>
              <option value="sikayet">Şikâyet</option>
            </select>
            ${hata('eTur')}
          </div>
          <div class="alan">
            <label class="alan-etiket" for="conAlan">İlgili alan <span class="zorunlu" aria-hidden="true">*</span></label>
            <select class="alan-secim" id="conAlan" name="ilgili_alan" required="" aria-required="true" aria-describedby="hAlan eAlan" data-hata="Hangi alanla ilgili — seç ki doğru ekibe düşsün.">
              <option value="" disabled="" selected="">Seç</option>
${ALAN.map(([d, e]) => `              <option value="${d}">${e}</option>`).join('\n')}
            </select>
            <div class="alan-yardim" id="hAlan"><i class="fa-solid fa-circle-info" aria-hidden="true"></i><span>Alan seçimi mesajı ilgili ekibe yönlendirir.</span></div>
            ${hata('eAlan')}
          </div>
        </div>

        <div class="alan">
          <label class="alan-etiket" for="msgText">Mesajın <span class="zorunlu" aria-hidden="true">*</span> <span class="alan-sayac"><span id="msgCount">0</span>/1000</span></label>
          <textarea class="alan-metin" id="msgText" name="mesaj" minlength="10" maxlength="1000" placeholder="Önerini ya da şikâyetini buraya yazabilirsin" required="" aria-required="true" aria-describedby="eMsg" data-hata="Mesaj alanı zorunludur." data-hata-kisa="Mesaj en az 10 karakter olmalıdır."></textarea>
          ${hata('eMsg')}
        </div>

        <label class="onay-kutusu" for="fKvkk">
          <input type="checkbox" id="fKvkk" name="kvkk_onay" value="1" required="" aria-required="true" aria-describedby="eKvkk" data-hata="Devam etmek için aydınlatma metnini ve gizlilik politikasını onaylamalısınız.">
          <span><a href="{{kok}}yasal/kvkk/" target="_blank" rel="noopener">KVKK Aydınlatma Metni</a>'ni ve <a href="{{kok}}yasal/kvkk/" target="_blank" rel="noopener">Gizlilik Politikası</a>'nı okudum, onaylıyorum.</span>
        </label>
        ${hata('eKvkk')}

        <p class="alan-yardim" id="conCaptcha"><i class="fa-solid fa-shield-halved" aria-hidden="true"></i><span>Bu form istismara karşı hız sınırlamasıyla korunur.</span></p>

        <div class="alan-gonder">
          <p class="not">Mesajlara genellikle <b>1 iş günü</b> içinde dönüyoruz.</p>
          <button class="dugme btn-fit" id="conSubmit" type="submit"><i class="fa-solid fa-paper-plane" aria-hidden="true"></i> Gönder</button>
        </div>
        </div>
      </form>

      <div class="yonlendirme">
        <a class="yonlendirme-kalem" href="{{kok}}iletisim/">
          <span class="yonlendirme-ikon" aria-hidden="true"><i class="fa-solid fa-envelope-open-text"></i></span>
          <span class="yonlendirme-metin">
            <b>Genel iletişim konuları <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></b>
            <span>Basın, iş birliği ve reklam, üyelik, ödeme ve genel sorular için iletişim formu.</span>
          </span>
        </a>
        <button class="yonlendirme-kalem" type="button" id="fbRouteBtn" data-feedback-open="">
          <span class="yonlendirme-ikon" aria-hidden="true"><i class="fa-solid fa-comment-dots"></i></span>
          <span class="yonlendirme-metin">
            <b>Hızlı öneri ya da şikâyet <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></b>
            <span>Form doldurmadan, Görüş Bildir penceresinden iki tıkla iletebilirsin.</span>
          </span>
        </button>
      </div>
    </div>
  </div>
</section>`;

// Hızlı çözümlerdeki iki hedef başka ekiplerin ekranı: varsa ona, yoksa en yakın mevcut ekrana
const KAYNAK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const varMi = (y) => fs.existsSync(path.join(KAYNAK, y, 'index.html')) || fs.existsSync(path.join(KAYNAK, '_src/sayfalar', y + '.mjs')) || fs.existsSync(path.join(KAYNAK, '_src/sayfalar', y, 'index.html'));
const hedef = (h) => h
  .replaceAll('@ODEMELER@', varMi('hesabim/odemelerim') ? 'hesabim/odemelerim/' : 'hesabim/paketlerim/')
  .replaceAll('@MEKANLARIM@', varMi('hesabim/kaydedilenler') ? 'hesabim/kaydedilenler/' : 'hesabim/gurme-panelim/gurme-favorilerim/');

const DONOR = 'yerel Gastro /hesabim/cozum-merkezi (resources/views/turetilmis/uye/g-cozum-merkezi.blade.php, demo tohum render); içerik canlı dadagourmet.com/hesabim/cozum-merkezi, DadaGourmet-acil 4eb638c resources/views/hesap/cozum-merkezi.blade.php';
const ekran = (yol, anahtar, talep = null) => {
  const pano = { taleplerim: taleplerim(talep), yeni, cozum, oneri };
  const govde = hedef(ust + gastroRay('destek', 'Çözüm Merkezi bölümleri', SEKMELER, anahtar)
    + `<div class="modul-govde">\n${SEKMELER.map(([a]) => gastroPano('destek', a, anahtar, pano[a])).join('\n')}\n</div>`);
  const s = sayfa(yol, 'Çözüm Merkezi', govde, { js: [...SEKME_JS, 'assets/js/sayfa/cozum-merkezi.js'], donor: DONOR });
  s.meta.css = ['assets/g/kanon/gomulu/cozum-merkezi-fark.css', ...SEKME_CSS, ...s.meta.css];
  return s;
};

export default function () {
  return [
    ekran(KOK, 'taleplerim'),
    ...T.map((t) => ekran(`${KOK}/${kisa(t)}`, 'taleplerim', t)),
    ekran(`${KOK}/yeni`, 'yeni'),
    ekran(`${KOK}/cozum`, 'cozum'),
    ekran(`${KOK}/oneri`, 'oneri'),
  ];
}
