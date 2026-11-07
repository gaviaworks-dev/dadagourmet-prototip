/* ÜLKE KODLU TELEFON ALANI · maske + anlık denetim — Revize 5 · madde 46d.
 *
 * Revize 6 · madde 65: `/iletisim`in (`public/f5/iletisim.js` · `telefonKur`)
 * maske ve denetim kısmı buraya taşındı ki Çözüm Merkezi'nin öneri formu da
 * AYNI bileşeni kullansın (Beyar: "46'daki ülke kodlu bileşen"). Davranış
 * birebir o dosyanınki; yalnız yer değişti.
 *
 * 🔴 SEÇİCİYE BAĞLANMAZ. Ülke listesinin aç/kapa/süz/seç dinleyicisi her
 * sayfanın kendisinde kalır: /iletisim'de `iletisim.js`, Çözüm Merkezi'nde
 * kanon (`kanon/gomulu/j-b11cff639f21.js:481`). Aynı düğmeye iki dinleyici
 * bağlanırsa bir tıklama açar, öbürü kapatır.
 *
 * Kullanım: `GastroTelefonAlani.bagla({tel, trMi, kod, hata})`
 *   tel  · `input[type=tel]`
 *   trMi · () → seçili ülke Türkiye mi
 *   kod  · () → seçili ülkenin çağrı kodu, `+`sız ("49")
 *   hata · (metin) → hata satırını yazar; boş metin satırı kaldırır
 * Dönen nesnenin `uygula(imleciKoru)` ve `denetle(odakGitti)`si ülke
 * değişince sayfa tarafından yeniden çağrılır.
 *
 * Türkiye: 3-3-2-2 maske ve `TelefonBicimi`nin kuralı. Başka ülke: yalnız
 * hane, ülke koduyla birlikte en çok 15 (E.164). Kesin biçim sunucuda.
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
  var TR_MESAJ_BICIM = dmLk('kabuk_js.gastro.telefon.bicim', 'Geçerli bir telefon numarası gir (5 ile başlayan 10 hane).');
  var TR_MESAJ_EKSIK = dmLk('kabuk_js.gastro.telefon.eksik', 'Telefon numarası 10 hane olmalı.');
  var DIS_MESAJ = dmLk('kabuk_js.gastro.telefon.dis', 'Geçerli bir telefon numarası gir (ülke koduyla birlikte en çok 15 hane).');

  function trHaneler(ham) {
    var h = String(ham || '').replace(/\D+/g, '');
    while (h.charAt(0) === '0') h = h.slice(1);
    if (h.slice(0, 2) === '90' && h.length > 10) h = h.slice(2);
    return h.slice(0, 10);
  }
  function trBicim(h) {
    var o = h.slice(0, 3);
    if (h.length > 3) o += ' ' + h.slice(3, 6);
    if (h.length > 6) o += ' ' + h.slice(6, 8);
    if (h.length > 8) o += ' ' + h.slice(8, 10);
    return o;
  }

  function bagla(s) {
    var tel = s.tel, trMi = s.trMi, kod = s.kod, hata = s.hata;
    var d = tel.ownerDocument;

    /* Maske: Türkiye 3-3-2-2; başka ülke yalnız hane (başta + ile uluslararası yazım serbest). */
    function uygula(imleciKoru) {
      var eski = tel.value, yeni;
      if (trMi()) {
        var konum = imleciKoru ? (tel.selectionStart || 0) : eski.length;
        var kacinci = eski.slice(0, konum).replace(/\D+/g, '').length;
        yeni = trBicim(trHaneler(eski));
        if (yeni === eski) return;
        tel.value = yeni;
        if (imleciKoru && d.activeElement === tel) {
          var y = yeni.length, n = 0;
          for (var i = 0; i < yeni.length && kacinci > 0; i++) { if (/\d/.test(yeni.charAt(i)) && ++n === kacinci) { y = i + 1; break; } }
          if (kacinci === 0) y = 0;
          try { tel.setSelectionRange(y, y); } catch (e) { /* type=tel seçim taşımayabilir */ }
        }
        return;
      }
      var arti = /^\s*(\+|00)/.test(eski);
      var h = eski.replace(/\D+/g, '');
      var sinir = arti ? 15 + (eski.trim().indexOf('00') === 0 ? 2 : 0) : 15 - kod().length;
      yeni = (arti && eski.trim().charAt(0) === '+' ? '+' : '') + h.slice(0, sinir);
      if (yeni !== eski) tel.value = yeni;
    }
    function denetle(odakGitti) {
      var ham = tel.value.trim(), metin = '';
      if (ham) {
        if (trMi()) {
          var h = trHaneler(ham);
          if (h.charAt(0) !== '5') metin = TR_MESAJ_BICIM;
          else if (odakGitti && h.length < 10) metin = TR_MESAJ_EKSIK;
        } else {
          var hane = ham.replace(/\D+/g, '');
          var uluslararasi = /^(\+|00)/.test(ham);
          if (uluslararasi) hane = ham.indexOf('00') === 0 ? hane.slice(2) : hane;
          else hane = kod() + hane.replace(/^0/, '');
          if (uluslararasi && hane.indexOf(kod()) !== 0) metin = DIS_MESAJ;
          else if (hane.length > 15) metin = DIS_MESAJ;
          else if (odakGitti && hane.length < 7) metin = DIS_MESAJ;
        }
      }
      hata(metin);
    }
    uygula(false);
    tel.addEventListener('input', function () { uygula(true); denetle(false); });
    tel.addEventListener('blur', function () { uygula(false); denetle(true); });
    tel.addEventListener('change', function () { uygula(false); denetle(false); });

    return { uygula: uygula, denetle: denetle };
  }

  window.GastroTelefonAlani = { bagla: bagla };
})();
