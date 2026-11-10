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
  // Hızlı filtrelerdeki sapma çipleri Sapma toleransının kopyasıydı (Beyar, 9 Kas): yalnız Sapma toleransı kalır
  boot.filtreler = boot.filtreler.filter((f) => f.kural !== 'detour_tier');
  h.setAttribute('data-boot', JSON.stringify(boot)); h.removeAttribute('data-csrf');
  h.setAttribute('data-login-url', '{{kok}}giris/'); h.setAttribute('data-register-url', '{{kok}}kayit/'); h.setAttribute('data-suggest-url', '{{kok}}mekanlar/');
  // Katman paneli ve il kartları: `rota-katman.js` doldurur, kabı şarj bloğunun yanında
  // Katmanlar (Beyar, 9 Kas): kutu düğmeler yerine üç grupta çip (Araç, İhtiyaç, Gastro); seçili çip dolu zemin ve onay işareti.
  // Araç türü (R3.3a): Elektrikli seçilince Enerji ve şarj katmanı ve DC hızlı süzgeci açılır (`rota-katman.js`)
  const cip = (at, v, i, a, on) => `<button type="button" class="cip yg-kcip" ${at}="${v}" aria-pressed="${on}"><i class="fa-solid ${i}" aria-hidden="true"></i><span>${a}</span></button>`;
  const grup = (id, ad, l) => `<div class="yg-katman-grup" role="group" aria-labelledby="${id}"><span class="yg-katman-grup-ad" id="${id}">${ad}</span><div class="cipler">${l.join('')}</div></div>`;
  $('section.yg-sarj').insertAdjacentHTML('beforebegin', `<section class="yg-katman" aria-label="Katmanlar"><div class="yg-katman-bas"><span class="yg-eyebrow">Katmanlar</span><span class="ornek-etiket">prototip örneği</span></div>${
    grup('ygKgArac', 'Araç', [cip('data-arac', 'yakit', 'fa-gas-pump', 'Yakıtlı', true), cip('data-arac', 'elektrikli', 'fa-bolt', 'Elektrikli', false)])}${
    grup('ygKgIhtiyac', 'İhtiyaç', [['sarj', 'fa-charging-station', 'Enerji ve şarj'], ['ibadet', 'fa-mosque', 'İbadethane'], ['tarihi', 'fa-landmark', 'Tarihi inanç yapıları'], ['dinlenme', 'fa-bed', 'Dinlenme alanı']].map(([k, i, a]) => cip('data-katman', k, i, a, false)))}${
    grup('ygKgGastro', 'Gastro', [['gastronomi', 'fa-utensils', 'Gastronomi', true], ['neyenir', 'fa-bowl-food', 'Ne Yenir?', false], ['nealinir', 'fa-basket-shopping', 'Ne Alınır?', false]].map(([k, i, a, on]) => cip('data-katman', k, i, a, on)))}</section>`);
  // Ayrı "Şarj istasyonları / Göster" kartı Enerji ve şarj katmanının kopyasıydı: kart ve aç/kapa düğmesi gizli, katman çipi açar
  $('section.yg-sarj').setAttribute('hidden', ''); $('#ygSarjToggle').setAttribute('hidden', '');
  // Çok duraklı aktarım (R3.6): adresler `rota-katman.js` ile duraklardan üretilir
  $('section.yg-katman').insertAdjacentHTML('beforebegin', '<section class="yg-aktar" id="ygAktar" aria-label="Navigasyona aktar" hidden><div class="yg-katman-bas"><span class="yg-eyebrow">Navigasyona Aktar</span><span class="yg-aktar-sayi" id="ygAktarSayi"></span></div><div class="yg-aktar-liste" id="ygAktarListe"></div><button type="button" class="yg-aktar-bag yg-telefon-dugme" id="ygTelefonGonder"><i class="fa-solid fa-mobile-screen" aria-hidden="true"></i><span><b id="ygTelefonAd"></b><small id="ygTelefonAlt"></small></span><span class="ornek-etiket">prototip örneği</span></button><p class="yg-aktar-not" id="ygAktarNot"></p></section>');
  $('section.yg-sarj').insertAdjacentHTML('beforebegin', '<section class="yg-katman-liste-kap" id="ygKatmanListe" aria-label="Katman noktaları" hidden><div class="yg-katman-bas"><span class="yg-eyebrow">Güzergâhtaki noktalar <span id="ygKatmanSayi">0</span></span><span class="ornek-etiket">prototip örneği</span></div><div id="ygKatmanSatir"></div></section>');
  // Yol üstü iller güzergâhın hemen altında, katmanlardan önce (Beyar, 9 Kas; canlı yerleşime tek istisna). Başlık kartları öne getirir
  $('#ygSummary').insertAdjacentHTML('afterend', '<section class="yg-iller" id="ygIller" aria-label="İl kartları" hidden><div class="yg-katman-bas"><button type="button" class="yg-iller-bas" id="ygIllerBas"><span class="yg-eyebrow">Yol üstü iller</span></button><span class="ornek-etiket">prototip örneği</span></div><div class="yg-il-liste" id="ygIlKart"></div></section>');
  // Telefona gönder penceresi: kabuk `parcalar/rota-telefon.html`, metin `rota-telefon-veri.js`
  $('#ygReport').insertAdjacentHTML('beforebegin', '<!-- @parca rota-telefon -->\n\n  ');
  // Alt marka kilidi (Beyar, 10 Kas): Gastro Kids/Health başlık kilidinin yapısı, "Route" logonun sağ üst çaprazında. Ayraç ve "Dada Route" yazısı kalkar
  const mb = $('header.yg-top .dg-brand'); mb.classList.add('yg-kilit'); mb.setAttribute('aria-label', 'Dada Gourmet Route · Keşfet');
  mb.insertAdjacentHTML('beforeend', '<span class="yg-kilit-alt" aria-hidden="true">Route</span>'); $('header.yg-top .yg-sep').remove(); $('header.yg-top .yg-title').remove();
  return { ust: $('header.yg-top').outerHTML, app: $('.yg-app').outerHTML, govdeSinif: b.className }; });
const f = path.join(SRC, 'sayfalar/dada-route/index.html'); fs.mkdirSync(path.dirname(f), { recursive: true });
const O = 'assets/o/assets/gourmet-public';
fs.writeFileSync(f, `<!--${JSON.stringify({ yol: 'dada-route', baslik: 'Dada Route', duzen: 'tam', zincir: 'rota', donor: 'https://dadagourmet.com/dada-route', css: ['assets/g/kanon/tokenlar.css', 'assets/g/kanon/markalar/gourmet.css', `${O}/vendor/leaflet-unpkg-1.9.4/leaflet.css`, 'dada-route.css', 'dada-route-sarj.css', 'shared/scroll-affordance.css', 'shared/dada-autocomplete.css', 'gourmet-sapma'], js: [`${O}/vendor/leaflet-unpkg-1.9.4/leaflet.js`, `${O}/js/shared/dada-autocomplete.js`, `${O}/js/shared/scroll-affordance.js`, 'assets/js/mekan-veri.js', 'assets/js/mekan-liste-veri.js', 'assets/js/rota-veri.js', 'assets/js/rota-yerler.js', 'assets/js/rota-yol-agi.js', 'assets/js/sayfa/rota-sahte.js', `${O}/js/dada-route.js`, 'assets/js/sayfa/rota-katman.js', 'assets/js/rota-telefon-veri.js', 'assets/js/sayfa/rota-telefon.js'], govdeSinif: g.govdeSinif })}-->\n${g.ust}\n${g.app}\n`);
await kapat(); console.log('rota tamam');
