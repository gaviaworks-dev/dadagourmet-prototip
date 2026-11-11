/* Ana sayfa reklam çizicileri. Yalnız reklam önizlemesi açıkken yüklenir (sayfa satırı `betik: anasayfa`). */

/* reklam-detay: AS-T1, AS-M1, AS-B1 zengin şerit çizicileri (sayfa/ana.js) */
(function () { var s = document.createElement('script'); s.src = (document.documentElement.dataset.kok || './') + 'assets/js/reklam/sayfa/ana.js'; document.body.appendChild(s); })();

/* reklam-rota (11 Kas): AS-INT · "Togg ile İstanbul–İzmir lezzet rotası". Biçim interaktif (kanon kapatılabilir `.rk-pisirme` şeridi +
   açılır pano, davranış `interaktif.js`); panoda araç seçimi, gerçek rota geometrisinden şematik çizgi (OSRM, `rota-osrm-gomulu.js`),
   menzile göre şarj molaları (OSM şarj noktaları) ve molaya yakın Dada mekânları (EV motoru `ev-sarj.js`, Dada Route ile aynı).
   "Route'ta aç": `dada-route/?ev-rota=istanbul-izmir&arac=<araç>`; okuyucu `sayfa/rota.js` (pilot rota kurulur, Elektrikli ve araç seçilir).
   Gerçek hayattaki karşılığı: IAB Expandable rich media (otomotiv markası) + Google Maps EV şarj planlayıcısı. Sayım yok. */
(function () {
  'use strict';
  var R = window.dgReklam, Bk = window.dgReklamBilesen, V = window.DG_REKLAM_VERI;
  if (!R || !Bk || !V) { return; }
  var KOK = document.documentElement.dataset.kok || './', kac = Bk.kac;
  var js = function (h, a) { return new Promise(function (t) { if (a && window[a]) { t(); return; } var s = document.createElement('script'); s.src = KOK + h; s.onload = s.onerror = function () { t(); }; document.body.appendChild(s); }); };
  if (!document.querySelector('link[href*="reklam/ek/rota.css"]')) { var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = KOK + 'assets/css/reklam/ek/rota.css'; l.setAttribute('data-rk-stil', ''); document.head.appendChild(l); }
  var hazir = Promise.all([js('assets/js/reklam/ev-sarj-veri.js', 'DG_EV_SARJ'), js('assets/js/reklam/ev-sarj.js', 'dgEvSarj'), js('assets/js/rota-osrm-gomulu.js', 'DG_ROTA_GOMULU'), js('assets/js/mekan-veri.js', 'DG_MEKANLAR')]);
  /* Dada Route varsayılan sapma toleransı (BOOT `varsayilanTolerans` dk10 → 10 × 55 / 120 km): Route'ta açılan plan aynı olsun */
  var YARICAP = 10 * 55 / 120;
  var coz = function (s) { var i = 0, la = 0, ln = 0, o = []; while (i < s.length) { for (var k = 0; k < 2; k++) { var r = 0, sh = 0, b; do { b = s.charCodeAt(i++) - 63; r |= (b & 31) << sh; sh += 5; } while (b >= 32); var d = r & 1 ? ~(r >> 1) : r >> 1; if (k) { ln += d; } else { la += d; } } o.push([la / 1e5, ln / 1e5]); } return o; };
  var tr = function (s) { return s.toLocaleLowerCase('tr').replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/[^a-z]+/g, '-').replace(/^-|-$/g, ''); };
  var sureYaz = function (dk) { var s = Math.floor(dk / 60), d = Math.round(dk % 60); return (s ? s + ' sa ' : '') + d + ' dk'; };

  function sema(geo, plan, ad) {
    var W = 360, Hh = 240, P = 26, la0 = 0; geo.forEach(function (c) { la0 += c[0]; }); la0 /= geo.length;
    var kx = Math.cos(la0 * Math.PI / 180), xs = geo.map(function (c) { return c[1] * kx; }), ys = geo.map(function (c) { return c[0]; });
    var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
    var o = Math.min((W - 2 * P) / (x1 - x0 || 1), (Hh - 2 * P) / (y1 - y0 || 1)), dx = (W - (x1 - x0) * o) / 2, dy = (Hh - (y1 - y0) * o) / 2;
    var nok = function (la, ln) { return [Math.round((ln * kx - x0) * o + dx), Math.round((y1 - la) * o + dy)]; };
    var yol = geo.filter(function (c, i) { return i % 3 === 0 || i === geo.length - 1; }).map(function (c) { return nok(c[0], c[1]).join(','); }).join(' ');
    var a = nok(geo[0][0], geo[0][1]), b = nok(geo[geo.length - 1][0], geo[geo.length - 1][1]), uc = ad.split(' – ');
    var sarj = plan ? plan.duraklar.map(function (x) { var q = nok(x.lat, x.lng); return '<circle class="rk-asi-sarj" cx="' + q[0] + '" cy="' + q[1] + '" r="10"/><text class="rk-asi-no" x="' + q[0] + '" y="' + (q[1] + 4) + '" text-anchor="middle">' + x.no + '</text>'; }).join('') : '';
    return '<svg viewBox="0 0 ' + W + ' ' + Hh + '" role="img" aria-label="' + kac(ad + ' rotası' + (plan && plan.duraklar.length ? ', ' + plan.duraklar.length + ' şarj molası' : '')) + '">' +
      '<polyline class="rk-asi-cizgi-alt" points="' + yol + '"/><polyline class="rk-asi-cizgi" points="' + yol + '"/>' + sarj +
      '<circle class="rk-asi-uc" cx="' + a[0] + '" cy="' + a[1] + '" r="7"/><circle class="rk-asi-uc" cx="' + b[0] + '" cy="' + b[1] + '" r="7"/>' +
      '<text class="rk-asi-etiket" x="' + (a[0] + 12) + '" y="' + (a[1] + 4) + '">' + kac(uc[0] || '') + '</text><text class="rk-asi-etiket" x="' + (b[0] + 12) + '" y="' + (b[1] + 4) + '">' + kac(uc[1] || '') + '</text></svg>';
  }

  function doldur(kap, k, aracId) {
    var E = window.dgEvSarj, G = (window.DG_ROTA_GOMULU || []).filter(function (r) { return r.ad === k.rota; })[0];
    if (!E || !G) { kap.innerHTML = '<p class="rk-ev-not">Rota önizlemesi yüklenemedi.</p>'; return; }
    var geo = coz(G.p), H = E.hat(geo), arac = E.aracBul(aracId), p = E.planla({ hat: H, arac: arac, yaricap: YARICAP });
    var M = window.DG_MEKANLAR || [], yolUstu = M.filter(function (m) { return H.olc(m.lat, m.lng, YARICAP + 1).d <= YARICAP; }).length;
    var uc = k.rota.split(' – ');
    var cip = (k.araclar || []).map(function (id) { var a = E.aracBul(id); if (!a) { return ''; } var on = id === aracId; return '<button type="button" role="radio" class="rk-ev-arac" data-rk-asi-arac="' + id + '" aria-checked="' + on + '" tabindex="' + (on ? 0 : -1) + '"><b>' + kac(a.ad) + '</b><small>' + kac(a.surum) + ' · WLTP ' + a.wltp + ' km</small></button>'; }).join('');
    var satir = function (ik, b, alt, sinif) { return '<li' + (sinif ? ' class="' + sinif + '"' : '') + '><i class="fa-solid ' + ik + '" aria-hidden="true"></i><span><b>' + kac(b) + '</b>' + (alt ? '<small>' + kac(alt) + '</small>' : '') + '</span></li>'; };
    var liste = satir('fa-flag', 'Kalkış · ' + uc[0]) + p.duraklar.map(function (x) {
      var y = x.mekan[0], yemek = y ? (y.yuru ? 'Şarj olurken: ' + y.m.name + ' · yürüyerek ' + y.yuruDk + ' dk' : 'Bu durağın yakınında Dada Gourmet mekânı henüz yok') : 'Bu durağın yakınında Dada Gourmet mekânı henüz yok';
      return satir('fa-bolt', x.no + '. şarj molası · ' + x.ad, Math.round(x.s) + '. km · ~' + String(x.sarjDk || '').replace('.', ',') + ' dk · ' + yemek, 'is-sarj');
    }).join('') + satir('fa-flag-checkered', 'Varış · ' + uc[1], 'Yol üstünde ' + yolUstu + ' Dada mekânı (10 dk sapma)');
    var bag = KOK + 'dada-route/?ev-rota=' + tr(k.rota) + '&arac=' + aracId;
    kap.innerHTML = '<figure class="rk-asi-harita">' + sema(geo, p, k.rota) + '<figcaption>Rota: OSRM · © OpenStreetMap katkıcıları</figcaption></figure>' +
      '<div class="rk-asi-sag"><div class="rk-ev-araclar" role="radiogroup" aria-label="Aracın">' + cip + '</div>' +
      '<p class="rk-asi-ozet" aria-live="polite">' + kac(Math.round(G.km) + ' km · ' + sureYaz(G.dk) + ' sürüş · ' + (p.yeter ? 'şarj molası gerekmez' : p.duraklar.length + ' şarj molası') + (p.sorun ? ' · ' + p.sorun : '')) + '</p>' +
      '<ol class="rk-asi-liste">' + liste + '</ol>' +
      '<a class="rk-asi-ac" href="' + kac(bag) + '" data-rk-bag><i class="fa-solid fa-route" aria-hidden="true"></i> ' + kac(k.cta || 'Route\'ta aç') + '</a>' +
      '<p class="rk-asi-kaynak">Menzil: ' + kac(arac.kaynak) + ' (WLTP). Otoyol menzili WLTP\'nin %80\'i, %90 doluyla çıkış, %10 → %80 şarj (tahmin). Şarj noktaları: OpenStreetMap katkıcıları (ODbL).</p></div>';
    var a = kap.closest('[data-rk-interaktif]').querySelector('.rk-asi-serit > a'); if (a) { a.href = bag; }
  }

  R.ciz('AS-INT', function (k, o) {
    var m = Bk.marka(k), id = 'rk-panel-' + kac(o.kod), ilk = (k.araclar || [])[0];
    var kok = document.createElement('div');
    kok.setAttribute('data-rk-interaktif', '');
    kok.innerHTML = '<aside class="rk-slot rk-pisirme rk-asi-serit ' + m.renkSinif + '" data-rk-slot="' + kac(o.kod) + '" data-rk-kod="' + kac(o.kod) + '" data-rk-marka="' + kac(k.marka) + '" data-rk-kapatilabilir aria-label="Sponsorlu içerik · ' + kac(m.ad) + '">' +
      '<span class="rk-pisirme-logo">' + Bk.logo(k) + '</span><span class="rk-pisirme-metin"><span class="rk-etiket">Sponsorlu</span><b><button type="button" data-rk-ac aria-expanded="false" aria-controls="' + id + '">' + kac(k.baslik) + ' <i class="fa-solid fa-chevron-down" aria-hidden="true"></i></button></b></span>' +
      '<a href="' + KOK + kac(k.hedef || 'dada-route/') + '" rel="sponsored" data-rk-bag>' + kac(k.cta || 'Keşfet') + ' →</a><button type="button" aria-label="Reklamı kapat" data-rk-kapat>×</button></aside>' +
      '<div class="rk-asi-panel ' + m.renkSinif + '" id="' + id + '" data-rk-panel hidden><p class="rk-ev-not">Rota önizlemesi hazırlanıyor…</p></div>';
    var panel = kok.querySelector('[data-rk-panel]'), sec = ilk;
    hazir.then(function () { doldur(panel, k, sec); });
    panel.addEventListener('click', function (e) { var b = e.target.closest('[data-rk-asi-arac]'); if (!b) { return; } sec = b.dataset.rkAsiArac; doldur(panel, k, sec); var y = panel.querySelector('[data-rk-asi-arac="' + sec + '"]'); if (y) { y.focus({ preventScroll: true }); } });
    panel.addEventListener('keydown', function (e) {
      var b = e.target.closest('[data-rk-asi-arac]'); if (!b) { return; }
      var l = [].slice.call(panel.querySelectorAll('[data-rk-asi-arac]')), n = l.indexOf(b), y = { ArrowRight: n + 1, ArrowDown: n + 1, ArrowLeft: n - 1, ArrowUp: n - 1, Home: 0, End: l.length - 1 }[e.key];
      if (y === undefined) { return; } e.preventDefault(); l[(y + l.length) % l.length].click();
    });
    return kok;
  });
  /* Çiziciler çekirdeğin yerleştirmesinden önce kaydedilir; AS-INT zaten basıldıysa (geç yükleme) yeniden yerleştir */
  if (R.durum && R.durum().basilan && R.durum().basilan.indexOf('AS-INT') >= 0 && !document.querySelector('.rk-asi-serit')) { R.yenile(); }
})();
