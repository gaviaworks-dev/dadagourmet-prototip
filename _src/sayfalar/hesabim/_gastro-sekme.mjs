// Gastro üye ekranlarının sayfa içi sekme rayı (Rozetlerim, Paketlerim, Ödemelerim, Çözüm Merkezi): bütün panolar aynı
// belgede, sekme `button[role=tab]` ve `sekmeler.js` panoyu açar. Canlı Gourmet'teki alt yollar (`…/faturalar/`, `…/iade/`)
// korunur: her alt yol aynı belgeyi o panosu açık basar. Ray taşarsa kayar ve kenarı solar (`data-scroll-fade`).
// Alt çizgiyle başladığı için derleyici bunu sayfa olarak okumaz.
export const SEKME_CSS = ['shared/scroll-affordance.css'];
export const SEKME_JS = ['assets/o/assets/gourmet-public/js/shared/scroll-affordance.js', 'assets/js/sayfa/sekmeler.js'];

// [[anahtar, ikon, etiket], …]
export const gastroRay = (onek, aria, sekmeler, aktif) => `<div class="pf-tabbar sekme-ray">
  <div class="wrap kap">
    <nav class="sekmeler ortali" role="tablist" data-fit-tabs="${onek}" data-scroll-fade="" aria-label="${aria}">
${sekmeler.map(([k, i, e]) => `      <button class="sekme${k === aktif ? ' aktif' : ''}" type="button" role="tab" id="${onek}-tab-${k}" data-tab="${k}" aria-controls="${onek}-pane-${k}" aria-selected="${k === aktif}" tabindex="${k === aktif ? 0 : -1}"><i class="${i}" aria-hidden="true"></i> ${e}</button>`).join('\n')}
    </nav>
  </div>
</div>`;

// Gastro kimlik kartı (g-paketlerim, g-odemelerim, g-rozetlerim, g-hesabim, g-cozum-merkezi render'ı, 11 Kas parite):
// paket rozetinin ikonu kademenin ikonu (Gastro PaketServisi::IKON: Ücretsiz user, Pro crown, Pro Max gem); Paketlerim,
// Rozetlerim ve Ayarlar'da ardından rütbe rozeti (Gastro `data-kademe`, Gourmet merdiveninin ilk basamağı); "Üyelik
// başlangıcı" iki noktasız. Çözüm Merkezi'nde başlık üyenin adı değil sayfanın adı, rozet yok. `_kalip.bant` çıktısına uygulanır.
export const PAKET_IKON = { 'Ücretsiz': 'user', Pro: 'crown', 'Pro Max': 'gem' };
export const RUTBE_ROZET = '<span class="rozet dolu" data-kademe="merakli"><i class="fa-solid fa-heart" aria-hidden="true"></i> <span data-puan="rutbe">Meraklı</span></span>';
export const gastroKimlik = (html, { ikon = PAKET_IKON['Ücretsiz'], rutbe = false, baslik = '' } = {}) => {
  let h = html
    .replace('<i class="fa-solid fa-crown" aria-hidden="true"></i> {{uye.paket}}</span>', `<i class="fa-solid fa-${ikon}" aria-hidden="true"></i> {{uye.paket}}</span>${rutbe ? ' ' + RUTBE_ROZET : ''}`)
    .replace('Üyelik başlangıcı: ', 'Üyelik başlangıcı ');
  if (baslik) h = h.replace(/<h1>[\s\S]*?<\/h1>/, `<h1>${baslik}</h1>`);
  return h;
};

// Pano kabuğu: Gastro'daki gibi `fit-pane` + role=tabpanel; yalnız etkin olan açık
export const gastroPano = (onek, k, aktif, icerik) => `<div class="fit-pane${k === aktif ? ' aktif' : ''}" data-pane="${k}" id="${onek}-pane-${k}" role="tabpanel" aria-labelledby="${onek}-tab-${k}" tabindex="${k === aktif ? 0 : -1}"${k === aktif ? '' : ' hidden=""'}>
${icerik}
</div>`;
