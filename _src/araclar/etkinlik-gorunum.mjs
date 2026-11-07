// Etkinlikler Takvim, Harita ve Sıralama verisi. `etkinlik-veri.mjs` sonrası koşar, `_src/veri/etkinlik.json`a ekler. Yalnız kamuya açık GET.
// Konum canlı `?gorunum=harita` gömülü verisinden; sıralar canlı `?sirala=` listelerinden, çekim anının kopyasıdır.
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const B = 'https://dadagourmet.com', UA = 'DadaGourmetKanonBot/1.0', f = path.join(SRC, 'veri/etkinlik.json');
const bekle = (n) => new Promise((r) => setTimeout(r, n));
const al = async (u) => { await bekle(180); const r = await fetch(B + u, { headers: { 'User-Agent': UA, Accept: 'text/html' } }); if (!r.ok) throw new Error(r.status + ' ' + u); return r.text(); };
const v = JSON.parse(fs.readFileSync(f, 'utf8')), et = Object.fromEntries(v.etkinlikler.map((e) => [e.slug, e]));

const h = await al('/etkinlikler?gorunum=harita');
const pinler = JSON.parse(/window\.__etkinlikMapData = (\[[\s\S]*?\]);/.exec(h)[1]);
for (const p of pinler) { const e = et[p.url.split('/').pop()]; if (e) e.konum = { lat: p.lat, lng: p.lng, etiket: p.priceLabel, yaklasik: !!p.approx }; }

const slugSirasi = (t) => [...t.matchAll(/<article class="disc-card ev-card[\s\S]*?etkinlikler\/([a-z0-9-]+)"/g)].map((m) => m[1]);
v.sira = {};
for (const s of ['en_yeni', 'fiyat_artan', 'simdi_acik', 'rezervasyon_uygun']) {
  const ilk = await al('/etkinlikler?sirala=' + s), son = Math.max(1, ...[...ilk.matchAll(/[?&](?:amp;)?sayfa=(\d+)/g)].map((m) => +m[1])), l = slugSirasi(ilk);
  for (let n = 2; n <= son; n++) l.push(...slugSirasi(await al(`/etkinlikler?sirala=${s}&sayfa=${n}`)));
  v.sira[s] = [...new Set(l)].filter((x) => et[x]);
}
fs.writeFileSync(f, JSON.stringify(v));
console.log('konum', v.etkinlikler.filter((e) => e.konum).length, Object.entries(v.sira).map(([k, l]) => k + ' ' + l.length).join(', '));
