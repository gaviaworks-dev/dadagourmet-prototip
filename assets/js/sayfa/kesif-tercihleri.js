/* Keşif Tercihlerim (canlı /hesabim/kesif-tercihleri):
   - "Yanıtı kaydet" yalnız kendi sekmesinin yanıtını, "Yanıtı temizle" yalnız o alanı bu tarayıcıya yazar; rozet ve özet güncellenir.
   - `data-cip-suzgec` seçimi çipleri `data-grup`a göre daraltır (canlı site.js'teki gibi işaretli durum korunur).
   - `data-cip-aralik` kaydırıcısı etiketini günceller; prototipte Fiyat çipleriyle eşlenir. */
(function () {
  'use strict';
  var form = document.querySelector('form[data-kesif-tercihleri]'); if (!form) { return; }
  var ANAHTAR = 'dg-kesif-tercihleri';
  var bildir = window.prototipBildir || function () {};
  var oku = function () { try { return JSON.parse(localStorage.getItem(ANAHTAR)) || {}; } catch (e) { return {}; } };
  var yaz = function (v) { try { localStorage.setItem(ANAHTAR, JSON.stringify(v)); } catch (e) { /* depo kapalı: yalnız bu sayfada kalır */ } };

  /* Çip grubu kartın `data-alan-kart`ından bulunur: derleyici `data-alan` değerindeki "mekan"ı metin sanıp "mekân" yapar */
  var grup = function (alan) { return form.querySelector('[data-alan-kart="' + alan + '"] .cipler'); };
  var tekMi = function (alan) { var g = grup(alan); return !!(g && g.getAttribute('data-tip') === 'tek'); };
  var girdiler = function (alan) { var g = grup(alan); return g ? [].slice.call(g.querySelectorAll('input')) : []; };
  var deger = function (alan) {
    var secili = girdiler(alan).filter(function (i) { return i.checked; }).map(function (i) { return i.value; });
    return tekMi(alan) ? (secili[0] || '') : secili;
  };
  var dolu = function (d) { return !(d == null || d === '' || (Array.isArray(d) && !d.length)); };
  var ozet = function (d) { return dolu(d) ? (Array.isArray(d) ? d.join(', ') : d) : 'Seçim yok'; };

  var aralik = form.querySelector('[data-cip-aralik]');
  var aralikEtiket = function () {
    if (!aralik || !aralik.list) { return; }
    var o = [].filter.call(aralik.list.options, function (x) { return x.value === aralik.value; })[0];
    var metin = o ? o.label : '';
    var hedef = document.getElementById(aralik.getAttribute('aria-describedby'));
    var e = hedef && hedef.querySelector('[data-aralik-etiket]'); if (e) { e.textContent = metin; }
    aralik.setAttribute('aria-valuetext', metin);
  };
  var aralikEsle = function () {
    if (!aralik) { return; }
    var l = girdiler(aralik.getAttribute('data-cip-aralik')), i = l.map(function (x) { return x.checked; }).indexOf(true);
    aralik.value = String(i + 1); aralikEtiket();
  };

  var goster = function (alan, d) {
    var kart = form.querySelector('[data-alan-kart="' + alan + '"]'); if (!kart) { return; }
    var on = dolu(d);
    [].forEach.call(kart.querySelectorAll('[data-alan-rozet],[data-alan-durum]'), function (r) { r.className = 'rozet ' + (on ? 'dolu' : 'pasif'); r.textContent = on ? 'Dolu' : 'Boş'; });
    var s = kart.querySelector('[data-alan-satir]'); if (s) { s.textContent = on ? ozet(d) : 'Henüz yanıtlamadın'; }
    var o = kart.querySelector('[data-alan-ozet]'); if (o) { o.textContent = ozet(d); }
    var ornek = kart.querySelector('[data-alan-ornek]'); if (ornek) { ornek.remove(); }
  };
  var uygula = function (alan, d) {
    var l = Array.isArray(d) ? d : [d];
    girdiler(alan).forEach(function (i) { i.checked = l.indexOf(i.value) > -1; });
    goster(alan, d);
  };

  /* Bu tarayıcıda daha önce kaydedilen yanıtlar örnek seçimlerin yerine geçer */
  var kayit = oku();
  Object.keys(kayit).forEach(function (alan) { if (grup(alan)) { uygula(alan, kayit[alan]); } });
  aralikEsle();

  if (aralik) {
    aralik.addEventListener('input', function () {
      var l = girdiler(aralik.getAttribute('data-cip-aralik')), n = parseInt(aralik.value, 10) || 0;
      l.forEach(function (x, i) { x.checked = i === n - 1; });
      aralikEtiket();
    });
    var fg = grup(aralik.getAttribute('data-cip-aralik')); if (fg) { fg.addEventListener('change', aralikEsle); }
  }

  [].forEach.call(form.querySelectorAll('[data-cip-suzgec]'), function (s) {
    var g = grup(s.getAttribute('data-cip-suzgec')); if (!g) { return; }
    var cipler = [].slice.call(g.querySelectorAll('.cip'));
    var hedef = document.getElementById(s.getAttribute('aria-describedby'));
    var sayac = hedef && hedef.querySelector('[data-suzgec-sayac]');
    s.addEventListener('change', function () {
      var n = 0;
      cipler.forEach(function (c) { var on = !s.value || c.getAttribute('data-grup') === s.value; c.hidden = !on; if (on) { n += 1; } });
      if (sayac) { sayac.textContent = n + ' / ' + cipler.length; }
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var d = e.submitter; if (!d) { return; }
    var alan = d.value, temizle = d.name === 'temizle_alan';
    if (!grup(alan)) { return; }
    if (temizle) { girdiler(alan).forEach(function (i) { i.checked = false; }); if (aralik && aralik.getAttribute('data-cip-aralik') === alan) { aralikEsle(); } }
    var v = deger(alan);
    var k = oku(); k[alan] = v; yaz(k);
    goster(alan, v);
    bildir('Keşif tercihlerin kaydedildi. Prototipte yalnız bu tarayıcıda tutulur.');
  });
})();
