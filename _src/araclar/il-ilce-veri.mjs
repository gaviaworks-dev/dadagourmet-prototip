// Türkiye il ve ilçe listesini üretir: `assets/js/il-ilce-veri.js` (il-ilce ajanı, 11 Kas).
// Kaynak yalnız okunur: ../DadaGourmet-panel/database/data/turkiye-il-ilce.json (81 il, 973 ilçe; ad, slug, bölge, koordinat).
// Yalnız `name` alanları alınır; kaynak sırası Türkçe değil, burada `localeCompare(x, 'tr')` ile sıralanır.
// Çalıştırma: node _src/araclar/il-ilce-veri.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const KOK = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');
// Depo kökünün kardeşi (`../DadaGourmet-panel`); worktree kopyasında üst dizinlere doğru aranır
const ALT = 'DadaGourmet-panel/database/data/turkiye-il-ilce.json';
let kaynak = null;
for (let d = KOK; d !== path.dirname(d) && !kaynak; d = path.dirname(d)) { const a = path.join(path.dirname(d), ALT); if (fs.existsSync(a)) kaynak = a; }
if (!kaynak) throw new Error('kaynak yok: ../' + ALT);
const ham = JSON.parse(fs.readFileSync(kaynak, 'utf8'));
const tr = (a, b) => a.localeCompare(b, 'tr');
const liste = ham.map((il) => [il.name, il.districts.map((d) => d.name).sort(tr)]).sort((a, b) => tr(a[0], b[0]));
const ilce = liste.reduce((s, [, l]) => s + l.length, 0);
if (liste.length !== 81 || ilce !== 973) throw new Error(`beklenmeyen sayı: ${liste.length} il, ${ilce} ilçe`);

const govde = liste.map(([il, l]) => `  [${JSON.stringify(il)}, ${JSON.stringify(l)}]`).join(',\n');
const cikti = `/* Türkiye il ve ilçe listesi: TEK KAYNAK (il-ilce ajanı, 11 Kas). 81 il, 973 ilçe.
   Kaynak: ../DadaGourmet-panel/database/data/turkiye-il-ilce.json (depo kökünün kardeşi; yalnız \`name\` alanları; slug, bölge ve koordinat alınmadı).
   Sıra Türkçe alfabe, localeCompare(x, 'tr'): Ç, Ğ, İ, Ö, Ş, Ü kendi yerinde (Çatalca, Çekmeköy C'den sonra; Şile, Şişli S'den sonra).
   Üreten: _src/araclar/il-ilce-veri.mjs; elle düzenlenmez. Okuyan: assets/js/il-ilce.js (tarayıcıda \`window.DG_IL_ILCE\`) ve
   derlemede _src/sayfalar/isletme/panel.mjs (il ve kayıtlı ilin ilçe seçenekleri). Biçim: [il, [ilçe, …]] */
(function (kok) {
  'use strict';
  kok.DG_IL_ILCE = [
${govde}
  ];
})(typeof window !== 'undefined' ? window : globalThis);
`;
fs.writeFileSync(path.join(KOK, 'assets/js/il-ilce-veri.js'), cikti);
console.log('il-ilce-veri.js', liste.length, 'il', ilce, 'ilçe');
