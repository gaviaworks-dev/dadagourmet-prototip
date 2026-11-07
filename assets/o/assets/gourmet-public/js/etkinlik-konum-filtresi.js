/* /etkinlikler konum faseti sürücüsü (2026-09-16) — YEREL KATMAN, vendor DEĞİL.
 *
 * Vendor `gourmet-etkinlikler.js` dokunulmadan bırakıldı (`.ai/rules/assets.md`):
 * o dosya `.fct-head` akordeonunu ve `.fct-row input` değişiminde formu GET ile
 * göndermeyi zaten yapıyor; burada yalnız o dosyada karşılığı OLMAYAN üç davranış var.
 *   1. Ülke bloğunun aç/kapa düğmesi (`.fct-ulke-ac`).
 *   2. "N ülke daha" / "N şehir daha" kesmesi (`.fct-more`) — kanon
 *      `gourmet-mekan-liste.js:24` davranışının iki kademeli hâli.
 *   3. Grup içi arama — sunucuya İSTEK ATMAZ, yalnız basılı satırları süzer.
 *
 * ⚠ Arama alanının `name`i YOKTUR, yani forma girmez; `Enter` tuşu da bilerek
 * yutulur, yoksa tarayıcı `#filterForm`u gönderip paneli sıfırlardı.
 *
 * Süzgecin KENDİSİ sunucudadır (`EtkinlikOkumaServisi::konumaUyuyor()`); bu dosya
 * kapatılsa bile checkbox'lar çalışmaya devam eder, yalnız liste uzar.
 */
(function () {
  var grup = document.querySelector('.fct-konum');
  if (!grup) { return; }

  var araKutusu = grup.querySelector('[data-konum-ara] input');
  var bosSatir = grup.querySelector('[data-konum-bos]');
  var bloklar = Array.prototype.slice.call(grup.querySelectorAll('.fct-ulke'));

  /* Açılış durumu sunucudan geliyor (Türkiye + seçili ülkeler AÇIK). Arama
   * temizlenince buraya dönülür — arama sırasında açılan bloklar açık kalmaz. */
  bloklar.forEach(function (b) { b.dataset.konumAcik = b.classList.contains('open') ? '1' : '0'; });

  function etiketiYaz(dugme, acik) {
    dugme.innerHTML = (acik ? dugme.getAttribute('data-less') : dugme.getAttribute('data-more'))
      + ' <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>';
  }

  grup.addEventListener('click', function (e) {
    var ac = e.target.closest('.fct-ulke-ac');
    if (ac) {
      e.preventDefault();
      var blok = ac.closest('.fct-ulke');
      var acik = blok.classList.toggle('open');
      ac.setAttribute('aria-expanded', acik ? 'true' : 'false');
      return;
    }
    var more = e.target.closest('.fct-more');
    if (!more) { return; }
    e.preventDefault();
    // Şehir kesmesi ülke bloğuna, ülke kesmesi grubun kendisine bağlanır.
    var kapsam = more.closest('.fct-ulke') || grup;
    etiketiYaz(more, kapsam.classList.toggle('more-open'));
  });

  if (!araKutusu) { return; }

  /* Türkçe katlama: `toLocaleLowerCase('tr')` I→ı verdiği için ı→i ayrıca eşlenir,
   * kalan aksanlar NFD ile ayrıştırılıp düşürülür. Böylece "odate" → "Ōdate",
   * "istanbul" → "İstanbul" eşleşir. (`.ai/rules/servisler.md`: SQLite LIKE bunu
   * katlamıyor; burada eşleşme zaten tarayıcıda, SQL'e inmiyor.) */
  function katla(deger) {
    return (deger || '').toLocaleLowerCase('tr').replace(/ı/g, 'i')
      .normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  function gorunurluk(dugum, gizli) { dugum.classList.toggle('konum-gizli', gizli); }

  function suz() {
    var sorgu = katla(araKutusu.value.trim());
    var arama = sorgu !== '';
    grup.classList.toggle('arama', arama);

    var eslesen = 0;
    bloklar.forEach(function (blok) {
      var satirlar = Array.prototype.slice.call(blok.querySelectorAll('.fct-sehir'));
      if (!arama) {
        blok.classList.remove('arama');
        gorunurluk(blok, false);
        satirlar.forEach(function (s) { gorunurluk(s, false); });
        blok.classList.toggle('open', blok.dataset.konumAcik === '1');
        return;
      }
      var ulkeAdi = katla(blok.getAttribute('data-ulke'));
      var ulkeTuttu = ulkeAdi.indexOf(sorgu) !== -1;
      var sehirTuttu = 0;
      satirlar.forEach(function (satir) {
        var metin = katla(satir.querySelector('.ft').textContent);
        var tuttu = ulkeTuttu || metin.indexOf(sorgu) !== -1;
        gorunurluk(satir, !tuttu);
        if (tuttu) { sehirTuttu++; }
      });
      var blokTuttu = ulkeTuttu || sehirTuttu > 0;
      gorunurluk(blok, !blokTuttu);
      blok.classList.toggle('arama', blokTuttu);
      blok.classList.toggle('open', blokTuttu);
      if (blokTuttu) { eslesen++; }
    });

    if (bosSatir) { bosSatir.hidden = !arama || eslesen > 0; }
  }

  araKutusu.addEventListener('input', suz);
  araKutusu.addEventListener('keydown', function (e) {
    // Formun içindeyiz: Enter sayfayı gönderirdi.
    if (e.key === 'Enter') { e.preventDefault(); return; }
    if (e.key === 'Escape' && araKutusu.value !== '') {
      e.preventDefault();
      araKutusu.value = '';
      suz();
    }
  });
})();
