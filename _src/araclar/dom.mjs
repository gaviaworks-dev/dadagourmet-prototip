// Donör DOM'unu betiksiz, ağsız bir Chromium sekmesinde açar; dönüşümler render edilmiş DOM üstünde koşar.
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(process.env.PW_KOK ?? process.cwd() + '/package.json');
const { chromium } = require('playwright');
let tarayici, sekme;
export async function ac(dosya) {
  tarayici ??= await chromium.launch();
  sekme ??= await (await tarayici.newContext({ javaScriptEnabled: true })).newPage();
  await sekme.route('**/*', (r) => r.abort());
  await sekme.setContent(fs.readFileSync(dosya, 'utf8').replace(/<script[\s\S]*?<\/script>/g, ''));
  await sekme.addScriptTag({ content: ORTAK });
  return sekme;
}
export const kapat = () => tarayici?.close();
// Sayfa içinde kullanılan yardımcılar: bağ kökü, jeton silme, marka metni
const ORTAK = `
window.kok=(root)=>{
  root.querySelectorAll('[href]').forEach(a=>{const h=a.getAttribute('href');const m=h.match(/^(?:https?:\\/\\/(?:www\\.)?(?:dadagourmet\\.com|\\d+\\.\\d+\\.\\d+\\.\\d+:\\d+|dadagastro\\.com(?=\\/(?:giris|kayit|yasal|hakkimizda|kunye|iletisim|hesabim)))|)(\\/[^#?]*)?([?#].*)?$/);
    if(!m||h==='#'||h.startsWith('#'))return; let p=(m[1]||'/').replace(/^\\//,'').replace(/\\/$/,''); a.setAttribute('href','{{kok}}'+(p?p+'/':'')+(m[2]||''));});
  root.querySelectorAll('form[action]').forEach(f=>{f.removeAttribute('action');f.setAttribute('data-prototip-form','')});
  root.querySelectorAll('input[name="_token"],input[name="kalkan_zaman"],input[name="kalkan_web"]').forEach(e=>e.remove());
  root.querySelectorAll('[onclick]').forEach(e=>{const m=(e.getAttribute('onclick')||'').match(/location\\.href='\\/?([^']*)'/);if(m){e.setAttribute('data-git','{{kok}}'+(m[1]?m[1].replace(/\\/$/,'')+'/':''));}e.removeAttribute('onclick');});
  return root;};
window.marka=(s)=>s.replace(/DadaGastro/g,'Dada Gourmet').replace(/Dada Gastro/g,'Dada Gourmet');
window.metin=(root,re,yeni)=>{const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode()){if(re.test(n.nodeValue))n.nodeValue=n.nodeValue.replace(re,yeni);}};
`;
