// Sayfa kabuğu. Parçalar _src/parcalar/kabuk/ altındadır ve `araclar/kabuk-uret.mjs` ile canlı Gastro render'ından üretilir.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BU = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(BU, '..');
const parca = (a) => fs.readFileSync(path.join(SRC, 'parcalar/kabuk', a + '.html'), 'utf8');
const zincir = JSON.parse(fs.readFileSync(path.join(BU, 'zincir.json'), 'utf8'));
const K = '{{kok}}';
const kacis = (s = '') => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
// Gourmet gövde zinciri: yalnız kabuğa dokunmayan sayfa dosyaları (`assets/o/`), Gastro kabuğundan önce ve sonra iki katman
const GOURMET_ONCE = ['css/gourmet.css', 'css/parallax.css', 'css/venue-cover-fallback.css'].map((c) => 'assets/o/assets/gourmet-public/' + c);
const gourmetCss = (c) => (c === 'gourmet-sapma' ? 'assets/css/gourmet-sapma.css' : c.startsWith('assets/') ? c : 'assets/o/assets/gourmet-public/css/' + c);

function aktifle(html, aktif) {
  if (!aktif) return html;
  return html.replace(new RegExp(`(<div class="nav-item"><a )(href="[^"]*${aktif}/")`), '$1class="active" $2');
}

export function kabukla(s) {
  const m = s.meta ?? {};
  const duzen = m.duzen ?? 'public';
  const z = zincir[m.zincir ?? 'yasal'] ?? zincir.rota;
  const once = m.gourmet ? GOURMET_ONCE : [];
  const harita = (m.js ?? []).some((j) => j.includes('maplibre')) && !(m.css ?? []).some((c) => c.includes('maplibre')) ? ['assets/vendor/maplibre/maplibre-gl.css'] : [];
  const ek = [...harita, ...(m.css ?? [])].map(gourmetCss);
  const css = [...once.map((c) => K + c), ...z.css.map((c) => `${K}assets/g/${c}`), ...ek.map((c) => K + c), `${K}assets/css/prototip.css`];
  const link = css.map((c) => `<link rel="stylesheet" href="${c}">`).join('\n');
  const js = [`<script src="${K}assets/js/prototip.js"></script>`,
    ...z.js.map((j) => `<script${j.modul ? ' type="module"' : ' defer'} src="${K}assets/g/${j.y}"></script>`),
    ...(m.js ?? []).map((j) => `<script defer src="${K}${j}"></script>`)].join('\n');
  const uye = duzen === 'uye';
  const sinif = [z.govdeSinif, m.govdeSinif, uye ? 'is-auth' : ''].filter(Boolean).join(' ');
  // `<!--@main-disi-->` sonrası katmanlar <main>'in yığın bağlamından çıkar (canlıda da body altındadır)
  const [icerik, disari = ''] = s.govde.split('<!--@main-disi-->');
  const govde = duzen === 'tam' ? s.govde
    : `${aktifle(parca('ust'), m.aktif)}\n<main class="page-main" id="pageMain">${icerik}</main>\n${parca('dip')}\n${parca('alt-cubuk')}\n${parca('katman')}\n${disari}`;
  return `<!doctype html>
<html lang="tr" data-kok="${K}" class="sg-js" data-kabuk-kimlik="yazildi"${z.baslikZemin ? ` data-baslik-zemin="${z.baslikZemin}"` : ''}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${kacis(m.baslik ?? 'Dada Gourmet')} · Dada Gourmet</title>
<meta name="robots" content="noindex, nofollow">
${uye ? `<meta name="dada-kimlik" content='{"auth":true,"roles":["kullanici"]}'>` : ''}
<!-- donör: ${kacis(m.donor ?? 'https://dadagastro.com')} · canlı Gastro release 20261107-mentor-6700538df4 -->
<link rel="icon" href="${K}assets/img/favicon.ico">
${link}
${js}
</head>
<body data-brand="gourmet"${z.heroTur ? ` data-fit-hero-kind="${z.heroTur}"` : ''} class="${sinif}"${uye ? ' data-oturum="1"' : ''}>
${govde}
</body>
</html>
`;
}
