/* Mekânlar: süzgeç, liste, sayaç, seçili etiketler ve harita birlikte çalışır.
   Veri: `mekan-liste-veri.js`, canlı kamuya açık uçların statik kopyası. Grup içinde VEYA, gruplar arası VE (FU.2, FU.3).
   Konum hiyerarşiktir: seçili il içinde ilçe seçildiyse yalnız o ilçe, ilçe içinde semt seçildiyse yalnız o semt. */
(function () {
  'use strict';
  var V = window.DG_LISTE; if (!V) { return; }
  var kok = document.documentElement.dataset.kok || './';
  var GRUPLAR = ['kategori', 'konsept', 'mutfak', 'vesile', 'fiyat', 'puan', 'hizmet', 'beslenme', 'ulasim', 'acik', 'seckiler'];
  var SAYFA = 12, sayfa = 1, aranan = '', konumAranan = '';
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var kac = function (t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); };
  var tr = function (t) { return String(t).toLocaleLowerCase('tr'); };
  var kutu = function (g, d) { return $('input[name="' + g + '[]"][value="' + d + '"]'); };
  var secili = function (g) { return $$('input[name="' + g + '[]"]:checked').map(function (i) { return i.value; }); };
  var ilceBilgi = {}, semtBilgi = {}, ilBilgi = {};
  V.secenek.il.forEach(function (o) { ilBilgi[o.deger] = o; });
  V.secenek.ilce.forEach(function (o) { ilceBilgi[o.il + '|' + o.deger] = o; });
  V.secenek.semt.forEach(function (o) { semtBilgi[o.ilce + '|' + o.deger] = o; });
  var ozellik = function (m, g) { return m.f[g] || []; };

  function konumUyar(m, il, ilce, semt) {
    if (!il.length) { return true; }
    var mi = ozellik(m, 'il')[0]; if (il.indexOf(mi) < 0) { return false; }
    var buIlIlce = ilce.filter(function (d) { return ilceBilgi[mi + '|' + d]; });
    if (!buIlIlce.length) { return true; }
    var mc = ozellik(m, 'ilce')[0]; if (buIlIlce.indexOf(mc) < 0) { return false; }
    var buIlceSemt = semt.filter(function (d) { return semtBilgi[mc + '|' + d]; });
    if (!buIlceSemt.length) { return true; }
    return ozellik(m, 'semt').some(function (s) { return buIlceSemt.indexOf(s) >= 0; });
  }
  function grupUyar(m, g, sec) { return !sec.length || ozellik(m, g).some(function (d) { return sec.indexOf(d) >= 0; }); }
  function metinUyar(m) {
    if (aranan && tr(m.ad).indexOf(aranan) < 0) { return false; }
    if (konumAranan) {
      var il = ilBilgi[ozellik(m, 'il')[0]], t = tr((il ? il.ad : '') + ' ' + (m.ilce || ''));
      if (t.indexOf(konumAranan) < 0) { return false; }
    }
    return true;
  }
  function durum() { var d = { il: secili('il'), ilce: secili('ilce'), semt: secili('semt') }; GRUPLAR.forEach(function (g) { d[g] = secili(g); }); return d; }
  /* `haric` grubu sayılmaz: seçenek sayacı "bunu da seçersen kaç" sorusuna cevap verir */
  function suz(d, haric) {
    return V.mekanlar.filter(function (m) {
      if (!metinUyar(m)) { return false; }
      if (haric !== 'il' && !konumUyar(m, d.il, haric === 'ilce' ? [] : d.ilce, haric === 'semt' ? [] : d.semt)) { return false; }
      return GRUPLAR.every(function (g) { return g === haric || grupUyar(m, g, d[g]); });
    });
  }

  /* Satır üretimi: İlçe ve Semt seçili üst konuma göre dolar */
  var satirKalip = $('input[name="il[]"]').closest('label.fct-row').cloneNode(true);
  function satir(ad, deger, g) {
    var r = satirKalip.cloneNode(true), i = $('input', r); i.name = g + '[]'; i.value = deger; i.checked = false; i.removeAttribute('checked'); $('.ft', r).textContent = ad; return r;
  }
  function altKonumlar(d) {
    var ik = $('[data-konum="ilce"]'), sk = $('[data-konum="semt"]'), ig = $('.fct-body', ik), sg = $('.fct-body', sk);
    var oncekiI = d.ilce.slice(), oncekiS = d.semt.slice();
    $$('label.fct-row,.fct-not,.fct-more,.fb-field', ig).forEach(function (e) { e.parentNode.removeChild(e); });
    $$('label.fct-row,.fct-not,.fct-more,.fb-field', sg).forEach(function (e) { e.parentNode.removeChild(e); });
    V.secenek.ilce.forEach(function (o) { if (d.il.indexOf(o.il) >= 0) { var r = satir(o.ad, o.deger, 'ilce'); if (oncekiI.indexOf(o.deger) >= 0) { $('input', r).checked = true; } r.dataset.il = o.il; ig.appendChild(r); } });
    ik.hidden = !d.il.length; ik.classList.toggle('open', !ik.hidden);
    var seciliIlce = secili('ilce'), semtVar = 0;
    V.secenek.semt.forEach(function (o) { if (seciliIlce.indexOf(o.ilce) >= 0) { var r = satir(o.ad, o.deger, 'semt'); if (oncekiS.indexOf(o.deger) >= 0) { $('input', r).checked = true; } sg.appendChild(r); semtVar++; } });
    sk.hidden = !seciliIlce.length; sk.classList.toggle('open', !sk.hidden);
    if (!sk.hidden && !semtVar) { var n = document.createElement('p'); n.className = 'fct-not'; n.textContent = 'Bu ilçede semt kaydı yok.'; sg.appendChild(n); }
  }

  function sayaclar(d) {
    var hepsi = GRUPLAR.concat(['il', 'ilce', 'semt']);
    hepsi.forEach(function (g) {
      var taban = suz(d, g), adet = {};
      taban.forEach(function (m) { ozellik(m, g).forEach(function (x) { adet[x] = (adet[x] || 0) + 1; }); });
      $$('input[name="' + g + '[]"]').forEach(function (i) {
        var r = i.closest('label.fct-row'), n = adet[i.value] || 0, c = $('.fcnt', r);
        if (!c) { c = document.createElement('span'); c.className = 'fcnt'; r.appendChild(c); }
        c.textContent = n; r.hidden = n === 0 && !i.checked; r.style.display = r.hidden ? 'none' : '';
      });
    });
    $$('.sheet-body > .fct').forEach(function (k) {
      var n = $$('input:checked', k).length, dot = $(':scope > .fct-head .fct-dot', k); if (dot) { dot.textContent = n; dot.classList.toggle('on', n > 0); }
      var b = $(':scope > .fct-body > .fct-more', k); if (!b) { return; }
      var xtra = $$(':scope > .fct-body > label.xtra', k).filter(function (r) { return !r.hidden; }).length;
      b.style.display = xtra ? '' : 'none'; if (!k.classList.contains('more-open')) { b.innerHTML = xtra + ' seçenek daha <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>'; }
    });
    $$('.subcat[data-konsept]').forEach(function (a) { var on = d.konsept.indexOf(a.dataset.konsept) >= 0; a.classList.toggle('active', on); });
    var tum = $('.subcat:not([data-konsept])'); if (tum) { tum.classList.toggle('active', !d.konsept.length); }
  }

  function etiketler(d) {
    var k = $('#mklSecili'), l = [];
    GRUPLAR.concat(['il', 'ilce', 'semt']).forEach(function (g) {
      d[g].forEach(function (x) { var i = kutu(g, x); if (i) { l.push({ g: g, d: x, ad: $('.ft', i.closest('label')).textContent }); } });
    });
    var f = $('#filCount'); if (f) { f.textContent = l.length; f.hidden = !l.length; }
    k.hidden = !l.length;
    k.innerHTML = l.map(function (e) { return '<button type="button" class="mkl-etiket" data-g="' + e.g + '" data-d="' + kac(e.d) + '">' + kac(e.ad) + ' <i class="fa-solid fa-xmark" aria-hidden="true"></i></button>'; }).join('') + (l.length ? '<button type="button" class="mkl-etiket-temizle">Tümünü Temizle</button>' : '');
    return l;
  }

  function kart(m) {
    var h = (V.kartlar[m.slug] || '').split('{{kok}}').join(kok);
    var bag = 'href="' + kok + 'mekan/mikla/"';
    var eylem = '<div class="mkl-kart-eylem"><a class="mke-birincil" ' + bag + '>Detayları Gör</a><button type="button" class="mke-ikon" data-haritada="' + m.slug + '" aria-label="Haritada Göster" title="Haritada Göster"><i class="fa-solid fa-map-location-dot" aria-hidden="true"></i></button><a class="mke-ikon" href="' + kok + 'dada-route/?durak=' + m.slug + '" aria-label="Dada Route\'a Ekle" title="Dada Route\'a Ekle"><i class="fa-solid fa-route" aria-hidden="true"></i></a><button type="button" class="mke-ikon" data-lg-gate="" aria-label="Kaydet" title="Kaydet"><i class="fa-regular fa-bookmark" aria-hidden="true"></i></button></div>';
    return h.replace(/<\/article>\s*$/, eylem + '</article>').replace('<article ', '<article data-git="' + kok + 'mekan/mikla/" ');
  }
  function sayfalama(n) {
    var top = Math.max(1, Math.ceil(n / SAYFA)), p = $('#pagi'), s = '';
    if (sayfa > top) { sayfa = top; }
    var dugme = function (i) { return '<button class="pg' + (i === sayfa ? ' active' : '') + '" type="button" data-sayfa="' + i + '"' + (i === sayfa ? ' aria-current="page"' : '') + '>' + i + '</button>'; };
    s += '<button class="pg arrow" type="button" aria-label="Önceki sayfa" data-sayfa="' + (sayfa - 1) + '"' + (sayfa === 1 ? ' disabled' : '') + '><i class="fa-solid fa-chevron-left" aria-hidden="true"></i></button>';
    var son = 0;
    for (var i = 1; i <= top; i++) { if (i === 1 || i === top || Math.abs(i - sayfa) <= 1) { if (son && i - son > 1) { s += '<span class="pg-gap">…</span>'; } s += dugme(i); son = i; } }
    s += '<button class="pg arrow" type="button" aria-label="Sonraki sayfa" data-sayfa="' + (sayfa + 1) + '"' + (sayfa === top ? ' disabled' : '') + '><i class="fa-solid fa-chevron-right" aria-hidden="true"></i></button>';
    s += '<span class="pagi-note" id="pagiNote">' + n + ' mekân · sayfa ' + sayfa + ' / ' + top + '</span>';
    p.innerHTML = s; p.style.display = n ? '' : 'none';
  }
  function bosDurum(l) {
    var e = $('#lstEmpty');
    $('h3', e).textContent = 'Bu seçimle mekân bulunamadı';
    $('p', e).textContent = l.length ? 'Filtre azaltmayı dene: aşağıdaki seçimlerden birini kaldır.' : 'Aramayı kısaltmayı dene.';
    var a = $('.mkl-oneri', e); if (!a) { a = document.createElement('div'); a.className = 'mkl-oneri'; $('p', e).after(a); }
    a.innerHTML = l.slice(0, 6).map(function (x) { return '<button type="button" class="mkl-etiket" data-g="' + x.g + '" data-d="' + kac(x.d) + '">' + kac(x.ad) + ' <i class="fa-solid fa-xmark" aria-hidden="true"></i></button>'; }).join('');
  }

  /* Harita */
  var kap = document.getElementById('mklMapKolon');
  var h = null, isaret = {}, hazir = false, gorunum = 'liste', bekleyen = null;
  function haritaYaz(l) {
    if (!hazir || gorunum !== 'harita') { return; }
    var acik = {}; l.forEach(function (m) { acik[m.slug] = 1; });
    V.mekanlar.forEach(function (m) { var p = isaret[m.slug]; if (p) { p.getElement().style.display = acik[m.slug] ? '' : 'none'; } });
    if (!l.length) { return; }
    var s = new maplibregl.LngLatBounds(); l.forEach(function (m) { s.extend([m.lng, m.lat]); });
    h.fitBounds(s, { padding: 40, maxZoom: 13, duration: 300 });
  }
  function yenile(sifirla) {
    if (sifirla) { sayfa = 1; }
    var d = durum(); altKonumlar(d); d = durum();
    var sonuc = suz(d); sayaclar(d); var l = etiketler(d);
    $('#lstSum').innerHTML = '<b>' + sonuc.length + ' mekân</b> listeleniyor';
    sayfalama(sonuc.length);
    $('#mklGrid').innerHTML = sonuc.slice((sayfa - 1) * SAYFA, sayfa * SAYFA).map(kart).join('');
    gorunumUygula(sonuc.length);
    var e = $('#lstEmpty'); e.style.display = sonuc.length ? 'none' : 'block'; if (!sonuc.length) { bosDurum(l); }
    haritaYaz(sonuc);
  }
  /* Harita görünümü: ilk açılışta kurulur, kart görünümüyle aynı süzülmüş veriyi gösterir */
  function haritaKur() {
    h = window.dgHarita.kur(kap, { center: [32.5, 39.2], zoom: 4.6 });
    h.on('load', function () {
      V.mekanlar.forEach(function (m) { isaret[m.slug] = window.dgHarita.pin(h, m.lng, m.lat, null, m.ad + ' · ' + (m.ilce || '')); });
      hazir = true; haritaYaz(suz(durum())); if (bekleyen) { haritadaGoster(bekleyen); bekleyen = null; }
    });
  }
  function gorunumUygula(n) {
    var harita = gorunum === 'harita';
    $('#mklGrid').style.display = n && !harita ? '' : 'none';
    $('#pagi').style.display = harita ? 'none' : '';
    $('#mklMapWrap').hidden = !harita || !n; $('#mklHaritaNot').hidden = !harita || !n;
  }
  function gorunumSec(v) {
    gorunum = v;
    $$('#mklViewSeg .vs-btn').forEach(function (b) { var on = b.dataset.view === v; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    var sonuc = suz(durum()); gorunumUygula(sonuc.length);
    if (v === 'harita') { if (!h) { haritaKur(); } else { h.resize(); haritaYaz(sonuc); } }
  }
  function haritadaGoster(m) { h.flyTo({ center: [m.lng, m.lat], zoom: 13 }); if (isaret[m.slug]) { isaret[m.slug].togglePopup(); } }


  /* Olaylar */
  document.addEventListener('change', function (e) { if (e.target.closest('.sheet-body') && e.target.type === 'checkbox') { if (e.target.name === 'il[]' && !e.target.checked) { temizleIlce(); } yenile(true); } });
  function temizleIlce() { var il = secili('il'); $$('input[name="ilce[]"]:checked').forEach(function (i) { var r = i.closest('label'); if (il.indexOf(r.dataset.il) < 0) { i.checked = false; } }); }
  document.addEventListener('click', function (e) {
    var hd = e.target.closest('.fct-head'); if (hd) { e.preventDefault(); hd.parentElement.classList.toggle('open'); return; }
    var mr = e.target.closest('.fct-more'); if (mr) { e.preventDefault(); var k = mr.closest('.fct'); var ac = k.classList.toggle('more-open'); if (ac) { mr.innerHTML = 'Daha az göster <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>'; } yenile(); return; }
    var et = e.target.closest('.mkl-etiket'); if (et) { var i = kutu(et.dataset.g, et.dataset.d); if (i) { i.checked = false; temizleIlce(); } yenile(true); return; }
    if (e.target.closest('.mkl-etiket-temizle') || e.target.closest('a.fil-clear') || e.target.closest('#lstEmpty a')) { e.preventDefault(); hepsiniTemizle(); return; }
    var sc = e.target.closest('a.subcat'); if (sc) { e.preventDefault(); if (sc.dataset.konsept) { var kn = kutu('konsept', sc.dataset.konsept); if (kn) { kn.checked = !kn.checked; } } else { $$('input[name="konsept[]"]').forEach(function (x) { x.checked = false; }); } yenile(true); return; }
    var pg = e.target.closest('#pagi [data-sayfa]'); if (pg && !pg.disabled) { sayfa = +pg.dataset.sayfa; yenile(); $('.lst-bar').scrollIntoView({ block: 'start' }); return; }
    var hb = e.target.closest('[data-haritada]'); if (hb) { e.preventDefault(); e.stopPropagation(); var m = V.mekanlar.filter(function (x) { return x.slug === hb.dataset.haritada; })[0]; if (m) { gorunumSec('harita'); if (hazir) { haritadaGoster(m); } else { bekleyen = m; } $('.lst-bar').scrollIntoView({ block: 'start' }); } return; }
    if (e.target.closest('#btnFilter')) { sayfaAc(true); } else if (e.target.closest('#sheetClose') || e.target.id === 'sheetOverlay') { sayfaAc(false); }
    var vs = e.target.closest('#mklViewSeg .vs-btn'); if (vs) { gorunumSec(vs.dataset.view); }
  });
  function sayfaAc(on) { $('#lstSide').classList.toggle('open', on); $('#sheetOverlay').classList.toggle('open', on); document.documentElement.style.overflow = on ? 'hidden' : ''; }
  function hepsiniTemizle() { $$('.sheet-body input:checked').forEach(function (i) { i.checked = false; }); aranan = ''; konumAranan = ''; var q = $('#mklHeroQ'), k = $('#mklHeroKonum'); if (q) { q.value = ''; } if (k) { k.value = ''; } yenile(true); }
  var q = $('#mklHeroQ'), kn = $('#mklHeroKonum'), form = $('#mklHeroSearch');
  if (form) { form.setAttribute('data-yerel', ''); }
  if (q) { q.addEventListener('input', function () { aranan = tr(q.value.trim()); yenile(true); }); }
  if (kn) { kn.addEventListener('input', function () { konumAranan = tr(kn.value.trim()); yenile(true); }); }

  /* Rail: konsept değeri bağdan okunur. Adres parametreleri açılışta seçim olur */
  $$('a.subcat').forEach(function (a) { var m = /[?&]konsept=([^&]+)/.exec(a.getAttribute('href') || ''); if (m) { a.dataset.konsept = decodeURIComponent(m[1]); } });
  new URLSearchParams(location.search).forEach(function (d, g) { var i = kutu(g.replace('[]', ''), d); if (i) { i.checked = true; } });
  yenile(true);
})();
