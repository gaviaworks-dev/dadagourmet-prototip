// İşletme Paneli: mekân sahibinin kendi mekânını yönettiği panel (F1, 10 Kas). Kabuk ve bileşenler Gastro/Diet panel kanonu
// (`_src/kabuk/panel.mjs`; ekran kalıpları dadadiet-prototip `_src/sayfalar/panel-a`, `panel-b` render'ı). Eski işletme portalı
// (canlı /isletme: başvurular, değişiklik talepleri, değerlendirmeler, rezervasyon talepleri) bu panelin bölümlerine taşındı, yollar aynı kaldı.
// Listeler istemcide bu tarayıcının demo durumundan çizilir (`assets/js/sayfa/isletme-panel.js`); hiçbir veri gönderilmez.
import * as V from './_veri.mjs';
import fs from 'node:fs';
import vm from 'node:vm';

const K = '{{kok}}';
const JS = ['assets/js/sayfa/isletme-panel.js'];
const DONOR = 'Gastro/Diet panel kanonu (dadadiet-prototip diyetisyen-paneli render, DadaGastro turetilmis/admin kabuğu); alanlar DadaGourmet-acil ve DadaGourmet-panel veri modeli';
const kac = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const et = '<span class="ornek-etiket satir-ici">prototip örneği</span>';
const ikon = (i) => `<i class="fa-solid ${i}" aria-hidden="true"></i>`;
const yardim = (m, i = 'fa-circle-info') => `<p class="alan-yardim">${ikon(i)}<span>${m}</span></p>`;
// Sol menü sayaçlarının derleme anı değeri (örnek veriden); betik bu tarayıcının durumuyla tazeler
const SAYAC = { rez: V.REZ.filter((r) => r.durum === 'talep').length, yanit: V.DEGERLENDIRME.filter((d) => d.durum === 'yayinda' && !d.yanit).length };
const tohum = `<script type="application/json" id="isletmeTohum">${JSON.stringify(V.TOHUM)}</script>`;

// Adres formları (il-ilce ajanı, 11 Kas): il ve ilçe aranabilir, bağımlı seçim. Liste tek kaynaktan (`assets/js/il-ilce-veri.js`,
// 81 il 973 ilçe, Türkçe sırada); bileşen `assets/js/il-ilce.js` + `assets/css/il-ilce.css`, sayfa betiğinden ÖNCE yüklenir
// (betik `el.value = …` ile doldururken bileşenin değer yazıcısı ilçe listesini kurar). Dil Gastro g-odemelerim ftIl/ftIlce.
const IL_ILCE = (() => { const k = {}; vm.runInNewContext(fs.readFileSync(new URL('../../../assets/js/il-ilce-veri.js', import.meta.url), 'utf8'), { window: k }); return k.DG_IL_ILCE; })();
const IL_EK = { js: ['assets/js/il-ilce-veri.js', 'assets/js/il-ilce.js'], css: ['assets/css/il-ilce.css'] };
const secenek = (liste, secili) => liste.map((x) => `<option${x === secili ? ' selected' : ''}>${kac(x)}</option>`).join('');
const ilIlce = (idIl, idIlce, il = '', ilce = '') => {
  const ilceler = (IL_ILCE.find(([ad]) => ad === il) ?? [, []])[1];
  return `<div class="alan">${etiket(idIl, 'İl', true)}<select class="alan-secim" id="${idIl}" name="il" required data-ara-secim data-il-secim><option value="">İl seç</option>${secenek(IL_ILCE.map(([ad]) => ad), il)}</select></div>`
    + `<div class="alan">${etiket(idIlce, 'İlçe', true)}<select class="alan-secim" id="${idIlce}" name="ilce" required data-ara-secim data-ilce-icin="${idIl}"><option value="">${il ? 'İlçe seç' : 'Önce il seç'}</option>${secenek(ilceler, ilce)}</select>${yardim('İl seçilince açılır.')}</div>`;
};

function sayfa(yol, aktif, baslik, govde, { donor = DONOR, ilIlce: adres = false } = {}) {
  return { yol, meta: { baslik, duzen: 'panel', aktif, js: adres ? [...IL_EK.js, ...JS] : JS, ...(adres ? { css: IL_EK.css } : {}), donor, sayaclar: SAYAC }, govde: `<div class="bilgi-notu" data-rol-notu hidden>${ikon('fa-circle-info')}<p>Bu panel mekân sahibi hesabına açıktır. Demo için <a href="${K}giris/?rol=isletme">Giriş Yap</a> ekranında İşletme'yi seç.</p></div>\n${govde}\n${tohum}` };
}
const bas = (h1, p, eylem = '', ek = '') => `${ek}<div class="panel-bas">
  <div><h1>${h1}</h1><p>${p}</p></div>${eylem ? `\n  <div class="eylem-satiri">${eylem}</div>` : ''}
</div>`;
const dugme = (m, { tur = 'hayalet', i = '', ek = '', href = '' } = {}) => href
  ? `<a class="dugme ${tur}" href="${K}${href}"${ek}>${i ? ikon(i) + ' ' : ''}${m}</a>`
  : `<button class="dugme ${tur}" type="button"${ek}>${i ? ikon(i) + ' ' : ''}${m}</button>`;
const kpi = (i, etiket, sayi, alt, { tur = '', ai = 'fa-minus', id = '' } = {}) => `<div class="kart kpi"${id ? ` data-kpi="${id}"` : ''}><span class="ikon">${ikon(i)}</span><div class="govde"><span class="etiket">${etiket}</span><span class="sayi">${sayi}</span><span class="kpi-degisim ${tur}">${ikon(ai)} <span>${alt}</span></span></div></div>`;
const kart = ({ baslik, i = '', p = '', sag = '', govde = '', bosluksuz = false, id = '', ek = '' }) => `<div class="kart panel"${id ? ` id="${id}"` : ''}${ek}>
  <div class="kart-bas"><div><h2 class="kart-baslik">${i ? ikon(i) + ' ' : ''}${baslik}</h2>${p ? `<p>${p}</p>` : ''}</div>${sag}</div>
  <div class="kart-govde${bosluksuz ? ' bosluksuz' : ''}">${govde}</div>
</div>`;
const satir = (i, b, alt, { href = '', uc = '' } = {}) => href
  ? `<a class="ayar-satir" href="${K}${href}"><span class="as-ikon">${ikon(i)}</span><span class="as-metin"><b>${b}</b><span>${alt}</span></span>${uc || `<i class="fa-solid fa-chevron-right as-ok" aria-hidden="true"></i>`}</a>`
  : `<div class="ayar-satir"><span class="as-ikon">${ikon(i)}</span><span class="as-metin"><b>${b}</b><span>${alt}</span></span>${uc ? `<span class="as-eylem">${uc}</span>` : ''}</div>`;
const etiket = (id, ad, zorunlu = false, ek = '') => `<label class="alan-etiket" for="${id}">${ad}${zorunlu === true ? ' <span class="zorunlu" aria-hidden="true">*</span>' : zorunlu ? ` <span class="istege-bagli">(${zorunlu})</span>` : ''}${ek}</label>`;
const girdi = (id, ad, { ad2 = id, zorunlu = false, tur = 'text', max = 120, yer = '', deger = '', ek = '', yard = '' } = {}) => `<div class="alan">${etiket(id, ad, zorunlu)}<input class="alan-girdi" id="${id}" name="${ad2}" type="${tur}"${max && tur !== 'number' && tur !== 'date' && tur !== 'time' ? ` maxlength="${max}"` : ''}${yer ? ` placeholder="${kac(yer)}"` : ''} value="${kac(deger)}"${zorunlu === true ? ' required' : ''}${ek}>${yard ? yardim(yard) : ''}</div>`;
const secim = (id, ad, tablo, secili, { ad2 = id, zorunlu = false, yard = '' } = {}) => `<div class="alan">${etiket(id, ad, zorunlu)}<select class="alan-secim" id="${id}" name="${ad2}">${Object.entries(tablo).map(([k, v]) => `<option value="${k}"${k === secili ? ' selected' : ''}>${v}</option>`).join('')}</select>${yard ? yardim(yard) : ''}</div>`;
const metin = (id, ad, { ad2 = id, zorunlu = false, max = 600, deger = '', yer = '', satir: s = 4, sayac = false, yard = '' } = {}) => `<div class="alan">${etiket(id, ad, zorunlu)}<textarea class="alan-metin" id="${id}" name="${ad2}" rows="${s}" maxlength="${max}"${yer ? ` placeholder="${kac(yer)}"` : ''}${zorunlu === true ? ' required' : ''}>${kac(deger)}</textarea>${sayac ? `<p class="sayac-not" data-sayac-icin="${id}">${deger.length} / ${max}</p>` : ''}${yard ? yardim(yard) : ''}</div>`;
const bolum = (i, h, ic) => `<div class="form-bolum"><h3 class="form-bolum-bas">${ikon(i)} ${h}</h3>${ic}</div>`;
const cipler = (ad, tablo, secili = [], etk = '') => `<div class="cipler" role="group" aria-label="${etk || ad}" data-cip-grup="${ad}">${Object.entries(tablo).map(([k, v]) => `<button class="cip" type="button" data-deger="${k}" aria-pressed="${secili.includes(k)}">${v}</button>`).join('')}</div>`;
const anahtar = (id, ad, acik, ek = '') => `<label class="anahtar"><input type="checkbox" id="${id}"${acik ? ' checked' : ''} aria-label="${kac(ad)}"${ek}><span class="anahtar-ray"></span></label>`;
const segment = (id, etk, secenek, secili) => `<div class="segment" id="${id}" role="group" aria-label="${etk}">${secenek.map(([k, v]) => `<button type="button" aria-pressed="${k === secili}" data-deger="${k}">${v}</button>`).join('')}</div>`;
const suzgec = (araId, araEtk, yer, sag) => `<div class="suzgec-cubuk"><div class="panel-arama">${ikon('fa-magnifying-glass')}<label class="yalniz-okuyucu" for="${araId}">${araEtk}</label><input class="panel-arama-girdi" type="search" id="${araId}" placeholder="${yer}" autocomplete="off"></div><div class="sag">${sag}</div></div>`;
const tablo = (id, baslik, kolonlar, { sinif = 'dar-yigin' } = {}) => `<div class="tablo-kap gomulu"><table class="tablo panel ${sinif}" data-kolon-disiplin="1"><caption class="yalniz-okuyucu">${baslik}</caption><thead><tr>${kolonlar.map(([ad, s = '']) => `<th scope="col"${s ? ` class="${s}"` : ''}>${ad}</th>`).join('')}</tr></thead><tbody id="${id}"></tbody></table></div>`;
const bos = (id, i, h, p, ek = '') => `<div class="bos-durum kart-ici" id="${id}" hidden><span class="bos-ikon">${ikon(i)}</span><h3>${h}</h3><p>${p}</p>${ek}</div>`;
const yanPanel = (id, baslik, form, ayak) => `<div class="yan-panel-ortu" id="${id}" hidden>
  <aside class="yan-panel" role="dialog" aria-modal="true" aria-labelledby="${id}Bas">
    <div class="yan-panel-bas"><h2 id="${id}Bas">${baslik}</h2><button class="ikon-dugme" type="button" aria-label="Kapat" data-kapat>${ikon('fa-xmark')}</button></div>
    ${form}
    <div class="yan-panel-ayak">${ayak}</div>
  </aside>
</div>`;
const cubuk = (not, eylem) => `<div class="kart-alt form-eylem cubuk-sabit"><span class="not" data-kayit-not>${not}</span><div class="eylem-satiri">${eylem}</div></div>`;

// ── 1 · Genel Bakış ─────────────────────────────────────────────────────────
function genelBakis() {
  const hizli = [
    ['fa-calendar-check', 'Rezervasyon taleplerini yanıtla', 'Onayla ya da reddet; alerjen notunu gör', 'isletme/rezervasyonlar/?sekme=bekleyen'],
    ['fa-utensils', 'Ne Yenir tabaklarını düzenle', 'En fazla üç imza tabak', 'isletme/menu/'],
    ['fa-images', 'Kapak fotoğrafını değiştir', 'Galeriden kapak seç', 'isletme/fotograflar/'],
    ['fa-clock', 'Özel gün ekle', 'Bayram, yılbaşı ya da kapalı gün', 'isletme/calisma-saatleri/'],
    ['fa-calendar-plus', 'Etkinlik öner', 'Tadım, atölye ya da şef masası', 'isletme/etkinlikler/'],
  ].map(([i, b, a, h]) => satir(i, b, a, { href: h })).join('');
  const govde = `${bas('Genel Bakış', `<span id="gunOzeti">Mikla için bugünün özeti.</span>`, `${dugme('Mekânımı görüntüle', { i: 'fa-eye', href: 'mekan/mikla/' })}${dugme('İstatistikler', { i: 'fa-chart-line', href: 'isletme/istatistikler/' })}${dugme('Rezervasyonlar', { tur: 'birincil', i: 'fa-calendar-check', href: 'isletme/rezervasyonlar/' })}`)}
<div class="kart-izgara c4" id="ozetKpi">
${kpi('fa-hourglass-half', 'Bekleyen talep', SAYAC.rez, 'Onayını bekleyen rezervasyon', { id: 'bekleyen' })}
${kpi('fa-calendar-day', 'Bugünkü rezervasyon', '–', 'Onaylı masa', { id: 'bugun', ai: 'fa-users' })}
${kpi('fa-comment-dots', 'Yanıt bekleyen', SAYAC.yanit, 'Yayındaki değerlendirme', { id: 'yanit', ai: 'fa-reply' })}
${kpi('fa-eye', 'Görüntülenme · 30 gün', V.ISTATISTIK.goruntulenme.reduce((a, b) => a + b, 0).toLocaleString('tr-TR'), 'prototip örneği', { id: 'goruntulenme', ai: 'fa-chart-line' })}
</div>
<div class="form-duzen pano">
  <div class="yigin">
    ${kart({ baslik: 'Bekleyen İşler', i: 'fa-list-check', p: '<span id="isOzet">En acil olan üstte.</span>', govde: '<div class="ayar-liste sarar" id="isListe"></div>' + bos('isBos', 'fa-circle-check', 'Bekleyen iş yok', 'Yeni rezervasyon talebi ya da yanıtsız değerlendirme gelince burada görünür.') })}
    ${kart({ baslik: 'Bugünün Rezervasyonları', i: 'fa-calendar-check', p: `Onaylı masalar, saat sırasıyla. Alerjen notu satırda. ${et}`, sag: dugme('Tümü', { tur: 'hayalet kucuk', href: 'isletme/rezervasyonlar/' }), govde: '<div class="ayar-liste sarar" id="bugunListe"></div>' + bos('bugunBos', 'fa-mug-saucer', 'Bugün onaylı rezervasyon yok', 'Pazar günleri mekân kapalı; özel günleri Çalışma Saatleri\'nden yönetirsin.') })}
    ${kart({ baslik: 'Son Değerlendirmeler', i: 'fa-star-half-stroke', p: `Yayındaki yorumlar; yanıtsız olan önce. ${et}`, sag: dugme('Tümü', { tur: 'hayalet kucuk', href: 'isletme/degerlendirmeler/' }), govde: '<div class="ayar-liste sarar" id="sonDegListe"></div>' })}
  </div>
  <aside class="form-yan">
    <div class="yigin">
      ${kart({ baslik: 'Hızlı İşlemler', i: 'fa-bolt', govde: `<div class="ayar-liste">${hizli}</div>` })}
      ${kart({ baslik: 'Profil Doluluğu', i: 'fa-clipboard-check', p: 'Mekân sayfasında görünen bölümler.', govde: '<div class="ayar-liste" id="dolulukListe"></div>' })}
      ${kart({ baslik: 'İşletme Durumu', i: 'fa-store', govde: `<div class="deger-liste"><div class="deger-satir"><span>Mekân</span><b>Mikla · Beyoğlu</b></div><div class="deger-satir"><span>Başvuru</span><b>#987 · Onaylandı</b></div><div class="deger-satir"><span>Sahiplik</span><b>Sahip · Etkin</b></div><div class="deger-satir"><span>Rezervasyon</span><b id="durumRez">Açık</b></div></div>` })}
    </div>
  </aside>
</div>`;
  return sayfa('isletme', 'genel-bakis', 'Genel Bakış', govde);
}

// ── 2 · Mekân Profili ───────────────────────────────────────────────────────
function profil() {
  const m = V.MEKAN;
  const fiyat = segment('pFiyat', 'Fiyat seviyesi', [['1', '₺'], ['2', '₺₺'], ['3', '₺₺₺'], ['4', '₺₺₺₺']], String(m.fiyat));
  const rozetSatir = ([k, i, ad, acik]) => `<div class="ayar-satir" data-rozet="${k}"><span class="as-ikon">${ikon(i)}</span><span class="as-metin"><b>${ad}</b><span>${acik}</span></span><span class="as-eylem"><span class="durum-hapi" data-rozet-durum></span>${anahtar('rz-' + k, ad + ' beyanı', V.ROZET_DURUM[k] !== 'kapali', ` data-rozet-anahtar="${k}"`)}</span></div>`;
  const genel = `${bolum('fa-id-card', 'Kimlik', `<div class="alan-izgara c2">${girdi('pAd', 'Mekân adı', { ad2: 'ad', zorunlu: true, max: 160, deger: m.ad, yard: 'Ad değişikliği değişiklik talebi olarak editöre gider.' })}${secim('pKategori', 'Kategori', V.KATEGORI, m.kategori, { ad2: 'kategori' })}</div>
    <div class="alan-izgara c2"><div class="alan"><span class="alan-etiket" id="pFiyatEt">Fiyat seviyesi</span>${fiyat.replace('aria-label="Fiyat seviyesi"', 'aria-labelledby="pFiyatEt"')}${yardim('Kişi başı ortalama harcama: ₺ ekonomik, ₺₺₺₺ üst segment.')}</div>${secim('pOperasyon', 'Operasyon durumu', { acik: 'Açık', gecici_kapali: 'Geçici olarak kapalı', kalici_kapali: 'Kalıcı olarak kapalı' }, m.operasyon, { ad2: 'operasyon', yard: 'Geçici kapalıyken mekân sayfasında uyarı görünür, rezervasyon alınmaz.' })}</div>`)}
    ${bolum('fa-align-left', 'Tanıtım', `${metin('pKisa', 'Kısa tanıtım', { ad2: 'kisa', max: 280, deger: m.kisa, satir: 2, sayac: true, yard: 'Mekân kartında ve arama sonuçlarında görünür.' })}${metin('pAciklama', 'Mekân hakkında', { ad2: 'aciklama', max: 2000, deger: m.aciklama, satir: 6, yard: 'Mekân sayfasının Genel Bakış bölümü. Paragrafları boş satırla ayır.' })}${metin('pRezNot', 'Rezervasyon notu', { ad2: 'rezervasyonNotu', zorunlu: 'isteğe bağlı', max: 500, deger: m.rezervasyonNotu, satir: 2, yard: 'Rezervasyon adımında misafire gösterilir.' })}`)}
    ${bolum('fa-tags', 'Mutfak ve Konsept', `<div class="alan"><span class="alan-etiket">Mutfak</span>${cipler('mutfak', V.MUTFAK, m.mutfak)}</div><div class="alan"><span class="alan-etiket">Konsept</span>${cipler('konsept', V.KONSEPT, m.konsept)}</div><div class="alan"><span class="alan-etiket">Ne için uygun</span>${cipler('vesile', V.VESILE, m.vesile)}</div>`)}`;
  const nitelik = `${bolum('fa-shield-halved', 'Doğrulanmış Nitelik Rozetleri', `<div class="bilgi-notu">${ikon('fa-circle-info')}<p>Bu dört bilgi mekân kartında mikro ikonla görünür. Açtığın rozet editör doğrulamasından sonra yayına girer; doğrulama için fotoğraf ya da belge isteyebiliriz.</p></div><div class="ayar-liste" id="rozetListe">${V.ROZET.map(rozetSatir).join('')}</div>`)}
    ${Object.entries(V.NITELIK).map(([g, [ad, tablo]]) => bolum(g === 'hizmet' ? 'fa-bell-concierge' : g === 'beslenme' ? 'fa-leaf' : 'fa-car', ad, `<div class="alan">${cipler(g, tablo, m[g], ad)}${yardim(g === 'beslenme' ? '"Alerjen bilgisi" açıkken mekân sayfasındaki alerjen uyarısı menüdeki alerjenlerle dolar.' : 'Mekânlar süzgecinde ve Mekân Bul sihirbazında kullanılır.')}</div>`)).join('')}`;
  const konum = `${bolum('fa-location-dot', 'Adres', `<div class="alan-izgara c3">${ilIlce('pIl', 'pIlce', m.il, m.ilce)}${girdi('pMahalle', 'Mahalle / semt', { ad2: 'mahalle', max: 80, deger: m.mahalle })}</div>
    <div class="alan-izgara c2">${girdi('pAdres', 'Açık adres', { ad2: 'acikAdres', zorunlu: true, max: 255, deger: m.acikAdres })}${girdi('pPosta', 'Posta kodu', { ad2: 'postaKodu', max: 10, deger: m.postaKodu })}</div>
    <div class="alan-izgara c2">${girdi('pEnlem', 'Enlem', { ad2: 'enlem', max: 20, deger: m.enlem })}${girdi('pBoylam', 'Boylam', { ad2: 'boylam', max: 20, deger: m.boylam })}</div>
    ${yardim('Adres ve konum değişikliği değişiklik talebi olarak editöre gider; onaylanınca haritaya ve Dada Route\'a yansır.')}
    <p><a class="dugme hayalet kucuk" href="${K}mekan/mikla/#mdMapSide">${ikon('fa-map-location-dot')} Mekân sayfasında haritayı gör</a></p>`)}
    ${bolum('fa-phone', 'İletişim', `<div class="alan-izgara c2">${girdi('pTelefon', 'Telefon', { ad2: 'telefon', zorunlu: true, max: 32, deger: m.telefon, ek: ' inputmode="tel"' })}${girdi('pDisUrl', 'Dış rezervasyon bağlantısı', { ad2: 'disUrl', zorunlu: 'isteğe bağlı', tur: 'url', max: 255, yer: 'https://', deger: m.disUrl, yard: 'Doluysa rezervasyon düğmesi bu adrese gider; boşsa Dada Gourmet rezervasyonu kullanılır.' })}</div>`)}`;
  const govde = `${bas('Mekân Profili', 'Misafirlerin Mikla sayfasında gördüğü bilgiler. Tanıtım ve nitelikler kaydedince yayına girer; ad, adres ve telefon editör onayıyla değişir.', dugme('Mekân sayfasını aç', { i: 'fa-arrow-up-right-from-square', href: 'mekan/mikla/' }))}
<form class="form-duzen" id="profilForm" novalidate data-yerel>
  <div class="kart panel">
    <div class="kart-govde">
      <div class="sekmeler" role="tablist" aria-label="Profil bölümleri">
        <button class="sekme aktif" type="button" role="tab" id="t-genel" aria-controls="p-genel" aria-selected="true">${ikon('fa-store')} Genel</button>
        <button class="sekme" type="button" role="tab" id="t-nitelik" aria-controls="p-nitelik" aria-selected="false">${ikon('fa-shield-halved')} Nitelikler</button>
        <button class="sekme" type="button" role="tab" id="t-konum" aria-controls="p-konum" aria-selected="false">${ikon('fa-location-dot')} İletişim</button>
      </div>
    </div>
    <section id="p-genel" role="tabpanel" aria-labelledby="t-genel">${genel}</section>
    <section id="p-nitelik" role="tabpanel" aria-labelledby="t-nitelik" hidden>${nitelik}</section>
    <section id="p-konum" role="tabpanel" aria-labelledby="t-konum" hidden>${konum}</section>
  </div>
  <aside class="form-yan">
    <div class="yigin">
      ${kart({ baslik: 'Kartta Görünüm', govde: `<div class="medya-kart onizleme-kart"><div class="medya-kart-gorsel"><img src="${K}assets/o/medya/252-400.webp" alt="" id="onKapak"><span class="medya-kart-kategori" id="onKategori">${V.KATEGORI[m.kategori]}</span></div><div class="medya-kart-govde"><h3 class="medya-kart-baslik" id="onAd">${m.ad}</h3><p class="medya-kart-metin" id="onKisa">${kac(m.kisa)}</p><div class="kart-nitelik-onizleme" id="onRozet"></div><p class="alan-yardim">${ikon('fa-location-dot')}<span id="onYer">${m.ilce}, ${m.il} · <b id="onFiyat">${'₺'.repeat(m.fiyat)}</b></span></p></div></div>` })}
      ${kart({ baslik: 'Durum', govde: `<div class="deger-liste" id="profilDurum"><div class="deger-satir"><span>Yayın</span><b>Yayında</b></div><div class="deger-satir"><span>Son doğrulama</span><b>28.10.2026</b></div><div class="deger-satir"><span>Bekleyen değişiklik</span><b id="profilBekleyen">Yok</b></div></div>` })}
    </div>
  </aside>
</form>
${cubuk('Kaydedilmiş bilgiler', `${dugme('Vazgeç', { ek: ' data-profil="vazgec"' })}${dugme('Kaydet', { tur: 'birincil', i: 'fa-floppy-disk', ek: ' data-profil="kaydet"' })}`)}`;
  return sayfa('isletme/profil', 'profil', 'Mekân Profili', govde, { ilIlce: true });
}

// ── 3 · Menü: Ne Yenir · Ne Alınır · Menü ───────────────────────────────────
function menu() {
  const nyForm = `<form class="yan-panel-govde" id="nyForm" novalidate data-yerel>
    <input type="hidden" name="id">
    ${girdi('nyAd', 'Tabak adı', { ad2: 'ad', zorunlu: true, max: 80, yer: 'Örn. Otlu kuzu' })}
    ${secim('nyTur', 'Tabak türü', V.NY_TUR, 'imza', { ad2: 'tur' })}
    ${metin('nyAciklama', 'Kısa açıklama', { ad2: 'aciklama', zorunlu: true, max: 160, satir: 3, sayac: true, yer: 'Malzeme ve pişirme; misafirin neden denemesi gerektiği.' })}
    ${girdi('nyFiyat', 'Fiyat (₺)', { ad2: 'fiyat', zorunlu: 'isteğe bağlı', max: 12, yer: 'Örn. 1.450', ek: ' inputmode="numeric"' })}
  </form>`;
  const naForm = `<form class="yan-panel-govde" id="naForm" novalidate data-yerel>
    <input type="hidden" name="id">
    ${girdi('naAd', 'Ürün adı ve ölçüsü', { ad2: 'ad', zorunlu: true, max: 80, yer: 'Örn. Zeytinyağı, 500 ml' })}
    ${girdi('naUretici', 'Üretici ya da kooperatif', { ad2: 'uretici', zorunlu: true, max: 120 })}
    <div class="alan-izgara c2">${girdi('naKaynak', 'Kaynak (il, ilçe)', { ad2: 'kaynak', zorunlu: true, max: 80, yer: 'Örn. Ayvalık, Balıkesir' })}${girdi('naPaket', 'Paket', { ad2: 'paket', max: 80, yer: 'Örn. Cam şişe' })}</div>
    ${yardim('Bu sürümde satış yok: misafir ürünü görür ve Dada Route\'ta rotasına ekler. Ürün bilgisi editörce doğrulanır.')}
  </form>`;
  const mkForm = `<form class="yan-panel-govde" id="mkForm" novalidate data-yerel>
    <input type="hidden" name="id">
    ${secim('mkKat', 'Kategori', Object.fromEntries(V.MENU_KAT.map((k) => [k, k])), V.MENU_KAT[0], { ad2: 'kat' })}
    ${girdi('mkAd', 'Kalem adı', { ad2: 'ad', zorunlu: true, max: 80 })}
    ${metin('mkAciklama', 'Açıklama', { ad2: 'aciklama', zorunlu: 'isteğe bağlı', max: 200, satir: 2 })}
    ${girdi('mkFiyat', 'Fiyat (₺)', { ad2: 'fiyat', zorunlu: true, max: 12, ek: ' inputmode="numeric"' })}
    <div class="alan"><span class="alan-etiket">Alerjenler</span>${cipler('alerjen', Object.fromEntries(V.ALERJEN.map((a) => [a, a])), [], 'Alerjenler')}</div>
  </form>`;
  const ayak = (f, m) => `${dugme('Vazgeç', { ek: ' data-kapat' })}<button class="dugme birincil" type="submit" form="${f}">${m}</button>`;
  const govde = `${bas('Menü', 'Mekân sayfanın "Ne Yenir?", "Ne Alınır?" ve Tam Menü bölümleri. Kaydedince yayına girer.', `${dugme('Mekân sayfasında gör', { i: 'fa-eye', href: 'mekan/mikla/?tab=ne-yenir' })}${dugme('Ekle', { tur: 'birincil', i: 'fa-plus', ek: ' data-menu-ekle' })}`)}
<div class="sekmeler" role="tablist" aria-label="Menü bölümleri" id="menuSekme">
  <button class="sekme aktif" type="button" role="tab" id="t-ny" aria-controls="p-ny" aria-selected="true" data-sekme="ny">${ikon('fa-utensils')} Ne Yenir <span class="sekme-sayi" data-sayi="ny">${V.NE_YENIR.length}</span></button>
  <button class="sekme" type="button" role="tab" id="t-na" aria-controls="p-na" aria-selected="false" data-sekme="na">${ikon('fa-basket-shopping')} Ne Alınır <span class="sekme-sayi" data-sayi="na">${V.NE_ALINIR.length}</span></button>
  <button class="sekme" type="button" role="tab" id="t-mk" aria-controls="p-mk" aria-selected="false" data-sekme="mk">${ikon('fa-book-open')} Tam Menü <span class="sekme-sayi" data-sayi="mk">${V.MENU.length}</span></button>
</div>
<section id="p-ny" role="tabpanel" aria-labelledby="t-ny">
  <div class="kart panel">
    <div class="kart-bas"><div><h2 class="kart-baslik">${ikon('fa-utensils')} İmza Tabaklar ${et}</h2><p>Mekânda denenmesi önerilen en fazla üç tabak. Misafir tabağı favorisine ekleyebilir.</p></div><span class="rozet pasif" id="nyKota">${V.NE_YENIR.length} / 3</span></div>
    <div class="kart-govde bosluksuz">${tablo('nyTablo', 'Ne Yenir tabakları', [['Tabak'], ['Tür'], ['Fiyat', 'num'], ['Favori', 'num'], ['İşlem', 'eylem']])}${bos('nyBos', 'fa-utensils', 'Henüz imza tabak yok', 'İlk tabağını ekle; mekân sayfasında "Ne Yenir?" başlığıyla görünür.', dugme('Tabak ekle', { tur: 'birincil', i: 'fa-plus', ek: ' data-ac="#nyPanel"' }))}</div>
  </div>
</section>
<section id="p-na" role="tabpanel" aria-labelledby="t-na" hidden>
  <div class="kart panel">
    <div class="kart-bas"><div><h2 class="kart-baslik">${ikon('fa-basket-shopping')} Paketli Yerel Ürünler ${et}</h2><p>Mekândan eve ya da ofise götürülebilecek ürünler. Dada Route'ta "Ne Alınır" katmanında durak olur.</p></div></div>
    <div class="kart-govde bosluksuz">${tablo('naTablo', 'Ne Alınır ürünleri', [['Ürün'], ['Kaynak'], ['Doğrulama'], ['Rotaya ekleme', 'num'], ['İşlem', 'eylem']])}${bos('naBos', 'fa-basket-shopping', 'Henüz ürün yok', 'Mekânında satılan paketli yerel ürünü ekle.', dugme('Ürün ekle', { tur: 'birincil', i: 'fa-plus', ek: ' data-ac="#naPanel"' }))}</div>
  </div>
</section>
<section id="p-mk" role="tabpanel" aria-labelledby="t-mk" hidden>
  <div class="kart panel">
    <div class="kart-bas"><div><h2 class="kart-baslik">${ikon('fa-book-open')} Tam Menü ${et}</h2><p>Kategoriler ve kalemler; alerjenler kalemde işaretlenir.</p></div><label class="anahtar-etiketli">${anahtar('alerjenVerildi', 'Alerjen bilgisini mekân sayfasında göster', true)}<span>Alerjen bilgisini göster</span></label></div>
    ${suzgec('mkAra', 'Menüde ara', 'Kalem ya da alerjen ara', `<span class="suzgec-sayac"><b id="mkSayac">${V.MENU.length}</b> kalem</span>`)}
    <div class="kart-govde bosluksuz">${tablo('mkTablo', 'Menü kalemleri', [['Kalem'], ['Kategori'], ['Alerjen'], ['Fiyat', 'num'], ['İşlem', 'eylem']])}${bos('mkBos', 'fa-book-open', 'Bu aramayla kalem yok', 'Aramayı değiştir ya da yeni kalem ekle.')}</div>
  </div>
</section>
${yanPanel('nyPanel', 'İmza tabak', nyForm, ayak('nyForm', 'Tabağı kaydet'))}
${yanPanel('naPanel', 'Paketli ürün', naForm, ayak('naForm', 'Ürünü kaydet'))}
${yanPanel('mkPanel', 'Menü kalemi', mkForm, ayak('mkForm', 'Kalemi kaydet'))}`;
  return sayfa('isletme/menu', 'menu', 'Menü', govde, { donor: DONOR + '; Ne Yenir/Ne Alınır kopyası dadagourmet-panel-donor mekan/mikla ny-bolum' });
}

// ── 4 · Fotoğraflar ─────────────────────────────────────────────────────────
function fotograflar() {
  const govde = `${bas('Fotoğraflar', 'Mekân sayfasının galerisi. Kapak fotoğrafı mekân kartında ve sayfanın başında görünür; sıra galerideki sıradır.', `<label class="dugme birincil" for="fotoDosya">${ikon('fa-cloud-arrow-up')} Fotoğraf yükle</label><input class="dosya-girdi" id="fotoDosya" type="file" accept=".jpg,.jpeg,.png,.webp" multiple>`)}
<div class="kart panel">
  <div class="kart-bas"><div><h2 class="kart-baslik">${ikon('fa-images')} Galeri</h2><p><span id="fotoSayac">${V.FOTO.length}</span> fotoğraf · en çok 20. JPG, PNG ya da WebP, en çok 8 MB; yatay ve en az 1600 piksel genişlik önerilir.</p></div></div>
  <div class="kart-govde"><div class="medya-izgara foto-izgara" id="fotoIzgara"></div>${bos('fotoBos', 'fa-images', 'Galeride fotoğraf yok', 'İlk fotoğrafını yükle; ilk yüklenen kapak olur.')}</div>
</div>
${yardim('Yüklediğin fotoğraf yalnız bu tarayıcıda kalır; prototipte hiçbir dosya gönderilmez.', 'fa-shield-halved')}`;
  return sayfa('isletme/fotograflar', 'fotograflar', 'Fotoğraflar', govde, { donor: DONOR + '; Medya (rol cover|galeri, sira)' });
}

// ── 5 · Çalışma Saatleri ────────────────────────────────────────────────────
function saatler() {
  const ogForm = `<form class="yan-panel-govde" id="ogForm" novalidate data-yerel>
    <div class="alan-izgara c2">${girdi('ogTarih', 'Tarih', { ad2: 'tarih', zorunlu: true, tur: 'date' })}${secim('ogTur', 'Durum', { kapali: 'Kapalı', ozel_saatler: 'Özel saatler' }, 'kapali', { ad2: 'tur' })}</div>
    <div class="alan-izgara c2" data-og-saat hidden>${girdi('ogBas', 'Açılış', { ad2: 'bas', tur: 'time', deger: '18:00' })}${girdi('ogBit', 'Kapanış', { ad2: 'bit', tur: 'time', deger: '00:00' })}</div>
    ${girdi('ogAciklama', 'Açıklama', { ad2: 'aciklama', zorunlu: 'isteğe bağlı', max: 120, yer: 'Örn. Bayram tatili', yard: 'Mekân sayfasında saat tablosunun altında görünür.' })}
  </form>`;
  const govde = `${bas('Çalışma Saatleri', 'Haftalık açılış saatleri ve özel günler. Rezervasyon saatleri bu aralıklardan üretilir; değişiklik kaydedince mekân sayfasına yansır.')}
<div class="form-duzen">
  <div class="yigin">
    <div class="kart panel">
      <div class="kart-bas"><div><h2 class="kart-baslik">${ikon('fa-clock')} Haftalık Saatler</h2><p>Bir gün birden çok aralık alabilir (öğle ve akşam gibi). Gece yarısını geçen kapanış ertesi güne sayılır.</p></div>${dugme('Pazartesiyi kopyala', { tur: 'hayalet kucuk', i: 'fa-copy', ek: ' data-saat="kopyala" title="Pazartesi saatlerini bütün açık günlere uygula"' })}</div>
      <div class="kart-govde"><div class="ayar-liste" id="saatListe"></div></div>
    </div>
    <div class="kart panel">
      <div class="kart-bas"><div><h2 class="kart-baslik">${ikon('fa-calendar-xmark')} Özel Günler</h2><p>Bayram, yılbaşı ya da bakım için kapalı gün veya o güne özel saat.</p></div>${dugme('Özel gün ekle', { tur: 'birincil kucuk', i: 'fa-plus', ek: ' data-ac="#ogPanel"' })}</div>
      <div class="kart-govde bosluksuz">${tablo('ogTablo', 'Özel günler', [['Tarih'], ['Durum'], ['Saat'], ['Açıklama'], ['İşlem', 'eylem']])}${bos('ogBos', 'fa-calendar-check', 'Özel gün yok', 'Haftalık saatler her gün geçerli.')}</div>
    </div>
  </div>
  <aside class="form-yan">
    <div class="yigin">
      ${kart({ baslik: 'Mekân Sayfasında', p: 'Misafirin gördüğü saat tablosu.', govde: '<div class="deger-liste" id="saatOnizleme"></div>' })}
      ${kart({ baslik: 'Rezervasyon', govde: `<p class="alan-yardim">${ikon('fa-circle-info')}<span>Rezervasyon pencereleri ve slot süresi <a href="${K}isletme/ayarlar/">Ayarlar</a> ekranında.</span></p>` })}
    </div>
  </aside>
</div>
${cubuk('Kaydedilmiş saatler', `${dugme('Vazgeç', { ek: ' data-saat="vazgec"' })}${dugme('Saatleri kaydet', { tur: 'birincil', i: 'fa-floppy-disk', ek: ' data-saat="kaydet"' })}`)}
${yanPanel('ogPanel', 'Özel gün', ogForm, `${dugme('Vazgeç', { ek: ' data-kapat' })}<button class="dugme birincil" type="submit" form="ogForm">Ekle</button>`)}`;
  return sayfa('isletme/calisma-saatleri', 'saatler', 'Çalışma Saatleri', govde, { donor: DONOR + '; CalismaSaati, CalismaSaatiIstisnasi' });
}

// ── 6 · Rezervasyonlar ──────────────────────────────────────────────────────
function rezervasyonlar() {
  const sekme = (id, ad, i, secili) => `<button class="sekme${secili ? ' aktif' : ''}" type="button" role="tab" id="rs-${id}" data-sekme="${id}" aria-controls="rezListe" aria-selected="${secili}">${ikon(i)} ${ad} <span class="sekme-sayi" data-sayi="${id}"></span></button>`;
  const govde = `${bas('Rezervasyonlar', 'Mekânına gelen masa talepleri. Onayladığın talep misafirin Rezervasyonlarım ekranına düşer; ziyaret saati geçince Gerçekleşti ya da Gelinmedi olarak işaretle, misafirin +25 Dada Puanı gerçekleşen rezervasyonda kesinleşir.', `${dugme('Rezervasyon ayarları', { i: 'fa-sliders', href: 'isletme/ayarlar/' })}`)}
<div class="kart-izgara c4" id="rezKpi"></div>
<div class="kart panel">
  <div class="kart-bas"><div><h2 class="kart-baslik">${ikon('fa-calendar-week')} Gün ve Saat</h2><p>Önümüzdeki yedi gün. Slot doluluğu onaylı ve bekleyen kişi sayısıyla; slota tıkla, liste o saate süzülsün.</p></div></div>
  <div class="kart-govde"><div class="cip-sira gun-sec" id="gunSec" role="group" aria-label="Gün seç"></div><div class="slot-izgara" id="slotIzgara" role="group" aria-label="Saat slotları"></div></div>
</div>
<div class="sekmeler" role="tablist" aria-label="Rezervasyon durumu" id="rezSekme">
${sekme('bekleyen', 'Bekleyen', 'fa-hourglass-half', true)}
${sekme('yaklasan', 'Yaklaşan', 'fa-calendar-check', false)}
${sekme('gecmis', 'Geçmiş', 'fa-clock-rotate-left', false)}
${sekme('tumu', 'Tümü', 'fa-list', false)}
</div>
<div class="kart panel" id="rezListe" role="tabpanel" aria-labelledby="rs-bekleyen">
  ${suzgec('rezAra', 'Rezervasyon ara', 'Misafir, kod ya da alerjen ara', `<button class="suzgec-temizle" type="button" data-rez-temizle hidden>Süzgeci temizle</button><span class="suzgec-sayac"><b id="rezSayac">0</b> rezervasyon</span>${et}`)}
  <div class="kart-govde bosluksuz">${tablo('rezTablo', 'Rezervasyonlar', [['Misafir'], ['Tarih ve saat'], ['Kişi', 'num'], ['Not ve alerjen'], ['Durum'], ['İşlem', 'eylem']], { sinif: 'etiketli-yigin' })}${bos('rezBos', 'fa-calendar-check', 'Bu süzgeçle rezervasyon yok', 'Sekmeyi değiştir ya da aramayı temizle.', dugme('Süzgeci temizle', { i: 'fa-rotate-left', ek: ' data-rez-temizle' }))}</div>
</div>
${yanPanel('retPanel', 'Talebi reddet', `<form class="yan-panel-govde" id="retForm" novalidate data-yerel><input type="hidden" name="id"><p class="alan-yardim" id="retKim"></p>${secim('retNeden', 'Neden', { dolu: 'O saatte yer yok', kapali: 'Mekân o gün kapalı', grup: 'Grup büyüklüğü uygun değil', diger: 'Diğer' }, 'dolu', { ad2: 'neden' })}${metin('retNot', 'Misafire not', { ad2: 'not', zorunlu: 'isteğe bağlı', max: 300, satir: 3, yer: 'Örn. 21.00 için yerimiz var, yeniden talep oluşturabilirsin.' })}</form>`, `${dugme('Vazgeç', { ek: ' data-kapat' })}<button class="dugme tehlike" type="submit" form="retForm">Reddet</button>`)}`;
  return sayfa('isletme/rezervasyonlar', 'rezervasyonlar', 'Rezervasyonlar', govde, { donor: DONOR + '; Rezervasyon, RezervasyonAyari, DadaGourmet-panel isletme/rezervasyonlar' });
}

// ── 7 · Etkinlikler ─────────────────────────────────────────────────────────
function etkinlikler() {
  const form = `<form class="yan-panel-govde" id="etForm" novalidate data-yerel>
    <input type="hidden" name="id">
    ${girdi('etAd', 'Etkinlik adı', { ad2: 'ad', zorunlu: true, max: 120, yer: 'Örn. Yeni Anadolu Mutfağı Tadım Gecesi' })}
    ${secim('etTur', 'Tür', V.ETKINLIK_TUR, 'tadim', { ad2: 'tur' })}
    <div class="alan-izgara c3">${girdi('etTarih', 'Tarih', { ad2: 'tarih', zorunlu: true, tur: 'date' })}${girdi('etSaat', 'Başlangıç', { ad2: 'saat', zorunlu: true, tur: 'time', deger: '19:30' })}${girdi('etBitis', 'Bitiş', { ad2: 'bitis', tur: 'time', deger: '23:00' })}</div>
    <div class="alan-izgara c2">${girdi('etKapasite', 'Kapasite (kişi)', { ad2: 'kapasite', zorunlu: true, tur: 'number', deger: '20', ek: ' min="1" max="500"' })}${girdi('etUcret', 'Ücret', { ad2: 'ucret', zorunlu: 'boşsa ücretsiz', max: 60, yer: 'Örn. 4.500 ₺ kişi başı' })}</div>
    ${metin('etAciklama', 'Kısa açıklama', { ad2: 'aciklama', zorunlu: true, max: 400, satir: 4, sayac: true, yer: 'Menü, kimlerin katılabileceği, öne çıkan üretici ya da şef.' })}
    ${yardim('Gönderdiğin etkinlik editör onayından sonra Etkinlikler sayfasında yayına girer; misafir "Randevu Oluştur" ile kaydolur.')}
  </form>`;
  const govde = `${bas('Etkinlikler', 'Mekânında düzenlediğin tadım, atölye ve şef masaları. Önerdiğin etkinlik editör onayıyla Etkinlikler sayfasına girer; kayıtlar burada görünür.', dugme('Etkinlik öner', { tur: 'birincil', i: 'fa-plus', ek: ' data-ac="#etPanel"' }))}
<div class="kart panel">
  ${suzgec('etAra', 'Etkinlik ara', 'Etkinlik ara', `${segment('etSuzgec', 'Yayın durumu', [['hepsi', 'Tümü'], ['yayinda', 'Yayında'], ['incelemede', 'İncelemede'], ['taslak', 'Taslak']], 'hepsi')}<span class="suzgec-sayac"><b id="etSayac">${V.ETKINLIK.length}</b> etkinlik</span>${et}`)}
  <div class="kart-govde bosluksuz">${tablo('etTablo', 'Etkinlikler', [['Etkinlik'], ['Tarih'], ['Kayıt', 'num'], ['Durum'], ['İşlem', 'eylem']])}${bos('etBos', 'fa-calendar-days', 'Bu süzgeçle etkinlik yok', 'Süzgeci değiştir ya da yeni etkinlik öner.')}</div>
</div>
${yanPanel('etPanel', 'Etkinlik', form, `${dugme('Taslak kaydet', { ek: ' data-et-taslak' })}<button class="dugme birincil" type="submit" form="etForm">İncelemeye gönder</button>`)}`;
  return sayfa('isletme/etkinlikler', 'etkinlikler', 'Etkinlikler', govde, { donor: DONOR + '; Etkinlik (tur, YayinDurumu), EtkinlikOnerisi' });
}

// ── 8 · Değerlendirmeler (portaldan) ────────────────────────────────────────
function degerlendirmeler() {
  const sekme = (id, ad, i, secili) => `<button class="sekme${secili ? ' aktif' : ''}" type="button" role="tab" id="ds-${id}" data-sekme="${id}" aria-controls="degListe" aria-selected="${secili}">${ikon(i)} ${ad} <span class="sekme-sayi" data-sayi="${id}"></span></button>`;
  const govde = `${bas('Değerlendirmeler', 'Misafirlerin yazdıkları. Yayındaki değerlendirmeye bir kez yanıt yazabilirsin; yorumun metnini değiştiremezsin. Yanıtın mekân sayfasında yorumun altında görünür.')}
<div class="kart-izgara c4" id="degKpi"></div>
<div class="sekmeler" role="tablist" aria-label="Değerlendirme durumu" id="degSekme">
${sekme('yanitsiz', 'Yanıt bekleyen', 'fa-reply', true)}
${sekme('yanitli', 'Yanıtlanan', 'fa-check', false)}
${sekme('inceleniyor', 'İncelemede', 'fa-hourglass-half', false)}
${sekme('tumu', 'Tümü', 'fa-list', false)}
</div>
<div id="degListe" class="yigin" role="tabpanel" aria-labelledby="ds-yanitsiz"></div>
<div class="kart panel" id="degBosKart" hidden><div class="kart-govde">${bos('degBos', 'fa-comment-dots', 'Bu sekmede değerlendirme yok', 'Yeni değerlendirme yayına girdiğinde burada görünür.').replace(' hidden', '')}</div></div>`;
  return sayfa('isletme/degerlendirmeler', 'degerlendirmeler', 'Değerlendirmeler', govde, { donor: DONOR + '; canlı /isletme/degerlendirmeler, Degerlendirme.isletme_yaniti' });
}

// ── 9 · İstatistikler ───────────────────────────────────────────────────────
function istatistikler() {
  const S = V.ISTATISTIK, top = (a) => a.reduce((x, y) => x + y, 0);
  const dagilim = (l) => { const t = top(l.map((x) => x[1])) || 1; return `<div class="ayar-liste">${l.map(([ad, n]) => { const o = Math.round((n / t) * 100); return `<div class="ayar-satir"><span class="as-metin"><b>${ad}</b><div class="olcer hap" role="img" aria-label="Yüzde ${o}"><span data-oran="${o}" style="--oran:${o}"></span></div></span><span class="as-eylem"><b>${n}</b><span class="rozet pasif">%${o}</span></span></div>`; }).join('')}</div>`; };
  const tabak = V.NE_YENIR.map((t) => [t.ad, t.favori]);
  const govde = `${bas('İstatistikler', `Mikla'nın sayfası ve rezervasyonları. Görüntülenme ve favori günlük ölçümden, rezervasyon kayıtlardan sayılır. ${et}`)}
<div class="kart-izgara c4" id="istKpi">
${kpi('fa-eye', 'Görüntülenme', top(S.goruntulenme).toLocaleString('tr-TR'), '+%12 önceki döneme göre', { tur: 'iyi', ai: 'fa-arrow-trend-up', id: 'goruntulenme' })}
${kpi('fa-heart', 'Favoriye ekleme', top(S.kaydetme), '+%8 önceki döneme göre', { tur: 'iyi', ai: 'fa-arrow-trend-up', id: 'kaydetme' })}
${kpi('fa-route', 'Rota durağı', top(S.rota), 'Dada Route\'ta durak eklenme', { ai: 'fa-minus', id: 'rota' })}
${kpi('fa-calendar-check', 'Rezervasyon talebi', top(S.rezervasyon), '%86 onaylandı', { ai: 'fa-minus', id: 'rezervasyon' })}
</div>
<div class="kart panel">
  <div class="kart-bas"><div><h2 class="kart-baslik">${ikon('fa-chart-line')} Günlük Seyir</h2><p id="grafikNot">Görüntülenme, günlük.</p></div><div class="eylem-satiri grafik-secim">${segment('donem', 'Dönem', [['7', '7 gün'], ['30', '30 gün']], '30')}${segment('grafikSeri', 'Grafik serisi', [['goruntulenme', 'Görüntülenme'], ['kaydetme', 'Favori'], ['rota', 'Rota'], ['rezervasyon', 'Rezervasyon']], 'goruntulenme')}</div></div>
  <div class="kart-govde"><div class="grafik-kap" id="istGrafik"></div></div>
</div>
<div class="iki-kolon">
  ${kart({ baslik: 'Ziyaretçi Nereden Geldi', i: 'fa-signs-post', p: 'Mekân sayfasına geliş yüzdesi.', govde: dagilim(S.kaynak) })}
  ${kart({ baslik: 'Günlere Göre Rezervasyon', i: 'fa-calendar-week', p: 'Son 30 gün, onaylı ve gerçekleşen. Pazar kapalı.', govde: dagilim(S.gunler) })}
</div>
<div class="iki-kolon">
  ${kart({ baslik: 'Ne Yenir · Favori', i: 'fa-utensils', p: 'İmza tabakların favorilere eklenme sayısı.', govde: dagilim(tabak) })}
  ${kart({ baslik: 'Ne Alınır · Rotaya Ekleme', i: 'fa-basket-shopping', p: 'Ürünün Dada Route\'ta durak yapılma sayısı.', govde: dagilim(V.NE_ALINIR.map((u) => [u.ad, u.rota])) })}
</div>
${yardim('Rota durağı ve kaynak dağılımı canlıda henüz ölçülmüyor; bu ekrandaki bütün sayılar prototip örneğidir.')}`;
  return sayfa('isletme/istatistikler', 'istatistikler', 'İstatistikler', govde, { donor: DONOR + '; mekan_gunluk_metrikleri (DadaGourmet-panel-analitik MekanMetrikOkumaServisi)' });
}

// ── 10 · Başvurular (portaldan) ─────────────────────────────────────────────
const rozetH = (tablo, d) => `<span class="durum-hapi ${tablo[d][1]}">${tablo[d][0]}</span>`;
function basvurular() {
  const sat = (b) => `<tr><td><a href="${K}isletme/basvurular/${b.no}/duzenle/"><b>${b.gorunen_ad}</b></a><small>Başvuru #${b.no} · ${b.ticari_unvan}</small></td><td data-etiket="Tür">${V.MEKAN_TURU[b.mekan_turu]}</td><td data-etiket="Gönderildi">${b.gonderildi}</td><td data-etiket="Durum">${rozetH(V.BASVURU_DURUM, b.durum)}</td><td class="eylem"><span class="satir-eylem"><a class="ikon-dugme" href="${K}isletme/basvurular/${b.no}/duzenle/" aria-label="${b.gorunen_ad} başvurusunu görüntüle">${ikon('fa-eye')}</a></span></td></tr>`;
  const govde = `${bas('Başvurular', 'İşletme başvuruların ve doğrulama belgelerin. Ekibimiz başvuruyu onayladığında mekân yönetimi bu panelde açılır.', dugme('İşletme ekle', { tur: 'birincil', i: 'fa-plus', href: 'isletme/basvurular/yeni/' }))}
<div class="kart panel">
  <div class="kart-bas"><div><h2 class="kart-baslik">${ikon('fa-file-signature')} Başvurularım ${et}</h2><p>Taslak ve bilgi istenen başvuruyu düzenleyebilirsin; gönderilen başvuru incelemede kilitlenir.</p></div></div>
  <div class="kart-govde bosluksuz"><div class="tablo-kap gomulu"><table class="tablo panel dar-yigin" data-kolon-disiplin="1"><caption class="yalniz-okuyucu">Başvurular</caption><thead><tr><th scope="col">İşletme</th><th scope="col">Tür</th><th scope="col">Gönderildi</th><th scope="col">Durum</th><th scope="col" class="eylem">İşlem</th></tr></thead><tbody id="basvuruTablo">${V.BASVURULAR.map(sat).join('')}</tbody></table></div></div>
</div>
${kart({ baslik: 'Onaylanmış İşletmeler', i: 'fa-circle-check', p: 'Sahibi olduğun mekânlar.', govde: `<div class="ayar-liste">${satir('fa-store', 'Mikla', 'Fine Dining · Beyoğlu, İstanbul · Sahip', { uc: `<span class="as-eylem"><span class="durum-hapi cozulen">Yayında</span>${dugme('Profili düzenle', { tur: 'hayalet kucuk', href: 'isletme/profil/' })}</span>` })}</div>` })}`;
  return sayfa('isletme/basvurular', 'basvurular', 'Başvurular', govde, { donor: DONOR + '; canlı /isletme index' });
}
function basvuruFormu(b) {
  const d = b ?? {};
  const v = (k) => d[k] ?? '';
  const kutu = (ad, tablo, secili = []) => Object.entries(tablo).map(([k, e]) => `<label class="onay-kutusu"><input type="checkbox" name="${ad}" value="${k}"${secili.includes(k) ? ' checked' : ''}> <span>${e}</span></label>`).join('');
  const sec = (id, ad, ad2, tablo, secili, bosM) => `<div class="alan">${etiket(id, ad, true)}<select class="alan-secim" id="${id}" name="${ad2}"><option value="" disabled${secili ? '' : ' selected'}>${bosM}</option>${Object.entries(tablo).map(([k, e]) => `<option value="${k}"${k === secili ? ' selected' : ''}>${e}</option>`).join('')}</select></div>`;
  const gonderilebilir = !b || ['taslak', 'bilgi_istendi'].includes(b.durum);
  const form = `<form class="kart panel" data-basvuru-form${b ? ` data-basvuru-no="${b.no}" data-basvuru-durum="${b.durum}"` : ''} novalidate data-yerel>
    ${bolum('fa-store', 'İşletme Bilgileri', `${girdi('vaGorunenAd', 'İşletme adı', { ad2: 'gorunen_ad', zorunlu: true, max: 160, yer: 'Örn. Nalia Karadeniz Mutfağı', deger: v('gorunen_ad') })}${girdi('vaTicariUnvan', 'Ticari unvan', { ad2: 'ticari_unvan', zorunlu: true, max: 200, deger: v('ticari_unvan') })}
      <div class="alan-izgara c2">${sec('vaMekanTuru', 'İşletme türü', 'mekan_turu', V.MEKAN_TURU, v('mekan_turu'), 'İşletme türü seç')}${sec('vaFiyatSeviyesi', 'Fiyat aralığı', 'fiyat_seviyesi', V.FIYAT_BASVURU, v('fiyat_seviyesi'), 'Seç')}</div>
      <div class="alan-izgara c2">${ilIlce('vaIl', 'vaIlce', v('il'), v('ilce'))}</div>
      ${girdi('vaAcikAdres', 'Açık adres', { ad2: 'acik_adres', zorunlu: true, max: 500, yer: 'Mahalle, cadde, no', deger: v('acik_adres') })}`)}
    ${bolum('fa-address-card', 'İletişim ve Yetkili', `<div class="alan-izgara c2">${girdi('vaYetkiliAd', 'Yetkili ad soyad', { ad2: 'yetkili_ad', zorunlu: true, max: 160, deger: v('yetkili_ad') || '{{uye.ad}}' })}${girdi('vaYetkiliTelefon', 'Yetkili telefon', { ad2: 'yetkili_telefon', zorunlu: true, max: 40, yer: '0(5__) ___ __ __', deger: v('yetkili_telefon'), ek: ' inputmode="tel"' })}</div>
      <div class="alan-izgara c2">${girdi('vaIsletmeEposta', 'E-posta', { ad2: 'isletme_eposta', zorunlu: true, tur: 'email', max: 255, yer: 'rezervasyon@isletmen.com', deger: v('isletme_eposta') })}${girdi('vaIsletmeTelefon', 'İşletme telefonu', { ad2: 'isletme_telefon', zorunlu: true, max: 40, yer: '0(2__) ___ __ __', deger: v('isletme_telefon'), ek: ' inputmode="tel"' })}</div>
      <div class="alan-izgara c2">${girdi('vaWebSitesi', 'Web sitesi', { ad2: 'web_sitesi', zorunlu: 'isteğe bağlı', max: 255, yer: 'ornek.com', deger: v('web_sitesi') })}${girdi('vaInstagram', 'Instagram', { ad2: 'instagram', zorunlu: 'isteğe bağlı', max: 120, yer: '@isletmen', deger: v('instagram') })}</div>
      ${girdi('vaVergiNo', 'Vergi no / işletme belgesi no', { ad2: 'vergi_veya_ruhsat_no', zorunlu: true, max: 50, yer: 'Vergi numaran veya işletme ruhsat no', deger: b ? '98765' + String(b.no).padStart(5, '0') : '', yard: 'Yalnızca işletme doğrulaması için kullanılır, profilinde gösterilmez.' })}`)}
    ${bolum('fa-list-check', 'Hizmetler ve Saatler', `<div class="alan"><span class="alan-etiket" id="vaHizmetEtiket">Sunulan hizmetler <span class="zorunlu" aria-hidden="true">*</span> <span class="istege-bagli" data-hizmet-sayac aria-live="polite">${(d.hizmetler ?? []).length}/5 seçildi</span></span><div class="alan-izgara c2" role="group" aria-labelledby="vaHizmetEtiket">${kutu('hizmetler', V.HIZMET_BASVURU, d.hizmetler)}</div>${yardim('En fazla 5 hizmet seç; profilinde özellik etiketi olarak görünür.')}</div>
      ${girdi('vaCalismaSaatleri', 'Çalışma saatleri özeti', { ad2: 'calisma_saatleri_ozeti', zorunlu: 'isteğe bağlı', max: 255, yer: 'Örn. Her gün 12.00 – 23.00, Pazar kapalı', deger: v('calisma_saatleri_ozeti') })}`)}
    ${bolum('fa-bullhorn', 'Tanıtım ve Rezervasyon', `${metin('vaTanitim', 'Kısa tanıtım', { ad2: 'tanitim', zorunlu: true, max: 600, deger: v('tanitim'), sayac: true, yer: 'Mekânını, mutfağını ve atmosferini anlat; profilinde gösterilir.' })}
      <div class="alan"><span class="alan-etiket" id="vaServisEtiket">Servis türü <span class="zorunlu" aria-hidden="true">*</span></span><div class="alan-izgara c2" role="group" aria-labelledby="vaServisEtiket">${kutu('hizmet_turleri', V.HIZMET_TURU, d.hizmet_turleri)}</div></div>
      ${girdi('vaRezervasyonAraliklari', 'Rezervasyon kabul edeceğin saat dilimleri', { ad2: 'rezervasyon_araliklari', zorunlu: 'isteğe bağlı', max: 255, yer: 'Örn. Öğle 12.00–15.00, Akşam 18.30–22.30', deger: v('rezervasyon_araliklari') })}
      ${metin('vaRezervasyonNotu', 'Rezervasyon notu', { ad2: 'rezervasyon_notu', zorunlu: 'isteğe bağlı', max: 2000, deger: v('rezervasyon_notu'), satir: 2, yer: 'Maks. kişi sayısı, grup kabulü, çocuk sandalyesi gibi bilgileri kısaca belirt.' })}
      ${metin('vaNotlar', 'Notlar', { ad2: 'notlar', zorunlu: 'ekibimize iç not', max: 5000, deger: v('notlar'), satir: 2 })}
      <div class="onay-satirlari"><label class="onay-kutusu" for="vaDogrulamaOnayi"><input type="checkbox" name="dogrulama_onayi" id="vaDogrulamaOnayi" value="1"${b ? ' checked' : ''}> <span>Verdiğim işletme ve belge bilgilerinin <a href="${K}yasal/kvkk/">doğrulanması</a> amacıyla işlenmesine açık rıza veriyorum.</span></label><label class="onay-kutusu" for="vaKosullarOnayi"><input type="checkbox" name="kosullar_onayi" id="vaKosullarOnayi" value="1"${b ? ' checked' : ''}> <span><a href="${K}yasal/kvkk/">Aydınlatma Metni</a> ve KVKK Metni'ni okudum, onaylıyorum.</span></label></div>`)}
  </form>`;
  const belgeSatir = (x) => satir('fa-file-lines', V.BELGE_TURU[x[0]], `${x[1]} · ${x[2].toLocaleString('tr-TR')} KB`);
  const yan = `<aside class="form-yan"><div class="yigin">
    ${kart({ baslik: 'Durum', govde: `<div class="deger-liste"><div class="deger-satir"><span>Başvuru</span><b data-basvuru-durum-rozet>${b ? rozetH(V.BASVURU_DURUM, b.durum) : '<span class="durum-hapi kapali">Kaydedilmedi</span>'}</b></div>${b ? `<div class="deger-satir"><span>Numara</span><b>#${b.no}</b></div><div class="deger-satir"><span>Gönderildi</span><b>${b.gonderildi}</b></div>` : ''}</div>${b ? '' : yardim('Önce taslağı kaydet; sonra belgeni yükleyip incelemeye gönder.')}` })}
    <div class="kart panel" data-belge-kart${b ? '' : ' hidden'}>
      <div class="kart-bas"><div><h2 class="kart-baslik">${ikon('fa-file-shield')} Doğrulama Belgesi</h2><p>PDF, JPG veya PNG; en fazla 10 MB.</p></div></div>
      <div class="kart-govde"><div class="ayar-liste" data-belge-liste>${(d.belgeler ?? []).map(belgeSatir).join('')}</div>
      <form data-belge-form novalidate data-yerel>${secim('belgeTur', 'Tür', V.BELGE_TURU, 'vergi_levhasi', { ad2: 'tur' })}<div class="alan"><span class="alan-etiket" id="belgeDosyaEtiket">Belge dosyası</span><div class="gorsel-satir"><label class="dugme hayalet kucuk" for="belgeDosya">${ikon('fa-file-arrow-up')} Belge seç</label><input class="dosya-girdi" type="file" id="belgeDosya" name="dosya" accept=".pdf,.jpg,.jpeg,.png" aria-labelledby="belgeDosyaEtiket"><span class="alan-yardim" data-dosya-ad>Dosya seçilmedi</span></div></div><button class="dugme hayalet tam-en" type="submit">${ikon('fa-upload')} Belgeyi yükle</button></form></div>
    </div>
  </div></aside>`;
  const duzenle = Boolean(b);
  const govde = `<a class="geri-bag" href="${K}isletme/basvurular/">${ikon('fa-arrow-left')} Başvurular</a>
${bas(`<span data-basvuru-baslik>${duzenle ? `Başvuru #${b.no} · ${b.gorunen_ad}` : 'İşletmeni ekle'}</span>`, `Ticari bilgileri doğru ve güncel paylaş. Taslak kaydedebilir, hazır olduğunda incelemeye gönderebilirsin.${b ? ' ' + et : ''}`)}
<div class="bilgi-notu hata-notu" role="alert" data-basvuru-hata hidden>${ikon('fa-circle-exclamation')}<p></p></div>
<div class="form-duzen">${form}${yan}</div>
${cubuk(duzenle ? (gonderilebilir ? 'Düzenlenebilir' : 'İncelemedeki başvuru düzenlenemez') : 'Kaydedilmedi', `<button class="dugme hayalet" type="submit" form="vaForm" data-basvuru-kaydet${gonderilebilir ? '' : ' disabled'}>${ikon('fa-floppy-disk')} Taslağı kaydet</button><button class="dugme birincil" type="button" data-basvuru-gonder${duzenle && gonderilebilir ? '' : ' disabled'}>${ikon('fa-paper-plane')} İncelemeye gönder</button>`)}`.replace('<form class="kart panel" data-basvuru-form', '<form class="kart panel" id="vaForm" data-basvuru-form');
  const yol = b ? `isletme/basvurular/${b.no}/duzenle` : 'isletme/basvurular/yeni';
  return sayfa(yol, 'basvurular', b ? 'Başvuruyu düzenle' : 'İşletme ekle', govde, { donor: DONOR + '; canlı /isletme/basvurular form (IsletmeBasvuruKaydetIstegi)', ilIlce: true });
}

// ── 11 · Değişiklik talepleri (portaldan) ───────────────────────────────────
function talepListesi() {
  const sat = (t) => `<tr><td><a href="${K}isletme/degisiklik-talepleri/${t.no}/"><b>Talep #${t.no}</b></a><small>${Object.keys(t.degisiklikler).filter((k) => k !== 'ad' && k !== 'not').map((k) => V.TALEP_ALAN[k]).join(', ') || 'İşletme adı'}</small></td><td data-etiket="Mekân">Mikla</td><td data-etiket="Gönderildi">${t.gonderildi} ${t.saat}</td><td data-etiket="Durum">${rozetH(V.TALEP_DURUM, t.durum)}</td><td class="eylem"><span class="satir-eylem"><a class="ikon-dugme" href="${K}isletme/degisiklik-talepleri/${t.no}/" aria-label="Talep #${t.no} gör">${ikon('fa-eye')}</a></span></td></tr>`;
  const govde = `${bas('Değişiklik Talepleri', 'Mekânının adı, adresi, telefonu ya da çalışma saatleri editör onayıyla değişir. Talep açarsın, ekibimiz inceleyip karar verir; bir talep incelemedeyken aynı mekâna yenisi açılmaz.', dugme('Yeni talep oluştur', { tur: 'birincil', i: 'fa-plus', href: 'isletme/degisiklik-talepleri/yeni/' }))}
<div class="kart panel">
  <div class="kart-bas"><div><h2 class="kart-baslik">${ikon('fa-pen-to-square')} Gönderdiklerin ${et}</h2><p>Mekân Profili'nde ad, adres ya da telefonu kaydettiğinde de buraya talep düşer.</p></div><span class="rozet pasif" data-talep-sayi>${V.TALEPLER.length} talep</span></div>
  <div class="kart-govde bosluksuz"><div class="tablo-kap gomulu"><table class="tablo panel dar-yigin" data-kolon-disiplin="1"><caption class="yalniz-okuyucu">Değişiklik talepleri</caption><thead><tr><th scope="col">Talep</th><th scope="col">Mekân</th><th scope="col">Gönderildi</th><th scope="col">Durum</th><th scope="col" class="eylem">İşlem</th></tr></thead><tbody id="talepTablo">${V.TALEPLER.map(sat).join('')}</tbody></table></div></div>
</div>`;
  return sayfa('isletme/degisiklik-talepleri', 'talepler', 'Değişiklik Talepleri', govde, { donor: DONOR + '; canlı /isletme/degisiklik-talepleri' });
}
function talepOlustur() {
  const m = V.MEKAN;
  const govde = `<a class="geri-bag" href="${K}isletme/degisiklik-talepleri/">${ikon('fa-arrow-left')} Değişiklik Talepleri</a>
${bas('Değişiklik talebi oluştur', 'Değişmesini istediğin alanı güncelle; boş bıraktığın ya da aynı kalan alan talebe girmez.')}
<form class="form-duzen" data-talep-form novalidate data-yerel id="dtForm">
  <div class="kart panel">
    ${bolum('fa-pen-to-square', 'İşletme bilgileri', `<div class="alan">${etiket('dt-mekan', 'Mekân', true)}<select class="alan-secim" id="dt-mekan" name="mekan_id" required><option value="Mikla">Mikla</option></select></div>
      ${girdi('dt-ad', 'İşletme adı', { ad2: 'ad', zorunlu: true, max: 160, deger: m.ad })}
      ${girdi('dt-adres', 'Adres', { ad2: 'adres', zorunlu: 'isteğe bağlı', max: 255, deger: `${m.acikAdres}, ${m.ilce}` })}
      ${girdi('dt-telefon', 'Telefon', { ad2: 'telefon', zorunlu: 'isteğe bağlı', max: 32, deger: m.telefon, ek: ' inputmode="tel"' })}
      ${girdi('dt-saat', 'Çalışma saatleri', { ad2: 'calisma_saatleri', zorunlu: 'isteğe bağlı', max: 255, deger: 'Pazartesi – Cumartesi 18.00 – 00.00, Pazar kapalı' })}
      ${metin('dt-not', 'Not', { ad2: 'not', zorunlu: 'isteğe bağlı', max: 2000, satir: 3, yer: 'Değişikliğin nedeni; varsa belgeyi nereden doğrulayabileceğimiz.' })}`)}
  </div>
  <aside class="form-yan">${kart({ baslik: 'Nasıl işler?', govde: `<div class="ayar-liste">${satir('fa-paper-plane', 'Gönderildi', 'Talep editöre düşer')}${satir('fa-magnifying-glass', 'İncelemede', 'Gerekirse belge isteriz')}${satir('fa-circle-check', 'Onaylandı · Uygulandı', 'Mekân sayfasına yansır')}</div>` })}</aside>
</form>
${cubuk('Talep gönderilmedi', `${dugme('Vazgeç', { href: 'isletme/degisiklik-talepleri/' })}<button class="dugme birincil" type="submit" form="dtForm">${ikon('fa-paper-plane')} Talebi gönder</button>`)}`;
  return sayfa('isletme/degisiklik-talepleri/yeni', 'talepler', 'Değişiklik talebi oluştur', govde, { donor: DONOR + '; DegisiklikTalebiIstegi' });
}
const talepGovde = ({ baslik, durum, tarih, satirlar, not, ek = '' }) => `<a class="geri-bag" href="${K}isletme/degisiklik-talepleri/">${ikon('fa-arrow-left')} Değişiklik Talepleri</a>
${bas(baslik, `Mikla için gönderdiğin talebin durumu. ${et}`)}
<div class="form-duzen"${ek}>
  <div class="kart panel">
    <div class="kart-bas"><div><h2 class="kart-baslik">${ikon('fa-pen-to-square')} Talep ettiğin değişiklikler</h2><p data-talep-tarih>${tarih}</p></div><span data-talep-durum>${durum}</span></div>
    <div class="kart-govde"><div class="deger-liste" data-talep-alanlar>${satirlar}</div></div>
  </div>
  <aside class="form-yan">${kart({ baslik: 'Karar notu', govde: `<p class="kart-metin" data-talep-not>${not || 'Henüz karar notu yok.'}</p>` })}</aside>
</div>`;
const alanSatir = (k, v) => `<div class="deger-satir"><span>${V.TALEP_ALAN[k] ?? k}</span><b>${kac(v)}</b></div>`;
function talepGoster(t) {
  return sayfa(`isletme/degisiklik-talepleri/${t.no}`, 'talepler', `Değişiklik talebi #${t.no}`, talepGovde({ baslik: `Değişiklik talebi #${t.no}`, durum: rozetH(V.TALEP_DURUM, t.durum), tarih: `Gönderildi ${t.gonderildi} ${t.saat}`, satirlar: Object.entries(t.degisiklikler).map(([k, v]) => alanSatir(k, v)).join(''), not: t.karar_notu }));
}
function talepGonderilen() {
  return sayfa('isletme/degisiklik-talepleri/gonderilen', 'talepler', 'Değişiklik talebi', talepGovde({ baslik: '<span data-talep-baslik>Değişiklik talebi</span>', durum: '<span class="durum-hapi bekleyen">Gönderildi</span>', tarih: 'Gönderildi', satirlar: '<div class="deger-satir"><span>Değişiklik</span><b>Bu tarayıcıda gönderilmiş talep yok</b></div>', not: '', ek: ' data-talep-goster' }));
}

// ── 12 · Ayarlar ────────────────────────────────────────────────────────────
function ayarlar() {
  const r = V.REZ_AYAR;
  const pencere = V.REZ_PENCERE.concat([{ gun: 7, bas: '', bit: '', kapasite: 0, etkin: false }]).map((p) => `<tr data-gun="${p.gun}"><td><b>${V.GUNLER[p.gun - 1]}</b></td><td data-etiket="Açık">${anahtar(`rp-${p.gun}`, V.GUNLER[p.gun - 1] + ' rezervasyon', p.etkin, ' data-rp="etkin"')}</td><td data-etiket="Başlangıç"><input class="alan-girdi" type="time" value="${p.bas || '18:00'}" aria-label="${V.GUNLER[p.gun - 1]} başlangıç" data-rp="bas"></td><td data-etiket="Bitiş"><input class="alan-girdi" type="time" value="${p.bit || '22:30'}" aria-label="${V.GUNLER[p.gun - 1]} bitiş" data-rp="bit"></td><td class="num" data-etiket="Kapasite"><input class="alan-girdi" type="number" min="0" max="500" value="${p.kapasite || r.kapasite}" aria-label="${V.GUNLER[p.gun - 1]} kapasite" data-rp="kapasite"></td></tr>`).join('');
  const govde = `${bas('Ayarlar', 'Rezervasyon kuralları ve işletme hesabın.')}
<form class="form-duzen" id="ayarForm" novalidate data-yerel>
  <div class="yigin">
    <div class="kart panel">
      <div class="kart-bas"><div><h2 class="kart-baslik">${ikon('fa-calendar-check')} Rezervasyon Kuralları</h2><p>Misafirin Mikla sayfasındaki rezervasyon adımı bu kurallarla çalışır.</p></div><label class="anahtar-etiketli">${anahtar('raEtkin', 'Rezervasyon alıyorum', r.etkin, ' name="etkin"')}<span>Rezervasyon alıyorum</span></label></div>
      <div class="kart-govde">
        <div class="alan-izgara c3">${girdi('raKapasite', 'Varsayılan kapasite (kişi)', { ad2: 'kapasite', tur: 'number', deger: String(r.kapasite), ek: ' min="1" max="500"', yard: 'Bir slotta aynı anda ağırlanan kişi.' })}${girdi('raAsgari', 'En az kişi', { ad2: 'asgari', tur: 'number', deger: String(r.asgari), ek: ' min="1" max="50"' })}${girdi('raAzami', 'En çok kişi', { ad2: 'azami', tur: 'number', deger: String(r.azami), ek: ' min="1" max="50"', yard: 'Üstü için misafir seni arar.' })}</div>
        <div class="alan-izgara c3">${secim('raSlot', 'Slot süresi', { 15: '15 dakika', 30: '30 dakika', 60: '60 dakika' }, String(r.slot), { ad2: 'slot' })}${secim('raOnceden', 'En geç ne kadar önce', { 60: '1 saat önce', 120: '2 saat önce', 240: '4 saat önce', 1440: '1 gün önce' }, String(r.onceden), { ad2: 'onceden' })}${secim('raIptal', 'Ücretsiz iptal', { 120: '2 saate kadar', 240: '4 saate kadar', 1440: '1 güne kadar' }, String(r.iptal), { ad2: 'iptal' })}</div>
      </div>
    </div>
    <div class="kart panel">
      <div class="kart-bas"><div><h2 class="kart-baslik">${ikon('fa-table-cells')} Rezervasyon Pencereleri</h2><p>Hangi gün hangi saatler arasında masa verdiğin. Çalışma saatlerinin içinde kalır.</p></div></div>
      <div class="kart-govde bosluksuz"><div class="tablo-kap gomulu"><table class="tablo panel etiketli-yigin" data-kolon-disiplin="1"><caption class="yalniz-okuyucu">Rezervasyon pencereleri</caption><thead><tr><th scope="col">Gün</th><th scope="col">Açık</th><th scope="col">Başlangıç</th><th scope="col">Bitiş</th><th scope="col" class="num">Kapasite</th></tr></thead><tbody id="pencereTablo">${pencere}</tbody></table></div></div>
    </div>
  </div>
  <aside class="form-yan">
    <div class="yigin">
      ${kart({ baslik: 'İşletme Hesabı', govde: `<div class="deger-liste"><div class="deger-satir"><span>Görünen ad</span><b>Mikla</b></div><div class="deger-satir"><span>Ticari unvan</span><b>Örnek Gıda ve Turizm A.Ş.</b></div><div class="deger-satir"><span>Vergi no</span><b>••••••••87</b></div><div class="deger-satir"><span>Durum</span><b><span class="durum-hapi cozulen">Etkin</span></b></div></div>${yardim('Ticari bilgiler başvuruyla doğrulandı; değişiklik için <a href="' + K + 'isletme/degisiklik-talepleri/yeni/">talep aç</a>.')}` })}
      ${kart({ baslik: 'Yetkililer', govde: `<div class="ayar-liste">${satir('fa-user-tie', '{{uye.ad}}', 'Sahip · {{uye.eposta}}', { uc: '<span class="as-eylem"><span class="durum-hapi cozulen">Etkin</span></span>' })}</div>${yardim('Çalışan daveti bu sürümde yok.')}` })}
      ${kart({ baslik: 'Oturum', govde: `<div class="ayar-liste">${satir('fa-sliders', 'Hesap ayarları', 'Ad, e-posta ve şifre üye hesabında', { href: 'hesabim/ayarlar/' })}</div>` })}
    </div>
  </aside>
</form>
${cubuk('Kaydedilmiş ayarlar', `${dugme('Vazgeç', { ek: ' data-ayar="vazgec"' })}${dugme('Ayarları kaydet', { tur: 'birincil', i: 'fa-floppy-disk', ek: ' data-ayar="kaydet"' })}`)}`;
  return sayfa('isletme/ayarlar', 'ayarlar', 'Ayarlar', govde, { donor: DONOR + '; RezervasyonAyari, RezervasyonPenceresi, Isletme, IsletmeUyeligi' });
}

export default function () {
  return [genelBakis(), profil(), menu(), fotograflar(), saatler(), rezervasyonlar(), etkinlikler(), degerlendirmeler(), istatistikler(),
    basvurular(), basvuruFormu(null), ...V.BASVURULAR.map(basvuruFormu),
    talepListesi(), talepOlustur(), ...V.TALEPLER.map(talepGoster), talepGonderilen(), ayarlar()];
}
