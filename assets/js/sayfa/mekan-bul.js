/* Mekân Bul: 4 adım (Beyar revizesi 10 Kas). 1 Konum + Bütçe · 2 Ortam & Atmosfer (çoklu) · 3 Mutfak (aile sekmeleri, çoklu) · 4 Nitelikler + zaman.
   Veri `mekan-liste-veri.js`, canlı 203 mekânın kopyası. Seçenek kutuları kendi süzme alanını ve kodlarını taşır (`data-f`, `data-kod`):
   birleşik etikette kodlardan biri yeter (ör. Otopark / Vale = otopark, ozel-otopark ya da vale).
   Oran: yalnız cevaplanan kriterler paydaya girer. Ağırlıklar canlı `MekanBulEslestirmeServisi::AGIRLIKLAR`:
   ortam (canlıda ne_icin) 40, bütçe 20, mutfak 15, her nitelik 15, şimdi açık 15, rezervasyon 10.
   Grup eşikleri canlı `UYGUN_ESIGI` 0.8 ve `YAKIN_ESIGI` 0.4: yuvarlanmamış orana bakılır. Canlının üçüncü grubu
   (Farklı Bir Deneyim, oran < 0.4) prototipte yok; Beyar 10 Kas iki grup.
   Konum eşleşme değil süzgeçtir: seçilen yerin dışındaki mekân listeye girmez. Hiçbir mekânda verisi olmayan seçim boş sonuç ve öneri verir. */
(function () {
  'use strict';
  var V = window.DG_LISTE; if (!V) { return; }
  var kok = document.documentElement.dataset.kok || './';
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var kac = function (t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); };
  var has = function (m, g, d) { return (m.f[g] || []).indexOf(d) >= 0; };
  var N = $$('.wstep').length;
  /* Seçenek kutusu: ad, süzme alanı, kodlar. Kodlardan biri yeter */
  var kutu = function (i) {
    var l = i.closest('label'), b = $('.pk-txt b', l) || $('.ft', l), f = i.dataset.f, kod = (i.dataset.kod || i.value).split(' '), bayrak = $('.pk-ico img', l);
    return { ad: b.textContent.trim(), ikon: (($('.pk-ico i', l) || {}).className || 'fa-solid fa-check').replace('fa-solid ', ''), bayrak: bayrak ? bayrak.getAttribute('src') : '', uy: function (m) { return kod.some(function (k) { return has(m, f, k); }); } };
  };
  /* Haritadan Seç tarifi: yazının içindeki il ve ilçe adları; ör. "İstanbul Havalimanı çevresi" İstanbul'u eşler */
  var tarif = '', tarifOnbellek = null;
  var tarifYer = function () {
    if (tarifOnbellek && tarifOnbellek.t === tarif) { return tarifOnbellek.l; }
    var t = tarif.toLocaleLowerCase('tr'), l = [];
    V.secenek.ilce.forEach(function (o) { if (t.indexOf(o.ad.toLocaleLowerCase('tr')) >= 0) { l.push(['ilce', o.deger]); } });
    if (!l.length) { V.secenek.il.forEach(function (o) { if (t.indexOf(o.ad.toLocaleLowerCase('tr')) >= 0) { l.push(['il', o.deger]); } }); }
    tarifOnbellek = { t: tarif, l: l }; return l;
  };
  var km = function (a, b, c, d) { var r = Math.PI / 180, x = (d - b) * r * Math.cos((a + c) * r / 2), y = (c - a) * r; return Math.sqrt(x * x + y * y) * 6371; };
  var BUTCE = { 1: 'Ekonomik (₺)', 2: 'Orta (₺₺)', 3: 'Üst Orta (₺₺₺)', 4: 'Lüks (₺₺₺₺)' };
  var AGIRLIK = { ortam: 40, butce: 20, mutfak: 15, nitelik: 15, simdi: 15, rez: 10 };
  var ESIK = { uygun: 0.8, yakin: 0.4 };
  var durum = { yontem: 'hepsi', il: '', ilce: '', lat: null, lng: null, mesafe: 25, butce: '', ortam: [], mutfak: [], nitelik: [], simdi: false, rez: false };
  var adim = 1;
  var secili = function (ad) { return $$('input[name="' + ad + '"]:checked').map(function (i) { return i.value; }); };

  /* Seçenek sayıları: her kutuda kayıtlı mekân sayısı görünür, 0 gizlenmez: boş seçim öneri verir */
  var yaz = function (i, n) { var l = i.closest('.pick'), s = $('.pk-txt small', l); if (!s) { s = document.createElement('small'); $('.pk-txt', l).appendChild(s); } s.textContent = n ? n + ' mekân' : 'Kayıt yok'; };
  $$('input[name="ortam"]:not([data-fark]),input[name="mutfak"],input[name="nitelik"]').forEach(function (i) { yaz(i, V.mekanlar.filter(kutu(i).uy).length); });
  $$('input[name="butce"]').forEach(function (i) { if (!i.value) { return; } var n = V.mekanlar.filter(function (m) { return has(m, 'fiyat', i.value); }).length; var s = $('.pk-txt small', i.closest('.pick')); s.textContent = s.textContent + ' · ' + (n ? n + ' mekân' : 'kayıt yok'); });
  var ilSec = $('#mbSehir'), ilceSec = $('#mbIlce');
  V.secenek.il.forEach(function (o) { ilSec.insertAdjacentHTML('beforeend', '<option value="' + o.deger + '">' + kac(o.ad) + ' (' + o.sayi + ')</option>'); });
  var ilceDoldur = function () {
    ilceSec.innerHTML = '<option value="">Tüm ilçeler</option>';
    V.secenek.ilce.forEach(function (o) { if (o.il === durum.il) { ilceSec.insertAdjacentHTML('beforeend', '<option value="' + o.deger + '">' + kac(o.ad) + '</option>'); } });
    $('#mbIlceField').hidden = !durum.il;
  };

  /* Kutu görünümü, alt alanlar, sekme ve akordiyon sayaçları */
  var boya = function () {
    $$('.pick').forEach(function (l) { l.classList.toggle('sel', $('input', l).checked); });
    $('[data-sub="bolge"]').hidden = durum.yontem !== 'bolge';
    $('[data-sub="mevcut"]').hidden = durum.yontem !== 'mevcut';
    $('[data-sub="harita"]').hidden = durum.yontem !== 'harita';
    /* `.dist-bar{display:flex}` hidden özniteliğini ezer; görünürlük doğrudan yazılır */
    var db = $('#mbDistBar'); db.hidden = durum.yontem !== 'mevcut'; db.style.display = db.hidden ? 'none' : '';
    $$('[data-tab-count]').forEach(function (d) { var n = $$('[data-panel="' + d.dataset.tabCount + '"] input:checked').length; d.textContent = n; d.hidden = !n; });
    /* B9: kapalı grup başlığı seçim sayısını ve seçilenlerin kısa adlarını taşır (açıkken ad özeti gizli, CSS) */
    $$('.mb-acc .fct').forEach(function (g) { var c = $$('input:checked', g), n = c.length; $('.fct-dot', g).textContent = n; g.classList.toggle('has-active', n > 0); $('[data-acc-ozet]', g).textContent = c.map(function (i) { return kutu(i).ad; }).join(', '); });
  };
  var sekme = function (k) {
    $$('#mbMutfakSekme .mb-tab').forEach(function (t) { var a = t.dataset.tab === k; t.classList.toggle('active', a); t.setAttribute('aria-selected', a ? 'true' : 'false'); });
    $$('.mb-tabpanel').forEach(function (p) { p.classList.toggle('active', p.dataset.panel === k); });
  };
  var goster = function (n) {
    adim = n;
    $$('.wstep').forEach(function (w) { w.classList.toggle('active', +w.dataset.adim === n); });
    $$('#mbStepper .stp').forEach(function (s) { var a = +s.dataset.adim; s.classList.toggle('active', a === n); s.classList.toggle('done', a < n); });
    $$('#mbStepper .stp-line').forEach(function (s, i) { s.classList.toggle('done', i + 1 < n); });
    $('.wiz-solo').hidden = false; $('#mbSonuc').hidden = true;
  };
  /* B10 (Beyar 11 Kas): ekran değişince kaydırma belge yüksekliğine değil hedef öğeye gider. İçerik oturduktan sonra (iki rAF) ölçülür;
     sabit başlığın alt kenarı kadar pay bırakılır, odak hedefe taşınır (preventScroll). Hareket azaltılmışsa animasyonsuz */
  var azHareket = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var basPayi = function () { var b = $('header.kabuk-basi') || $('header'); return (b ? Math.max(0, b.getBoundingClientRect().bottom) : 0) + 16; };
  var odakla = function (hedef, odak) {
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      var y = hedef.getBoundingClientRect().top + window.pageYOffset - basPayi();
      window.scrollTo({ top: Math.max(0, Math.round(y)), behavior: azHareket ? 'instant' : 'smooth' });
      if (odak) { odak.focus({ preventScroll: true }); }
    }); });
  };
  var adimaGit = function () { var h = $('.wstep.active .fc-head h2'); h.setAttribute('tabindex', '-1'); odakla($('#mbStepper'), h); };
  /* Ekran okuyucuya sonuç: grup başlıkları sayılarıyla ya da boş sonuç başlığı */
  var duyur = function () {
    var d = $('#mbDuyuru'), bosB = $('#mbGruplar .res-empty h3'), g = $$('#mbGruplar .res-bar h2').map(function (h) { return h.textContent.replace(/\s+/g, ' ').trim(); });
    d.textContent = ''; requestAnimationFrame(function () { d.textContent = bosB ? bosB.textContent + '.' : 'Sonuçlar: ' + g.join(', ') + '.'; });
  };
  /* Yeni Arama: sayfayı yeniden yüklemeden sihirbazı başa alır, kaydırma sihirbazın başına */
  var yeniArama = function () {
    $$('#mbCard input[type="checkbox"],#mbCard input[type="radio"]').forEach(function (i) { i.checked = false; });
    $('input[name="yontem"][value="hepsi"]').checked = true; $('input[name="butce"][value=""]').checked = true;
    durum.yontem = 'hepsi'; durum.il = ''; durum.ilce = ''; durum.butce = ''; durum.lat = null; durum.lng = null;
    ilSec.value = ''; ilceDoldur(); tarif = ''; $('#mbHaritaTxt').value = ''; araTemizle(); sekme('ogun');
    $$('.mb-acc .fct').forEach(function (g, i) { g.classList.toggle('open', !i); $('.fct-head', g).setAttribute('aria-expanded', i ? 'false' : 'true'); });
    history.replaceState(null, '', location.pathname); boya(); goster(1); adimaGit();
  };

  /* Eşleşme */
  var konumdaMi = function (m) {
    if (durum.yontem === 'bolge' && durum.il) { if (!has(m, 'il', durum.il)) { return false; } if (durum.ilce && !has(m, 'ilce', durum.ilce)) { return false; } }
    if (durum.yontem === 'mevcut' && durum.lat !== null) { return km(durum.lat, durum.lng, m.lat, m.lng) <= durum.mesafe; }
    /* Haritadan Seç: canlıda alan çizme yok, bölge yazılır. Prototip yazıdaki il ya da ilçe adını eşler; eşleşme yoksa konum süzmez */
    if (durum.yontem === 'harita' && tarifYer().length) { return tarifYer().some(function (y) { return has(m, y[0], y[1]); }); }
    return true;
  };
  var TUMU = [['Tüm mekânlar', 'mekanlar/', function () { return true; }]];
  /* Çoklu kriter (ortam, mutfak): seçilenlerden biri yeter; kartta tutanların adı yazılır */
  var coklu = function (ad, tur, baslik, ikon) {
    var k = $$('input[name="' + ad + '"]:checked:not([data-fark])').map(kutu); if (!k.length) { return null; }
    var adlar = k.map(function (x) { return x.ad; });
    return { tur: tur, ad: adlar.join(', '), cipler: k, agirlik: AGIRLIK[tur], ikon: ikon, eksik: baslik + ': ' + adlar.join(', ') + ' yok',
      uy: function (m) { return k.some(function (x) { return x.uy(m); }); },
      neden: function (m) { return k.filter(function (x) { return x.uy(m); }).map(function (x) { return x.ad; }).join(', '); },
      yok: (k.length > 1 ? 'Seçtiğin ' + baslik.toLocaleLowerCase('tr') + ' seçeneklerinde' : adlar[0] + ' için') + ' kayıt henüz yok.', oneri: TUMU };
  };
  var kriterler = function () {
    var l = [], o = coklu('ortam', 'ortam', 'Ortam', 'fa-layer-group'), mu = coklu('mutfak', 'mutfak', 'Mutfak', 'fa-utensils');
    if (o) { l.push(o); }
    if (durum.butce) { var b = durum.butce; l.push({ tur: 'butce', ad: BUTCE[b], agirlik: AGIRLIK.butce, uy: function (m) { return has(m, 'fiyat', b); }, yok: BUTCE[b] + ' fiyat seviyesinde kayıt henüz yok.', oneri: [['₺₺₺ mekânlar', 'mekanlar/?fiyat=3', function (m) { return has(m, 'fiyat', '3'); }], ['₺₺₺₺ mekânlar', 'mekanlar/?fiyat=4', function (m) { return has(m, 'fiyat', '4'); }]], ikon: 'fa-coins' }); }
    if (mu) { l.push(mu); }
    $$('input[name="nitelik"]:checked').forEach(function (i) { var x = kutu(i); l.push({ tur: 'nitelik', ad: x.ad, agirlik: AGIRLIK.nitelik, uy: x.uy, yok: x.ad + ' kaydı henüz yok.', oneri: TUMU, ikon: x.ikon }); });
    ['simdi', 'rez'].forEach(function (a) { var i = $('input[name="' + a + '"]'); if (i.checked) { var x = kutu(i); l.push({ tur: a, ad: a === 'simdi' ? 'Şimdi açık' : 'Rezervasyon alıyor', agirlik: AGIRLIK[a], uy: x.uy, ikon: a === 'simdi' ? 'fa-door-open' : 'fa-calendar-check', oneri: TUMU }); } });
    return l;
  };
  var hesapla = function (k) {
    var pay = k.reduce(function (t, c) { return t + c.agirlik; }, 0);
    return V.mekanlar.filter(konumdaMi).map(function (m) {
      var tut = k.filter(function (c) { return c.uy(m); }), kalan = k.filter(function (c) { return !c.uy(m); });
      var p = tut.reduce(function (t, c) { return t + c.agirlik; }, 0);
      return { m: m, oran: pay ? p / pay : 0, yuzde: pay ? Math.round(p / pay * 100) : 0, tut: tut, kalan: kalan };
    }).sort(function (a, b) { return b.yuzde - a.yuzde; });
  };

  /* Sonuç kartı: `_sonuc-karti.blade.php` sınıfları, gövde canlı mekân kartı */
  var kart = function (s) {
    var h = (V.kartlar[s.m.slug] || '').split('{{kok}}').join(kok).replace(/<p>[\s\S]*?<\/p>/, '');
    h = h.replace('<div class="disc-fig">', '<div class="disc-fig"><span class="disc-match"><i class="fa-solid fa-bolt" aria-hidden="true"></i> %' + s.yuzde + ' Sana Uygun</span>').replace(/<div class="disc-status">[\s\S]*?<\/div>/, '');
    var neden = s.tut.map(function (c) { return '<li><i class="fa-solid fa-circle-check" aria-hidden="true"></i> ' + kac(c.neden ? c.neden(s.m) : c.ad) + '</li>'; }).concat(s.kalan.map(function (c) { return '<li class="mb-eksik"><i class="fa-solid fa-circle-xmark" aria-hidden="true"></i> ' + kac(c.eksik || c.ad + ' yok') + '</li>'; })).join('');
    var rez = has(s.m, 'hizmet', 'rezervasyon-aliyor') ? '<span class="mb-rez"><i class="fa-solid fa-calendar-check" aria-hidden="true"></i> Rezervasyon alıyor</span>' : '';
    return h.replace(/<\/article>\s*$/, '<ul class="mb-reasons">' + neden + '</ul><div class="mb-card-actions">' + rez + '<a class="btn btn-primary" href="' + kok + 'mekan/mikla/">Detay <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a></div></article>').replace('<article ', '<article data-git="' + kok + 'mekan/mikla/" ');
  };
  var grup = function (baslik, not, l) {
    if (!l.length) { return ''; }
    var gor = l.slice(0, 12), kalan = l.slice(12);
    return '<div class="mb-res-group"><div class="res-bar"><h2>' + baslik + ' <span class="q">' + l.length + '</span></h2><p>' + not + '</p></div><div class="mkl-grid">' + gor.map(kart).join('') + '</div>' + (kalan.length ? '<div class="mb-daha"><button class="btn btn-ghost" type="button" data-daha="' + kac(kalan.map(function (s) { return s.m.slug; }).join(',')) + '">' + kalan.length + ' mekân daha göster</button></div>' : '') + '</div>';
  };
  /* B6: Fark Etmez ile hiç kriter kalmayabilir. Canlı `MekanBulEslestirmeServisi::puanla`: payda yoksa oran 1.0, herkes En Uygun ve %100 */
  var sirala = function (k) { var l = hesapla(k); return k.length ? l : l.map(function (s) { s.yuzde = 100; s.oran = 1; return s; }); };
  var bos = function (baslik, metin, oneriler) {
    var d = oneriler.map(function (o) { var n = V.mekanlar.filter(o[2]).length; return n ? '<a class="fchip" href="' + kok + o[1] + '">' + kac(o[0]) + ' · ' + n + ' mekân</a>' : ''; }).join('');
    return '<div class="res-empty show"><div class="re-ico"><i class="fa-solid fa-compass" aria-hidden="true"></i></div><h3>' + kac(baslik) + '</h3><p>' + kac(metin) + '</p><div class="fchips mb-oneri">' + d + '<button class="fchip" type="button" data-mo-open=""><i class="fa-solid fa-location-dot" aria-hidden="true"></i> Mekân Öner</button></div><button class="btn btn-primary" type="button" id="mbSecimDegis"><i class="fa-solid fa-sliders" aria-hidden="true"></i> Seçimi Değiştir</button></div>';
  };
  var adresYaz = function () {
    var q = new URLSearchParams();
    ['butce', 'il', 'ilce'].forEach(function (a) { if (durum[a]) { q.set(a, durum[a]); } });
    ['ortam', 'mutfak', 'nitelik'].forEach(function (a) { var v = secili(a); if (v.length) { q.set(a, v.join(',')); } });
    ['simdi', 'rez'].forEach(function (a) { if ($('input[name="' + a + '"]').checked) { q.set(a, '1'); } });
    history.replaceState(null, '', location.pathname + (q.toString() ? '?' + q : ''));
  };
  var sonuc = function (kaydir) {
    var k = kriterler(), cip = '';
    if (durum.yontem === 'bolge' && durum.il) { cip += '<span class="res-chip"><i class="fa-solid fa-location-dot" aria-hidden="true"></i> ' + kac($('#mbSehir option:checked').textContent.replace(/\s*\(\d+\)$/, '')) + (durum.ilce ? ' / ' + kac($('#mbIlce option:checked').textContent) : '') + '</span>'; }
    if (durum.yontem === 'mevcut' && durum.lat !== null) { cip += '<span class="res-chip"><i class="fa-solid fa-location-crosshairs" aria-hidden="true"></i> ' + durum.mesafe + ' km içinde</span>'; }
    if (durum.yontem === 'harita' && tarif) { cip += '<span class="res-chip"><i class="fa-solid fa-map-location-dot" aria-hidden="true"></i> ' + kac(tarif) + (tarifYer().length ? '' : ' · konum eşleşmedi') + '</span>'; }
    if ($('input[data-fark]').checked) { cip += '<span class="res-chip"><i class="fa-solid fa-shuffle" aria-hidden="true"></i> Ortam: Fark Etmez</span>'; }
    cip += k.map(function (c) { return (c.cipler || [c]).map(function (x) { return '<span class="res-chip">' + (x.bayrak ? '<img class="mb-bayrak" src="' + kac(x.bayrak) + '" alt="" width="17" height="12">' : '<i class="fa-solid ' + x.ikon + '" aria-hidden="true"></i>') + ' ' + kac(x.ad) + '</span>'; }).join(''); }).join('');
    $('#mbCipler').innerHTML = cip;
    var veriYok = k.filter(function (c) { return !V.mekanlar.some(c.uy); })[0], l = sirala(k), html;
    var paySatir = k.map(function (c) { return kac(c.tur === 'ortam' ? 'Ortam' : c.tur === 'mutfak' ? 'Mutfak' : c.tur === 'butce' ? 'Bütçe' : c.ad) + ' ' + c.agirlik; }).join(' + ');
    $('#mbHesap').textContent = k.length && !veriYok && l.length ? 'Oran: tutan kriterlerin ağırlığı / seçtiğin kriterlerin toplamı (' + paySatir + ').' : '';
    if (veriYok) {
      html = bos('Bu seçimde sonuç yok', veriYok.yok + ' Seçimi değiştir ya da mekânı bize öner.', veriYok.oneri || []);
    } else if (!l.length) {
      html = bos('Bu konumda mekân bulamadık', 'Konumu genişlet ya da başka bir bölge seç.', TUMU);
    } else {
      var uygun = l.filter(function (s) { return s.oran >= ESIK.uygun; }), yakin = l.filter(function (s) { return s.oran >= ESIK.yakin && s.oran < ESIK.uygun; });
      html = grup('En Uygun Seçenekler', '%' + Math.round(ESIK.uygun * 100) + ' ve üzeri uyum.', uygun) + grup('Yakın Alternatifler', 'Bir veya iki kriteri karşılamayan seçenekler.', yakin);
      if (!html) { html = bos('Seçimlerine yakın mekân bulamadık', 'Nitelikleri azaltmayı dene.', TUMU); }
    }
    $('#mbGruplar').innerHTML = html;
    $('.wiz-solo').hidden = true; $('#mbSonuc').hidden = false; adresYaz();
    /* B10: adres çubuğundan doğrudan açılışta kaydırma yok; düğmeyle açılınca özet çubuğu başlığın altına gelir ve odağı alır */
    if (kaydir) { duyur(); odakla($('#mbSonuc .res-summary'), $('#mbSonuc .res-summary')); }
  };

  /* Olaylar */
  document.addEventListener('change', function (e) {
    var t = e.target;
    if (t.name === 'butce') { durum.butce = t.value; }
    if (t.name === 'yontem') { durum.yontem = t.value; }
    if (t.id === 'mbSehir') { durum.il = t.value; durum.ilce = ''; ilceDoldur(); }
    if (t.id === 'mbIlce') { durum.ilce = t.value; }
    /* B6: Fark Etmez tek başına seçili kalır; başka ortam seçilince kendisi kalkar */
    if (t.name === 'ortam' && t.checked) { $$('input[name="ortam"]').forEach(function (i) { if (i !== t && (t.hasAttribute('data-fark') || i.hasAttribute('data-fark'))) { i.checked = false; } }); }
    boya();
  });
  document.addEventListener('input', function (e) {
    if (e.target.id === 'mbHaritaTxt') { tarif = e.target.value.trim(); }
    if (e.target.id !== 'mbDist') { return; }
    durum.mesafe = +e.target.value; $('#mbDistVal').textContent = durum.mesafe + ' km'; $('#mbDistFill').style.width = (durum.mesafe - 1) / 49 * 100 + '%';
  });
  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target : e.target.parentNode;
    if (t.closest('[data-ileri]')) {
      if (adim === 1 && durum.yontem === 'bolge' && !durum.il) { window.prototipBildir('Bir il seç ya da Fark Etmez\'i işaretle.', 'uyari'); return; }
      if (adim === 1 && durum.yontem === 'mevcut' && durum.lat === null) { window.prototipBildir('Önce Konumumu Bul\'a bas.', 'uyari'); return; }
      if (adim === 2 && !secili('ortam').length) { window.prototipBildir('Devam etmek için en az bir ortam seç.', 'uyari'); return; }
      if (adim < N) { goster(adim + 1); adimaGit(); } else { sonuc(true); } return;
    }
    if (t.closest('[data-geri]')) { goster(adim - 1); adimaGit(); return; }
    var st = t.closest('#mbStepper .stp.done'); if (st) { goster(+st.dataset.adim); adimaGit(); return; }
    var sk = t.closest('#mbMutfakSekme .mb-tab'); if (sk) { sekme(sk.dataset.tab); return; }
    /* Aç-kapa kabuğun ortak `.fct-head` bağında (app.js). B9 (Beyar 11 Kas): tek açık grup, kanon §21; açık başlığa basınca kapanır.
       Üstteki grup kapanınca tıklanan başlık yerinde kalır (kayma telafisi); açılan grubun gövdesi ekrana sığmıyorsa başlık sabit başlığın altına gelene kadar kaydırılır */
    var ah = t.closest('.mb-acc .fct-head');
    if (ah) {
      var g = ah.parentNode, ust = ah.getBoundingClientRect().top;
      $$('.mb-acc .fct').forEach(function (o) { if (o !== g) { o.classList.remove('open'); } $('.fct-head', o).setAttribute('aria-expanded', o.classList.contains('open') ? 'true' : 'false'); });
      var kay = ah.getBoundingClientRect().top - ust; if (kay) { window.scrollBy({ top: kay, behavior: 'instant' }); }
      if (g.classList.contains('open')) { var r = g.getBoundingClientRect(), fazla = r.bottom - window.innerHeight + 16, tavan = r.top - basPayi(); if (fazla > 0 && tavan > 0) { window.scrollBy({ top: Math.min(fazla, tavan), behavior: azHareket ? 'instant' : 'smooth' }); } }
      return;
    }
    if (t.closest('#mbDuzenle,#mbSecimDegis')) { goster(1); adimaGit(); return; }
    if (t.closest('#mbYeni')) { yeniArama(); return; }
    var d = t.closest('[data-daha]');
    if (d) {
      var k = kriterler(), sl = d.dataset.daha.split(','), l = sirala(k).filter(function (s) { return sl.indexOf(s.m.slug) >= 0; });
      d.closest('.mb-res-group').querySelector('.mkl-grid').insertAdjacentHTML('beforeend', l.map(kart).join('')); d.parentNode.parentNode.removeChild(d.parentNode); return;
    }
    if (t.closest('#mbGeolocate')) {
      var n = $('#mbGeoStatus');
      if (!navigator.geolocation) { n.lastChild.nodeValue = ' Bu tarayıcı konum paylaşımını desteklemiyor. Bölge Seç ile devam et.'; return; }
      navigator.geolocation.getCurrentPosition(function (p) { durum.lat = p.coords.latitude; durum.lng = p.coords.longitude; n.lastChild.nodeValue = ' Konumun alındı. Yarıçapı aşağıdan ayarla.'; }, function () { n.lastChild.nodeValue = ' Konum alınamadı. Bölge Seç ile devam et.'; }, { timeout: 8000 });
    }
  });
  /* Sekme çubuğunda ok tuşları (role="tablist") */
  $('#mbMutfakSekme').addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') { return; }
    var l = $$('#mbMutfakSekme .mb-tab'), i = l.indexOf(document.activeElement); if (i < 0) { return; }
    var y = l[(i + (e.key === 'ArrowRight' ? 1 : l.length - 1)) % l.length]; y.focus(); sekme(y.dataset.tab); e.preventDefault();
  });
  /* B8 mutfak araması (Beyar 11 Kas): Keşif Tercihlerim "Mutfak ara…" kutusunun davranışı. Türkçe katlama Dada Route yer aramasının
     `dgKatla`sı (rota-sahte.js; bu sayfada yüklü değilse aynı kural): İ/ı/I, ş, ğ, ü, ö, ç katlanır, büyük-küçük harf fark etmez.
     Arama varken şerit söner (kanon §11 `.sekmeler.arama-modu`), üç grubun eşleşen kartları grup başlığıyla alt alta; Esc ve × temizler */
  var katla = window.dgKatla || function (s) { return String(s).toLocaleLowerCase('tr').replace(/[ıİI]/g, 'i').replace(/i̇/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/[âà]/g, 'a').replace(/[îì]/g, 'i').replace(/[ûù]/g, 'u').replace(/\s+/g, ' ').trim(); };
  var araKutu = $('#mbMutfakAra');
  var ara = function () {
    var q = katla(araKutu.value), es = 0;
    araKutu.closest('.wstep').classList.toggle('mb-arama', !!q); $('#mbMutfakSekme').classList.toggle('arama-modu', !!q);
    $$('#mbMutfakSekme .mb-tab').forEach(function (b) { if (q) { b.setAttribute('tabindex', '-1'); b.setAttribute('aria-disabled', 'true'); } else { b.removeAttribute('tabindex'); b.removeAttribute('aria-disabled'); } });
    $$('.mb-tabpanel').forEach(function (p) {
      var n = 0;
      $$('.pick', p).forEach(function (l) { var uy = !q || katla($('.pk-txt b', l).textContent).indexOf(q) >= 0; l.hidden = !uy; if (uy) { n++; } });
      p.hidden = !!q && !n; $('[data-panel-sayi]', p).textContent = q ? n : ''; es += n;
    });
    $('#mbAraYok').hidden = !q || es > 0; $('#mbAraTemizle').hidden = !araKutu.value;
    $('#mbAraDurum').textContent = q ? (es ? es + ' mutfak bulundu.' : 'Aramana uyan mutfak yok.') : '';
  };
  var araTemizle = function () { araKutu.value = ''; ara(); };
  araKutu.addEventListener('input', ara);
  araKutu.addEventListener('keydown', function (e) { if (e.key === 'Escape' && araKutu.value) { e.preventDefault(); e.stopPropagation(); araTemizle(); } });
  $('#mbAraTemizle').addEventListener('click', function () { araTemizle(); araKutu.focus(); });

  /* Adres: seçimli bağ doğrudan sonucu açar (en az bir ortam gerekir, adım 2 kuralı) */
  var q = new URLSearchParams(location.search);
  var isaret = function (ad, deger) { var i = $('input[name="' + ad + '"][value="' + deger + '"]'); if (i) { i.checked = true; } return !!i; };
  isaret('yontem', 'hepsi'); isaret('butce', '');
  if (q.get('il')) { durum.yontem = 'bolge'; isaret('yontem', 'bolge'); ilSec.value = durum.il = q.get('il'); ilceDoldur(); if (q.get('ilce')) { ilceSec.value = durum.ilce = q.get('ilce'); } }
  if (q.get('butce') && isaret('butce', q.get('butce'))) { durum.butce = q.get('butce'); }
  ['ortam', 'mutfak', 'nitelik'].forEach(function (a) { (q.get(a) || '').split(',').forEach(function (v) { if (v) { isaret(a, v); } }); });
  ['simdi', 'rez'].forEach(function (a) { if (q.get(a) === '1') { isaret(a, '1'); } });
  var ilkSekme = $('.mb-tabpanel input:checked'); if (ilkSekme) { sekme(ilkSekme.closest('.mb-tabpanel').dataset.panel); }
  /* B6: adreste Fark Etmez başka ortamla geldiyse ortam seçimi geçerli. B9: tek açık grup; seçimli ilk grup açılır, yoksa Hizmetler */
  var fk = $('input[data-fark]'); if (fk.checked && $$('input[name="ortam"]:checked').length > 1) { fk.checked = false; }
  var acik = $$('.mb-acc .fct').filter(function (g) { return $('input:checked', g); })[0];
  if (acik) { $$('.mb-acc .fct').forEach(function (g) { g.classList.toggle('open', g === acik); $('.fct-head', g).setAttribute('aria-expanded', g === acik ? 'true' : 'false'); }); }
  boya();
  if (secili('ortam').length) { sonuc(); }
})();
