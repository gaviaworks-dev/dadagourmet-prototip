// Sayfa kabuğu. Parçalar _src/parcalar/kabuk/ altındadır ve `araclar/kabuk-uret.mjs` ile canlı Gastro render'ından üretilir.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { panelKabuk, PANEL_CSS, PANEL_JS } from './panel.mjs';

const BU = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(BU, '..');
const parca = (a) => fs.readFileSync(path.join(SRC, 'parcalar/kabuk', a + '.html'), 'utf8');
const zincir = JSON.parse(fs.readFileSync(path.join(BU, 'zincir.json'), 'utf8'));
const K = '{{kok}}';
const kacis = (s = '') => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
// Gourmet gövde zinciri: yalnız kabuğa dokunmayan sayfa dosyaları (`assets/o/`), Gastro kabuğundan önce ve sonra iki katman
const GOURMET_ONCE = ['css/gourmet.css', 'css/parallax.css', 'css/venue-cover-fallback.css'].map((c) => 'assets/o/assets/gourmet-public/' + c);
// Yüzen Mentör düğmesi (canlı Gastro kuralı, `config/mentor.php`): tam ekranda, kimlik sayfalarında, yönetimde ve hata sayfasında basılmaz
const MENTOR_HARIC = /^(giris|kayit|sifremi-unuttum|sifre-yenile|eposta-dogrula|yonetim|404)(\/|$)/;
const mentor = fs.readFileSync(path.join(SRC, 'parcalar/mentor.html'), 'utf8');
const gourmetCss = (c) => (c === 'gourmet-sapma' ? 'assets/css/gourmet-sapma.css' : c.startsWith('assets/') ? c : 'assets/o/assets/gourmet-public/css/' + c);

function aktifle(html, aktif) {
  if (!aktif) return html;
  return html.replace(new RegExp(`(<div class="nav-item"><a )(href="[^"]*${aktif}/")`), '$1class="active" $2');
}

// Mobil alt çubuğun etkin kalemi (K2, 11 Kas). Parça canlı Gourmet ana sayfasından üretilir ve orada "Ana Sayfa" sabit etkin
// (canlı `layouts/site.blade.php`), bu yüzden her sayfada Ana Sayfa yanıyordu. Kural canlı Gastro'dan (ölçüldü 11 Kas): kalem kendi bölümünde
// ve o bölümün detay sayfalarında etkin (`/tarif/…` ve `/sefler` Tarifler, `/giris` ve `/kayit` Profil). Alt çubukta karşılığı olmayan sayfada
// hiçbir kalem etkin değil (Diet prototipi `altCubuk` kuralı; canlı Gastro'da bu sayfalar ana sayfa kopyasını taşıyor)
const ALT_CUBUK = [
  ['', /^$/],
  ['mekanlar/', /^(mekanlar|mekan|mekan-bul)(\/|$)/],
  ['dada-route/', /^dada-route(\/|$)/],
  ['etkinlikler/', /^(etkinlikler|etkinlik-detay)(\/|$)/],
  ['giris/', /^(giris|kayit|sifremi-unuttum|sifre-yenile|hesabim)(\/|$)/],
];
function altCubuk(yol = '') {
  const hedef = ALT_CUBUK.find(([, desen]) => desen.test(yol))?.[0];
  return parca('alt-cubuk').replace(/(<a href="\{\{kok\}\}([^"]*)" class="bn-item ac-kalem)(?: active)?([^"]*")(?: aria-current="page")?/g,
    (_, bas, href, son) => (href === hedef ? `${bas} active${son} aria-current="page"` : `${bas}${son}`));
}

// İşletme Paneli: Gastro/Diet panel kanonunun kendi kabuğu (public başlık, altbilgi, Mentör yok). Ayrıntı `panel.mjs`
function panelSayfa(s, m) {
  const css = [...PANEL_CSS, ...(m.css ?? []).map(gourmetCss)].map((c) => `<link rel="stylesheet" href="${K}${c}">`).join('\n');
  const js = [`<script src="${K}${PANEL_JS[0]}"></script>`, ...[...PANEL_JS.slice(1), ...(m.js ?? [])].map((j) => `<script defer src="${K}${j}"></script>`)].join('\n');
  return `<!doctype html>
<html lang="tr" data-kok="${K}" data-yol="${s.yol ?? ''}" data-uye-sayfa="1" data-panel="isletme">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${kacis(m.baslik ?? 'İşletme Paneli')} · İşletme Paneli · Dada Gourmet</title>
<meta name="robots" content="noindex, nofollow">
<meta name="dg-ornek-uye" content="{{uye.ad}}|{{uye.kullanici}}">
<!-- donör: ${kacis(m.donor ?? 'Gastro/Diet panel kanonu')} -->
<link rel="icon" href="${K}assets/img/favicon.ico">
${css}
${js}
</head>
<body class="yetkili" data-marka="gourmet">
${panelKabuk(m, s.govde, m.sayaclar ?? {})}
</body>
</html>
`;
}

export function kabukla(s) {
  const m = s.meta ?? {};
  const duzen = m.duzen ?? 'public';
  if (duzen === 'panel') return panelSayfa(s, m);
  const z = zincir[m.zincir ?? 'yasal'] ?? zincir.rota;
  const once = m.gourmet ? GOURMET_ONCE : [];
  const harita = (m.js ?? []).some((j) => j.includes('maplibre')) && !(m.css ?? []).some((c) => c.includes('maplibre')) ? ['assets/vendor/maplibre/maplibre-gl.css'] : [];
  const ek = [...harita, ...(m.css ?? [])].map(gourmetCss);
  const mentorVar = duzen !== 'tam' && !MENTOR_HARIC.test(s.yol ?? '');
  // Reklam önizlemesi (reklam-onizleme, 11 Kas): anahtar, şerit ve yerleşimler public ve üye kabuğunda; tam ekranda (Dada Route) yok
  const reklamVar = duzen !== 'tam';
  const css = [...once.map((c) => K + c), ...z.css.map((c) => `${K}assets/g/${c}`), ...ek.map((c) => K + c), `${K}assets/o/assets/gourmet-public/css/konum.css`, `${K}assets/css/prototip.css`, ...(mentorVar ? [`${K}assets/css/mentor-fab.css`] : []), ...(reklamVar ? [`${K}assets/css/reklam.css`] : [])];
  const link = css.map((c) => `<link rel="stylesheet" href="${c}">`).join('\n');
  const js = [`<script src="${K}assets/js/prototip.js"></script>`, ...(reklamVar ? [`<script defer src="${K}assets/js/reklam/reklam.js"></script>`] : []),
    ...z.js.map((j) => `<script${j.modul ? ' type="module"' : ' defer'} src="${K}assets/g/${j.y}"></script>`),
    ...(m.js ?? []).map((j) => `<script defer src="${K}${j}"></script>`),
    ...(mentorVar ? [`<script defer src="${K}assets/js/mentor-fab.js"></script>`] : [])].join('\n');
  const uye = duzen === 'uye';
  const sinif = [z.govdeSinif, m.govdeSinif].filter(Boolean).join(' ');
  // `<!--@main-disi-->` sonrası katmanlar <main>'in yığın bağlamından çıkar (canlıda da body altındadır)
  const [icerik, disari = ''] = s.govde.split('<!--@main-disi-->');
  const govde = duzen === 'tam' ? s.govde
    : `${aktifle(parca('ust'), m.aktif)}\n<main class="page-main" id="pageMain">${icerik}</main>\n${parca('dip')}\n${altCubuk(s.yol)}\n${parca('katman')}\n${parca('konum')}\n${mentorVar ? mentor : ''}${disari}`;
  return `<!doctype html>
<html lang="tr" data-kok="${K}" data-yol="${s.yol ?? ''}"${uye ? ' data-uye-sayfa="1"' : ''} class="sg-js" data-kabuk-kimlik="yazildi"${z.baslikZemin ? ` data-baslik-zemin="${z.baslikZemin}"` : ''}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${kacis(m.baslik ?? 'Dada Gourmet')} · Dada Gourmet</title>
<meta name="robots" content="noindex, nofollow">
<meta name="dg-ornek-uye" content="{{uye.ad}}|{{uye.kullanici}}">
<!-- donör: ${kacis(m.donor ?? 'https://dadagastro.com')} · canlı Gastro release 20261107-mentor-6700538df4 -->
<link rel="icon" href="${K}assets/img/favicon.ico">
${link}
${js}
</head>
<body data-brand="gourmet"${z.heroTur ? ` data-fit-hero-kind="${z.heroTur}"` : ''} class="${sinif}">
${govde}
</body>
</html>
`;
}
