// Prototip derleyici (dadadiet-prototip yöntemi). Bağımlılık yok: `node _src/build.mjs`
// _src/sayfalar/**/*.html  -> <yol>/index.html  (front matter: ilk satır <!--{json}-->)
// _src/sayfalar/**/*.mjs   -> default export ({veri}) => [{yol, meta, govde}]
// Yer tutucular: {{kok}} kök yolu, <!-- @parca ad --> _src/parcalar/ad.html
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(KOK, '_src');
const oku = (p) => fs.readFileSync(p, 'utf8');

const veri = {};
for (const f of fs.existsSync(path.join(SRC, 'veri')) ? fs.readdirSync(path.join(SRC, 'veri')) : []) {
  if (f.endsWith('.json')) veri[f.replace('.json', '')] = JSON.parse(oku(path.join(SRC, 'veri', f)));
}

function dosyalar(d, cikti = []) {
  if (!fs.existsSync(d)) return cikti;
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) dosyalar(p, cikti);
    else if (!e.name.startsWith('_')) cikti.push(p);
  }
  return cikti;
}

const { kabukla } = await import(pathToFileURL(path.join(SRC, 'kabuk', 'kabuk.mjs')).href + '?t=' + Date.now());
// Örnek üye tek kaynaktan: `{{uye.ad}}` gibi yer tutucular _src/kabuk/ornek-uye.json değerleriyle dolar
const ornekUye = JSON.parse(oku(path.join(SRC, 'kabuk', 'ornek-uye.json')));
const uyeYaz = (h) => h.replace(/\{\{uye\.(\w+)\}\}/g, (m, k) => { if (!(k in ornekUye)) throw new Error('Örnek üye alanı yok: ' + k); return ornekUye[k]; });

function parcalariAc(html, derinlik = 0) {
  if (derinlik > 6) return html;
  return html.replace(/<!--\s*@parca\s+([\w\/-]+)\s*-->/g, (_, ad) => {
    const p = path.join(SRC, 'parcalar', ad + '.html');
    if (!fs.existsSync(p)) throw new Error('Parça yok: ' + ad);
    return parcalariAc(oku(p), derinlik + 1);
  });
}

// `node _src/build.mjs <alan>` yalnız _src/sayfalar/<alan>/ altını derler (ekipler birbirini beklemesin).
const alan = process.argv[2] ?? '';
const hatalar = [];
const sayfalar = [];
for (const f of dosyalar(path.join(SRC, 'sayfalar', alan))) {
  const goreli = path.relative(path.join(SRC, 'sayfalar'), f);
  try {
  if (f.endsWith('.html')) {
    const ham = oku(f);
    const m = ham.match(/^<!--\s*(\{[\s\S]*?\})\s*-->\s*/);
    if (!m) throw new Error('Front matter yok: ' + goreli);
    const meta = JSON.parse(m[1]);
    const yol = meta.yol ?? goreli.replace(/\.html$/, '').replace(/(^|\/)index$/, '');
    sayfalar.push({ yol, meta, govde: ham.slice(m[0].length), kaynak: goreli });
  } else if (f.endsWith('.mjs')) {
    const mod = await import(pathToFileURL(f).href + '?t=' + Date.now());
    for (const s of await mod.default({ veri })) sayfalar.push({ ...s, kaynak: goreli });
  }
  } catch (e) { hatalar.push(goreli + ': ' + e.message); }
}

const gorulen = new Map();
const uretilen = [];
for (const s of sayfalar) {
  if (gorulen.has(s.yol)) throw new Error(`Çakışan yol ${s.yol}: ${gorulen.get(s.yol)} ve ${s.kaynak}`);
  gorulen.set(s.yol, s.kaynak);
  const derinlik = s.yol ? s.yol.split('/').length : 0;
  const kok = '../'.repeat(derinlik) || './';
  const html = uyeYaz(parcalariAc(kabukla(s, { veri }))).replaceAll('{{kok}}', kok);
  const hedef = path.join(KOK, s.yol, 'index.html');
  fs.mkdirSync(path.dirname(hedef), { recursive: true });
  fs.writeFileSync(hedef, html);
  // GitHub Pages her eksik yolda kök 404.html'i sunar: bağlantılar mutlak kökle yazılır
  if (s.yol === '404') fs.writeFileSync(path.join(KOK, '404.html'), uyeYaz(parcalariAc(kabukla(s, { veri }))).replaceAll('{{kok}}', '/dadagourmet-prototip/'));
  uretilen.push({ yol: s.yol, baslik: s.meta?.baslik ?? '', duzen: s.meta?.duzen ?? 'public' });
}
// Ekran haritası: onay turu için tüm sayfaların gezilebilir listesi
if (!alan) {
  const gruplar = [['Public', (u) => !u.yol.startsWith('hesabim')], ['Üye hesabı', (u) => u.yol.startsWith('hesabim')]];
  const liste = [...uretilen].sort((a, b) => a.yol.localeCompare(b.yol, 'tr'));
  const govde = `<section class="ekran-haritasi"><div class="wrap kap"><h1>Ekran haritası</h1><p>Prototipteki ${liste.length} ekran. Yayın kararı verilmedi; arama motorlarına kapalıdır.</p>${gruplar.map(([ad, f]) => { const l = liste.filter(f); return `<h2>${ad} <small>${l.length}</small></h2><ul>${l.map((u) => `<li><a href="{{kok}}${u.yol ? u.yol + '/' : ''}"><b>${u.baslik || 'Ana sayfa'}</b> <small>/${u.yol}</small></a></li>`).join('')}</ul>`; }).join('')}</div></section>`;
  const s = { yol: 'ekranlar', meta: { baslik: 'Ekran haritası', zincir: 'yasal' }, govde };
  fs.mkdirSync(path.join(KOK, 'ekranlar'), { recursive: true });
  fs.writeFileSync(path.join(KOK, 'ekranlar/index.html'), uyeYaz(parcalariAc(kabukla(s, { veri }))).replaceAll('{{kok}}', '../'));
}

if (!alan) fs.writeFileSync(path.join(SRC, 'sayfa-listesi.json'), JSON.stringify(uretilen.sort((a, b) => a.yol.localeCompare(b.yol, 'tr')), null, 1));
// Prototipte karşılığı olmayan iç bağ en yakın gerçek ekrana gider; ölü bağ ve "yapılmadı" uyarısı yok. Sıra önemli: ilk var olan aday seçilir.
const varOlan = new Set([...uretilen.map((u) => u.yol), 'ekranlar']);
const YEDEK = [
  [/^mekan\/.+/, ['mekan/mikla']],
  [/^etkinlikler$/, ['']],
  [/^mekan-bul$/, ['mekanlar']],
  [/^hesabim\/rezervasyonlar$/, ['hesabim/gurme-panelim']],
  [/^hesabim\/etkinlikler$/, ['hesabim/gurme-panelim']],
  [/^hesabim\/(kaydedilenler|listeler)$/, ['hesabim/gurme-panelim/gurme-favorilerim']],
  [/^hesabim\/ziyaretler$/, ['hesabim/gurme-panelim/ziyaret-gecmisim']],
  [/^hesabim\/degerlendirmeler$/, ['hesabim/gurme-panelim/degerlendirmelerim']],
  [/^hesabim\/rozetlerim$/, ['hesabim/gurme-panelim/puan-durumu']],
  [/^hesabim\/.+/, ['hesabim/ayarlar']],
  [/^yasal(\/.+)?$/, ['yasal/kvkk']],
  [/^(isletme(\/.+)?|sss)$/, ['iletisim']],
  [/^basin-medya$/, ['hakkimizda']],
  [/^dada-route\/.+/, ['dada-route']],
  [/^(gurme-lezzetler|sehir-rehberleri|gourmet-ara)(\/.+)?$/, ['mekanlar']],
];
const yedekYol = (y) => { for (const [re, adaylar] of YEDEK) if (re.test(y)) { const a = adaylar.find((x) => varOlan.has(x)); if (a !== undefined) return a; } console.warn('Karşılığı yok, Mekânlar\'a bağlandı: ' + y); return 'mekanlar'; };
const yolBag = (on, y, ek) => { const h = yedekYol(y); return on + (h ? h + '/' : '') + (/^#/.test(ek) ? ek : ''); };
// Yazım: görünen metinde her yerde "Mekân". Bağ, sınıf, kimlik ve betik içeriğine dokunmaz.
const mekan = (t) => t.replace(/(^|[^\p{L}\p{N}_-])([Mm])ekan(?![\p{N}_-])/gu, '$1$2ekân');
const yazimDuzelt = (h) => h.split(/(<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<!--[\s\S]*?-->)/).map((p, i) => (i % 2 ? p : p
  .replace(/>([^<]+)</g, (m, t) => `>${mekan(t)}<`)
  .replace(/\b(placeholder|aria-label|title|alt|data-lg-title|data-lg-desc|data-def-desc|data-def-title|data-sosyal-onay-uyari|data-alan)="([^"]*)"/g, (m, a, v) => `${a}="${mekan(v)}"`))).join('');
// Mekân kartı: nitelik mikro ikonları (W1.4). Yalnız canlı veride kaydı olan nitelik görünür; kayıt yoksa ikon yok. Veride "çocuk alanı" yok, en yakın kayıt bebek sandalyesi kendi adıyla yazılır
const NITELIK = [['ulasim', 'vale', 'fa-square-parking', 'Vale'], ['ulasim', 'otopark', 'fa-square-parking', 'Otopark'], ['beslenme', 'glutensiz', 'fa-wheat-awn-circle-exclamation', 'Glütensiz seçenek'], ['hizmet', 'evcil-hayvan-dostu', 'fa-paw', 'Evcil hayvan kabul edilir'], ['hizmet', 'bebek-sandalyesi', 'fa-baby', 'Bebek sandalyesi']];
const mekanBySlug = Object.fromEntries((veri['mekan-filtre']?.mekanlar ?? []).map((m) => [m.slug, m]));
const nitelikIkon = (m) => { const l = NITELIK.filter(([g, d]) => m?.f?.[g]?.includes(d)); const tekil = l.filter(([, d], i) => !(d === 'otopark' && l.some(([, x]) => x === 'vale'))); return tekil.length ? `<div class="kart-nitelik">${tekil.map(([, , i, a]) => `<span class="kn" title="${a}" aria-label="${a}"><i class="fa-solid ${i}" aria-hidden="true"></i></span>`).join('')}</div>` : ''; };
// Puanı olmayan kartta yıldız ve tire görünmez (AK-30 kuralı kartın tamamına)
const puansizSil = (h) => h.replace(/<span class="r-rate r-yok"[^>]*>\s*<i[^>]*><\/i>\s*<span aria-hidden="true">–<\/span>\s*<\/span>/g, '');
const kartZengin = (k, m) => puansizSil(k).replace('<div class="disc-meta">', nitelikIkon(m) + '<div class="disc-meta">');
const uretimDosyalari = [...uretilen.map((u) => u.yol), 'ekranlar'].map((y) => path.join(KOK, y, 'index.html'));
for (const f of uretimDosyalari) {
  const s = fs.readFileSync(f, 'utf8').replace(/<article class="disc-card[^"]*"[^>]*data-git="[^"]*mekan\/([a-z0-9-]+)\/"[\s\S]*?<\/article>/g, (k, slug) => kartZengin(k, mekanBySlug[slug])).replace(/href="((?:\.\.\/)*|\.\/)([a-z0-9][^"#?]*?)\/?((?:[?#][^"]*)?)"/g, (m, on, y, ek) => {
    if (y.startsWith('assets/') || y === 'dada-route/?durak' || /^[a-z]+:/.test(y) || /\.[a-z0-9]+$/i.test(y) || varOlan.has(y)) return m;
    const ev = /^etkinlikler\/([a-z0-9-]+)$/.exec(y); if (ev) return `href="${on}etkinlik-detay/?e=${ev[1]}"`;
    const lz = /^gurme-lezzetler\/([a-z0-9-]+)$/.exec(y); if (lz) return `href="${on}gurme-lezzet-detay/?l=${lz[1]}"`;
    const k = yolBag(on, y, ek); return `href="${k || './'}"`;
  }).replace(/data-git="((?:\.\.\/)*|\.\/)(?:https:\/\/dadagourmet\.com\/)?([a-z0-9][^"#?]*?)\/?"/g, (m, on, y) => (varOlan.has(y) ? `data-git="${on}${y}/"` : `data-git="${yolBag(on, y, '') || './'}"`));
  fs.writeFileSync(f, yazimDuzelt(puansizSil(s)));
}
// Mekânlar süzgecinin istemci verisi: tek kaynak _src/veri ve _src/parcalar
if (veri['mekan-filtre']) { const kartlar = JSON.parse(oku(path.join(SRC, 'parcalar/mekan-kartlar.json'))); const { mekanlar, secenek, alinma } = veri['mekan-filtre']; for (const slug of Object.keys(kartlar)) kartlar[slug] = kartZengin(kartlar[slug], mekanBySlug[slug]); fs.writeFileSync(path.join(KOK, 'assets/js/mekan-liste-veri.js'), 'window.DG_LISTE=' + JSON.stringify({ alinma, mekanlar, secenek, kartlar }) + ';\n'); }
if (veri.lezzet) fs.writeFileSync(path.join(KOK, 'assets/js/lezzet-veri.js'), 'window.DG_LEZZET=' + JSON.stringify({ ...veri.lezzet, kalip: oku(path.join(SRC, 'parcalar/lezzet-kart.html')).trim() }) + ';\n');
if (veri.etkinlik) fs.writeFileSync(path.join(KOK, 'assets/js/etkinlik-veri.js'), 'window.DG_ETKINLIK=' + JSON.stringify({ ...veri.etkinlik, kartlar: JSON.parse(oku(path.join(SRC, 'parcalar/etkinlik-kartlar.json'))) }) + ';\n');
// K8 denetimi: sıfır sonuçlu konsept ve süzgeç seçeneği yayına çıkamaz
for (const y of ['', 'mekanlar', 'etkinlikler']) { const f = path.join(KOK, y, 'index.html'); if (!fs.existsSync(f)) continue; const h = oku(f); const s0 = (h.match(/(?:\D)0\s+mekân|class="fcnt">0</g) ?? []).length; if (s0) hatalar.push(`Sıfır sonuçlu seçenek: /${y} ${s0} adet`); }
// Canlı `dada-route.js` kapalı bir işlevdir. Katmanların durak ekleyebilmesi için tek satırlık dışa açım derlemede eklenir; dosya donörden yenilense de korunur
{ const f = path.join(KOK, 'assets/o/assets/gourmet-public/js/dada-route.js'), h = oku(f), isaret = "var detailStopEl=document.getElementById('ygDetailStop');"; if (!h.includes('window.dgRotaApi') && h.includes(isaret)) fs.writeFileSync(f, h.replace(isaret, "window.dgRotaApi={durakYap:mekaniDurakYap,zincir:function(){return noktaZinciri();},duraklar:filled};\n  " + isaret)); }
console.log(uretilen.length + ' sayfa üretildi');
if (hatalar.length) { console.error('HATALAR:\n' + hatalar.join('\n')); process.exitCode = 1; }
