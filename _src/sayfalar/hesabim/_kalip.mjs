// Üye alanı ortak kalıbı: canlı Gourmet hesap ekranlarının (DadaGourmet-acil 4eb638c, resources/views/hesap) DOM'u.
// Kimlik kartında e-posta yerine @kullanıcıadı (Gastro kanonu, Beyar 9 Kas). Örnek değerler `prototip örneği` etiketli.
// Alt çizgiyle başladığı için derleyici bunu sayfa olarak okumaz; sayfa üreteçleri içe aktarır.
export const et = '<span class="ornek-etiket">prototip örneği</span>';
export const kac = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

// Canlıdaki ortak beş kutu (hesap/_parcalar/gourmet-sayac-seridi). Toplam puan demo kayıtlarından dolar.
export const OZET = { mekan: 12, degerlendirme: 3, rota: 2, etkinlik: 4 };
export const gourmetSayac = () => `<div class="cp-stats sayac-serit" role="group" aria-label="Gourmet özetin">
  <div class="sayac"><i class="fa-solid fa-location-dot" aria-hidden="true"></i><div><span>Keşfedilen mekân</span><b>${OZET.mekan}</b></div></div>
  <div class="sayac"><i class="fa-solid fa-star" aria-hidden="true"></i><div><span>Değerlendirme</span><b>${OZET.degerlendirme}</b></div></div>
  <div class="sayac"><i class="fa-solid fa-route" aria-hidden="true"></i><div><span>Tamamlanan rota</span><b>${OZET.rota}</b></div></div>
  <div class="sayac"><i class="fa-solid fa-calendar-days" aria-hidden="true"></i><div><span>Etkinlik</span><b>${OZET.etkinlik}</b></div></div>
  <div class="sayac"><i class="fa-solid fa-coins" aria-hidden="true"></i><div><span>Toplam puan</span><b data-puan="toplam">0</b></div></div>
</div>`;

// Sayfaya özel sayaç şeridi: [[ikon, etiket, değer], …]
export const sayac = (aria, kutular) => `<div class="cp-stats sayac-serit" role="group" aria-label="${aria}">
${kutular.map(([i, e, d]) => `  <div class="sayac"><i class="${i}" aria-hidden="true"></i><div><span>${e}</span><b>${d}</b></div></div>`).join('\n')}
</div>`;

// Kimlik bandı: kırıntı, kapak, kimlik kartı, giriş cümlesi, sayaç şeridi
export const bant = ({ cur, ikon, giris, serit = '' }) => `<section class="bolum kimlik-bant kabuk-alti">
  <div class="wrap kap">
    <nav class="kirinti pf-crumb" aria-label="Sayfa yolu">
      <a href="{{kok}}" class="crumb-home"><i class="fa-solid fa-house" aria-hidden="true"></i><span class="sr-only">Dada Gourmet ana sayfa</span></a>
      <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
      <span class="cur">${cur}</span>
    </nav>
    <div class="kapak px-band" data-fit-px="" data-kayitli-kapak=""><div class="px-clip" aria-hidden="true" style="--px-r: 24px;"><div class="px-media" style="background-image:url('{{kok}}assets/o/medya/1006-800.webp')"></div></div>
      <span class="kapak-muhur"><i class="${ikon}" aria-hidden="true"></i> Dada Gourmet · kişisel alanın</span>
    </div>
    <div class="kimlik">
      <span class="kimlik-avatar harf" aria-hidden="true">{{uye.harf}}</span>
      <div class="kimlik-govde">
        <h1>{{uye.ad}} <span class="rozet dolu" data-paket=""><i class="fa-solid fa-crown" aria-hidden="true"></i> {{uye.paket}}</span></h1>
        <span class="kimlik-kullanici"><span class="fp-uad">@{{uye.kullanici}}</span></span>
        <div class="kimlik-meta">
          <span><i class="fa-solid fa-calendar-days" aria-hidden="true"></i> Üyelik başlangıcı {{uye.uyelik}}</span>
          <span data-rozet-sayi=""><i class="fa-solid fa-award" aria-hidden="true"></i> Rozet 0</span>
          ${et}
        </div>
        <p class="kimlik-giris">${giris}</p>
      </div>
    </div>
    ${serit}
  </div>
</section>`;

// Sekme rayı: canlıdaki gibi her sekme ayrı adres (<a>). [[anahtar, yol, ikon, etiket], …]; yol {{kok}}'e göre
// Sekme ikonları dolu (Gastro/Diet sekme kanonu, H2): `fa-regular` verilse de `fa-solid` basılır.
// Taşan ray kayar; kenar solması `data-scroll-fade` (canlı shared/scroll-affordance.js ölçer, solma prototip.css'te)
// `data-sekme-gecis`: sekme bağı yalnız rayın altındaki `.modul-govde`yi değiştirir, sayfa yeniden yüklenmez (H8, `assets/js/sayfa/sekme-gecis.js`)
export const doluIkon = (i) => String(i).replace(/\bfa-regular\b/g, 'fa-solid');
export const ray = (aria, sekmeler, aktif, onek) => `<div class="pf-tabbar sekme-ray">
  <div class="wrap kap">
    <nav class="sekmeler ortali" aria-label="${aria}" data-scroll-fade="" data-sekme-gecis="">
${sekmeler.map(([a, y, i, e]) => `      <a class="sekme${a === aktif ? ' aktif' : ''}" href="{{kok}}${y}" id="${onek}-tab-${a}"${a === aktif ? ' aria-current="page"' : ''}><i class="${doluIkon(i)}" aria-hidden="true"></i> ${e}</a>`).join('\n')}
    </nav>
  </div>
</div>`;

export const bolumBas = ({ ikon, etiket, baslik, giris, arac = '' }) => `<div class="bolum-bas">
    <div>
      <span class="ust-etiket"><i class="${ikon}" aria-hidden="true"></i> ${etiket}</span>
      <h2>${baslik}</h2>
      <p class="giris-metni">${giris}</p>
    </div>
    <div class="bolum-araclar">${arac}</div>
  </div>`;

export const kartBas = (ikon, baslik, giris = '', arac = '') => `<div class="kart-bas">
      <div>
        <h3 class="kart-baslik"><i class="${ikon}" aria-hidden="true"></i> ${baslik}</h3>
        ${giris ? `<p>${giris}</p>` : ''}
      </div>${arac}
    </div>`;

// Liste satırı (kalem-satiri): uç = rozet ya da düğme HTML'i. Kart içinde `.kart-govde` iç boşluğunda durur (Diet kanonu, H1):
// ikon sol çizgiye, uç sağ çizgiye yapışmaz. Uçtaki rozet ve satır düğmesi aynı yükseklikte (H3, gourmet-sapma.css)
export const satir = (ikon, ad, alt, uc = '', href = '') => {
  const b = href ? `<a href="{{kok}}${href}">${ad}</a>` : ad;
  return `<div class="kalem-satiri"><span class="ks-ikon"><i class="${ikon}" aria-hidden="true"></i></span><span class="ks-metin"><b>${b}</b><small>${alt}</small></span><span class="ks-uc">${uc}</span></div>`;
};
export const rozet = (metin, tur = 'pasif') => `<span class="rozet ${tur}">${metin}</span>`;
// Satır sonu işlem düğmesi: kanon `.satir-dugme` (Diet `kalem-satiri` ucu). Ek öznitelikler (form, data-*) `ek` ile
export const satirDugme = (metin, ek = '', ikon = '', tur = 'button') => `<button class="satir-dugme" type="${tur}"${ek ? ' ' + ek : ''}>${ikon ? `<i class="${ikon}" aria-hidden="true"></i> ` : ''}${metin}</button>`;

export const bos = (ikon, baslik, metin, bag = null) => `<div class="bos-durum">
          <span class="bos-ikon"><i class="${ikon}" aria-hidden="true"></i></span>
          <h4>${baslik}</h4>
          <p>${metin}</p>${bag ? `\n          <a class="dugme birincil" href="{{kok}}${bag[0]}"><i class="${bag[2]}" aria-hidden="true"></i> ${bag[1]}</a>` : ''}
        </div>`;

export const altNot = (metin) => `<div class="alt-not"><i class="fa-solid fa-circle-info" aria-hidden="true"></i> <span>${metin}</span></div>`;

// Tek sekmenin gövdesi: bölüm başı + kart (+ kart altı) + alt not
export const pano = ({ id, bas, kart, ek = '', not = '' }) => `<div class="fit-pane aktif" data-pane="${id}" role="region" tabindex="0">
<div class="bolum kap">
  ${bas}
  ${kart}
  ${ek}
  ${not ? altNot(not) : ''}
</div>
</div>`;

export const kart = ({ bas, liste = '', listeId = '', alt = '', govde = '' }) => `<div class="kart">
    ${bas}
    ${liste !== '' ? `<div class="kart-govde"><div class="fp-list"${listeId ? ` id="${listeId}"` : ''}>${liste}</div></div>` : ''}${govde}
    ${alt ? `<div class="kart-alt">${alt}</div>` : ''}
  </div>`;

// Basit pencere (canlıdaki `data-dm-panel` → `.fb-modal`). Gönderim prototipte yalnız bu tarayıcıya yazar.
// Canlının `mo-field`/`mo-submit` sınıfları üye zincirinde çizilmez; alanlar ve düğmeler kanon form sınıflarıyla (`alan`, `onay-eylemler`, `dugme`).
export const pencere = (id, baslik, alt, alanlar, gonder, formEk = '') => `<div class="fb-modal" id="${id}" role="dialog" aria-modal="true" aria-labelledby="${id}-bas" inert="">
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
          <button class="dugme birincil" type="submit"><i class="fa-solid fa-paper-plane" aria-hidden="true"></i> ${gonder}</button>
          <button class="dugme hayalet" type="button" data-dm-kapat="">Vazgeç</button>
        </div>
      </form>
    </div>
  </div>
</div>`;

export const panelDugme = (id, ikon, metin, sinif = 'dugme birincil') => `<button class="${sinif}" type="button" data-dm-panel="${id}" aria-haspopup="dialog" aria-expanded="false" aria-controls="${id}"><i class="${ikon}" aria-hidden="true"></i> ${metin}</button>`;

// Sayfa kaydı: build.mjs'in beklediği {yol, meta, govde}. Sekme rayı (`ray()`) olan sayfaya sekme geçişi betiği eklenir (H8)
export const SEKME_GECIS_JS = 'assets/js/sayfa/sekme-gecis.js';
// Reklam HS-SB1 (reklam-detay, 11 Kas; REKLAM-YERLESIM "Hesabım, Kaydedilenler"): yalnız üye İÇERİK sayfalarında, içerik sonunda
// şerit. Yol listesi `_src/veri/reklam-yerlesim.json` `hesap` satırıyla aynı; hesap yönetimi sayfaları (ayarlar, bildirimler, çözüm
// merkezi, ödemeler, paketler, keşif tercihleri) reklamsız, işaret almaz. İşaret <template>: kapalıyken boyanmaz, yer tutmaz
export const HS_REKLAM_YOL = /^hesabim\/(gurme-panelim|listeler|etkinlikler|rozetlerim)(\/|$)/;
export const hsIsaret = (yol) => (HS_REKLAM_YOL.test(yol) ? '<template data-rk-yer="HS-SB1" data-rk-sar></template>' : '');
export const sayfa = (yol, baslik, icerik, { js = [], donor = '', disi = '' } = {}) => ({
  yol,
  meta: { baslik, duzen: 'uye', zincir: 'hesabim', css: ['gourmet-sapma'], js: ['assets/o/assets/gourmet-public/js/shared/scroll-affordance.js', 'assets/js/sayfa/uye-alan.js', ...js, ...(icerik.includes('data-sekme-gecis=') ? [SEKME_GECIS_JS] : [])], donor: donor || 'canlı dadagourmet.com, DadaGourmet-acil 4eb638c resources/views/hesap' },
  govde: `<div class="zebra">${icerik}${hsIsaret(yol)}</div>${disi ? `\n<!--@main-disi-->\n<div class="fb-overlay" data-dm-ortu=""></div>\n${disi}` : ''}`,
});
