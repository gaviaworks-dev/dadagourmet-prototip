// Rozet ve rütbe seti derlemede: tarayıcının okuduğu `assets/js/rozet-veri.js` aynen çalıştırılır (K3 tek kaynak).
// Puan değerleri `assets/js/prototip.js` `dgPuan.KURAL`'dan okunur; bulunamazsa derleme durur, kopya sayı yazılmaz.
import fs from 'node:fs'; import path from 'node:path'; import vm from 'node:vm'; import { fileURLToPath } from 'node:url';
const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const pencere = {};
vm.runInNewContext(fs.readFileSync(path.join(KOK, 'assets/js/rozet-veri.js'), 'utf8'), { window: pencere });
export const ROZET = pencere.DG_ROZET;
const m = /KURAL:\s*(\{[^}]*\})/.exec(fs.readFileSync(path.join(KOK, 'assets/js/prototip.js'), 'utf8'));
if (!m) throw new Error('_rozet.mjs: prototip.js içinde dgPuan.KURAL bulunamadı');
export const KURAL = vm.runInNewContext('(' + m[1] + ')');
for (const k of ROZET.puanKurallari) if (typeof KURAL[k.k] !== 'number') throw new Error(`_rozet.mjs: dgPuan.KURAL.${k.k} yok`);
export const yerles = (metin) => ROZET.yerles(metin, KURAL);
