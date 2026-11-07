// Şehir Rehberleri: `node sayfa-sehir.mjs <cekim>/dom`. Gövde canlı `/sehir-rehberleri` ve `/sehir-rehberleri/istanbul` render'ı.
// Canlıda yayında tek rehber var; detay o rehberin DOM'udur, ayrı veri ve betik gerekmez.
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { ac, kapat } from './dom.mjs';
const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'); const D = process.argv[2];
const yaz = (y, meta, govde) => { const f = path.join(SRC, 'sayfalar', y, 'index.html'); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, `<!--${JSON.stringify({ yol: y, ...meta })}-->\n${govde}\n`); };
const css = ['hakkimizda.css', 'hakkimizda-uyarlama.css', 'gourmet-kurumsal.css', 'banner-uyarlama.css', 'gourmet-sapma'];
const govde = async (ad) => { const p = await ac(path.join(D, ad)); return p.evaluate(() => { kok(document.body); const m = document.querySelector('main'); m.removeAttribute('style'); m.querySelectorAll('script').forEach((s) => s.parentNode.removeChild(s)); m.querySelectorAll('.reveal').forEach((e) => e.classList.remove('reveal')); return m.innerHTML; }); };
yaz('sehir-rehberleri', { baslik: 'Şehir Rehberleri', zincir: 'hakkimizda', gourmet: true, css, govdeSinif: 'pg-gourmet-sehir-rehberleri', donor: 'https://dadagourmet.com/sehir-rehberleri' }, await govde('o-sehir.html'));
yaz('sehir-rehberi-detay', { baslik: 'İstanbul · Şehir Rehberi', zincir: 'hakkimizda', gourmet: true, css, govdeSinif: 'pg-gourmet-sehir-rehberi', donor: 'https://dadagourmet.com/sehir-rehberleri/istanbul' }, await govde('o-sehir-detay.html'));
await kapat(); console.log('sehir tamam');
