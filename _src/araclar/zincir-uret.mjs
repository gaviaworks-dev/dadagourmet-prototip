// Her donör sayfanın CSS ve JS listesini belge sırasıyla çıkarır: _src/kabuk/zincir.json
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'); const D = process.argv[2];
const atla = /analitik\.js|mentor\.(css|js)|goruntulenme\.js|kanon\/gomulu\/j-|tarif-eylem\.js|sosyal-kayit-onayi\.js|alisveris-erisim\.js|tercih\/tur-kabuk|tercih\/uye-sihirbaz/;
const yol = (u) => u.replace(/\?.*$/, '').replace(/^https?:\/\/(?:dadagastro\.com|\d+\.\d+\.\d+\.\d+:\d+)/, '').replace(/^\//, '').replace('kanon/markalar/gastro.css', 'kanon/markalar/gourmet.css');
const liste = (f) => { const h = fs.readFileSync(path.join(D, f + '.html'), 'utf8');
  const css = [...new Set([...h.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*>/g)].map((m) => yol(m[0].match(/href="([^"]+)"/)[1])))].filter((x) => !atla.test(x));
  const js = []; for (const m of h.matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*>/g)) { const y = yol(m[1]); if (atla.test(y) || js.some((j) => j.y === y)) continue; js.push({ y, modul: /type="module"/.test(m[0]) }); }
  const html = h.match(/<html([^>]*)>/)[1], govde = h.match(/<body([^>]*)>/)[1];
  return { css, js, baslikZemin: /data-baslik-zemin="([^"]+)"/.exec(html)?.[1] ?? null, govdeSinif: /class="([^"]*)"/.exec(govde)?.[1] ?? '', heroTur: /data-fit-hero-kind="([^"]*)"/.exec(govde)?.[1] ?? null }; };
const z = {}; for (const [a, f] of Object.entries({ giris: 'g-giris', kayit: 'g-kayit', hakkimizda: 'g-hakkimizda', kunye: 'g-kunye', iletisim: 'g-iletisim', yasal: 'g-yasal', kvkk: 'g-kvkk', ana: 'g-home', hesabim: 'gl-hesabim' })) z[a] = liste(f);
z.rota = { css: z.hakkimizda.css.filter((c) => c.includes('fontawesome')), js: [], baslikZemin: null, govdeSinif: '', heroTur: null };
fs.writeFileSync(path.join(SRC, 'kabuk/zincir.json'), JSON.stringify(z, null, 1)); console.log(Object.keys(z).join(' '));
