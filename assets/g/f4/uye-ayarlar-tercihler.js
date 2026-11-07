/* Dada Gastro · Tercihler hattı · F3 — Hesabım › "Mutfak tercihlerim" sekmesi (tam yapı, 5 Kas).
 *
 * Ekran betiği: `KabukKimligi` `uye.ayarlar` rotasında `-tercihler` sonekiyle enjekte eder (bu dosya); `uye-ayarlar.js`e dokunulmaz.
 * Tek form (`form[data-tercih-hesabim]`): JS'li gönderim PATCH /hesabim/tercihler (JSON), JS'siz POST /hesabim/tercihler.
 * Ortak yardımcılar sihirbazın betiğiyle aynı (`public/f4/uye-tercih-sihirbaz.js`: govdeKur · yamala · hataMetni · sablon).
 * Kullanıcı verisi tarayıcı deposuna YAZILMAZ.
 */
(function () {
  'use strict';

  /* ---------- ortak ---------- */
  var HARITA = { 'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u', 'â': 'a', 'î': 'i', 'û': 'u' };
  function katla(v) {
    return String(v || '').replace(/I/g, 'ı').replace(/İ/g, 'i').toLocaleLowerCase('tr')
      .replace(/[çğıöşüâîû]/g, function (h) { return HARITA[h]; })
      .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();
  }
  function jeton() {
    var m = document.querySelector('meta[name="csrf-token"]');
    return m ? m.getAttribute('content') : '';
  }
  function sablon(metin, degerler) {
    return String(metin || '').replace(/\{(\w+)\}/g, function (_, k) { return degerler[k] != null ? degerler[k] : ''; });
  }
  /* Formdaki alanlardan PATCH gövdesi: listeler `ad[]`, tekiller `ad`; "seçim yok" = [] / null (sunucunun form isteğiyle aynı kural). */
  function govdeKur(form, alanlar) {
    var fd = new FormData(form), govde = {};
    Object.keys(alanlar).forEach(function (alan) {
      var tur = alanlar[alan];
      if (tur === 'liste') {
        var v = fd.getAll(alan + '[]').filter(function (x, i, a) { return a.indexOf(x) === i; });
        govde[alan] = alan === 'sevmedikleri' ? v.map(Number) : v;
      } else if (tur === 'sayi') {
        var s = fd.get(alan);
        govde[alan] = s === null || s === '' ? null : Number(s);
      } else if (tur === 'mantik') {
        govde[alan] = fd.get(alan) !== null;
      } else {
        var t = fd.get(alan);
        govde[alan] = t === null || t === '' ? null : t;
      }
    });
    if (govde.diyet) {
      var korunan = fd.getAll('diyet_korunan[]');
      if (govde.diyet.indexOf('kisitlamam-yok') < 0) {
        korunan.forEach(function (k) { if (govde.diyet.indexOf(k) < 0) govde.diyet.push(k); });
      }
    }
    return govde;
  }
  function yamala(adres, govde) {
    return fetch(adres, {
      method: 'PATCH',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': jeton(), 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify(govde)
    }).then(function (y) {
      if (y.ok) return y.json();
      return y.json().catch(function () { return {}; }).then(function (j) {
        var hata = new Error('yazilamadi');
        hata.durum = y.status;
        var alanlar = (j && (j.errors || (j.hata && (j.hata.alanlar || j.hata.errors)))) || {};
        var ilk = Object.keys(alanlar).map(function (k) { return [].concat(alanlar[k])[0]; })[0];
        hata.metin = ilk || (j && (j.message || (j.hata && j.hata.mesaj))) || '';
        throw hata;
      });
    });
  }
  function hataMetni(h, metinler) {
    if (h && (h.durum === 401 || h.durum === 419)) return metinler.oturum;
    if (h && h.durum === 422 && h.metin) return h.metin;
    return metinler.kayit;
  }
  /* label.nq-chip / label.pick seçili görünümü: donörün .sel sınıfı girdiyle eş (JS'siz hâl :has(:checked) ile aynı) */
  function selEsle(kok) {
    kok.querySelectorAll('.tercih-girdi').forEach(function (g) {
      var l = g.closest('.nq-chip, .pick');
      if (l) l.classList.toggle('sel', g.checked);
    });
  }
  function secimBagla(kok) {
    kok.addEventListener('change', function (e) {
      var g = e.target;
      if (!g.classList || !g.classList.contains('tercih-girdi')) return;
      var grup = g.closest('[role="group"], [role="radiogroup"]');
      // "Kısıtlamam yok" tek başına seçilir; seçilince diğerleri kalkar, diğeri seçilince o kalkar
      if (grup && g.type === 'checkbox' && g.checked) {
        var tek = g.closest('[data-tek]');
        grup.querySelectorAll('.tercih-girdi').forEach(function (o) {
          if (o === g) return;
          if (tek || o.closest('[data-tek]')) o.checked = false;
        });
      }
      selEsle(grup || kok);
    });
    selEsle(kok);
  }

  /* =====================================================================
     HESABIM › "Mutfak tercihlerim" — tek form; JS'li gönderim PATCH, JS'siz POST /hesabim/tercihler
     ===================================================================== */
  var hesabim = document.querySelector('form[data-tercih-hesabim]');
  if (hesabim) hesabimBagla(hesabim);

  function hesabimBagla(form) {
    var metinler = {};
    try { metinler = JSON.parse(form.getAttribute('data-metinler') || '{}'); } catch (e) { metinler = {}; }
    var ALANLAR = {
      diyet: 'liste', alerjen: 'liste', sevmedikleri: 'liste', mutfak: 'liste', ozel_veri_rizasi: 'mantik', // K2 açık rıza
      seviye: 'metin', sure_ust_dk: 'sayi', kisisel_siralama: 'mantik'
    };
    var hata = form.querySelector('[data-hata]');
    var tamam = form.querySelector('.kaydedildi');
    var dugme = form.querySelector('button[type="submit"]');

    // "Kısıtlamam yok" tekilliği ve özetteki "N seçili" sayıları
    form.addEventListener('change', function (e) {
      var g = e.target;
      var grup = g.closest && g.closest('[data-tercih-grup]');
      if (grup && g.type === 'checkbox' && g.checked) {
        var tek = g.hasAttribute('data-tek');
        grup.querySelectorAll('input[type="checkbox"]').forEach(function (o) {
          if (o !== g && (tek || o.hasAttribute('data-tek'))) o.checked = false;
        });
      }
      form.querySelectorAll('[data-tercih-grup]').forEach(function (gr) {
        var oz = gr.querySelector('[data-ozet]');
        if (!oz) return;
        var n = gr.querySelectorAll('input[type="checkbox"]:checked').length;
        oz.textContent = n ? sablon(oz.getAttribute('data-sablon'), { n: n }) : oz.getAttribute('data-bos');
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (dugme.getAttribute('aria-busy') === 'true') return;
      dugme.setAttribute('aria-busy', 'true');
      hata.hidden = true;
      yamala(form.getAttribute('data-yama'), govdeKur(form, ALANLAR)).then(function () {
        dugme.removeAttribute('aria-busy');
        // çıkarılan sevmedikler listeden düşer (kayıt artık onları taşımıyor)
        form.querySelectorAll('[data-sevmedik-satir]').forEach(function (s) {
          if (!s.querySelector('input:checked')) s.remove();
        });
        if (tamam) {
          tamam.classList.add('show');
          clearTimeout(tamam._t);
          tamam._t = setTimeout(function () { tamam.classList.remove('show'); }, 2500);
        }
      }).catch(function (h) {
        dugme.removeAttribute('aria-busy');
        hata.querySelector('[data-hata-metin]').textContent = hataMetni(h, metinler);
        hata.hidden = false;
      });
    });
  }
})();
