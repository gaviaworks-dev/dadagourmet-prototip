// Etkinlik detayı: "Bir bakışta" Yer ve Ücret satırları, "Kimler Katılabilir?" çipleri. Yalnız kamuya açık GET: /etkinlikler/<slug>.
// Çıktı: _src/veri/etkinlik-detay.json. Değer yoksa alan yazılmaz; uydurma yok.
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const B = 'https://dadagourmet.com', UA = 'DadaGourmetKanonBot/1.0';
const bekle = (n) => new Promise((r) => setTimeout(r, n));
const temiz = (t) => t.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#0?39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
const satir = (h, ad) => { const m = new RegExp(`<b>${ad}</b><span>([\\s\\S]*?)</span>`).exec(h); return m ? temiz(m[1]) : null; };
const { etkinlikler } = JSON.parse(fs.readFileSync(path.join(SRC, 'veri/etkinlik.json'), 'utf8'));
const cikti = {}; let hata = 0;
for (const e of etkinlikler) {
  await bekle(900);
  const r = await fetch(`${B}/etkinlikler/${e.slug}`, { headers: { 'User-Agent': UA, Accept: 'text/html' } });
  if (!r.ok) { hata++; console.error(r.status, e.slug); continue; }
  const h = await r.text(), k = {};
  const yer = satir(h, 'Yer'), ucret = satir(h, 'Ücret');
  if (yer) k.yer = yer; if (ucret) k.ucret = ucret;
  const kb = /Kimler Katılabilir\?<\/h3>\s*<div class="evd-tag-row">([\s\S]*?)<\/div>/.exec(h);
  if (kb) k.kimler = [...kb[1].matchAll(/<span class="chip"><i class="([^"]+)"[^>]*><\/i>([\s\S]*?)<\/span>/g)].map((m) => [m[1], temiz(m[2])]);
  cikti[e.slug] = k;
}
fs.writeFileSync(path.join(SRC, 'veri/etkinlik-detay.json'), JSON.stringify({ alinma: new Date().toISOString(), detay: cikti }));
const say = (a) => Object.values(cikti).filter((k) => k[a]).length;
console.log('etkinlik', Object.keys(cikti).length, 'yer', say('yer'), 'ucret', say('ucret'), 'kimler', say('kimler'), 'hata', hata);
