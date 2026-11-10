// Gurme Lezzetler verisi. Yalnız kamuya açık GET: /gurme-lezzetler sayfaları, En Çok Okunan sırası, kategori adresleri ve yazı detaylarının etiket satırı. Uydurma değer yok.
// Kart DOM'u canlıdan bir kez kalıp olur (`kalip`); her içerik yalnız kendi alanlarını taşır. Çıktı: _src/veri/lezzet.json
// `node lezzet-veri.mjs etiket` yalnız etiketleri (detaydaki `#tagTrack .chip` metinleri) mevcut veriye yazar; liste yeniden çekilmez.
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const B = 'https://dadagourmet.com', UA = 'DadaGourmetKanonBot/1.0';
const bekle = (n) => new Promise((r) => setTimeout(r, n));
const al = async (u) => { await bekle(180); const r = await fetch(B + u, { headers: { 'User-Agent': UA, Accept: 'text/html' } }); if (!r.ok) throw new Error(r.status + ' ' + u); return r.text(); };
const kartRe = /<article class="disc-card ke-stop[\s\S]*?<\/article>/g;
const slugOf = (k) => /gurme-lezzetler\/([a-z0-9-]+)"/.exec(k)?.[1];
const son = (h) => Math.max(1, ...[...h.matchAll(/[?&](?:amp;)?sayfa=(\d+)/g)].map((m) => +m[1]));
const sayfalar = async (q) => { const ilk = await al('/gurme-lezzetler' + (q ? '?' + q : '')); const l = [ilk]; for (let n = 2, s = son(ilk); n <= s; n++) l.push(await al('/gurme-lezzetler?' + (q ? q + '&' : '') + 'sayfa=' + n)); return l; };
const coz = (t) => t.replace(/&amp;/g, '&').replace(/&#0?39;/g, "'").replace(/&quot;/g, '"').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const kartlar = (l) => l.flatMap((h) => [...h.matchAll(kartRe)].map((m) => m[0]));
// Etiket: canlı detayın `.ptr` satırı. Etiketi olmayan yazıda liste boş kalır (canlı da satırı basmaz)
const etiketler = async (l) => { let n = 0; for (const e of l) { const h = await al('/gurme-lezzetler/' + e.slug).catch((x) => { console.log('etiket alınamadı', x.message); return ''; }), t = /id="tagTrack">([\s\S]*?)<\/div>/.exec(h)?.[1] ?? ''; e.etiket = [...t.matchAll(/<a class="chip"[^>]*>[\s\S]*?<\/i>([^<]+)<\/a>/g)].map((m) => coz(m[1])); if (++n % 50 === 0) console.log('etiket', n, '/', l.length); } };
const VERI = path.join(SRC, 'veri/lezzet.json');
if (process.argv[2] === 'etiket') {
  const d = JSON.parse(fs.readFileSync(VERI, 'utf8')); await etiketler(d.lezzetler); fs.writeFileSync(VERI, JSON.stringify(d));
  console.log('etiketli', d.lezzetler.filter((e) => e.etiket.length).length, '/', d.lezzetler.length, 'toplam etiket', d.lezzetler.reduce((a, e) => a + e.etiket.length, 0)); process.exit(0);
}

const yeni = await sayfalar(''), ilk = yeni[0];
const secenek = [...ilk.matchAll(/<a class="chip[^"]*"[^>]*href="[^"]*\?kategori=([a-z0-9-]+)"[^>]*>\s*<i class="([^"]+)"[^>]*><\/i>([^<]+)<\/a>/g)].map((m) => ({ deger: m[1], ikon: m[2], ad: coz(m[3]) }));
const katAd = Object.fromEntries(secenek.map((s) => [s.ad, s.deger]));
const liste = [], gorulen = new Set(), turler = new Set();
for (const k of kartlar(yeni)) {
  const slug = slugOf(k); if (!slug || gorulen.has(slug)) continue; gorulen.add(slug);
  const fig = /<div class="disc-fig">([\s\S]*?)<span class="disc-cat">/.exec(k)?.[1] ?? '';
  for (const t of fig.matchAll(/class="([^"]+)"/g)) turler.add(t[1]);
  const cat = coz(/class="disc-cat">([\s\S]*?)<\/span>/.exec(k)?.[1] ?? '');
  liste.push({ slug, ad: coz(/<h3>([\s\S]*?)<\/h3>/.exec(k)[1]), ozet: coz(/<p>([\s\S]*?)<\/p>/.exec(k)?.[1] ?? ''), kat: katAd[cat] ?? null, katAd: cat, sure: coz(/class="mt">([\s\S]*?)<\/span>/.exec(k)?.[1] ?? ''), yazar: coz(/class="disc-author">([\s\S]*?)<\/span>/.exec(k)?.[1] ?? ''), tarih: coz(/class="disc-when">([\s\S]*?)<\/span>/.exec(k)?.[1] ?? ''), gorsel: /url\('([^']+)'/.exec(k)?.[1] ?? null });
}
const lz = Object.fromEntries(liste.map((e) => [e.slug, e]));
let sira = 0; for (const k of kartlar(await sayfalar('siralama=populer'))) { const e = lz[slugOf(k)]; if (e && e.oku === undefined) e.oku = sira++; }
// Kategori sayıları canlının kendi notundan: kart metninden çıkan üyelik doğrulanır
const denetim = [];
for (const s of secenek) { const h = await al('/gurme-lezzetler?kategori=' + s.deger), n = +(/(\d+) içerik/.exec(h)?.[1] ?? kartlar([h]).length), v = liste.filter((e) => e.kat === s.deger).length; s.sayi = n; if (n !== v) denetim.push(`${s.deger}: canlı ${n}, veri ${v}`); }
const toplam = +(/(\d+) içerik/.exec(ilk)?.[1] ?? 0);
await etiketler(liste);
fs.writeFileSync(VERI, JSON.stringify({ alinma: new Date().toISOString(), toplam, secenek, lezzetler: liste }));
const gor = Object.fromEntries(liste.map((e) => [e.gorsel, 1]));
console.log('lezzet', liste.length, 'canlı toplam', toplam, 'kategori', secenek.length, 'oku', liste.filter((e) => e.oku !== undefined).length, 'kategorisiz', liste.filter((e) => !e.kat).map((e) => e.katAd + ':' + e.slug).slice(0, 8));
console.log('fark', denetim, 'fig', [...turler], 'gorsel', Object.keys(gor).length);
