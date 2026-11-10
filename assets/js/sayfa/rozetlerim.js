/* Rozetlerim: Gastro rozet ekranının Gourmet uyarlaması. Rozet, kademe ve puan sayıları bu tarayıcıdaki demo kayıtlarından
   (dgKayit, dgPuan) okunur. Rozet ve rütbe kümesi Gurme Panelim › Puan Durumu'ndaki örnek setle aynı; kademe kesinleşen puandan.
   Aile süzgeci Gastro'da `?aile=` bağıdır, prototipte aynı çipler sayfa içinde süzer. */
(function () {
  'use strict';
  var K = window.dgKayit, P = window.dgPuan; if (!K || !P) { return; }
  var $ = function (s, k) { return (k || document).querySelector(s); }, $$ = function (s, k) { return [].slice.call((k || document).querySelectorAll(s)); };
  var kac = function (t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); };
  var yaz = function (s, v) { $$(s).forEach(function (e) { e.textContent = v; }); };
  var binlik = function (n) { return Number(n).toLocaleString('tr-TR'); };
  var say = function (tur, kosul) { return K.oku(tur).filter(kosul || function () { return true; }).length; };
  var yayinda = function (k) { return k.durum === 'yayinda'; };
  var O = {
    degerlendirme: say('degerlendirme', yayinda),
    foto: say('degerlendirme', function (k) { return yayinda(k) && k.foto; }),
    oneri: say('oneri', yayinda),
    oneriMekan: say('oneri', function (k) { return yayinda(k) && k.tur !== 'etkinlik'; }),
    oneriEtkinlik: say('oneri', function (k) { return yayinda(k) && k.tur === 'etkinlik'; }),
    rezervasyon: say('rezervasyon', function (k) { return k.durum === 'gerceklesti'; }),
    ziyaret: say('ziyaret'),
    randevu: say('randevu')
  };
  var OLCU = { 'ilk-tadim': O.degerlendirme, 'gurme-kalem': O.degerlendirme, 'tabak-avcisi': O.foto, 'kasif': O.oneriMekan, 'hasat-habercisi': O.oneriEtkinlik, 'masa-mudavimi': O.rezervasyon, 'etkinlik-dostu': O.randevu, 'yol-arkadasi': O.ziyaret };
  var kesin = P.toplam('kesin'), bekleyen = P.toplam('bekliyor');

  /* Rozet kartları: Gastro'nun kazanıldı / kilitli kipleri; kilitlide ilerleme çubuğu */
  var kazanildi = 0, aileSay = {};
  $$('.rozet-karti').forEach(function (b) {
    var esik = +b.dataset.esik, v = Math.min(OLCU[b.dataset.rozet] || 0, esik), ok = v >= esik, a = b.dataset.aile;
    aileSay[a] = aileSay[a] || [0, 0]; aileSay[a][1]++;
    if (ok) { kazanildi++; aileSay[a][0]++; }
    b.classList.toggle('kilitli', !ok);
    $('.rozet-puan', b).innerHTML = ok ? '<i class="fa-solid fa-circle-check" aria-hidden="true"></i> ' + esik + '/' + esik : '<i class="fa-solid fa-lock" aria-hidden="true"></i> ' + v + '/' + esik;
    $(':scope > div > span', b).textContent = ok ? 'Kazanıldı' : 'Yolda';
    var not = $('.rozet-not', b); not.className = 'rozet-not ' + (ok ? 'kazanildi' : 'kilitli');
    $('i', not).className = 'fa-solid ' + (ok ? 'fa-circle-check' : 'fa-hourglass-half');
    $('.rozet-cubuk span', not).style.width = Math.round(v / esik * 100) + '%';
    $('.rozet-sol', not).textContent = ok ? 'Kazanıldı' : v + ' / ' + esik;
    $('[data-nasil]', b).textContent = ok ? 'Kazanıldı' : v + ' / ' + esik + ' tamamlandı';
    $('.nasil i', b).className = 'fa-solid ' + (ok ? 'fa-circle-check' : 'fa-hourglass-half');
  });
  var toplam = $$('.rozet-karti').length;
  Object.keys(aileSay).forEach(function (a) { yaz('[data-aile-sayi="' + a + '"]', aileSay[a][0] + '/' + aileSay[a][1]); yaz('[data-aile-oran="' + a + '"]', aileSay[a][0] + ' / ' + aileSay[a][1]); });
  yaz('[data-rz="kazanildi"]', kazanildi); yaz('[data-rz="yolda"]', toplam - kazanildi);
  ['degerlendirme', 'foto', 'oneri', 'rezervasyon', 'ziyaret', 'randevu'].forEach(function (k) { yaz('[data-rz="' + k + '"]', O[k]); });
  yaz('[data-puan="kesin"]', binlik(kesin)); yaz('[data-puan="bekleyen"]', binlik(bekleyen));
  var rs = $('[data-rozet-sayi]'); if (rs) { rs.lastChild.nodeValue = ' Rozet ' + kazanildi; }

  /* Kademe: geçilen en yüksek eşik */
  var basamak = $$('.basamak'), sira = 0;
  basamak.forEach(function (b, i) { if (kesin >= +b.dataset.esik) { sira = i; } });
  basamak.forEach(function (b, i) {
    var esik = +b.dataset.esik, simdi = i === sira, gecti = i < sira;
    b.className = 'basamak' + (simdi ? ' simdiki' : gecti ? ' gecildi' : ' kilitli');
    $('.basamak-kilit', b).className = 'fa-solid ' + (simdi ? 'fa-location-dot' : gecti ? 'fa-circle-check' : 'fa-lock') + ' basamak-kilit';
    $('.basamak-sayi', b).textContent = simdi ? 'Şu anki kademen' : gecti ? 'Geçildi' : binlik(esik - kesin) + ' puan kaldı';
  });
  if (basamak.length) {
    var su = basamak[sira], ad = $('b', su).textContent, ikon = $('.basamak-ikon i', su).className, sonra = basamak[sira + 1];
    yaz('[data-puan="rutbe"]', ad); yaz('[data-rz="sira"]', sira + 1);
    $$('[data-rz-ikon]').forEach(function (i) { i.className = ikon; i.setAttribute('data-rz-ikon', ''); });
    var p = $('[data-rz="sonraki"]');
    if (p) { p.innerHTML = kac(ad) + ' kademesi <b>' + binlik(+su.dataset.esik) + ' puan</b> istiyor; geçtin. ' + (sonra ? 'Sıradaki kademe <b>' + kac($('b', sonra).textContent) + '</b>: ' + binlik(+sonra.dataset.esik) + ' puan, ' + binlik(+sonra.dataset.esik - kesin) + ' puan kaldı.' : 'Merdivenin en üstündesin.'); }
  }

  /* Puan defteri: kurala göre kesinleşen puan ve hareketler */
  var kural = function (k) { return /rezervasyon/i.test(k.ad) ? 'rezervasyon' : /öneri/i.test(k.ad) ? 'oneri' : 'degerlendirme'; };
  var defter = K.oku('puan'), kartlar = {};
  defter.forEach(function (k) { if ((k.durum || 'bekliyor') === 'kesin') { kartlar[kural(k)] = (kartlar[kural(k)] || 0) + k.tutar; } });
  $$('#rzPuanAile [data-kural]').forEach(function (c) {
    var v = kartlar[c.dataset.kural] || 0;
    $('.puan-sayi', c).textContent = binlik(v);
    $('.olcer span', c).style.width = (kesin ? Math.round(v / kesin * 100) : 0) + '%';
  });
  var D = { kesin: ['Kesinleşti', 'olumlu'], bekliyor: ['Onay bekliyor', 'bekleme'], dustu: ['Düştü', 'durdu'] };
  var KURAL_AD = { degerlendirme: 'Değerlendirme', oneri: 'Öneri', rezervasyon: 'Rezervasyon' };
  var dk = $('#rzDefter');
  if (dk && defter.length) {
    dk.innerHTML = '<div class="tablo-kap cerceveli" role="region" aria-label="Puan defteri" tabindex="0"><table class="tablo"><caption class="sr-only">Dada Puan hareketlerin, kuralları ve durumları</caption><thead><tr><th scope="col">Katkı</th><th scope="col">Kural</th><th scope="col">Durum</th><th scope="col">Puan</th></tr></thead><tbody>' +
      defter.map(function (k) { var d = D[k.durum || 'bekliyor'] || D.bekliyor; return '<tr><th scope="row">' + (k.ornek ? '<span class="ornek-etiket">prototip örneği</span> ' : '') + kac(k.ad) + '</th><td>' + KURAL_AD[kural(k)] + '</td><td><span class="rozet ' + d[1] + '">' + d[0] + '</span></td><td>+' + k.tutar + '</td></tr>'; }).join('') + '</tbody></table></div>';
  }

  /* Aile süzgeci (Gastro `?aile=`): çip seçilince galeri o aileye iner */
  var cipler = $$('#rzCips [data-aile]'), sil = $('#rzFiltreSil');
  var suz = function (aile) {
    cipler.forEach(function (c) { var on = c.dataset.aile === aile; c.classList.toggle('on', on); c.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    var gor = $$('#rzGaleri .rozet-ailesi').filter(function (a) { var v = !aile || a.dataset.aile === aile; a.hidden = !v; return v; });
    var ks = 0, ts = 0; gor.forEach(function (a) { ts += $$('.rozet-karti', a).length; ks += $$('.rozet-karti:not(.kilitli)', a).length; });
    var c = cipler.filter(function (x) { return x.dataset.aile === aile; })[0];
    $('#rzFiltreAd').textContent = aile && c ? c.dataset.ad : 'Tümü';
    $('#rzFiltreMeta').textContent = gor.length + ' aile · ' + ts + ' rozet · ' + ks + ' kazanıldı';
    if (sil) { sil.hidden = !aile; }
  };
  cipler.forEach(function (c) { c.addEventListener('click', function () { suz(c.dataset.aile); }); });
  if (sil) { sil.addEventListener('click', function () { suz(''); }); }
  suz('');

  /* İpucu: dokunmatikte kart dokunuşla açılır (Gastro `.ipucu-acik`) */
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.rozet-karti');
    $$('.rozet-karti.ipucu-acik').forEach(function (x) { if (x !== b) { x.classList.remove('ipucu-acik'); } });
    if (b) { b.classList.toggle('ipucu-acik'); }
  });
})();
