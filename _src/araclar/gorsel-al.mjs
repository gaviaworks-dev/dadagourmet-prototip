// _src altındaki canlı Gourmet görsel adreslerini yerele indirir ve adresi değiştirir. Beyar'ın görselleri aynen kullanılır.
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..'); const UA = 'DadaGourmetKanonBot/1.0';
const yuru = (d, c = []) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); e.isDirectory() ? yuru(p, c) : c.push(p); } return c; };
const dosyalar = [...yuru(path.join(KOK, '_src/sayfalar')), ...yuru(path.join(KOK, '_src/parcalar'))].filter((f) => /\.(html|json)$/.test(f));
const RE = /https:\/\/dadagourmet\.com\/((?:assets\/gourmet-public\/[^"'()\s\\]+?\.(?:avif|webp|jpe?g|png|svg))|(?:medya\/\d+)(?:\?w=\d+)?)/g;
const uzanti = { 'image/webp': 'webp', 'image/avif': 'avif', 'image/jpeg': 'jpg', 'image/png': 'png', 'image/svg+xml': 'svg' };
// Kök göreli adresler ve --zemin-* değişkenleri: url() değişkeni stil dosyasına göre çözüldüğü için kalkar
for (const f of dosyalar) { const eski = fs.readFileSync(f, 'utf8'); const yeni = eski.replace(/;?--zemin-(?:orta|dar):url\([^)]*\)/g, '').replace(/(url\((?:['"]|&quot;)?|src=\\?"|srcset=\\?")\/assets\/gourmet-public\//g, '$1https://dadagourmet.com/assets/gourmet-public/'); if (yeni !== eski) fs.writeFileSync(f, yeni); }
const harita = new Map();
for (const f of dosyalar) for (const m of fs.readFileSync(f, 'utf8').matchAll(RE)) harita.set(m[0], m[1]);
let n = 0, h = 0; const sonuc = new Map();
for (const [url, yol] of harita) {
  const r = await fetch(url.replace(/&amp;/g, '&'), { headers: { 'User-Agent': UA } });
  if (!r.ok) { console.log('YOK', r.status, url); h++; continue; }
  const b = Buffer.from(await r.arrayBuffer()); const t = (r.headers.get('content-type') || '').split(';')[0];
  const hedef = yol.startsWith('medya/') ? `medya/${yol.replace('medya/', '').replace('?w=', '-')}.${uzanti[t] ?? 'jpg'}` : yol;
  const f = path.join(KOK, 'assets/o', hedef); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, b); sonuc.set(url, '{{kok}}assets/o/' + hedef); n++;
}
for (const f of dosyalar) { let s = fs.readFileSync(f, 'utf8'); const eski = s; s = s.replace(RE, (m) => sonuc.get(m) ?? m); if (s !== eski) fs.writeFileSync(f, s); }
console.log('indirilen', n, 'hata', h);
