// Dada Route web: canlı ham HTML, `dada-route.js`, `dada-route.css` ve Leaflet aynen kalır. Sunucu uçları yerine `rota-sahte.js` statik yanıt verir.
// MapLibre geçişi K7 ile Faz 4'te yapılır. Katmanlar ve il kartları canlı yapının üstüne eklenir; panel solda kalır.
// Kaynak: `<cekim>/dom/o-route-ham.html`, betik çalışmamış ham sayfa.
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { ac, kapat } from './dom.mjs';
const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'); const D = process.argv[2];
const p = await ac(path.join(D, 'o-route-ham.html'));
const g = await p.evaluate(() => { kok(document.body); const b = document.body; const $ = (s) => b.querySelector(s);
  const h = $('#routeMap'); const boot = JSON.parse(h.getAttribute('data-boot'));
  boot.provider = { ad: 'Prototip örneği', surucu: 'ornek', demo: true, yetenek: { ucretliYol: false, feribot: false, trafik: false, routeMatrix: false, calismaSaati: false } };
  const ucGez = (o) => { Object.keys(o).forEach((k) => { if (typeof o[k] === 'string') o[k] = o[k].replace(/^https:\/\/dadagourmet\.com\/dada-route\//, '{{kok}}dada-route/api/').replace(/^https:\/\/dadagourmet\.com\/giris[^"]*$/, '{{kok}}giris/').replace(/^https:\/\/dadagourmet\.com\/kayit$/, '{{kok}}kayit/').replace(/^https:\/\/dadagourmet\.com\/mekanlar$/, '{{kok}}mekanlar/').replace(/^https:\/\/dadagourmet\.com\//, '{{kok}}'); }); };
  ucGez(boot.uclar); boot.auth = false;
  // Canlı sınır 3 (`config/dadaroute.php`); şarj, yemek, alışveriş, ibadet ve dinlenme durağı buna sığmaz. Google'ın 9 ara durak sınırına çekildi
  boot.maxAraDurak = 9;
  h.setAttribute('data-boot', JSON.stringify(boot)); h.removeAttribute('data-csrf');
  h.setAttribute('data-login-url', '{{kok}}giris/'); h.setAttribute('data-register-url', '{{kok}}kayit/'); h.setAttribute('data-suggest-url', '{{kok}}mekanlar/');
  // Katman paneli ve il kartları: `rota-katman.js` doldurur, kabı şarj bloğunun yanında
  const kat = [['gastronomi', 'fa-utensils', 'Gastronomi', true], ['sarj', 'fa-charging-station', 'Enerji ve şarj', false], ['ibadet', 'fa-mosque', 'İbadethane', false], ['dinlenme', 'fa-bed', 'Dinlenme alanı', false], ['neyenir', 'fa-bowl-food', 'Ne Yenir?', false], ['nealinir', 'fa-basket-shopping', 'Ne Alınır?', false]];
  $('section.yg-sarj').insertAdjacentHTML('beforebegin', `<section class="yg-katman" aria-label="Katmanlar"><div class="yg-katman-bas"><span class="yg-eyebrow">Katmanlar</span><span class="ornek-etiket">prototip örneği</span></div><div class="yg-katman-liste">${kat.map(([k, i, a, on]) => `<button type="button" class="yg-katman-dugme" data-katman="${k}" aria-pressed="${on}"><i class="fa-solid ${i}" aria-hidden="true"></i><span>${a}</span></button>`).join('')}</div></section>`);
  // Çok duraklı aktarım (R3.6): adresler `rota-katman.js` ile duraklardan üretilir
  $('section.yg-katman').insertAdjacentHTML('beforebegin', '<section class="yg-aktar" id="ygAktar" aria-label="Navigasyona aktar" hidden><div class="yg-katman-bas"><span class="yg-eyebrow">Navigasyona Aktar</span><span class="yg-aktar-sayi" id="ygAktarSayi"></span></div><div class="yg-aktar-liste" id="ygAktarListe"></div><p class="yg-aktar-not" id="ygAktarNot"></p></section>');
  $('section.yg-sarj').insertAdjacentHTML('beforebegin', '<section class="yg-katman-liste-kap" id="ygKatmanListe" aria-label="Katman noktaları" hidden><div class="yg-katman-bas"><span class="yg-eyebrow">Güzergâhtaki noktalar <span id="ygKatmanSayi">0</span></span><span class="ornek-etiket">prototip örneği</span></div><div id="ygKatmanSatir"></div></section>');
  $('#ygBrowseCta').insertAdjacentHTML('beforebegin', '<section class="yg-iller" id="ygIller" aria-label="İl kartları" hidden><div class="yg-katman-bas"><span class="yg-eyebrow">Yol üstü iller</span><span class="ornek-etiket">prototip örneği</span></div><div class="yg-il-liste" id="ygIlKart"></div></section>');
  return { ust: $('header.yg-top').outerHTML, app: $('.yg-app').outerHTML, govdeSinif: b.className }; });
const f = path.join(SRC, 'sayfalar/dada-route/index.html'); fs.mkdirSync(path.dirname(f), { recursive: true });
const O = 'assets/o/assets/gourmet-public';
fs.writeFileSync(f, `<!--${JSON.stringify({ yol: 'dada-route', baslik: 'Dada Route', duzen: 'tam', zincir: 'rota', donor: 'https://dadagourmet.com/dada-route', css: ['assets/g/kanon/tokenlar.css', 'assets/g/kanon/markalar/gourmet.css', `${O}/vendor/leaflet-unpkg-1.9.4/leaflet.css`, 'dada-route.css', 'dada-route-sarj.css', 'shared/scroll-affordance.css', 'shared/dada-autocomplete.css', 'gourmet-sapma'], js: [`${O}/vendor/leaflet-unpkg-1.9.4/leaflet.js`, `${O}/js/shared/dada-autocomplete.js`, `${O}/js/shared/scroll-affordance.js`, 'assets/js/mekan-veri.js', 'assets/js/mekan-liste-veri.js', 'assets/js/rota-veri.js', 'assets/js/sayfa/rota-sahte.js', `${O}/js/dada-route.js`, 'assets/js/sayfa/rota-katman.js'], govdeSinif: g.govdeSinif })}-->\n${g.ust}\n${g.app}\n`);
await kapat(); console.log('rota tamam');
