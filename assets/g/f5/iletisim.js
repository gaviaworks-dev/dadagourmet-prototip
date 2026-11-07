/* /iletisim — Revize 5 · madde 46d/46e.
 *
 * Yükleyen kabuk: `KabukKimligi::ekranBetigi()` rota adından (`iletisim`)
 * bu dosyayı `defer` ile basar; türetilmiş Blade'e `<script>` eklenmez.
 * Seçici modülü (`/gastro/coklu-secim.js`) sürümlü adresiyle `#konu`nun
 * `data-secici-betik`inden yüklenir.
 *
 * 46e · "Konu" kanonun tekli seçicisine döner: kanonda ayrı bir tekli özel
 *   seçici yok; lead kararıyla `GastroCokluSecim` `max:1` ile kullanılır
 *   (`/gastro/coklu-secim.js`e dokunulmadan). Gerçek `<select name="konu">`
 *   formda kalır ve değeri taşır; seçici yalnız onu yazar.
 *
 * 46d · Ülke kodlu telefon: kanonun ülke kodu seçicisinin davranışı
 *   (`assets/js/fit-ulke.js` · FIT_ULKE — ↑ ↓ gezinir · Enter seçer · Esc
 *   kapatır ve odak düğmeye döner · yazmak süzer · dışarı tıklayınca kapanır).
 *   Liste sunucudan basılı (`UlkeKodlari`), burada yalnız sürülür.
 *   Maske ve anlık denetim (Revize 6 · madde 65) ortak dosyada:
 *   `/gastro/telefon-alani.js` (`GastroTelefonAlani`) — Çözüm Merkezi'nin
 *   öneri formu da aynısını kullanır. Sürümlü adresiyle kökün
 *   `data-telefon-betik`inden yüklenir (konu seçicisinin kalıbı; türetilmiş
 *   Blade'e `<script>` eklenmez).
 */
(function () {
  'use strict';
  /* Aşama 2 · B (ajan-b4): EN sayfada kabuk sözlüğü (`KabukSozlugu`, <script type="application/json" data-l-js-kabuk>) ve
     sayfanın kendi sözlüğü (<main data-l-js>) basılı; ikisi de okunur. TR'de sözlük yok → TR yedek AYNEN döner. */
  var dmLk = window.dmLk = window.dmLk || function (k, tr, p) {
    var s = null, els = document.querySelectorAll('[data-l-js-kabuk], [data-l-js]');
    for (var i = 0; i < els.length && s === null; i++) {
      try { var a = els[i].getAttribute('data-l-js'); var o = JSON.parse(a ? a : els[i].textContent); if (o && typeof o[k] === 'string') s = o[k]; } catch (e) { /* bozuk sözlük → TR yedek */ }
    }
    var kayitli = s !== null;
    if (s === null) s = tr;
    /* Çoğul (EN): sözlük değeri 'tekil|çoğul' — sayı p.sayi, yoksa p.toplam, yoksa p.n; 1 → ilk biçim, gerisi son biçim; RU (üç kategorili dil, 20 Eki): 'bir|az|çok', kesir → az. */
    if (kayitli && s.indexOf('|') >= 0) { var cn = p ? [p.sayi, p.toplam, p.n].filter(function (x) { return x !== undefined && x !== null && x !== ''; })[0] : undefined; var cb = s.split('|'); var cbi = (function (x) { if (cb.length < 3 || typeof document === 'undefined' || typeof Intl === 'undefined') return -1; var pr = new Intl.PluralRules(document.documentElement.lang || 'tr'); if (pr.resolvedOptions().pluralCategories.indexOf('few') < 0) return -1; x = Math.abs(Number(x)) || 0; if (x !== Math.floor(x)) return 1; var k = pr.select(x); return k === 'one' ? 0 : (k === 'few' ? 1 : 2); })(cn); s = cbi >= 0 ? cb[cbi] : (Number(cn) === 1 ? cb[0] : cb[cb.length - 1]); }
    if (!p) return s;
    /* Laravel'in kuralı: adlar uzundan kısaya, doğrudan değiştirilir (`:minpx` içinde `:min` dolar). */
    Object.keys(p).sort(function (a, b) { return b.length - a.length; }).forEach(function (n) { s = s.split(':' + n).join(String(p[n])); });
    return s;
  };
  var d = document;

  var KONU_MESAJ = dmLk('kabuk_js.iletisim.konu_sec_hata', 'Konu seç.');

  function kucuk(x) { return String(x).toLocaleLowerCase('tr'); }

  /* Alanın hata satırı: sunucunun bastığı `fk-err` varsa o, yoksa aynı sınıfla üretilir. */
  function hataYaz(alan, girdi, id, metin) {
    var kap = alan.closest('.fk-field');
    var satir = d.getElementById(id);
    if (!metin) {
      if (satir) satir.remove();
      if (kap) kap.classList.remove('has-error');
      girdi.removeAttribute('aria-invalid');
      return;
    }
    if (!satir) {
      satir = d.createElement('span');
      satir.className = 'fk-err';
      satir.id = id;
      satir.setAttribute('role', 'alert');
      alan.insertAdjacentElement('afterend', satir);
    }
    satir.textContent = metin;
    if (kap) kap.classList.add('has-error');
    girdi.setAttribute('aria-invalid', 'true');
    var bagli = (girdi.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
    if (bagli.indexOf(id) < 0) { bagli.push(id); girdi.setAttribute('aria-describedby', bagli.join(' ')); }
  }

  /* ---- 46e · KONU ------------------------------------------------------ */
  function konuKur() {
    var secim = d.getElementById('konu');
    if (!secim || !window.GastroCokluSecim) return;
    var api = window.GastroCokluSecim(secim, {
      max: 1, hepsi: true, placeholder: dmLk('kabuk_js.iletisim.konu_sec', 'Konu seç'),
      hint: dmLk('kabuk_js.iletisim.konu_ipucu', 'Listeden bir konu seç; değiştirmek için seçimi kaldır.'),
      items: function () {
        return Array.prototype.filter.call(secim.options, function (o) { return o.value; })
          .map(function (o) { return { value: o.value, label: o.textContent.trim() }; });
      },
      write: function (degerler) {
        secim.value = degerler[0] || '';
        if (secim.value) hataYaz(api.root, api.input, 'konu-hata', '');
      }
    });
    /* Kapalı alan sayfanın öbür alanlarıyla aynı görünür (donörün `fk-select`i). */
    api.input.classList.add('fk-input', 'fk-select');
    if (secim.getAttribute('aria-invalid') === 'true') {
      api.input.setAttribute('aria-invalid', 'true');
      api.input.setAttribute('aria-describedby', api.input.getAttribute('aria-describedby') + ' konu-hata');
    }
    /* Sunucudan dönen seçim (old() ya da veri silme talebi) seçiciye geçer. */
    if (secim.value) api.set([secim.value]);
    /* Gizli `<select required>` tarayıcının balonunu gösteremez; boş gönderim
       alanın altında yazılı hatayla durur, odak seçiciye gider. */
    secim.addEventListener('invalid', function (e) {
      e.preventDefault();
      hataYaz(api.root, api.input, 'konu-hata', KONU_MESAJ);
      api.input.focus();
    });
  }

  /* ---- 46d · TELEFON --------------------------------------------------- */
  function telefonKur() {
    var kok = d.querySelector('.pg-iletisim [data-ulke-kok]') || d.querySelector('[data-ulke-kok]');
    if (!kok) return;
    var dugme = kok.querySelector('.alan-ulke');
    var katman = kok.querySelector('.alan-ulke-katman');
    var ara = kok.querySelector('.alan-ulke-arama input');
    var liste = kok.querySelector('.alan-ulke-liste');
    var bos = kok.querySelector('.alan-ulke-bos');
    var gizli = kok.querySelector('input[type="hidden"][name="telefon_ulke"]');
    var tel = kok.querySelector('input[type="tel"]');
    if (!dugme || !katman || !liste || !tel) return;
    var satirlar = Array.prototype.slice.call(liste.querySelectorAll('li[data-iso]'));
    var gorunen = satirlar, imlec = 0;

    function seciliSatir() {
      var iso = gizli ? gizli.value : 'TR';
      return satirlar.filter(function (li) { return li.dataset.iso === iso; })[0] || satirlar[0];
    }
    function kod() { return seciliSatir().dataset.kod.replace('+', ''); }
    function trMi() { return seciliSatir().dataset.iso === 'TR'; }

    function sus(q) {
      q = kucuk((q || '').trim()).replace(/^\+/, '');
      gorunen = satirlar.filter(function (li) {
        var ok = !q || kucuk(li.querySelector('.ad').textContent).indexOf(q) > -1
          || li.dataset.kod.replace('+', '').indexOf(q) === 0 || kucuk(li.dataset.iso) === q;
        li.hidden = !ok;
        return ok;
      });
      if (bos) bos.hidden = gorunen.length > 0;
      liste.hidden = gorunen.length === 0;
    }
    function imleciTasi(n) {
      if (!gorunen.length) return;
      imlec = Math.max(0, Math.min(gorunen.length - 1, n));
      satirlar.forEach(function (li) { li.classList.remove('on'); });
      var li = gorunen[imlec];
      li.classList.add('on');
      if (ara) ara.setAttribute('aria-activedescendant', li.id);
      li.scrollIntoView({ block: 'nearest' });
    }
    function ac() {
      katman.hidden = false;
      dugme.setAttribute('aria-expanded', 'true');
      if (ara) ara.value = '';
      sus('');
      imleciTasi(gorunen.indexOf(seciliSatir()));
      if (ara) ara.focus();
    }
    function kapat(odak) {
      katman.hidden = true;
      dugme.setAttribute('aria-expanded', 'false');
      if (odak) dugme.focus();
    }
    function sec(li) {
      satirlar.forEach(function (x) {
        var bu = x === li;
        x.classList.toggle('secili', bu);
        x.setAttribute('aria-selected', bu ? 'true' : 'false');
      });
      if (gizli) gizli.value = li.dataset.iso;
      var ad = li.querySelector('.ad').textContent;
      dugme.querySelector('.alan-ulke-bayrak').textContent = li.querySelector('.bayrak').textContent;
      dugme.querySelector('.alan-ulke-kod').textContent = li.dataset.kod;
      dugme.setAttribute('aria-label', dmLk('kabuk_js.form.ulke_kodu', 'Ülke kodu — şu an :ad :kod', { ad: ad, kod: li.dataset.kod }));
      tel.placeholder = trMi() ? '5__ ___ __ __' : 'Telefon numaran';
      kapat(false);
      if (alan) { alan.uygula(false); alan.denetle(false); }
      tel.focus();
    }

    satirlar.forEach(function (li, i) { li.id = 'conCc-' + li.dataset.iso; li.dataset.sira = i; });
    dugme.addEventListener('click', function () { if (katman.hidden) ac(); else kapat(true); });
    if (ara) { ara.setAttribute('role', 'combobox'); ara.setAttribute('aria-controls', liste.id = 'conCcListe'); ara.setAttribute('aria-expanded', 'true'); }
    if (ara) ara.addEventListener('input', function () { sus(ara.value); imleciTasi(0); });
    liste.addEventListener('click', function (e) { var li = e.target.closest('li[data-iso]'); if (li) sec(li); });
    katman.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); kapat(true); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); imleciTasi(imlec + 1); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); imleciTasi(imlec - 1); return; }
      if (e.key === 'Enter') { e.preventDefault(); if (gorunen[imlec]) sec(gorunen[imlec]); }
    });
    d.addEventListener('click', function (e) { if (!katman.hidden && !kok.contains(e.target)) kapat(false); });

    /* Maske ve anlık denetim — ortak bileşen (`/gastro/telefon-alani.js`). */
    var alan = null;
    function bagla() {
      alan = window.GastroTelefonAlani.bagla({
        tel: tel, trMi: trMi, kod: kod,
        hata: function (metin) { hataYaz(kok, tel, 'telefon-hata', metin); },
      });
    }
    if (window.GastroTelefonAlani) bagla();
    else if (kok.dataset.telefonBetik) {
      var betik = d.createElement('script');
      betik.src = kok.dataset.telefonBetik;
      betik.onload = bagla;
      d.head.appendChild(betik);
    }
  }

  function kur() {
    telefonKur();
    var secim = d.getElementById('konu');
    if (window.GastroCokluSecim || !secim || !secim.dataset.seciciBetik) { konuKur(); return; }
    var betik = d.createElement('script');
    betik.src = secim.dataset.seciciBetik;
    betik.onload = konuKur;
    d.head.appendChild(betik);
  }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', kur); else kur();
})();
