/* Ana sayfa: kaydırma rayı (donör `kesfet.js` davranışı yerine dar kopya) */
(function () { 'use strict'; document.querySelectorAll('[data-scroll-to]').forEach(function (b) { b.addEventListener('click', function () { var h = document.querySelector(b.getAttribute('data-scroll-to')); if (h) { h.scrollIntoView({ behavior: 'smooth' }); } }); }); })();

/* Ray okları: donör `kesfet.js` `wireTrackNav`, adımlar aynı (modül 460, etkinlik 400, Gurme Lezzetler 380) */
(function () {
  'use strict';
  [['gmModTrack', 'modPrev', 'modNext', 460], ['evTrack', 'evPrev', 'evNext', 400], ['glTrack', 'glPrev', 'glNext', 380]].forEach(function (r) {
    var ray = document.getElementById(r[0]); if (!ray) { return; }
    [[r[1], -1], [r[2], 1]].forEach(function (d) { var b = document.getElementById(d[0]); if (b) { b.addEventListener('click', function () { ray.scrollBy({ left: d[1] * r[3], behavior: 'smooth' }); }); } });
  });
})();

/* Konuma ve ülkeye göre Yaklaşan Etkinlikler (şartname akış 1, W1.3a, W3.1a-b; Beyar 10 Kas E2). İlk ziyarette "Neredesin?" bir kez açılır; canlıda yalnız düğmeyle açılıyor.
   Ülke `ulke.js`ten (Etkinlikler sayfasının ilk sekmesiyle aynı). Türkiye'de sayfadaki kartlar kalır; başka ülkede o ülkenin bitmemiş etkinlikleri tarih sırasıyla önde, eksik kalan yer yakın tarihli öbür etkinliklerle dolar.
   Konum alınınca kullanıcının ülkesindeki bitmemiş etkinlikler uzaklığa göre dizilir. Kart DOM'u sayfadaki ilk karttan. Konum yalnız bu tarayıcıda kalır. */
(function () {
  'use strict';
  var V = window.DG_ETKINLIK, ray = document.getElementById('evTrack'); if (!V || !ray) { return; }
  var kok = document.documentElement.dataset.kok || './', kalip = ray.querySelector('.ev-card'); if (!kalip) { return; }
  var U = window.dgUlke || { kod: 'TR', ad: 'Türkiye', yerel: function (e) { return !!e.tr; }, bag: function (u) { return u; } };
  var oku = function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } };
  var yaz = function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* depo kapalı */ } };
  var km = function (a, b, c, d) { var r = Math.PI / 180, x = Math.sin((c - a) * r / 2), y = Math.sin((d - b) * r / 2); return 12742 * Math.asin(Math.sqrt(x * x + Math.cos(a * r) * Math.cos(c * r) * y * y)); };
  var bugun = new Date().toISOString().slice(0, 10);
  var tarih = function (a, b) { return a.bas < b.bas ? -1 : a.bas > b.bas ? 1 : 0; };
  var tum = document.querySelector('.gm-events .see-all'); if (tum) { tum.setAttribute('href', U.bag(tum.getAttribute('href'))); }
  function bas(l, metin) {
    ray.innerHTML = l.map(function (e) {
      var k = kalip.cloneNode(true), bag = kok + 'etkinlik-detay/?e=' + e.slug;
      [].forEach.call(k.querySelectorAll('a[href*="etkinlik"]'), function (a) { a.setAttribute('href', bag); });
      /* Görsel, tür rozeti ve fiyat notu etkinliğin kendi canlı kartından (`V.kartlar`) */
      var tk = document.createElement('template'); tk.innerHTML = (V.kartlar[e.slug] || '').split('{{kok}}').join(kok);
      var kf = tk.content.querySelector('.disc-fig'), f = k.querySelector('.disc-fig');
      if (kf && f) { f.innerHTML = kf.innerHTML; } else {
        var bg = k.querySelector('.disc-fig .bg'); if (bg) { bg.style.backgroundImage = "url('" + String(e.gorsel || '').split('{{kok}}').join(kok) + "')"; }
        var rz = k.querySelector('.disc-badge'); if (rz) { rz.lastChild.nodeValue = ' ' + e.tur; rz.title = e.tur; }
      }
      k.querySelector('.disc-cat').textContent = e.tur; k.querySelector('h3').textContent = e.ad; k.querySelector('p').textContent = e.ozet;
      var dw = k.querySelectorAll('.dw-txt'); if (dw[0]) { dw[0].textContent = e.zaman; } if (dw[1]) { dw[1].textContent = e.yer; }
      k.dataset.type = String(e.tur || '').toLocaleLowerCase('tr'); k.removeAttribute('data-etkinlik-id');
      return k.outerHTML;
    }).join('');
    ray.scrollLeft = 0;
    var not = document.getElementById('evKonumNot');
    if (!not) { not = document.createElement('p'); not.id = 'evKonumNot'; not.className = 'mkl-harita-not'; ray.parentNode.insertBefore(not, ray); }
    not.textContent = metin;
  }
  function diz(konum) {
    var gelecek = V.etkinlikler.filter(function (e) { return (e.bit || e.bas) >= bugun; }), yerel = gelecek.filter(U.yerel);
    if (konum) {
      var l = yerel.filter(function (e) { return e.konum; })
        .map(function (e) { return { e: e, d: km(konum.lat, konum.lng, e.konum.lat, e.konum.lng) }; })
        .sort(function (a, b) { return Math.floor(a.d / 25) - Math.floor(b.d / 25) || tarih(a.e, b.e); }).slice(0, 4); /* aynı 25 km diliminde tarih sırası */
      if (l.length) {
        var en = l.reduce(function (a, b) { return b.d < a.d ? b : a; });
        bas(l.map(function (x) { return x.e; }), 'Konumuna göre sıralandı: en yakın etkinlik ' + Math.round(en.d) + ' km uzakta, ' + en.e.yer + '.');
        return;
      }
    }
    if (U.kod === 'TR') { return; }
    var dis = gelecek.filter(function (e) { return !U.yerel(e); }).sort(tarih);
    bas(yerel.sort(tarih).concat(dis).slice(0, 4), yerel.length ? 'Ülkene göre sıralandı: ' + U.ad + ' etkinlikleri önde.' : U.ad + ' için yaklaşan etkinlik yok; yakın tarihli uluslararası etkinlikler gösteriliyor.');
  }
  var kayitli = null; try { kayitli = JSON.parse(oku('dg-konum')); } catch (e) { /* bozuk kayıt */ }
  diz(kayitli && kayitli.lat != null ? kayitli : null);
  document.addEventListener('dg-konum', function (e) { diz(e.detail); });
  if (!oku('dg-konum-soruldu') && window.dgKonumAc) { yaz('dg-konum-soruldu', '1'); setTimeout(function () { window.dgKonumAc(true); }, 900); }
})();
