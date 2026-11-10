/* Keşif Tercihlerim (profil turu H6): gruplu çipler, arama, daha fazla göster, fiyat segmenti ve tek kaydet akışı.
   - Sekme: tıklama, ← → Home End, `#kt-<alan>` derin bağ.
   - Çip `aria-pressed`; "Fark etmez" (`data-tekil`) tek başına seçilir. Fiyat `role=radio`, seçiliye yeniden dokunmak kaldırır.
   - Değişiklik taslakta birikir; alttaki çubuk kaç alanın değiştiğini söyler, tek düğmeyle kaydeder ya da geri alır.
   - Kayıt yalnız bu tarayıcıda (`localStorage` dg-kesif-tercihleri-2); prototipte sunucuya gitmez. */
(function () {
  'use strict';
  var form = document.querySelector('form[data-kesif-tercihleri]'); if (!form) { return; }
  var ANAHTAR = 'dg-kesif-tercihleri-2';
  var bildir = window.prototipBildir || function () {};
  var $$ = function (s, k) { return [].slice.call((k || document).querySelectorAll(s)); };
  var kac = function (t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); };
  var ornek = {}; try { ornek = JSON.parse(document.getElementById('ktOrnek').textContent); } catch (e) { /* yok */ }
  var depoOku = function () { try { return JSON.parse(localStorage.getItem(ANAHTAR)); } catch (e) { return null; } };
  var depoYaz = function (v) { try { localStorage.setItem(ANAHTAR, JSON.stringify(v)); } catch (e) { /* depo kapalı: sayfa içinde kalır */ } };
  var kopya = function (o) { return JSON.parse(JSON.stringify(o)); };
  var kartlar = $$('[data-tercih]', form);
  var alanlar = kartlar.map(function (k) { return k.getAttribute('data-tercih'); });
  var kart = function (a) { return form.querySelector('[data-tercih="' + a + '"]'); };
  var kayitli = depoOku() || kopya(ornek);
  alanlar.forEach(function (a) { kayitli[a] = kayitli[a] || []; });
  var taslak = kopya(kayitli);
  var esit = function (x, y) { return x.length === y.length && x.every(function (v) { return y.indexOf(v) >= 0; }); };

  /* ---- Sekmeler ---- */
  var sekmeler = $$('[role="tab"]', document.querySelector('nav[data-fit-tabs], nav.sekmeler[role="tablist"]'));
  var sekmeAc = function (b, odak) {
    sekmeler.forEach(function (x) {
      var on = x === b, p = document.getElementById(x.getAttribute('aria-controls'));
      x.classList.toggle('aktif', on); x.setAttribute('aria-selected', on ? 'true' : 'false'); x.tabIndex = on ? 0 : -1;
      if (p) { p.hidden = !on; p.classList.toggle('aktif', on); }
    });
    if (odak) { b.focus(); }
    b.scrollIntoView({ block: 'nearest', inline: 'center' });
  };
  sekmeler.forEach(function (b, i) {
    b.addEventListener('click', function () { sekmeAc(b); history.replaceState(null, '', '#' + b.dataset.tab); });
    b.addEventListener('keydown', function (e) {
      var j = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: sekmeler.length - 1 }[e.key];
      if (j === undefined) { return; }
      e.preventDefault(); var h = sekmeler[(j + sekmeler.length) % sekmeler.length]; sekmeAc(h, true); history.replaceState(null, '', '#' + h.dataset.tab);
    });
  });
  var ilk = sekmeler.filter(function (b) { return b.dataset.tab === location.hash.replace('#', ''); })[0];
  if (ilk) { sekmeAc(ilk); }

  /* ---- Durumu ekrana yaz ---- */
  var ciz = function (a) {
    var k = kart(a), d = taslak[a];
    $$('.tercih-cip', k).forEach(function (c) {
      var on = d.indexOf(c.getAttribute('data-deger')) >= 0; c.setAttribute('aria-pressed', on ? 'true' : 'false');
      if (on) { c.hidden = false; }
    });
    $$('.tercih-segment-kalem', k).forEach(function (c, i, hepsi) {
      var on = d.indexOf(c.getAttribute('data-deger')) >= 0; c.setAttribute('aria-checked', on ? 'true' : 'false'); c.classList.toggle('aktif', on);
      c.tabIndex = on || (!d.length && i === 0) ? 0 : -1;
    });
    $$('[data-grup]', k).forEach(function (g) {
      var n = $$('.tercih-cip[aria-pressed="true"]', g).length, s = g.querySelector('[data-grup-sayi]');
      if (s) { s.textContent = n ? n + ' seçili' : ''; }
    });
    var say = k.querySelector('[data-ozet-sayi]'); if (say) { say.textContent = d.length ? d.length + ' seçim' : 'Seçim yok'; }
    var oc = k.querySelector('[data-ozet-cipler]');
    if (oc) { oc.innerHTML = d.map(function (x) { return '<button class="cip hap tercih-secili" type="button" data-kaldir="' + kac(x) + '" aria-label="' + kac(x) + ': seçimi kaldır">' + kac(x) + ' <i class="fa-solid fa-xmark" aria-hidden="true"></i></button>'; }).join(''); }
    var t = k.querySelector('[data-temizle]'); if (t) { t.hidden = !d.length; }
    var ss = document.querySelector('[data-sekme-sayi="' + a + '"]'); if (ss) { ss.textContent = d.length || ''; }
    var sr = document.querySelector('[data-serit="' + a + '"]'); if (sr) { sr.textContent = d.length; }
  };
  var durum = function () {
    var degisen = alanlar.filter(function (a) { return !esit(taslak[a], kayitli[a]); });
    var dolu = document.querySelector('[data-serit="dolu"]'); if (dolu) { dolu.textContent = alanlar.filter(function (a) { return taslak[a].length; }).length + '/' + alanlar.length; }
    var cubuk = form.querySelector('[data-kaydet-cubugu]'), yazi = form.querySelector('[data-kaydet-durum]');
    var once = cubuk.classList.contains('kirli');
    cubuk.classList.toggle('kirli', !!degisen.length);
    /* Çubuk belirip kaybolunca yüzen Mentör düğmesi yeniden ölçsün (mentor-fab.js `resize` dinler) */
    if (once !== !!degisen.length) { setTimeout(function () { window.dispatchEvent(new Event('resize')); }, 320); }
    form.querySelector('[data-kaydet]').disabled = !degisen.length; form.querySelector('[data-vazgec]').disabled = !degisen.length;
    var ad = function (a) { var b = document.querySelector('[data-tab="kt-' + a + '"]'); return b ? b.textContent.replace(/\d+\s*$/, '').trim() : a; };
    yazi.innerHTML = degisen.length
      ? '<i class="fa-solid fa-pen" aria-hidden="true"></i> <span><b>' + degisen.length + ' alanda</b> kaydedilmemiş değişiklik: ' + kac(degisen.map(ad).join(', ')) + '</span>'
      : '<i class="fa-solid fa-circle-check" aria-hidden="true"></i> <span>Tercihlerin kayıtlı</span>';
  };
  var hepsiniCiz = function () { alanlar.forEach(ciz); durum(); };

  /* ---- Etkileşim ---- */
  var degistir = function (a, yeni) { taslak[a] = yeni; ciz(a); durum(); };
  form.addEventListener('click', function (e) {
    var t = e.target.closest('button'); if (!t || !form.contains(t)) { return; }
    var k = t.closest('[data-tercih]'), a = k && k.getAttribute('data-tercih');
    if (t.classList.contains('tercih-cip')) {
      var v = t.getAttribute('data-deger'), d = taslak[a].slice(), i = d.indexOf(v);
      if (i >= 0) { d.splice(i, 1); }
      else if (t.hasAttribute('data-tekil')) { d = [v]; }
      else { var tek = k.querySelector('[data-tekil]'); if (tek) { d = d.filter(function (x) { return x !== tek.getAttribute('data-deger'); }); } d.push(v); }
      degistir(a, d);
    } else if (t.classList.contains('tercih-segment-kalem')) {
      var sv = t.getAttribute('data-deger');
      degistir(a, taslak[a][0] === sv ? [] : [sv]);
    } else if (t.hasAttribute('data-kaldir')) {
      var kv = t.getAttribute('data-kaldir');
      degistir(a, taslak[a].filter(function (x) { return x !== kv; }));
      var ilkCip = k.querySelector('.tercih-cip,.tercih-segment-kalem[tabindex="0"]'); if (ilkCip) { ilkCip.focus(); }
    } else if (t.hasAttribute('data-temizle')) {
      degistir(a, []); var c = k.querySelector('.tercih-cip,.tercih-segment-kalem'); if (c) { c.focus(); }
    } else if (t.hasAttribute('data-fazla-ac')) {
      var g = t.closest('[data-grup]'), acik = t.getAttribute('aria-expanded') !== 'true';
      var fazla = $$('[data-fazla]', g);
      fazla.forEach(function (c) { c.hidden = !acik && c.getAttribute('aria-pressed') !== 'true'; });
      t.setAttribute('aria-expanded', acik ? 'true' : 'false');
      t.querySelector('span').textContent = acik ? 'Daha az göster' : fazla.length + ' seçenek daha göster';
      t.querySelector('i').className = 'fa-solid ' + (acik ? 'fa-chevron-up' : 'fa-chevron-down');
      if (acik && fazla[0]) { fazla[0].focus(); }
    } else if (t.hasAttribute('data-vazgec')) {
      taslak = kopya(kayitli); hepsiniCiz(); bildir('Değişiklikler geri alındı.');
    }
  });
  /* Fiyat segmenti: radyo grubunda ok tuşları */
  form.addEventListener('keydown', function (e) {
    var t = e.target; if (!t.classList || !t.classList.contains('tercih-segment-kalem')) { return; }
    var l = $$('.tercih-segment-kalem', t.parentNode), i = l.indexOf(t);
    var j = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1 }[e.key]; if (j === undefined) { return; }
    e.preventDefault(); var h = l[(j + l.length) % l.length]; h.focus(); h.click();
  });
  /* Arama: Türkçe küçük harfe çevirip içerir; arama varken gruplar açık, eşleşmeyen çip ve boş grup gizli */
  var norm = function (s) { return String(s).toLocaleLowerCase('tr').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ı/g, 'i'); };
  form.addEventListener('input', function (e) {
    if (!e.target.hasAttribute('data-ara')) { return; }
    var k = e.target.closest('[data-tercih]'), q = norm(e.target.value.trim()), toplamEs = 0;
    $$('[data-grup]', k).forEach(function (g) {
      var es = 0, dugme = g.querySelector('[data-fazla-ac]'), acik = dugme && dugme.getAttribute('aria-expanded') === 'true';
      $$('.tercih-cip', g).forEach(function (c) {
        var uy = !q || norm(c.getAttribute('data-deger')).indexOf(q) >= 0;
        c.hidden = q ? !uy : (c.hasAttribute('data-fazla') && !acik && c.getAttribute('aria-pressed') !== 'true');
        if (uy) { es++; }
      });
      g.hidden = !!q && !es; if (dugme) { dugme.hidden = !!q; }
      toplamEs += es;
    });
    var yok = k.querySelector('[data-sonuc-yok]'); if (yok) { yok.hidden = !q || toplamEs > 0; }
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    kayitli = kopya(taslak); depoYaz(kayitli); hepsiniCiz();
    bildir('Tercihlerin kaydedildi. Prototipte yalnız bu tarayıcıda tutulur.');
  });
  window.addEventListener('beforeunload', function (e) { if (alanlar.some(function (a) { return !esit(taslak[a], kayitli[a]); })) { e.preventDefault(); e.returnValue = ''; } });
  hepsiniCiz();
})();
