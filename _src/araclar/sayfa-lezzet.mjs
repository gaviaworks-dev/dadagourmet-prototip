// Gurme Lezzetler: `node sayfa-lezzet.mjs <cekim>/dom`. Gövde canlı `/gurme-lezzetler` ve bir yazı detayı render'ı.
// Liste, kategori, sıralama, arama ve sayfalama `assets/js/sayfa/lezzetler.js` ile çalışır; veri `lezzet-veri.mjs` çıktısı. Kart kalıbı `_src/parcalar/lezzet-kart.html`.
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { ac, kapat } from './dom.mjs';
const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'); const D = process.argv[2];
const yaz = (y, meta, govde) => { const f = path.join(SRC, 'sayfalar', y, 'index.html'); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, `<!--${JSON.stringify({ yol: y, ...meta })}-->\n${govde}\n`); };
const ORNEK = 'nohut-nasil-pisirilir';
const css = ['gurme-lezzetler.css', 'gurme-lezzetler-uyarlama.css'];

let p = await ac(path.join(D, 'o-lezzet.html'));
const { liste, kalip } = await p.evaluate(() => { kok(document.body); const m = document.querySelector('main'); m.removeAttribute('style'); const $ = (s, r = m) => r.querySelector(s), $$ = (s, r = m) => [...r.querySelectorAll(s)];
  $$('script').forEach((s) => s.parentNode.removeChild(s));
  // Canlı her istekte üç kapak görselinden birini verir; prototip bu sayfanın kendi görselinde sabit
  $('.px-media').style.backgroundImage = 'url("https://dadagourmet.com/assets/gourmet-public/img/gurme-lezzetler/banner-g3-pilot.webp")';
  // Kart: canlı DOM kalıp olur; alanlar yer tutucuya döner
  const k = $('.disc-card.ke-stop').cloneNode(true); k.setAttribute('data-slug', '%slug%');
  $('.disc-card-link', k).setAttribute('href', '{{kok}}gurme-lezzet-detay/?l=%slug%');
  $('.bg', k).setAttribute('style', "background-image:url('%gorsel%')");
  $('.mt', k).lastChild.nodeValue = ' %sure%'; $('.disc-cat', k).textContent = '%kat%'; $('h3', k).textContent = '%ad%'; $('p', k).textContent = '%ozet%';
  $('.disc-author', k).lastChild.nodeValue = ' %yazar%'; $('.disc-when', k).lastChild.nodeValue = ' %tarih%';
  // Çip ve sıralama gerçek bağ taşır (canlıdaki gibi); değer bağdan okunur, geçiş sayfa içinde
  $$('.ke-filter .chip').forEach((a) => { a.dataset.kategori = /kategori=([a-z0-9-]+)/.exec(a.getAttribute('href') || '')?.[1] ?? ''; });
  $$('.disc-tabs .dt').forEach((a) => { a.dataset.sira = /siralama=(yeni|populer)/.exec(a.getAttribute('href') || '')?.[1] ?? 'yeni'; });
  $('.disc-grid').id = 'lzGrid'; $('#lzGrid').innerHTML = ''; $('#pagi').innerHTML = '';
  // Arama (`?q=`, canlı liste tanır; etiket bağları buraya gelir): canlı boş sonuç bloğu `.lst-empty` ve etkin arama satırı (canlıda yok, sapma)
  $('#lzGrid').insertAdjacentHTML('afterend', '<div class="lst-empty" id="lzBos"><span class="le-ico"><i class="fa-solid fa-book-open" aria-hidden="true"></i></span><h3>Bu aramayla eşleşen keşif yok</h3><p>Başka bir kelime ya da kategori deneyin.</p></div>'); $('#lzGrid').insertAdjacentHTML('beforebegin', '<p class="lz-arama" id="lzArama" hidden></p>');
  return { liste: m.innerHTML, kalip: k.outerHTML.replace(/\s+/g, ' ') }; });
fs.writeFileSync(path.join(SRC, 'parcalar/lezzet-kart.html'), kalip + '\n');
yaz('gurme-lezzetler', { baslik: 'Gurme Lezzetler', aktif: 'gurme-lezzetler', zincir: 'hakkimizda', gourmet: true, css: [...css, 'banner-uyarlama.css', 'gourmet-sapma'], js: ['assets/js/lezzet-veri.js', 'assets/js/sayfa/lezzetler.js'], govdeSinif: 'pg-gurme-lezzetler has-dark-hero', donor: 'https://dadagourmet.com/gurme-lezzetler' }, liste);

p = await ac(path.join(D, 'o-lezzet-detay.html'));
const detay = await p.evaluate((ornek) => { kok(document.body); const m = document.querySelector('main'); m.removeAttribute('style'); const $ = (s, r = m) => r.querySelector(s), $$ = (s, r = m) => [...r.querySelectorAll(s)];
  $$('script').forEach((s) => s.parentNode.removeChild(s));
  // Örnek yazı DOM'u kalıp olur; başka adreste alanları `lezzetler.js` doldurur. Tam metin yalnız örnekte vardır
  $('.art-col').dataset.ornek = ornek;
  const g = $('.art-related .disc-grid'); g.id = 'lzIlgili'; g.dataset.ilgili = $$('.disc-card-link', g).map((a) => /gurme-lezzetler\/([a-z0-9-]+)/.exec(a.getAttribute('href'))?.[1]).join(','); g.innerHTML = '';
  $$('.reveal').forEach((e) => e.classList.remove('reveal'));
  return m.innerHTML; }, ORNEK);
yaz('gurme-lezzet-detay', { baslik: 'Gurme Lezzetler', aktif: 'gurme-lezzetler', zincir: 'hakkimizda', gourmet: true, css: [...css, 'gourmet-sapma'], js: ['assets/js/lezzet-veri.js', 'assets/js/sayfa/lezzetler.js'], govdeSinif: 'pg-gurme-lezzetler-detay has-dark-hero', donor: 'https://dadagourmet.com/gurme-lezzetler/' + ORNEK }, detay);
await kapat(); console.log('lezzet tamam');
