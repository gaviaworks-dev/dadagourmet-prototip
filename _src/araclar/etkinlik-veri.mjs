// Etkinlikler verisi. Yalnız kamuya açık GET: /etkinlikler ve süzgeç adresleri. Uydurma değer yok.
// Her süzgeç seçeneği canlıya sorulur; etkinlik başına üyelik böyle çıkar (`mekan-veri.mjs` yöntemi). Ülke ve şehir kart metninden okunur.
// Çıktı: _src/veri/etkinlik.json, _src/parcalar/etkinlik-kartlar.json
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const B = 'https://dadagourmet.com', UA = 'DadaGourmetKanonBot/1.0';
const bekle = (n) => new Promise((r) => setTimeout(r, n));
const al = async (u) => { await bekle(180); const r = await fetch(B + u, { headers: { 'User-Agent': UA, Accept: 'text/html' } }); if (!r.ok) throw new Error(r.status + ' ' + u); return r.text(); };
const kartRe = /<article class="disc-card ev-card[\s\S]*?<\/article>/g;
const slugOf = (k) => /etkinlikler\/([a-z0-9-]+)"/.exec(k)?.[1];
const sayfalar = async (q) => { const ilk = await al('/etkinlikler' + (q ? '?' + q : '')); const son = Math.max(1, ...[...ilk.matchAll(/[?&](?:amp;)?sayfa=(\d+)/g)].map((m) => +m[1])); const l = [ilk]; for (let n = 2; n <= son; n++) l.push(await al('/etkinlikler?' + (q ? q + '&' : '') + 'sayfa=' + n)); return l; };
const coz = (t) => t.replace(/&amp;/g, '&').replace(/&#0?39;/g, "'").replace(/&quot;/g, '"').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const tarih = (s) => { const m = /(\d{2})\.(\d{2})\.(\d{4})/.exec(s); return m ? `${m[3]}-${m[2]}-${m[1]}` : null; };

const sayfa = await sayfalar('');
const kart = {}, liste = [];
for (const h of sayfa) for (const m of h.matchAll(kartRe)) {
  const k = m[0], slug = slugOf(k); if (!slug || kart[slug]) continue;
  // Oturum jetonu ve form depoya girmez
  kart[slug] = k.replace(/<input type="hidden" name="_token"[^>]*>/g, '').replace(/<form method="POST"[^>]*class="disc-save-form">/, '<div class="disc-save-form">').replace(/<\/form>/, '</div>').replace(/\s+/g, ' ').replace(/https:\/\/dadagourmet\.com\/etkinlikler\/([a-z0-9-]+)/g, '{{kok}}etkinlik-detay/?e=$1');
  const yer = coz(/class="disc-where"[\s\S]*?<span class="dw-txt">([\s\S]*?)<\/span>/.exec(k)?.[1] ?? ''), z = coz(/class="disc-when[^"]*"[\s\S]*?<span class="dw-txt">([\s\S]*?)<\/span>/.exec(k)?.[1] ?? '');
  const parca = yer.split(',').map((x) => x.trim()), [bas, bit] = z.split('–').map((x) => tarih(x));
  liste.push({ slug, ad: coz(/<h3>([\s\S]*?)<\/h3>/.exec(k)[1]), ozet: coz(/<p>([\s\S]*?)<\/p>/.exec(k)?.[1] ?? ''), tur: coz(/class="disc-cat">([\s\S]*?)<\/span>/.exec(k)?.[1] ?? ''), yer, zaman: z, sehir: parca[0] ?? '', ulke: parca[parca.length - 1] ?? '', bas, bit: bit ?? bas, gorsel: /url\('([^']+)'/.exec(k)?.[1]?.replace('/400/', '/800/') ?? null, bilet: /btn-primary" href="(https?:[^"]+)"/.exec(k)?.[1] ?? null, f: {} });
}
const et = Object.fromEntries(liste.map((e) => [e.slug, e]));
// Türkiye üyeliği canlı süzgeçten: kart metnindeki ülke yazımına güvenilmez
for (const h of await sayfalar('ulke%5B%5D=' + encodeURIComponent('Türkiye'))) for (const m of h.matchAll(kartRe)) { const e = et[slugOf(m[0])]; if (e) e.tr = true; }
const ilk = sayfa[0], secenek = {};
const cipler = [...ilk.matchAll(/<a class="chip[^"]*"[^>]*href="[^"]*\?kategori=([a-z0-9-]+)"[^>]*>[\s\S]*?<\/i>([^<]+)<\/a>/g)].map((m) => ({ deger: m[1], ad: coz(m[2]) }));
secenek.kategori = cipler;
for (const c of cipler) for (const h of await sayfalar('kategori=' + c.deger)) for (const m of h.matchAll(kartRe)) { const e = et[slugOf(m[0])]; if (e) (e.f.kategori ??= []).push(c.deger); }
for (const g of ['tur', 'ucret', 'profil', 'diger']) {
  secenek[g] = [...ilk.matchAll(new RegExp(`<input type="checkbox" name="${g}\\[\\]" value="([^"]+)" data-count="(\\d+)"`, 'g'))].map((m) => ({ deger: m[1], sayi: +m[2] })).filter((s) => s.sayi > 0);
  for (const s of secenek[g]) for (const h of await sayfalar(`${g}%5B%5D=${encodeURIComponent(s.deger)}`)) for (const m of h.matchAll(kartRe)) { const e = et[slugOf(m[0])]; if (e) (e.f[g] ??= []).push(s.deger); }
}
fs.writeFileSync(path.join(SRC, 'veri/etkinlik.json'), JSON.stringify({ alinma: new Date().toISOString(), etkinlikler: liste, secenek }));
fs.writeFileSync(path.join(SRC, 'parcalar/etkinlik-kartlar.json'), JSON.stringify(kart));
const tr = liste.filter((e) => e.tr).length; console.log('etkinlik', liste.length, 'tr', tr, 'kategori', cipler.length, 'tur', secenek.tur.length, 'ucret', secenek.ucret.length, 'profil', secenek.profil.length, 'diger', secenek.diger.length);
