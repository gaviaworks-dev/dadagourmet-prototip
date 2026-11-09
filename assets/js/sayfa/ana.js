/* Ana sayfa: kaydırma rayı (donör `kesfet.js` davranışı yerine dar kopya) */
(function () { 'use strict'; document.querySelectorAll('[data-scroll-to]').forEach(function (b) { b.addEventListener('click', function () { var h = document.querySelector(b.getAttribute('data-scroll-to')); if (h) { h.scrollIntoView({ behavior: 'smooth' }); } }); }); })();

/* Konuma göre vitrin (şartname akış 1, W3.1a-b). İlk ziyarette "Neredesin?" bir kez açılır; canlıda yalnız düğmeyle açılıyor.
   Konum alınınca Yaklaşan Etkinlikler en yakın, bitmemiş Türkiye etkinlikleriyle yeniden dizilir. Kart DOM'u sayfadaki ilk karttan. Konum yalnız bu tarayıcıda kalır. */
(function () {
  'use strict';
  var V = window.DG_ETKINLIK, ray = document.getElementById('evTrack'); if (!V || !ray) { return; }
  var kok = document.documentElement.dataset.kok || './', kalip = ray.querySelector('.ev-card'); if (!kalip) { return; }
  var oku = function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } };
  var yaz = function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* depo kapalı */ } };
  var km = function (a, b, c, d) { var r = Math.PI / 180, x = Math.sin((c - a) * r / 2), y = Math.sin((d - b) * r / 2); return 12742 * Math.asin(Math.sqrt(x * x + Math.cos(a * r) * Math.cos(c * r) * y * y)); };
  var bugun = new Date().toISOString().slice(0, 10);
  function diz(konum) {
    var l = V.etkinlikler.filter(function (e) { return e.ulke === 'Türkiye' && e.konum && (e.bit || e.bas) >= bugun; })
      .map(function (e) { return { e: e, d: km(konum.lat, konum.lng, e.konum.lat, e.konum.lng) }; })
      .sort(function (a, b) { return Math.floor(a.d / 25) - Math.floor(b.d / 25) || (a.e.bas < b.e.bas ? -1 : 1); }).slice(0, 4); /* aynı 25 km diliminde tarih sırası */
    if (!l.length) { return; }
    ray.innerHTML = l.map(function (x) {
      var e = x.e, k = kalip.cloneNode(true), bag = kok + 'etkinlik-detay/?e=' + e.slug;
      [].forEach.call(k.querySelectorAll('a[href*="etkinlik-detay"]'), function (a) { a.setAttribute('href', bag); });
      var bg = k.querySelector('.disc-fig .bg'); if (bg) { bg.style.backgroundImage = "url('" + String(e.gorsel || '').split('{{kok}}').join(kok) + "')"; }
      var rz = k.querySelector('.disc-badge'); if (rz) { rz.lastChild.nodeValue = ' ' + e.tur; rz.title = e.tur; }
      k.querySelector('.disc-cat').textContent = e.tur; k.querySelector('h3').textContent = e.ad; k.querySelector('p').textContent = e.ozet;
      var dw = k.querySelectorAll('.dw-txt'); if (dw[0]) { dw[0].textContent = e.zaman; } if (dw[1]) { dw[1].textContent = e.yer; }
      k.dataset.type = String(e.tur || '').toLocaleLowerCase('tr'); k.removeAttribute('data-etkinlik-id');
      return k.outerHTML;
    }).join('');
    var not = document.getElementById('evKonumNot');
    if (!not) { not = document.createElement('p'); not.id = 'evKonumNot'; not.className = 'mkl-harita-not'; ray.parentNode.insertBefore(not, ray); }
    not.textContent = 'Konumuna göre sıralandı: en yakın etkinlik ' + Math.round(l[0].d) + ' km uzakta, ' + l[0].e.yer + '.';
  }
  var kayitli = oku('dg-konum'); if (kayitli) { try { diz(JSON.parse(kayitli)); } catch (e) { /* bozuk kayıt */ } }
  document.addEventListener('dg-konum', function (e) { diz(e.detail); });
  if (!oku('dg-konum-soruldu') && window.dgKonumAc) { yaz('dg-konum-soruldu', '1'); setTimeout(function () { window.dgKonumAc(true); }, 900); }
})();
