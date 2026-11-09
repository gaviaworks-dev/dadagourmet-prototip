/* Mekân Bul: 3 adım. Veri `mekan-liste-veri.js`, canlı 203 mekânın kopyası.
   Oran: yalnız cevaplanan kriterler paydaya girer, ağırlıklar canlı `MekanBulEslestirmeServisi` ile aynı (amaç 40, bütçe 20, nitelik 15).
   Konum eşleşme değil süzgeçtir: seçilen yerin dışındaki mekân listeye girmez. Hiçbir kriterde verisi olmayan seçim boş sonuç ve öneri verir. */
(function () {
  'use strict';
  var V = window.DG_LISTE, R = window.DG_ROTA; if (!V) { return; }
  var kok = document.documentElement.dataset.kok || './';
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var kac = function (t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); };
  var has = function (m, g, d) { return (m.f[g] || []).indexOf(d) >= 0; };
  /* Haritadan Seç tarifi: yazının içindeki il ve ilçe adları; ör. "İstanbul Havalimanı çevresi" İstanbul'u eşler */
  var tarif = '', tarifOnbellek = null;
  var tarifYer = function () {
    if (tarifOnbellek && tarifOnbellek.t === tarif) { return tarifOnbellek.l; }
    var t = tarif.toLocaleLowerCase('tr'), l = [];
    V.secenek.ilce.forEach(function (o) { if (t.indexOf(o.ad.toLocaleLowerCase('tr')) >= 0) { l.push(['ilce', o.deger]); } });
    if (!l.length) { V.secenek.il.forEach(function (o) { if (t.indexOf(o.ad.toLocaleLowerCase('tr')) >= 0) { l.push(['il', o.deger]); } }); }
    tarifOnbellek = { t: tarif, l: l }; return l;
  };
  document.addEventListener('input', function (e) { if (e.target.id === 'mbHaritaTxt') { tarif = e.target.value.trim(); } });
  var km = function (a, b, c, d) { var r = Math.PI / 180, x = (d - b) * r * Math.cos((a + c) * r / 2), y = (c - a) * r; return Math.sqrt(x * x + y * y) * 6371; };
  /* İstanbul–İzmir örnek güzergâhına en yakın uzaklık */
  var hatUzak = function (m) {
    var en = 1e9, c = R ? R.cizgi : [];
    for (var i = 0; i < c.length - 1; i++) { for (var t = 0; t <= 8; t++) { var u = t / 8, d = km(m.lat, m.lng, c[i][1] + (c[i + 1][1] - c[i][1]) * u, c[i][0] + (c[i + 1][0] - c[i][0]) * u); if (d < en) { en = d; } } }
    return en;
  };
  var YOL_KM = 10;
  var AMAC = {
    esnaf: { ad: 'Hızlı esnaf', uy: function (m) { return has(m, 'kategori', 'esnaf-lokantasi') || has(m, 'kategori', 'lokanta'); }, yok: 'Esnaf lokantası kaydı henüz yok.', oneri: [['Yerel Lezzet Noktası', 'mekanlar/?konsept=yoresel-lezzet-noktasi', function (m) { return has(m, 'konsept', 'yoresel-lezzet-noktasi'); }], ['Geleneksel mekânlar', 'mekanlar/?konsept=geleneksel', function (m) { return has(m, 'konsept', 'geleneksel'); }]] },
    sef: { ad: 'Şef masası', uy: function (m) { return has(m, 'konsept', 'sef-restorani'); } },
    kahvalti: { ad: 'Pazar kahvaltısı', uy: function (m) { return has(m, 'vesile', 'kahvalti'); } },
    yolustu: { ad: 'Yol üstü', uy: function (m) { return hatUzak(m) <= YOL_KM; }, neden: function (m) { return 'İstanbul–İzmir örnek güzergâhına ' + Math.max(1, Math.round(hatUzak(m))) + ' km'; } }
  };
  var NITELIK = {
    glutensiz: { ad: 'Glütensiz', uy: function (m) { return has(m, 'beslenme', 'glutensiz'); } },
    otopark: { ad: 'Otopark', uy: function (m) { return has(m, 'ulasim', 'otopark') || has(m, 'ulasim', 'vale'); } },
    teras: { ad: 'Teras', uy: function (m) { return has(m, 'hizmet', 'teras'); } },
    evcil: { ad: 'Evcil hayvan', uy: function (m) { return has(m, 'hizmet', 'evcil-hayvan-dostu'); } },
    cocuk: { ad: 'Çocuk alanı', uy: function (m) { return has(m, 'hizmet', 'cocuk-alani'); }, yok: 'Çocuk alanı kaydı henüz yok.', oneri: [['Bebek sandalyesi olan mekânlar', 'mekanlar/?hizmet=bebek-sandalyesi', function (m) { return has(m, 'hizmet', 'bebek-sandalyesi'); }]] }
  };
  var BUTCE = { 1: '₺', 2: '₺₺', 3: '₺₺₺', 4: '₺₺₺₺' };
  var AGIRLIK = { amac: 40, butce: 20, nitelik: 15 };
  var durum = { amac: '', yontem: 'hepsi', il: '', ilce: '', lat: null, lng: null, mesafe: 25, butce: '', nitelik: [] };
  var adim = 1;

  /* Seçenek sayıları: her kutuda kayıtlı mekân sayısı görünür, 0 gizlenmez: boş seçim öneri verir */
  var yaz = function (i, n) { var l = i.closest('.pick'), s = $('.pk-txt small', l); if (!s) { s = document.createElement('small'); $('.pk-txt', l).appendChild(s); } s.textContent = n ? n + ' mekân' : 'Kayıt yok'; };
  $$('input[name="amac"]').forEach(function (i) { yaz(i, V.mekanlar.filter(AMAC[i.value].uy).length); });
  $$('input[name="nitelik"]').forEach(function (i) { yaz(i, V.mekanlar.filter(NITELIK[i.value].uy).length); });
  $$('input[name="butce"]').forEach(function (i) { if (!i.value) { return; } var n = V.mekanlar.filter(function (m) { return has(m, 'fiyat', i.value); }).length; var s = $('.pk-txt small', i.closest('.pick')); s.textContent = s.textContent + ' · ' + (n ? n + ' mekân' : 'kayıt yok'); });
  var ilSec = $('#mbSehir'), ilceSec = $('#mbIlce');
  V.secenek.il.forEach(function (o) { ilSec.insertAdjacentHTML('beforeend', '<option value="' + o.deger + '">' + kac(o.ad) + ' (' + o.sayi + ')</option>'); });
  var ilceDoldur = function () {
    ilceSec.innerHTML = '<option value="">Tüm ilçeler</option>';
    V.secenek.ilce.forEach(function (o) { if (o.il === durum.il) { ilceSec.insertAdjacentHTML('beforeend', '<option value="' + o.deger + '">' + kac(o.ad) + '</option>'); } });
    $('#mbIlceField').hidden = !durum.il;
  };

  /* Kutu görünümü ve alt alanlar */
  var boya = function () {
    $$('.pick').forEach(function (l) { l.classList.toggle('sel', $('input', l).checked); });
    $('[data-sub="bolge"]').hidden = durum.yontem !== 'bolge';
    $('[data-sub="mevcut"]').hidden = durum.yontem !== 'mevcut';
    $('[data-sub="harita"]').hidden = durum.yontem !== 'harita';
    /* `.dist-bar{display:flex}` hidden özniteliğini ezer; görünürlük doğrudan yazılır */
    var db = $('#mbDistBar'); db.hidden = durum.yontem !== 'mevcut'; db.style.display = db.hidden ? 'none' : '';
  };
  var goster = function (n) {
    adim = n;
    $$('.wstep').forEach(function (w) { w.classList.toggle('active', +w.dataset.adim === n); });
    $$('#mbStepper .stp').forEach(function (s) { var a = +s.dataset.adim; s.classList.toggle('active', a === n); s.classList.toggle('done', a < n); });
    $$('#mbStepper .stp-line').forEach(function (s, i) { s.classList.toggle('done', i + 1 < n); });
    $('.wiz-solo').hidden = false; $('#mbSonuc').hidden = true;
  };

  /* Eşleşme */
  var konumdaMi = function (m) {
    if (durum.yontem === 'bolge' && durum.il) { if (!has(m, 'il', durum.il)) { return false; } if (durum.ilce && !has(m, 'ilce', durum.ilce)) { return false; } }
    if (durum.yontem === 'mevcut' && durum.lat !== null) { return km(durum.lat, durum.lng, m.lat, m.lng) <= durum.mesafe; }
    /* Haritadan Seç: canlıda alan çizme yok, bölge yazılır. Prototip yazıdaki il ya da ilçe adını eşler; eşleşme yoksa konum süzmez */
    if (durum.yontem === 'harita' && tarifYer().length) { return tarifYer().some(function (y) { return has(m, y[0], y[1]); }); }
    return true;
  };
  var kriterler = function () {
    var l = [];
    if (durum.amac) { var a = AMAC[durum.amac]; l.push({ tur: 'amac', anahtar: durum.amac, ad: a.ad, agirlik: AGIRLIK.amac, uy: a.uy, neden: a.neden, yok: a.yok, oneri: a.oneri, ikon: 'fa-bullseye' }); }
    if (durum.butce) { var b = durum.butce; l.push({ tur: 'butce', anahtar: b, ad: BUTCE[b], agirlik: AGIRLIK.butce, uy: function (m) { return has(m, 'fiyat', b); }, yok: BUTCE[b] + ' fiyat seviyesinde kayıt henüz yok.', oneri: [['₺₺₺ mekânlar', 'mekanlar/?fiyat=3', function (m) { return has(m, 'fiyat', '3'); }], ['₺₺₺₺ mekânlar', 'mekanlar/?fiyat=4', function (m) { return has(m, 'fiyat', '4'); }]], ikon: 'fa-coins' }); }
    durum.nitelik.forEach(function (n) { var x = NITELIK[n]; l.push({ tur: 'nitelik', anahtar: n, ad: x.ad, agirlik: AGIRLIK.nitelik, uy: x.uy, yok: x.yok, oneri: x.oneri, ikon: 'fa-check' }); });
    return l;
  };
  var hesapla = function (k) {
    var pay = k.reduce(function (t, c) { return t + c.agirlik; }, 0);
    return V.mekanlar.filter(konumdaMi).map(function (m) {
      var tut = k.filter(function (c) { return c.uy(m); }), kalan = k.filter(function (c) { return !c.uy(m); });
      var p = tut.reduce(function (t, c) { return t + c.agirlik; }, 0);
      return { m: m, yuzde: pay ? Math.round(p / pay * 100) : 0, tut: tut, kalan: kalan };
    }).sort(function (a, b) { return b.yuzde - a.yuzde; });
  };

  /* Sonuç kartı: `_sonuc-karti.blade.php` sınıfları, gövde canlı mekân kartı */
  var kart = function (s) {
    var h = (V.kartlar[s.m.slug] || '').split('{{kok}}').join(kok).replace(/<p>[\s\S]*?<\/p>/, '');
    h = h.replace('<div class="disc-fig">', '<div class="disc-fig"><span class="disc-match"><i class="fa-solid fa-bolt" aria-hidden="true"></i> %' + s.yuzde + ' Sana Uygun</span>').replace(/<div class="disc-status">[\s\S]*?<\/div>/, '');
    var neden = s.tut.map(function (c) { return '<li><i class="fa-solid fa-circle-check" aria-hidden="true"></i> ' + kac(c.neden ? c.neden(s.m) : c.ad) + '</li>'; }).concat(s.kalan.map(function (c) { return '<li class="mb-eksik"><i class="fa-solid fa-circle-xmark" aria-hidden="true"></i> ' + kac(c.ad) + ' yok</li>'; })).join('');
    var rez = has(s.m, 'hizmet', 'rezervasyon-aliyor') ? '<span class="mb-rez"><i class="fa-solid fa-calendar-check" aria-hidden="true"></i> Rezervasyon alıyor</span>' : '';
    return h.replace(/<\/article>\s*$/, '<ul class="mb-reasons">' + neden + '</ul><div class="mb-card-actions">' + rez + '<a class="btn btn-primary" href="' + kok + 'mekan/mikla/">Detay <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a></div></article>').replace('<article ', '<article data-git="' + kok + 'mekan/mikla/" ');
  };
  var grup = function (baslik, not, l) {
    if (!l.length) { return ''; }
    var gor = l.slice(0, 12), kalan = l.slice(12);
    return '<div class="mb-res-group"><div class="res-bar"><h2>' + baslik + ' <span class="q">' + l.length + '</span></h2><p>' + not + '</p></div><div class="mkl-grid">' + gor.map(kart).join('') + '</div>' + (kalan.length ? '<div class="mb-daha"><button class="btn btn-ghost" type="button" data-daha="' + kac(kalan.map(function (s) { return s.m.slug; }).join(',')) + '">' + kalan.length + ' mekân daha göster</button></div>' : '') + '</div>';
  };
  var bos = function (baslik, metin, oneriler) {
    var d = oneriler.map(function (o) { var n = V.mekanlar.filter(o[2]).length; return n ? '<a class="fchip" href="' + kok + o[1] + '">' + kac(o[0]) + ' · ' + n + ' mekân</a>' : ''; }).join('');
    return '<div class="res-empty show"><div class="re-ico"><i class="fa-solid fa-compass" aria-hidden="true"></i></div><h3>' + kac(baslik) + '</h3><p>' + kac(metin) + '</p><div class="fchips mb-oneri">' + d + '<button class="fchip" type="button" data-mo-open=""><i class="fa-solid fa-location-dot" aria-hidden="true"></i> Mekân Öner</button></div><button class="btn btn-primary" type="button" id="mbSecimDegis"><i class="fa-solid fa-sliders" aria-hidden="true"></i> Seçimi Değiştir</button></div>';
  };
  var adresYaz = function () {
    var q = new URLSearchParams();
    ['amac', 'butce', 'il', 'ilce'].forEach(function (a) { if (durum[a]) { q.set(a, durum[a]); } });
    if (durum.nitelik.length) { q.set('nitelik', durum.nitelik.join(',')); }
    history.replaceState(null, '', location.pathname + (q.toString() ? '?' + q : ''));
  };
  var sonuc = function () {
    var k = kriterler(), cip = '';
    if (durum.yontem === 'bolge' && durum.il) { cip += '<span class="res-chip"><i class="fa-solid fa-location-dot" aria-hidden="true"></i> ' + kac($('#mbSehir option:checked').textContent.replace(/\s*\(\d+\)$/, '')) + (durum.ilce ? ' / ' + kac($('#mbIlce option:checked').textContent) : '') + '</span>'; }
    if (durum.yontem === 'mevcut' && durum.lat !== null) { cip += '<span class="res-chip"><i class="fa-solid fa-location-crosshairs" aria-hidden="true"></i> ' + durum.mesafe + ' km içinde</span>'; }
    if (durum.yontem === 'harita' && tarif) { cip += '<span class="res-chip"><i class="fa-solid fa-map-location-dot" aria-hidden="true"></i> ' + kac(tarif) + (tarifYer().length ? '' : ' · konum eşleşmedi') + '</span>'; }
    cip += k.map(function (c) { return '<span class="res-chip"><i class="fa-solid ' + c.ikon + '" aria-hidden="true"></i> ' + kac(c.ad) + '</span>'; }).join('');
    $('#mbCipler').innerHTML = cip;
    var veriYok = k.filter(function (c) { return !V.mekanlar.some(c.uy); })[0], l = hesapla(k), html;
    var paySatir = k.map(function (c) { return kac(c.ad) + ' ' + c.agirlik; }).join(' + ');
    $('#mbHesap').textContent = k.length && !veriYok && l.length ? 'Oran: tutan kriterlerin ağırlığı / seçtiğin kriterlerin toplamı (' + paySatir + ').' : '';
    if (veriYok) {
      html = bos('Bu seçimde sonuç yok', veriYok.yok + ' Aşağıdaki seçeneklerden birine geç ya da mekânı bize öner.', veriYok.oneri || []);
    } else if (!l.length) {
      html = bos('Bu konumda mekân bulamadık', 'Konumu genişlet ya da başka bir bölge seç.', [['Tüm mekânlar', 'mekanlar/', function () { return true; }]]);
    } else {
      var uygun = l.filter(function (s) { return s.yuzde >= 85; }), yakin = l.filter(function (s) { return s.yuzde >= 40 && s.yuzde < 85; });
      html = grup('En Uygun Seçenekler', '%85 ve üzeri uyum.', uygun) + grup('Yakın Alternatifler', 'Bir veya iki kriteri karşılamayan seçenekler.', yakin);
      if (!html) { html = bos('Seçimlerine yakın mekân bulamadık', 'Nitelikleri azaltmayı dene.', [['Tüm mekânlar', 'mekanlar/', function () { return true; }]]); }
    }
    $('#mbGruplar').innerHTML = html;
    $('.wiz-solo').hidden = true; $('#mbSonuc').hidden = false; adresYaz();
    $('#mbSonuc').scrollIntoView({ behavior: 'auto', block: 'start' }); window.scrollBy(0, -120);
  };

  /* Olaylar */
  document.addEventListener('change', function (e) {
    var t = e.target;
    if (t.name === 'amac') { durum.amac = t.value; }
    if (t.name === 'butce') { durum.butce = t.value; }
    if (t.name === 'yontem') { durum.yontem = t.value; }
    if (t.name === 'nitelik') { durum.nitelik = $$('input[name="nitelik"]:checked').map(function (i) { return i.value; }); }
    if (t.id === 'mbSehir') { durum.il = t.value; durum.ilce = ''; ilceDoldur(); }
    if (t.id === 'mbIlce') { durum.ilce = t.value; }
    boya();
  });
  document.addEventListener('input', function (e) {
    if (e.target.id !== 'mbDist') { return; }
    durum.mesafe = +e.target.value; $('#mbDistVal').textContent = durum.mesafe + ' km'; $('#mbDistFill').style.width = (durum.mesafe - 1) / 49 * 100 + '%';
  });
  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target : e.target.parentNode;
    if (t.closest('[data-ileri]')) {
      if (adim === 1 && !durum.amac) { window.prototipBildir('Devam etmek için bir amaç seç.'); return; }
      if (adim === 2 && durum.yontem === 'bolge' && !durum.il) { window.prototipBildir('Bir il seç ya da Fark Etmez\'i işaretle.'); return; }
      if (adim === 2 && durum.yontem === 'mevcut' && durum.lat === null) { window.prototipBildir('Önce Konumumu Bul\'a bas.'); return; }
      if (adim < 3) { goster(adim + 1); } else { sonuc(); } return;
    }
    if (t.closest('[data-geri]')) { goster(adim - 1); return; }
    var st = t.closest('#mbStepper .stp.done'); if (st) { goster(+st.dataset.adim); return; }
    if (t.closest('#mbDuzenle,#mbSecimDegis')) { goster(1); return; }
    if (t.closest('#mbYeni')) { location.href = location.pathname; return; }
    var d = t.closest('[data-daha]');
    if (d) {
      var k = kriterler(), sl = d.dataset.daha.split(','), l = hesapla(k).filter(function (s) { return sl.indexOf(s.m.slug) >= 0; });
      d.closest('.mb-res-group').querySelector('.mkl-grid').insertAdjacentHTML('beforeend', l.map(kart).join('')); d.parentNode.parentNode.removeChild(d.parentNode); return;
    }
    if (t.closest('#mbGeolocate')) {
      var n = $('#mbGeoStatus');
      if (!navigator.geolocation) { n.lastChild.nodeValue = ' Bu tarayıcı konum paylaşımını desteklemiyor. Bölge Seç ile devam et.'; return; }
      navigator.geolocation.getCurrentPosition(function (p) { durum.lat = p.coords.latitude; durum.lng = p.coords.longitude; n.lastChild.nodeValue = ' Konumun alındı. Yarıçapı aşağıdan ayarla.'; }, function () { n.lastChild.nodeValue = ' Konum alınamadı. Bölge Seç ile devam et.'; }, { timeout: 8000 });
    }
  });

  /* Adres: seçimli bağ doğrudan sonucu açar */
  var q = new URLSearchParams(location.search);
  var isaret = function (ad, deger) { var i = $('input[name="' + ad + '"][value="' + deger + '"]'); if (i) { i.checked = true; } return !!i; };
  isaret('yontem', 'hepsi'); isaret('butce', '');
  if (q.get('il')) { durum.yontem = 'bolge'; isaret('yontem', 'bolge'); ilSec.value = durum.il = q.get('il'); ilceDoldur(); if (q.get('ilce')) { ilceSec.value = durum.ilce = q.get('ilce'); } }
  if (q.get('butce') && isaret('butce', q.get('butce'))) { durum.butce = q.get('butce'); }
  (q.get('nitelik') || '').split(',').forEach(function (n) { if (NITELIK[n] && isaret('nitelik', n)) { durum.nitelik.push(n); } });
  boya();
  if (q.get('amac') && AMAC[q.get('amac')] && isaret('amac', q.get('amac'))) { durum.amac = q.get('amac'); boya(); sonuc(); }
})();
