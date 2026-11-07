// Dada Route web: canlı sayfa yapısı korunur (DOM aynı). Leaflet yerine MapLibre (K7), veri statik. Panel solda kalır (§8 #11 açık).
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { ac, kapat } from './dom.mjs';
const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'); const D = process.argv[2];
const p = await ac(path.join(D, 'o-route.html'));
const g = await p.evaluate(() => { kok(document.body); const b = document.body; const $ = (s) => b.querySelector(s);
  $('#routeMap').className = 'rota-harita'; $('#routeMap').innerHTML = ''; $('#routeMap').removeAttribute('style'); $('#routeMap').removeAttribute('tabindex');
  // "Demo sürümü" notu görünür "prototip örneği" etiketine döner
  $('#ygDemo .yg-demo-h').innerHTML = '<span class="ornek-etiket">prototip örneği</span>'; $('#ygDemoNote').textContent = 'Rota çizgisi, duraklar ve katman noktaları statik örnek veridir. Mekân konumları canlı kayıtlardan kopyadır.';
  // Katman paneli: Route dokümanı R1, R3.3. Şarj bloğunun kalıbı, panelin içinde solda
  const kat = [['gastronomi', 'fa-utensils', 'Gastronomi durakları', true], ['sarj', 'fa-charging-station', 'Enerji ve şarj', true], ['ibadet', 'fa-mosque', 'İbadethane', false], ['dinlenme', 'fa-bed', 'Dinlenme alanı', false], ['neyenir', 'fa-bowl-food', 'Ne Yenir?', false], ['nealinir', 'fa-basket-shopping', 'Ne Alınır?', false]];
  $('section.yg-sarj').insertAdjacentHTML('beforebegin', `<section class="yg-katman" aria-label="Katmanlar"><div class="yg-quick-h">Katmanlar <span class="ornek-etiket">prototip örneği</span></div><div class="yg-katman-liste">${kat.map(([k, i, a, on]) => `<button type="button" class="yg-katman-dugme" data-katman="${k}" aria-pressed="${on}"><i class="fa-solid ${i}" aria-hidden="true"></i><span>${a}</span></button>`).join('')}</div><div id="ygIlKart" class="yg-il-liste"></div><div id="ygAktarim" class="yg-aktarim" hidden><div class="yg-quick-h">Haritada aç</div><div class="yg-aktarim-sira"><a id="ygGoogle" target="_blank" rel="noopener">Google Maps</a><a id="ygApple" target="_blank" rel="noopener">Apple Maps</a><a id="ygYandex" target="_blank" rel="noopener">Yandex</a></div></div></section>`);
  return { ust: $('header.yg-top').outerHTML, app: $('.yg-app').outerHTML }; });
const f = path.join(SRC, 'sayfalar/dada-route/index.html'); fs.mkdirSync(path.dirname(f), { recursive: true });
fs.writeFileSync(f, `<!--${JSON.stringify({ yol: 'dada-route', baslik: 'Dada Route', duzen: 'tam', zincir: 'rota', donor: 'https://dadagourmet.com/dada-route', css: ['dada-route.css', 'dada-route-sarj.css', 'shared/scroll-affordance.css', 'shared/dada-autocomplete.css', 'assets/vendor/maplibre/maplibre-gl.css', 'gourmet-sapma'], js: ['assets/vendor/maplibre/maplibre-gl.js', 'assets/js/mekan-veri.js', 'assets/js/rota-veri.js', 'assets/js/harita.js', 'assets/js/sayfa/rota.js'] })}-->\n${g.ust}\n${g.app}\n`);
await kapat(); console.log('rota tamam');
