// Gourmet'e özel ekranlar. `node sayfa-gourmet.mjs <cekim>/dom <eski-referans-sayfa-dom.html>`
// Gövde canlı Gourmet render'ından gelir (sınıf kümesi Gastro ile aynı soydan). Şartnameye göre değişen parçalar burada, satır satır.
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { ac, kapat } from './dom.mjs';
const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'); const D = process.argv[2]; const REF = process.argv[3];
const yaz = (y, meta, govde) => { const f = path.join(SRC, 'sayfalar', y + '.html'); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, `<!--${JSON.stringify({ yol: y.replace(/\/?index$/, ''), ...meta })}-->\n${govde}\n`); };
const dom = (f) => path.join(D, f + '.html');

// --- Ana sayfa ---
let p = await ac(dom('o-etkinlikler'));
const trKart = await p.evaluate(() => { kok(document.body); return [...document.querySelectorAll('article.ev-card')].filter((k) => /Türkiye/.test(k.textContent)).slice(0, 4).map((k) => k.outerHTML); });
p = await ac(dom('o-home'));
yaz('index', { yol: '', baslik: 'Lezzetin rotasını keşfet', zincir: 'hakkimizda', gourmet: true, css: ['anasayfa.css', 'gourmet-sapma'], js: ['assets/js/sayfa/ana.js'], govdeSinif: 'pg-anasayfa', donor: 'https://dadagourmet.com/ (gövde) + https://dadagastro.com/ (kabuk)' }, await p.evaluate(({ trKart }) => { kok(document.body); const m = document.querySelector('main');
  // K6: "saklı esnaf" sözü içerik eşiği dolana kadar kalkar
  metin(m, /Saklı esnaf lokantalarından lezzet rotalarına — Türkiye'nin lezzet haritası, sana göre\./, 'Şef masalarından yerel lezzet noktalarına, şehir şehir rotalara: Türkiye\'nin lezzet haritası sana göre.');
  metin(m, /manzaralı sofradan saklı esnaf lokantasına\./, 'manzaralı sofradan yerel lezzet noktasına.');
  // K8: sıfır sonuçlu konsept gizli. Vitrin dengesi: yerel ve tarihi önce, lüks sonra (W1.2)
  const t = m.querySelector('#conceptTrack'); const kartlar = [...t.children];
  const say = (k) => parseInt((k.textContent.match(/(\d+)\s*mekân/) || [0, 0])[1], 10);
  kartlar.filter((k) => say(k) === 0).forEach((k) => k.remove());
  const sira = ['Yerel Lezzet Noktası', 'Tarihi', 'Geleneksel', 'Taş Konak', 'Doğa İçinde', 'Butik', 'Bahçeli', 'Şef Restoranı', 'Modern', 'Manzaralı', 'Deniz Kenarı', 'Teraslı', 'Lüks', 'Sanat ve Kültür', 'Dağ / Yayla'];
  const yer = (k) => { const i = sira.findIndex((s) => k.textContent.includes(s)); return i < 0 ? 99 : i; };
  [...t.children].sort((a, b) => yer(a) - yer(b)).forEach((k) => t.appendChild(k));
  // K6 ve K8: Esnaf çipi kalkar; Kahvaltı mutfak seçeneği 0 sonuçlu, sayaçlı kullanım amacına gider
  m.querySelectorAll('.gm-facet').forEach((a) => { if (/Esnaf/.test(a.textContent)) a.parentNode.removeChild(a); else if (/Kahvaltı/.test(a.textContent)) a.setAttribute('href', '{{kok}}mekanlar/?vesile=kahvalti'); else if (/Kebap/.test(a.textContent)) a.setAttribute('href', '{{kok}}mekanlar/?mutfak=kebap-ocakbasi'); else if (/Deniz/.test(a.textContent)) a.setAttribute('href', '{{kok}}mekanlar/?mutfak=deniz-urunleri'); });
  // W1.3a: vitrinde önce Türkiye'deki etkinlikler
  if (trKart.length) m.querySelector('#evTrack').innerHTML = trKart.join('');
  return m.innerHTML; }, { trKart }));

// --- Mekânlar ---
// Ülke → Şehir → İlçe → Semt: İlçe ve Semt grupları canlıda seçimle gelir; aynı DOM statik olarak bir örnek şehir için alınır
p = await ac(dom('o-il'));
const ilceGrup = await p.evaluate(() => { const g = document.querySelectorAll('.mkl-fct-location .fct-sub')[1]; g.querySelectorAll('label.fct-row').forEach((l) => { if (l.querySelector('.fcnt')?.textContent.trim() === '0') l.remove(); }); return g.outerHTML; });
p = await ac(dom('o-ilce'));
const semtGrup = await p.evaluate(() => document.querySelectorAll('.mkl-fct-location .fct-sub')[2].outerHTML);
p = await ac(dom('o-mekanlar'));
yaz('mekanlar/index', { baslik: 'Mekânlar', aktif: 'mekanlar', zincir: 'hakkimizda', gourmet: true, css: ['gourmet-mekan-liste.css', 'banner-uyarlama.css', 'ikon-uyarlama.css', 'mekan-karti-uyarlama.css', 'mekan-filtre-paneli-uyarlama.css', 'gourmet-sapma'], js: ['assets/vendor/maplibre/maplibre-gl.js', 'assets/js/mekan-liste-veri.js', 'assets/js/harita.js', 'assets/js/sayfa/mekanlar.js'], govdeSinif: 'pg-mekanlar', donor: 'https://dadagourmet.com/mekanlar + filtre dokümanı §16-18' }, await p.evaluate(({ ilceGrup, semtGrup }) => { kok(document.body); const m = document.querySelector('main'); const $$ = (s, r = m) => [...r.querySelectorAll(s)];
  // K8: sıfır sonuçlu seçenek gizli (ülke seçeneği dahil)
  $$('label.fct-row').forEach((l) => { const c = l.querySelector('.fcnt'); if (c && c.textContent.trim() === '0') l.remove(); });
  $$('.subcat').forEach((a) => { if (/(^|\D)0\s+mekân/.test(a.textContent)) a.remove(); });
  const ulke = m.querySelector('#mklUlke'); [...ulke.options].forEach((o) => { if (/\(0\)/.test(o.textContent)) o.remove(); });
  // Grup adları: doküman §16 sırası ve adları
  const adlar = { 'Kategori': 'Mekân Kategorisi', 'Konsept': 'Mekân Konsepti', 'Mutfak': 'Mutfak Türü', 'Kullanım Amacı': 'Deneyim ve Kullanım Amacı', 'Fiyat': 'Fiyat Aralığı', 'Puan': 'Puan ve Değerlendirme', 'Hizmetler': 'Hizmet ve Özellikler', 'Beslenme': 'Beslenme Tercihleri', 'Ulaşım': 'Ulaşım ve Erişilebilirlik', 'Açık Olma': 'Açık Olma Durumu', 'Seçkiler': 'Dada Seçkileri' };
  const gruplar = $$('.sheet-body > .fct');
  gruplar.forEach((g) => { const h = g.querySelector(':scope > .fct-head'); [...h.childNodes].forEach((n) => { if (n.nodeType === 3 && adlar[n.textContent.trim()]) n.textContent = ' ' + adlar[n.textContent.trim()] + ' '; }); h.querySelectorAll('span:not(.fct-dot)').forEach((s) => { if (adlar[s.textContent.trim()]) s.textContent = adlar[s.textContent.trim()]; }); });
  // Enerji ve Araç Şarj (F10): grup canlıda yok, doküman ister. Kap aynı grup DOM'u; canlı sayaç olmadığı için sayı basılmaz
  const ornek = gruplar.find((g) => /Beslenme/.test(g.querySelector('.fct-head').textContent)); const enerji = ornek.cloneNode(true);
  const eh = enerji.querySelector('.fct-head'); eh.querySelector('.fct-head-ico').className = 'fa-solid fa-charging-station fct-head-ico';
  [...eh.childNodes].forEach((n) => { if (n.nodeType === 3 && n.textContent.trim()) n.textContent = ' Enerji ve Araç Şarj '; }); eh.querySelectorAll('span:not(.fct-dot)').forEach((s) => (s.textContent = 'Enerji ve Araç Şarj'));
  const satir = enerji.querySelector('label.fct-row'); const gov = enerji.querySelector('.fct-body'); const kalip = satir.cloneNode(true); gov.innerHTML = '<p class="fct-not"><span class="ornek-etiket">prototip örneği</span> Mekân başına şarj verisi henüz yok; bu grup süzmez.</p>';
  ['Elektrikli Araç Şarj Noktası Var', 'Yakınında Şarj İstasyonu', 'AC Şarj', 'DC Hızlı Şarj', 'Şarj Sırasında Yemek Yeme İmkânı'].forEach((a, i) => { const r = kalip.cloneNode(true); r.querySelector('.ft').textContent = a; r.querySelector('.fcnt')?.remove(); const inp = r.querySelector('input'); inp.name = 'sarj-ornek'; inp.value = 'ornek-' + i; inp.checked = false; inp.disabled = true; gov.appendChild(r); });
  const ulasim = gruplar.find((g) => /Ulaşım/.test(g.querySelector('.fct-head').textContent)); ulasim.before(enerji);
  // Kart: FK.10-13 eylemleri ve üç sütun için harita alanı
  $$('article.mkl-card').forEach((k) => { const slug = (k.getAttribute('data-git') || '').replace(/.*mekan\//, '').replace(/\/$/, ''); k.dataset.slug = slug;
    k.insertAdjacentHTML('beforeend', `<div class="mkl-kart-eylem"><a class="mke-birincil" href="{{kok}}mekan/${slug}/">Detayları Gör</a><button type="button" class="mke-ikon" data-haritada="${slug}" aria-label="Haritada Göster" title="Haritada Göster"><i class="fa-solid fa-map-location-dot" aria-hidden="true"></i></button><a class="mke-ikon" href="{{kok}}dada-route/?durak=${slug}" aria-label="Dada Route'a Ekle" title="Dada Route'a Ekle"><i class="fa-solid fa-route" aria-hidden="true"></i></a><button type="button" class="mke-ikon" data-lg-gate="" aria-label="Kaydet" title="Kaydet"><i class="fa-regular fa-bookmark" aria-hidden="true"></i></button></div>`); });
  const sehir = m.querySelector('.mkl-fct-location .fct-sub'); sehir.dataset.konum = 'sehir';
  sehir.insertAdjacentHTML('afterend', ilceGrup.replace('class="fct fct-sub', 'hidden data-konum="ilce" class="fct fct-sub') + semtGrup.replace('class="fct fct-sub', 'hidden data-konum="semt" class="fct fct-sub'));
  m.querySelector('.lst-bar').insertAdjacentHTML('afterend', '<div class="mkl-secili" id="mklSecili" hidden></div>');
  const lay = m.querySelector('.lst-layout'); lay.classList.add('mkl-uc-kolon');
  lay.insertAdjacentHTML('beforeend', '<aside class="mkl-harita-kolon" aria-label="Harita"><div id="mklMapKolon" class="mkl-harita" data-harita="liste"></div><p class="mkl-harita-not"><span class="ornek-etiket">prototip örneği</span> MapLibre; konumlar canlı mekân verisinden, statik kopya.</p></aside>');
  return m.innerHTML; }, { ilceGrup, semtGrup }));

// --- Mekân detayı: Mikla (canlı) + K2 parçaları (eski referans DOM'u) ---
p = await ac(REF);
const ref = await p.evaluate(() => { const r = document.querySelector('#rsvModal'); r.querySelectorAll('input[name="_token"]').forEach((e) => e.remove()); return { modal: r.outerHTML, overlay: document.querySelector('#rsvOverlay').outerHTML }; });
p = await ac(dom('o-mikla'));
const detay = await p.evaluate(({ ref }) => { kok(document.body); const m = document.querySelector('main'); const et = '<span class="ornek-etiket">prototip örneği</span>';
  // K2: Rezervasyon geri gelir; künye düğmeleri (Yol Tarifi Al, Kaydet) gelmez. Metin talep dilinde (§8 #17 açık)
  const ara = m.querySelector('a.kc-reserve'); ara.classList.remove('btn-primary'); ara.classList.add('btn-ghost');
  ara.insertAdjacentHTML('beforebegin', `<button class="btn btn-primary kc-reserve" id="openRsv" type="button"><i class="fa-solid fa-calendar-check" aria-hidden="true"></i> Rezervasyon Talebi Gönder</button><p class="kc-rez-not">Talebin mekân sahibine iletilir, onayıyla kesinleşir. ${et}</p>`);
  // Ne Yenir / Ne Alınır: W2.2a, W2.2b, W3.3. Veri yok; yapı örnek etiketli, görsel uydurulmaz
  const tabak = (a, b) => `<article class="ny-kart"><span class="ny-fig" aria-hidden="true"><i class="fa-solid fa-utensils"></i></span><div class="ny-govde"><h4>${a}</h4><p>${b}</p><button class="btn btn-ghost ny-eylem" type="button" data-lg-gate=""><i class="fa-regular fa-heart" aria-hidden="true"></i> Favorilere Ekle</button></div></article>`;
  const urun = (a, b) => `<article class="ny-kart"><span class="ny-fig" aria-hidden="true"><i class="fa-solid fa-jar"></i></span><div class="ny-govde"><h4>${a}</h4><p>${b}</p><button class="btn btn-ghost ny-eylem" type="button" data-lg-gate=""><i class="fa-solid fa-route" aria-hidden="true"></i> Rotama Ekle</button></div></article>`;
  const tabs = m.querySelector('#mdTabs'); const dt = tabs.querySelector('.dt'); const yeni = (ad, hedef) => { const b = dt.cloneNode(true); b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); [...b.attributes].forEach((a) => { if (a.value === dt.getAttribute(a.name) && /tab|pane|target/.test(a.name)) b.setAttribute(a.name, hedef); }); b.textContent = ad; return b; };
  const ilk = m.querySelector('.md-main > [id^="pane-"], .md-main > .pane, .md-main > div');
  const paneSinif = ilk.className.replace(/\b(active|show|on)\b/g, '').trim(); const anahtar = Object.values(dt.dataset)[0];
  const panel = (id, baslik, altb, kartlar) => `<div class="${paneSinif}" id="${ilk.id.replace(/-[^-]*$/, '-') + id}"><section class="ny-bolum"><div class="ny-bas"><h3>${baslik}</h3>${et}</div><p class="ny-alt">${altb}</p><div class="ny-izgara">${kartlar}</div></section></div>`;
  const b1 = yeni('Ne Yenir?', 'neyenir'), b2 = yeni('Ne Alınır?', 'nealinir'); dt.after(b1, b2);
  Object.keys(dt.dataset).forEach((k) => { b1.dataset[k] = 'neyenir'; b2.dataset[k] = 'nealinir'; });
  ilk.insertAdjacentHTML('afterend', panel('neyenir', 'Ne Yenir?', 'Bu mekânda denenmesi önerilen en fazla üç tabak.', tabak('Örnek imza tabak', 'İşletme veya editör girince burada görünür.') + tabak('Örnek yöresel tabak', 'Kısa tabak açıklaması bu alana gelir.') + tabak('Örnek mevsim tabağı', 'Kısa tabak açıklaması bu alana gelir.')) + panel('nealinir', 'Ne Alınır?', 'Bölgeden paketli yerel ürünler. Bu sürümde bilgi ve yönlendirme var, satış yok.', urun('Örnek paketli ürün', 'Üretici veya kooperatif adı burada görünür.') + urun('Örnek yerel ürün', 'Kaynak ve doğrulama tarihi burada görünür.')));
  // K2: Dada Route bandı geri gelir (eski yer: yan sütundan sonra, benzer mekânlardan önce)
  m.querySelector('section.md-sec').insertAdjacentHTML('afterend', `<section class="md-rota-bant"><div class="wrap"><div class="md-rota-kutu"><span class="md-rota-ikon"><i class="fa-solid fa-route" aria-hidden="true"></i></span><div class="md-rota-metin"><b>Bu mekân yol üstünde mi?</b><span>Nereden nereye gittiğini yaz, güzergâhın boyunca uğrayabileceğin mekânları haritada gör.</span></div><a class="btn btn-primary" href="{{kok}}dada-route/?durak=mikla">Güzergâhını Planla <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a></div></div></section>`);
  m.querySelectorAll('.map-mock').forEach((e) => { e.innerHTML = ''; e.className = 'map-mock'; e.removeAttribute('style'); e.removeAttribute('tabindex'); });
  metin(m, /Mekan/g, 'Mekân');
  return m.innerHTML; }, { ref });
const katman = await p.evaluate(() => { kok(document.body); return ['#vdActbar', '#lightbox'].map((s) => document.querySelector(s)?.outerHTML ?? '').join('\n'); });
// Konum penceresi canlıda her sayfada var: kabuk parçası olur, `prototip.js` sürer
fs.writeFileSync(path.join(SRC, 'parcalar/kabuk/konum.html'), await p.evaluate(() => ['#lkOverlay', '#lkModal'].map((s) => { const e = document.querySelector(s); ['data-set-url', 'data-dismiss-url'].forEach((a) => e.removeAttribute(a)); return e.outerHTML; }).join('\n')));
const rezervasyon = ref.overlay + '\n' + ref.modal.replace(/http:\/\/127\.0\.0\.1:8420\/mekanlar\/[a-z-]+\/rezervasyon/, '').replace(/Rezervasyon Yap/g, 'Rezervasyon Talebi').replace(/Rezervasyonu Onayla/g, 'Talebi Gönder').replace(/Rezervasyon koşulları işletmeye/g, 'Rezervasyon koşulları mekâna').replace(/Zeytinlik Sofrası/g, 'Mikla').replace(/ action=""/, ' data-prototip-form').replace(/Cuma ve Cumartesi akşamları[^<]*/, 'Rezervasyon koşulları işletmeye göre değişir.').replace(/style="background-image:url\([^)]*\)"/, '').replace(/http:\/\/127\.0\.0\.1:8420/g, '');
const takvim = `<script type="application/json" id="mdCalendarData">{}</script>`;
yaz('mekan/mikla/index', { baslik: 'Mikla', aktif: 'mekanlar', zincir: 'hakkimizda', gourmet: true, css: ['mekan-detay.css', 'shared/scroll-affordance.css', 'mekan-detay-uyarlama.css', 'mekan-karti-uyarlama.css', 'gourmet-sapma'], js: ['assets/vendor/maplibre/maplibre-gl.js', 'assets/js/harita.js', 'assets/o/assets/gourmet-public/js/shared/scroll-affordance.js', 'assets/js/sayfa/rez-takvim.js', 'assets/o/assets/gourmet-public/js/mekan-detay.js'], govdeSinif: 'pg-mekan-detay', donor: 'https://dadagourmet.com/mekan/mikla + Backend Projects/dadagourmet/docs/referans-mekan-detay/sayfa-dom.html (K2)' }, detay + '\n<!--@main-disi-->\n' + katman + '\n' + rezervasyon + '\n' + takvim);

// --- Hesabım: yerel Gastro 6700538df4 demo üye render'ı, 8 sekme. Marka içeriği olan beş pane (Bildirim, Dil, Bağlı, Veri, Dondurma) Gourmet donöründen; 2FA yok (K4) ---
p = await ac(dom('op-hesabim'));
const oh = await p.evaluate(() => { const m = document.querySelector('main'); const al = (id) => { const e = m.querySelector(id); e.querySelectorAll('a[href]').forEach((a) => { const h = a.getAttribute('href'); if (/\.html/.test(h)) a.setAttribute('href', '#'); }); return e.innerHTML; }; return { bildirim: al('#hs-pane-bildirim'), bagli: al('#hs-pane-bagli'), dil: al('#hs-pane-dil'), veri: al('#hs-pane-veri'), dondur: al('#hs-pane-dondur') }; });
p = await ac(dom('gl-hesabim'));
// Tohum kimliği çekimden okunur, betikte yazılmaz
const tohum = await p.evaluate(() => { const d = (n) => document.querySelector(`input[name="${n}"]`)?.getAttribute('value') ?? '-'; return { k: document.querySelector('input[name="kullanici_adi"],input[name="kullanici-adi"],#kullanici-adi')?.getAttribute('value') ?? '-', ad: `${d('ad')} ${d('soyad')}` }; });
const hesap = await p.evaluate(({ oh, tohum }) => {
  const KREG = new RegExp(tohum.k, 'g'), EPOSTA = /[a-z0-9._-]+@[a-z0-9.-]+\.test\b/g, TOHUM_ALAN = /[a-z0-9-]+\.test\b/g;
  document.querySelectorAll('[data-yama]').forEach((e) => e.removeAttribute('data-yama'));
  kok(document.body); const m = document.querySelector('main'); const $ = (s, r = m) => r.querySelector(s), $$ = (s, r = m) => [...r.querySelectorAll(s)];
  const sil = (e) => e.parentNode?.removeChild(e);
  ['bildirim', 'bagli', 'dil', 'veri', 'dondur'].forEach((a) => { $('#hs-pane-' + a).innerHTML = oh[a]; });
  $$('link,style').forEach(sil);
  const kp = $('.kimlik-bant .kapak'); kp.removeAttribute('style'); kp.classList.remove('is-bos');
  $$('a[href*="sefler/"]').forEach((a) => a.setAttribute('href', '#'));
  // Kimlik: tohum kişi depoya girmez
  const k = $('.kimlik'); $$('.kimlik-avatar,.kimlik-avatar *', k).forEach((e) => { if (e.children.length === 0 && e.textContent.trim().length === 1) e.textContent = 'Ö'; });
  $('h1', k).childNodes.forEach((n) => { if (n.nodeType === 3 && n.textContent.trim()) n.textContent = 'Örnek Üye '; }); $$('h1 .rozet', k).forEach(sil);
  $('h1', k).insertAdjacentHTML('afterend', '<span class="ornek-etiket">prototip örneği</span>');
  metin(m, /^\s*S\s*$/, 'Ö'); metin(k, /Rozet \d+/, 'Rozet 0'); metin(m, TOHUM_ALAN, 'eposta.com'); metin(m, /^\s*\d+ \/ 160\s*$/, '0 / 160');
  $$('.alan').forEach((a) => { if (/Uzmanlık alanım/.test(a.textContent)) sil(a); });
  const g = $('.kimlik-giris', k); if (g) g.textContent = 'Profilin, keşif ve bildirim tercihlerin, güvenliğin burada; hesabını dondurma ve silme de. Paketin Paketlerim\'de, faturaların Ödemelerim\'de.';
  $$('input').forEach((i) => { const v = i.getAttribute('value') ?? ''; if (i.name === 'ad' || i.name === 'soyad' || v.includes(tohum.k)) i.setAttribute('value', { ad: 'Örnek', soyad: 'Üye' }[i.name] ?? (/@/.test(v) ? 'ornek@eposta.com' : 'ornekuye')); });
  $$('textarea').forEach((t) => { t.textContent = ''; t.removeAttribute('value'); });
  // Keşif tercihlerim: Gastro'nun "Mutfak tercihlerim" yuvası ve DOM'u. Malzeme alanı mekân keşfinde karşılıksız, çıkar
  const tb = $('nav.sekmeler [data-tab="tercihler"]'); [...tb.childNodes].forEach((n) => { if (n.nodeType === 3 && n.textContent.trim()) n.textContent = ' Keşif tercihlerim'; });
  const tp = $('#hs-pane-tercihler'); $$('fieldset,details,.ayar-grup,.tercih-grup,.tercih-bolum', tp).forEach((e) => { if (/Sevmediklerin|Sihirbazda malzeme/.test(e.textContent) && !/Beslenme şeklin/.test(e.textContent)) sil(e); });
  $$('a,button', tp).forEach((e) => { if (/sihirbaz/i.test(e.textContent)) sil(e); });
  // Güvenlik: bağlı olmayan sosyal sağlayıcı görünmez; uygulama olmadığı için cihaz adı değişir
  $$('#guvenlik .ayar-satir').forEach((s) => { if (/Google hesabı|Facebook hesabı|Apple hesabı/.test(s.textContent)) sil(s); });
  const degis = [[/DadaGastro uygulaması/g, 'Safari'], [EPOSTA, 'ornek@eposta.com'], [KREG, 'ornekuye'], [new RegExp(tohum.ad, 'g'), 'Örnek Üye'], [/\/sefler\/ornekuye/g, '/uye/ornekuye'], [/şifre değişikliği ve iki adımlı doğrulama işlemleri/g, 'şifre değişikliği işlemleri'],
    [/Adın ve fotoğrafın yayımladığın tariflerde, yorumlarında ve herkese açık şef profilinde görünür/g, 'Adın ve fotoğrafın yorumlarında ve herkese açık profilinde görünür'], [/Herkese açık şef profilinin adresi/g, 'Herkese açık profilinin adresi'], [/\bşef profilinde\b/g, 'profilinde'],
    [/Mutfak geçmişimi/g, 'Keşif geçmişimi'], [/mutfak geçmişinin/g, 'keşif geçmişinin'], [/Denediğin tarifler, yazdığın yorumlar ve oluş[^.]*/g, 'Ziyaret ettiğin mekânlar, yazdığın yorumlar ve listelerin'], [/Tarif ve menü verinin/g, 'Mekân ve liste verinin'],
    [/Tarif listelerini/g, 'Mekân listelerini'], [/tarif listeleri, arama ve Ne Pişirsem/g, 'mekân listeleri, arama ve Mekân Bul'], [/tarif listeleri/g, 'mekân listeleri'], [/içeren tarifleri gizleriz/g, 'uymayan mekânları sona alırız'], [/tarifleri bana göre/g, 'mekânları bana göre'], [/Alerjen seçimin Dada Gastro Health ile ortaktır/g, 'Alerjen seçimin bu hesapta saklanır'], [/Mutfak tercihlerim/g, 'Keşif tercihlerim'], [/yayındaki tariflerin/g, 'paylaştığın listelerin'],
    [/DadaGastro/g, 'Dada Gourmet'], [/Dada Gastro/g, 'Dada Gourmet'], [/DadaGourmet/g, 'Dada Gourmet']];
  degis.forEach(([a, b]) => metin(m, a, b));
  // Bildirim, Dil, Bağlı, Veri, Dondurma: yapı kalır, metin Gourmet bağlamına uyarlanır
  const BAGLAM = [["Rezervasyon hatırlatmaları randevu saatine göre gönderilir.", "Rezervasyon talebi hatırlatmaları onaylanan saate göre gönderilir."], ["Rezervasyon hatırlatmalarının", "Rezervasyon talebi hatırlatmalarının"], ["Rezervasyon hatırlatması", "Rezervasyon talebi hatırlatması"], ["Rezervasyonunun vaktinden 30 dakika önce.", "Mekân sahibinin onayladığı talebinin saatinden 30 dakika önce."], ["Rota günü ve keşif görevi", "Rota günü ve favori mekân"], ["Keşif görevi durumu", "Favori mekân ve etkinlik"], ["Katıldığın keşif görevinde kalan gün, serin ve telafi hakkın.", "Favori mekânında yenilik olduğunda ya da kaydettiğin etkinlik yaklaştığında."], ["Rehber mesajı ve randevu", "Rezervasyon talebi yanıtı"], ["Rehberinden mesaj geldiğinde, randevu onaylandığında ya da yaklaştığında.", "Mekân sahibi talebini onayladığında ya da yanıtladığında."], ["Kampanya ve Dada Gourmet Pro fırsatları", "Kampanya ve mekân fırsatları"], ["Paket indirimleri ve özel dönem seçkileri.", "Mekân kampanyaları ve özel dönem seçkileri."], ["Randevu hatırlatması", "Rezervasyon talebi hatırlatması"], ["Rezervasyon ve etkinlik kaydı", "Rezervasyon talebi ve etkinlik kaydı"], ["Rehberinle yazışman ve randevu kayıtların", "Mekân sahibiyle yazışman ve rezervasyon taleplerin"], ["Rezervasyon kayıtları", "Rezervasyon talebi kayıtları"], ["Rezervasyon kaydı", "Rezervasyon talebi kaydı"], ["Takvimindeki rezervasyonlar Ziyaret Günlüğü'ne düşer. Kapatırsan rezervasyon satırı", "Takvimindeki rezervasyon talepleri Ziyaret Günlüğü'ne düşer. Kapatırsan talep satırı"], ["Google Takvim'deki rezervasyon ve etkinlik kayıtların", "Google Takvim'deki rezervasyon talebi ve etkinlik kayıtların"], ["Rezervasyon, etkinlik, ziyaret ve yaklaşık yol süresi", "Rezervasyon talebi, etkinlik, ziyaret ve yaklaşık yol süresi"], ["Rezervasyon, takvim ve kayıt listelerinde", "Rezervasyon talebi, takvim ve kayıt listelerinde"], ["Amaç bazlı izinler, rehberinin gördükleri, saklama süresi", "Amaç bazlı izinler, saklama süresi"], ["tutulduğu, rehberinin ne gördüğü, saklama süresi", "tutulduğu, saklama süresi"], ["keşif görevi katılımı, mesajlar", "favori mekân, etkinlik kaydı, rezervasyon talebi"], ["Keşif görevi katılımları", "Etkinlik kayıtları"], ["Rehber mesajları ve dosyalar", "Rezervasyon talebi yazışmaları"], ["Rehber yalnız kendi danışanını görür; yönetim erişimi", "Mekân sahibi yalnız kendi mekânına gelen talebi görür; yönetim erişimi"], ["profilin ve keşif görevi katılımların gizlenir, serin durur ve rehber randevuların iptal edilir.", "profilin ve listelerin gizlenir, bekleyen rezervasyon taleplerin iptal edilir."], ["Dada Gourmet Pro üyeliği otomatik durmaz.", "Aktif paketin otomatik durmaz."], ["randevularımın iptal edileceğini ve Pro tahsilatının", "rezervasyon taleplerimin iptal edileceğini ve paket tahsilatının"], ["listelerin, rozetlerin ve rehber yazışmaların", "favori mekânların, listelerin, rozetlerin ve talep yazışmaların"], ["Aktif Dada Gourmet Pro üyeliğin ve rehber paketlerin", "Aktif paketin ve bekleyen rezervasyon taleplerin"]].map(([a, b]) => [new RegExp(a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '\\s+'), 'g'), b]);
  BAGLAM.forEach(([a, b]) => { metin(m, a, b); $$('[aria-label],[title]').forEach((e) => ['aria-label', 'title'].forEach((n) => { const v = e.getAttribute(n); if (v && a.test(v)) e.setAttribute(n, v.replace(a, b)); a.lastIndex = 0; })); });
  $$('[title],[placeholder],[aria-label],[data-eposta]').forEach((e) => { ['title', 'placeholder', 'aria-label', 'data-eposta'].forEach((a) => { const v = e.getAttribute(a); if (v && (v.includes(tohum.k) || /Gastro/.test(v))) e.setAttribute(a, v.replace(EPOSTA, 'ornek@eposta.com').replaceAll(tohum.k, 'ornekuye').replace(/Dada ?Gastro/g, 'Dada Gourmet')); }); });
  const foto = ['#fotoOverlay', '#fotoModal'].map((s) => document.querySelector(s)?.outerHTML ?? '').join('\n');
  return { gov: m.innerHTML, foto }; }, { oh, tohum });
yaz('hesabim/ayarlar/index', { baslik: 'Hesap Ayarları', duzen: 'uye', zincir: 'hesabim', css: ['gourmet-sapma'], js: ['assets/js/sayfa/sekmeler.js'], donor: 'yerel Gastro 6700538df4 /hesabim/ayarlar (demo tohum); Bildirim, Dil, Bağlı, Veri, Dondurma: go-hesabim.html?auth=1' }, hesap.gov.replace(/"\/varliklar\/flags\//g, '"{{kok}}assets/g/varliklar/flags/').replace(/\/varliklar\/_dis\/images\.unsplash\.com\/photo-1466637574441-749b8f19452f\.avif/g, 'https://dadagourmet.com/assets/gourmet-public/img/about-dining.avif') + '\n<!--@main-disi-->\n' + hesap.foto);

// --- Gurme Panelim: K3, ayrı alan, 6 sekme ---
p = await ac(dom('op-mekanlarim'));
const iskelet = await p.evaluate(() => { const m = document.querySelector('main'); const b = m.querySelector('.kimlik-bant'); metin(b, /DadaGourmet/g, 'Dada Gourmet'); metin(b, /[a-z0-9._-]+@[a-z0-9.-]+\.test\b/g, 'ornek@eposta.com'); metin(b, /\bDemo\b/g, 'Örnek Üye');
  b.querySelector('.crumb-home').setAttribute('href', '{{kok}}'); b.querySelector('.cur').textContent = 'Gurme Panelim'; b.querySelector('.kimlik-giris').textContent = 'Rezervasyonların, favorilerin, ziyaretlerin ve katkıların tek merkezde.'; b.querySelector('.cp-stats').remove();
  const satir = m.querySelector('#mekFavori .kalem-satiri').outerHTML; const bas = (id) => m.querySelector(`#mekanlarim-pane-${id} .bolum-bas`).outerHTML; const bos = m.querySelector('#mekFavori .bos-durum').outerHTML; const kart = m.querySelector('#mekanlarim-pane-mek-favori .kart').cloneNode(false).outerHTML;
  const sekme = m.querySelector('nav.sekmeler .sekme').outerHTML;
  return { bant: b.outerHTML, ray: m.querySelector('.pf-tabbar').cloneNode(false).outerHTML, bas: bas('mek-favori'), satir, bos, kart, sekme, kap: m.querySelector('.modul-govde').cloneNode(false).outerHTML, zebra: m.querySelector('.zebra').cloneNode(false).outerHTML }; });
fs.writeFileSync(path.join(SRC, 'parcalar/gurme-panel-iskelet.json'), JSON.stringify(iskelet));
p = await ac(dom('op-rozet'));
fs.writeFileSync(path.join(SRC, 'parcalar/puan-iskelet.html'), await p.evaluate(() => { const s = document.querySelector('#rozetlerim-pane-puan'); metin(s, /DadaGourmet/g, 'Dada Gourmet'); return s.innerHTML; }));
await kapat(); console.log('gourmet tamam');
