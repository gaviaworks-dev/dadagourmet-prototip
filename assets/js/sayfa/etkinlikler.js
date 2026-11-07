/* Etkinlikler ve etkinlik detayı. Veri `etkinlik-veri.js`, canlı `/etkinlikler` kayıtlarının kopyası.
   Türkiye önde, Uluslararası ayrı sekme. Randevu kaydı yalnız bu tarayıcıda durur ve Rezervasyonlarım sekmesinde görünür. */
(function () {
  'use strict';
  var V = window.DG_ETKINLIK; if (!V) { return; }
  var kok = document.documentElement.dataset.kok || './', K = window.dgKayit, bildir = window.prototipBildir;
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var tr = function (t) { return String(t).toLocaleLowerCase('tr'); };
  var gunStr = function (d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  var bugun = gunStr(new Date());
  var gecmis = function (e) { return e.bit < bugun; };
  var harman = function (e) { var k = e.f.kategori || []; return k.indexOf('gastronomi-festivalleri') >= 0 || k.indexOf('uretim-hasat-bag-deneyimleri') >= 0; };
  var bul = function (slug) { return V.etkinlikler.filter(function (e) { return e.slug === slug; })[0]; };

  /* Randevu penceresi */
  var acik = null;
  var pencere = function (on) { var m = $('#evRandevu'), o = $('#evRandevuOverlay'); [m, o].forEach(function (x) { x.classList.toggle('show', on); x.classList.toggle('open', on); }); m.toggleAttribute('inert', !on); };
  var randevuAc = function (e) {
    if (!window.dgUye()) { return; }
    acik = e; $('#evRandevuAd').textContent = e.ad + ' · ' + e.yer;
    var g = $('#evGun'), ilk = e.bas > bugun ? e.bas : bugun; g.min = ilk; g.max = e.bit; g.value = ilk; pencere(true);
  };
  var kayitli = function (e) { return K.var('randevu', 'etkinlik-' + e.slug); };
  document.addEventListener('submit', function (ev) {
    if (ev.target.id !== 'evRandevuForm') { return; }
    ev.preventDefault();
    K.ekle('randevu', { id: 'etkinlik-' + acik.slug, ad: acik.ad, yer: acik.yer, gun: $('#evGun').value, kisi: +$('#evKisi').value, not: $('#evNot').value });
    pencere(false); bildir('Randevun Rezervasyonlarım\'a işlendi.'); yenile();
  });

  /* Favori kalbi */
  var kalpBoya = function (b, on) { var i = $('i', b); if (i) { i.className = (on ? 'fa-solid' : 'fa-regular') + ' fa-heart'; } b.setAttribute('aria-pressed', on ? 'true' : 'false'); };

  document.addEventListener('click', function (ev) {
    var t = ev.target; if (!t.closest) { return; }
    var r = t.closest('[data-randevu]');
    if (r) { ev.preventDefault(); var e = bul(r.dataset.randevu || new URLSearchParams(location.search).get('e')); if (e) { randevuAc(e); } return; }
    if (t.closest('#evRandevuKapat,#evRandevuVazgec') || t.id === 'evRandevuOverlay') { pencere(false); return; }
    if (t.closest('[data-etkinlik-oner]')) { var f = $('#fbTab'); if (f) { f.click(); } return; }
    var s = t.closest('.disc-save');
    if (s) {
      ev.preventDefault(); ev.stopPropagation(); if (!window.dgUye()) { return; }
      var kart = s.closest('[data-slug]'), id = 'etkinlik-' + kart.dataset.slug, x = bul(kart.dataset.slug);
      if (K.var('favori', id)) { K.sil('favori', id); kalpBoya(s, false); } else { K.ekle('favori', { id: id, tur: 'Etkinlik', ad: x.ad, mekan: x.yer }); kalpBoya(s, true); bildir('Gurme Favorilerim\'e eklendi.'); }
    }
  }, true);

  /* Kart: canlı DOM. Dip düğmeleri randevu ve geçmiş durumuna göre */
  var kart = function (e) {
    var h = (V.kartlar[e.slug] || '').split('{{kok}}').join(kok);
    var bag = kok + 'etkinlik-detay/?e=' + e.slug;
    var dip = '<div class="disc-card-foot"><a class="btn btn-sm btn-ghost" href="' + bag + '">Detayı incele</a>' + (gecmis(e) ? '<span class="ev-gecmis">Geçmiş etkinlik</span>' : kayitli(e) ? '<span class="ev-gecmis"><i class="fa-solid fa-circle-check" aria-hidden="true"></i> Randevun var</span>' : '<button class="btn btn-sm btn-primary" type="button" data-randevu="' + e.slug + '">Randevu Oluştur</button>') + '</div>';
    h = h.replace(/<div class="disc-card-foot">[\s\S]*<\/div>\s*<\/article>\s*$/, dip + '</article>').replace('<article ', '<article data-slug="' + e.slug + '" ');
    return K.var('favori', 'etkinlik-' + e.slug) ? h.replace('fa-regular fa-heart', 'fa-solid fa-heart') : h;
  };
  var yenile = function () {};

  /* Detay sayfası */
  if ($('#evdHead')) {
    var e = bul(new URLSearchParams(location.search).get('e')) || V.etkinlikler.filter(function (x) { return x.tr && !gecmis(x); })[0] || V.etkinlikler[0];
    document.title = e.ad + ' · Dada Gourmet';
    var g = (e.gorsel || '').split('{{kok}}').join(kok);
    $('.rd-crumb b').textContent = e.ad; $('.evd-stage h1').textContent = e.ad;
    $('.evd-stage').setAttribute('aria-label', e.ad); $('.evd-stage').style.backgroundImage = 'url("' + g + '")'; var px = $('.evd-stage .px-media'); if (px) { px.style.backgroundImage = 'url("' + g + '")'; }
    var rozet = $('.evd-stage .disc-badge'); if (rozet) { rozet.lastChild.nodeValue = ' ' + e.tur; }
    var ciplar = $$('.evd-chip'); ciplar[0].lastChild.nodeValue = ' ' + e.zaman; ciplar[1].lastChild.nodeValue = ' ' + e.yer;
    $('.evd-about p').textContent = e.ozet;
    $$('.evd-row').forEach(function (r) { var b = $('b', r).textContent, s = $('span', r); if (b === 'Tür') { s.textContent = e.tur; } if (b === 'Tarih') { s.textContent = e.zaman; } if (b === 'Yer') { s.textContent = e.yer; } });
    var rb = $('#evdRandevu'); rb.dataset.randevu = e.slug; if (gecmis(e)) { rb.parentNode.removeChild(rb); }
    if (e.bilet) { var bl = $('#evdBilet'); bl.href = e.bilet; bl.hidden = false; }
    var bk = $('.evd-bridge-acts a'); if (bk && e.tr) { bk.href = kok + 'mekanlar/?il=' + encodeURIComponent(tr(e.sehir)); }
    $('#evdDiger').innerHTML = V.etkinlikler.filter(function (x) { return x.slug !== e.slug && !!x.tr === !!e.tr && !gecmis(x); }).slice(0, 3).map(kart).join('');
    return;
  }

  /* Liste */
  var bolge = 'tr', kategori = '', aranan = '', sira = 'onerilen', sayfa = 1, SAYFA = 12, gorunum = 'liste', ay = null;
  var secili = function (n) { return $$('input[name="' + n + '[]"]:checked').map(function (i) { return i.value; }); };
  var tarihUy = function (e, d) {
    if (!d) { return true; }
    if (d === 'gecmis') { return gecmis(e); }
    if (gecmis(e)) { return false; }
    var n = new Date(), gun = function (k) { var x = new Date(n); x.setDate(n.getDate() + k); return gunStr(x); }, kes = function (a, b) { return e.bas <= b && e.bit >= a; }, haftaGun = (n.getDay() + 6) % 7;
    if (d === 'bugun') { return kes(bugun, bugun); }
    if (d === 'yarin') { return kes(gun(1), gun(1)); }
    if (d === 'bu-hafta') { return kes(bugun, gun(6 - haftaGun)); }
    if (d === 'bu-hafta-sonu') { return kes(gun(5 - haftaGun), gun(6 - haftaGun)); }
    if (d === 'gelecek-hafta') { return kes(gun(7 - haftaGun), gun(13 - haftaGun)); }
    if (d === 'bu-ay') { return kes(bugun, gunStr(new Date(n.getFullYear(), n.getMonth() + 1, 0))); }
    return true;
  };
  var uyar = function (e, haric) {
    if (!!e.tr !== (bolge === 'tr')) { return false; }
    if (kategori && (e.f.kategori || []).indexOf(kategori) < 0) { return false; }
    if (aranan && tr(e.ad + ' ' + e.yer).indexOf(aranan) < 0) { return false; }
    var d = ($('input[name="tarih"]:checked') || {}).value;
    if (haric !== 'tarih' && !tarihUy(e, d)) { return false; }
    return ['tur', 'ucret', 'profil', 'diger'].every(function (g) { var s = secili(g); return g === haric || !s.length || (e.f[g] || []).some(function (x) { return s.indexOf(x) >= 0; }); }) &&
      (haric === 'sehir' || !secili('sehir').length || secili('sehir').indexOf(e.sehir) >= 0) && (haric === 'ulke' || !secili('ulke').length || secili('ulke').indexOf(e.ulke) >= 0);
  };
  var dizi = function (l) {
    /* Canlı sıralama listelerinin çekim anı kopyası. Şimdi Açık ve Rezervasyon Uygunluğu canlıda da süzgeçtir: listede olmayan çıkar */
    var canli = (V.sira || {})[sira];
    if (canli) { var yer = {}; canli.forEach(function (s, i) { yer[s] = i; }); return l.filter(function (e) { return e.slug in yer; }).sort(function (a, b) { return yer[a.slug] - yer[b.slug]; }); }
    var tarihSira = function (a, b) { return a.bas < b.bas ? -1 : a.bas > b.bas ? 1 : 0; };
    return l.slice().sort(function (a, b) {
      if (gecmis(a) !== gecmis(b)) { return gecmis(a) ? 1 : -1; }
      if (gecmis(a)) { return -tarihSira(a, b); }
      if (sira === 'onerilen' && harman(a) !== harman(b)) { return harman(a) ? -1 : 1; }
      return tarihSira(a, b);
    });
  };
  var sayfalama = function (n) {
    var top = Math.max(1, Math.ceil(n / SAYFA)), s = ''; if (sayfa > top) { sayfa = top; }
    var ok = function (yon, i, ad) { return '<button class="pg arrow" type="button" aria-label="' + ad + '" data-sayfa="' + i + '"' + ((yon < 0 ? sayfa === 1 : sayfa === top) ? ' disabled' : '') + '><i class="fa-solid fa-chevron-' + (yon < 0 ? 'left' : 'right') + '" aria-hidden="true"></i></button>'; };
    s += ok(-1, sayfa - 1, 'Önceki sayfa');
    for (var i = 1; i <= top; i++) { s += '<button class="pg' + (i === sayfa ? ' active' : '') + '" type="button" data-sayfa="' + i + '">' + i + '</button>'; }
    s += ok(1, sayfa + 1, 'Sonraki sayfa') + '<span class="pagi-note">' + n + ' etkinlik · sayfa ' + sayfa + ' / ' + top + '</span>';
    $('#pagi').innerHTML = s; $('#pagi').style.display = n ? '' : 'none';
  };
  var sayaclar = function () {
    ['tur', 'ucret', 'profil', 'diger', 'sehir', 'ulke'].forEach(function (g) {
      var taban = V.etkinlikler.filter(function (e) { return uyar(e, g); });
      $$('input[name="' + g + '[]"]').forEach(function (i) {
        var n = taban.filter(function (e) { return g === 'sehir' ? e.sehir === i.value : g === 'ulke' ? e.ulke === i.value : (e.f[g] || []).indexOf(i.value) >= 0; }).length;
        var l = i.closest('label'), c = $('.fcnt', l); if (c) { c.textContent = n; }
        var r = g === 'ulke' ? i.closest('.fct-ulke') : l; r.style.display = n === 0 && !i.checked ? 'none' : '';
      });
    });
    var taban = V.etkinlikler.filter(function (e) { return uyar(e, 'tarih'); });
    $$('input[name="tarih"]').forEach(function (i) { var n = taban.filter(function (e) { return tarihUy(e, i.value); }).length, l = i.closest('label'); $('.fcnt', l).textContent = n; l.style.display = n === 0 && !i.checked ? 'none' : ''; });
    $$('.ke-filter .chip').forEach(function (c) {
      var k = c.dataset.kategori; c.classList.toggle('active', (k || '') === kategori); if (!k) { return; }
      c.style.display = V.etkinlikler.some(function (e) { return !!e.tr === (bolge === 'tr') && (e.f.kategori || []).indexOf(k) >= 0; }) ? '' : 'none';
    });
    $$('.sheet-body > .fct').forEach(function (k) { var n = $$('input:checked', k).length, d = $('.fct-dot', k); if (d) { d.textContent = n; d.classList.toggle('on', n > 0); } });
  };
  /* Takvim: canlı `.ev-cal` DOM'u. Ay ızgarası pazartesiden başlar, gün tıklanınca o günün kartları altta açılır */
  var AY = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  var GUN = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  var ayStr = function (d) { return gunStr(d).slice(0, 7); };
  var takvimYaz = function (l) {
    var k = $('#evTakvim'), a = (ay || bugun.slice(0, 7)).split('-'), yil = +a[0], no = +a[1] - 1;
    var ilk = new Date(yil, no, 1), son = new Date(yil, no + 1, 0), bas = new Date(yil, no, 1 - (ilk.getDay() + 6) % 7), bit = new Date(yil, no + 1, 0 + (7 - son.getDay()) % 7);
    var gunler = [], dolu = false;
    for (var d = new Date(bas); d <= bit; d.setDate(d.getDate() + 1)) {
      var g = gunStr(d), o = l.filter(function (e) { return e.bas <= g && e.bit >= g; });
      if (o.length) { dolu = true; }
      gunler.push({ g: g, gun: d.getDate(), ay: d.getMonth(), yil: d.getFullYear(), haftaGun: d.getDay(), disari: d.getMonth() !== no, o: o });
    }
    var ad = function (x) { return String(x.gun).padStart(2, '0') + ' ' + AY[x.ay] + ' ' + x.yil; };
    k.innerHTML = '<div class="ev-cal"><div class="ev-cal-head"><h3>' + AY[no] + ' ' + yil + '</h3><div class="ev-cal-nav"><a href="#" data-ay="' + ayStr(new Date(yil, no - 1, 1)) + '" aria-label="Önceki ay"><i class="fa-solid fa-chevron-left" aria-hidden="true"></i></a><a class="today-link" href="#" data-ay="">Bugün</a><a href="#" data-ay="' + ayStr(new Date(yil, no + 1, 1)) + '" aria-label="Sonraki ay"><i class="fa-solid fa-chevron-right" aria-hidden="true"></i></a></div></div><div class="ev-cal-grid" id="evCalGrid">' +
      ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(function (x) { return '<div class="ev-cal-dow">' + x + '</div>'; }).join('') +
      gunler.map(function (x) { return '<button type="button" class="ev-cal-day' + (x.disari ? ' is-out' : '') + (x.g === bugun ? ' is-today' : '') + (x.o.length ? ' has-events' : '') + '" data-date="' + x.g + '" aria-label="' + ad(x) + (x.o.length ? ', ' + x.o.length + ' etkinlik' : '') + '"><span class="ecd-num">' + x.gun + '</span>' + (x.o.length ? '<span class="ecd-dots">' + x.o.slice(0, 4).map(function () { return '<span class="ecd-dot" aria-hidden="true"></span>'; }).join('') + '</span><span class="ecd-more">' + x.o.length + ' etkinlik</span>' : '') + '</button>'; }).join('') +
      '</div><div class="ev-cal-daylist" id="evCalDayList" hidden>' +
      gunler.filter(function (x) { return x.o.length; }).map(function (x) { return '<div data-daypane="' + x.g + '" hidden><h4>' + ad(x) + ', ' + GUN[x.haftaGun] + '</h4><div class="disc-grid">' + x.o.map(kart).join('') + '</div></div>'; }).join('') +
      '</div>' + (dolu ? '' : '<p class="ev-empty">' + (l.length ? 'Bu ayda gösterilecek etkinlik yok, önceki ve sonraki ay ile gezinebilirsin.' : 'Arama veya filtrelerine uyan etkinlik bulunamadı.') + '</p>') + '</div>';
  };
  /* Harita: canlıda Leaflet, burada K7 gereği MapLibre. Veri ve pin görünümü canlı `#evMap`ten, kümeleme yok */
  var h = null, hHazir = false, pinler = [];
  var kacis = function (t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); };
  var pinYaz = function (l) {
    if (!hHazir) { return; }
    pinler.forEach(function (p) { p.remove(); }); pinler = [];
    var s = new maplibregl.LngLatBounds(), n = 0;
    l.forEach(function (e) {
      if (!e.konum) { return; }
      var el = document.createElement('button'); el.type = 'button'; el.className = 'mkl-vpin ev-pin'; el.setAttribute('aria-label', e.ad);
      el.innerHTML = '<span class="vp"><i class="fa-solid fa-calendar-days" aria-hidden="true"></i></span>';
      var p = new maplibregl.Popup({ offset: 18, closeButton: false }).setHTML('<div class="mkl-popup"><h4>' + kacis(e.ad) + '</h4><div class="mp-meta"><span>' + kacis(e.zaman.split(' – ')[0]) + '</span><span>' + kacis(e.konum.etiket) + '</span></div><a class="btn btn-sm btn-primary" href="' + kok + 'etkinlik-detay/?e=' + e.slug + '">Detayı incele</a></div>');
      pinler.push(new maplibregl.Marker({ element: el }).setLngLat([e.konum.lng, e.konum.lat]).setPopup(p).addTo(h));
      s.extend([e.konum.lng, e.konum.lat]); n++;
    });
    $('#evHaritaBos').hidden = !!n;
    if (n) { h.fitBounds(s, { padding: 40, maxZoom: 12, duration: 300 }); }
  };
  var haritaYaz = function (l) {
    if (h) { h.resize(); pinYaz(l); return; }
    h = window.dgHarita.kur($('#evMap'), { center: [33.5, 39], zoom: 4.6 });
    h.on('load', function () { hHazir = true; pinYaz(dizi(V.etkinlikler.filter(function (e) { return uyar(e); }))); });
  };
  yenile = function (sifir) {
    if (sifir) { sayfa = 1; }
    var l = dizi(V.etkinlikler.filter(function (e) { return uyar(e); })), liste = gorunum === 'liste';
    sayaclar(); sayfalama(l.length);
    $('#lstSum').innerHTML = '<b>' + l.length + ' etkinlik</b> listeleniyor';
    $('#evGrid').innerHTML = liste ? l.slice((sayfa - 1) * SAYFA, sayfa * SAYFA).map(kart).join('') : '';
    $('#evGrid').hidden = !liste; $('#evBos').hidden = !liste || !!l.length; if (!liste) { $('#pagi').style.display = 'none'; }
    $('#evTakvim').hidden = gorunum !== 'takvim'; $('#evHarita').hidden = gorunum !== 'harita';
    if (gorunum === 'takvim') { takvimYaz(l); }
    if (gorunum === 'harita') { haritaYaz(l); }
  };
  var gorunumSec = function (v) {
    gorunum = v; $$('.vs-btn[data-gorunum]').forEach(function (b) { b.classList.toggle('active', b.dataset.gorunum === v); });
    var u = new URL(location.href); if (v === 'liste') { u.searchParams.delete('gorunum'); } else { u.searchParams.set('gorunum', v); } history.replaceState(null, '', u);
    yenile(true);
  };
  $('#evSayTr').textContent = V.etkinlikler.filter(function (e) { return e.tr; }).length;
  $('#evSayDunya').textContent = V.etkinlikler.filter(function (e) { return !e.tr; }).length;
  document.addEventListener('change', function (ev) { if (ev.target.closest('#filterForm')) { yenile(true); } });
  document.addEventListener('click', function (ev) {
    var t = ev.target; if (!t.closest) { return; }
    var vs = t.closest('.vs-btn[data-gorunum]'); if (vs) { ev.preventDefault(); gorunumSec(vs.dataset.gorunum); return; }
    var an = t.closest('[data-ay]'); if (an) { ev.preventDefault(); ay = an.dataset.ay || null; yenile(); return; }
    var gun = t.closest('.ev-cal-day');
    if (gun) {
      var dl = $('#evCalDayList'), pano = $('[data-daypane="' + gun.dataset.date + '"]');
      $$('.ev-cal-day.is-active').forEach(function (x) { x.classList.remove('is-active'); }); gun.classList.add('is-active');
      $$('[data-daypane]').forEach(function (x) { x.hidden = x !== pano; }); dl.hidden = !pano;
      if (pano) { dl.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
      return;
    }
    var b = t.closest('.ev-bolge-sekme');
    if (b) { bolge = b.dataset.bolge; kategori = ''; $$('#filterForm input:checked').forEach(function (i) { i.checked = false; }); $$('.ev-bolge-sekme').forEach(function (x) { var on = x === b; x.classList.toggle('aktif', on); x.setAttribute('aria-selected', on ? 'true' : 'false'); }); yenile(true); return; }
    var c = t.closest('.ke-filter .chip'); if (c) { ev.preventDefault(); kategori = c.dataset.kategori || ''; yenile(true); return; }
    var hd = t.closest('.fct-head'); if (hd) { ev.preventDefault(); hd.parentElement.classList.toggle('open'); return; }
    var ua = t.closest('.fct-ulke-ac'); if (ua) { ev.preventDefault(); ua.closest('.fct-ulke').classList.toggle('open'); return; }
    if (t.closest('a.fil-clear')) { ev.preventDefault(); $$('#filterForm input:checked').forEach(function (i) { i.checked = false; }); kategori = ''; yenile(true); return; }
    var pg = t.closest('#pagi [data-sayfa]'); if (pg && !pg.disabled) { sayfa = +pg.dataset.sayfa; yenile(); $('.lst-bar').scrollIntoView({ block: 'start' }); window.scrollBy(0, -120); return; }
    var sb = t.closest('#sortBtn'); if (sb) { $('#sortDd').classList.toggle('open'); return; }
    var si = t.closest('[data-sira]'); if (si) { ev.preventDefault(); sira = si.dataset.sira; $('#sortCur').textContent = si.textContent.trim(); $$('[data-sira]').forEach(function (x) { x.classList.toggle('active', x === si); }); $('#sortDd').classList.remove('open'); yenile(true); return; }
    var bs = function (on) { $('#lstSide').classList.toggle('open', on); $('#sheetOverlay').classList.toggle('open', on); document.documentElement.style.overflow = on ? 'hidden' : ''; };
    if (t.closest('#btnFilter')) { bs(true); } else if (t.closest('#sheetClose,#sheetApply') || t.id === 'sheetOverlay') { ev.preventDefault(); bs(false); }
  });
  var ara = $('#evArama input[name="q"]'); ara.addEventListener('input', function () { aranan = tr(ara.value.trim()); yenile(true); });
  var q = new URLSearchParams(location.search); if (q.get('bolge') === 'dunya') { var d = $('[data-bolge="dunya"]'); if (d) { d.click(); } }
  if (/^(takvim|harita)$/.test(q.get('gorunum') || '')) { gorunumSec(q.get('gorunum')); } else { yenile(true); }
})();
