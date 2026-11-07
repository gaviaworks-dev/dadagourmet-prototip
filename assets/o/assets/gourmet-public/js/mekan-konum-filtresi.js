/* /mekanlar Konum grubu sürücüsü (Beyar kararı 2026-09-17, proje GLOBAL) — YEREL KATMAN, vendor DEĞİL.
 *
 * Vendor `gourmet-mekan-liste.js` dokunulmadan bırakıldı (`.ai/rules/assets.md`): o dosya
 * `.fct-head` akordeonunu, "Tümünü gör" (`.fct-more`) aç/kapasını ve `.fct-row` kutusu
 * değişince formu göndermeyi zaten yapıyor. Burada yalnız karşılığı OLMAYAN iki davranış var:
 *   1. Ülke açılır menüsü (`[data-ulke-sec]`): değişince şehir/ilçe/semt seçimleri TEMİZLENİR
 *      (başka ülkeye ait kalırlardı) ve form gönderilir; menü o anda `name` kazanır (varsayılan
 *      ülke `name`siz basılır, süzmez — `site/mekanlar/index.blade.php` şerhi).
 *   2. Grup içi arama (`[data-konum-ara]`): sunucuya İSTEK ATMAZ, yalnız basılı satırları süzer.
 *      Alanın `name`i yok; `Enter` bilerek yutulur (yoksa `#filterForm` gönderilirdi).
 *
 * Durum işaretleri SINIF DEĞİL ÖZNİTELİK (`data-konum-arama`, `data-konum-gizli`) — kapının yapısal
 * imzası sınıf zincirinden kurulur (`.ai/rules/js.md`). Kuralları `css/mekan-filtre-paneli-uyarlama.css`.
 * Katlama `js/etkinlik-konum-filtresi.js` ile aynı (Türkçe I/ı + NFD aksan düşürme).
 */
(function () {
  var konum = document.querySelector('#lstSide .mkl-fct-location');
  if (!konum) { return; }

  var ulkeMenusu = konum.querySelector('[data-ulke-sec]');
  if (ulkeMenusu) {
    ulkeMenusu.addEventListener('change', function () {
      var form = ulkeMenusu.form;
      konum.querySelectorAll('input[name="il[]"], input[name="ilce[]"], input[name="semt[]"]').forEach(function (kutu) {
        kutu.checked = false;
        kutu.disabled = true;
      });
      if (form) {
        form.querySelectorAll('input[type="hidden"][name="il[]"], input[type="hidden"][name="ilce[]"], input[type="hidden"][name="semt[]"], input[type="hidden"][name="ulke[]"], input[type="hidden"][name="sayfa"]').forEach(function (gizli) { gizli.disabled = true; });
      }
      ulkeMenusu.setAttribute('name', 'ulke');
      if (form) { form.submit(); }
    });
  }

  function katla(deger) {
    return (deger || '').toLocaleLowerCase('tr').replace(/ı/g, 'i')
      .normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  konum.querySelectorAll('[data-konum-ara]').forEach(function (kutu) {
    var grup = kutu.closest('.fct');
    var alan = kutu.querySelector('input');
    var bos = grup.querySelector('[data-konum-bos]');
    var satirlar = Array.prototype.slice.call(grup.querySelectorAll(':scope > .fct-body > .fct-row'));

    function suz() {
      var sorgu = katla(alan.value.trim());
      var arama = sorgu !== '';
      if (arama) { grup.setAttribute('data-konum-arama', ''); } else { grup.removeAttribute('data-konum-arama'); }
      var eslesen = 0;
      satirlar.forEach(function (satir) {
        var tuttu = !arama || katla(satir.querySelector('.ft').textContent).indexOf(sorgu) !== -1;
        if (tuttu) { satir.removeAttribute('data-konum-gizli'); eslesen++; } else { satir.setAttribute('data-konum-gizli', ''); }
      });
      if (bos) { bos.hidden = !arama || eslesen > 0; }
    }

    alan.addEventListener('input', suz);
    alan.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); return; }
      if (e.key === 'Escape' && alan.value !== '') { e.preventDefault(); alan.value = ''; suz(); }
    });
  });
})();
