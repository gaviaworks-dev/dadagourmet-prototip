/* ÜST BANT ZİL ROZETİ — donmuş "3"ü gerçek okunmamış sayısıyla değiştirir.
 *
 * 🔴 Türetilmiş 59 blade'in (40 public + 19 üye) hepsi üst bantta
 * `<span class="hb-badge">3</span>` taşıyor ve sayının veritabanıyla hiçbir
 * bağı yok. Markup prototipin bayt kopyası ve öyle kalmalı, bu yüzden sayı
 * markup'ta değil burada değişiyor; kaynağı sunucunun
 * `<meta name="dada-zil-sayaci">` etiketi (bkz. `app/Kabuk/ZilSayaci.php`).
 *
 * 🔴 BEYAN YOKSA ROZET AÇILMAZ. Misafirde sunucu `<meta>` basmaz; betik
 * hiçbir şey yapmaz ve rozet `zil-sayaci.css`in altında GİZLİ kalır. Donmuş
 * "3"ün ekrana düşebileceği tek yol buydu ve kapatıldı — arıza yönü dürüst:
 * bağlanamayan sayı gösterilmez.
 *
 * 🔴 SIFIRDA ROZET GÖSTERİLMEZ (Beyar kararı, 2026-09-14 · revize P3 · kalem 3).
 * Önceki davranış "0" basmaktı ve gerekçesi donörün maketinde veritabanı
 * olmamasıydı — yani "sıfırken ne olur"un tanığı yoktu. Artık VAR: KANON
 * ölçüldü (`~/DadaVarliklar/GastroCanli/kod/resources/views/partials/header.blade.php:140`)
 * → `@if (($unreadNotificationCount ?? 0) > 0)`, yani gerçek site rozeti
 * yalnız sayı sıfırdan büyükken basıyor. Kural artık yorum değil, okunmuş.
 *
 * 🔴 AMA DÜĞÜM YİNE SÖKÜLMEZ: markup prototipin bayt kopyası ve sökme
 * sürümü paritede ölçülmüş bir bedel taşıyor (panel rozetlerinde 81 × 6 =
 * 486 eksik düğüm). Rozet `zil-sayaci.css` ile GİZLİ kalır — kullanıcı
 * hiçbir şey görmez, geometri oynamaz (rozet mutlak konumlu), markup
 * donöre sadık kalır. Bayrak `sifir` yazılır ki "betik koşmadı" ile
 * "betik koştu, sayı sıfırdı" ayırt edilebilsin.
 */
(function () {
  'use strict';

  var m = document.querySelector('meta[name="dada-zil-sayaci"]');
  if (!m) return;

  var n = parseInt(m.getAttribute('content'), 10);
  if (!isFinite(n) || n < 0) return;

  function uygula() {
    if (n === 0) {
      /* Okunmamış yoksa rozet hiç açılmaz — kanonun kuralı. Metin de
         yazılmaz: gizli düğümde donmuş "3" kalsa bile kimse görmez, ama
         "0" yazmak da yanlış bir sayıyı gizliyor olurdu. */
      document.documentElement.setAttribute('data-zil-sayaci', 'sifir');
      return;
    }

    var rozetler = document.querySelectorAll('.head-bell .hb-badge');
    for (var i = 0; i < rozetler.length; i++) {
      rozetler[i].textContent = String(n);
    }
    /* Bayrak SON yazılır: rozet, doğru sayı yerine oturmadan görünmez. */
    document.documentElement.setAttribute('data-zil-sayaci', 'yazildi');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', uygula);
  } else {
    uygula();
  }
})();
