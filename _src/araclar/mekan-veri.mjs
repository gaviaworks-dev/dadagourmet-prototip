// Mekânlar süzgeci için veri. Yalnız kamuya açık GET: /mekanlar, /mekanlar/harita-verisi.
// Her seçenek için canlı süzgeç sorulur; mekân başına üyelik böyle çıkar. Uydurma değer yok.
// Çıktı: _src/veri/mekan-filtre.json, _src/parcalar/mekan-kartlar.json
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const B = 'https://dadagourmet.com', UA = 'DadaGourmetKanonBot/1.0';
const bekle = (n) => new Promise((r) => setTimeout(r, n));
const al = async (u, json) => { await bekle(180); const r = await fetch(B + u, { headers: { 'User-Agent': UA, Accept: json ? 'application/json' : 'text/html' } }); if (!r.ok) throw new Error(r.status + ' ' + u); return json ? r.json() : r.text(); };
const q = (o) => Object.entries(o).map(([k, v]) => `${encodeURIComponent(k + '[]')}=${encodeURIComponent(v)}`).join('&');
const harita = async (o) => (await al('/mekanlar/harita-verisi?' + q(o), true)).venues;
const secenekler = (h, ad) => [...h.matchAll(new RegExp(`<input[^>]*name="${ad}\\[\\]"[^>]*value="([^"]+)"[^>]*data-count="(\\d+)"[^>]*>\\s*<span class="cbx"></span>\\s*<span class="ft">([\\s\\S]*?)</span>\\s*<span class="fcnt">`, 'g'))].map((m) => ({ deger: m[1], sayi: +m[2], ad: m[3].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().replace(/&amp;/g, '&') }));

const ilk = await al('/mekanlar');
const hepsi = await harita({});
const mekan = Object.fromEntries(hepsi.map((v) => [v.slug, { slug: v.slug, ad: v.name, lat: v.lat, lng: v.lng, ilce: v.district, f: {} }]));
const ekle = (slug, g, d) => { const m = mekan[slug]; if (m) (m.f[g] ??= []).push(d); };
const uyumsuz = []; const secenek = {};
for (const g of ['kategori', 'konsept', 'mutfak', 'vesile', 'fiyat', 'puan', 'hizmet', 'beslenme', 'ulasim', 'acik', 'seckiler']) {
  secenek[g] = secenekler(ilk, g).filter((s) => s.sayi > 0);
  for (const s of secenek[g]) { const l = await harita({ [g]: s.deger }); if (l.length !== s.sayi) uyumsuz.push(`${g}/${s.deger} sayaç ${s.sayi} harita ${l.length}`); l.forEach((v) => ekle(v.slug, g, s.deger)); }
}
secenek.il = secenekler(ilk, 'il').filter((s) => s.sayi > 0); secenek.ilce = []; secenek.semt = [];
for (const il of secenek.il) {
  (await harita({ il: il.deger })).forEach((v) => ekle(v.slug, 'il', il.deger));
  const h = await al('/mekanlar?' + q({ il: il.deger }));
  for (const c of secenekler(h, 'ilce').filter((s) => s.sayi > 0)) {
    secenek.ilce.push({ ...c, il: il.deger, ad: c.ad.replace(/\s*\([^)]*\)\s*$/, '') });
    const url = `il%5B%5D=${encodeURIComponent(il.deger)}&ilce%5B%5D=${encodeURIComponent(c.deger)}`;
    (await al('/mekanlar/harita-verisi?' + url, true)).venues.forEach((v) => ekle(v.slug, 'ilce', c.deger));
    const h2 = await al('/mekanlar?' + url);
    for (const s of secenekler(h2, 'semt').filter((x) => x.sayi > 0)) {
      secenek.semt.push({ ...s, ilce: c.deger });
      (await al(`/mekanlar/harita-verisi?${url}&semt%5B%5D=${encodeURIComponent(s.deger)}`, true)).venues.forEach((v) => ekle(v.slug, 'semt', s.deger));
    }
  }
}
// Kartlar: canlı liste sırası korunur
const kart = {}; const sira = [];
const son = Math.max(...[...ilk.matchAll(/[?&]sayfa=(\d+)/g)].map((m) => +m[1]));
for (let n = 1; n <= son; n++) {
  const h = n === 1 ? ilk : await al('/mekanlar?sayfa=' + n);
  for (const m of h.matchAll(/<article class="disc-card mkl-card[\s\S]*?<\/article>/g)) {
    const slug = /mekan\/([a-z0-9-]+)'/.exec(m[0])?.[1]; if (!slug) continue;
    kart[slug] = m[0].replace(/\s+onclick="[^"]*"/, ` data-slug="${slug}"`).replace(/\s+/g, ' '); sira.push(slug);
  }
}
const liste = sira.map((s) => mekan[s]).filter(Boolean);
fs.writeFileSync(path.join(SRC, 'veri/mekan-filtre.json'), JSON.stringify({ alinma: new Date().toISOString(), mekanlar: liste, secenek }));
fs.writeFileSync(path.join(SRC, 'parcalar/mekan-kartlar.json'), JSON.stringify(kart));
const say = (g) => liste.filter((m) => m.f[g]?.length).length;
console.log('mekan', liste.length, 'kart', Object.keys(kart).length, 'il', say('il'), 'ilce', say('ilce'), 'semt', say('semt'), 'ilce-secenek', secenek.ilce.length, 'semt-secenek', secenek.semt.length);
console.log('uyumsuz', uyumsuz.length, uyumsuz.slice(0, 8).join(' ; '));
