/* Aranabilir seçim ve bağımlı il / ilçe (il-ilce ajanı, 11 Kas; Beyar: il ve ilçe serbest metin değil, aranabilir ve bağımlı liste).
   TEK bileşen: İşletme Paneli (Mekân Profili, başvuru formu) ve site kabuğu (Mekân Öner penceresi) aynı dosyayı yükler.
   Yerel <select> değer taşıyıcı olarak DURUR: name, required, form gönderimi, sayfa betiğinin `el.value = …` ataması ve form.reset()
   bozulmaz. Üstünde tek satırlık combobox (WAI-ARIA APG "editable combobox with list autocomplete"): yazdıkça kanon `.acilir-yuzey`
   içindeki `role=listbox` süzülür, seçim yerel select'e yazılır ve `input` + `change` olayı yayılır. Biçim kanon: girdi select'in kendi
   sınıfını alır (panelde `.alan-secim`), yüzey `.acilir-yuzey` + `.acilir-kalem`, boş sonuç `.acilir-bos`, hata `.alan-hata`.
   İşaretler
     select[data-ara-secim]                     aranabilir seçim
     select[data-il-secim]                      il; seçenekleri boşsa `DG_IL_ILCE`den dolar (assets/js/il-ilce-veri.js)
     select[data-ilce-icin="<il select id>"]    ilçe; il değişince o ilin ilçeleri gelir ve değer sıfırlanır; il yokken kapalı
   Dil Gastro kanonu (g-odemelerim ftIl/ftIlce): "İl seç", "Önce il seç", yardım "İl seçilince açılır.", hata "İl seç." Gastro'da ilçe
   serbest metin ("İlçeyi yaz."); burada tam listeden seçim olduğu için "İlçe seç.".
   Arama Türkçe büyük/küçük harf ve aksan duyarsız (İ/i, I/ı aynı; "uskudar" → Üsküdar); başından eşleşen önce, sonra kelime başı, sonra içinde.
   Klavye: ↓/↑ gezin (kapalıyken açar), Home/End, Enter seçer, Esc listeyi kapatır (pencereyi kapatmaz) ve yazılanı geri alır,
   Tab yazılmış aramada vurgulu kalemi seçip ilerler. Yüzey açılırken içinde bulunduğu kaydırma kabına (pencere gövdesi) ve görünür
   alana göre aşağı ya da yukarı açılır, boyu sığdığı kadar (kanon azamisi 420px) kısalır: pencere içinde kesilmez. */
(function () {
  'use strict';
  if (window.dgAraSecim) { return; }
  var DEGER = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
  var esc = function (t) { return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); };
  /* Türkçe katlama: önce tr küçük harf (İ → i, I → ı), sonra aksan sökülür, ı → i */
  var katla = function (s) { return String(s || '').toLocaleLowerCase('tr').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ı/g, 'i').trim(); };
  var veri = function () { return window.DG_IL_ILCE || []; };
  var ilceleri = function (il) { var k = katla(il), x = veri().filter(function (r) { return katla(r[0]) === k; })[0]; return x ? x[1] : []; };
  var kayit = function (sel) { return sel && sel._araSecim; };

  /* Satır içi hata metni (Gastro kanon dili) */
  var hataMetni = function (sel) {
    var il = sel.dataset.ilceIcin && document.getElementById(sel.dataset.ilceIcin);
    if (il) { return il.value ? 'İlçe seç.' : 'Önce il seç.'; }
    if (sel.hasAttribute('data-il-secim')) { return 'İl seç.'; }
    var y = sel.querySelector('option[value=""]'); return (y ? y.textContent.trim() : 'Seç') + '.';
  };

  function kur(sel) {
    if (!sel || sel._araSecim || !sel.id) { return; }
    /* İl seçenekleri yoksa listeden */
    if (sel.hasAttribute('data-il-secim') && !sel.querySelector('option:not([value=""])')) {
      var bas = sel.querySelector('option[value=""]');
      sel.innerHTML = (bas ? bas.outerHTML : '<option value="">İl seç</option>') + veri().map(function (r) { return '<option>' + esc(r[0]) + '</option>'; }).join('');
    }
    var k = { sel: sel, acik: false, vurgu: -1, liste: [], gorunen: [], son: sel.value };
    sel._araSecim = k;
    var kap = document.createElement('div'); kap.className = 'ara-secim acilir-kap';
    sel.parentNode.insertBefore(kap, sel); kap.appendChild(sel);
    var g = document.createElement('input');
    g.type = 'text'; g.id = sel.id + 'Ara'; g.className = ((sel.className || '') + ' ara-secim-girdi').trim();
    g.setAttribute('role', 'combobox'); g.setAttribute('aria-autocomplete', 'list'); g.setAttribute('aria-expanded', 'false');
    g.setAttribute('autocomplete', 'off'); g.setAttribute('autocapitalize', 'off'); g.setAttribute('spellcheck', 'false');
    var y = document.createElement('ul'); y.className = 'acilir-yuzey'; y.id = sel.id + 'Liste'; y.setAttribute('role', 'listbox'); y.hidden = true;
    g.setAttribute('aria-controls', y.id);
    var h = document.createElement('p'); h.className = 'alan-hata'; h.id = sel.id + 'Hata'; h.setAttribute('role', 'alert'); h.hidden = true;
    h.innerHTML = '<i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i> <span></span>';
    kap.appendChild(g); kap.appendChild(y); kap.parentNode.insertBefore(h, kap.nextSibling);
    /* Etiket görünen girdiyi adlandırır; yerel select ekran okuyucudan ve sekme sırasından çıkar */
    var et = document.querySelector('label[for="' + sel.id + '"]');
    if (et) { et.htmlFor = g.id; y.setAttribute('aria-label', et.textContent.replace('*', '').trim()); }
    var tarif = [sel.getAttribute('aria-describedby'), h.id].filter(Boolean).join(' ');
    g.setAttribute('aria-describedby', tarif);
    sel.tabIndex = -1; sel.setAttribute('aria-hidden', 'true');
    k.g = g; k.y = y; k.h = h; k.kap = kap;

    /* Sayfa betiği `sel.value = …` yazınca (formYaz, doldurF) görünen girdi ve bağlı ilçe tazelenir. Tam eşleşme yoksa
       katlanmış eşleşme seçilir (eski serbest metin kayıt "kadikoy" → Kadıköy) */
    Object.defineProperty(sel, 'value', {
      configurable: true,
      get: function () { return DEGER.get.call(this); },
      set: function (v) {
        DEGER.set.call(this, v);
        if (v && !DEGER.get.call(this)) { var e = [].filter.call(this.options, function (o) { return o.value && katla(o.value) === katla(v); })[0]; if (e) { DEGER.set.call(this, e.value); } }
        degisti(this);
      }
    });
    sel.addEventListener('focus', function () { g.focus(); if (sel.required && !sel.value) { hataGoster(k); } });
    sel.addEventListener('invalid', function (e) {
      e.preventDefault(); hataGoster(k);
      var f = sel.form, ilkHata = f && [].filter.call(f.elements, function (x) { return x.willValidate && !x.validity.valid; })[0];
      if (ilkHata === sel) { g.focus(); }
    });
    if (sel.form && !sel.form._araSecimSifir) {
      sel.form._araSecimSifir = true;
      sel.form.addEventListener('reset', function (e) { var f = e.target; setTimeout(function () { [].forEach.call(f.querySelectorAll('select'), function (s) { var x = kayit(s); if (x) { degisti(s); hataGizle(x); } }); }, 0); });
    }
    /* Panel kilidi (`isletme-panel.js` kilit) girdi ve select'in `disabled`ını toplu yazar; kapalı durum yeniden hesaplanır */
    if (window.MutationObserver) {
      var mo = new MutationObserver(function () { esitle(k); });
      mo.observe(sel, { attributes: true, attributeFilter: ['disabled', 'required'] });
      mo.observe(g, { attributes: true, attributeFilter: ['disabled'] });
    }

    /* Arama metni form değeri değildir: sayfanın "kaydedilmemiş değişiklik" dinleyicisine gitmez */
    g.addEventListener('input', function (e) { e.stopPropagation(); ac(k, g.value); });
    g.addEventListener('blur', function () { kapat(k, true); });
    g.addEventListener('keydown', function (e) { tus(k, e); });
    y.addEventListener('mousedown', function (e) { e.preventDefault(); });
    y.addEventListener('click', function (e) { var li = e.target.closest('[role="option"]'); if (li) { sec(k, li.dataset.deger); } });

    listeTazele(k);
    var ilSel = sel.dataset.ilceIcin && document.getElementById(sel.dataset.ilceIcin);
    if (ilSel && ilSel.value && !sel.querySelector('option:not([value=""])')) { ilceKur(sel, ilSel.value, sel.value); }
    esitle(k);
  }

  function listeTazele(k) {
    k.liste = [].filter.call(k.sel.options, function (o) { return o.value !== ''; }).map(function (o) { return { v: o.value, t: o.textContent.trim(), n: katla(o.textContent) }; });
  }
  /* İlçe seçeneklerini ilin listesiyle kurar; değer korunmaz (il değişince ilçe sıfırlanır) */
  function ilceKur(ilce, il, koru) {
    var l = il ? ilceleri(il) : [];
    ilce.innerHTML = '<option value="">' + (il ? 'İlçe seç' : 'Önce il seç') + '</option>' + l.map(function (x) { return '<option>' + esc(x) + '</option>'; }).join('');
    if (koru) { DEGER.set.call(ilce, koru); }
    var k = kayit(ilce); if (k) { listeTazele(k); esitle(k); }
  }
  function degisti(sel) {
    var k = kayit(sel); if (!k) { return; }
    if (sel.hasAttribute('data-il-secim') && k.son !== sel.value) {
      [].forEach.call(document.querySelectorAll('select[data-ilce-icin="' + sel.id + '"]'), function (x) { ilceKur(x, sel.value, ''); });
    }
    k.son = sel.value; esitle(k);
  }
  function esitle(k) {
    var sel = k.sel, g = k.g, o = sel.options[sel.selectedIndex];
    var il = sel.dataset.ilceIcin && document.getElementById(sel.dataset.ilceIcin);
    var kapali = sel.disabled || (il ? !il.value : false);
    if (g.disabled !== kapali) { g.disabled = kapali; }
    var bos = sel.querySelector('option[value=""]');
    g.placeholder = bos ? bos.textContent.trim() : '';
    if (!k.acik) { g.value = sel.value && o ? o.textContent.trim() : ''; }
    g.setAttribute('aria-required', sel.required ? 'true' : 'false');
    if (sel.value || kapali) { hataGizle(k); }
  }
  /* Hata kanonun iki kipiyle: panel (admin.css K10) `hidden` + `.alan.hatali`, site `.goster` + girdide `.hatali` */
  function hataDurum(k, var_) {
    k.h.hidden = !var_; k.h.classList.toggle('goster', var_); k.g.classList.toggle('hatali', var_);
    var a = k.kap.closest('.alan'); if (a) { a.classList.toggle('hatali', var_); }
    if (var_) { k.g.setAttribute('aria-invalid', 'true'); } else { k.g.removeAttribute('aria-invalid'); }
  }
  function hataGoster(k) { k.h.querySelector('span').textContent = hataMetni(k.sel); hataDurum(k, true); }
  function hataGizle(k) { hataDurum(k, false); }

  /* Süzme: başından eşleşen, kelime başında eşleşen, içinde geçen; her grup kendi içinde Türkçe sırada (kaynak sırası) */
  function suz(k, q) {
    var n = katla(q); if (!n) { return k.liste.slice(); }
    var a = [], b = [], c = [];
    k.liste.forEach(function (x) { var i = x.n.indexOf(n); if (i === 0) { a.push(x); } else if (i > 0 && /[\s\-(.]/.test(x.n.charAt(i - 1))) { b.push(x); } else if (i > 0) { c.push(x); } });
    return a.concat(b, c);
  }
  function ciz(k, q) {
    k.gorunen = suz(k, q);
    var secili = k.sel.value;
    if (!k.gorunen.length) {
      k.y.innerHTML = '<li class="acilir-bos" role="presentation">“' + esc(q) + '” ' + k.liste.length + ' kayıtta bulunamadı</li>';
    } else {
      k.y.innerHTML = k.gorunen.map(function (x, i) { var s = x.v === secili; return '<li class="acilir-kalem' + (s ? ' aktif' : '') + '" role="option" id="' + k.y.id + '-' + i + '" data-deger="' + esc(x.v) + '" aria-selected="' + s + '">' + esc(x.t) + '</li>'; }).join('');
    }
    var si = -1; k.gorunen.forEach(function (x, i) { if (x.v === secili) { si = i; } });
    vurgula(k, q ? (k.gorunen.length ? 0 : -1) : si);
  }
  function vurgula(k, i) {
    var eski = k.y.querySelector('.vurgu'); if (eski) { eski.classList.remove('vurgu'); }
    k.vurgu = i;
    var li = i > -1 ? document.getElementById(k.y.id + '-' + i) : null;
    if (li) { li.classList.add('vurgu'); k.g.setAttribute('aria-activedescendant', li.id); kaydir(k.y, li); } else { k.g.removeAttribute('aria-activedescendant'); }
  }
  function kaydir(y, li) { var u = li.offsetTop, a = u + li.offsetHeight; if (u < y.scrollTop) { y.scrollTop = u - 6; } else if (a > y.scrollTop + y.clientHeight) { y.scrollTop = a - y.clientHeight + 6; } }
  /* Yüzeyin yeri: en yakın kaydırma kabı ve görünür alan içinde aşağıda yer varsa aşağı, yoksa yukarı */
  function yerlestir(k) {
    var r = k.g.getBoundingClientRect(), vv = window.visualViewport;
    var ust = vv ? vv.offsetTop : 0, alt = vv ? vv.offsetTop + vv.height : window.innerHeight;
    for (var e = k.kap.parentElement; e && e !== document.body && e !== document.documentElement; e = e.parentElement) {
      var s = getComputedStyle(e);
      if (/(auto|scroll|hidden|clip)/.test(s.overflowY)) { var er = e.getBoundingClientRect(); ust = Math.max(ust, er.top); alt = Math.min(alt, er.bottom); break; }
    }
    var asagi = alt - r.bottom - 14, yukari = r.top - ust - 14, azami = Math.min(420, Math.round(window.innerHeight * (window.innerWidth <= 720 ? 0.6 : 1)));
    var yon = asagi >= Math.min(220, azami) || asagi >= yukari;
    k.y.classList.toggle('yukari', !yon);
    k.y.style.maxHeight = Math.max(132, Math.min(azami, yon ? asagi : yukari)) + 'px';
  }
  function ac(k, q) {
    if (k.g.disabled) { return; }
    if (!k.acik) { k.acik = true; k.y.hidden = false; k.g.setAttribute('aria-expanded', 'true'); k.kap.classList.add('acik'); yerlestir(k); if (!q) { k.g.select(); } }
    ciz(k, q);
  }
  function kapat(k, geriAl) {
    if (!k.acik) { if (geriAl) { esitle(k); } return; }
    k.acik = false; k.y.hidden = true; k.g.setAttribute('aria-expanded', 'false'); k.g.removeAttribute('aria-activedescendant'); k.kap.classList.remove('acik');
    if (geriAl) { esitle(k); }
  }
  function sec(k, v) {
    var sel = k.sel, once = sel.value;
    kapat(k, false);
    sel.value = v;
    esitle(k); hataGizle(k);
    if (once !== sel.value) { sel.dispatchEvent(new Event('input', { bubbles: true })); sel.dispatchEvent(new Event('change', { bubbles: true })); }
  }
  function tus(k, e) {
    var n = k.gorunen.length, q = k.g.value;
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); if (!k.acik) { ac(k, ''); } else if (n) { vurgula(k, Math.min(n - 1, k.vurgu + 1)); } break;
      case 'ArrowUp': e.preventDefault(); if (!k.acik) { ac(k, ''); } else if (n) { vurgula(k, Math.max(0, k.vurgu - 1)); } break;
      case 'Home': case 'End': if (k.acik && n) { e.preventDefault(); vurgula(k, e.key === 'Home' ? 0 : n - 1); } break;
      case 'Enter': if (k.acik) { e.preventDefault(); if (k.vurgu > -1 && k.gorunen[k.vurgu]) { sec(k, k.gorunen[k.vurgu].v); } } break;
      case 'Escape': if (k.acik) { e.preventDefault(); e.stopPropagation(); kapat(k, true); } else if (q !== (k.sel.value ? k.sel.options[k.sel.selectedIndex].textContent.trim() : '')) { e.preventDefault(); e.stopPropagation(); esitle(k); } break;
      case 'Tab': if (k.acik) { var yazildi = q && q !== (k.sel.value ? k.sel.options[k.sel.selectedIndex].textContent.trim() : ''); if (yazildi && k.vurgu > -1 && k.gorunen[k.vurgu]) { sec(k, k.gorunen[k.vurgu].v); } else { kapat(k, true); } } break;
      default: break;
    }
  }

  /* Tıklama listeyi açar, kapatmaz (kanon admin-kit §coklu-secim: "metin kutusuna tıklamak açma/kapama eylemi değildir"; kapanış dışarı
     tıklama, Esc ve odak çıkışıyla). Sekmeyle gelince liste kendiliğinden açılmaz (↓ ya da yazmak açar). Panelin genel açılır sürücüsü
     (`panel/panel.js`, salt okunur kit) `aria-expanded` + `aria-controls` taşıyan her öğenin tıklamasını aç/kapa diye çevirir; dinleyici
     belge düzeyinde ve ondan sonra yüklendiği için sonra koşar ve listeyi yeniden açar (kanonun aynı "üstüne binme" kararı) */
  document.addEventListener('click', function (e) {
    var g = e.target.closest ? e.target.closest('.ara-secim-girdi') : null, k = g && kayit(g.parentNode.querySelector('select'));
    if (!k || g.disabled) { return; }
    if (k.acik && k.y.hidden) { k.acik = false; }
    if (!k.acik) { ac(k, ''); }
  });

  function kurHepsi(kok) { [].forEach.call((kok || document).querySelectorAll('select[data-ara-secim]'), kur); }
  window.dgAraSecim = { kur: kurHepsi, katla: katla };
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', function () { kurHepsi(); }); } else { kurHepsi(); }
  window.addEventListener('resize', function () { [].forEach.call(document.querySelectorAll('.ara-secim.acik > select'), function (s) { var k = kayit(s); if (k) { yerlestir(k); } }); });
  if (window.visualViewport) { window.visualViewport.addEventListener('resize', function () { [].forEach.call(document.querySelectorAll('.ara-secim.acik > select'), function (s) { var k = kayit(s); if (k) { yerlestir(k); } }); }); }
})();
