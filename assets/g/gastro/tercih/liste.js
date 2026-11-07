/* =====================================================================
   Dada Gastro · Tercihler hattı — liste notu davranışı (F4, tam yapı 5 Kas)
   Markup: resources/views/parcalar/tercih/liste-notu.blade.php (taslak liste-notu-*.html).

   · "Kapat / Aç": not düğmesi gizli formun (PATCH /hesabim/tercihler) düğmesidir; JS yokken form
     gönderilir ve sunucu geldiği listeye döner. JS varken aynı uç JSON'la çağrılır:
       data-yenile="sayfa" → sayfa yenilenir (sunucu yeni sırayla basar);
       data-yenile="olay"  → `tercih:liste-yenile` olayı; yüzeyin betiği (Ne Pişirsem sihirbazı, Dolap)
                             sonuçları yeniden ister ve notu sunucunun döndürdüğü HTML'le yeniler.
     Kayıt başarısızsa notun hata satırı görünür; hiçbir şey sessizce yutulmaz.
   · "Göster / Gizle" (alerjen): sayfa yüzeylerinde düz bağ (?alerjen_goster=1). Olay yüzeylerinde
     `tercih:alerjen-goster` olayı (sonuçlar gövdeyle istendiği için bağ adresi yetmez).
   · Kullanıcı verisi tarayıcıda SAKLANMAZ: durum hesapta (PATCH), sayfa sunucudan basılır.
   ===================================================================== */
(function () {
  'use strict';

  function csrf() {
    var m = document.querySelector('meta[name="csrf-token"]');
    return m ? m.getAttribute('content') : '';
  }

  function kok(el) { return el ? el.closest('[data-tercih-not]') : null; }

  function hataGoster(root, goster) {
    var h = root ? root.querySelector('[data-tercih-not-hata]') : null;
    if (h) h.hidden = !goster;
  }

  function haberVer(ad, detay) {
    document.dispatchEvent(new CustomEvent(ad, { detail: detay }));
  }

  document.addEventListener('click', function (e) {
    var dugme = e.target.closest('[data-tercih-not] [data-tercih-siralama]');
    if (dugme) {
      var root = kok(dugme);
      var form = dugme.form;
      if (!form || !window.fetch) return; // JS'siz yol: form kendisi gönderilir
      e.preventDefault();
      if (dugme.disabled) return;
      dugme.disabled = true;
      hataGoster(root, false);
      var acik = dugme.getAttribute('data-tercih-siralama') === '1';
      fetch(form.getAttribute('action'), {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-CSRF-TOKEN': csrf(),
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({ kisisel_siralama: acik }),
      })
        .then(function (yanit) {
          if (!yanit.ok) throw new Error('tercih-not-http-' + yanit.status);
          if (root && root.getAttribute('data-yenile') === 'olay') {
            dugme.disabled = false;
            haberVer('tercih:liste-yenile', { yuzey: root.getAttribute('data-yuzey'), kisiselSiralama: acik });
          } else {
            window.location.reload();
          }
        })
        .catch(function () {
          dugme.disabled = false;
          hataGoster(root, true);
        });
      return;
    }

    var bag = e.target.closest('[data-tercih-not][data-yenile="olay"] [data-tercih-alerjen]');
    if (bag) {
      e.preventDefault();
      var kokEl = kok(bag);
      haberVer('tercih:alerjen-goster', { yuzey: kokEl.getAttribute('data-yuzey'), goster: bag.getAttribute('data-tercih-alerjen') === '1' });
    }
  });

  /* Olay yüzeyleri notu sunucunun döndürdüğü HTML'le yeniler (kart gibi: istemcide ikinci şablon yok). */
  window.DadaTercihNotu = {
    yenile: function (yuzey, html) {
      var eski = document.querySelector('[data-tercih-not][data-yuzey="' + yuzey + '"]');
      if (!eski || typeof html !== 'string' || html === '') return;
      var kap = document.createElement('div');
      kap.innerHTML = html;
      var yeni = kap.querySelector('[data-tercih-not]');
      if (yeni) eski.replaceWith(yeni);
    },
  };
})();
