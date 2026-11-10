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
  // Katmanlar (Beyar, 10 Kas D3, D8): Araç kanon segmenti (Yakıtlı | Elektrikli) tam genişlikte; altında Yakıtlı'da "Yakıt istasyonları",
  // Elektrikli'de canlı "Şarj istasyonları" kartı (canlı bileşen aynen, aynı kalıpta yakıt kartı). İhtiyaç ve Gastro çipleri yalnız haritada göster/gizle;
  // ihtiyaç listesi alt şeritteki İhtiyaçlar sekmesinde (`rota-katman.js`). "Enerji ve şarj" ve "Tarihi inanç yapıları" çipleri kalktı (Araç ve İbadethane)
  const cip = (at, v, i, a, on) => `<button type="button" class="cip yg-kcip" ${at}="${v}" aria-pressed="${on}"><i class="fa-solid ${i}" aria-hidden="true"></i><span>${a}</span></button>`;
  const grup = (id, ad, l) => `<div class="yg-katman-grup" role="group" aria-labelledby="${id}"><span class="yg-katman-grup-ad" id="${id}">${ad}</span><div class="cipler">${l.join('')}</div></div>`;
  const sarj = $('section.yg-sarj'); sarj.id = 'ygSarjKart'; sarj.setAttribute('hidden', '');
  const yakit = '<section class="yg-sarj yg-yakit" id="ygYakit" aria-label="Yakıt istasyonları"><button class="yg-sarj-toggle" id="ygYakitToggle" type="button" aria-pressed="false" aria-controls="ygYakitBody"><i class="fa-solid fa-gas-pump" aria-hidden="true"></i> Yakıt istasyonları <span id="ygYakitToggleText">Göster</span></button><div id="ygYakitBody" hidden=""><p id="ygYakitStatus" class="yg-sarj-status" role="status" aria-live="polite">Rotanı çizince yakıt istasyonları burada görünecek.</p><p class="yg-sarj-credit" id="ygYakitKaynak">Kaynak: prototip örneği</p><div id="ygYakitDetail" class="yg-sarj-detail" role="region" aria-label="Seçilen yakıt istasyonu" hidden=""></div><ol id="ygYakitList" class="yg-sarj-list"></ol></div></section>';
  sarj.insertAdjacentHTML('beforebegin', `<section class="yg-katman" aria-label="Katmanlar"><div class="yg-katman-bas"><span class="yg-eyebrow">Katmanlar</span><span class="ornek-etiket">prototip örneği</span></div><div class="yg-katman-grup" role="group" aria-labelledby="ygKgArac"><span class="yg-katman-grup-ad" id="ygKgArac">Araç</span><div class="sekmeler esit yg-arac" role="group" aria-labelledby="ygKgArac"><button type="button" class="sekme aktif" data-arac="yakit" aria-pressed="true" aria-controls="ygYakit"><i class="fa-solid fa-gas-pump" aria-hidden="true"></i>Yakıtlı</button><button type="button" class="sekme" data-arac="elektrikli" aria-pressed="false" aria-controls="ygSarjKart"><i class="fa-solid fa-bolt" aria-hidden="true"></i>Elektrikli</button></div>${yakit}<span id="ygSarjYer"></span></div>${
    grup('ygKgIhtiyac', 'İhtiyaç · haritada göster', [['ibadet', 'fa-place-of-worship', 'İbadethane'], ['dinlenme', 'fa-bed', 'Dinlenme alanı'], ['karavan', 'fa-caravan', 'Karavan parkı']].map(([k, i, a]) => cip('data-katman', k, i, a, false)))}${
    grup('ygKgGastro', 'Gastro · haritada göster', [['gastronomi', 'fa-utensils', 'Gastronomi', true], ['neyenir', 'fa-bowl-food', 'Ne Yenir?', false], ['nealinir', 'fa-basket-shopping', 'Ne Alınır?', false]].map(([k, i, a, on]) => cip('data-katman', k, i, a, on)))}</section>`);
  // Canlı şarj kartı segmentin altına taşınır; aç/kapa düğmesi canlıdaki gibi görünür
  $('#ygSarjYer').replaceWith(sarj);
  // Çok duraklı aktarım (R3.6): adresler `rota-katman.js` ile duraklardan üretilir
  $('section.yg-katman').insertAdjacentHTML('beforebegin', '<section class="yg-aktar" id="ygAktar" aria-label="Navigasyona aktar" hidden><div class="yg-katman-bas"><span class="yg-eyebrow">Navigasyona Aktar</span><span class="yg-aktar-sayi" id="ygAktarSayi"></span></div><div class="yg-aktar-liste" id="ygAktarListe"></div><button type="button" class="yg-aktar-bag yg-telefon-dugme" id="ygTelefonGonder"><i class="fa-solid fa-mobile-screen" aria-hidden="true"></i><span><b id="ygTelefonAd"></b><small id="ygTelefonAlt"></small></span><span class="ornek-etiket">prototip örneği</span></button><p class="yg-aktar-not" id="ygAktarNot"></p></section>');
  // "Güzergâhtaki noktalar" listesi kalktı: ihtiyaçlar alt şeritteki İhtiyaçlar sekmesinde, şarj + yemek canlı şarj kartında (Beyar 10 Kas D8)
  // Yol üstü iller güzergâhın hemen altında, katmanlardan önce (Beyar, 9 Kas; canlı yerleşime tek istisna). Başlık kartları öne getirir
  $('#ygSummary').insertAdjacentHTML('afterend', '<section class="yg-iller" id="ygIller" aria-label="İl kartları" hidden><div class="yg-katman-bas"><button type="button" class="yg-iller-bas" id="ygIllerBas"><span class="yg-eyebrow">Yol üstü iller</span></button><span class="ornek-etiket">prototip örneği</span></div><div class="yg-il-liste" id="ygIlKart"></div></section>');
  // Telefona gönder penceresi: kabuk `parcalar/rota-telefon.html`, metin `rota-telefon-veri.js`
  $('#ygReport').insertAdjacentHTML('beforebegin', '<!-- @parca rota-telefon -->\n\n  ');
  return { ust: $('header.yg-top').outerHTML, app: $('.yg-app').outerHTML, govdeSinif: b.className }; });
const f = path.join(SRC, 'sayfalar/dada-route/index.html'); fs.mkdirSync(path.dirname(f), { recursive: true });
const O = 'assets/o/assets/gourmet-public';
fs.writeFileSync(f, `<!--${JSON.stringify({ yol: 'dada-route', baslik: 'Dada Route', duzen: 'tam', zincir: 'rota', donor: 'https://dadagourmet.com/dada-route', css: ['assets/g/kanon/tokenlar.css', 'assets/g/kanon/markalar/gourmet.css', `${O}/vendor/leaflet-unpkg-1.9.4/leaflet.css`, 'dada-route.css', 'dada-route-sarj.css', 'shared/scroll-affordance.css', 'shared/dada-autocomplete.css', 'gourmet-sapma'], js: [`${O}/vendor/leaflet-unpkg-1.9.4/leaflet.js`, `${O}/js/shared/dada-autocomplete.js`, `${O}/js/shared/scroll-affordance.js`, 'assets/js/mekan-veri.js', 'assets/js/mekan-liste-veri.js', 'assets/js/rota-veri.js', 'assets/js/rota-yerler.js', 'assets/js/rota-yol-agi.js', 'assets/js/sayfa/rota-sahte.js', `${O}/js/dada-route.js`, 'assets/js/sayfa/rota-katman.js', 'assets/js/rota-telefon-veri.js', 'assets/js/sayfa/rota-telefon.js'], govdeSinif: g.govdeSinif })}-->\n${g.ust}\n${g.app}\n`);
await kapat(); console.log('rota tamam');
