// Donör varlıklarını assets/ altına alır. Kaynak: `donor-cek.mjs` çıktısı (argüman: çekim klasörü).
// Gastro zinciri assets/g/, Gourmet gövde zinciri assets/o/ altına iner.
// Yalnız iki dönüşüm yapılır: (1) kök göreli url() bağları göreli hâle gelir, (2) Gastro marka rengi Gourmet'e eşlenir.
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const CEKIM = process.argv[2]; const KANON = process.argv[3]; // KANON: Gastro public/kanon/markalar/gourmet.css
// Gourmet değerleri kanon: `markalar/gourmet.css` (Pantone 259 C). Karışım oranları ortak-bilesenler.md §7.
const RENK = [[/#dc3d17/gi,'#742982'],[/#ba3413/gi,'#62236e'],[/#9c2b10/gi,'#521d5c'],[/#ea8b74/gi,'#b57fc1'],[/#e87f66/gi,'#ac72b4'],[/#f1b1a2/gi,'#c7a9cd'],[/#fbe6e1/gi,'#ede4ef'],[/#fdecea/gi,'#f1e9f3'],[/rgba\(\s*220\s*,\s*61\s*,\s*23\s*,/g,'rgba(116,41,130,'],[/rgb\(\s*220\s*,?\s*61\s*,?\s*23\s*\)/g,'rgb(116,41,130)']];
const yuru=(d,c=[])=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);e.isDirectory()?yuru(p,c):c.push(p);}return c;};
// Yorumlardaki tohum kişi ve yerel izler yayına girmez
const uyeDom = path.join(CEKIM, 'dom/gl-hesabim.html'); const uyeHtml = fs.existsSync(uyeDom) ? fs.readFileSync(uyeDom, 'utf8') : '';
const alan = (n) => new RegExp(`name="${n}"[^>]*value="([^"]+)"`).exec(uyeHtml)?.[1] ?? '';
const tohumAd = `${alan('ad')} ${alan('soyad')}`.trim(), tohumK = alan('kullanici_adi') || alan('kullanici-adi');
const yorumTemizle = (t) => { if (tohumAd) t = t.replaceAll(tohumAd, 'örnek üye'); if (tohumK) t = t.replaceAll('@' + tohumK, '@ornekuye'); return t.replace(/\d+\.\d+\.\d+\.\d+:\d+(\/[^\s)`]*)?/g, 'yerel ortam').replace(/\b[s]cratchpad\/[^\s·]*/g, 'ölçüm betiği'); };
function kopya(alan, hedefKok, kokAdlari) {
  const k=path.join(CEKIM,'assets',alan); let n=0;
  for(const f of yuru(k)){
    const g=path.relative(k,f); const h=path.join(KOK,'assets',hedefKok,g);
    fs.mkdirSync(path.dirname(h),{recursive:true});
    if(f.endsWith('.css')){
      let s=fs.readFileSync(f,'utf8');
      const geri='../'.repeat(g.split('/').length-1)||'./';
      s=s.replace(/url\((["']?)\/(?!\/)/g,(m,q)=>`url(${q}${geri}`);
      s=s.replace(/@import\s+(["'])\/(?!\/)/g,(m,q)=>`@import ${q}${geri}`);
      for(const [a,b] of RENK) s=s.replace(a,b);
      fs.writeFileSync(h,yorumTemizle(s));
    } else if(f.endsWith('.js')) { let s=fs.readFileSync(f,'utf8'); for(const [a,b] of RENK) s=s.replace(a,b); fs.writeFileSync(h,yorumTemizle(s)); }
    else fs.copyFileSync(f,h);
    n++;
  }
  return n;
}
console.log('g',kopya('dadagastro.com','g'));
console.log('o',kopya('dadagourmet.com','o'));
// Marka katmanı: gastro.css yerine kanonun Gourmet dosyası
fs.copyFileSync(KANON,path.join(KOK,'assets/g/kanon/markalar/gourmet.css'));
fs.rmSync(path.join(KOK,'assets/g/kanon/markalar/gastro.css'),{force:true});
// Gastro'nun tepe görselleri yerine canlı Gourmet görseli: Gourmet ekranında Gastro fotoğrafı görünmez
for(const [g,o] of [['varliklar/reference/yasal/yasal.css','legal-restaurant.avif'],['varliklar/reference/iletisim/iletisim.css','contact-kitchen.avif'],['gastro/iletisim.css','contact-kitchen.avif']]){const f=path.join(KOK,'assets/g',g);if(!fs.existsSync(f))continue;const geri='../'.repeat(g.split('/').length);fs.writeFileSync(f,fs.readFileSync(f,'utf8').replace(/url\((["']?)[^"')]*_dis\/images\.unsplash\.com[^"')]*\1\)/g,`url("${geri}o/assets/gourmet-public/img/${o}")`));}
// Kök göreli dinamik betik yolu alt dizinde kırılır
{const f=path.join(KOK,'assets/g/f4/uye-ayarlar-erken.js');if(fs.existsSync(f))fs.writeFileSync(f,fs.readFileSync(f,'utf8').replace("s.src = '/f4/uye-avatar.js?v=20260920-1'","s.src = (document.documentElement.dataset.kok || '/') + 'assets/g/f4/uye-avatar.js'"));}
const yol=path.join(KOK,'assets/g/kanon'); for(const f of yuru(path.join(KOK,'assets/g'))) if(f.endsWith('.css')){const s=fs.readFileSync(f,'utf8');if(s.includes('markalar/gastro.css'))fs.writeFileSync(f,s.replaceAll('markalar/gastro.css','markalar/gourmet.css'));}
